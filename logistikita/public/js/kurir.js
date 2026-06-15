/**
 * LogistiKita Courier Mobile Operations Controller
 * Manages picking up shipments, branch transits, AI route sorting, and completing proofs of delivery
 */

const API = window.location.origin;
let kurirToken = null;
let currentKurirId = null;
let kurirBranchInfo = null;
let allBranchesList = [];

document.addEventListener('DOMContentLoaded', () => {
    kurirToken = localStorage.getItem('adminToken');
    const currentUserStr = localStorage.getItem('currentUser');

    if (!kurirToken || !currentUserStr) {
        window.location.href = '/login.html';
        return;
    }

    const user = JSON.parse(currentUserStr);
    if (user.role !== 'Kurir') {
        window.location.href = '/login.html';
        return;
    }

    currentKurirId = user.id;
    document.getElementById('kurir-name').textContent = user.nama;

    // Load initial data
    loadBranchInfo().then(() => {
        loadKurirStats();
        loadMyShipments();
        loadTransitTasks();
        loadAvailableShipments();
        loadHistory();
    });
});

// Tab Switcher
function switchTab(tabId) {
    document.querySelectorAll('.tab-pane').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.sidebar-item').forEach(el => el.classList.remove('active'));

    const selectedPane = document.getElementById(`tab-content-${tabId}`);
    if (selectedPane) selectedPane.style.display = 'block';

    const selectedMenu = document.getElementById(`menu-${tabId}`);
    if (selectedMenu) selectedMenu.classList.add('active');

    // Update Header Titles
    const headerTitle = document.getElementById('kurir-header-title');
    const headerSubtitle = document.getElementById('kurir-header-subtitle');

    switch (tabId) {
        case 'tasks':
            headerTitle.textContent = 'Tugas Saya (Aktif)';
            headerSubtitle.textContent = 'Daftar paket aktif yang harus diantar ke penerima (last-mile) atau baru di-pickup.';
            loadMyShipments();
            break;
        case 'transit':
            headerTitle.textContent = 'Transit & Rute';
            headerSubtitle.textContent = 'Paket yang sedang dibawa menuju cabang logistik berikutnya.';
            loadTransitTasks();
            break;
        case 'available':
            headerTitle.textContent = 'Paket Tersedia';
            headerSubtitle.textContent = 'Paket di cabang Anda yang siap diambil untuk pickup atau transit.';
            loadAvailableShipments();
            break;
        case 'history':
            headerTitle.textContent = 'Histori Selesai';
            headerSubtitle.textContent = 'Riwayat paket yang berhasil dikirim (Delivered) atau Gagal.';
            loadHistory();
            break;
    }
}

// 0. Load Branch Info & Populate Dropdowns
async function loadBranchInfo() {
    try {
        const res = await fetch(`${API}/internal/kurir/branch-info`, {
            headers: { 'x-admin-token': kurirToken }
        });
        const data = await res.json();

        if (data.status === 'Success' && data.data) {
            kurirBranchInfo = data.data.my_branch;
            allBranchesList = data.data.other_branches;

            const bName = `${kurirBranchInfo.name} (${kurirBranchInfo.city})`;
            document.getElementById('kurir-branch-name').textContent = bName;
            document.getElementById('branch-name-display').textContent = bName;

            // Populate transit next branch dropdown
            const transitSelect = document.getElementById('transit-next-branch');
            transitSelect.innerHTML = '<option value="">-- Pilih Cabang Tujuan --</option>' + 
                allBranchesList.map(b => `<option value="${b.id}">${b.name} (${b.city})</option>`).join('');

            // Populate arrive branch dropdown
            const arriveSelect = document.getElementById('arrive-branch-id');
            arriveSelect.innerHTML = '<option value="">-- Pilih Cabang Tempat Tiba --</option>' + 
                allBranchesList.map(b => `<option value="${b.id}">${b.name} (${b.city})</option>`).join('');
        }
    } catch (err) {
        console.error('[Load Branch Info Error]', err);
    }
}

