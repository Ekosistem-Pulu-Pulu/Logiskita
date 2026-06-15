// logistikita/config/integration.js
// Configuration file for combined practicum integrations (API Gateway, SmartBank, Marketplace)
// You can edit the environment variables in .env or modify the default values here.

module.exports = {
    // API Gateway settings
    apiGateway: {
        url: process.env.API_GATEWAY_URL || 'http://localhost:4000/api/gateway/payment',
        apiKey: process.env.API_GATEWAY_KEY || 'logistikita-secret-key-123',
        secretKey: process.env.API_GATEWAY_SECRET || 'gateway-secret-456',
        timeout: parseInt(process.env.API_GATEWAY_TIMEOUT) || 5000
    },

    // SmartBank settings
    smartBank: {
        url: process.env.SMARTBANK_API_URL || 'http://localhost:5000/api/v1',
        apiKey: process.env.SMARTBANK_API_KEY || 'smartbank-key-abc'
    },

    // Marketplace settings
    marketplace: {
        url: process.env.MARKETPLACE_API_URL || 'http://localhost:3005',
        webhookUrl: process.env.MARKETPLACE_WEBHOOK_URL || 'http://localhost:3005/webhook/tokobagus'
    },

    // Integration settings
    integration: {
        // Mode Simulator/Mock: set to true if external services are not ready yet
        // If false, the system will send real HTTP requests to the URLs above.
        simulatorMode: process.env.INTEGRATION_SIMULATOR_MODE !== 'false', // Default to true
        
        // LogistiKita's own Webhook configuration
        webhookSecret: process.env.LOGISTIKITA_WEBHOOK_SECRET || 'lsk-webhook-secret-xyz'
    }
};
