// ============================================================
// PaymentGatewayService.js
// Service terpusat untuk mengelola alur pembayaran melalui
// API Gateway eksternal dengan fallback ke SmartBank lokal.
// Memisahkan logika I/O jaringan dan transaksi DB dari controller.
// ============================================================

const axios = require('axios');
const smartbankService = require('./smartbankService');
const db = require('../db');

/**
 * Kirim pembayaran ke API Gateway eksternal, fallback ke SmartBank jika gagal.
 * @param {{ order_id: string, user_id: string, nominal: number }} paymentData
 * @param {string} gatewayUrl - URL API Gateway
 * @returns {Promise<{ success: boolean, transaction_id: string, gateway_used: string, message?: string }>}
 */
async function processPaymentWithFallback(paymentData, gatewayUrl) {
    const { order_id, user_id, nominal } = paymentData;
    const parsedNominal = parseFloat(nominal);

    // Susun payload JSON untuk API Gateway
    const gatewayPayload = {
        order_id,
        user_id,
        nominal: parsedNominal,
        source: 'LogistiKita',
        timestamp: new Date().toISOString()
    };

    console.log(`\n[PaymentGatewayService] =============================================`);
    console.log(`[PaymentGatewayService] Order: ${order_id} | User: ${user_id} | Nominal: ${parsedNominal}`);
    console.log(`[PaymentGatewayService] Payload ke Gateway:`, JSON.stringify(gatewayPayload));

    // Coba kirim ke API Gateway eksternal
    try {
        console.log(`[PaymentGatewayService] Mengirim ke API Gateway: ${gatewayUrl}`);

        const response = await axios.post(gatewayUrl, gatewayPayload, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 10000
        });

        console.log(`[PaymentGatewayService] Response dari Gateway:`, JSON.stringify(response.data));
        return {
            success: response.data && (response.data.success || response.data.status === 'Success'),
            transaction_id: response.data.transaction_id || 'TRX-' + Date.now(),
            gateway_used: 'api_gateway',
            data: response.data
        };
    } catch (gatewayError) {
        console.warn(`[PaymentGatewayService] API Gateway tidak tersedia: ${gatewayError.message}`);
        console.log(`[PaymentGatewayService] Menggunakan fallback SmartBank Service lokal...`);
    }

    // Fallback: SmartBank Service lokal
    try {
        const bankResponse = await smartbankService.processPayment(user_id, order_id, parsedNominal);
        console.log(`[PaymentGatewayService] Fallback SmartBank response:`, JSON.stringify(bankResponse));
        return {
            success: bankResponse && (bankResponse.success || bankResponse.status === 'Success'),
            transaction_id: bankResponse.transaction_id || 'TRX-' + Date.now(),
            gateway_used: 'local_smartbank',
            data: bankResponse
        };
    } catch (fallbackError) {
        console.error(`[PaymentGatewayService] Fallback juga gagal:`, fallbackError.message);
        return {
            success: false,
            transaction_id: null,
            gateway_used: 'none',
            message: 'Gagal menghubungi API Gateway dan SmartBank Service'
        };
    }
}

/**
 * Simpan transaksi pembayaran ke database (UPDATE orders + INSERT transactions)
 * @param {object} conn - Database connection (dari db.getConnection())
 * @param {{ order_id: string, user_id: string, nominal: number, transaction_id: string }} txData
 * @returns {Promise<{ ongkirAsli: number, feeLayanan: number, total: number }>}
 */
async function savePaymentTransaction(conn, txData) {
    const { order_id, user_id, nominal, transaction_id } = txData;
    const parsedNominal = parseFloat(nominal);

    // Validasi order
    const [orderRows] = await conn.execute(
        'SELECT * FROM orders WHERE order_id = ? AND user_id = ? FOR UPDATE',
        [order_id, user_id]
    );
    if (orderRows.length === 0) {
        throw new Error('Order ID tidak valid atau bukan milik user ini');
    }
    if (orderRows[0].pembayaran === 'Lunas') {
        throw new Error('Order ini sudah dibayar sebelumnya');
    }

    // Update status pembayaran
    await conn.execute(
        'UPDATE orders SET pembayaran = ?, transaction_id = ? WHERE order_id = ?',
        ['Lunas', transaction_id, order_id]
    );

    // Hitung fee breakdown
    const ongkirAsli = parsedNominal / 1.03;
    const feeLayanan = parsedNominal - ongkirAsli;
    const feeBank = ongkirAsli * 0.01;

    // Catat transaksi
    await conn.execute(
        'INSERT INTO transactions (transaction_id, order_id, user_id, amount, fee_layanan, fee_bank, total) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [transaction_id, order_id, user_id, ongkirAsli, feeLayanan, feeBank, parsedNominal]
    );

    return { ongkirAsli, feeLayanan, total: parsedNominal };
}

module.exports = {
    processPaymentWithFallback,
    savePaymentTransaction
};
