# Integrasi Marketplace Partner sebagai Shipping Provider API

## Goal Description

Merevisi arsitektur LogistiKita agar berperan **sebagai penyedia layanan pengiriman** (shipping provider) yang diakses **server‑to‑server** oleh marketplace eksternal.  Semua UI khusus marketplace (login, dashboard, form pembuatan shipment) akan dihapus.  Fokus pada penyediaan API untuk **cek ongkir, pembuatan shipment, tracking, pembatalan, dan webhook status** yang terintegrasi dengan alur operasional internal (operator cabang, dispatcher, kurir).  Selain itu memperbaiki error startup terkait kolom `order_source` dan menambahkan mekanisme monitoring serta keamanan API.

---

## User Review Required

> [!IMPORTANT]
> Periksa poin‑poin berikut sebelum kami melanjutkan implementasi:
> - Apakah set endpoint API yang di‑list di atas sudah lengkap? (cek‑ongkir, create‑shipment, tracking, list shipments, cancel)
> - Apakah Anda menginginkan **rate limiting** berbasis paket per‑menit atau per‑detik? (berikan nilai default)
> - Apakah ada **field tambahan** yang harus disimpan pada tabel `marketplace_partners` (contoh: contact email, callback URL default)?
> - Apakah **token security** untuk webhook harus berupa JWT atau HMAC? (berikan preferensi)

Silakan konfirmasi atau beri masukan untuk pertanyaan‑pertanyaan di atas.

---

## Open Questions

- **Rate Limiting**: Berapa limit maksimum request per menit per partner?
- **Webhook Authentication**: Apakah preferensi HMAC signature (`X-Signature`) atau JWT (`Authorization: Bearer <token>`)?
- **Retry Policy**: Jumlah maksimum retry dan interval eksponensial yang diinginkan?
- **Order Source Field**: Nilai apa yang harus di‑set untuk shipment yang datang dari marketplace (misal `"Marketplace"` atau ID partner)?
- **SuperAdmin UI**: Apakah semua halaman manajemen partner (CRUD, generate API key, aktivasi) sudah ada atau perlu penambahan?

---

## Proposed Changes

### 1. Database & Migrations
- **Modify `shipping` table**: Tambahkan kolom `order_source VARCHAR(50) NOT NULL DEFAULT 'Customer'`.
- **Create/Update `marketplace_partners` table**:
  - `id`, `name`, `api_key`, `secret_token`, `callback_url`, `status` (active/inactive), `created_at`, `updated_at`.
- **Add `api_logs` table** (jika belum ada) untuk menyimpan request/response metadata.
- **Add `webhook_logs` table** untuk mencatat setiap panggilan webhook, status, dan retry count.

### 2. Middleware
- **verifyApiKey.js** (existing) – pastikan meng‑extract `x-api-key` header, validasi against `marketplace_partners.api_key`, cek status aktif.
- **apiLogMiddleware.js** – log request path, method, body (sanitized), partner ID, timestamp, response status ke `api_logs`.
- **rateLimiter.js** – gunakan `express-rate-limit` dengan konfigurasi dinamis per partner (default 60 req/min).
- **webhookService.js** – fungsi `sendWebhook(partnerId, payload)` dengan retry (exponential back‑off, max 5 attempts) dan HMAC signature.

### 3. Routes (`apiRoutes.js`)
- **Add namespace `/api/v1/marketplace`** dan implement endpoint controller `marketplaceController.js`:
  - `POST /check-ongkir` → gunakan `rateController.checkRates` (re‑use logic).
  - `POST /create-shipment` → baru `shipmentController.createMarketplaceShipment` (mirip dengan `createShipment` tapi set `order_source='Marketplace'` and `partner_id` from API key).
  - `GET /tracking/:resi` → `shipmentController.getTracking` (existing, but expose public route with API key).
  - `GET /shipments` → list shipments filtered by partner.
  - `POST /shipments/:awb/cancel` → cancel logic, only partner‑owned shipments.
- **Protect all with `verifyApiKey`, `apiLogMiddleware`, `rateLimiter`.**

### 4. Controllers
- **marketplaceController.js** (new):
  - `checkOngkir` – delegasi ke `rateController.checkRates` after extracting coordinates/weight.
  - `createShipment` – validate payload (sender, receiver, weight, service), generate AWB via existing util, insert ke `shipments` dengan `order_source='Marketplace'` dan `partner_id`.
  - `listShipments` – query shipments where `partner_id = req.partner.id`.
  - `cancelShipment` – update status, trigger webhook.
- **shipmentController.js** – tambahkan fungsi helper `triggerMarketplaceWebhook(shipment)` yang dipanggil pada setiap perubahan status (picked up, in transit, delivered, cancelled).

### 5. Webhook Integration
- **Update existing webhook trigger** to include partner callback URL & secret token.
- **Create `webhookService.js`** handling:
  - Build payload `{ awb, status, timestamp, ... }`.
  - Sign payload with HMAC (`crypto.createHmac('sha256', secret).update(JSON.stringify(payload)).digest('hex')`).
  - POST ke `callback_url` dengan header `X-Signature`.
  - Log setiap attempt di `webhook_logs`.
  - Retry dengan back‑off (30s → 2m → 5m → 10m → 20m).

### 6. SuperAdmin Dashboard (internal only)
- **Partner Management UI** (already exists) – pastikan ada halaman **Generate API Key**, edit **callback URL**, **status toggle**.
- **API Monitoring Page** – menampilkan statistik request per partner (jumlah, error rate), link ke detail log (`api_logs`).
- **Webhook Logs Page** – list logs dengan filter status (success/failure), retry count.
- **Badge “Marketplace API”** pada shipment list UI (operator/dispatcher) – tampilkan partner name.

### 7. Real‑time Operational Flow
- On `createMarketplaceShipment`, after DB insert:
  1. Emit Socket.io event `newShipment` to branch dispatcher channel.
  2. Dispatcher UI auto‑refresh (via socket) showing new task with badge.
  3. Assignment & status updates follow existing workflow; each status change calls `triggerMarketplaceWebhook`.
- Ensure **Kurir** receives task via existing real‑time channel; status change propagates to webhook.

### 8. Fix Startup Error
- Add migration script `2026_05_fix_order_source.sql` adding column with default `'Customer'`.
- Run migration on server start (use `db.runMigrations()` if framework supports) or manual `npm run migrate`.
- Verify `npm start` runs without SQL errors.

### 9. Testing & Verification
- **Unit tests** for new controller methods (using Mocha/Chai). Mock DB with `sinon`.
- **Integration tests** using `supertest`:
  - Authenticate with generated API key.
  - Call `check-ongkir`, `create-shipment`, `tracking`, `cancel`.
  - Verify responses, DB rows, and webhook queue.
- **Manual QA**:
  - Simulate marketplace request via Postman.
  - Observe real‑time UI updates on operator/dispatcher.
  - Verify webhook logs and retry behavior with a mock endpoint.

---

## Verification Plan

### Automated Tests
- `npm test` will run:
  - `test/marketplace.controller.test.js` covering all endpoints.
  - `test/webhook.service.test.js` for signature & retry logic.

### Manual Verification
- Deploy locally (`npm start`).
- Use generated API key to call `/api/v1/marketplace/check-ongkir` from Postman, confirm JSON structure.
- Create shipment and watch it appear in operator dashboard instantly.
- Observe webhook payload arriving at a mock server (e.g., `http://localhost:4000/mock-webhook`).
- Check `api_logs` and `webhook_logs` tables for entries.

---

**End of Plan**
