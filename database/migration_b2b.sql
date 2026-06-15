-- 1. Tabel Internal Users (Admin & Kurir)
-- Menggantikan tabel 'admins' sebelumnya
CREATE TABLE IF NOT EXISTS internal_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL, -- Di-hash menggunakan bcrypt
    nama VARCHAR(100) NOT NULL,
    role ENUM('Admin', 'Kurir') DEFAULT 'Kurir',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabel Mitra Bisnis (Marketplace/Supplier)
-- Menggantikan tabel 'api_clients' dan 'users' (UMKM) sebelumnya
CREATE TABLE IF NOT EXISTS partners (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nama_mitra VARCHAR(100) NOT NULL,
    email_pic VARCHAR(100) NOT NULL,
    api_key VARCHAR(64) UNIQUE NOT NULL, -- Plain text atau hashed token
    webhook_url VARCHAR(255),
    saldo_virtual DECIMAL(15,2) DEFAULT 0.00,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Modifikasi Tabel Orders (Menyesuaikan dengan Relasi B2B)
CREATE TABLE IF NOT EXISTS b2b_orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    awb_number VARCHAR(30) UNIQUE NOT NULL, -- Nomor resi (Waybill)
    partner_id INT NOT NULL, -- Relasi ke tabel partners
    external_order_id VARCHAR(50) NOT NULL, -- ID pesanan dari Marketplace A
    alamat_asal TEXT NOT NULL,
    alamat_tujuan TEXT NOT NULL,
    jarak DECIMAL(10,2) NOT NULL,
    total_ongkir DECIMAL(12,2) NOT NULL,
    status ENUM('Pending', 'Picked Up', 'In Transit', 'Delivered', 'Failed') DEFAULT 'Pending',
    payment_status VARCHAR(50) DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (partner_id) REFERENCES partners(id) ON DELETE CASCADE
);

-- Insert Data Dummy Internal User
INSERT IGNORE INTO internal_users (email, password, nama, role) 
VALUES ('admin@logiskita.com', '$2b$10$hashedpassword_example', 'Super Admin', 'Admin');

-- Insert Data Dummy Partner (Marketplace)
INSERT IGNORE INTO partners (nama_mitra, email_pic, api_key, webhook_url) 
VALUES ('Marketplace A', 'pic@marketplace-a.com', 'logiskita_test_9f8a8b7c6d5e4f3g2h1i', 'https://marketplace-a.com/api/webhook/logistics');
