const ADMIN_LOGIN_URL = 'http://localhost:3000/internal/login';

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('admin-login-form');
    if (form) {
        form.addEventListener('submit', async (event) => {
            event.preventDefault();
            await handleAdminLogin();
        });
    }
});

async function handleAdminLogin() {
    const email = document.getElementById('admin-username').value.trim();
    const password = document.getElementById('admin-password').value.trim();
    const alertBox = document.getElementById('login-alert-box');

    alertBox.className = 'alert-message';
    alertBox.textContent = '';

    if (!email || !password) {
        alertBox.classList.add('error');
        alertBox.textContent = 'Email dan password wajib diisi.';
        return;
    }

    try {
        const response = await fetch(ADMIN_LOGIN_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const result = await response.json();

        if (result.status === 'Success') {
            localStorage.setItem('adminToken', result.token);
            localStorage.setItem('adminRole', result.data.role); // Simpan role
            
            if (result.data.role === 'Kurir') {
                window.location.href = 'kurir.html';
            } else {
                window.location.href = 'admin.html';
            }
        } else {
            alertBox.classList.add('error');
            alertBox.textContent = `✗ ${result.message}`;
        }
    } catch (error) {
        alertBox.classList.add('error');
        alertBox.textContent = '✗ Gagal terhubung ke server. Coba lagi.';
    }
}
