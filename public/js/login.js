/**
 * Unified Login Logic for LogistiKita
 * Manages 5 roles authentication + Customer registration + Kurir registration
 */

// Quick credentials map for development/testing
const DEV_CREDENTIALS = {
    superadmin: { email: 'superadmin@logistikita.com', password: 'superadmin123' },
    branch: { email: 'op_jakarta@logistikita.com', password: 'operator123' },
    dispatcher: { email: 'dispatch.jkt@logistikita.com', password: 'dispatch123' },
    kurir: { email: 'andi.kurir@logistikita.com', password: 'kurir123' },
    customer: { email: 'rina@gmail.com', password: 'customer123' }
};

// Check if user is already logged in on load
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('adminToken');
    const currentUserStr = localStorage.getItem('currentUser');
    
    // Pastikan SEMUA data sesi lengkap untuk mencegah infinite loop
    if (token && currentUserStr) {
        try {
            const user = JSON.parse(currentUserStr);
            if (user && user.role) {
                // Auto redirect if already logged in
                redirectByRole(user.role);
                return;
            }
        } catch (e) {
            console.error('Invalid session data', e);
        }
    }
    
    // Bersihkan sisa sesi yang rusak jika ada
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminRole');
    localStorage.removeItem('currentUser');
});

// Load branches for kurir registration dropdown
async function loadBranchesForKurir() {
    try {
        const res = await fetch('/auth/branches');
        const data = await res.json();
        const select = document.getElementById('kurir-branch');
        
        if (data.status === 'Success' && data.data) {
            select.innerHTML = '<option value="">— Pilih Cabang Tujuan —</option>' + 
                data.data.map(b => `<option value="${b.id}">${b.name} — ${b.city}</option>`).join('');
        } else {
            select.innerHTML = '<option value="">Gagal memuat cabang</option>';
        }
    } catch (err) {
        console.error('[Load Branches Error]', err);
        document.getElementById('kurir-branch').innerHTML = '<option value="">Error memuat data</option>';
    }
}

// UI Toggles
function switchAuthTab(mode) {
    const tabLogin = document.getElementById('tab-login');
    const tabRegister = document.getElementById('tab-register');
    const tabKurir = document.getElementById('tab-kurir');
    const formLogin = document.getElementById('login-form');
    const formRegister = document.getElementById('register-form');
    const formKurir = document.getElementById('kurir-register-form');
    const alertBox = document.getElementById('alert-box');

    alertBox.style.display = 'none';

    // Reset all tabs
    tabLogin.classList.remove('active');
    tabRegister.classList.remove('active');
    tabKurir.classList.remove('active');
    formLogin.style.display = 'none';
    formRegister.style.display = 'none';
    formKurir.style.display = 'none';

    if (mode === 'login') {
        tabLogin.classList.add('active');
        formLogin.style.display = 'block';
        document.body.className = '';
    } else if (mode === 'register') {
        tabRegister.classList.add('active');
        formRegister.style.display = 'block';
        document.body.className = 'role-customer';
    } else if (mode === 'kurir') {
        tabKurir.classList.add('active');
        formKurir.style.display = 'block';
        document.body.className = 'role-kurir';
        // Load branches when kurir tab is shown
        loadBranchesForKurir();
    }
}

function toggleDevAccordion() {
    const devGrid = document.getElementById('dev-accordion-grid');
    const chevron = document.getElementById('dev-chevron');
    
    devGrid.classList.toggle('open');
    if (devGrid.classList.contains('open')) {
        chevron.style.transform = 'rotate(180deg)';
    } else {
        chevron.style.transform = 'rotate(0deg)';
    }
}

// Quick autofill & submit
function quickLogin(role) {
    const creds = DEV_CREDENTIALS[role];
    if (!creds) return;

    // Switch to login tab first
    switchAuthTab('login');

    // Change body color accent for beautiful visual transition
    document.body.className = `role-${role}`;

    document.getElementById('login-email').value = creds.email;
    document.getElementById('login-password').value = creds.password;

    showAlert(`Autofill ${role.toUpperCase()} success. Logging in...`, 'success');

    // Small delay to let user see autofill before submission
    setTimeout(() => {
        document.getElementById('login-form').dispatchEvent(new Event('submit'));
    }, 400);
}

