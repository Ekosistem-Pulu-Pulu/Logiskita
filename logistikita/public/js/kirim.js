// ============================================================
// LogistiKita - Kirim Paket JavaScript
// Leaflet.js Map Integration + API Calls + Step Navigation
// ============================================================

const API_BASE = '';
let senderMap, receiverMap, senderMarker, receiverMarker;
let selectedRate = null;
let selectedPayment = 'smartbank';
let shipmentResult = null;
let searchTimeout = null;

// ============================================================
// INITIALIZATION
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    initMaps();
    setupSearchListeners();
});

function initMaps() {
    // Default center: Indonesia
    const defaultCenter = [-6.2088, 106.8456]; // Jakarta
    const defaultZoom = 12;

    // Sender Map
    senderMap = L.map('map-sender').setView(defaultCenter, defaultZoom);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
    }).addTo(senderMap);

    senderMap.on('click', (e) => {
        setMarker('sender', e.latlng.lat, e.latlng.lng);
    });

    // Receiver Map
    receiverMap = L.map('map-receiver').setView(defaultCenter, defaultZoom);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
    }).addTo(receiverMap);

    receiverMap.on('click', (e) => {
        setMarker('receiver', e.latlng.lat, e.latlng.lng);
    });
}

function setupSearchListeners() {
    // Sender search - live search as you type
    const senderInput = document.getElementById('sender-search');
    senderInput.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => liveSearch('sender'), 500);
    });
    senderInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') { e.preventDefault(); searchAddress('sender'); }
    });

    // Receiver search - live search as you type
    const receiverInput = document.getElementById('receiver-search');
    receiverInput.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => liveSearch('receiver'), 500);
    });
    receiverInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') { e.preventDefault(); searchAddress('receiver'); }
    });

    // Close search results when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.map-search') && !e.target.closest('.search-results')) {
            document.querySelectorAll('.search-results').forEach(el => el.classList.remove('show'));
        }
    });
}

// ============================================================
// MAP & GEOCODING
// ============================================================
function setMarker(type, lat, lng) {
    const map = type === 'sender' ? senderMap : receiverMap;
    const icon = L.divIcon({
        className: 'custom-marker',
        html: `<div style="
            background: ${type === 'sender' ? '#6366f1' : '#22c55e'};
            width: 32px; height: 32px; border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            border: 3px solid white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.4);
            display: flex; align-items: center; justify-content: center;
        "><i class="fas fa-${type === 'sender' ? 'arrow-up' : 'arrow-down'}" style="
            transform: rotate(45deg); color: white; font-size: 12px;
        "></i></div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32]
    });

    if (type === 'sender') {
        if (senderMarker) senderMarker.setLatLng([lat, lng]);
        else {
            senderMarker = L.marker([lat, lng], { icon, draggable: true }).addTo(map);
            senderMarker.on('dragend', (e) => {
                const pos = e.target.getLatLng();
                reverseGeocode(pos.lat, pos.lng, 'sender');
            });
        }
    } else {
        if (receiverMarker) receiverMarker.setLatLng([lat, lng]);
        else {
            receiverMarker = L.marker([lat, lng], { icon, draggable: true }).addTo(map);
            receiverMarker.on('dragend', (e) => {
                const pos = e.target.getLatLng();
                reverseGeocode(pos.lat, pos.lng, 'receiver');
            });
        }
    }

    map.setView([lat, lng], Math.max(map.getZoom(), 15));
    reverseGeocode(lat, lng, type);
}

async function reverseGeocode(lat, lng, type) {
    try {
        const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&accept-language=id`,
            { headers: { 'User-Agent': 'LogistiKita/1.0' } }
        );
        const data = await res.json();

        if (data && data.address) {
            const addr = data.address;
            const road = addr.road || addr.pedestrian || addr.hamlet || addr.neighbourhood || '';
            const district = addr.suburb || addr.village || addr.subdistrict || addr.city_district || '';
            const city = addr.city || addr.town || addr.county || addr.municipality || '';
            const province = addr.state || '';
            const postcode = addr.postcode || '';

            // Build full address
            const fullAddress = [road, district, city, province].filter(Boolean).join(', ');

            // Fill form fields
            document.getElementById(`${type}-address`).value = fullAddress || data.display_name;
            document.getElementById(`${type}-district`).value = district;
            document.getElementById(`${type}-city`).value = city;
            document.getElementById(`${type}-province`).value = province;
            document.getElementById(`${type}-postal`).value = postcode;
            document.getElementById(`${type}-lat`).value = lat.toFixed(7);
            document.getElementById(`${type}-lng`).value = lng.toFixed(7);
            document.getElementById(`${type}-auto-tag`).style.display = 'inline-flex';

            // Update marker popup
            const marker = type === 'sender' ? senderMarker : receiverMarker;
            if (marker) {
                marker.bindPopup(`<strong>${type === 'sender' ? '📦 Pengirim' : '📍 Penerima'}</strong><br>${fullAddress || data.display_name}`).openPopup();
            }
        }
    } catch (error) {
        console.error('Reverse geocode error:', error);
        // Still fill coordinates
        document.getElementById(`${type}-lat`).value = lat.toFixed(7);
        document.getElementById(`${type}-lng`).value = lng.toFixed(7);
    }
}

