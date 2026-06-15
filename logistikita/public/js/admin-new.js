// ============================================================
// Admin-new.js - Halaman 3: Admin Panel (Pegawai LogistiKita)
// Tabel antrean pengiriman + dropdown update status
// ============================================================

const ADMIN_API_URL = 'http://localhost:3000';

const STATUS_OPTIONS = [
    { value: 'Pending', label: 'Menunggu Penjemputan', icon: '⏳' },
    { value: 'Picked Up', label: 'Di Gudang Sortir', icon: '📦' },
    { value: 'In Transit', label: 'Sedang Dikirim', icon: '🚛' },
    { value: 'Delivered', label: 'Selesai', icon: '✅' }
];

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
        window.location.href = 'admin-login.html';
        return;
    }

    loadShipments();

    document.getElementById('btn-admin-refresh').addEventListener('click', loadShipments);

    // Auto-refresh every 15 seconds
    setInterval(loadShipments, 15000);
});

// ============================================================
// LOAD: Fetch all shipments from backend
// ============================================================
async function loadShipments() {
    const tbody = document.getElementById('admin-queue-tbody');
    const emptyMsg = document.getElementById('admin-queue-empty');

    tbody.innerHTML = '';
    emptyMsg.innerHTML = '<i class="fas fa-spinner fa-spin"></i><p>Memuat data antrean pengiriman...</p>';
    emptyMsg.style.display = 'flex';

    try {
        const res = await fetch(`${ADMIN_API_URL}/internal/shipments`, {
            headers: getAdminHeaders()
        });
        const result = await res.json();

        if (result.status === 'Success' && Array.isArray(result.data)) {
            renderShipmentTable(result.data);
            updateAdminStats(result.data);
            updateSyncTime();
            
            // SUPERADMIN: Render Payment History
            if (localStorage.getItem('adminRole') === 'Superadmin') {
                renderPaymentHistory(result.data);
            }

            if (result.data.length === 0) {
                emptyMsg.innerHTML = '<i class="fas fa-inbox"></i><p>Belum ada pesanan masuk.</p>';
                emptyMsg.style.display = 'flex';
            } else {
                emptyMsg.style.display = 'none';
            }
        } else {
            handleError(result.message || 'Gagal memuat data.');
        }
    } catch (err) {
        handleError('Gagal terhubung ke server admin.');
    }
}

// ============================================================
// SUPERADMIN: RENDER PAYMENT HISTORY
// ============================================================
function renderPaymentHistory(orders) {
    const tbody = document.getElementById('admin-payment-tbody');
    if (!tbody) return;
    
    // Filter only paid orders
    const paidOrders = orders.filter(o => o.payment_status === 'Paid');
    
    // Calculate total revenue
    const totalRevenue = paidOrders.reduce((sum, order) => sum + (parseFloat(order.total_biaya) || 0), 0);
    
    // Update KPI Total Pendapatan
    const revenueEl = document.getElementById('superadmin-total-revenue');
    if (revenueEl) {
        revenueEl.textContent = formatCurrency(totalRevenue);
    }
    
    tbody.innerHTML = '';
    
    if (paidOrders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center"><i class="fas fa-box-open"></i> Belum ada transaksi lunas.</td></tr>';
        return;
    }
    
    paidOrders.forEach((order, index) => {
        const row = document.createElement('tr');
        // We use created_at if available, else a placeholder date for demo
        const dateStr = order.created_at ? new Date(order.created_at).toLocaleDateString('id-ID') : new Date().toLocaleDateString('id-ID');
        
        row.innerHTML = `
            <td>${index + 1}</td>
            <td><code class="awb-code">${order.awb_number}</code></td>
            <td>${order.nama_mitra || '-'}</td>
            <td>${dateStr}</td>
            <td class="currency-cell" style="color:#10b981;">${formatCurrency(order.total_biaya)}</td>
            <td><span class="badge badge-success"><i class="fas fa-check-circle"></i> Lunas</span></td>
        `;
        tbody.appendChild(row);
    });
}

