/**
 * Create Stripe Checkout Session
 * POST /api/create-checkout-session
 * 
 * Receives cart data from Shopify theme, creates a Stripe Checkout session
 * with the customer's selected currency and shipping calculated.
 * 
 * UPDATED: Added phone_number_collection and expanded country list
 * UPDATED: Added 5-minute session expiration for abandoned cart tracking
 */

const stripe = require('./utils/stripe');
const { calculateShipping } = require('./utils/shipping');

// Currency configuration
const CURRENCY_CONFIG = {
    'USD': { symbol: '$', multiplier: 100 },
    'EUR': { symbol: '€', multiplier: 100 },
    'GBP': { symbol: '£', multiplier: 100 },
    'SAR': { symbol: 'SAR', multiplier: 100 },
    'AED': { symbol: 'AED', multiplier: 100 },
    'QAR': { symbol: 'QAR', multiplier: 100 },
    'OMR': { symbol: 'OMR', multiplier: 1000 }, // OMR uses 3 decimal places
    'KWD': { symbol: 'KWD', multiplier: 1000 }, // KWD uses 3 decimal places
    'BHD': { symbol: 'BHD', multiplier: 1000 }, // BHD uses 3 decimal places
};

// OJAR delivery countries only (43 countries from shipping spreadsheet)
const ALLOWED_SHIPPING_COUNTRIES = [
    // GCC / Middle East
    'AE', // UAE
    'SA', // Saudi Arabia
    'KW', // Kuwait
    'BH', // Bahrain
    'OM', // Oman
    'QA', // Qatar
    'LB', // Lebanon
    // Europe
    'GB', // United Kingdom
    'DE', // Germany
    'FR', // France
    'IT', // Italy
    'ES', // Spain
    'NL', // Netherlands
    'BE', // Belgium
    'AT', // Austria
    'CH', // Switzerland
    'PT', // Portugal
    'IE', // Ireland
    'PL', // Poland
    'GR', // Greece
    'SE', // Sweden
    'DK', // Denmark
    'FI', // Finland
    'NO', // Norway
    'CZ', // Czech Republic
    'HU', // Hungary
    'RO', // Romania
    'BG', // Bulgaria
    'HR', // Croatia
    'SI', // Slovenia
    'EE', // Estonia
    'CY', // Cyprus
    'MT', // Malta
    'LU', // Luxembourg
    'AD', // Andorra
    'MC', // Monaco
    'LI', // Liechtenstein
    'AL', // Albania
    'BA', // Bosnia and Herzegovina
    'ME', // Montenegro
    'RS', // Serbia
    // USA
    'US', // United States
];

module.exports = async function handler(req, res) {
    // Get origin from request
    const origin = req.headers.origin;
    const allowedOrigins = ['https://ojarofficial.com', 'https://www.ojarofficial.com', 'https://ojarofficial.myshopify.com'];

    // Set CORS headers for allowed origins
    if (allowedOrigins.includes(origin) || !origin) {
        res.setHeader('Access-Control-Allow-Origin', origin || '*');
    } else {
        res.setHeader('Access-Control-Allow-Origin', 'https://ojarofficial.com');
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const {
            cartItems,        // Array of { handle, variantId, title, quantity, price, image }
            currency,         // Selected currency code (USD, EUR, GBP, etc.)
            countryCode,      // Customer's country code for shipping
            customerEmail,    // Optional: pre-fill email
            marketingConsent, // Optional: marketing consent flag
            cartToken,        // Shopify cart token for restoration
        } = req.body;

        // Validate required fields
        if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
            return res.status(400).json({ error: 'Cart items are required' });
        }

        if (!currency || !CURRENCY_CONFIG[currency]) {
            return res.status(400).json({ error: 'Invalid currency' });
        }

        const currencyLower = currency.toLowerCase();
        const currencyMultiplier = CURRENCY_CONFIG[currency].multiplier;

        // Calculate cart total (prices already in smallest unit from frontend)
        const cartTotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        // Check if cart contains only test products (skip shipping for testing)
        const isTestOrder = cartItems.every(item =>
            item.handle?.includes('-copy') || item.handle?.includes('test')
        );

        // Calculate shipping (skip for test orders)
        const shippingCost = isTestOrder ? 0 : calculateShipping(countryCode || 'US', currency, cartTotal);

        // Debug logging
        console.log('[Checkout] Shipping calculation:', {
            countryCode: countryCode || 'US (defaulted)',
            currency,
            cartTotal,
            shippingCost,
            isTestOrder
        });

        // Build Stripe line items
        const lineItems = cartItems.map(item => ({
            price_data: {
                currency: currencyLower,
                product_data: {
                    name: item.title,
                    images: item.image ? [item.image] : [],
                    metadata: {
                        shopify_handle: item.handle,
                        shopify_variant_id: item.variantId,
                    },
                },
                unit_amount: item.price, // Already in smallest unit
            },
            quantity: item.quantity,
        }));

        // Add shipping as a line item if there's a cost
        if (shippingCost > 0) {
            lineItems.push({
                price_data: {
                    currency: currencyLower,
                    product_data: {
                        name: 'Shipping',
                        description: 'International shipping',
                    },
                    unit_amount: shippingCost,
                },
                quantity: 1,
            });
        }

        // Create Stripe Checkout session
        const session = await stripe.checkout.sessions.create({
            // Payment methods - card includes Apple Pay and Google Pay when enabled in Stripe Dashboard
            payment_method_types: ['card'],

            line_items: lineItems,
            mode: 'payment',
            success_url: `${process.env.SUCCESS_REDIRECT_URL || 'https://ojarofficial.com/pages/thank-you'}?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.CANCEL_REDIRECT_URL || 'https://ojarofficial.com'}`,
            customer_email: customerEmail || undefined,
            billing_address_collection: 'required',

            // UPDATED: Collect phone number
            phone_number_collection: {
                enabled: true,
            },

            // UPDATED: Allow only OJAR delivery countries for shipping
            shipping_address_collection: {
                allowed_countries: ALLOWED_SHIPPING_COUNTRIES,
            },

            // UPDATED: Set session to expire after 30 minutes (Stripe minimum) for abandoned cart tracking
            expires_at: Math.floor(Date.now() / 1000) + (30 * 60), // 30 minutes from now

            metadata: {
                shopify_cart_token: cartToken || '',
                currency: currency,
                country_code: countryCode || '',
                customer_email: customerEmail || '',
                marketing_consent: marketingConsent ? 'true' : 'false',
                cart_items_json: JSON.stringify(cartItems.map(item => ({
                    variantId: item.variantId,
                    quantity: item.quantity,
                    price: item.price,
                }))),
            },
            // Allow customer to adjust quantity at checkout
            allow_promotion_codes: true,
        });

        // Return the checkout session URL
        return res.status(200).json({
            sessionId: session.id,
            checkoutUrl: session.url,
        });

    } catch (error) {
        console.error('Stripe Checkout error:', error);
        return res.status(500).json({
            error: 'Failed to create checkout session',
            message: error.message
        });
    }
};
