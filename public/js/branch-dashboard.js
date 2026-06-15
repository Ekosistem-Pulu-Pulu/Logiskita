/**
 * LogistiKita Branch Admin Operations Controller
 * Manages branch operations, courier approval, live tracking, and transit management
 * === v2: Cek Resi & Validasi Paket — Realistic Operational Flow ===
 */

const API = window.location.origin;
let branchToken = null;
let currentBranchId = null;
let liveTrackingInterval = null;
let currentLookupData = null; // Stores last lookup result

document.addEventListener('DOMContentLoaded', () => {
    branchToken = localStorage.getItem('adminToken');
    const currentUserStr = localStorage.getItem('currentUser');

    if (!branchToken || !currentUserStr) {
        window.location.href = '/login.html';
        return;
    }

    const user = JSON.parse(currentUserStr);
    if (user.role !== 'Branch Admin') {
        window.location.href = '/login.html';
        return;
    }

    currentBranchId = user.branch_id;

    // Set UI Profile Name
    document.getElementById('operator-name').textContent = user.nama;

    // Load initial data
    loadBranchStats();
    loadBranchShipments();
    loadCouriers();
    loadBranchActivity();
    loadBranchesForTransit();
    loadIncomingPackages();
    loadPendingCouriers();

    // Setup polling
    setInterval(loadBranchActivity, 15000);
    setInterval(loadBranchStats, 30000);

    // Auto-focus resi input
    const resiInput = document.getElementById('resi-input');
    if (resiInput) resiInput.focus();
});

// ============================================================
// Tab Switcher
// ============================================================
function switchTab(tabId) {
    document.querySelectorAll('.tab-pane').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.sidebar-item').forEach(el => el.classList.remove('active'));

    const selectedPane = document.getElementById(`tab-content-${tabId}`);
    if (selectedPane) selectedPane.style.display = 'block';

    const selectedMenu = document.getElementById(`menu-${tabId}`);
    if (selectedMenu) selectedMenu.classList.add('active');

    // Clear or start live tracking interval
    if (liveTrackingInterval) {
        clearInterval(liveTrackingInterval);
        liveTrackingInterval = null;
    }

    const headerTitle = document.getElementById('branch-title');
    const headerSubtitle = document.getElementById('branch-subtitle');

    switch (tabId) {
        case 'ops':
            headerTitle.textContent = 'Ringkasan Cabang';
            headerSubtitle.textContent = 'Cek resi, validasi paket, dan kelola operasional cabang';
            loadIncomingPackages();
            break;
        case 'tracking':
            headerTitle.textContent = 'Live Tracking';
            headerSubtitle.textContent = 'Pantau perpindahan paket antar cabang secara realtime';
            loadLiveTracking();
            liveTrackingInterval = setInterval(loadLiveTracking, 5000);
            break;
        case 'couriers':
            headerTitle.textContent = 'Staf Kurir Cabang';
            headerSubtitle.textContent = 'Armada pengantaran paket yang bertugas di cabang logistik ini';
            loadCouriers();
            break;
        case 'approval':
            headerTitle.textContent = 'Approval Kurir';
            headerSubtitle.textContent = 'Persetujuan pendaftaran kurir baru di cabang Anda';
            loadPendingCouriers();
            break;
        case 'shipments':
            headerTitle.textContent = 'Daftar Pengiriman Cabang';
            headerSubtitle.textContent = 'Log data dan riwayat status seluruh paket terkait cabang';
            break;
    }
}

function toggleMobileSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('active');
}

// ============================================================
// 1. Load Branch Stats
// ============================================================
async function loadBranchStats() {
    try {
        const res = await fetch(`${API}/internal/branches/dashboard`, {
            headers: { 'x-admin-token': branchToken }
        });
        const data = await res.json();

        if (data.status === 'Success' && data.data) {
            const stats = data.data.stats;
            const branch = data.data.branch;

            document.getElementById('branch-name-display').textContent = branch.nama_cabang || branch.name;

            document.getElementById('stat-total-packages').textContent = stats.total_packages || 0;
            document.getElementById('stat-pending-pickup').textContent = stats.pending_packages || 0;
            document.getElementById('stat-in-transit').textContent = stats.transit_packages || 0;
            document.getElementById('stat-delivered').textContent = stats.delivered_packages || 0;
            document.getElementById('stat-active-couriers').textContent = stats.total_couriers || 0;
            document.getElementById('stat-arrived').textContent = stats.arrived_packages || 0;

            // Update pending badge in sidebar
            const pendingBadge = document.getElementById('badge-pending');
            if (stats.pending_registrations > 0) {
                pendingBadge.textContent = stats.pending_registrations;
                pendingBadge.style.display = 'inline-flex';
            } else {
                pendingBadge.style.display = 'none';
            }
        }
    } catch (err) {
        console.error('[Load Stats Error]', err);
        showToast('Gagal memuat statistik operasional cabang', 'danger');
    }
}