// ============================================================
// RENDER: Shipment table rows
// ============================================================
function renderShipmentTable(orders) {
    const tbody = document.getElementById('admin-queue-tbody');
    tbody.innerHTML = '';

    orders.forEach((order, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td><code class="awb-code">${order.awb_number}</code></td>
            <td>${order.nama_mitra || '-'}</td>
            <td class="sender-cell">${truncate(order.sender_name, 20)}</td>
            <td class="receiver-cell">${truncate(order.receiver_name, 20)}</td>
            <td class="address-cell-admin">${truncate(order.receiver_address, 30)}</td>
            <td>${order.weight} kg</td>
            <td class="currency-cell">${formatCurrency(order.total_biaya)}</td>
            <td><span class="badge ${getPaymentBadge(order.payment_status)}">${order.payment_status}</span></td>
            <td><span class="badge ${getShippingBadge(order.status)}">${order.status}</span></td>
            <td>
                <div class="action-group">
                    <select id="status-${order.awb_number}" class="status-dropdown">
                        ${STATUS_OPTIONS.map(opt => 
                            `<option value="${opt.value}" ${opt.value === order.status ? 'selected' : ''}>${opt.icon} ${opt.label}</option>`
                        ).join('')}
                    </select>
                    <button class="update-btn" onclick="updateStatus('${order.awb_number}')">
                        <i class="fas fa-arrow-up-from-bracket"></i> Update
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// ============================================================
// UPDATE: Status pengiriman
// ============================================================
async function updateStatus(awbNumber) {
    const select = document.getElementById(`status-${awbNumber}`);
    const newStatus = select.value;

    if (!awbNumber || !newStatus) {
        alert('Pilih status baru terlebih dahulu.');
        return;
    }

    const btn = select.closest('.action-group').querySelector('.update-btn');
    const origText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    btn.disabled = true;

    try {
        const res = await fetch(`${ADMIN_API_URL}/internal/shipments/update-status`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...getAdminHeaders()
            },
            body: JSON.stringify({ awb_number: awbNumber, status: newStatus })
        });

        const result = await res.json();
        if (result.status === 'Success') {
            loadShipments();
            showToast(`✓ Resi ${awbNumber} → ${newStatus}`, 'success');
        } else {
            handleError(result.message || 'Gagal update status');
        }
    } catch (err) {
        handleError('Gagal terhubung ke server.');
    }

    btn.innerHTML = origText;
    btn.disabled = false;
}

// ============================================================
// STATS: Update admin summary cards
// ============================================================
function updateAdminStats(orders) {
    const total = orders.length;
    const pending = orders.filter(o => o.status === 'Pending').length;
    const transit = orders.filter(o => o.status === 'In Transit' || o.status === 'Picked Up').length;
    const done = orders.filter(o => o.status === 'Delivered').length;

    document.getElementById('admin-total-orders').textContent = total;
    document.getElementById('admin-pending-count').textContent = pending;
    document.getElementById('admin-transit-count').textContent = transit;
    document.getElementById('admin-done-count').textContent = done;
}

// ============================================================
// UTILITY
// ============================================================
function getAdminHeaders() {
    const token = localStorage.getItem('adminToken');
    return { 'x-admin-token': token || '' };
}

function adminLogout() {
    localStorage.removeItem('adminToken');
    window.location.href = 'admin-login.html';
}

function updateSyncTime() {
    const el = document.getElementById('admin-last-sync');
    if (el) el.textContent = 'Terakhir: ' + new Date().toLocaleTimeString('id-ID');
}

function handleError(message) {
    if (message.includes('Token') || message.includes('Unauthorized')) {
        alert('Token admin tidak valid atau kadaluarsa.');
        adminLogout();
        return;
    }
    const emptyMsg = document.getElementById('admin-queue-empty');
    if (emptyMsg) {
        emptyMsg.innerHTML = `<i class="fas fa-exclamation-triangle"></i><p>${message}</p>`;
        emptyMsg.style.display = 'flex';
    }
}

function showToast(message, type) {
    // Simple toast notification
    const toast = document.createElement('div');
    toast.className = `toast-notification ${type}`;
    toast.innerHTML = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function formatCurrency(val) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency', currency: 'IDR', minimumFractionDigits: 0
    }).format(val || 0);
}

function truncate(text, max) {
    if (!text) return '-';
    return text.length > max ? text.substring(0, max) + '...' : text;
}

function getPaymentBadge(status) {
    const map = { 'Paid': 'badge-success', 'Pending': 'badge-warning', 'Failed': 'badge-danger' };
    return map[status] || 'badge-default';
}

function getShippingBadge(status) {
    const map = {
        'Pending': 'badge-warning', 'Picked Up': 'badge-info',
        'In Transit': 'badge-primary', 'Delivered': 'badge-success',
        'Failed': 'badge-danger'
    };
    return map[status] || 'badge-default';
}

