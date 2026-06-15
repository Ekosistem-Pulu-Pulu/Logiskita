-- =====================================================
-- LogistiKita Database Schema (Unified & Clean)
-- Database: logistik_db
-- Stack: Node.js + Express + mysql2
-- Laragon (MySQL 8.x)
-- =====================================================

CREATE DATABASE IF NOT EXISTS logistik_db;
USE logistik_db;

-- =====================================================
-- TABEL 1: INTERNAL USERS (Admin, Kurir, Superadmin)
-- Autentikasi: Session/Token web login (email + password)
-- =====================================================
CREATE TABLE IF NOT EXISTS internal_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    nama VARCHAR(100) NOT NULL,
    role ENUM('Admin', 'Kurir', 'Superadmin') NOT NULL DEFAULT 'Kurir',
    token VARCHAR(255) UNIQUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =====================================================
-- TABEL 2: PARTNERS (Mitra Bisnis - Marketplace/Supplier)
-- Autentikasi: API Key (setara Laravel Sanctum)
-- TIDAK punya halaman login. Interaksi murni via API.
-- =====================================================
CREATE TABLE IF NOT EXISTS partners (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nama_mitra VARCHAR(100) NOT NULL,
    email_pic VARCHAR(100),
    api_key VARCHAR(128) UNIQUE NOT NULL,
    smartbank_account_no VARCHAR(50) NOT NULL,
    webhook_url VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =====================================================
-- TABEL 3: TARIF PENGIRIMAN
-- =====================================================
CREATE TABLE IF NOT EXISTS tarif (
    id INT AUTO_INCREMENT PRIMARY KEY,
    kota_asal VARCHAR(100) NOT NULL,
    kota_tujuan VARCHAR(100) NOT NULL,
    harga_reguler DECIMAL(12,2) NOT NULL,
    harga_express DECIMAL(12,2) NOT NULL,
    estimasi_reguler VARCHAR(20),
    estimasi_express VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- TABEL 4: SHIPMENTS (Pesanan Pengiriman B2B)
-- Dibuat oleh Mitra via API, dikelola oleh Admin/Kurir
-- =====================================================
CREATE TABLE IF NOT EXISTS shipments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    awb_number VARCHAR(30) UNIQUE NOT NULL,
    partner_id INT NOT NULL,
    external_order_id VARCHAR(50),
    sender_name VARCHAR(100) NOT NULL,
    sender_address TEXT NOT NULL,
    sender_phone VARCHAR(20),
    receiver_name VARCHAR(100) NOT NULL,
    receiver_address TEXT NOT NULL,
    receiver_phone VARCHAR(20),
    weight DECIMAL(10,2) NOT NULL DEFAULT 1.00,
    service_type ENUM('Reguler', 'Express') DEFAULT 'Reguler',
    ongkir DECIMAL(12,2) NOT NULL,
    biaya_layanan DECIMAL(12,2) DEFAULT 0,
    total_biaya DECIMAL(12,2) NOT NULL,
    status ENUM('Pending','Picked Up','In Transit','Delivered','Failed') DEFAULT 'Pending',
    payment_status ENUM('Pending','Paid','Failed') DEFAULT 'Pending',
    smartbank_trx_id VARCHAR(50),
    assigned_kurir_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (partner_id) REFERENCES partners(id),
    FOREIGN KEY (assigned_kurir_id) REFERENCES internal_users(id)
);

-- =====================================================
-- TABEL 5: ORDERS (Legacy - Pesanan dari User Langsung)
-- Digunakan oleh endpoint /logistikita/* (legacy)
-- =====================================================
CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id VARCHAR(30) UNIQUE NOT NULL,
    user_id VARCHAR(100) NOT NULL,
    alamat TEXT NOT NULL,
    jarak DECIMAL(10,2) NOT NULL,
    ongkir DECIMAL(12,2) NOT NULL,
    status ENUM('Pending','Proses','Dalam Perjalanan','Tiba','Selesai') DEFAULT 'Pending',
    pembayaran ENUM('Belum Bayar','Lunas','Gagal') DEFAULT 'Belum Bayar',
    transaction_id VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =====================================================
-- TABEL 6: TRANSACTIONS (Riwayat Pembayaran Legacy)
-- =====================================================
CREATE TABLE IF NOT EXISTS transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    transaction_id VARCHAR(50) UNIQUE NOT NULL,
    order_id VARCHAR(30) NOT NULL,
    user_id VARCHAR(100) NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    fee_layanan DECIMAL(12,2) DEFAULT 0,
    fee_bank DECIMAL(12,2) DEFAULT 0,
    total DECIMAL(12,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE
);

-- =====================================================
-- TABEL 7: TRACKING LOGS (Riwayat Perjalanan Barang)
-- =====================================================
CREATE TABLE IF NOT EXISTS tracking_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    awb_number VARCHAR(30) NOT NULL,
    status VARCHAR(50) NOT NULL,
    description TEXT,
    location VARCHAR(100),
    updated_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (awb_number) REFERENCES shipments(awb_number) ON DELETE CASCADE,
    FOREIGN KEY (updated_by) REFERENCES internal_users(id)
);

-- =====================================================
-- TABEL 8: API LOGS (Monitoring Request & Response Partner)
-- =====================================================
CREATE TABLE IF NOT EXISTS api_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    partner_id INT,
    endpoint VARCHAR(255) NOT NULL,
    method VARCHAR(10) NOT NULL,
    request_payload TEXT,
    response_status INT NOT NULL,
    response_body TEXT,
    execution_time_ms INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (partner_id) REFERENCES partners(id) ON DELETE SET NULL
);

-- =====================================================
-- TABEL 9: SHIPMENT WEBHOOKS (Riwayat Pengiriman Webhook ke Partner)
-- =====================================================
CREATE TABLE IF NOT EXISTS shipment_webhooks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    shipment_id INT NOT NULL,
    partner_id INT NOT NULL,
    event VARCHAR(50) NOT NULL,
    payload TEXT,
    response_status INT,
    success BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (shipment_id) REFERENCES shipments(id) ON DELETE CASCADE,
    FOREIGN KEY (partner_id) REFERENCES partners(id) ON DELETE CASCADE
);


-- =====================================================
-- DATA SEED
-- =====================================================

-- =====================================================
-- 1. INTERNAL USERS: 1 Admin + 1 Superadmin + 5 Kurir
-- =====================================================

INSERT INTO internal_users (id, email, password, nama, role, token, is_active) VALUES
(1, 'admin@logistikita.com', 'admin123', 'Super Admin', 'Admin', 'logistikita-admin-token', TRUE),
(2, 'superadmin@logistikita.com', 'superadmin123', 'Super Administrator', 'Superadmin', 'logistikita-superadmin-token-2026', TRUE),
(3, 'andi.kurir@logistikita.com', 'kurir123', 'Andi Prasetyo', 'Kurir', NULL, TRUE),
(4, 'budi.kurir@logistikita.com', 'kurir123', 'Budi Santoso', 'Kurir', NULL, TRUE),
(5, 'citra.kurir@logistikita.com', 'kurir123', 'Citra Dewi', 'Kurir', NULL, TRUE),
(6, 'doni.kurir@logistikita.com', 'kurir123', 'Doni Firmansyah', 'Kurir', NULL, TRUE),
(7, 'eka.kurir@logistikita.com', 'kurir123', 'Eka Ramadhan', 'Kurir', NULL, TRUE);

-- =====================================================
-- 2. PARTNERS: 3 Mitra Bisnis
-- =====================================================

INSERT INTO partners (id, nama_mitra, email_pic, api_key, smartbank_account_no, webhook_url, is_active) VALUES
(1, 'Marketplace TokoBagus',    'pic@tokobagus.com',      'lsk_live_mktA_9f8a8b7c6d5e4f3a2b1c', 'SB-7281930456', 'https://tokobagus.com/webhook/logistik',    TRUE),
(2, 'Toko Elektronik MajuJaya', 'admin@majujaya.co.id',   'lsk_live_tokB_a1b2c3d4e5f6a7b8c9d0', 'SB-3945817260', 'https://majujaya.co.id/api/webhook',        TRUE),
(3, 'Supplier SumberMakmur',    'ops@sumbermakmur.id',    'lsk_live_splC_f0e1d2c3b4a5968778a9', 'SB-6120384759', 'https://sumbermakmur.id/hooks/delivery',    TRUE);

-- =====================================================
-- 3. TARIF PENGIRIMAN
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
-- =====================================================

INSERT INTO shipments
  (awb_number, partner_id, external_order_id, sender_name, sender_address, sender_phone,
   receiver_name, receiver_address, receiver_phone, weight, service_type,
   ongkir, biaya_layanan, total_biaya, status, payment_status, smartbank_trx_id, assigned_kurir_id)
VALUES
-- === Partner 1: Marketplace TokoBagus (7 shipments) ===
('LSK20260501001', 1, 'TB-ORD-10001', 'Gudang TokoBagus Jakarta', 'Jl. Gatot Subroto No.12, Jakarta Selatan', '021-5551001',
 'Rina Kartika', 'Jl. Dago No.45, Bandung', '0812-3456-7001', 2.50, 'Reguler',
 37500, 3750, 41250, 'Delivered', 'Paid', 'SBT-20260501-001', 3),

('LSK20260501002', 1, 'TB-ORD-10002', 'Gudang TokoBagus Jakarta', 'Jl. Gatot Subroto No.12, Jakarta Selatan', '021-5551001',
 'Hendra Wijaya', 'Jl. Pemuda No.88, Surabaya', '0813-4567-8002', 5.00, 'Express',
 200000, 20000, 220000, 'Delivered', 'Paid', 'SBT-20260501-002', 4),

('LSK20260502003', 1, 'TB-ORD-10003', 'Gudang TokoBagus Jakarta', 'Jl. Gatot Subroto No.12, Jakarta Selatan', '021-5551001',
 'Siti Nurhaliza', 'Jl. Malioboro No.10, Yogyakarta', '0856-7890-1003', 1.00, 'Reguler',
 22000, 2200, 24200, 'In Transit', 'Paid', 'SBT-20260502-003', 5),

('LSK20260502004', 1, 'TB-ORD-10004', 'Gudang TokoBagus Jakarta', 'Jl. Gatot Subroto No.12, Jakarta Selatan', '021-5551001',
 'Agus Setiawan', 'Jl. Asia Afrika No.77, Bandung', '0878-1234-5004', 3.00, 'Express',
 75000, 7500, 82500, 'Picked Up', 'Paid', 'SBT-20260502-004', 3),

('LSK20260503005', 1, 'TB-ORD-10005', 'Gudang TokoBagus Jakarta', 'Jl. Gatot Subroto No.12, Jakarta Selatan', '021-5551001',
 'Dewi Lestari', 'Jl. Diponegoro No.55, Medan', '0821-6789-0005', 4.00, 'Reguler',
 140000, 14000, 154000, 'Pending', 'Pending', NULL, NULL),

('LSK20260503006', 1, 'TB-ORD-10006', 'Gudang TokoBagus Jakarta', 'Jl. Gatot Subroto No.12, Jakarta Selatan', '021-5551001',
 'Fajar Nugroho', 'Jl. Braga No.22, Bandung', '0857-2345-6006', 1.50, 'Reguler',
 22500, 2250, 24750, 'Failed', 'Failed', 'SBT-20260503-006', 6),

('LSK20260504007', 1, 'TB-ORD-10007', 'Gudang TokoBagus Jakarta', 'Jl. Gatot Subroto No.12, Jakarta Selatan', '021-5551001',
 'Galih Pratama', 'Jl. Thamrin No.99, Surabaya', '0899-3456-7007', 2.00, 'Express',
 80000, 8000, 88000, 'In Transit', 'Paid', 'SBT-20260504-007', 7),

-- === Partner 2: Toko Elektronik MajuJaya (7 shipments) ===
('LSK20260501008', 2, 'MJ-INV-20001', 'Toko MajuJaya Bandung', 'Jl. Cihampelas No.100, Bandung', '022-5552001',
 'Irfan Hakim', 'Jl. Pandanaran No.34, Semarang', '0812-8901-2008', 8.00, 'Reguler',
 160000, 16000, 176000, 'Delivered', 'Paid', 'SBT-20260501-008', 4),

('LSK20260502009', 2, 'MJ-INV-20002', 'Toko MajuJaya Bandung', 'Jl. Cihampelas No.100, Bandung', '022-5552001',
 'Joko Widodo', 'Jl. Tugu No.01, Yogyakarta', '0813-9012-3009', 3.50, 'Express',
 133000, 13300, 146300, 'Delivered', 'Paid', 'SBT-20260502-009', 5),

('LSK20260503010', 2, 'MJ-INV-20003', 'Toko MajuJaya Bandung', 'Jl. Cihampelas No.100, Bandung', '022-5552001',
 'Kartini Sari', 'Jl. Ahmad Yani No.60, Surabaya', '0856-0123-4010', 12.00, 'Reguler',
 264000, 26400, 290400, 'Picked Up', 'Paid', 'SBT-20260503-010', 6),

('LSK20260503011', 2, 'MJ-INV-20004', 'Toko MajuJaya Bandung', 'Jl. Cihampelas No.100, Bandung', '022-5552001',
 'Lukman Harun', 'Jl. Sudirman No.15, Semarang', '0878-1234-5011', 2.00, 'Reguler',
 40000, 4000, 44000, 'Pending', 'Pending', NULL, NULL),

('LSK20260504012', 2, 'MJ-INV-20005', 'Toko MajuJaya Bandung', 'Jl. Cihampelas No.100, Bandung', '022-5552001',
 'Maya Anggraini', 'Jl. Merdeka No.42, Semarang', '0821-2345-6012', 6.00, 'Express',
 210000, 21000, 231000, 'In Transit', 'Paid', 'SBT-20260504-012', 3),

('LSK20260505013', 2, 'MJ-INV-20006', 'Toko MajuJaya Bandung', 'Jl. Cihampelas No.100, Bandung', '022-5552001',
 'Nadia Putri', 'Jl. Gajah Mada No.18, Yogyakarta', '0857-3456-7013', 1.00, 'Reguler',
 20000, 2000, 22000, 'Pending', 'Pending', NULL, NULL),

('LSK20260505014', 2, 'MJ-INV-20007', 'Toko MajuJaya Bandung', 'Jl. Cihampelas No.100, Bandung', '022-5552001',
 'Oscar Lawalata', 'Jl. Veteran No.25, Semarang', '0899-4567-8014', 4.50, 'Reguler',
 90000, 9000, 99000, 'Delivered', 'Paid', 'SBT-20260505-014', 7),

-- === Partner 3: Supplier SumberMakmur (6 shipments) ===
('LSK20260501015', 3, 'SM-PO-30001', 'Gudang SumberMakmur Surabaya', 'Jl. Rungkut Industri No.5, Surabaya', '031-5553001',
 'Panji Asmoro', 'Jl. Sunset Road No.77, Bali', '0812-5678-9015', 10.00, 'Reguler',
 180000, 18000, 198000, 'Delivered', 'Paid', 'SBT-20260501-015', 5),

('LSK20260502016', 3, 'SM-PO-30002', 'Gudang SumberMakmur Surabaya', 'Jl. Rungkut Industri No.5, Surabaya', '031-5553001',
 'Qori Amelia', 'Jl. Kuta No.33, Bali', '0813-6789-0016', 7.00, 'Express',
 210000, 21000, 231000, 'In Transit', 'Paid', 'SBT-20260502-016', 6),

('LSK20260503017', 3, 'SM-PO-30003', 'Gudang SumberMakmur Surabaya', 'Jl. Rungkut Industri No.5, Surabaya', '031-5553001',
 'Rizky Maulana', 'Jl. Legian No.50, Bali', '0856-7890-1017', 15.00, 'Reguler',
 270000, 27000, 297000, 'Picked Up', 'Paid', 'SBT-20260503-017', 4),

('LSK20260504018', 3, 'SM-PO-30004', 'Gudang SumberMakmur Surabaya', 'Jl. Rungkut Industri No.5, Surabaya', '031-5553001',
 'Sandra Olivia', 'Jl. Sanur No.12, Bali', '0878-8901-2018', 3.00, 'Express',
 90000, 9000, 99000, 'Pending', 'Pending', NULL, NULL),

('LSK20260505019', 3, 'SM-PO-30005', 'Gudang SumberMakmur Surabaya', 'Jl. Rungkut Industri No.5, Surabaya', '031-5553001',
 'Taufik Hidayat', 'Jl. Nusa Dua No.8, Bali', '0821-9012-3019', 5.50, 'Reguler',
 99000, 9900, 108900, 'Delivered', 'Paid', 'SBT-20260505-019', 3),

('LSK20260506020', 3, 'SM-PO-30006', 'Gudang SumberMakmur Surabaya', 'Jl. Rungkut Industri No.5, Surabaya', '031-5553001',
 'Umi Kalsum', 'Jl. Ubud No.66, Bali', '0857-0123-4020', 2.00, 'Reguler',
 36000, 3600, 39600, 'Failed', 'Failed', 'SBT-20260506-020', 7);

-- =====================================================
-- 5. TRACKING LOGS
-- =====================================================

-- Shipment 1 (Delivered)
INSERT INTO tracking_logs (awb_number, status, description, location, updated_by) VALUES
('LSK20260501001', 'Pending',    'Pesanan diterima dari mitra',           'Jakarta',  1),
('LSK20260501001', 'Picked Up',  'Paket diambil oleh kurir',              'Jakarta',  3),
('LSK20260501001', 'In Transit', 'Paket dalam perjalanan ke kota tujuan', 'Bandung',  3),
('LSK20260501001', 'Delivered',  'Paket berhasil diterima oleh penerima', 'Bandung',  3);

-- Shipment 2 (Delivered)
INSERT INTO tracking_logs (awb_number, status, description, location, updated_by) VALUES
('LSK20260501002', 'Pending',    'Pesanan diterima dari mitra',           'Jakarta',  1),
('LSK20260501002', 'Picked Up',  'Paket diambil oleh kurir',              'Jakarta',  4),
('LSK20260501002', 'In Transit', 'Paket dalam perjalanan ke kota tujuan', 'Surabaya', 4),
('LSK20260501002', 'Delivered',  'Paket berhasil diterima oleh penerima', 'Surabaya', 4);

-- Shipment 3 (In Transit)
INSERT INTO tracking_logs (awb_number, status, description, location, updated_by) VALUES
('LSK20260502003', 'Pending',    'Pesanan diterima dari mitra',           'Jakarta',     1),
('LSK20260502003', 'Picked Up',  'Paket diambil oleh kurir',              'Jakarta',     5),
('LSK20260502003', 'In Transit', 'Paket dalam perjalanan ke kota tujuan', 'Yogyakarta',  5);

-- Shipment 6 (Failed)
INSERT INTO tracking_logs (awb_number, status, description, location, updated_by) VALUES
('LSK20260503006', 'Pending',    'Pesanan diterima dari mitra',              'Jakarta', 1),
('LSK20260503006', 'Picked Up',  'Paket diambil oleh kurir',                 'Jakarta', 6),
('LSK20260503006', 'In Transit', 'Paket dalam perjalanan ke kota tujuan',    'Bandung', 6),
('LSK20260503006', 'Failed',     'Pengiriman gagal: alamat tidak ditemukan', 'Bandung', 6);

-- Shipment 8 (Delivered)
INSERT INTO tracking_logs (awb_number, status, description, location, updated_by) VALUES
('LSK20260501008', 'Pending',    'Pesanan diterima dari mitra',           'Bandung',  1),
('LSK20260501008', 'Picked Up',  'Paket diambil oleh kurir',              'Bandung',  4),
('LSK20260501008', 'In Transit', 'Paket dalam perjalanan ke kota tujuan', 'Semarang', 4),
('LSK20260501008', 'Delivered',  'Paket berhasil diterima oleh penerima', 'Semarang', 4);

-- Shipment 15 (Delivered)
INSERT INTO tracking_logs (awb_number, status, description, location, updated_by) VALUES
('LSK20260501015', 'Pending',    'Pesanan diterima dari mitra',           'Surabaya', 1),
('LSK20260501015', 'Picked Up',  'Paket diambil oleh kurir',              'Surabaya', 5),
('LSK20260501015', 'In Transit', 'Paket dalam perjalanan ke kota tujuan', 'Bali',     5),
('LSK20260501015', 'Delivered',  'Paket berhasil diterima oleh penerima', 'Bali',     5);

-- =====================================================
-- 6. LEGACY ORDERS
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
SELECT '--- Database logistik_db berhasil dibuat! ---' AS result;
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
