const API_URL = "http://localhost:3000/logistikita";

// Handle form submission
document.addEventListener('DOMContentLoaded', () => {
    const formRequest = document.getElementById('form-request');
    
    if (formRequest) {
        // Pre-fill user_id if logged in
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        if (currentUser.user_id) {
            document.getElementById('user_id').value = currentUser.user_id;
            document.getElementById('user_id').readOnly = true; // Opsional: cegah diubah
        }

        formRequest.addEventListener('submit', async (e) => {
            e.preventDefault();
            await submitPengiriman();
        });
    }
});

async function submitPengiriman() {
    const userId = document.getElementById('user_id').value.trim();
    const alamat = document.getElementById('alamat').value.trim();
    const jarak = document.getElementById('jarak').value.trim();

    // Validasi
    if (!userId || !alamat || !jarak) {
        showAlert('Semua field harus diisi!', false);
        return;
    }

    try {
        const response = await fetch(`${API_URL}/request_pengiriman`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_id: userId,
                alamat: alamat,
                jarak: parseFloat(jarak)
            })
        });

        const result = await response.json();

        if (result.status === 'Success') {
            // Simpan data order ke localStorage
            localStorage.setItem('currentOrder', JSON.stringify(result.data));
            
            showAlert(`✓ Pengiriman berhasil dibuat! Order ID: ${result.data.order_id}`, true);
            
            // Redirect ke dashboard setelah 2 detik
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 2000);
        } else {
            showAlert(`✗ Error: ${result.message}`, false);
        }
    } catch (error) {
        console.error('Error:', error);
        showAlert('✗ Gagal terhubung ke server', false);
    }
}

function showAlert(message, success) {
    const alertBox = document.getElementById('alert-box');
    alertBox.textContent = message;
    alertBox.className = 'alert-message ' + (success ? 'success' : 'error');
    
    // Auto hide after 5 seconds
    setTimeout(() => {
        alertBox.className = 'alert-message';
    }, 5000);
}
