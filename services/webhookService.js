const db = require('../db');
const axios = require('axios');
const crypto = require('crypto');

// Retry delays: 30s, 2m, 5m, 10m, 20m (in milliseconds)
const RETRY_DELAYS = [30000, 120000, 300000, 600000, 1200000];

async function sendWebhook(partnerId, shipmentId, payload, attempt = 1) {
    try {
        const [rows] = await db.execute('SELECT callback_url, webhook_secret FROM marketplace_partners WHERE id = ?', [partnerId]);
        if (rows.length === 0) return;

        const { callback_url, webhook_secret } = rows[0];
        if (!callback_url || !webhook_secret) return;

        const payloadString = JSON.stringify(payload);
        const signature = crypto.createHmac('sha256', webhook_secret).update(payloadString).digest('hex');

        let statusCode = null;
        let success = false;

        try {
            const response = await axios.post(callback_url, payload, {
                headers: {
                    'Content-Type': 'application/json',
                    'X-Signature': signature
                },
                timeout: 10000
            });
            statusCode = response.status;
            success = statusCode >= 200 && statusCode < 300;
        } catch (error) {
            statusCode = error.response ? error.response.status : (error.code === 'ECONNABORTED' ? 408 : 500);
        }

        let nextRetryAt = null;
        if (!success && attempt <= RETRY_DELAYS.length) {
            const delay = RETRY_DELAYS[attempt - 1];
            nextRetryAt = new Date(Date.now() + delay);
        }

        // Insert log
        await db.execute(
            `INSERT INTO webhook_logs (partner_id, shipment_id, payload, signature, status_code, attempt, next_retry_at)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [partnerId, shipmentId, payloadString, signature, statusCode, attempt, nextRetryAt]
        );

        // Schedule retry if failed
        if (!success && attempt <= RETRY_DELAYS.length) {
            const delay = RETRY_DELAYS[attempt - 1];
            console.log(`[Webhook] Attempt ${attempt} failed for partner ${partnerId}, retrying in ${delay}ms`);
            setTimeout(() => {
                sendWebhook(partnerId, shipmentId, payload, attempt + 1);
            }, delay);
        } else if (success) {
            console.log(`[Webhook] Attempt ${attempt} succeeded for partner ${partnerId}`);
        } else {
            console.log(`[Webhook] Max attempts reached for partner ${partnerId}`);
        }

    } catch (dbError) {
        console.error('[Webhook DB Error]', dbError);
    }
}

module.exports = {
    sendWebhook
};
