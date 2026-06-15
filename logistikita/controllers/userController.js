const db = require('../db');

exports.login = async (req, res) => {
    const { user_id, password } = req.body;
    
    if (!user_id || !password) {
        return res.status(400).json({ status: 'Error', message: 'User ID dan password harus diisi' });
    }

    try {
        // 1. SIMULASI LOGIN UMKM (Integrasi Dummy SmartBank)
        // Jika user_id diawali dengan 'SB-' (SmartBank Account) dan password 'umkm123'
        if (user_id.startsWith('SB-') && password === 'umkm123') {
            const userToken = `token-umkm-${user_id}-${Date.now()}`;
            return res.json({ 
                status: 'Success', 
                message: 'Login UMKM via SmartBank berhasil',
                data: {
                    user_id: user_id,
                    nama: `UMKM ${user_id}`,
                    token: userToken
                }
            });
        }

        // 2. LOGIN KURIR (Internal Users)
        const [rows] = await db.execute(
            'SELECT id, email, nama, role FROM internal_users WHERE email = ? AND password = ? AND role = ?',
            [user_id, password, 'Kurir']
        );
        
        if (rows.length > 0) {
            const userToken = `token-${rows[0].id}-${Date.now()}`;
            return res.json({ 
                status: 'Success', 
                message: 'Login Kurir berhasil',
                data: {
                    user_id: rows[0].email,
                    nama: rows[0].nama,
                    token: userToken
                }
            });
        }
        
        return res.status(401).json({ status: 'Error', message: 'User ID atau password salah' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'Error', message: 'Gagal melakukan login user' });
    }
};
