-- =====================================================
-- SEED DATA untuk LogistiKita
-- Database: logistikita_db (MySQL)
-- Stack: Node.js + mysql2
-- Jalankan SETELAH setup_db.sql
-- =====================================================

USE logistikita_db;

-- =====================================================
-- 1. INTERNAL USERS: 1 Admin + 5 Kurir
-- Password disimpan plain text (sesuai setup_db.sql existing)
-- =====================================================

-- Hapus data lama agar tidak duplikat (urutan: child → parent)
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE tracking_logs;
TRUNCATE TABLE shipments;
TRUNCATE TABLE transactions;
TRUNCATE TABLE orders;
TRUNCATE TABLE partners;
TRUNCATE TABLE internal_users;
TRUNCATE TABLE tarif;
SET FOREIGN_KEY_CHECKS = 1;

-- Admin Utama (id=1)
INSERT INTO internal_users (id, email, password, nama, role, token, is_active) VALUES
(1, 'admin@logistikita.com', 'admin123', 'Super Admin', 'Admin', 'logistikita-admin-token', TRUE);

-- 5 Kurir (id=2..6)
INSERT INTO internal_users (id, email, password, nama, role, is_active) VALUES
(2, 'andi.kurir@logistikita.com',   'kurir123', 'Andi Prasetyo',   'Kurir', TRUE),
(3, 'budi.kurir@logistikita.com',   'kurir123', 'Budi Santoso',    'Kurir', TRUE),
(4, 'citra.kurir@logistikita.com',  'kurir123', 'Citra Dewi',      'Kurir', TRUE),
(5, 'doni.kurir@logistikita.com',   'kurir123', 'Doni Firmansyah', 'Kurir', TRUE),
(6, 'eka.kurir@logistikita.com',    'kurir123', 'Eka Ramadhan',    'Kurir', TRUE);

-- =====================================================
-- 2. PARTNERS: 3 Mitra Bisnis
-- api_key format: lsk_live_<prefix>_<random 20 char hex>
-- =====================================================

INSERT INTO partners (id, nama_mitra, email_pic, api_key, smartbank_account_no, webhook_url, is_active) VALUES
(1, 'Marketplace TokoBagus',  'pic@tokobagus.com',      'lsk_live_mktA_9f8a8b7c6d5e4f3a2b1c', 'SB-7281930456', 'https://tokobagus.com/webhook/logistik',    TRUE),
(2, 'Toko Elektronik MajuJaya', 'admin@majujaya.co.id', 'lsk_live_tokB_a1b2c3d4e5f6a7b8c9d0', 'SB-3945817260', 'https://majujaya.co.id/api/webhook',        TRUE),
(3, 'Supplier SumberMakmur',  'ops@sumbermakmur.id',    'lsk_live_splC_f0e1d2c3b4a5968778a9', 'SB-6120384759', 'https://sumbermakmur.id/hooks/delivery',    TRUE);

-- =====================================================
-- 3. TARIF PENGIRIMAN (diperlukan untuk kalkulasi ongkir)
-- =====================================================

INSERT INTO tarif (kota_asal, kota_tujuan, harga_reguler, harga_express, estimasi_reguler, estimasi_express) VALUES
('Jakarta',  'Bandung',    15000, 25000, '2-3 Hari', '1 Hari'),
('Jakarta',  'Surabaya',   25000, 40000, '3-4 Hari', '1-2 Hari'),
('Bandung',  'Semarang',   20000, 35000, '2-3 Hari', '1 Hari'),
('Jakarta',  'Yogyakarta', 22000, 38000, '3-4 Hari', '1-2 Hari'),
('Surabaya', 'Bali',       18000, 30000, '2-3 Hari', '1 Hari'),
('Jakarta',  'Medan',      35000, 55000, '4-5 Hari', '2 Hari'),
('Bandung',  'Surabaya',   22000, 38000, '3-4 Hari', '1-2 Hari'),
('Semarang', 'Yogyakarta', 12000, 20000, '1-2 Hari', '1 Hari');

-- =====================================================
-- 4. SHIPMENTS: 20 Transaksi Pengiriman
--    - partner_id  → merujuk partners(id) = 1,2,3
--    - assigned_kurir_id → merujuk internal_users(id) = 2..6
--    - status & payment_status bervariasi
-- =====================================================

INSERT INTO shipments
  (awb_number, partner_id, external_order_id, sender_name, sender_address, sender_phone,
   receiver_name, receiver_address, receiver_phone, weight, service_type,
   ongkir, biaya_layanan, total_biaya, status, payment_status, smartbank_trx_id, assigned_kurir_id)
