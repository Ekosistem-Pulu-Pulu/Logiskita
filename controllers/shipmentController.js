// Controller: Shipment API (Diakses oleh Mitra Bisnis via API Key)
const db = require('../db');
const smartbankService = require('../services/smartbankService');

// ============================================================
// POST /api/v1/shipments - Buat Pengiriman Baru (oleh Mitra)
// ============================================================
exports.createShipment = async (req, res) => {
    const partner = req.partner; // Dari middleware verifyApiKey
    const {
        external_order_id,
        sender_name, sender_address, sender_phone, sender_city,
        receiver_name, receiver_address, receiver_phone, receiver_city,
        weight, service_type
    } = req.body;

    // Validasi input
    if (!sender_name || !sender_address || !receiver_name || !receiver_address) {
        return res.status(400).json({
            status: 'Error',
            message: 'Data pengirim dan penerima wajib diisi (sender_name, sender_address, receiver_name, receiver_address)'
        });
    }

    const parsedWeight = parseFloat(weight) || 1;
    const selectedService = service_type === 'Express' ? 'Express' : 'Reguler';

    // Hitung ongkir (tarif dasar per kg)
    const tarifPerKg = selectedService === 'Express' ? 25000 : 15000;
    const ongkir = parsedWeight * tarifPerKg;
    const biayaLayanan = ongkir * 0.05; // Fee layanan 5%
    const totalBiaya = ongkir + biayaLayanan;

    // 1. Hit API SmartBank untuk potong saldo dari rekening mitra
    const bankResponse = await smartbankService.processPayment(
        partner.smartbank_account_no,
        `SHIP-${Date.now()}`,
        totalBiaya
    );

    if (!bankResponse.success) {
        return res.status(402).json({
            status: 'Error',
            message: 'Pembayaran gagal: Saldo SmartBank mitra tidak mencukupi atau transaksi ditolak',
            smartbank_message: bankResponse.message || 'Unknown error'
        });
    }

    // 2. Generate AWB Number (Nomor Resi)
    const awbNumber = 'LSK' + Date.now().toString().slice(-8) + Math.floor(Math.random() * 1000);

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // Cari Origin dan Destination Branch berdasarkan kota
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

        // 3. Insert shipment ke database
        await connection.execute(
            `INSERT INTO shipments 
            (awb_number, partner_id, external_order_id, sender_name, sender_address, sender_phone, 
             receiver_name, receiver_address, receiver_phone, weight, service_type, 
             ongkir, biaya_layanan, total_biaya, status, payment_status, smartbank_trx_id, origin_branch_id, destination_branch_id, current_branch_id) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending', 'Paid', ?, ?, ?, ?)`,
            [
                awbNumber, partner.id, external_order_id || null,
                sender_name, sender_address, sender_phone || null,
                receiver_name, receiver_address, receiver_phone || null,
                parsedWeight, selectedService,
                ongkir, biayaLayanan, totalBiaya,
                bankResponse.transaction_id,
                originBranchId, destBranchId, originBranchId
            ]
        );

        // 4. Insert tracking log awal
        await connection.execute(
            `INSERT INTO tracking_logs (awb_number, status, description, location) VALUES (?, ?, ?, ?)`,
            [awbNumber, 'Pending', 'Pesanan diterima dan pembayaran terkonfirmasi', sender_city || 'Gudang LogistiKita']
        );

        await connection.commit();

        // 5. Response sukses ke Marketplace
        res.status(201).json({
            status: 'Success',
            message: 'Resi berhasil diterbitkan',
            data: {
                awb_number: awbNumber,
                partner: partner.nama_mitra,
                external_order_id: external_order_id || null,
                service_type: selectedService,
                weight: parsedWeight,
                ongkir: ongkir,
                biaya_layanan: biayaLayanan,
                total_biaya: totalBiaya,
                payment_status: 'Paid',
                smartbank_trx_id: bankResponse.transaction_id,
                estimasi: selectedService === 'Express' ? '1-2 Hari' : '3-4 Hari',
                status: 'Pending'
            }
        });
    } catch (error) {
        await connection.rollback();
        console.error('[Create Shipment Error]', error);
        res.status(500).json({ status: 'Error', message: 'Gagal membuat resi pengiriman' });
    } finally {
        connection.release();
    }
};