// ============================================================
// 2. Load Branch Shipments (Table)
// ============================================================
async function loadBranchShipments() {
    try {
        const res = await fetch(`${API}/internal/branches/shipments`, {
            headers: { 'x-admin-token': branchToken }
        });
        const data = await res.json();

        if (data.status === 'Success' && data.data) {
            const tbody = document.getElementById('shipments-tbody');
            if (data.data.length === 0) {
                tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 2rem;">Belum ada paket terdaftar di cabang ini.</td></tr>`;
                return;
            }

            tbody.innerHTML = data.data.map(ship => {
                const statusClass = getStatusClass(ship.status);
                const route = ship.transit_route || `${ship.origin_city || '?'} → ${ship.dest_city || '?'}`;
                const partnerLabel = ship.order_source === 'Customer' ? 'Pengiriman Individu' : (ship.nama_mitra || 'B2C/Self');

                return `
                    <tr>
                        <td>
                            <div style="font-family: monospace; font-weight: 700; color: #fff; font-size: 0.9rem;">${ship.awb_number}</div>
                            <span style="font-size: 0.75rem; color: var(--text-muted);"><i class="fas fa-handshake"></i> ${partnerLabel}</span>
                        </td>
                        <td style="font-size: 0.85rem;">
                            <strong>${ship.sender_name}</strong>
                            <div style="font-size: 0.75rem; color: var(--text-secondary);">${ship.sender_city || ''}</div>
                        </td>
                        <td style="font-size: 0.85rem;">
                            <strong>${ship.receiver_name}</strong>
                            <div style="font-size: 0.75rem; color: var(--text-secondary); max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${ship.receiver_address}</div>
                        </td>
                        <td>
                            <div style="font-size: 0.8rem; color: var(--text-secondary);">
                                <i class="fas fa-route" style="color: var(--accent); margin-right: 4px;"></i>${route}
                            </div>
                            ${ship.kurir_nama ? `<div style="font-size: 0.7rem; color: var(--text-muted); margin-top: 2px;"><i class="fas fa-motorcycle"></i> ${ship.kurir_nama}</div>` : ''}
                        </td>
                        <td style="font-size: 0.8rem; font-weight: 600; color: var(--accent);">${ship.service_type}</td>
                        <td>
                            <span class="status-badge ${statusClass}">${ship.status}</span>
                        </td>
                    </tr>
                `;
            }).join('');
        }
    } catch (err) {
        console.error('[Load Shipments Error]', err);
        showToast('Gagal memuat daftar paket', 'danger');
    }
}