// 1. Fetch Courier Stats
async function loadKurirStats() {
    try {
        const res = await fetch(`${API}/internal/kurir/dashboard`, {
            headers: { 'x-admin-token': kurirToken }
        });
        const data = await res.json();

        if (data.status === 'Success' && data.data) {
            document.getElementById('stat-active-tasks').textContent = data.data.active_tasks || 0;
            document.getElementById('stat-transit-tasks').textContent = data.data.transit_tasks || 0;
            document.getElementById('stat-completed-tasks').textContent = data.data.completed_tasks || 0;
        }
    } catch (err) {
        console.error('[Load Stats Error]', err);
    }
}

// 2. Fetch My Active Shipments (Picked Up, Out For Delivery)
async function loadMyShipments(customData = null) {
    const listContainer = document.getElementById('active-tasks-list');
    
    if (customData) {
        renderShipmentCards(customData, listContainer, 'tasks');
        return;
    }

    try {
        const res = await fetch(`${API}/internal/kurir/mine`, {
            headers: { 'x-admin-token': kurirToken }
        });
        const data = await res.json();

        if (data.status === 'Success' && data.data) {
            renderShipmentCards(data.data, listContainer, 'tasks');
        }
    } catch (err) {
        listContainer.innerHTML = `<div style="text-align: center; color: var(--text-muted); padding: 2rem;">Gagal memuat tugas.</div>`;
    }
}

// 3. Fetch Transit Tasks (In Transit)
async function loadTransitTasks() {
    const listContainer = document.getElementById('transit-tasks-list');
    try {
        const res = await fetch(`${API}/internal/kurir/transit`, {
            headers: { 'x-admin-token': kurirToken }
        });
        const data = await res.json();

        if (data.status === 'Success' && data.data) {
            renderShipmentCards(data.data, listContainer, 'transit');
        }
    } catch (err) {
        listContainer.innerHTML = `<div style="text-align: center; color: var(--text-muted); padding: 2rem;">Gagal memuat tugas transit.</div>`;
    }
}

// 4. Fetch Available Branch Pickups
async function loadAvailableShipments() {
    const listContainer = document.getElementById('available-tasks-list');
    try {
        const res = await fetch(`${API}/internal/kurir/available`, {
            headers: { 'x-admin-token': kurirToken }
        });
        const data = await res.json();

        if (data.status === 'Success' && data.data) {
            renderShipmentCards(data.data, listContainer, 'available');
        }
    } catch (err) {
        listContainer.innerHTML = `<div style="text-align: center; color: var(--text-muted); padding: 2rem;">Gagal memuat paket tersedia.</div>`;
    }
}

// 5. Fetch History
async function loadHistory() {
    const listContainer = document.getElementById('history-tasks-list');
    try {
        const res = await fetch(`${API}/internal/kurir/history`, {
            headers: { 'x-admin-token': kurirToken }
        });
        const data = await res.json();

        if (data.status === 'Success' && data.data) {
            renderShipmentCards(data.data, listContainer, 'history');
        }
    } catch (err) {
        listContainer.innerHTML = `<div style="text-align: center; color: var(--text-muted); padding: 2rem;">Gagal memuat histori.</div>`;
    }
}

