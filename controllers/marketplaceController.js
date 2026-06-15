const db = require('../db');
const rateController = require('./rateController');
const webhookService = require('../services/webhookService');

// POST /api/v1/marketplace/check-ongkir
exports.checkOngkir = async (req, res) => {
    // Delegasi ke rateController yang sudah ada
    return rateController.checkRates(req, res);
};

// POST /api/v1/marketplace/create-shipment
exports.createShipment = async (req, res) => {
    const partner = req.partner;
    const {
        external_order_id,
        sender_name, sender_address, sender_phone, sender_city,
        receiver_name, receiver_address, receiver_phone, receiver_city,
        weight, service_type
    } = req.body;

    if (!sender_name || !sender_address || !receiver_name || !receiver_address) {
        return res.status(400).json({
            status: 'Error',
            message: 'Data pengirim dan penerima wajib diisi (sender_name, sender_address, receiver_name, receiver_address)'
        });
    }

    const parsedWeight = parseFloat(weight) || 1;
    const selectedService = service_type === 'Express' ? 'Express' : 'Reguler';

    const tarifPerKg = selectedService === 'Express' ? 25000 : 15000;
    const ongkir = parsedWeight * tarifPerKg;
    const biayaLayanan = ongkir * 0.05;
    const totalBiaya = ongkir + biayaLayanan;

    const awbNumber = 'LSK' + Date.now().toString().slice(-8) + Math.floor(Math.random() * 1000);

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

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

        // Optional payment verification placeholder
        // In real implementation, verify payment_id via payment gateway API
        const { payment_id } = req.body;
        let paymentStatus = 'Pending';
        if (payment_id) {
            // Mock verification: assume payment is successful
            paymentStatus = 'Paid';
        }
        // Insert new shipment with determined payment_status
        await connection.execute(
          `INSERT INTO shipments 
          (awb_number, partner_id, external_order_id, sender_name, sender_address, sender_phone, 
           receiver_name, receiver_address, receiver_phone, weight, service_type, 
           ongkir, biaya_layanan, total_biaya, status, payment_status, origin_branch_id, destination_branch_id, current_branch_id, order_source) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending', ?, ?, ?, ?, 'Marketplace')`,
          [
            awbNumber, partner.id, external_order_id || null,
            sender_name, sender_address, sender_phone || null,
            receiver_name, receiver_address, receiver_phone || null,
            parsedWeight, selectedService,
            ongkir, biayaLayanan, totalBiaya,
            paymentStatus,
            originBranchId, destBranchId, originBranchId
          ]
        );

        await connection.execute(
            `INSERT INTO tracking_logs (awb_number, status, description, location) VALUES (?, ?, ?, ?)`,
            [awbNumber, 'Pending', 'Pesanan diterima dari API Marketplace', sender_city || 'Sistem']
        );

        // Update partner's total_shipments
        await connection.execute('UPDATE marketplace_partners SET total_shipments = total_shipments + 1 WHERE id = ?', [partner.id]);

        await connection.commit();

        res.status(201).json({
            status: 'Success',
            message: 'Resi berhasil diterbitkan',
            data: {
                awb_number: awbNumber,
                partner: partner.name,
                external_order_id: external_order_id || null,
                service_type: selectedService,
                weight: parsedWeight,
                total_biaya: totalBiaya,
                status: 'Pending'
            }
        });
    } catch (error) {
        await connection.rollback();
        console.error('[Create Marketplace Shipment Error]', error);
        res.status(500).json({ status: 'Error', message: 'Gagal membuat resi pengiriman' });
    } finally {
        connection.release();
    }
};

// GET /api/v1/marketplace/tracking/:resi
exports.getTracking = async (req, res) => {
    const { resi } = req.params;

    try {
        const [shipment] = await db.execute(
            'SELECT awb_number, status, service_type, created_at FROM shipments WHERE awb_number = ? AND order_source = "Marketplace"',
            [resi]
        );

        if (shipment.length === 0) {
            return res.status(404).json({ status: 'Error', message: 'Resi tidak ditemukan' });
        }

        const [logs] = await db.execute(
            'SELECT status, description, location, created_at FROM tracking_logs WHERE awb_number = ? ORDER BY created_at ASC',
            [resi]
        );

        res.json({
            status: 'Success',
            data: {
                shipment: shipment[0],
                tracking_history: logs
            }
        });
    } catch (error) {
        res.status(500).json({ status: 'Error', message: 'Gagal mengambil data tracking' });
    }
};

// GET /api/v1/marketplace/shipments
exports.listShipments = async (req, res) => {
    const partner = req.partner;

    try {
        const [rows] = await db.execute(
            `SELECT awb_number, external_order_id, receiver_name, receiver_city, 
                    service_type, total_biaya, status, created_at 
             FROM shipments 
             WHERE partner_id = ? AND order_source = 'Marketplace'
             ORDER BY created_at DESC`,
            [partner.id]
        );

        res.json({ status: 'Success', data: rows });
    } catch (error) {
        res.status(500).json({ status: 'Error', message: 'Gagal mengambil data riwayat pengiriman' });
    }
};

// POST /api/v1/marketplace/shipments/:awb/cancel
exports.cancelShipment = async (req, res) => {
    const partner = req.partner;
    const { awb } = req.params;

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const [check] = await connection.execute(
            'SELECT id, status FROM shipments WHERE awb_number = ? AND partner_id = ? AND order_source = "Marketplace" FOR UPDATE',
            [awb, partner.id]
        );

        if (check.length === 0) {
            await connection.rollback();
            return res.status(404).json({ status: 'Error', message: 'Resi tidak ditemukan atau bukan milik partner ini' });
        }

        const shipment = check[0];
        if (shipment.status !== 'Pending') {
            await connection.rollback();
            return res.status(400).json({ status: 'Error', message: `Tidak dapat membatalkan pengiriman dengan status ${shipment.status}` });
        }

        await connection.execute('UPDATE shipments SET status = "Cancelled" WHERE awb_number = ?', [awb]);
        await connection.execute(
            'INSERT INTO tracking_logs (awb_number, status, description, location) VALUES (?, ?, ?, ?)',
            [awb, 'Cancelled', 'Pengiriman dibatalkan oleh partner', 'Sistem']
        );

        await connection.commit();

        // Trigger webhook
        const payload = {
            awb: awb,
            status: 'Cancelled',
            timestamp: new Date().toISOString(),
            partner_id: partner.id
        };
        webhookService.sendWebhook(partner.id, shipment.id, payload);

        res.json({ status: 'Success', message: 'Pengiriman berhasil dibatalkan' });
    } catch (error) {
        await connection.rollback();
        console.error('[Cancel Shipment Error]', error);
        res.status(500).json({ status: 'Error', message: 'Gagal membatalkan pengiriman' });
    } finally {
        connection.release();
    }
};
