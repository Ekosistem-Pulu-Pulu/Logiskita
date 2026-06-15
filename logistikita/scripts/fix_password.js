const db = require('../db');
async function update() {
    try {
        await db.execute("UPDATE internal_users SET password='superadmin123' WHERE email='superadmin@logistikita.com'");
        console.log("Password superadmin telah diupdate!");
        process.exit(0);
    } catch(e) {
        console.error(e);
        process.exit(1);
    }
}
update();
