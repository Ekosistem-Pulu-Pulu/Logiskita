const db = require('../db');
const smartbankService = require('../services/smartbankService');

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
    
    const parsedJarak = parseFloat(jarak);
    const parsedBerat = parseFloat(berat) || 1;
    const biayaDasar = parsedJarak * 5000;
    const biayaBerat = parsedBerat * 2000;
    const estimasi_biaya = biayaDasar + biayaBerat;
    const biaya_layanan = estimasi_biaya * 0.03;
    const total = estimasi_biaya + biaya_layanan;

    res.json({ 
        status: "Success", 
        data: { 
            estimasi_biaya, 
            biaya_layanan,
            total,
            user_id,
            detail: {
                jarak: parsedJarak,
                berat: parsedBerat,
                tarif_per_km: 5000,
                tarif_per_kg: 2000
            }
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
    const ongkir = parseFloat(jarak) * 5000;
    
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
    
    // Panggil service external SmartBank
    const bankResponse = await smartbankService.processPayment(user_id, order_id, parsedAmount);

    if (bankResponse.success) {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();
            
            const [orderRows] = await connection.execute('SELECT * FROM orders WHERE order_id = ? AND user_id = ? FOR UPDATE', [order_id, user_id]);
            if (orderRows.length === 0) throw new Error("Order ID tidak valid atau bukan milik user ini");
            if (orderRows[0].pembayaran === 'Lunas') throw new Error("Order ini sudah dibayar sebelumnya");
            
            await connection.execute('UPDATE orders SET pembayaran = ?, transaction_id = ? WHERE order_id = ?', ['Lunas', bankResponse.transaction_id, order_id]);
            
            const feeLayanan = parsedAmount * 0.03;
            const feeBank = parsedAmount * 0.01;
            const total = parsedAmount + feeLayanan + feeBank;
            
            await connection.execute(
                'INSERT INTO transactions (transaction_id, order_id, user_id, amount, fee_layanan, fee_bank, total) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [bankResponse.transaction_id, order_id, user_id, parsedAmount, feeLayanan, feeBank, total]
            );
            
            await connection.commit();
            
            res.json({ 
                status: "Success", 
                message: "Pembayaran via SmartBank Berhasil",
                transaction_id: bankResponse.transaction_id,
                data: {
                    order_id, amount: parsedAmount, fee_layanan: feeLayanan, total
                }
            });
        } catch (error) {
            await connection.rollback();
            console.error(error);
            res.status(500).json({ status: "Error", message: error.message || "Gagal menyimpan transaksi ke database" });
        } finally {
            connection.release();
        }
    } else {
        res.status(500).json({ status: "Error", message: "Gagal integrasi SmartBank" });
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
    
    const parsedAmount = parseFloat(amount);
    const feeLayanan = parsedAmount * 0.03;
    res.json({ 
        status: "Success", 
        data: { 
            biaya_layanan: feeLayanan, 
            nominal_asli: parsedAmount,
            total_setelah_fee: parsedAmount + feeLayanan,
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

    const parsedBerat = parseFloat(berat) || 1;

    try {
        const [rows] = await db.execute(
            'SELECT * FROM tarif WHERE LOWER(kota_asal) = LOWER(?) AND LOWER(kota_tujuan) = LOWER(?)',
            [kota_asal, kota_tujuan]
        );

        if (rows.length === 0) {
            const defaultReguler = parsedBerat * 15000;
            const defaultExpress = parsedBerat * 25000;
            return res.json({
                status: 'Success',
                message: 'Rute tidak ditemukan, menggunakan tarif default',
                data: {
                    kota_asal, kota_tujuan, berat: parsedBerat,
                    options: [
                        { service: 'Reguler', harga: defaultReguler, biaya_layanan: defaultReguler * 0.03, total: defaultReguler * 1.03, estimasi: '3-5 Hari' },
                        { service: 'Express', harga: defaultExpress, biaya_layanan: defaultExpress * 0.03, total: defaultExpress * 1.03, estimasi: '1-2 Hari' }
                    ]
                }
            });
        }

        const tarif = rows[0];
        const hargaReguler = tarif.harga_reguler * parsedBerat;
        const hargaExpress = tarif.harga_express * parsedBerat;

        res.json({
            status: 'Success',
            data: {
                kota_asal, kota_tujuan, berat: parsedBerat,
                options: [
                    { service: 'Reguler', harga: hargaReguler, biaya_layanan: hargaReguler * 0.03, total: hargaReguler * 1.03, estimasi: tarif.estimasi_reguler },
                    { service: 'Express', harga: hargaExpress, biaya_layanan: hargaExpress * 0.03, total: hargaExpress * 1.03, estimasi: tarif.estimasi_express }
                ]
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: "Error", message: "Gagal mengambil data tarif" });
    }
};

// ============================================================
// 6. Bayar Ongkir Sekaligus (Microservices Architecture)
// Input: order_id, user_id, nominal (grand total inklusif fee)
// Proses:
//   1. Validasi input dari frontend
//   2. Susun payload JSON (order_id, user_id, nominal)
//   3. Kirim POST ke URL API Gateway/Integrator milik kelompok lain
//   4. Jika gateway tidak tersedia, fallback ke SmartBank service lokal
//   5. Update status pembayaran di database
// Output: Status dari API Gateway dikembalikan ke frontend
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

    // Susun payload JSON untuk API Gateway
    const gatewayPayload = {
        order_id: order_id,
        user_id: user_id,
        nominal: parsedNominal,
        source: 'LogistiKita',
        timestamp: new Date().toISOString()
    };

    console.log(`\n[Bayar Ongkir] =============================================`);
    console.log(`[Bayar Ongkir] Order: ${order_id} | User: ${user_id} | Nominal: ${parsedNominal}`);
    console.log(`[Bayar Ongkir] Payload ke Gateway:`, JSON.stringify(gatewayPayload));

    // -------------------------------------------------------
    // WAJIB: Kirim payload via POST ke API Gateway/Integrator
    // Ganti URL di bawah dengan URL API Gateway kelompok lain
    // -------------------------------------------------------
    const API_GATEWAY_URL = process.env.API_GATEWAY_URL || 'http://localhost:4000/api/gateway/payment';
    
    let gatewayResponse = null;
    let useLocalFallback = false;

    try {
        console.log(`[Bayar Ongkir] Mengirim ke API Gateway: ${API_GATEWAY_URL}`);
        
        const axios = require('axios');
        const response = await axios.post(API_GATEWAY_URL, gatewayPayload, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 10000 // 10 detik timeout
        });

        gatewayResponse = response.data;
        console.log(`[Bayar Ongkir] Response dari Gateway:`, JSON.stringify(gatewayResponse));

    } catch (gatewayError) {
        console.warn(`[Bayar Ongkir] API Gateway tidak tersedia: ${gatewayError.message}`);
        console.log(`[Bayar Ongkir] Menggunakan fallback SmartBank Service lokal...`);
        useLocalFallback = true;
    }

    // Fallback: gunakan SmartBank service lokal jika Gateway tidak tersedia
    if (useLocalFallback) {
        try {
            gatewayResponse = await smartbankService.processPayment(user_id, order_id, parsedNominal);
            console.log(`[Bayar Ongkir] Fallback SmartBank response:`, JSON.stringify(gatewayResponse));
        } catch (fallbackError) {
            console.error(`[Bayar Ongkir] Fallback juga gagal:`, fallbackError.message);
            return res.status(500).json({ 
                status: "Error", 
                message: "Gagal menghubungi API Gateway dan SmartBank Service" 
            });
        }
    }

    // Cek apakah pembayaran berhasil (dari gateway atau fallback)
    const isSuccess = gatewayResponse && (gatewayResponse.success || gatewayResponse.status === 'Success');

    if (isSuccess) {
        const transactionId = gatewayResponse.transaction_id || 'TRX-' + Date.now();
        
        // Update database: set pembayaran = 'Lunas'
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();
            
            const [orderRows] = await connection.execute(
                'SELECT * FROM orders WHERE order_id = ? AND user_id = ? FOR UPDATE', 
                [order_id, user_id]
            );
            
            if (orderRows.length === 0) {
                throw new Error("Order ID tidak valid atau bukan milik user ini");
            }
            if (orderRows[0].pembayaran === 'Lunas') {
                throw new Error("Order ini sudah dibayar sebelumnya");
            }
            
            // Update status pembayaran
            await connection.execute(
                'UPDATE orders SET pembayaran = ?, transaction_id = ? WHERE order_id = ?', 
                ['Lunas', transactionId, order_id]
            );
            
            // Hitung fee breakdown
            const ongkirAsli = parsedNominal / 1.03; // Reverse calculate base ongkir
            const feeLayanan = parsedNominal - ongkirAsli;
            const feeBank = ongkirAsli * 0.01;
            
            // Catat transaksi
            await connection.execute(
                'INSERT INTO transactions (transaction_id, order_id, user_id, amount, fee_layanan, fee_bank, total) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [transactionId, order_id, user_id, ongkirAsli, feeLayanan, feeBank, parsedNominal]
            );
            
            await connection.commit();
            
            console.log(`[Bayar Ongkir] ✅ Pembayaran berhasil disimpan ke database`);
            console.log(`[Bayar Ongkir] =============================================\n`);
            
            res.json({
                status: "Success",
                message: "Pembayaran via SmartBank Berhasil",
                transaction_id: transactionId,
                gateway_used: useLocalFallback ? 'local_smartbank' : 'api_gateway',
                data: {
                    order_id,
                    user_id,
                    nominal: parsedNominal,
                    fee_layanan: feeLayanan,
                    transaction_id: transactionId
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
    } else {
        console.log(`[Bayar Ongkir] ❌ Pembayaran ditolak oleh gateway/service`);
        res.status(500).json({ 
            status: "Error", 
            message: gatewayResponse?.message || "Pembayaran ditolak oleh SmartBank/Gateway" 
        });
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
