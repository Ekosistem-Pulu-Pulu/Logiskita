-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Jun 14, 2026 at 01:03 PM
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
-- Database: `logistik_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `admin_reports`
--

CREATE TABLE `admin_reports` (
  `id` int NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `awb_number` varchar(30) DEFAULT NULL,
  `report_type` varchar(50) NOT NULL,
  `message` text NOT NULL,
  `status` varchar(20) DEFAULT 'Pending',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `admin_reports`
--

INSERT INTO `admin_reports` (`id`, `name`, `email`, `awb_number`, `report_type`, `message`, `status`, `created_at`) VALUES
(1, 'Alia', 'nuraliaaa2109@gmail.com', 'tes', 'Paket Rusak/Hilang', 'tes', 'Resolved', '2026-06-02 04:04:16');

-- --------------------------------------------------------

--
-- Table structure for table `api_logs`
--

CREATE TABLE `api_logs` (
  `id` int NOT NULL,
  `partner_id` int DEFAULT NULL,
  `endpoint` varchar(255) NOT NULL,
  `method` varchar(10) NOT NULL,
  `request_payload` text,
  `response_status` int NOT NULL,
  `response_body` text,
  `execution_time_ms` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `api_logs`
--

INSERT INTO `api_logs` (`id`, `partner_id`, `endpoint`, `method`, `request_payload`, `response_status`, `response_body`, `execution_time_ms`, `created_at`) VALUES
(1, 1, '/api/v1/marketplace/check-ongkir', 'POST', '{\"kota_asal\":\"Jakarta\",\"kota_tujuan\":\"Bandung\",\"weight\":2}', 400, '{\"status\":\"Error\",\"message\":\"Koordinat asal (origin_lat, origin_lng) dan tujuan (destination_lat, destination_lng) wajib diisi\"}', 2, '2026-05-24 09:28:48'),
(2, 1, '/api/v1/marketplace/create-shipment', 'POST', '{\"external_order_id\":\"TEST-1779614928723\",\"sender_name\":\"Test Sender\",\"sender_address\":\"Jl Test Sender 1\",\"sender_city\":\"Jakarta\",\"receiver_name\":\"Test Receiver\",\"receiver_address\":\"Jl Test Receiver 2\",\"receiver_city\":\"Bandung\",\"weight\":2,\"service_type\":\"Reguler\"}', 201, '{\"status\":\"Success\",\"message\":\"Resi berhasil diterbitkan\",\"data\":{\"awb_number\":\"LSK14928729413\",\"partner\":\"Marketplace Simulator\",\"external_order_id\":\"TEST-1779614928723\",\"service_type\":\"Reguler\",\"weight\":2,\"total_biaya\":31500,\"status\":\"Pending\"}}', 17, '2026-05-24 09:28:48'),
(3, 1, '/api/v1/marketplace/tracking/LSK14928729413', 'GET', NULL, 200, '{\"status\":\"Success\",\"data\":{\"shipment\":{\"awb_number\":\"LSK14928729413\",\"status\":\"Pending\",\"service_type\":\"Reguler\",\"created_at\":\"2026-05-24T09:28:48.000Z\"},\"tracking_history\":[{\"status\":\"Pending\",\"description\":\"Pesanan diterima dari API Marketplace\",\"location\":\"Jakarta\",\"created_at\":\"2026-05-24T09:28:48.000Z\"}]}}', 7, '2026-05-24 09:28:48'),
(4, 1, '/api/v1/marketplace/shipments', 'GET', NULL, 200, '{\"status\":\"Success\",\"data\":[{\"awb_number\":\"LSK14928729413\",\"external_order_id\":\"TEST-1779614928723\",\"receiver_name\":\"Test Receiver\",\"receiver_city\":null,\"service_type\":\"Reguler\",\"total_biaya\":\"31500.00\",\"status\":\"Pending\",\"created_at\":\"2026-05-24T09:28:48.000Z\"}]}', 4, '2026-05-24 09:28:48'),
(5, 1, '/api/v1/marketplace/shipments/LSK14928729413/cancel', 'POST', '{}', 500, '{\"status\":\"Error\",\"message\":\"Gagal membatalkan pengiriman\"}', 8, '2026-05-24 09:28:48'),
(6, 1, '/api/v1/marketplace/check-ongkir', 'POST', '{\"kota_asal\":\"Jakarta\",\"kota_tujuan\":\"Bandung\",\"origin_lat\":-6.2,\"origin_lng\":106.816666,\"destination_lat\":-6.914744,\"destination_lng\":107.60981,\"weight\":2}', 200, '{\"status\":\"Success\",\"data\":{\"origin\":{\"lat\":-6.2,\"lng\":106.816666,\"city\":null},\"destination\":{\"lat\":-6.914744,\"lng\":107.60981,\"city\":null},\"distance_km\":118.29,\"weight\":2,\"options\":[{\"rate_id\":1,\"service\":\"Reguler\",\"estimasi\":\"2-4 Hari\",\"breakdown\":{\"biaya_dasar\":8000,\"biaya_jarak\":5915,\"biaya_berat\":4000,\"tarif_per_km\":50,\"tarif_per_kg\":2000},\"ongkir\":18000,\"biaya_admin\":540,\"biaya_admin_persen\":\"3%\",\"total\":18540},{\"rate_id\":2,\"service\":\"Express\",\"estimasi\":\"1-2 Hari\",\"breakdown\":{\"biaya_dasar\":15000,\"biaya_jarak\":9463,\"biaya_berat\":7000,\"tarif_per_km\":80,\"tarif_per_kg\":3500},\"ongkir\":31500,\"biaya_admin\":945,\"biaya_admin_persen\":\"3%\",\"total\":32445}]}}', 3, '2026-05-24 09:32:09'),
(7, 1, '/api/v1/marketplace/create-shipment', 'POST', '{\"external_order_id\":\"TEST-1779615129744\",\"sender_name\":\"Test Sender\",\"sender_address\":\"Jl Test Sender 1\",\"sender_city\":\"Jakarta\",\"receiver_name\":\"Test Receiver\",\"receiver_address\":\"Jl Test Receiver 2\",\"receiver_city\":\"Bandung\",\"weight\":2,\"service_type\":\"Reguler\"}', 201, '{\"status\":\"Success\",\"message\":\"Resi berhasil diterbitkan\",\"data\":{\"awb_number\":\"LSK15129747173\",\"partner\":\"Marketplace Simulator\",\"external_order_id\":\"TEST-1779615129744\",\"service_type\":\"Reguler\",\"weight\":2,\"total_biaya\":31500,\"status\":\"Pending\"}}', 7, '2026-05-24 09:32:09'),
(8, 1, '/api/v1/marketplace/tracking/LSK15129747173', 'GET', NULL, 200, '{\"status\":\"Success\",\"data\":{\"shipment\":{\"awb_number\":\"LSK15129747173\",\"status\":\"Pending\",\"service_type\":\"Reguler\",\"created_at\":\"2026-05-24T09:32:09.000Z\"},\"tracking_history\":[{\"status\":\"Pending\",\"description\":\"Pesanan diterima dari API Marketplace\",\"location\":\"Jakarta\",\"created_at\":\"2026-05-24T09:32:09.000Z\"}]}}', 5, '2026-05-24 09:32:09'),
(9, 1, '/api/v1/marketplace/shipments', 'GET', NULL, 200, '{\"status\":\"Success\",\"data\":[{\"awb_number\":\"LSK15129747173\",\"external_order_id\":\"TEST-1779615129744\",\"receiver_name\":\"Test Receiver\",\"receiver_city\":null,\"service_type\":\"Reguler\",\"total_biaya\":\"31500.00\",\"status\":\"Pending\",\"created_at\":\"2026-05-24T09:32:09.000Z\"},{\"awb_number\":\"LSK14928729413\",\"external_order_id\":\"TEST-1779614928723\",\"receiver_name\":\"Test Receiver\",\"receiver_city\":null,\"service_type\":\"Reguler\",\"total_biaya\":\"31500.00\",\"status\":\"Pending\",\"created_at\":\"2026-05-24T09:28:48.000Z\"}]}', 3, '2026-05-24 09:32:09'),
(10, 1, '/api/v1/marketplace/shipments/LSK15129747173/cancel', 'POST', '{}', 500, '{\"status\":\"Error\",\"message\":\"Gagal membatalkan pengiriman\"}', 4, '2026-05-24 09:32:09'),
(11, 1, '/api/v1/marketplace/check-ongkir', 'POST', '{\"kota_asal\":\"Jakarta\",\"kota_tujuan\":\"Bandung\",\"origin_lat\":-6.2,\"origin_lng\":106.816666,\"destination_lat\":-6.914744,\"destination_lng\":107.60981,\"weight\":2}', 200, '{\"status\":\"Success\",\"data\":{\"origin\":{\"lat\":-6.2,\"lng\":106.816666,\"city\":null},\"destination\":{\"lat\":-6.914744,\"lng\":107.60981,\"city\":null},\"distance_km\":118.29,\"weight\":2,\"options\":[{\"rate_id\":1,\"service\":\"Reguler\",\"estimasi\":\"2-4 Hari\",\"breakdown\":{\"biaya_dasar\":8000,\"biaya_jarak\":5915,\"biaya_berat\":4000,\"tarif_per_km\":50,\"tarif_per_kg\":2000},\"ongkir\":18000,\"biaya_admin\":540,\"biaya_admin_persen\":\"3%\",\"total\":18540},{\"rate_id\":2,\"service\":\"Express\",\"estimasi\":\"1-2 Hari\",\"breakdown\":{\"biaya_dasar\":15000,\"biaya_jarak\":9463,\"biaya_berat\":7000,\"tarif_per_km\":80,\"tarif_per_kg\":3500},\"ongkir\":31500,\"biaya_admin\":945,\"biaya_admin_persen\":\"3%\",\"total\":32445}]}}', 3, '2026-05-24 09:33:29'),
(12, 1, '/api/v1/marketplace/create-shipment', 'POST', '{\"external_order_id\":\"TEST-1779615209660\",\"sender_name\":\"Test Sender\",\"sender_address\":\"Jl Test Sender 1\",\"sender_city\":\"Jakarta\",\"receiver_name\":\"Test Receiver\",\"receiver_address\":\"Jl Test Receiver 2\",\"receiver_city\":\"Bandung\",\"weight\":2,\"service_type\":\"Reguler\"}', 201, '{\"status\":\"Success\",\"message\":\"Resi berhasil diterbitkan\",\"data\":{\"awb_number\":\"LSK15209663111\",\"partner\":\"Marketplace Simulator\",\"external_order_id\":\"TEST-1779615209660\",\"service_type\":\"Reguler\",\"weight\":2,\"total_biaya\":31500,\"status\":\"Pending\"}}', 13, '2026-05-24 09:33:29'),
(13, 1, '/api/v1/marketplace/tracking/LSK15209663111', 'GET', NULL, 200, '{\"status\":\"Success\",\"data\":{\"shipment\":{\"awb_number\":\"LSK15209663111\",\"status\":\"Pending\",\"service_type\":\"Reguler\",\"created_at\":\"2026-05-24T09:33:29.000Z\"},\"tracking_history\":[{\"status\":\"Pending\",\"description\":\"Pesanan diterima dari API Marketplace\",\"location\":\"Jakarta\",\"created_at\":\"2026-05-24T09:33:29.000Z\"}]}}', 3, '2026-05-24 09:33:29'),
(14, 1, '/api/v1/marketplace/shipments', 'GET', NULL, 200, '{\"status\":\"Success\",\"data\":[{\"awb_number\":\"LSK15209663111\",\"external_order_id\":\"TEST-1779615209660\",\"receiver_name\":\"Test Receiver\",\"receiver_city\":null,\"service_type\":\"Reguler\",\"total_biaya\":\"31500.00\",\"status\":\"Pending\",\"created_at\":\"2026-05-24T09:33:29.000Z\"},{\"awb_number\":\"LSK15129747173\",\"external_order_id\":\"TEST-1779615129744\",\"receiver_name\":\"Test Receiver\",\"receiver_city\":null,\"service_type\":\"Reguler\",\"total_biaya\":\"31500.00\",\"status\":\"Pending\",\"created_at\":\"2026-05-24T09:32:09.000Z\"},{\"awb_number\":\"LSK14928729413\",\"external_order_id\":\"TEST-1779614928723\",\"receiver_name\":\"Test Receiver\",\"receiver_city\":null,\"service_type\":\"Reguler\",\"total_biaya\":\"31500.00\",\"status\":\"Pending\",\"created_at\":\"2026-05-24T09:28:48.000Z\"}]}', 2, '2026-05-24 09:33:29'),
(15, 1, '/api/v1/marketplace/shipments/LSK15209663111/cancel', 'POST', '{}', 200, '{\"status\":\"Success\",\"message\":\"Pengiriman berhasil dibatalkan\"}', 6, '2026-05-24 09:33:29'),
(16, 1, '/api/v1/marketplace/check-ongkir', 'POST', '{\"kota_asal\":\"Jakarta\",\"kota_tujuan\":\"Bandung\",\"origin_lat\":-6.2,\"origin_lng\":106.816666,\"destination_lat\":-6.914744,\"destination_lng\":107.60981,\"weight\":2}', 200, '{\"status\":\"Success\",\"data\":{\"origin\":{\"lat\":-6.2,\"lng\":106.816666,\"city\":null},\"destination\":{\"lat\":-6.914744,\"lng\":107.60981,\"city\":null},\"distance_km\":118.29,\"weight\":2,\"options\":[{\"rate_id\":1,\"service\":\"Reguler\",\"estimasi\":\"2-4 Hari\",\"breakdown\":{\"biaya_dasar\":8000,\"biaya_jarak\":5915,\"biaya_berat\":4000,\"tarif_per_km\":50,\"tarif_per_kg\":2000},\"ongkir\":18000,\"biaya_admin\":540,\"biaya_admin_persen\":\"3%\",\"total\":18540},{\"rate_id\":2,\"service\":\"Express\",\"estimasi\":\"1-2 Hari\",\"breakdown\":{\"biaya_dasar\":15000,\"biaya_jarak\":9463,\"biaya_berat\":7000,\"tarif_per_km\":80,\"tarif_per_kg\":3500},\"ongkir\":31500,\"biaya_admin\":945,\"biaya_admin_persen\":\"3%\",\"total\":32445}]}}', 2, '2026-05-24 09:52:26'),
(17, 1, '/api/v1/marketplace/create-shipment', 'POST', '{\"external_order_id\":\"TEST-1779616346368\",\"sender_name\":\"Test Sender\",\"sender_address\":\"Jl Test Sender 1\",\"sender_city\":\"Jakarta\",\"receiver_name\":\"Test Receiver\",\"receiver_address\":\"Jl Test Receiver 2\",\"receiver_city\":\"Bandung\",\"weight\":2,\"service_type\":\"Reguler\"}', 201, '{\"status\":\"Success\",\"message\":\"Resi berhasil diterbitkan\",\"data\":{\"awb_number\":\"LSK16346373678\",\"partner\":\"Marketplace Simulator\",\"external_order_id\":\"TEST-1779616346368\",\"service_type\":\"Reguler\",\"weight\":2,\"total_biaya\":31500,\"status\":\"Pending\"}}', 7, '2026-05-24 09:52:26'),
(18, 1, '/api/v1/marketplace/tracking/LSK16346373678', 'GET', NULL, 200, '{\"status\":\"Success\",\"data\":{\"shipment\":{\"awb_number\":\"LSK16346373678\",\"status\":\"Pending\",\"service_type\":\"Reguler\",\"created_at\":\"2026-05-24T09:52:26.000Z\"},\"tracking_history\":[{\"status\":\"Pending\",\"description\":\"Pesanan diterima dari API Marketplace\",\"location\":\"Jakarta\",\"created_at\":\"2026-05-24T09:52:26.000Z\"}]}}', 4, '2026-05-24 09:52:26'),
(19, 1, '/api/v1/marketplace/shipments', 'GET', NULL, 200, '{\"status\":\"Success\",\"data\":[{\"awb_number\":\"LSK16346373678\",\"external_order_id\":\"TEST-1779616346368\",\"receiver_name\":\"Test Receiver\",\"receiver_city\":null,\"service_type\":\"Reguler\",\"total_biaya\":\"31500.00\",\"status\":\"Pending\",\"created_at\":\"2026-05-24T09:52:26.000Z\"},{\"awb_number\":\"LSK15209663111\",\"external_order_id\":\"TEST-1779615209660\",\"receiver_name\":\"Test Receiver\",\"receiver_city\":null,\"service_type\":\"Reguler\",\"total_biaya\":\"31500.00\",\"status\":\"Cancelled\",\"created_at\":\"2026-05-24T09:33:29.000Z\"},{\"awb_number\":\"LSK15129747173\",\"external_order_id\":\"TEST-1779615129744\",\"receiver_name\":\"Test Receiver\",\"receiver_city\":null,\"service_type\":\"Reguler\",\"total_biaya\":\"31500.00\",\"status\":\"Pending\",\"created_at\":\"2026-05-24T09:32:09.000Z\"},{\"awb_number\":\"LSK14928729413\",\"external_order_id\":\"TEST-1779614928723\",\"receiver_name\":\"Test Receiver\",\"receiver_city\":null,\"service_type\":\"Reguler\",\"total_biaya\":\"31500.00\",\"status\":\"Pending\",\"created_at\":\"2026-05-24T09:28:48.000Z\"}]}', 3, '2026-05-24 09:52:26'),
(20, 1, '/api/v1/marketplace/shipments/LSK16346373678/cancel', 'POST', '{}', 200, '{\"status\":\"Success\",\"message\":\"Pengiriman berhasil dibatalkan\"}', 7, '2026-05-24 09:52:26'),
(21, 1, '/api/v1/marketplace/check-ongkir', 'POST', '{\"kota_asal\":\"Jakarta\",\"kota_tujuan\":\"Bandung\",\"origin_lat\":-6.2,\"origin_lng\":106.816666,\"destination_lat\":-6.914744,\"destination_lng\":107.60981,\"weight\":2}', 200, '{\"status\":\"Success\",\"data\":{\"origin\":{\"lat\":-6.2,\"lng\":106.816666,\"city\":null},\"destination\":{\"lat\":-6.914744,\"lng\":107.60981,\"city\":null},\"distance_km\":118.29,\"weight\":2,\"options\":[{\"rate_id\":1,\"service\":\"Reguler\",\"estimasi\":\"2-4 Hari\",\"breakdown\":{\"biaya_dasar\":8000,\"biaya_jarak\":5915,\"biaya_berat\":4000,\"tarif_per_km\":50,\"tarif_per_kg\":2000},\"ongkir\":18000,\"biaya_admin\":540,\"biaya_admin_persen\":\"3%\",\"total\":18540},{\"rate_id\":2,\"service\":\"Express\",\"estimasi\":\"1-2 Hari\",\"breakdown\":{\"biaya_dasar\":15000,\"biaya_jarak\":9463,\"biaya_berat\":7000,\"tarif_per_km\":80,\"tarif_per_kg\":3500},\"ongkir\":31500,\"biaya_admin\":945,\"biaya_admin_persen\":\"3%\",\"total\":32445}]}}', 8, '2026-05-24 10:05:16'),
(22, 1, '/api/v1/marketplace/create-shipment', 'POST', '{\"external_order_id\":\"TEST-1779617116740\",\"sender_name\":\"Test Sender\",\"sender_address\":\"Jl Test Sender 1\",\"sender_city\":\"Jakarta\",\"receiver_name\":\"Test Receiver\",\"receiver_address\":\"Jl Test Receiver 2\",\"receiver_city\":\"Bandung\",\"weight\":2,\"service_type\":\"Reguler\"}', 201, '{\"status\":\"Success\",\"message\":\"Resi berhasil diterbitkan\",\"data\":{\"awb_number\":\"LSK17116745785\",\"partner\":\"Marketplace Simulator\",\"external_order_id\":\"TEST-1779617116740\",\"service_type\":\"Reguler\",\"weight\":2,\"total_biaya\":31500,\"status\":\"Pending\"}}', 6, '2026-05-24 10:05:16'),
(23, 1, '/api/v1/marketplace/tracking/LSK17116745785', 'GET', NULL, 200, '{\"status\":\"Success\",\"data\":{\"shipment\":{\"awb_number\":\"LSK17116745785\",\"status\":\"Pending\",\"service_type\":\"Reguler\",\"created_at\":\"2026-05-24T10:05:16.000Z\"},\"tracking_history\":[{\"status\":\"Pending\",\"description\":\"Pesanan diterima dari API Marketplace\",\"location\":\"Jakarta\",\"created_at\":\"2026-05-24T10:05:16.000Z\"}]}}', 6, '2026-05-24 10:05:16'),
(24, 1, '/api/v1/marketplace/shipments', 'GET', NULL, 200, '{\"status\":\"Success\",\"data\":[{\"awb_number\":\"LSK17116745785\",\"external_order_id\":\"TEST-1779617116740\",\"receiver_name\":\"Test Receiver\",\"receiver_city\":null,\"service_type\":\"Reguler\",\"total_biaya\":\"31500.00\",\"status\":\"Pending\",\"created_at\":\"2026-05-24T10:05:16.000Z\"},{\"awb_number\":\"LSK16346373678\",\"external_order_id\":\"TEST-1779616346368\",\"receiver_name\":\"Test Receiver\",\"receiver_city\":null,\"service_type\":\"Reguler\",\"total_biaya\":\"31500.00\",\"status\":\"Cancelled\",\"created_at\":\"2026-05-24T09:52:26.000Z\"},{\"awb_number\":\"LSK15209663111\",\"external_order_id\":\"TEST-1779615209660\",\"receiver_name\":\"Test Receiver\",\"receiver_city\":null,\"service_type\":\"Reguler\",\"total_biaya\":\"31500.00\",\"status\":\"Cancelled\",\"created_at\":\"2026-05-24T09:33:29.000Z\"},{\"awb_number\":\"LSK15129747173\",\"external_order_id\":\"TEST-1779615129744\",\"receiver_name\":\"Test Receiver\",\"receiver_city\":null,\"service_type\":\"Reguler\",\"total_biaya\":\"31500.00\",\"status\":\"Pending\",\"created_at\":\"2026-05-24T09:32:09.000Z\"},{\"awb_number\":\"LSK14928729413\",\"external_order_id\":\"TEST-1779614928723\",\"receiver_name\":\"Test Receiver\",\"receiver_city\":null,\"service_type\":\"Reguler\",\"total_biaya\":\"31500.00\",\"status\":\"Pending\",\"created_at\":\"2026-05-24T09:28:48.000Z\"}]}', 3, '2026-05-24 10:05:16'),
(25, 1, '/api/v1/marketplace/shipments/LSK17116745785/cancel', 'POST', '{}', 200, '{\"status\":\"Success\",\"message\":\"Pengiriman berhasil dibatalkan\"}', 7, '2026-05-24 10:05:16'),
(26, 1, '/api/v1/marketplace/check-ongkir', 'POST', '{\"kota_asal\":\"Jakarta\",\"kota_tujuan\":\"Bandung\",\"origin_lat\":-6.2,\"origin_lng\":106.816666,\"destination_lat\":-6.914744,\"destination_lng\":107.60981,\"weight\":2}', 200, '{\"status\":\"Success\",\"data\":{\"origin\":{\"lat\":-6.2,\"lng\":106.816666,\"city\":null},\"destination\":{\"lat\":-6.914744,\"lng\":107.60981,\"city\":null},\"distance_km\":118.29,\"weight\":2,\"options\":[{\"rate_id\":1,\"service\":\"Reguler\",\"estimasi\":\"2-4 Hari\",\"breakdown\":{\"biaya_dasar\":8000,\"biaya_jarak\":5915,\"biaya_berat\":4000,\"tarif_per_km\":50,\"tarif_per_kg\":2000},\"ongkir\":18000,\"biaya_admin\":540,\"biaya_admin_persen\":\"3%\",\"total\":18540},{\"rate_id\":2,\"service\":\"Express\",\"estimasi\":\"1-2 Hari\",\"breakdown\":{\"biaya_dasar\":15000,\"biaya_jarak\":9463,\"biaya_berat\":7000,\"tarif_per_km\":80,\"tarif_per_kg\":3500},\"ongkir\":31500,\"biaya_admin\":945,\"biaya_admin_persen\":\"3%\",\"total\":32445}]}}', 2, '2026-05-24 10:05:22'),
(27, 1, '/api/v1/marketplace/create-shipment', 'POST', '{\"external_order_id\":\"TEST-1779617123005\",\"sender_name\":\"Test Sender\",\"sender_address\":\"Jl Test Sender 1\",\"sender_city\":\"Jakarta\",\"receiver_name\":\"Test Receiver\",\"receiver_address\":\"Jl Test Receiver 2\",\"receiver_city\":\"Bandung\",\"weight\":2,\"service_type\":\"Reguler\"}', 201, '{\"status\":\"Success\",\"message\":\"Resi berhasil diterbitkan\",\"data\":{\"awb_number\":\"LSK17123010986\",\"partner\":\"Marketplace Simulator\",\"external_order_id\":\"TEST-1779617123005\",\"service_type\":\"Reguler\",\"weight\":2,\"total_biaya\":31500,\"status\":\"Pending\"}}', 7, '2026-05-24 10:05:23'),
(28, 1, '/api/v1/marketplace/tracking/LSK17123010986', 'GET', NULL, 200, '{\"status\":\"Success\",\"data\":{\"shipment\":{\"awb_number\":\"LSK17123010986\",\"status\":\"Pending\",\"service_type\":\"Reguler\",\"created_at\":\"2026-05-24T10:05:23.000Z\"},\"tracking_history\":[{\"status\":\"Pending\",\"description\":\"Pesanan diterima dari API Marketplace\",\"location\":\"Jakarta\",\"created_at\":\"2026-05-24T10:05:23.000Z\"}]}}', 2, '2026-05-24 10:05:23'),
(29, 1, '/api/v1/marketplace/shipments', 'GET', NULL, 200, '{\"status\":\"Success\",\"data\":[{\"awb_number\":\"LSK17123010986\",\"external_order_id\":\"TEST-1779617123005\",\"receiver_name\":\"Test Receiver\",\"receiver_city\":null,\"service_type\":\"Reguler\",\"total_biaya\":\"31500.00\",\"status\":\"Pending\",\"created_at\":\"2026-05-24T10:05:23.000Z\"},{\"awb_number\":\"LSK17116745785\",\"external_order_id\":\"TEST-1779617116740\",\"receiver_name\":\"Test Receiver\",\"receiver_city\":null,\"service_type\":\"Reguler\",\"total_biaya\":\"31500.00\",\"status\":\"Cancelled\",\"created_at\":\"2026-05-24T10:05:16.000Z\"},{\"awb_number\":\"LSK16346373678\",\"external_order_id\":\"TEST-1779616346368\",\"receiver_name\":\"Test Receiver\",\"receiver_city\":null,\"service_type\":\"Reguler\",\"total_biaya\":\"31500.00\",\"status\":\"Cancelled\",\"created_at\":\"2026-05-24T09:52:26.000Z\"},{\"awb_number\":\"LSK15209663111\",\"external_order_id\":\"TEST-1779615209660\",\"receiver_name\":\"Test Receiver\",\"receiver_city\":null,\"service_type\":\"Reguler\",\"total_biaya\":\"31500.00\",\"status\":\"Cancelled\",\"created_at\":\"2026-05-24T09:33:29.000Z\"},{\"awb_number\":\"LSK15129747173\",\"external_order_id\":\"TEST-1779615129744\",\"receiver_name\":\"Test Receiver\",\"receiver_city\":null,\"service_type\":\"Reguler\",\"total_biaya\":\"31500.00\",\"status\":\"Pending\",\"created_at\":\"2026-05-24T09:32:09.000Z\"},{\"awb_number\":\"LSK14928729413\",\"external_order_id\":\"TEST-1779614928723\",\"receiver_name\":\"Test Receiver\",\"receiver_city\":null,\"service_type\":\"Reguler\",\"total_biaya\":\"31500.00\",\"status\":\"Pending\",\"created_at\":\"2026-05-24T09:28:48.000Z\"}]}', 2, '2026-05-24 10:05:23'),
(30, 1, '/api/v1/marketplace/shipments/LSK17123010986/cancel', 'POST', '{}', 200, '{\"status\":\"Success\",\"message\":\"Pengiriman berhasil dibatalkan\"}', 6, '2026-05-24 10:05:23'),
(31, 1, '/api/v1/marketplace/check-ongkir', 'POST', '{\"kota_asal\":\"Jakarta\",\"kota_tujuan\":\"Bandung\",\"origin_lat\":-6.2,\"origin_lng\":106.816666,\"destination_lat\":-6.914744,\"destination_lng\":107.60981,\"weight\":2}', 200, '{\"status\":\"Success\",\"data\":{\"origin\":{\"lat\":-6.2,\"lng\":106.816666,\"city\":null},\"destination\":{\"lat\":-6.914744,\"lng\":107.60981,\"city\":null},\"distance_km\":118.29,\"weight\":2,\"options\":[{\"rate_id\":1,\"service\":\"Reguler\",\"estimasi\":\"2-4 Hari\",\"breakdown\":{\"biaya_dasar\":8000,\"biaya_jarak\":5915,\"biaya_berat\":4000,\"tarif_per_km\":50,\"tarif_per_kg\":2000},\"ongkir\":18000,\"biaya_admin\":540,\"biaya_admin_persen\":\"3%\",\"total\":18540},{\"rate_id\":2,\"service\":\"Express\",\"estimasi\":\"1-2 Hari\",\"breakdown\":{\"biaya_dasar\":15000,\"biaya_jarak\":9463,\"biaya_berat\":7000,\"tarif_per_km\":80,\"tarif_per_kg\":3500},\"ongkir\":31500,\"biaya_admin\":945,\"biaya_admin_persen\":\"3%\",\"total\":32445}]}}', 2, '2026-05-24 10:05:35'),
(32, 1, '/api/v1/marketplace/create-shipment', 'POST', '{\"external_order_id\":\"TEST-1779617135698\",\"sender_name\":\"Test Sender\",\"sender_address\":\"Jl Test Sender 1\",\"sender_city\":\"Jakarta\",\"receiver_name\":\"Test Receiver\",\"receiver_address\":\"Jl Test Receiver 2\",\"receiver_city\":\"Bandung\",\"weight\":2,\"service_type\":\"Reguler\"}', 201, '{\"status\":\"Success\",\"message\":\"Resi berhasil diterbitkan\",\"data\":{\"awb_number\":\"LSK17135703769\",\"partner\":\"Marketplace Simulator\",\"external_order_id\":\"TEST-1779617135698\",\"service_type\":\"Reguler\",\"weight\":2,\"total_biaya\":31500,\"status\":\"Pending\"}}', 9, '2026-05-24 10:05:35'),
(33, 1, '/api/v1/marketplace/tracking/LSK17135703769', 'GET', NULL, 200, '{\"status\":\"Success\",\"data\":{\"shipment\":{\"awb_number\":\"LSK17135703769\",\"status\":\"Pending\",\"service_type\":\"Reguler\",\"created_at\":\"2026-05-24T10:05:35.000Z\"},\"tracking_history\":[{\"status\":\"Pending\",\"description\":\"Pesanan diterima dari API Marketplace\",\"location\":\"Jakarta\",\"created_at\":\"2026-05-24T10:05:35.000Z\"}]}}', 2, '2026-05-24 10:05:35'),
(34, 1, '/api/v1/marketplace/shipments', 'GET', NULL, 200, '{\"status\":\"Success\",\"data\":[{\"awb_number\":\"LSK17135703769\",\"external_order_id\":\"TEST-1779617135698\",\"receiver_name\":\"Test Receiver\",\"receiver_city\":null,\"service_type\":\"Reguler\",\"total_biaya\":\"31500.00\",\"status\":\"Pending\",\"created_at\":\"2026-05-24T10:05:35.000Z\"},{\"awb_number\":\"LSK17123010986\",\"external_order_id\":\"TEST-1779617123005\",\"receiver_name\":\"Test Receiver\",\"receiver_city\":null,\"service_type\":\"Reguler\",\"total_biaya\":\"31500.00\",\"status\":\"Cancelled\",\"created_at\":\"2026-05-24T10:05:23.000Z\"},{\"awb_number\":\"LSK17116745785\",\"external_order_id\":\"TEST-1779617116740\",\"receiver_name\":\"Test Receiver\",\"receiver_city\":null,\"service_type\":\"Reguler\",\"total_biaya\":\"31500.00\",\"status\":\"Cancelled\",\"created_at\":\"2026-05-24T10:05:16.000Z\"},{\"awb_number\":\"LSK16346373678\",\"external_order_id\":\"TEST-1779616346368\",\"receiver_name\":\"Test Receiver\",\"receiver_city\":null,\"service_type\":\"Reguler\",\"total_biaya\":\"31500.00\",\"status\":\"Cancelled\",\"created_at\":\"2026-05-24T09:52:26.000Z\"},{\"awb_number\":\"LSK15209663111\",\"external_order_id\":\"TEST-1779615209660\",\"receiver_name\":\"Test Receiver\",\"receiver_city\":null,\"service_type\":\"Reguler\",\"total_biaya\":\"31500.00\",\"status\":\"Cancelled\",\"created_at\":\"2026-05-24T09:33:29.000Z\"},{\"awb_number\":\"LSK15129747173\",\"external_order_id\":\"TEST-1779615129744\",\"receiver_name\":\"Test Receiver\",\"receiver_city\":null,\"service_type\":\"Reguler\",\"total_biaya\":\"31500.00\",\"status\":\"Pending\",\"created_at\":\"2026-05-24T09:32:09.000Z\"},{\"awb_number\":\"LSK14928729413\",\"external_order_id\":\"TEST-1779614928723\",\"receiver_name\":\"Test Receiver\",\"receiver_city\":null,\"service_type\":\"Reguler\",\"total_biaya\":\"31500.00\",\"status\":\"Pending\",\"created_at\":\"2026-05-24T09:28:48.000Z\"}]}', 3, '2026-05-24 10:05:35'),
(35, 1, '/api/v1/marketplace/shipments/LSK17135703769/cancel', 'POST', '{}', 200, '{\"status\":\"Success\",\"message\":\"Pengiriman berhasil dibatalkan\"}', 6, '2026-05-24 10:05:35'),
(36, 1, '/api/v1/marketplace/check-ongkir', 'POST', '{\"kota_asal\":\"Jakarta\",\"kota_tujuan\":\"Bandung\",\"origin_lat\":-6.2,\"origin_lng\":106.816666,\"destination_lat\":-6.914744,\"destination_lng\":107.60981,\"weight\":2}', 200, '{\"status\":\"Success\",\"data\":{\"origin\":{\"lat\":-6.2,\"lng\":106.816666,\"city\":null},\"destination\":{\"lat\":-6.914744,\"lng\":107.60981,\"city\":null},\"distance_km\":118.29,\"weight\":2,\"options\":[{\"rate_id\":1,\"service\":\"Reguler\",\"estimasi\":\"2-4 Hari\",\"breakdown\":{\"biaya_dasar\":8000,\"biaya_jarak\":5915,\"biaya_berat\":4000,\"tarif_per_km\":50,\"tarif_per_kg\":2000},\"ongkir\":18000,\"biaya_admin\":540,\"biaya_admin_persen\":\"3%\",\"total\":18540},{\"rate_id\":2,\"service\":\"Express\",\"estimasi\":\"1-2 Hari\",\"breakdown\":{\"biaya_dasar\":15000,\"biaya_jarak\":9463,\"biaya_berat\":7000,\"tarif_per_km\":80,\"tarif_per_kg\":3500},\"ongkir\":31500,\"biaya_admin\":945,\"biaya_admin_persen\":\"3%\",\"total\":32445}]}}', 21, '2026-05-31 05:21:24'),
(37, 1, '/api/v1/marketplace/create-shipment', 'POST', '{\"external_order_id\":\"TEST-1780204884298\",\"sender_name\":\"Test Sender\",\"sender_address\":\"Jl Test Sender 1\",\"sender_city\":\"Jakarta\",\"receiver_name\":\"Test Receiver\",\"receiver_address\":\"Jl Test Receiver 2\",\"receiver_city\":\"Bandung\",\"weight\":2,\"service_type\":\"Reguler\"}', 201, '{\"status\":\"Success\",\"message\":\"Resi berhasil diterbitkan\",\"data\":{\"awb_number\":\"LSK04884307981\",\"partner\":\"Marketplace Simulator\",\"external_order_id\":\"TEST-1780204884298\",\"service_type\":\"Reguler\",\"weight\":2,\"total_biaya\":31500,\"status\":\"Pending\"}}', 24, '2026-05-31 05:21:24'),
(38, 1, '/api/v1/marketplace/tracking/LSK04884307981', 'GET', NULL, 200, '{\"status\":\"Success\",\"data\":{\"shipment\":{\"awb_number\":\"LSK04884307981\",\"status\":\"Pending\",\"service_type\":\"Reguler\",\"created_at\":\"2026-05-31T05:21:24.000Z\"},\"tracking_history\":[{\"status\":\"Pending\",\"description\":\"Pesanan diterima dari API Marketplace\",\"location\":\"Jakarta\",\"created_at\":\"2026-05-31T05:21:24.000Z\"}]}}', 5, '2026-05-31 05:21:24'),
(39, 1, '/api/v1/marketplace/shipments', 'GET', NULL, 200, '{\"status\":\"Success\",\"data\":[{\"awb_number\":\"LSK04884307981\",\"external_order_id\":\"TEST-1780204884298\",\"receiver_name\":\"Test Receiver\",\"receiver_city\":null,\"service_type\":\"Reguler\",\"total_biaya\":\"31500.00\",\"status\":\"Pending\",\"created_at\":\"2026-05-31T05:21:24.000Z\"},{\"awb_number\":\"LSK17135703769\",\"external_order_id\":\"TEST-1779617135698\",\"receiver_name\":\"Test Receiver\",\"receiver_city\":null,\"service_type\":\"Reguler\",\"total_biaya\":\"31500.00\",\"status\":\"Cancelled\",\"created_at\":\"2026-05-24T10:05:35.000Z\"},{\"awb_number\":\"LSK17123010986\",\"external_order_id\":\"TEST-1779617123005\",\"receiver_name\":\"Test Receiver\",\"receiver_city\":null,\"service_type\":\"Reguler\",\"total_biaya\":\"31500.00\",\"status\":\"Cancelled\",\"created_at\":\"2026-05-24T10:05:23.000Z\"},{\"awb_number\":\"LSK17116745785\",\"external_order_id\":\"TEST-1779617116740\",\"receiver_name\":\"Test Receiver\",\"receiver_city\":null,\"service_type\":\"Reguler\",\"total_biaya\":\"31500.00\",\"status\":\"Cancelled\",\"created_at\":\"2026-05-24T10:05:16.000Z\"},{\"awb_number\":\"LSK16346373678\",\"external_order_id\":\"TEST-1779616346368\",\"receiver_name\":\"Test Receiver\",\"receiver_city\":null,\"service_type\":\"Reguler\",\"total_biaya\":\"31500.00\",\"status\":\"Cancelled\",\"created_at\":\"2026-05-24T09:52:26.000Z\"},{\"awb_number\":\"LSK15209663111\",\"external_order_id\":\"TEST-1779615209660\",\"receiver_name\":\"Test Receiver\",\"receiver_city\":null,\"service_type\":\"Reguler\",\"total_biaya\":\"31500.00\",\"status\":\"Cancelled\",\"created_at\":\"2026-05-24T09:33:29.000Z\"},{\"awb_number\":\"LSK15129747173\",\"external_order_id\":\"TEST-1779615129744\",\"receiver_name\":\"Test Receiver\",\"receiver_city\":null,\"service_type\":\"Reguler\",\"total_biaya\":\"31500.00\",\"status\":\"Pending\",\"created_at\":\"2026-05-24T09:32:09.000Z\"},{\"awb_number\":\"LSK14928729413\",\"external_order_id\":\"TEST-1779614928723\",\"receiver_name\":\"Test Receiver\",\"receiver_city\":null,\"service_type\":\"Reguler\",\"total_biaya\":\"31500.00\",\"status\":\"Pending\",\"created_at\":\"2026-05-24T09:28:48.000Z\"}]}', 4, '2026-05-31 05:21:24'),
(40, 1, '/api/v1/marketplace/shipments/LSK04884307981/cancel', 'POST', '{}', 200, '{\"status\":\"Success\",\"message\":\"Pengiriman berhasil dibatalkan\"}', 9, '2026-05-31 05:21:24'),
(41, 1, '/api/v1/marketplace/shipments', 'GET', NULL, 200, '{\"status\":\"Success\",\"data\":[{\"awb_number\":\"LSK04884307981\",\"external_order_id\":\"TEST-1780204884298\",\"receiver_name\":\"Test Receiver\",\"receiver_city\":null,\"service_type\":\"Reguler\",\"total_biaya\":\"31500.00\",\"status\":\"Cancelled\",\"created_at\":\"2026-05-31T05:21:24.000Z\"},{\"awb_number\":\"LSK17135703769\",\"external_order_id\":\"TEST-1779617135698\",\"receiver_name\":\"Test Receiver\",\"receiver_city\":null,\"service_type\":\"Reguler\",\"total_biaya\":\"31500.00\",\"status\":\"Cancelled\",\"created_at\":\"2026-05-24T10:05:35.000Z\"},{\"awb_number\":\"LSK17123010986\",\"external_order_id\":\"TEST-1779617123005\",\"receiver_name\":\"Test Receiver\",\"receiver_city\":null,\"service_type\":\"Reguler\",\"total_biaya\":\"31500.00\",\"status\":\"Cancelled\",\"created_at\":\"2026-05-24T10:05:23.000Z\"},{\"awb_number\":\"LSK17116745785\",\"external_order_id\":\"TEST-1779617116740\",\"receiver_name\":\"Test Receiver\",\"receiver_city\":null,\"service_type\":\"Reguler\",\"total_biaya\":\"31500.00\",\"status\":\"Cancelled\",\"created_at\":\"2026-05-24T10:05:16.000Z\"},{\"awb_number\":\"LSK16346373678\",\"external_order_id\":\"TEST-1779616346368\",\"receiver_name\":\"Test Receiver\",\"receiver_city\":null,\"service_type\":\"Reguler\",\"total_biaya\":\"31500.00\",\"status\":\"Cancelled\",\"created_at\":\"2026-05-24T09:52:26.000Z\"},{\"awb_number\":\"LSK15209663111\",\"external_order_id\":\"TEST-1779615209660\",\"receiver_name\":\"Test Receiver\",\"receiver_city\":null,\"service_type\":\"Reguler\",\"total_biaya\":\"31500.00\",\"status\":\"Cancelled\",\"created_at\":\"2026-05-24T09:33:29.000Z\"},{\"awb_number\":\"LSK15129747173\",\"external_order_id\":\"TEST-1779615129744\",\"receiver_name\":\"Test Receiver\",\"receiver_city\":null,\"service_type\":\"Reguler\",\"total_biaya\":\"31500.00\",\"status\":\"Pending\",\"created_at\":\"2026-05-24T09:32:09.000Z\"},{\"awb_number\":\"LSK14928729413\",\"external_order_id\":\"TEST-1779614928723\",\"receiver_name\":\"Test Receiver\",\"receiver_city\":null,\"service_type\":\"Reguler\",\"total_biaya\":\"31500.00\",\"status\":\"Pending\",\"created_at\":\"2026-05-24T09:28:48.000Z\"}]}', 8, '2026-05-31 11:57:19'),
(42, 1, '/api/v1/marketplace/check-ongkir', 'POST', '{\"origin_lat\":\"-6.2088\",\"origin_lng\":\"106.8456\",\"destination_lat\":\"-6.9175\",\"destination_lng\":\"107.6191\",\"weight\":\"1.5\",\"origin_city\":\"Jakarta\",\"destination_city\":\"Bandung\"}', 200, '{\"status\":\"Success\",\"data\":{\"origin\":{\"lat\":-6.2088,\"lng\":106.8456,\"city\":\"Jakarta\"},\"destination\":{\"lat\":-6.9175,\"lng\":107.6191,\"city\":\"Bandung\"},\"distance_km\":116.24,\"weight\":1.5,\"options\":[{\"rate_id\":1,\"service\":\"Reguler\",\"estimasi\":\"2-4 Hari\",\"breakdown\":{\"biaya_dasar\":8000,\"biaya_jarak\":5812,\"biaya_berat\":3000,\"tarif_per_km\":50,\"tarif_per_kg\":2000},\"ongkir\":16900,\"biaya_admin\":507,\"biaya_admin_persen\":\"3%\",\"total\":17407},{\"rate_id\":2,\"service\":\"Express\",\"estimasi\":\"1-2 Hari\",\"breakdown\":{\"biaya_dasar\":15000,\"biaya_jarak\":9299,\"biaya_berat\":5250,\"tarif_per_km\":80,\"tarif_per_kg\":3500},\"ongkir\":29600,\"biaya_admin\":888,\"biaya_admin_persen\":\"3%\",\"total\":30488}]}}', 3, '2026-05-31 11:57:25'),
(43, 1, '/api/v1/marketplace/create-shipment', 'POST', '{\"external_order_id\":\"TB-1780228649202\",\"sender_name\":\"TokoBagus Official\",\"sender_city\":\"Jakarta\",\"sender_address\":\"Jl. Gatot Subroto No.12, Jakarta Selatan, 12190\",\"receiver_name\":\"Andi Susanto\",\"receiver_city\":\"Bandung\",\"receiver_address\":\"Jl. Asia Afrika No. 10, Bandung, Jawa Barat\",\"weight\":\"1.5\",\"service_type\":\"Reguler\"}', 201, '{\"status\":\"Success\",\"message\":\"Resi berhasil diterbitkan\",\"data\":{\"awb_number\":\"LSK28649206736\",\"partner\":\"Marketplace Simulator\",\"external_order_id\":\"TB-1780228649202\",\"service_type\":\"Reguler\",\"weight\":1.5,\"total_biaya\":23625,\"status\":\"Pending\"}}', 11, '2026-05-31 11:57:29'),
(44, 1, '/api/v1/marketplace/tracking/LSK28649206736', 'GET', NULL, 200, '{\"status\":\"Success\",\"data\":{\"shipment\":{\"awb_number\":\"LSK28649206736\",\"status\":\"Pending\",\"service_type\":\"Reguler\",\"created_at\":\"2026-05-31T11:57:29.000Z\"},\"tracking_history\":[{\"status\":\"Pending\",\"description\":\"Pesanan diterima dari API Marketplace\",\"location\":\"Jakarta\",\"created_at\":\"2026-05-31T11:57:29.000Z\"}]}}', 3, '2026-05-31 11:57:29'),
(45, 1, '/api/v1/marketplace/shipments', 'GET', NULL, 200, '{\"status\":\"Success\",\"data\":[{\"awb_number\":\"LSK28649206736\",\"external_order_id\":\"TB-1780228649202\",\"receiver_name\":\"Andi Susanto\",\"receiver_city\":null,\"service_type\":\"Reguler\",\"total_biaya\":\"23625.00\",\"status\":\"Pending\",\"created_at\":\"2026-05-31T11:57:29.000Z\"},{\"awb_number\":\"LSK04884307981\",\"external_order_id\":\"TEST-1780204884298\",\"receiver_name\":\"Test Receiver\",\"receiver_city\":null,\"service_type\":\"Reguler\",\"total_biaya\":\"31500.00\",\"status\":\"Cancelled\",\"created_at\":\"2026-05-31T05:21:24.000Z\"},{\"awb_number\":\"LSK17135703769\",\"external_order_id\":\"TEST-1779617135698\",\"receiver_name\":\"Test Receiver\",\"receiver_city\":null,\"service_type\":\"Reguler\",\"total_biaya\":\"31500.00\",\"status\":\"Cancelled\",\"created_at\":\"2026-05-24T10:05:35.000Z\"},{\"awb_number\":\"LSK17123010986\",\"external_order_id\":\"TEST-1779617123005\",\"receiver_name\":\"Test Receiver\",\"receiver_city\":null,\"service_type\":\"Reguler\",\"total_biaya\":\"31500.00\",\"status\":\"Cancelled\",\"created_at\":\"2026-05-24T10:05:23.000Z\"},{\"awb_number\":\"LSK17116745785\",\"external_order_id\":\"TEST-1779617116740\",\"receiver_name\":\"Test Receiver\",\"receiver_city\":null,\"service_type\":\"Reguler\",\"total_biaya\":\"31500.00\",\"status\":\"Cancelled\",\"created_at\":\"2026-05-24T10:05:16.000Z\"},{\"awb_number\":\"LSK16346373678\",\"external_order_id\":\"TEST-1779616346368\",\"receiver_name\":\"Test Receiver\",\"receiver_city\":null,\"service_type\":\"Reguler\",\"total_biaya\":\"31500.00\",\"status\":\"Cancelled\",\"created_at\":\"2026-05-24T09:52:26.000Z\"},{\"awb_number\":\"LSK15209663111\",\"external_order_id\":\"TEST-1779615209660\",\"receiver_name\":\"Test Receiver\",\"receiver_city\":null,\"service_type\":\"Reguler\",\"total_biaya\":\"31500.00\",\"status\":\"Cancelled\",\"created_at\":\"2026-05-24T09:33:29.000Z\"},{\"awb_number\":\"LSK15129747173\",\"external_order_id\":\"TEST-1779615129744\",\"receiver_name\":\"Test Receiver\",\"receiver_city\":null,\"service_type\":\"Reguler\",\"total_biaya\":\"31500.00\",\"status\":\"Pending\",\"created_at\":\"2026-05-24T09:32:09.000Z\"},{\"awb_number\":\"LSK14928729413\",\"external_order_id\":\"TEST-1779614928723\",\"receiver_name\":\"Test Receiver\",\"receiver_city\":null,\"service_type\":\"Reguler\",\"total_biaya\":\"31500.00\",\"status\":\"Pending\",\"created_at\":\"2026-05-24T09:28:48.000Z\"}]}', 3, '2026-05-31 11:57:49'),
(46, 1, '/api/v1/marketplace/check-ongkir', 'POST', '{\"kota_asal\":\"Jakarta\",\"kota_tujuan\":\"Bandung\",\"origin_lat\":-6.2,\"origin_lng\":106.816666,\"destination_lat\":-6.914744,\"destination_lng\":107.60981,\"weight\":2}', 200, '{\"status\":\"Success\",\"data\":{\"origin\":{\"lat\":-6.2,\"lng\":106.816666,\"city\":null},\"destination\":{\"lat\":-6.914744,\"lng\":107.60981,\"city\":null},\"distance_km\":118.29,\"weight\":2,\"options\":[{\"rate_id\":1,\"service\":\"Reguler\",\"estimasi\":\"2-4 Hari\",\"breakdown\":{\"biaya_dasar\":8000,\"biaya_jarak\":5915,\"biaya_berat\":4000,\"tarif_per_km\":50,\"tarif_per_kg\":2000},\"ongkir\":18000,\"biaya_admin\":540,\"biaya_admin_persen\":\"3%\",\"total\":18540},{\"rate_id\":2,\"service\":\"Express\",\"estimasi\":\"1-2 Hari\",\"breakdown\":{\"biaya_dasar\":15000,\"biaya_jarak\":9463,\"biaya_berat\":7000,\"tarif_per_km\":80,\"tarif_per_kg\":3500},\"ongkir\":31500,\"biaya_admin\":945,\"biaya_admin_persen\":\"3%\",\"total\":32445}]}}', 13, '2026-05-31 12:21:57'),
(47, 1, '/api/v1/marketplace/create-shipment', 'POST', '{\"external_order_id\":\"TEST-1780230117888\",\"sender_name\":\"Test Sender\",\"sender_address\":\"Jl Test Sender 1\",\"sender_city\":\"Jakarta\",\"receiver_name\":\"Test Receiver\",\"receiver_address\":\"Jl Test Receiver 2\",\"receiver_city\":\"Bandung\",\"weight\":2,\"service_type\":\"Reguler\"}', 201, '{\"status\":\"Success\",\"message\":\"Resi berhasil diterbitkan\",\"data\":{\"awb_number\":\"LSK30117898441\",\"partner\":\"Marketplace Simulator\",\"external_order_id\":\"TEST-1780230117888\",\"service_type\":\"Reguler\",\"weight\":2,\"total_biaya\":31500,\"status\":\"Pending\"}}', 13, '2026-05-31 12:21:57'),
(48, 1, '/api/v1/marketplace/tracking/LSK30117898441', 'GET', NULL, 200, '{\"status\":\"Success\",\"data\":{\"shipment\":{\"awb_number\":\"LSK30117898441\",\"status\":\"Pending\",\"service_type\":\"Reguler\",\"created_at\":\"2026-05-31T12:21:57.000Z\"},\"tracking_history\":[{\"status\":\"Pending\",\"description\":\"Pesanan diterima dari API Marketplace\",\"location\":\"Jakarta\",\"created_at\":\"2026-05-31T12:21:57.000Z\"}]}}', 7, '2026-05-31 12:21:57'),
(49, 1, '/api/v1/marketplace/shipments', 'GET', NULL, 200, '{\"status\":\"Success\",\"data\":[{\"awb_number\":\"LSK30117898441\",\"external_order_id\":\"TEST-1780230117888\",\"receiver_name\":\"Test Receiver\",\"receiver_city\":null,\"service_type\":\"Reguler\",\"total_biaya\":\"31500.00\",\"status\":\"Pending\",\"created_at\":\"2026-05-31T12:21:57.000Z\"},{\"awb_number\":\"LSK28649206736\",\"external_order_id\":\"TB-1780228649202\",\"receiver_name\":\"Andi Susanto\",\"receiver_city\":null,\"service_type\":\"Reguler\",\"total_biaya\":\"23625.00\",\"status\":\"Delivered\",\"created_at\":\"2026-05-31T11:57:29.000Z\"},{\"awb_number\":\"LSK04884307981\",\"external_order_id\":\"TEST-1780204884298\",\"receiver_name\":\"Test Receiver\",\"receiver_city\":null,\"service_type\":\"Reguler\",\"total_biaya\":\"31500.00\",\"status\":\"Cancelled\",\"created_at\":\"2026-05-31T05:21:24.000Z\"},{\"awb_number\":\"LSK17135703769\",\"external_order_id\":\"TEST-1779617135698\",\"receiver_name\":\"Test Receiver\",\"receiver_city\":null,\"service_type\":\"Reguler\",\"total_biaya\":\"31500.00\",\"status\":\"Cancelled\",\"created_at\":\"2026-05-24T10:05:35.000Z\"},{\"awb_number\":\"LSK17123010986\",\"external_order_id\":\"TEST-1779617123005\",\"receiver_name\":\"Test Receiver\",\"receiver_city\":null,\"service_type\":\"Reguler\",\"total_biaya\":\"31500.00\",\"status\":\"Cancelled\",\"created_at\":\"2026-05-24T10:05:23.000Z\"},{\"awb_number\":\"LSK17116745785\",\"external_order_id\":\"TEST-1779617116740\",\"receiver_name\":\"Test Receiver\",\"receiver_city\":null,\"service_type\":\"Reguler\",\"total_biaya\":\"31500.00\",\"status\":\"Cancelled\",\"created_at\":\"2026-05-24T10:05:16.000Z\"},{\"awb_number\":\"LSK16346373678\",\"external_order_id\":\"TEST-1779616346368\",\"receiver_name\":\"Test Receiver\",\"receiver_city\":null,\"service_type\":\"Reguler\",\"total_biaya\":\"31500.00\",\"status\":\"Cancelled\",\"created_at\":\"2026-05-24T09:52:26.000Z\"},{\"awb_number\":\"LSK15209663111\",\"external_order_id\":\"TEST-1779615209660\",\"receiver_name\":\"Test Receiver\",\"receiver_city\":null,\"service_type\":\"Reguler\",\"total_biaya\":\"31500.00\",\"status\":\"Cancelled\",\"created_at\":\"2026-05-24T09:33:29.000Z\"},{\"awb_number\":\"LSK15129747173\",\"external_order_id\":\"TEST-1779615129744\",\"receiver_name\":\"Test Receiver\",\"receiver_city\":null,\"service_type\":\"Reguler\",\"total_biaya\":\"31500.00\",\"status\":\"Pending\",\"created_at\":\"2026-05-24T09:32:09.000Z\"},{\"awb_number\":\"LSK14928729413\",\"external_order_id\":\"TEST-1779614928723\",\"receiver_name\":\"Test Receiver\",\"receiver_city\":null,\"service_type\":\"Reguler\",\"total_biaya\":\"31500.00\",\"status\":\"Pending\",\"created_at\":\"2026-05-24T09:28:48.000Z\"}]}', 3, '2026-05-31 12:21:57'),
(50, 1, '/api/v1/marketplace/shipments/LSK30117898441/cancel', 'POST', '{}', 200, '{\"status\":\"Success\",\"message\":\"Pengiriman berhasil dibatalkan\"}', 7, '2026-05-31 12:21:57'),
(51, 1, '/api/v1/marketplace/check-ongkir', 'POST', '{\"kota_asal\":\"Jakarta\",\"kota_tujuan\":\"Bandung\",\"origin_lat\":-6.2,\"origin_lng\":106.816666,\"destination_lat\":-6.914744,\"destination_lng\":107.60981,\"weight\":2}', 200, '{\"status\":\"Success\",\"data\":{\"origin\":{\"lat\":-6.2,\"lng\":106.816666,\"city\":null},\"destination\":{\"lat\":-6.914744,\"lng\":107.60981,\"city\":null},\"distance_km\":118.29,\"weight\":2,\"options\":[{\"rate_id\":1,\"service\":\"Reguler\",\"estimasi\":\"2-4 Hari\",\"breakdown\":{\"biaya_dasar\":8000,\"biaya_jarak\":5915,\"biaya_berat\":4000,\"tarif_per_km\":50,\"tarif_per_kg\":2000},\"ongkir\":18000,\"biaya_admin\":540,\"biaya_admin_persen\":\"3%\",\"total\":18540},{\"rate_id\":2,\"service\":\"Express\",\"estimasi\":\"1-2 Hari\",\"breakdown\":{\"biaya_dasar\":15000,\"biaya_jarak\":9463,\"biaya_berat\":7000,\"tarif_per_km\":80,\"tarif_per_kg\":3500},\"ongkir\":31500,\"biaya_admin\":945,\"biaya_admin_persen\":\"3%\",\"total\":32445}]}}', 4, '2026-05-31 12:45:18'),
(52, 1, '/api/v1/marketplace/create-shipment', 'POST', '{\"external_order_id\":\"TEST-1780231518748\",\"sender_name\":\"Test Sender\",\"sender_address\":\"Jl Test Sender 1\",\"sender_city\":\"Jakarta\",\"receiver_name\":\"Test Receiver\",\"receiver_address\":\"Jl Test Receiver 2\",\"receiver_city\":\"Bandung\",\"weight\":2,\"service_type\":\"Reguler\"}', 201, '{\"status\":\"Success\",\"message\":\"Resi berhasil diterbitkan\",\"data\":{\"awb_number\":\"LSK31518753841\",\"partner\":\"Marketplace Simulator\",\"external_order_id\":\"TEST-1780231518748\",\"service_type\":\"Reguler\",\"weight\":2,\"total_biaya\":31500,\"status\":\"Pending\"}}', 6, '2026-05-31 12:45:18'),
(53, 1, '/api/v1/marketplace/tracking/LSK31518753841', 'GET', NULL, 200, '{\"status\":\"Success\",\"data\":{\"shipment\":{\"awb_number\":\"LSK31518753841\",\"status\":\"Pending\",\"service_type\":\"Reguler\",\"created_at\":\"2026-05-31T12:45:18.000Z\"},\"tracking_history\":[{\"status\":\"Pending\",\"description\":\"Pesanan diterima dari API Marketplace\",\"location\":\"Jakarta\",\"created_at\":\"2026-05-31T12:45:18.000Z\"}]}}', 3, '2026-05-31 12:45:18'),
(54, 1, '/api/v1/marketplace/shipments', 'GET', NULL, 200, '{\"status\":\"Success\",\"data\":[{\"awb_number\":\"LSK31518753841\",\"external_order_id\":\"TEST-1780231518748\",\"receiver_name\":\"Test Receiver\",\"receiver_city\":null,\"service_type\":\"Reguler\",\"total_biaya\":\"31500.00\",\"status\":\"Pending\",\"created_at\":\"2026-05-31T12:45:18.000Z\"},{\"awb_number\":\"LSK30117898441\",\"external_order_id\":\"TEST-1780230117888\",\"receiver_name\":\"Test Receiver\",\"receiver_city\":null,\"service_type\":\"Reguler\",\"total_biaya\":\"31500.00\",\"status\":\"Cancelled\",\"created_at\":\"2026-05-31T12:21:57.000Z\"},{\"awb_number\":\"LSK28649206736\",\"external_order_id\":\"TB-1780228649202\",\"receiver_name\":\"Andi Susanto\",\"receiver_city\":null,\"service_type\":\"Reguler\",\"total_biaya\":\"23625.00\",\"status\":\"Delivered\",\"created_at\":\"2026-05-31T11:57:29.000Z\"},{\"awb_number\":\"LSK04884307981\",\"external_order_id\":\"TEST-1780204884298\",\"receiver_name\":\"Test Receiver\",\"receiver_city\":null,\"service_type\":\"Reguler\",\"total_biaya\":\"31500.00\",\"status\":\"Cancelled\",\"created_at\":\"2026-05-31T05:21:24.000Z\"},{\"awb_number\":\"LSK17135703769\",\"external_order_id\":\"TEST-1779617135698\",\"receiver_name\":\"Test Receiver\",\"receiver_city\":null,\"service_type\":\"Reguler\",\"total_biaya\":\"31500.00\",\"status\":\"Cancelled\",\"created_at\":\"2026-05-24T10:05:35.000Z\"},{\"awb_number\":\"LSK17123010986\",\"external_order_id\":\"TEST-1779617123005\",\"receiver_name\":\"Test Receiver\",\"receiver_city\":null,\"service_type\":\"Reguler\",\"total_biaya\":\"31500.00\",\"status\":\"Cancelled\",\"created_at\":\"2026-05-24T10:05:23.000Z\"},{\"awb_number\":\"LSK17116745785\",\"external_order_id\":\"TEST-1779617116740\",\"receiver_name\":\"Test Receiver\",\"receiver_city\":null,\"service_type\":\"Reguler\",\"total_biaya\":\"31500.00\",\"status\":\"Cancelled\",\"created_at\":\"2026-05-24T10:05:16.000Z\"},{\"awb_number\":\"LSK16346373678\",\"external_order_id\":\"TEST-1779616346368\",\"receiver_name\":\"Test Receiver\",\"receiver_city\":null,\"service_type\":\"Reguler\",\"total_biaya\":\"31500.00\",\"status\":\"Cancelled\",\"created_at\":\"2026-05-24T09:52:26.000Z\"},{\"awb_number\":\"LSK15209663111\",\"external_order_id\":\"TEST-1779615209660\",\"receiver_name\":\"Test Receiver\",\"receiver_city\":null,\"service_type\":\"Reguler\",\"total_biaya\":\"31500.00\",\"status\":\"Cancelled\",\"created_at\":\"2026-05-24T09:33:29.000Z\"},{\"awb_number\":\"LSK15129747173\",\"external_order_id\":\"TEST-1779615129744\",\"receiver_name\":\"Test Receiver\",\"receiver_city\":null,\"service_type\":\"Reguler\",\"total_biaya\":\"31500.00\",\"status\":\"Pending\",\"created_at\":\"2026-05-24T09:32:09.000Z\"},{\"awb_number\":\"LSK14928729413\",\"external_order_id\":\"TEST-1779614928723\",\"receiver_name\":\"Test Receiver\",\"receiver_city\":null,\"service_type\":\"Reguler\",\"total_biaya\":\"31500.00\",\"status\":\"Pending\",\"created_at\":\"2026-05-24T09:28:48.000Z\"}]}', 3, '2026-05-31 12:45:18'),
(55, 1, '/api/v1/marketplace/shipments/LSK31518753841/cancel', 'POST', '{}', 200, '{\"status\":\"Success\",\"message\":\"Pengiriman berhasil dibatalkan\"}', 5, '2026-05-31 12:45:18'),
(56, 1, '/api/v1/marketplace/check-ongkir', 'POST', '{\"kota_asal\":\"Jakarta\",\"kota_tujuan\":\"Bandung\",\"origin_lat\":-6.2,\"origin_lng\":106.816666,\"destination_lat\":-6.914744,\"destination_lng\":107.60981,\"weight\":2}', 200, '{\"status\":\"Success\",\"data\":{\"origin\":{\"lat\":-6.2,\"lng\":106.816666,\"city\":null},\"destination\":{\"lat\":-6.914744,\"lng\":107.60981,\"city\":null},\"distance_km\":118.29,\"weight\":2,\"options\":[{\"rate_id\":1,\"service\":\"Reguler\",\"estimasi\":\"2-4 Hari\",\"breakdown\":{\"biaya_dasar\":8000,\"biaya_jarak\":5915,\"biaya_berat\":4000,\"tarif_per_km\":50,\"tarif_per_kg\":2000},\"ongkir\":18000,\"biaya_admin\":540,\"biaya_admin_persen\":\"3%\",\"total\":18540},{\"rate_id\":2,\"service\":\"Express\",\"estimasi\":\"1-2 Hari\",\"breakdown\":{\"biaya_dasar\":15000,\"biaya_jarak\":9463,\"biaya_berat\":7000,\"tarif_per_km\":80,\"tarif_per_kg\":3500},\"ongkir\":31500,\"biaya_admin\":945,\"biaya_admin_persen\":\"3%\",\"total\":32445}]}}', 8, '2026-05-31 13:34:03'),
(57, 1, '/api/v1/marketplace/create-shipment', 'POST', '{\"external_order_id\":\"TEST-1780234443766\",\"sender_name\":\"Test Sender\",\"sender_address\":\"Jl Test Sender 1\",\"sender_city\":\"Jakarta\",\"receiver_name\":\"Test Receiver\",\"receiver_address\":\"Jl Test Receiver 2\",\"receiver_city\":\"Bandung\",\"weight\":2,\"service_type\":\"Reguler\"}', 201, '{\"status\":\"Success\",\"message\":\"Resi berhasil diterbitkan\",\"data\":{\"awb_number\":\"LSK34443770599\",\"partner\":\"Marketplace Simulator\",\"external_order_id\":\"TEST-1780234443766\",\"service_type\":\"Reguler\",\"weight\":2,\"total_biaya\":31500,\"status\":\"Pending\"}}', 6, '2026-05-31 13:34:03'),
(58, 1, '/api/v1/marketplace/tracking/LSK34443770599', 'GET', NULL, 200, '{\"status\":\"Success\",\"data\":{\"shipment\":{\"awb_number\":\"LSK34443770599\",\"status\":\"Pending\",\"service_type\":\"Reguler\",\"created_at\":\"2026-05-31T13:34:03.000Z\"},\"tracking_history\":[{\"status\":\"Pending\",\"description\":\"Pesanan diterima dari API Marketplace\",\"location\":\"Jakarta\",\"created_at\":\"2026-05-31T13:34:03.000Z\"}]}}', 3, '2026-05-31 13:34:03');
INSERT INTO `api_logs` (`id`, `partner_id`, `endpoint`, `method`, `request_payload`, `response_status`, `response_body`, `execution_time_ms`, `created_at`) VALUES
(59, 1, '/api/v1/marketplace/shipments', 'GET', NULL, 200, '{\"status\":\"Success\",\"data\":[{\"awb_number\":\"LSK34443770599\",\"external_order_id\":\"TEST-1780234443766\",\"receiver_name\":\"Test Receiver\",\"receiver_city\":null,\"service_type\":\"Reguler\",\"total_biaya\":\"31500.00\",\"status\":\"Pending\",\"created_at\":\"2026-05-31T13:34:03.000Z\"},{\"awb_number\":\"LSK31518753841\",\"external_order_id\":\"TEST-1780231518748\",\"receiver_name\":\"Test Receiver\",\"receiver_city\":null,\"service_type\":\"Reguler\",\"total_biaya\":\"31500.00\",\"status\":\"Cancelled\",\"created_at\":\"2026-05-31T12:45:18.000Z\"},{\"awb_number\":\"LSK30117898441\",\"external_order_id\":\"TEST-1780230117888\",\"receiver_name\":\"Test Receiver\",\"receiver_city\":null,\"service_type\":\"Reguler\",\"total_biaya\":\"31500.00\",\"status\":\"Cancelled\",\"created_at\":\"2026-05-31T12:21:57.000Z\"},{\"awb_number\":\"LSK28649206736\",\"external_order_id\":\"TB-1780228649202\",\"receiver_name\":\"Andi Susanto\",\"receiver_city\":null,\"service_type\":\"Reguler\",\"total_biaya\":\"23625.00\",\"status\":\"Delivered\",\"created_at\":\"2026-05-31T11:57:29.000Z\"},{\"awb_number\":\"LSK04884307981\",\"external_order_id\":\"TEST-1780204884298\",\"receiver_name\":\"Test Receiver\",\"receiver_city\":null,\"service_type\":\"Reguler\",\"total_biaya\":\"31500.00\",\"status\":\"Cancelled\",\"created_at\":\"2026-05-31T05:21:24.000Z\"},{\"awb_number\":\"LSK17135703769\",\"external_order_id\":\"TEST-1779617135698\",\"receiver_name\":\"Test Receiver\",\"receiver_city\":null,\"service_type\":\"Reguler\",\"total_biaya\":\"31500.00\",\"status\":\"Cancelled\",\"created_at\":\"2026-05-24T10:05:35.000Z\"},{\"awb_number\":\"LSK17123010986\",\"external_order_id\":\"TEST-1779617123005\",\"receiver_name\":\"Test Receiver\",\"receiver_city\":null,\"service_type\":\"Reguler\",\"total_biaya\":\"31500.00\",\"status\":\"Cancelled\",\"created_at\":\"2026-05-24T10:05:23.000Z\"},{\"awb_number\":\"LSK17116745785\",\"external_order_id\":\"TEST-1779617116740\",\"receiver_name\":\"Test Receiver\",\"receiver_city\":null,\"service_type\":\"Reguler\",\"total_biaya\":\"31500.00\",\"status\":\"Cancelled\",\"created_at\":\"2026-05-24T10:05:16.000Z\"},{\"awb_number\":\"LSK16346373678\",\"external_order_id\":\"TEST-1779616346368\",\"receiver_name\":\"Test Receiver\",\"receiver_city\":null,\"service_type\":\"Reguler\",\"total_biaya\":\"31500.00\",\"status\":\"Cancelled\",\"created_at\":\"2026-05-24T09:52:26.000Z\"},{\"awb_number\":\"LSK15209663111\",\"external_order_id\":\"TEST-1779615209660\",\"receiver_name\":\"Test Receiver\",\"receiver_city\":null,\"service_type\":\"Reguler\",\"total_biaya\":\"31500.00\",\"status\":\"Cancelled\",\"created_at\":\"2026-05-24T09:33:29.000Z\"},{\"awb_number\":\"LSK15129747173\",\"external_order_id\":\"TEST-1779615129744\",\"receiver_name\":\"Test Receiver\",\"receiver_city\":null,\"service_type\":\"Reguler\",\"total_biaya\":\"31500.00\",\"status\":\"Pending\",\"created_at\":\"2026-05-24T09:32:09.000Z\"},{\"awb_number\":\"LSK14928729413\",\"external_order_id\":\"TEST-1779614928723\",\"receiver_name\":\"Test Receiver\",\"receiver_city\":null,\"service_type\":\"Reguler\",\"total_biaya\":\"31500.00\",\"status\":\"Pending\",\"created_at\":\"2026-05-24T09:28:48.000Z\"}]}', 3, '2026-05-31 13:34:03'),
(60, 1, '/api/v1/marketplace/shipments/LSK34443770599/cancel', 'POST', '{}', 200, '{\"status\":\"Success\",\"message\":\"Pengiriman berhasil dibatalkan\"}', 3, '2026-05-31 13:34:03'),
(69, 999, '/api/v1/rates', 'POST', '{}', 200, '{\"status\":\"Success\",\"data\":{\"origin\":\"Jakarta\",\"destination\":\"Bandung\",\"weight\":2,\"options\":[{\"service\":\"Reguler\",\"price\":30000,\"estimasi\":\"2-3 Hari\"},{\"service\":\"Express\",\"price\":50000,\"estimasi\":\"1 Hari\"}]}}', 5, '2026-05-31 16:56:39'),
(70, 999, '/api/v1/rates', 'POST', '{}', 200, '{\"status\":\"Success\",\"data\":{\"origin\":\"Jakarta\",\"destination\":\"Bandung\",\"weight\":1,\"options\":[{\"service\":\"Reguler\",\"price\":15000,\"estimasi\":\"2-3 Hari\"},{\"service\":\"Express\",\"price\":25000,\"estimasi\":\"1 Hari\"}]}}', 3, '2026-05-31 16:56:40'),
(71, 999, '/api/v1/integration-test', 'GET', '{}', 200, '{\"apiGateway\":{\"status\":\"Connected\",\"message\":\"API Gateway Connected (Simulator)\"},\"smartBank\":{\"status\":\"Connected\",\"message\":\"SmartBank Connected (Simulator)\"},\"marketplace\":{\"status\":\"Connected\",\"message\":\"Marketplace Connected (Simulator)\"},\"webhook\":{\"status\":\"Connected\",\"message\":\"Webhook Reachable (Simulator)\"}}', 1, '2026-05-31 17:13:02'),
(72, 999, '/api/v1/integration-test', 'GET', '{}', 200, '{\"apiGateway\":{\"status\":\"Connected\",\"message\":\"API Gateway Connected (Simulator)\"},\"smartBank\":{\"status\":\"Connected\",\"message\":\"SmartBank Connected (Simulator)\"},\"marketplace\":{\"status\":\"Connected\",\"message\":\"Marketplace Connected (Simulator)\"},\"webhook\":{\"status\":\"Connected\",\"message\":\"Webhook Reachable (Simulator)\"}}', 1, '2026-05-31 17:13:02'),
(73, 999, '/api/v1/integration-test', 'GET', '{}', 200, '{\"apiGateway\":{\"status\":\"Connected\",\"message\":\"API Gateway Connected (Simulator)\"},\"smartBank\":{\"status\":\"Connected\",\"message\":\"SmartBank Connected (Simulator)\"},\"marketplace\":{\"status\":\"Connected\",\"message\":\"Marketplace Connected (Simulator)\"},\"webhook\":{\"status\":\"Connected\",\"message\":\"Webhook Reachable (Simulator)\"}}', 1, '2026-05-31 17:20:15'),
(74, 999, '/api/v1/integration-test', 'GET', '{}', 200, '{\"apiGateway\":{\"status\":\"Connected\",\"message\":\"API Gateway Connected (Simulator)\"},\"smartBank\":{\"status\":\"Connected\",\"message\":\"SmartBank Connected (Simulator)\"},\"marketplace\":{\"status\":\"Connected\",\"message\":\"Marketplace Connected (Simulator)\"},\"webhook\":{\"status\":\"Connected\",\"message\":\"Webhook Reachable (Simulator)\"}}', 1, '2026-05-31 17:20:15'),
(75, 999, '/api/v1/integration-test', 'GET', '{}', 200, '{\"apiGateway\":{\"status\":\"Connected\",\"message\":\"API Gateway Connected (Simulator)\"},\"smartBank\":{\"status\":\"Connected\",\"message\":\"SmartBank Connected (Simulator)\"},\"marketplace\":{\"status\":\"Connected\",\"message\":\"Marketplace Connected (Simulator)\"},\"webhook\":{\"status\":\"Connected\",\"message\":\"Webhook Reachable (Simulator)\"}}', 0, '2026-05-31 17:20:15'),
(76, 1, '/api/v1/marketplace/shipments', 'GET', NULL, 200, '{\"status\":\"Success\",\"data\":[{\"awb_number\":\"LSK34443770599\",\"external_order_id\":\"TEST-1780234443766\",\"receiver_name\":\"Test Receiver\",\"receiver_city\":null,\"service_type\":\"Reguler\",\"total_biaya\":\"31500.00\",\"status\":\"Cancelled\",\"created_at\":\"2026-05-31T13:34:03.000Z\"},{\"awb_number\":\"LSK31518753841\",\"external_order_id\":\"TEST-1780231518748\",\"receiver_name\":\"Test Receiver\",\"receiver_city\":null,\"service_type\":\"Reguler\",\"total_biaya\":\"31500.00\",\"status\":\"Cancelled\",\"created_at\":\"2026-05-31T12:45:18.000Z\"},{\"awb_number\":\"LSK30117898441\",\"external_order_id\":\"TEST-1780230117888\",\"receiver_name\":\"Test Receiver\",\"receiver_city\":null,\"service_type\":\"Reguler\",\"total_biaya\":\"31500.00\",\"status\":\"Cancelled\",\"created_at\":\"2026-05-31T12:21:57.000Z\"},{\"awb_number\":\"LSK28649206736\",\"external_order_id\":\"TB-1780228649202\",\"receiver_name\":\"Andi Susanto\",\"receiver_city\":null,\"service_type\":\"Reguler\",\"total_biaya\":\"23625.00\",\"status\":\"Delivered\",\"created_at\":\"2026-05-31T11:57:29.000Z\"},{\"awb_number\":\"LSK04884307981\",\"external_order_id\":\"TEST-1780204884298\",\"receiver_name\":\"Test Receiver\",\"receiver_city\":null,\"service_type\":\"Reguler\",\"total_biaya\":\"31500.00\",\"status\":\"Cancelled\",\"created_at\":\"2026-05-31T05:21:24.000Z\"},{\"awb_number\":\"LSK17135703769\",\"external_order_id\":\"TEST-1779617135698\",\"receiver_name\":\"Test Receiver\",\"receiver_city\":null,\"service_type\":\"Reguler\",\"total_biaya\":\"31500.00\",\"status\":\"Cancelled\",\"created_at\":\"2026-05-24T10:05:35.000Z\"},{\"awb_number\":\"LSK17123010986\",\"external_order_id\":\"TEST-1779617123005\",\"receiver_name\":\"Test Receiver\",\"receiver_city\":null,\"service_type\":\"Reguler\",\"total_biaya\":\"31500.00\",\"status\":\"Cancelled\",\"created_at\":\"2026-05-24T10:05:23.000Z\"},{\"awb_number\":\"LSK17116745785\",\"external_order_id\":\"TEST-1779617116740\",\"receiver_name\":\"Test Receiver\",\"receiver_city\":null,\"service_type\":\"Reguler\",\"total_biaya\":\"31500.00\",\"status\":\"Cancelled\",\"created_at\":\"2026-05-24T10:05:16.000Z\"},{\"awb_number\":\"LSK16346373678\",\"external_order_id\":\"TEST-1779616346368\",\"receiver_name\":\"Test Receiver\",\"receiver_city\":null,\"service_type\":\"Reguler\",\"total_biaya\":\"31500.00\",\"status\":\"Cancelled\",\"created_at\":\"2026-05-24T09:52:26.000Z\"},{\"awb_number\":\"LSK15209663111\",\"external_order_id\":\"TEST-1779615209660\",\"receiver_name\":\"Test Receiver\",\"receiver_city\":null,\"service_type\":\"Reguler\",\"total_biaya\":\"31500.00\",\"status\":\"Cancelled\",\"created_at\":\"2026-05-24T09:33:29.000Z\"},{\"awb_number\":\"LSK15129747173\",\"external_order_id\":\"TEST-1779615129744\",\"receiver_name\":\"Test Receiver\",\"receiver_city\":null,\"service_type\":\"Reguler\",\"total_biaya\":\"31500.00\",\"status\":\"Pending\",\"created_at\":\"2026-05-24T09:32:09.000Z\"},{\"awb_number\":\"LSK14928729413\",\"external_order_id\":\"TEST-1779614928723\",\"receiver_name\":\"Test Receiver\",\"receiver_city\":null,\"service_type\":\"Reguler\",\"total_biaya\":\"31500.00\",\"status\":\"Pending\",\"created_at\":\"2026-05-24T09:28:48.000Z\"}]}', 14, '2026-05-31 17:28:47'),
(77, 1, '/api/v1/marketplace/shipments', 'GET', NULL, 304, '{\"status\":\"Success\",\"data\":[{\"awb_number\":\"LSK34443770599\",\"external_order_id\":\"TEST-1780234443766\",\"receiver_name\":\"Test Receiver\",\"receiver_city\":null,\"service_type\":\"Reguler\",\"total_biaya\":\"31500.00\",\"status\":\"Cancelled\",\"created_at\":\"2026-05-31T13:34:03.000Z\"},{\"awb_number\":\"LSK31518753841\",\"external_order_id\":\"TEST-1780231518748\",\"receiver_name\":\"Test Receiver\",\"receiver_city\":null,\"service_type\":\"Reguler\",\"total_biaya\":\"31500.00\",\"status\":\"Cancelled\",\"created_at\":\"2026-05-31T12:45:18.000Z\"},{\"awb_number\":\"LSK30117898441\",\"external_order_id\":\"TEST-1780230117888\",\"receiver_name\":\"Test Receiver\",\"receiver_city\":null,\"service_type\":\"Reguler\",\"total_biaya\":\"31500.00\",\"status\":\"Cancelled\",\"created_at\":\"2026-05-31T12:21:57.000Z\"},{\"awb_number\":\"LSK28649206736\",\"external_order_id\":\"TB-1780228649202\",\"receiver_name\":\"Andi Susanto\",\"receiver_city\":null,\"service_type\":\"Reguler\",\"total_biaya\":\"23625.00\",\"status\":\"Delivered\",\"created_at\":\"2026-05-31T11:57:29.000Z\"},{\"awb_number\":\"LSK04884307981\",\"external_order_id\":\"TEST-1780204884298\",\"receiver_name\":\"Test Receiver\",\"receiver_city\":null,\"service_type\":\"Reguler\",\"total_biaya\":\"31500.00\",\"status\":\"Cancelled\",\"created_at\":\"2026-05-31T05:21:24.000Z\"},{\"awb_number\":\"LSK17135703769\",\"external_order_id\":\"TEST-1779617135698\",\"receiver_name\":\"Test Receiver\",\"receiver_city\":null,\"service_type\":\"Reguler\",\"total_biaya\":\"31500.00\",\"status\":\"Cancelled\",\"created_at\":\"2026-05-24T10:05:35.000Z\"},{\"awb_number\":\"LSK17123010986\",\"external_order_id\":\"TEST-1779617123005\",\"receiver_name\":\"Test Receiver\",\"receiver_city\":null,\"service_type\":\"Reguler\",\"total_biaya\":\"31500.00\",\"status\":\"Cancelled\",\"created_at\":\"2026-05-24T10:05:23.000Z\"},{\"awb_number\":\"LSK17116745785\",\"external_order_id\":\"TEST-1779617116740\",\"receiver_name\":\"Test Receiver\",\"receiver_city\":null,\"service_type\":\"Reguler\",\"total_biaya\":\"31500.00\",\"status\":\"Cancelled\",\"created_at\":\"2026-05-24T10:05:16.000Z\"},{\"awb_number\":\"LSK16346373678\",\"external_order_id\":\"TEST-1779616346368\",\"receiver_name\":\"Test Receiver\",\"receiver_city\":null,\"service_type\":\"Reguler\",\"total_biaya\":\"31500.00\",\"status\":\"Cancelled\",\"created_at\":\"2026-05-24T09:52:26.000Z\"},{\"awb_number\":\"LSK15209663111\",\"external_order_id\":\"TEST-1779615209660\",\"receiver_name\":\"Test Receiver\",\"receiver_city\":null,\"service_type\":\"Reguler\",\"total_biaya\":\"31500.00\",\"status\":\"Cancelled\",\"created_at\":\"2026-05-24T09:33:29.000Z\"},{\"awb_number\":\"LSK15129747173\",\"external_order_id\":\"TEST-1779615129744\",\"receiver_name\":\"Test Receiver\",\"receiver_city\":null,\"service_type\":\"Reguler\",\"total_biaya\":\"31500.00\",\"status\":\"Pending\",\"created_at\":\"2026-05-24T09:32:09.000Z\"},{\"awb_number\":\"LSK14928729413\",\"external_order_id\":\"TEST-1779614928723\",\"receiver_name\":\"Test Receiver\",\"receiver_city\":null,\"service_type\":\"Reguler\",\"total_biaya\":\"31500.00\",\"status\":\"Pending\",\"created_at\":\"2026-05-24T09:28:48.000Z\"}]}', 17, '2026-05-31 17:28:57'),
(78, 1, '/api/v1/marketplace/shipments', 'GET', NULL, 304, '{\"status\":\"Success\",\"data\":[{\"awb_number\":\"LSK34443770599\",\"external_order_id\":\"TEST-1780234443766\",\"receiver_name\":\"Test Receiver\",\"receiver_city\":null,\"service_type\":\"Reguler\",\"total_biaya\":\"31500.00\",\"status\":\"Cancelled\",\"created_at\":\"2026-05-31T13:34:03.000Z\"},{\"awb_number\":\"LSK31518753841\",\"external_order_id\":\"TEST-1780231518748\",\"receiver_name\":\"Test Receiver\",\"receiver_city\":null,\"service_type\":\"Reguler\",\"total_biaya\":\"31500.00\",\"status\":\"Cancelled\",\"created_at\":\"2026-05-31T12:45:18.000Z\"},{\"awb_number\":\"LSK30117898441\",\"external_order_id\":\"TEST-1780230117888\",\"receiver_name\":\"Test Receiver\",\"receiver_city\":null,\"service_type\":\"Reguler\",\"total_biaya\":\"31500.00\",\"status\":\"Cancelled\",\"created_at\":\"2026-05-31T12:21:57.000Z\"},{\"awb_number\":\"LSK28649206736\",\"external_order_id\":\"TB-1780228649202\",\"receiver_name\":\"Andi Susanto\",\"receiver_city\":null,\"service_type\":\"Reguler\",\"total_biaya\":\"23625.00\",\"status\":\"Delivered\",\"created_at\":\"2026-05-31T11:57:29.000Z\"},{\"awb_number\":\"LSK04884307981\",\"external_order_id\":\"TEST-1780204884298\",\"receiver_name\":\"Test Receiver\",\"receiver_city\":null,\"service_type\":\"Reguler\",\"total_biaya\":\"31500.00\",\"status\":\"Cancelled\",\"created_at\":\"2026-05-31T05:21:24.000Z\"},{\"awb_number\":\"LSK17135703769\",\"external_order_id\":\"TEST-1779617135698\",\"receiver_name\":\"Test Receiver\",\"receiver_city\":null,\"service_type\":\"Reguler\",\"total_biaya\":\"31500.00\",\"status\":\"Cancelled\",\"created_at\":\"2026-05-24T10:05:35.000Z\"},{\"awb_number\":\"LSK17123010986\",\"external_order_id\":\"TEST-1779617123005\",\"receiver_name\":\"Test Receiver\",\"receiver_city\":null,\"service_type\":\"Reguler\",\"total_biaya\":\"31500.00\",\"status\":\"Cancelled\",\"created_at\":\"2026-05-24T10:05:23.000Z\"},{\"awb_number\":\"LSK17116745785\",\"external_order_id\":\"TEST-1779617116740\",\"receiver_name\":\"Test Receiver\",\"receiver_city\":null,\"service_type\":\"Reguler\",\"total_biaya\":\"31500.00\",\"status\":\"Cancelled\",\"created_at\":\"2026-05-24T10:05:16.000Z\"},{\"awb_number\":\"LSK16346373678\",\"external_order_id\":\"TEST-1779616346368\",\"receiver_name\":\"Test Receiver\",\"receiver_city\":null,\"service_type\":\"Reguler\",\"total_biaya\":\"31500.00\",\"status\":\"Cancelled\",\"created_at\":\"2026-05-24T09:52:26.000Z\"},{\"awb_number\":\"LSK15209663111\",\"external_order_id\":\"TEST-1779615209660\",\"receiver_name\":\"Test Receiver\",\"receiver_city\":null,\"service_type\":\"Reguler\",\"total_biaya\":\"31500.00\",\"status\":\"Cancelled\",\"created_at\":\"2026-05-24T09:33:29.000Z\"},{\"awb_number\":\"LSK15129747173\",\"external_order_id\":\"TEST-1779615129744\",\"receiver_name\":\"Test Receiver\",\"receiver_city\":null,\"service_type\":\"Reguler\",\"total_biaya\":\"31500.00\",\"status\":\"Pending\",\"created_at\":\"2026-05-24T09:32:09.000Z\"},{\"awb_number\":\"LSK14928729413\",\"external_order_id\":\"TEST-1779614928723\",\"receiver_name\":\"Test Receiver\",\"receiver_city\":null,\"service_type\":\"Reguler\",\"total_biaya\":\"31500.00\",\"status\":\"Pending\",\"created_at\":\"2026-05-24T09:28:48.000Z\"}]}', 16, '2026-06-02 04:05:32'),
(79, 1, '/api/v1/marketplace/shipments', 'GET', NULL, 304, '{\"status\":\"Success\",\"data\":[{\"awb_number\":\"LSK34443770599\",\"external_order_id\":\"TEST-1780234443766\",\"receiver_name\":\"Test Receiver\",\"receiver_city\":null,\"service_type\":\"Reguler\",\"total_biaya\":\"31500.00\",\"status\":\"Cancelled\",\"created_at\":\"2026-05-31T13:34:03.000Z\"},{\"awb_number\":\"LSK31518753841\",\"external_order_id\":\"TEST-1780231518748\",\"receiver_name\":\"Test Receiver\",\"receiver_city\":null,\"service_type\":\"Reguler\",\"total_biaya\":\"31500.00\",\"status\":\"Cancelled\",\"created_at\":\"2026-05-31T12:45:18.000Z\"},{\"awb_number\":\"LSK30117898441\",\"external_order_id\":\"TEST-1780230117888\",\"receiver_name\":\"Test Receiver\",\"receiver_city\":null,\"service_type\":\"Reguler\",\"total_biaya\":\"31500.00\",\"status\":\"Cancelled\",\"created_at\":\"2026-05-31T12:21:57.000Z\"},{\"awb_number\":\"LSK28649206736\",\"external_order_id\":\"TB-1780228649202\",\"receiver_name\":\"Andi Susanto\",\"receiver_city\":null,\"service_type\":\"Reguler\",\"total_biaya\":\"23625.00\",\"status\":\"Delivered\",\"created_at\":\"2026-05-31T11:57:29.000Z\"},{\"awb_number\":\"LSK04884307981\",\"external_order_id\":\"TEST-1780204884298\",\"receiver_name\":\"Test Receiver\",\"receiver_city\":null,\"service_type\":\"Reguler\",\"total_biaya\":\"31500.00\",\"status\":\"Cancelled\",\"created_at\":\"2026-05-31T05:21:24.000Z\"},{\"awb_number\":\"LSK17135703769\",\"external_order_id\":\"TEST-1779617135698\",\"receiver_name\":\"Test Receiver\",\"receiver_city\":null,\"service_type\":\"Reguler\",\"total_biaya\":\"31500.00\",\"status\":\"Cancelled\",\"created_at\":\"2026-05-24T10:05:35.000Z\"},{\"awb_number\":\"LSK17123010986\",\"external_order_id\":\"TEST-1779617123005\",\"receiver_name\":\"Test Receiver\",\"receiver_city\":null,\"service_type\":\"Reguler\",\"total_biaya\":\"31500.00\",\"status\":\"Cancelled\",\"created_at\":\"2026-05-24T10:05:23.000Z\"},{\"awb_number\":\"LSK17116745785\",\"external_order_id\":\"TEST-1779617116740\",\"receiver_name\":\"Test Receiver\",\"receiver_city\":null,\"service_type\":\"Reguler\",\"total_biaya\":\"31500.00\",\"status\":\"Cancelled\",\"created_at\":\"2026-05-24T10:05:16.000Z\"},{\"awb_number\":\"LSK16346373678\",\"external_order_id\":\"TEST-1779616346368\",\"receiver_name\":\"Test Receiver\",\"receiver_city\":null,\"service_type\":\"Reguler\",\"total_biaya\":\"31500.00\",\"status\":\"Cancelled\",\"created_at\":\"2026-05-24T09:52:26.000Z\"},{\"awb_number\":\"LSK15209663111\",\"external_order_id\":\"TEST-1779615209660\",\"receiver_name\":\"Test Receiver\",\"receiver_city\":null,\"service_type\":\"Reguler\",\"total_biaya\":\"31500.00\",\"status\":\"Cancelled\",\"created_at\":\"2026-05-24T09:33:29.000Z\"},{\"awb_number\":\"LSK15129747173\",\"external_order_id\":\"TEST-1779615129744\",\"receiver_name\":\"Test Receiver\",\"receiver_city\":null,\"service_type\":\"Reguler\",\"total_biaya\":\"31500.00\",\"status\":\"Pending\",\"created_at\":\"2026-05-24T09:32:09.000Z\"},{\"awb_number\":\"LSK14928729413\",\"external_order_id\":\"TEST-1779614928723\",\"receiver_name\":\"Test Receiver\",\"receiver_city\":null,\"service_type\":\"Reguler\",\"total_biaya\":\"31500.00\",\"status\":\"Pending\",\"created_at\":\"2026-05-24T09:28:48.000Z\"}]}', 14, '2026-06-02 04:05:34'),
(80, 1, '/api/v1/marketplace/shipments', 'GET', NULL, 304, '{\"status\":\"Success\",\"data\":[{\"awb_number\":\"LSK34443770599\",\"external_order_id\":\"TEST-1780234443766\",\"receiver_name\":\"Test Receiver\",\"receiver_city\":null,\"service_type\":\"Reguler\",\"total_biaya\":\"31500.00\",\"status\":\"Cancelled\",\"created_at\":\"2026-05-31T13:34:03.000Z\"},{\"awb_number\":\"LSK31518753841\",\"external_order_id\":\"TEST-1780231518748\",\"receiver_name\":\"Test Receiver\",\"receiver_city\":null,\"service_type\":\"Reguler\",\"total_biaya\":\"31500.00\",\"status\":\"Cancelled\",\"created_at\":\"2026-05-31T12:45:18.000Z\"},{\"awb_number\":\"LSK30117898441\",\"external_order_id\":\"TEST-1780230117888\",\"receiver_name\":\"Test Receiver\",\"receiver_city\":null,\"service_type\":\"Reguler\",\"total_biaya\":\"31500.00\",\"status\":\"Cancelled\",\"created_at\":\"2026-05-31T12:21:57.000Z\"},{\"awb_number\":\"LSK28649206736\",\"external_order_id\":\"TB-1780228649202\",\"receiver_name\":\"Andi Susanto\",\"receiver_city\":null,\"service_type\":\"Reguler\",\"total_biaya\":\"23625.00\",\"status\":\"Delivered\",\"created_at\":\"2026-05-31T11:57:29.000Z\"},{\"awb_number\":\"LSK04884307981\",\"external_order_id\":\"TEST-1780204884298\",\"receiver_name\":\"Test Receiver\",\"receiver_city\":null,\"service_type\":\"Reguler\",\"total_biaya\":\"31500.00\",\"status\":\"Cancelled\",\"created_at\":\"2026-05-31T05:21:24.000Z\"},{\"awb_number\":\"LSK17135703769\",\"external_order_id\":\"TEST-1779617135698\",\"receiver_name\":\"Test Receiver\",\"receiver_city\":null,\"service_type\":\"Reguler\",\"total_biaya\":\"31500.00\",\"status\":\"Cancelled\",\"created_at\":\"2026-05-24T10:05:35.000Z\"},{\"awb_number\":\"LSK17123010986\",\"external_order_id\":\"TEST-1779617123005\",\"receiver_name\":\"Test Receiver\",\"receiver_city\":null,\"service_type\":\"Reguler\",\"total_biaya\":\"31500.00\",\"status\":\"Cancelled\",\"created_at\":\"2026-05-24T10:05:23.000Z\"},{\"awb_number\":\"LSK17116745785\",\"external_order_id\":\"TEST-1779617116740\",\"receiver_name\":\"Test Receiver\",\"receiver_city\":null,\"service_type\":\"Reguler\",\"total_biaya\":\"31500.00\",\"status\":\"Cancelled\",\"created_at\":\"2026-05-24T10:05:16.000Z\"},{\"awb_number\":\"LSK16346373678\",\"external_order_id\":\"TEST-1779616346368\",\"receiver_name\":\"Test Receiver\",\"receiver_city\":null,\"service_type\":\"Reguler\",\"total_biaya\":\"31500.00\",\"status\":\"Cancelled\",\"created_at\":\"2026-05-24T09:52:26.000Z\"},{\"awb_number\":\"LSK15209663111\",\"external_order_id\":\"TEST-1779615209660\",\"receiver_name\":\"Test Receiver\",\"receiver_city\":null,\"service_type\":\"Reguler\",\"total_biaya\":\"31500.00\",\"status\":\"Cancelled\",\"created_at\":\"2026-05-24T09:33:29.000Z\"},{\"awb_number\":\"LSK15129747173\",\"external_order_id\":\"TEST-1779615129744\",\"receiver_name\":\"Test Receiver\",\"receiver_city\":null,\"service_type\":\"Reguler\",\"total_biaya\":\"31500.00\",\"status\":\"Pending\",\"created_at\":\"2026-05-24T09:32:09.000Z\"},{\"awb_number\":\"LSK14928729413\",\"external_order_id\":\"TEST-1779614928723\",\"receiver_name\":\"Test Receiver\",\"receiver_city\":null,\"service_type\":\"Reguler\",\"total_biaya\":\"31500.00\",\"status\":\"Pending\",\"created_at\":\"2026-05-24T09:28:48.000Z\"}]}', 21, '2026-06-02 04:05:35'),
(81, 1, '/api/v1/marketplace/shipments', 'GET', NULL, 304, '{\"status\":\"Success\",\"data\":[{\"awb_number\":\"LSK34443770599\",\"external_order_id\":\"TEST-1780234443766\",\"receiver_name\":\"Test Receiver\",\"receiver_city\":null,\"service_type\":\"Reguler\",\"total_biaya\":\"31500.00\",\"status\":\"Cancelled\",\"created_at\":\"2026-05-31T13:34:03.000Z\"},{\"awb_number\":\"LSK31518753841\",\"external_order_id\":\"TEST-1780231518748\",\"receiver_name\":\"Test Receiver\",\"receiver_city\":null,\"service_type\":\"Reguler\",\"total_biaya\":\"31500.00\",\"status\":\"Cancelled\",\"created_at\":\"2026-05-31T12:45:18.000Z\"},{\"awb_number\":\"LSK30117898441\",\"external_order_id\":\"TEST-1780230117888\",\"receiver_name\":\"Test Receiver\",\"receiver_city\":null,\"service_type\":\"Reguler\",\"total_biaya\":\"31500.00\",\"status\":\"Cancelled\",\"created_at\":\"2026-05-31T12:21:57.000Z\"},{\"awb_number\":\"LSK28649206736\",\"external_order_id\":\"TB-1780228649202\",\"receiver_name\":\"Andi Susanto\",\"receiver_city\":null,\"service_type\":\"Reguler\",\"total_biaya\":\"23625.00\",\"status\":\"Delivered\",\"created_at\":\"2026-05-31T11:57:29.000Z\"},{\"awb_number\":\"LSK04884307981\",\"external_order_id\":\"TEST-1780204884298\",\"receiver_name\":\"Test Receiver\",\"receiver_city\":null,\"service_type\":\"Reguler\",\"total_biaya\":\"31500.00\",\"status\":\"Cancelled\",\"created_at\":\"2026-05-31T05:21:24.000Z\"},{\"awb_number\":\"LSK17135703769\",\"external_order_id\":\"TEST-1779617135698\",\"receiver_name\":\"Test Receiver\",\"receiver_city\":null,\"service_type\":\"Reguler\",\"total_biaya\":\"31500.00\",\"status\":\"Cancelled\",\"created_at\":\"2026-05-24T10:05:35.000Z\"},{\"awb_number\":\"LSK17123010986\",\"external_order_id\":\"TEST-1779617123005\",\"receiver_name\":\"Test Receiver\",\"receiver_city\":null,\"service_type\":\"Reguler\",\"total_biaya\":\"31500.00\",\"status\":\"Cancelled\",\"created_at\":\"2026-05-24T10:05:23.000Z\"},{\"awb_number\":\"LSK17116745785\",\"external_order_id\":\"TEST-1779617116740\",\"receiver_name\":\"Test Receiver\",\"receiver_city\":null,\"service_type\":\"Reguler\",\"total_biaya\":\"31500.00\",\"status\":\"Cancelled\",\"created_at\":\"2026-05-24T10:05:16.000Z\"},{\"awb_number\":\"LSK16346373678\",\"external_order_id\":\"TEST-1779616346368\",\"receiver_name\":\"Test Receiver\",\"receiver_city\":null,\"service_type\":\"Reguler\",\"total_biaya\":\"31500.00\",\"status\":\"Cancelled\",\"created_at\":\"2026-05-24T09:52:26.000Z\"},{\"awb_number\":\"LSK15209663111\",\"external_order_id\":\"TEST-1779615209660\",\"receiver_name\":\"Test Receiver\",\"receiver_city\":null,\"service_type\":\"Reguler\",\"total_biaya\":\"31500.00\",\"status\":\"Cancelled\",\"created_at\":\"2026-05-24T09:33:29.000Z\"},{\"awb_number\":\"LSK15129747173\",\"external_order_id\":\"TEST-1779615129744\",\"receiver_name\":\"Test Receiver\",\"receiver_city\":null,\"service_type\":\"Reguler\",\"total_biaya\":\"31500.00\",\"status\":\"Pending\",\"created_at\":\"2026-05-24T09:32:09.000Z\"},{\"awb_number\":\"LSK14928729413\",\"external_order_id\":\"TEST-1779614928723\",\"receiver_name\":\"Test Receiver\",\"receiver_city\":null,\"service_type\":\"Reguler\",\"total_biaya\":\"31500.00\",\"status\":\"Pending\",\"created_at\":\"2026-05-24T09:28:48.000Z\"}]}', 16, '2026-06-02 04:05:37');

-- --------------------------------------------------------

--
-- Table structure for table `branches`
--

CREATE TABLE `branches` (
  `id` int NOT NULL,
  `name` varchar(100) NOT NULL,
  `code` varchar(10) NOT NULL,
  `city` varchar(100) NOT NULL,
  `address` text,
  `lat` decimal(10,7) DEFAULT NULL,
  `lng` decimal(10,7) DEFAULT NULL,
  `capacity` int DEFAULT '1000',
  `active_couriers` int DEFAULT '0',
  `status` enum('Active','Inactive','Maintenance') DEFAULT 'Active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `branches`
--

INSERT INTO `branches` (`id`, `name`, `code`, `city`, `address`, `lat`, `lng`, `capacity`, `active_couriers`, `status`, `created_at`, `updated_at`) VALUES
(1, 'Cabang Utama Jakarta', 'CGK-01', 'Jakarta', NULL, -6.2088000, 106.8456000, 1000, 4, 'Active', '2026-05-24 03:55:28', '2026-05-24 06:53:51'),
(2, 'Cabang Utama Bandung', 'BDO-01', 'Bandung', NULL, -6.9175000, 107.6191000, 1000, 4, 'Active', '2026-05-24 03:55:28', '2026-05-24 06:16:04'),
(3, 'Cabang Utama Surabaya', 'SUB-01', 'Surabaya', NULL, -7.2504000, 112.7688000, 1000, 4, 'Active', '2026-05-24 03:55:28', '2026-05-24 06:42:00'),
(4, 'Cabang Utama Medan', 'KNO-01', 'Medan', NULL, 3.5952000, 98.6722000, 1000, 0, 'Active', '2026-05-24 03:55:28', '2026-05-24 03:55:28'),
(5, 'Cabang Utama Makassar', 'UPG-01', 'Makassar', NULL, -5.1477000, 119.4327000, 1000, 0, 'Active', '2026-05-24 03:55:28', '2026-05-24 03:55:28'),
(6, 'Cabang Utama Balikpapan', 'BPN-01', 'Balikpapan', NULL, -1.2379000, 116.8529000, 1000, 0, 'Active', '2026-05-24 03:55:28', '2026-05-24 03:55:28'),
(7, 'Cabang Utama Yogyakarta', 'JOG-01', 'Yogyakarta', NULL, -7.7956000, 110.3695000, 1000, 0, 'Active', '2026-05-24 03:55:28', '2026-05-24 03:55:28'),
(8, 'Cabang Utama Semarang', 'SRG-01', 'Semarang', NULL, -6.9667000, 110.4167000, 1000, 0, 'Active', '2026-05-24 03:55:28', '2026-05-24 03:55:28'),
(9, 'Cabang Utama Denpasar', 'DPS-01', 'Denpasar', NULL, -8.6705000, 115.2126000, 1000, 0, 'Active', '2026-05-24 03:55:28', '2026-05-24 03:55:28'),
(10, 'Cabang Utama Palembang', 'PLM-01', 'Palembang', NULL, -2.9909000, 104.7566000, 1000, 0, 'Active', '2026-05-24 03:55:28', '2026-05-24 03:55:28'),
(11, 'Cabang Utama Pontianak', 'PNK-01', 'Pontianak', NULL, -0.0227000, 109.3333000, 1000, 0, 'Active', '2026-05-24 03:55:28', '2026-05-24 03:55:28'),
(12, 'Cabang Utama Manado', 'MDC-01', 'Manado', NULL, 1.4931000, 124.8413000, 1000, 0, 'Active', '2026-05-24 03:55:28', '2026-05-24 03:55:28');

-- --------------------------------------------------------

--
-- Table structure for table `delivery_proofs`
--

CREATE TABLE `delivery_proofs` (
  `id` int NOT NULL,
  `shipment_id` int NOT NULL,
  `awb_number` varchar(30) NOT NULL,
  `kurir_id` int NOT NULL,
  `photo_url` text,
  `recipient_name` varchar(100) DEFAULT NULL,
  `notes` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `delivery_proofs`
--

INSERT INTO `delivery_proofs` (`id`, `shipment_id`, `awb_number`, `kurir_id`, `photo_url`, `recipient_name`, `notes`, `created_at`) VALUES
(1, 47, 'LSK961838763794', 5, 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400', 'andi', 'ditaruh di depan rumah', '2026-05-24 10:32:38'),
(2, 65, 'LSK022930990929', 5, 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400', 'andi', NULL, '2026-05-31 12:23:57');

-- --------------------------------------------------------

--
-- Table structure for table `integration_transactions`
--

CREATE TABLE `integration_transactions` (
  `id` int NOT NULL,
  `transaction_id` varchar(50) NOT NULL,
  `awb_number` varchar(30) DEFAULT NULL,
  `connection_status` varchar(50) DEFAULT 'Pending',
  `smartbank_status` varchar(50) DEFAULT 'Pending',
  `shipment_status` varchar(50) DEFAULT 'Pending',
  `webhook_status` varchar(50) DEFAULT 'Pending',
  `marketplace_status` varchar(50) DEFAULT 'Pending',
  `timestamp` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `internal_users`
--

CREATE TABLE `internal_users` (
  `id` int NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `nama` varchar(100) NOT NULL,
  `role` enum('Superadmin','Admin','Branch Admin','Dispatcher','Kurir','Customer') NOT NULL DEFAULT 'Customer',
  `token` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `branch_id` int DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `photo_url` varchar(255) DEFAULT NULL,
  `approval_status` enum('approved','pending','rejected') DEFAULT 'approved'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `internal_users`
--

INSERT INTO `internal_users` (`id`, `email`, `password`, `nama`, `role`, `token`, `is_active`, `created_at`, `updated_at`, `branch_id`, `phone`, `photo_url`, `approval_status`) VALUES
(1, 'admin@logistikita.com', 'admin123', 'Super Admin', 'Admin', 'logistikita-admin-token', 1, '2026-05-23 15:13:02', '2026-05-23 15:13:02', NULL, NULL, NULL, 'approved'),
(2, 'superadmin@logistikita.com', 'superadmin123', 'Super Administrator', 'Superadmin', 'logistikita-superadmin-token-2026', 1, '2026-05-23 15:13:02', '2026-05-23 15:13:02', NULL, NULL, NULL, 'approved'),
(3, 'andi.kurir@logistikita.com', 'kurir123', 'Andi Prasetyo', 'Kurir', 'token_kurir_andi', 1, '2026-05-23 15:13:02', '2026-05-24 04:09:19', 1, NULL, NULL, 'approved'),
(4, 'budi.kurir@logistikita.com', 'kurir123', 'Budi Santoso', 'Kurir', 'token_kurir_budi', 1, '2026-05-23 15:13:02', '2026-05-24 04:09:19', 1, NULL, NULL, 'approved'),
(5, 'citra.kurir@logistikita.com', 'kurir123', 'Citra Dewi', 'Kurir', 'token_kurir_citra', 1, '2026-05-23 15:13:02', '2026-05-24 04:09:19', 2, NULL, NULL, 'approved'),
(6, 'doni.kurir@logistikita.com', 'kurir123', 'Doni Firmansyah', 'Kurir', 'token_kurir_doni', 1, '2026-05-23 15:13:02', '2026-05-24 04:09:19', 2, NULL, NULL, 'approved'),
(7, 'eka.kurir@logistikita.com', 'kurir123', 'Eka Ramadhan', 'Kurir', 'token_kurir_eka', 1, '2026-05-23 15:13:02', '2026-05-24 04:09:19', 3, NULL, NULL, 'approved'),
(8, 'op_jakarta@logistikita.com', 'operator123', 'Operator Jakarta', 'Branch Admin', 'token_op_jakarta', 1, '2026-05-24 03:55:29', '2026-05-24 03:55:29', 1, NULL, NULL, 'approved'),
(9, 'op_bandung@logistikita.com', 'operator123', 'Operator Bandung', 'Branch Admin', 'token_op_bandung', 1, '2026-05-24 03:55:29', '2026-05-24 03:55:29', 2, NULL, NULL, 'approved'),
(10, 'op_surabaya@logistikita.com', 'operator123', 'Operator Surabaya', 'Branch Admin', 'token_op_surabaya', 1, '2026-05-24 03:55:29', '2026-05-24 03:55:29', 3, NULL, NULL, 'approved'),
(11, 'op_medan@logistikita.com', 'operator123', 'Operator Medan', 'Branch Admin', 'token_op_medan', 1, '2026-05-24 03:55:29', '2026-05-24 03:55:29', 4, NULL, NULL, 'approved'),
(12, 'op_makassar@logistikita.com', 'operator123', 'Operator Makassar', 'Branch Admin', 'token_op_makassar', 1, '2026-05-24 03:55:29', '2026-05-24 03:55:29', 5, NULL, NULL, 'approved'),
(13, 'op_balikpapan@logistikita.com', 'operator123', 'Operator Balikpapan', 'Branch Admin', 'token_op_balikpapan', 1, '2026-05-24 03:55:29', '2026-05-24 03:55:29', 6, NULL, NULL, 'approved'),
(14, 'op_yogyakarta@logistikita.com', 'operator123', 'Operator Yogyakarta', 'Branch Admin', 'token_op_yogyakarta', 1, '2026-05-24 03:55:29', '2026-05-24 03:55:29', 7, NULL, NULL, 'approved'),
(15, 'op_semarang@logistikita.com', 'operator123', 'Operator Semarang', 'Branch Admin', 'token_op_semarang', 1, '2026-05-24 03:55:29', '2026-05-24 03:55:29', 8, NULL, NULL, 'approved'),
(16, 'op_denpasar@logistikita.com', 'operator123', 'Operator Denpasar', 'Branch Admin', 'token_op_denpasar', 1, '2026-05-24 03:55:29', '2026-05-24 03:55:29', 9, NULL, NULL, 'approved'),
(17, 'op_palembang@logistikita.com', 'operator123', 'Operator Palembang', 'Branch Admin', 'token_op_palembang', 1, '2026-05-24 03:55:29', '2026-05-24 03:55:29', 10, NULL, NULL, 'approved'),
(18, 'op_pontianak@logistikita.com', 'operator123', 'Operator Pontianak', 'Branch Admin', 'token_op_pontianak', 1, '2026-05-24 03:55:29', '2026-05-24 03:55:29', 11, NULL, NULL, 'approved'),
(19, 'op_manado@logistikita.com', 'operator123', 'Operator Manado', 'Branch Admin', 'token_op_manado', 1, '2026-05-24 03:55:29', '2026-05-24 03:55:29', 12, NULL, NULL, 'approved'),
(23, 'dispatch.jkt@logistikita.com', 'dispatch123', 'Dispatcher Jakarta', 'Dispatcher', 'token_dispatch_jkt', 1, '2026-05-24 04:09:19', '2026-05-24 04:09:19', 1, NULL, NULL, 'approved'),
(24, 'dispatch.bdg@logistikita.com', 'dispatch123', 'Dispatcher Bandung', 'Dispatcher', 'token_dispatch_bdg', 1, '2026-05-24 04:09:19', '2026-05-24 04:09:19', 2, NULL, NULL, 'approved'),
(25, 'dispatch.sby@logistikita.com', 'dispatch123', 'Dispatcher Surabaya', 'Dispatcher', 'token_dispatch_sby', 1, '2026-05-24 04:09:19', '2026-05-24 04:09:19', 3, NULL, NULL, 'approved'),
(26, 'dispatch.mdn@logistikita.com', 'dispatch123', 'Dispatcher Medan', 'Dispatcher', 'token_dispatch_mdn', 1, '2026-05-24 04:09:19', '2026-05-24 04:09:19', 4, NULL, NULL, 'approved'),
(27, 'dispatch.yog@logistikita.com', 'dispatch123', 'Dispatcher Yogyakarta', 'Dispatcher', 'token_dispatch_yog', 1, '2026-05-24 04:09:19', '2026-05-24 04:09:19', 7, NULL, NULL, 'approved'),
(28, 'dispatch.smg@logistikita.com', 'dispatch123', 'Dispatcher Semarang', 'Dispatcher', 'token_dispatch_smg', 1, '2026-05-24 04:09:19', '2026-05-24 04:09:19', 8, NULL, NULL, 'approved'),
(29, 'rina@gmail.com', 'customer123', 'Rina Kartika', 'Customer', 'token_cust_rina', 1, '2026-05-24 04:09:19', '2026-05-24 04:09:19', NULL, '0812-3456-7001', NULL, 'approved'),
(30, 'hendra@gmail.com', 'customer123', 'Hendra Wijaya', 'Customer', 'token_cust_hendra', 1, '2026-05-24 04:09:19', '2026-05-24 04:09:19', NULL, '0813-4567-8002', NULL, 'approved'),
(31, 'siti@gmail.com', 'customer123', 'Siti Nurhaliza', 'Customer', 'token_cust_siti', 1, '2026-05-24 04:09:19', '2026-05-24 04:09:19', NULL, '0856-7890-1003', NULL, 'approved'),
(32, 'agus@gmail.com', 'customer123', 'Agus Setiawan', 'Customer', 'token_cust_agus', 1, '2026-05-24 04:09:19', '2026-05-24 04:09:19', NULL, '0878-1234-5004', NULL, 'approved'),
(33, 'dewi@gmail.com', 'customer123', 'Dewi Lestari', 'Customer', 'token_cust_dewi', 1, '2026-05-24 04:09:19', '2026-05-24 04:09:19', NULL, '0821-6789-0005', NULL, 'approved'),
(34, 'farhan.kurir@logistikita.com', 'kurir123', 'Farhan Maulana', 'Kurir', 'token_kurir_farhan', 1, '2026-05-24 05:55:56', '2026-05-24 05:55:56', 3, NULL, NULL, 'approved'),
(35, 'gita.kurir@logistikita.com', 'kurir123', 'Gita Puspita', 'Kurir', 'token_kurir_gita', 1, '2026-05-24 05:55:56', '2026-05-24 05:55:56', 3, NULL, NULL, 'approved'),
(36, 'hadi.kurir@logistikita.com', 'kurir123', 'Hadi Nugroho', 'Kurir', 'token_kurir_hadi', 1, '2026-05-24 05:55:56', '2026-05-24 05:55:56', 7, NULL, NULL, 'approved'),
(37, 'indah.kurir@logistikita.com', 'kurir123', 'Indah Permata', 'Kurir', 'token_kurir_indah', 1, '2026-05-24 05:55:56', '2026-05-24 05:55:56', 7, NULL, NULL, 'approved'),
(38, 'joko.kurir@logistikita.com', 'kurir123', 'Joko Susilo', 'Kurir', 'token_kurir_joko', 1, '2026-05-24 05:55:56', '2026-05-24 05:55:56', 8, NULL, NULL, 'approved'),
(39, 'kartika.kurir@logistikita.com', 'kurir123', 'Kartika Sari', 'Kurir', 'token_kurir_kartika', 1, '2026-05-24 05:55:56', '2026-05-24 05:55:56', 8, NULL, NULL, 'approved'),
(40, 'luki.kurir@logistikita.com', 'kurir123', 'Luki Wibowo', 'Kurir', 'token_kurir_luki', 1, '2026-05-24 05:55:56', '2026-05-24 05:55:56', 9, NULL, NULL, 'approved'),
(41, 'made.kurir@logistikita.com', 'kurir123', 'Made Surya', 'Kurir', 'token_kurir_made', 1, '2026-05-24 05:55:56', '2026-05-24 05:55:56', 9, NULL, NULL, 'approved'),
(42, 'nanda.kurir@logistikita.com', 'kurir123', 'Nanda Pratiwi', 'Kurir', 'token_kurir_nanda', 1, '2026-05-24 05:55:56', '2026-05-24 05:55:56', 4, NULL, NULL, 'approved'),
(43, 'bambang2.kurir@logistikita.com', 'operator123', 'Bambang Herlambangg', 'Kurir', 'token_kurir_ede4749786988ae6ecf4a7041550fb47', 1, '2026-05-24 06:16:00', '2026-05-24 06:16:00', 2, '085241510357', NULL, 'approved'),
(44, 'tommy.calon@gmail.com', 'kurir123', 'Tommy Kurniawan', 'Kurir', 'token_kurir_0129672f27c5585af6e4988c5892d719', 1, '2026-05-24 06:16:04', '2026-05-24 06:16:04', 2, '0856-7777-0003', NULL, 'approved'),
(45, 'rudi.calon@gmail.com', 'kurir123', 'Rudi Hermawan', 'Kurir', 'token_kurir_8dcce2bb2d0790eda9b834eaf7ecbc6e', 1, '2026-05-24 06:25:23', '2026-05-24 06:25:23', 1, '0812-9999-0001', NULL, 'approved'),
(46, 'vera.calon@gmail.com', 'kurir123', 'Vera Anggraeni', 'Kurir', 'token_kurir_7e8646365865906f5ee88347f042c35f', 1, '2026-05-24 06:42:00', '2026-05-24 06:42:00', 3, '0878-6666-0004', NULL, 'approved'),
(47, 'santi.calon@gmail.com', 'kurir123', 'Santi Rahayu', 'Kurir', 'token_kurir_940e9ae34b493b7e929b5cab2a97166f', 1, '2026-05-24 06:53:51', '2026-05-24 06:53:51', 1, '0813-8888-0002', NULL, 'approved'),
(48, 'Ricard.rikardo@logistikita.com', 'kurir123', 'Ricard Rikardo', 'Kurir', 'lsk-kurir-83acb74ffcfaa5e466c64f723bf7ec28', 1, '2026-05-28 06:49:48', '2026-05-28 06:49:48', 2, NULL, NULL, 'approved'),
(49, 'palembang.kurir@logistikita.com', 'kurir123', 'palembang kurir', 'Superadmin', 'lsk-superadmin-b8764f3b640ab5a22b925df529c262e2', 1, '2026-05-28 12:20:14', '2026-05-28 12:20:14', NULL, NULL, NULL, 'approved'),
(50, 'bambang.kurir@logistikita.com', 'kurir123', 'bambang', 'Kurir', 'lsk-kurir-f729078e671ff49310b2d0f9061b1d7b', 1, '2026-05-28 12:21:48', '2026-05-28 12:21:48', 10, NULL, NULL, 'approved');

-- --------------------------------------------------------

--
-- Table structure for table `kurir_registrations`
--

CREATE TABLE `kurir_registrations` (
  `id` int NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `nama` varchar(100) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `branch_id` int NOT NULL,
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `reviewed_by` int DEFAULT NULL,
  `reviewed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `kurir_registrations`
