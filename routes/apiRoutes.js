// Routes: API Endpoint untuk Mitra Bisnis (Marketplace/Supplier)
// Semua route ini dilindungi oleh middleware verifyApiKey
const express = require('express');
const router = express.Router();
const verifyApiKey = require('../middleware/verifyApiKey');
const shipmentController = require('../controllers/shipmentController');
const rateController = require('../controllers/rateController');
const customerController = require('../controllers/customerController');
const apiLogMiddleware = require('../middleware/apiLogMiddleware');
const rateLimiter = require('../middleware/rateLimiter');
const marketplaceRoutes = require('./marketplaceRoutes');

// =====================================================
// MARKETPLACE API (Pure Shipping Provider Endpoints)
// =====================================================
router.use('/marketplace', verifyApiKey, apiLogMiddleware, rateLimiter, marketplaceRoutes);

// =====================================================
// PUBLIC ENDPOINTS (tanpa API Key — untuk Customer)
// =====================================================

/**
 * @swagger
 * /api/v1/rates/check:
 *   post:
 *     summary: Cek Ongkos Kirim (Publik)
 *     description: Mengecek ongkos kirim berdasarkan koordinat atau alamat tanpa memerlukan API Key.
 *     tags: [Rates]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               origin:
 *                 type: string
 *                 example: "Jakarta"
 *               destination:
 *                 type: string
 *                 example: "Bandung"
 *               weight:
 *                 type: number
 *                 example: 1
 *     responses:
 *       200:
 *         description: Berhasil mendapatkan harga ongkir
 *       400:
 *         description: Bad Request
 */
router.post('/rates/check', rateController.checkRates);

/**
 * @swagger
 * /api/v1/customer/shipments:
 *   post:
 *     summary: Buat Pengiriman Baru (Customer)
 *     description: Membuat resi (AWB) baru. Tidak memerlukan API Key.
 *     tags: [Shipments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               sender_name:
 *                 type: string
 *                 example: "Budi"
 *               sender_address:
 *                 type: string
 *                 example: "Jl. Sudirman No 1, Jakarta"
 *               sender_lat:
 *                 type: number
 *                 example: -6.200000
 *               sender_lng:
 *                 type: number
 *                 example: 106.816666
 *               sender_city:
 *                 type: string
 *                 example: "Jakarta"
 *               receiver_name:
 *                 type: string
 *                 example: "Agus"
 *               receiver_address:
 *                 type: string
 *                 example: "Jl. Asia Afrika No 2, Bandung"
 *               receiver_lat:
 *                 type: number
 *                 example: -6.917464
 *               receiver_lng:
 *                 type: number
 *                 example: 107.619123
 *               receiver_city:
 *                 type: string
 *                 example: "Bandung"
 *               weight:
 *                 type: number
 *                 example: 1
 *               rate_id:
 *                 type: integer
 *                 example: 1
 *               payment_method:
 *                 type: string
 *                 example: "bank_transfer"
 *     responses:
 *       201:
 *         description: Berhasil membuat pengiriman (resi AWB)
 *       400:
 *         description: Data tidak lengkap
 */
router.post('/customer/shipments', customerController.createShipment);

// Simulasi Pembayaran
router.post('/payments/pay', customerController.processPayment);

/**
 * @swagger
 * /api/v1/tracking/{resi}:
 *   get:
 *     summary: Lacak Pengiriman (Publik)
 *     description: Mendapatkan status dan riwayat pengiriman berdasarkan nomor resi (AWB). Tidak memerlukan API Key.
 *     tags: [Tracking]
 *     parameters:
 *       - in: path
 *         name: resi
 *         required: true
 *         schema:
 *           type: string
 *         description: Nomor resi pengiriman (contoh LSK-...)
 *     responses:
 *       200:
 *         description: Berhasil menemukan data pengiriman
 *       404:
 *         description: Resi tidak ditemukan
 */
router.get('/tracking/:resi', customerController.trackShipment);

// Aduan / Laporan Kendala (Customer)
router.post('/reports', customerController.createReport);

// Webhook Simulasi (status update)
router.post('/webhook/status-update', customerController.webhookStatusUpdate);

// =====================================================
// COMBINED PRACTICUM INTEGRATION ENDPOINTS
// =====================================================
const integrationController = require('../controllers/integrationController');

// Health Check & Integration connection test
router.get('/health', integrationController.healthCheck);
router.get('/integration-test', integrationController.integrationTest);

// Rate calculations (GET & POST)
router.get('/rates', integrationController.checkRatesExternal);
router.post('/rates', integrationController.checkRatesExternal);

// External shipment creation and tracking
router.post('/create-shipment', integrationController.createShipmentExternal);
router.get('/tracking/:resi', integrationController.trackShipmentExternal);

// Webhooks
router.post('/webhook/payment-success', integrationController.paymentSuccessWebhook);
router.post('/webhook/payment-failed', integrationController.paymentFailedWebhook);
router.post('/webhook/shipment-status', integrationController.webhookShipmentStatus);

// Integration status polling & initialization
router.get('/integration-status/:transactionId', integrationController.getIntegrationStatus);
router.post('/payments/gateway-initiate', integrationController.initiateGatewayPayment);

// =====================================================
// MITRA ENDPOINTS (dilindungi API Key)
// =====================================================

// Cek Ongkir (legacy — kota-based)
router.post('/rates', verifyApiKey, shipmentController.checkRates);

/**
 * @swagger
 * /api/v1/shipments:
 *   post:
 *     summary: Buat Pengiriman Baru (Mitra B2B)
 *     description: Endpoint khusus untuk Mitra Bisnis (Marketplace). **Wajib menggunakan API Key**.
 *     tags: [Shipments B2B]
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               external_order_id:
 *                 type: string
 *                 example: "ORD-12345"
 *               sender_name:
 *                 type: string
 *                 example: "Toko Serba Ada"
 *               sender_address:
 *                 type: string
 *                 example: "Jl. Sudirman No 1, Jakarta"
 *               sender_lat:
 *                 type: number
 *                 example: -6.200000
 *               sender_lng:
 *                 type: number
 *                 example: 106.816666
 *               sender_city:
 *                 type: string
 *                 example: "Jakarta Pusat"
 *               receiver_name:
 *                 type: string
 *                 example: "Pembeli A"
 *               receiver_address:
 *                 type: string
 *                 example: "Jl. Asia Afrika No 2, Bandung"
 *               receiver_lat:
 *                 type: number
 *                 example: -6.917464
 *               receiver_lng:
 *                 type: number
 *                 example: 107.619123
 *               receiver_city:
 *                 type: string
 *                 example: "Bandung"
 *               weight:
 *                 type: number
 *                 example: 1
 *               rate_id:
 *                 type: integer
 *                 example: 1
 *               payment_method:
 *                 type: string
 *                 example: "api_gateway"
 *     responses:
 *       201:
 *         description: Berhasil membuat pengiriman (resi AWB)
 *       401:
 *         description: API Key tidak valid / tidak disertakan
 */
router.post('/shipments', verifyApiKey, shipmentController.createShipment);

// Ambil Riwayat Pengiriman
router.get('/shipments', verifyApiKey, shipmentController.getAllShipments);

// Tracking Resi (milik mitra)
router.get('/shipments/:awb', verifyApiKey, shipmentController.trackShipment);

module.exports = router;
