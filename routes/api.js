const express = require('express');
const NodeCache = require('node-cache');
const router = express.Router();

// Cache with 5 minute TTL for exchange rates
const cache = new NodeCache({ stdTTL: 300 });

// Supported currencies with their full names and symbols
const SUPPORTED_CURRENCIES = {
    'USD': { name: 'US Dollar', symbol: '$' },
    'EUR': { name: 'Euro', symbol: '€' },
    'GBP': { name: 'British Pound', symbol: '£' },
    'JPY': { name: 'Japanese Yen', symbol: '¥' },
    'CAD': { name: 'Canadian Dollar', symbol: 'C$' },
    'AUD': { name: 'Australian Dollar', symbol: 'A$' },
    'CHF': { name: 'Swiss Franc', symbol: 'CHF' },
    'CNY': { name: 'Chinese Yuan', symbol: '¥' },
    'INR': { name: 'Indian Rupee', symbol: '₹' },
    'KRW': { name: 'South Korean Won', symbol: '₩' },
    'BRL': { name: 'Brazilian Real', symbol: 'R$' },
    'RUB': { name: 'Russian Ruble', symbol: '₽' },
    'ZAR': { name: 'South African Rand', symbol: 'R' },
    'MXN': { name: 'Mexican Peso', symbol: '$' },
    'SGD': { name: 'Singapore Dollar', symbol: 'S$' },
    'HKD': { name: 'Hong Kong Dollar', symbol: 'HK$' },
    'NOK': { name: 'Norwegian Krone', symbol: 'kr' },
    'SEK': { name: 'Swedish Krona', symbol: 'kr' },
    'DKK': { name: 'Danish Krone', symbol: 'kr' },
    'PLN': { name: 'Polish Zloty', symbol: 'zł' }
};

// API Configuration
const API_CONFIG = {
    BASE_URL: 'https://api.exchangerate-api.com/v4',
    FALLBACK_URL: 'https://api.fixer.io',
    TIMEOUT: 10000
};

/**
 * Fetch data from external API with error handling
 */
async function fetchWithTimeout(url, options = {}) {
    const { timeout = API_CONFIG.TIMEOUT } = options;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        clearTimeout(timeoutId);
        throw error;
    }
}

/**
 * Get current exchange rates for a base currency
 */
router.get('/rates/:baseCurrency?', async (req, res) => {
    try {
        const baseCurrency = (req.params.baseCurrency || 'USD').toUpperCase();
        
        // Validate base currency
        if (!SUPPORTED_CURRENCIES[baseCurrency]) {
            return res.status(400).json({
                error: 'Invalid base currency',
                message: `Supported currencies: ${Object.keys(SUPPORTED_CURRENCIES).join(', ')}`
            });
        }
        
        const cacheKey = `rates_${baseCurrency}`;
        const cachedData = cache.get(cacheKey);
        
        if (cachedData) {
            return res.json({
                ...cachedData,
                cached: true,
                server: process.env.SERVER_NAME || 'unknown'
            });
        }
        
        // Fetch from primary API
        let data;
        try {
            data = await fetchWithTimeout(`${API_CONFIG.BASE_URL}/latest/${baseCurrency}`);
        } catch (error) {
            console.error('Primary API failed:', error.message);
            throw new Error('Exchange rate service temporarily unavailable');
        }
        
        const response = {
            base: baseCurrency,
            date: data.date,
            rates: data.rates,
            timestamp: new Date().toISOString(),
            cached: false,
            server: process.env.SERVER_NAME || 'unknown'
        };
        
        // Cache the response
        cache.set(cacheKey, response);
        
        res.json(response);
    } catch (error) {
        console.error('Error fetching exchange rates:', error);
        res.status(500).json({
            error: 'Service Error',
            message: 'Unable to fetch exchange rates. Please try again later.',
            timestamp: new Date().toISOString()
        });
    }
});

/**
 * Convert currency amounts
 */
