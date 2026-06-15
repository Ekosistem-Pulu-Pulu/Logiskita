/**
 * LogistiKita Super Admin Dashboard Controller
 * Handles full operations control at national level
 */

const API = window.location.origin;
let saToken = null;
let resetTargetId = null;
let cachedBranches = [];

document.addEventListener('DOMContentLoaded', () => {
    saToken = localStorage.getItem('adminToken');
    const currentUserStr = localStorage.getItem('currentUser');

    if (!saToken || !currentUserStr) {
        window.location.href = '/login.html';
        return;
    }

    const user = JSON.parse(currentUserStr);
    if (user.role !== 'Superadmin') {
        window.location.href = '/login.html';
        return;
    }

    // Set Profile UI
    document.getElementById('profile-name').textContent = user.nama;

    // Load initial data
    loadDashboardStats();
    loadBranches();
    loadRealtimeActivity();
    loadUsers();
    loadTransactions();

    // Auto-refresh national realtime updates every 15 seconds
    setInterval(loadRealtimeActivity, 15000);
});

// Tab Switcher
function switchTab(tabId) {
    // Hide all tabs
    document.querySelectorAll('.tab-pane').forEach(el => el.style.display = 'none');
    // Deactivate all sidebar items
    document.querySelectorAll('.sidebar-item').forEach(el => el.classList.remove('active'));

    // Show selected tab
    const selectedPane = document.getElementById(`tab-content-${tabId}`);
    if (selectedPane) selectedPane.style.display = 'block';

    // Highlight menu
    const selectedMenu = document.getElementById(`menu-${tabId}`);
    if (selectedMenu) selectedMenu.classList.add('active');

    // Update headers factually
    const headerTitle = document.getElementById('page-header-title');
    const headerSubtitle = document.getElementById('page-header-subtitle');

    switch (tabId) {
        case 'dashboard':
            headerTitle.textContent = 'Monitoring Nasional';
            headerSubtitle.textContent = 'Statistik dan aktivitas realtime seluruh cabang logistik se-Indonesia';
            break;
        case 'branches':
            headerTitle.textContent = 'Operasional Cabang';
            headerSubtitle.textContent = 'Detail performa dan alamat seluruh cabang logistiKita';
            break;
        case 'users':
            headerTitle.textContent = 'Kelola Pengguna Internal';
            headerSubtitle.textContent = 'Manajemen staf pusat, admin cabang, dispatcher, kurir, dan customer';
            break;
        case 'partners':
            headerTitle.textContent = 'Marketplace Partner';
            headerSubtitle.textContent = 'Kelola akses API dan Webhook untuk partner e-commerce';
            loadPartners();
            break;
        case 'monitoring':
            headerTitle.textContent = 'Monitoring API & Webhook';
            headerSubtitle.textContent = 'Log aktivitas request API dan status callback Webhook partner';
            loadApiLogs();
            loadWebhookLogs();
            break;
        case 'transactions':
            headerTitle.textContent = 'Laporan Pembayaran B2B';
            headerSubtitle.textContent = 'Monitor riwayat transaksi keuangan SmartBank dari mitra B2B';
            break;
        case 'tracking':
            headerTitle.textContent = 'Lacak Resi Nasional';
            headerSubtitle.textContent = 'Lacak detail status pengiriman paket secara global';
            document.getElementById('sa-search-resi-input').value = '';
            document.getElementById('sa-tracking-result').style.display = 'none';
            break;
        case 'reports':
            headerTitle.textContent = 'Aduan Pelanggan';
            headerSubtitle.textContent = 'Manajemen laporan kendala dan komplain pengiriman dari customer';
            loadAdminReports();
            break;
    }
}

// Mobile navigation drawer toggle
function toggleMobileSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('active');
}