VALUES
-- === Partner 1: Marketplace TokoBagus (7 shipments) ===
('LSK20260501001', 1, 'TB-ORD-10001', 'Gudang TokoBagus Jakarta', 'Jl. Gatot Subroto No.12, Jakarta Selatan', '021-5551001',
 'Rina Kartika', 'Jl. Dago No.45, Bandung', '0812-3456-7001', 2.50, 'Reguler',
 37500, 3750, 41250, 'Delivered', 'Paid', 'SBT-20260501-001', 2),

('LSK20260501002', 1, 'TB-ORD-10002', 'Gudang TokoBagus Jakarta', 'Jl. Gatot Subroto No.12, Jakarta Selatan', '021-5551001',
 'Hendra Wijaya', 'Jl. Pemuda No.88, Surabaya', '0813-4567-8002', 5.00, 'Express',
 200000, 20000, 220000, 'Delivered', 'Paid', 'SBT-20260501-002', 3),

('LSK20260502003', 1, 'TB-ORD-10003', 'Gudang TokoBagus Jakarta', 'Jl. Gatot Subroto No.12, Jakarta Selatan', '021-5551001',
 'Siti Nurhaliza', 'Jl. Malioboro No.10, Yogyakarta', '0856-7890-1003', 1.00, 'Reguler',
 22000, 2200, 24200, 'In Transit', 'Paid', 'SBT-20260502-003', 4),

('LSK20260502004', 1, 'TB-ORD-10004', 'Gudang TokoBagus Jakarta', 'Jl. Gatot Subroto No.12, Jakarta Selatan', '021-5551001',
 'Agus Setiawan', 'Jl. Asia Afrika No.77, Bandung', '0878-1234-5004', 3.00, 'Express',
 75000, 7500, 82500, 'Picked Up', 'Paid', 'SBT-20260502-004', 2),

('LSK20260503005', 1, 'TB-ORD-10005', 'Gudang TokoBagus Jakarta', 'Jl. Gatot Subroto No.12, Jakarta Selatan', '021-5551001',
 'Dewi Lestari', 'Jl. Diponegoro No.55, Medan', '0821-6789-0005', 4.00, 'Reguler',
 140000, 14000, 154000, 'Pending', 'Pending', NULL, NULL),

('LSK20260503006', 1, 'TB-ORD-10006', 'Gudang TokoBagus Jakarta', 'Jl. Gatot Subroto No.12, Jakarta Selatan', '021-5551001',
 'Fajar Nugroho', 'Jl. Braga No.22, Bandung', '0857-2345-6006', 1.50, 'Reguler',
 22500, 2250, 24750, 'Failed', 'Failed', 'SBT-20260503-006', 5),

('LSK20260504007', 1, 'TB-ORD-10007', 'Gudang TokoBagus Jakarta', 'Jl. Gatot Subroto No.12, Jakarta Selatan', '021-5551001',
 'Galih Pratama', 'Jl. Thamrin No.99, Surabaya', '0899-3456-7007', 2.00, 'Express',
 80000, 8000, 88000, 'In Transit', 'Paid', 'SBT-20260504-007', 6),

-- === Partner 2: Toko Elektronik MajuJaya (7 shipments) ===
('LSK20260501008', 2, 'MJ-INV-20001', 'Toko MajuJaya Bandung', 'Jl. Cihampelas No.100, Bandung', '022-5552001',
 'Irfan Hakim', 'Jl. Pandanaran No.34, Semarang', '0812-8901-2008', 8.00, 'Reguler',
 160000, 16000, 176000, 'Delivered', 'Paid', 'SBT-20260501-008', 3),

('LSK20260502009', 2, 'MJ-INV-20002', 'Toko MajuJaya Bandung', 'Jl. Cihampelas No.100, Bandung', '022-5552001',
 'Joko Widodo', 'Jl. Tugu No.01, Yogyakarta', '0813-9012-3009', 3.50, 'Express',
 133000, 13300, 146300, 'Delivered', 'Paid', 'SBT-20260502-009', 4),

('LSK20260503010', 2, 'MJ-INV-20003', 'Toko MajuJaya Bandung', 'Jl. Cihampelas No.100, Bandung', '022-5552001',
 'Kartini Sari', 'Jl. Ahmad Yani No.60, Surabaya', '0856-0123-4010', 12.00, 'Reguler',
 264000, 26400, 290400, 'Picked Up', 'Paid', 'SBT-20260503-010', 5),

('LSK20260503011', 2, 'MJ-INV-20004', 'Toko MajuJaya Bandung', 'Jl. Cihampelas No.100, Bandung', '022-5552001',
 'Lukman Harun', 'Jl. Sudirman No.15, Semarang', '0878-1234-5011', 2.00, 'Reguler',
 40000, 4000, 44000, 'Pending', 'Pending', NULL, NULL),