// ============================================================
// SUPERADMIN FUNCTIONALITY
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    const role = localStorage.getItem('adminRole');
    if (role === 'Superadmin') {
        document.getElementById('superadmin-section').style.display = 'block';
        loadUsers();
    }

    // Modal Events
    const addUserBtn = document.getElementById('btn-add-user');
    const modal = document.getElementById('add-user-modal');
    const closeBtn = document.getElementById('add-user-close');
    const form = document.getElementById('form-add-user');

    if (addUserBtn) addUserBtn.addEventListener('click', () => { modal.classList.add('open'); document.body.style.overflow='hidden'; });
    if (closeBtn) closeBtn.addEventListener('click', () => { modal.classList.remove('open'); document.body.style.overflow=''; });
    if (form) form.addEventListener('submit', handleAddUser);
});

async function loadUsers() {
    const tbody = document.getElementById('admin-users-tbody');
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center"><i class="fas fa-spinner fa-spin"></i> Memuat data...</td></tr>';
    
    try {
        const res = await fetch(`${ADMIN_API_URL}/internal/users`, { headers: getAdminHeaders() });
        const result = await res.json();
        
        if (result.status === 'Success') {
            tbody.innerHTML = '';
            if (result.data.length === 0) {
                tbody.innerHTML = '<tr><td colspan="7" style="text-align:center">Tidak ada pengguna</td></tr>';
                return;
            }
            result.data.forEach((user, index) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${user.nama}</td>
                    <td>${user.email}</td>
                    <td><span class="badge ${user.role === 'Superadmin' ? 'badge-primary' : (user.role === 'Admin' ? 'badge-info' : 'badge-warning')}">${user.role}</span></td>
                    <td><span class="badge ${user.is_active ? 'badge-success' : 'badge-danger'}">${user.is_active ? 'Aktif' : 'Nonaktif'}</span></td>
                    <td>${new Date(user.created_at).toLocaleDateString('id-ID')}</td>
                    <td>
                        <button class="update-btn" style="background:#ff4d4d; color:white; border:none;" onclick="deleteUser(${user.id}, '${user.nama}')">
                            <i class="fas fa-trash"></i> Hapus
                        </button>
                    </td>
                `;
                tbody.appendChild(row);
            });
        }
    } catch (err) {
        console.error('Failed to load users:', err);
    }
}

async function handleAddUser(e) {
    e.preventDefault();
    const nama = document.getElementById('new-user-nama').value.trim();
    const email = document.getElementById('new-user-email').value.trim();
    const password = document.getElementById('new-user-password').value.trim();
    const role = document.getElementById('new-user-role').value;
    const alertBox = document.getElementById('add-user-alert');
    
    if (password.length < 6) {
        alertBox.className = 'modal-alert error';
        alertBox.textContent = 'Password minimal 6 karakter';
        alertBox.style.display = 'block';
        return;
    }
    
    const btn = document.getElementById('add-user-submit-btn');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Menyimpan...';
    
    try {
        const res = await fetch(`${ADMIN_API_URL}/internal/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...getAdminHeaders() },
            body: JSON.stringify({ nama, email, password, role })
        });
        const result = await res.json();
        
        if (result.status === 'Success') {
            document.getElementById('form-add-user').reset();
            document.getElementById('add-user-modal').classList.remove('open');
            document.body.style.overflow = '';
            showToast('✓ ' + result.message, 'success');
            loadUsers();
        } else {
            alertBox.className = 'modal-alert error';
            alertBox.textContent = '✗ ' + result.message;
            alertBox.style.display = 'block';
        }
    } catch (err) {
        alertBox.className = 'modal-alert error';
        alertBox.textContent = '✗ Gagal terhubung ke server';
        alertBox.style.display = 'block';
    }
    btn.disabled = false;
    btn.innerHTML = '<span><i class="fas fa-plus"></i> Tambah Pengguna</span>';
}

async function deleteUser(id, nama) {
    if (!confirm(`Yakin ingin menghapus pengguna: ${nama}?`)) return;
    
    try {
        const res = await fetch(`${ADMIN_API_URL}/internal/users/${id}`, {
            method: 'DELETE',
            headers: getAdminHeaders()
        });
        const result = await res.json();
        
        if (result.status === 'Success') {
            showToast('✓ Pengguna dihapus', 'success');
            loadUsers();
        } else {
            alert('Gagal menghapus: ' + result.message);
        }
    } catch (err) {
        alert('Gagal terhubung ke server');
    }
}
