// ============================================================
// Branch Controller
// Mengelola Dashboard Cabang, Update Status Transit, Kurir, dan Approval
// ============================================================

const db = require('../db');
const transitService = require('../services/transitService');
const courierAssignmentService = require('../services/CourierAssignmentService');
const shipmentPresenter = require('../services/ShipmentPresenter');

// ============================================================
// GET /internal/branches/dashboard - Statistik Cabang
// ============================================================
exports.getDashboardStats = async (req, res) => {
    const branchId = req.admin.branch_id;
    if (!branchId) return res.status(403).json({ status: 'Error', message: 'Akses ditolak. Anda bukan Branch Admin.' });

    try {
        const [branchData] = await db.execute('SELECT *, name AS nama_cabang, city AS kota FROM branches WHERE id = ?', [branchId]);
        if (branchData.length === 0) return res.status(404).json({ status: 'Error', message: 'Cabang tidak ditemukan' });

        const [shipmentStats] = await db.execute(
            `SELECT 
                SUM(CASE WHEN current_branch_id = ? THEN 1 ELSE 0 END) as total_packages,
                SUM(CASE WHEN origin_branch_id = ? AND status = 'Pending' THEN 1 ELSE 0 END) as pending_packages,
                SUM(CASE WHEN current_branch_id = ? AND status = 'In Transit' THEN 1 ELSE 0 END) as transit_packages,
                SUM(CASE WHEN destination_branch_id = ? AND status IN ('Arrived at Destination Branch','Out For Delivery') THEN 1 ELSE 0 END) as ready_for_delivery,
                SUM(CASE WHEN current_branch_id = ? AND status = 'Arrived at Branch' THEN 1 ELSE 0 END) as arrived_packages,
                SUM(CASE WHEN destination_branch_id = ? AND status = 'Delivered' THEN 1 ELSE 0 END) as delivered_packages
             FROM shipments`,
            [branchId, branchId, branchId, branchId, branchId, branchId]
        );

        // Count active couriers
        const [courierStats] = await db.execute(
            `SELECT COUNT(*) as total_couriers FROM internal_users 
             WHERE branch_id = ? AND role = 'Kurir' AND is_active = 1 AND approval_status = 'approved'`,
            [branchId]
        );

        // Count pending kurir registrations
        const [pendingKurir] = await db.execute(
            `SELECT COUNT(*) as pending_registrations FROM kurir_registrations WHERE branch_id = ? AND status = 'pending'`,
            [branchId]
        );

        res.json({
            status: 'Success',
            data: {
                branch: branchData[0],
                stats: {
                    ...shipmentStats[0],
                    total_couriers: courierStats[0].total_couriers || 0,
                    pending_registrations: pendingKurir[0].pending_registrations || 0
                }
            }
        });
    } catch (error) {
        console.error('[Branch Dashboard Error]', error);
        res.status(500).json({ status: 'Error', message: 'Gagal mengambil data cabang' });
    }
};

// ============================================================
// GET /internal/branches/shipments - Daftar Paket di Cabang
// ============================================================
exports.getBranchShipments = async (req, res) => {
    const branchId = req.admin.branch_id;
    if (!branchId) return res.status(403).json({ status: 'Error', message: 'Akses ditolak.' });

    try {
        const [shipments] = await db.execute(
            `SELECT s.*, p.nama_mitra, iu.nama AS kurir_nama,
                    ob.name AS origin_branch_name, ob.city AS origin_city,
                    db2.name AS dest_branch_name, db2.city AS dest_city,
                    cb.name AS current_branch_name, cb.city AS current_city,
                    CONCAT(
                        ob.city, 
                        ' -> ', 
                        COALESCE(
                            (SELECT GROUP_CONCAT(b_leg.city ORDER BY stl.leg_order ASC SEPARATOR ' -> ')
                             FROM shipment_transit_legs stl
                             JOIN branches b_leg ON stl.to_branch_id = b_leg.id
                             WHERE stl.shipment_id = s.id),
                            db2.city
                        )
                    ) AS transit_route
             FROM shipments s 
             LEFT JOIN partners p ON s.partner_id = p.id 
             LEFT JOIN internal_users iu ON s.assigned_kurir_id = iu.id
             LEFT JOIN branches ob ON s.origin_branch_id = ob.id
             LEFT JOIN branches db2 ON s.destination_branch_id = db2.id
             LEFT JOIN branches cb ON s.current_branch_id = cb.id
             WHERE s.current_branch_id = ? OR s.origin_branch_id = ? OR s.destination_branch_id = ?
             ORDER BY s.updated_at DESC`,
            [branchId, branchId, branchId]
        );

        res.json({ status: 'Success', data: shipments });
    } catch (error) {
        console.error('[Branch Shipments Error]', error);
        res.status(500).json({ status: 'Error', message: 'Gagal mengambil data paket cabang' });
    }
};

