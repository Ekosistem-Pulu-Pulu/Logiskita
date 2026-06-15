const rateLimit = require('express-rate-limit');

// This uses a fixed 60 requests per minute by default
// In a fully dynamic setup per partner, you might need a custom store or memory implementation.
// For now, we will use a basic setup that identifies the partner by their API key.
const rateLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 60, // Limit each IP or key to 60 requests per `window` (here, per minute)
    keyGenerator: (req, res) => {
        // Use the API key as the key since this route is protected by verifyApiKey
        return req.headers['x-api-key'] || 'unknown';
    },
    message: {
        status: 'Error',
        message: 'Terlalu banyak request. Silakan coba lagi nanti.'
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

module.exports = rateLimiter;
