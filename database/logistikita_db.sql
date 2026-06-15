-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: May 17, 2026 at 11:44 AM
-- Server version: 8.4.3
-- PHP Version: 8.3.28

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `logistikita_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `internal_users`
--

CREATE TABLE `internal_users` (
  `id` int NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `nama` varchar(100) NOT NULL,
  `role` enum('Admin','Kurir') NOT NULL DEFAULT 'Kurir',
  `token` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `internal_users`
--

INSERT INTO `internal_users` (`id`, `email`, `password`, `nama`, `role`, `token`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'admin@logistikita.com', 'admin123', 'Super Admin', 'Admin', 'logistikita-admin-token', 1, '2026-05-10 03:20:56', '2026-05-10 03:20:56'),
(2, 'andi.kurir@logistikita.com', 'kurir123', 'Andi Prasetyo', 'Kurir', NULL, 1, '2026-05-10 03:20:56', '2026-05-10 03:20:56'),
(3, 'budi.kurir@logistikita.com', 'kurir123', 'Budi Santoso', 'Kurir', NULL, 1, '2026-05-10 03:20:56', '2026-05-10 03:20:56'),
(4, 'citra.kurir@logistikita.com', 'kurir123', 'Citra Dewi', 'Kurir', NULL, 1, '2026-05-10 03:20:56', '2026-05-10 03:20:56'),
(5, 'doni.kurir@logistikita.com', 'kurir123', 'Doni Firmansyah', 'Kurir', NULL, 1, '2026-05-10 03:20:56', '2026-05-10 03:20:56'),
(6, 'eka.kurir@logistikita.com', 'kurir123', 'Eka Ramadhan', 'Kurir', NULL, 1, '2026-05-10 03:20:56', '2026-05-10 03:20:56');

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `id` int NOT NULL,
  `order_id` varchar(30) NOT NULL,
  `user_id` varchar(100) NOT NULL,
  `alamat` text NOT NULL,
  `jarak` decimal(10,2) NOT NULL,
  `ongkir` decimal(12,2) NOT NULL,
  `status` enum('Pending','Proses','Dalam Perjalanan','Tiba','Selesai') DEFAULT 'Pending',
  `pembayaran` enum('Belum Bayar','Lunas','Gagal') DEFAULT 'Belum Bayar',
  `transaction_id` varchar(50) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`id`, `order_id`, `user_id`, `alamat`, `jarak`, `ongkir`, `status`, `pembayaran`, `transaction_id`, `created_at`, `updated_at`) VALUES
(1, 'ORD-1001', 'SB-7281930456', 'Jl. Dago No.45, Bandung', 25.00, 125000.00, 'Selesai', 'Lunas', NULL, '2026-05-10 03:20:56', '2026-05-10 03:20:56'),
(2, 'ORD-1002', 'SB-7281930456', 'Jl. Pemuda No.88, Surabaya', 120.00, 600000.00, 'Dalam Perjalanan', 'Lunas', NULL, '2026-05-10 03:20:56', '2026-05-10 03:20:56'),
(3, 'ORD-1003', 'SB-3945817260', 'Jl. Malioboro No.10, Yogyakarta', 80.00, 400000.00, 'Pending', 'Belum Bayar', NULL, '2026-05-10 03:20:56', '2026-05-10 03:20:56'),
(4, 'ORD-1004', 'SB-3945817260', 'Jl. Asia Afrika No.77, Bandung', 15.00, 75000.00, 'Proses', 'Lunas', NULL, '2026-05-10 03:20:56', '2026-05-10 03:20:56'),
(5, 'ORD-1005', 'SB-6120384759', 'Jl. Kuta No.33, Bali', 50.00, 250000.00, 'Tiba', 'Lunas', NULL, '2026-05-10 03:20:56', '2026-05-10 03:20:56'),
(6, 'ORD-6810', '2', 'dimana', 0.40, 2000.00, 'Pending', 'Belum Bayar', NULL, '2026-05-10 03:32:30', '2026-05-10 03:32:30'),
(7, 'ORD-3355', 'SB-7281930456', 'dimana', 0.40, 2000.00, 'Pending', 'Belum Bayar', NULL, '2026-05-10 04:32:48', '2026-05-10 04:32:48'),
(8, 'ORD-2782', 'SB-7281930456', 'dago', 0.50, 2500.00, 'Pending', 'Lunas', 'BANK-1778388100063327', '2026-05-10 04:41:28', '2026-05-10 04:41:40'),
(9, 'ORD-2116', 'SB-7281930456', 'dago', 0.40, 2000.00, 'Pending', 'Belum Bayar', NULL, '2026-05-10 04:42:09', '2026-05-10 04:42:09'),
(10, 'ORD-117', 'SB-7281930456', 'dago', 3.60, 18000.00, 'Pending', 'Belum Bayar', NULL, '2026-05-10 05:02:44', '2026-05-10 05:02:44'),
(11, 'ORD-8887', 'SB-7281930456', 'dimana', 0.40, 2000.00, 'Pending', 'Belum Bayar', NULL, '2026-05-10 05:03:23', '2026-05-10 05:03:23'),
(12, 'ORD-4186', 'SB-7281930456', 'dimana', 0.40, 2000.00, 'Pending', 'Lunas', 'BANK-1778459606975274', '2026-05-10 05:04:43', '2026-05-11 00:33:26'),
(13, 'ORD-7502', 'SB-7281930456', 'p', 0.10, 500.00, 'Pending', 'Belum Bayar', NULL, '2026-05-11 00:35:49', '2026-05-11 00:35:49');

-- --------------------------------------------------------

--
-- Table structure for table `partners`
--

CREATE TABLE `partners` (
  `id` int NOT NULL,
  `nama_mitra` varchar(100) NOT NULL,
  `email_pic` varchar(100) DEFAULT NULL,
  `api_key` varchar(128) NOT NULL,
  `smartbank_account_no` varchar(50) NOT NULL,
  `webhook_url` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `partners`
--

INSERT INTO `partners` (`id`, `nama_mitra`, `email_pic`, `api_key`, `smartbank_account_no`, `webhook_url`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'Marketplace TokoBagus', 'pic@tokobagus.com', 'lsk_live_mktA_9f8a8b7c6d5e4f3a2b1c', 'SB-7281930456', 'https://tokobagus.com/webhook/logistik', 1, '2026-05-10 03:20:56', '2026-05-10 03:20:56'),
(2, 'Toko Elektronik MajuJaya', 'admin@majujaya.co.id', 'lsk_live_tokB_a1b2c3d4e5f6a7b8c9d0', 'SB-3945817260', 'https://majujaya.co.id/api/webhook', 1, '2026-05-10 03:20:56', '2026-05-10 03:20:56'),
(3, 'Supplier SumberMakmur', 'ops@sumbermakmur.id', 'lsk_live_splC_f0e1d2c3b4a5968778a9', 'SB-6120384759', 'https://sumbermakmur.id/hooks/delivery', 1, '2026-05-10 03:20:56', '2026-05-10 03:20:56');

-- --------------------------------------------------------

--
-- Table structure for table `shipments`
--

CREATE TABLE `shipments` (
  `id` int NOT NULL,
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
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `shipments`
--

INSERT INTO `shipments` (`id`, `awb_number`, `partner_id`, `external_order_id`, `sender_name`, `sender_address`, `sender_phone`, `receiver_name`, `receiver_address`, `receiver_phone`, `weight`, `service_type`, `ongkir`, `biaya_layanan`, `total_biaya`, `status`, `payment_status`, `smartbank_trx_id`, `assigned_kurir_id`, `created_at`, `updated_at`) VALUES
(1, 'LSK20260501001', 1, 'TB-ORD-10001', 'Gudang TokoBagus Jakarta', 'Jl. Gatot Subroto No.12, Jakarta Selatan', '021-5551001', 'Rina Kartika', 'Jl. Dago No.45, Bandung', '0812-3456-7001', 2.50, 'Reguler', 37500.00, 3750.00, 41250.00, 'Picked Up', 'Paid', 'SBT-20260501-001', 2, '2026-05-10 03:20:56', '2026-05-10 03:31:39'),
(2, 'LSK20260501002', 1, 'TB-ORD-10002', 'Gudang TokoBagus Jakarta', 'Jl. Gatot Subroto No.12, Jakarta Selatan', '021-5551001', 'Hendra Wijaya', 'Jl. Pemuda No.88, Surabaya', '0813-4567-8002', 5.00, 'Express', 200000.00, 20000.00, 220000.00, 'Delivered', 'Paid', 'SBT-20260501-002', 3, '2026-05-10 03:20:56', '2026-05-10 03:20:56'),
(3, 'LSK20260502003', 1, 'TB-ORD-10003', 'Gudang TokoBagus Jakarta', 'Jl. Gatot Subroto No.12, Jakarta Selatan', '021-5551001', 'Siti Nurhaliza', 'Jl. Malioboro No.10, Yogyakarta', '0856-7890-1003', 1.00, 'Reguler', 22000.00, 2200.00, 24200.00, 'In Transit', 'Paid', 'SBT-20260502-003', 4, '2026-05-10 03:20:56', '2026-05-10 03:20:56'),
(4, 'LSK20260502004', 1, 'TB-ORD-10004', 'Gudang TokoBagus Jakarta', 'Jl. Gatot Subroto No.12, Jakarta Selatan', '021-5551001', 'Agus Setiawan', 'Jl. Asia Afrika No.77, Bandung', '0878-1234-5004', 3.00, 'Express', 75000.00, 7500.00, 82500.00, 'Picked Up', 'Paid', 'SBT-20260502-004', 2, '2026-05-10 03:20:56', '2026-05-10 03:20:56'),
(5, 'LSK20260503005', 1, 'TB-ORD-10005', 'Gudang TokoBagus Jakarta', 'Jl. Gatot Subroto No.12, Jakarta Selatan', '021-5551001', 'Dewi Lestari', 'Jl. Diponegoro No.55, Medan', '0821-6789-0005', 4.00, 'Reguler', 140000.00, 14000.00, 154000.00, 'Pending', 'Pending', NULL, NULL, '2026-05-10 03:20:56', '2026-05-10 03:20:56'),
(6, 'LSK20260503006', 1, 'TB-ORD-10006', 'Gudang TokoBagus Jakarta', 'Jl. Gatot Subroto No.12, Jakarta Selatan', '021-5551001', 'Fajar Nugroho', 'Jl. Braga No.22, Bandung', '0857-2345-6006', 1.50, 'Reguler', 22500.00, 2250.00, 24750.00, 'Failed', 'Failed', 'SBT-20260503-006', 5, '2026-05-10 03:20:56', '2026-05-10 03:20:56'),
(7, 'LSK20260504007', 1, 'TB-ORD-10007', 'Gudang TokoBagus Jakarta', 'Jl. Gatot Subroto No.12, Jakarta Selatan', '021-5551001', 'Galih Pratama', 'Jl. Thamrin No.99, Surabaya', '0899-3456-7007', 2.00, 'Express', 80000.00, 8000.00, 88000.00, 'In Transit', 'Paid', 'SBT-20260504-007', 6, '2026-05-10 03:20:56', '2026-05-10 03:20:56'),
(8, 'LSK20260501008', 2, 'MJ-INV-20001', 'Toko MajuJaya Bandung', 'Jl. Cihampelas No.100, Bandung', '022-5552001', 'Irfan Hakim', 'Jl. Pandanaran No.34, Semarang', '0812-8901-2008', 8.00, 'Reguler', 160000.00, 16000.00, 176000.00, 'Delivered', 'Paid', 'SBT-20260501-008', 3, '2026-05-10 03:20:56', '2026-05-10 03:20:56'),
(9, 'LSK20260502009', 2, 'MJ-INV-20002', 'Toko MajuJaya Bandung', 'Jl. Cihampelas No.100, Bandung', '022-5552001', 'Joko Widodo', 'Jl. Tugu No.01, Yogyakarta', '0813-9012-3009', 3.50, 'Express', 133000.00, 13300.00, 146300.00, 'Delivered', 'Paid', 'SBT-20260502-009', 4, '2026-05-10 03:20:56', '2026-05-10 03:20:56'),
(10, 'LSK20260503010', 2, 'MJ-INV-20003', 'Toko MajuJaya Bandung', 'Jl. Cihampelas No.100, Bandung', '022-5552001', 'Kartini Sari', 'Jl. Ahmad Yani No.60, Surabaya', '0856-0123-4010', 12.00, 'Reguler', 264000.00, 26400.00, 290400.00, 'Picked Up', 'Paid', 'SBT-20260503-010', 5, '2026-05-10 03:20:56', '2026-05-10 03:20:56'),
(11, 'LSK20260503011', 2, 'MJ-INV-20004', 'Toko MajuJaya Bandung', 'Jl. Cihampelas No.100, Bandung', '022-5552001', 'Lukman Harun', 'Jl. Sudirman No.15, Semarang', '0878-1234-5011', 2.00, 'Reguler', 40000.00, 4000.00, 44000.00, 'Pending', 'Pending', NULL, NULL, '2026-05-10 03:20:56', '2026-05-10 03:20:56'),
(12, 'LSK20260504012', 2, 'MJ-INV-20005', 'Toko MajuJaya Bandung', 'Jl. Cihampelas No.100, Bandung', '022-5552001', 'Maya Anggraini', 'Jl. Merdeka No.42, Semarang', '0821-2345-6012', 6.00, 'Express', 210000.00, 21000.00, 231000.00, 'In Transit', 'Paid', 'SBT-20260504-012', 2, '2026-05-10 03:20:56', '2026-05-10 03:20:56'),
(13, 'LSK20260505013', 2, 'MJ-INV-20006', 'Toko MajuJaya Bandung', 'Jl. Cihampelas No.100, Bandung', '022-5552001', 'Nadia Putri', 'Jl. Gajah Mada No.18, Yogyakarta', '0857-3456-7013', 1.00, 'Reguler', 20000.00, 2000.00, 22000.00, 'Pending', 'Pending', NULL, NULL, '2026-05-10 03:20:56', '2026-05-10 03:20:56'),
(14, 'LSK20260505014', 2, 'MJ-INV-20007', 'Toko MajuJaya Bandung', 'Jl. Cihampelas No.100, Bandung', '022-5552001', 'Oscar Lawalata', 'Jl. Veteran No.25, Semarang', '0899-4567-8014', 4.50, 'Reguler', 90000.00, 9000.00, 99000.00, 'Delivered', 'Paid', 'SBT-20260505-014', 6, '2026-05-10 03:20:56', '2026-05-10 03:20:56'),
(15, 'LSK20260501015', 3, 'SM-PO-30001', 'Gudang SumberMakmur Surabaya', 'Jl. Rungkut Industri No.5, Surabaya', '031-5553001', 'Panji Asmoro', 'Jl. Sunset Road No.77, Bali', '0812-5678-9015', 10.00, 'Reguler', 180000.00, 18000.00, 198000.00, 'Delivered', 'Paid', 'SBT-20260501-015', 4, '2026-05-10 03:20:56', '2026-05-10 03:20:56'),
(16, 'LSK20260502016', 3, 'SM-PO-30002', 'Gudang SumberMakmur Surabaya', 'Jl. Rungkut Industri No.5, Surabaya', '031-5553001', 'Qori Amelia', 'Jl. Kuta No.33, Bali', '0813-6789-0016', 7.00, 'Express', 210000.00, 21000.00, 231000.00, 'In Transit', 'Paid', 'SBT-20260502-016', 5, '2026-05-10 03:20:56', '2026-05-10 03:20:56'),
(17, 'LSK20260503017', 3, 'SM-PO-30003', 'Gudang SumberMakmur Surabaya', 'Jl. Rungkut Industri No.5, Surabaya', '031-5553001', 'Rizky Maulana', 'Jl. Legian No.50, Bali', '0856-7890-1017', 15.00, 'Reguler', 270000.00, 27000.00, 297000.00, 'Picked Up', 'Paid', 'SBT-20260503-017', 3, '2026-05-10 03:20:56', '2026-05-10 03:20:56'),
(18, 'LSK20260504018', 3, 'SM-PO-30004', 'Gudang SumberMakmur Surabaya', 'Jl. Rungkut Industri No.5, Surabaya', '031-5553001', 'Sandra Olivia', 'Jl. Sanur No.12, Bali', '0878-8901-2018', 3.00, 'Express', 90000.00, 9000.00, 99000.00, 'Pending', 'Pending', NULL, NULL, '2026-05-10 03:20:56', '2026-05-10 03:20:56'),
(19, 'LSK20260505019', 3, 'SM-PO-30005', 'Gudang SumberMakmur Surabaya', 'Jl. Rungkut Industri No.5, Surabaya', '031-5553001', 'Taufik Hidayat', 'Jl. Nusa Dua No.8, Bali', '0821-9012-3019', 5.50, 'Reguler', 99000.00, 9900.00, 108900.00, 'Delivered', 'Paid', 'SBT-20260505-019', 2, '2026-05-10 03:20:56', '2026-05-10 03:20:56'),
(20, 'LSK20260506020', 3, 'SM-PO-30006', 'Gudang SumberMakmur Surabaya', 'Jl. Rungkut Industri No.5, Surabaya', '031-5553001', 'Umi Kalsum', 'Jl. Ubud No.66, Bali', '0857-0123-4020', 2.00, 'Reguler', 36000.00, 3600.00, 39600.00, 'Failed', 'Failed', 'SBT-20260506-020', 6, '2026-05-10 03:20:56', '2026-05-10 03:20:56');

-- --------------------------------------------------------

--
-- Table structure for table `tarif`
--

CREATE TABLE `tarif` (
  `id` int NOT NULL,
  `kota_asal` varchar(100) NOT NULL,
  `kota_tujuan` varchar(100) NOT NULL,
  `harga_reguler` decimal(12,2) NOT NULL,
  `harga_express` decimal(12,2) NOT NULL,
  `estimasi_reguler` varchar(20) DEFAULT NULL,
  `estimasi_express` varchar(20) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `tarif`
--

INSERT INTO `tarif` (`id`, `kota_asal`, `kota_tujuan`, `harga_reguler`, `harga_express`, `estimasi_reguler`, `estimasi_express`, `created_at`) VALUES
(1, 'Jakarta', 'Bandung', 15000.00, 25000.00, '2-3 Hari', '1 Hari', '2026-05-10 03:20:56'),
(2, 'Jakarta', 'Surabaya', 25000.00, 40000.00, '3-4 Hari', '1-2 Hari', '2026-05-10 03:20:56'),
(3, 'Bandung', 'Semarang', 20000.00, 35000.00, '2-3 Hari', '1 Hari', '2026-05-10 03:20:56'),
(4, 'Jakarta', 'Yogyakarta', 22000.00, 38000.00, '3-4 Hari', '1-2 Hari', '2026-05-10 03:20:56'),
(5, 'Surabaya', 'Bali', 18000.00, 30000.00, '2-3 Hari', '1 Hari', '2026-05-10 03:20:56'),
(6, 'Jakarta', 'Medan', 35000.00, 55000.00, '4-5 Hari', '2 Hari', '2026-05-10 03:20:56'),
(7, 'Bandung', 'Surabaya', 22000.00, 38000.00, '3-4 Hari', '1-2 Hari', '2026-05-10 03:20:56'),
(8, 'Semarang', 'Yogyakarta', 12000.00, 20000.00, '1-2 Hari', '1 Hari', '2026-05-10 03:20:56');

-- --------------------------------------------------------

--
-- Table structure for table `tracking_logs`
--

CREATE TABLE `tracking_logs` (
  `id` int NOT NULL,
  `awb_number` varchar(30) NOT NULL,
  `status` varchar(50) NOT NULL,
  `description` text,
  `location` varchar(100) DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `tracking_logs`
--

INSERT INTO `tracking_logs` (`id`, `awb_number`, `status`, `description`, `location`, `updated_by`, `created_at`) VALUES
(1, 'LSK20260501001', 'Pending', 'Pesanan diterima dari mitra', 'Jakarta', 1, '2026-05-10 03:20:56'),
(2, 'LSK20260501001', 'Picked Up', 'Paket diambil oleh kurir', 'Jakarta', 2, '2026-05-10 03:20:56'),
(3, 'LSK20260501001', 'In Transit', 'Paket dalam perjalanan ke kota tujuan', 'Bandung', 2, '2026-05-10 03:20:56'),
(4, 'LSK20260501001', 'Delivered', 'Paket berhasil diterima oleh penerima', 'Bandung', 2, '2026-05-10 03:20:56'),
(5, 'LSK20260501002', 'Pending', 'Pesanan diterima dari mitra', 'Jakarta', 1, '2026-05-10 03:20:56'),
(6, 'LSK20260501002', 'Picked Up', 'Paket diambil oleh kurir', 'Jakarta', 3, '2026-05-10 03:20:56'),
(7, 'LSK20260501002', 'In Transit', 'Paket dalam perjalanan ke kota tujuan', 'Surabaya', 3, '2026-05-10 03:20:56'),
(8, 'LSK20260501002', 'Delivered', 'Paket berhasil diterima oleh penerima', 'Surabaya', 3, '2026-05-10 03:20:56'),
(9, 'LSK20260502003', 'Pending', 'Pesanan diterima dari mitra', 'Jakarta', 1, '2026-05-10 03:20:56'),
(10, 'LSK20260502003', 'Picked Up', 'Paket diambil oleh kurir', 'Jakarta', 4, '2026-05-10 03:20:56'),
(11, 'LSK20260502003', 'In Transit', 'Paket dalam perjalanan ke kota tujuan', 'Yogyakarta', 4, '2026-05-10 03:20:56'),
(12, 'LSK20260503006', 'Pending', 'Pesanan diterima dari mitra', 'Jakarta', 1, '2026-05-10 03:20:56'),
(13, 'LSK20260503006', 'Picked Up', 'Paket diambil oleh kurir', 'Jakarta', 5, '2026-05-10 03:20:56'),
(14, 'LSK20260503006', 'In Transit', 'Paket dalam perjalanan ke kota tujuan', 'Bandung', 5, '2026-05-10 03:20:56'),
(15, 'LSK20260503006', 'Failed', 'Pengiriman gagal: alamat tidak ditemukan', 'Bandung', 5, '2026-05-10 03:20:56'),
(16, 'LSK20260501008', 'Pending', 'Pesanan diterima dari mitra', 'Bandung', 1, '2026-05-10 03:20:56'),
(17, 'LSK20260501008', 'Picked Up', 'Paket diambil oleh kurir', 'Bandung', 3, '2026-05-10 03:20:56'),
(18, 'LSK20260501008', 'In Transit', 'Paket dalam perjalanan ke kota tujuan', 'Semarang', 3, '2026-05-10 03:20:56'),
(19, 'LSK20260501008', 'Delivered', 'Paket berhasil diterima oleh penerima', 'Semarang', 3, '2026-05-10 03:20:56'),
(20, 'LSK20260501015', 'Pending', 'Pesanan diterima dari mitra', 'Surabaya', 1, '2026-05-10 03:20:56'),
(21, 'LSK20260501015', 'Picked Up', 'Paket diambil oleh kurir', 'Surabaya', 4, '2026-05-10 03:20:56'),
(22, 'LSK20260501015', 'In Transit', 'Paket dalam perjalanan ke kota tujuan', 'Bali', 4, '2026-05-10 03:20:56'),
(23, 'LSK20260501015', 'Delivered', 'Paket berhasil diterima oleh penerima', 'Bali', 4, '2026-05-10 03:20:56'),
(24, 'LSK20260501001', 'Delivered', 'Status diupdate ke Delivered', NULL, 1, '2026-05-10 03:31:36'),
(25, 'LSK20260501001', 'Picked Up', 'Status diupdate ke Picked Up', NULL, 1, '2026-05-10 03:31:39');

-- --------------------------------------------------------

--
-- Table structure for table `transactions`
--

CREATE TABLE `transactions` (
  `id` int NOT NULL,
  `transaction_id` varchar(50) NOT NULL,
  `order_id` varchar(30) NOT NULL,
  `user_id` varchar(100) NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `fee_layanan` decimal(12,2) DEFAULT '0.00',
  `fee_bank` decimal(12,2) DEFAULT '0.00',
  `total` decimal(12,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `transactions`
--

INSERT INTO `transactions` (`id`, `transaction_id`, `order_id`, `user_id`, `amount`, `fee_layanan`, `fee_bank`, `total`, `created_at`) VALUES
(1, 'BANK-1778388100063327', 'ORD-2782', 'SB-7281930456', 2500.00, 125.00, 25.00, 2650.00, '2026-05-10 04:41:40'),
(2, 'BANK-1778459606975274', 'ORD-4186', 'SB-7281930456', 2000.00, 100.00, 20.00, 2100.00, '2026-05-11 00:33:27');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `internal_users`
--
ALTER TABLE `internal_users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `token` (`token`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `order_id` (`order_id`);

--
-- Indexes for table `partners`
--
ALTER TABLE `partners`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `api_key` (`api_key`);

--
-- Indexes for table `shipments`
--
ALTER TABLE `shipments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `awb_number` (`awb_number`),
  ADD KEY `partner_id` (`partner_id`),
  ADD KEY `assigned_kurir_id` (`assigned_kurir_id`);

--
-- Indexes for table `tarif`
--
ALTER TABLE `tarif`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `tracking_logs`
--
ALTER TABLE `tracking_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `awb_number` (`awb_number`),
  ADD KEY `updated_by` (`updated_by`);

--
-- Indexes for table `transactions`
--
ALTER TABLE `transactions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `transaction_id` (`transaction_id`),
  ADD KEY `order_id` (`order_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `internal_users`
--
ALTER TABLE `internal_users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `partners`
--
ALTER TABLE `partners`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `shipments`
--
ALTER TABLE `shipments`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `tarif`
--
ALTER TABLE `tarif`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `tracking_logs`
--
ALTER TABLE `tracking_logs`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- AUTO_INCREMENT for table `transactions`
--
ALTER TABLE `transactions`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `shipments`
--
ALTER TABLE `shipments`
  ADD CONSTRAINT `shipments_ibfk_1` FOREIGN KEY (`partner_id`) REFERENCES `partners` (`id`),
  ADD CONSTRAINT `shipments_ibfk_2` FOREIGN KEY (`assigned_kurir_id`) REFERENCES `internal_users` (`id`);

--
-- Constraints for table `tracking_logs`
--
ALTER TABLE `tracking_logs`
  ADD CONSTRAINT `tracking_logs_ibfk_1` FOREIGN KEY (`awb_number`) REFERENCES `shipments` (`awb_number`) ON DELETE CASCADE,
  ADD CONSTRAINT `tracking_logs_ibfk_2` FOREIGN KEY (`updated_by`) REFERENCES `internal_users` (`id`);

--
-- Constraints for table `transactions`
--
ALTER TABLE `transactions`
  ADD CONSTRAINT `transactions_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