async function searchAddress(type) {
    const input = document.getElementById(`${type}-search`);
    const query = input.value.trim();
    if (!query) return;

    showLoading('Mencari alamat...');

    try {
        const res = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=id&limit=5&addressdetails=1&accept-language=id`,
            { headers: { 'User-Agent': 'LogistiKita/1.0' } }
        );
        const results = await res.json();
        hideLoading();

        if (results.length === 0) {
            showToast('Alamat tidak ditemukan. Coba kata kunci lain.', 'error');
            return;
        }

        displaySearchResults(type, results);
    } catch (error) {
        hideLoading();
        showToast('Gagal mencari alamat. Periksa koneksi internet.', 'error');
    }
}

async function liveSearch(type) {
    const input = document.getElementById(`${type}-search`);
    const query = input.value.trim();
    if (query.length < 3) {
        document.getElementById(`${type}-search-results`).classList.remove('show');
        return;
    }

    try {
        const res = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=id&limit=5&addressdetails=1&accept-language=id`,
            { headers: { 'User-Agent': 'LogistiKita/1.0' } }
        );
        const results = await res.json();
        if (results.length > 0) {
            displaySearchResults(type, results);
        }
    } catch (e) { /* silent fail for live search */ }
}

function displaySearchResults(type, results) {
    const container = document.getElementById(`${type}-search-results`);
    container.innerHTML = '';

    results.forEach(r => {
        const item = document.createElement('div');
        item.className = 'search-result-item';
        item.textContent = r.display_name;
        item.onclick = () => {
            setMarker(type, parseFloat(r.lat), parseFloat(r.lon));
            container.classList.remove('show');
            document.getElementById(`${type}-search`).value = r.display_name.split(',')[0];
        };
        container.appendChild(item);
    });

    container.classList.add('show');
}

