const db = require('../db');

async function apiLogMiddleware(req, res, next) {
    const start = Date.now();
    const originalSend = res.send;

    // We override res.send to capture the response body
    res.send = function (body) {
        res.locals.body = body;
        originalSend.call(this, body);
    };

    res.on('finish', async () => {
        const execution_time_ms = Date.now() - start;
        const partner_id = req.partner ? req.partner.id : null;
        
        let reqPayload = null;
        if (req.method !== 'GET' && req.body) {
            reqPayload = JSON.stringify(req.body);
        }

        let resBody = null;
        if (res.locals.body) {
            // Check if it's already a string, if not try to stringify
            resBody = typeof res.locals.body === 'string' ? res.locals.body : JSON.stringify(res.locals.body);
        }

        // Limit the size of stored payloads to avoid large blobs if necessary
        if (reqPayload && reqPayload.length > 5000) reqPayload = reqPayload.substring(0, 5000) + '...';
        if (resBody && resBody.length > 5000) resBody = resBody.substring(0, 5000) + '...';

        try {
            await db.execute(
                `INSERT INTO api_logs (partner_id, endpoint, method, request_payload, response_status, response_body, execution_time_ms) 
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [
                    partner_id,
                    req.originalUrl || req.url,
                    req.method,
                    reqPayload,
                    res.statusCode,
                    resBody,
                    execution_time_ms
                ]
            );

            // Increment partner total_requests if successful auth
            if (partner_id) {
                await db.execute('UPDATE marketplace_partners SET total_requests = total_requests + 1 WHERE id = ?', [partner_id]);
            }
        } catch (error) {
            console.error('[API Log Middleware Error]', error);
        }
    });

    next();
}

module.exports = apiLogMiddleware;
