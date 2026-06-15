// Controller: Superadmin
// Akses penuh: manage admin, laporan, statistik global, dll.
const db = require('../db');
const crypto = require('crypto');

// ============================================================
// POST /superadmin/login
// ============================================================
exports.login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ status: 'Error', message: 'Email dan password wajib diisi' });
    try {
        const [rows] = await db.execute(
            'SELECT id, email, nama, role, token FROM internal_users WHERE email = ? AND password = ? AND role = ? AND is_active = 1',
            [email, password, 'Superadmin']
        );
        if (rows.length === 0) return res.status(401).json({ status: 'Error', message: 'Email atau password salah' });
        res.json({
            status: 'Success', message: 'Login berhasil',
            token: rows[0].token,
            data: { id: rows[0].id, email: rows[0].email, nama: rows[0].nama, role: rows[0].role }
        });
    } catch (error) {
        console.error('[Superadmin Login Error]', error);
        res.status(500).json({ status: 'Error', message: 'Gagal login' });
    }
};

// ============================================================
// GET /superadmin/dashboard-stats - Statistik Global Lengkap
// ============================================================
exports.getDashboardStats = async (req, res) => {
    try {
        const [shipStats] = await db.execute(`
            SELECT 
                COUNT(*) as total_shipments,
                SUM(CASE WHEN status='Pending' THEN 1 ELSE 0 END) as pending,
                SUM(CASE WHEN status='In Transit' THEN 1 ELSE 0 END) as in_transit,
                SUM(CASE WHEN status='Delivered' THEN 1 ELSE 0 END) as delivered,
                SUM(CASE WHEN status='Failed' THEN 1 ELSE 0 END) as failed,
                SUM(CASE WHEN payment_status='Paid' THEN total_biaya ELSE 0 END) as revenue_shipments,
                SUM(CASE WHEN status='Delivered' AND payment_status='Paid' THEN total_biaya ELSE 0 END) as revenue_delivered
            FROM shipments`);
        const [orderStats] = await db.execute(`
            SELECT 
                COUNT(*) as total_orders,
                SUM(CASE WHEN pembayaran='Lunas' THEN 1 ELSE 0 END) as orders_lunas,
                SUM(CASE WHEN pembayaran='Belum Bayar' THEN 1 ELSE 0 END) as orders_pending
            FROM orders`);
        const [txStats] = await db.execute(`
            SELECT COUNT(*) as total_transactions, 
                   SUM(total) as total_revenue, 
                   SUM(fee_layanan) as total_fee_layanan,
                   SUM(fee_bank) as total_fee_bank
            FROM transactions`);
        const [adminStats] = await db.execute(`
            SELECT 
                COUNT(*) as total_users,
                SUM(CASE WHEN role='Superadmin' THEN 1 ELSE 0 END) as superadmin_count,
                SUM(CASE WHEN role='Admin' THEN 1 ELSE 0 END) as admin_count,
                SUM(CASE WHEN role='Kurir' THEN 1 ELSE 0 END) as kurir_count
            FROM internal_users WHERE is_active=1`);
        const [partnerStats] = await db.execute('SELECT COUNT(*) as total_partners FROM partners WHERE is_active=1');

        res.json({
            status: 'Success',
            data: {
                shipments: shipStats[0],
                orders: orderStats[0],
                transactions: txStats[0],
                users: adminStats[0],
                partners: partnerStats[0]
            }
        });
    } catch (error) {
        console.error('[SA Dashboard Stats Error]', error);
        res.status(500).json({ status: 'Error', message: 'Gagal mengambil statistik' });
    }
};

// ============================================================
// GET /superadmin/admins - Lihat semua internal users
// ============================================================
exports.getAllAdmins = async (req, res) => {
    try {
        const [rows] = await db.execute(
            'SELECT id, email, nama, role, is_active, created_at FROM internal_users ORDER BY role, created_at DESC'
        );
        res.json({ status: 'Success', data: rows });
    } catch (error) {
        res.status(500).json({ status: 'Error', message: 'Gagal mengambil data users' });
    }
};

// ============================================================
// POST /superadmin/admins - Tambah admin/kurir baru
// ============================================================
exports.createAdmin = async (req, res) => {
    const { email, password, nama, role, branch_id } = req.body;
    const validRoles = ['Admin', 'Kurir', 'Superadmin', 'Branch Admin', 'Dispatcher', 'Customer'];
    if (!email || !password || !nama || !role) return res.status(400).json({ status: 'Error', message: 'Semua field wajib diisi' });
    if (!validRoles.includes(role)) return res.status(400).json({ status: 'Error', message: 'Role tidak valid' });
    const token = 'lsk-' + role.toLowerCase().replace(' ', '') + '-' + crypto.randomBytes(16).toString('hex');
    try {
        await db.execute(
            'INSERT INTO internal_users (email, password, nama, role, token, branch_id) VALUES (?, ?, ?, ?, ?, ?)',
            [email, password, nama, role, token, branch_id || null]
        );
        res.status(201).json({ status: 'Success', message: `${role} "${nama}" berhasil dibuat`, data: { email, nama, role } });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') return res.status(409).json({ status: 'Error', message: 'Email sudah terdaftar' });
        res.status(500).json({ status: 'Error', message: 'Gagal membuat user' });
    }
};