// ============================================================
// 3. Load Couriers in Branch (with workload)
// ============================================================
async function loadCouriers() {
    try {
        const res = await fetch(`${API}/internal/branches/couriers`, {
            headers: { 'x-admin-token': branchToken }
        });
        const data = await res.json();

        if (data.status === 'Success' && data.data) {
            // Render courier grid
            const container = document.getElementById('couriers-grid-container');
            if (data.data.length === 0) {
                container.innerHTML = `<div style="grid-column: span 3; text-align: center; color: var(--text-muted); padding: 2rem;">Belum ada staf kurir terdaftar di cabang ini.</div>`;
                return;
            }

            container.innerHTML = data.data.map(c => {
                const statusBadge = c.active_tasks > 0
                    ? `<span class="status-badge in_transit" style="font-size: 0.7rem;">Dalam Misi (${c.active_tasks})</span>`
                    : c.is_active
                        ? `<span class="status-badge delivered" style="font-size: 0.7rem;">Aktif</span>`
                        : `<span class="status-badge failed" style="font-size: 0.7rem;">Off Duty</span>`;

                return `
                    <div class="glass-card courier-card" style="border-left: 4px solid var(--accent-kurir); flex-direction: column; align-items: stretch; gap: 0.75rem;">
                        <div class="courier-main-info">
                            <div class="courier-avatar">
                                <i class="fas fa-motorcycle"></i>
                            </div>
                            <div class="courier-meta-details">
                                <h4>${c.nama}</h4>
                                <p>${c.email}</p>
                                <p style="font-size: 0.75rem; color: var(--text-muted);"><i class="fas fa-phone"></i> ${c.phone || '-'}</p>
                            </div>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-card); padding-top: 0.65rem;">
                            ${statusBadge}
                            <div style="text-align: right;">
                                <span style="font-size: 0.75rem; color: var(--text-muted);">Selesai: <strong style="color: #10b981;">${c.completed_tasks || 0}</strong></span>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
        }
    } catch (err) {
        console.error('[Load Couriers Error]', err);
    }
}

// ============================================================
// 4. Load Branch Activity (Enhanced Realtime Logs with Tracking Detail)
// ============================================================
async function loadBranchActivity() {
    try {
        const res = await fetch(`${API}/internal/branches/activity`, {
            headers: { 'x-admin-token': branchToken }
        });
        const data = await res.json();

        if (data.status === 'Success' && data.data) {
            const feed = document.getElementById('branch-activity-feed');
            if (data.data.length === 0) {
                feed.innerHTML = `<li style="color: var(--text-muted); list-style: none; text-align: center; padding-top: 2rem;">Belum ada aktivitas terekam.</li>`;
                return;
            }

            feed.innerHTML = data.data.map(act => {
                const timeStr = formatTimeAgo(act.created_at);
                const statusClass = getStatusClass(act.status);
                const statusIcon = getStatusIcon(act.status);

                return `
                    <li class="activity-item">
                        <div class="activity-meta">
                            <span><i class="fas fa-barcode" style="margin-right: 3px;"></i> <strong>${act.awb_number}</strong></span>
                            <span>${timeStr}</span>
                        </div>
                        <div class="activity-desc">
                            <div style="display: flex; align-items: center; gap: 0.4rem; margin-bottom: 0.2rem;">
                                <i class="fas ${statusIcon}" style="color: ${getStatusColor(act.status)}; font-size: 0.8rem;"></i>
                                <span class="status-badge ${statusClass}" style="transform: scale(0.85); display: inline-flex; padding: 0.1rem 0.4rem;">${act.status}</span>
                            </div>
                            <div style="font-size: 0.82rem; color: var(--text-secondary); line-height: 1.4;">${act.description}</div>
                            <div style="font-size: 0.7rem; color: var(--text-muted); margin-top: 3px; display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap;">
                                <span><i class="fas fa-user-pen"></i> ${act.updated_by_name || 'System'}</span>
                                <span><i class="fas fa-clock"></i> ${new Date(act.created_at).toLocaleString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                        </div>
                    </li>
                `;
            }).join('');
        }
    } catch (err) {
        console.error('[Load Branch Activity Error]', err);
    }
}

// ============================================================
// 5. Load Branches for Transit Dropdown
// ============================================================
async function loadBranchesForTransit() {
    try {
        const res = await fetch(`${API}/internal/branches/all-branches`, {
            headers: { 'x-admin-token': branchToken }
        });
        const data = await res.json();
        // Stored for later use if needed
        if (data.status === 'Success' && data.data) {
            window._allBranches = data.data;
        }
    } catch (err) {
        console.error('[Transit Branches Load Error]', err);
    }
}

// ============================================================
// 6. Incoming Packages (Perlu Konfirmasi)
// ============================================================
async function loadIncomingPackages() {
    try {
        const res = await fetch(`${API}/internal/branches/incoming`, {
            headers: { 'x-admin-token': branchToken }
        });
        const data = await res.json();
        const container = document.getElementById('incoming-packages-container');

        if (data.status === 'Success' && data.data) {
            if (data.data.length === 0) {
                container.innerHTML = `<div style="text-align: center; color: var(--text-muted); padding: 1.5rem;">
                    <i class="fas fa-check-circle" style="font-size: 2rem; color: #10b981; margin-bottom: 0.5rem; display: block;"></i>
                    Tidak ada paket yang perlu dikonfirmasi saat ini.
                </div>`;
                return;
            }

            container.innerHTML = data.data.map(pkg => `
                <div class="glass-card" style="padding: 1rem; margin-bottom: 0.75rem; border-left: 3px solid #3b82f6;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; flex-wrap: wrap;">
                        <div style="flex: 1; min-width: 180px;">
                            <div style="font-family: monospace; font-weight: 700; color: #fff; font-size: 0.95rem;">${pkg.awb_number}</div>
                            <div style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 2px;">
                                <i class="fas fa-route" style="color: var(--accent);"></i> ${pkg.origin_city || '?'} → ${pkg.receiver_name}
                            </div>
                            <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 2px;">
                                <i class="fas fa-weight-hanging"></i> ${pkg.weight}kg · ${pkg.service_type}
                                ${pkg.kurir_nama ? ` · <i class="fas fa-motorcycle"></i> ${pkg.kurir_nama}` : ''}
                            </div>
                        </div>
                        <button class="btn-primary" onclick="confirmReceive('${pkg.awb_number}')" style="padding: 0.5rem 1rem; font-size: 0.8rem; white-space: nowrap;">
                            <i class="fas fa-check"></i> Konfirmasi Terima
                        </button>
                    </div>
                </div>
            `).join('');
        }
    } catch (err) {
        console.error('[Load Incoming Error]', err);
    }
}

// ============================================================
// 7. Confirm Receive Package
// ============================================================
async function confirmReceive(awb) {
    if (!confirm(`Konfirmasi penerimaan paket ${awb} di cabang Anda?`)) return;

    try {
        const res = await fetch(`${API}/internal/branches/confirm-receive`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-admin-token': branchToken
            },
            body: JSON.stringify({ awb_number: awb })
        });
        const result = await res.json();

        if (res.ok && result.status === 'Success') {
            const msg = result.data.is_final_destination
                ? `Paket ${awb} tiba di cabang tujuan akhir! ${result.data.assigned_kurir_id ? 'Otomatis di-assign ke kurir.' : ''}`
                : `Paket ${awb} diterima di cabang transit.`;
            showToast(msg, 'success');
            loadIncomingPackages();
            loadBranchStats();
            loadBranchActivity();
            // Re-lookup if same resi is open
            if (currentLookupData && currentLookupData.shipment.awb_number === awb) {
                triggerResiSearch(awb);
            }
        } else {
            showToast(result.message || 'Gagal konfirmasi', 'danger');
        }
    } catch (err) {
        console.error('[Confirm Receive Error]', err);
        showToast('Kesalahan koneksi', 'danger');
    }
}

// ============================================================
// 8. Live Tracking
// ============================================================
async function loadLiveTracking() {
    try {
        const res = await fetch(`${API}/internal/branches/live-tracking`, {
            headers: { 'x-admin-token': branchToken }
        });
        const data = await res.json();
        const container = document.getElementById('live-tracking-container');

        if (data.status === 'Success' && data.data) {
            if (data.data.length === 0) {
                container.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; color: var(--text-muted); padding: 3rem;">
                    <i class="fas fa-satellite-dish" style="font-size: 2.5rem; color: var(--accent); margin-bottom: 1rem; display: block;"></i>
                    Tidak ada paket aktif untuk dilacak saat ini.
                </div>`;
                return;
            }

            container.innerHTML = data.data.map(pkg => {
                const statusClass = getStatusClass(pkg.status);

                // Build transit timeline
                const steps = [];
                if (pkg.origin_city) steps.push({ city: pkg.origin_city, label: 'Asal', done: true });
                if (pkg.current_city && pkg.current_city !== pkg.origin_city && pkg.current_city !== pkg.dest_city) {
                    steps.push({ city: pkg.current_city, label: 'Transit', done: true, active: true });
                }
                if (pkg.dest_city) steps.push({ city: pkg.dest_city, label: 'Tujuan', done: pkg.status === 'Arrived at Destination Branch' || pkg.status === 'Out For Delivery' });

                const timeline = steps.map((s, i) => `
                    <div style="display: flex; flex-direction: column; align-items: center; flex: 1; position: relative;">
                        <div style="width: 12px; height: 12px; border-radius: 50%; background: ${s.done ? (s.active ? 'var(--accent)' : '#10b981') : 'rgba(255,255,255,0.15)'}; 
                             box-shadow: ${s.active ? '0 0 10px var(--accent)' : 'none'}; z-index: 2; transition: all 0.3s;"></div>
                        <span style="font-size: 0.7rem; color: ${s.done ? '#fff' : 'var(--text-muted)'}; margin-top: 4px; font-weight: ${s.active ? '700' : '500'};">${s.city}</span>
                        <span style="font-size: 0.6rem; color: var(--text-muted);">${s.label}</span>
                    </div>
                `).join('');

                return `
                    <div class="glass-card" style="padding: 1.25rem; border-left: 3px solid ${getStatusColor(pkg.status)};">
                        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem;">
                            <div>
                                <div style="font-family: monospace; font-weight: 700; color: #fff;">${pkg.awb_number}</div>
                                <div style="font-size: 0.8rem; color: var(--text-secondary);">${pkg.sender_name} → ${pkg.receiver_name}</div>
                            </div>
                            <span class="status-badge ${statusClass}" style="font-size: 0.65rem;">${pkg.status}</span>
                        </div>
                        
                        <!-- Timeline -->
                        <div style="display: flex; align-items: flex-start; gap: 0; margin: 1rem 0; padding: 0 0.5rem; position: relative;">
                            <div style="position: absolute; top: 5px; left: 15%; right: 15%; height: 2px; background: rgba(255,255,255,0.1);"></div>
                            ${timeline}
                        </div>

                        <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--text-muted); border-top: 1px solid var(--border-card); padding-top: 0.5rem;">
                            <span><i class="fas fa-weight-hanging"></i> ${pkg.weight}kg · ${pkg.service_type}</span>
                            <span>${pkg.kurir_nama ? `<i class="fas fa-motorcycle"></i> ${pkg.kurir_nama}` : '<i class="fas fa-clock"></i> Belum assign'}</span>
                        </div>
                    </div>
                `;
            }).join('');
        }
    } catch (err) {
        console.error('[Live Tracking Error]', err);
    }
}

// ============================================================
// 9. Pending Couriers (Approval)
// ============================================================
async function loadPendingCouriers() {
    try {
        const res = await fetch(`${API}/internal/branches/pending-couriers`, {
            headers: { 'x-admin-token': branchToken }
        });
        const data = await res.json();
        const container = document.getElementById('pending-couriers-container');

        if (data.status === 'Success' && data.data) {
            if (data.data.length === 0) {
                container.innerHTML = `<div style="text-align: center; color: var(--text-muted); padding: 3rem;">
                    <i class="fas fa-user-check" style="font-size: 2.5rem; color: #10b981; margin-bottom: 1rem; display: block;"></i>
                    Tidak ada pendaftaran kurir yang menunggu persetujuan.
                </div>`;
                return;
            }

            container.innerHTML = `<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1rem;">` +
                data.data.map(reg => `
                    <div class="glass-card" style="padding: 1.25rem; border-left: 4px solid #f59e0b;">
                        <div style="display: flex; align-items: center; gap: 0.85rem; margin-bottom: 1rem;">
                            <div style="width: 48px; height: 48px; border-radius: 50%; background: rgba(245, 158, 11, 0.15); border: 2px solid rgba(245, 158, 11, 0.3); display: flex; align-items: center; justify-content: center;">
                                <i class="fas fa-user-clock" style="font-size: 1.2rem; color: #f59e0b;"></i>
                            </div>
                            <div>
                                <h4 style="font-size: 1rem; font-weight: 700; color: #fff;">${reg.nama}</h4>
                                <p style="font-size: 0.8rem; color: var(--text-secondary);">${reg.email}</p>
                            </div>
                        </div>
                        <div style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 1rem;">
                            <div><i class="fas fa-phone" style="width: 16px;"></i> ${reg.phone || '-'}</div>
                            <div><i class="fas fa-calendar" style="width: 16px;"></i> ${new Date(reg.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                        </div>
                        <div style="display: flex; gap: 0.5rem;">
                            <button class="btn-primary" onclick="approveCourier(${reg.id})" style="flex: 1; padding: 0.6rem; font-size: 0.85rem;">
                                <i class="fas fa-check"></i> Setujui
                            </button>
                            <button class="btn-secondary" onclick="rejectCourier(${reg.id})" style="flex: 1; padding: 0.6rem; font-size: 0.85rem; color: #fca5a5; border-color: rgba(239,68,68,0.3);">
                                <i class="fas fa-times"></i> Tolak
                            </button>
                        </div>
                    </div>
                `).join('') +
            `</div>`;
        }
    } catch (err) {
        console.error('[Load Pending Couriers Error]', err);
    }
}

// ============================================================
// 10. Approve / Reject Courier
// ============================================================
async function approveCourier(regId) {
    if (!confirm('Setujui pendaftaran kurir ini? Kurir akan langsung aktif dan bisa login.')) return;
    try {
        const res = await fetch(`${API}/internal/branches/approve-courier`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-admin-token': branchToken },
            body: JSON.stringify({ registration_id: regId })
        });
        const result = await res.json();
        if (res.ok && result.status === 'Success') {
            showToast(result.message, 'success');
            loadPendingCouriers();
            loadCouriers();
            loadBranchStats();
        } else {
            showToast(result.message || 'Gagal approve', 'danger');
        }
    } catch (err) {
        showToast('Kesalahan koneksi', 'danger');
    }
}

async function rejectCourier(regId) {
    if (!confirm('Tolak pendaftaran kurir ini?')) return;
    try {
        const res = await fetch(`${API}/internal/branches/reject-courier`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-admin-token': branchToken },
            body: JSON.stringify({ registration_id: regId })
        });
        const result = await res.json();
        if (res.ok && result.status === 'Success') {
            showToast('Pendaftaran kurir ditolak.', 'success');
            loadPendingCouriers();
            loadBranchStats();
        } else {
            showToast(result.message || 'Gagal reject', 'danger');
        }
    } catch (err) {
        showToast('Kesalahan koneksi', 'danger');
    }
}

