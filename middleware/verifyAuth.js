// Middleware: Universal Authentication (Session/Token-based)
// Mendukung pengecekan multiple role
const db = require('../db');

function verifyAuth(...allowedRoles) {
    return async (req, res, next) => {
        // Ambil token dari header x-admin-token ATAU Authorization Bearer
        let token = req.headers['x-admin-token'];
        
        if (!token && req.headers['authorization']) {
            const parts = req.headers['authorization'].split(' ');
            if (parts.length === 2 && parts[0] === 'Bearer') {
                token = parts[1];
            }
        }

        if (!token) {
            return res.status(401).json({
                status: 'Error',
                message: 'Akses ditolak. Token autentikasi tidak disertakan.'
            });
        }

        try {
            // Ambil data user beserta branch_id
            const [rows] = await db.execute(
                `SELECT id, email, nama, role, branch_id FROM internal_users 
                 WHERE token = ? AND is_active = 1`,
                [token]
            );

            if (rows.length === 0) {
                return res.status(401).json({
                    status: 'Error',
                    message: 'Unauthorized: Token tidak valid atau akun dinonaktifkan.'
                });
            }

            const user = rows[0];

            // Cek role jika ada allowedRoles yang spesifik
            if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
                return res.status(403).json({
                    status: 'Error',
                    message: `Forbidden: Akses ditolak. Role Anda (${user.role}) tidak diizinkan mengakses resource ini.`
                });
            }

            // Simpan data di req
            req.user = user;
            req.admin = user; // Backward compatibility untuk controller lama

            next();
        } catch (error) {
            console.error('[Verify Auth Error]', error);
            return res.status(500).json({
                status: 'Error',
                message: 'Gagal memvalidasi token autentikasi'
            });
        }
    };
}

module.exports = verifyAuth;
