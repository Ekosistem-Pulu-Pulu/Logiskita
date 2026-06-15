const verifyAuth = require('./verifyAuth');

// Middleware: Validasi Branch Admin
// Mengizinkan Branch Admin, Admin biasa, dan Superadmin
module.exports = verifyAuth('Branch Admin', 'Admin', 'Superadmin');