// Handle standard email/pass login
async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    const btnSubmit = document.getElementById('btn-submit-login');

    if (!email || !password) {
        showAlert('Email dan password harus diisi', 'danger');
        return;
    }

    // UI Loading state
    btnSubmit.disabled = true;
    btnSubmit.innerHTML = `<i class="fas fa-spinner fa-spin"></i> <span>Sedang memproses...</span>`;

    try {
        const response = await fetch('/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const result = await response.json();

        if (response.ok && result.status === 'Success') {
            showAlert('Login Berhasil! Mengalihkan...', 'success');
            
            // Set localStorage items
            localStorage.setItem('adminToken', result.token);
            localStorage.setItem('adminRole', result.data.role);
            localStorage.setItem('currentUser', JSON.stringify(result.data));

            // Small delay to allow the success alert to show
            setTimeout(() => {
                window.location.href = result.redirect_url;
            }, 1000);
        } else {
            showAlert(result.message || 'Login gagal. Email atau password salah.', 'danger');
            btnSubmit.disabled = false;
            btnSubmit.innerHTML = `<i class="fas fa-right-to-bracket"></i> <span>Masuk ke Dashboard</span>`;
        }
    } catch (err) {
        console.error(err);
        showAlert('Terjadi kesalahan koneksi ke server.', 'danger');
        btnSubmit.disabled = false;
        btnSubmit.innerHTML = `<i class="fas fa-right-to-bracket"></i> <span>Masuk ke Dashboard</span>`;
    }
}

// Handle customer registration
async function handleRegister(e) {
    e.preventDefault();
    const nama = document.getElementById('reg-nama').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const phone = document.getElementById('reg-phone').value.trim();
    const password = document.getElementById('reg-password').value;
    const btnSubmit = document.getElementById('btn-submit-register');

    btnSubmit.disabled = true;
    btnSubmit.innerHTML = `<i class="fas fa-spinner fa-spin"></i> <span>Mendaftarkan...</span>`;

    try {
        const response = await fetch('/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nama, email, phone, password })
        });

        const result = await response.json();

        if (response.ok && result.status === 'Success') {
            showAlert('Registrasi berhasil! Silakan login.', 'success');
            document.getElementById('register-form').reset();
            
            setTimeout(() => {
                switchAuthTab('login');
                document.getElementById('login-email').value = email;
                document.getElementById('login-password').focus();
            }, 1500);
        } else {
            showAlert(result.message || 'Registrasi gagal.', 'danger');
            btnSubmit.disabled = false;
            btnSubmit.innerHTML = `<i class="fas fa-user-plus"></i> <span>Daftar Akun Baru</span>`;
        }
    } catch (err) {
        console.error(err);
        showAlert('Terjadi kesalahan koneksi ke server.', 'danger');
        btnSubmit.disabled = false;
        btnSubmit.innerHTML = `<i class="fas fa-user-plus"></i> <span>Daftar Akun Baru</span>`;
    }
}

// Handle kurir registration
async function handleRegisterKurir(e) {
    e.preventDefault();
    const nama = document.getElementById('kurir-nama').value.trim();
    const email = document.getElementById('kurir-email').value.trim();
    const phone = document.getElementById('kurir-phone').value.trim();
    const branch_id = document.getElementById('kurir-branch').value;
    const password = document.getElementById('kurir-password').value;
    const btnSubmit = document.getElementById('btn-submit-kurir');

    if (!branch_id) {
        showAlert('Silakan pilih cabang tujuan terlebih dahulu.', 'danger');
        return;
    }

    btnSubmit.disabled = true;
    btnSubmit.innerHTML = `<i class="fas fa-spinner fa-spin"></i> <span>Mendaftarkan...</span>`;

    try {
        const response = await fetch('/auth/register-kurir', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nama, email, phone, branch_id: parseInt(branch_id), password })
        });

        const result = await response.json();

        if (response.ok && result.status === 'Success') {
            showAlert(result.message || 'Pendaftaran kurir berhasil! Menunggu approval operator cabang.', 'success');
            document.getElementById('kurir-register-form').reset();
            
            // Reload branches dropdown
            loadBranchesForKurir();
        } else {
            showAlert(result.message || 'Pendaftaran gagal.', 'danger');
        }
    } catch (err) {
        console.error(err);
        showAlert('Terjadi kesalahan koneksi ke server.', 'danger');
    } finally {
        btnSubmit.disabled = false;
        btnSubmit.innerHTML = `<i class="fas fa-motorcycle"></i> <span>Daftar Sebagai Kurir</span>`;
    }
}

// Helpers
function showAlert(message, type) {
    const alertBox = document.getElementById('alert-box');
    alertBox.className = `alert-box ${type}`;
    alertBox.innerHTML = message;
    alertBox.style.display = 'block';
}

function redirectByRole(role) {
    switch (role) {
        case 'Superadmin': window.location.href = '/superadmin.html'; break;
        case 'Admin': window.location.href = '/superadmin.html'; break;
        case 'Branch Admin': window.location.href = '/branch-dashboard.html'; break;
        case 'Dispatcher': window.location.href = '/dispatcher-dashboard.html'; break;
        case 'Kurir': window.location.href = '/kurir.html'; break;
        case 'Customer': window.location.href = '/customer-dashboard.html'; break;
        default: window.location.href = '/';
    }
}