// ============================================================
// GET /api/v1/shipments/:awb - Tracking Resi (oleh Mitra)
// ============================================================
exports.trackShipment = async (req, res) => {
    const partner = req.partner;
    const { awb } = req.params;

    try {
        // Pastikan resi milik partner ini
        const [shipment] = await db.execute(
            'SELECT * FROM shipments WHERE awb_number = ? AND partner_id = ?',
            [awb, partner.id]
        );

        if (shipment.length === 0) {
            return res.status(404).json({
                status: 'Error',
                message: 'Nomor resi tidak ditemukan atau bukan milik mitra Anda'
            });
        }

        // Ambil tracking logs
        const [logs] = await db.execute(
            'SELECT status, description, location, created_at FROM tracking_logs WHERE awb_number = ? ORDER BY created_at ASC',
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
        console.error('[Track Shipment Error]', error);
        res.status(500).json({ status: 'Error', message: 'Gagal mengambil data tracking' });
    }
};

// ============================================================
// GET /api/v1/shipments - Lihat Semua Pengiriman Mitra (oleh Mitra)
// ============================================================
exports.getAllShipments = async (req, res) => {
    const partner = req.partner;

    try {
        const [rows] = await db.execute(
            `SELECT awb_number, external_order_id, receiver_name, receiver_address, 
                    service_type, total_biaya, status, payment_status, created_at 
             FROM shipments 
             WHERE partner_id = ? 
             ORDER BY created_at DESC`,
            [partner.id]
        );

        res.json({ status: 'Success', data: rows });
    } catch (error) {
        console.error('[Get Partner Shipments Error]', error);
        res.status(500).json({ status: 'Error', message: 'Gagal mengambil data riwayat pengiriman' });
    }
};

// ============================================================
// POST /api/v1/rates - Cek Ongkir (oleh Mitra)
// ============================================================
exports.checkRates = async (req, res) => {
    const { kota_asal, kota_tujuan, weight } = req.body;

    if (!kota_asal || !kota_tujuan) {
        return res.status(400).json({
            status: 'Error',
            message: 'Parameter kota_asal dan kota_tujuan wajib diisi'
        });
    }

    const parsedWeight = parseFloat(weight) || 1;

    try {
        const [rows] = await db.execute(
            'SELECT * FROM tarif WHERE LOWER(kota_asal) = LOWER(?) AND LOWER(kota_tujuan) = LOWER(?)',
            [kota_asal, kota_tujuan]
        );

        if (rows.length === 0) {
            // Fallback: tarif default jika rute tidak ditemukan di tabel
            const defaultReguler = parsedWeight * 15000;
            const defaultExpress = parsedWeight * 25000;
            return res.json({
                status: 'Success',
                message: 'Rute tidak ditemukan di database, menggunakan tarif default',
                data: {
                    kota_asal, kota_tujuan, weight: parsedWeight,
                    options: [
                        { service: 'Reguler', harga: defaultReguler, estimasi: '3-5 Hari' },
                        { service: 'Express', harga: defaultExpress, estimasi: '1-2 Hari' }
                    ]
                }
            });
        }

        const tarif = rows[0];
        res.json({
            status: 'Success',
            data: {
                kota_asal, kota_tujuan, weight: parsedWeight,
                options: [
                    {
                        service: 'Reguler',
                        harga: tarif.harga_reguler * parsedWeight,
                        estimasi: tarif.estimasi_reguler
                    },
                    {
                        service: 'Express',
                        harga: tarif.harga_express * parsedWeight,
                        estimasi: tarif.estimasi_express
                    }
                ]
            }
        });
    } catch (error) {
        console.error('[Check Rates Error]', error);
        res.status(500).json({ status: 'Error', message: 'Gagal mengambil tarif' });
    }
};