// ============================================================
// POST /internal/branches/scan - Scan Paket & Update Transit
// ============================================================
exports.scanPackage = async (req, res) => {
    const branchId = req.admin.branch_id;
    const adminId = req.admin.id;
    const { awb_number, new_status, next_branch_id, courier_id } = req.body;

    if (!branchId) return res.status(403).json({ status: 'Error', message: 'Akses ditolak.' });
    if (!awb_number || !new_status) return res.status(400).json({ status: 'Error', message: 'awb_number dan new_status wajib diisi.' });

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // Cari shipment
        const [shipmentRows] = await connection.execute('SELECT * FROM shipments WHERE awb_number = ?', [awb_number]);
        if (shipmentRows.length === 0) {
            await connection.rollback();
            return res.status(404).json({ status: 'Error', message: 'Resi tidak ditemukan.' });
        }

        let updateQuery = 'UPDATE shipments SET status = ?';
        let updateParams = [new_status];
        let description = `Paket di-scan di cabang dengan status ${new_status}`;

        if (new_status === 'Arrived at Branch' || new_status === 'Arrived at Destination Branch') {
            updateQuery += ', current_branch_id = ?';
            updateParams.push(branchId);
            description = `Paket tiba dan diterima di cabang.`;
        } else if (new_status === 'In Transit') {
            if (next_branch_id) {
                // current_branch_id tetap di cabang saat ini sampai paket diterima di cabang tujuan
                description = `Paket dikirim transit menuju cabang berikutnya.`;
            }
        } else if (new_status === 'Out For Delivery') {
            if (courier_id) {
                updateQuery += ', assigned_kurir_id = ?';
                updateParams.push(courier_id);
                description = `Paket dibawa oleh kurir menuju alamat tujuan.`;
            }
        }

        updateQuery += ' WHERE awb_number = ?';
        updateParams.push(awb_number);

        await connection.execute(updateQuery, updateParams);

        // Insert Tracking Log
        await connection.execute(
            'INSERT INTO tracking_logs (awb_number, status, description, branch_id, updated_by) VALUES (?, ?, ?, ?, ?)',
            [awb_number, new_status, description, branchId, adminId]
        );

        await connection.commit();
        res.json({ status: 'Success', message: `Status resi ${awb_number} diupdate menjadi ${new_status}` });
    } catch (error) {
        await connection.rollback();
        console.error('[Scan Package Error]', error);
        res.status(500).json({ status: 'Error', message: 'Gagal update status paket.' });
    } finally {
        connection.release();
    }
};

