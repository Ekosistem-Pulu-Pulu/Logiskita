// Controller: Kurir Management (Diakses oleh Kurir via Dashboard)
// Upgraded: Branch-scoped tasks, transit antar cabang, arrive-at-branch
const db = require('../db');
const axios = require('axios');
const webhookService = require('../services/webhookService');
const transitService = require('../services/transitService');

// ============================================================
// GET /internal/kurir/available - Paket yang bisa diambil di cabang kurir
// UPGRADED: Hanya tampilkan paket di cabang kurir sendiri
// ============================================================
exports.getAvailableShipments = async (req, res) => {
    const kurirBranchId = req.user.branch_id;
    try {
        const [rows] = await db.execute(
            `SELECT s.awb_number, s.sender_name, s.sender_address, s.sender_city, s.sender_phone,
                    s.receiver_name, s.receiver_address, s.receiver_city, s.weight, 
                    s.service_type, s.status, s.created_at, s.order_source, p.nama_mitra,
                    ob.name AS origin_branch_name, ob.city AS origin_city,
                    db2.name AS dest_branch_name, db2.city AS dest_city
             FROM shipments s
             LEFT JOIN partners p ON s.partner_id = p.id
             LEFT JOIN branches ob ON s.origin_branch_id = ob.id
             LEFT JOIN branches db2 ON s.destination_branch_id = db2.id
             WHERE s.current_branch_id = ? 
               AND s.assigned_kurir_id IS NULL
               AND s.status IN ('Pending', 'Arrived at Branch', 'Arrived at Destination Branch')
             ORDER BY s.created_at ASC`,
            [kurirBranchId]
        );
        res.json({ status: 'Success', data: rows });
    } catch (error) {
        console.error('[Get Available Shipments Error]', error);
        res.status(500).json({ status: 'Error', message: 'Gagal mengambil data paket tersedia' });
    }
};

// ============================================================
// GET /internal/kurir/mine - Tugas saya (aktif)
// UPGRADED: Tambah info cabang transit dan leg perjalanan
// ============================================================
exports.getMyShipments = async (req, res) => {
    const kurirId = req.user.id;
    try {
        const [rows] = await db.execute(
            `SELECT s.awb_number, s.sender_name, s.sender_address, s.sender_city, s.sender_phone,
                    s.receiver_name, s.receiver_address, s.receiver_city, s.weight, 
                    s.service_type, s.status, s.created_at, s.updated_at, s.order_source, p.nama_mitra,
                    s.destination_branch_id,
                    ob.name AS origin_branch_name, ob.city AS origin_city,
                    db2.name AS dest_branch_name, db2.city AS dest_city,
                    cb.name AS current_branch_name, cb.city AS current_city
             FROM shipments s
             LEFT JOIN partners p ON s.partner_id = p.id
             LEFT JOIN branches ob ON s.origin_branch_id = ob.id
             LEFT JOIN branches db2 ON s.destination_branch_id = db2.id
             LEFT JOIN branches cb ON s.current_branch_id = cb.id
             WHERE s.assigned_kurir_id = ? AND s.status IN ('Picked Up', 'In Transit', 'Out For Delivery', 'Waiting Branch Confirmation', 'Arrived at Branch', 'Arrived at Destination Branch')
             ORDER BY s.updated_at DESC`,
            [kurirId]
        );
        res.json({ status: 'Success', data: rows });
    } catch (error) {
        console.error('[Get My Shipments Error]', error);
        res.status(500).json({ status: 'Error', message: 'Gagal mengambil data tugas Anda' });
    }
};

