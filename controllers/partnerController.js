// Controller: Partner Management (Diakses oleh Admin via Dashboard)
const db = require('../db');
const crypto = require('crypto');
const axios = require('axios');

// ============================================================
// POST /admin/partners - Daftarkan Mitra Baru (oleh Admin)
// ============================================================
exports.registerPartner = async (req, res) => {
    const { nama_mitra, email_pic, smartbank_account_no, webhook_url } = req.body;

    if (!nama_mitra || !smartbank_account_no) {
        return res.status(400).json({
            status: 'Error',
            message: 'nama_mitra dan smartbank_account_no wajib diisi'
        });
    }

    // Generate API Key unik (prefix + random hex, mirip Stripe/Sanctum)
    const apiKey = 'lsk_live_' + crypto.randomBytes(24).toString('hex');

    try {
        await db.execute(
            `INSERT INTO partners (nama_mitra, email_pic, api_key, smartbank_account_no, webhook_url) 
             VALUES (?, ?, ?, ?, ?)`,
            [nama_mitra, email_pic || null, apiKey, smartbank_account_no, webhook_url || null]
        );

        res.status(201).json({
            status: 'Success',
            message: `Mitra "${nama_mitra}" berhasil didaftarkan`,
            data: {
                nama_mitra,
                api_key: apiKey, // Ditampilkan SEKALI saat pendaftaran
                smartbank_account_no,
                webhook_url: webhook_url || null,
                peringatan: 'Simpan API Key ini dengan aman. API Key hanya ditampilkan sekali saat pendaftaran.'
            }
        });
    } catch (error) {
        console.error('[Register Partner Error]', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ status: 'Error', message: 'Mitra dengan data tersebut sudah ada' });
        }
        res.status(500).json({ status: 'Error', message: 'Gagal mendaftarkan mitra' });
    }
};

// ============================================================
// GET /admin/partners - Lihat Semua Mitra (oleh Admin)
// ============================================================
exports.getAllPartners = async (req, res) => {
    try {
        const [rows] = await db.execute(
            'SELECT id, nama_mitra, email_pic, smartbank_account_no, webhook_url, is_active, created_at FROM partners ORDER BY created_at DESC'
        );
        // API Key TIDAK ditampilkan di list demi keamanan
        res.json({ status: 'Success', data: rows });
    } catch (error) {
        console.error('[Get Partners Error]', error);
        res.status(500).json({ status: 'Error', message: 'Gagal mengambil data mitra' });
    }
};

// ============================================================
// GET /admin/shipments - Lihat Semua Shipment (oleh Admin)
// ============================================================
exports.getAllShipments = async (req, res) => {
    try {
        const [rows] = await db.execute(
            `SELECT s.*, p.nama_mitra, iu.nama AS kurir_nama 
             FROM shipments s 
             LEFT JOIN partners p ON s.partner_id = p.id 
             LEFT JOIN internal_users iu ON s.assigned_kurir_id = iu.id 
             ORDER BY s.created_at DESC`
        );
        res.json({ status: 'Success', data: rows });
    } catch (error) {
        console.error('[Get Shipments Error]', error);
        res.status(500).json({ status: 'Error', message: 'Gagal mengambil data shipment' });
    }
};

// ============================================================
// GET /admin/dashboard-stats - Statistik Dashboard Admin
// ============================================================
exports.getDashboardStats = async (req, res) => {
    try {
        const [shipmentStats] = await db.execute(
            `SELECT 
                COUNT(*) as total_shipments,
                SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) as pending_count,
                SUM(CASE WHEN status = 'Delivered' THEN 1 ELSE 0 END) as delivered_count,
                SUM(CASE WHEN status = 'In Transit' THEN 1 ELSE 0 END) as in_transit_count,
                SUM(CASE WHEN status = 'Failed' THEN 1 ELSE 0 END) as failed_count,
                SUM(CASE WHEN payment_status = 'Paid' THEN total_biaya ELSE 0 END) as total_revenue
             FROM shipments`
        );

        const [partnerCount] = await db.execute('SELECT COUNT(*) as total FROM partners WHERE is_active = 1');

        res.json({
            status: 'Success',
            data: {
                ...shipmentStats[0],
                total_partners: partnerCount[0].total
            }
        });
    } catch (error) {
        console.error('[Dashboard Stats Error]', error);
        res.status(500).json({ status: 'Error', message: 'Gagal mengambil statistik dashboard' });
    }
};

