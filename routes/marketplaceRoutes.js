const express = require('express');
const router = express.Router();
const marketplaceController = require('../controllers/marketplaceController');

// All routes here are protected by verifyApiKey, apiLogMiddleware, rateLimiter
// Mounted in apiRoutes.js as /api/v1/marketplace

router.post('/check-ongkir', marketplaceController.checkOngkir);
router.post('/create-shipment', marketplaceController.createShipment);
router.get('/tracking/:resi', marketplaceController.getTracking);
router.get('/shipments', marketplaceController.listShipments);
router.post('/shipments/:awb/cancel', marketplaceController.cancelShipment);

module.exports = router;