// ============================================================
// RATE CHECK
// ============================================================
async function checkRates() {
    const oLat = document.getElementById('sender-lat').value;
    const oLng = document.getElementById('sender-lng').value;
    const dLat = document.getElementById('receiver-lat').value;
    const dLng = document.getElementById('receiver-lng').value;
    const weight = document.getElementById('package-weight').value || 1;

    if (!oLat || !oLng) {
        showToast('Pilih lokasi pengirim terlebih dahulu di Step 1', 'error');
        return;
    }
    if (!dLat || !dLng) {
        showToast('Pilih lokasi penerima terlebih dahulu di Step 2', 'error');
        return;
    }

    showLoading('Menghitung ongkir...');
    selectedRate = null;
    document.getElementById('btn-to-payment').disabled = true;

    try {
        const res = await fetch(`${API_BASE}/api/v1/rates/check`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                origin_lat: oLat,
                origin_lng: oLng,
                destination_lat: dLat,
                destination_lng: dLng,
                weight: parseFloat(weight),
                origin_city: document.getElementById('sender-city').value,
                destination_city: document.getElementById('receiver-city').value
            })
        });

        const data = await res.json();
        hideLoading();

        if (data.status !== 'Success') {
            showToast(data.message || 'Gagal menghitung ongkir', 'error');
            return;
        }

        displayRates(data.data);
    } catch (error) {
        hideLoading();
        showToast('Gagal menghubungi server. Pastikan server berjalan.', 'error');
    }
}

