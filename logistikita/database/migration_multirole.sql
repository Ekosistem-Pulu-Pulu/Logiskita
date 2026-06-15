-- =====================================================
-- LogistiKita Multi-Role Migration
-- Adds: Dispatcher, Customer roles
-- Adds: delivery_proofs table
-- Adds: customer_id to shipments
-- Non-destructive: preserves existing data
-- =====================================================

USE logistik_db;

-- 1. Expand role ENUM to include Dispatcher and Customer
ALTER TABLE internal_users
MODIFY COLUMN role ENUM('Superadmin','Admin','Branch Admin','Dispatcher','Kurir','Customer') NOT NULL DEFAULT 'Customer';

-- 2. Add phone and photo_url columns
ALTER TABLE internal_users
ADD COLUMN phone VARCHAR(20) DEFAULT NULL,
ADD COLUMN photo_url VARCHAR(255) DEFAULT NULL;

-- 3. Create delivery_proofs table
CREATE TABLE IF NOT EXISTS delivery_proofs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    shipment_id INT NOT NULL,
    awb_number VARCHAR(30) NOT NULL,
    kurir_id INT NOT NULL,
    photo_url TEXT,
    recipient_name VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (shipment_id) REFERENCES shipments(id) ON DELETE CASCADE,
    FOREIGN KEY (kurir_id) REFERENCES internal_users(id) ON DELETE CASCADE
);

-- 4. Add customer_id to shipments (nullable FK)
-- Check if column exists first (MySQL 8+)
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = 'logistik_db' AND TABLE_NAME = 'shipments' AND COLUMN_NAME = 'customer_id');
SET @sql = IF(@col_exists = 0, 
    'ALTER TABLE shipments ADD COLUMN customer_id INT DEFAULT NULL', 
    'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 5. Seed Dispatcher accounts for main branches
INSERT IGNORE INTO internal_users (email, password, nama, role, branch_id, token, is_active) VALUES
('dispatch.jkt@logistikita.com', 'dispatch123', 'Dispatcher Jakarta', 'Dispatcher', 1, 'token_dispatch_jkt', 1),
('dispatch.bdg@logistikita.com', 'dispatch123', 'Dispatcher Bandung', 'Dispatcher', 2, 'token_dispatch_bdg', 1),
('dispatch.sby@logistikita.com', 'dispatch123', 'Dispatcher Surabaya', 'Dispatcher', 3, 'token_dispatch_sby', 1),
('dispatch.mdn@logistikita.com', 'dispatch123', 'Dispatcher Medan', 'Dispatcher', 4, 'token_dispatch_mdn', 1),
('dispatch.yog@logistikita.com', 'dispatch123', 'Dispatcher Yogyakarta', 'Dispatcher', 7, 'token_dispatch_yog', 1),
('dispatch.smg@logistikita.com', 'dispatch123', 'Dispatcher Semarang', 'Dispatcher', 8, 'token_dispatch_smg', 1);

-- 6. Update existing kurir to have branch_id and token
UPDATE internal_users SET branch_id = 1, token = 'token_kurir_andi' WHERE email = 'andi.kurir@logistikita.com' AND token IS NULL;
UPDATE internal_users SET branch_id = 1, token = 'token_kurir_budi' WHERE email = 'budi.kurir@logistikita.com' AND token IS NULL;
UPDATE internal_users SET branch_id = 2, token = 'token_kurir_citra' WHERE email = 'citra.kurir@logistikita.com' AND token IS NULL;
UPDATE internal_users SET branch_id = 2, token = 'token_kurir_doni' WHERE email = 'doni.kurir@logistikita.com' AND token IS NULL;
UPDATE internal_users SET branch_id = 3, token = 'token_kurir_eka' WHERE email = 'eka.kurir@logistikita.com' AND token IS NULL;

-- 7. Seed Customer accounts
INSERT IGNORE INTO internal_users (email, password, nama, role, token, is_active, phone) VALUES
('rina@gmail.com', 'customer123', 'Rina Kartika', 'Customer', 'token_cust_rina', 1, '0812-3456-7001'),
('hendra@gmail.com', 'customer123', 'Hendra Wijaya', 'Customer', 'token_cust_hendra', 1, '0813-4567-8002'),
('siti@gmail.com', 'customer123', 'Siti Nurhaliza', 'Customer', 'token_cust_siti', 1, '0856-7890-1003'),
('agus@gmail.com', 'customer123', 'Agus Setiawan', 'Customer', 'token_cust_agus', 1, '0878-1234-5004'),
('dewi@gmail.com', 'customer123', 'Dewi Lestari', 'Customer', 'token_cust_dewi', 1, '0821-6789-0005');

-- 8. Update shipments to link existing data to origin/destination branches
UPDATE shipments SET origin_branch_id = 1 WHERE sender_address LIKE '%Jakarta%' AND origin_branch_id IS NULL;
UPDATE shipments SET origin_branch_id = 2 WHERE sender_address LIKE '%Bandung%' AND origin_branch_id IS NULL;
UPDATE shipments SET origin_branch_id = 3 WHERE sender_address LIKE '%Surabaya%' AND origin_branch_id IS NULL;

UPDATE shipments SET destination_branch_id = 1 WHERE receiver_address LIKE '%Jakarta%' AND destination_branch_id IS NULL;
UPDATE shipments SET destination_branch_id = 2 WHERE receiver_address LIKE '%Bandung%' AND destination_branch_id IS NULL;
UPDATE shipments SET destination_branch_id = 3 WHERE receiver_address LIKE '%Surabaya%' AND destination_branch_id IS NULL;
UPDATE shipments SET destination_branch_id = 4 WHERE receiver_address LIKE '%Medan%' AND destination_branch_id IS NULL;
UPDATE shipments SET destination_branch_id = 7 WHERE receiver_address LIKE '%Yogyakarta%' AND destination_branch_id IS NULL;
UPDATE shipments SET destination_branch_id = 8 WHERE receiver_address LIKE '%Semarang%' AND destination_branch_id IS NULL;
UPDATE shipments SET destination_branch_id = 9 WHERE receiver_address LIKE '%Bali%' AND destination_branch_id IS NULL;
UPDATE shipments SET destination_branch_id = 9 WHERE receiver_address LIKE '%Denpasar%' AND destination_branch_id IS NULL;

-- Set current_branch_id based on status
UPDATE shipments SET current_branch_id = origin_branch_id WHERE status IN ('Pending', 'Picked Up') AND current_branch_id IS NULL;
UPDATE shipments SET current_branch_id = destination_branch_id WHERE status IN ('Delivered', 'Arrived at Destination Branch', 'Out For Delivery') AND current_branch_id IS NULL;
UPDATE shipments SET current_branch_id = origin_branch_id WHERE status = 'In Transit' AND current_branch_id IS NULL;
UPDATE shipments SET current_branch_id = origin_branch_id WHERE status = 'Failed' AND current_branch_id IS NULL;

-- Verify
SELECT '--- Multi-Role Migration Complete ---' AS result;
SELECT role, COUNT(*) AS total FROM internal_users GROUP BY role ORDER BY role;
SELECT CONCAT('Delivery Proofs Table: ', IF(COUNT(*)>=0, 'OK', 'FAIL')) AS result FROM delivery_proofs;
SELECT CONCAT('Shipments with branches: ', COUNT(*)) AS result FROM shipments WHERE origin_branch_id IS NOT NULL;
