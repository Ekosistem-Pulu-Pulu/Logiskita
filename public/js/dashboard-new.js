// ============================================================
// Dashboard-new.js - Halaman 2: User Panel (Dasbor UMKM)
// - 4 cards = Detail View monitors (diisi saat klik "Cek Detail")
// - Grand Total card untuk pembayaran terpusat
// - Modal popup untuk "+ Pengiriman Baru"
// - Toast notification system
// ============================================================

const API_URL = 'http://localhost:3000';
let currentUserId = null;
let gatewayData = null;
let selectedOrderId = null;  // Order yang sedang ditampilkan di cards
let toastTimer = null;       // Timer untuk auto-hide toast

document.addEventListener('DOMContentLoaded', () => {
    const storedData = sessionStorage.getItem('gateway_data');
    currentUserId = sessionStorage.getItem('smartbank_id');

    if (!storedData || !currentUserId) {
        window.location.href = 'gateway.html';
        return;
    }

    gatewayData = JSON.parse(storedData);

    renderProfile(gatewayData.profil_umkm);
    renderHistory(gatewayData.riwayat_pengiriman);
    bindEvents();

    // Auto-select the latest order if available
    if (gatewayData.latest_order) {
        populateCards(gatewayData.latest_order);
    }
});

// ============================================================
// RENDER: Profil UMKM
// ============================================================
function renderProfile(profil) {
    if (!profil) return;
    document.getElementById('profile-nama-usaha').textContent = profil.nama_usaha;
    document.getElementById('profile-pemilik').textContent = profil.pemilik;
    document.getElementById('profile-jenis-usaha').textContent = profil.jenis_usaha;
    document.getElementById('profile-alamat').textContent = profil.alamat_penjemputan;
    document.getElementById('profile-telepon').textContent = profil.no_telepon;
    document.getElementById('profile-email').textContent = profil.email;
    document.getElementById('profile-smartbank-id').textContent = profil.smartbank_id;
}

// ============================================================
// RENDER: Tabel Riwayat Pengiriman
// ============================================================
function renderHistory(riwayat) {
    const tbody = document.getElementById('history-tbody');
    const emptyMsg = document.getElementById('history-empty');

    if (!riwayat || riwayat.length === 0) {
        tbody.innerHTML = '';
        emptyMsg.style.display = 'flex';
        return;
    }

    emptyMsg.style.display = 'none';
    tbody.innerHTML = riwayat.map((item, index) => `
        <tr class="${item.order_id === selectedOrderId ? 'row-active' : ''}" id="row-${item.order_id}">
            <td>${index + 1}</td>
            <td><code>${item.order_id}</code></td>
            <td>${formatDate(item.tanggal_request)}</td>
            <td class="address-cell-dash">${truncate(item.alamat_tujuan, 35)}</td>
            <td>${formatCurrency(item.ongkir)}</td>
            <td><span class="badge ${getBadgeClass('payment', item.status_pembayaran)}">${item.status_pembayaran}</span></td>
            <td><span class="badge ${getBadgeClass('shipping', item.status_pengiriman)}">${item.status_pengiriman}</span></td>
            <td>
                <button class="detail-btn ${item.order_id === selectedOrderId ? 'detail-btn-active' : ''}" onclick="handleCekDetail('${item.order_id}')">
                    <i class="fas fa-eye"></i> Cek Detail
                </button>
            </td>
        </tr>
    `).join('');
}

