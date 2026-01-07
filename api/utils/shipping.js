/**
 * Shipping rates by country
 * UPDATED: Per-country rates matching the official OJAR shipping spreadsheet
 * Last updated: 2026-01-07
 */

/**
 * Per-country shipping configuration
 * Each country has:
 * - currency: The currency used for this country
 * - shippingCost: Cost in that currency (in smallest unit - cents/fils/etc)
 * - freeThreshold: Order value threshold for free shipping (in smallest unit)
 * 
 * For 3-decimal currencies (OMR, KWD, BHD), multiply by 1000
 * For 2-decimal currencies (EUR, USD, GBP, etc), multiply by 100
 */
const SHIPPING_RATES = {
    // ===== UAE - Always Free =====
    'AE': { currency: 'AED', shippingCost: 0, freeThreshold: 0 },

    // ===== GCC Countries =====
    'SA': { currency: 'SAR', shippingCost: 5000, freeThreshold: 25000 },      // SAR 50, free above SAR 250
    'KW': { currency: 'KWD', shippingCost: 4000, freeThreshold: 21000 },      // KD 4, free above KD 21 (3 decimals)
    'BH': { currency: 'BHD', shippingCost: 10000, freeThreshold: 80000 },     // BD 10, free above BD 80 (3 decimals)
    'OM': { currency: 'OMR', shippingCost: 10000, freeThreshold: 25000 },     // OMR 10, free above OMR 25 (3 decimals)
    'QA': { currency: 'QAR', shippingCost: 5000, freeThreshold: 25000 },      // QAR 50, free above QAR 250

    // ===== Lebanon =====
    'LB': { currency: 'USD', shippingCost: 4000, freeThreshold: 20000 },      // USD 40, free above USD 200

    // ===== Europe - EUR 100 threshold =====
    'BE': { currency: 'EUR', shippingCost: 1000, freeThreshold: 10000 },      // EUR 10, free above EUR 100
    'DE': { currency: 'EUR', shippingCost: 1000, freeThreshold: 10000 },      // EUR 10, free above EUR 100
    'FR': { currency: 'EUR', shippingCost: 1500, freeThreshold: 10000 },      // EUR 15, free above EUR 100
    'IE': { currency: 'EUR', shippingCost: 1500, freeThreshold: 10000 },      // EUR 15, free above EUR 100
    'PL': { currency: 'EUR', shippingCost: 1500, freeThreshold: 10000 },      // EUR 15, free above EUR 100
    'IT': { currency: 'EUR', shippingCost: 2000, freeThreshold: 10000 },      // EUR 20, free above EUR 100
    'GR': { currency: 'EUR', shippingCost: 2000, freeThreshold: 10000 },      // EUR 20, free above EUR 100
    'AT': { currency: 'EUR', shippingCost: 2500, freeThreshold: 10000 },      // EUR 25, free above EUR 100
    'NL': { currency: 'EUR', shippingCost: 2500, freeThreshold: 10000 },      // EUR 25, free above EUR 100

    // ===== Europe - EUR 200 threshold =====
    'HU': { currency: 'EUR', shippingCost: 2500, freeThreshold: 20000 },      // EUR 25, free above EUR 200
    'SK': { currency: 'EUR', shippingCost: 3000, freeThreshold: 20000 },      // EUR 30, free above EUR 200
    'ES': { currency: 'EUR', shippingCost: 3000, freeThreshold: 20000 },      // EUR 30, free above EUR 200
    'CZ': { currency: 'EUR', shippingCost: 3500, freeThreshold: 20000 },      // EUR 35, free above EUR 200
    'LT': { currency: 'EUR', shippingCost: 4000, freeThreshold: 20000 },      // EUR 40, free above EUR 200
    'CH': { currency: 'EUR', shippingCost: 4000, freeThreshold: 20000 },      // EUR 40, free above EUR 200
    'MT': { currency: 'EUR', shippingCost: 5000, freeThreshold: 20000 },      // EUR 50, free above EUR 200
    'AL': { currency: 'EUR', shippingCost: 5000, freeThreshold: 20000 },      // EUR 50, free above EUR 200
    'CY': { currency: 'EUR', shippingCost: 5000, freeThreshold: 20000 },      // EUR 50, free above EUR 200
    'NO': { currency: 'EUR', shippingCost: 5000, freeThreshold: 20000 },      // EUR 50, free above EUR 200
    'EE': { currency: 'EUR', shippingCost: 5000, freeThreshold: 20000 },      // EUR 50, free above EUR 200
    'BA': { currency: 'EUR', shippingCost: 5000, freeThreshold: 20000 },      // EUR 50, free above EUR 200
    'HR': { currency: 'EUR', shippingCost: 5000, freeThreshold: 20000 },      // EUR 50, free above EUR 200
    'AD': { currency: 'EUR', shippingCost: 2500, freeThreshold: 20000 },      // EUR 25, free above EUR 200
    'BG': { currency: 'EUR', shippingCost: 2500, freeThreshold: 20000 },      // EUR 25, free above EUR 200
    'DK': { currency: 'EUR', shippingCost: 2500, freeThreshold: 20000 },      // EUR 25, free above EUR 200
    'FI': { currency: 'EUR', shippingCost: 2500, freeThreshold: 20000 },      // EUR 25, free above EUR 200
    'LI': { currency: 'EUR', shippingCost: 2500, freeThreshold: 20000 },      // EUR 25, free above EUR 200
    'MC': { currency: 'EUR', shippingCost: 2500, freeThreshold: 20000 },      // EUR 25, free above EUR 200
    'ME': { currency: 'EUR', shippingCost: 2500, freeThreshold: 20000 },      // EUR 25, free above EUR 200
    'PT': { currency: 'EUR', shippingCost: 2500, freeThreshold: 20000 },      // EUR 25, free above EUR 200
    'RO': { currency: 'EUR', shippingCost: 2500, freeThreshold: 20000 },      // EUR 25, free above EUR 200
    'RS': { currency: 'EUR', shippingCost: 2500, freeThreshold: 20000 },      // EUR 25, free above EUR 200
    'SI': { currency: 'EUR', shippingCost: 2500, freeThreshold: 20000 },      // EUR 25, free above EUR 200
    'SE': { currency: 'EUR', shippingCost: 2500, freeThreshold: 20000 },      // EUR 25, free above EUR 200

    // ===== UK - GBP but EUR 200 threshold =====
    'GB': { currency: 'GBP', shippingCost: 4300, freeThreshold: 17200 },      // ~EUR 50, free above ~EUR 200

    // ===== USA =====
    'US': { currency: 'USD', shippingCost: 4000, freeThreshold: 15000 },      // USD 40, free above USD 150
};

