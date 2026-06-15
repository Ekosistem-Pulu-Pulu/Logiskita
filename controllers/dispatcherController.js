// Controller: Dispatcher (Cabang Ops)
// Mengelola routing paket ke kurir dan status di cabang
const db = require('../db');

// ============================================================
// GET /internal/dispatcher/shipments - Lihat paket cabang
// ============================================================
exports.getShipments = async (req, res) => {
    const branchId = req.user.branch_id;
    if (!branchId) return res.status(403).json({ status: 'Error', message: 'Anda tidak terikat pada cabang manapun' });

    try {
        const [rows] = await db.execute(
            `SELECT s.id, s.awb_number, s.sender_name, s.sender_address, 
                    s.receiver_name, s.receiver_address, s.weight, 
                    s.service_type, s.status, s.created_at, 
                    iu.nama as kurir_nama, iu.id as kurir_id
             FROM shipments s
             LEFT JOIN internal_users iu ON s.assigned_kurir_id = iu.id
             WHERE (s.current_branch_id = ? OR s.origin_branch_id = ? OR s.destination_branch_id = ?)
             ORDER BY 
                CASE 
                    WHEN s.status = 'Pending' THEN 1
                    WHEN s.status = 'Arrived at Destination Branch' THEN 2
                    WHEN s.status = 'Arrived at Branch' THEN 3
                    ELSE 4
                END, s.updated_at DESC
             LIMIT 100`,
            [branchId, branchId, branchId]
        );
        res.json({ status: 'Success', data: rows });
    } catch (error) {
        console.error('[Dispatcher Shipments Error]', error);
        res.status(500).json({ status: 'Error', message: 'Gagal mengambil data shipment cabang' });
    }
};

// ============================================================
// GET /internal/dispatcher/stats - Statistik Dispatcher
// ============================================================
exports.getStats = async (req, res) => {
    const branchId = req.user.branch_id;
    try {
        const [stats] = await db.execute(
            `SELECT 
                SUM(CASE WHEN status='Pending' THEN 1 ELSE 0 END) as incoming_pending,
                SUM(CASE WHEN status='Arrived at Destination Branch' THEN 1 ELSE 0 END) as ready_for_delivery,
                SUM(CASE WHEN status='Out For Delivery' THEN 1 ELSE 0 END) as out_for_delivery,
                SUM(CASE WHEN assigned_kurir_id IS NULL THEN 1 ELSE 0 END) as unassigned
             FROM shipments 
             WHERE current_branch_id = ?`,
            [branchId]
        );

        const [courierCount] = await db.execute(
            `SELECT COUNT(*) as count FROM internal_users WHERE role='Kurir' AND branch_id=? AND is_active=1`,
            [branchId]
        );

        res.json({
            status: 'Success',
            data: {
                ...stats[0],
                active_couriers: courierCount[0].count
            }
        });
    } catch (error) {
        console.error('[Dispatcher Stats Error]', error);
        res.status(500).json({ status: 'Error', message: 'Gagal mengambil statistik' });
    }
};

// ============================================================
// GET /internal/dispatcher/couriers - Daftar kurir cabang
// ============================================================
exports.getCouriers = async (req, res) => {
    const branchId = req.user.branch_id;
    try {
        const [rows] = await db.execute(
            `SELECT iu.id, iu.nama, iu.phone,
                (SELECT COUNT(*) FROM shipments WHERE assigned_kurir_id = iu.id AND status IN ('Picked Up', 'In Transit', 'Out For Delivery', 'Arrived at Branch', 'Arrived at Destination Branch')) as active_tasks
             FROM internal_users iu
             WHERE iu.role = 'Kurir' AND iu.branch_id = ? AND iu.is_active = 1`,
            [branchId]
        );
        res.json({ status: 'Success', data: rows });
    } catch (error) {
        console.error('[Dispatcher Couriers Error]', error);
        res.status(500).json({ status: 'Error', message: 'Gagal mengambil data kurir' });
    }
};

// ============================================================
// POST /internal/dispatcher/assign - Assign kurir ke paket
// ============================================================
exports.assignCourier = async (req, res) => {
    const branchId = req.user.branch_id;
    const { awb_number, kurir_id } = req.body;

    if (!awb_number || !kurir_id) {
        return res.status(400).json({ status: 'Error', message: 'awb_number dan kurir_id wajib diisi' });
    }

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // Verifikasi kurir ada di cabang ini
        const [kurirCheck] = await connection.execute(
            'SELECT id, nama FROM internal_users WHERE id = ? AND branch_id = ? AND role = "Kurir"',
            [kurir_id, branchId]
        );

        if (kurirCheck.length === 0) {
            await connection.rollback();
            return res.status(400).json({ status: 'Error', message: 'Kurir tidak valid atau tidak di cabang ini' });
        }

        const kurirName = kurirCheck[0].nama;

        // Cek shipment
        const [shipment] = await connection.execute(
            'SELECT * FROM shipments WHERE awb_number = ? AND current_branch_id = ? FOR UPDATE',
            [awb_number, branchId]
        );

        if (shipment.length === 0) {
            await connection.rollback();
            return res.status(404).json({ status: 'Error', message: 'Shipment tidak ditemukan di cabang ini' });
        }

        // Tentukan status berdasarkan status saat ini
        let newStatus = shipment[0].status;
        let logDescription = `Paket di-assign ke kurir ${kurirName}`;

        if (newStatus === 'Pending') {
            newStatus = 'Picked Up';
            logDescription = `Kurir ${kurirName} ditugaskan untuk pickup`;
        } else if (newStatus === 'Arrived at Destination Branch') {
            newStatus = 'Out For Delivery';
            logDescription = `Kurir ${kurirName} sedang dalam perjalanan mengantar paket`;
        }

        // Update shipment
        await connection.execute(
            'UPDATE shipments SET assigned_kurir_id = ?, status = ? WHERE awb_number = ?',
            [kurir_id, newStatus, awb_number]
        );

        // Insert Tracking Log
        await connection.execute(
            'INSERT INTO tracking_logs (awb_number, status, description, branch_id, updated_by) VALUES (?, ?, ?, ?, ?)',
            [awb_number, newStatus, logDescription, branchId, req.user.id]
        );

        await connection.commit();
        res.json({ status: 'Success', message: `Paket berhasil di-assign ke ${kurirName}` });

    } catch (error) {
        await connection.rollback();
        console.error('[Dispatcher Assign Error]', error);
        res.status(500).json({ status: 'Error', message: 'Gagal meng-assign kurir' });
    } finally {
        connection.release();
    }
};
