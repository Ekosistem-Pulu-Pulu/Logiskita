-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Server version:               8.4.3 - MySQL Community Server - GPL
-- Server OS:                    Win64
-- HeidiSQL Version:             12.8.0.6908
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Dumping database structure for logistikita_db
DROP DATABASE IF EXISTS `logistikita_db`;
CREATE DATABASE IF NOT EXISTS `logistikita_db` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `logistikita_db`;

-- Dumping structure for table logistikita_db.internal_users
DROP TABLE IF EXISTS `internal_users`;
CREATE TABLE IF NOT EXISTS `internal_users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `nama` varchar(100) NOT NULL,
  `role` enum('Admin','Kurir','Superadmin') NOT NULL DEFAULT 'Kurir',
  `token` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `token` (`token`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table logistikita_db.internal_users: ~4 rows (approximately)
INSERT INTO `internal_users` (`id`, `email`, `password`, `nama`, `role`, `token`, `is_active`, `created_at`, `updated_at`) VALUES
	(1, 'admin@logistikita.com', 'admin123', 'Super Admin', 'Admin', 'logistikita-admin-token', 1, '2026-05-17 13:08:32', '2026-05-17 13:08:32'),
	(2, 'kurir1@logistikita.com', 'kurir123', 'Andi Kurir', 'Kurir', 'logistikita-kurir-fd222b99743c6a6dfbd23cb166274968', 1, '2026-05-17 13:08:32', '2026-05-19 04:57:24'),
	(3, 'superadmin@logistikita.com', 'superadmin123', 'Super Administrator', 'Superadmin', 'logistikita-superadmin-token-2026', 1, '2026-05-19 03:37:12', '2026-05-19 03:53:36'),
	(5, 'bahlilwid@logistikita.com', 'bahlilwid123', 'Bahlil widodo', 'Kurir', 'logistikita-kurir-159cb3066f61a36553d5c9003bb2d364', 1, '2026-05-19 04:54:21', '2026-05-19 04:57:24');

-- Dumping structure for table logistikita_db.orders
DROP TABLE IF EXISTS `orders`;
CREATE TABLE IF NOT EXISTS `orders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` varchar(30) NOT NULL,
  `user_id` varchar(100) NOT NULL,
  `alamat` text NOT NULL,
  `jarak` decimal(10,2) NOT NULL,
  `ongkir` decimal(12,2) NOT NULL,
  `status` enum('Pending','Proses','Dalam Perjalanan','Tiba','Selesai') DEFAULT 'Pending',
  `pembayaran` enum('Belum Bayar','Lunas','Gagal') DEFAULT 'Belum Bayar',
  `transaction_id` varchar(50) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `order_id` (`order_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table logistikita_db.orders: ~1 rows (approximately)
INSERT INTO `orders` (`id`, `order_id`, `user_id`, `alamat`, `jarak`, `ongkir`, `status`, `pembayaran`, `transaction_id`, `created_at`, `updated_at`) VALUES
	(1, 'ORD-1259', 'SB-7281930456', 'medan', 50.00, 250000.00, 'Pending', 'Lunas', 'BANK-1779201044135160', '2026-05-19 14:13:55', '2026-05-19 14:30:45');

