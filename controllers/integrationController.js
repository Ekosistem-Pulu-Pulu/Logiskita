// logistikita/controllers/integrationController.js
const db = require('../db');
const config = require('../config/integration');
const axios = require('axios');
const { calculateDistance } = require('../services/geocodeService');
const transitService = require('../services/transitService');

// Logging helper to save RAW request/response payloads in api_logs
async function logIntegration(partnerName, method, endpoint, requestPayload, responseStatus, responseBody, executionTime = 0) {
    try {
        let partnerId = null;
        if (partnerName) {
            const [rows] = await db.execute('SELECT id FROM marketplace_partners WHERE name = ?', [partnerName]);
            if (rows.length > 0) partnerId = rows[0].id;
        }

        const reqStr = typeof requestPayload === 'string' ? requestPayload : JSON.stringify(requestPayload);
        const resStr = typeof responseBody === 'string' ? responseBody : JSON.stringify(responseBody);

        await db.execute(
            `INSERT INTO api_logs (partner_id, endpoint, method, request_payload, response_status, response_body, execution_time_ms)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [partnerId, endpoint, method, reqStr, responseStatus, resStr, executionTime]
        );
    } catch (error) {
        console.error('[logIntegration Error]', error);
    }
}

// 1. GET /api/v1/health - Service Health Check
exports.healthCheck = async (req, res) => {
    const startTime = Date.now();
    const resBody = {
        service: "LogistiKita",
        status: "online",
        version: "1.0.0",
        timestamp: new Date().toISOString()
    };
    
    res.json(resBody);
    await logIntegration('API Gateway (Praktikum)', 'GET', '/api/v1/health', {}, 200, resBody, Date.now() - startTime);
};

// 2. GET /api/v1/integration-test - Connection Ping Test
exports.integrationTest = async (req, res) => {
    const startTime = Date.now();
    const results = {
        apiGateway: { status: 'Pending', message: '' },
        smartBank: { status: 'Pending', message: '' },
        marketplace: { status: 'Pending', message: '' },
        webhook: { status: 'Pending', message: '' }
    };

    if (config.integration.simulatorMode) {
        const simulatedResponse = {
            apiGateway: { status: 'Connected', message: 'API Gateway Connected (Simulator)' },
            smartBank: { status: 'Connected', message: 'SmartBank Connected (Simulator)' },
            marketplace: { status: 'Connected', message: 'Marketplace Connected (Simulator)' },
            webhook: { status: 'Connected', message: 'Webhook Reachable (Simulator)' }
        };
        res.json({ status: 'Success', data: simulatedResponse });
        await logIntegration('API Gateway (Praktikum)', 'GET', '/api/v1/integration-test', {}, 200, simulatedResponse, Date.now() - startTime);
        return;
    }

    const testConnection = async (url, timeout = 2500) => {
        try {
            await axios.get(url, { timeout });
            return { status: 'Connected', message: 'Connection successful' };
        } catch (error) {
            if (error.response) {
                return { status: 'Connected', message: `Connected (HTTP ${error.response.status})` };
            }
            return { status: 'Disconnected', message: error.message };
        }
    };

    results.apiGateway = await testConnection(config.apiGateway.url);
    results.smartBank = await testConnection(config.smartBank.url);
    results.marketplace = await testConnection(config.marketplace.url);
    results.webhook = await testConnection(config.marketplace.webhookUrl);

    res.json({ status: 'Success', data: results });
    await logIntegration('API Gateway (Praktikum)', 'GET', '/api/v1/integration-test', {}, 200, results, Date.now() - startTime);
};

// Helper function to find nearest branch
async function findNearestBranch(lat, lng, connection) {
    if (lat === undefined || lat === null || lng === undefined || lng === null) return null;
    const targetLat = parseFloat(lat);
    const targetLng = parseFloat(lng);
    if (isNaN(targetLat) || isNaN(targetLng)) return null;

    const [branches] = await connection.execute('SELECT id, lat, lng FROM branches WHERE status = "Active"');
    if (branches.length === 0) return null;

    let nearestBranchId = null;
    let minDistance = Infinity;

    for (const branch of branches) {
        if (branch.lat !== null && branch.lng !== null) {
            const dist = calculateDistance(targetLat, targetLng, parseFloat(branch.lat), parseFloat(branch.lng));
            if (dist < minDistance) {
                minDistance = dist;
                nearestBranchId = branch.id;
            }
        }
    }
    return nearestBranchId;
}

// 3. POST /api/v1/create-shipment - Create Shipment (requested by external groups)
exports.createShipmentExternal = async (req, res) => {
    const startTime = Date.now();
    const {
        sender_name, sender_address, sender_phone, sender_city,
        receiver_name, receiver_address, receiver_phone, receiver_city,
        weight, service_type, external_order_id
    } = req.body;

    if (!sender_name || !sender_address || !receiver_name || !receiver_address) {
        const errRes = { status: 'Error', message: 'Data pengirim dan penerima tidak lengkap' };
        res.status(400).json(errRes);
        await logIntegration('Marketplace (Praktikum)', 'POST', '/api/v1/create-shipment', req.body, 400, errRes, Date.now() - startTime);
        return;
    }

    const parsedWeight = parseFloat(weight) || 1.0;
    const selectedService = service_type === 'Express' ? 'Express' : 'Reguler';
    const pricePerKg = selectedService === 'Express' ? 25000 : 15000;
    const ongkir = parsedWeight * pricePerKg;
    const biayaLayanan = ongkir * 0.03; // 3% Admin fee
    const totalBiaya = ongkir + biayaLayanan;

    const awbNumber = 'LSK' + Date.now().toString().slice(-9) + Math.floor(Math.random() * 10);

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        let originBranchId = null;
        let destBranchId = null;

        if (sender_city) {
            const [b1] = await connection.execute('SELECT id FROM branches WHERE city LIKE ? LIMIT 1', [`%${sender_city}%`]);
            if (b1.length > 0) originBranchId = b1[0].id;
        }
        if (receiver_city) {
            const [b2] = await connection.execute('SELECT id FROM branches WHERE city LIKE ? LIMIT 1', [`%${receiver_city}%`]);
            if (b2.length > 0) destBranchId = b2[0].id;
        }

        if (!originBranchId) originBranchId = 1;
        if (!destBranchId) destBranchId = 2;

        await connection.execute(
            `INSERT INTO shipments (
                awb_number, partner_id, external_order_id,
                sender_name, sender_address, sender_phone, sender_city,
                receiver_name, receiver_address, receiver_phone, receiver_city,
                weight, service_type, ongkir, biaya_layanan, total_biaya,
                status, payment_status, origin_branch_id, destination_branch_id, current_branch_id, order_source
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending', 'Pending', ?, ?, ?, 'Marketplace')`,
            [
                awbNumber, 1, external_order_id || null,
                sender_name, sender_address, sender_phone || null, sender_city || null,
                receiver_name, receiver_address, receiver_phone || null, receiver_city || null,
                parsedWeight, selectedService, ongkir, biayaLayanan, totalBiaya,
                originBranchId, destBranchId, originBranchId
            ]
        );

        await connection.execute(
            'INSERT INTO tracking_logs (awb_number, status, description, location) VALUES (?, ?, ?, ?)',
            [awbNumber, 'Pending', 'Shipment registered via API. Waiting for payment.', sender_city || 'Origin Branch']
        );

        await connection.commit();

        const successRes = {
            status: 'Success',
            message: 'Shipment created successfully',
            data: {
                awb_number: awbNumber,
                external_order_id: external_order_id || null,
                ongkir,
                biaya_layanan: biayaLayanan,
                total_biaya: totalBiaya,
                payment_status: 'Pending',
                status: 'Pending'
            }
        };

        res.status(201).json(successRes);
        await logIntegration('Marketplace (Praktikum)', 'POST', '/api/v1/create-shipment', req.body, 201, successRes, Date.now() - startTime);

    } catch (err) {
        await connection.rollback();
        console.error('[Create Shipment External Error]', err);
        const errRes = { status: 'Error', message: 'Failed to create shipment: ' + err.message };
        res.status(500).json(errRes);
        await logIntegration('Marketplace (Praktikum)', 'POST', '/api/v1/create-shipment', req.body, 500, errRes, Date.now() - startTime);
    } finally {
        connection.release();
    }
};

// 4. GET /api/v1/tracking/:resi - Track Shipment
exports.trackShipmentExternal = async (req, res) => {
    const startTime = Date.now();
    const { resi } = req.params;

    try {
        const [shipments] = await db.execute(
            `SELECT s.awb_number, s.status, s.payment_status, s.service_type, s.weight,
                    s.sender_name, s.sender_address, s.sender_city,
                    s.receiver_name, s.receiver_address, s.receiver_city,
                    s.total_biaya, s.created_at
             FROM shipments s WHERE s.awb_number = ?`,
            [resi]
        );

        if (shipments.length === 0) {
            const errRes = { status: 'Error', message: 'AWB number not found' };
            res.status(404).json(errRes);
            await logIntegration('API Gateway (Praktikum)', 'GET', `/api/v1/tracking/${resi}`, {}, 404, errRes, Date.now() - startTime);
            return;
        }

        const [logs] = await db.execute(
            'SELECT status, description, location, created_at FROM tracking_logs WHERE awb_number = ? ORDER BY created_at ASC',
            [resi]
        );

        const successRes = {
            status: 'Success',
            data: {
                shipment: shipments[0],
                tracking_history: logs
            }
        };

        res.json(successRes);
        await logIntegration('API Gateway (Praktikum)', 'GET', `/api/v1/tracking/${resi}`, {}, 200, successRes, Date.now() - startTime);

    } catch (err) {
        console.error('[Track Shipment External Error]', err);
        const errRes = { status: 'Error', message: 'Failed to track shipment' };
        res.status(500).json(errRes);
        await logIntegration('API Gateway (Praktikum)', 'GET', `/api/v1/tracking/${resi}`, {}, 500, errRes, Date.now() - startTime);
    }
};

// 5. GET /api/v1/rates & POST /api/v1/rates - Calculate Rates
exports.checkRatesExternal = async (req, res) => {
    const startTime = Date.now();
    const origin = req.query.kota_asal || req.query.origin_city || req.body.kota_asal || req.body.origin_city;
    const destination = req.query.kota_tujuan || req.query.destination_city || req.body.kota_tujuan || req.body.destination_city;
    const weight = parseFloat(req.query.weight || req.body.weight || 1);

    if (!origin || !destination) {
        const errRes = { status: 'Error', message: 'Origin city and destination city are required' };
        res.status(400).json(errRes);
        await logIntegration('API Gateway (Praktikum)', req.method, '/api/v1/rates', req.query || req.body, 400, errRes, Date.now() - startTime);
        return;
    }

    try {
        const [rows] = await db.execute(
            'SELECT * FROM tarif WHERE LOWER(kota_asal) = LOWER(?) AND LOWER(kota_tujuan) = LOWER(?)',
            [origin, destination]
        );

        let options = [];
        if (rows.length === 0) {
            // Default pricing
            const defaultReg = weight * 15000;
            const defaultExp = weight * 25000;
            options = [
                { service: 'Reguler', price: defaultReg, estimasi: '3-4 Hari' },
                { service: 'Express', price: defaultExp, estimasi: '1-2 Hari' }
            ];
        } else {
            const tarif = rows[0];
            options = [
                { service: 'Reguler', price: parseFloat(tarif.harga_reguler) * weight, estimasi: tarif.estimasi_reguler || '2-3 Hari' },
                { service: 'Express', price: parseFloat(tarif.harga_express) * weight, estimasi: tarif.estimasi_express || '1 Hari' }
            ];
        }

        const successRes = {
            status: 'Success',
            data: {
                origin,
                destination,
                weight,
                options
            }
        };

        res.json(successRes);
        await logIntegration('API Gateway (Praktikum)', req.method, '/api/v1/rates', req.query || req.body, 200, successRes, Date.now() - startTime);

    } catch (err) {
        console.error('[Check Rates External Error]', err);
        const errRes = { status: 'Error', message: 'Failed to retrieve rates' };
        res.status(500).json(errRes);
        await logIntegration('API Gateway (Praktikum)', req.method, '/api/v1/rates', req.query || req.body, 500, errRes, Date.now() - startTime);
    }
};

// 6. POST /api/v1/webhook/payment-success - Webhook for success payment confirmation
exports.paymentSuccessWebhook = async (req, res) => {
    const startTime = Date.now();
    const { awb_number, transaction_id } = req.body;

    if (!awb_number || !transaction_id) {
        const errRes = { status: 'Error', message: 'awb_number and transaction_id are required' };
        res.status(400).json(errRes);
        await logIntegration('SmartBank (Praktikum)', 'POST', '/api/v1/webhook/payment-success', req.body, 400, errRes, Date.now() - startTime);
        return;
    }

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Find the shipment
        const [shipments] = await connection.execute(
            'SELECT * FROM shipments WHERE awb_number = ? FOR UPDATE',
            [awb_number]
        );

        if (shipments.length === 0) {
            await connection.rollback();
            const errRes = { status: 'Error', message: 'Shipment AWB not found' };
            res.status(404).json(errRes);
            await logIntegration('SmartBank (Praktikum)', 'POST', '/api/v1/webhook/payment-success', req.body, 404, errRes, Date.now() - startTime);
            return;
        }

        const shipment = shipments[0];

        // 2. Set paid status
        await connection.execute(
            'UPDATE shipments SET payment_status = "Paid", status = "Pending", smartbank_trx_id = ? WHERE awb_number = ?',
            [transaction_id, awb_number]
        );

        // 3. Insert legacy transactions and sync orders
        const [existingOrders] = await connection.execute('SELECT * FROM orders WHERE order_id = ?', [awb_number]);
        if (existingOrders.length === 0) {
            await connection.execute(
                'INSERT INTO orders (order_id, user_id, alamat, jarak, ongkir, status, pembayaran, transaction_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                [awb_number, shipment.external_order_id || 'CUSTOMER', shipment.receiver_address, shipment.distance_km || 0, shipment.ongkir, 'Pending', 'Lunas', transaction_id]
            );
        } else {
            await connection.execute(
                'UPDATE orders SET pembayaran = "Lunas", transaction_id = ?, status = "Pending" WHERE order_id = ?',
                [transaction_id, awb_number]
            );
        }

        await connection.execute(
            'INSERT INTO transactions (transaction_id, order_id, user_id, amount, fee_layanan, fee_bank, total) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [transaction_id, awb_number, shipment.external_order_id || 'CUSTOMER', shipment.ongkir, shipment.biaya_layanan, 0, shipment.total_biaya]
        );

        // 4. Generate Transit Legs
        let originBranchId = shipment.origin_branch_id || 1;
        let destBranchId = shipment.destination_branch_id || 2;
        await transitService.generateTransitLegs(shipment.id, awb_number, originBranchId, destBranchId, connection);

        // 5. Insert tracking log
        await connection.execute(
            'INSERT INTO tracking_logs (awb_number, status, description, location) VALUES (?, "Pending", "Pembayaran lunas terkonfirmasi via API Gateway Webhook. Paket siap dikirim.", "Gudang LogistiKita")',
            [awb_number]
        );

        // 6. Update integration transaction record if exists
        await connection.execute(
            `UPDATE integration_transactions 
             SET connection_status = "Connected", smartbank_status = "Paid", shipment_status = "Created", webhook_status = "Received" 
             WHERE awb_number = ?`,
            [awb_number]
        );

        await connection.commit();

        const successRes = { status: 'Success', message: 'Webhook processed successfully, shipment paid.' };
        res.json(successRes);
        await logIntegration('SmartBank (Praktikum)', 'POST', '/api/v1/webhook/payment-success', req.body, 200, successRes, Date.now() - startTime);

        // Trigger asynchronous webhook update to Marketplace
        if (config.marketplace.webhookUrl) {
            setTimeout(async () => {
                const mpStartTime = Date.now();
                const mpPayload = {
                    event: 'payment.success',
                    awb_number: awb_number,
                    transaction_id: transaction_id,
                    status: 'Paid',
                    timestamp: new Date().toISOString()
                };
                try {
                    console.log(`[Marketplace Callback] Sending success callback to: ${config.marketplace.webhookUrl}`);
                    const mpRes = await axios.post(config.marketplace.webhookUrl, mpPayload, { timeout: 3000 });
                    await logIntegration('Marketplace (Praktikum)', 'POST', '/webhook/tokobagus', mpPayload, mpRes.status, mpRes.data, Date.now() - mpStartTime);
                    await db.execute('UPDATE integration_transactions SET marketplace_status = "Sent" WHERE awb_number = ?', [awb_number]);
                } catch (e) {
                    console.error('[Marketplace Webhook Callback failed]', e.message);
                    await logIntegration('Marketplace (Praktikum)', 'POST', '/webhook/tokobagus', mpPayload, 500, { error: e.message }, Date.now() - mpStartTime);
                    await db.execute('UPDATE integration_transactions SET marketplace_status = "Failed" WHERE awb_number = ?', [awb_number]);
                }
            }, 1000);
        }

    } catch (err) {
        await connection.rollback();
        console.error('[Payment Success Webhook Error]', err);
        const errRes = { status: 'Error', message: 'Failed to process webhook: ' + err.message };
        res.status(500).json(errRes);
        await logIntegration('SmartBank (Praktikum)', 'POST', '/api/v1/webhook/payment-success', req.body, 500, errRes, Date.now() - startTime);
    } finally {
        connection.release();
    }
};