// ============================================================
// POPULATE CARDS: Fill all 4 cards + Grand Total with order data
// ============================================================
function populateCards(order) {
    if (!order) return;
    selectedOrderId = order.order_id;

    // Update indicator
    const indicator = document.getElementById('kpi-active-indicator');
    indicator.innerHTML = `
        <i class="fas fa-tv"></i>
        <span>Menampilkan Detail: <strong>${order.order_id}</strong> — ${truncate(order.alamat, 40)}</span>
    `;
    indicator.classList.add('active');

    // Highlight active row in table
    document.querySelectorAll('.history-table tbody tr').forEach(r => r.classList.remove('row-active'));
    document.querySelectorAll('.detail-btn').forEach(b => b.classList.remove('detail-btn-active'));
    const activeRow = document.getElementById(`row-${order.order_id}`);
    if (activeRow) {
        activeRow.classList.add('row-active');
        activeRow.querySelector('.detail-btn')?.classList.add('detail-btn-active');
    }

    // Card 1: Tracking Status
    setVal('track-order-id', order.order_id);
    showResult('tracking-result', `
        <strong>📍 Status Terkini</strong><br>
        Order: <code>${order.order_id}</code><br>
        Status: <span class="result-highlight">${order.status}</span><br>
        Alamat: ${truncate(order.alamat, 50)}<br>
        <button id="btn-open-map" class="kpi-action-btn" style="margin-top:10px; background: linear-gradient(135deg, #22c9a8, #1a9e80); padding: 6px 12px; font-size: 0.8rem;">
            <i class="fas fa-map"></i> Lihat Peta (Live)
        </button>
    `, true);

    // Bind event for the new dynamic button
    setTimeout(() => {
        const btnMap = document.getElementById('btn-open-map');
        if(btnMap) btnMap.addEventListener('click', () => openTrackingMap(order.order_id));
    }, 100);

    // Card 2: Biaya Pengiriman
    setVal('calc-jarak', order.jarak);
    const ongkir = parseFloat(order.ongkir) || 0;
    const fee = ongkir * 0.05;
    showResult('biaya-result', `
        <strong>💰 Rincian Biaya</strong><br>
        Jarak: ${order.jarak} km<br>
        Ongkir: <span class="result-highlight-green">${formatCurrency(ongkir)}</span><br>
        Fee Layanan (5%): ${formatCurrency(fee)}<br>
        <strong>Total: ${formatCurrency(ongkir + fee)}</strong>
    `, true);

    // Card 3: Pembayaran SmartBank (Info Only)
    const isPaid = order.pembayaran === 'Lunas';
    if (isPaid) {
        showResult('payment-result', `
            <strong>✅ Pembayaran Lunas</strong><br>
            Order <code>${order.order_id}</code> sudah terbayar via SmartBank.
        `, true);
    } else {
        showResult('payment-result', `
            <strong>⏳ Menunggu Pembayaran</strong><br>
            Order <code>${order.order_id}</code><br>
            Nominal: <span class="result-highlight">${formatCurrency(ongkir)}</span>
        `, false);
    }

    // Card 4: Biaya Layanan (Info Only)
    showResult('fee-result', `
        <strong>📋 Info Layanan</strong><br>
        Nominal: ${formatCurrency(ongkir)}<br>
        Fee (5%): <span class="result-highlight-purple">${formatCurrency(fee)}</span><br>
        <strong>Total setelah fee: ${formatCurrency(ongkir + fee)}</strong>
    `, true);

    // =========================================
    // Grand Total Card — Populate with data
    // =========================================
    const grandTotal = ongkir + fee;
    document.getElementById('gt-ongkir').textContent = formatCurrency(ongkir);
    document.getElementById('gt-fee').textContent = formatCurrency(fee);
    document.getElementById('gt-grand-total').textContent = formatCurrency(grandTotal);

    // Hidden data for payment submission
    document.getElementById('gt-order-id').value = order.order_id;
    document.getElementById('gt-user-id').value = currentUserId;
    document.getElementById('gt-nominal').value = grandTotal;

    // Update status indicator and button state
    const statusEl = document.getElementById('status-pembayaran');
    const btnBayar = document.getElementById('btn-bayar-total');

    if (isPaid) {
        statusEl.innerHTML = '<i class="fas fa-check-circle"></i> Lunas';
        statusEl.className = 'status-pembayaran lunas';
        btnBayar.disabled = true;
        btnBayar.innerHTML = '<i class="fas fa-check-circle"></i> <span>Sudah Dibayar</span>';
        btnBayar.classList.add('paid');
    } else {
        statusEl.innerHTML = '<i class="fas fa-clock"></i> Menunggu Pembayaran';
        statusEl.className = 'status-pembayaran menunggu';
        btnBayar.disabled = false;
        btnBayar.innerHTML = '<i class="fas fa-money-bill-wave"></i> <span>Bayar Sekaligus via SmartBank</span> <div class="btn-shine"></div>';
        btnBayar.classList.remove('paid');
    }

    // Add pulse animation to cards
    document.querySelectorAll('.kpi-card-new').forEach(card => {
        card.classList.remove('card-pulse');
        void card.offsetWidth; // force reflow
        card.classList.add('card-pulse');
    });
    // Pulse the grand total card too
    const gtCard = document.getElementById('card-grand-total');
    gtCard.classList.remove('card-pulse');
    void gtCard.offsetWidth;
    gtCard.classList.add('card-pulse');
}

