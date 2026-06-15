-- =====================================================
-- LogistiKita Database Schema (Unified & Clean)
-- Database: logistikita_db
-- Stack: Node.js + Express + mysql2
-- =====================================================

CREATE DATABASE IF NOT EXISTS logistikita_db;
USE logistikita_db;

-- =====================================================
-- TABEL 1: INTERNAL USERS (Admin & Kurir)
-- Autentikasi: Session/Token web login (email + password)
-- =====================================================
CREATE TABLE IF NOT EXISTS internal_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    nama VARCHAR(100) NOT NULL,
    role ENUM('Admin', 'Kurir') NOT NULL DEFAULT 'Kurir',
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
-- DATA SEED: Default Users & Partners
-- =====================================================

-- Default Admin (password: admin123)
INSERT IGNORE INTO internal_users (email, password, nama, role, token) 
VALUES ('admin@logistikita.com', 'admin123', 'Super Admin', 'Admin', 'logistikita-admin-token');

-- Default Kurir
INSERT IGNORE INTO internal_users (email, password, nama, role) 
VALUES ('kurir1@logistikita.com', 'kurir123', 'Andi Kurir', 'Kurir');

-- Default Partner (Marketplace A)
INSERT IGNORE INTO partners (nama_mitra, email_pic, api_key, smartbank_account_no, webhook_url) 
VALUES ('Marketplace TokoBagus', 'pic@tokobagus.com', 'lsk_live_mktA_9f8a8b7c6d5e4f3a2b1c', 'SB-ACC-001', 'https://tokobagus.com/webhook/logistik');

-- Default Partner (Supplier B)
INSERT IGNORE INTO partners (nama_mitra, email_pic, api_key, smartbank_account_no, webhook_url) 
VALUES ('Supplier MajuJaya', 'admin@majujaya.co.id', 'lsk_live_splB_a1b2c3d4e5f6g7h8i9j0', 'SB-ACC-002', 'https://majujaya.co.id/api/webhook');

-- Contoh Tarif
INSERT IGNORE INTO tarif (kota_asal, kota_tujuan, harga_reguler, harga_express, estimasi_reguler, estimasi_express) VALUES
('Jakarta', 'Bandung', 15000, 25000, '2-3 Hari', '1 Hari'),
('Jakarta', 'Surabaya', 25000, 40000, '3-4 Hari', '1-2 Hari'),
('Bandung', 'Semarang', 20000, 35000, '2-3 Hari', '1 Hari'),
('Jakarta', 'Yogyakarta', 22000, 38000, '3-4 Hari', '1-2 Hari'),
('Surabaya', 'Bali', 18000, 30000, '2-3 Hari', '1 Hari');

SELECT 'Database logistikita_db berhasil dibuat!' AS result;
