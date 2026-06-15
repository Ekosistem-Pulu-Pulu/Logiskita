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

// Cek Ongkir (berbasis koordinat + jarak Haversine)
router.post('/rates/check', rateController.checkRates);

// Buat Shipment (Customer langsung)
router.post('/customer/shipments', customerController.createShipment);

// Simulasi Pembayaran
router.post('/payments/pay', customerController.processPayment);

// Tracking Publik (tanpa login)
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

// Buat Pengiriman (Create Resi)
router.post('/shipments', verifyApiKey, shipmentController.createShipment);

// Ambil Riwayat Pengiriman
router.get('/shipments', verifyApiKey, shipmentController.getAllShipments);

// Tracking Resi (milik mitra)
router.get('/shipments/:awb', verifyApiKey, shipmentController.trackShipment);

module.exports = router;
