// ============================================================
// Partner Simulator JS
// Demonstrates B2B integration: Maps -> Rates Check -> Create Shipment -> Tracking -> Webhooks
// ============================================================

const getApiKey = () => document.getElementById('sim-api-key').value.trim();
const BASE_URL = '/api/v1/marketplace';

let senderMap, receiverMap, senderMarker, receiverMarker;
let selectedRate = null;
let currentAwb = null;

document.addEventListener('DOMContentLoaded', () => {
    // Fill default values to assist simulator testing
    document.getElementById('sim-receiver-name').value = 'Andi Susanto';
    document.getElementById('sim-receiver-city').value = 'Bandung';
    document.getElementById('sim-receiver-address').value = 'Jl. Asia Afrika No. 10, Bandung, Jawa Barat';

    initMaps();
    setupEventListeners();
    startWebhookListener();
    
    // Test API Key connection on initial load
    setTimeout(validateConnection, 500);
});

// ==========================================
// 1. MAPS & GEOCODING
// ==========================================
function initMaps() {
    const bandungCenter = [-6.9175, 107.6191]; // Bandung
    
    // Receiver Map
    receiverMap = L.map('map-receiver').setView(bandungCenter, 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(receiverMap);
    
    // Initial marker placement on load
    updateMarker('receiver', bandungCenter[0], bandungCenter[1], true);
    
    receiverMap.on('click', (e) => {
        updateMarker('receiver', e.latlng.lat, e.latlng.lng);
    });
}

function updateMarker(type, lat, lng, skipGeocode = false) {
    const map = receiverMap;
    
    const icon = L.divIcon({
        className: 'custom-marker',
        html: `<div style="background: #10b981; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
        iconSize: [24, 24]
    });

    if (receiverMarker) receiverMarker.setLatLng([lat, lng]);
    else receiverMarker = L.marker([lat, lng], {icon}).addTo(map);

    document.getElementById(`sim-${type}-lat`).value = lat;
    document.getElementById(`sim-${type}-lng`).value = lng;

    if (!skipGeocode) {
        reverseGeocode(lat, lng, type);
    }
}

async function reverseGeocode(lat, lng, type) {
    try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`);
        const data = await res.json();
        
        if (data && data.address) {
            // Support multiple Indonesian geocoding fallback keys for city
            const city = data.address.city || 
                         data.address.town || 
                         data.address.city_district || 
                         data.address.municipality || 
                         data.address.county || 
                         data.address.village || 
                         data.address.state_district || '';
            const road = data.address.road || '';
            const suburb = data.address.suburb || data.address.neighbourhood || '';
            const district = data.address.city_district || data.address.district || '';
            const province = data.address.state || '';
            
            document.getElementById(`sim-${type}-city`).value = city;
            
            // Build a descriptive address
            const addrParts = [];
            if (road) addrParts.push(road);
            if (suburb) addrParts.push(suburb);
            if (district) addrParts.push(district);
            if (city && city !== district) addrParts.push(city);
            if (province) addrParts.push(province);
            
            if (addrParts.length > 0) {
                document.getElementById(`sim-${type}-address`).value = addrParts.join(', ');
            }
        }
    } catch (e) {
        console.error('Geocoding error', e);
    }
}

// ==========================================
// 2. CHECK RATES (B2B Endpoint)
// ==========================================
async function checkRates() {
    const originLat = document.getElementById('sim-sender-lat').value;
    const originLng = document.getElementById('sim-sender-lng').value;
    const destLat = document.getElementById('sim-receiver-lat').value;
    const destLng = document.getElementById('sim-receiver-lng').value;
    const weight = document.getElementById('sim-weight').value;
    const originCity = document.getElementById('sim-sender-city').value;
    const destCity = document.getElementById('sim-receiver-city').value;

    if (!originLat || !destLat) {
        showToast('Pilih lokasi pada peta untuk pengirim dan penerima', 'error');
        return;
    }

    const btn = document.getElementById('btn-check-rates');
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Menghitung...';
    btn.disabled = true;

    try {
        const response = await fetch(`${BASE_URL}/check-ongkir`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'x-api-key': getApiKey()
            },
            body: JSON.stringify({
                origin_lat: originLat, origin_lng: originLng,
                destination_lat: destLat, destination_lng: destLng,
                weight: weight,
                origin_city: originCity, destination_city: destCity
            })
        });

        const result = await response.json();
        btn.innerHTML = '<i class="fas fa-calculator"></i> Cek Ongkir & Layanan';
        btn.disabled = false;

        if (result.status === 'Success') {
            displayRates(result.data);
        } else {
            showToast(result.message || 'Gagal menghitung ongkir', 'error');
        }
    } catch (error) {
        btn.innerHTML = '<i class="fas fa-calculator"></i> Cek Ongkir & Layanan';
        btn.disabled = false;
        showToast('Gagal menghubungi server API', 'error');
    }
}