router.post('/convert', async (req, res) => {
    try {
        const { from, to, amount } = req.body;
        
        // Input validation
        if (!from || !to || amount === undefined) {
            return res.status(400).json({
                error: 'Missing required fields',
                message: 'Please provide from, to, and amount fields'
            });
        }
        
        const fromCurrency = from.toUpperCase();
        const toCurrency = to.toUpperCase();
        const numAmount = parseFloat(amount);
        
        if (isNaN(numAmount) || numAmount < 0) {
            return res.status(400).json({
                error: 'Invalid amount',
                message: 'Amount must be a positive number'
            });
        }
        
        if (!SUPPORTED_CURRENCIES[fromCurrency] || !SUPPORTED_CURRENCIES[toCurrency]) {
            return res.status(400).json({
                error: 'Invalid currency',
                message: `Supported currencies: ${Object.keys(SUPPORTED_CURRENCIES).join(', ')}`
            });
        }
        
        // Check cache first
        const cacheKey = `rates_${fromCurrency}`;
        let ratesData = cache.get(cacheKey);
        
        if (!ratesData) {
            // Fetch exchange rates
            try {
                const data = await fetchWithTimeout(`${API_CONFIG.BASE_URL}/latest/${fromCurrency}`);
                ratesData = {
                    rates: data.rates,
                    date: data.date
                };
                cache.set(cacheKey, ratesData);
            } catch (error) {
                console.error('Error fetching conversion rates:', error);
                throw new Error('Currency conversion service temporarily unavailable');
            }
        }
        
        const exchangeRate = ratesData.rates[toCurrency];
        if (!exchangeRate) {
            return res.status(400).json({
                error: 'Exchange rate not available',
                message: `Cannot convert from ${fromCurrency} to ${toCurrency}`
            });
        }
        
        const convertedAmount = numAmount * exchangeRate;
        
        res.json({
            from: fromCurrency,
            to: toCurrency,
            amount: numAmount,
            convertedAmount: parseFloat(convertedAmount.toFixed(4)),
            exchangeRate: parseFloat(exchangeRate.toFixed(6)),
            timestamp: new Date().toISOString(),
            server: process.env.SERVER_NAME || 'unknown'
        });
        
    } catch (error) {
        console.error('Error in currency conversion:', error);
        res.status(500).json({
            error: 'Conversion Error',
            message: 'Unable to perform currency conversion. Please try again later.',
            timestamp: new Date().toISOString()
        });
    }
});

/**
 * Get list of supported currencies
 */
router.get('/currencies', (req, res) => {
    res.json({
        currencies: SUPPORTED_CURRENCIES,
        count: Object.keys(SUPPORTED_CURRENCIES).length,
        timestamp: new Date().toISOString(),
        server: process.env.SERVER_NAME || 'unknown'
    });
});

/**
 * Get historical data for a currency pair (mock data for demo)
 */
router.get('/historical/:from/:to', async (req, res) => {
    try {
        const { from, to } = req.params;
        const { days = 30 } = req.query;
        
        const fromCurrency = from.toUpperCase();
        const toCurrency = to.toUpperCase();
        
        if (!SUPPORTED_CURRENCIES[fromCurrency] || !SUPPORTED_CURRENCIES[toCurrency]) {
            return res.status(400).json({
                error: 'Invalid currency pair',
                message: `Supported currencies: ${Object.keys(SUPPORTED_CURRENCIES).join(', ')}`
            });
        }
        
        // Generate mock historical data (in a real app, this would come from an API)
        const historicalData = [];
        const today = new Date();
        const baseRate = Math.random() * 2 + 0.5; // Random base rate
        
        for (let i = parseInt(days); i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            
            // Add some realistic volatility
            const volatility = (Math.random() - 0.5) * 0.1;
            const rate = baseRate * (1 + volatility);
            
            historicalData.push({
                date: date.toISOString().split('T')[0],
                rate: parseFloat(rate.toFixed(6))
            });
        }
        
        res.json({
            from: fromCurrency,
            to: toCurrency,
            period: `${days} days`,
            data: historicalData,
            timestamp: new Date().toISOString(),
            server: process.env.SERVER_NAME || 'unknown'
        });
        
    } catch (error) {
        console.error('Error fetching historical data:', error);
        res.status(500).json({
            error: 'Historical Data Error',
            message: 'Unable to fetch historical data. Please try again later.',
            timestamp: new Date().toISOString()
        });
    }
});

module.exports = router;
