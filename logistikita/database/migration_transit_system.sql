-- =====================================================
-- LogistiKita Transit System Migration
-- Adds: kurir_registrations, approval_status, transit columns
-- Non-destructive: preserves existing data
-- =====================================================

USE logistik_db;

-- 1. Create kurir_registrations table (pendaftaran kurir menunggu approval)
CREATE TABLE IF NOT EXISTS kurir_registrations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL,
    nama VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    branch_id INT NOT NULL,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    reviewed_by INT DEFAULT NULL,
    reviewed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_by) REFERENCES internal_users(id) ON DELETE SET NULL
);

-- 2. Add approval_status to internal_users (existing users = approved)
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = 'logistik_db' AND TABLE_NAME = 'internal_users' AND COLUMN_NAME = 'approval_status');
SET @sql = IF(@col_exists = 0, 
    'ALTER TABLE internal_users ADD COLUMN approval_status ENUM(''approved'',''pending'',''rejected'') DEFAULT ''approved''', 
    'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 3. Add sender_city and receiver_city to shipments if not exists
SET @col_exists2 = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = 'logistik_db' AND TABLE_NAME = 'shipments' AND COLUMN_NAME = 'sender_city');
SET @sql2 = IF(@col_exists2 = 0, 
    'ALTER TABLE shipments ADD COLUMN sender_city VARCHAR(100) DEFAULT NULL, ADD COLUMN receiver_city VARCHAR(100) DEFAULT NULL', 
    'SELECT 1');
PREPARE stmt2 FROM @sql2;
EXECUTE stmt2;
DEALLOCATE PREPARE stmt2;

-- 4. Seed additional kurir for other branches (Surabaya, Yogyakarta, Semarang, Denpasar)
INSERT IGNORE INTO internal_users (email, password, nama, role, branch_id, token, is_active, approval_status) VALUES
-- Surabaya (branch_id=3)
('farhan.kurir@logistikita.com', 'kurir123', 'Farhan Maulana', 'Kurir', 3, 'token_kurir_farhan', 1, 'approved'),
('gita.kurir@logistikita.com', 'kurir123', 'Gita Puspita', 'Kurir', 3, 'token_kurir_gita', 1, 'approved'),
-- Yogyakarta (branch_id=7)
('hadi.kurir@logistikita.com', 'kurir123', 'Hadi Nugroho', 'Kurir', 7, 'token_kurir_hadi', 1, 'approved'),
('indah.kurir@logistikita.com', 'kurir123', 'Indah Permata', 'Kurir', 7, 'token_kurir_indah', 1, 'approved'),
-- Semarang (branch_id=8)
('joko.kurir@logistikita.com', 'kurir123', 'Joko Susilo', 'Kurir', 8, 'token_kurir_joko', 1, 'approved'),
('kartika.kurir@logistikita.com', 'kurir123', 'Kartika Sari', 'Kurir', 8, 'token_kurir_kartika', 1, 'approved'),
-- Denpasar (branch_id=9)
('luki.kurir@logistikita.com', 'kurir123', 'Luki Wibowo', 'Kurir', 9, 'token_kurir_luki', 1, 'approved'),
('made.kurir@logistikita.com', 'kurir123', 'Made Surya', 'Kurir', 9, 'token_kurir_made', 1, 'approved'),
-- Medan (branch_id=4)
('nanda.kurir@logistikita.com', 'kurir123', 'Nanda Pratiwi', 'Kurir', 4, 'token_kurir_nanda', 1, 'approved');

-- 5. Seed sample pending kurir registrations for demo
INSERT IGNORE INTO kurir_registrations (email, password, nama, phone, branch_id, status) VALUES
('rudi.calon@gmail.com', 'kurir123', 'Rudi Hermawan', '0812-9999-0001', 1, 'pending'),
('santi.calon@gmail.com', 'kurir123', 'Santi Rahayu', '0813-8888-0002', 1, 'pending'),
('tommy.calon@gmail.com', 'kurir123', 'Tommy Kurniawan', '0856-7777-0003', 2, 'pending'),
('vera.calon@gmail.com', 'kurir123', 'Vera Anggraeni', '0878-6666-0004', 3, 'pending');

-- 6. Update existing shipments with sender/receiver city based on address
UPDATE shipments SET sender_city = 'Jakarta' WHERE sender_address LIKE '%Jakarta%' AND sender_city IS NULL;
UPDATE shipments SET sender_city = 'Bandung' WHERE sender_address LIKE '%Bandung%' AND sender_city IS NULL;
UPDATE shipments SET sender_city = 'Surabaya' WHERE sender_address LIKE '%Surabaya%' AND sender_city IS NULL;
UPDATE shipments SET receiver_city = 'Jakarta' WHERE receiver_address LIKE '%Jakarta%' AND receiver_city IS NULL;
UPDATE shipments SET receiver_city = 'Bandung' WHERE receiver_address LIKE '%Bandung%' AND receiver_city IS NULL;
UPDATE shipments SET receiver_city = 'Surabaya' WHERE receiver_address LIKE '%Surabaya%' AND receiver_city IS NULL;
UPDATE shipments SET receiver_city = 'Yogyakarta' WHERE receiver_address LIKE '%Yogyakarta%' AND receiver_city IS NULL;
UPDATE shipments SET receiver_city = 'Semarang' WHERE receiver_address LIKE '%Semarang%' AND receiver_city IS NULL;
UPDATE shipments SET receiver_city = 'Medan' WHERE receiver_address LIKE '%Medan%' AND receiver_city IS NULL;
UPDATE shipments SET receiver_city = 'Bali' WHERE receiver_address LIKE '%Bali%' AND receiver_city IS NULL;

-- Verify
SELECT '--- Transit System Migration Complete ---' AS result;
SELECT CONCAT('Kurir Registrations Table: ', COUNT(*)) AS result FROM kurir_registrations;
SELECT CONCAT('New Kurir Seeded: ', COUNT(*)) AS result FROM internal_users WHERE email LIKE '%kurir@logistikita.com' AND email NOT IN ('andi.kurir@logistikita.com','budi.kurir@logistikita.com','citra.kurir@logistikita.com','doni.kurir@logistikita.com','eka.kurir@logistikita.com');
SELECT role, COUNT(*) AS total FROM internal_users GROUP BY role ORDER BY role;
