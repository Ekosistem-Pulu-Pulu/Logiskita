// ============================================================
// Gateway.js - Halaman 1: Form Cek Dashboard Pengiriman
// Submit SmartBank ID → lookup profil & riwayat → redirect dashboard
// ============================================================

const API_URL = 'http://localhost:3000';

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('gateway-form');
    const input = document.getElementById('smartbank-id');
    const submitBtn = document.getElementById('gateway-submit-btn');
    const alertBox = document.getElementById('gateway-alert');

    // Focus animation
    input.addEventListener('focus', () => {
        document.querySelector('.gateway-input-wrapper').classList.add('focused');
    });
    input.addEventListener('blur', () => {
        document.querySelector('.gateway-input-wrapper').classList.remove('focused');
    });

    // Form submit
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const userId = input.value.trim();

        if (!userId) {
            showAlert('Silakan masukkan ID SmartBank Anda.', 'error');
            return;
        }

        // Set loading state
        setLoading(true);
        hideAlert();

        try {
            const response = await fetch(`${API_URL}/gateway/lookup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: userId })
            });

            const result = await response.json();

            if (result.status === 'Success') {
                // Simpan data ke sessionStorage untuk digunakan di dashboard
                sessionStorage.setItem('gateway_data', JSON.stringify(result.data));
                sessionStorage.setItem('smartbank_id', userId);

                showAlert(`✓ ${result.message} Mengalihkan ke dasbor...`, 'success');

                // Redirect ke dashboard setelah 1.2 detik
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1200);
            } else {
                showAlert(`✗ ${result.message}`, 'error');
                setLoading(false);
            }
        } catch (error) {
            showAlert('✗ Gagal terhubung ke server. Pastikan server berjalan.', 'error');
            setLoading(false);
        }
    });

    function showAlert(message, type) {
        alertBox.textContent = message;
        alertBox.className = `gateway-alert ${type}`;
        alertBox.style.display = 'block';
    }

    function hideAlert() {
        alertBox.style.display = 'none';
        alertBox.className = 'gateway-alert';
    }

    function setLoading(isLoading) {
        const icon = submitBtn.querySelector('i');
        const span = submitBtn.querySelector('span');
        if (isLoading) {
            submitBtn.disabled = true;
            icon.className = 'fas fa-spinner fa-spin';
            span.textContent = 'Memverifikasi...';
        } else {
            submitBtn.disabled = false;
            icon.className = 'fas fa-arrow-right-to-bracket';
            span.textContent = 'Akses Dasbor';
        }
    }

    // Create floating particles
    createParticles();
});

function createParticles() {
    const container = document.getElementById('particles');
    if (!container) return;
    for (let i = 0; i < 30; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 8 + 's';
        particle.style.animationDuration = (6 + Math.random() * 10) + 's';
        particle.style.width = particle.style.height = (2 + Math.random() * 4) + 'px';
        container.appendChild(particle);
    }
}