// 7. POST /api/v1/webhook/payment-failed - Webhook for failed payment
exports.paymentFailedWebhook = async (req, res) => {
    const startTime = Date.now();
    const { awb_number, reason } = req.body;

    if (!awb_number) {
        const errRes = { status: 'Error', message: 'awb_number is required' };
        res.status(400).json(errRes);
        await logIntegration('SmartBank (Praktikum)', 'POST', '/api/v1/webhook/payment-failed', req.body, 400, errRes, Date.now() - startTime);
        return;
    }

    try {
        await db.execute(
            'UPDATE shipments SET payment_status = "Failed" WHERE awb_number = ?',
            [awb_number]
        );
        await db.execute(
            'UPDATE integration_transactions SET smartbank_status = "Failed", webhook_status = "Received" WHERE awb_number = ?',
            [awb_number]
        );

        const successRes = { status: 'Success', message: 'Failed status logged' };
        res.json(successRes);
        await logIntegration('SmartBank (Praktikum)', 'POST', '/api/v1/webhook/payment-failed', req.body, 200, successRes, Date.now() - startTime);
    } catch (err) {
        console.error('[Payment Failed Webhook Error]', err);
        const errRes = { status: 'Error', message: 'Failed to log status' };
        res.status(500).json(errRes);
        await logIntegration('SmartBank (Praktikum)', 'POST', '/api/v1/webhook/payment-failed', req.body, 500, errRes, Date.now() - startTime);
    }
};