// ============================================================
// POST /admin/shipments/update-status - Update Status (oleh Admin/Kurir)
// ============================================================
exports.updateShipmentStatus = async (req, res) => {
    const { awb_number, status, description, location } = req.body;

    if (!awb_number || !status) {
        return res.status(400).json({
            status: 'Error',
            message: 'awb_number dan status wajib diisi'
        });
    }

    const validStatuses = ['Pending', 'Picked Up', 'In Transit', 'Delivered', 'Failed'];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({
            status: 'Error',
            message: `Status tidak valid. Pilihan: ${validStatuses.join(', ')}`
        });
    }

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const [result] = await connection.execute(
            'UPDATE shipments SET status = ? WHERE awb_number = ?',
            [status, awb_number]
        );

        if (result.affectedRows === 0) {
            await connection.rollback();
            return res.status(404).json({ status: 'Error', message: 'AWB number tidak ditemukan' });
        }

        // Insert tracking log
        await connection.execute(
            'INSERT INTO tracking_logs (awb_number, status, description, location, updated_by) VALUES (?, ?, ?, ?, ?)',
            [awb_number, status, description || `Status diupdate ke ${status}`, location || null, req.admin.id]
        );

        await connection.commit();

        // ----------------------------------------------------
        // Trigger Webhook (Jika mitra memiliki webhook_url)
        // ----------------------------------------------------
        try {
            const [partnerRows] = await db.execute(
                `SELECT p.webhook_url, p.nama_mitra FROM shipments s 
                 JOIN partners p ON s.partner_id = p.id 
                 WHERE s.awb_number = ?`,
                [awb_number]
            );
            
            if (partnerRows.length > 0 && partnerRows[0].webhook_url) {
                const webhookUrl = partnerRows[0].webhook_url;
                
                // Ambil IP/Host server saat ini untuk simulasi webhook lokal
                let finalWebhookUrl = webhookUrl;
                if (webhookUrl.includes('tokobagus.com/webhook/logistik')) {
                    // Karena ini simulasi lokal, arahkan ke endpoint mock kita
                    finalWebhookUrl = 'http://localhost:3000/webhook/tokobagus';
                }

                console.log(`[Webhook] Mengirim update status ke ${partnerRows[0].nama_mitra} (${finalWebhookUrl})`);
                
                // Kirim POST secara asinkron tanpa menunggu response (fire and forget)
                axios.post(finalWebhookUrl, {
                    event: 'shipment.status_updated',
                    data: {
                        awb_number: awb_number,
                        status: status,
                        description: description || `Status diupdate ke ${status}`,
                        location: location || null,
                        timestamp: new Date().toISOString()
                    }
                }).catch(err => {
                    console.error(`[Webhook Error] Gagal mengirim ke ${finalWebhookUrl}:`, err.message);
                });
            }
        } catch (webhookErr) {
            console.error('[Webhook System Error]', webhookErr);
        }

        res.json({
            status: 'Success',
            message: `Status resi ${awb_number} berhasil diupdate ke "${status}"`
        });
    } catch (error) {
        await connection.rollback();
        console.error('[Update Status Error]', error);
        res.status(500).json({ status: 'Error', message: 'Gagal mengupdate status' });
    } finally {
        connection.release();
    }
};

// ============================================================
// POST /admin/login - Login Admin Internal
// ============================================================
exports.loginAdmin = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ status: 'Error', message: 'Email dan password wajib diisi' });
    }

    try {
        const [rows] = await db.execute(
            `SELECT id, email, nama, role, branch_id, token FROM internal_users 
             WHERE email = ? AND password = ? AND role IN ('Admin', 'Superadmin', 'Kurir', 'Branch Admin') AND is_active = 1`,
            [email, password]
        );

        if (rows.length === 0) {
            return res.status(401).json({ status: 'Error', message: 'Email atau password salah' });
        }

        res.json({
            status: 'Success',
            message: 'Login berhasil',
            token: rows[0].token,
            data: { 
                id: rows[0].id, 
                email: rows[0].email, 
                nama: rows[0].nama, 
                role: rows[0].role,
                branch_id: rows[0].branch_id 
            }
        });
    } catch (error) {
        console.error('[Admin Login Error]', error);
        res.status(500).json({ status: 'Error', message: 'Gagal login' });
    }
};
