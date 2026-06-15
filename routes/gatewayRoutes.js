// Routes: Gateway Masuk (Halaman 1 - Form Cek Dashboard Pengiriman)
const express = require('express');
const router = express.Router();
const gatewayController = require('../controllers/gatewayController');

// POST /gateway/lookup - Submit SmartBank ID, dapatkan profil + riwayat
router.post('/lookup', gatewayController.lookupUMKM);

// GET /gateway/profiles - Lihat daftar ID tersedia (referensi dev)
router.get('/profiles', gatewayController.listProfiles);

module.exports = router;
