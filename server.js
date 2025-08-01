const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;

// Allow requests from GitHub Pages
app.use(cors({
    origin: ['https://davy-00.github.io', 'http://localhost:8080'],
    methods: ['GET', 'POST', 'OPTIONS']
}));

app.use(express.json());
app.use(express.static('.'));

// Simple cache for exchange rates
const cache = new Map();

// Supported currencies
const currencies = {
    'USD': 'US Dollar', 'EUR': 'Euro', 'GBP': 'British Pound',
    'JPY': 'Japanese Yen', 'CAD': 'Canadian Dollar', 'AUD': 'Australian Dollar',
    'CHF': 'Swiss Franc', 'CNY': 'Chinese Yuan', 'INR': 'Indian Rupee', 'KRW': 'South Korean Won'
};

// Currency conversion API
app.post('/api/convert', async (req, res) => {
    try {
        const { from, to, amount } = req.body;
        
        if (!from || !to || !amount) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const fromCur = from.toUpperCase();
        const toCur = to.toUpperCase();
        const num = parseFloat(amount);

        if (isNaN(num) || num < 0) {
            return res.status(400).json({ error: 'Invalid amount' });
        }

        if (!currencies[fromCur] || !currencies[toCur]) {
            return res.status(400).json({ error: 'Unsupported currency' });
        }

        // Check cache
        const cacheKey = `${fromCur}_rates`;
        let rates = cache.get(cacheKey);
        
        if (!rates) {
            const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${fromCur}`);
            const data = await response.json();
            rates = data.rates;
            cache.set(cacheKey, rates);
            setTimeout(() => cache.delete(cacheKey), 5 * 60 * 1000); // 5 min cache
        }

        const rate = rates[toCur];
        if (!rate) {
            return res.status(400).json({ error: 'Exchange rate not available' });
        }

        const converted = num * rate;

        res.json({
            from: fromCur,
            to: toCur,
            amount: num,
            convertedAmount: parseFloat(converted.toFixed(2)),
            exchangeRate: parseFloat(rate.toFixed(4)),
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Conversion error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve index.html for root
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
