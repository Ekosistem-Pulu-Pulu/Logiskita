const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkTables() {
    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            port: process.env.DB_PORT || 3306,
            database: process.env.DB_NAME || 'logistikita_db'
        });

        const [tables] = await connection.query(`SHOW TABLES`);
        console.log('Tables in database:');
        tables.forEach(t => {
            console.log(`  - ${Object.values(t)[0]}`);
        });
        
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        if (connection) await connection.end();
    }
}

checkTables();
