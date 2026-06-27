require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { swaggerUi, swaggerDocs } = require('./config/swagger');

// Import Routes - Legacy (Frontend Lama)
const logistikRoutes = require('./routes/logistikRoutes');
const adminRoutes = require('./routes/adminRoutes');
const userRoutes = require('./routes/userRoutes');

// Import Routes - B2B Architecture (Baru)
const apiRoutes = require('./routes/apiRoutes');           // Untuk Mitra Bisnis (API Key)
const internalRoutes = require('./routes/internalRoutes'); // Untuk Admin Internal (Token)
const gatewayRoutes = require('./routes/gatewayRoutes');   // Gateway Masuk (SmartBank ID)

// Import Routes - Multi Role (Baru)
const authRoutes = require('./routes/authRoutes');
const dispatcherRoutes = require('./routes/dispatcherRoutes');
const customerDashRoutes = require('./routes/customerDashRoutes');
const superadminRoutes = require('./routes/superadminRoutes');

// Database initialization for complaints/reports & integrations
const db = require('./db');

async function initDB() {
    try {
        // Drop foreign key constraint on api_logs to allow logging for both partners and marketplace_partners
        try {
            await db.query(`ALTER TABLE api_logs DROP FOREIGN KEY api_logs_ibfk_1`);
            console.log('Dropped foreign key constraint api_logs_ibfk_1 from api_logs table.');
        } catch (fkErr) {
            // Ignore if constraint does not exist or has already been dropped
        }

        // 1. Create admin_reports table
        await db.query(`
            CREATE TABLE IF NOT EXISTS admin_reports (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(100) NOT NULL,
                awb_number VARCHAR(30) NULL,
                report_type VARCHAR(50) NOT NULL,
                message TEXT NOT NULL,
                status VARCHAR(20) DEFAULT 'Pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Database table "admin_reports" verified/created successfully.');

        // 2. Create integration_transactions table
        await db.query(`
            CREATE TABLE IF NOT EXISTS integration_transactions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                transaction_id VARCHAR(50) UNIQUE NOT NULL,
                awb_number VARCHAR(30) UNIQUE,
                connection_status VARCHAR(50) DEFAULT 'Pending',
                smartbank_status VARCHAR(50) DEFAULT 'Pending',
                shipment_status VARCHAR(50) DEFAULT 'Pending',
                webhook_status VARCHAR(50) DEFAULT 'Pending',
                marketplace_status VARCHAR(50) DEFAULT 'Pending',
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        console.log('Database table "integration_transactions" verified/created successfully.');

        // 3. Seed virtual partners
        await db.query(`
            INSERT IGNORE INTO marketplace_partners (id, name, api_key, secret_token, status)
            VALUES 
            (999, 'API Gateway (Praktikum)', 'lsk_key_api_gateway', 'secret_gateway', 'active'),
            (998, 'SmartBank (Praktikum)', 'lsk_key_smartbank', 'secret_smartbank', 'active'),
            (997, 'Marketplace (Praktikum)', 'lsk_key_marketplace', 'secret_marketplace', 'active')
        `);
        console.log('Virtual integration partners seeded successfully.');

    } catch (err) {
        console.error('Database initialization failed:', err);
    }
}

initDB();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// =====================================================
// ROUTE: Swagger API Documentation
// =====================================================
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// =====================================================
// ROUTE: Halaman Frontend (Static HTML)
// =====================================================
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'gateway.html'));
});

// =====================================================
// ROUTE: Gateway Masuk (Form SmartBank ID)
// Base URL: /gateway/...
// =====================================================
app.use('/gateway', gatewayRoutes);

// =====================================================
// ROUTE: B2B API Endpoints (Mitra Bisnis via API Key)
// Base URL: /api/v1/...
// =====================================================
app.use('/api/v1', apiRoutes);

// =====================================================
// ROUTE: Internal Admin Dashboard API
// Base URL: /internal/...
// =====================================================
app.use('/internal', internalRoutes);

// =====================================================
// ROUTE: Multi-Role System
// =====================================================
app.use('/auth', authRoutes);
app.use('/internal/dispatcher', dispatcherRoutes);
app.use('/customer', customerDashRoutes);
app.use('/superadmin', superadminRoutes);

// =====================================================
// ROUTE: Legacy (Kompatibel dengan frontend lama)
// =====================================================
app.use('/logistikita', logistikRoutes);
app.use('/admin', adminRoutes);
app.use('/user', userRoutes);

// =====================================================
// ROUTE: Pembayaran Terpusat (Microservices Pattern)
// Frontend memanggil POST /api/bayar-ongkir
// Backend forward ke API Gateway/Integrator
// =====================================================
const logistikController = require('./controllers/logistikController');
app.post('/api/bayar-ongkir', logistikController.bayarOngkir);

// =====================================================
// MOCK WEBHOOK RECEIVER (Simulasi Integrasi Mitra)
// =====================================================
const mockWebhooks = [];

app.post('/webhook/tokobagus', (req, res) => {
    const payload = req.body;
    console.log('[Webhook Received]', payload);
    mockWebhooks.unshift({
        received_at: new Date().toISOString(),
        payload: payload
    });
    // Simpan maksimal 50 log terakhir
    if (mockWebhooks.length > 50) mockWebhooks.pop();
    res.status(200).json({ status: 'OK', message: 'Webhook received' });
});

app.get('/webhook/tokobagus/logs', (req, res) => {
    res.json({ status: 'Success', data: mockWebhooks });
});

// =====================================================
// MULTI-PORT SERVER — Setiap Role Punya Port Sendiri
// =====================================================
const ports = {
    customer:   3000,
    admin:      3001,
    superadmin: 3002,
    operator:   3003,
    kurir:      3004,
    simulator:  3005
};

app.listen(ports.customer, () => {
    console.log(`\n========================================`);
    console.log(`  LogistiKita Multi-Port Server`);
    console.log(`========================================`);
    console.log(`  🌐 Customer/Landing : http://localhost:${ports.customer}/`);
});

app.listen(ports.superadmin, () => {
    console.log(`  🛡️  Admin Dashboard   : http://localhost:${ports.superadmin}/superadmin-login.html`);
});
app.listen(ports.operator, () => {
    console.log(`  🏢 Operator Cabang   : http://localhost:${ports.operator}/operator-login.html`);
});
app.listen(ports.kurir, () => {
    console.log(`  🚚 Kurir Lapangan    : http://localhost:${ports.kurir}/kurir-login.html`);
});
app.listen(ports.simulator, () => {
    console.log(`  🏪 Simulator Mitra   : http://localhost:${ports.simulator}/partner-simulator.html`);
    console.log(`========================================\n`);
});