function displayRates(data) {
    document.getElementById('rates-result').classList.remove('hidden');
    document.getElementById('sim-distance').textContent = data.distance_km;
    
    const container = document.getElementById('rates-options');
    container.innerHTML = '';
    
    data.options.forEach(opt => {
        const card = document.createElement('div');
        card.className = 'rate-card p-4 rounded-xl border border-slate-200 bg-white hover:shadow-md';
        card.onclick = () => selectRate(card, opt);
        
        card.innerHTML = `
            <div class="flex justify-between items-start mb-2">
                <div class="font-bold text-slate-800">${opt.service}</div>
                <div class="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded font-medium">${opt.estimasi}</div>
            </div>
            <div class="text-xl font-bold text-primary mb-3">Rp ${opt.total.toLocaleString('id-ID')}</div>
            <div class="text-xs text-slate-500 space-y-1">
                <div class="flex justify-between"><span>Ongkir:</span> <span>Rp ${opt.ongkir.toLocaleString('id-ID')}</span></div>
                <div class="flex justify-between"><span>Admin App (${opt.biaya_admin_persen}):</span> <span>Rp ${opt.biaya_admin.toLocaleString('id-ID')}</span></div>
            </div>
        `;
        container.appendChild(card);
    });
}

function selectRate(card, rateData) {
    document.querySelectorAll('.rate-card').forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');
    selectedRate = rateData;
    document.getElementById('btn-create-shipment').disabled = false;
}

// ==========================================
// 3. CREATE SHIPMENT (B2B)
// ==========================================
async function createShipment() {
    if (!selectedRate) return showToast('Pilih layanan terlebih dahulu', 'error');

    const receiverName = document.getElementById('sim-receiver-name').value.trim();
    const receiverCity = document.getElementById('sim-receiver-city').value.trim();
    const receiverAddress = document.getElementById('sim-receiver-address').value.trim();

    // Frontend validation to prevent empty submissions
    if (!receiverName || !receiverCity || !receiverAddress) {
        showToast('Nama, Kota, dan Alamat Penerima wajib diisi!', 'error');
        return;
    }

    const payload = {
        external_order_id: 'TB-' + Date.now(),
        sender_name: document.getElementById('sim-sender-name').value,
        sender_city: document.getElementById('sim-sender-city').value,
        sender_address: document.getElementById('sim-sender-address').value,
        receiver_name: receiverName,
        receiver_city: receiverCity,
        receiver_address: receiverAddress,
        weight: document.getElementById('sim-weight').value,
        service_type: selectedRate.service
    };

    const btn = document.getElementById('btn-create-shipment');
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Memproses...';
    btn.disabled = true;

    try {
        const response = await fetch(`${BASE_URL}/create-shipment`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': getApiKey()
            },
            body: JSON.stringify(payload)
        });

        const result = await response.json();
        btn.innerHTML = '<i class="fas fa-paper-plane"></i> Buat Resi & Bayar';
        btn.disabled = false;

        if (response.ok && result.status === 'Success') {
            showToast('Resi berhasil diterbitkan!', 'success');
            currentAwb = result.data.awb_number;
            document.getElementById('success-awb').textContent = currentAwb;
            
            // Switch to tracking view
            document.getElementById('panel-order').classList.add('hidden');
            document.getElementById('panel-tracking').classList.remove('hidden');
            
            loadTracking(currentAwb);
        } else {
            showToast(result.message || 'Gagal membuat shipment', 'error');
        }
    } catch (e) {
        btn.innerHTML = '<i class="fas fa-paper-plane"></i> Buat Resi & Bayar';
        btn.disabled = false;
        showToast('Koneksi terputus', 'error');
    }
}