// 1. Dashboard Stats
async function loadDashboardStats() {
    try {
        const res = await fetch(`${API}/superadmin/dashboard-stats`, {
            headers: { 'x-admin-token': saToken }
        });
        const data = await res.json();
        
        if (data.status === 'Success' && data.data) {
            const stats = data.data;
            // Backend returns nested: { shipments: {...}, orders: {...}, transactions: {...}, users: {...}, partners: {...} }
            const ship = stats.shipments || {};
            const tx = stats.transactions || {};
            document.getElementById('stat-total-shipments').textContent = ship.total_shipments || 0;
            document.getElementById('stat-total-delivered').textContent = ship.delivered || 0;
            document.getElementById('stat-total-transit').textContent = ship.in_transit || 0;
            document.getElementById('stat-total-revenue').textContent = formatCurrency(tx.total_revenue || 0);
            
            const revenueDeliveredEl = document.getElementById('stat-revenue-delivered');
            if (revenueDeliveredEl) {
                revenueDeliveredEl.textContent = formatCurrency(ship.revenue_delivered || 0);
            }
        }
    } catch (err) {
        console.error('[Load Stats Error]', err);
        showToast('Gagal memuat statistik nasional', 'danger');
    }
}

// 2. Load Branches
async function loadBranches() {
    try {
        const res = await fetch(`${API}/superadmin/branches`, {
            headers: { 'x-admin-token': saToken }
        });
        const data = await res.json();
        
        if (data.status === 'Success' && data.data) {
            cachedBranches = data.data;
            
            // Populate branch dropdown in user creation form
            const branchSelect = document.getElementById('new-user-branch');
            branchSelect.innerHTML = cachedBranches.map(b => `
                <option value="${b.id}">${b.name || b.nama_cabang} (${b.city || b.kota || '-'})</option>
            `).join('');

            // Render Dashboard summary table (Top 5 branches)
            const summaryTbody = document.getElementById('branches-summary-tbody');
            summaryTbody.innerHTML = cachedBranches.slice(0, 5).map(b => `
                <tr>
                    <td><strong>${b.name || b.nama_cabang}</strong></td>
                    <td>${b.city || b.kota || '-'}</td>
                    <td><span class="status-badge in_transit">${b.total_shipments || 0} Paket</span></td>
                    <td><span class="status-badge delivered">${b.total_kurir || b.active_couriers || 0} Kurir</span></td>
                </tr>
            `).join('');

            // Render Branches full table
            const fullTbody = document.getElementById('branches-full-tbody');
            fullTbody.innerHTML = cachedBranches.map(b => `
                <tr>
                    <td>${b.id}</td>
                    <td><strong>${b.name || b.nama_cabang}</strong></td>
                    <td><code style="color: var(--accent); font-weight: 700;">${b.kode_cabang || 'CB-' + String(b.id).padStart(3, '0')}</code></td>
                    <td>${b.city || b.kota || '-'}</td>
                    <td style="font-size: 0.8rem; color: var(--text-secondary); max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${b.alamat || b.address || '-'}</td>
                    <td><span class="status-badge in_transit">${b.total_shipments || 0} Resi</span></td>
                    <td>
                        <button class="btn-secondary" style="padding: 0.35rem 0.75rem;" onclick="switchTab('dashboard')">
                            <i class="fas fa-eye"></i> Detail
                        </button>
                    </td>
                </tr>
            `).join('');
        }
    } catch (err) {
        console.error('[Load Branches Error]', err);
        showToast('Gagal memuat data cabang', 'danger');
    }
}

