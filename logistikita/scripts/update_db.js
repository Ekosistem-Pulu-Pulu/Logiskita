const db = require('../db');
async function updateDb() {
    try {
        console.log("Altering table...");
        await db.execute("ALTER TABLE internal_users MODIFY COLUMN role ENUM('Admin', 'Kurir', 'Superadmin') NOT NULL DEFAULT 'Kurir'");
        console.log("Table altered. Inserting superadmin...");
        await db.execute("INSERT IGNORE INTO internal_users (email, password, nama, role, token) VALUES ('superadmin@logistikita.com', 'superadmin123', 'Chief Admin', 'Superadmin', 'logistikita-superadmin-token')");
        console.log("Superadmin inserted. Success!");
        process.exit(0);
    } catch (e) {
        console.error("Error updating DB:", e);
        process.exit(1);
    }
}
updateDb();
