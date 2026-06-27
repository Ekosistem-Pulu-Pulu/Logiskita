const db = require('../db');
const pricingService = require('../services/PricingService');
const paymentGatewayService = require('../services/PaymentGatewayService');

// ============================================================
// 1. Biaya Pengiriman (Hitung Ongkir)
// Input: user_id (dari SmartBank), berat barang, titik koordinat asal & tujuan
// Proses: Validasi input dan perhitungan ongkir berdasarkan jarak & berat
// Output: Status transaksi dan data nilai tagihan (payment request)
// Endpoint: /logistikita/biaya_pengiriman
// ============================================================
exports.biayaPengiriman = (req, res) => {
    const { jarak, user_id, berat } = req.body;
    
    if (!user_id) return res.status(400).json({ status: "Error", message: "Parameter user_id wajib disertakan" });
    if (jarak === undefined || isNaN(parseFloat(jarak)) || parseFloat(jarak) <= 0) {
        return res.status(400).json({ status: "Error", message: "Parameter jarak harus valid" });
    }

    const hasil = pricingService.hitungOngkirByJarak(jarak, berat);

    res.json({ 
        status: "Success", 
        data: { 
            estimasi_biaya: hasil.estimasi_biaya, 
            biaya_layanan: hasil.biaya_layanan,
            total: hasil.total,
            user_id,
            detail: hasil.detail
        } 
    });
};

// ============================================================
// 2. Request Pengiriman (Menerima Pesanan)
// Input: user_id dan parameter detail paket
// Proses: Validasi input, pemrosesan permintaan, penyimpanan ke DB
// Output: Status sukses dan data hasil pendaftaran pengiriman
// Endpoint: /logistikita/request_pengiriman
// ============================================================
exports.requestPengiriman = async (req, res) => {
    const { user_id, alamat, jarak } = req.body;
    
    // Validasi ketat
    if (!user_id || typeof user_id !== 'string') {
        return res.status(400).json({ status: "Error", message: "Parameter user_id tidak valid atau tidak ada" });
    }
    if (!alamat || typeof alamat !== 'string') {
        return res.status(400).json({ status: "Error", message: "Parameter alamat tidak valid atau tidak ada" });
    }
    if (jarak === undefined || isNaN(parseFloat(jarak)) || parseFloat(jarak) <= 0) {
        return res.status(400).json({ status: "Error", message: "Parameter jarak harus berupa angka lebih besar dari 0" });
    }

    const order_id = "ORD-" + Math.floor(Math.random() * 10000);
    const hasil = pricingService.hitungOngkirByJarak(jarak);
    const ongkir = hasil.estimasi_biaya;
    
    try {
        await db.execute(
            'INSERT INTO orders (order_id, user_id, alamat, jarak, ongkir, status, pembayaran) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [order_id, user_id, alamat, parseFloat(jarak), ongkir, 'Pending', 'Belum Bayar']
        );
        
        const [rows] = await db.execute('SELECT * FROM orders WHERE order_id = ?', [order_id]);
        res.json({ status: "Success", data: rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: "Error", message: "Gagal menyimpan request pengiriman" });
    }
};

// ============================================================
// 3. Pembayaran Logistik (Integrasi SmartBank)
// Input: user_id dan detail tagihan ongkir
// Proses: Validasi data dan kirim instruksi ke API SmartBank
// Output: Konfirmasi status pembayaran sukses atau gagal
// Endpoint: /logistikita/pembayaran_logistik
// ============================================================
exports.pembayaranLogistik = async (req, res) => {
    const { order_id, user_id, amount } = req.body;

    if (!user_id || !order_id || amount === undefined || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
        return res.status(400).json({ status: "Error", message: "Parameter pembayaran tidak lengkap atau tidak valid" });
    }

    const parsedAmount = parseFloat(amount);
    const API_GATEWAY_URL = process.env.API_GATEWAY_URL || 'http://localhost:4000/api/gateway/payment';

    // Step 1: Proses pembayaran via Gateway (dengan fallback otomatis)
    const paymentResult = await paymentGatewayService.processPaymentWithFallback(
        { order_id, user_id, nominal: parsedAmount },
        API_GATEWAY_URL
    );

    if (!paymentResult.success) {
        return res.status(500).json({ status: "Error", message: "Gagal integrasi SmartBank/Gateway" });
    }

    // Step 2: Simpan transaksi ke database
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const txResult = await paymentGatewayService.savePaymentTransaction(connection, {
            order_id, user_id, nominal: parsedAmount,
            transaction_id: paymentResult.transaction_id
        });

        await connection.commit();

        res.json({ 
            status: "Success", 
            message: "Pembayaran via SmartBank Berhasil",
            transaction_id: paymentResult.transaction_id,
            data: {
                order_id, amount: parsedAmount, fee_layanan: txResult.feeLayanan, total: txResult.total
            }
        });
    } catch (error) {
        await connection.rollback();
        console.error(error);
        res.status(500).json({ status: "Error", message: error.message || "Gagal menyimpan transaksi ke database" });
    } finally {
        connection.release();
    }
};

