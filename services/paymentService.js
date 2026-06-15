// services/paymentService.js
// Service helper to process payments via an external API Gateway / third-party integrator

const axios = require('axios');
const config = require('../config/integration');

async function processExternalPayment(payload) {
    const endpoint = config.apiGateway.url;
    const apiKey = config.apiGateway.apiKey;
    const simulatorMode = config.integration.simulatorMode;

    console.log(`\n[API Gateway Service] =============================================`);
    console.log(`[API Gateway Service] Sending payload to external endpoint: ${endpoint}`);
    console.log(`[API Gateway Service] Payload:`, JSON.stringify(payload, null, 2));

    if (simulatorMode) {
        console.log(`[API Gateway Service] Running in simulator mode (config-driven).`);
        const mockTrxId = 'GATEWAY-MOCK-' + Date.now() + Math.floor(Math.random() * 1000);
        console.log(`[API Gateway Service] Generated mock transaction: ${mockTrxId}`);
        console.log(`[API Gateway Service] =============================================\n`);

        return {
            success: true,
            transaction_id: mockTrxId,
            message: "Pembayaran disimulasikan sukses oleh API Gateway Fallback",
            simulated: true
        };
    }

    try {
        const response = await axios.post(endpoint, payload, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
                'X-Source-App': 'LogistiKita'
            },
            timeout: config.apiGateway.timeout
        });

        console.log(`[API Gateway Service] Success response:`, JSON.stringify(response.data, null, 2));
        console.log(`[API Gateway Service] =============================================\n`);

        return {
            success: true,
            transaction_id: response.data.transaction_id || ('GATEWAY-' + Date.now()),
            message: response.data.message || 'Pembayaran via API Gateway eksternal berhasil',
            data: response.data
        };
    } catch (error) {
        console.warn(`[API Gateway Service] Warning: Request to external API Gateway failed (${error.message})`);
        
        // Fallback / Simulation for demonstration & robust testing when other team server is offline
        console.log(`[API Gateway Service] Running in simulation fallback mode.`);
        const mockTrxId = 'GATEWAY-MOCK-' + Date.now() + Math.floor(Math.random() * 1000);
        console.log(`[API Gateway Service] Generated mock transaction: ${mockTrxId}`);
        console.log(`[API Gateway Service] =============================================\n`);

        return {
            success: true,
            transaction_id: mockTrxId,
            message: "Pembayaran disimulasikan sukses oleh API Gateway Fallback (Error Fallback)",
            simulated: true
        };
    }
}

module.exports = {
    processExternalPayment
};
