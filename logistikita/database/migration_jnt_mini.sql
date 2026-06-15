-- =====================================================
-- LogistiKita JNT-Mini Migration
-- Database: logistik_db
-- Adds: shipping_rates table, coordinate columns on shipments
-- =====================================================

USE logistik_db;

-- =====================================================
-- 1. TABEL BARU: SHIPPING RATES
-- Tarif pengiriman berbasis jarak (Haversine)
-- =====================================================
CREATE TABLE IF NOT EXISTS shipping_rates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    rate_name VARCHAR(50) NOT NULL,
    base_price DECIMAL(12,2) NOT NULL DEFAULT 0,
    price_per_km DECIMAL(12,2) NOT NULL DEFAULT 0,
    price_per_kg DECIMAL(12,2) NOT NULL DEFAULT 0,
    min_distance DECIMAL(10,2) DEFAULT 0,
    max_distance DECIMAL(10,2) DEFAULT NULL,
    estimasi VARCHAR(30) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 2. ALTER SHIPMENTS: Tambah kolom koordinat & detail alamat
-- =====================================================
ALTER TABLE shipments
    ADD COLUMN sender_lat DECIMAL(10,7) NULL AFTER sender_phone,
    ADD COLUMN sender_lng DECIMAL(10,7) NULL AFTER sender_lat,
    ADD COLUMN sender_district VARCHAR(100) NULL AFTER sender_lng,
    ADD COLUMN sender_city VARCHAR(100) NULL AFTER sender_district,
    ADD COLUMN sender_province VARCHAR(100) NULL AFTER sender_city,
    ADD COLUMN sender_postal_code VARCHAR(10) NULL AFTER sender_province,
    ADD COLUMN receiver_lat DECIMAL(10,7) NULL AFTER receiver_phone,
    ADD COLUMN receiver_lng DECIMAL(10,7) NULL AFTER receiver_lat,
    ADD COLUMN receiver_district VARCHAR(100) NULL AFTER receiver_lng,
    ADD COLUMN receiver_city VARCHAR(100) NULL AFTER receiver_district,
    ADD COLUMN receiver_province VARCHAR(100) NULL AFTER receiver_city,
    ADD COLUMN receiver_postal_code VARCHAR(10) NULL AFTER receiver_province,
    ADD COLUMN distance_km DECIMAL(10,2) NULL AFTER receiver_postal_code,
    ADD COLUMN rate_id INT NULL AFTER distance_km,
    ADD COLUMN payment_method ENUM('bank_transfer','cod','e_wallet') DEFAULT 'bank_transfer' AFTER payment_status;

-- =====================================================
-- 3. SEED DATA: Shipping Rates
-- =====================================================
INSERT INTO shipping_rates (rate_name, base_price, price_per_km, price_per_kg, min_distance, max_distance, estimasi, is_active) VALUES
('Reguler',   8000,   50,  2000, 0,    NULL, '2-4 Hari',   TRUE),
('Express',   15000,  80,  3500, 0,    NULL, '1-2 Hari',   TRUE),
('Same Day',  25000,  150, 5000, 0,    50,   '6-12 Jam',   TRUE);

-- =====================================================
-- VERIFIKASI
-- =====================================================
SELECT '--- Migration JNT-Mini berhasil! ---' AS result;
SELECT * FROM shipping_rates;