('LSK20260504012', 2, 'MJ-INV-20005', 'Toko MajuJaya Bandung', 'Jl. Cihampelas No.100, Bandung', '022-5552001',
 'Maya Anggraini', 'Jl. Merdeka No.42, Semarang', '0821-2345-6012', 6.00, 'Express',
 210000, 21000, 231000, 'In Transit', 'Paid', 'SBT-20260504-012', 2),

('LSK20260505013', 2, 'MJ-INV-20006', 'Toko MajuJaya Bandung', 'Jl. Cihampelas No.100, Bandung', '022-5552001',
 'Nadia Putri', 'Jl. Gajah Mada No.18, Yogyakarta', '0857-3456-7013', 1.00, 'Reguler',
 20000, 2000, 22000, 'Pending', 'Pending', NULL, NULL),

('LSK20260505014', 2, 'MJ-INV-20007', 'Toko MajuJaya Bandung', 'Jl. Cihampelas No.100, Bandung', '022-5552001',
 'Oscar Lawalata', 'Jl. Veteran No.25, Semarang', '0899-4567-8014', 4.50, 'Reguler',
 90000, 9000, 99000, 'Delivered', 'Paid', 'SBT-20260505-014', 6),

-- === Partner 3: Supplier SumberMakmur (6 shipments) ===
('LSK20260501015', 3, 'SM-PO-30001', 'Gudang SumberMakmur Surabaya', 'Jl. Rungkut Industri No.5, Surabaya', '031-5553001',
 'Panji Asmoro', 'Jl. Sunset Road No.77, Bali', '0812-5678-9015', 10.00, 'Reguler',
 180000, 18000, 198000, 'Delivered', 'Paid', 'SBT-20260501-015', 4),

('LSK20260502016', 3, 'SM-PO-30002', 'Gudang SumberMakmur Surabaya', 'Jl. Rungkut Industri No.5, Surabaya', '031-5553001',
 'Qori Amelia', 'Jl. Kuta No.33, Bali', '0813-6789-0016', 7.00, 'Express',
 210000, 21000, 231000, 'In Transit', 'Paid', 'SBT-20260502-016', 5),

('LSK20260503017', 3, 'SM-PO-30003', 'Gudang SumberMakmur Surabaya', 'Jl. Rungkut Industri No.5, Surabaya', '031-5553001',
 'Rizky Maulana', 'Jl. Legian No.50, Bali', '0856-7890-1017', 15.00, 'Reguler',
 270000, 27000, 297000, 'Picked Up', 'Paid', 'SBT-20260503-017', 3),

('LSK20260504018', 3, 'SM-PO-30004', 'Gudang SumberMakmur Surabaya', 'Jl. Rungkut Industri No.5, Surabaya', '031-5553001',
 'Sandra Olivia', 'Jl. Sanur No.12, Bali', '0878-8901-2018', 3.00, 'Express',
 90000, 9000, 99000, 'Pending', 'Pending', NULL, NULL),

('LSK20260505019', 3, 'SM-PO-30005', 'Gudang SumberMakmur Surabaya', 'Jl. Rungkut Industri No.5, Surabaya', '031-5553001',
 'Taufik Hidayat', 'Jl. Nusa Dua No.8, Bali', '0821-9012-3019', 5.50, 'Reguler',
 99000, 9900, 108900, 'Delivered', 'Paid', 'SBT-20260505-019', 2),

('LSK20260506020', 3, 'SM-PO-30006', 'Gudang SumberMakmur Surabaya', 'Jl. Rungkut Industri No.5, Surabaya', '031-5553001',
 'Umi Kalsum', 'Jl. Ubud No.66, Bali', '0857-0123-4020', 2.00, 'Reguler',
 36000, 3600, 39600, 'Failed', 'Failed', 'SBT-20260506-020', 6);

-- =====================================================
-- 5. TRACKING LOGS: Riwayat untuk shipment yang sudah berjalan
-- =====================================================

-- Shipment 1 (Delivered)
INSERT INTO tracking_logs (awb_number, status, description, location, updated_by) VALUES
('LSK20260501001', 'Pending',    'Pesanan diterima dari mitra',           'Jakarta',  1),
('LSK20260501001', 'Picked Up',  'Paket diambil oleh kurir',              'Jakarta',  2),
('LSK20260501001', 'In Transit', 'Paket dalam perjalanan ke kota tujuan', 'Bandung',  2),
('LSK20260501001', 'Delivered',  'Paket berhasil diterima oleh penerima', 'Bandung',  2);

-- Shipment 2 (Delivered)
INSERT INTO tracking_logs (awb_number, status, description, location, updated_by) VALUES
('LSK20260501002', 'Pending',    'Pesanan diterima dari mitra',           'Jakarta',  1),
('LSK20260501002', 'Picked Up',  'Paket diambil oleh kurir',              'Jakarta',  3),
('LSK20260501002', 'In Transit', 'Paket dalam perjalanan ke kota tujuan', 'Surabaya', 3),
('LSK20260501002', 'Delivered',  'Paket berhasil diterima oleh penerima', 'Surabaya', 3);