// Helper to render beautiful cards
function renderShipmentCards(shipments, container, type) {
    if (shipments.length === 0) {
        const msgs = {
            'tasks': 'Belum ada tugas aktif untuk Anda.',
            'transit': 'Tidak ada tugas transit yang sedang Anda bawa.',
            'available': 'Tidak ada paket tersedia di cabang saat ini.',
            'history': 'Belum ada riwayat tugas selesai.'
        };
        container.innerHTML = `
            <div style="text-align: center; color: var(--text-muted); padding: 3rem;">
                <i class="fas ${type === 'available' ? 'fa-box-open' : type === 'transit' ? 'fa-truck-fast' : 'fa-list-check'}" style="font-size: 2.5rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                <p>${msgs[type]}</p>
            </div>
        `;
        return;
    }

    container.innerHTML = shipments.map(ship => {
        let statusClass = 'pending';
        if (ship.status === 'Delivered') statusClass = 'delivered';
        if (ship.status === 'In Transit') statusClass = 'in_transit';
        if (ship.status === 'Failed') statusClass = 'failed';
        if (ship.status === 'Out For Delivery') statusClass = 'in_transit';
        if (ship.status === 'Picked Up') statusClass = 'picked_up';
        if (ship.status === 'Waiting Branch Confirmation') statusClass = 'pending';

        const weight = ship.weight || 2.0;
        const shipData = encodeURIComponent(JSON.stringify(ship));

        // Detail & Maps button always visible
        const detailBtn = `<button class="btn-secondary" style="padding: 0.5rem 0.9rem; font-size: 0.8rem;" onclick="openDetailModal('${shipData}')">
            <i class="fas fa-map-location-dot"></i> Detail & Maps
        </button>`;

        let actionUI = '';
        if (type === 'tasks') {
            let nextStatusBtn = '';
            if (ship.status === 'Picked Up') {
                nextStatusBtn = `
                    <button class="btn-primary" style="padding: 0.5rem 1rem; font-size: 0.8rem; --accent: var(--accent-customer);" onclick="openTransitModal('${ship.awb_number}', '${ship.dest_city}', '${ship.destination_branch_id}')">
                        <i class="fas fa-truck-fast"></i> Mulai Transit
                    </button>
                `;
            } else if (ship.status === 'Out For Delivery') {
                nextStatusBtn = `
                    <button class="btn-primary" style="padding: 0.5rem 1rem; font-size: 0.8rem; background: linear-gradient(135deg, #10b981, #059669);" onclick="openProofModal('${ship.awb_number}')">
                        <i class="fas fa-signature"></i> Selesaikan Delivery
                    </button>
                `;
            } else if (ship.status === 'Arrived at Destination Branch' || ship.status === 'Arrived at Branch') {
                nextStatusBtn = `
                    <button class="btn-primary" style="padding: 0.5rem 1rem; font-size: 0.8rem; background: linear-gradient(135deg, #2563eb, #1d4ed8);" onclick="startDelivery('${ship.awb_number}')">
                        <i class="fas fa-motorcycle"></i> Mulai Delivery
                    </button>
                `;
            } else if (ship.status === 'Waiting Branch Confirmation') {
                nextStatusBtn = `
                    <div style="display:flex; align-items:center; gap:0.5rem; font-size: 0.8rem; color: #fbbf24;">
                        <i class="fas fa-clock fa-spin"></i> Menunggu Konfirmasi Operator Cabang
                    </div>
                `;
            }

            const routeBadge = ship.route_order ? `
                <span class="status-badge delivered" style="font-size: 0.7rem; padding: 0.15rem 0.4rem;">
                    <i class="fas fa-map-pin"></i> Rute ke-${ship.route_order} (~${ship.est_distance} km)
                </span>
            ` : '';

            actionUI = `
                <div style="display: flex; gap: 0.5rem; justify-content: space-between; align-items: center; margin-top: 1rem; border-top: 1px solid var(--border-card); padding-top: 0.75rem;">
                    <div style="display:flex; gap: 0.5rem; align-items:center;">${routeBadge}${detailBtn}</div>
                    <div>${nextStatusBtn}</div>
                </div>
            `;
        } else if (type === 'transit') {
            actionUI = `
                <div style="display: flex; gap: 0.5rem; justify-content: space-between; align-items: center; margin-top: 1rem; border-top: 1px solid var(--border-card); padding-top: 0.75rem;">
                    ${detailBtn}
                    <button class="btn-primary" style="padding: 0.5rem 1rem; font-size: 0.8rem; --accent: #06b6d4;" onclick="openArriveModal('${ship.awb_number}', '${ship.dest_city}')">
                        <i class="fas fa-building-circle-check"></i> Tiba di Cabang
                    </button>
                </div>
            `;
        } else if (type === 'available') {
            actionUI = `
                <div style="display: flex; gap: 0.5rem; justify-content: space-between; align-items: center; margin-top: 1rem; border-top: 1px solid var(--border-card); padding-top: 0.75rem;">
                    ${detailBtn}
                    <button class="btn-primary" style="padding: 0.5rem 1rem; font-size: 0.8rem;" onclick="takePackage('${ship.awb_number}')">
                        <i class="fas fa-hand-holding-box"></i> Ambil Tugas
                    </button>
                </div>
            `;
        } else if (type === 'history') {
            actionUI = `
                <div style="display: flex; gap: 0.5rem; justify-content: flex-start; margin-top: 1rem; border-top: 1px solid var(--border-card); padding-top: 0.75rem;">
                    ${detailBtn}
                </div>
            `;
        }

        const routeDisplay = (ship.origin_city && ship.dest_city) ? 
            `<div><i class="fas fa-route" style="color: var(--accent); margin-right: 5px;"></i><strong>Rute:</strong> ${ship.origin_city} <i class="fas fa-arrow-right" style="font-size:0.7em;"></i> ${ship.dest_city}</div>` : '';
        
        const destDisplay = (type !== 'history')
            ? `<div><i class="fas fa-map-marker-alt" style="color: #ef4444; margin-right: 5px;"></i><strong>Tujuan:</strong> ${ship.receiver_address || ship.dest_city || '-'}</div>`
            : `<div><i class="fas fa-map-marker-alt" style="color: #ef4444; margin-right: 5px;"></i><strong>Dikirim ke:</strong> ${ship.receiver_address || '-'} (${ship.receiver_city || ship.dest_city || '-'})</div>`;

        const orderSourceLabel = ship.order_source === 'Customer' 
            ? 'Pengiriman Individu' 
            : (ship.nama_mitra || 'Kemitraan');

        const sourceBadge = `<span class="status-badge" style="background: rgba(255,255,255,0.1); color: var(--text-secondary); font-size: 0.7rem; border: 1px solid rgba(255,255,255,0.08); padding: 0.1rem 0.35rem; border-radius: 4px;">${orderSourceLabel}</span>`;

        const senderDisplay = `
            <div><i class="fas fa-user-circle" style="color: var(--accent); margin-right: 5px;"></i><strong>Pengirim:</strong> ${ship.sender_name} (${ship.sender_phone || '-'})</div>
            <div><i class="fas fa-location-arrow" style="color: var(--text-muted); margin-right: 5px;"></i><strong>Asal:</strong> ${ship.sender_address || '-'} (${ship.sender_city || '-'})</div>
        `;

        return `
            <div class="glass-card kurir-card-item">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
                    <div>
                        <div style="font-family: monospace; font-weight: 700; color: #fff; font-size: 1.05rem; display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap;">
                            ${ship.awb_number}
                            ${sourceBadge}
                        </div>
                        <span style="font-size: 0.75rem; color: var(--text-muted);"><i class="fas fa-user"></i> Penerima: <strong>${ship.receiver_name}</strong></span>
                    </div>
                    <span class="status-badge ${statusClass}">${ship.status || 'Pending'}</span>
                </div>
                
                <div style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 0.5rem; display: flex; flex-direction: column; gap: 0.35rem;">
                    ${senderDisplay}
                    ${routeDisplay}
                    ${destDisplay}
                    <div><i class="fas fa-weight-hanging" style="color: var(--text-muted); margin-right: 5px;"></i><strong>Berat:</strong> ${weight} Kg — <strong>Layanan:</strong> ${ship.service_type}</div>
                </div>

                ${actionUI}
            </div>
        `;
    }).join('');
}