// 3. Load Realtime Activity Feed
async function loadRealtimeActivity() {
    try {
        const res = await fetch(`${API}/superadmin/realtime-activity`, {
            headers: { 'x-admin-token': saToken }
        });
        const data = await res.json();
        
        if (data.status === 'Success' && data.data) {
            const feed = document.getElementById('national-activity-feed');
            if (data.data.length === 0) {
                feed.innerHTML = `<li style="color: var(--text-muted); list-style: none; text-align: center; padding-top: 2rem;">Belum ada aktivitas hari ini.</li>`;
                return;
            }
            
            feed.innerHTML = data.data.map(act => {
                const timeStr = formatTimeAgo(act.created_at);
                let statusClass = 'pending';
                if (act.status === 'Selesai' || act.status === 'Delivered') statusClass = 'delivered';
                if (act.status === 'In Transit') statusClass = 'in_transit';
                if (act.status === 'Failed') statusClass = 'failed';
                if (act.status === 'Picked Up' || act.status === 'Arrived at Branch' || act.status === 'Arrived at Destination Branch') statusClass = 'delivered';

                // Specific packet details:
                const packetDetailHtml = act.sender_name ? `
                    <div class="activity-packet-details" style="margin-top: 6px; padding: 6px 10px; background: rgba(255,255,255,0.03); border-radius: 6px; font-size: 0.75rem; border-left: 2px solid var(--accent); color: var(--text-secondary);">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
                            <span><strong>Pengirim:</strong> ${act.sender_name} (${act.sender_city})</span>
                            <span><strong>Penerima:</strong> ${act.receiver_name} (${act.receiver_city})</span>
                        </div>
                        <div style="display: flex; gap: 15px;">
                            <span><i class="fas fa-layer-group"></i> ${act.service_type || 'Reguler'}</span>
                            <span><i class="fas fa-weight-hanging"></i> ${act.weight || 1} kg</span>
                        </div>
                    </div>
                ` : '';

                return `
                    <li class="activity-item" style="padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.05);">
                        <div class="activity-meta" style="display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--text-muted); margin-bottom: 4px;">
                            <span>Resi: <strong style="color: var(--accent); font-family: monospace;">${act.awb_number || '-'}</strong></span>
                            <span>${timeStr}</span>
                        </div>
                        <div class="activity-desc" style="font-size: 0.825rem; line-height: 1.4;">
                            <strong>${act.branch_name || act.nama_cabang || 'Cabang'}</strong>: ${act.description || '-'}
                            <span class="status-badge ${statusClass}" style="transform: scale(0.85); display: inline-flex; vertical-align: middle; margin-left: 5px; padding: 0.15rem 0.5rem; border-radius: 4px;">${act.status}</span>
                        </div>
                        ${packetDetailHtml}
                    </li>
                `;
            }).join('');
        }
    } catch (err) {
        console.error('[Load Activity Error]', err);
    }
}

// 4. Manage Users
async function loadUsers() {
    try {
        const res = await fetch(`${API}/superadmin/admins`, {
            headers: { 'x-admin-token': saToken }
        });
        const data = await res.json();
        
        if (data.status === 'Success' && data.data) {
            const listTbody = document.getElementById('users-list-tbody');
            listTbody.innerHTML = data.data.map(u => {
                // Find branch name
                let branchName = 'Semua Cabang (Pusat)';
                if (u.branch_id) {
                    const branch = cachedBranches.find(b => b.id === u.branch_id);
                    if (branch) branchName = branch.nama_cabang;
                }

                // Protect superadmin from modification
                const isSelf = u.role === 'Superadmin';
                const actionBtns = isSelf ? `
                    <span style="color: var(--text-muted); font-size: 0.75rem;">Protected</span>
                ` : `
                    <div style="display: flex; gap: 0.4rem;">
                        <button class="btn-secondary" style="padding: 0.35rem 0.5rem;" title="Reset Password" onclick="openResetModal(${u.id}, '${u.nama}')">
                            <i class="fas fa-key"></i>
                        </button>
                        <button class="btn-secondary" style="padding: 0.35rem 0.5rem; color: ${u.is_active ? '#ef4444' : '#10b981'}" title="${u.is_active ? 'Nonaktifkan' : 'Aktifkan'}" onclick="toggleUser(${u.id}, '${u.nama}', ${u.is_active})">
                            <i class="fas ${u.is_active ? 'fa-pause' : 'fa-play'}"></i>
                        </button>
                        <button class="btn-secondary" style="padding: 0.35rem 0.5rem; color: #ef4444;" title="Hapus User" onclick="deleteUser(${u.id}, '${u.nama}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                `;

                let roleBadge = 'customer';
                if (u.role === 'Superadmin') roleBadge = 'superadmin';
                if (u.role === 'Branch Admin') roleBadge = 'branch';
                if (u.role === 'Dispatcher') roleBadge = 'dispatcher';
                if (u.role === 'Kurir') roleBadge = 'kurir';

                return `
                    <tr>
                        <td>
                            <div style="font-weight: 700; color: #fff;">${u.nama}</div>
                            <span class="status-badge ${roleBadge}" style="padding: 0.15rem 0.4rem; font-size: 0.65rem;">${u.role}</span>
                        </td>
                        <td style="font-size: 0.8rem; color: var(--text-secondary);">
                            <div>${u.email}</div>
                            <div style="color: var(--text-muted); font-size: 0.75rem;"><i class="fas fa-building"></i> ${branchName}</div>
                        </td>
                        <td>
                            <span class="status-badge ${u.is_active ? 'delivered' : 'failed'}" style="padding: 0.2rem 0.5rem; font-size: 0.7rem;">
                                ${u.is_active ? 'Aktif' : 'Nonaktif'}
                            </span>
                        </td>
                        <td>${actionBtns}</td>
                    </tr>
                `;
            }).join('');
        }
    } catch (err) {
        console.error('[Load Users Error]', err);
        showToast('Gagal memuat data operator/staff', 'danger');
    }
}

