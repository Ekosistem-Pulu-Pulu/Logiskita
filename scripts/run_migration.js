const fs = require('fs');
const path = require('path');
const db = require('./db');

async function runMigration() {
    try {
        const sql = fs.readFileSync(path.join(__dirname, 'database', '2026_05_marketplace_migration.sql'), 'utf8');
        
        // Split by semicolon, but this is a simple naive split. 
        // We'll execute statements one by one.
        const statements = sql.split(';').map(s => s.trim()).filter(s => s.length > 0);
        
        for (const stmt of statements) {
            console.log(`Executing: ${stmt.substring(0, 50)}...`);
            try {
                await db.query(stmt);
            } catch (err) {
                if (err.code === 'ER_DUP_FIELDNAME') {
                    console.log('Column already exists, skipping...');
                } else {
                    console.error('Error executing statement:', err);
                }
            }
        }
        console.log('Migration completed.');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

runMigration();