// ==========================================
// 4. TRACKING API
// ==========================================
async function loadTracking(awb) {
    if(!awb) return;
    try {
        const response = await fetch(`${BASE_URL}/tracking/${awb}`, {
            headers: { 'x-api-key': getApiKey() }
        });
        const result = await response.json();
        
        if (result.status === 'Success') {
            renderTimeline(result.data.tracking_history);
        }
    } catch (e) {
        console.error(e);
    }
}

function renderTimeline(logs) {
    const container = document.getElementById('tracking-timeline');
    container.innerHTML = '';
    
    if(!logs || logs.length === 0) return;
    
    logs.reverse().forEach((log, index) => {
        const isLatest = index === 0;
        const date = new Date(log.created_at);
        const timeString = `${date.getDate()} ${date.toLocaleString('id-ID',{month:'short'})} ${date.getHours().toString().padStart(2,'0')}:${date.getMinutes().toString().padStart(2,'0')}`;
        
        let colorClass = isLatest ? 'text-primary font-semibold' : 'text-slate-600';
        let bgClass = isLatest ? 'pending' : '';
        if(isLatest && (log.status === 'Delivered')) bgClass = ''; // full blue circle

        container.innerHTML += `
            <div class="timeline-item ${bgClass}">
                <div class="${colorClass} text-sm">${log.status} <span class="text-slate-400 text-xs ml-2 font-normal">${timeString}</span></div>
                <div class="text-sm text-slate-500 mt-1">${log.description}</div>
                ${log.location ? `<div class="text-xs text-emerald-600 mt-1"><i class="fas fa-map-marker-alt"></i> ${log.location}</div>` : ''}
            </div>
        `;
    });
}

// ==========================================
// 5. WEBHOOK SIMULATION
// ==========================================
function startWebhookListener() {
    // Poll the mock webhook endpoint every 3 seconds to get logs
    setInterval(async () => {
        try {
            const res = await fetch('/webhook/tokobagus/logs');
            const data = await res.json();
            if(data.status === 'Success' && data.data.length > 0) {
                renderWebhookLogs(data.data);
            }
        } catch(e) {}
    }, 3000);
}

let lastLogCount = 0;
function renderWebhookLogs(logs) {
    if(logs.length === lastLogCount) return; // No new logs
    lastLogCount = logs.length;
    
    const container = document.getElementById('webhook-logs');
    // keep only first element (the waiting message)
    container.innerHTML = `<div class="text-slate-500 mb-2">// Menunggu POST request dari backend LogistiKita (Event: shipment.status_updated)</div>`;
    
    logs.forEach(log => {
        const d = new Date(log.received_at);
        const time = `${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}:${d.getSeconds().toString().padStart(2,'0')}`;
        const jsonStr = JSON.stringify(log.payload, null, 2);
        
        container.innerHTML += `
            <div class="mb-4 border-l-2 border-emerald-500 pl-3">
                <div class="text-emerald-400 mb-1">[${time}] POST /webhook/tokobagus 200 OK</div>
                <pre class="text-slate-300 text-xs bg-slate-950 p-2 rounded overflow-x-auto">${jsonStr}</pre>
            </div>
        `;
    });
}