// ============================================================
// EVENT BINDINGS
// ============================================================
function bindEvents() {
    document.getElementById('btn-track').addEventListener('click', handleTracking);
    document.getElementById('btn-calc-ongkir').addEventListener('click', handleCalcOngkir);
    document.getElementById('btn-bayar-total').addEventListener('click', handleBayarTotal);
    document.getElementById('btn-refresh-history').addEventListener('click', handleRefresh);
    document.getElementById('btn-logout').addEventListener('click', handleLogout);

    // Modal: Open
    document.getElementById('btn-open-new-order').addEventListener('click', openModal);
    document.getElementById('btn-open-new-order-2').addEventListener('click', openModal);

    // Modal: Close
    document.getElementById('modal-close').addEventListener('click', closeModal);
    document.getElementById('modal-overlay').addEventListener('click', (e) => {
        if (e.target === e.currentTarget) closeModal();
    });
    
    document.getElementById('map-modal-close').addEventListener('click', closeMapModal);
    document.getElementById('map-modal').addEventListener('click', (e) => {
        if (e.target === e.currentTarget) closeMapModal();
    });

    // Modal: Form submit
    document.getElementById('form-new-order').addEventListener('submit', handleNewOrder);

    // Modal: Live ongkir preview as user types jarak
    document.getElementById('new-jarak').addEventListener('input', updateOngkirPreview);

    // ESC key closes modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });
}

// ============================================================
// HANDLER: Cek Detail — populates all 4 cards + Grand Total
// ============================================================
async function handleCekDetail(orderId) {
    const btn = event?.target?.closest('button');
    if (btn) setButtonLoading(btn, true);

    try {
        const res = await fetch(`${API_URL}/logistikita/order/${orderId}`);
        const data = await res.json();

        if (data.status === 'Success') {
            populateCards(data.data);
            // Smooth scroll to cards section
            document.querySelector('.kpi-section').scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
            alert('Gagal mengambil detail: ' + data.message);
        }
    } catch (err) {
        alert('Gagal terhubung ke server');
    }

    if (btn) setButtonLoading(btn, false);
}

// ============================================================
// HANDLER: Tracking Status (manual from card)
// ============================================================
async function handleTracking() {
    const orderId = document.getElementById('track-order-id').value.trim();
    if (!orderId) return showResult('tracking-result', 'Masukkan Order ID', false);

    const btn = document.getElementById('btn-track');
    setButtonLoading(btn, true);

    try {
        const res = await fetch(`${API_URL}/logistikita/tracking_status`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ order_id: orderId, user_id: currentUserId })
        });
        const data = await res.json();

        if (data.status === 'Success') {
            showResult('tracking-result', `
                <strong>✓ Status Pengiriman</strong><br>
                Order: ${data.data.order_id}<br>
                Status: <span class="result-highlight">${data.data.status}</span>
            `, true);
        } else {
            showResult('tracking-result', `✗ ${data.message}`, false);
        }
    } catch (err) {
        showResult('tracking-result', '✗ Gagal terhubung ke server', false);
    }
    setButtonLoading(btn, false);
}

// ============================================================
// HANDLER: Biaya Pengiriman
// ============================================================
async function handleCalcOngkir() {
    const jarak = document.getElementById('calc-jarak').value.trim();
    if (!jarak) return showResult('biaya-result', 'Masukkan jarak yang valid', false);

    const btn = document.getElementById('btn-calc-ongkir');
    setButtonLoading(btn, true);

    try {
        const res = await fetch(`${API_URL}/logistikita/biaya_pengiriman`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ jarak: parseFloat(jarak), user_id: currentUserId })
        });
        const data = await res.json();

        if (data.status === 'Success') {
            showResult('biaya-result', `
                <strong>✓ Estimasi Biaya</strong><br>
                Jarak: ${jarak} km<br>
                Biaya: <span class="result-highlight-green">${formatCurrency(data.data.estimasi_biaya)}</span><br>
                Fee (5%): ${formatCurrency(data.data.biaya_layanan)}<br>
                <strong>Total: ${formatCurrency(data.data.total)}</strong>
            `, true);
        } else {
            showResult('biaya-result', `✗ ${data.message}`, false);
        }
    } catch (err) {
        showResult('biaya-result', '✗ Gagal terhubung ke server', false);
    }
    setButtonLoading(btn, false);
}

