const fs = require('fs');
const pool = require('../db');

async function runMigration() {
    try {
        const files = [
            './database/setup_logistik_db.sql',
            './database/migration_jnt_mini.sql',
            './database/migration_branches.sql'
        ];

        for (const file of files) {
            console.log(`\n--- Running ${file} ---`);
            const sql = fs.readFileSync(file, 'utf8');
            const statements = sql.split(';').filter(stmt => stmt.trim() !== '');
            
            for (let stmt of statements) {
                // simple way to skip DELIMITER or comments if needed, but standard splits are fine
                if (stmt.trim().startsWith('--')) continue;
                try {
                    await pool.query(stmt);
                } catch (err) {
                    if (err.code !== 'ER_DUP_FIELDNAME' && err.code !== 'ER_DUP_ENTRY') {
                        console.error('Error executing:', stmt.substring(0, 50));
                        console.error(err.message);
                    }
                }
            }
            console.log(`Success ${file}`);
        }
        
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        process.exit();
    }
}

runMigration();