// ==========================================
// 6. VALIDATE CONNECTION
// ==========================================
async function validateConnection() {
    const apiKey = getApiKey();
    const badge = document.getElementById('api-status-badge');
    const btn = document.getElementById('btn-validate-api');
    
    if (!badge || !btn) return;
    
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Testing...';
    btn.disabled = true;
    
    try {
        const res = await fetch(`${BASE_URL}/shipments`, {
            headers: { 'x-api-key': apiKey }
        });
        
        btn.innerHTML = '<i class="fas fa-plug"></i> Test Connection';
        btn.disabled = false;
        
        if (res.ok) {
            badge.className = 'flex items-center gap-2 text-xs bg-emerald-950/50 text-emerald-400 border border-emerald-500/20 py-1 px-2.5 rounded-full mt-2 justify-center';
            badge.innerHTML = '<span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> B2B API Connected';
            showToast('API Key Valid & Terhubung!', 'success');
        } else {
            const data = await res.json().catch(() => ({}));
            badge.className = 'flex items-center gap-2 text-xs bg-red-950/50 text-red-400 border border-red-500/20 py-1 px-2.5 rounded-full mt-2 justify-center';
            badge.innerHTML = '<span class="w-2 h-2 rounded-full bg-red-500"></span> Disconnected';
            showToast(data.message || 'API Key Tidak Valid', 'error');
        }
    } catch (e) {
        btn.innerHTML = '<i class="fas fa-plug"></i> Test Connection';
        btn.disabled = false;
        badge.className = 'flex items-center gap-2 text-xs bg-red-950/50 text-red-400 border border-red-500/20 py-1 px-2.5 rounded-full mt-2 justify-center';
        badge.innerHTML = '<span class="w-2 h-2 rounded-full bg-red-500"></span> Connection Error';
        showToast('Koneksi ke server gagal', 'error');
    }
}

// ==========================================
// UTILS
// ==========================================
function setupEventListeners() {
    document.getElementById('btn-check-rates').addEventListener('click', checkRates);
    document.getElementById('btn-create-shipment').addEventListener('click', (e) => {
        e.preventDefault();
        createShipment();
    });
    document.getElementById('btn-refresh-tracking').addEventListener('click', () => loadTracking(currentAwb));
    
    const validateBtn = document.getElementById('btn-validate-api');
    if (validateBtn) {
        validateBtn.addEventListener('click', validateConnection);
    }
    
    // Tabs
    document.getElementById('nav-order').addEventListener('click', (e) => { e.preventDefault(); switchTab('panel-order'); });
    document.getElementById('nav-history').addEventListener('click', (e) => { e.preventDefault(); switchTab('panel-tracking'); });
    document.getElementById('nav-webhook').addEventListener('click', (e) => { e.preventDefault(); switchTab('panel-webhook'); });
}

function switchTab(panelId) {
    ['panel-order', 'panel-tracking', 'panel-webhook'].forEach(id => {
        const el = document.getElementById(id);
        if(el) el.classList.add('hidden');
    });
    
    const targetPanel = document.getElementById(panelId);
    if(targetPanel) targetPanel.classList.remove('hidden');
    
    // Manage active sidebar styles
    const navOrder = document.getElementById('nav-order');
    const navHistory = document.getElementById('nav-history');
    const navWebhook = document.getElementById('nav-webhook');
    
    if (navOrder && navHistory && navWebhook) {
        // Reset classes for all links
        [navOrder, navHistory, navWebhook].forEach(btn => {
            btn.className = "flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-slate-800 rounded-lg font-medium transition-colors";
        });
        
        // Highlight active link
        if (panelId === 'panel-order') {
            navOrder.className = "flex items-center gap-3 px-4 py-3 bg-primary text-white rounded-lg font-medium shadow-md";
        } else if (panelId === 'panel-tracking') {
            navHistory.className = "flex items-center gap-3 px-4 py-3 bg-primary text-white rounded-lg font-medium shadow-md";
        } else if (panelId === 'panel-webhook') {
            navWebhook.className = "flex items-center gap-3 px-4 py-3 bg-primary text-white rounded-lg font-medium shadow-md";
        }
    }
    
    setTimeout(() => {
        if(receiverMap) receiverMap.invalidateSize();
    }, 100);
}

function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    const icon = document.getElementById('toast-icon');
    document.getElementById('toast-msg').textContent = message;
    
    if (type === 'success') {
        toast.className = 'bg-emerald-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 show';
        icon.className = 'fas fa-check-circle';
    } else if (type === 'error') {
        toast.className = 'bg-red-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 show';
        icon.className = 'fas fa-exclamation-circle';
    } else {
        toast.className = 'bg-slate-800 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 show';
        icon.className = 'fas fa-info-circle';
    }
    
    setTimeout(() => { toast.classList.remove('show'); }, 3000);
}

function copyToClipboard(elementId) {
    const text = document.getElementById(elementId).textContent;
    navigator.clipboard.writeText(text).then(() => {
        showToast('Disalin!', 'success');
    });
}
