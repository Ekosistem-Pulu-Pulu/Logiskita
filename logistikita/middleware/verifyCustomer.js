const verifyAuth = require('./verifyAuth');

// Middleware: Validasi Customer
// Hanya mengizinkan Customer (dan Superadmin untuk debugging)
module.exports = verifyAuth('Customer', 'Superadmin');
