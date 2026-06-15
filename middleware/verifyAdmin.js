const verifyAuth = require('./verifyAuth');

// Middleware: Validasi Admin Internal
// Mengizinkan Superadmin dan Admin biasa
module.exports = verifyAuth('Admin', 'Superadmin');