// 6. Take Shipment
async function takePackage(awb) {
    if (!confirm(`Konfirmasi mengambil paket ${awb}? Jika paket ini milik cabang Anda, status akan menjadi Picked Up (Transit). Jika milik tujuan akhir, status menjadi Out for Delivery.`)) return;

    try {
        const res = await fetch(`${API}/internal/kurir/take`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-admin-token': kurirToken },
            body: JSON.stringify({ awb_number: awb })
        });
        const result = await res.json();

        if (res.ok && result.status === 'Success') {
            showToast(result.message, 'success');
            loadKurirStats();
            loadMyShipments();
            loadAvailableShipments();
            // Optional: if result message indicates transit vs out for delivery, switch tab
        } else {
            showToast(result.message || 'Gagal mengambil paket', 'danger');
        }
    } catch (err) {
        showToast('Kesalahan koneksi', 'danger');
    }
}

// 6.5. Start Delivery for auto-assigned package
async function startDelivery(awb) {
    try {
        const res = await fetch(`${API}/internal/kurir/take`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-admin-token': kurirToken },
            body: JSON.stringify({ awb_number: awb })
        });
        const result = await res.json();

        if (res.ok && result.status === 'Success') {
            showToast(result.message, 'success');
            loadKurirStats();
            loadMyShipments();
        } else {
            showToast(result.message || 'Gagal memulai delivery', 'danger');
        }
    } catch (err) {
        showToast('Kesalahan koneksi', 'danger');
    }
}
window.startDelivery = startDelivery;

