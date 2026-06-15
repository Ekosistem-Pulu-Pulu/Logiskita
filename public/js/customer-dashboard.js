/**
 * LogistiKita Customer Member Portal Controller
 * Coordinates booking shipments, tracking packages, and listing orders history
 */

const API = window.location.origin;
let custToken = null;
let currentCustomerId = null;

document.addEventListener('DOMContentLoaded', () => {
    custToken = localStorage.getItem('adminToken');
    const currentUserStr = localStorage.getItem('currentUser');

    if (!custToken || !currentUserStr) {
        window.location.href = '/login.html';
        return;
    }

    const user = JSON.parse(currentUserStr);
    if (user.role !== 'Customer') {
        window.location.href = '/login.html';
        return;
    }

    currentCustomerId = user.id;

    // Display Profile Name
    document.getElementById('customer-name-display').textContent = user.nama;
    
    // Autofill sender details with customer info
    document.getElementById('book-sender-name').value = user.nama;
    document.getElementById('book-sender-phone').value = user.phone || '0812-3456-7890';

    // Load initial data
    loadCustomerStats();
    loadCustomerShipments();

    // Trigger live cost calculator on startup
    calculateLiveCost();
});

// Tab Switcher
function switchTab(tabId) {
    document.querySelectorAll('.tab-pane').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.sidebar-item').forEach(el => el.classList.remove('active'));

    const selectedPane = document.getElementById(`tab-content-${tabId}`);
    if (selectedPane) selectedPane.style.display = 'block';

    const selectedMenu = document.getElementById(`menu-${tabId}`);
    if (selectedMenu) selectedMenu.classList.add('active');

    // Update Header Titles factually
    const headerTitle = document.getElementById('page-title-text');
    const headerSubtitle = document.getElementById('page-subtitle-text');

    switch (tabId) {
        case 'home':
            headerTitle.textContent = 'Portal Customer';
            headerSubtitle.textContent = 'Buat pengiriman baru, lacak status resi, dan riwayat kiriman Anda';
            break;
        case 'booking':
            headerTitle.textContent = 'Kirim Paket Baru';
            headerSubtitle.textContent = 'Pendaftaran pengiriman paket baru dengan estimasi harga instan';
            break;
        case 'history':
            headerTitle.textContent = 'Riwayat Kiriman Anda';
            headerSubtitle.textContent = 'Log data dan status pengiriman seluruh paket yang Anda buat';
            break;
        case 'tracking':
            headerTitle.textContent = 'Lacak Resi Pengiriman';
            headerSubtitle.textContent = 'Pantau detail timeline perjalanan paket Anda secara realtime';
            break;
    }
}

// Mobile sidebar toggle
function toggleMobileSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('active');
}

// 1. Fetch Customer stats
async function loadCustomerStats() {
    try {
        const res = await fetch(`${API}/customer/stats`, {
            headers: { 'x-admin-token': custToken }
        });
        const data = await res.json();

        if (data.status === 'Success' && data.data) {
            const stats = data.data;
            document.getElementById('stat-total-shipments').textContent = stats.total || 0;
            document.getElementById('stat-active-shipments').textContent = stats.active || 0;
            document.getElementById('stat-delivered-shipments').textContent = stats.delivered || 0;
        }
    } catch (err) {
        console.error('[Load Stats Error]', err);
    }
}