// ============================================================
// POST /internal/branches/confirm-receive - Konfirmasi Penerimaan Paket
// Saat operator cabang tujuan confirm, tugas auto berpindah ke kurir cabang ini
// ============================================================
exports.confirmReceivePackage = async (req, res) => {
    const branchId = req.admin.branch_id;
    const adminId = req.admin.id;
    const { awb_number } = req.body;

    if (!awb_number) return res.status(400).json({ status: 'Error', message: 'awb_number wajib diisi' });

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const [shipment] = await connection.execute('SELECT * FROM shipments WHERE awb_number = ? FOR UPDATE', [awb_number]);
        if (shipment.length === 0) {
            await connection.rollback();
            return res.status(404).json({ status: 'Error', message: 'Resi tidak ditemukan' });
        }

        const ship = shipment[0];
        
        if (ship.status !== 'Waiting Branch Confirmation') {
            await connection.rollback();
            return res.status(400).json({ status: 'Error', message: 'Paket ini tidak dalam status menunggu konfirmasi.' });
        }

        // Complete the current leg
        const [currentLegs] = await connection.execute(
            'SELECT id FROM shipment_transit_legs WHERE shipment_id = ? AND to_branch_id = ? AND status != "Completed" LIMIT 1',
            [ship.id, branchId]
        );
        if (currentLegs.length > 0) {
            await connection.execute(
                'UPDATE shipment_transit_legs SET status = "Completed", completed_at = CURRENT_TIMESTAMP WHERE id = ?',
                [currentLegs[0].id]
            );
        }

        // Delegasi penentuan status dan kurir ke CourierAssignmentService
        const receiveResult = await courierAssignmentService.determineReceiveAction(
            ship, branchId, transitService, connection
        );

        const { newStatus, description, assignedKurir, nextBranchId, isDestinationBranch } = receiveResult;

        // Update shipment
        await connection.execute(
            'UPDATE shipments SET status = ?, current_branch_id = ?, destination_branch_id = ?, assigned_kurir_id = ? WHERE awb_number = ?',
            [newStatus, branchId, nextBranchId, assignedKurir, awb_number]
        );

        // Insert tracking log
        await connection.execute(
            'INSERT INTO tracking_logs (awb_number, status, description, branch_id, updated_by) VALUES (?, ?, ?, ?, ?)',
            [awb_number, newStatus, description, branchId, adminId]
        );

        await connection.commit();
        res.json({
            status: 'Success',
            message: `Paket ${awb_number} berhasil dikonfirmasi masuk.`,
            data: {
                new_status: newStatus,
                is_final_destination: isDestinationBranch,
                assigned_kurir_id: assignedKurir
            }
        });
    } catch (error) {
        await connection.rollback();
        console.error('[Confirm Receive Error]', error);
        res.status(500).json({ status: 'Error', message: 'Gagal konfirmasi penerimaan paket' });
    } finally {
        connection.release();
    }
};

// ============================================================
// GET /internal/branches/couriers - Daftar Kurir di Cabang (+ workload)
// ============================================================
exports.getCouriers = async (req, res) => {
    const branchId = req.admin.branch_id;
    try {
        const [rows] = await db.execute(
            `SELECT iu.id, iu.email, iu.nama, iu.phone, iu.is_active, iu.approval_status,
                (SELECT COUNT(*) FROM shipments s WHERE s.assigned_kurir_id = iu.id AND s.status IN ('Picked Up','In Transit','Out For Delivery','Arrived at Destination Branch','Arrived at Branch')) as active_tasks,
                (SELECT COUNT(*) FROM shipments s WHERE s.assigned_kurir_id = iu.id AND s.status = 'Delivered') as completed_tasks	
             FROM internal_users iu
             WHERE iu.branch_id = ? AND iu.role = 'Kurir' AND iu.approval_status = 'approved'
             ORDER BY iu.nama ASC`,
            [branchId]
        );
        res.json({ status: 'Success', data: rows });
    } catch (error) {
        res.status(500).json({ status: 'Error', message: 'Gagal mengambil data kurir cabang' });
    }
};

