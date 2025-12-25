/**
 * Shipping rates by country
 * UPDATED to match Shopify shipping zones exactly
 */

// Country to shipping zone mapping - UPDATED with Shopify rates
const SHIPPING_ZONES = {
    // UAE - Always Free
    'AE': { zone: 'UAE', baseCost: 0, freeThreshold: 0 },

    // Oman - Always Free
    'OM': { zone: 'OMAN', baseCost: 0, freeThreshold: 0 },

    // Middle East (BH, KW, SA, QA) - Free above $230, $34 below
    'SA': { zone: 'MIDDLE_EAST', baseCost: 34, freeThreshold: 230 },
    'KW': { zone: 'MIDDLE_EAST', baseCost: 34, freeThreshold: 230 },
    'BH': { zone: 'MIDDLE_EAST', baseCost: 34, freeThreshold: 230 },
    'QA': { zone: 'MIDDLE_EAST', baseCost: 34, freeThreshold: 230 },

    // UK - Free above $230, $25 below
    'GB': { zone: 'UK', baseCost: 25, freeThreshold: 230 },

    // Europe - Free above $230, $10 below
    'AL': { zone: 'EUROPE', baseCost: 10, freeThreshold: 230 },
    'AD': { zone: 'EUROPE', baseCost: 10, freeThreshold: 230 },
    'AT': { zone: 'EUROPE', baseCost: 10, freeThreshold: 230 },
    'BE': { zone: 'EUROPE', baseCost: 10, freeThreshold: 230 },
    'BA': { zone: 'EUROPE', baseCost: 10, freeThreshold: 230 },
    'BG': { zone: 'EUROPE', baseCost: 10, freeThreshold: 230 },
    'HR': { zone: 'EUROPE', baseCost: 10, freeThreshold: 230 },
    'CY': { zone: 'EUROPE', baseCost: 10, freeThreshold: 230 },
    'CZ': { zone: 'EUROPE', baseCost: 10, freeThreshold: 230 },
    'DK': { zone: 'EUROPE', baseCost: 10, freeThreshold: 230 },
    'EE': { zone: 'EUROPE', baseCost: 10, freeThreshold: 230 },
    'FI': { zone: 'EUROPE', baseCost: 10, freeThreshold: 230 },
    'FR': { zone: 'EUROPE', baseCost: 10, freeThreshold: 230 },
    'DE': { zone: 'EUROPE', baseCost: 10, freeThreshold: 230 },
    'GR': { zone: 'EUROPE', baseCost: 10, freeThreshold: 230 },
    'HU': { zone: 'EUROPE', baseCost: 10, freeThreshold: 230 },
    'IS': { zone: 'EUROPE', baseCost: 10, freeThreshold: 230 },
    'IE': { zone: 'EUROPE', baseCost: 10, freeThreshold: 230 },
    'IT': { zone: 'EUROPE', baseCost: 10, freeThreshold: 230 },
    'LV': { zone: 'EUROPE', baseCost: 10, freeThreshold: 230 },
    'LI': { zone: 'EUROPE', baseCost: 10, freeThreshold: 230 },
    'LT': { zone: 'EUROPE', baseCost: 10, freeThreshold: 230 },
    'LU': { zone: 'EUROPE', baseCost: 10, freeThreshold: 230 },
    'MT': { zone: 'EUROPE', baseCost: 10, freeThreshold: 230 },
    'MC': { zone: 'EUROPE', baseCost: 10, freeThreshold: 230 },
    'ME': { zone: 'EUROPE', baseCost: 10, freeThreshold: 230 },
    'NL': { zone: 'EUROPE', baseCost: 10, freeThreshold: 230 },
    'MK': { zone: 'EUROPE', baseCost: 10, freeThreshold: 230 },
    'NO': { zone: 'EUROPE', baseCost: 10, freeThreshold: 230 },
    'PL': { zone: 'EUROPE', baseCost: 10, freeThreshold: 230 },
    'PT': { zone: 'EUROPE', baseCost: 10, freeThreshold: 230 },
    'RO': { zone: 'EUROPE', baseCost: 10, freeThreshold: 230 },
    'SM': { zone: 'EUROPE', baseCost: 10, freeThreshold: 230 },
    'RS': { zone: 'EUROPE', baseCost: 10, freeThreshold: 230 },
    'SK': { zone: 'EUROPE', baseCost: 10, freeThreshold: 230 },
    'SI': { zone: 'EUROPE', baseCost: 10, freeThreshold: 230 },
    'ES': { zone: 'EUROPE', baseCost: 10, freeThreshold: 230 },
    'SE': { zone: 'EUROPE', baseCost: 10, freeThreshold: 230 },
    'CH': { zone: 'EUROPE', baseCost: 10, freeThreshold: 230 },
    'VA': { zone: 'EUROPE', baseCost: 10, freeThreshold: 230 },

    // USA - Free above $230, $50 below
    'US': { zone: 'USA', baseCost: 50, freeThreshold: 230 },

    // Rest of World (default) - Free above $230, $50 below
    'DEFAULT': { zone: 'ROW', baseCost: 50, freeThreshold: 230 },
};

