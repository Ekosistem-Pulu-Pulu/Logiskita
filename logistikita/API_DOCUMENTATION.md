# 📚 LogistiKita API Documentation

## Overview

LogistiKita adalah sistem manajemen logistik multi-role yang mendukung berbagai channel distribusi:
- **Customer** - Pelanggan yang mengirim paket
- **Admin** - Manajemen internal sistem
- **Super Admin** - Kontrol penuh sistem
- **Operator** - Operator cabang
- **Kurir** - Kurir lapangan
- **Partner** - Mitra bisnis dan marketplace

---

## 🚀 Mengakses API Documentation

### 1. Swagger UI (Interactive Documentation)
```
http://localhost:3000/api-docs
```
- Interface interaktif untuk mengeksplorasi dan menguji API
- Dokumentasi lengkap semua endpoint
- Try it out untuk testing langsung

### 2. API Docs Overview Page
```
http://localhost:3000/docs
```
- Halaman ringkasan dokumentasi
- Quick links ke berbagai dokumentasi
- Daftar server yang tersedia

### 3. OpenAPI Specification (JSON)
```
http://localhost:3000/api-docs.json
```
- Raw OpenAPI 3.0 specification
- Dapat digunakan untuk code generation
- Format JSON standar industri

---

## 🖥️ Multi-Port Server Architecture

Sistem berjalan di 6 port berbeda untuk memisahkan concern dan keamanan:

| Port | Role | URL |
|------|------|-----|
| 3000 | Customer/Landing | http://localhost:3000 |
| 3001 | Admin Dashboard | http://localhost:3001 |
| 3002 | Super Admin | http://localhost:3002 |
| 3003 | Operator Cabang | http://localhost:3003 |
| 3004 | Kurir Lapangan | http://localhost:3004 |
| 3005 | Simulator Mitra | http://localhost:3005 |

---

## 🔐 Authentication Methods

### 1. API Key (untuk Partner/Mitra)
```javascript
Header: X-API-Key: your-api-key
```
Gunakan untuk akses B2B API endpoints (`/api/v1/*`)

### 2. Bearer Token (untuk Internal Users)
```javascript
Header: Authorization: Bearer your-jwt-token
```
Gunakan untuk akses endpoint internal admin (`/internal/*`)

### 3. Session/Cookie (untuk Web Login)
Login melalui form HTML di frontend, session disimpan di cookie

---

## 📋 Main API Routes

### Customer Routes (`/customer/*`)
```
GET    /customer/dashboard      - Customer dashboard
POST   /customer/track          - Track shipment
GET    /customer/orders         - Get orders
```

### Admin Routes (`/admin/*` & `/internal/*`)
```
GET    /internal/dashboard      - Admin dashboard
POST   /internal/users          - Manage users
PUT    /internal/users/:id      - Update user
DELETE /internal/users/:id      - Delete user
GET    /internal/reports        - Get reports
```

### B2B API Routes (`/api/v1/*`)
```
POST   /api/v1/shipments        - Create shipment
GET    /api/v1/shipments/:id    - Get shipment status
POST   /api/v1/rates            - Calculate shipping rate
GET    /api/v1/partners         - List partners
```

### Payment Routes
```
POST   /api/bayar-ongkir        - Process payment
```

### Webhook Routes
```
POST   /webhook/tokobagus       - Receive webhook events
GET    /webhook/tokobagus/logs  - Get webhook logs
```

### Authentication Routes (`/auth/*`)
```
POST   /auth/login              - User login
POST   /auth/logout             - User logout
POST   /auth/register           - Register new user
POST   /auth/refresh-token      - Refresh JWT token
```

---

## 📦 Example API Requests

### 1. Create Shipment (B2B)
```bash
curl -X POST http://localhost:3000/api/v1/shipments \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{
    "recipient_name": "John Doe",
    "recipient_phone": "08123456789",
    "destination": "Jakarta, Indonesia",
    "items": [
      {
        "description": "Electronics",
        "weight": 2.5
      }
    ]
  }'
```

### 2. Track Shipment
```bash
curl -X GET http://localhost:3000/customer/track?awb=AWB123456 \
  -H "Authorization: Bearer your-token"
```

### 3. Calculate Shipping Rate
```bash
curl -X POST http://localhost:3000/api/v1/rates \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{
    "origin": "Jakarta",
    "destination": "Bandung",
    "weight": 5,
    "courier": "JNE"
  }'
```

### 4. Process Payment
```bash
curl -X POST http://localhost:3000/api/bayar-ongkir \
  -H "Content-Type: application/json" \
  -d '{
    "shipment_id": "SHP123456",
    "amount": 50000,
    "payment_method": "bank_transfer"
  }'
```

---

## 🪝 Webhook Integration

### Receive Webhook Events
Sistem akan mengirim event ke endpoint webhook Anda:

```javascript
// Contoh payload yang diterima
{
  "event_type": "shipment_created",
  "shipment_id": "SHP123456",
  "status": "pending",
  "timestamp": "2026-06-15T10:30:00Z"
}
```

### Configure Webhook
Di partner dashboard, atur webhook URL:
```
https://your-api.com/webhook/events
```

---

## 🔄 Integration Flow

```
┌─────────────┐
│   Partner   │
└──────┬──────┘
       │ API Request (with API Key)
       ▼
┌──────────────────────┐
│  B2B API Gateway     │
│  (/api/v1/*)         │
└──────┬───────────────┘
       │
       ├─► Validate API Key
       ├─► Process Request
       ├─► Generate Response
       │
       ▼
┌──────────────────────┐
│  Database            │
│  Shipments, Orders   │
└──────────────────────┘
```

---

## 📊 Response Format

### Success Response
```json
{
  "status": "Success",
  "data": {
    "id": 1,
    "shipment_id": "SHP123456",
    "recipient_name": "John Doe"
  },
  "message": "Shipment created successfully"
}
```

### Error Response
```json
{
  "status": "Error",
  "message": "Invalid API Key",
  "error_code": "AUTH_001"
}
```

---

## 🧪 Testing dengan Postman

1. Download & buka Postman
2. Import OpenAPI Spec:
   - URL: `http://localhost:3000/api-docs.json`
   - Atau copy dari Swagger UI
3. Set environment variables:
   ```
   {{base_url}} = http://localhost:3000
   {{api_key}} = your-api-key
   {{token}} = your-jwt-token
   ```
4. Test setiap endpoint dengan data sample

---

## 🔧 Environment Variables

Konfigurasi di `.env`:

```env
# Server
PORT=3000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=logistikita_db

# API Gateway
SMARTBANK_API_URL=https://smartbank.example.com/api
SMARTBANK_API_KEY=smartbank-dev-key-2026
```

---

## 📝 API Rate Limiting

- **Public endpoints**: 100 requests/hour
- **Authenticated endpoints**: 1000 requests/hour
- **Partner B2B endpoints**: 5000 requests/hour

---

## 🐛 Troubleshooting

### "Table doesn't exist"
```bash
cd logistikita
node setup_database.js
```

### "API Key Invalid"
- Pastikan API Key valid di database
- Check header: `X-API-Key: <key>`

### "Token Expired"
- Refresh token menggunakan `/auth/refresh-token`
- Login ulang untuk mendapatkan token baru

---

## 📞 Support

- Email: support@logistikita.com
- Documentation: http://localhost:3000/docs
- Swagger UI: http://localhost:3000/api-docs

---

## 📄 License

ISC License - Lihat file LICENSE untuk detail