// ============================================================
// GET /internal/branches/courier-tasks/:id - Tugas aktif kurir tertentu
// ============================================================
exports.getCourierTasks = async (req, res) => {
    const branchId = req.admin.branch_id;
    const kurirId = req.params.id;
    try {
        const [rows] = await db.execute(
            `SELECT s.awb_number, s.receiver_name, s.receiver_address, s.status, s.service_type, s.weight, s.updated_at,
                    ob.city AS origin_city, db2.city AS dest_city
             FROM shipments s
             LEFT JOIN branches ob ON s.origin_branch_id = ob.id
             LEFT JOIN branches db2 ON s.destination_branch_id = db2.id
             WHERE s.assigned_kurir_id = ? AND s.status IN ('Picked Up','In Transit','Out For Delivery','Arrived at Branch','Arrived at Destination Branch')	
             ORDER BY s.updated_at DESC`,
            [kurirId]
        );
        res.json({ status: 'Success', data: rows });
    } catch (error) {
        res.status(500).json({ status: 'Error', message: 'Gagal mengambil tugas kurir' });
    }
};

// ============================================================
// GET /internal/branches/courier-history/:id - Histori pengiriman kurir
// ============================================================
exports.getCourierHistory = async (req, res) => {
    const kurirId = req.params.id;
    try {
        const [rows] = await db.execute(
            `SELECT s.awb_number, s.receiver_name, s.receiver_address, s.status, s.service_type, s.weight, s.updated_at,
                    dp.recipient_name AS proof_recipient, dp.created_at AS delivered_at
             FROM shipments s
             LEFT JOIN delivery_proofs dp ON dp.awb_number = s.awb_number
             WHERE s.assigned_kurir_id = ? AND s.status IN ('Delivered','Failed')
             ORDER BY s.updated_at DESC LIMIT 20`,
            [kurirId]
        );
        res.json({ status: 'Success', data: rows });
    } catch (error) {
        res.status(500).json({ status: 'Error', message: 'Gagal mengambil histori kurir' });
    }
};

// ============================================================
// GET /internal/branches/pending-couriers - List kurir menunggu approval
// ============================================================
exports.getPendingCouriers = async (req, res) => {
    const branchId = req.admin.branch_id;
    try {
        const [rows] = await db.execute(
            `SELECT kr.*, b.name AS branch_name, b.city AS branch_city 
             FROM kurir_registrations kr
             LEFT JOIN branches b ON kr.branch_id = b.id
             WHERE kr.branch_id = ? AND kr.status = 'pending'
             ORDER BY kr.created_at DESC`,
            [branchId]
        );
        res.json({ status: 'Success', data: rows });
    } catch (error) {
        console.error('[Pending Couriers Error]', error);
        res.status(500).json({ status: 'Error', message: 'Gagal mengambil data pendaftaran kurir' });
    }
};

// ============================================================
// POST /internal/branches/approve-courier - Approve registrasi kurir
// ============================================================
exports.approveCourier = async (req, res) => {
    const branchId = req.admin.branch_id;
    const adminId = req.admin.id;
    const { registration_id } = req.body;

    if (!registration_id) return res.status(400).json({ status: 'Error', message: 'registration_id wajib diisi' });

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // Get registration data
        const [reg] = await connection.execute(
            'SELECT * FROM kurir_registrations WHERE id = ? AND branch_id = ? AND status = "pending" FOR UPDATE',
            [registration_id, branchId]
        );
        if (reg.length === 0) {
            await connection.rollback();
            return res.status(404).json({ status: 'Error', message: 'Pendaftaran tidak ditemukan atau sudah diproses' });
        }

        const regData = reg[0];
        const crypto = require('crypto');
        const token = 'token_kurir_' + crypto.randomBytes(16).toString('hex');

        // Insert ke internal_users sebagai Kurir aktif
        await connection.execute(
            `INSERT INTO internal_users (email, password, nama, phone, role, branch_id, token, is_active, approval_status) 
             VALUES (?, ?, ?, ?, 'Kurir', ?, ?, 1, 'approved')`,
            [regData.email, regData.password, regData.nama, regData.phone, branchId, token]
        );

        // Update registration status
        await connection.execute(
            'UPDATE kurir_registrations SET status = "approved", reviewed_by = ?, reviewed_at = NOW() WHERE id = ?',
            [adminId, registration_id]
        );

        // Update branch active_couriers count
        await connection.execute(
            'UPDATE branches SET active_couriers = (SELECT COUNT(*) FROM internal_users WHERE branch_id = ? AND role = "Kurir" AND is_active = 1) WHERE id = ?',
            [branchId, branchId]
        );

        await connection.commit();
        res.json({
            status: 'Success',
            message: `Kurir ${regData.nama} berhasil disetujui dan terdaftar di cabang!`
        });
    } catch (error) {
        await connection.rollback();
        console.error('[Approve Courier Error]', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ status: 'Error', message: 'Email kurir sudah terdaftar di sistem' });
        }
        res.status(500).json({ status: 'Error', message: 'Gagal menyetujui pendaftaran kurir' });
    } finally {
        connection.release();
    }
};

