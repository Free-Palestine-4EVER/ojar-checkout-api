/**
 * Stripe Webhook Handler
 * POST /api/webhook
 * 
 * Handles Stripe webhook events, specifically checkout.session.completed
 * to create orders in Shopify after successful payment.
 */

const stripe = require('./utils/stripe');
const { createShopifyOrder } = require('./utils/shopify');

// Disable body parsing - Stripe requires raw body for signature verification
module.exports.config = {
    api: {
        bodyParser: false,
    },
};

// Helper to get raw body
async function getRawBody(req) {
    const chunks = [];
    for await (const chunk of req) {
        chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
    }
    return Buffer.concat(chunks);
}

module.exports = async (req, res) => {
    // Add CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, stripe-signature');

    // Handle preflight
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    console.log('=== WEBHOOK RECEIVED ===');
    console.log('Method:', req.method);
    console.log('Headers:', JSON.stringify(req.headers, null, 2));

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
        console.error('Stripe webhook secret not configured');
        return res.status(500).json({ error: 'Webhook not configured' });
    }

    const sig = req.headers['stripe-signature'];

    if (!sig) {
        console.error('No stripe-signature header found');
        return res.status(400).json({ error: 'No signature' });
    }

    let event;
    let rawBody;

    try {
        rawBody = await getRawBody(req);
        console.log('Raw body length:', rawBody.length);
        event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
        console.log('Event type:', event.type);
        console.log('Event ID:', event.id);
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).json({ error: `Webhook Error: ${err.message}` });
    }

    // Handle the event
    try {
        switch (event.type) {
            case 'checkout.session.completed':
                console.log('Processing completed checkout...');
                await handleCheckoutComplete(event.data.object);
                break;

            case 'checkout.session.expired':
                console.log('Processing expired checkout...');
                await handleAbandonedCheckout(event.data.object);
                break;

            case 'payment_intent.payment_failed':
                console.log('Payment failed:', event.data.object.id);
                break;

            default:
                console.log(`Unhandled event type: ${event.type}`);
        }
    } catch (error) {
        console.error('Error processing webhook:', error);
        return res.status(500).json({ error: 'Processing failed' });
    }

    // Return 200 to acknowledge receipt
    console.log('=== WEBHOOK PROCESSED SUCCESSFULLY ===');
    return res.status(200).json({ received: true, eventType: event.type });
};

/**
 * Handle completed checkout session - create Shopify order
 */
