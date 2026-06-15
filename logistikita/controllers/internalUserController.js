const db = require('../db');
const crypto = require('crypto');

// ============================================================
// GET /internal/users - Lihat Semua Internal Users (Khusus Superadmin)
// ============================================================
exports.getAllUsers = async (req, res) => {
    try {
        const [rows] = await db.execute(
            'SELECT id, email, nama, role, is_active, created_at FROM internal_users ORDER BY created_at DESC'
        );
        res.json({ status: 'Success', data: rows });
    } catch (error) {
        console.error('[Get Users Error]', error);
        res.status(500).json({ status: 'Error', message: 'Gagal mengambil data pengguna' });
    }
};

// ============================================================
// POST /internal/users - Tambah Pengguna Baru (Khusus Superadmin)
// ============================================================
exports.createUser = async (req, res) => {
    const { email, password, nama, role } = req.body;

    if (!email || !password || !nama || !role) {
        return res.status(400).json({ status: 'Error', message: 'Semua field wajib diisi' });
    }

    if (!['Admin', 'Kurir', 'Superadmin'].includes(role)) {
        return res.status(400).json({ status: 'Error', message: 'Role tidak valid' });
    }

    // Generate token for all internal users
    let token = 'logistikita-' + role.toLowerCase() + '-' + crypto.randomBytes(16).toString('hex');

    try {
        await db.execute(
            'INSERT INTO internal_users (email, password, nama, role, token) VALUES (?, ?, ?, ?, ?)',
            [email, password, nama, role, token]
        );
        
        res.status(201).json({
            status: 'Success',
            message: `Pengguna ${nama} (${role}) berhasil ditambahkan`
        });
    } catch (error) {
        console.error('[Create User Error]', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ status: 'Error', message: 'Email sudah terdaftar' });
        }
        res.status(500).json({ status: 'Error', message: 'Gagal menambahkan pengguna' });
    }
};

// ============================================================
// DELETE /internal/users/:id - Hapus/Nonaktifkan Pengguna
// ============================================================
exports.deleteUser = async (req, res) => {
    const { id } = req.params;
    
    // Prevent deleting oneself
    if (req.admin && req.admin.id == id) {
        return res.status(400).json({ status: 'Error', message: 'Tidak dapat menghapus akun Anda sendiri' });
    }

    try {
        const [result] = await db.execute('DELETE FROM internal_users WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ status: 'Error', message: 'Pengguna tidak ditemukan' });
        }
        res.json({ status: 'Success', message: 'Pengguna berhasil dihapus' });
    } catch (error) {
        console.error('[Delete User Error]', error);
        res.status(500).json({ status: 'Error', message: 'Gagal menghapus pengguna' });
    }
};
