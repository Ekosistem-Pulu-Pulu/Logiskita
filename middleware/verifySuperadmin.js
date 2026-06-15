const verifyAuth = require('./verifyAuth');

// Middleware: Validasi Superadmin
// Hanya mengizinkan Superadmin
module.exports = verifyAuth('Superadmin');