// Adjust form UI based on selected role
function handleNewRoleChange() {
    const role = document.getElementById('new-user-role').value;
    const branchGroup = document.getElementById('new-user-branch-group');
    
    if (role === 'Superadmin' || role === 'Customer' || role === 'Admin') {
        branchGroup.style.display = 'none';
    } else {
        branchGroup.style.display = 'block';
    }
}

// Create new user
async function handleCreateUser(e) {
    e.preventDefault();
    const nama = document.getElementById('new-user-name').value.trim();
    const email = document.getElementById('new-user-email').value.trim();
    const password = document.getElementById('new-user-password').value.trim();
    const role = document.getElementById('new-user-role').value;
    
    // branch_id logic
    let branch_id = null;
    if (role !== 'Superadmin' && role !== 'Customer' && role !== 'Admin') {
        branch_id = parseInt(document.getElementById('new-user-branch').value);
    }

    try {
        const res = await fetch(`${API}/superadmin/admins`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-admin-token': saToken
            },
            body: JSON.stringify({ nama, email, password, role, branch_id })
        });
        const result = await res.json();

        if (res.ok && result.status === 'Success') {
            showToast('Akun baru berhasil didaftarkan!', 'success');
            document.getElementById('create-user-form').reset();
            handleNewRoleChange();
            loadUsers();
        } else {
            showToast(result.message || 'Gagal menyimpan akun', 'danger');
        }
    } catch (err) {
        console.error('[Create User Error]', err);
        showToast('Kesalahan koneksi saat menyimpan akun', 'danger');
    }
}

// Toggle user status
async function toggleUser(id, nama, currentStatus) {
    const actionText = currentStatus ? 'menonaktifkan' : 'mengaktifkan';
    if (!confirm(`Apakah Anda yakin ingin ${actionText} akun ${nama}?`)) return;

    try {
        const res = await fetch(`${API}/superadmin/admins/${id}/toggle`, {
            method: 'PATCH',
            headers: {
                'x-admin-token': saToken
            }
        });
        const result = await res.json();
        
        if (res.ok && result.status === 'Success') {
            showToast(result.message, 'success');
            loadUsers();
        } else {
            showToast(result.message || 'Gagal mengubah status akun', 'danger');
        }
    } catch (err) {
        console.error('[Toggle User Error]', err);
        showToast('Koneksi terputus saat merubah status', 'danger');
    }
}

// Delete user
async function deleteUser(id, nama) {
    if (!confirm(`Apakah Anda yakin ingin MENGHAPUS akun ${nama}? Tindakan ini bersifat permanen.`)) return;

    try {
        const res = await fetch(`${API}/superadmin/admins/${id}`, {
            method: 'DELETE',
            headers: {
                'x-admin-token': saToken
            }
        });
        const result = await res.json();
        
        if (res.ok && result.status === 'Success') {
            showToast('Akun berhasil dihapus permanent', 'success');
            loadUsers();
        } else {
            showToast(result.message || 'Gagal menghapus akun', 'danger');
        }
    } catch (err) {
        console.error('[Delete User Error]', err);
        showToast('Koneksi terputus saat menghapus akun', 'danger');
    }
}

// Reset Password Modal
function openResetModal(id, nama) {
    resetTargetId = id;
    document.getElementById('reset-modal-desc').innerHTML = `Ganti kata sandi untuk pengguna <strong>${nama}</strong>.`;
    document.getElementById('reset-password-input').value = '';
    document.getElementById('reset-password-modal').classList.add('active');
}

function closeResetModal() {
    document.getElementById('reset-password-modal').classList.remove('active');
}

async function confirmResetPassword() {
    const newPassword = document.getElementById('reset-password-input').value.trim();
    if (!newPassword || newPassword.length < 6) {
        showToast('Password minimal 6 karakter', 'danger');
        return;
    }

    try {
        const res = await fetch(`${API}/superadmin/admins/${resetTargetId}/reset-password`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'x-admin-token': saToken
            },
            body: JSON.stringify({ new_password: newPassword })
        });
        const result = await res.json();
        
        if (res.ok && result.status === 'Success') {
            showToast('Kata sandi berhasil diperbarui!', 'success');
            closeResetModal();
        } else {
            showToast(result.message || 'Gagal meriset kata sandi', 'danger');
        }
    } catch (err) {
        console.error('[Reset PW Error]', err);
        showToast('Koneksi terputus saat meriset kata sandi', 'danger');
    }
}

