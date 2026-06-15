const db = require('../db');

exports.getDashboardData = async (req, res) => {
    const user_id = req.query.user_id;
    if (!user_id) return res.status(400).json({ status: "Error", message: "Parameter user_id diperlukan" });

    try {
        // Ambil order terakhir dari tabel orders (legacy)
        const [orders] = await db.execute('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC LIMIT 1', [user_id]);
        
        if (orders.length === 0) {
            return res.json({
                status: "Success",
                data: {
                    active_orders_count: 0,
                    last_status: '-',
                    estimasi_ongkir: 0,
                    status_pembayaran: '-',
                    latest_order: null
                }
            });
        }

        const latestOrder = orders[0];
        const [allOrders] = await db.execute('SELECT COUNT(*) as count FROM orders WHERE user_id = ? AND status != ?', [user_id, 'Selesai']);

        res.json({
            status: "Success",
            data: {
                active_orders_count: allOrders[0].count,
                last_status: latestOrder.status,
                estimasi_ongkir: latestOrder.ongkir,
                status_pembayaran: latestOrder.pembayaran,
                latest_order: latestOrder
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: "Error", message: "Gagal mengambil data dashboard" });
    }
};