// 7. Modals: Start Transit (Auto Routing — no branch selection)
function openTransitModal(awb, destCity, destBranchId) {
    document.getElementById('transit-awb').value = awb;
    document.getElementById('transit-next-branch-display').textContent = destCity
        ? `🏢 Cabang Tujuan: ${destCity}`
        : 'Sistem akan menentukan cabang tujuan otomatis';
    document.getElementById('start-transit-modal').classList.add('active');
}
function closeTransitModal() {
    document.getElementById('start-transit-modal').classList.remove('active');
}

async function submitStartTransit(e) {
    e.preventDefault();
    const awb_number = document.getElementById('transit-awb').value;

    try {
        const res = await fetch(`${API}/internal/kurir/start-transit`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-admin-token': kurirToken },
            body: JSON.stringify({ awb_number })
        });
        const result = await res.json();
        if (res.ok && result.status === 'Success') {
            showToast(result.message, 'success');
            closeTransitModal();
            loadKurirStats();
            loadMyShipments();
            loadTransitTasks();
            switchTab('transit');
        } else showToast(result.message || 'Gagal memulai transit', 'danger');
    } catch (err) {
        showToast('Kesalahan koneksi', 'danger');
    }
}

// 8. Modals: Arrive at Branch (Auto to destination_branch_id)
function openArriveModal(awb, destCity) {
    document.getElementById('arrive-awb').value = awb;
    document.getElementById('arrive-branch-display').textContent = destCity
        ? `🏢 ${destCity}`
        : 'Cabang tujuan dari data pengiriman';
    document.getElementById('arrive-branch-modal').classList.add('active');
}
function closeArriveModal() {
    document.getElementById('arrive-branch-modal').classList.remove('active');
}

async function submitArriveBranch(e) {
    e.preventDefault();
    const awb_number = document.getElementById('arrive-awb').value;

    try {
        const res = await fetch(`${API}/internal/kurir/arrive-branch`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-admin-token': kurirToken },
            body: JSON.stringify({ awb_number })
        });
        const result = await res.json();
        if (res.ok && result.status === 'Success') {
            showToast(result.message, 'success');
            closeArriveModal();
            loadKurirStats();
            loadTransitTasks();
            loadMyShipments(); // Show in 'tasks' as Waiting Branch Confirmation
            switchTab('tasks');
        } else showToast(result.message || 'Gagal konfirmasi tiba', 'danger');
    } catch (err) {
        showToast('Kesalahan koneksi', 'danger');
    }
}

// 9. Modal: Order Detail & Map
let mapInstance = null;

function openDetailModal(shipDataEncoded) {
    const ship = JSON.parse(decodeURIComponent(shipDataEncoded));

    document.getElementById('detail-sender-name').textContent = ship.sender_name || '-';
    document.getElementById('detail-sender-address').textContent = ship.sender_address || ship.origin_city || '-';
    document.getElementById('detail-receiver-name').textContent = ship.receiver_name || '-';
    document.getElementById('detail-receiver-address').textContent = ship.receiver_address || ship.dest_city || '-';
    document.getElementById('detail-service-info').textContent = `${ship.weight || 2} Kg / ${ship.service_type || '-'}`;
    document.getElementById('order-detail-modal').classList.add('active');

    // Build map after modal opens
    setTimeout(() => renderMap(ship), 200);
}

function closeDetailModal() {
    document.getElementById('order-detail-modal').classList.remove('active');
    if (mapInstance) {
        mapInstance.remove();
        mapInstance = null;
    }
    // Reset container for next open
    document.getElementById('map-container').innerHTML = '<div style="color: var(--text-muted);"><i class="fas fa-spinner fa-spin"></i> Memuat peta...</div>';
}

