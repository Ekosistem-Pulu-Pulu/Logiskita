// Middleware: Validasi API Key dari Mitra Bisnis (Marketplace/Supplier)
// Setara dengan Laravel Sanctum untuk token-based auth
const db = require('../db');

async function verifyApiKey(req, res, next) {
    const apiKey = req.headers['x-api-key'] || extractBearerToken(req.headers['authorization']);

    if (!apiKey) {
        return res.status(401).json({
            status: 'Error',
            message: 'API Key tidak disertakan. Sertakan di header x-api-key atau Authorization: Bearer <api_key>'
        });
    }

    try {
        // 1. Try to find in marketplace_partners
        let [rows] = await db.execute(
            'SELECT id, name, api_key, webhook_secret, callback_url, status FROM marketplace_partners WHERE api_key = ?',
            [apiKey]
        );

        let partnerData = null;

        if (rows.length > 0) {
            partnerData = { ...rows[0] };
            // Find corresponding partner in partners table to ensure foreign key constraints are met
            const [pRows] = await db.execute(
                'SELECT id, smartbank_account_no FROM partners WHERE api_key = ? OR nama_mitra = ? LIMIT 1',
                [apiKey, partnerData.name]
            );
            if (pRows.length > 0) {
                partnerData.smartbank_account_no = pRows[0].smartbank_account_no;
                // Override partnerData.id with the ID from the partners table,
                // as shipments.partner_id references partners(id)
                partnerData.id = pRows[0].id;
            } else {
                // Not found in partners, insert it on the fly to satisfy foreign key constraint
                const [insertRes] = await db.execute(
                    'INSERT INTO partners (nama_mitra, api_key, smartbank_account_no, webhook_url, is_active) VALUES (?, ?, ?, ?, ?)',
                    [partnerData.name, apiKey, 'SB-ACC-001', partnerData.callback_url || null, 1]
                );
                partnerData.smartbank_account_no = 'SB-ACC-001';
                partnerData.id = insertRes.insertId;
            }
        } else {
            // 2. Try to find in legacy partners table as fallback
            const [pRows] = await db.execute(
                'SELECT id, nama_mitra, api_key, webhook_url, smartbank_account_no, is_active FROM partners WHERE api_key = ?',
                [apiKey]
            );
            if (pRows.length > 0) {
                const p = pRows[0];
                partnerData = {
                    id: p.id,
                    name: p.nama_mitra,
                    api_key: p.api_key,
                    webhook_secret: null,
                    callback_url: p.webhook_url,
                    status: p.is_active ? 'active' : 'inactive',
                    smartbank_account_no: p.smartbank_account_no
                };
            }
        }

        if (!partnerData) {
            return res.status(401).json({
                status: 'Error',
                message: 'API Key tidak valid'
            });
        }

        if (partnerData.status !== 'active') {
            return res.status(403).json({
                status: 'Error',
                message: 'Akun mitra bisnis Anda telah dinonaktifkan. Hubungi admin LogistiKita.'
            });
        }

        // Update last_access_at and updated_at asynchronously
        db.execute('UPDATE marketplace_partners SET last_access_at = NOW() WHERE api_key = ?', [apiKey]).catch(() => {});
        db.execute('UPDATE partners SET updated_at = NOW() WHERE api_key = ?', [apiKey]).catch(() => {});

        req.partner = partnerData;
        next();
    } catch (error) {
        console.error('[API Key Auth Error]', error);
        return res.status(500).json({
            status: 'Error',
            message: 'Gagal memvalidasi API Key'
        });
    }
}

function extractBearerToken(authHeader) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
    return authHeader.substring(7);
}

module.exports = verifyApiKey;