// 8. POST /api/v1/webhook/shipment-status - Webhook for status updates
exports.webhookShipmentStatus = async (req, res) => {
    const startTime = Date.now();
    const { awb_number, status, description, location } = req.body;

    if (!awb_number || !status) {
        const errRes = { status: 'Error', message: 'awb_number and status are required' };
        res.status(400).json(errRes);
        await logIntegration('API Gateway (Praktikum)', 'POST', '/api/v1/webhook/shipment-status', req.body, 400, errRes, Date.now() - startTime);
        return;
    }

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const [result] = await connection.execute(
            'UPDATE shipments SET status = ? WHERE awb_number = ?',
            [status, awb_number]
        );

        if (result.affectedRows === 0) {
            await connection.rollback();
            const errRes = { status: 'Error', message: 'Shipment AWB not found' };
            res.status(404).json(errRes);
            await logIntegration('API Gateway (Praktikum)', 'POST', '/api/v1/webhook/shipment-status', req.body, 404, errRes, Date.now() - startTime);
            return;
        }

        await connection.execute(
            'INSERT INTO tracking_logs (awb_number, status, description, location) VALUES (?, ?, ?, ?)',
            [awb_number, status, description || `Status updated to ${status}`, location || 'Cabang Transit']
        );

        await connection.commit();

        const successRes = { status: 'Success', message: `Status updated to ${status}` };
        res.json(successRes);
        await logIntegration('API Gateway (Praktikum)', 'POST', '/api/v1/webhook/shipment-status', req.body, 200, successRes, Date.now() - startTime);

    } catch (err) {
        await connection.rollback();
        console.error('[Webhook Shipment Status Error]', err);
        const errRes = { status: 'Error', message: 'Failed to update status' };
        res.status(500).json(errRes);
        await logIntegration('API Gateway (Praktikum)', 'POST', '/api/v1/webhook/shipment-status', req.body, 500, errRes, Date.now() - startTime);
    } finally {
        connection.release();
    }
};

