// ============================================================
// payment-history.js — Riwayat Pembayaran SmartBank
// LogistiKita 2026
// ============================================================

const API_URL = 'http://localhost:3000';
let currentUserId = null;
let allTransactions = [];

document.addEventListener('DOMContentLoaded', () => {
    currentUserId = sessionStorage.getItem('smartbank_id');
    if (!currentUserId) {
        window.location.href = 'gateway.html';
        return;
    }
    loadTransactions();
    bindEvents();
});

function bindEvents() {
    document.getElementById('btn-logout').addEventListener('click', () => {
        sessionStorage.removeItem('gateway_data');
        sessionStorage.removeItem('smartbank_id');
        window.location.href = 'gateway.html';
    });
    document.getElementById('ph-refresh-btn').addEventListener('click', loadTransactions);
    document.getElementById('ph-search').addEventListener('input', filterTable);
    document.getElementById('ph-filter-status').addEventListener('change', filterTable);
    document.getElementById('detail-close').addEventListener('click', closeDetailModal);
    document.getElementById('detail-modal').addEventListener('click', (e) => {
        if (e.target === e.currentTarget) closeDetailModal();
    });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeDetailModal(); });
}

async function loadTransactions() {
    showLoading(true);
    try {
        const res = await fetch(`${API_URL}/logistikita/transactions/${currentUserId}`);
        const data = await res.json();
        if (data.status === 'Success') {
            allTransactions = data.data.transactions || [];
            renderSummary(data.data.summary);
            renderTable(allTransactions);
        } else {
            showEmpty(true);
        }
    } catch (err) {
        console.error('Gagal memuat transaksi:', err);
        showEmpty(true);
    }
    showLoading(false);
}

function renderSummary(summary) {
    document.getElementById('sum-total-trx').textContent = summary.total_transaksi + ' transaksi';
    document.getElementById('sum-total-bayar').textContent = formatCurrency(summary.total_bayar);
    document.getElementById('sum-total-ongkir').textContent = formatCurrency(summary.total_ongkir);
    document.getElementById('sum-total-fee').textContent = formatCurrency(summary.total_fee);
}

function renderTable(transactions) {
    const tbody = document.getElementById('ph-tbody');
    const empty = document.getElementById('ph-empty');
    const badge = document.getElementById('ph-count-badge');

    badge.textContent = transactions.length + ' transaksi';

    if (!transactions || transactions.length === 0) {
        tbody.innerHTML = '';
        empty.style.display = 'flex';
        return;
    }
    empty.style.display = 'none';
    tbody.innerHTML = transactions.map((t, i) => `
        <tr>
            <td>${i + 1}</td>
            <td><span class="ph-trx-id">${t.transaction_id}</span></td>
            <td><span class="ph-order-id">${t.order_id}</span></td>
            <td>${formatDate(t.created_at)}</td>
            <td>${truncate(t.alamat || '-', 30)}</td>
            <td class="ph-currency">${formatCurrency(t.amount)}</td>
            <td class="ph-currency fee-col">${formatCurrency(t.fee_layanan)}</td>
            <td class="ph-currency fee-col">${formatCurrency(t.fee_bank)}</td>
            <td class="ph-currency total-col">${formatCurrency(t.total)}</td>
            <td><span class="badge ${t.status_pembayaran === 'Lunas' ? 'badge-success' : 'badge-warning'}">${t.status_pembayaran || 'Lunas'}</span></td>
            <td>
                <button class="ph-detail-btn" onclick="openDetailModal('${t.transaction_id}')">
                    <i class="fas fa-eye"></i> Detail
                </button>
            </td>
        </tr>
    `).join('');
}

function filterTable() {
    const search = document.getElementById('ph-search').value.toLowerCase();
    const status = document.getElementById('ph-filter-status').value;
    const filtered = allTransactions.filter(t => {
        const matchSearch = !search ||
            t.transaction_id.toLowerCase().includes(search) ||
            t.order_id.toLowerCase().includes(search);
        const matchStatus = !status || (t.status_pembayaran || 'Lunas') === status;
        return matchSearch && matchStatus;
    });
    renderTable(filtered);
}