// ============================================================
// ============= NEW: CEK RESI & VALIDASI PAKET FLOW ==========
// ============================================================

/**
 * SECTION 1: Search Resi — panggil API lookup-resi
 */
async function searchResi(e) {
    e.preventDefault();
    const awbInput = document.getElementById('resi-input');
    const awb = awbInput.value.trim().toUpperCase();
    if (!awb) return;

    triggerResiSearch(awb);
}

async function triggerResiSearch(awb) {
    const btn = document.getElementById('btn-search-resi');
    const msgBox = document.getElementById('scanner-result-msg');
    const infoSection = document.getElementById('packet-info-section');
    const actionSection = document.getElementById('action-panel-section');

    // Reset
    infoSection.style.display = 'none';
    actionSection.style.display = 'none';
    msgBox.style.display = 'none';
    currentLookupData = null;

    // Loading state
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Mencari...</span>';

    try {
        const res = await fetch(`${API}/internal/branches/lookup-resi?awb=${encodeURIComponent(awb)}`, {
            headers: { 'x-admin-token': branchToken }
        });
        const result = await res.json();

        if (res.ok && result.status === 'Success') {
            currentLookupData = result.data;
            // Show success scanner msg
            msgBox.className = 'scanner-result-msg success';
            msgBox.innerHTML = `<i class="fas fa-circle-check"></i> Resi <strong>${awb}</strong> ditemukan dan tervalidasi!`;
            msgBox.style.display = 'flex';

            // Render Sections 2 & 3
            renderPacketInfo(result.data);
            renderOperationalActions(result.data);
        } else {
            // Show error msg
            msgBox.className = 'scanner-result-msg error';
            if (res.status === 403) {
                const d = result.data || {};
                msgBox.innerHTML = `<i class="fas fa-triangle-exclamation"></i> <div><strong>${result.message}</strong><br>
                    <span style="font-size: 0.8rem; opacity: 0.8;">Resi: ${d.awb_number || awb} · Rute: ${d.origin_city || '?'} → ${d.dest_city || '?'} · Status: ${d.status || '?'}</span></div>`;
            } else {
                msgBox.innerHTML = `<i class="fas fa-circle-xmark"></i> ${result.message}`;
            }
            msgBox.style.display = 'flex';
        }
    } catch (err) {
        console.error('[Search Resi Error]', err);
        msgBox.className = 'scanner-result-msg error';
        msgBox.innerHTML = `<i class="fas fa-circle-xmark"></i> Gagal menghubungi server. Periksa koneksi Anda.`;
        msgBox.style.display = 'flex';
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-magnifying-glass"></i> <span>Cari Paket</span>';
    }
}

