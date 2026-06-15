// Controller: Customer Dashboard
// Mengelola request khusus customer (history, details, creation, and tracking)
const db = require('../db');

// ============================================================
// GET /customer/shipments - List pengiriman milik customer
// ============================================================
exports.getMyShipments = async (req, res) => {
    const customerId = req.user.id;
    try {
        const [rows] = await db.execute(
            `SELECT awb_number, receiver_name, receiver_city, receiver_address, 
                    weight, service_type, status, payment_status, total_biaya, created_at
             FROM shipments 
             WHERE customer_id = ? OR external_order_id = ?
             ORDER BY created_at DESC LIMIT 50`,
             [customerId, `CUST-${customerId}`]
        );

        res.json({ status: 'Success', data: rows });
    } catch (error) {
        console.error('[Customer Shipments Error]', error);
        res.status(500).json({ status: 'Error', message: 'Gagal mengambil riwayat pengiriman' });
    }
};

// ============================================================
// GET /customer/stats - Statistik customer
// ============================================================
exports.getStats = async (req, res) => {
    const customerId = req.user.id;
    try {
        const [stats] = await db.execute(
            `SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status IN ('Pending','Picked Up','Arrived at Branch','In Transit','Arrived at Destination Branch','Out For Delivery') THEN 1 ELSE 0 END) as active,
                SUM(CASE WHEN status = 'Delivered' THEN 1 ELSE 0 END) as delivered
             FROM shipments 
             WHERE customer_id = ? OR external_order_id = ?`,
            [customerId, `CUST-${customerId}`]
        );

        res.json({
            status: 'Success',
            data: {
                total: stats[0].total || 0,
                active: stats[0].active || 0,
                delivered: stats[0].delivered || 0
            }
        });
    } catch (error) {
        console.error('[Customer Stats Error]', error);
        res.status(500).json({ status: 'Error', message: 'Gagal mengambil statistik' });
    }
};

// ============================================================
// POST /customer/shipments - Buat pengiriman baru oleh Customer
// ============================================================
exports.createShipment = async (req, res) => {
    const customerId = req.user.id;
    const {
        sender_name, sender_address, sender_phone, sender_city,
        receiver_name, receiver_address, receiver_phone, receiver_city,
        weight, service_type
    } = req.body;

    if (!sender_name || !sender_address || !receiver_name || !receiver_address) {
        return res.status(400).json({
            status: 'Error',
            message: 'Data pengirim dan penerima wajib diisi'
        });
    }

    const parsedWeight = parseFloat(weight) || 1.0;
    const selectedService = service_type === 'Express' ? 'Express' : 'Reguler';
    
    // Cost calculation (simulate tarif)
    const tarifPerKg = selectedService === 'Express' ? 25000 : 15000;
    const ongkir = parsedWeight * tarifPerKg;
    const biayaLayanan = 2000; // Flat customer fee
    const totalBiaya = ongkir + biayaLayanan;

    const awbNumber = 'LSK' + Date.now().toString().slice(-8) + Math.floor(Math.random() * 1000);

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // Find Origin and Destination Branches
        let originBranchId = null;
        let destBranchId = null;
        
        if (sender_city) {
            const [b1] = await connection.execute('SELECT id FROM branches WHERE city LIKE ? LIMIT 1', [`%${sender_city}%`]);
            if (b1.length > 0) originBranchId = b1[0].id;
        }
        if (receiver_city) {
            const [b2] = await connection.execute('SELECT id FROM branches WHERE city LIKE ? LIMIT 1', [`%${receiver_city}%`]);
            if (b2.length > 0) destBranchId = b2[0].id;
        }

        // Default fallback to branch 1/2 if null
        if (!originBranchId) originBranchId = 1;
        if (!destBranchId) destBranchId = 2;

        // Insert shipment
        await connection.execute(
            `INSERT INTO shipments 
            (awb_number, customer_id, external_order_id, sender_name, sender_address, sender_phone, sender_city,
             receiver_name, receiver_address, receiver_phone, receiver_city, weight, service_type, 
             ongkir, biaya_layanan, total_biaya, status, payment_status, origin_branch_id, destination_branch_id, current_branch_id) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending', 'Paid', ?, ?, ?)`,
            [
                awbNumber, customerId, `CUST-${customerId}`,
                sender_name, sender_address, sender_phone || null, sender_city || 'Jakarta',
                receiver_name, receiver_address, receiver_phone || null, receiver_city || 'Bandung',
                parsedWeight, selectedService,
                ongkir, biayaLayanan, totalBiaya,
                originBranchId, destBranchId, originBranchId
            ]
        );

        // Insert log
        await connection.execute(
            `INSERT INTO tracking_logs (awb_number, status, description, branch_id) VALUES (?, ?, ?, ?)`,
            [awbNumber, 'Pending', 'Pesanan berhasil dibuat oleh customer. Siap dipickup.', originBranchId]
        );

        await connection.commit();
        res.status(201).json({
            status: 'Success',
            message: 'Resi berhasil dibuat',
            awb_number: awbNumber,
            total_biaya: totalBiaya
        });
    } catch (error) {
        await connection.rollback();
        console.error('[Customer Create Shipment Error]', error);
        res.status(500).json({ status: 'Error', message: 'Gagal membuat pengiriman baru' });
    } finally {
        connection.release();
    }
};

// ============================================================
// GET /customer/shipments/:awb - Track shipment details
// ============================================================
exports.trackShipment = async (req, res) => {
    const customerId = req.user.id;
    const { awb } = req.params;

    try {
        const [shipment] = await db.execute(
            'SELECT * FROM shipments WHERE awb_number = ? AND (customer_id = ? OR external_order_id = ?)',
            [awb, customerId, `CUST-${customerId}`]
        );

        if (shipment.length === 0) {
            return res.status(404).json({
                status: 'Error',
                message: 'Resi tidak ditemukan atau bukan milik Anda'
            });
        }

        const [logs] = await db.execute(
            `SELECT tl.status, tl.description, tl.created_at, b.nama_cabang
             FROM tracking_logs tl
             LEFT JOIN branches b ON tl.branch_id = b.id
             WHERE tl.awb_number = ? 
             ORDER BY tl.created_at DESC`,
            [awb]
        );

        res.json({
            status: 'Success',
            data: {
                shipment: shipment[0],
                tracking_history: logs
            }
        });
    } catch (error) {
        console.error('[Customer Track Error]', error);
        res.status(500).json({ status: 'Error', message: 'Gagal melacak nomor resi' });
    }
};
