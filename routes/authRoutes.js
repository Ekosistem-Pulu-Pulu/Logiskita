const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const verifyAuth = require('../middleware/verifyAuth');

// Login untuk semua role
router.post('/login', authController.login);

// Register khusus Customer
router.post('/register', authController.registerCustomer);

// Register Kurir (perlu approval operator cabang)
router.post('/register-kurir', authController.registerKurir);

// List cabang aktif (public, untuk form registrasi kurir)
router.get('/branches', authController.getActiveBranches);

// Get Profile (harus login)
router.get('/me', verifyAuth(), authController.getProfile);

module.exports = router;