// 5. Global Financial Reports
async function loadTransactions() {
    try {
        const res = await fetch(`${API}/superadmin/transactions`, {
            headers: { 'x-admin-token': saToken }
        });
        const data = await res.json();
        
        if (data.status === 'Success' && data.data) {
            const txTbody = document.getElementById('transactions-tbody');
            if (data.data.length === 0) {
                txTbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-muted);">Belum ada riwayat keuangan B2B.</td></tr>`;
                return;
            }

            txTbody.innerHTML = data.data.map(tx => {
                let payBadge = 'pending';
                if (tx.status_pengiriman === 'Selesai' || tx.status_pengiriman === 'Delivered') payBadge = 'delivered';
                if (tx.status_pengiriman === 'In Transit') payBadge = 'in_transit';

                return `
                    <tr>
                        <td style="font-family: monospace; font-size: 0.8rem; color: var(--accent); font-weight: 700;">${tx.transaction_id}</td>
                        <td style="font-size: 0.8rem; color: var(--text-secondary);">${formatDate(tx.created_at)}</td>
                        <td><strong>${tx.nama || 'Mitra B2B'}</strong></td>
                        <td style="font-size: 0.85rem;">${tx.branch_name || 'Nasional'}</td>
                        <td style="font-weight: 600; color: #fff;">${formatCurrency(tx.amount)}</td>
                        <td style="font-weight: 700; color: var(--accent);">${formatCurrency(tx.total)}</td>
                        <td>
                            <span class="status-badge ${payBadge}" style="padding: 0.15rem 0.5rem; font-size: 0.65rem;">
                                ${tx.status_pengiriman || 'Pending'}
                            </span>
                        </td>
                    </tr>
                `;
            }).join('');
        }
    } catch (err) {
        console.error('[Load Financials Error]', err);
        showToast('Gagal memuat keuangan B2B', 'danger');
    }
}

// Logout handler
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

// ============================================================
// PARTNER MANAGEMENT
// ============================================================
async function loadPartners() {
    try {
        const res = await fetch(`${API}/superadmin/partners`, { headers: { 'x-admin-token': saToken } });
        const data = await res.json();
        if (data.status === 'Success' && data.data) {
            const tbody = document.getElementById('partners-list-tbody');
            if (data.data.length === 0) {
                tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--text-muted);">Belum ada partner terdaftar.</td></tr>`;
                return;
            }
            tbody.innerHTML = data.data.map(p => `
                <tr>
                    <td>
                        <div style="font-weight: 700; color: #fff;">${p.name}</div>
                        <div style="font-size: 0.75rem; color: var(--text-muted);">${p.company_name || '-'}</div>
                    </td>
                    <td style="font-size: 0.8rem; font-family: monospace;">
                        <div style="color: var(--accent);">Key: ${p.api_key}</div>
                        <div style="color: var(--text-secondary);">Webhook Secret: ${p.webhook_secret}</div>
                    </td>
                    <td>
                        <span class="status-badge ${p.status === 'active' ? 'delivered' : 'failed'}" style="padding: 0.2rem 0.5rem; font-size: 0.7rem;">
                            ${p.status === 'active' ? 'Aktif' : 'Nonaktif'}
                        </span>
                    </td>
                    <td>
                        <button class="btn-secondary" style="padding: 0.35rem 0.5rem; color: ${p.status === 'active' ? '#ef4444' : '#10b981'}" onclick="togglePartnerStatus(${p.id}, '${p.name}', '${p.status}')">
                            <i class="fas ${p.status === 'active' ? 'fa-pause' : 'fa-play'}"></i>
                        </button>
                    </td>
                </tr>
            `).join('');
        }
    } catch (err) {
        console.error('[Load Partners Error]', err);
    }
}

