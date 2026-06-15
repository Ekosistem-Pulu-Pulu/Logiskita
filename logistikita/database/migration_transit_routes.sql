-- =====================================================
-- LogistiKita Transit System & Routes Migration
-- =====================================================

USE logistik_db;

-- 1. Create transit_routes table (Adjacency Graph of Branches)
CREATE TABLE IF NOT EXISTS transit_routes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    from_branch_id INT NOT NULL,
    to_branch_id INT NOT NULL,
    route_order INT NOT NULL DEFAULT 1, -- order/weight of route (defaults to 1)
    FOREIGN KEY (from_branch_id) REFERENCES branches(id) ON DELETE CASCADE,
    FOREIGN KEY (to_branch_id) REFERENCES branches(id) ON DELETE CASCADE,
    UNIQUE KEY unique_route (from_branch_id, to_branch_id)
);

-- 2. Create shipment_transit_legs table
CREATE TABLE IF NOT EXISTS shipment_transit_legs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    shipment_id INT NOT NULL,
    awb_number VARCHAR(30) NOT NULL,
    leg_order INT NOT NULL,        -- urutan leg (1, 2, 3, ...)
    from_branch_id INT NOT NULL,
    to_branch_id INT NOT NULL,
    assigned_kurir_id INT DEFAULT NULL,
    status ENUM('Pending','In Progress','Completed') DEFAULT 'Pending',
    started_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (shipment_id) REFERENCES shipments(id) ON DELETE CASCADE,
    FOREIGN KEY (from_branch_id) REFERENCES branches(id) ON DELETE CASCADE,
    FOREIGN KEY (to_branch_id) REFERENCES branches(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_kurir_id) REFERENCES internal_users(id) ON DELETE SET NULL
);

-- 3. Alter shipments table: add final_branch_id and modify partner_id to be nullable
-- Check if final_branch_id already exists to prevent duplicate error
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = 'logistik_db' AND TABLE_NAME = 'shipments' AND COLUMN_NAME = 'final_branch_id');
SET @sql = IF(@col_exists = 0, 
    'ALTER TABLE shipments ADD COLUMN final_branch_id INT DEFAULT NULL, ADD FOREIGN KEY (final_branch_id) REFERENCES branches(id) ON DELETE SET NULL', 
    'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Make partner_id nullable
ALTER TABLE shipments MODIFY COLUMN partner_id INT DEFAULT NULL;

-- 4. Seed initial transit routes (Adjacency list / Graph edges)
-- Jakarta (1), Bandung (2), Surabaya (3), Medan (4), Makassar (5), Balikpapan (6), Yogyakarta (7), Semarang (8), Denpasar (9), Palembang (10), Pontianak (11), Manado (12)
INSERT IGNORE INTO transit_routes (from_branch_id, to_branch_id, route_order) VALUES
-- Jakarta <-> Bandung
(1, 2, 1), (2, 1, 1),
-- Bandung <-> Semarang
(2, 8, 1), (8, 2, 1),
-- Semarang <-> Yogyakarta
(8, 7, 1), (7, 8, 1),
-- Semarang <-> Surabaya
(8, 3, 1), (3, 8, 1),
-- Surabaya <-> Denpasar (Bali)
(3, 9, 1), (9, 3, 1),
-- Surabaya <-> Makassar
(3, 5, 1), (5, 3, 1),
-- Surabaya <-> Balikpapan
(3, 6, 1), (6, 3, 1),
-- Jakarta <-> Palembang
(1, 10, 1), (10, 1, 1),
-- Palembang <-> Medan
(10, 4, 1), (4, 10, 1),
-- Makassar <-> Manado
(5, 12, 1), (12, 5, 1),
-- Pontianak <-> Balikpapan
(11, 6, 1), (6, 11, 1);