// ============================================================
// GET /internal/kurir/transit - Tugas transit antar cabang
// ============================================================
exports.getTransitTasks = async (req, res) => {
    const kurirId = req.user.id;
    try {
        const [rows] = await db.execute(
            `SELECT s.awb_number, s.sender_name, s.sender_address, s.sender_city, s.sender_phone,
                    s.receiver_name, s.receiver_address, s.receiver_city, s.weight, 
                    s.service_type, s.status, s.created_at, s.updated_at, s.order_source, p.nama_mitra,
                    ob.name AS origin_branch_name, ob.city AS origin_city,
                    db2.name AS dest_branch_name, db2.city AS dest_city,
                    cb.name AS current_branch_name, cb.city AS current_city
             FROM shipments s
             LEFT JOIN partners p ON s.partner_id = p.id
             LEFT JOIN branches ob ON s.origin_branch_id = ob.id
             LEFT JOIN branches db2 ON s.destination_branch_id = db2.id
             LEFT JOIN branches cb ON s.current_branch_id = cb.id
             WHERE s.assigned_kurir_id = ? AND s.status = 'In Transit'
             ORDER BY s.updated_at DESC`,
            [kurirId]
        );
        res.json({ status: 'Success', data: rows });
    } catch (error) {
        console.error('[Get Transit Tasks Error]', error);
        res.status(500).json({ status: 'Error', message: 'Gagal mengambil data tugas transit' });
    }
};

// ============================================================
// GET /internal/kurir/history - Histori pengiriman kurir
// ============================================================
exports.getHistory = async (req, res) => {
    const kurirId = req.user.id;
    try {
        const [rows] = await db.execute(
            `SELECT s.awb_number, s.sender_name, s.sender_address, s.sender_city, s.sender_phone,
                    s.receiver_name, s.receiver_address, s.receiver_city, s.weight, 
                    s.service_type, s.status, s.created_at, s.updated_at, s.order_source, p.nama_mitra,
                    ob.name AS origin_branch_name, ob.city AS origin_city,
                    db2.name AS dest_branch_name, db2.city AS dest_city
             FROM shipments s
             LEFT JOIN partners p ON s.partner_id = p.id
             LEFT JOIN branches ob ON s.origin_branch_id = ob.id
             LEFT JOIN branches db2 ON s.destination_branch_id = db2.id
             WHERE s.assigned_kurir_id = ? AND s.status IN ('Delivered','Failed')
             ORDER BY s.updated_at DESC LIMIT 30`,
            [kurirId]
        );
        res.json({ status: 'Success', data: rows });
    } catch (error) {
        res.status(500).json({ status: 'Error', message: 'Gagal mengambil histori' });
    }
};

// ============================================================
// GET /internal/kurir/optimize - Simulasi Optimasi Rute (Mock)
// ============================================================
exports.optimizeRoute = async (req, res) => {
    const kurirId = req.user.id;
    try {
        const [rows] = await db.execute(
            `SELECT s.awb_number, s.sender_name, s.sender_address, 
                    s.receiver_name, s.receiver_address, s.weight, 
                    s.service_type, s.status, s.created_at, p.nama_mitra
             FROM shipments s
             LEFT JOIN partners p ON s.partner_id = p.id
             WHERE s.assigned_kurir_id = ? AND s.status IN ('Picked Up', 'In Transit', 'Out For Delivery', 'Arrived at Destination Branch', 'Arrived at Branch')`,
            [kurirId]
        );
        
        const optimized = rows.sort((a, b) => {
            const valA = a.receiver_address.length + a.awb_number.charCodeAt(0);
            const valB = b.receiver_address.length + b.awb_number.charCodeAt(0);
            return valA - valB;
        });

        const optimizedData = optimized.map((item, index) => ({
            ...item,
            route_order: index + 1,
            est_distance: (Math.random() * 3 + 0.5).toFixed(1)
        }));

        res.json({ status: 'Success', message: 'Rute telah dioptimasi', data: optimizedData });
    } catch (error) {
        console.error('[Optimize Route Error]', error);
        res.status(500).json({ status: 'Error', message: 'Gagal melakukan optimasi rute' });
    }
};