async function handleCreatePartner(e) {
    e.preventDefault();
    const payload = {
        name: document.getElementById('new-partner-name').value.trim(),
        company_name: document.getElementById('new-partner-company').value.trim(),
        contact_email: document.getElementById('new-partner-email').value.trim(),
        contact_phone: document.getElementById('new-partner-phone').value.trim(),
        callback_url: document.getElementById('new-partner-webhook').value.trim()
    };
    try {
        const res = await fetch(`${API}/superadmin/partners`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-admin-token': saToken },
            body: JSON.stringify(payload)
        });
        const result = await res.json();
        if (res.ok && result.status === 'Success') {
            showToast('Partner berhasil ditambahkan', 'success');
            document.getElementById('create-partner-form').reset();
            loadPartners();
        } else {
            showToast(result.message || 'Gagal menambahkan partner', 'danger');
        }
    } catch (err) {
        console.error('[Create Partner Error]', err);
    }
}

async function togglePartnerStatus(id, name, currentStatus) {
    if (!confirm(`Apakah Anda yakin ingin mengubah status partner ${name}?`)) return;
    try {
        const res = await fetch(`${API}/superadmin/partners/${id}/toggle`, { method: 'PATCH', headers: { 'x-admin-token': saToken } });
        if (res.ok) {
            showToast('Status partner berhasil diubah', 'success');
            loadPartners();
        }
    } catch (err) {
        console.error('[Toggle Partner Error]', err);
    }
}

// ============================================================
// MONITORING API & WEBHOOK
// ============================================================
async function loadApiLogs() {
    try {
        const res = await fetch(`${API}/superadmin/api-logs`, { headers: { 'x-admin-token': saToken } });
        const data = await res.json();
        if (data.status === 'Success' && data.data) {
            const tbody = document.getElementById('api-logs-tbody');
            tbody.innerHTML = data.data.map(log => `
                <tr>
                    <td style="font-size: 0.8rem; color: var(--text-secondary);">${formatDate(log.created_at)}</td>
                    <td><strong>${log.partner_name || '-'}</strong></td>
                    <td><span class="status-badge customer" style="font-size: 0.65rem;">${log.method}</span></td>
                    <td style="font-family: monospace; font-size: 0.8rem;">${log.endpoint}</td>
                    <td><span class="status-badge ${log.response_status < 400 ? 'delivered' : 'failed'}" style="font-size: 0.7rem;">${log.response_status}</span></td>
                    <td style="font-size: 0.8rem;">${log.execution_time_ms} ms</td>
                </tr>
            `).join('');
        }
    } catch (err) {
        console.error('[Load API Logs Error]', err);
    }
}

async function loadWebhookLogs() {
    try {
        const res = await fetch(`${API}/superadmin/webhook-logs`, { headers: { 'x-admin-token': saToken } });
        const data = await res.json();
        if (data.status === 'Success' && data.data) {
            const tbody = document.getElementById('webhook-logs-tbody');
            tbody.innerHTML = data.data.map(log => `
                <tr>
                    <td style="font-size: 0.8rem; color: var(--text-secondary);">${formatDate(log.created_at)}</td>
                    <td><strong>${log.partner_name || '-'}</strong></td>
                    <td style="font-family: monospace; font-size: 0.8rem;">Shipment #${log.shipment_id}</td>
                    <td><span class="status-badge ${log.status_code >= 200 && log.status_code < 300 ? 'delivered' : 'failed'}" style="font-size: 0.7rem;">${log.status_code || 'Err'}</span></td>
                    <td style="font-size: 0.8rem;">${log.attempt}</td>
                </tr>
            `).join('');
        }
    } catch (err) {
        console.error('[Load Webhook Logs Error]', err);
    }
}

