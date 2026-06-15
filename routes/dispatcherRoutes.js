const express = require('express');
const router = express.Router();
const verifyDispatcher = require('../middleware/verifyDispatcher');
const dispatcherController = require('../controllers/dispatcherController');

// Semua routes dilindungi oleh verifyDispatcher
router.use(verifyDispatcher);

router.get('/shipments', dispatcherController.getShipments);
router.get('/stats', dispatcherController.getStats);
router.get('/couriers', dispatcherController.getCouriers);
router.post('/assign', dispatcherController.assignCourier);

module.exports = router;