// ============================================================
// POST /internal/kurir/take - Ambil Paket
// UPGRADED: Validasi kurir hanya bisa ambil paket di cabangnya
// ============================================================
exports.takeShipment = async (req, res) => {
    const kurirId = req.user.id;
    const kurirBranchId = req.user.branch_id;
    const { awb_number } = req.body;

    if (!awb_number) {
        return res.status(400).json({ status: 'Error', message: 'awb_number wajib diisi' });
    }

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const [check] = await connection.execute(
            'SELECT assigned_kurir_id, current_branch_id, destination_branch_id, final_branch_id, status FROM shipments WHERE awb_number = ? FOR UPDATE',
            [awb_number]
        );

        if (check.length === 0) {
            await connection.rollback();
            return res.status(404).json({ status: 'Error', message: 'Resi tidak ditemukan' });
        }

        const shipment = check[0];

        // Validasi paket ada di cabang kurir
        if (shipment.current_branch_id !== kurirBranchId) {
            await connection.rollback();
            return res.status(403).json({ status: 'Error', message: 'Paket ini tidak berada di cabang Anda' });
        }

        if (shipment.assigned_kurir_id !== null && shipment.assigned_kurir_id !== kurirId) {
            await connection.rollback();
            return res.status(409).json({ status: 'Error', message: 'Paket ini sudah diambil kurir lain' });
        }

        // Determine new status (Out For Delivery if we are at final destination branch)
        const finalBranch = shipment.final_branch_id || shipment.destination_branch_id;
        const isDestBranch = finalBranch === kurirBranchId;
        const newStatus = isDestBranch ? 'Out For Delivery' : 'Picked Up';
        const description = isDestBranch 
            ? 'Paket diambil kurir untuk delivery ke alamat tujuan'
            : 'Paket diambil kurir untuk transit ke cabang berikutnya';

        await connection.execute(
            'UPDATE shipments SET assigned_kurir_id = ?, status = ? WHERE awb_number = ?',
            [kurirId, newStatus, awb_number]
        );

        await connection.execute(
            'INSERT INTO tracking_logs (awb_number, status, description, branch_id, updated_by) VALUES (?, ?, ?, ?, ?)',
            [awb_number, newStatus, description, kurirBranchId, kurirId]
        );

        await connection.commit();
        triggerWebhook(awb_number, newStatus, description, null);

        res.json({ status: 'Success', message: `Paket berhasil diambil! Status: ${newStatus}` });
    } catch (error) {
        await connection.rollback();
        console.error('[Take Shipment Error]', error);
        res.status(500).json({ status: 'Error', message: 'Gagal mengambil paket' });
    } finally {
        connection.release();
    }
};

// ============================================================
// POST /internal/kurir/start-transit - Mulai transit ke cabang berikutnya
// ============================================================
exports.startTransit = async (req, res) => {
    const kurirId = req.user.id;
    const kurirBranchId = req.user.branch_id;
    const { awb_number } = req.body;

    if (!awb_number) return res.status(400).json({ status: 'Error', message: 'awb_number wajib diisi' });

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const [check] = await connection.execute(
            'SELECT * FROM shipments WHERE awb_number = ? AND assigned_kurir_id = ? FOR UPDATE',
            [awb_number, kurirId]
        );

        if (check.length === 0) {
            await connection.rollback();
            return res.status(404).json({ status: 'Error', message: 'Resi tidak ditemukan atau bukan tugas Anda' });
        }

        const shipment = check[0];
        const next_branch_id = shipment.destination_branch_id;

        // Get next branch info
        let nextBranchName = 'cabang tujuan';
        if (next_branch_id) {
            const [nb] = await connection.execute('SELECT name, city FROM branches WHERE id = ?', [next_branch_id]);
            if (nb.length > 0) nextBranchName = `${nb[0].name} (${nb[0].city})`;
        }

        // Update transit leg status
        const leg = await transitService.getNextLeg(shipment.id);
        if (leg) {
            await connection.execute(
                'UPDATE shipment_transit_legs SET status = "In Progress", started_at = CURRENT_TIMESTAMP, assigned_kurir_id = ? WHERE id = ?',
                [kurirId, leg.id]
            );
        }

        await connection.execute(
            'UPDATE shipments SET status = "In Transit" WHERE awb_number = ?',
            [awb_number]
        );

        await connection.execute(
            'INSERT INTO tracking_logs (awb_number, status, description, branch_id, updated_by) VALUES (?, ?, ?, ?, ?)',
            [awb_number, 'In Transit', `Paket sedang dibawa kurir menuju ${nextBranchName}`, kurirBranchId, kurirId]
        );

        await connection.commit();
        triggerWebhook(awb_number, 'In Transit', `Paket transit ke ${nextBranchName}`, null);
        res.json({ status: 'Success', message: `Paket berhasil dimulai transit ke ${nextBranchName}` });
    } catch (error) {
        await connection.rollback();
        console.error('[Start Transit Error]', error);
        res.status(500).json({ status: 'Error', message: 'Gagal memulai transit' });
    } finally {
        connection.release();
    }
};