// 9. GET /api/v1/integration-status/:transactionId - Poll status by transaction ID
exports.getIntegrationStatus = async (req, res) => {
    const startTime = Date.now();
    const { transactionId } = req.params;

    try {
        const [rows] = await db.execute(
            'SELECT * FROM integration_transactions WHERE transaction_id = ?',
            [transactionId]
        );

        if (rows.length === 0) {
            const errRes = { status: 'Error', message: 'Transaction ID not found' };
            res.status(404).json(errRes);
            await logIntegration('API Gateway (Praktikum)', 'GET', `/api/v1/integration-status/${transactionId}`, {}, 404, errRes, Date.now() - startTime);
            return;
        }

        const tx = rows[0];

        // In simulator mode, check if we need to auto-advance the simulation steps to make checkout progress dynamically!
        if (config.integration.simulatorMode && tx.webhook_status === 'Pending') {
            // Auto advance simulation step: Connection Connected -> Paid -> Webhook Received
            // We can run an update query here so that the next poll returns the completed state!
            // First poll: sets SmartBank to Paid and Webhook to Received
            // Next poll will return the finalized success status.
            setTimeout(async () => {
                try {
                    const nextTrxId = 'TRX-SB-' + Date.now();
                    const connection = await db.getConnection();
                    try {
                        await connection.beginTransaction();
                        await connection.execute(
                            `UPDATE integration_transactions 
                             SET connection_status = "Connected", smartbank_status = "Paid", 
                                 shipment_status = "Created", webhook_status = "Received", marketplace_status = "Sent" 
                             WHERE transaction_id = ?`,
                            [transactionId]
                        );
                        
                        // Also update actual shipment to Paid
                        if (tx.awb_number) {
                            await connection.execute(
                                'UPDATE shipments SET payment_status = "Paid", status = "Pending", smartbank_trx_id = ? WHERE awb_number = ?',
                                [nextTrxId, tx.awb_number]
                            );
                            
                            // Insert into tracking logs
                            await connection.execute(
                                'INSERT INTO tracking_logs (awb_number, status, description, location) VALUES (?, "Pending", "Pembayaran Lunas via Simulasi API Gateway.", "Sistem Pembayaran")',
                                [tx.awb_number]
                            );

                            // Sync legacy orders
                            await connection.execute(
                                'UPDATE orders SET pembayaran = "Lunas", transaction_id = ?, status = "Pending" WHERE order_id = ?',
                                [nextTrxId, tx.awb_number]
                            );
                            
                            // Insert financial transaction
                            await connection.execute(
                                'INSERT INTO transactions (transaction_id, order_id, user_id, amount, fee_layanan, fee_bank, total) SELECT ?, awb_number, "CUSTOMER", ongkir, biaya_layanan, 0, total_biaya FROM shipments WHERE awb_number = ?',
                                [nextTrxId, tx.awb_number]
                            );
                            
                            // Generate transit legs
                            const [shipRows] = await connection.execute('SELECT * FROM shipments WHERE awb_number = ?', [tx.awb_number]);
                            if (shipRows.length > 0) {
                                const ship = shipRows[0];
                                await transitService.generateTransitLegs(ship.id, ship.awb_number, ship.origin_branch_id || 1, ship.destination_branch_id || 2, connection);
                            }
                        }
                        
                        await connection.commit();
                        console.log(`[Simulator] Auto-advanced transaction status to success for transaction: ${transactionId}`);
                    } catch (e) {
                        await connection.rollback();
                        console.error('[Simulator auto advance error]', e);
                    } finally {
                        connection.release();
                    }
                } catch (dbErr) {
                    console.error(dbErr);
                }
            }, 1000);
        }

        const successRes = {
            status: 'Success',
            simulatorMode: config.integration.simulatorMode,
            data: tx
        };

        res.json(successRes);
        // Do not spam logs for every single poll request unless status has changed, but a basic log is okay
        if (tx.webhook_status === 'Received') {
            await logIntegration('API Gateway (Praktikum)', 'GET', `/api/v1/integration-status/${transactionId}`, {}, 200, successRes, Date.now() - startTime);
        }

    } catch (err) {
        console.error('[Get Integration Status Error]', err);
        const errRes = { status: 'Error', message: 'Failed to retrieve integration status' };
        res.status(500).json(errRes);
        await logIntegration('API Gateway (Praktikum)', 'GET', `/api/v1/integration-status/${transactionId}`, {}, 500, errRes, Date.now() - startTime);
    }
};

