const verifyAuth = require('./verifyAuth');

// Middleware: Validasi Kurir
// Hanya mengizinkan Kurir
module.exports = verifyAuth('Kurir');