// Default for unknown countries
const DEFAULT_SHIPPING = { currency: 'EUR', shippingCost: 5000, freeThreshold: 20000 }; // EUR 50, free above EUR 200

/**
 * Calculate shipping cost based on country, currency, and cart total
 * @param {string} countryCode - ISO country code
 * @param {string} currency - Currency code (USD, EUR, etc.) - used for conversion
 * @param {number} cartTotal - Cart total in smallest currency unit (cents)
 * @returns {number} Shipping cost in smallest currency unit
 */
function calculateShipping(countryCode, currency, cartTotal) {
    const countryConfig = SHIPPING_RATES[countryCode] || DEFAULT_SHIPPING;

    // Get the shipping cost and threshold for this country
    let shippingCost = countryConfig.shippingCost;
    let freeThreshold = countryConfig.freeThreshold;
    const countryCurrency = countryConfig.currency;

    // If the checkout currency is different from the country's native currency,
    // we need to convert the shipping cost to the checkout currency
    if (currency !== countryCurrency) {
        const converted = convertShipping(shippingCost, freeThreshold, countryCurrency, currency);
        shippingCost = converted.shippingCost;
        freeThreshold = converted.freeThreshold;
    }

    // UAE always free
    if (countryCode === 'AE') {
        return 0;
    }

    // Free shipping above threshold
    if (cartTotal >= freeThreshold) {
        console.log(`[Shipping] Free shipping for ${countryCode}: cart ${cartTotal} >= threshold ${freeThreshold}`);
        return 0;
    }

    console.log(`[Shipping] ${countryCode}: ${shippingCost} ${currency} (cart: ${cartTotal}, threshold: ${freeThreshold})`);
    return shippingCost;
}

/**
 * Convert shipping costs between currencies
 * Uses approximate exchange rates based on EUR base
 */
function convertShipping(cost, threshold, fromCurrency, toCurrency) {
    // Exchange rates to EUR (approximate)
    const toEUR = {
        'EUR': 1,
        'USD': 0.92,
        'GBP': 1.16,
        'SAR': 0.24,
        'AED': 0.25,
        'QAR': 0.25,
        'OMR': 2.38,   // 3 decimal currency
        'KWD': 2.98,   // 3 decimal currency
        'BHD': 2.43,   // 3 decimal currency
    };

    const fromRate = toEUR[fromCurrency] || 1;
    const toRate = toEUR[toCurrency] || 1;

    // Convert via EUR
    const costInEUR = cost * fromRate;
    const thresholdInEUR = threshold * fromRate;

    // Convert to target currency
    const convertedCost = Math.round(costInEUR / toRate);
    const convertedThreshold = Math.round(thresholdInEUR / toRate);

    return {
        shippingCost: convertedCost,
        freeThreshold: convertedThreshold
    };
}

/**
 * Get shipping zone for a country
 * @param {string} countryCode - ISO country code
 * @returns {string} Zone name
 */
function getShippingZone(countryCode) {
    if (countryCode === 'AE') return 'UAE';
    if (['SA', 'KW', 'BH', 'OM', 'QA', 'LB'].includes(countryCode)) return 'GCC';
    if (countryCode === 'GB') return 'UK';
    if (countryCode === 'US') return 'USA';
    if (SHIPPING_RATES[countryCode]) return 'EUROPE';
    return 'ROW';
}

module.exports = {
    calculateShipping,
    getShippingZone,
    SHIPPING_RATES,
};