// ============================================================
// 4. Biaya Layanan Logistik (Pemotongan Fee)
// Input: user_id dan parameter biaya layanan
// Proses: Validasi input dan eksekusi pemotongan fee layanan (5%)
// Output: Status dan data hasil pemotongan biaya layanan
// Endpoint: /logistikita/biaya_layanan_logistik
// ============================================================
exports.biayaLayananLogistik = (req, res) => {
    const { amount, user_id } = req.body;
    
    if (!user_id) return res.status(400).json({ status: "Error", message: "Parameter user_id wajib disertakan" });
    if (amount === undefined || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
        return res.status(400).json({ status: "Error", message: "Parameter amount harus valid" });
    }
    
    const hasil = pricingService.hitungFeeLayanan(amount);
    res.json({ 
        status: "Success", 
        data: { 
            biaya_layanan: hasil.biaya_layanan, 
            nominal_asli: hasil.nominal_asli,
            total_setelah_fee: hasil.total_setelah_fee,
            user_id 
        } 
    });
};

// ============================================================
// 5. Tracking Status (Update Pengiriman)
// Input: user_id dan kode pelacakan unik (order_id)
// Proses: Validasi input dan pengambilan data posisi paket terkini
// Output: Informasi status terbaru keberadaan dan kondisi paket
// Endpoint: /logistikita/tracking_status
// ============================================================
exports.trackingStatus = async (req, res) => {
    const { order_id, user_id } = req.body;
    
    if (!user_id) return res.status(400).json({ status: "Error", message: "Parameter user_id wajib disertakan" });
    if (!order_id) return res.status(400).json({ status: "Error", message: "Parameter order_id wajib disertakan" });

    try {
        const [rows] = await db.execute('SELECT order_id, status, user_id FROM orders WHERE order_id = ? AND user_id = ?', [order_id, user_id]);
        if (rows.length === 0) return res.status(404).json({ status: "Error", message: "Order ID tidak ditemukan atau Anda tidak memiliki akses" });
        
        res.json({ status: "Success", data: { order_id: rows[0].order_id, status: rows[0].status } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: "Error", message: "Gagal mengambil status pengiriman" });
    }
};

// ============================================================
// Get Detail Order
// ============================================================
exports.getOrderDetail = async (req, res) => {
    const { order_id } = req.params;
    try {
        const [rows] = await db.execute('SELECT * FROM orders WHERE order_id = ?', [order_id]);
        if (rows.length === 0) return res.status(404).json({ status: "Error", message: "Order ID tidak ditemukan" });
        
        res.json({ status: "Success", data: rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: "Error", message: "Gagal mengambil data order" });
    }
};