// 2. Fetch Customer shipments (History)
async function loadCustomerShipments() {
    try {
        const res = await fetch(`${API}/customer/shipments`, {
            headers: { 'x-admin-token': custToken }
        });
        const data = await res.json();

        if (data.status === 'Success' && data.data) {
            const tbody = document.getElementById('history-tbody');
            if (data.data.length === 0) {
                tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: var(--text-muted); padding: 2rem;">Anda belum pernah mengirim paket.</td></tr>`;
                return;
            }

            tbody.innerHTML = data.data.map(ship => {
                let statusClass = 'pending';
                if (ship.status === 'Selesai' || ship.status === 'Delivered') statusClass = 'delivered';
                if (ship.status === 'In Transit') statusClass = 'in_transit';
                if (ship.status === 'Failed') statusClass = 'failed';

                return `
                    <tr>
                        <td style="font-family: monospace; font-weight: 700; color: #fff;">${ship.awb_number}</td>
                        <td style="font-size: 0.8rem; color: var(--text-secondary);">${formatDate(ship.created_at)}</td>
                        <td><strong>${ship.receiver_name}</strong></td>
                        <td style="font-size: 0.85rem;">${ship.receiver_city}</td>
                        <td style="font-size: 0.8rem;">${ship.weight} Kg — <span style="color: var(--accent); font-weight: 600;">${ship.service_type}</span></td>
                        <td style="font-weight: 700; color: #fff;">${formatCurrency(ship.total_biaya)}</td>
                        <td>
                            <span class="status-badge ${statusClass}">${ship.status || 'Pending'}</span>
                        </td>
                        <td>
                            <button class="btn-secondary" style="padding: 0.35rem 0.6rem; font-size: 0.75rem;" onclick="prefillTrack('${ship.awb_number}')">
                                <i class="fas fa-route"></i> Lacak
                            </button>
                        </td>
                    </tr>
                `;
            }).join('');
        }
    } catch (err) {
        console.error('[Load Shipments Error]', err);
        tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: var(--text-muted); padding: 2rem;">Gagal memuat riwayat paket.</td></tr>`;
    }
}

// 3. Live Cost Estimation Calculator
function calculateLiveCost() {
    const weightInput = document.getElementById('book-weight');
    const serviceSelect = document.getElementById('book-service-type');
    
    let weight = parseFloat(weightInput.value) || 1.0;
    if (weight <= 0) weight = 1.0;

    const service = serviceSelect.value;
    
    // Reguler = 15000/kg, Express = 25000/kg
    const baseTarif = service === 'Express' ? 25000 : 15000;
    const ongkir = weight * baseTarif;
    const fee = 2000; // Flat customer fee
    const total = ongkir + fee;

    document.getElementById('cost-ongkir').textContent = formatCurrency(ongkir);
    document.getElementById('cost-fee').textContent = formatCurrency(fee);
    document.getElementById('cost-total').textContent = formatCurrency(total);
}