// Initiate API Gateway payment request
exports.initiateGatewayPayment = async (req, res) => {
    const startTime = Date.now();
    const { awb_number } = req.body;

    if (!awb_number) {
        return res.status(400).json({ status: 'Error', message: 'AWB number is required' });
    }

    try {
        const [shipments] = await db.execute('SELECT * FROM shipments WHERE awb_number = ?', [awb_number]);
        if (shipments.length === 0) {
            return res.status(404).json({ status: 'Error', message: 'Shipment not found' });
        }

        const shipment = shipments[0];
        const transactionId = 'GW-REQ-' + Date.now();

        // 1. Save transaction request
        await db.execute(
            `INSERT INTO integration_transactions (transaction_id, awb_number, connection_status, smartbank_status, shipment_status, webhook_status, marketplace_status)
             VALUES (?, ?, 'Pending', 'Pending', 'Created', 'Pending', 'Pending')`,
            [transactionId, awb_number]
        );

        // 2. Call external API Gateway (if not simulator mode)
        const gatewayPayload = {
            transaction_id: transactionId,
            amount: parseFloat(shipment.total_biaya),
            awb_number: awb_number,
            source: 'LogistiKita',
            destination: shipment.receiver_address,
            timestamp: new Date().toISOString()
        };

        let gwResult = null;
        let connectionStatus = 'Connected';

        if (config.integration.simulatorMode) {
            gwResult = {
                success: true,
                transaction_id: transactionId,
                message: "Pembayaran disimulasikan sukses"
            };
        } else {
            try {
                console.log(`[API Gateway] Transmitting payment transaction to ${config.apiGateway.url}`);
                const response = await axios.post(config.apiGateway.url, gatewayPayload, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${config.apiGateway.apiKey}`
                    },
                    timeout: config.apiGateway.timeout
                });
                gwResult = {
                    success: true,
                    transaction_id: response.data.transaction_id || transactionId,
                    message: response.data.message || 'Transmission successful'
                };
            } catch (error) {
                console.error('[API Gateway Transmission error]', error.message);
                connectionStatus = 'Error';
                gwResult = {
                    success: false,
                    message: 'API Gateway connection failed: ' + error.message
                };
            }
        }

        // Update connection status in table
        await db.execute(
            'UPDATE integration_transactions SET connection_status = ? WHERE transaction_id = ?',
            [connectionStatus, transactionId]
        );

        // Log the integration transmission
        await logIntegration('API Gateway (Praktikum)', 'POST', '/api/gateway/payment', gatewayPayload, gwResult.success ? 200 : 500, gwResult, Date.now() - startTime);

        if (!gwResult.success && !config.integration.simulatorMode) {
            return res.status(502).json({
                status: 'Error',
                message: 'Failed to transmit transaction to API Gateway',
                transaction_id: transactionId
            });
        }

        res.json({
            status: 'Success',
            transaction_id: transactionId,
            payload: gatewayPayload,
            message: 'Transaction successfully transmitted to API Gateway'
        });

    } catch (err) {
        console.error('[Initiate Gateway Payment Error]', err);
        res.status(500).json({ status: 'Error', message: 'Failed to initiate gateway payment' });
    }
};
