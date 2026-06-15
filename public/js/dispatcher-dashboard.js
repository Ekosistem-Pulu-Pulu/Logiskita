/**
 * LogistiKita Dispatcher Branch Allocation Controller
 * Coordinates assigning shipments to local couriers
 */

const API = window.location.origin;
let dispatchToken = null;
let currentBranchId = null;
let currentBranchName = '';

document.addEventListener('DOMContentLoaded', () => {
    dispatchToken = localStorage.getItem('adminToken');
    const currentUserStr = localStorage.getItem('currentUser');

    if (!dispatchToken || !currentUserStr) {
        window.location.href = '/login.html';
        return;
    }

    const user = JSON.parse(currentUserStr);
    if (user.role !== 'Dispatcher') {
        window.location.href = '/login.html';
        return;
    }

    currentBranchId = user.branch_id;
    document.getElementById('dispatcher-name').textContent = user.nama;

    // Load initial data
    loadDispatcherData();

    // Auto refresh every 30 seconds
    setInterval(loadDispatcherData, 30000);
});

// Switch Tab
function switchTab(tabId) {
    document.querySelectorAll('.tab-pane').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.sidebar-item').forEach(el => el.classList.remove('active'));

    const selectedPane = document.getElementById(`tab-content-${tabId}`);
    if (selectedPane) selectedPane.style.display = 'block';

    const selectedMenu = document.getElementById(`menu-${tabId}`);
    if (selectedMenu) selectedMenu.classList.add('active');
}

// Mobile sidebar toggle
function toggleMobileSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('active');
}

// Load Stats, Shipments, and Couriers in parallel
async function loadDispatcherData() {
    loadDispatcherStats();
    loadDispatcherShipments();
    loadDispatcherCouriers();
    loadBranchName();
}

// Fetch Branch Name factually
async function loadBranchName() {
    try {
        const res = await fetch(`${API}/internal/branches/dashboard`, {
            headers: { 'x-admin-token': dispatchToken }
        });
        const data = await res.json();
        if (data.status === 'Success' && data.data) {
            currentBranchName = data.data.branch.nama_cabang;
            document.getElementById('dispatcher-branch-badge').textContent = currentBranchName;
        }
    } catch (err) {
        console.error('[Branch Details Error]', err);
    }
}

// 1. Stats
async function loadDispatcherStats() {
    try {
        const res = await fetch(`${API}/internal/dispatcher/stats`, {
            headers: { 'x-admin-token': dispatchToken }
        });
        const data = await res.json();

        if (data.status === 'Success' && data.data) {
            const stats = data.data;
            document.getElementById('stat-unassigned-packages').textContent = stats.unassigned || 0;
            document.getElementById('stat-ready-delivery').textContent = stats.ready_for_delivery || 0;
            document.getElementById('stat-transit-delivery').textContent = stats.out_for_delivery || 0;
            document.getElementById('stat-active-couriers').textContent = stats.active_couriers || 0;
        }
    } catch (err) {
        console.error('[Load Stats Error]', err);
    }
}

// 2. Load Shipments
async function loadDispatcherShipments() {
    try {
        const res = await fetch(`${API}/internal/dispatcher/shipments`, {
            headers: { 'x-admin-token': dispatchToken }
        });
        const data = await res.json();

        if (data.status === 'Success' && data.data) {
            const tbody = document.getElementById('dispatcher-shipments-tbody');
            if (data.data.length === 0) {
                tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 2rem;">Tidak ada paket inbound terdaftar di cabang.</td></tr>`;
                return;
            }

            tbody.innerHTML = data.data.map(ship => {
                let statusClass = 'pending';
                if (ship.status === 'Selesai' || ship.status === 'Delivered') statusClass = 'delivered';
                if (ship.status === 'In Transit') statusClass = 'in_transit';
                if (ship.status === 'Failed') statusClass = 'failed';

                // Display Courier Name or Assign action button
                let courierDisplay = `<span style="color: var(--text-muted); font-size: 0.8rem;"><i class="fas fa-triangle-exclamation"></i> Belum di-assign</span>`;
                let actionBtn = `
                    <button class="btn-primary" style="padding: 0.35rem 0.6rem; font-size: 0.75rem;" onclick="prefillAssign('${ship.awb_number}')">
                        <i class="fas fa-user-plus"></i> Assign
                    </button>
                `;

                if (ship.kurir_nama) {
                    courierDisplay = `<strong style="font-size: 0.85rem; color: #fff;"><i class="fas fa-motorcycle" style="color: var(--accent);"></i> ${ship.kurir_nama}</strong>`;
                    actionBtn = `
                        <button class="btn-secondary" style="padding: 0.35rem 0.6rem; font-size: 0.75rem;" onclick="prefillAssign('${ship.awb_number}')">
                            <i class="fas fa-rotate"></i> Reassign
                        </button>
                    `;
                }

                // Fixed weight display for simulation
                const weight = ship.weight || 2.0;

                return `
                    <tr>
                        <td>
                            <div style="font-family: monospace; font-weight: 700; color: #fff; font-size: 0.9rem;">${ship.awb_number}</div>
                            <span style="font-size: 0.75rem; color: var(--text-muted);"><i class="fas fa-truck-fast"></i> ${ship.service_type}</span>
                        </td>
                        <td style="font-size: 0.85rem;">
                            <strong>${ship.receiver_name}</strong>
                            <div style="font-size: 0.75rem; color: var(--text-secondary); max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${ship.receiver_address}</div>
                        </td>
                        <td style="font-size: 0.85rem;">
                            <span>${weight} Kg</span>
                        </td>
                        <td>${courierDisplay}</td>
                        <td>
                            <span class="status-badge ${statusClass}">${ship.status}</span>
                        </td>
                        <td>${actionBtn}</td>
                    </tr>
                `;
            }).join('');
        }
    } catch (err) {
        console.error('[Load Shipments Error]', err);
        showToast('Gagal memuat paket cabang', 'danger');
    }
}