// Currency-specific shipping costs (in smallest unit - cents/pence/etc)
// Base rate: EUR 15 (converted to other currencies)
const SHIPPING_BY_CURRENCY = {
    'USD': { standard: 1650 },  // ~$16.50 (EUR 15 equivalent)
    'EUR': { standard: 1500 },  // €15.00
    'GBP': { standard: 1290 },  // ~£12.90
    'SAR': { standard: 6190 },  // ~62 SAR
    'AED': { standard: 6060 },  // ~61 AED
    'QAR': { standard: 6010 },  // ~60 QAR
    'OMR': { standard: 635 },   // ~6.35 OMR (3 decimals = 6350)
    'KWD': { standard: 507 },   // ~5.07 KWD (3 decimals = 5070)
    'BHD': { standard: 623 },   // ~6.23 BHD (3 decimals = 6230)
};

// Free shipping thresholds by currency (in smallest unit) - EUR 200 equivalent
const FREE_SHIPPING_THRESHOLD = {
    'USD': 22000,   // $220 (EUR 200 equivalent)
    'EUR': 20000,   // €200
    'GBP': 17200,   // £172
    'SAR': 82500,   // 825 SAR
    'AED': 80800,   // 808 AED
    'QAR': 80200,   // 802 QAR
    'OMR': 8470,    // 84.70 OMR (3 decimals)
    'KWD': 6760,    // 67.60 KWD (3 decimals)
    'BHD': 8290,    // 82.90 BHD (3 decimals)
};

/**
 * Calculate shipping cost based on country, currency, and cart total
 * SIMPLIFIED: EUR 15 flat rate for all destinations, free on EUR 200+
 * UAE and Oman always free
 * @param {string} countryCode - ISO country code
 * @param {string} currency - Currency code (USD, EUR, etc.)
 * @param {number} cartTotal - Cart total in smallest currency unit (cents)
 * @returns {number} Shipping cost in smallest currency unit
 */
function calculateShipping(countryCode, currency, cartTotal) {
    const zone = SHIPPING_ZONES[countryCode] || SHIPPING_ZONES['DEFAULT'];
    const currencyRates = SHIPPING_BY_CURRENCY[currency] || SHIPPING_BY_CURRENCY['EUR'];
    const freeThreshold = FREE_SHIPPING_THRESHOLD[currency] || FREE_SHIPPING_THRESHOLD['EUR'];

    // UAE and Oman - always free
    if (zone.zone === 'UAE' || zone.zone === 'OMAN') {
        return 0;
    }

    // Free shipping over threshold (EUR 200 equivalent)
    if (cartTotal >= freeThreshold) {
        return 0;
    }

    // Return standard flat rate (EUR 15 equivalent)
    return currencyRates.standard;
}

/**
 * Get shipping zone for a country
 * @param {string} countryCode - ISO country code
 * @returns {string} Zone name
 */
function getShippingZone(countryCode) {
    const zone = SHIPPING_ZONES[countryCode] || SHIPPING_ZONES['DEFAULT'];
    return zone.zone;
}

module.exports = {
    calculateShipping,
    getShippingZone,
    SHIPPING_ZONES,
    FREE_SHIPPING_THRESHOLD,
};