// City to coordinate map (Indonesia major cities)
const CITY_COORDS = {
    'jakarta': [-6.2088, 106.8456], 'bandung': [-6.9175, 107.6191],
    'surabaya': [-7.2575, 112.7521], 'medan': [3.5952, 98.6722],
    'makassar': [-5.1477, 119.4327], 'yogyakarta': [-7.7956, 110.3695],
    'semarang': [-6.9932, 110.4203], 'denpasar': [-8.6524, 115.2191],
    'palembang': [-2.9761, 104.7754], 'balikpapan': [-1.2675, 116.8289],
    'pontianak': [-0.0263, 109.3425], 'manado': [1.4748, 124.8421],
    'default': [-2.5489, 118.0149]
};

function getCoordsForCity(cityStr) {
    if (!cityStr) return CITY_COORDS['default'];
    const key = cityStr.toLowerCase().split(',')[0].trim().split(' ')[0];
    return CITY_COORDS[key] || CITY_COORDS['default'];
}

async function renderMap(ship) {
    const container = document.getElementById('map-container');
    container.innerHTML = '';
    container.style.display = 'block';

    const originCoords = getCoordsForCity(ship.sender_address || ship.origin_city);
    const destCoords = getCoordsForCity(ship.receiver_address || ship.dest_city);

    mapInstance = L.map('map-container', { zoomControl: true, attributionControl: false });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mapInstance);

    let routeCoords = [originCoords];
    let legs = [];

    try {
        const res = await fetch(`${API}/internal/kurir/transit-legs/${ship.awb_number}`, {
            headers: { 'x-admin-token': kurirToken }
        });
        const result = await res.json();
        if (result.status === 'Success' && result.data && result.data.length > 0) {
            legs = result.data;
        }
    } catch (err) {
        console.error('[Map Transit Legs Error]', err);
    }

    const originIcon = L.divIcon({ html: '<div style="background:#3b82f6;color:#fff;padding:4px 8px;border-radius:8px;font-size:11px;font-weight:700;white-space:nowrap;"><i class="fas fa-box"></i> Asal</div>', iconAnchor: [20, 12] });
    L.marker(originCoords, { icon: originIcon }).addTo(mapInstance)
        .bindPopup(`<b>${ship.sender_name}</b><br>${ship.sender_address || ship.origin_city}`);

    if (legs.length > 0) {
        routeCoords = [];
        const startCoords = [parseFloat(legs[0].from_branch_lat), parseFloat(legs[0].from_branch_lng)];
        routeCoords.push(startCoords);
        
        legs.forEach((leg, index) => {
            const legDestCoords = [parseFloat(leg.to_branch_lat), parseFloat(leg.to_branch_lng)];
            routeCoords.push(legDestCoords);

            const isFinal = index === legs.length - 1;
            const markerHtml = isFinal 
                ? '<div style="background:#ef4444;color:#fff;padding:4px 8px;border-radius:8px;font-size:11px;font-weight:700;white-space:nowrap;"><i class="fas fa-house-user"></i> Tujuan</div>'
                : `<div style="background:#f59e0b;color:#fff;padding:4px 8px;border-radius:8px;font-size:11px;font-weight:700;white-space:nowrap;"><i class="fas fa-building"></i> Transit ${index + 1}</div>`;
            
            const transitIcon = L.divIcon({ html: markerHtml, iconAnchor: [28, 12] });
            L.marker(legDestCoords, { icon: transitIcon }).addTo(mapInstance)
                .bindPopup(`<b>${leg.to_branch_name}</b> (${leg.to_branch_city})<br>Status Leg: ${leg.status}`);
        });
    } else {
        const destIcon = L.divIcon({ html: '<div style="background:#ef4444;color:#fff;padding:4px 8px;border-radius:8px;font-size:11px;font-weight:700;white-space:nowrap;"><i class="fas fa-house-user"></i> Tujuan</div>', iconAnchor: [28, 12] });
        L.marker(destCoords, { icon: destIcon }).addTo(mapInstance)
            .bindPopup(`<b>${ship.receiver_name}</b><br>${ship.receiver_address || ship.dest_city}`);
        routeCoords.push(destCoords);
    }

    L.polyline(routeCoords, { color: '#8b5cf6', weight: 4, opacity: 0.8 }).addTo(mapInstance);

    const bounds = L.latLngBounds(routeCoords);
    mapInstance.fitBounds(bounds, { padding: [50, 50] });

    let totalDist = 0;
    for (let i = 0; i < routeCoords.length - 1; i++) {
        const p1 = routeCoords[i];
        const p2 = routeCoords[i+1];
        
        const R = 6371; // km
        const dLat = (p2[0] - p1[0]) * Math.PI / 180;
        const dLng = (p2[1] - p1[1]) * Math.PI / 180;
        const a = Math.sin(dLat/2)**2 + Math.cos(p1[0]*Math.PI/180) * Math.cos(p2[0]*Math.PI/180) * Math.sin(dLng/2)**2;
        totalDist += R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    }
    
    const dist = Math.round(totalDist);
    document.getElementById('detail-route-distance').textContent = `~${dist} km (${Math.round(dist / 50) || 1} jam est.)`;
}