-- Shipment 3 (In Transit)
INSERT INTO tracking_logs (awb_number, status, description, location, updated_by) VALUES
('LSK20260502003', 'Pending',    'Pesanan diterima dari mitra',           'Jakarta',     1),
('LSK20260502003', 'Picked Up',  'Paket diambil oleh kurir',              'Jakarta',     4),
('LSK20260502003', 'In Transit', 'Paket dalam perjalanan ke kota tujuan', 'Yogyakarta',  4);

-- Shipment 6 (Failed)
INSERT INTO tracking_logs (awb_number, status, description, location, updated_by) VALUES
('LSK20260503006', 'Pending',    'Pesanan diterima dari mitra',           'Jakarta', 1),
('LSK20260503006', 'Picked Up',  'Paket diambil oleh kurir',              'Jakarta', 5),
('LSK20260503006', 'In Transit', 'Paket dalam perjalanan ke kota tujuan', 'Bandung', 5),
('LSK20260503006', 'Failed',     'Pengiriman gagal: alamat tidak ditemukan', 'Bandung', 5);

-- Shipment 8 (Delivered)
INSERT INTO tracking_logs (awb_number, status, description, location, updated_by) VALUES
('LSK20260501008', 'Pending',    'Pesanan diterima dari mitra',           'Bandung',  1),
('LSK20260501008', 'Picked Up',  'Paket diambil oleh kurir',              'Bandung',  3),
('LSK20260501008', 'In Transit', 'Paket dalam perjalanan ke kota tujuan', 'Semarang', 3),
('LSK20260501008', 'Delivered',  'Paket berhasil diterima oleh penerima', 'Semarang', 3);

-- Shipment 15 (Delivered)
INSERT INTO tracking_logs (awb_number, status, description, location, updated_by) VALUES
('LSK20260501015', 'Pending',    'Pesanan diterima dari mitra',           'Surabaya', 1),
('LSK20260501015', 'Picked Up',  'Paket diambil oleh kurir',              'Surabaya', 4),
('LSK20260501015', 'In Transit', 'Paket dalam perjalanan ke kota tujuan', 'Bali',     4),
('LSK20260501015', 'Delivered',  'Paket berhasil diterima oleh penerima', 'Bali',     4);

-- =====================================================
-- 6. SAMPLE LEGACY ORDERS (untuk endpoint /logistikita/*)
-- =====================================================

INSERT INTO orders (order_id, user_id, alamat, jarak, ongkir, status, pembayaran) VALUES
('ORD-1001', 'SB-7281930456', 'Jl. Dago No.45, Bandung', 25.00, 125000, 'Selesai', 'Lunas'),
('ORD-1002', 'SB-7281930456', 'Jl. Pemuda No.88, Surabaya', 120.00, 600000, 'Dalam Perjalanan', 'Lunas'),
('ORD-1003', 'SB-3945817260', 'Jl. Malioboro No.10, Yogyakarta', 80.00, 400000, 'Pending', 'Belum Bayar'),
('ORD-1004', 'SB-3945817260', 'Jl. Asia Afrika No.77, Bandung', 15.00, 75000, 'Proses', 'Lunas'),
('ORD-1005', 'SB-6120384759', 'Jl. Kuta No.33, Bali', 50.00, 250000, 'Tiba', 'Lunas');

-- =====================================================
-- VERIFIKASI DATA
-- =====================================================
SELECT '--- HASIL SEED DATA ---' AS info;
SELECT CONCAT('Internal Users : ', COUNT(*)) AS hasil FROM internal_users;
SELECT CONCAT('Partners       : ', COUNT(*)) AS hasil FROM partners;
SELECT CONCAT('Tarif          : ', COUNT(*)) AS hasil FROM tarif;
SELECT CONCAT('Shipments      : ', COUNT(*)) AS hasil FROM shipments;
SELECT CONCAT('Tracking Logs  : ', COUNT(*)) AS hasil FROM tracking_logs;
SELECT CONCAT('Legacy Orders  : ', COUNT(*)) AS hasil FROM orders;

SELECT '--- DISTRIBUSI STATUS SHIPMENT ---' AS info;
SELECT status, COUNT(*) AS jumlah FROM shipments GROUP BY status;

SELECT '--- SHIPMENT PER PARTNER ---' AS info;
SELECT p.nama_mitra, COUNT(s.id) AS total_shipment
FROM partners p LEFT JOIN shipments s ON p.id = s.partner_id
GROUP BY p.id, p.nama_mitra;