// ============================================================
// HANDLER: Bayar Sekaligus via SmartBank (Grand Total)
// POST ke /api/bayar-ongkir → backend forward ke API Gateway
// ============================================================
async function handleBayarTotal() {
    const orderId = document.getElementById('gt-order-id').value;
    const userId = document.getElementById('gt-user-id').value;
    const nominal = parseFloat(document.getElementById('gt-nominal').value);

    if (!orderId || !userId || !nominal || nominal <= 0) {
        showToast('error', 'Data Tidak Lengkap', 'Pilih order terlebih dahulu sebelum melakukan pembayaran.');
        return;
    }

    const btn = document.getElementById('btn-bayar-total');
    setButtonLoading(btn, true);

    // ✅ Show toast immediately after fetch is initiated
    showToast('info', 'Memproses Pembayaran...', 'Request API berhasil dikirim! Menunggu validasi SmartBank...', 0);

    try {
        const res = await fetch(`${API_URL}/api/bayar-ongkir`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                order_id: orderId,
                user_id: userId,
                nominal: nominal
            })
        });
        const data = await res.json();

        if (data.status === 'Success') {
            // ✅ Update toast to success
            showToast('success', 'Pembayaran Berhasil!', `Transaksi ${data.transaction_id || 'OK'} — ${formatCurrency(nominal)} telah dibayar via SmartBank.`, 5000);

            // ✅ DOM Manipulation: Update status to Lunas
            const statusEl = document.getElementById('status-pembayaran');
            statusEl.innerHTML = '<i class="fas fa-check-circle"></i> Lunas';
            statusEl.className = 'status-pembayaran lunas';

            // ✅ Disable the pay button
            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-check-circle"></i> <span>Sudah Dibayar</span>';
            btn.classList.add('paid');

            // ✅ Update Card 3 (Pembayaran SmartBank info)
            showResult('payment-result', `
                <strong>✅ Pembayaran Lunas</strong><br>
                Order <code>${orderId}</code> sudah terbayar via SmartBank.<br>
                Transaction ID: <code>${data.transaction_id || 'TRX-OK'}</code>
            `, true);

            // Refresh data after 2s
            setTimeout(handleRefresh, 2000);
        } else {
            showToast('error', 'Pembayaran Gagal', data.message || 'Terjadi kesalahan saat memproses pembayaran.');
            setButtonLoading(btn, false);
        }
    } catch (err) {
        showToast('error', 'Koneksi Gagal', 'Tidak dapat terhubung ke server. Periksa koneksi Anda.');
        setButtonLoading(btn, false);
    }
}

// ============================================================
// TOAST NOTIFICATION SYSTEM
// ============================================================
function showToast(type, title, message, duration = 4000) {
    const toast = document.getElementById('toast-notification');
    const toastIcon = document.getElementById('toast-icon');
    const toastTitle = document.getElementById('toast-title');
    const toastMessage = document.getElementById('toast-message');

    // Clear previous timer
    if (toastTimer) {
        clearTimeout(toastTimer);
        toastTimer = null;
    }

    // Set icon based on type
    const icons = {
        info: '<i class="fas fa-spinner fa-spin"></i>',
        success: '<i class="fas fa-check-circle"></i>',
        error: '<i class="fas fa-exclamation-triangle"></i>'
    };
    toastIcon.innerHTML = icons[type] || icons.info;
    toastTitle.textContent = title;
    toastMessage.textContent = message;

    // Reset classes and apply type
    toast.className = 'toast-notification-new';
    toast.classList.add(type);

    // Set progress bar duration
    toast.style.setProperty('--toast-duration', `${duration}ms`);
    const afterRule = duration > 0 ? `${duration / 1000}s` : '0s';
    toast.style.cssText = ''; // reset inline
    if (duration > 0) {
        toast.style.setProperty('--progress-duration', afterRule);
    }

    // Trigger show with slight delay for animation
    requestAnimationFrame(() => {
        toast.classList.add('show');
    });

    // Auto-hide after duration (if duration > 0)
    if (duration > 0) {
        toastTimer = setTimeout(() => {
            hideToast();
        }, duration);
    }
}

function hideToast() {
    const toast = document.getElementById('toast-notification');
    toast.classList.remove('show');
    if (toastTimer) {
        clearTimeout(toastTimer);
        toastTimer = null;
    }
}

// ============================================================
// MODAL: Open / Close
// ============================================================
function openModal() {
    const overlay = document.getElementById('modal-overlay');
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    // Reset form
    document.getElementById('form-new-order').reset();
    resetPreview();
    hideModalAlert();
}

function closeModal() {
    const overlay = document.getElementById('modal-overlay');
    overlay.classList.remove('open');
    document.body.style.overflow = '';
}

