const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

const ADMIN_TOKEN = 'logistikita-admin-token';

function validateAdminToken(req, res, next) {
    const token = req.headers['x-admin-token'];
    if (!token || token !== ADMIN_TOKEN) {
        return res.status(401).json({ status: 'Error', message: 'Unauthorized admin access' });
    }
    next();
}

router.post('/login', adminController.login);
router.get('/orders', validateAdminToken, adminController.getOrders);
router.post('/update_status', validateAdminToken, adminController.updateStatus);

module.exports = router;
