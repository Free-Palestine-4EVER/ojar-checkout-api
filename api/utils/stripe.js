/**
 * Stripe client initialization
 */
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

module.exports = stripe;