// ============================================================
// POST /internal/branches/reject-courier - Reject registrasi kurir
// ============================================================
exports.rejectCourier = async (req, res) => {
    const branchId = req.admin.branch_id;
    const adminId = req.admin.id;
    const { registration_id } = req.body;

    if (!registration_id) return res.status(400).json({ status: 'Error', message: 'registration_id wajib diisi' });

    try {
        const [result] = await db.execute(
            'UPDATE kurir_registrations SET status = "rejected", reviewed_by = ?, reviewed_at = NOW() WHERE id = ? AND branch_id = ? AND status = "pending"',
            [adminId, registration_id, branchId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ status: 'Error', message: 'Pendaftaran tidak ditemukan atau sudah diproses' });
        }

        res.json({ status: 'Success', message: 'Pendaftaran kurir berhasil ditolak' });
    } catch (error) {
        console.error('[Reject Courier Error]', error);
        res.status(500).json({ status: 'Error', message: 'Gagal menolak pendaftaran kurir' });
    }
};

// ============================================================
// GET /internal/branches/live-tracking - Live tracking paket di/menuju cabang
// ============================================================
exports.getLiveTracking = async (req, res) => {
    const branchId = req.admin.branch_id;
    try {
        const [packages] = await db.execute(
            `SELECT s.awb_number, s.status, s.sender_name, s.receiver_name, s.receiver_address,
                    s.service_type, s.weight, s.updated_at,
                    ob.name AS origin_branch_name, ob.city AS origin_city,
                    db2.name AS dest_branch_name, db2.city AS dest_city,
                    cb.name AS current_branch_name, cb.city AS current_city,
                    iu.nama AS kurir_nama
             FROM shipments s
             LEFT JOIN branches ob ON s.origin_branch_id = ob.id
             LEFT JOIN branches db2 ON s.destination_branch_id = db2.id
             LEFT JOIN branches cb ON s.current_branch_id = cb.id
             LEFT JOIN internal_users iu ON s.assigned_kurir_id = iu.id
             WHERE s.status NOT IN ('Delivered','Failed')
               AND (s.current_branch_id = ? OR s.origin_branch_id = ? OR s.destination_branch_id = ?)
             ORDER BY s.updated_at DESC`,
            [branchId, branchId, branchId]
        );

        res.json({ status: 'Success', data: packages });
    } catch (error) {
        console.error('[Live Tracking Error]', error);
        res.status(500).json({ status: 'Error', message: 'Gagal mengambil data live tracking' });
    }
};

// ============================================================
// GET /internal/branches/incoming - Paket yang sedang menuju cabang ini
// ============================================================
exports.getIncomingPackages = async (req, res) => {
    const branchId = req.admin.branch_id;
    try {
        const [packages] = await db.execute(
            `SELECT s.awb_number, s.status, s.sender_name, s.receiver_name, s.service_type, s.weight, s.updated_at,
                    ob.name AS origin_branch_name, ob.city AS origin_city,
                    iu.nama AS kurir_nama
             FROM shipments s
             LEFT JOIN branches ob ON s.origin_branch_id = ob.id
             LEFT JOIN internal_users iu ON s.assigned_kurir_id = iu.id
             WHERE s.status = 'Waiting Branch Confirmation' 
               AND s.destination_branch_id = ?
             ORDER BY s.updated_at DESC`,
            [branchId]
        );

        res.json({ status: 'Success', data: packages });
    } catch (error) {
        res.status(500).json({ status: 'Error', message: 'Gagal mengambil data paket masuk' });
    }
};

