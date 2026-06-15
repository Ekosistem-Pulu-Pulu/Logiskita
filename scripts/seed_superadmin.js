const mysql = require("mysql2/promise");
async function seed() {
    const conn = await mysql.createConnection({ host:"localhost", user:"root", password:"", database:"logistikita_db" });
    try {
        await conn.execute("ALTER TABLE internal_users MODIFY COLUMN role ENUM('Superadmin','Admin','Kurir') NOT NULL DEFAULT 'Kurir'");
        console.log("ENUM updated");
    } catch(e) { console.log("ENUM note:", e.message); }
    try {
        await conn.execute("INSERT IGNORE INTO internal_users (email, password, nama, role, token, is_active) VALUES (?, ?, ?, ?, ?, 1)", 
            ["superadmin@logistikita.com","super123","Super Administrator","Superadmin","logistikita-superadmin-token-2026"]);
        console.log("Superadmin seeded!");
    } catch(e) { console.log("Seed error:", e.message); }
    const [rows] = await conn.execute("SELECT id, email, nama, role, is_active FROM internal_users");
    console.table(rows);
    await conn.end();
}
seed().catch(console.error);