function displayRates(data) {
    document.getElementById('rates-result').style.display = 'block';
    document.getElementById('distance-display').textContent = `${data.distance_km} km`;

    const container = document.getElementById('rate-options');
    container.innerHTML = '';

    data.options.forEach(opt => {
        const card = document.createElement('div');
        card.className = 'rate-card';
        card.dataset.rateId = opt.rate_id;
        card.innerHTML = `
            <div class="rate-name">${opt.service}</div>
            <div class="rate-estimasi"><i class="fas fa-clock"></i> Estimasi: ${opt.estimasi}</div>
            <div class="rate-price">Rp ${formatNumber(opt.total)} <small>total</small></div>
            <div class="rate-breakdown">
                <div class="rate-breakdown-row">
                    <span>Ongkir Pengiriman</span>
                    <span>Rp ${formatNumber(opt.ongkir)}</span>
                </div>
                <div class="rate-breakdown-row">
                    <span>Biaya Admin (${opt.biaya_admin_persen})</span>
                    <span>Rp ${formatNumber(opt.biaya_admin)}</span>
                </div>
                <div class="rate-breakdown-row total">
                    <span>Total Pembayaran</span>
                    <span>Rp ${formatNumber(opt.total)}</span>
                </div>
            </div>
        `;
        card.onclick = () => selectRate(card, opt);
        container.appendChild(card);
    });

    // Scroll to results
    document.getElementById('rates-result').scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function selectRate(card, rateData) {
    document.querySelectorAll('.rate-card').forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');
    selectedRate = rateData;
    document.getElementById('btn-to-payment').disabled = false;
    showToast(`Layanan ${rateData.service} dipilih`, 'success');
}

// ============================================================
// PAYMENT METHOD
// ============================================================
function selectPayment(el) {
    document.querySelectorAll('.pay-method').forEach(m => m.classList.remove('selected'));
    el.classList.add('selected');
    selectedPayment = el.dataset.method;
}

// ============================================================
// PROCESS SHIPMENT (Create + Pay)
// ============================================================
async function processShipment() {
    if (!selectedRate) {
        showToast('Pilih layanan pengiriman terlebih dahulu', 'error');
        return;
    }

    const btn = document.getElementById('btn-pay');
    btn.disabled = true;
    showLoading('Membuat pengiriman...');

    try {
        // 1. Create Shipment
        const shipmentPayload = {
            sender_name: document.getElementById('sender-name').value,
            sender_phone: document.getElementById('sender-phone').value,
            sender_address: document.getElementById('sender-address').value,
            sender_lat: document.getElementById('sender-lat').value,
            sender_lng: document.getElementById('sender-lng').value,
            sender_district: document.getElementById('sender-district').value,
            sender_city: document.getElementById('sender-city').value,
            sender_province: document.getElementById('sender-province').value,
            sender_postal_code: document.getElementById('sender-postal').value,
            receiver_name: document.getElementById('receiver-name').value,
            receiver_phone: document.getElementById('receiver-phone').value,
            receiver_address: document.getElementById('receiver-address').value,
            receiver_lat: document.getElementById('receiver-lat').value,
            receiver_lng: document.getElementById('receiver-lng').value,
            receiver_district: document.getElementById('receiver-district').value,
            receiver_city: document.getElementById('receiver-city').value,
            receiver_province: document.getElementById('receiver-province').value,
            receiver_postal_code: document.getElementById('receiver-postal').value,
            weight: parseFloat(document.getElementById('package-weight').value) || 1,
            rate_id: selectedRate.rate_id,
            payment_method: selectedPayment
        };

        const shipRes = await fetch(`${API_BASE}/api/v1/customer/shipments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(shipmentPayload)
        });

        const shipData = await shipRes.json();

        if (shipData.status !== 'Success') {
            hideLoading();
            btn.disabled = false;
            showToast(shipData.message || 'Gagal membuat shipment', 'error');
            return;
        }

        shipmentResult = shipData.data;
        hideLoading();

        // 2. Open Premium Payment Modal and Guide Flow
        openPaymentModal();

    } catch (error) {
        hideLoading();
        btn.disabled = false;
        showToast('Gagal memproses pengiriman. Pastikan server berjalan.', 'error');
        console.error('Process shipment error:', error);
    }
}

// ============================================================
// PREMIUM PAYMENT MODAL FLOW HELPERS
// ============================================================
let generatedVANumber = '';

function openPaymentModal() {
    document.getElementById('payment-modal-backdrop').style.display = 'flex';
    showModalState('generating');

    setTimeout(() => {
        if (selectedPayment === 'smartbank') {
            setupSmartBankState();
        } else {
            setupApiGatewayState();
        }
    }, 1200);
}

function closePaymentModal() {
    document.getElementById('payment-modal-backdrop').style.display = 'none';
    const btn = document.getElementById('btn-pay');
    if (btn) btn.disabled = false;
}

function showModalState(state) {
    document.getElementById('modal-state-generating').style.display = 'none';
    document.getElementById('modal-state-smartbank').style.display = 'none';
    document.getElementById('modal-state-api-gateway').style.display = 'none';

    document.getElementById(`modal-state-${state}`).style.display = 'flex';
}

function setupSmartBankState() {
    showModalState('smartbank');
    
    // Generate VA number
    generatedVANumber = 'SBT-VA-' + Math.floor(Math.random() * 9000000000 + 1000000000);
    document.getElementById('va-number-display').textContent = generatedVANumber;

    // Pricing details
    const ongkir = selectedRate.ongkir;
    const admin = selectedRate.biaya_admin; // 3%
    const bankFee = Math.round(ongkir * 0.01); // 1% SmartBank fee
    const grandTotal = ongkir + admin + bankFee;

    document.getElementById('va-ongkir-display').textContent = `Rp ${formatNumber(ongkir)}`;
    document.getElementById('va-admin-display').textContent = `Rp ${formatNumber(admin)}`;
    document.getElementById('va-bank-display').textContent = `Rp ${formatNumber(bankFee)}`;
    document.getElementById('va-total-display').textContent = `Rp ${formatNumber(grandTotal)}`;
}

function copyVA() {
    navigator.clipboard.writeText(generatedVANumber);
    showToast('Nomor Virtual Account berhasil disalin!', 'success');
}

async function executeSmartBankPayment() {
    const btn = document.getElementById('btn-simulate-pay');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Memproses Transaksi...';

    try {
        const payRes = await fetch(`${API_BASE}/api/v1/payments/pay`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                awb_number: shipmentResult.awb_number,
                payment_method: 'smartbank'
            })
        });

        const payData = await payRes.json();

        if (payData.status !== 'Success') {
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-check-double"></i> Konfirmasi Bayar Sekarang (Simulasi)';
            showToast(payData.message || 'Pembayaran gagal', 'error');
            return;
        }

        showToast('Pembayaran via SmartBank Berhasil!', 'success');
        setTimeout(() => {
            closePaymentModal();
            showSuccess(shipmentResult.awb_number);
            goToStep(5);
        }, 1000);

    } catch (err) {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-check-double"></i> Konfirmasi Bayar Sekarang (Simulasi)';
        showToast('Gagal terhubung ke modul pembayaran.', 'error');
    }
}

// Connection test button handler
async function runConnectionTest(event) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }

    const btn = document.getElementById('btn-test-koneksi');
    const resultsDiv = document.getElementById('connection-test-results');

    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Testing...';
    resultsDiv.style.display = 'block';
    resultsDiv.innerHTML = '<div style="color:var(--text-muted); font-size:0.75rem;">Menghubungi endpoint test...</div>';

    try {
        const res = await fetch('/api/v1/integration-test');
        if (!res.ok) {
            resultsDiv.innerHTML = `<div style="color:#ef4444;">Gagal terhubung (HTTP ${res.status}). Pastikan server sudah direstart.</div>`;
            return;
        }
        const data = await res.json();

        if (data.status === 'Success' && data.data) {
            const results = data.data;
            const getIcon = (statusVal) => statusVal === 'Connected' ? '<i class="fas fa-check-circle" style="color:#10b981; margin-right:4px;"></i>' : '<i class="fas fa-times-circle" style="color:#ef4444; margin-right:4px;"></i>';
            
            resultsDiv.innerHTML = `
                <div style="margin-bottom:4px; display:flex; align-items:center;">${getIcon(results.apiGateway.status)} API Gateway: ${results.apiGateway.status}</div>
                <div style="margin-bottom:4px; display:flex; align-items:center;">${getIcon(results.smartBank.status)} SmartBank: ${results.smartBank.status}</div>
                <div style="margin-bottom:4px; display:flex; align-items:center;">${getIcon(results.marketplace.status)} Marketplace: ${results.marketplace.status}</div>
                <div style="display:flex; align-items:center;">${getIcon(results.webhook.status)} Webhook: ${results.webhook.status}</div>
            `;
        } else {
            resultsDiv.innerHTML = '<div style="color:#ef4444;">Gagal melakukan pengetesan koneksi.</div>';
        }
    } catch (e) {
        resultsDiv.innerHTML = '<div style="color:#ef4444;">Koneksi server gagal.</div>';
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-plug"></i> Test Koneksi';
    }
}

let pollingInterval = null;

async function setupApiGatewayState() {
    showModalState('api_gateway');

    // Pricing details
    const ongkir = selectedRate.ongkir;
    const admin = selectedRate.biaya_admin; // 3%
    const total = ongkir + admin;

    document.getElementById('gw-ongkir-display').textContent = `Rp ${formatNumber(ongkir)}`;
    document.getElementById('gw-admin-display').textContent = `Rp ${formatNumber(admin)}`;
    document.getElementById('gw-total-display').textContent = `Rp ${formatNumber(total)}`;

    // Reset status labels
    const setBadge = (elementId, statusVal) => {
        let cssClass = 'pending';
        if (['Connected', 'Paid', 'Created', 'Received', 'Sent', 'Success'].includes(statusVal)) {
            cssClass = 'delivered';
        } else if (['Error', 'Failed', 'Disconnected'].includes(statusVal)) {
            cssClass = 'failed';
        }
        document.getElementById(elementId).innerHTML = `<span class="status-badge ${cssClass}">${statusVal}</span>`;
    };

    setBadge('ig-connection-status', 'Pending');
    setBadge('ig-smartbank-status', 'Pending');
    setBadge('ig-shipment-status', 'Pending');
    setBadge('ig-webhook-status', 'Waiting');
    setBadge('ig-marketplace-status', 'Pending');
    
    document.getElementById('ig-gateway-req-id').textContent = 'Membuat transaksi...';
    document.getElementById('ig-transaction-id').textContent = '-';
    document.getElementById('ig-resi-number').textContent = '-';
    document.getElementById('ig-timestamp').textContent = '-';
    document.getElementById('gateway-status-text').innerHTML = '<i class="fas fa-spinner fa-spin"></i> Menghubungi API Gateway untuk inisiasi pembayaran...';

    try {
        // Initiate Gateway Payment Request
        const initRes = await fetch(`${API_BASE}/api/v1/payments/gateway-initiate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                awb_number: shipmentResult.awb_number
            })
        });

        if (!initRes.ok) {
            document.getElementById('gateway-status-text').innerHTML = `<i class="fas fa-times-circle text-danger" style="color:#ef4444;"></i> Gagal (HTTP ${initRes.status}). Pastikan server sudah direstart.`;
            setBadge('ig-connection-status', 'Error');
            return;
        }

        const initData = await initRes.json();

        if (initData.status !== 'Success') {
            document.getElementById('gateway-status-text').innerHTML = `<i class="fas fa-times-circle text-danger" style="color:#ef4444;"></i> Gagal inisiasi: ${initData.message}`;
            setBadge('ig-connection-status', 'Error');
            return;
        }

        const transactionId = initData.transaction_id;
        document.getElementById('ig-gateway-req-id').textContent = transactionId;
        document.getElementById('gateway-payload-code').textContent = JSON.stringify(initData.payload, null, 2);

        // Start polling the transaction status
        if (pollingInterval) clearInterval(pollingInterval);

        pollingInterval = setInterval(async () => {
            try {
                const pollRes = await fetch(`${API_BASE}/api/v1/integration-status/${transactionId}`);
                if (!pollRes.ok) return; // skip if error
                
                const pollData = await pollRes.json();

                if (pollData.status === 'Success' && pollData.data) {
                    const tx = pollData.data;

                    setBadge('ig-connection-status', tx.connection_status);
                    setBadge('ig-smartbank-status', tx.smartbank_status);
                    setBadge('ig-shipment-status', tx.shipment_status);
                    setBadge('ig-webhook-status', tx.webhook_status);
                    setBadge('ig-marketplace-status', tx.marketplace_status);

                    if (tx.transaction_id && tx.transaction_id !== 'Pending') {
                        document.getElementById('ig-transaction-id').textContent = tx.transaction_id;
                    }
                    if (tx.awb_number) {
                        document.getElementById('ig-resi-number').textContent = tx.awb_number;
                    }
                    if (tx.timestamp) {
                        document.getElementById('ig-timestamp').textContent = formatDate(tx.timestamp);
                    }

                    // Update loading text feedback dynamically
                    if (tx.webhook_status === 'Received') {
                        document.getElementById('gateway-alert-icon').className = 'fas fa-check-double text-success';
                        document.getElementById('gateway-status-text').innerHTML = '<span style="color:#10b981; font-weight:700;">Integrasi Selesai! Pembayaran Sukses.</span>';
                        
                        clearInterval(pollingInterval);
                        setTimeout(() => {
                            closePaymentModal();
                            showSuccess(tx.awb_number);
                            goToStep(5);
                        }, 2000);
                    } else if (tx.connection_status === 'Connected') {
                        document.getElementById('gateway-status-text').innerHTML = '<i class="fas fa-sync fa-spin"></i> Payload Terkirim. Menunggu Webhook Callback dari SmartBank...';
                    }
                }
            } catch (pollErr) {
                console.error('Polling error:', pollErr);
            }
        }, 1500);

    } catch (err) {
        document.getElementById('gateway-status-text').textContent = 'Koneksi ke server gagal.';
        console.error('API Gateway initiation failed:', err);
    }
}