// ============================================================
// POST /internal/kurir/arrive-branch - Konfirmasi tiba di cabang tujuan transit
// ============================================================
exports.arriveAtBranch = async (req, res) => {
    const kurirId = req.user.id;
    const { awb_number } = req.body;

    if (!awb_number) {
        return res.status(400).json({ status: 'Error', message: 'awb_number wajib diisi' });
    }

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const [check] = await connection.execute(
            'SELECT * FROM shipments WHERE awb_number = ? AND assigned_kurir_id = ? AND status = "In Transit" FOR UPDATE',
            [awb_number, kurirId]
        );

        if (check.length === 0) {
            await connection.rollback();
            return res.status(404).json({ status: 'Error', message: 'Resi tidak ditemukan atau bukan tugas transit Anda' });
        }

        const shipment = check[0];
        const branch_id = shipment.destination_branch_id;
        const newStatus = 'Waiting Branch Confirmation';

        // Get branch name
        const [branchInfo] = await connection.execute('SELECT name, city FROM branches WHERE id = ?', [branch_id]);
        const branchName = branchInfo.length > 0 ? `${branchInfo[0].name} (${branchInfo[0].city})` : 'cabang';

        const description = `Paket tiba di ${branchName}. Menunggu konfirmasi operator cabang.`;

        // Update shipment — paket MENUNGGU konfirmasi, kurir BELUM di-release
        await connection.execute(
            'UPDATE shipments SET status = ? WHERE awb_number = ?',
            [newStatus, awb_number]
        );

        await connection.execute(
            'INSERT INTO tracking_logs (awb_number, status, description, branch_id, updated_by) VALUES (?, ?, ?, ?, ?)',
            [awb_number, newStatus, description, branch_id, kurirId]
        );

        await connection.commit();
        triggerWebhook(awb_number, newStatus, description, branchName);

        // Determine if this is the final destination branch
        const finalBranch = shipment.final_branch_id || shipment.destination_branch_id;
        const isDestination = finalBranch === branch_id;

        res.json({
            status: 'Success',
            message: `Konfirmasi berhasil! Paket tiba di ${branchName}.`,
            data: { new_status: newStatus, is_final_destination: isDestination }
        });
    } catch (error) {
        await connection.rollback();
        console.error('[Arrive At Branch Error]', error);
        res.status(500).json({ status: 'Error', message: 'Gagal konfirmasi kedatangan' });
    } finally {
        connection.release();
    }
};

// ============================================================
// GET /internal/kurir/branch-info - Info cabang tempat kurir terdaftar
// ============================================================
exports.getBranchInfo = async (req, res) => {
    const branchId = req.user.branch_id;
    try {
        const [branch] = await db.execute('SELECT id, name, code, city, address FROM branches WHERE id = ?', [branchId]);
        if (branch.length === 0) {
            return res.status(404).json({ status: 'Error', message: 'Cabang tidak ditemukan' });
        }

        // Get list cabang lain untuk dropdown tujuan transit
        const [allBranches] = await db.execute(
            'SELECT id, name, code, city FROM branches WHERE status = "Active" AND id != ? ORDER BY city ASC',
            [branchId]
        );

        res.json({
            status: 'Success',
            data: {
                my_branch: branch[0],
                other_branches: allBranches
            }
        });
    } catch (error) {
        res.status(500).json({ status: 'Error', message: 'Gagal mengambil info cabang' });
    }
};