// 10. Modal: Complete Delivery (Proof)
function openProofModal(awb) {
    document.getElementById('proof-awb').value = awb;
    document.getElementById('proof-recipient').value = '';
    document.getElementById('proof-notes').value = '';
    document.getElementById('delivery-proof-modal').classList.add('active');
}
function closeProofModal() {
    document.getElementById('delivery-proof-modal').classList.remove('active');
}

async function submitDeliveryProof(e) {
    e.preventDefault();
    const awb_number = document.getElementById('proof-awb').value;
    const recipient_name = document.getElementById('proof-recipient').value.trim();
    const photo_url = document.getElementById('proof-photo').value;
    const notes = document.getElementById('proof-notes').value.trim();

    try {
        const res = await fetch(`${API}/internal/kurir/deliver`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-admin-token': kurirToken },
            body: JSON.stringify({ awb_number, recipient_name, notes, photo_url })
        });
        const result = await res.json();

        if (res.ok && result.status === 'Success') {
            showToast(`Pengiriman resi ${awb_number} telah selesai!`, 'success');
            closeProofModal();
            loadKurirStats();
            loadMyShipments();
            loadHistory();
            switchTab('history');
        } else {
            showToast(result.message || 'Gagal menyelesaikan pengiriman', 'danger');
        }
    } catch (err) {
        showToast('Kesalahan koneksi', 'danger');
    }
}

// Simulated AI Route Optimization
async function optimizeRoute() {
    showToast('AI sedang menghitung rute pengiriman tercepat...', 'success');
    try {
        const res = await fetch(`${API}/internal/kurir/optimize`, {
            headers: { 'x-admin-token': kurirToken }
        });
        const result = await res.json();
        if (res.ok && result.status === 'Success') {
            setTimeout(() => {
                showToast('Rute terpendek berhasil dipetakan!', 'success');
                loadMyShipments(result.data);
            }, 1200);
        } else {
            showToast(result.message || 'Gagal melakukan optimasi rute', 'danger');
        }
    } catch (err) {
        showToast('Gagal terhubung ke AI server', 'danger');
    }
}

// Log out
function handleLogout() {
    if (!confirm('Apakah Anda yakin ingin keluar dari sistem?')) return;
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminRole');
    localStorage.removeItem('currentUser');
    window.location.href = '/login.html';
}

function showToast(msg, type = 'success') {
    const toast = document.getElementById('toast');
    toast.innerHTML = `<i class="fas ${type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation'}" style="color: ${type === 'success' ? '#10b981' : '#ef4444'}"></i> <span>${msg}</span>`;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3500);
}

// Global refresh function
function refreshAll() {
    showToast('Memperbarui data dashboard...', 'success');
    loadBranchInfo().then(() => {
        loadKurirStats();
        loadMyShipments();
        loadTransitTasks();
        loadAvailableShipments();
        loadHistory();
    });
}
window.refreshAll = refreshAll;

