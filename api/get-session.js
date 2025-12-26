/**
 * Get Stripe Checkout Session Details
 * GET /api/get-session?session_id=xxx
 * 
 * Retrieves session details to display order summary on thank you page
 */

const stripe = require('./utils/stripe');

module.exports = async function handler(req, res) {
    // CORS configuration - allow all OJAR domains
    const origin = req.headers.origin;
    const allowedOrigins = [
        'https://ojarofficial.com',
        'https://www.ojarofficial.com',
        'https://ojarofficial.myshopify.com'
    ];
    const corsOrigin = allowedOrigins.includes(origin) ? origin : 'https://ojarofficial.com';

    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        res.setHeader('Access-Control-Allow-Origin', corsOrigin);
        res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', corsOrigin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    try {
        const { session_id } = req.query;

        if (!session_id) {
            return res.status(400).json({ error: 'session_id is required' });
        }

        // Retrieve the session with line items expanded
        const session = await stripe.checkout.sessions.retrieve(session_id, {
            expand: ['line_items', 'line_items.data.price.product'],
        });

        // Check if payment was successful
        if (session.payment_status !== 'paid') {
            return res.status(400).json({ error: 'Payment not completed' });
        }

        // Format line items for display
        const items = session.line_items.data
            .filter(item => item.price.product.name !== 'Shipping') // Exclude shipping line
            .map(item => ({
                name: item.price.product.name,
                quantity: item.quantity,
                price: item.amount_total,
                currency: session.currency.toUpperCase(),
                image: item.price.product.images?.[0] || null,
            }));

        // Get shipping info
        const shippingItem = session.line_items.data.find(
            item => item.price.product.name === 'Shipping'
        );

        // Return formatted order summary
        return res.status(200).json({
            orderId: session.id,
            customerEmail: session.customer_details?.email,
            customerPhone: session.customer_details?.phone, // ADDED: Include phone number
            items,
            subtotal: session.amount_subtotal,
            shipping: shippingItem?.amount_total || 0,
            total: session.amount_total,
            currency: session.currency.toUpperCase(),
            shippingAddress: session.shipping_details || null,
        });

    } catch (error) {
        console.error('Get session error:', error);
        return res.status(500).json({
            error: 'Failed to retrieve session',
            message: error.message
        });
    }
};