// ============================================================
// 6. Lacak Resi Nasional (Superadmin Tool)
// ============================================================
async function saSearchResi() {
    const awbInput = document.getElementById('sa-search-resi-input').value.trim();
    const resultDiv = document.getElementById('sa-tracking-result');

    if (!awbInput) {
        showToast('Masukkan nomor resi terlebih dahulu', 'danger');
        return;
    }

    resultDiv.style.display = 'block';
    resultDiv.innerHTML = `
        <div style="text-align: center; padding: 2rem; color: var(--text-secondary);">
            <i class="fas fa-spinner fa-spin" style="font-size: 1.5rem; color: var(--accent);"></i>
            <p style="margin-top: 10px;">Sedang mencari data resi ${awbInput}...</p>
        </div>
    `;

    try {
        const res = await fetch(`/api/v1/tracking/${encodeURIComponent(awbInput)}`);
        const data = await res.json();

        if (data.status === 'Success') {
            const ship = data.data.shipment;
            const logs = data.data.tracking_history;

            let timelineHtml = logs && logs.length > 0 ? logs.map(l => `
                <div class="tl-item" style="position: relative; padding: 10px 0; padding-left: 20px; border-left: 2px solid rgba(255,255,255,0.08);">
                    <div style="position: absolute; left: -6px; top: 16px; width: 10px; height: 10px; border-radius: 50%; background: var(--accent);"></div>
                    <div style="font-size: 0.85rem; font-weight: 700; color: #fff;">${l.status}</div>
                    <div style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 2px;">${l.description}</div>
                    <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 2px;">
                        <i class="fas fa-location-dot"></i> ${l.location || '-'} &middot; <i class="fas fa-clock"></i> ${formatDate(l.created_at)}
                    </div>
                </div>
            `).join('') : '<p style="color: var(--text-muted);">Belum ada riwayat pelacakan.</p>';

            resultDiv.innerHTML = `
                <div style="border-top: 1px solid rgba(255,255,255,0.1); padding-top: 1.5rem; margin-top: 1rem;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                        <span style="font-size: 0.9rem; color: var(--text-secondary);">Nomor Resi: <strong style="color: var(--accent); font-family: monospace; font-size: 1rem;">${ship.awb_number}</strong></span>
                        <span class="status-badge ${ship.status.toLowerCase().replace(/\s+/g,'-')}" style="padding: 0.25rem 0.75rem; border-radius: 6px;">${ship.status}</span>
                    </div>

                    <div style="background: rgba(255,255,255,0.02); padding: 12px; border-radius: 8px; margin-bottom: 1rem;">
                        <div style="font-size: 0.85rem; margin-bottom: 6px;"><i class="fas fa-building" style="color: var(--accent);"></i> <strong>Posisi Saat Ini:</strong> ${ship.current_branch_name || 'Transit / Kurir'} (${ship.current_branch_city || '-'})</div>
                        <div style="font-size: 0.85rem;"><i class="fas fa-flag-checkered" style="color: #6ea8ff;"></i> <strong>Menuju Cabang:</strong> ${ship.dest_branch_name || 'Alamat Tujuan'} (${ship.dest_branch_city || '-'})</div>
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem; font-size: 0.85rem;">
                        <div style="background: rgba(255,255,255,0.02); padding: 12px; border-radius: 8px;">
                            <div style="font-weight: 700; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 4px; margin-bottom: 6px; color: var(--accent);">PENGIRIM</div>
                            <div><strong>${ship.sender_name}</strong></div>
                            <div style="color: var(--text-secondary); margin-top: 2px;">${ship.sender_city}</div>
                            <div style="color: var(--text-muted); font-size: 0.75rem; margin-top: 4px;">${ship.sender_address}</div>
                        </div>
                        <div style="background: rgba(255,255,255,0.02); padding: 12px; border-radius: 8px;">
                            <div style="font-weight: 700; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 4px; margin-bottom: 6px; color: #6ea8ff;">PENERIMA</div>
                            <div><strong>${ship.receiver_name}</strong></div>
                            <div style="color: var(--text-secondary); margin-top: 2px;">${ship.receiver_city}</div>
                            <div style="color: var(--text-muted); font-size: 0.75rem; margin-top: 4px;">${ship.receiver_address}</div>
                        </div>
                    </div>

                    <div style="display: flex; gap: 15px; margin-bottom: 1.5rem; background: rgba(255,255,255,0.02); padding: 10px; border-radius: 8px; font-size: 0.825rem;">
                        <span><strong>Layanan:</strong> ${ship.service_name || ship.service_type || '-'} (${ship.estimasi || '-'})</span>
                        <span><strong>Berat:</strong> ${ship.weight} kg</span>
                        <span><strong>Jarak:</strong> ${ship.distance_km} km</span>
                        <span><strong>Total Ongkir:</strong> ${formatCurrency(ship.total_biaya)}</span>
                    </div>

                    <h4 style="margin-bottom: 10px; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 6px;"><i class="fas fa-route"></i> Timeline Perjalanan Paket</h4>
                    <div style="margin-left: 10px; padding-top: 5px;">
                        ${timelineHtml}
                    </div>
                </div>
            `;
        } else {
            resultDiv.innerHTML = `
                <div class="alert alert-danger" style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); color: #fecaca; padding: 12px; border-radius: 8px; text-align: center; margin-top: 1rem;">
                    <i class="fas fa-circle-exclamation"></i> ${data.message || 'Resi tidak ditemukan'}
                </div>
            `;
        }
    } catch (err) {
        console.error('[saSearchResi Error]', err);
        resultDiv.innerHTML = `
            <div class="alert alert-danger" style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); color: #fecaca; padding: 12px; border-radius: 8px; text-align: center; margin-top: 1rem;">
                <i class="fas fa-circle-exclamation"></i> Gagal menghubungkan ke server pelacakan resi.
            </div>
        `;
    }
}