// ============================================================
// MODAL: Live ongkir preview
// ============================================================
function updateOngkirPreview() {
    const jarak = parseFloat(document.getElementById('new-jarak').value) || 0;
    if (jarak <= 0) {
        resetPreview();
        return;
    }
    const ongkir = jarak * 5000;
    const fee = ongkir * 0.05;
    const total = ongkir + fee;

    document.getElementById('preview-ongkir').textContent = formatCurrency(ongkir);
    document.getElementById('preview-fee').textContent = formatCurrency(fee);
    document.getElementById('preview-total').textContent = formatCurrency(total);
    document.getElementById('modal-preview').classList.add('visible');
}

function resetPreview() {
    document.getElementById('preview-ongkir').textContent = '—';
    document.getElementById('preview-fee').textContent = '—';
    document.getElementById('preview-total').textContent = '—';
    document.getElementById('modal-preview').classList.remove('visible');
}

// ============================================================
// MODAL: Submit new order
// ============================================================
async function handleNewOrder(e) {
    e.preventDefault();
    const alamat = document.getElementById('new-alamat').value.trim();
    const jarak = document.getElementById('new-jarak').value.trim();

    if (!alamat || !jarak || parseFloat(jarak) <= 0) {
        showModalAlert('Isi semua field dengan benar.', 'error');
        return;
    }

    const btn = document.getElementById('modal-submit-btn');
    setButtonLoading(btn, true);

    try {
        const res = await fetch(`${API_URL}/logistikita/request_pengiriman`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_id: currentUserId,
                alamat: alamat,
                jarak: parseFloat(jarak)
            })
        });
        const data = await res.json();

        if (data.status === 'Success') {
            showModalAlert(`✓ Pengiriman berhasil dibuat! Order ID: ${data.data.order_id}`, 'success');

            // Refresh data after 1.5s then close modal
            setTimeout(async () => {
                await handleRefresh();
                closeModal();
                // Auto-select the new order
                if (data.data.order_id) {
                    handleCekDetail(data.data.order_id);
                }
            }, 1500);
        } else {
            showModalAlert(`✗ ${data.message}`, 'error');
        }
    } catch (err) {
        showModalAlert('✗ Gagal terhubung ke server.', 'error');
    }

    setButtonLoading(btn, false);
}

function showModalAlert(message, type) {
    const el = document.getElementById('modal-alert');
    el.textContent = message;
    el.className = `modal-alert ${type}`;
    el.style.display = 'block';
}

function hideModalAlert() {
    const el = document.getElementById('modal-alert');
    el.style.display = 'none';
    el.className = 'modal-alert';
}

