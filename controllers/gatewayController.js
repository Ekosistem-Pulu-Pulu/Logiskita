// Controller: Gateway Masuk (Halaman 1)
// Menangkap SmartBank ID dari form, mencari profil UMKM & riwayat pengiriman
const db = require('../db');

// ============================================================
// Daftar profil UMKM yang terdaftar (simulasi data dari SmartBank)
// Dalam arsitektur nyata, data ini berasal dari API SmartBank
// ============================================================
const UMKM_PROFILES = {
    'SB-714240035': {
        smartbank_id: 'SB-714240035',
        nama_usaha: 'Asha Clean',
        pemilik: 'Wa Ode Nur Alia',
        jenis_usaha: 'Produk Kebersihan & Perawatan Rumah',
        alamat_penjemputan: 'Jl. Mawar No. 12, Kel. Anduonohu, Kec. Poasia, Kota Kendari, Sulawesi Tenggara',
        no_telepon: '0852-4123-7714',
        email: 'ashaclean@gmail.com',
        smartbank_account: 'SB-714240035'
    },
    'SB-7281930456': {
        smartbank_id: 'SB-7281930456',
        nama_usaha: 'TokoBagus Outlet',
        pemilik: 'Ahmad Rizki',
        jenis_usaha: 'Marketplace Retail',
        alamat_penjemputan: 'Jl. Gatot Subroto No.12, Jakarta Selatan',
        no_telepon: '021-5551001',
        email: 'outlet@tokobagus.com',
        smartbank_account: 'SB-7281930456'
    },
    'SB-3945817260': {
        smartbank_id: 'SB-3945817260',
        nama_usaha: 'MajuJaya Elektronik',
        pemilik: 'Budi Hartono',
        jenis_usaha: 'Distributor Elektronik',
        alamat_penjemputan: 'Jl. Cihampelas No.100, Bandung',
        no_telepon: '022-5552001',
        email: 'admin@majujaya.co.id',
        smartbank_account: 'SB-3945817260'
    },
    'SB-6120384759': {
        smartbank_id: 'SB-6120384759',
        nama_usaha: 'SumberMakmur Supply',
        pemilik: 'Dewi Sartika',
        jenis_usaha: 'Supplier Bahan Baku',
        alamat_penjemputan: 'Jl. Rungkut Industri No.5, Surabaya',
        no_telepon: '031-5553001',
        email: 'ops@sumbermakmur.id',
        smartbank_account: 'SB-6120384759'
    }
};

// ============================================================
// POST /gateway/lookup - Cari profil UMKM & riwayat pengiriman
// Input: user_id (SmartBank ID) via req.body
// Output: Profil UMKM + daftar transaksi pengiriman
// ============================================================
exports.lookupUMKM = async (req, res) => {
    const { user_id } = req.body;

    if (!user_id || typeof user_id !== 'string' || user_id.trim() === '') {
        return res.status(400).json({
            status: 'Error',
            message: 'ID SmartBank wajib diisi'
        });
    }

    const trimmedId = user_id.trim();

    // 1. Cari profil UMKM berdasarkan SmartBank ID
    const profil = UMKM_PROFILES[trimmedId];

    if (!profil) {
        return res.status(404).json({
            status: 'Error',
            message: 'ID SmartBank tidak ditemukan. Pastikan Anda menggunakan ID resmi dari SmartBank.'
        });
    }

    try {
        // 2. Cari riwayat pengiriman dari tabel orders (legacy)
        const [orders] = await db.execute(
            'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
            [trimmedId]
        );

        // 3. Hitung statistik
        const totalOrders = orders.length;
        const activeOrders = orders.filter(o => o.status !== 'Selesai').length;
        const totalOngkir = orders.reduce((sum, o) => sum + parseFloat(o.ongkir || 0), 0);
        const latestOrder = orders.length > 0 ? orders[0] : null;

        res.json({
            status: 'Success',
            message: `Selamat datang, ${profil.nama_usaha}!`,
            data: {
                profil_umkm: profil,
                statistik: {
                    total_pengiriman: totalOrders,
                    pengiriman_aktif: activeOrders,
                    total_ongkir: totalOngkir,
                    status_terakhir: latestOrder ? latestOrder.status : '-',
                    pembayaran_terakhir: latestOrder ? latestOrder.pembayaran : '-'
                },
                riwayat_pengiriman: orders.map((order, index) => ({
                    no: index + 1,
                    order_id: order.order_id,
                    tanggal_request: order.created_at,
                    alamat_tujuan: order.alamat,
                    ongkir: order.ongkir,
                    status_pembayaran: order.pembayaran,
                    status_pengiriman: order.status
                })),
                latest_order: latestOrder
            }
        });

    } catch (error) {
        console.error('[Gateway Lookup Error]', error);
        res.status(500).json({
            status: 'Error',
            message: 'Gagal mengambil data dari database'
        });
    }
};

// ============================================================
// GET /gateway/profiles - Daftar ID untuk referensi (dev only)
// ============================================================
exports.listProfiles = (req, res) => {
    const ids = Object.keys(UMKM_PROFILES).map(id => ({
        smartbank_id: id,
        nama_usaha: UMKM_PROFILES[id].nama_usaha,
        pemilik: UMKM_PROFILES[id].pemilik
    }));
    res.json({ status: 'Success', data: ids });
};
