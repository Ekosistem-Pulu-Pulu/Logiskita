const db = require('./db');
(async () => {
  try {
    const [rows] = await db.query('DESCRIBE shipments');
    console.log(JSON.stringify(rows, null, 2));
  } catch (e) {
    console.error('Error:', e);
  } finally {
    process.exit();
  }
})();
