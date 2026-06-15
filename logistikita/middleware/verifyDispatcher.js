const verifyAuth = require('./verifyAuth');

// Middleware: Validasi Dispatcher
// Mengizinkan Dispatcher, Branch Admin, Admin, dan Superadmin
module.exports = verifyAuth('Dispatcher', 'Branch Admin', 'Admin', 'Superadmin');