function showSuccess(awbNumber) {
    document.getElementById('success-resi').textContent = awbNumber;
    loadTracking(awbNumber);
}

async function loadTracking(resi) {
    try {
        const res = await fetch(`${API_BASE}/api/v1/tracking/${resi}`);
        const data = await res.json();

        if (data.status === 'Success') {
            renderTimeline(data.data);
        }
    } catch (e) {
        console.error('Load tracking error:', e);
    }
}

function renderTimeline(data) {
    const container = document.getElementById('tracking-timeline');
    const statusFlow = data.status_flow || ['Pending', 'Picked Up', 'In Transit', 'Delivered'];
    const currentStatus = data.shipment.status;
    const currentIdx = statusFlow.indexOf(currentStatus);

    container.innerHTML = '';

    // Show actual tracking history
    if (data.tracking_history && data.tracking_history.length > 0) {
        data.tracking_history.forEach((log, i) => {
            const isLast = i === data.tracking_history.length - 1;
            const item = document.createElement('div');
            item.className = `tl-item ${isLast ? 'active' : 'completed'}`;
            item.innerHTML = `
                <div class="tl-dot"><i class="fas fa-${isLast ? 'circle' : 'check'}"></i></div>
                <div class="tl-status">${log.status}</div>
                <div class="tl-desc">${log.description}</div>
                <div class="tl-time">${log.location ? log.location + ' • ' : ''}${formatDate(log.created_at)}</div>
            `;
            container.appendChild(item);
        });
    }

    // Show upcoming statuses
    statusFlow.forEach((status, i) => {
        if (i > currentIdx) {
            const item = document.createElement('div');
            item.className = 'tl-item';
            item.innerHTML = `
                <div class="tl-dot"><i class="fas fa-circle"></i></div>
                <div class="tl-status" style="opacity:0.4">${status}</div>
                <div class="tl-desc" style="opacity:0.3">Menunggu...</div>
            `;
            container.appendChild(item);
        }
    });
}

