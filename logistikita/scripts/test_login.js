const db = require('../db');
async function testLogin() {
    try {
        console.log("Checking DB for superadmin@logistikita.com...");
        const [rows] = await db.execute("SELECT id, email, password, nama, role, token, is_active FROM internal_users WHERE email = 'superadmin@logistikita.com'");
        console.log("Result:", rows);

        console.log("Checking login query...");
        const email = 'superadmin@logistikita.com';
        const password = 'superadmin123';
        const [loginRows] = await db.execute(
            `SELECT id, email, nama, role, token FROM internal_users 
             WHERE email = ? AND password = ? AND role IN ('Admin', 'Superadmin') AND is_active = 1`,
            [email, password]
        );
        console.log("Login Result:", loginRows);
        
        process.exit(0);
    } catch (e) {
        console.error("Error:", e);
        process.exit(1);
    }
}
testLogin();
