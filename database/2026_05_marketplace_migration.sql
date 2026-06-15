-- Add order_source to shipments if not exists
ALTER TABLE shipments ADD COLUMN order_source VARCHAR(50) NOT NULL DEFAULT 'Customer';

-- Create marketplace_partners table
CREATE TABLE IF NOT EXISTS marketplace_partners (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  api_key VARCHAR(64) NOT NULL UNIQUE,
  secret_token VARCHAR(64) NOT NULL,
  contact_email VARCHAR(255),
  contact_phone VARCHAR(50),
  company_name VARCHAR(150),
  callback_url VARCHAR(255),
  webhook_secret VARCHAR(64),
  status ENUM('active','inactive') DEFAULT 'active',
  last_access_at DATETIME NULL,
  total_requests BIGINT DEFAULT 0,
  total_shipments BIGINT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Note: api_logs is already created in setup_logistik_db.sql
-- Let's make sure it has what we need or alter it
-- Actually, api_logs has request_payload, we can use it.
-- Let's just make sure we have webhook_logs.

CREATE TABLE IF NOT EXISTS webhook_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  partner_id INT NOT NULL,
  shipment_id INT NOT NULL,
  payload TEXT,
  signature VARCHAR(128),
  status_code INT,
  attempt INT DEFAULT 1,
  next_retry_at DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed some default marketplace partner for testing
INSERT IGNORE INTO marketplace_partners (name, api_key, secret_token, contact_email, company_name, callback_url, webhook_secret)
VALUES ('Marketplace Simulator', 'lsk_live_mktA_9f8a8b7c6d5e4f3a2b1c', 'secret_token_123', 'admin@simulator.com', 'Simulator Inc', 'http://localhost:3000/webhook/tokobagus', 'webhook_secret_123');

