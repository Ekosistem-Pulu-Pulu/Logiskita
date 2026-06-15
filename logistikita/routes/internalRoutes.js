// Routes: Dashboard Admin Internal
// Login: public, sisanya dilindungi middleware verifyAdmin
const express = require('express');
const router = express.Router();
const verifyAdmin = require('../middleware/verifyAdmin');
const partnerController = require('../controllers/partnerController');

// Login Admin (public - tidak perlu token)
router.post('/login', partnerController.loginAdmin);

// === Route di bawah ini memerlukan token admin ===

// Dashboard Stats
router.get('/dashboard-stats', verifyAdmin, partnerController.getDashboardStats);

// Kelola Mitra Bisnis
router.post('/partners', verifyAdmin, partnerController.registerPartner);
router.get('/partners', verifyAdmin, partnerController.getAllPartners);

// Kelola Shipments (Admin Utama)
router.get('/shipments', verifyAdmin, partnerController.getAllShipments);
router.post('/shipments/update-status', verifyAdmin, partnerController.updateShipmentStatus);

// === Route Khusus Branch Admin ===
const branchController = require('../controllers/branchController');
const verifyBranchAdmin = require('../middleware/verifyBranchAdmin');
router.get('/branches/dashboard', verifyBranchAdmin, branchController.getDashboardStats);
router.get('/branches/shipments', verifyBranchAdmin, branchController.getBranchShipments);
router.get('/branches/couriers', verifyBranchAdmin, branchController.getCouriers);
router.get('/branches/dispatchers', verifyBranchAdmin, branchController.getDispatchers);
router.get('/branches/activity', verifyBranchAdmin, branchController.getBranchActivity);
router.post('/branches/scan', verifyBranchAdmin, branchController.scanPackage);

// Branch Admin: Kurir Approval
router.get('/branches/pending-couriers', verifyBranchAdmin, branchController.getPendingCouriers);
router.post('/branches/approve-courier', verifyBranchAdmin, branchController.approveCourier);
router.post('/branches/reject-courier', verifyBranchAdmin, branchController.rejectCourier);

// Branch Admin: Confirm receive & live tracking
router.post('/branches/confirm-receive', verifyBranchAdmin, branchController.confirmReceivePackage);
router.get('/branches/live-tracking', verifyBranchAdmin, branchController.getLiveTracking);
router.get('/branches/incoming', verifyBranchAdmin, branchController.getIncomingPackages);
router.get('/branches/all-branches', verifyBranchAdmin, branchController.getAllBranches);
router.get('/branches/lookup-resi', verifyBranchAdmin, branchController.lookupResi);

// Branch Admin: Courier monitoring
router.get('/branches/courier-tasks/:id', verifyBranchAdmin, branchController.getCourierTasks);
router.get('/branches/courier-history/:id', verifyBranchAdmin, branchController.getCourierHistory);

// === Route Khusus Kurir ===
const kurirController = require('../controllers/kurirController');
const verifyKurir = require('../middleware/verifyKurir');

router.get('/kurir/dashboard', verifyKurir, kurirController.getKurirDashboard);
router.get('/kurir/available', verifyKurir, kurirController.getAvailableShipments);
router.get('/kurir/mine', verifyKurir, kurirController.getMyShipments);
router.get('/kurir/transit', verifyKurir, kurirController.getTransitTasks);
router.get('/kurir/history', verifyKurir, kurirController.getHistory);
router.get('/kurir/optimize', verifyKurir, kurirController.optimizeRoute);
router.get('/kurir/branch-info', verifyKurir, kurirController.getBranchInfo);
router.post('/kurir/take', verifyKurir, kurirController.takeShipment);
router.post('/kurir/start-transit', verifyKurir, kurirController.startTransit);
router.post('/kurir/arrive-branch', verifyKurir, kurirController.arriveAtBranch);
router.post('/kurir/deliver', verifyKurir, kurirController.markDelivered);
router.post('/kurir/update-status', verifyKurir, require('../controllers/partnerController').updateShipmentStatus);
router.get('/kurir/transit-legs/:awb', verifyKurir, kurirController.getTransitLegs);

// === Route Khusus Superadmin ===
const verifySuperadmin = require('../middleware/verifySuperadmin');
const internalUserController = require('../controllers/internalUserController');

// Kelola Internal Users
router.get('/users', verifySuperadmin, internalUserController.getAllUsers);
router.post('/users', verifySuperadmin, internalUserController.createUser);
router.delete('/users/:id', verifySuperadmin, internalUserController.deleteUser);

module.exports = router;
