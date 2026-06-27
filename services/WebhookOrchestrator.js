// ============================================================
// WebhookOrchestrator.js
// Service untuk mengorkestrasi seluruh proses pasca-pembayaran
// yang sebelumnya tertumpuk di paymentSuccessWebhook controller.
// Memecah God Method menjadi langkah-langkah yang kohesif.
// ============================================================

const db = require('../db');
const axios = require('axios');
const config = require('../config/integration');
const transitService = require('./transitService');

/**
 * Update status pembayaran shipment menjadi Paid.
 * @param {object} conn - DB connection
 * @param {string} awbNumber
 * @param {string} transactionId
 * @returns {Promise<object>} shipment data
 */
async function confirmShipmentPayment(conn, awbNumber, transactionId) {
    const [shipments] = await conn.execute(
        'SELECT * FROM shipments WHERE awb_number = ? FOR UPDATE',
        [awbNumber]
    );

    if (shipments.length === 0) {
        throw new Error('Shipment AWB not found');
    }

    await conn.execute(
        'UPDATE shipments SET payment_status = "Paid", status = "Pending", smartbank_trx_id = ? WHERE awb_number = ?',
        [transactionId, awbNumber]
    );

    return shipments[0];
}

/**
 * Sinkronisasi data pembayaran ke tabel legacy (orders + transactions).
 * Diperlukan agar laporan lama dan frontend legacy tetap berfungsi.
 * @param {object} conn - DB connection
 * @param {object} shipment - Shipment data
 * @param {string} awbNumber
 * @param {string} transactionId
 */
async function syncLegacyTables(conn, shipment, awbNumber, transactionId) {
    // Sync ke tabel orders
    const [existingOrders] = await conn.execute('SELECT * FROM orders WHERE order_id = ?', [awbNumber]);
    if (existingOrders.length === 0) {
        await conn.execute(
            'INSERT INTO orders (order_id, user_id, alamat, jarak, ongkir, status, pembayaran, transaction_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [awbNumber, shipment.external_order_id || 'CUSTOMER', shipment.receiver_address, shipment.distance_km || 0, shipment.ongkir, 'Pending', 'Lunas', transactionId]
        );
    } else {
        await conn.execute(
            'UPDATE orders SET pembayaran = "Lunas", transaction_id = ?, status = "Pending" WHERE order_id = ?',
            [transactionId, awbNumber]
        );
    }

    // Insert ke tabel transactions
    await conn.execute(
        'INSERT INTO transactions (transaction_id, order_id, user_id, amount, fee_layanan, fee_bank, total) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [transactionId, awbNumber, shipment.external_order_id || 'CUSTOMER', shipment.ongkir, shipment.biaya_layanan, 0, shipment.total_biaya]
    );
}

/**
 * Buat transit legs dan insert tracking log awal.
 * @param {object} conn - DB connection
 * @param {object} shipment - Shipment data
 * @param {string} awbNumber
 */
async function initializeTransitRoute(conn, shipment, awbNumber) {
    const originBranchId = shipment.origin_branch_id || 1;
    const destBranchId = shipment.destination_branch_id || 2;

    await transitService.generateTransitLegs(shipment.id, awbNumber, originBranchId, destBranchId, conn);

    await conn.execute(
        'INSERT INTO tracking_logs (awb_number, status, description, location) VALUES (?, "Pending", "Pembayaran lunas terkonfirmasi via API Gateway Webhook. Paket siap dikirim.", "Gudang LogistiKita")',
        [awbNumber]
    );
}

/**
 * Update status di tabel integration_transactions.
 * @param {object} conn - DB connection
 * @param {string} awbNumber
 */
async function updateIntegrationStatus(conn, awbNumber) {
    await conn.execute(
        `UPDATE integration_transactions 
         SET connection_status = "Connected", smartbank_status = "Paid", shipment_status = "Created", webhook_status = "Received" 
         WHERE awb_number = ?`,
        [awbNumber]
    );
}

/**
 * Kirim callback/notifikasi ke Marketplace (fire-and-forget).
 * Dijalankan secara asinkron setelah transaksi utama selesai.
 * @param {string} awbNumber
 * @param {string} transactionId
 */
function notifyMarketplaceAsync(awbNumber, transactionId) {
    if (!config.marketplace.webhookUrl) return;

    setTimeout(async () => {
        const mpPayload = {
            event: 'payment.success',
            awb_number: awbNumber,
            transaction_id: transactionId,
            status: 'Paid',
            timestamp: new Date().toISOString()
        };

        try {
            console.log(`[WebhookOrchestrator] Sending marketplace callback to: ${config.marketplace.webhookUrl}`);
            const mpRes = await axios.post(config.marketplace.webhookUrl, mpPayload, { timeout: 3000 });
            await db.execute('UPDATE integration_transactions SET marketplace_status = "Sent" WHERE awb_number = ?', [awbNumber]);
        } catch (e) {
            console.error('[WebhookOrchestrator] Marketplace callback failed:', e.message);
            await db.execute('UPDATE integration_transactions SET marketplace_status = "Failed" WHERE awb_number = ?', [awbNumber]);
        }
    }, 1000);
}

/**
 * Orkestrasi seluruh proses webhook pembayaran sukses.
 * Menggantikan God Method paymentSuccessWebhook di integrationController.
 * @param {string} awbNumber
 * @param {string} transactionId
 * @returns {Promise<{ success: boolean, message: string }>}
 */
async function processPaymentSuccessWebhook(awbNumber, transactionId) {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // Step 1: Konfirmasi pembayaran shipment
        const shipment = await confirmShipmentPayment(connection, awbNumber, transactionId);

        // Step 2: Sinkronisasi tabel legacy
        await syncLegacyTables(connection, shipment, awbNumber, transactionId);

        // Step 3: Buat rute transit dan tracking log
        await initializeTransitRoute(connection, shipment, awbNumber);

        // Step 4: Update status integrasi
        await updateIntegrationStatus(connection, awbNumber);

        await connection.commit();

        // Step 5: Notifikasi marketplace (async, di luar transaksi utama)
        notifyMarketplaceAsync(awbNumber, transactionId);

        return { success: true, message: 'Webhook processed successfully, shipment paid.' };

    } catch (err) {
        await connection.rollback();
        throw err;
    } finally {
        connection.release();
    }
}

module.exports = {
    confirmShipmentPayment,
    syncLegacyTables,
    initializeTransitRoute,
    updateIntegrationStatus,
    notifyMarketplaceAsync,
    processPaymentSuccessWebhook
};