-- Dumping structure for table logistikita_db.partners
DROP TABLE IF EXISTS `partners`;
CREATE TABLE IF NOT EXISTS `partners` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nama_mitra` varchar(100) NOT NULL,
  `email_pic` varchar(100) DEFAULT NULL,
  `api_key` varchar(128) NOT NULL,
  `smartbank_account_no` varchar(50) NOT NULL,
  `webhook_url` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `api_key` (`api_key`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table logistikita_db.partners: ~2 rows (approximately)
INSERT INTO `partners` (`id`, `nama_mitra`, `email_pic`, `api_key`, `smartbank_account_no`, `webhook_url`, `is_active`, `created_at`, `updated_at`) VALUES
	(1, 'Marketplace TokoBagus', 'pic@tokobagus.com', 'lsk_live_mktA_9f8a8b7c6d5e4f3a2b1c', 'SB-ACC-001', 'https://tokobagus.com/webhook/logistik', 1, '2026-05-17 13:08:32', '2026-05-17 13:08:32'),
	(2, 'Supplier MajuJaya', 'admin@majujaya.co.id', 'lsk_live_splB_a1b2c3d4e5f6g7h8i9j0', 'SB-ACC-002', 'https://majujaya.co.id/api/webhook', 1, '2026-05-17 13:08:32', '2026-05-17 13:08:32');

-- Dumping structure for table logistikita_db.shipments
DROP TABLE IF EXISTS `shipments`;
CREATE TABLE IF NOT EXISTS `shipments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `awb_number` varchar(30) NOT NULL,
  `partner_id` int NOT NULL,
  `external_order_id` varchar(50) DEFAULT NULL,
  `sender_name` varchar(100) NOT NULL,
  `sender_address` text NOT NULL,
  `sender_phone` varchar(20) DEFAULT NULL,
  `receiver_name` varchar(100) NOT NULL,
  `receiver_address` text NOT NULL,
  `receiver_phone` varchar(20) DEFAULT NULL,
  `weight` decimal(10,2) NOT NULL DEFAULT '1.00',
  `service_type` enum('Reguler','Express') DEFAULT 'Reguler',
  `ongkir` decimal(12,2) NOT NULL,
  `biaya_layanan` decimal(12,2) DEFAULT '0.00',
  `total_biaya` decimal(12,2) NOT NULL,
  `status` enum('Pending','Picked Up','In Transit','Delivered','Failed') DEFAULT 'Pending',
  `payment_status` enum('Pending','Paid','Failed') DEFAULT 'Pending',
  `smartbank_trx_id` varchar(50) DEFAULT NULL,
  `assigned_kurir_id` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `awb_number` (`awb_number`),
  KEY `partner_id` (`partner_id`),
  KEY `assigned_kurir_id` (`assigned_kurir_id`),
  CONSTRAINT `shipments_ibfk_1` FOREIGN KEY (`partner_id`) REFERENCES `partners` (`id`),
  CONSTRAINT `shipments_ibfk_2` FOREIGN KEY (`assigned_kurir_id`) REFERENCES `internal_users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table logistikita_db.shipments: ~3 rows (approximately)
INSERT INTO `shipments` (`id`, `awb_number`, `partner_id`, `external_order_id`, `sender_name`, `sender_address`, `sender_phone`, `receiver_name`, `receiver_address`, `receiver_phone`, `weight`, `service_type`, `ongkir`, `biaya_layanan`, `total_biaya`, `status`, `payment_status`, `smartbank_trx_id`, `assigned_kurir_id`, `created_at`, `updated_at`) VALUES
	(1, 'LSK64073025811', 1, 'TB-1779164072427', 'TokoBagus Official', 'Jakarta', NULL, 'Ahmad bahlil', 'Bandung', NULL, 2.00, 'Reguler', 30000.00, 1500.00, 31500.00, 'Delivered', 'Paid', 'BANK-1779164073023696', 5, '2026-05-19 04:14:33', '2026-05-19 05:13:28'),
	(2, 'LSK67655581401', 1, 'TB-1779167655063', 'TokoBagus Official', 'Jakarta', NULL, 'rahmat', 'surabaya ', NULL, 3.00, 'Express', 75000.00, 3750.00, 78750.00, 'Pending', 'Paid', 'BANK-1779167655576315', 5, '2026-05-19 05:14:15', '2026-05-19 13:57:08'),
	(3, 'LSK9909603154', 1, 'TB-1779199095475', 'TokoBagus Official', 'Jakarta', NULL, 'juju', 'medan', NULL, 30.00, 'Reguler', 450000.00, 22500.00, 472500.00, 'In Transit', 'Paid', 'BANK-1779199096028443', 5, '2026-05-19 13:58:16', '2026-05-19 13:59:11');

-- Dumping structure for table logistikita_db.tarif
DROP TABLE IF EXISTS `tarif`;
CREATE TABLE IF NOT EXISTS `tarif` (
  `id` int NOT NULL AUTO_INCREMENT,
  `kota_asal` varchar(100) NOT NULL,
  `kota_tujuan` varchar(100) NOT NULL,
  `harga_reguler` decimal(12,2) NOT NULL,
  `harga_express` decimal(12,2) NOT NULL,
  `estimasi_reguler` varchar(20) DEFAULT NULL,
  `estimasi_express` varchar(20) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table logistikita_db.tarif: ~5 rows (approximately)
INSERT INTO `tarif` (`id`, `kota_asal`, `kota_tujuan`, `harga_reguler`, `harga_express`, `estimasi_reguler`, `estimasi_express`, `created_at`) VALUES
	(1, 'Jakarta', 'Bandung', 15000.00, 25000.00, '2-3 Hari', '1 Hari', '2026-05-17 13:08:32'),
	(2, 'Jakarta', 'Surabaya', 25000.00, 40000.00, '3-4 Hari', '1-2 Hari', '2026-05-17 13:08:32'),
	(3, 'Bandung', 'Semarang', 20000.00, 35000.00, '2-3 Hari', '1 Hari', '2026-05-17 13:08:32'),
	(4, 'Jakarta', 'Yogyakarta', 22000.00, 38000.00, '3-4 Hari', '1-2 Hari', '2026-05-17 13:08:32'),
	(5, 'Surabaya', 'Bali', 18000.00, 30000.00, '2-3 Hari', '1 Hari', '2026-05-17 13:08:32');

-- Dumping structure for table logistikita_db.tracking_logs
DROP TABLE IF EXISTS `tracking_logs`;
CREATE TABLE IF NOT EXISTS `tracking_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `awb_number` varchar(30) NOT NULL,
  `status` varchar(50) NOT NULL,
  `description` text,
  `location` varchar(100) DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `awb_number` (`awb_number`),
  KEY `updated_by` (`updated_by`),
  CONSTRAINT `tracking_logs_ibfk_1` FOREIGN KEY (`awb_number`) REFERENCES `shipments` (`awb_number`) ON DELETE CASCADE,
  CONSTRAINT `tracking_logs_ibfk_2` FOREIGN KEY (`updated_by`) REFERENCES `internal_users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table logistikita_db.tracking_logs: ~15 rows (approximately)
INSERT INTO `tracking_logs` (`id`, `awb_number`, `status`, `description`, `location`, `updated_by`, `created_at`) VALUES
	(1, 'LSK64073025811', 'Pending', 'Pesanan diterima dan pembayaran terkonfirmasi', 'Gudang LogistiKita', NULL, '2026-05-19 04:14:33'),
	(2, 'LSK64073025811', 'Picked Up', 'Status diupdate ke Picked Up', NULL, 1, '2026-05-19 04:15:16'),
	(3, 'LSK64073025811', 'Pending', 'Status diupdate ke Pending', NULL, 1, '2026-05-19 04:59:22'),
	(4, 'LSK64073025811', 'Picked Up', 'Paket telah diambil oleh kurir', NULL, 5, '2026-05-19 05:02:53'),
	(5, 'LSK64073025811', 'In Transit', 'Status diupdate ke In Transit', NULL, 5, '2026-05-19 05:11:11'),
	(6, 'LSK64073025811', 'In Transit', 'Kurir mengupdate status ke In Transit', 'Lokasi Kurir Terkini', 5, '2026-05-19 05:13:24'),
	(7, 'LSK64073025811', 'Delivered', 'Kurir mengupdate status ke Delivered', 'Lokasi Kurir Terkini', 5, '2026-05-19 05:13:28'),
	(8, 'LSK64073025811', 'Delivered', 'Status diupdate ke Delivered', NULL, 1, '2026-05-19 05:13:44'),
	(9, 'LSK67655581401', 'Pending', 'Pesanan diterima dan pembayaran terkonfirmasi', 'Gudang LogistiKita', NULL, '2026-05-19 05:14:15'),
	(10, 'LSK67655581401', 'Picked Up', 'Paket telah diambil oleh kurir', NULL, 5, '2026-05-19 05:14:53'),
	(11, 'LSK67655581401', 'Failed', 'Kurir mengupdate status ke Failed', 'Lokasi Kurir Terkini', 5, '2026-05-19 13:41:24'),
	(12, 'LSK67655581401', 'Pending', 'Status diupdate ke Pending', NULL, 1, '2026-05-19 13:57:08'),
	(13, 'LSK9909603154', 'Pending', 'Pesanan diterima dan pembayaran terkonfirmasi', 'Gudang LogistiKita', NULL, '2026-05-19 13:58:16'),
	(14, 'LSK9909603154', 'Picked Up', 'Paket telah diambil oleh kurir', NULL, 5, '2026-05-19 13:58:27'),
	(15, 'LSK9909603154', 'In Transit', 'Kurir mengupdate status ke In Transit', 'Lokasi Kurir Terkini', 5, '2026-05-19 13:59:11');

-- Dumping structure for table logistikita_db.transactions
DROP TABLE IF EXISTS `transactions`;
CREATE TABLE IF NOT EXISTS `transactions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `transaction_id` varchar(50) NOT NULL,
  `order_id` varchar(30) NOT NULL,
  `user_id` varchar(100) NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `fee_layanan` decimal(12,2) DEFAULT '0.00',
  `fee_bank` decimal(12,2) DEFAULT '0.00',
  `total` decimal(12,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `transaction_id` (`transaction_id`),
  KEY `order_id` (`order_id`),
  CONSTRAINT `transactions_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table logistikita_db.transactions: ~1 rows (approximately)
INSERT INTO `transactions` (`id`, `transaction_id`, `order_id`, `user_id`, `amount`, `fee_layanan`, `fee_bank`, `total`, `created_at`) VALUES
	(1, 'BANK-1779201044135160', 'ORD-1259', 'SB-7281930456', 250000.00, 12500.00, 2500.00, 262500.00, '2026-05-19 14:30:45');

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