// ============================================================
// Quick Tracking (Landing Page - tanpa login)
// Input: awb_number via URL params
// Output: Status pengiriman dan tracking history
// ============================================================
exports.quickTracking = async (req, res) => {
    const { awb_number } = req.params;
    
    if (!awb_number) {
        return res.status(400).json({ status: "Error", message: "Nomor resi wajib disertakan" });
    }

    try {
        const [shipment] = await db.execute(
            'SELECT awb_number, status, service_type, sender_address, receiver_address, weight, created_at FROM shipments WHERE awb_number = ?',
            [awb_number]
        );

        if (shipment.length === 0) {
            return res.status(404).json({ status: "Error", message: "Nomor resi tidak ditemukan" });
        }

        const [logs] = await db.execute(
            'SELECT status, description, location, created_at FROM tracking_logs WHERE awb_number = ? ORDER BY created_at ASC',
            [awb_number]
        );

        res.json({
            status: "Success",
            data: {
                shipment: shipment[0],
                tracking_history: logs
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: "Error", message: "Gagal mengambil data tracking" });
    }
};

// ============================================================
// Cek Ongkir (Landing Page Widget)
// Input: kota_asal, kota_tujuan, berat
// Output: Estimasi biaya untuk Reguler & Express
// ============================================================
exports.cekOngkir = async (req, res) => {
    const { kota_asal, kota_tujuan, berat } = req.body;

    if (!kota_asal || !kota_tujuan) {
        return res.status(400).json({ status: "Error", message: "Kota asal dan kota tujuan wajib diisi" });
    }

    try {
        const hasil = await pricingService.hitungOngkirByKota(kota_asal, kota_tujuan, berat);

        res.json({
            status: 'Success',
            message: hasil.source === 'default' ? 'Rute tidak ditemukan, menggunakan tarif default' : undefined,
            data: {
                kota_asal, kota_tujuan, berat: parseFloat(berat) || 1,
                options: hasil.options
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: "Error", message: "Gagal mengambil data tarif" });
    }
};

// ============================================================
// 6. Bayar Ongkir Sekaligus (Refactored - Service Layer Pattern)
// Controller hanya menangani validasi input dan respons HTTP.
// Logika gateway, fallback, dan transaksi DB didelegasikan ke service.
// Endpoint: POST /api/bayar-ongkir
// ============================================================
exports.bayarOngkir = async (req, res) => {
    const { order_id, user_id, nominal } = req.body;

    // Validasi input
    if (!order_id || typeof order_id !== 'string') {
        return res.status(400).json({ status: "Error", message: "Parameter order_id wajib dan harus berupa string" });
    }
    if (!user_id || typeof user_id !== 'string') {
        return res.status(400).json({ status: "Error", message: "Parameter user_id wajib dan harus berupa string" });
    }
    if (nominal === undefined || isNaN(parseFloat(nominal)) || parseFloat(nominal) <= 0) {
        return res.status(400).json({ status: "Error", message: "Parameter nominal harus berupa angka positif" });
    }

    const parsedNominal = parseFloat(nominal);
    const API_GATEWAY_URL = process.env.API_GATEWAY_URL || 'http://localhost:4000/api/gateway/payment';

    // Step 1: Proses pembayaran via Gateway (dengan fallback otomatis)
    const paymentResult = await paymentGatewayService.processPaymentWithFallback(
        { order_id, user_id, nominal: parsedNominal },
        API_GATEWAY_URL
    );

    if (!paymentResult.success) {
        return res.status(500).json({ 
            status: "Error", 
            message: paymentResult.message || "Pembayaran ditolak oleh SmartBank/Gateway" 
        });
    }

    // Step 2: Simpan transaksi ke database
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const txResult = await paymentGatewayService.savePaymentTransaction(connection, {
            order_id, user_id, nominal: parsedNominal,
            transaction_id: paymentResult.transaction_id
        });

        await connection.commit();

        console.log(`[Bayar Ongkir] ✅ Pembayaran berhasil disimpan ke database`);

        res.json({
            status: "Success",
            message: "Pembayaran via SmartBank Berhasil",
            transaction_id: paymentResult.transaction_id,
            gateway_used: paymentResult.gateway_used,
            data: {
                order_id, user_id,
                nominal: parsedNominal,
                fee_layanan: txResult.feeLayanan,
                transaction_id: paymentResult.transaction_id
            }
        });
    } catch (dbError) {
        await connection.rollback();
        console.error(`[Bayar Ongkir] ❌ Database error:`, dbError.message);
        res.status(500).json({ 
            status: "Error", 
            message: dbError.message || "Gagal menyimpan transaksi ke database" 
        });
    } finally {
        connection.release();
    }
};


// ============================================================
// 7. Riwayat Pembayaran (Transaction History)
// Endpoint: GET /logistikita/transactions/:user_id
// ============================================================
exports.getTransactionHistory = async (req, res) => {
    const { user_id } = req.params;
    if (!user_id) return res.status(400).json({ status: "Error", message: "Parameter user_id wajib disertakan" });
    try {
        const [transactions] = await db.execute(
            `SELECT t.id, t.transaction_id, t.order_id, t.user_id,
                t.amount, t.fee_layanan, t.fee_bank, t.total, t.created_at,
                o.alamat, o.jarak, o.status AS status_pengiriman, o.pembayaran AS status_pembayaran
            FROM transactions t
            LEFT JOIN orders o ON t.order_id = o.order_id
            WHERE t.user_id = ?
            ORDER BY t.created_at DESC`,
            [user_id]
        );
        const summary = {
            total_transaksi: transactions.length,
            total_bayar: transactions.reduce((s, t) => s + parseFloat(t.total || 0), 0),
            total_ongkir: transactions.reduce((s, t) => s + parseFloat(t.amount || 0), 0),
            total_fee: transactions.reduce((s, t) => s + parseFloat(t.fee_layanan || 0) + parseFloat(t.fee_bank || 0), 0),
        };
        res.json({ status: "Success", data: { user_id, summary, transactions } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: "Error", message: "Gagal mengambil riwayat transaksi" });
    }
};

// ============================================================
// 8. Detail Satu Transaksi
// Endpoint: GET /logistikita/transaction/:transaction_id
// ============================================================
exports.getTransactionDetail = async (req, res) => {
    const { transaction_id } = req.params;
    if (!transaction_id) return res.status(400).json({ status: "Error", message: "Parameter transaction_id wajib" });
    try {
        const [rows] = await db.execute(
            `SELECT t.*, o.alamat, o.jarak, o.status AS status_pengiriman,
                o.pembayaran AS status_pembayaran, o.created_at AS tanggal_order
            FROM transactions t
            LEFT JOIN orders o ON t.order_id = o.order_id
            WHERE t.transaction_id = ?`,
            [transaction_id]
        );
        if (rows.length === 0) return res.status(404).json({ status: "Error", message: "Transaksi tidak ditemukan" });
        res.json({ status: "Success", data: rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: "Error", message: "Gagal mengambil detail transaksi" });
    }
};