// ============================================================
// HANDLER: Refresh data
// ============================================================
async function handleRefresh() {
    const btn = document.getElementById('btn-refresh-history');
    setButtonLoading(btn, true);

    try {
        const res = await fetch(`${API_URL}/gateway/lookup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: currentUserId })
        });
        const data = await res.json();

        if (data.status === 'Success') {
            gatewayData = data.data;
            sessionStorage.setItem('gateway_data', JSON.stringify(data.data));
            renderHistory(data.data.riwayat_pengiriman);
        }
    } catch (err) {
        console.error('Refresh failed', err);
    }

    setButtonLoading(btn, false);
}

// ============================================================
// HANDLER: Logout
// ============================================================
function handleLogout() {
    sessionStorage.removeItem('gateway_data');
    sessionStorage.removeItem('smartbank_id');
    window.location.href = 'gateway.html';
}

// ============================================================
// UTILITY FUNCTIONS
// ============================================================
function showResult(elementId, message, isSuccess) {
    const el = document.getElementById(elementId);
    if (el) {
        el.innerHTML = message;
        el.className = `kpi-result ${isSuccess ? 'success' : 'error'}`;
    }
}

function setButtonLoading(btn, isLoading) {
    if (!btn) return;
    const icon = btn.querySelector('i');
    if (isLoading) {
        btn.disabled = true;
        if (icon) { btn.dataset.origIcon = icon.className; icon.className = 'fas fa-spinner fa-spin'; }
    } else {
        btn.disabled = false;
        if (icon && btn.dataset.origIcon) icon.className = btn.dataset.origIcon;
    }
}

function setVal(id, value) {
    const el = document.getElementById(id);
    if (el && value !== undefined && value !== null) el.value = value;
}

function formatCurrency(val) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val || 0);
}

function formatDate(dateStr) {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function truncate(text, max) {
    if (!text) return '-';
    return text.length > max ? text.substring(0, max) + '...' : text;
}

function getBadgeClass(type, status) {
    if (type === 'payment') {
        return { 'Lunas': 'badge-success', 'Belum Bayar': 'badge-warning', 'Gagal': 'badge-danger' }[status] || 'badge-default';
    }
    if (type === 'shipping') {
        return { 'Pending': 'badge-warning', 'Proses': 'badge-info', 'Dalam Perjalanan': 'badge-primary', 'Tiba': 'badge-accent', 'Selesai': 'badge-success' }[status] || 'badge-default';
    }
    return 'badge-default';
}

// ============================================================
// LIVE TRACKING MAP (LEAFLET)
// ============================================================
let trackingMap = null;
let courierMarker = null;
let trackingInterval = null;

function openTrackingMap(orderId) {
    const modal = document.getElementById('map-modal');
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
    
    // Tunggu modal transisi selesai agar ukuran map akurat
    setTimeout(() => {
        initMap();
    }, 300);
}

function closeMapModal() {
    document.getElementById('map-modal').classList.remove('open');
    document.body.style.overflow = '';
    if (trackingInterval) clearInterval(trackingInterval);
}

function initMap() {
    const mapContainer = document.getElementById('tracking-map');
    
    // Jika peta belum diinisialisasi
    if (!trackingMap) {
        trackingMap = L.map('tracking-map').setView([-6.200000, 106.816666], 13); // Default Jakarta
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(trackingMap);
    }

    // Hapus marker lama jika ada
    if (courierMarker) {
        trackingMap.removeLayer(courierMarker);
    }
    trackingMap.eachLayer((layer) => {
        if (layer instanceof L.Marker) {
            trackingMap.removeLayer(layer);
        }
    });

    // Koordinat Simulasi (Pusat)
    const baseLat = -6.2146; // Contoh lat
    const baseLng = 106.8451; // Contoh lng

    // Titik Tujuan (Lokasi UMKM)
    const destLat = baseLat + (Math.random() * 0.02 - 0.01);
    const destLng = baseLng + (Math.random() * 0.02 - 0.01);
    
    // Titik Awal Kurir (Agak jauh)
    let curLat = destLat + 0.03;
    let curLng = destLng - 0.02;

    // Tambahkan Marker Tujuan
    const destIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="background-color:#e17055; width:20px; height:20px; border-radius:50%; border:3px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.5);"></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10]
    });
    L.marker([destLat, destLng], {icon: destIcon}).addTo(trackingMap).bindPopup("Lokasi Tujuan (Anda)");

    // Tambahkan Marker Kurir
    const courierIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="background-color:#00cec9; width:26px; height:26px; border-radius:50%; border:3px solid white; box-shadow: 0 0 15px rgba(0,206,201,0.8); display:flex; align-items:center; justify-content:center;"><i class="fas fa-motorcycle" style="color:white; font-size:12px;"></i></div>`,
        iconSize: [26, 26],
        iconAnchor: [13, 13]
    });
    courierMarker = L.marker([curLat, curLng], {icon: courierIcon}).addTo(trackingMap).bindPopup("Kurir LogistiKita");

    // Sesuaikan view agar mencakup kedua titik
    const group = new L.featureGroup([L.marker([destLat, destLng]), courierMarker]);
    trackingMap.fitBounds(group.getBounds(), {padding: [30, 30]});

    // Mulai Animasi Simulasi Pergerakan
    if (trackingInterval) clearInterval(trackingInterval);
    
    document.getElementById('map-status-text').innerText = "Mengambil koordinat kurir...";

    setTimeout(() => {
        document.getElementById('map-status-text').innerText = "Kurir sedang dalam perjalanan menuju Anda.";
        
        trackingInterval = setInterval(() => {
            // Bergerak perlahan ke arah tujuan
            const latDiff = destLat - curLat;
            const lngDiff = destLng - curLng;
            
            // Jarak yang tersisa
            const dist = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);
            
            if (dist < 0.001) {
                // Sampai
                clearInterval(trackingInterval);
                document.getElementById('map-status-text').innerText = "Kurir telah tiba di lokasi Anda!";
                document.querySelector('.pulse-dot').style.background = '#2ecc71';
                return;
            }
            
            // Langkah per frame
            curLat += latDiff * 0.05;
            curLng += lngDiff * 0.05;
            
            // Update marker
            courierMarker.setLatLng([curLat, curLng]);
            
        }, 1000); // Update setiap 1 detik
    }, 1500);
}
