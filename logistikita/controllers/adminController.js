const db = require('../db');

exports.login = async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ status: 'Error', message: 'Username dan password harus diisi' });
    }

    try {
        // Query ke tabel internal_users dengan role Admin, login pakai email sebagai username
        const [rows] = await db.execute(
            'SELECT * FROM internal_users WHERE email = ? AND password = ? AND role = ?',
            [username, password, 'Admin']
        );
        if (rows.length > 0) {
            return res.json({ status: 'Success', token: rows[0].token, message: 'Login berhasil' });
        }
        return res.status(401).json({ status: 'Error', message: 'Username atau password salah' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'Error', message: 'Gagal melakukan login admin' });
    }
};

exports.getOrders = async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM shipments ORDER BY created_at DESC');
        res.json({ status: "Success", data: rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: "Error", message: "Gagal mengambil data orders" });
    }
};

exports.updateStatus = async (req, res) => {
    const { order_id, status_baru } = req.body;
    if (!order_id || !status_baru) return res.status(400).json({ status: 'Error', message: 'Parameter tidak lengkap' });
    
    try {
        const [result] = await db.execute('UPDATE shipments SET status = ? WHERE awb_number = ?', [status_baru, order_id]);
        if (result.affectedRows === 0) return res.status(404).json({ status: "Error", message: "Order tidak ditemukan" });
        
        res.json({ status: "Success", message: `Status order ${order_id} diupdate ke ${status_baru}` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: "Error", message: "Gagal mengupdate status order" });
    }
};
