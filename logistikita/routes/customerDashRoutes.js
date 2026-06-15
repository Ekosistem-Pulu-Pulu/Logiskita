const express = require('express');
const router = express.Router();
const verifyCustomer = require('../middleware/verifyCustomer');
const customerDashController = require('../controllers/customerDashController');

// Semua routes dilindungi oleh verifyCustomer
router.use(verifyCustomer);

router.get('/shipments', customerDashController.getMyShipments);
router.post('/shipments', customerDashController.createShipment);
router.get('/shipments/:awb', customerDashController.trackShipment);
router.get('/stats', customerDashController.getStats);

module.exports = router;