// ============================================================
// STEP NAVIGATION
// ============================================================
function goToStep(step) {
    // Validation before proceeding
    if (step === 2) {
        if (!validateStep1()) return;
    }
    if (step === 3) {
        if (!validateStep2()) return;
        // Populate display fields
        document.getElementById('display-origin').value = document.getElementById('sender-city').value || 'Lokasi Asal';
        document.getElementById('display-destination').value = document.getElementById('receiver-city').value || 'Lokasi Tujuan';
    }
    if (step === 4) {
        if (!selectedRate) {
            showToast('Pilih layanan pengiriman terlebih dahulu', 'error');
            return;
        }
        populateSummary();
    }

    // Update panels
    document.querySelectorAll('.step-panel').forEach(p => p.classList.remove('active'));
    document.getElementById(`panel-${step}`).classList.add('active');

    // Update stepper
    document.querySelectorAll('.step-item').forEach(s => {
        const sStep = parseInt(s.dataset.step);
        s.classList.remove('active', 'completed');
        if (sStep === step) s.classList.add('active');
        else if (sStep < step) s.classList.add('completed');
    });

    // Update lines
    for (let i = 1; i <= 4; i++) {
        const line = document.getElementById(`line-${i}-${i + 1}`);
        if (line) {
            line.classList.toggle('completed', i < step);
        }
    }

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Invalidate maps if going to map steps
    if (step === 1) setTimeout(() => senderMap.invalidateSize(), 300);
    if (step === 2) setTimeout(() => receiverMap.invalidateSize(), 300);
}