// ============================================================
// GET /internal/kurir/dashboard - Stats Dashboard Kurir
// ============================================================
exports.getKurirDashboard = async (req, res) => {
    const kurirId = req.user.id;
    const branchId = req.user.branch_id;
    try {
        const [stats] = await db.execute(
            `SELECT 
                SUM(CASE WHEN status IN ('Picked Up', 'Out For Delivery', 'Arrived at Destination Branch', 'Arrived at Branch', 'Waiting Branch Confirmation') THEN 1 ELSE 0 END) as active_tasks,
                SUM(CASE WHEN status = 'In Transit' THEN 1 ELSE 0 END) as transit_tasks,
                SUM(CASE WHEN status = 'Delivered' THEN 1 ELSE 0 END) as completed_tasks
             FROM shipments WHERE assigned_kurir_id = ?`,
            [kurirId]
        );

        // Get branch info
        const [branch] = await db.execute('SELECT name, city FROM branches WHERE id = ?', [branchId]);

        res.json({
            status: 'Success',
            data: {
                active_tasks: stats[0].active_tasks || 0,
                transit_tasks: stats[0].transit_tasks || 0,
                completed_tasks: stats[0].completed_tasks || 0,
                branch_name: branch.length > 0 ? branch[0].name : '-',
                branch_city: branch.length > 0 ? branch[0].city : '-'
            }
        });
    } catch (error) {
        res.status(500).json({ status: 'Error', message: 'Gagal mengambil stats kurir' });
    }
};

// ============================================================
// POST /internal/kurir/deliver - Upload Bukti & Selesai
// ============================================================
exports.markDelivered = async (req, res) => {
    const kurirId = req.user.id;
    const branchId = req.user.branch_id;
    const { awb_number, recipient_name, notes, photo_url } = req.body;

    if (!awb_number || !recipient_name) {
        return res.status(400).json({ status: 'Error', message: 'awb_number dan recipient_name wajib diisi' });
    }

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const [shipment] = await connection.execute('SELECT id FROM shipments WHERE awb_number = ? AND assigned_kurir_id = ? FOR UPDATE', [awb_number, kurirId]);
        if (shipment.length === 0) {
            await connection.rollback();
            return res.status(404).json({ status: 'Error', message: 'Shipment tidak ditemukan atau bukan tugas Anda' });
        }

        const shipmentId = shipment[0].id;

        await connection.execute(
            `INSERT INTO delivery_proofs (shipment_id, awb_number, kurir_id, recipient_name, notes, photo_url) VALUES (?, ?, ?, ?, ?, ?)`,
            [shipmentId, awb_number, kurirId, recipient_name, notes || null, photo_url || null]
        );

        await connection.execute('UPDATE shipments SET status = "Delivered", current_branch_id = ? WHERE awb_number = ?', [branchId, awb_number]);

        await connection.execute(
            'INSERT INTO tracking_logs (awb_number, status, description, branch_id, updated_by) VALUES (?, ?, ?, ?, ?)',
            [awb_number, 'Delivered', `Paket berhasil dikirim. Diterima oleh: ${recipient_name}`, branchId, kurirId]
        );

        await connection.commit();
        triggerWebhook(awb_number, 'Delivered', `Diterima oleh: ${recipient_name}`, null);
        res.json({ status: 'Success', message: 'Berhasil menyelesaikan pengiriman' });

    } catch (error) {
        await connection.rollback();
        console.error('[Mark Delivered Error]', error);
        res.status(500).json({ status: 'Error', message: 'Gagal menyelesaikan pengiriman' });
    } finally {
        connection.release();
    }
};

// Fungsi helper untuk webhook
async function triggerWebhook(awb_number, status, description, location) {
    try {
        const [shipments] = await db.execute(
            `SELECT id, partner_id, order_source FROM shipments WHERE awb_number = ?`,
            [awb_number]
        );
        
        if (shipments.length > 0 && shipments[0].order_source === 'Marketplace' && shipments[0].partner_id) {
            const shipment = shipments[0];
            const payload = {
                awb: awb_number,
                status: status,
                description: description,
                location: location,
                timestamp: new Date().toISOString()
            };
            
            webhookService.sendWebhook(shipment.partner_id, shipment.id, payload);
        }
    } catch (e) {
        console.error('[Webhook Helper Error]', e);
    }
}

// ============================================================
// GET /internal/kurir/transit-legs/:awb - Get transit legs for map
// ============================================================
exports.getTransitLegs = async (req, res) => {
    const { awb } = req.params;
    try {
        const legs = await transitService.getTransitRoute(awb);
        res.json({ status: 'Success', data: legs });
    } catch (error) {
        console.error('[Get Transit Legs Error]', error);
        res.status(500).json({ status: 'Error', message: 'Gagal mengambil data transit legs' });
    }
};
