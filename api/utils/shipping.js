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
// Based on USD rates, converted approximately
const SHIPPING_BY_CURRENCY = {
    'USD': { europe: 1000, uk: 2500, middleEast: 3400, usa: 5000, row: 5000 },
    'EUR': { europe: 920, uk: 2300, middleEast: 3128, usa: 4600, row: 4600 },
    'GBP': { europe: 790, uk: 1975, middleEast: 2686, usa: 3950, row: 3950 },
    'SAR': { europe: 3750, uk: 9375, middleEast: 12750, usa: 18750, row: 18750 },
    'AED': { europe: 3670, uk: 9175, middleEast: 12478, usa: 18350, row: 18350 },
    'QAR': { europe: 3640, uk: 9100, middleEast: 12376, usa: 18200, row: 18200 },
    'OMR': { europe: 385, uk: 963, middleEast: 1309, usa: 1925, row: 1925 },
    'KWD': { europe: 307, uk: 768, middleEast: 1044, usa: 1535, row: 1535 },
    'BHD': { europe: 377, uk: 943, middleEast: 1281, usa: 1885, row: 1885 },
};

// Free shipping thresholds by currency (in smallest unit) - $230 USD equivalent
const FREE_SHIPPING_THRESHOLD = {
    'USD': 23000,   // $230
    'EUR': 21160,   // €211.60
    'GBP': 18170,   // £181.70
    'SAR': 86250,   // 862.50 SAR
    'AED': 84410,   // 844.10 AED
    'QAR': 83720,   // 837.20 QAR
    'OMR': 8855,    // 88.55 OMR (3 decimals)
    'KWD': 7061,    // 70.61 KWD (3 decimals)
    'BHD': 8671,    // 86.71 BHD (3 decimals)
};

/**
 * Calculate shipping cost based on country, currency, and cart total
 * @param {string} countryCode - ISO country code
 * @param {string} currency - Currency code (USD, EUR, etc.)
 * @param {number} cartTotal - Cart total in smallest currency unit (cents)
 * @returns {number} Shipping cost in smallest currency unit
 */
function calculateShipping(countryCode, currency, cartTotal) {
    const zone = SHIPPING_ZONES[countryCode] || SHIPPING_ZONES['DEFAULT'];
    const currencyRates = SHIPPING_BY_CURRENCY[currency] || SHIPPING_BY_CURRENCY['USD'];
    const freeThreshold = FREE_SHIPPING_THRESHOLD[currency] || FREE_SHIPPING_THRESHOLD['USD'];

    // UAE and Oman - always free
    if (zone.zone === 'UAE' || zone.zone === 'OMAN') {
        return 0;
    }

    // Free shipping over threshold
    if (cartTotal >= freeThreshold) {
        return 0;
    }

    // Return zone-specific rate
    switch (zone.zone) {
        case 'EUROPE':
            return currencyRates.europe;
        case 'UK':
            return currencyRates.uk;
        case 'MIDDLE_EAST':
            return currencyRates.middleEast;
        case 'USA':
            return currencyRates.usa;
        default:
            return currencyRates.row;
    }
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