// 4. Submit Booking Request
async function handleBookingSubmit(e) {
    e.preventDefault();
    const sender_name = document.getElementById('book-sender-name').value.trim();
    const sender_phone = document.getElementById('book-sender-phone').value.trim();
    const sender_city = document.getElementById('book-sender-city').value;
    const sender_address = document.getElementById('book-sender-address').value.trim();

    const receiver_name = document.getElementById('book-receiver-name').value.trim();
    const receiver_phone = document.getElementById('book-receiver-phone').value.trim();
    const receiver_city = document.getElementById('book-receiver-city').value;
    const receiver_address = document.getElementById('book-receiver-address').value.trim();

    const weight = parseFloat(document.getElementById('book-weight').value) || 1.0;
    const service_type = document.getElementById('book-service-type').value;

    try {
        const res = await fetch(`${API}/customer/shipments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-admin-token': custToken
            },
            body: JSON.stringify({
                sender_name, sender_phone, sender_city, sender_address,
                receiver_name, receiver_phone, receiver_city, receiver_address,
                weight, service_type
            })
        });
        const result = await res.json();

        if (res.ok && result.status === 'Success') {
            showToast(`Pengiriman paket berhasil dibuat! Resi: ${result.awb_number}`, 'success');
            
            // Clear receiver form fields
            document.getElementById('book-receiver-name').value = '';
            document.getElementById('book-receiver-phone').value = '';
            document.getElementById('book-receiver-address').value = '';
            
            // Reload customer stats & history list
            loadCustomerStats();
            loadCustomerShipments();

            // Auto-redirect to tracking
            setTimeout(() => {
                prefillTrack(result.awb_number);
            }, 1000);
        } else {
            showToast(result.message || 'Gagal membuat pengiriman baru', 'danger');
        }
    } catch (err) {
        console.error('[Booking Error]', err);
        showToast('Kesalahan koneksi saat memproses order', 'danger');
    }
}

// 5. Track resi (Timeline builder)
async function trackAwb(awb) {
    if (!awb) {
        showToast('Masukkan nomor resi terlebih dahulu', 'danger');
        return;
    }

    const cleanAwb = awb.trim().toUpperCase();

    try {
        const res = await fetch(`${API}/customer/shipments/${cleanAwb}`, {
            headers: { 'x-admin-token': custToken }
        });
        const result = await res.json();

        const resultPanel = document.getElementById('tracking-result-panel');
        const emptyPanel = document.getElementById('tracking-empty-panel');

        if (res.ok && result.status === 'Success') {
            const ship = result.data.shipment;
            const history = result.data.tracking_history;

            // Fill shipment header details
            document.getElementById('track-disp-awb').textContent = `Resi: ${ship.awb_number}`;
            document.getElementById('track-disp-desc').textContent = `Estimasi Tiba: ${ship.service_type === 'Express' ? '1-2 Hari' : '3-4 Hari'}`;
            
            const statusBadge = document.getElementById('track-disp-status');
            statusBadge.className = `status-badge ${ship.status.toLowerCase().replace(' ', '_')}`;
            statusBadge.textContent = ship.status;

            // Fill Sender & Receiver
            document.getElementById('track-disp-sender').textContent = ship.sender_name;
            document.getElementById('track-disp-sender-city').textContent = ship.sender_city || 'Jakarta';
            document.getElementById('track-disp-receiver').textContent = ship.receiver_name;
            document.getElementById('track-disp-receiver-addr').textContent = `${ship.receiver_city} (${ship.receiver_address})`;

            // Fill Timeline
            const timeline = document.getElementById('tracking-timeline-feed');
            if (history.length === 0) {
                timeline.innerHTML = `<li style="color: var(--text-muted); list-style: none; text-align: center; padding-top: 1rem;">Log perjalanan belum terdaftar.</li>`;
            } else {
                timeline.innerHTML = history.map(log => {
                    let statusClass = 'pending';
                    if (log.status === 'Selesai' || log.status === 'Delivered') statusClass = 'delivered';
                    if (log.status === 'In Transit') statusClass = 'in_transit';
                    if (log.status === 'Failed') statusClass = 'failed';

                    return `
                        <li class="activity-item" style="--accent: var(--accent-customer);">
                            <div class="activity-meta">
                                <span>Status: <strong class="status-badge ${statusClass}" style="transform: scale(0.8); display: inline-flex; padding: 0.1rem 0.4rem;">${log.status}</strong></span>
                                <span>${formatDate(log.created_at)}</span>
                            </div>
                            <div class="activity-desc">
                                ${log.description}
                                <div style="font-size: 0.7rem; color: var(--text-muted); margin-top: 2px;"><i class="fas fa-location-dot"></i> Lokasi: ${log.nama_cabang || 'Drop Point'}</div>
                            </div>
                        </li>
                    `;
                }).join('');
            }

            // Display panel
            resultPanel.style.display = 'block';
            emptyPanel.style.display = 'none';
        } else {
            showToast(result.message || 'Resi tidak ditemukan', 'danger');
            resultPanel.style.display = 'none';
            emptyPanel.style.display = 'block';
        }
    } catch (err) {
        console.error('[Track Error]', err);
        showToast('Gagal melacak nomor resi', 'danger');
    }
}

// Quick track from home tab
function handleQuickTrack() {
    const awb = document.getElementById('quick-track-awb').value;
    if (!awb) {
        showToast('Masukkan nomor resi terlebih dahulu', 'danger');
        return;
    }
    document.getElementById('track-awb-input').value = awb;
    switchTab('tracking');
    trackAwb(awb);
}

// Prefill and route to tracking page from history list
function prefillTrack(awb) {
    document.getElementById('track-awb-input').value = awb;
    switchTab('tracking');
    trackAwb(awb);
}

// Log out
function handleLogout() {
    if (!confirm('Apakah Anda yakin ingin keluar dari sistem?')) return;
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminRole');
    localStorage.removeItem('currentUser');
    window.location.href = '/login.html';
}

// Helpers
function formatCurrency(v) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(v || 0);
}

function formatDate(d) {
    if (!d) return '-';
    return new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function showToast(msg, type = 'success') {
    const toast = document.getElementById('toast');
    toast.innerHTML = `<i class="fas ${type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation'}" style="color: ${type === 'success' ? '#10b981' : '#ef4444'}"></i> <span>${msg}</span>`;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3500);
}