// 3. Load Couriers and workloads
async function loadDispatcherCouriers() {
    try {
        const res = await fetch(`${API}/internal/dispatcher/couriers`, {
            headers: { 'x-admin-token': dispatchToken }
        });
        const data = await res.json();

        if (data.status === 'Success' && data.data) {
            // Populate select dropdown in quick assign card
            const courierSelect = document.getElementById('assign-courier-select');
            courierSelect.innerHTML = data.data.map(c => `
                <option value="${c.id}">${c.nama} (${c.active_tasks} Paket aktif)</option>
            `).join('');

            // Render courier grid list
            const container = document.getElementById('dispatcher-couriers-container');
            if (data.data.length === 0) {
                container.innerHTML = `<div style="grid-column: span 3; text-align: center; color: var(--text-muted); padding: 2rem;">Belum ada kurir operasional aktif terdaftar.</div>`;
                return;
            }

            container.innerHTML = data.data.map(c => `
                <div class="glass-card courier-card" style="border-left: 4px solid var(--accent);">
                    <div class="courier-main-info">
                        <div class="courier-avatar">
                            <i class="fas fa-motorcycle"></i>
                        </div>
                        <div class="courier-meta-details">
                            <h4>${c.nama}</h4>
                            <p>${c.phone || '-'}</p>
                            <p style="font-size: 0.75rem; color: var(--text-muted);"><i class="fas fa-tasks"></i> Beban Tugas: ${c.active_tasks} Paket</p>
                        </div>
                    </div>
                    <div class="courier-workload">
                        <span class="status-badge ${c.active_tasks > 5 ? 'failed' : 'delivered'}">
                            ${c.active_tasks > 5 ? 'Sangat Padat' : 'Tersedia'}
                        </span>
                    </div>
                </div>
            `).join('');
        }
    } catch (err) {
        console.error('[Load Couriers Error]', err);
    }
}

// Prefill Assign input when clicking button in table
function prefillAssign(awb) {
    document.getElementById('assign-awb').value = awb;
    document.getElementById('assign-courier-select').focus();
    showToast(`Resi ${awb} terpilih. Silakan tentukan kurir.`, 'success');
}

// Handle assignment submission
async function handleAssignSubmit(e) {
    e.preventDefault();
    const awb_number = document.getElementById('assign-awb').value.trim().toUpperCase();
    const kurir_id = parseInt(document.getElementById('assign-courier-select').value);

    try {
        const res = await fetch(`${API}/internal/dispatcher/assign`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-admin-token': dispatchToken
            },
            body: JSON.stringify({ awb_number, kurir_id })
        });
        const result = await res.json();

        if (res.ok && result.status === 'Success') {
            showToast(result.message, 'success');
            document.getElementById('assign-awb').value = '';
            
            // Reload all dispatcher dashboards
            loadDispatcherData();
        } else {
            showToast(result.message || 'Gagal mengalokasikan kurir', 'danger');
        }
    } catch (err) {
        console.error('[Assign Submit Error]', err);
        showToast('Kesalahan koneksi saat melakukan dispatch assignment', 'danger');
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
    toast.innerHTML = `<i class="fas ${type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation'}" style="color: ${type === 'success' ? '#06b6d4' : '#ef4444'}"></i> <span>${msg}</span>`;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3500);
}
