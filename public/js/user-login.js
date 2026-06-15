const USER_LOGIN_URL = 'http://localhost:3000/user/login';

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('user-login-form');
    if (form) {
        form.addEventListener('submit', async (event) => {
            event.preventDefault();
            await handleUserLogin();
        });
    }
});

async function handleUserLogin() {
    const userId = document.getElementById('user-id').value.trim();
    const password = document.getElementById('user-password').value.trim();
    const alertBox = document.getElementById('login-alert-box');

    alertBox.className = 'alert-message';
    alertBox.textContent = '';

    if (!userId || !password) {
        alertBox.classList.add('error');
        alertBox.textContent = 'User ID dan password wajib diisi.';
        return;
    }

    try {
        const response = await fetch(USER_LOGIN_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: userId, password: password })
        });

        const result = await response.json();

        if (result.status === 'Success') {
            // Simpan data user ke localStorage
            localStorage.setItem('currentUser', JSON.stringify(result.data));
            
            // Redirect ke dashboard
            window.location.href = 'dashboard.html';
        } else {
            alertBox.classList.add('error');
            alertBox.textContent = `✗ ${result.message}`;
        }
    } catch (error) {
        alertBox.classList.add('error');
        alertBox.textContent = '✗ Gagal terhubung ke server. Coba lagi.';
    }
}