// ============================================================
// PATCH /superadmin/admins/:id/toggle - Aktif/nonaktif user
// ============================================================
exports.toggleAdminStatus = async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await db.execute('SELECT id, nama, is_active, role FROM internal_users WHERE id = ?', [id]);
        if (rows.length === 0) return res.status(404).json({ status: 'Error', message: 'User tidak ditemukan' });
        const user = rows[0];
        const newStatus = user.is_active ? 0 : 1;
        await db.execute('UPDATE internal_users SET is_active = ? WHERE id = ?', [newStatus, id]);
        res.json({ status: 'Success', message: `User "${user.nama}" ${newStatus ? 'diaktifkan' : 'dinonaktifkan'}` });
    } catch (error) {
        res.status(500).json({ status: 'Error', message: 'Gagal mengubah status user' });
    }
};

// ============================================================
// DELETE /superadmin/admins/:id - Hapus user (kecuali Superadmin)
// ============================================================
exports.deleteAdmin = async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await db.execute('SELECT id, nama, role FROM internal_users WHERE id = ?', [id]);
        if (rows.length === 0) return res.status(404).json({ status: 'Error', message: 'User tidak ditemukan' });
        if (rows[0].role === 'Superadmin') return res.status(403).json({ status: 'Error', message: 'Tidak bisa menghapus Superadmin' });
        await db.execute('DELETE FROM internal_users WHERE id = ?', [id]);
        res.json({ status: 'Success', message: `User "${rows[0].nama}" berhasil dihapus` });
    } catch (error) {
        res.status(500).json({ status: 'Error', message: 'Gagal menghapus user' });
    }
};

// ============================================================
// GET /superadmin/transactions - Semua transaksi (global)
// ============================================================
exports.getAllTransactions = async (req, res) => {
    try {
        const [rows] = await db.execute(`
            SELECT t.*, o.alamat, o.jarak, o.status AS status_pengiriman
            FROM transactions t
            LEFT JOIN orders o ON t.order_id = o.order_id
            ORDER BY t.created_at DESC
            LIMIT 200`);
        res.json({ status: 'Success', data: rows });
    } catch (error) {
        res.status(500).json({ status: 'Error', message: 'Gagal mengambil transaksi' });
    }
};

// ============================================================
// PATCH /superadmin/admins/:id/reset-password - Reset password
// ============================================================
exports.resetPassword = async (req, res) => {
    const { id } = req.params;
    const { new_password } = req.body;
    if (!new_password || new_password.length < 6) return res.status(400).json({ status: 'Error', message: 'Password minimal 6 karakter' });
    try {
        const [rows] = await db.execute('SELECT id, nama FROM internal_users WHERE id = ?', [id]);
        if (rows.length === 0) return res.status(404).json({ status: 'Error', message: 'User tidak ditemukan' });
        await db.execute('UPDATE internal_users SET password = ? WHERE id = ?', [new_password, id]);
        res.json({ status: 'Success', message: `Password user "${rows[0].nama}" berhasil direset` });
    } catch (error) {
        res.status(500).json({ status: 'Error', message: 'Gagal reset password' });
    }
};

// ============================================================
// GET /superadmin/branches - Daftar Cabang
// ============================================================
exports.getBranches = async (req, res) => {
    try {
        const [rows] = await db.execute(
            `SELECT b.id, b.name, b.city, b.status,
                    (SELECT COUNT(*) FROM internal_users WHERE branch_id = b.id AND role = 'Kurir') as total_kurir,
                    (SELECT COUNT(*) FROM shipments WHERE current_branch_id = b.id) as total_shipments
             FROM branches b
             ORDER BY b.id ASC`
        );
        res.json({ status: 'Success', data: rows });
    } catch (error) {
        res.status(500).json({ status: 'Error', message: 'Gagal mengambil data cabang' });
    }
};

// ============================================================
// GET /superadmin/realtime-activity - Aktivitas Global Terbaru
// ============================================================
exports.getNationalActivity = async (req, res) => {
    try {
        const [rows] = await db.execute(
            `SELECT tl.status, tl.description, tl.created_at, iu.nama as updated_by_name, tl.awb_number, b.name as branch_name,
                    s.sender_name, s.receiver_name, s.sender_city, s.receiver_city, s.service_type, s.weight
             FROM tracking_logs tl
             LEFT JOIN shipments s ON tl.awb_number = s.awb_number
             LEFT JOIN internal_users iu ON tl.updated_by = iu.id
             LEFT JOIN branches b ON tl.branch_id = b.id
             ORDER BY tl.created_at DESC
             LIMIT 30`
        );
        res.json({ status: 'Success', data: rows });
    } catch (error) {
        res.status(500).json({ status: 'Error', message: 'Gagal mengambil data aktivitas nasional' });
    }
};