// ============================================================
// GET /internal/branches/dispatchers - Daftar Dispatcher di Cabang
// ============================================================
exports.getDispatchers = async (req, res) => {
    const branchId = req.admin.branch_id;
    try {
        const [rows] = await db.execute(
            `SELECT id, email, nama, phone, is_active FROM internal_users 
             WHERE branch_id = ? AND role = 'Dispatcher'`,
            [branchId]
        );
        res.json({ status: 'Success', data: rows });
    } catch (error) {
        res.status(500).json({ status: 'Error', message: 'Gagal mengambil data dispatcher cabang' });
    }
};

// ============================================================
// GET /internal/branches/activity - Aktivitas Terbaru Cabang
// ============================================================
exports.getBranchActivity = async (req, res) => {
    const branchId = req.admin.branch_id;
    try {
        const [rows] = await db.execute(
            `SELECT tl.status, tl.description, tl.created_at, iu.nama as updated_by_name, tl.awb_number
             FROM tracking_logs tl
             LEFT JOIN internal_users iu ON tl.updated_by = iu.id
             WHERE tl.branch_id = ?
             ORDER BY tl.created_at DESC
             LIMIT 20`,
            [branchId]
        );
        res.json({ status: 'Success', data: rows });
    } catch (error) {
        res.status(500).json({ status: 'Error', message: 'Gagal mengambil data aktivitas cabang' });
    }
};