async function openDetailModal(transactionId) {
    document.getElementById('detail-modal').classList.add('open');
    document.body.style.overflow = 'hidden';
    document.getElementById('ph-detail-body').innerHTML =
        '<div class="ph-loading-msg"><i class="fas fa-spinner fa-spin"></i><p>Memuat detail...</p></div>';

    try {
        const res = await fetch(`${API_URL}/logistikita/transaction/${transactionId}`);
        const data = await res.json();
        if (data.status === 'Success') {
            renderDetailBody(data.data);
        } else {
            document.getElementById('ph-detail-body').innerHTML =
                '<div class="ph-empty-msg" style="display:flex"><i class="fas fa-exclamation-circle"></i><p>Gagal memuat detail transaksi.</p></div>';
        }
    } catch (err) {
        document.getElementById('ph-detail-body').innerHTML =
            '<div class="ph-empty-msg" style="display:flex"><i class="fas fa-wifi"></i><p>Gagal terhubung ke server.</p></div>';
    }
}

function renderDetailBody(t) {
    const statusClass = t.status_pembayaran === 'Lunas' ? 'ph-status-lunas' : 'ph-status-belum';
    document.getElementById('ph-detail-body').innerHTML = `
        <div class="ph-detail-row">
            <label><i class="fas fa-hashtag"></i> Transaction ID</label>
            <span style="font-family:monospace;color:#8ab4ff;">${t.transaction_id}</span>
        </div>
        <div class="ph-detail-row">
            <label><i class="fas fa-box"></i> Order ID</label>
            <span style="font-family:monospace;">${t.order_id}</span>
        </div>
        <div class="ph-detail-row">
            <label><i class="fas fa-user"></i> User ID</label>
            <span style="font-family:monospace;">${t.user_id}</span>
        </div>
        <div class="ph-detail-row">
            <label><i class="fas fa-calendar"></i> Tanggal Transaksi</label>
            <span>${formatDate(t.created_at)}</span>
        </div>
        <div class="ph-detail-row">
            <label><i class="fas fa-map-marker-alt"></i> Alamat Tujuan</label>
            <span>${t.alamat || '-'}</span>
        </div>
        <div class="ph-detail-row">
            <label><i class="fas fa-road"></i> Jarak Pengiriman</label>
            <span>${t.jarak || '-'} km</span>
        </div>
        <div class="ph-detail-row">
            <label><i class="fas fa-truck"></i> Status Pengiriman</label>
            <span><span class="badge badge-info">${t.status_pengiriman || '-'}</span></span>
        </div>
        <div class="ph-detail-row">
            <label><i class="fas fa-credit-card"></i> Status Pembayaran</label>
            <span class="${statusClass}">${t.status_pembayaran || 'Lunas'}</span>
        </div>
        <div class="ph-detail-divider"></div>
        <div class="ph-detail-row">
            <label><i class="fas fa-truck"></i> Biaya Ongkir</label>
            <span style="color:var(--accent);">${formatCurrency(t.amount)}</span>
        </div>
        <div class="ph-detail-row">
            <label><i class="fas fa-percent"></i> Fee Layanan (5%)</label>
            <span style="color:var(--purple);">${formatCurrency(t.fee_layanan)}</span>
        </div>
        <div class="ph-detail-row">
            <label><i class="fas fa-university"></i> Fee SmartBank (1%)</label>
            <span style="color:var(--purple);">${formatCurrency(t.fee_bank)}</span>
        </div>
        <div class="ph-detail-divider"></div>
        <div class="ph-detail-total">
            <label><i class="fas fa-coins"></i> Grand Total Dibayar</label>
            <span>${formatCurrency(t.total)}</span>
        </div>
    `;
}

function closeDetailModal() {
    document.getElementById('detail-modal').classList.remove('open');
    document.body.style.overflow = '';
}

function showLoading(visible) {
    const loading = document.getElementById('ph-loading');
    const table = document.getElementById('ph-table');
    if (visible) {
        loading.style.display = 'flex';
        table.style.display = 'none';
    } else {
        loading.style.display = 'none';
        table.style.display = 'table';
    }
}

function showEmpty(show) {
    document.getElementById('ph-empty').style.display = show ? 'flex' : 'none';
}

function formatCurrency(val) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val || 0);
}

function formatDate(dateStr) {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('id-ID', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
}

function truncate(text, max) {
    if (!text) return '-';
    return text.length > max ? text.substring(0, max) + '...' : text;
}
