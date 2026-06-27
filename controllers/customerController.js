// ============================================================
// Customer Controller - Shipment, Payment, Tracking
// Endpoint publik untuk customer (tanpa API Key)
// ============================================================

const db = require('../db');
const { calculateDistance, isInServiceArea } = require('../services/geocodeService');
const paymentService = require('../services/paymentService');
const transitService = require('../services/transitService');
const pricingService = require('../services/PricingService');
const branchLookup = require('../services/BranchLookupService');

const ADMIN_FEE_PERCENT = 0.03; // 3%

// ============================================================
// POST /api/v1/customer/shipments - Buat Shipment Baru
// ============================================================
exports.createShipment = async (req, res) => {
    const {
        // Pengirim
        sender_name, sender_phone,
        sender_address, sender_lat, sender_lng,
        sender_district, sender_city, sender_province, sender_postal_code,
        // Penerima
        receiver_name, receiver_phone,
        receiver_address, receiver_lat, receiver_lng,
        receiver_district, receiver_city, receiver_province, receiver_postal_code,
        // Paket
        weight, rate_id, payment_method,
        // Optional
        user_id
    } = req.body;

    // --- Validasi ---
    if (!sender_name || !sender_address || !sender_lat || !sender_lng) {
        return res.status(400).json({
            status: 'Error',
            message: 'Data pengirim tidak lengkap (nama, alamat, koordinat)'
        });
    }
    if (!receiver_name || !receiver_address || !receiver_lat || !receiver_lng) {
        return res.status(400).json({
            status: 'Error',
            message: 'Data penerima tidak lengkap (nama, alamat, koordinat)'
        });
    }
    if (!rate_id) {
        return res.status(400).json({
            status: 'Error',
            message: 'Layanan pengiriman (rate_id) wajib dipilih'
        });
    }

    const oLat = parseFloat(sender_lat);
    const oLng = parseFloat(sender_lng);
    const dLat = parseFloat(receiver_lat);
    const dLng = parseFloat(receiver_lng);
    const parsedWeight = parseFloat(weight) || 1;
    // Map incoming payment_method to allowed enum values
    const method = ['bank_transfer','cod','e_wallet'].includes(payment_method) ? payment_method : 'bank_transfer';

    // Validasi area layanan
    if (!isInServiceArea(oLat, oLng) || !isInServiceArea(dLat, dLng)) {
        return res.status(400).json({
            status: 'Error',
            message: 'Lokasi berada di luar area layanan LogistiKita (Indonesia)'
        });
    }

    // Hitung jarak
    const distanceKm = calculateDistance(oLat, oLng, dLat, dLng);

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // Ambil rate dari database
        const [rates] = await connection.execute(
            'SELECT * FROM shipping_rates WHERE id = ? AND is_active = TRUE',
            [rate_id]
        );

        if (rates.length === 0) {
            await connection.rollback();
            return res.status(400).json({ status: 'Error', message: 'Layanan pengiriman tidak ditemukan' });
        }

        const rate = rates[0];

        // Validasi jarak max (Same Day)
        if (rate.max_distance !== null && distanceKm > parseFloat(rate.max_distance)) {
            await connection.rollback();
            return res.status(400).json({
                status: 'Error',
                message: `Layanan ${rate.rate_name} hanya tersedia untuk jarak maksimal ${rate.max_distance} km`
            });
        }

        // Hitung ongkir
        const { ongkirRounded, biayaAdmin, totalBiaya } = pricingService.calculatePricing(rate, distanceKm, parsedWeight);

        // Generate AWB Number
        const awbNumber = 'LSK' + Date.now().toString().slice(-10) + Math.floor(Math.random() * 100);

        // Tentukan partner_id (untuk customer langsung, gunakan partner_id = NULL)
        const partnerId = null;

        // Cari Origin dan Destination Branch berdasarkan koordinat terdekat
        const branches = await branchLookup.resolveBranches({
            senderLat: oLat, senderLng: oLng,
            receiverLat: dLat, receiverLng: dLng
        }, connection);
        let originBranchId = branches.originBranchId;
        let destBranchId = branches.destBranchId;

        // Fallback default jika tidak terdeteksi (jangan biarkan NULL)
        if (!originBranchId) originBranchId = 1; // Cabang Utama Jakarta
        if (!destBranchId) destBranchId = 2; // Cabang Utama Bandung

        // Insert shipment
        await connection.execute(
            `INSERT INTO shipments (
                awb_number, partner_id, external_order_id,
                sender_name, sender_address, sender_phone,
                sender_lat, sender_lng, sender_district, sender_city, sender_province, sender_postal_code,
                receiver_name, receiver_address, receiver_phone,
                receiver_lat, receiver_lng, receiver_district, receiver_city, receiver_province, receiver_postal_code,
                distance_km, rate_id, weight, service_type, ongkir, biaya_layanan, total_biaya,
                status, payment_status, payment_method,
                origin_branch_id, destination_branch_id, current_branch_id, final_branch_id, order_source
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                awbNumber, partnerId, user_id ? `CUST-${user_id}` : null,
                sender_name, sender_address, sender_phone || null,
                oLat, oLng, sender_district || null, sender_city || null, sender_province || null, sender_postal_code || null,
                receiver_name, receiver_address, receiver_phone || null,
                dLat, dLng, receiver_district || null, receiver_city || null, receiver_province || null, receiver_postal_code || null,
                distanceKm, rate.id, parsedWeight, rate.rate_name === 'Same Day' ? 'Express' : rate.rate_name,
                ongkirRounded, biayaAdmin, totalBiaya,
                'Pending', 'Pending', method,
                originBranchId, destBranchId, originBranchId, destBranchId, 'Customer'
            ]
        );

        // Insert tracking log awal
        await connection.execute(
            'INSERT INTO tracking_logs (awb_number, status, description, location) VALUES (?, ?, ?, ?)',
            [awbNumber, 'Pending', 'Pesanan berhasil dibuat, menunggu pembayaran', sender_city || 'Asal']
        );

        await connection.commit();

        res.status(201).json({
            status: 'Success',
            message: 'Shipment berhasil dibuat',
            data: {
                awb_number: awbNumber,
                service: rate.rate_name,
                estimasi: rate.estimasi,
                sender: {
                    name: sender_name,
                    city: sender_city,
                    address: sender_address
                },
                receiver: {
                    name: receiver_name,
                    city: receiver_city,
                    address: receiver_address
                },
                weight: parsedWeight,
                distance_km: distanceKm,
                ongkir: ongkirRounded,
                biaya_admin: biayaAdmin,
                total_biaya: totalBiaya,
                payment_method: method,
                payment_status: 'Pending',
                status: 'Pending'
            }
        });

    } catch (error) {
        await connection.rollback();
        console.error('[Create Customer Shipment Error]', error);
        res.status(500).json({ status: 'Error', message: 'Gagal membuat shipment: ' + error.message });
    } finally {
        connection.release();
    }
};

// ============================================================
// POST /api/v1/payments/pay - Simulasi Pembayaran
// ============================================================
exports.processPayment = async (req, res) => {
    const { awb_number, payment_method } = req.body;

    if (!awb_number) {
        return res.status(400).json({ status: 'Error', message: 'Nomor resi (awb_number) wajib diisi' });
    }

    // Preserve original payment_method for branching logic
    const originalMethod = payment_method || 'bank_transfer';

    // Map to DB-safe enum value for storage (DB only allows: bank_transfer, cod, e_wallet)
    let dbMethod = 'bank_transfer';
    if (['bank_transfer', 'cod', 'e_wallet'].includes(payment_method)) {
        dbMethod = payment_method;
    }
    // smartbank and api_gateway both map to bank_transfer for DB enum

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // Cari shipment
        const [shipments] = await connection.execute(
            'SELECT * FROM shipments WHERE awb_number = ? FOR UPDATE',
            [awb_number]
        );

        if (shipments.length === 0) {
            await connection.rollback();
            return res.status(404).json({ status: 'Error', message: 'Shipment tidak ditemukan' });
        }

        const shipment = shipments[0];

        if (shipment.payment_status === 'Paid') {
            await connection.rollback();
            return res.status(400).json({ status: 'Error', message: 'Shipment ini sudah dibayar' });
        }

        let paymentDetails = {};
        let shipmentStatus = 'Pending';
        let orderStatus = 'Pending';
        let transactionId = '';

        if (originalMethod === 'smartbank') {
            // Flow a: Simulasi SmartBank (lokal, tidak perlu external call)
            transactionId = 'SBT-VA-' + Date.now() + Math.floor(Math.random() * 1000);
            paymentDetails = {
                method: 'Simulasi SmartBank',
                va_number: 'VA-SBT-' + Math.floor(Math.random() * 9000000000 + 1000000000),
                status: 'Paid',
                bank: 'SmartBank Local Simulation'
            };
            shipmentStatus = 'Pending'; // Tetap pending pickup / awal
            orderStatus = 'Pending';
        } else {
            // Flow b: Pembayaran via API Gateway (External) — termasuk api_gateway dan bank_transfer
            // Susun payload terstandarisasi untuk eksternal
            const gatewayPayload = {
                transaction_id: 'GATEWAY-REQ-' + Date.now(),
                amount: parseFloat(shipment.total_biaya),
                awb_number: awb_number,
                source: 'LogistiKita',
                destination: shipment.receiver_address,
                timestamp: new Date().toISOString()
            };

            const gatewayResult = await paymentService.processExternalPayment(gatewayPayload);
            
            if (!gatewayResult.success) {
                await connection.rollback();
                return res.status(500).json({
                    status: 'Error',
                    message: gatewayResult.message || 'Gagal memproses pembayaran via API Gateway'
                });
            }

            transactionId = gatewayResult.transaction_id;
            paymentDetails = {
                method: 'API Gateway External',
                status: 'Paid',
                gateway_used: gatewayResult.simulated ? 'local_mock_gateway' : 'api_gateway',
                info: gatewayResult.message
            };
            shipmentStatus = 'Pending'; // Alur transit antar cabang: status awal selalu Pending (menunggu pickup)
            orderStatus = 'Pending'; // Di tabel orders legacy
        }

        // Resolving branch IDs if they are NULL (backward compatibility / safety fallback)
        let originBranchId = shipment.origin_branch_id;
        let destBranchId = shipment.destination_branch_id || shipment.final_branch_id;

        if (!originBranchId || !destBranchId) {
            const branches = await branchLookup.resolveBranches({
                senderLat: shipment.sender_lat, senderLng: shipment.sender_lng,
                receiverLat: shipment.receiver_lat, receiverLng: shipment.receiver_lng
            }, connection);
            if (!originBranchId) originBranchId = branches.originBranchId;
            if (!destBranchId) destBranchId = branches.destBranchId;
        }

        // Hard fallbacks jika masih gagal
        if (!originBranchId) originBranchId = 1;
        if (!destBranchId) destBranchId = 2;

        // Generate transit legs
        const legs = await transitService.generateTransitLegs(
            shipment.id, 
            awb_number, 
            originBranchId, 
            destBranchId,
            connection
        );

        // Cabang tujuan leg pertama adalah destination_branch_id berikutnya
        let nextBranchId = destBranchId;
        if (legs && legs.length > 0) {
            nextBranchId = legs[0].to_branch_id;
        }

        // Update shipment (current_branch_id = originBranchId, destination_branch_id = nextBranchId, origin_branch_id, final_branch_id)
        await connection.execute(
            'UPDATE shipments SET payment_status = ?, payment_method = ?, smartbank_trx_id = ?, status = ?, current_branch_id = ?, destination_branch_id = ?, origin_branch_id = ?, final_branch_id = ? WHERE awb_number = ?',
            ['Paid', dbMethod, transactionId, shipmentStatus, originBranchId, nextBranchId, originBranchId, destBranchId, awb_number]
        );

        // Sync legacy orders table to prevent foreign key errors and allow reports to see it
        const [existingOrders] = await connection.execute(
            'SELECT * FROM orders WHERE order_id = ?',
            [awb_number]
        );

        if (existingOrders.length === 0) {
            await connection.execute(
                'INSERT INTO orders (order_id, user_id, alamat, jarak, ongkir, status, pembayaran, transaction_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                [
                    awb_number,
                    shipment.external_order_id || 'CUSTOMER',
                    shipment.receiver_address,
                    shipment.distance_km || 0,
                    shipment.ongkir,
                    orderStatus,
                    'Lunas',
                    transactionId
                ]
            );
        } else {
            await connection.execute(
                'UPDATE orders SET pembayaran = ?, transaction_id = ?, status = ? WHERE order_id = ?',
                ['Lunas', transactionId, orderStatus, awb_number]
            );
        }

        // Hitung fee breakdown
        const feeLayanan = parseFloat(shipment.biaya_layanan || 0);
        // SmartBank has 1% bank fee, API Gateway has 0% local bank fee
        const feeBank = originalMethod === 'smartbank' ? Math.round(parseFloat(shipment.ongkir) * 0.01) : 0;
        const totalAmount = parseFloat(shipment.total_biaya) + feeBank;

        // Insert into legacy transactions report
        await connection.execute(
            'INSERT INTO transactions (transaction_id, order_id, user_id, amount, fee_layanan, fee_bank, total) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [
                transactionId,
                awb_number,
                shipment.external_order_id || 'CUSTOMER',
                parseFloat(shipment.ongkir),
                feeLayanan,
                feeBank,
                totalAmount
            ]
        );

        // Insert tracking log
        await connection.execute(
            'INSERT INTO tracking_logs (awb_number, status, description, location, branch_id) VALUES (?, ?, ?, ?, ?)',
            [
                awb_number,
                shipmentStatus,
                `Pembayaran via ${paymentDetails.method} berhasil dikonfirmasi. Status: Pending Pickup.`,
                shipment.sender_city || 'Sistem Pembayaran',
                shipment.origin_branch_id
            ]
        );

        await connection.commit();

        res.json({
            status: 'Success',
            message: 'Pembayaran berhasil dikonfirmasi',
            data: {
                awb_number: awb_number,
                transaction_id: transactionId,
                amount: parseFloat(shipment.total_biaya),
                payment: paymentDetails,
                shipment_status: shipmentStatus,
                payment_status: 'Paid'
            }
        });

    } catch (error) {
        await connection.rollback();
        console.error('[Process Payment Error]', error);
        res.status(500).json({ status: 'Error', message: 'Gagal memproses pembayaran: ' + error.message });
    } finally {
        connection.release();
    }
};

// ============================================================
// GET /api/v1/tracking/:resi - Tracking Publik
// ============================================================
exports.trackShipment = async (req, res) => {
    const { resi } = req.params;

    if (!resi) {
        return res.status(400).json({ status: 'Error', message: 'Nomor resi wajib disertakan' });
    }

    try {
        // Ambil data shipment
        const [shipments] = await db.execute(
            `SELECT s.awb_number, s.status, s.payment_status, s.payment_method,
                    s.service_type, s.weight, s.distance_km,
                    s.sender_name, s.sender_address, s.sender_city, s.sender_province,
                    s.sender_lat, s.sender_lng,
                    s.receiver_name, s.receiver_address, s.receiver_city, s.receiver_province,
                    s.receiver_lat, s.receiver_lng,
                    s.ongkir, s.biaya_layanan AS biaya_admin, s.total_biaya,
                    s.created_at, s.updated_at,
                    sr.rate_name AS service_name, sr.estimasi,
                    cb.name AS current_branch_name, cb.city AS current_branch_city,
                    db2.name AS dest_branch_name, db2.city AS dest_branch_city
             FROM shipments s
             LEFT JOIN shipping_rates sr ON s.rate_id = sr.id
             LEFT JOIN branches cb ON s.current_branch_id = cb.id
             LEFT JOIN branches db2 ON s.destination_branch_id = db2.id
             WHERE s.awb_number = ?`,
            [resi]
        );

        if (shipments.length === 0) {
            return res.status(404).json({ status: 'Error', message: 'Nomor resi tidak ditemukan' });
        }

        // Ambil tracking history
        const [logs] = await db.execute(
            `SELECT tl.status, tl.description, tl.location, tl.created_at,
                    iu.nama AS updated_by_name
             FROM tracking_logs tl
             LEFT JOIN internal_users iu ON tl.updated_by = iu.id
             WHERE tl.awb_number = ?
             ORDER BY tl.created_at ASC`,
            [resi]
        );

        res.json({
            status: 'Success',
            data: {
                shipment: shipments[0],
                tracking_history: logs,
                status_flow: ['Pending', 'Picked Up', 'In Transit', 'Delivered']
            }
        });

    } catch (error) {
        console.error('[Track Shipment Error]', error);
        res.status(500).json({ status: 'Error', message: 'Gagal mengambil data tracking' });
    }
};

// ============================================================
// POST /api/v1/webhook/status-update - Webhook Simulasi
// ============================================================
exports.webhookStatusUpdate = async (req, res) => {
    const { awb_number, status, description, location } = req.body;

    if (!awb_number || !status) {
        return res.status(400).json({ status: 'Error', message: 'awb_number dan status wajib diisi' });
    }

    const validStatuses = ['Pending', 'Picked Up', 'In Transit', 'Delivered', 'Failed'];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({
            status: 'Error',
            message: `Status tidak valid. Pilihan: ${validStatuses.join(', ')}`
        });
    }

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const [result] = await connection.execute(
            'UPDATE shipments SET status = ? WHERE awb_number = ?',
            [status, awb_number]
        );

        if (result.affectedRows === 0) {
            await connection.rollback();
            return res.status(404).json({ status: 'Error', message: 'AWB number tidak ditemukan' });
        }

        await connection.execute(
            'INSERT INTO tracking_logs (awb_number, status, description, location) VALUES (?, ?, ?, ?)',
            [awb_number, status, description || `Status diupdate ke ${status}`, location || null]
        );

        await connection.commit();

        res.json({
            status: 'Success',
            message: `Status resi ${awb_number} berhasil diupdate ke "${status}"`,
            data: { awb_number, status, timestamp: new Date().toISOString() }
        });

    } catch (error) {
        await connection.rollback();
        console.error('[Webhook Status Update Error]', error);
        res.status(500).json({ status: 'Error', message: 'Gagal mengupdate status' });
    } finally {
        connection.release();
    }
};

// ============================================================
// POST /api/v1/reports - Kirim Aduan / Laporan Kendala (Customer)
// ============================================================
exports.createReport = async (req, res) => {
    const { name, email, awb_number, report_type, message } = req.body;

    if (!name || !email || !report_type || !message) {
        return res.status(400).json({ status: 'Error', message: 'Nama, email, jenis kendala, dan pesan wajib diisi' });
    }

    try {
        await db.execute(
            `INSERT INTO admin_reports (name, email, awb_number, report_type, message) 
             VALUES (?, ?, ?, ?, ?)`,
            [name, email, awb_number || null, report_type, message]
        );
        res.status(201).json({
            status: 'Success',
            message: 'Laporan Anda telah berhasil terkirim. Tim kami akan segera menindaklanjuti.'
        });
    } catch (error) {
        console.error('[Create Report Error]', error);
        res.status(500).json({ status: 'Error', message: 'Gagal mengirim laporan: ' + error.message });
    }
};