// ============================================================
// GET /internal/branches/lookup-resi - Lookup resi + validasi cabang + allowed actions
// ============================================================
exports.lookupResi = async (req, res) => {
    const branchId = req.admin.branch_id;
    const { awb } = req.query;

    if (!awb || awb.trim().length < 3) {
        return res.status(400).json({ status: 'Error', message: 'Nomor resi wajib diisi (minimal 3 karakter).' });
    }

    try {
        // 1. Cari shipment dengan detail lengkap
        const [shipments] = await db.execute(
            `SELECT s.*,
                    ob.name AS origin_branch_name, ob.city AS origin_city,
                    db2.name AS dest_branch_name, db2.city AS dest_city,
                    cb.name AS current_branch_name, cb.city AS current_city,
                    fb.name AS final_branch_name, fb.city AS final_city,
                    iu.nama AS kurir_nama, iu.phone AS kurir_phone,
                    p.nama_mitra
             FROM shipments s
             LEFT JOIN branches ob ON s.origin_branch_id = ob.id
             LEFT JOIN branches db2 ON s.destination_branch_id = db2.id
             LEFT JOIN branches cb ON s.current_branch_id = cb.id
             LEFT JOIN branches fb ON s.final_branch_id = fb.id
             LEFT JOIN internal_users iu ON s.assigned_kurir_id = iu.id
             LEFT JOIN partners p ON s.partner_id = p.id
             WHERE s.awb_number = ?`,
            [awb.trim().toUpperCase()]
        );

        if (shipments.length === 0) {
            return res.status(404).json({ status: 'Error', message: `Resi "${awb.trim().toUpperCase()}" tidak ditemukan dalam sistem.` });
        }

        const ship = shipments[0];

        // 2. Validasi apakah paket terkait cabang operator
        const finalBranch = ship.final_branch_id || ship.destination_branch_id;
        const isRelated = (
            ship.origin_branch_id === branchId ||
            ship.destination_branch_id === branchId ||
            ship.current_branch_id === branchId ||
            finalBranch === branchId
        );

        // Also check if this branch is part of any transit leg
        let isInTransitRoute = false;
        const [legCheck] = await db.execute(
            `SELECT COUNT(*) as cnt FROM shipment_transit_legs
             WHERE shipment_id = ? AND (from_branch_id = ? OR to_branch_id = ?)`,
            [ship.id, branchId, branchId]
        );
        if (legCheck[0].cnt > 0) isInTransitRoute = true;

        if (!isRelated && !isInTransitRoute) {
            return res.status(403).json({
                status: 'Error',
                message: 'Paket ini tidak terkait dengan cabang Anda. Tidak dapat memproses.',
                data: {
                    awb_number: ship.awb_number,
                    origin_city: ship.origin_city || '-',
                    dest_city: ship.final_city || ship.dest_city || '-',
                    status: ship.status
                }
            });
        }

        // 3. Ambil transit legs lengkap
        const transitLegs = await transitService.getTransitRoute(ship.awb_number);

        // 4. Tentukan next leg
        const nextLeg = await transitService.getNextLeg(ship.id);

        // 5. Ambil tracking history
        const [trackingLogs] = await db.execute(
            `SELECT tl.status, tl.description, tl.created_at, iu.nama as updated_by_name, b.name as branch_name, b.city as branch_city
             FROM tracking_logs tl
             LEFT JOIN internal_users iu ON tl.updated_by = iu.id
             LEFT JOIN branches b ON tl.branch_id = b.id
             WHERE tl.awb_number = ?
             ORDER BY tl.created_at DESC`,
            [ship.awb_number]
        );

        // 6. Determine allowed actions via ShipmentPresenter

        const isFinalDestination = finalBranch === branchId;
        const isOriginBranch = ship.origin_branch_id === branchId;
        const isCurrentBranch = ship.current_branch_id === branchId;

        const branchContext = {
            is_origin: isOriginBranch,
            is_current: isCurrentBranch,
            is_final_destination: isFinalDestination,
            branchId: branchId,
            isOriginBranch, isCurrentBranch, isFinalDestination
        };

        const allowed_actions = shipmentPresenter.resolveAllowedActions(ship, branchContext);

        // 7. Get available couriers for this branch (needed for assign)
        const [couriers] = await db.execute(
            `SELECT id, nama, phone,
                (SELECT COUNT(*) FROM shipments s2 WHERE s2.assigned_kurir_id = iu2.id AND s2.status IN ('Out For Delivery','Picked Up','In Transit','Arrived at Destination Branch','Arrived at Branch')) as active_tasks	
             FROM internal_users iu2
             WHERE iu2.branch_id = ? AND iu2.role = 'Kurir' AND iu2.is_active = 1 AND iu2.approval_status = 'approved'
             ORDER BY active_tasks ASC, nama ASC`,
            [branchId]
        );

        // 8. Build next branch info
        let nextBranchInfo = null;
        if (nextLeg) {
            const [nbRows] = await db.execute('SELECT id, name, city FROM branches WHERE id = ?', [nextLeg.to_branch_id]);
            if (nbRows.length > 0) nextBranchInfo = nbRows[0];
        }

        // 9. Format response via ShipmentPresenter
        const responseData = shipmentPresenter.formatLookupResponse(ship, {
            transitLegs, trackingLogs, couriers, nextBranchInfo,
            branchContext,
            allowedActions: allowed_actions
        });

        res.json({
            status: 'Success',
            data: responseData
        });
    } catch (error) {
        console.error('[Lookup Resi Error]', error);
        res.status(500).json({ status: 'Error', message: 'Gagal mencari data resi.' });
    }
};

// ============================================================
// GET /internal/branches/all-branches - List semua cabang (untuk transit dropdown)
// ============================================================
exports.getAllBranches = async (req, res) => {
    try {
        const [rows] = await db.execute(
            `SELECT id, name, code, city, status FROM branches WHERE status = 'Active' ORDER BY city ASC`
        );
        res.json({ status: 'Success', data: rows });
    } catch (error) {
        res.status(500).json({ status: 'Error', message: 'Gagal mengambil data cabang' });
    }
};