// ============================================================
// MARKETPLACE PARTNER MANAGEMENT
// ============================================================

exports.getAllPartners = async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM marketplace_partners ORDER BY created_at DESC');
        res.json({ status: 'Success', data: rows });
    } catch (error) {
        res.status(500).json({ status: 'Error', message: 'Gagal mengambil data partners' });
    }
};

exports.createPartner = async (req, res) => {
    const { name, contact_email, contact_phone, company_name, callback_url } = req.body;
    if (!name) return res.status(400).json({ status: 'Error', message: 'Nama partner wajib diisi' });

    const api_key = 'lsk_live_' + crypto.randomBytes(12).toString('hex');
    const secret_token = crypto.randomBytes(16).toString('hex');
    const webhook_secret = crypto.randomBytes(16).toString('hex');

    try {
        await db.execute(
            `INSERT INTO marketplace_partners (name, api_key, secret_token, contact_email, contact_phone, company_name, callback_url, webhook_secret)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [name, api_key, secret_token, contact_email || null, contact_phone || null, company_name || null, callback_url || null, webhook_secret]
        );
        res.status(201).json({ status: 'Success', message: 'Partner berhasil ditambahkan' });
    } catch (error) {
        res.status(500).json({ status: 'Error', message: 'Gagal menambah partner' });
    }
};

exports.updatePartner = async (req, res) => {
    const { id } = req.params;
    const { name, contact_email, contact_phone, company_name, callback_url } = req.body;
    try {
        await db.execute(
            `UPDATE marketplace_partners SET name = ?, contact_email = ?, contact_phone = ?, company_name = ?, callback_url = ? WHERE id = ?`,
            [name, contact_email || null, contact_phone || null, company_name || null, callback_url || null, id]
        );
        res.json({ status: 'Success', message: 'Partner berhasil diupdate' });
    } catch (error) {
        res.status(500).json({ status: 'Error', message: 'Gagal mengupdate partner' });
    }
};

exports.togglePartnerStatus = async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await db.execute('SELECT status FROM marketplace_partners WHERE id = ?', [id]);
        if (rows.length === 0) return res.status(404).json({ status: 'Error', message: 'Partner tidak ditemukan' });
        const newStatus = rows[0].status === 'active' ? 'inactive' : 'active';
        await db.execute('UPDATE marketplace_partners SET status = ? WHERE id = ?', [newStatus, id]);
        res.json({ status: 'Success', message: `Partner berhasil diubah menjadi ${newStatus}` });
    } catch (error) {
        res.status(500).json({ status: 'Error', message: 'Gagal mengubah status partner' });
    }
};

exports.getApiLogs = async (req, res) => {
    try {
        const [rows] = await db.execute(`
            SELECT al.*, mp.name as partner_name 
            FROM api_logs al 
            LEFT JOIN marketplace_partners mp ON al.partner_id = mp.id 
            ORDER BY al.created_at DESC LIMIT 100
        `);
        res.json({ status: 'Success', data: rows });
    } catch (error) {
        res.status(500).json({ status: 'Error', message: 'Gagal mengambil API logs' });
    }
};

exports.getWebhookLogs = async (req, res) => {
    try {
        const [rows] = await db.execute(`
            SELECT wl.*, mp.name as partner_name 
            FROM webhook_logs wl 
            LEFT JOIN marketplace_partners mp ON wl.partner_id = mp.id 
            ORDER BY wl.created_at DESC LIMIT 100
        `);
        res.json({ status: 'Success', data: rows });
    } catch (error) {
        res.status(500).json({ status: 'Error', message: 'Gagal mengambil webhook logs' });
    }
};

// ============================================================
// GET /superadmin/reports - Lihat Semua Aduan Pelanggan
// ============================================================
exports.getAllReports = async (req, res) => {
    try {
        const [rows] = await db.execute(
            'SELECT * FROM admin_reports ORDER BY created_at DESC'
        );
        res.json({ status: 'Success', data: rows });
    } catch (error) {
        console.error('[Get Reports Error]', error);
        res.status(500).json({ status: 'Error', message: 'Gagal mengambil data aduan' });
    }
};

// ============================================================
// PATCH /superadmin/reports/:id - Ganti Status Aduan (Pending/Resolved)
// ============================================================
exports.updateReportStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
        return res.status(400).json({ status: 'Error', message: 'Status wajib dikirim' });
    }

    try {
        const [check] = await db.execute('SELECT id FROM admin_reports WHERE id = ?', [id]);
        if (check.length === 0) {
            return res.status(404).json({ status: 'Error', message: 'Aduan tidak ditemukan' });
        }

        await db.execute('UPDATE admin_reports SET status = ? WHERE id = ?', [status, id]);
        res.json({ status: 'Success', message: `Status aduan berhasil diperbarui menjadi ${status}` });
    } catch (error) {
        console.error('[Update Report Error]', error);
        res.status(500).json({ status: 'Error', message: 'Gagal memperbarui status aduan' });
    }
};