/**
 * SECTION 2: Render Informasi Paket
 */
function renderPacketInfo(data) {
    const section = document.getElementById('packet-info-section');
    const content = document.getElementById('packet-info-content');
    const statusBadge = document.getElementById('packet-status-badge');
    const ship = data.shipment;
    const legs = data.transit_legs || [];
    const ctx = data.branch_context;

    // Status badge
    statusBadge.innerHTML = `<span class="status-badge ${getStatusClass(ship.status)}">${ship.status}</span>`;

    // Branch context indicator
    let contextLabel = '';
    if (ctx.is_origin && ctx.is_final_destination) contextLabel = '<span class="context-tag origin">Cabang Asal & Tujuan</span>';
    else if (ctx.is_origin) contextLabel = '<span class="context-tag origin">Cabang Asal</span>';
    else if (ctx.is_final_destination) contextLabel = '<span class="context-tag destination">Cabang Tujuan Akhir</span>';
    else if (ctx.is_current) contextLabel = '<span class="context-tag transit">Cabang Transit</span>';
    else contextLabel = '<span class="context-tag">Terkait Rute</span>';

    // Build transit timeline
    let timelineHTML = '';
    if (legs.length > 0) {
        timelineHTML = `
            <div class="transit-timeline-section">
                <h4><i class="fas fa-route"></i> Rute Transit</h4>
                <div class="transit-timeline">
                    ${legs.map((leg, i) => {
                        const isCompleted = leg.status === 'Completed';
                        const isActive = leg.status === 'In Transit' || leg.status === 'Pending';
                        const isFirst = i === 0;
                        return `
                            ${isFirst ? `
                                <div class="timeline-node ${isCompleted || isActive ? 'completed' : ''}">
                                    <div class="node-dot"></div>
                                    <div class="node-label">
                                        <strong>${leg.from_branch_city}</strong>
                                        <span>${leg.from_branch_name}</span>
                                    </div>
                                </div>
                            ` : ''}
                            <div class="timeline-connector ${isCompleted ? 'completed' : ''}">
                                <div class="connector-line"></div>
                                <span class="connector-label">Leg ${leg.leg_order} ${isCompleted ? '✓' : leg.status === 'In Transit' ? '🚚' : '⏳'}</span>
                            </div>
                            <div class="timeline-node ${isCompleted ? 'completed' : ''} ${!isCompleted && isActive ? 'active' : ''}">
                                <div class="node-dot"></div>
                                <div class="node-label">
                                    <strong>${leg.to_branch_city}</strong>
                                    <span>${leg.to_branch_name}</span>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }

    // Build tracking history
    let trackingHTML = '';
    if (data.tracking_history && data.tracking_history.length > 0) {
        trackingHTML = `
            <div class="tracking-history-section">
                <h4><i class="fas fa-clock-rotate-left"></i> Riwayat Tracking</h4>
                <div class="tracking-list">
                    ${data.tracking_history.map(t => `
                        <div class="tracking-item">
                            <div class="tracking-dot" style="background: ${getStatusColor(t.status)};"></div>
                            <div class="tracking-detail">
                                <div class="tracking-status">
                                    <span class="status-badge ${getStatusClass(t.status)}" style="font-size: 0.65rem; padding: 0.1rem 0.4rem;">${t.status}</span>
                                    <span class="tracking-time">${new Date(t.created_at).toLocaleString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                <div class="tracking-desc">${t.description}</div>
                                <div class="tracking-meta">
                                    ${t.branch_name ? `<span><i class="fas fa-building"></i> ${t.branch_name} (${t.branch_city})</span>` : ''}
                                    <span><i class="fas fa-user"></i> ${t.updated_by_name || 'System'}</span>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    content.innerHTML = `
        <div class="packet-context-bar">${contextLabel}</div>

        <!-- Two-column info grid -->
        <div class="packet-detail-grid">
            <div class="detail-group">
                <h4><i class="fas fa-user"></i> Pengirim</h4>
                <div class="detail-value">${ship.sender_name}</div>
                <div class="detail-sub">${ship.sender_phone || '-'} · ${ship.sender_city || '-'}</div>
            </div>
            <div class="detail-group">
                <h4><i class="fas fa-location-dot"></i> Penerima</h4>
                <div class="detail-value">${ship.receiver_name}</div>
                <div class="detail-sub">${ship.receiver_phone || '-'}</div>
                <div class="detail-sub">${ship.receiver_address || '-'}</div>
            </div>
            <div class="detail-group">
                <h4><i class="fas fa-building"></i> Cabang Asal</h4>
                <div class="detail-value">${ship.origin_branch?.name || '-'}</div>
                <div class="detail-sub">${ship.origin_branch?.city || '-'}</div>
            </div>
            <div class="detail-group">
                <h4><i class="fas fa-flag-checkered"></i> Cabang Tujuan Akhir</h4>
                <div class="detail-value">${ship.final_branch?.name || ship.destination_branch?.name || '-'}</div>
                <div class="detail-sub">${ship.final_branch?.city || ship.destination_branch?.city || '-'}</div>
            </div>
            <div class="detail-group">
                <h4><i class="fas fa-map-pin"></i> Cabang Saat Ini</h4>
                <div class="detail-value">${ship.current_branch?.name || '-'}</div>
                <div class="detail-sub">${ship.current_branch?.city || '-'}</div>
            </div>
            <div class="detail-group">
                <h4><i class="fas fa-arrow-right"></i> Cabang Berikutnya</h4>
                <div class="detail-value">${ship.next_branch?.name || 'Tidak ada / sudah final'}</div>
                <div class="detail-sub">${ship.next_branch?.city || '-'}</div>
            </div>
        </div>

        <!-- Package meta -->
        <div class="packet-meta-bar">
            <span><i class="fas fa-barcode"></i> ${ship.awb_number}</span>
            <span><i class="fas fa-weight-hanging"></i> ${ship.weight || 0} kg</span>
            <span><i class="fas fa-bolt"></i> ${ship.service_type}</span>
            <span><i class="fas fa-wallet"></i> ${formatCurrency(ship.total_cost)}</span>
            <span><i class="fas fa-calendar"></i> ${new Date(ship.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
            ${ship.kurir ? `<span><i class="fas fa-motorcycle"></i> ${ship.kurir.name}</span>` : ''}
        </div>

        ${timelineHTML}
        ${trackingHTML}
    `;

    section.style.display = 'block';
    // Smooth scroll into view
    section.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/**
 * SECTION 3: Render Aksi Operasional
 */
function renderOperationalActions(data) {
    const section = document.getElementById('action-panel-section');
    const content = document.getElementById('action-panel-content');
    const actions = data.allowed_actions || [];
    const ship = data.shipment;

    if (actions.length === 0) {
        content.innerHTML = `
            <div class="no-actions">
                <i class="fas fa-info-circle"></i>
                <p>Tidak ada aksi operasional yang tersedia untuk paket ini di cabang Anda saat ini.</p>
                <span style="font-size: 0.8rem; color: var(--text-muted);">Status: ${ship.status}</span>
            </div>
        `;
        section.style.display = 'block';
        return;
    }

    let actionsHTML = actions.map(act => {
        let extraContent = '';

        if (act.action === 'out_for_delivery') {
            const couriers = data.available_couriers || [];
            if (couriers.length > 0) {
                extraContent = `
                    <div class="action-extra">
                        <label>Pilih Kurir:</label>
                        <select id="action-courier-select" class="form-control" style="margin-top: 0.5rem;">
                            ${couriers.map(c => `<option value="${c.id}">${c.nama} (${c.phone || '-'}) — ${c.active_tasks} tugas aktif</option>`).join('')}
                        </select>
                    </div>
                `;
            } else {
                extraContent = `<div class="action-extra"><p style="color: #fca5a5; font-size: 0.85rem;"><i class="fas fa-triangle-exclamation"></i> Tidak ada kurir aktif di cabang ini.</p></div>`;
            }
        }

        if (act.action === 'send_transit' && data.shipment.next_branch) {
            extraContent = `
                <div class="action-extra">
                    <p style="font-size: 0.85rem; color: var(--text-secondary);">
                        <i class="fas fa-arrow-right" style="color: ${act.color};"></i> 
                        Cabang tujuan berikutnya: <strong style="color: #fff;">${data.shipment.next_branch.name} (${data.shipment.next_branch.city})</strong>
                    </p>
                </div>
            `;
        }

        if (act.action === 'manual_status') {
            extraContent = `
                <div class="action-extra">
                    <label>Status Baru:</label>
                    <select id="action-manual-status" class="form-control" style="margin-top: 0.5rem;">
                        <option value="In Transit">In Transit (Kirim ke Cabang Lain)</option>
                        <option value="Out For Delivery">Out For Delivery (Kurir Mengantar)</option>
                        <option value="Delivered">Delivered (Selesai)</option>
                        <option value="Failed">Failed (Gagal Kirim)</option>
                    </select>
                </div>
            `;
        }

        return `
            <div class="action-card" style="--action-color: ${act.color};">
                <div class="action-card-header">
                    <div class="action-icon-wrapper" style="background: ${act.color}20; border-color: ${act.color}40;">
                        <i class="fas ${act.icon}" style="color: ${act.color};"></i>
                    </div>
                    <div class="action-label">${act.label}</div>
                </div>
                ${extraContent}
                <button class="btn-primary action-btn" style="background: linear-gradient(135deg, ${act.color} 0%, ${act.color}80 100%); width: 100%;" onclick="executeAction('${act.action}')">
                    <i class="fas ${act.icon}"></i> ${act.label}
                </button>
            </div>
        `;
    }).join('');

    content.innerHTML = `<div class="actions-grid">${actionsHTML}</div>`;
    section.style.display = 'block';
}

/**
 * Execute an operational action
 */
async function executeAction(action) {
    if (!currentLookupData) return;
    const ship = currentLookupData.shipment;
    const awb = ship.awb_number;

    let endpoint = '';
    let body = {};
    let confirmMsg = '';

    switch (action) {
        case 'pickup':
            endpoint = '/internal/branches/scan';
            body = { awb_number: awb, new_status: 'Picked Up' };
            confirmMsg = `Pickup paket ${awb} dari pengirim?`;
            break;

        case 'arrived_origin':
            endpoint = '/internal/branches/scan';
            body = { awb_number: awb, new_status: 'Arrived at Branch' };
            confirmMsg = `Paket ${awb} sudah diterima di gudang cabang?`;
            break;

        case 'confirm_receive':
            endpoint = '/internal/branches/confirm-receive';
            body = { awb_number: awb };
            confirmMsg = `Konfirmasi penerimaan paket ${awb} di cabang Anda?`;
            break;

        case 'send_transit':
            endpoint = '/internal/branches/scan';
            const nextBranchId = ship.next_branch?.id;
            body = { awb_number: awb, new_status: 'In Transit', next_branch_id: nextBranchId };
            confirmMsg = `Kirim paket ${awb} transit ke cabang berikutnya (${ship.next_branch?.name || 'N/A'})?`;
            break;

        case 'out_for_delivery':
            const courierSelect = document.getElementById('action-courier-select');
            if (!courierSelect || !courierSelect.value) {
                showToast('Pilih kurir terlebih dahulu!', 'danger');
                return;
            }
            endpoint = '/internal/branches/scan';
            body = { awb_number: awb, new_status: 'Out For Delivery', courier_id: parseInt(courierSelect.value) };
            confirmMsg = `Assign paket ${awb} ke kurir dan kirim untuk delivery?`;
            break;

        case 'manual_status':
            const statusSelect = document.getElementById('action-manual-status');
            if (!statusSelect || !statusSelect.value) {
                showToast('Pilih status baru!', 'danger');
                return;
            }
            endpoint = '/internal/branches/scan';
            body = { awb_number: awb, new_status: statusSelect.value };
            confirmMsg = `Update status paket ${awb} menjadi "${statusSelect.value}"?`;
            break;

        default:
            showToast('Aksi tidak dikenali.', 'danger');
            return;
    }

    if (!confirm(confirmMsg)) return;

    try {
        const res = await fetch(`${API}${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-admin-token': branchToken
            },
            body: JSON.stringify(body)
        });
        const result = await res.json();

        if (res.ok && result.status === 'Success') {
            showToast(result.message || `Aksi "${action}" berhasil dijalankan!`, 'success');
            // Refresh all relevant data
            loadBranchStats();
            loadBranchShipments();
            loadBranchActivity();
            loadIncomingPackages();
            // Re-lookup the same resi to update the view
            setTimeout(() => triggerResiSearch(awb), 500);
        } else {
            showToast(result.message || 'Gagal menjalankan aksi.', 'danger');
        }
    } catch (err) {
        console.error('[Execute Action Error]', err);
        showToast('Kesalahan koneksi saat memproses aksi.', 'danger');
    }
}

// ============================================================
// Helpers
// ============================================================
function handleLogout() {
    if (!confirm('Apakah Anda yakin ingin keluar dari sistem?')) return;
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminRole');
    localStorage.removeItem('currentUser');
    window.location.href = '/login.html';
}

function getStatusClass(status) {
    if (status === 'Delivered' || status === 'Selesai') return 'delivered';
    if (status === 'In Transit') return 'in_transit';
    if (status === 'Picked Up') return 'picked_up';
    if (status === 'Failed') return 'failed';
    if (status === 'Out For Delivery') return 'in_transit';
    if (status === 'Arrived at Branch' || status === 'Arrived at Destination Branch') return 'picked_up';
    if (status === 'Waiting Branch Confirmation') return 'pending';
    return 'pending';
}

function getStatusColor(status) {
    if (status === 'Delivered') return '#10b981';
    if (status === 'In Transit') return '#3b82f6';
    if (status === 'Picked Up') return '#06b6d4';
    if (status === 'Failed') return '#ef4444';
    if (status === 'Out For Delivery') return '#8b5cf6';
    if (status === 'Arrived at Branch' || status === 'Arrived at Destination Branch') return '#06b6d4';
    if (status === 'Waiting Branch Confirmation') return '#f59e0b';
    return '#f59e0b';
}

function getStatusIcon(status) {
    if (status === 'Delivered') return 'fa-circle-check';
    if (status === 'In Transit') return 'fa-truck-fast';
    if (status === 'Picked Up') return 'fa-hand-holding-box';
    if (status === 'Failed') return 'fa-circle-xmark';
    if (status === 'Out For Delivery') return 'fa-motorcycle';
    if (status === 'Arrived at Branch' || status === 'Arrived at Destination Branch') return 'fa-warehouse';
    if (status === 'Waiting Branch Confirmation') return 'fa-clock';
    return 'fa-circle-info';
}

function formatCurrency(v) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(v || 0);
}

function formatTimeAgo(d) {
    if (!d) return '';
    const diffMs = new Date() - new Date(d);
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHr = Math.floor(diffMin / 60);

    if (diffSec < 60) return 'Baru saja';
    if (diffMin < 60) return `${diffMin}m lalu`;
    if (diffHr < 24) return `${diffHr}j lalu`;
    return new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
}

function showToast(msg, type = 'success') {
    const toast = document.getElementById('toast');
    toast.innerHTML = `<i class="fas ${type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation'}" style="color: ${type === 'success' ? '#10b981' : '#ef4444'}"></i> <span>${msg}</span>`;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3500);
}

// Global refresh dashboard function
function refreshAll() {
    showToast('Memperbarui data dashboard...', 'success');
    loadBranchStats();
    loadBranchShipments();
    loadCouriers();
    loadBranchActivity();
    loadIncomingPackages();
    loadPendingCouriers();
}
window.refreshAll = refreshAll;