--

INSERT INTO `kurir_registrations` (`id`, `email`, `password`, `nama`, `phone`, `branch_id`, `status`, `reviewed_by`, `reviewed_at`, `created_at`) VALUES
(1, 'rudi.calon@gmail.com', 'kurir123', 'Rudi Hermawan', '0812-9999-0001', 1, 'approved', 8, '2026-05-24 06:25:23', '2026-05-24 05:55:56'),
(2, 'santi.calon@gmail.com', 'kurir123', 'Santi Rahayu', '0813-8888-0002', 1, 'approved', 8, '2026-05-24 06:53:51', '2026-05-24 05:55:56'),
(3, 'tommy.calon@gmail.com', 'kurir123', 'Tommy Kurniawan', '0856-7777-0003', 2, 'approved', 9, '2026-05-24 06:16:04', '2026-05-24 05:55:56'),
(4, 'vera.calon@gmail.com', 'kurir123', 'Vera Anggraeni', '0878-6666-0004', 3, 'approved', 10, '2026-05-24 06:42:00', '2026-05-24 05:55:56'),
(5, 'bambang.kurir@logistikita.com', 'kurir123', 'Bambang Herlambang', '085241510350', 6, 'pending', NULL, NULL, '2026-05-24 06:14:52'),
(6, 'bambang2.kurir@logistikita.com', 'operator123', 'Bambang Herlambangg', '085241510357', 2, 'approved', 9, '2026-05-24 06:16:00', '2026-05-24 06:15:44');

