// Routes: Superadmin Panel
const express = require('express');
const router = express.Router();
const verifySuperadmin = require('../middleware/verifySuperadmin');
const sa = require('../controllers/superadminController');

// Login (public)
router.post('/login', sa.login);

// === Protected routes (Superadmin only) ===
router.get('/dashboard-stats', verifySuperadmin, sa.getDashboardStats);

// Manajemen Admin & Kurir
router.get('/admins', verifySuperadmin, sa.getAllAdmins);
router.post('/admins', verifySuperadmin, sa.createAdmin);
router.patch('/admins/:id/toggle', verifySuperadmin, sa.toggleAdminStatus);
router.delete('/admins/:id', verifySuperadmin, sa.deleteAdmin);
router.patch('/admins/:id/reset-password', verifySuperadmin, sa.resetPassword);

// Manajemen Partner Marketplace
router.get('/partners', verifySuperadmin, sa.getAllPartners);
router.post('/partners', verifySuperadmin, sa.createPartner);
router.patch('/partners/:id', verifySuperadmin, sa.updatePartner);
router.patch('/partners/:id/toggle', verifySuperadmin, sa.togglePartnerStatus);
router.get('/api-logs', verifySuperadmin, sa.getApiLogs);
router.get('/webhook-logs', verifySuperadmin, sa.getWebhookLogs);

// Laporan Transaksi Global
router.get('/transactions', verifySuperadmin, sa.getAllTransactions);

// Branches dan Aktivitas
router.get('/branches', verifySuperadmin, sa.getBranches);
router.get('/realtime-activity', verifySuperadmin, sa.getNationalActivity);

// Aduan & Laporan Pelanggan
router.get('/reports', verifySuperadmin, sa.getAllReports);
router.patch('/reports/:id', verifySuperadmin, sa.updateReportStatus);

module.exports = router;
