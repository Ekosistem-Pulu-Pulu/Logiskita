const express = require('express');
const router = express.Router();
const logistikController = require('../controllers/logistikController');
const dashboardController = require('../controllers/dashboardController');

// === IPO Endpoints sesuai spesifikasi ===

// 1. Biaya Pengiriman (Hitung Ongkir)
//    Input: user_id, berat barang, koordinat asal/tujuan
//    Output: Status transaksi dan nilai tagihan (payment request)
router.post('/biaya_pengiriman', logistikController.biayaPengiriman);

// 2. Request Pengiriman (Menerima Pesanan)
//    Input: user_id dan detail paket
//    Output: Status sukses dan data hasil pendaftaran
router.post('/request_pengiriman', logistikController.requestPengiriman);

// 3. Pembayaran Logistik (Integrasi SmartBank)
//    Input: user_id dan detail tagihan ongkir
//    Output: Konfirmasi status pembayaran
router.post('/pembayaran_logistik', logistikController.pembayaranLogistik);

// 4. Biaya Layanan Logistik (Pemotongan Fee)
//    Input: user_id dan parameter biaya layanan
//    Output: Status dan data hasil pemotongan fee
router.post('/biaya_layanan_logistik', logistikController.biayaLayananLogistik);

// 5. Tracking Status (Update Pengiriman)
//    Input: user_id dan kode pelacakan unik
//    Output: Status terbaru keberadaan paket
router.post('/tracking_status', logistikController.trackingStatus);

// GET endpoints for order details
router.get('/order/:order_id', logistikController.getOrderDetail);
router.get('/request_pengiriman/:order_id', logistikController.getOrderDetail);

// Dashboard data
router.get('/dashboard', dashboardController.getDashboardData);

// Quick tracking (for landing page - no login required)
router.get('/quick_tracking/:awb_number', logistikController.quickTracking);

// Quick rate check (for landing page cek ongkir widget)
router.post('/cek_ongkir', logistikController.cekOngkir);

// 6. Bayar Ongkir Sekaligus (Grand Total — Microservices Architecture)
//    Input: order_id, user_id, nominal (grand total termasuk fee)
//    Proses: Forward payload ke API Gateway/Integrator kelompok lain
//    Output: Status pembayaran dari API Gateway
router.post('/bayar-ongkir', logistikController.bayarOngkir);

// 7. Riwayat Pembayaran (Transaction History)
//    Input: user_id via URL params
//    Output: Daftar semua transaksi SmartBank user beserta detail biaya
router.get('/transactions/:user_id', logistikController.getTransactionHistory);

// 8. Detail Satu Transaksi
//    Input: transaction_id via URL params
//    Output: Detail lengkap satu transaksi termasuk info order terkait
router.get('/transaction/:transaction_id', logistikController.getTransactionDetail);

module.exports = router;