-- --------------------------------------------------------

--
-- Table structure for table `marketplace_partners`
--

CREATE TABLE `marketplace_partners` (
  `id` int NOT NULL,
  `name` varchar(100) NOT NULL,
  `api_key` varchar(64) NOT NULL,
  `secret_token` varchar(64) NOT NULL,
  `contact_email` varchar(255) DEFAULT NULL,
  `contact_phone` varchar(50) DEFAULT NULL,
  `company_name` varchar(150) DEFAULT NULL,
  `callback_url` varchar(255) DEFAULT NULL,
  `webhook_secret` varchar(64) DEFAULT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  `last_access_at` datetime DEFAULT NULL,
  `total_requests` bigint DEFAULT '0',
  `total_shipments` bigint DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `marketplace_partners`
--

INSERT INTO `marketplace_partners` (`id`, `name`, `api_key`, `secret_token`, `contact_email`, `contact_phone`, `company_name`, `callback_url`, `webhook_secret`, `status`, `last_access_at`, `total_requests`, `total_shipments`, `created_at`, `updated_at`) VALUES
(1, 'Marketplace Simulator', 'lsk_live_mktA_9f8a8b7c6d5e4f3a2b1c', 'secret_token_123', 'admin@simulator.com', NULL, 'Simulator Inc', 'http://localhost:3000/webhook/tokobagus', 'webhook_secret_123', 'active', '2026-06-02 11:05:36', 66, 12, '2026-05-24 09:21:03', '2026-06-02 04:05:37'),
(997, 'Marketplace (Praktikum)', 'lsk_key_marketplace', 'secret_marketplace', NULL, NULL, NULL, NULL, NULL, 'active', NULL, 0, 0, '2026-05-31 13:19:05', '2026-06-02 04:10:46'),
(998, 'SmartBank (Praktikum)', 'lsk_key_smartbank', 'secret_smartbank', NULL, NULL, NULL, NULL, NULL, 'active', NULL, 0, 0, '2026-05-31 13:19:05', '2026-05-31 13:19:05'),
(999, 'API Gateway (Praktikum)', 'lsk_key_api_gateway', 'secret_gateway', NULL, NULL, NULL, NULL, NULL, 'active', NULL, 0, 0, '2026-05-31 13:19:05', '2026-05-31 13:19:05');

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
(1, 'ORD-1001', 'SB-7281930456', 'Jl. Dago No.45, Bandung', 25.00, 125000.00, 'Selesai', 'Lunas', NULL, '2026-05-23 15:13:02', '2026-05-23 15:13:02'),
(2, 'ORD-1002', 'SB-7281930456', 'Jl. Pemuda No.88, Surabaya', 120.00, 600000.00, 'Dalam Perjalanan', 'Lunas', NULL, '2026-05-23 15:13:02', '2026-05-23 15:13:02'),
(3, 'ORD-1003', 'SB-3945817260', 'Jl. Malioboro No.10, Yogyakarta', 80.00, 400000.00, 'Pending', 'Belum Bayar', NULL, '2026-05-23 15:13:02', '2026-05-23 15:13:02'),
(4, 'ORD-1004', 'SB-3945817260', 'Jl. Asia Afrika No.77, Bandung', 15.00, 75000.00, 'Proses', 'Lunas', NULL, '2026-05-23 15:13:02', '2026-05-23 15:13:02'),
(5, 'ORD-1005', 'SB-6120384759', 'Jl. Kuta No.33, Bali', 50.00, 250000.00, 'Tiba', 'Lunas', NULL, '2026-05-23 15:13:02', '2026-05-23 15:13:02'),
(6, 'LSK961734558765', 'CUSTOMER', 'Gang Musholla Al Ikhlas, Proyek, Bekasi, Jawa Barat', 20.55, 20200.00, 'Proses', 'Lunas', 'GATEWAY-MOCK-1779617348216820', '2026-05-24 10:09:09', '2026-05-24 10:09:09'),
(7, 'LSK961838763794', 'CUSTOMER', 'Gambir, Gambir, Jakarta Pusat', 112.11, 15700.00, 'Pending', 'Lunas', 'SBT-VA-1779618391799242', '2026-05-24 10:26:31', '2026-05-24 10:26:31'),
(8, 'LSK994972810291', 'CUSTOMER', 'Jalan Bimasakti, Demangan, Kota Yogyakarta, Daerah Istimewa Yogyakarta', 431.10, 31600.00, 'Pending', 'Lunas', 'SBT-VA-1779950029442539', '2026-05-28 06:33:49', '2026-05-28 06:33:49'),
(9, 'LSK995020047315', 'CUSTOMER', 'Wirogunan, Kota Yogyakarta, Daerah Istimewa Yogyakarta', 431.55, 31800.00, 'Pending', 'Lunas', 'SBT-VA-1779950203042605', '2026-05-28 06:36:43', '2026-05-28 06:36:43'),
(10, 'LSK997045662781', 'CUSTOMER', 'Jalan Tembaan 2, Bubutan, Surabaya, Jawa Timur', 1008.02, 60500.00, 'Pending', 'Lunas', 'SBT-VA-1779970459740916', '2026-05-28 12:14:19', '2026-05-28 12:14:19'),
(11, 'LSK998099231581', 'CUSTOMER', 'Jalan Belawan, Gambir, Jakarta Pusat', 1408.60, 81100.00, 'Pending', 'Lunas', 'SBT-VA-1779980995209928', '2026-05-28 15:09:55', '2026-05-28 15:09:55'),
(12, 'LSK99819652475', 'CUSTOMER', 'Batudulang, Nusa Tenggara Barat', 1163.99, 68800.00, 'Pending', 'Lunas', 'SBT-VA-1779981968407743', '2026-05-28 15:26:09', '2026-05-28 15:26:09'),
(13, 'LSK998256012836', 'CUSTOMER', 'Jampelan, Getasan, Kabupaten Semarang, Jawa Tengah', 420.89, 51900.00, 'Pending', 'Lunas', 'SBT-VA-1779982562229715', '2026-05-28 15:36:02', '2026-05-28 15:36:02'),
(14, 'LSK020113197338', 'CUSTOMER', 'Gang Aki Udil, Cibaduyut, Kota Bandung, Jawa Barat', 121.47, 16100.00, 'Pending', 'Lunas', 'SBT-VA-1780201135002632', '2026-05-31 04:18:55', '2026-05-31 04:18:55'),
(15, 'LSK022930990929', 'CUSTOMER', 'Jamika, Kota Bandung, Jawa Barat', 112.75, 15700.00, 'Pending', 'Lunas', 'SBT-VA-1780229313133329', '2026-05-31 12:08:33', '2026-05-31 12:08:33'),
(16, 'LSK023419537787', 'CUSTOMER', 'Cakung, Jakarta Timur', 18.88, 11000.00, 'Pending', 'Lunas', 'SBT-VA-1780234199370371', '2026-05-31 13:29:59', '2026-05-31 13:29:59'),
(17, 'LSK024808999684', 'CUSTOMER', 'Jalan Persatuan Cijerah Wetan, Cijerah, Kota Bandung, Jawa Barat', 117.08, 16500.00, 'Pending', 'Lunas', 'SBT-VA-1780248093257991', '2026-05-31 17:21:33', '2026-05-31 17:21:33');

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
(1, 'Marketplace TokoBagus', 'pic@tokobagus.com', 'lsk_live_mktA_9f8a8b7c6d5e4f3a2b1c', 'SB-7281930456', 'https://tokobagus.com/webhook/logistik', 1, '2026-05-23 15:13:02', '2026-06-02 04:05:36'),
(2, 'Toko Elektronik MajuJaya', 'admin@majujaya.co.id', 'lsk_live_tokB_a1b2c3d4e5f6a7b8c9d0', 'SB-3945817260', 'https://majujaya.co.id/api/webhook', 1, '2026-05-23 15:13:02', '2026-05-23 15:13:02'),
(3, 'Supplier SumberMakmur', 'ops@sumbermakmur.id', 'lsk_live_splC_f0e1d2c3b4a5968778a9', 'SB-6120384759', 'https://sumbermakmur.id/hooks/delivery', 1, '2026-05-23 15:13:02', '2026-05-23 15:13:02');

-- --------------------------------------------------------

--
-- Table structure for table `shipments`
--

CREATE TABLE `shipments` (
  `id` int NOT NULL,
  `awb_number` varchar(30) NOT NULL,
  `partner_id` int DEFAULT NULL,
  `external_order_id` varchar(50) DEFAULT NULL,
  `sender_name` varchar(100) NOT NULL,
  `sender_address` text NOT NULL,
  `sender_phone` varchar(20) DEFAULT NULL,
  `sender_lat` decimal(10,7) DEFAULT NULL,
  `sender_lng` decimal(10,7) DEFAULT NULL,
  `sender_district` varchar(100) DEFAULT NULL,
  `sender_city` varchar(100) DEFAULT NULL,
  `sender_province` varchar(100) DEFAULT NULL,
  `sender_postal_code` varchar(10) DEFAULT NULL,
  `receiver_name` varchar(100) NOT NULL,
  `receiver_address` text NOT NULL,
  `receiver_phone` varchar(20) DEFAULT NULL,
  `receiver_lat` decimal(10,7) DEFAULT NULL,
  `receiver_lng` decimal(10,7) DEFAULT NULL,
  `receiver_district` varchar(100) DEFAULT NULL,
  `receiver_city` varchar(100) DEFAULT NULL,
  `receiver_province` varchar(100) DEFAULT NULL,
  `receiver_postal_code` varchar(10) DEFAULT NULL,
  `distance_km` decimal(10,2) DEFAULT NULL,
  `rate_id` int DEFAULT NULL,
  `weight` decimal(10,2) NOT NULL DEFAULT '1.00',
  `service_type` enum('Reguler','Express') DEFAULT 'Reguler',
  `ongkir` decimal(12,2) NOT NULL,
  `biaya_layanan` decimal(12,2) DEFAULT '0.00',
  `total_biaya` decimal(12,2) NOT NULL,
  `status` enum('Pending','Picked Up','In Transit','Out For Delivery','Waiting Branch Confirmation','Arrived at Branch','Arrived at Destination Branch','Delivered','Failed','Cancelled') DEFAULT 'Pending',
  `payment_status` enum('Pending','Paid','Failed') DEFAULT 'Pending',
  `payment_method` enum('bank_transfer','cod','e_wallet') DEFAULT 'bank_transfer',
  `smartbank_trx_id` varchar(50) DEFAULT NULL,
  `assigned_kurir_id` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `origin_branch_id` int DEFAULT NULL,
  `destination_branch_id` int DEFAULT NULL,
  `current_branch_id` int DEFAULT NULL,
  `customer_id` int DEFAULT NULL,
  `order_source` varchar(50) NOT NULL DEFAULT 'Customer',
  `final_branch_id` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `shipments`
--

INSERT INTO `shipments` (`id`, `awb_number`, `partner_id`, `external_order_id`, `sender_name`, `sender_address`, `sender_phone`, `sender_lat`, `sender_lng`, `sender_district`, `sender_city`, `sender_province`, `sender_postal_code`, `receiver_name`, `receiver_address`, `receiver_phone`, `receiver_lat`, `receiver_lng`, `receiver_district`, `receiver_city`, `receiver_province`, `receiver_postal_code`, `distance_km`, `rate_id`, `weight`, `service_type`, `ongkir`, `biaya_layanan`, `total_biaya`, `status`, `payment_status`, `payment_method`, `smartbank_trx_id`, `assigned_kurir_id`, `created_at`, `updated_at`, `origin_branch_id`, `destination_branch_id`, `current_branch_id`, `customer_id`, `order_source`, `final_branch_id`) VALUES
(1, 'LSK20260501001', 1, 'TB-ORD-10001', 'Gudang TokoBagus Jakarta', 'Jl. Gatot Subroto No.12, Jakarta Selatan', '021-5551001', NULL, NULL, NULL, 'Jakarta', NULL, NULL, 'Rina Kartika', 'Jl. Dago No.45, Bandung', '0812-3456-7001', NULL, NULL, NULL, 'Bandung', NULL, NULL, NULL, NULL, 2.50, 'Reguler', 37500.00, 3750.00, 41250.00, 'Delivered', 'Paid', 'bank_transfer', 'SBT-20260501-001', 3, '2026-05-23 15:13:02', '2026-05-24 05:55:56', 1, 2, 2, NULL, 'Customer', NULL),
(2, 'LSK20260501002', 1, 'TB-ORD-10002', 'Gudang TokoBagus Jakarta', 'Jl. Gatot Subroto No.12, Jakarta Selatan', '021-5551001', NULL, NULL, NULL, 'Jakarta', NULL, NULL, 'Hendra Wijaya', 'Jl. Pemuda No.88, Surabaya', '0813-4567-8002', NULL, NULL, NULL, 'Surabaya', NULL, NULL, NULL, NULL, 5.00, 'Express', 200000.00, 20000.00, 220000.00, 'Delivered', 'Paid', 'bank_transfer', 'SBT-20260501-002', 4, '2026-05-23 15:13:02', '2026-05-24 05:55:56', 1, 3, 3, NULL, 'Customer', NULL),
(3, 'LSK20260502003', 1, 'TB-ORD-10003', 'Gudang TokoBagus Jakarta', 'Jl. Gatot Subroto No.12, Jakarta Selatan', '021-5551001', NULL, NULL, NULL, 'Jakarta', NULL, NULL, 'Siti Nurhaliza', 'Jl. Malioboro No.10, Yogyakarta', '0856-7890-1003', NULL, NULL, NULL, 'Yogyakarta', NULL, NULL, NULL, NULL, 1.00, 'Reguler', 22000.00, 2200.00, 24200.00, 'Arrived at Branch', 'Paid', 'bank_transfer', 'SBT-20260502-003', NULL, '2026-05-23 15:13:02', '2026-05-24 06:18:20', 1, 7, 9, NULL, 'Customer', NULL),
(4, 'LSK20260502004', 1, 'TB-ORD-10004', 'Gudang TokoBagus Jakarta', 'Jl. Gatot Subroto No.12, Jakarta Selatan', '021-5551001', NULL, NULL, NULL, 'Jakarta', NULL, NULL, 'Agus Setiawan', 'Jl. Asia Afrika No.77, Bandung', '0878-1234-5004', NULL, NULL, NULL, 'Bandung', NULL, NULL, NULL, NULL, 3.00, 'Express', 75000.00, 7500.00, 82500.00, 'Picked Up', 'Paid', 'bank_transfer', 'SBT-20260502-004', 3, '2026-05-23 15:13:02', '2026-05-24 05:55:56', 1, 2, 1, NULL, 'Customer', NULL),
(5, 'LSK20260503005', 1, 'TB-ORD-10005', 'Gudang TokoBagus Jakarta', 'Jl. Gatot Subroto No.12, Jakarta Selatan', '021-5551001', NULL, NULL, NULL, 'Jakarta', NULL, NULL, 'Dewi Lestari', 'Jl. Diponegoro No.55, Medan', '0821-6789-0005', NULL, NULL, NULL, 'Medan', NULL, NULL, NULL, NULL, 4.00, 'Reguler', 140000.00, 14000.00, 154000.00, 'Picked Up', 'Pending', 'bank_transfer', NULL, 3, '2026-05-23 15:13:02', '2026-05-24 05:55:56', 1, 4, 1, NULL, 'Customer', NULL),
(6, 'LSK20260503006', 1, 'TB-ORD-10006', 'Gudang TokoBagus Jakarta', 'Jl. Gatot Subroto No.12, Jakarta Selatan', '021-5551001', NULL, NULL, NULL, 'Jakarta', NULL, NULL, 'Fajar Nugroho', 'Jl. Braga No.22, Bandung', '0857-2345-6006', NULL, NULL, NULL, 'Bandung', NULL, NULL, NULL, NULL, 1.50, 'Reguler', 22500.00, 2250.00, 24750.00, 'Failed', 'Failed', 'bank_transfer', 'SBT-20260503-006', 6, '2026-05-23 15:13:02', '2026-05-24 05:55:56', 1, 2, 1, NULL, 'Customer', NULL),
(7, 'LSK20260504007', 1, 'TB-ORD-10007', 'Gudang TokoBagus Jakarta', 'Jl. Gatot Subroto No.12, Jakarta Selatan', '021-5551001', NULL, NULL, NULL, 'Jakarta', NULL, NULL, 'Galih Pratama', 'Jl. Thamrin No.99, Surabaya', '0899-3456-7007', NULL, NULL, NULL, 'Surabaya', NULL, NULL, NULL, NULL, 2.00, 'Express', 80000.00, 8000.00, 88000.00, 'Arrived at Branch', 'Paid', 'bank_transfer', 'SBT-20260504-007', 7, '2026-05-23 15:13:02', '2026-05-24 06:24:40', 1, 3, 1, NULL, 'Customer', NULL),
(8, 'LSK20260501008', 2, 'MJ-INV-20001', 'Toko MajuJaya Bandung', 'Jl. Cihampelas No.100, Bandung', '022-5552001', NULL, NULL, NULL, 'Bandung', NULL, NULL, 'Irfan Hakim', 'Jl. Pandanaran No.34, Semarang', '0812-8901-2008', NULL, NULL, NULL, 'Semarang', NULL, NULL, NULL, NULL, 8.00, 'Reguler', 160000.00, 16000.00, 176000.00, 'Delivered', 'Paid', 'bank_transfer', 'SBT-20260501-008', 4, '2026-05-23 15:13:02', '2026-05-24 05:55:56', 2, 8, 8, NULL, 'Customer', NULL),
(9, 'LSK20260502009', 2, 'MJ-INV-20002', 'Toko MajuJaya Bandung', 'Jl. Cihampelas No.100, Bandung', '022-5552001', NULL, NULL, NULL, 'Bandung', NULL, NULL, 'Joko Widodo', 'Jl. Tugu No.01, Yogyakarta', '0813-9012-3009', NULL, NULL, NULL, 'Yogyakarta', NULL, NULL, NULL, NULL, 3.50, 'Express', 133000.00, 13300.00, 146300.00, 'Delivered', 'Paid', 'bank_transfer', 'SBT-20260502-009', 5, '2026-05-23 15:13:02', '2026-05-24 05:55:56', 2, 7, 7, NULL, 'Customer', NULL),
(10, 'LSK20260503010', 2, 'MJ-INV-20003', 'Toko MajuJaya Bandung', 'Jl. Cihampelas No.100, Bandung', '022-5552001', NULL, NULL, NULL, 'Bandung', NULL, NULL, 'Kartini Sari', 'Jl. Ahmad Yani No.60, Surabaya', '0856-0123-4010', NULL, NULL, NULL, 'Surabaya', NULL, NULL, NULL, NULL, 12.00, 'Reguler', 264000.00, 26400.00, 290400.00, 'Picked Up', 'Paid', 'bank_transfer', 'SBT-20260503-010', 6, '2026-05-23 15:13:02', '2026-05-24 05:55:56', 2, 3, 2, NULL, 'Customer', NULL),
(11, 'LSK20260503011', 2, 'MJ-INV-20004', 'Toko MajuJaya Bandung', 'Jl. Cihampelas No.100, Bandung', '022-5552001', NULL, NULL, NULL, 'Bandung', NULL, NULL, 'Lukman Harun', 'Jl. Sudirman No.15, Semarang', '0878-1234-5011', NULL, NULL, NULL, 'Semarang', NULL, NULL, NULL, NULL, 2.00, 'Reguler', 40000.00, 4000.00, 44000.00, 'Arrived at Branch', 'Pending', 'bank_transfer', NULL, 5, '2026-05-23 15:13:02', '2026-05-24 06:22:21', 2, 8, 2, NULL, 'Customer', NULL),
(12, 'LSK20260504012', 2, 'MJ-INV-20005', 'Toko MajuJaya Bandung', 'Jl. Cihampelas No.100, Bandung', '022-5552001', NULL, NULL, NULL, 'Bandung', NULL, NULL, 'Maya Anggraini', 'Jl. Merdeka No.42, Semarang', '0821-2345-6012', NULL, NULL, NULL, 'Semarang', NULL, NULL, NULL, NULL, 6.00, 'Express', 210000.00, 21000.00, 231000.00, 'Waiting Branch Confirmation', 'Paid', 'bank_transfer', 'SBT-20260504-012', 3, '2026-05-23 15:13:02', '2026-05-28 15:38:54', 2, 8, 2, NULL, 'Customer', NULL),
(13, 'LSK20260505013', 2, 'MJ-INV-20006', 'Toko MajuJaya Bandung', 'Jl. Cihampelas No.100, Bandung', '022-5552001', NULL, NULL, NULL, 'Bandung', NULL, NULL, 'Nadia Putri', 'Jl. Gajah Mada No.18, Yogyakarta', '0857-3456-7013', NULL, NULL, NULL, 'Yogyakarta', NULL, NULL, NULL, NULL, 1.00, 'Reguler', 20000.00, 2000.00, 22000.00, 'Waiting Branch Confirmation', 'Pending', 'bank_transfer', NULL, 4, '2026-05-23 15:13:02', '2026-05-24 07:23:37', 2, 7, 1, NULL, 'Customer', NULL),
(14, 'LSK20260505014', 2, 'MJ-INV-20007', 'Toko MajuJaya Bandung', 'Jl. Cihampelas No.100, Bandung', '022-5552001', NULL, NULL, NULL, 'Bandung', NULL, NULL, 'Oscar Lawalata', 'Jl. Veteran No.25, Semarang', '0899-4567-8014', NULL, NULL, NULL, 'Semarang', NULL, NULL, NULL, NULL, 4.50, 'Reguler', 90000.00, 9000.00, 99000.00, 'Delivered', 'Paid', 'bank_transfer', 'SBT-20260505-014', 7, '2026-05-23 15:13:02', '2026-05-24 05:55:56', 2, 8, 8, NULL, 'Customer', NULL),
(15, 'LSK20260501015', 3, 'SM-PO-30001', 'Gudang SumberMakmur Surabaya', 'Jl. Rungkut Industri No.5, Surabaya', '031-5553001', NULL, NULL, NULL, 'Surabaya', NULL, NULL, 'Panji Asmoro', 'Jl. Sunset Road No.77, Bali', '0812-5678-9015', NULL, NULL, NULL, 'Bali', NULL, NULL, NULL, NULL, 10.00, 'Reguler', 180000.00, 18000.00, 198000.00, 'Delivered', 'Paid', 'bank_transfer', 'SBT-20260501-015', 5, '2026-05-23 15:13:02', '2026-05-24 05:55:56', 3, 9, 9, NULL, 'Customer', NULL),
(16, 'LSK20260502016', 3, 'SM-PO-30002', 'Gudang SumberMakmur Surabaya', 'Jl. Rungkut Industri No.5, Surabaya', '031-5553001', NULL, NULL, NULL, 'Surabaya', NULL, NULL, 'Qori Amelia', 'Jl. Kuta No.33, Bali', '0813-6789-0016', NULL, NULL, NULL, 'Bali', NULL, NULL, NULL, NULL, 7.00, 'Express', 210000.00, 21000.00, 231000.00, 'In Transit', 'Paid', 'bank_transfer', 'SBT-20260502-016', 6, '2026-05-23 15:13:02', '2026-05-24 05:55:56', 3, 9, 3, NULL, 'Customer', NULL),
(17, 'LSK20260503017', 3, 'SM-PO-30003', 'Gudang SumberMakmur Surabaya', 'Jl. Rungkut Industri No.5, Surabaya', '031-5553001', NULL, NULL, NULL, 'Surabaya', NULL, NULL, 'Rizky Maulana', 'Jl. Legian No.50, Bali', '0856-7890-1017', NULL, NULL, NULL, 'Bali', NULL, NULL, NULL, NULL, 15.00, 'Reguler', 270000.00, 27000.00, 297000.00, 'Waiting Branch Confirmation', 'Paid', 'bank_transfer', 'SBT-20260503-017', 4, '2026-05-23 15:13:02', '2026-05-24 07:22:49', 3, 9, 3, NULL, 'Customer', NULL),
(18, 'LSK20260504018', 3, 'SM-PO-30004', 'Gudang SumberMakmur Surabaya', 'Jl. Rungkut Industri No.5, Surabaya', '031-5553001', NULL, NULL, NULL, 'Surabaya', NULL, NULL, 'Sandra Olivia', 'Jl. Sanur No.12, Bali', '0878-8901-2018', NULL, NULL, NULL, 'Bali', NULL, NULL, NULL, NULL, 3.00, 'Express', 90000.00, 9000.00, 99000.00, 'Waiting Branch Confirmation', 'Pending', 'bank_transfer', NULL, 46, '2026-05-23 15:13:02', '2026-05-24 06:50:31', 3, 9, 3, NULL, 'Customer', NULL),
(19, 'LSK20260505019', 3, 'SM-PO-30005', 'Gudang SumberMakmur Surabaya', 'Jl. Rungkut Industri No.5, Surabaya', '031-5553001', NULL, NULL, NULL, 'Surabaya', NULL, NULL, 'Taufik Hidayat', 'Jl. Nusa Dua No.8, Bali', '0821-9012-3019', NULL, NULL, NULL, 'Bali', NULL, NULL, NULL, NULL, 5.50, 'Reguler', 99000.00, 9900.00, 108900.00, 'Delivered', 'Paid', 'bank_transfer', 'SBT-20260505-019', 3, '2026-05-23 15:13:02', '2026-05-24 05:55:56', 3, 9, 9, NULL, 'Customer', NULL),
(20, 'LSK20260506020', 3, 'SM-PO-30006', 'Gudang SumberMakmur Surabaya', 'Jl. Rungkut Industri No.5, Surabaya', '031-5553001', NULL, NULL, NULL, 'Surabaya', NULL, NULL, 'Umi Kalsum', 'Jl. Ubud No.66, Bali', '0857-0123-4020', NULL, NULL, NULL, 'Bali', NULL, NULL, NULL, NULL, 2.00, 'Reguler', 36000.00, 3600.00, 39600.00, 'Failed', 'Failed', 'bank_transfer', 'SBT-20260506-020', 7, '2026-05-23 15:13:02', '2026-05-24 05:55:56', 3, 9, 3, NULL, 'Customer', NULL),
(21, 'LSK955178651484', 1, NULL, 'Test Sender', 'Jl. Sudirman No.1, Jakarta', '08123456789', -6.2088000, 106.8456000, 'Setiabudi', 'Jakarta', 'DKI Jakarta', '12190', 'Test Receiver', 'Jl. Dago No.45, Bandung', '08987654321', -6.9175000, 107.6191000, 'Coblong', 'Bandung', 'Jawa Barat', '40135', 116.24, 1, 2.00, 'Reguler', 17900.00, 90.00, 17990.00, 'Picked Up', 'Paid', 'bank_transfer', 'PAY-1779551786542465', NULL, '2026-05-23 15:56:26', '2026-05-24 04:09:19', 1, 2, 1, NULL, 'Customer', NULL),
(22, 'LSK955225267412', 1, NULL, 'ALIA IMUP', 'Jalan Poncol Gang I, Mampang Prapatan, Jakarta Selatan', '085283751548', -6.2365809, 106.8191658, 'Mampang Prapatan', 'Jakarta Selatan', NULL, '12710', 'alia cantik', 'Jalan H. Ma\'mun, Ciater, Tangerang Selatan, Banten', '085241510357', -6.3208342, 106.6955392, 'Ciater', 'Tangerang Selatan', 'Banten', '15317', 16.57, 2, 1.20, 'Express', 20600.00, 103.00, 20703.00, 'Picked Up', 'Paid', 'e_wallet', 'PAY-1779552254213203', 3, '2026-05-23 16:04:12', '2026-05-24 04:59:19', 1, NULL, 1, NULL, 'Customer', NULL),
(23, 'LSK959809849483', 1, NULL, 'ALIA IMUP', 'Jalan Bukit Duri Tanjakan, Tebet, Jakarta Selatan', '085283751548', -6.2220785, 106.8591052, 'Tebet', 'Jakarta Selatan', NULL, '12840', 'WA ODE NUR ALIA', 'Jalan Peruk, Tebet, Jakarta Selatan', '085283751548', -6.2200307, 106.8532044, 'Tebet', 'Jakarta Selatan', NULL, '12860', 0.69, 1, 1.40, 'Reguler', 10900.00, 55.00, 10955.00, 'Waiting Branch Confirmation', 'Paid', 'bank_transfer', 'PAY-1779598100029291', 46, '2026-05-24 04:48:18', '2026-05-24 06:50:26', NULL, NULL, 3, NULL, 'Customer', NULL),
(24, 'LSK960553688156', 1, NULL, 'alia baru', 'Kramat Jati, Jakarta Timur', '085283751540', -6.2566021, 106.8605804, 'Kramat Jati', 'Jakarta Timur', NULL, '13640', 'hai', 'Jalan Buntu, Tanah Abang, Jakarta Pusat', '085283751548', -6.2095889, 106.8094683, 'Tanah Abang', 'Jakarta Pusat', NULL, '10210', 7.70, 2, 1.30, 'Express', 20200.00, 101.00, 20301.00, 'Pending', 'Paid', 'cod', 'PAY-1779605538412932', NULL, '2026-05-24 06:52:16', '2026-05-24 06:52:18', NULL, NULL, NULL, NULL, 'Customer', NULL),
(25, 'LSK960582653729', 1, NULL, 'dummy', 'Gang Muncang, Pungkur, Kota Bandung, Jawa Barat', '085283751540', -6.9277901, 107.6049042, 'Pungkur', 'Kota Bandung', 'Jawa Barat', '40252', 'userbiasa', 'Jalan Taman Kebon Sirih I, Tanah Abang, Jakarta Pusat', '085283751548', -6.1828809, 106.8166351, 'Tanah Abang', 'Jakarta Pusat', NULL, '10250', 120.18, 2, 1.00, 'Express', 28200.00, 141.00, 28341.00, 'Pending', 'Paid', 'cod', 'PAY-1779605828068916', NULL, '2026-05-24 06:57:06', '2026-05-24 06:57:08', NULL, NULL, NULL, NULL, 'Customer', NULL),
(26, 'LSK960598161729', 1, NULL, 'dummyb', 'Jalan Medan Merdeka Selatan, Gambir, Jakarta Pusat', '085283751540', -6.1794676, 106.8267632, 'Gambir', 'Jakarta Pusat', NULL, '10110', 'WA ODE NUR ALIA', 'Kopo Permai, Cangkuang Kulon, Margahayu, Jawa Barat', '085283751548', -6.9700494, 107.5863647, 'Cangkuang Kulon', 'Margahayu', 'Jawa Barat', '40227', 121.53, 2, 1.00, 'Express', 28300.00, 142.00, 28442.00, 'Pending', 'Paid', 'bank_transfer', 'PAY-1779605983136774', NULL, '2026-05-24 06:59:41', '2026-05-24 06:59:43', NULL, NULL, NULL, NULL, 'Customer', NULL),
(27, 'LSK96060263874', 1, NULL, 'dummybaru', 'Jalan Medan Merdeka Selatan, Gambir, Jakarta Pusat', '085283751540', -6.1794676, 106.8257332, 'Gambir', 'Jakarta Pusat', NULL, '10110', 'WA ODE NUR ALIA', 'Bandasari, Kabupaten Bandung, Jawa Barat', '085241510357', -7.0572824, 107.5286865, 'Bandasari', 'Kabupaten Bandung', 'Jawa Barat', '40912', 124.72, 2, 1.00, 'Express', 28500.00, 143.00, 28643.00, 'Pending', 'Paid', 'bank_transfer', 'PAY-1779606027911474', NULL, '2026-05-24 07:00:26', '2026-05-24 07:00:27', NULL, NULL, NULL, NULL, 'Customer', NULL),
(28, 'LSK960762593374', 1, NULL, 'dummybaruuu', 'Gambir, Gambir, Jakarta Pusat', '085241510357', -6.1794676, 106.8236732, 'Gambir', 'Jakarta Pusat', NULL, '10110', 'WA ODE NUR ALIA', 'Lebakwangi, Kabupaten Bandung, Jawa Barat', '085283751548', -7.0463791, 107.6165771, 'Lebakwangi', 'Kabupaten Bandung', 'Jawa Barat', '40377', 130.24, 2, 1.00, 'Express', 29000.00, 145.00, 29145.00, 'Pending', 'Paid', 'bank_transfer', 'PAY-177960762746424', NULL, '2026-05-24 07:27:05', '2026-05-24 07:27:07', NULL, NULL, NULL, NULL, 'Customer', NULL),
(29, 'LSK961014067559', 1, NULL, 'haimanis', 'Jalan KH. Wahid Hasyim, Tanah Abang, Jakarta Pusat', '085283751540', -6.1869768, 106.8217850, 'Tanah Abang', 'Jakarta Pusat', NULL, '10240', 'hmm', 'Gang Singosari II, Purbayan, Kota Yogyakarta, Daerah Istimewa Yogyakarta', '085283751548', -7.8219307, 110.4016328, 'Purbayan', 'Kota Yogyakarta', 'Daerah Istimewa Yogyakarta', '55172', 434.90, 1, 1.50, 'Reguler', 32800.00, 164.00, 32964.00, 'In Transit', 'Paid', 'bank_transfer', 'PAY-1779610142219681', NULL, '2026-05-24 08:09:00', '2026-05-24 08:34:17', NULL, NULL, NULL, NULL, 'Customer', NULL),
(30, 'LSK961222518157', 1, NULL, 'l', 'Gambir, Gambir, Jakarta Pusat', '085241510357', -6.1781023, 106.8252182, 'Gambir', 'Jakarta Pusat', NULL, '10110', 'kkk', 'Jalan Wates, Ngestiharjo, Kasihan, Daerah Istimewa Yogyakarta', '085283751540', -7.8007147, 110.3400064, 'Ngestiharjo', 'Kasihan', 'Daerah Istimewa Yogyakarta', '55182', 427.82, 1, 1.40, 'Reguler', 32200.00, 161.00, 32361.00, 'Pending', 'Pending', 'bank_transfer', NULL, NULL, '2026-05-24 08:43:45', '2026-05-24 08:43:45', NULL, NULL, NULL, NULL, 'Customer', NULL),
(31, 'LSK961223196698', 1, NULL, 'l', 'Gambir, Gambir, Jakarta Pusat', '085241510357', -6.1781023, 106.8252182, 'Gambir', 'Jakarta Pusat', NULL, '10110', 'kkk', 'Jalan Wates, Ngestiharjo, Kasihan, Daerah Istimewa Yogyakarta', '085283751540', -7.8007147, 110.3400064, 'Ngestiharjo', 'Kasihan', 'Daerah Istimewa Yogyakarta', '55182', 427.82, 1, 1.40, 'Reguler', 32200.00, 161.00, 32361.00, 'Pending', 'Pending', 'bank_transfer', NULL, NULL, '2026-05-24 08:43:51', '2026-05-24 08:43:51', NULL, NULL, NULL, NULL, 'Customer', NULL),
(32, 'LSK961223794922', 1, NULL, 'l', 'Gambir, Gambir, Jakarta Pusat', '085241510357', -6.1781023, 106.8252182, 'Gambir', 'Jakarta Pusat', NULL, '10110', 'kkk', 'Jalan Wates, Ngestiharjo, Kasihan, Daerah Istimewa Yogyakarta', '085283751540', -7.8007147, 110.3400064, 'Ngestiharjo', 'Kasihan', 'Daerah Istimewa Yogyakarta', '55182', 427.82, 1, 1.40, 'Reguler', 32200.00, 161.00, 32361.00, 'Pending', 'Pending', 'bank_transfer', NULL, NULL, '2026-05-24 08:43:57', '2026-05-24 08:43:57', NULL, NULL, NULL, NULL, 'Customer', NULL),
(33, 'LSK14928729413', 1, 'TEST-1779614928723', 'Test Sender', 'Jl Test Sender 1', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Test Receiver', 'Jl Test Receiver 2', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2.00, 'Reguler', 30000.00, 1500.00, 31500.00, 'Pending', 'Pending', 'bank_transfer', NULL, NULL, '2026-05-24 09:28:48', '2026-05-24 09:28:48', 1, 2, 1, NULL, 'Marketplace', NULL),
(34, 'LSK15129747173', 1, 'TEST-1779615129744', 'Test Sender', 'Jl Test Sender 1', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Test Receiver', 'Jl Test Receiver 2', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2.00, 'Reguler', 30000.00, 1500.00, 31500.00, 'Pending', 'Pending', 'bank_transfer', NULL, NULL, '2026-05-24 09:32:09', '2026-05-24 09:32:09', 1, 2, 1, NULL, 'Marketplace', NULL),
(35, 'LSK15209663111', 1, 'TEST-1779615209660', 'Test Sender', 'Jl Test Sender 1', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Test Receiver', 'Jl Test Receiver 2', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2.00, 'Reguler', 30000.00, 1500.00, 31500.00, 'Cancelled', 'Pending', 'bank_transfer', NULL, NULL, '2026-05-24 09:33:29', '2026-05-24 09:33:29', 1, 2, 1, NULL, 'Marketplace', NULL),
(36, 'LSK16346373678', 1, 'TEST-1779616346368', 'Test Sender', 'Jl Test Sender 1', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Test Receiver', 'Jl Test Receiver 2', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2.00, 'Reguler', 30000.00, 1500.00, 31500.00, 'Cancelled', 'Pending', 'bank_transfer', NULL, NULL, '2026-05-24 09:52:26', '2026-05-24 09:52:26', 1, 2, 1, NULL, 'Marketplace', NULL),
(37, 'LSK961704195850', 1, NULL, 'haimanis', 'Kepuh, Tonjong, Kab Serang, Banten', '085283751548', -6.0149222, 106.1293030, 'Tonjong', 'Kab Serang', 'Banten', '42161', 'WA ODE NUR ALIA', 'Jalan Setiabudi V Gang III, Setiabudi, Jakarta Selatan', '085241510357', -6.2081384, 106.8264198, 'Setiabudi', 'Jakarta Selatan', NULL, '12910', 80.01, 1, 1.00, 'Reguler', 14100.00, 423.00, 14523.00, 'Pending', 'Pending', 'bank_transfer', NULL, NULL, '2026-05-24 10:04:01', '2026-05-24 10:04:01', NULL, NULL, NULL, NULL, 'Customer', NULL),
(38, 'LSK961704859781', 1, NULL, 'haimanis', 'Kepuh, Tonjong, Kab Serang, Banten', '085283751548', -6.0149222, 106.1293030, 'Tonjong', 'Kab Serang', 'Banten', '42161', 'WA ODE NUR ALIA', 'Jalan Setiabudi V Gang III, Setiabudi, Jakarta Selatan', '085241510357', -6.2081384, 106.8264198, 'Setiabudi', 'Jakarta Selatan', NULL, '12910', 80.01, 1, 1.00, 'Reguler', 14100.00, 423.00, 14523.00, 'Pending', 'Pending', 'bank_transfer', NULL, NULL, '2026-05-24 10:04:08', '2026-05-24 10:04:08', NULL, NULL, NULL, NULL, 'Customer', NULL),
(39, 'LSK961706020557', 1, NULL, 'haimanis', 'Kepuh, Tonjong, Kab Serang, Banten', '085283751548', -6.0149222, 106.1293030, 'Tonjong', 'Kab Serang', 'Banten', '42161', 'WA ODE NUR ALIA', 'Jalan Setiabudi V Gang III, Setiabudi, Jakarta Selatan', '085241510357', -6.2081384, 106.8264198, 'Setiabudi', 'Jakarta Selatan', NULL, '12910', 80.01, 1, 1.00, 'Reguler', 14100.00, 423.00, 14523.00, 'Pending', 'Pending', 'bank_transfer', NULL, NULL, '2026-05-24 10:04:20', '2026-05-24 10:04:20', NULL, NULL, NULL, NULL, 'Customer', NULL),
(40, 'LSK961706983231', 1, NULL, 'haimanis', 'Kepuh, Tonjong, Kab Serang, Banten', '085283751548', -6.0149222, 106.1293030, 'Tonjong', 'Kab Serang', 'Banten', '42161', 'WA ODE NUR ALIA', 'Jalan Setiabudi V Gang III, Setiabudi, Jakarta Selatan', '085241510357', -6.2081384, 106.8264198, 'Setiabudi', 'Jakarta Selatan', NULL, '12910', 80.01, 1, 1.00, 'Reguler', 14100.00, 423.00, 14523.00, 'Pending', 'Pending', 'bank_transfer', NULL, NULL, '2026-05-24 10:04:29', '2026-05-24 10:04:29', NULL, NULL, NULL, NULL, 'Customer', NULL),
(41, 'LSK17116745785', 1, 'TEST-1779617116740', 'Test Sender', 'Jl Test Sender 1', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Test Receiver', 'Jl Test Receiver 2', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2.00, 'Reguler', 30000.00, 1500.00, 31500.00, 'Cancelled', 'Pending', 'bank_transfer', NULL, NULL, '2026-05-24 10:05:16', '2026-05-24 10:05:16', 1, 2, 1, NULL, 'Marketplace', NULL),
(42, 'LSK17123010986', 1, 'TEST-1779617123005', 'Test Sender', 'Jl Test Sender 1', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Test Receiver', 'Jl Test Receiver 2', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2.00, 'Reguler', 30000.00, 1500.00, 31500.00, 'Cancelled', 'Pending', 'bank_transfer', NULL, NULL, '2026-05-24 10:05:23', '2026-05-24 10:05:23', 1, 2, 1, NULL, 'Marketplace', NULL),
(43, 'LSK17135703769', 1, 'TEST-1779617135698', 'Test Sender', 'Jl Test Sender 1', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Test Receiver', 'Jl Test Receiver 2', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2.00, 'Reguler', 30000.00, 1500.00, 31500.00, 'Cancelled', 'Pending', 'bank_transfer', NULL, NULL, '2026-05-24 10:05:35', '2026-05-24 10:05:35', 1, 2, 1, NULL, 'Marketplace', NULL),
(44, 'LSK961715750043', 1, NULL, 'haimanis', 'Kepuh, Tonjong, Kab Serang, Banten', '085283751548', -6.0149222, 106.1293030, 'Tonjong', 'Kab Serang', 'Banten', '42161', 'WA ODE NUR ALIA', 'Jalan Setiabudi V Gang III, Setiabudi, Jakarta Selatan', '085241510357', -6.2081384, 106.8264198, 'Setiabudi', 'Jakarta Selatan', NULL, '12910', 80.01, 1, 1.00, 'Reguler', 14100.00, 423.00, 14523.00, 'Pending', 'Pending', 'bank_transfer', NULL, NULL, '2026-05-24 10:05:57', '2026-05-24 10:05:57', NULL, NULL, NULL, NULL, 'Customer', NULL),
(45, 'LSK961716382579', 1, NULL, 'haimanis', 'Kepuh, Tonjong, Kab Serang, Banten', '085283751548', -6.0149222, 106.1293030, 'Tonjong', 'Kab Serang', 'Banten', '42161', 'WA ODE NUR ALIA', 'Jalan Setiabudi V Gang III, Setiabudi, Jakarta Selatan', '085241510357', -6.2081384, 106.8264198, 'Setiabudi', 'Jakarta Selatan', NULL, '12910', 80.01, 1, 1.00, 'Reguler', 14100.00, 423.00, 14523.00, 'Pending', 'Pending', 'bank_transfer', NULL, NULL, '2026-05-24 10:06:03', '2026-05-24 10:06:03', NULL, NULL, NULL, NULL, 'Customer', NULL),
(46, 'LSK961734558765', 1, NULL, 'haimanis', 'Jalan Taman Kebon Sirih I, Tanah Abang, Jakarta Pusat', '085283751548', -6.1835635, 106.8210983, 'Tanah Abang', 'Jakarta Pusat', NULL, '10250', 'WA ODE NUR ALIA', 'Gang Musholla Al Ikhlas, Proyek, Bekasi, Jawa Barat', '085283751548', -6.2374901, 106.9989395, 'Proyek', 'Bekasi', 'Jawa Barat', '17141', 20.55, 2, 1.00, 'Express', 20200.00, 606.00, 20806.00, 'Out For Delivery', 'Paid', 'bank_transfer', 'GATEWAY-MOCK-1779617348216820', 3, '2026-05-24 10:09:05', '2026-05-24 10:24:14', NULL, NULL, 1, NULL, 'Customer', NULL),
(47, 'LSK961838763794', 1, NULL, 'barubanget', 'Subang, Jawa Barat', '085241510357', -6.5800316, 107.7552795, NULL, 'Subang', 'Jawa Barat', '41231', 'barubangett oy', 'Gambir, Gambir, Jakarta Pusat', '085283751540', -6.1787849, 106.8245316, 'Gambir', 'Jakarta Pusat', NULL, '10110', 112.11, 1, 1.00, 'Reguler', 15700.00, 471.00, 16171.00, 'Delivered', 'Paid', 'bank_transfer', 'SBT-VA-1779618391799242', 5, '2026-05-24 10:26:27', '2026-05-24 10:32:38', NULL, NULL, 2, NULL, 'Customer', NULL),
(48, 'LSK49127285245', 1, 'ORD-TOKOBAGUS-12345', 'Toko ABC', 'Jl. Sudirman No. 1, Jakarta', '081234567890', NULL, NULL, NULL, NULL, NULL, NULL, 'Budi Santoso', 'Jl. Asia Afrika No. 10, Bandung', '089876543210', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2.50, 'Express', 62500.00, 3125.00, 65625.00, 'Pending', 'Paid', 'bank_transfer', 'BANK-177994912728557', NULL, '2026-05-28 06:18:47', '2026-05-28 06:18:47', NULL, NULL, NULL, NULL, 'Customer', NULL),
(49, 'LSK49137098113', 1, 'ORD-TOKOBAGUS-12345', 'Toko ABC', 'Jl. Sudirman No. 1, Jakarta', '081234567890', NULL, NULL, NULL, NULL, NULL, NULL, 'Budi Santoso', 'Jl. Asia Afrika No. 10, Bandung', '089876543210', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2.50, 'Express', 62500.00, 3125.00, 65625.00, 'Picked Up', 'Paid', 'bank_transfer', 'BANK-177994913709899', NULL, '2026-05-28 06:18:57', '2026-05-28 06:18:57', NULL, NULL, NULL, NULL, 'Customer', NULL),
(50, 'LSK994970636478', NULL, NULL, 'Nur Alia', 'Jalan Tanjung, Menteng, Jakarta Pusat', '085283751540', -6.1916187, 106.8311658, 'Menteng', 'Jakarta Pusat', NULL, '10350', 'userbiasa', 'Jalan Bimasakti, Demangan, Kota Yogyakarta, Daerah Istimewa Yogyakarta', '085283751540', -7.7877379, 110.3909557, 'Demangan', 'Kota Yogyakarta', 'Daerah Istimewa Yogyakarta', '55221', 431.10, 1, 1.00, 'Reguler', 31600.00, 948.00, 32548.00, 'Pending', 'Pending', 'bank_transfer', NULL, NULL, '2026-05-28 06:28:26', '2026-05-28 06:28:26', NULL, NULL, NULL, NULL, 'Customer', NULL),
(51, 'LSK994972160910', NULL, NULL, 'Nur Alia', 'Jalan Tanjung, Menteng, Jakarta Pusat', '085283751540', -6.1916187, 106.8311658, 'Menteng', 'Jakarta Pusat', NULL, '10350', 'userbiasa', 'Jalan Bimasakti, Demangan, Kota Yogyakarta, Daerah Istimewa Yogyakarta', '085283751540', -7.7877379, 110.3909557, 'Demangan', 'Kota Yogyakarta', 'Daerah Istimewa Yogyakarta', '55221', 431.10, 1, 1.00, 'Reguler', 31600.00, 948.00, 32548.00, 'Pending', 'Pending', 'bank_transfer', NULL, NULL, '2026-05-28 06:28:41', '2026-05-28 06:28:41', NULL, NULL, NULL, NULL, 'Customer', NULL),
(52, 'LSK994972810291', NULL, NULL, 'Nur Alia', 'Jalan Tanjung, Menteng, Jakarta Pusat', '085283751540', -6.1916187, 106.8311658, 'Menteng', 'Jakarta Pusat', NULL, '10350', 'userbiasa', 'Jalan Bimasakti, Demangan, Kota Yogyakarta, Daerah Istimewa Yogyakarta', '085283751540', -7.7877379, 110.3909557, 'Demangan', 'Kota Yogyakarta', 'Daerah Istimewa Yogyakarta', '55221', 431.10, 1, 1.00, 'Reguler', 31600.00, 948.00, 32548.00, 'Pending', 'Paid', 'bank_transfer', 'SBT-VA-1779950029442539', NULL, '2026-05-28 06:28:48', '2026-05-28 06:33:49', 1, 2, 1, NULL, 'Customer', 7),
(53, 'LSK995011663076', NULL, NULL, 'Nur Alia B', 'Gambir, Gambir, Jakarta Pusat', '085283751540', -6.1766346, 106.8279801, 'Gambir', 'Jakarta Pusat', NULL, '10110', 'WA ODE NUR ALIA', 'Jalan Ontoseno, Wirobrajan, Kota Yogyakarta, Daerah Istimewa Yogyakarta', '085796256268', -7.8018882, 110.3502913, 'Wirobrajan', 'Kota Yogyakarta', 'Daerah Istimewa Yogyakarta', '55252', 428.69, 1, 1.00, 'Reguler', 31500.00, 945.00, 32445.00, 'Pending', 'Pending', 'bank_transfer', NULL, NULL, '2026-05-28 06:35:16', '2026-05-28 06:35:16', NULL, NULL, NULL, NULL, 'Customer', NULL),
(54, 'LSK995012931741', NULL, NULL, 'Nur Alia B', 'Gambir, Gambir, Jakarta Pusat', '085283751540', -6.1766346, 106.8279801, 'Gambir', 'Jakarta Pusat', NULL, '10110', 'WA ODE NUR ALIA', 'Jalan Ontoseno, Wirobrajan, Kota Yogyakarta, Daerah Istimewa Yogyakarta', '085796256268', -7.8018882, 110.3502913, 'Wirobrajan', 'Kota Yogyakarta', 'Daerah Istimewa Yogyakarta', '55252', 428.69, 1, 1.00, 'Reguler', 31500.00, 945.00, 32445.00, 'Pending', 'Pending', 'bank_transfer', NULL, NULL, '2026-05-28 06:35:29', '2026-05-28 06:35:29', NULL, NULL, NULL, NULL, 'Customer', NULL),
(55, 'LSK995013506881', NULL, NULL, 'Nur Alia B', 'Gambir, Gambir, Jakarta Pusat', '085283751540', -6.1766346, 106.8279801, 'Gambir', 'Jakarta Pusat', NULL, '10110', 'WA ODE NUR ALIA', 'Jalan Ontoseno, Wirobrajan, Kota Yogyakarta, Daerah Istimewa Yogyakarta', '085796256268', -7.8018882, 110.3502913, 'Wirobrajan', 'Kota Yogyakarta', 'Daerah Istimewa Yogyakarta', '55252', 428.69, 1, 1.00, 'Reguler', 31500.00, 945.00, 32445.00, 'Pending', 'Pending', 'bank_transfer', NULL, NULL, '2026-05-28 06:35:35', '2026-05-28 06:35:35', NULL, NULL, NULL, NULL, 'Customer', NULL),
(56, 'LSK995020047315', NULL, NULL, 'haimanis b', 'Jalan Medan Merdeka Selatan, Gambir, Jakarta Pusat', '085283751540', -6.1778292, 106.8274642, 'Gambir', 'Jakarta Pusat', NULL, '10110', 'WA ODE NUR ALIA', 'Wirogunan, Kota Yogyakarta, Daerah Istimewa Yogyakarta', '085241510357', -7.8100515, 110.3751258, 'Wirogunan', 'Kota Yogyakarta', 'Daerah Istimewa Yogyakarta', '55151', 431.55, 1, 1.10, 'Reguler', 31800.00, 954.00, 32754.00, 'In Transit', 'Paid', 'bank_transfer', 'SBT-VA-1779950203042605', NULL, '2026-05-28 06:36:40', '2026-05-28 06:41:27', 1, 2, 2, NULL, 'Customer', 7),
(57, 'LSK997045662781', NULL, NULL, 'ricard rikardo', 'Ilir Barat I, Palembang, Sumatera Selatan', '085796256268', -2.9872365, 104.6982696, 'Ilir Barat I', 'Palembang', 'Sumatera Selatan', '30153', 'ricard lagi', 'Jalan Tembaan 2, Bubutan, Surabaya, Jawa Timur', '085241510357', -7.2468207, 112.7345292, 'Bubutan', 'Surabaya', 'Jawa Timur', '60174', 1008.02, 1, 1.00, 'Reguler', 60500.00, 1815.00, 62315.00, 'In Transit', 'Paid', 'bank_transfer', 'SBT-VA-1779970459740916', NULL, '2026-05-28 12:14:16', '2026-05-28 12:40:46', 10, 1, 1, NULL, 'Customer', 3),
(58, 'LSK998099231581', NULL, NULL, 'ricard rikardo 2', 'Samata, Gowa, Sulawesi Selatan', '085796256268', -5.2009725, 119.5013227, 'Samata', 'Gowa', 'Sulawesi Selatan', '92118', 'ricard lagi 2', 'Jalan Belawan, Gambir, Jakarta Pusat', '085796256268', -6.1763577, 106.8081304, 'Gambir', 'Jakarta Pusat', NULL, '10150', 1408.60, 1, 1.30, 'Reguler', 81100.00, 2433.00, 83533.00, 'Out For Delivery', 'Paid', 'bank_transfer', 'SBT-VA-1779980995209928', 3, '2026-05-28 15:09:52', '2026-05-28 15:38:35', 1, 1, 1, NULL, 'Customer', 1),
(59, 'LSK99819652475', NULL, NULL, 'ricard rikardo 3', 'Proyek, Bekasi, Jawa Barat', '085796256268', -6.2375660, 106.9906302, 'Proyek', 'Bekasi', 'Jawa Barat', '10350', 'WA ODE NUR ALIA', 'Batudulang, Nusa Tenggara Barat', '085241510357', -8.5979194, 117.2761215, 'Batudulang', NULL, 'Nusa Tenggara Barat', NULL, 1163.99, 1, 1.30, 'Reguler', 68800.00, 2064.00, 70864.00, 'Out For Delivery', 'Paid', 'bank_transfer', 'SBT-VA-1779981968407743', NULL, '2026-05-28 15:26:06', '2026-05-28 15:34:36', 1, 2, 2, NULL, 'Customer', 9),
(60, 'LSK998256012836', NULL, NULL, 'tes 4', 'Jalan Majapahit, Gambir, Jakarta Pusat', '085796256268', -6.1707447, 106.8236201, 'Gambir', 'Jakarta Pusat', NULL, '10110', 'tes 4', 'Jampelan, Getasan, Kabupaten Semarang, Jawa Tengah', '085796256268', -7.3782049, 110.4363001, 'Getasan', 'Kabupaten Semarang', 'Jawa Tengah', '50774', 420.89, 2, 0.90, 'Express', 51900.00, 1557.00, 53457.00, 'In Transit', 'Paid', 'bank_transfer', 'SBT-VA-1779982562229715', NULL, '2026-05-28 15:36:00', '2026-05-28 15:37:47', 1, 2, 1, NULL, 'Customer', 8),
(61, 'LSK020113197338', NULL, NULL, 'tes 5', 'Jalan Tanah Abang Timur, Gambir, Jakarta Pusat', '085796256268', -6.1768128, 106.8205049, 'Gambir', 'Jakarta Pusat', NULL, '10110', 'test 5', 'Gang Aki Udil, Cibaduyut, Kota Bandung, Jawa Barat', '085283751548', -6.9512680, 107.5960151, 'Cibaduyut', 'Kota Bandung', 'Jawa Barat', '40236', 121.47, 1, 1.00, 'Reguler', 16100.00, 483.00, 16583.00, 'Arrived at Destination Branch', 'Paid', 'bank_transfer', 'SBT-VA-1780201135002632', 5, '2026-05-31 04:18:51', '2026-05-31 04:21:19', 1, 2, 2, NULL, 'Customer', 2),
(62, 'LSK04884307981', 1, 'TEST-1780204884298', 'Test Sender', 'Jl Test Sender 1', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Test Receiver', 'Jl Test Receiver 2', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2.00, 'Reguler', 30000.00, 1500.00, 31500.00, 'Cancelled', 'Pending', 'bank_transfer', NULL, NULL, '2026-05-31 05:21:24', '2026-05-31 05:21:24', 1, 2, 1, NULL, 'Marketplace', NULL),
(63, 'LSK0488988836', 1, 'ORD-TOKOBAGUS-12345', 'Toko ABC', 'Jl. Sudirman No. 1, Jakarta', '081234567890', NULL, NULL, NULL, NULL, NULL, NULL, 'Budi Santoso', 'Jl. Asia Afrika No. 10, Bandung', '089876543210', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2.50, 'Express', 62500.00, 3125.00, 65625.00, 'Picked Up', 'Paid', 'bank_transfer', 'BANK-178020488988878', NULL, '2026-05-31 05:21:29', '2026-05-31 05:21:29', NULL, NULL, NULL, NULL, 'Customer', NULL),
(64, 'LSK28649206736', 1, 'TB-1780228649202', 'TokoBagus Official', 'Jl. Gatot Subroto No.12, Jakarta Selatan, 12190', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Andi Susanto', 'Jl. Asia Afrika No. 10, Bandung, Jawa Barat', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1.50, 'Reguler', 22500.00, 1125.00, 23625.00, 'Delivered', 'Pending', 'bank_transfer', NULL, NULL, '2026-05-31 11:57:29', '2026-05-31 12:02:19', 1, 2, 1, NULL, 'Marketplace', NULL),
(65, 'LSK022930990929', NULL, NULL, 'test 6', 'Mampang Prapatan, Jakarta Selatan', '085241510357', -6.2424957, 106.8336229, 'Mampang Prapatan', 'Jakarta Selatan', NULL, '17431', 'test 6', 'Jamika, Kota Bandung, Jawa Barat', '085283751540', -6.9215797, 107.5916367, 'Jamika', 'Kota Bandung', 'Jawa Barat', '40181', 112.75, 1, 1.00, 'Reguler', 15700.00, 471.00, 16171.00, 'Delivered', 'Paid', 'bank_transfer', 'SBT-VA-1780229313133329', 5, '2026-05-31 12:08:29', '2026-05-31 12:23:57', 1, 2, 2, NULL, 'Customer', 2),
(66, 'LSK30117898441', 1, 'TEST-1780230117888', 'Test Sender', 'Jl Test Sender 1', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Test Receiver', 'Jl Test Receiver 2', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2.00, 'Reguler', 30000.00, 1500.00, 31500.00, 'Cancelled', 'Pending', 'bank_transfer', NULL, NULL, '2026-05-31 12:21:57', '2026-05-31 12:21:57', 1, 2, 1, NULL, 'Marketplace', NULL),
(67, 'LSK30124026460', 1, 'ORD-TOKOBAGUS-12345', 'Toko ABC', 'Jl. Sudirman No. 1, Jakarta', '081234567890', NULL, NULL, NULL, NULL, NULL, NULL, 'Budi Santoso', 'Jl. Asia Afrika No. 10, Bandung', '089876543210', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2.50, 'Express', 62500.00, 3125.00, 65625.00, 'Picked Up', 'Paid', 'bank_transfer', 'BANK-1780230124025551', NULL, '2026-05-31 12:22:04', '2026-05-31 12:22:04', NULL, NULL, NULL, NULL, 'Customer', NULL),
(68, 'LSK31518753841', 1, 'TEST-1780231518748', 'Test Sender', 'Jl Test Sender 1', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Test Receiver', 'Jl Test Receiver 2', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2.00, 'Reguler', 30000.00, 1500.00, 31500.00, 'Cancelled', 'Pending', 'bank_transfer', NULL, NULL, '2026-05-31 12:45:18', '2026-05-31 12:45:18', 1, 2, 1, NULL, 'Marketplace', NULL),
(69, 'LSK31521878739', 1, 'ORD-TOKOBAGUS-12345', 'Toko ABC', 'Jl. Sudirman No. 1, Jakarta', '081234567890', NULL, NULL, NULL, NULL, NULL, NULL, 'Budi Santoso', 'Jl. Asia Afrika No. 10, Bandung', '089876543210', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2.50, 'Express', 62500.00, 3125.00, 65625.00, 'Picked Up', 'Paid', 'bank_transfer', 'BANK-1780231521878617', NULL, '2026-05-31 12:45:21', '2026-05-31 12:45:21', NULL, NULL, NULL, NULL, 'Customer', NULL),
(70, 'LSK023414032224', NULL, NULL, 'test 6', 'Jalan Medan Merdeka Barat, Gambir, Jakarta Pusat', '085241510357', -6.1768128, 106.8232130, 'Gambir', 'Jakarta Pusat', NULL, '10110', 'test 6', 'Proyek, Bekasi, Jawa Barat', '085283751548', -6.2375660, 106.9872286, 'Proyek', 'Bekasi', 'Jawa Barat', '10350', 19.35, 3, 1.00, 'Express', 33000.00, 990.00, 33990.00, 'Pending', 'Pending', 'bank_transfer', NULL, NULL, '2026-05-31 13:29:00', '2026-05-31 13:29:00', 1, 1, 1, NULL, 'Customer', 1),
(71, 'LSK023418324817', NULL, NULL, 'test 6', 'Kebon Jeruk, Jakarta Barat', '085241510357', -6.1885696, 106.7828717, 'Kebon Jeruk', 'Jakarta Barat', NULL, '11480', 'test 6', 'Cakung, Jakarta Timur', '085283751540', -6.1815914, 106.9535464, 'Cakung', 'Jakarta Timur', NULL, '13910', 18.88, 1, 1.00, 'Reguler', 11000.00, 330.00, 11330.00, 'Pending', 'Pending', 'bank_transfer', NULL, NULL, '2026-05-31 13:29:43', '2026-05-31 13:29:43', 1, 1, 1, NULL, 'Customer', 1),
(72, 'LSK023419537787', NULL, NULL, 'test 6', 'Kebon Jeruk, Jakarta Barat', '085241510357', -6.1885696, 106.7828717, 'Kebon Jeruk', 'Jakarta Barat', NULL, '11480', 'test 6', 'Cakung, Jakarta Timur', '085283751540', -6.1815914, 106.9535464, 'Cakung', 'Jakarta Timur', NULL, '13910', 18.88, 1, 1.00, 'Reguler', 11000.00, 330.00, 11330.00, 'Pending', 'Paid', 'bank_transfer', 'SBT-VA-1780234199370371', NULL, '2026-05-31 13:29:55', '2026-05-31 13:29:59', 1, 1, 1, NULL, 'Customer', 1),
(73, 'LSK023423724292', NULL, NULL, 'test 6', 'Jalan Medan Merdeka Selatan, Gambir, Jakarta Pusat', '085241510357', -6.1784057, 106.8259706, 'Gambir', 'Jakarta Pusat', NULL, '10110', 'test 6', 'Jalan Terusan Brigjend Katamso, Cikutra, Kota Bandung, Jawa Barat', '085283751548', -6.9052200, 107.6358535, 'Cikutra', 'Kota Bandung', 'Jawa Barat', '40124', 120.57, 1, 1.00, 'Reguler', 16100.00, 483.00, 16583.00, 'Pending', 'Pending', 'bank_transfer', NULL, NULL, '2026-05-31 13:30:37', '2026-05-31 13:30:37', 1, 2, 1, NULL, 'Customer', 2),
(74, 'LSK34443770599', 1, 'TEST-1780234443766', 'Test Sender', 'Jl Test Sender 1', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Test Receiver', 'Jl Test Receiver 2', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2.00, 'Reguler', 30000.00, 1500.00, 31500.00, 'Cancelled', 'Pending', 'bank_transfer', NULL, NULL, '2026-05-31 13:34:03', '2026-05-31 13:34:03', 1, 2, 1, NULL, 'Marketplace', NULL),
(75, 'LSK34447971239', 1, 'ORD-TOKOBAGUS-12345', 'Toko ABC', 'Jl. Sudirman No. 1, Jakarta', '081234567890', NULL, NULL, NULL, NULL, NULL, NULL, 'Budi Santoso', 'Jl. Asia Afrika No. 10, Bandung', '089876543210', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2.50, 'Express', 62500.00, 3125.00, 65625.00, 'Picked Up', 'Paid', 'bank_transfer', 'BANK-1780234447970533', NULL, '2026-05-31 13:34:07', '2026-05-31 13:34:08', NULL, NULL, NULL, NULL, 'Customer', NULL),
(76, 'LSK023448612876', NULL, NULL, 'test 6', 'Tanah Abang, Jakarta Pusat', '085241510357', -6.1857632, 106.8126674, 'Tanah Abang', 'Jakarta Pusat', NULL, '10250', 'test 6', 'Lebaksiuh, Sumedang, Jawa Barat', '085283751540', -6.8615914, 108.1467055, 'Lebaksiuh', 'Sumedang', 'Jawa Barat', NULL, 165.43, 1, 1.00, 'Reguler', 18300.00, 549.00, 18849.00, 'Pending', 'Pending', 'bank_transfer', NULL, NULL, '2026-05-31 13:34:46', '2026-05-31 13:34:46', 1, 2, 1, NULL, 'Customer', 2),
(77, 'LSK023449385182', NULL, NULL, 'test 6', 'Tanah Abang, Jakarta Pusat', '085241510357', -6.1857632, 106.8126674, 'Tanah Abang', 'Jakarta Pusat', NULL, '10250', 'test 6', 'Lebaksiuh, Sumedang, Jawa Barat', '085283751540', -6.8615914, 108.1467055, 'Lebaksiuh', 'Sumedang', 'Jawa Barat', NULL, 165.43, 1, 1.00, 'Reguler', 18300.00, 549.00, 18849.00, 'Pending', 'Pending', 'bank_transfer', NULL, NULL, '2026-05-31 13:34:53', '2026-05-31 13:34:53', 1, 2, 1, NULL, 'Customer', 2),
(78, 'LSK023450491863', NULL, NULL, 'test 6', 'Tanah Abang, Jakarta Pusat', '085241510357', -6.1857632, 106.8126674, 'Tanah Abang', 'Jakarta Pusat', NULL, '10250', 'test 6', 'Lebaksiuh, Sumedang, Jawa Barat', '085283751540', -6.8615914, 108.1467055, 'Lebaksiuh', 'Sumedang', 'Jawa Barat', NULL, 165.43, 1, 1.00, 'Reguler', 18300.00, 549.00, 18849.00, 'Pending', 'Pending', 'bank_transfer', NULL, NULL, '2026-05-31 13:35:04', '2026-05-31 13:35:04', 1, 2, 1, NULL, 'Customer', 2),
(79, 'LSK46600205384', 1, 'ORD-TOKOBAGUS-12345', 'Toko ABC', 'Jl. Sudirman No. 1, Jakarta', '081234567890', NULL, NULL, NULL, NULL, NULL, NULL, 'Budi Santoso', 'Jl. Asia Afrika No. 10, Bandung', '089876543210', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2.50, 'Express', 62500.00, 3125.00, 65625.00, 'Picked Up', 'Paid', 'bank_transfer', 'BANK-1780246600204182', NULL, '2026-05-31 16:56:40', '2026-05-31 16:56:40', NULL, NULL, NULL, NULL, 'Customer', NULL),
(80, 'LSK024807045059', NULL, NULL, 'test 6', 'Jalan Medan Merdeka Barat, Gambir, Jakarta Pusat', '085283751548', -6.1754475, 106.8239027, 'Gambir', 'Jakarta Pusat', NULL, '10110', 'test 6', 'Jalan Persatuan Cijerah Wetan, Cijerah, Kota Bandung, Jawa Barat', '085283751548', -6.9294563, 107.5637164, 'Cijerah', 'Kota Bandung', 'Jawa Barat', '40213', 117.08, 1, 1.30, 'Reguler', 16500.00, 495.00, 16995.00, 'Pending', 'Pending', 'bank_transfer', NULL, NULL, '2026-05-31 17:21:10', '2026-05-31 17:21:10', 1, 2, 1, NULL, 'Customer', 2),
(81, 'LSK024808999684', NULL, NULL, 'test 6', 'Jalan Medan Merdeka Barat, Gambir, Jakarta Pusat', '085283751548', -6.1754475, 106.8239027, 'Gambir', 'Jakarta Pusat', NULL, '10110', 'test 6', 'Jalan Persatuan Cijerah Wetan, Cijerah, Kota Bandung, Jawa Barat', '085283751548', -6.9294563, 107.5637164, 'Cijerah', 'Kota Bandung', 'Jawa Barat', '40213', 117.08, 1, 1.30, 'Reguler', 16500.00, 495.00, 16995.00, 'Arrived at Destination Branch', 'Paid', 'bank_transfer', 'SBT-VA-1780248093257991', 43, '2026-05-31 17:21:30', '2026-05-31 17:26:03', 1, 2, 2, NULL, 'Customer', 2);

-- --------------------------------------------------------

--
-- Table structure for table `shipment_transit_legs`
--

CREATE TABLE `shipment_transit_legs` (
  `id` int NOT NULL,
  `shipment_id` int NOT NULL,
  `awb_number` varchar(30) NOT NULL,
  `leg_order` int NOT NULL,
  `from_branch_id` int NOT NULL,
  `to_branch_id` int NOT NULL,
  `assigned_kurir_id` int DEFAULT NULL,
  `status` enum('Pending','In Progress','Completed') DEFAULT 'Pending',
  `started_at` timestamp NULL DEFAULT NULL,
  `completed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `shipment_transit_legs`
--

INSERT INTO `shipment_transit_legs` (`id`, `shipment_id`, `awb_number`, `leg_order`, `from_branch_id`, `to_branch_id`, `assigned_kurir_id`, `status`, `started_at`, `completed_at`, `created_at`) VALUES
(9, 56, 'LSK995020047315', 1, 1, 2, 3, 'Completed', '2026-05-28 06:39:07', '2026-05-28 06:40:27', '2026-05-28 06:36:43'),
(10, 56, 'LSK995020047315', 2, 2, 8, NULL, 'Pending', NULL, NULL, '2026-05-28 06:36:43'),
(11, 56, 'LSK995020047315', 3, 8, 7, NULL, 'Pending', NULL, NULL, '2026-05-28 06:36:43'),
(12, 57, 'LSK997045662781', 1, 10, 1, 50, 'Completed', '2026-05-28 12:25:59', '2026-05-28 12:27:53', '2026-05-28 12:14:19'),
(13, 57, 'LSK997045662781', 2, 1, 2, NULL, 'Pending', NULL, NULL, '2026-05-28 12:14:19'),
(14, 57, 'LSK997045662781', 3, 2, 8, NULL, 'Pending', NULL, NULL, '2026-05-28 12:14:19'),
(15, 57, 'LSK997045662781', 4, 8, 3, NULL, 'Pending', NULL, NULL, '2026-05-28 12:14:19'),
(16, 58, 'LSK998099231581', 1, 1, 1, NULL, 'Pending', NULL, NULL, '2026-05-28 15:09:55'),
(17, 59, 'LSK99819652475', 1, 1, 2, 3, 'Completed', '2026-05-28 15:33:06', '2026-05-28 15:34:06', '2026-05-28 15:26:09'),
(18, 59, 'LSK99819652475', 2, 2, 8, NULL, 'Pending', NULL, NULL, '2026-05-28 15:26:09'),
(19, 59, 'LSK99819652475', 3, 8, 3, NULL, 'Pending', NULL, NULL, '2026-05-28 15:26:09'),
(20, 59, 'LSK99819652475', 4, 3, 9, NULL, 'Pending', NULL, NULL, '2026-05-28 15:26:09'),
(21, 60, 'LSK998256012836', 1, 1, 2, NULL, 'Pending', NULL, NULL, '2026-05-28 15:36:02'),
(22, 60, 'LSK998256012836', 2, 2, 8, NULL, 'Pending', NULL, NULL, '2026-05-28 15:36:02'),
(23, 61, 'LSK020113197338', 1, 1, 2, 3, 'Completed', '2026-05-31 04:20:41', '2026-05-31 04:21:19', '2026-05-31 04:18:55'),
(24, 65, 'LSK022930990929', 1, 1, 2, 3, 'Completed', '2026-05-31 12:10:16', '2026-05-31 12:10:51', '2026-05-31 12:08:33'),
(25, 72, 'LSK023419537787', 1, 1, 1, NULL, 'Pending', NULL, NULL, '2026-05-31 13:29:59'),
(26, 81, 'LSK024808999684', 1, 1, 2, 3, 'Completed', '2026-05-31 17:25:21', '2026-05-31 17:26:03', '2026-05-31 17:21:33');

-- --------------------------------------------------------

--
-- Table structure for table `shipment_webhooks`
--

CREATE TABLE `shipment_webhooks` (
  `id` int NOT NULL,
  `shipment_id` int NOT NULL,
  `partner_id` int NOT NULL,
  `event` varchar(50) NOT NULL,
  `payload` text,
  `response_status` int DEFAULT NULL,
  `success` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `shipping_rates`
--

CREATE TABLE `shipping_rates` (
  `id` int NOT NULL,
  `rate_name` varchar(50) NOT NULL,
  `base_price` decimal(12,2) NOT NULL DEFAULT '0.00',
  `price_per_km` decimal(12,2) NOT NULL DEFAULT '0.00',
  `price_per_kg` decimal(12,2) NOT NULL DEFAULT '0.00',
  `min_distance` decimal(10,2) DEFAULT '0.00',
  `max_distance` decimal(10,2) DEFAULT NULL,
  `estimasi` varchar(30) NOT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `shipping_rates`
--

INSERT INTO `shipping_rates` (`id`, `rate_name`, `base_price`, `price_per_km`, `price_per_kg`, `min_distance`, `max_distance`, `estimasi`, `is_active`, `created_at`) VALUES
(1, 'Reguler', 8000.00, 50.00, 2000.00, 0.00, NULL, '2-4 Hari', 1, '2026-05-23 15:45:10'),
(2, 'Express', 15000.00, 80.00, 3500.00, 0.00, NULL, '1-2 Hari', 1, '2026-05-23 15:45:10'),
(3, 'Same Day', 25000.00, 150.00, 5000.00, 0.00, 50.00, '6-12 Jam', 1, '2026-05-23 15:45:10');

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
(1, 'Jakarta', 'Bandung', 15000.00, 25000.00, '2-3 Hari', '1 Hari', '2026-05-23 15:13:02'),
(2, 'Jakarta', 'Surabaya', 25000.00, 40000.00, '3-4 Hari', '1-2 Hari', '2026-05-23 15:13:02'),
(3, 'Bandung', 'Semarang', 20000.00, 35000.00, '2-3 Hari', '1 Hari', '2026-05-23 15:13:02'),
(4, 'Jakarta', 'Yogyakarta', 22000.00, 38000.00, '3-4 Hari', '1-2 Hari', '2026-05-23 15:13:02'),
(5, 'Surabaya', 'Bali', 18000.00, 30000.00, '2-3 Hari', '1 Hari', '2026-05-23 15:13:02'),
(6, 'Jakarta', 'Medan', 35000.00, 55000.00, '4-5 Hari', '2 Hari', '2026-05-23 15:13:02'),
(7, 'Bandung', 'Surabaya', 22000.00, 38000.00, '3-4 Hari', '1-2 Hari', '2026-05-23 15:13:02'),
(8, 'Semarang', 'Yogyakarta', 12000.00, 20000.00, '1-2 Hari', '1 Hari', '2026-05-23 15:13:02');

-- --------------------------------------------------------

--
-- Table structure for table `tracking_logs`
--

CREATE TABLE `tracking_logs` (
  `id` int NOT NULL,
  `awb_number` varchar(30) NOT NULL,
  `status` varchar(100) NOT NULL,
  `description` text,
  `location` varchar(100) DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `branch_id` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `tracking_logs`
--

INSERT INTO `tracking_logs` (`id`, `awb_number`, `status`, `description`, `location`, `updated_by`, `created_at`, `branch_id`) VALUES
(1, 'LSK20260501001', 'Pending', 'Pesanan diterima dari mitra', 'Jakarta', 1, '2026-05-23 15:13:02', NULL),
(2, 'LSK20260501001', 'Picked Up', 'Paket diambil oleh kurir', 'Jakarta', 3, '2026-05-23 15:13:02', NULL),
(3, 'LSK20260501001', 'In Transit', 'Paket dalam perjalanan ke kota tujuan', 'Bandung', 3, '2026-05-23 15:13:02', NULL),
(4, 'LSK20260501001', 'Delivered', 'Paket berhasil diterima oleh penerima', 'Bandung', 3, '2026-05-23 15:13:02', NULL),
(5, 'LSK20260501002', 'Pending', 'Pesanan diterima dari mitra', 'Jakarta', 1, '2026-05-23 15:13:02', NULL),
(6, 'LSK20260501002', 'Picked Up', 'Paket diambil oleh kurir', 'Jakarta', 4, '2026-05-23 15:13:02', NULL),
(7, 'LSK20260501002', 'In Transit', 'Paket dalam perjalanan ke kota tujuan', 'Surabaya', 4, '2026-05-23 15:13:02', NULL),
(8, 'LSK20260501002', 'Delivered', 'Paket berhasil diterima oleh penerima', 'Surabaya', 4, '2026-05-23 15:13:02', NULL),
(9, 'LSK20260502003', 'Pending', 'Pesanan diterima dari mitra', 'Jakarta', 1, '2026-05-23 15:13:02', NULL),
(10, 'LSK20260502003', 'Picked Up', 'Paket diambil oleh kurir', 'Jakarta', 5, '2026-05-23 15:13:02', NULL),
(11, 'LSK20260502003', 'In Transit', 'Paket dalam perjalanan ke kota tujuan', 'Yogyakarta', 5, '2026-05-23 15:13:02', NULL),
(12, 'LSK20260503006', 'Pending', 'Pesanan diterima dari mitra', 'Jakarta', 1, '2026-05-23 15:13:02', NULL),
(13, 'LSK20260503006', 'Picked Up', 'Paket diambil oleh kurir', 'Jakarta', 6, '2026-05-23 15:13:02', NULL),
(14, 'LSK20260503006', 'In Transit', 'Paket dalam perjalanan ke kota tujuan', 'Bandung', 6, '2026-05-23 15:13:02', NULL),
(15, 'LSK20260503006', 'Failed', 'Pengiriman gagal: alamat tidak ditemukan', 'Bandung', 6, '2026-05-23 15:13:02', NULL),
(16, 'LSK20260501008', 'Pending', 'Pesanan diterima dari mitra', 'Bandung', 1, '2026-05-23 15:13:02', NULL),
(17, 'LSK20260501008', 'Picked Up', 'Paket diambil oleh kurir', 'Bandung', 4, '2026-05-23 15:13:02', NULL),
(18, 'LSK20260501008', 'In Transit', 'Paket dalam perjalanan ke kota tujuan', 'Semarang', 4, '2026-05-23 15:13:02', NULL),
(19, 'LSK20260501008', 'Delivered', 'Paket berhasil diterima oleh penerima', 'Semarang', 4, '2026-05-23 15:13:02', NULL),
(20, 'LSK20260501015', 'Pending', 'Pesanan diterima dari mitra', 'Surabaya', 1, '2026-05-23 15:13:02', NULL),
(21, 'LSK20260501015', 'Picked Up', 'Paket diambil oleh kurir', 'Surabaya', 5, '2026-05-23 15:13:02', NULL),
(22, 'LSK20260501015', 'In Transit', 'Paket dalam perjalanan ke kota tujuan', 'Bali', 5, '2026-05-23 15:13:02', NULL),
(23, 'LSK20260501015', 'Delivered', 'Paket berhasil diterima oleh penerima', 'Bali', 5, '2026-05-23 15:13:02', NULL),
(24, 'LSK955178651484', 'Pending', 'Pesanan berhasil dibuat, menunggu pembayaran', 'Jakarta', NULL, '2026-05-23 15:56:26', NULL),
(25, 'LSK955178651484', 'Pending', 'Pembayaran Transfer Bank berhasil dikonfirmasi', 'Sistem Pembayaran', NULL, '2026-05-23 15:56:26', NULL),
(26, 'LSK955178651484', 'Picked Up', 'Paket diambil kurir dari gudang Jakarta', 'Jakarta Selatan', NULL, '2026-05-23 15:56:26', NULL),
(27, 'LSK955225267412', 'Pending', 'Pesanan berhasil dibuat, menunggu pembayaran', 'Jakarta Selatan', NULL, '2026-05-23 16:04:12', NULL),
(28, 'LSK955225267412', 'Pending', 'Pembayaran E-Wallet berhasil dikonfirmasi', 'Sistem Pembayaran', NULL, '2026-05-23 16:04:14', NULL),
(29, 'LSK959809849483', 'Pending', 'Pesanan berhasil dibuat, menunggu pembayaran', 'Jakarta Selatan', NULL, '2026-05-24 04:48:18', NULL),
(30, 'LSK959809849483', 'Pending', 'Pembayaran Transfer Bank berhasil dikonfirmasi', 'Sistem Pembayaran', NULL, '2026-05-24 04:48:20', NULL),
(31, 'LSK959809849483', 'Arrived at Branch', 'Paket di-scan di cabang dengan status Arrived at Branch', NULL, 8, '2026-05-24 04:48:49', 1),
(32, 'LSK20260503005', 'Picked Up', 'Paket telah diambil oleh kurir', NULL, 3, '2026-05-24 04:55:47', NULL),
(33, 'LSK955225267412', 'Picked Up', 'Paket telah diambil oleh kurir', NULL, 3, '2026-05-24 04:59:19', NULL),
(34, 'LSK20260502003', 'Arrived at Branch', 'Paket tiba di cabang transit: Cabang Utama Denpasar (Denpasar)', NULL, 5, '2026-05-24 06:18:20', 9),
(35, 'LSK20260503011', 'Picked Up', 'Paket diambil kurir untuk transit ke cabang berikutnya', NULL, 5, '2026-05-24 06:18:57', 2),
(36, 'LSK20260503011', 'Arrived at Branch', 'Paket tiba dan diterima di cabang.', NULL, 9, '2026-05-24 06:22:21', 2),
(37, 'LSK20260505013', 'Picked Up', 'Paket diambil kurir untuk transit ke cabang berikutnya', NULL, 5, '2026-05-24 06:22:51', 2),
(38, 'LSK20260505013', 'In Transit', 'Paket sedang dibawa kurir menuju Cabang Utama Jakarta (Jakarta)', NULL, 5, '2026-05-24 06:23:07', 2),
(39, 'LSK20260505013', 'Arrived at Branch', 'Paket tiba di cabang transit: Cabang Utama Jakarta (Jakarta)', NULL, 5, '2026-05-24 06:23:14', 1),
(40, 'LSK20260504007', 'Arrived at Branch', 'Paket tiba di cabang transit. Menunggu diteruskan ke cabang berikutnya.', NULL, 8, '2026-05-24 06:24:40', 1),
(41, 'LSK959809849483', 'Picked Up', 'Paket diambil kurir untuk transit ke cabang berikutnya', NULL, 4, '2026-05-24 06:26:18', 1),
(42, 'LSK959809849483', 'In Transit', 'Paket sedang dibawa kurir menuju Cabang Utama Surabaya (Surabaya)', NULL, 4, '2026-05-24 06:27:04', 1),
(43, 'LSK959809849483', 'Arrived at Branch', 'Paket tiba di cabang transit: Cabang Utama Surabaya (Surabaya)', NULL, 4, '2026-05-24 06:27:18', 3),
(44, 'LSK959809849483', 'Picked Up', 'Paket diambil kurir untuk transit ke cabang berikutnya', NULL, 46, '2026-05-24 06:42:26', 3),
(45, 'LSK20260504018', 'Picked Up', 'Paket diambil kurir untuk transit ke cabang berikutnya', NULL, 46, '2026-05-24 06:42:44', 3),
(46, 'LSK20260504018', 'In Transit', 'Paket sedang dibawa kurir menuju cabang tujuan', NULL, 46, '2026-05-24 06:43:35', 3),
(47, 'LSK959809849483', 'In Transit', 'Paket sedang dibawa kurir menuju cabang tujuan', NULL, 46, '2026-05-24 06:46:07', 3),
(48, 'LSK959809849483', 'Waiting Branch Confirmation', 'Paket tiba di cabang. Menunggu konfirmasi operator cabang.', NULL, 46, '2026-05-24 06:50:26', NULL),
(49, 'LSK20260504018', 'Waiting Branch Confirmation', 'Paket tiba di Cabang Utama Denpasar (Denpasar). Menunggu konfirmasi operator cabang.', NULL, 46, '2026-05-24 06:50:31', 9),
(50, 'LSK960553688156', 'Pending', 'Pesanan berhasil dibuat, menunggu pembayaran', 'Jakarta Timur', NULL, '2026-05-24 06:52:16', NULL),
(51, 'LSK960553688156', 'Pending', 'Pembayaran Cash on Delivery berhasil dikonfirmasi', 'Sistem Pembayaran', NULL, '2026-05-24 06:52:18', NULL),
(52, 'LSK960582653729', 'Pending', 'Pesanan berhasil dibuat, menunggu pembayaran', 'Kota Bandung', NULL, '2026-05-24 06:57:06', NULL),
(53, 'LSK960582653729', 'Pending', 'Pembayaran Cash on Delivery berhasil dikonfirmasi', 'Sistem Pembayaran', NULL, '2026-05-24 06:57:08', NULL),
(54, 'LSK960598161729', 'Pending', 'Pesanan berhasil dibuat, menunggu pembayaran', 'Jakarta Pusat', NULL, '2026-05-24 06:59:41', NULL),
(55, 'LSK960598161729', 'Pending', 'Pembayaran Transfer Bank berhasil dikonfirmasi', 'Sistem Pembayaran', NULL, '2026-05-24 06:59:43', NULL),
(56, 'LSK96060263874', 'Pending', 'Pesanan berhasil dibuat, menunggu pembayaran', 'Jakarta Pusat', NULL, '2026-05-24 07:00:26', NULL),
(57, 'LSK96060263874', 'Pending', 'Pembayaran Transfer Bank berhasil dikonfirmasi', 'Sistem Pembayaran', NULL, '2026-05-24 07:00:27', NULL),
(58, 'LSK20260503017', 'In Transit', 'Paket sedang dibawa kurir menuju Cabang Utama Denpasar (Denpasar)', NULL, 4, '2026-05-24 07:22:38', 1),
(59, 'LSK20260503017', 'Waiting Branch Confirmation', 'Paket tiba di Cabang Utama Denpasar (Denpasar). Menunggu konfirmasi operator cabang.', NULL, 4, '2026-05-24 07:22:49', 9),
(60, 'LSK20260505013', 'Picked Up', 'Paket diambil kurir untuk transit ke cabang berikutnya', NULL, 4, '2026-05-24 07:23:20', 1),
(61, 'LSK20260505013', 'In Transit', 'Paket sedang dibawa kurir menuju Cabang Utama Yogyakarta (Yogyakarta)', NULL, 4, '2026-05-24 07:23:31', 1),
(62, 'LSK20260505013', 'Waiting Branch Confirmation', 'Paket tiba di Cabang Utama Yogyakarta (Yogyakarta). Menunggu konfirmasi operator cabang.', NULL, 4, '2026-05-24 07:23:37', 7),
(63, 'LSK960762593374', 'Pending', 'Pesanan berhasil dibuat, menunggu pembayaran', 'Jakarta Pusat', NULL, '2026-05-24 07:27:05', NULL),
(64, 'LSK960762593374', 'Pending', 'Pembayaran Transfer Bank berhasil dikonfirmasi', 'Sistem Pembayaran', NULL, '2026-05-24 07:27:07', NULL),
(65, 'LSK961014067559', 'Pending', 'Pesanan berhasil dibuat, menunggu pembayaran', 'Jakarta Pusat', NULL, '2026-05-24 08:09:00', NULL),
(66, 'LSK961014067559', 'Pending', 'Pembayaran Transfer Bank berhasil dikonfirmasi', 'Sistem Pembayaran', NULL, '2026-05-24 08:09:02', NULL),
(67, 'LSK961014067559', 'In Transit', 'Status diupdate ke In Transit', NULL, 1, '2026-05-24 08:34:17', NULL),
(68, 'LSK961222518157', 'Pending', 'Pesanan berhasil dibuat, menunggu pembayaran', 'Jakarta Pusat', NULL, '2026-05-24 08:43:45', NULL),
(69, 'LSK961223196698', 'Pending', 'Pesanan berhasil dibuat, menunggu pembayaran', 'Jakarta Pusat', NULL, '2026-05-24 08:43:51', NULL),
(70, 'LSK961223794922', 'Pending', 'Pesanan berhasil dibuat, menunggu pembayaran', 'Jakarta Pusat', NULL, '2026-05-24 08:43:57', NULL),
(71, 'LSK14928729413', 'Pending', 'Pesanan diterima dari API Marketplace', 'Jakarta', NULL, '2026-05-24 09:28:48', NULL),
(72, 'LSK15129747173', 'Pending', 'Pesanan diterima dari API Marketplace', 'Jakarta', NULL, '2026-05-24 09:32:09', NULL),
(73, 'LSK15209663111', 'Pending', 'Pesanan diterima dari API Marketplace', 'Jakarta', NULL, '2026-05-24 09:33:29', NULL),
(74, 'LSK15209663111', 'Cancelled', 'Pengiriman dibatalkan oleh partner', 'Sistem', NULL, '2026-05-24 09:33:29', NULL),
(75, 'LSK16346373678', 'Pending', 'Pesanan diterima dari API Marketplace', 'Jakarta', NULL, '2026-05-24 09:52:26', NULL),
(76, 'LSK16346373678', 'Cancelled', 'Pengiriman dibatalkan oleh partner', 'Sistem', NULL, '2026-05-24 09:52:26', NULL),
(77, 'LSK961704195850', 'Pending', 'Pesanan berhasil dibuat, menunggu pembayaran', 'Kab Serang', NULL, '2026-05-24 10:04:01', NULL),
(78, 'LSK961704859781', 'Pending', 'Pesanan berhasil dibuat, menunggu pembayaran', 'Kab Serang', NULL, '2026-05-24 10:04:08', NULL),
(79, 'LSK961706020557', 'Pending', 'Pesanan berhasil dibuat, menunggu pembayaran', 'Kab Serang', NULL, '2026-05-24 10:04:20', NULL),
(80, 'LSK961706983231', 'Pending', 'Pesanan berhasil dibuat, menunggu pembayaran', 'Kab Serang', NULL, '2026-05-24 10:04:29', NULL),
(81, 'LSK17116745785', 'Pending', 'Pesanan diterima dari API Marketplace', 'Jakarta', NULL, '2026-05-24 10:05:16', NULL),
(82, 'LSK17116745785', 'Cancelled', 'Pengiriman dibatalkan oleh partner', 'Sistem', NULL, '2026-05-24 10:05:16', NULL),
(83, 'LSK17123010986', 'Pending', 'Pesanan diterima dari API Marketplace', 'Jakarta', NULL, '2026-05-24 10:05:23', NULL),
(84, 'LSK17123010986', 'Cancelled', 'Pengiriman dibatalkan oleh partner', 'Sistem', NULL, '2026-05-24 10:05:23', NULL),
(85, 'LSK17135703769', 'Pending', 'Pesanan diterima dari API Marketplace', 'Jakarta', NULL, '2026-05-24 10:05:35', NULL),
(86, 'LSK17135703769', 'Cancelled', 'Pengiriman dibatalkan oleh partner', 'Sistem', NULL, '2026-05-24 10:05:35', NULL),
(87, 'LSK961715750043', 'Pending', 'Pesanan berhasil dibuat, menunggu pembayaran', 'Kab Serang', NULL, '2026-05-24 10:05:57', NULL),
(88, 'LSK961716382579', 'Pending', 'Pesanan berhasil dibuat, menunggu pembayaran', 'Kab Serang', NULL, '2026-05-24 10:06:03', NULL),
(89, 'LSK961734558765', 'Pending', 'Pesanan berhasil dibuat, menunggu pembayaran', 'Jakarta Pusat', NULL, '2026-05-24 10:09:05', NULL),
(90, 'LSK961734558765', 'Picked Up', 'Pembayaran via API Gateway External berhasil dikonfirmasi. Status: Diproses.', 'Jakarta Pusat', NULL, '2026-05-24 10:09:09', NULL),
(91, 'LSK961734558765', 'Arrived at Branch', 'Paket tiba dan diterima di cabang.', NULL, 8, '2026-05-24 10:21:22', 1),
(92, 'LSK961734558765', 'Picked Up', 'Paket diambil kurir untuk transit ke cabang berikutnya', NULL, 4, '2026-05-24 10:23:22', 1),
(93, 'LSK961734558765', 'In Transit', 'Paket sedang dibawa kurir menuju cabang tujuan', NULL, 4, '2026-05-24 10:23:35', 1),
(94, 'LSK961734558765', 'Waiting Branch Confirmation', 'Paket tiba di cabang. Menunggu konfirmasi operator cabang.', NULL, 4, '2026-05-24 10:23:46', NULL),
(95, 'LSK961734558765', 'Out For Delivery', 'Paket dibawa oleh kurir menuju alamat tujuan.', NULL, 8, '2026-05-24 10:24:14', 1),
(96, 'LSK961838763794', 'Pending', 'Pesanan berhasil dibuat, menunggu pembayaran', 'Subang', NULL, '2026-05-24 10:26:27', NULL),
(97, 'LSK961838763794', 'Pending', 'Pembayaran via Simulasi SmartBank berhasil dikonfirmasi. Status: Pending Pickup.', 'Subang', NULL, '2026-05-24 10:26:31', NULL),
(98, 'LSK961838763794', 'Arrived at Branch', 'Paket tiba dan diterima di cabang.', NULL, 9, '2026-05-24 10:29:35', 2),
(99, 'LSK961838763794', 'Out For Delivery', 'Paket dibawa oleh kurir menuju alamat tujuan.', NULL, 9, '2026-05-24 10:30:43', 2),
(100, 'LSK961838763794', 'Delivered', 'Paket berhasil dikirim. Diterima oleh: andi', NULL, 5, '2026-05-24 10:32:38', 2),
(101, 'LSK49127285245', 'Pending', 'Pesanan diterima dan pembayaran terkonfirmasi', 'Gudang LogistiKita', NULL, '2026-05-28 06:18:47', NULL),
(102, 'LSK49137098113', 'Pending', 'Pesanan diterima dan pembayaran terkonfirmasi', 'Gudang LogistiKita', NULL, '2026-05-28 06:18:57', NULL),
(103, 'LSK49137098113', 'Picked Up', 'Kurir telah menjemput paket', 'Gudang Jakarta Pusat', 1, '2026-05-28 06:18:57', NULL),
(104, 'LSK994970636478', 'Pending', 'Pesanan berhasil dibuat, menunggu pembayaran', 'Jakarta Pusat', NULL, '2026-05-28 06:28:26', NULL),
(105, 'LSK994972160910', 'Pending', 'Pesanan berhasil dibuat, menunggu pembayaran', 'Jakarta Pusat', NULL, '2026-05-28 06:28:41', NULL),
(106, 'LSK994972810291', 'Pending', 'Pesanan berhasil dibuat, menunggu pembayaran', 'Jakarta Pusat', NULL, '2026-05-28 06:28:48', NULL),
(107, 'LSK994972810291', 'Pending', 'Pembayaran via Simulasi SmartBank berhasil dikonfirmasi. Status: Pending Pickup.', 'Jakarta Pusat', NULL, '2026-05-28 06:33:49', NULL),
(108, 'LSK995011663076', 'Pending', 'Pesanan berhasil dibuat, menunggu pembayaran', 'Jakarta Pusat', NULL, '2026-05-28 06:35:16', NULL),
(109, 'LSK995012931741', 'Pending', 'Pesanan berhasil dibuat, menunggu pembayaran', 'Jakarta Pusat', NULL, '2026-05-28 06:35:29', NULL),
(110, 'LSK995013506881', 'Pending', 'Pesanan berhasil dibuat, menunggu pembayaran', 'Jakarta Pusat', NULL, '2026-05-28 06:35:35', NULL),
(111, 'LSK995020047315', 'Pending', 'Pesanan berhasil dibuat, menunggu pembayaran', 'Jakarta Pusat', NULL, '2026-05-28 06:36:40', NULL),
(112, 'LSK995020047315', 'Pending', 'Pembayaran via Simulasi SmartBank berhasil dikonfirmasi. Status: Pending Pickup.', 'Jakarta Pusat', NULL, '2026-05-28 06:36:43', 1),
(113, 'LSK995020047315', 'Picked Up', 'Paket diambil kurir untuk transit ke cabang berikutnya', NULL, 3, '2026-05-28 06:38:50', 1),
(114, 'LSK995020047315', 'In Transit', 'Paket sedang dibawa kurir menuju Cabang Utama Bandung (Bandung)', NULL, 3, '2026-05-28 06:39:07', 1),
(115, 'LSK995020047315', 'Waiting Branch Confirmation', 'Paket tiba di Cabang Utama Bandung (Bandung). Menunggu konfirmasi operator cabang.', NULL, 3, '2026-05-28 06:39:22', 2),
(116, 'LSK995020047315', 'Arrived at Branch', 'Paket tiba di cabang transit. Menunggu diteruskan ke cabang berikutnya.', NULL, 9, '2026-05-28 06:40:27', 2),
(117, 'LSK995020047315', 'In Transit', 'Paket dikirim transit menuju cabang berikutnya.', NULL, 9, '2026-05-28 06:41:27', 2),
(118, 'LSK997045662781', 'Pending', 'Pesanan berhasil dibuat, menunggu pembayaran', 'Palembang', NULL, '2026-05-28 12:14:16', NULL),
(119, 'LSK997045662781', 'Pending', 'Pembayaran via Simulasi SmartBank berhasil dikonfirmasi. Status: Pending Pickup.', 'Palembang', NULL, '2026-05-28 12:14:19', 10),
(120, 'LSK997045662781', 'Picked Up', 'Paket diambil kurir untuk transit ke cabang berikutnya', NULL, 50, '2026-05-28 12:22:56', 10),
(121, 'LSK997045662781', 'In Transit', 'Paket sedang dibawa kurir menuju Cabang Utama Jakarta (Jakarta)', NULL, 50, '2026-05-28 12:25:59', 10),
(122, 'LSK997045662781', 'Waiting Branch Confirmation', 'Paket tiba di Cabang Utama Jakarta (Jakarta). Menunggu konfirmasi operator cabang.', NULL, 50, '2026-05-28 12:26:08', 1),
(123, 'LSK997045662781', 'Arrived at Branch', 'Paket tiba di cabang transit. Menunggu diteruskan ke cabang berikutnya.', NULL, 8, '2026-05-28 12:27:53', 1),
(124, 'LSK997045662781', 'Arrived at Branch', 'Paket tiba dan diterima di cabang.', NULL, 8, '2026-05-28 12:31:26', 1),
(125, 'LSK997045662781', 'In Transit', 'Paket dikirim transit menuju cabang berikutnya.', NULL, 8, '2026-05-28 12:32:16', 1),
(126, 'LSK997045662781', 'Arrived at Branch', 'Paket tiba dan diterima di cabang.', NULL, 8, '2026-05-28 12:40:34', 1),
(127, 'LSK997045662781', 'In Transit', 'Paket dikirim transit menuju cabang berikutnya.', NULL, 8, '2026-05-28 12:40:46', 1),
(128, 'LSK998099231581', 'Pending', 'Pesanan berhasil dibuat, menunggu pembayaran', 'Gowa', NULL, '2026-05-28 15:09:52', NULL),
(129, 'LSK998099231581', 'Pending', 'Pembayaran via Simulasi SmartBank berhasil dikonfirmasi. Status: Pending Pickup.', 'Gowa', NULL, '2026-05-28 15:09:55', 1),
(130, 'LSK99819652475', 'Pending', 'Pesanan berhasil dibuat, menunggu pembayaran', 'Bekasi', NULL, '2026-05-28 15:26:06', NULL),
(131, 'LSK99819652475', 'Pending', 'Pembayaran via Simulasi SmartBank berhasil dikonfirmasi. Status: Pending Pickup.', 'Bekasi', NULL, '2026-05-28 15:26:09', 1),
(132, 'LSK99819652475', 'Picked Up', 'Paket di-scan di cabang dengan status Picked Up', NULL, 8, '2026-05-28 15:28:01', 1),
(133, 'LSK99819652475', 'Arrived at Branch', 'Paket tiba dan diterima di cabang.', NULL, 8, '2026-05-28 15:28:56', 1),
(134, 'LSK99819652475', 'Picked Up', 'Paket diambil kurir untuk transit ke cabang berikutnya', NULL, 3, '2026-05-28 15:32:55', 1),
(135, 'LSK99819652475', 'In Transit', 'Paket sedang dibawa kurir menuju Cabang Utama Bandung (Bandung)', NULL, 3, '2026-05-28 15:33:06', 1),
(136, 'LSK99819652475', 'Waiting Branch Confirmation', 'Paket tiba di Cabang Utama Bandung (Bandung). Menunggu konfirmasi operator cabang.', NULL, 3, '2026-05-28 15:33:22', 2),
(137, 'LSK99819652475', 'Arrived at Branch', 'Paket tiba di cabang transit. Menunggu diteruskan ke cabang berikutnya.', NULL, 9, '2026-05-28 15:34:06', 2),
(138, 'LSK99819652475', 'Out For Delivery', 'Paket di-scan di cabang dengan status Out For Delivery', NULL, 9, '2026-05-28 15:34:36', 2),
(139, 'LSK998256012836', 'Pending', 'Pesanan berhasil dibuat, menunggu pembayaran', 'Jakarta Pusat', NULL, '2026-05-28 15:36:00', NULL),
(140, 'LSK998256012836', 'Pending', 'Pembayaran via Simulasi SmartBank berhasil dikonfirmasi. Status: Pending Pickup.', 'Jakarta Pusat', NULL, '2026-05-28 15:36:02', 1),
(141, 'LSK998256012836', 'Picked Up', 'Paket di-scan di cabang dengan status Picked Up', NULL, 8, '2026-05-28 15:37:11', 1),
(142, 'LSK998256012836', 'Arrived at Branch', 'Paket tiba dan diterima di cabang.', NULL, 8, '2026-05-28 15:37:22', 1),
(143, 'LSK998256012836', 'In Transit', 'Paket di-scan di cabang dengan status In Transit', NULL, 8, '2026-05-28 15:37:47', 1),
(144, 'LSK998099231581', 'Out For Delivery', 'Paket diambil kurir untuk delivery ke alamat tujuan', NULL, 3, '2026-05-28 15:38:35', 1),
(145, 'LSK20260504012', 'Waiting Branch Confirmation', 'Paket tiba di Cabang Utama Semarang (Semarang). Menunggu konfirmasi operator cabang.', NULL, 3, '2026-05-28 15:38:54', 8),
(146, 'LSK020113197338', 'Pending', 'Pesanan berhasil dibuat, menunggu pembayaran', 'Jakarta Pusat', NULL, '2026-05-31 04:18:52', NULL),
(147, 'LSK020113197338', 'Pending', 'Pembayaran via Simulasi SmartBank berhasil dikonfirmasi. Status: Pending Pickup.', 'Jakarta Pusat', NULL, '2026-05-31 04:18:55', 1),
(148, 'LSK020113197338', 'Picked Up', 'Paket diambil kurir untuk transit ke cabang berikutnya', NULL, 3, '2026-05-31 04:19:45', 1),
(149, 'LSK020113197338', 'Picked Up', 'Paket di-scan di cabang dengan status Picked Up', NULL, 8, '2026-05-31 04:20:06', 1),
(150, 'LSK020113197338', 'In Transit', 'Paket sedang dibawa kurir menuju Cabang Utama Bandung (Bandung)', NULL, 3, '2026-05-31 04:20:41', 1),
(151, 'LSK020113197338', 'Waiting Branch Confirmation', 'Paket tiba di Cabang Utama Bandung (Bandung). Menunggu konfirmasi operator cabang.', NULL, 3, '2026-05-31 04:20:48', 2),
(152, 'LSK020113197338', 'Arrived at Destination Branch', 'Paket tiba di cabang tujuan akhir. Siap untuk delivery ke penerima. Auto-assign ke kurir: Citra Dewi', NULL, 9, '2026-05-31 04:21:19', 2),
(153, 'LSK04884307981', 'Pending', 'Pesanan diterima dari API Marketplace', 'Jakarta', NULL, '2026-05-31 05:21:24', NULL),
(154, 'LSK04884307981', 'Cancelled', 'Pengiriman dibatalkan oleh partner', 'Sistem', NULL, '2026-05-31 05:21:24', NULL),
(155, 'LSK0488988836', 'Pending', 'Pesanan diterima dan pembayaran terkonfirmasi', 'Gudang LogistiKita', NULL, '2026-05-31 05:21:29', NULL),
(156, 'LSK0488988836', 'Picked Up', 'Kurir telah menjemput paket', 'Gudang Jakarta Pusat', 1, '2026-05-31 05:21:29', NULL),
(157, 'LSK28649206736', 'Pending', 'Pesanan diterima dari API Marketplace', 'Jakarta', NULL, '2026-05-31 11:57:29', NULL),
(158, 'LSK28649206736', 'Picked Up', 'Paket di-scan di cabang dengan status Picked Up', NULL, 8, '2026-05-31 11:59:02', 1),
(159, 'LSK28649206736', 'Arrived at Branch', 'Paket tiba dan diterima di cabang.', NULL, 8, '2026-05-31 11:59:16', 1),
(160, 'LSK28649206736', 'In Transit', 'Paket di-scan di cabang dengan status In Transit', NULL, 8, '2026-05-31 11:59:32', 1),
(161, 'LSK28649206736', 'Delivered', 'Status diupdate ke Delivered', NULL, 1, '2026-05-31 12:02:19', NULL),
(162, 'LSK022930990929', 'Pending', 'Pesanan berhasil dibuat, menunggu pembayaran', 'Jakarta Selatan', NULL, '2026-05-31 12:08:29', NULL),
(163, 'LSK022930990929', 'Pending', 'Pembayaran via Simulasi SmartBank berhasil dikonfirmasi. Status: Pending Pickup.', 'Jakarta Selatan', NULL, '2026-05-31 12:08:33', 1),
(164, 'LSK022930990929', 'Picked Up', 'Paket diambil kurir untuk transit ke cabang berikutnya', NULL, 3, '2026-05-31 12:09:39', 1),
(165, 'LSK022930990929', 'Arrived at Branch', 'Paket tiba dan diterima di cabang.', NULL, 8, '2026-05-31 12:09:58', 1),
(166, 'LSK022930990929', 'In Transit', 'Paket sedang dibawa kurir menuju Cabang Utama Bandung (Bandung)', NULL, 3, '2026-05-31 12:10:16', 1),
(167, 'LSK022930990929', 'Waiting Branch Confirmation', 'Paket tiba di Cabang Utama Bandung (Bandung). Menunggu konfirmasi operator cabang.', NULL, 3, '2026-05-31 12:10:22', 2),
(168, 'LSK022930990929', 'Arrived at Destination Branch', 'Paket tiba di cabang tujuan akhir. Siap untuk delivery ke penerima. Auto-assign ke kurir: Citra Dewi', NULL, 9, '2026-05-31 12:10:51', 2),
(169, 'LSK30117898441', 'Pending', 'Pesanan diterima dari API Marketplace', 'Jakarta', NULL, '2026-05-31 12:21:57', NULL),
(170, 'LSK30117898441', 'Cancelled', 'Pengiriman dibatalkan oleh partner', 'Sistem', NULL, '2026-05-31 12:21:57', NULL),
(171, 'LSK30124026460', 'Pending', 'Pesanan diterima dan pembayaran terkonfirmasi', 'Gudang LogistiKita', NULL, '2026-05-31 12:22:04', NULL),
(172, 'LSK30124026460', 'Picked Up', 'Kurir telah menjemput paket', 'Gudang Jakarta Pusat', 1, '2026-05-31 12:22:04', NULL),
(173, 'LSK022930990929', 'Out For Delivery', 'Paket diambil kurir untuk delivery ke alamat tujuan', NULL, 5, '2026-05-31 12:23:48', 2),
(174, 'LSK022930990929', 'Delivered', 'Paket berhasil dikirim. Diterima oleh: andi', NULL, 5, '2026-05-31 12:23:57', 2),
(175, 'LSK31518753841', 'Pending', 'Pesanan diterima dari API Marketplace', 'Jakarta', NULL, '2026-05-31 12:45:18', NULL),
(176, 'LSK31518753841', 'Cancelled', 'Pengiriman dibatalkan oleh partner', 'Sistem', NULL, '2026-05-31 12:45:18', NULL),
(177, 'LSK31521878739', 'Pending', 'Pesanan diterima dan pembayaran terkonfirmasi', 'Gudang LogistiKita', NULL, '2026-05-31 12:45:21', NULL),
(178, 'LSK31521878739', 'Picked Up', 'Kurir telah menjemput paket', 'Gudang Jakarta Pusat', 1, '2026-05-31 12:45:21', NULL),
(179, 'LSK023414032224', 'Pending', 'Pesanan berhasil dibuat, menunggu pembayaran', 'Jakarta Pusat', NULL, '2026-05-31 13:29:00', NULL),
(180, 'LSK023418324817', 'Pending', 'Pesanan berhasil dibuat, menunggu pembayaran', 'Jakarta Barat', NULL, '2026-05-31 13:29:43', NULL),
(181, 'LSK023419537787', 'Pending', 'Pesanan berhasil dibuat, menunggu pembayaran', 'Jakarta Barat', NULL, '2026-05-31 13:29:55', NULL),
(182, 'LSK023419537787', 'Pending', 'Pembayaran via Simulasi SmartBank berhasil dikonfirmasi. Status: Pending Pickup.', 'Jakarta Barat', NULL, '2026-05-31 13:29:59', 1),
(183, 'LSK023423724292', 'Pending', 'Pesanan berhasil dibuat, menunggu pembayaran', 'Jakarta Pusat', NULL, '2026-05-31 13:30:37', NULL),
(184, 'LSK34443770599', 'Pending', 'Pesanan diterima dari API Marketplace', 'Jakarta', NULL, '2026-05-31 13:34:03', NULL),
(185, 'LSK34443770599', 'Cancelled', 'Pengiriman dibatalkan oleh partner', 'Sistem', NULL, '2026-05-31 13:34:03', NULL),
(186, 'LSK34447971239', 'Pending', 'Pesanan diterima dan pembayaran terkonfirmasi', 'Gudang LogistiKita', NULL, '2026-05-31 13:34:07', NULL),
(187, 'LSK34447971239', 'Picked Up', 'Kurir telah menjemput paket', 'Gudang Jakarta Pusat', 1, '2026-05-31 13:34:08', NULL),
(188, 'LSK023448612876', 'Pending', 'Pesanan berhasil dibuat, menunggu pembayaran', 'Jakarta Pusat', NULL, '2026-05-31 13:34:46', NULL),
(189, 'LSK023449385182', 'Pending', 'Pesanan berhasil dibuat, menunggu pembayaran', 'Jakarta Pusat', NULL, '2026-05-31 13:34:53', NULL),
(190, 'LSK023450491863', 'Pending', 'Pesanan berhasil dibuat, menunggu pembayaran', 'Jakarta Pusat', NULL, '2026-05-31 13:35:04', NULL),
(191, 'LSK46600205384', 'Pending', 'Pesanan diterima dan pembayaran terkonfirmasi', 'Gudang LogistiKita', NULL, '2026-05-31 16:56:40', NULL),
(192, 'LSK46600205384', 'Picked Up', 'Kurir telah menjemput paket', 'Gudang Jakarta Pusat', 1, '2026-05-31 16:56:40', NULL),
(193, 'LSK024807045059', 'Pending', 'Pesanan berhasil dibuat, menunggu pembayaran', 'Jakarta Pusat', NULL, '2026-05-31 17:21:10', NULL),
(194, 'LSK024808999684', 'Pending', 'Pesanan berhasil dibuat, menunggu pembayaran', 'Jakarta Pusat', NULL, '2026-05-31 17:21:30', NULL),
(195, 'LSK024808999684', 'Pending', 'Pembayaran via Simulasi SmartBank berhasil dikonfirmasi. Status: Pending Pickup.', 'Jakarta Pusat', NULL, '2026-05-31 17:21:33', 1),
(196, 'LSK024808999684', 'Picked Up', 'Paket di-scan di cabang dengan status Picked Up', NULL, 8, '2026-05-31 17:23:35', 1),
(197, 'LSK024808999684', 'Arrived at Branch', 'Paket tiba dan diterima di cabang.', NULL, 8, '2026-05-31 17:23:44', 1),
(198, 'LSK024808999684', 'Picked Up', 'Paket diambil kurir untuk transit ke cabang berikutnya', NULL, 3, '2026-05-31 17:25:05', 1),
(199, 'LSK024808999684', 'In Transit', 'Paket sedang dibawa kurir menuju Cabang Utama Bandung (Bandung)', NULL, 3, '2026-05-31 17:25:21', 1),
(200, 'LSK024808999684', 'Waiting Branch Confirmation', 'Paket tiba di Cabang Utama Bandung (Bandung). Menunggu konfirmasi operator cabang.', NULL, 3, '2026-05-31 17:25:35', 2),
(201, 'LSK024808999684', 'Arrived at Destination Branch', 'Paket tiba di cabang tujuan akhir. Siap untuk delivery ke penerima. Auto-assign ke kurir: Bambang Herlambangg', NULL, 9, '2026-05-31 17:26:03', 2);

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
(1, 'GATEWAY-MOCK-1779617348216820', 'LSK961734558765', 'CUSTOMER', 20200.00, 606.00, 0.00, 20806.00, '2026-05-24 10:09:09'),
(2, 'SBT-VA-1779618391799242', 'LSK961838763794', 'CUSTOMER', 15700.00, 471.00, 157.00, 16328.00, '2026-05-24 10:26:31'),
(3, 'SBT-VA-1779950029442539', 'LSK994972810291', 'CUSTOMER', 31600.00, 948.00, 316.00, 32864.00, '2026-05-28 06:33:49'),
(4, 'SBT-VA-1779950203042605', 'LSK995020047315', 'CUSTOMER', 31800.00, 954.00, 318.00, 33072.00, '2026-05-28 06:36:43'),
(5, 'SBT-VA-1779970459740916', 'LSK997045662781', 'CUSTOMER', 60500.00, 1815.00, 605.00, 62920.00, '2026-05-28 12:14:19'),
(6, 'SBT-VA-1779980995209928', 'LSK998099231581', 'CUSTOMER', 81100.00, 2433.00, 811.00, 84344.00, '2026-05-28 15:09:55'),
(7, 'SBT-VA-1779981968407743', 'LSK99819652475', 'CUSTOMER', 68800.00, 2064.00, 688.00, 71552.00, '2026-05-28 15:26:09'),
(8, 'SBT-VA-1779982562229715', 'LSK998256012836', 'CUSTOMER', 51900.00, 1557.00, 519.00, 53976.00, '2026-05-28 15:36:02'),
(9, 'SBT-VA-1780201135002632', 'LSK020113197338', 'CUSTOMER', 16100.00, 483.00, 161.00, 16744.00, '2026-05-31 04:18:55'),
(10, 'SBT-VA-1780229313133329', 'LSK022930990929', 'CUSTOMER', 15700.00, 471.00, 157.00, 16328.00, '2026-05-31 12:08:33'),
(11, 'SBT-VA-1780234199370371', 'LSK023419537787', 'CUSTOMER', 11000.00, 330.00, 110.00, 11440.00, '2026-05-31 13:29:59'),
(12, 'SBT-VA-1780248093257991', 'LSK024808999684', 'CUSTOMER', 16500.00, 495.00, 165.00, 17160.00, '2026-05-31 17:21:33');

-- --------------------------------------------------------

--
-- Table structure for table `transit_routes`
--

CREATE TABLE `transit_routes` (
  `id` int NOT NULL,
  `from_branch_id` int NOT NULL,
  `to_branch_id` int NOT NULL,
  `route_order` int NOT NULL DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `transit_routes`
--

INSERT INTO `transit_routes` (`id`, `from_branch_id`, `to_branch_id`, `route_order`) VALUES
(1, 1, 2, 1),
(2, 2, 1, 1),
(3, 2, 8, 1),
(4, 8, 2, 1),
(5, 8, 7, 1),
(6, 7, 8, 1),
(7, 8, 3, 1),
(8, 3, 8, 1),
(9, 3, 9, 1),
(10, 9, 3, 1),
(11, 3, 5, 1),
(12, 5, 3, 1),
(13, 3, 6, 1),
(14, 6, 3, 1),
(15, 1, 10, 1),
(16, 10, 1, 1),
(17, 10, 4, 1),
(18, 4, 10, 1),
(19, 5, 12, 1),
(20, 12, 5, 1),
(21, 11, 6, 1),
(22, 6, 11, 1);

-- --------------------------------------------------------

--
-- Table structure for table `webhook_logs`
--

CREATE TABLE `webhook_logs` (
  `id` int NOT NULL,
  `partner_id` int NOT NULL,
  `shipment_id` int NOT NULL,
  `payload` text,
  `signature` varchar(128) DEFAULT NULL,
  `status_code` int DEFAULT NULL,
  `attempt` int DEFAULT '1',
  `next_retry_at` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `webhook_logs`
--

INSERT INTO `webhook_logs` (`id`, `partner_id`, `shipment_id`, `payload`, `signature`, `status_code`, `attempt`, `next_retry_at`, `created_at`) VALUES
(1, 1, 35, '{\"awb\":\"LSK15209663111\",\"status\":\"Cancelled\",\"timestamp\":\"2026-05-24T09:33:29.700Z\",\"partner_id\":1}', '4f91efac64d0d3f951bee24348289a3b59fbb56eef21c2a2757581b651460af6', 200, 1, NULL, '2026-05-24 09:33:29'),
(2, 1, 36, '{\"awb\":\"LSK16346373678\",\"status\":\"Cancelled\",\"timestamp\":\"2026-05-24T09:52:26.407Z\",\"partner_id\":1}', '60968475ab4a42f1e67c735f8f357947b136317c86e48bce0a9cb3c57edd99ae', 200, 1, NULL, '2026-05-24 09:52:26'),
(3, 1, 41, '{\"awb\":\"LSK17116745785\",\"status\":\"Cancelled\",\"timestamp\":\"2026-05-24T10:05:16.776Z\",\"partner_id\":1}', '95cbe57a3d863d1b1fce5b00bbd2eb0739f762848b5433c278e66efbcc32e870', 200, 1, NULL, '2026-05-24 10:05:16'),
(4, 1, 42, '{\"awb\":\"LSK17123010986\",\"status\":\"Cancelled\",\"timestamp\":\"2026-05-24T10:05:23.037Z\",\"partner_id\":1}', '92961b8035ae1eec71e809f07a10f0208c76885d6f9bcf9196ee0820b403b023', 200, 1, NULL, '2026-05-24 10:05:23'),
(5, 1, 43, '{\"awb\":\"LSK17135703769\",\"status\":\"Cancelled\",\"timestamp\":\"2026-05-24T10:05:35.736Z\",\"partner_id\":1}', '3445f1b3bf94283b170172c9e96011bcfdb346376f6feb01a942330f72733b68', 200, 1, NULL, '2026-05-24 10:05:35'),
(6, 1, 62, '{\"awb\":\"LSK04884307981\",\"status\":\"Cancelled\",\"timestamp\":\"2026-05-31T05:21:24.370Z\",\"partner_id\":1}', 'b072eb354dc51b3949c0f8518e2d4581d72d83997ad661f1373383696966017f', 200, 1, NULL, '2026-05-31 05:21:24'),
(7, 1, 66, '{\"awb\":\"LSK30117898441\",\"status\":\"Cancelled\",\"timestamp\":\"2026-05-31T12:21:57.942Z\",\"partner_id\":1}', '50c43437a3b0e18fa33126f8d4c4367169afc66820a08aed95bf1c13d7624cd8', 200, 1, NULL, '2026-05-31 12:21:57'),
(8, 1, 68, '{\"awb\":\"LSK31518753841\",\"status\":\"Cancelled\",\"timestamp\":\"2026-05-31T12:45:18.778Z\",\"partner_id\":1}', '715be7ab2862bdc43ff9e46e4299dbeff066a617337265bb1a49075f61b69e4c', 200, 1, NULL, '2026-05-31 12:45:18'),
(9, 1, 74, '{\"awb\":\"LSK34443770599\",\"status\":\"Cancelled\",\"timestamp\":\"2026-05-31T13:34:03.796Z\",\"partner_id\":1}', 'd27c170c1757768ae2a9b74ba2e76ae299b4b76581e9db2b1b915421b99a94dc', 200, 1, NULL, '2026-05-31 13:34:03');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admin_reports`
--
ALTER TABLE `admin_reports`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `api_logs`
--
ALTER TABLE `api_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `partner_id` (`partner_id`);

--
-- Indexes for table `branches`
--
ALTER TABLE `branches`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`);

--
-- Indexes for table `delivery_proofs`
--
ALTER TABLE `delivery_proofs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `shipment_id` (`shipment_id`),
  ADD KEY `kurir_id` (`kurir_id`);

--
-- Indexes for table `integration_transactions`
--
ALTER TABLE `integration_transactions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `transaction_id` (`transaction_id`),
  ADD UNIQUE KEY `awb_number` (`awb_number`);

--
-- Indexes for table `internal_users`
--
ALTER TABLE `internal_users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `token` (`token`),
  ADD KEY `branch_id` (`branch_id`);

--
-- Indexes for table `kurir_registrations`
--
ALTER TABLE `kurir_registrations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `branch_id` (`branch_id`),
  ADD KEY `reviewed_by` (`reviewed_by`);

--
-- Indexes for table `marketplace_partners`
--
ALTER TABLE `marketplace_partners`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `api_key` (`api_key`);

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
  ADD KEY `assigned_kurir_id` (`assigned_kurir_id`),
  ADD KEY `origin_branch_id` (`origin_branch_id`),
  ADD KEY `destination_branch_id` (`destination_branch_id`),
  ADD KEY `current_branch_id` (`current_branch_id`),
  ADD KEY `final_branch_id` (`final_branch_id`);

--
-- Indexes for table `shipment_transit_legs`
--
ALTER TABLE `shipment_transit_legs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `shipment_id` (`shipment_id`),
  ADD KEY `from_branch_id` (`from_branch_id`),
  ADD KEY `to_branch_id` (`to_branch_id`),
  ADD KEY `assigned_kurir_id` (`assigned_kurir_id`);

--
-- Indexes for table `shipment_webhooks`
--
ALTER TABLE `shipment_webhooks`
  ADD PRIMARY KEY (`id`),
  ADD KEY `shipment_id` (`shipment_id`),
  ADD KEY `partner_id` (`partner_id`);

--
-- Indexes for table `shipping_rates`
--
ALTER TABLE `shipping_rates`
  ADD PRIMARY KEY (`id`);

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
  ADD KEY `updated_by` (`updated_by`),
  ADD KEY `branch_id` (`branch_id`);

--
-- Indexes for table `transactions`
--
ALTER TABLE `transactions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `transaction_id` (`transaction_id`),
  ADD KEY `order_id` (`order_id`);

--
-- Indexes for table `transit_routes`
--
ALTER TABLE `transit_routes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_route` (`from_branch_id`,`to_branch_id`),
  ADD KEY `to_branch_id` (`to_branch_id`);

--
-- Indexes for table `webhook_logs`
--
ALTER TABLE `webhook_logs`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admin_reports`
--
ALTER TABLE `admin_reports`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `api_logs`
--
ALTER TABLE `api_logs`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=82;

--
-- AUTO_INCREMENT for table `branches`
--
ALTER TABLE `branches`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `delivery_proofs`
--
ALTER TABLE `delivery_proofs`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `integration_transactions`
--
ALTER TABLE `integration_transactions`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `internal_users`
--
ALTER TABLE `internal_users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=51;

--
-- AUTO_INCREMENT for table `kurir_registrations`
--
ALTER TABLE `kurir_registrations`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `marketplace_partners`
--
ALTER TABLE `marketplace_partners`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1000;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `partners`
--
ALTER TABLE `partners`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `shipments`
--
ALTER TABLE `shipments`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=82;

--
-- AUTO_INCREMENT for table `shipment_transit_legs`
--
ALTER TABLE `shipment_transit_legs`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- AUTO_INCREMENT for table `shipment_webhooks`
--
ALTER TABLE `shipment_webhooks`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `shipping_rates`
--
ALTER TABLE `shipping_rates`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `tarif`
--
ALTER TABLE `tarif`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `tracking_logs`
--
ALTER TABLE `tracking_logs`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=202;

--
-- AUTO_INCREMENT for table `transactions`
--
ALTER TABLE `transactions`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `transit_routes`
--
ALTER TABLE `transit_routes`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT for table `webhook_logs`
--
ALTER TABLE `webhook_logs`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `delivery_proofs`
--
ALTER TABLE `delivery_proofs`
  ADD CONSTRAINT `delivery_proofs_ibfk_1` FOREIGN KEY (`shipment_id`) REFERENCES `shipments` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `delivery_proofs_ibfk_2` FOREIGN KEY (`kurir_id`) REFERENCES `internal_users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `internal_users`
--
ALTER TABLE `internal_users`
  ADD CONSTRAINT `internal_users_ibfk_1` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `kurir_registrations`
--
ALTER TABLE `kurir_registrations`
  ADD CONSTRAINT `kurir_registrations_ibfk_1` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `kurir_registrations_ibfk_2` FOREIGN KEY (`reviewed_by`) REFERENCES `internal_users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `shipments`
--
ALTER TABLE `shipments`
  ADD CONSTRAINT `shipments_ibfk_1` FOREIGN KEY (`partner_id`) REFERENCES `partners` (`id`),
  ADD CONSTRAINT `shipments_ibfk_2` FOREIGN KEY (`assigned_kurir_id`) REFERENCES `internal_users` (`id`),
  ADD CONSTRAINT `shipments_ibfk_3` FOREIGN KEY (`origin_branch_id`) REFERENCES `branches` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `shipments_ibfk_4` FOREIGN KEY (`destination_branch_id`) REFERENCES `branches` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `shipments_ibfk_5` FOREIGN KEY (`current_branch_id`) REFERENCES `branches` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `shipments_ibfk_6` FOREIGN KEY (`final_branch_id`) REFERENCES `branches` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `shipment_transit_legs`
--
ALTER TABLE `shipment_transit_legs`
  ADD CONSTRAINT `shipment_transit_legs_ibfk_1` FOREIGN KEY (`shipment_id`) REFERENCES `shipments` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `shipment_transit_legs_ibfk_2` FOREIGN KEY (`from_branch_id`) REFERENCES `branches` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `shipment_transit_legs_ibfk_3` FOREIGN KEY (`to_branch_id`) REFERENCES `branches` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `shipment_transit_legs_ibfk_4` FOREIGN KEY (`assigned_kurir_id`) REFERENCES `internal_users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `shipment_webhooks`
--
ALTER TABLE `shipment_webhooks`
  ADD CONSTRAINT `shipment_webhooks_ibfk_1` FOREIGN KEY (`shipment_id`) REFERENCES `shipments` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `shipment_webhooks_ibfk_2` FOREIGN KEY (`partner_id`) REFERENCES `partners` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `tracking_logs`
--
ALTER TABLE `tracking_logs`
  ADD CONSTRAINT `tracking_logs_ibfk_1` FOREIGN KEY (`awb_number`) REFERENCES `shipments` (`awb_number`) ON DELETE CASCADE,
  ADD CONSTRAINT `tracking_logs_ibfk_2` FOREIGN KEY (`updated_by`) REFERENCES `internal_users` (`id`),
  ADD CONSTRAINT `tracking_logs_ibfk_3` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `transactions`
--
ALTER TABLE `transactions`
  ADD CONSTRAINT `transactions_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`) ON DELETE CASCADE;

--
-- Constraints for table `transit_routes`
--
ALTER TABLE `transit_routes`
  ADD CONSTRAINT `transit_routes_ibfk_1` FOREIGN KEY (`from_branch_id`) REFERENCES `branches` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `transit_routes_ibfk_2` FOREIGN KEY (`to_branch_id`) REFERENCES `branches` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