function validateStep1() {
    const lat = document.getElementById('sender-lat').value;
    const name = document.getElementById('sender-name').value.trim();

    if (!lat) {
        showToast('Pilih lokasi pengirim di map terlebih dahulu', 'error');
        return false;
    }
    if (!name) {
        showToast('Nama pengirim wajib diisi', 'error');
        document.getElementById('sender-name').focus();
        return false;
    }
    return true;
}

function validateStep2() {
    const lat = document.getElementById('receiver-lat').value;
    const name = document.getElementById('receiver-name').value.trim();

    if (!lat) {
        showToast('Pilih lokasi penerima di map terlebih dahulu', 'error');
        return false;
    }
    if (!name) {
        showToast('Nama penerima wajib diisi', 'error');
        document.getElementById('receiver-name').focus();
        return false;
    }
    return true;
}

function populateSummary() {
    const sName = document.getElementById('sender-name').value;
    const sCity = document.getElementById('sender-city').value;
    const sAddr = document.getElementById('sender-address').value;
    const rName = document.getElementById('receiver-name').value;
    const rCity = document.getElementById('receiver-city').value;
    const rAddr = document.getElementById('receiver-address').value;
    const weight = document.getElementById('package-weight').value || 1;

    document.getElementById('sum-sender').textContent = `${sName} — ${sCity}`;
    document.getElementById('sum-receiver').textContent = `${rName} — ${rCity}`;
    document.getElementById('sum-package').textContent = `${weight} kg • ${document.getElementById('distance-display').textContent}`;
    document.getElementById('sum-service').textContent = `${selectedRate.service} (${selectedRate.estimasi})`;
    document.getElementById('sum-ongkir').textContent = `Rp ${formatNumber(selectedRate.ongkir)}`;
    document.getElementById('sum-admin').textContent = `Rp ${formatNumber(selectedRate.biaya_admin)}`;
    document.getElementById('sum-total').textContent = `Rp ${formatNumber(selectedRate.total)}`;
}

