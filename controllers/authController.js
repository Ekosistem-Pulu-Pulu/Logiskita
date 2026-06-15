// Controller: Universal Authentication
const db = require('../db');
const crypto = require('crypto');

// ============================================================
// POST /auth/login - Unified Login untuk semua role
// ============================================================
exports.login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ status: 'Error', message: 'Email dan password wajib diisi' });
    }

    try {
        const [rows] = await db.execute(
            `SELECT id, email, nama, role, branch_id, token, phone, photo_url 
             FROM internal_users 
             WHERE email = ? AND password = ? AND is_active = 1`,
            [email, password]
        );

        if (rows.length === 0) {
            return res.status(401).json({ status: 'Error', message: 'Email atau password salah' });
        }

        const user = rows[0];

        // Tentukan redirect url berdasarkan role
        let redirectUrl = '/';
        switch (user.role) {
            case 'Superadmin': redirectUrl = '/superadmin.html'; break;
            case 'Admin': redirectUrl = '/admin.html'; break;
            case 'Branch Admin': redirectUrl = '/branch-dashboard.html'; break;
            case 'Dispatcher': redirectUrl = '/dispatcher-dashboard.html'; break;
            case 'Kurir': redirectUrl = '/kurir.html'; break;
            case 'Customer': redirectUrl = '/customer-dashboard.html'; break;
        }

        res.json({
            status: 'Success',
            message: 'Login berhasil',
            token: user.token,
            redirect_url: redirectUrl,
            data: {
                id: user.id,
                email: user.email,
                nama: user.nama,
                role: user.role,
                branch_id: user.branch_id,
                phone: user.phone,
                photo_url: user.photo_url
            }
        });
    } catch (error) {
        console.error('[Unified Login Error]', error);
        res.status(500).json({ status: 'Error', message: 'Terjadi kesalahan sistem saat login' });
    }
};

// ============================================================
// POST /auth/register - Pendaftaran Customer Baru
// ============================================================
exports.registerCustomer = async (req, res) => {
    const { email, password, nama, phone } = req.body;

    if (!email || !password || !nama) {
        return res.status(400).json({ status: 'Error', message: 'Email, password, dan nama wajib diisi' });
    }

    const token = 'token_cust_' + crypto.randomBytes(16).toString('hex');

    try {
        await db.execute(
            `INSERT INTO internal_users (email, password, nama, phone, role, token, is_active) 
             VALUES (?, ?, ?, ?, 'Customer', ?, 1)`,
            [email, password, nama, phone || null, token]
        );

        res.status(201).json({
            status: 'Success',
            message: 'Pendaftaran berhasil. Silakan login.',
            data: { email, nama, role: 'Customer' }
        });
    } catch (error) {
        console.error('[Customer Register Error]', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ status: 'Error', message: 'Email sudah terdaftar' });
        }
        res.status(500).json({ status: 'Error', message: 'Gagal mendaftar akun' });
    }
};

// ============================================================
// POST /auth/register-kurir - Pendaftaran Kurir Baru (Perlu Approval)
// ============================================================
exports.registerKurir = async (req, res) => {
    const { email, password, nama, phone, branch_id } = req.body;

    if (!email || !password || !nama || !branch_id) {
        return res.status(400).json({ status: 'Error', message: 'Email, password, nama, dan cabang wajib diisi' });
    }

    try {
        // Cek apakah email sudah terdaftar di internal_users atau kurir_registrations
        const [existingUser] = await db.execute('SELECT id FROM internal_users WHERE email = ?', [email]);
        if (existingUser.length > 0) {
            return res.status(409).json({ status: 'Error', message: 'Email sudah terdaftar di sistem' });
        }

        const [existingReg] = await db.execute('SELECT id FROM kurir_registrations WHERE email = ? AND status = "pending"', [email]);
        if (existingReg.length > 0) {
            return res.status(409).json({ status: 'Error', message: 'Email sudah dalam antrian pendaftaran. Silakan tunggu approval dari operator cabang.' });
        }

        // Cek apakah branch valid
        const [branch] = await db.execute('SELECT id, name, city FROM branches WHERE id = ?', [branch_id]);
        if (branch.length === 0) {
            return res.status(404).json({ status: 'Error', message: 'Cabang tidak ditemukan' });
        }

        // Insert ke kurir_registrations (status: pending)
        await db.execute(
            `INSERT INTO kurir_registrations (email, password, nama, phone, branch_id, status) VALUES (?, ?, ?, ?, ?, 'pending')`,
            [email, password, nama, phone || null, branch_id]
        );

        res.status(201).json({
            status: 'Success',
            message: `Pendaftaran kurir berhasil dikirim! Menunggu persetujuan dari Operator ${branch[0].name} (${branch[0].city}).`,
            data: { email, nama, branch: branch[0].name }
        });
    } catch (error) {
        console.error('[Kurir Register Error]', error);
        res.status(500).json({ status: 'Error', message: 'Gagal mendaftar sebagai kurir' });
    }
};

// ============================================================
// GET /auth/branches - List cabang aktif (public, untuk form registrasi)
// ============================================================
exports.getActiveBranches = async (req, res) => {
    try {
        const [rows] = await db.execute(
            `SELECT id, name, code, city FROM branches WHERE status = 'Active' ORDER BY city ASC`
        );
        res.json({ status: 'Success', data: rows });
    } catch (error) {
        console.error('[Get Active Branches Error]', error);
        res.status(500).json({ status: 'Error', message: 'Gagal mengambil data cabang' });
    }
};

// ============================================================
// GET /auth/me - Dapatkan profile saat ini
// ============================================================
exports.getProfile = async (req, res) => {
    // Data didapat dari middleware verifyAuth
    const user = req.user;
    if (!user) return res.status(401).json({ status: 'Error', message: 'Unauthorized' });

    res.json({
        status: 'Success',
        data: {
            id: user.id,
            email: user.email,
            nama: user.nama,
            role: user.role,
            branch_id: user.branch_id,
            phone: user.phone,
            photo_url: user.photo_url
        }
    });
};