// ============================================================
// 7. Laporan Aduan & Komplain Pelanggan
// ============================================================
async function loadAdminReports() {
    try {
        const res = await fetch(`${API}/superadmin/reports`, {
            headers: { 'x-admin-token': saToken }
        });
        const data = await res.json();

        if (data.status === 'Success' && data.data) {
            const tbody = document.getElementById('reports-list-tbody');
            if (data.data.length === 0) {
                tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-muted);">Tidak ada laporan aduan masuk.</td></tr>`;
                return;
            }

            tbody.innerHTML = data.data.map(rep => {
                const badgeClass = rep.status === 'Resolved' ? 'delivered' : 'pending';
                const actionBtnText = rep.status === 'Resolved' ? 'Tandai Pending' : 'Tandai Selesai';
                const actionIcon = rep.status === 'Resolved' ? 'fa-rotate-left' : 'fa-check-circle';
                const targetStatus = rep.status === 'Resolved' ? 'Pending' : 'Resolved';

                return `
                    <tr>
                        <td>
                            <div style="font-weight: 700; color: #fff;">${rep.name}</div>
                            <span style="font-size: 0.75rem; color: var(--text-secondary);">${rep.email}</span>
                        </td>
                        <td style="font-family: monospace; font-size: 0.825rem; font-weight: 700; color: var(--accent);">
                            ${rep.awb_number ? `
                                <a href="javascript:void(0)" onclick="saQuickLocateResi('${rep.awb_number}')" style="text-decoration: underline; color: inherit;">
                                    ${rep.awb_number}
                                </a>
                            ` : '-'}
                        </td>
                        <td style="font-size: 0.85rem; font-weight: 600; color: #f59e0b;">${rep.report_type}</td>
                        <td style="font-size: 0.8rem; color: var(--text-secondary); max-width: 250px; white-space: normal; line-height: 1.4;">${rep.message}</td>
                        <td style="font-size: 0.8rem; color: var(--text-muted);">${formatDate(rep.created_at)}</td>
                        <td>
                            <span class="status-badge ${badgeClass}" style="padding: 0.2rem 0.5rem; font-size: 0.7rem;">
                                ${rep.status === 'Resolved' ? 'Selesai' : 'Pending'}
                            </span>
                        </td>
                        <td>
                            <button class="btn-secondary" style="padding: 0.35rem 0.75rem; font-size: 0.75rem; display: inline-flex; align-items: center; gap: 4px;" onclick="toggleReportStatus(${rep.id}, '${targetStatus}')">
                                <i class="fas ${actionIcon}"></i> ${actionBtnText}
                            </button>
                        </td>
                    </tr>
                `;
            }).join('');
        }
    } catch (err) {
        console.error('[Load Reports Error]', err);
        showToast('Gagal memuat aduan pelanggan', 'danger');
    }
}

async function toggleReportStatus(id, newStatus) {
    try {
        const res = await fetch(`${API}/superadmin/reports/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'x-admin-token': saToken
            },
            body: JSON.stringify({ status: newStatus })
        });
        const result = await res.json();

        if (res.ok && result.status === 'Success') {
            showToast(result.message, 'success');
            loadAdminReports();
        } else {
            showToast(result.message || 'Gagal memperbarui status laporan', 'danger');
        }
    } catch (err) {
        console.error('[Toggle Report Status Error]', err);
        showToast('Koneksi terputus saat merubah status laporan', 'danger');
    }
}

// Helper to quickly search and switch to tracking tab
function saQuickLocateResi(awb) {
    switchTab('tracking');
    document.getElementById('sa-search-resi-input').value = awb;
    saSearchResi();
}