async function handleCheckoutComplete(session) {
    console.log('=== WEBHOOK: Processing checkout ===');
    console.log('Session ID:', session.id);

    try {
        // Get full session with line items
        console.log('Fetching full session from Stripe...');
        const fullSession = await stripe.checkout.sessions.retrieve(session.id, {
            expand: ['line_items', 'customer_details', 'payment_intent', 'total_details.breakdown'],
        });
        console.log('Full session retrieved');

        const { customer_details, shipping_details, metadata, payment_intent, total_details } = fullSession;

        console.log('Customer email:', customer_details?.email);
        console.log('Customer phone:', customer_details?.phone);
        console.log('Metadata:', JSON.stringify(metadata));

        // Extract discount code if present
        let discountCode = null;
        let discountAmount = 0;
        if (total_details?.breakdown?.discounts?.length > 0) {
            const discount = total_details.breakdown.discounts[0];
            discountAmount = discount.amount || 0;
            discountCode = discount.discount?.coupon?.name || discount.discount?.promotion_code?.code || 'DISCOUNT';
            console.log('Discount code found:', discountCode, 'Amount:', discountAmount);
        }

        // Parse cart items from metadata
        let cartItems = [];
        try {
            cartItems = JSON.parse(metadata?.cart_items_json || '[]');
            console.log('Parsed cart items:', cartItems.length, 'items');
        } catch (e) {
            console.error('Failed to parse cart items:', e);
            console.log('Raw cart_items_json:', metadata?.cart_items_json);
        }

        if (cartItems.length === 0) {
            console.error('ERROR: No cart items found in metadata!');
            console.log('This might be because cart_items_json was not saved during checkout creation');
            return;
        }

        // Get shipping address
        const shippingAddress = shipping_details?.address || customer_details?.address;
        console.log('Shipping address:', JSON.stringify(shippingAddress));

        if (!shippingAddress) {
            console.error('ERROR: No shipping address found in session');
            return;
        }

        // Calculate shipping cost from line items
        let shippingCost = 0;
        const lineItems = fullSession.line_items?.data || [];
        console.log('Line items from Stripe:', lineItems.length);

        const shippingItem = lineItems.find(item =>
            item.description === 'Shipping' || item.price?.product?.name === 'Shipping'
        );
        if (shippingItem) {
            shippingCost = shippingItem.amount_total;
            console.log('Shipping cost:', shippingCost);
        }

        // Create order data
        const orderData = {
            customer: {
                email: customer_details.email,
                name: customer_details.name,
                phone: customer_details.phone,
            },
            lineItems: cartItems,
            shippingAddress: {
                firstName: customer_details.name?.split(' ')[0] || 'Customer',
                lastName: customer_details.name?.split(' ').slice(1).join(' ') || '',
                line1: shippingAddress.line1,
                line2: shippingAddress.line2,
                city: shippingAddress.city,
                state: shippingAddress.state,
                country: shippingAddress.country,
                postalCode: shippingAddress.postal_code,
                phone: customer_details.phone,
            },
            currency: metadata?.currency || 'USD',
            totalAmount: fullSession.amount_total,
            shippingCost: shippingCost,
            stripePaymentIntentId: payment_intent?.id || session.payment_intent,
            discountCode: discountCode,
            discountAmount: discountAmount,
            acceptsMarketing: fullSession.consent?.promotional_communications === 'accepted',
        };

        console.log('Order data prepared:', JSON.stringify(orderData, null, 2));

        // Check Shopify credentials
        if (!process.env.SHOPIFY_STORE_DOMAIN) {
            console.error('ERROR: SHOPIFY_STORE_DOMAIN not set!');
            return;
        }
        if (!process.env.SHOPIFY_ADMIN_ACCESS_TOKEN) {
            console.error('ERROR: SHOPIFY_ADMIN_ACCESS_TOKEN not set!');
            return;
        }
        console.log('Shopify credentials present, creating order...');

        // Create order in Shopify
        const shopifyOrder = await createShopifyOrder(orderData);
        console.log('=== SUCCESS: Shopify order created ===');
        console.log('Order ID:', shopifyOrder.order?.id);
        console.log('Order number:', shopifyOrder.order?.order_number);

    } catch (error) {
        console.error('=== ERROR: Failed to create Shopify order ===');
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        // Don't throw - we've already received payment, log for manual resolution
    }
}

/**
 * Handle abandoned checkout session - create Shopify draft order for recovery
 */