// ============================================================
// UTILITY FUNCTIONS
// ============================================================
function formatNumber(n) {
    return Math.round(n).toLocaleString('id-ID');
}

function formatDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function copyResi() {
    const resi = document.getElementById('success-resi').textContent;
    navigator.clipboard.writeText(resi).then(() => {
        showToast('Nomor resi disalin ke clipboard!', 'success');
    }).catch(() => {
        // Fallback
        const ta = document.createElement('textarea');
        ta.value = resi;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        showToast('Nomor resi disalin!', 'success');
    });
}

function resetForm() {
    // Reset all form fields
    document.querySelectorAll('input:not([type="number"])').forEach(i => {
        if (!i.readOnly || i.id.includes('lat') || i.id.includes('lng') || i.id.includes('district') || i.id.includes('city') || i.id.includes('province') || i.id.includes('postal') || i.id.includes('address')) {
            i.value = '';
        }
    });
    document.getElementById('package-weight').value = '1';
    document.querySelectorAll('.address-auto-tag').forEach(t => t.style.display = 'none');

    // Reset markers
    if (senderMarker) { senderMap.removeLayer(senderMarker); senderMarker = null; }
    if (receiverMarker) { receiverMap.removeLayer(receiverMarker); receiverMarker = null; }

    // Reset maps to default
    senderMap.setView([-6.2088, 106.8456], 12);
    receiverMap.setView([-6.2088, 106.8456], 12);

    // Reset state
    selectedRate = null;
    selectedPayment = 'bank_transfer';
    shipmentResult = null;
    document.getElementById('rates-result').style.display = 'none';
    document.getElementById('btn-to-payment').disabled = true;
    document.getElementById('btn-pay').disabled = false;

    // Reset payment method selection
    document.querySelectorAll('.pay-method').forEach(m => m.classList.remove('selected'));
    document.querySelector('[data-method="bank_transfer"]').classList.add('selected');

    goToStep(1);
}

// ===== TOAST =====
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    const icons = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-circle',
        info: 'fas fa-info-circle'
    };
    toast.className = `toast ${type}`;
    toast.innerHTML = `<i class="${icons[type] || icons.info}"></i> ${message}`;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 4000);
}

// ===== LOADING =====
function showLoading(text = 'Memproses...') {
    document.getElementById('loading-text').textContent = text;
    document.getElementById('loading-overlay').classList.add('show');
}

function hideLoading() {
    document.getElementById('loading-overlay').classList.remove('show');
}
