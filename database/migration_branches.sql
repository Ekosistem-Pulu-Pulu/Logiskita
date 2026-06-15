-- Migration Script: Add Branches, Update internal_users, tracking_logs, and shipments
USE logistik_db;

-- 1. Create Branches Table
CREATE TABLE IF NOT EXISTS branches (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(10) UNIQUE NOT NULL,
    city VARCHAR(100) NOT NULL,
    address TEXT,
    lat DECIMAL(10, 7),
    lng DECIMAL(10, 7),
    capacity INT DEFAULT 1000,
    active_couriers INT DEFAULT 0,
    status ENUM('Active', 'Inactive', 'Maintenance') DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Insert Initial Branches
INSERT IGNORE INTO branches (name, code, city, lat, lng) VALUES
('Cabang Utama Jakarta', 'CGK-01', 'Jakarta', -6.2088, 106.8456),
('Cabang Utama Bandung', 'BDO-01', 'Bandung', -6.9175, 107.6191),
('Cabang Utama Surabaya', 'SUB-01', 'Surabaya', -7.2504, 112.7688),
('Cabang Utama Medan', 'KNO-01', 'Medan', 3.5952, 98.6722),
('Cabang Utama Makassar', 'UPG-01', 'Makassar', -5.1477, 119.4327),
('Cabang Utama Balikpapan', 'BPN-01', 'Balikpapan', -1.2379, 116.8529),
('Cabang Utama Yogyakarta', 'JOG-01', 'Yogyakarta', -7.7956, 110.3695),
('Cabang Utama Semarang', 'SRG-01', 'Semarang', -6.9667, 110.4167),
('Cabang Utama Denpasar', 'DPS-01', 'Denpasar', -8.6705, 115.2126),
('Cabang Utama Palembang', 'PLM-01', 'Palembang', -2.9909, 104.7566),
('Cabang Utama Pontianak', 'PNK-01', 'Pontianak', -0.0227, 109.3333),
('Cabang Utama Manado', 'MDC-01', 'Manado', 1.4931, 124.8413);

-- 3. Alter internal_users to add branch_id and 'Branch Admin' role
ALTER TABLE internal_users
MODIFY COLUMN role ENUM('Admin', 'Kurir', 'Superadmin', 'Branch Admin') NOT NULL DEFAULT 'Kurir';

ALTER TABLE internal_users
ADD COLUMN branch_id INT DEFAULT NULL,
ADD FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL;

-- 4. Create dummy operator accounts for each branch
INSERT INTO internal_users (email, password, nama, role, branch_id, token, is_active)
SELECT 
    CONCAT('op_', LOWER(REPLACE(city, ' ', '')), '@logistikita.com'), 
    'operator123', 
    CONCAT('Operator ', city), 
    'Branch Admin', 
    id, 
    CONCAT('token_op_', LOWER(REPLACE(city, ' ', ''))),
    1 
FROM branches;

-- 5. Alter shipments for transit logic
ALTER TABLE shipments
ADD COLUMN origin_branch_id INT DEFAULT NULL,
ADD COLUMN destination_branch_id INT DEFAULT NULL,
ADD COLUMN current_branch_id INT DEFAULT NULL,
ADD FOREIGN KEY (origin_branch_id) REFERENCES branches(id) ON DELETE SET NULL,
ADD FOREIGN KEY (destination_branch_id) REFERENCES branches(id) ON DELETE SET NULL,
ADD FOREIGN KEY (current_branch_id) REFERENCES branches(id) ON DELETE SET NULL;

-- 6. Alter tracking_logs to support branch tracking
ALTER TABLE tracking_logs
ADD COLUMN branch_id INT DEFAULT NULL,
ADD FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL;

-- 7. Add extra status to shipments enum for branch transit logic if not exists (Note: altering enum can be tricky, so we redefine)
ALTER TABLE shipments
MODIFY COLUMN status ENUM('Pending','Picked Up','Arrived at Branch','In Transit','Arrived at Destination Branch','Out For Delivery','Delivered','Failed') DEFAULT 'Pending';

ALTER TABLE tracking_logs
MODIFY COLUMN status VARCHAR(100) NOT NULL;