async function handleAbandonedCheckout(session) {
    console.log('=== WEBHOOK: Processing abandoned checkout ===');
    console.log('Session ID:', session.id);

    try {
        // Get full session details (shipping_details is included by default, don't expand it)
        const fullSession = await stripe.checkout.sessions.retrieve(session.id, {
            expand: ['line_items', 'customer_details'],
        });

        const { customer_details, shipping_details, metadata, total_details, customer } = fullSession;

        // Strategy 1: Check customer_details (most common for Guest checkout)
        let customerEmail = customer_details?.email;
        let customerPhone = customer_details?.phone;
        let customerName = customer_details?.name;

        // Strategy 2: Check session.customer_email (pre-filled or captured)
        if (!customerEmail && fullSession.customer_email) {
            console.log('Found email in session.customer_email');
            customerEmail = fullSession.customer_email;
        }

        // Strategy 3: Check Stripe Customer object (if authenticated/Link user)
        if (!customerEmail && customer) {
            console.log('Fetching Stripe Customer object:', customer);
            try {
                const stripeCustomer = await stripe.customers.retrieve(customer);
                if (stripeCustomer && stripeCustomer.email) {
                    console.log('Found email in Stripe Customer object');
                    customerEmail = stripeCustomer.email;
                    if (!customerName) customerName = stripeCustomer.name;
                    if (!customerPhone) customerPhone = stripeCustomer.phone;
                }
            } catch (err) {
                console.error('Failed to retrieve Stripe customer:', err.message);
            }
        }

        if (!customerEmail) {
            console.log('No customer email found in session or customer object - cannot create abandoned cart recovery');
            return;
        }

        // Extract discount code if present
        let discountCode = null;
        let discountAmount = 0;
        if (total_details?.breakdown?.discounts?.length > 0) {
            const discount = total_details.breakdown.discounts[0];
            discountAmount = discount.amount || 0;
            discountCode = discount.discount?.coupon?.name || discount.discount?.promotion_code?.code || 'DISCOUNT';
            console.log('Discount code found:', discountCode, 'Amount:', discountAmount);
        }

        // Parse cart items from metadata
        let cartItems = [];
        try {
            cartItems = JSON.parse(metadata?.cart_items_json || '[]');
        } catch (e) {
            console.error('Failed to parse cart items:', e);
            return;
        }

        if (cartItems.length === 0) {
            console.log('No cart items in abandoned checkout');
            return;
        }

        console.log('Abandoned checkout by:', customerEmail);
        console.log('Customer name:', customer_details?.name);
        console.log('Customer phone:', customer_details?.phone);
        console.log('Items:', cartItems.length);

        // Create a Shopify draft order for abandoned cart recovery
        const SHOPIFY_STORE_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN;
        const SHOPIFY_ADMIN_ACCESS_TOKEN = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;

        if (!SHOPIFY_STORE_DOMAIN || !SHOPIFY_ADMIN_ACCESS_TOKEN) {
            console.error('Shopify credentials not configured');
            return;
        }

        // Get shipping address (prefer shipping_details, fallback to customer billing)
        const shippingAddress = shipping_details?.address || customer_details?.address;

        // Build customer object for draft order
        const customerData = {
            email: customerEmail,
        };

        // Add customer name if available
        if (customer_details?.name) {
            const nameParts = customer_details.name.split(' ');
            customerData.first_name = nameParts[0] || '';
            customerData.last_name = nameParts.slice(1).join(' ') || '';
        }

        // Build draft order with full customer details
        const draftOrder = {
            draft_order: {
                email: customerEmail,
                line_items: cartItems.map(item => ({
                    variant_id: item.variantId,
                    quantity: item.quantity,
                })),
                customer: customerData,
                note: `Abandoned Stripe checkout - Session: ${session.id}`,
                tags: 'abandoned-checkout, stripe-recovery',
            }
        };

        // Add shipping address if available
        if (shippingAddress) {
            draftOrder.draft_order.shipping_address = {
                first_name: customerData.first_name || 'Customer',
                last_name: customerData.last_name || '',
                address1: shippingAddress.line1 || '',
                address2: shippingAddress.line2 || '',
                city: shippingAddress.city || '',
                province: shippingAddress.state || '',
                country: shippingAddress.country || '',
                zip: shippingAddress.postal_code || '',
                phone: customer_details?.phone || '',
            };
            console.log('Shipping address added:', draftOrder.draft_order.shipping_address);
        }

        // Add phone to customer if available
        if (customer_details?.phone) {
            draftOrder.draft_order.phone = customer_details.phone;
            console.log('Customer phone:', customer_details.phone);
        }

        // Add discount code to note and apply discount if present
        if (discountCode) {
            draftOrder.draft_order.note = `Abandoned Stripe checkout - Session: ${session.id}\nPromo Code Used: ${discountCode}`;
            console.log('Adding discount to draft order:', discountCode);

            // Apply discount to draft order
            if (discountAmount > 0) {
                draftOrder.draft_order.applied_discount = {
                    description: `${discountCode}`,
                    value_type: 'fixed_amount',
                    value: (discountAmount / 100).toFixed(2),
                    amount: (discountAmount / 100).toFixed(2),
                };
                console.log('Applied discount amount:', (discountAmount / 100).toFixed(2));
            }
        }

        const response = await fetch(
            `https://${SHOPIFY_STORE_DOMAIN}/admin/api/2024-01/draft_orders.json`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Shopify-Access-Token': SHOPIFY_ADMIN_ACCESS_TOKEN,
                },
                body: JSON.stringify(draftOrder),
            }
        );

        if (!response.ok) {
            const error = await response.text();
            console.error('Failed to create draft order:', error);
            return;
        }

        const result = await response.json();
        console.log('=== SUCCESS: Created draft order for abandoned checkout ===');
        console.log('Draft Order ID:', result.draft_order?.id);
        console.log('Customer:', customerEmail);
        console.log('Customer details included:', {
            name: customer_details?.name,
            phone: customer_details?.phone,
            hasShippingAddress: !!shippingAddress
        });

    } catch (error) {
        console.error('=== ERROR: Failed to process abandoned checkout ===');
        console.error('Error:', error.message);
    }
}
