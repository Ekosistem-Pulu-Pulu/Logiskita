const API_BASE = 'http://localhost:3000/logistikita';

// Navbar scroll effect
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
});

// Mobile toggle
const toggle = document.getElementById('nav-toggle');
const links = document.getElementById('nav-links');
const actions = document.querySelector('.nav-actions');
if (toggle) {
    toggle.addEventListener('click', () => {
        links.classList.toggle('open');
        toggle.classList.toggle('active');
        if (actions) actions.classList.toggle('open');
    });
}

// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
        e.preventDefault();
        const target = document.querySelector(a.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            links.classList.remove('open');
            toggle.classList.remove('active');
            if (actions) actions.classList.remove('open');
        }
    });
});

// Guide widget
const guideToggle = document.getElementById('guide-toggle');
const guidePanel = document.getElementById('guide-panel');
const guideClose = document.getElementById('guide-close');
const guideIcon = document.getElementById('guide-icon');

if (guideToggle) {
    guideToggle.addEventListener('click', () => {
        guidePanel.classList.toggle('open');
        guideIcon.className = guidePanel.classList.contains('open') ? 'fas fa-times' : 'fas fa-question-circle';
    });
}
if (guideClose) {
    guideClose.addEventListener('click', () => {
        guidePanel.classList.remove('open');
        guideIcon.className = 'fas fa-question-circle';
    });
}

// ============================================================
// Cek Ongkir Widget
// ============================================================
const formCekOngkir = document.getElementById('form-cek-ongkir');
if (formCekOngkir) {
    formCekOngkir.addEventListener('submit', async (e) => {
        e.preventDefault();
        const kota_asal = document.getElementById('ongkir-asal').value;
        const kota_tujuan = document.getElementById('ongkir-tujuan').value;
        const berat = document.getElementById('ongkir-berat').value;
        const resultDiv = document.getElementById('ongkir-result');

        if (!kota_asal || !kota_tujuan) {
            resultDiv.style.display = 'block';
            resultDiv.className = 'qt-result error';
            resultDiv.innerHTML = '<i class="fas fa-exclamation-circle"></i> Pilih kota asal dan tujuan.';
            return;
        }

        resultDiv.style.display = 'block';
        resultDiv.className = 'qt-result loading';
        resultDiv.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Mengambil tarif...';

        try {
            const res = await fetch(`${API_BASE}/cek_ongkir`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ kota_asal, kota_tujuan, berat: parseFloat(berat) || 1 })
            });
            const data = await res.json();

            if (data.status === 'Success') {
                const options = data.data.options;
                resultDiv.className = 'qt-result success';
                resultDiv.innerHTML = `
                    <div class="ongkir-header"><strong>${kota_asal} → ${kota_tujuan}</strong> (${data.data.berat} kg)</div>
                    <div class="ongkir-options">
                        ${options.map(o => `
                            <div class="ongkir-option">
                                <span class="ongkir-service">${o.service}</span>
                                <span class="ongkir-price">${formatRp(o.harga)}</span>
                                <span class="ongkir-est"><i class="fas fa-clock"></i> ${o.estimasi}</span>
                            </div>
                        `).join('')}
                    </div>
                `;
                
                // Init Map
                const mapContainer = document.getElementById('ongkir-map-container');
                mapContainer.style.display = 'block';
                if(window.ongkirMap) { window.ongkirMap.remove(); }
                
                const cityCoords = {
                    'Jakarta': [-6.2088, 106.8456],
                    'Bandung': [-6.9175, 107.6191],
                    'Surabaya': [-7.2504, 112.7688],
                    'Yogyakarta': [-7.7956, 110.3695],
                    'Semarang': [-6.9666, 110.4167],
                    'Bali': [-8.4095, 115.1889],
                    'Medan': [3.5952, 98.6722]
                };
                
                const coordAsal = cityCoords[kota_asal] || cityCoords['Jakarta'];
                const coordTujuan = cityCoords[kota_tujuan] || cityCoords['Surabaya'];
                
                window.ongkirMap = L.map('ongkir-map-container').fitBounds([coordAsal, coordTujuan], { padding: [20, 20] });
                L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
                    attribution: '&copy; <a href="https://carto.com/">CARTO</a>'
                }).addTo(window.ongkirMap);
                
                const markerAsal = L.marker(coordAsal).addTo(window.ongkirMap).bindPopup(`<b>Asal:</b> ${kota_asal}`).openPopup();
                const markerTujuan = L.marker(coordTujuan).addTo(window.ongkirMap).bindPopup(`<b>Tujuan:</b> ${kota_tujuan}`);
                
                const latlngs = [coordAsal, coordTujuan];
                L.polyline(latlngs, {color: '#3b82f6', weight: 3, dashArray: '5, 10'}).addTo(window.ongkirMap);

            } else {
                resultDiv.className = 'qt-result error';
                resultDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${data.message}`;
            }
        } catch (err) {
            resultDiv.className = 'qt-result error';
            resultDiv.innerHTML = '<i class="fas fa-exclamation-circle"></i> Gagal terhubung ke server.';
        }
    });
}

// ============================================================
// Pelacakan Cepat Widget
// ============================================================
const formQuickTrack = document.getElementById('form-quick-track');
if (formQuickTrack) {
    formQuickTrack.addEventListener('submit', async (e) => {
        e.preventDefault();
        const awb = document.getElementById('quick-resi').value.trim();
        const resultDiv = document.getElementById('tracking-quick-result');

        if (!awb) {
            resultDiv.style.display = 'block';
            resultDiv.className = 'qt-result error';
            resultDiv.innerHTML = '<i class="fas fa-exclamation-circle"></i> Masukkan nomor resi.';
            return;
        }

        resultDiv.style.display = 'block';
        resultDiv.className = 'qt-result loading';
        resultDiv.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Melacak paket...';

        try {
            const res = await fetch(`/api/v1/tracking/${encodeURIComponent(awb)}`);
            const data = await res.json();

            if (data.status === 'Success') {
                const ship = data.data.shipment;
                const logs = data.data.tracking_history;
                
                let branchInfoHtml = '';
                if (ship.current_branch_city || ship.dest_branch_city) {
                    branchInfoHtml = `
                        <div style="background: rgba(255,255,255,0.05); padding: 10px; border-radius: 6px; margin: 10px 0; font-size: 0.9rem;">
                            <div><i class="fas fa-building" style="color:var(--accent-blue)"></i> <strong>Posisi Saat Ini:</strong> ${ship.current_branch_name ? ship.current_branch_name + ' (' + ship.current_branch_city + ')' : 'Kurir / Pusat'}</div>
                            <div style="margin-top: 5px;"><i class="fas fa-flag-checkered" style="color:var(--accent-green)"></i> <strong>Menuju Cabang:</strong> ${ship.dest_branch_name ? ship.dest_branch_name + ' (' + ship.dest_branch_city + ')' : 'Alamat Tujuan'}</div>
                        </div>
                    `;
                }

                resultDiv.className = 'qt-result success';
                resultDiv.innerHTML = `
                    <div class="tracking-header">
                        <strong>Resi: ${ship.awb_number}</strong>
                        <span class="status-badge ${ship.status.toLowerCase().replace(/\s+/g,'-')}">${ship.status}</span>
                    </div>
                    <div class="tracking-route">${ship.sender_address} → ${ship.receiver_address}</div>
                    ${branchInfoHtml}
                    <div class="tracking-timeline">
                        ${logs.map(l => `
                            <div class="tl-item">
                                <div class="tl-dot"></div>
                                <div class="tl-content">
                                    <strong>${l.status}</strong> - ${l.description}
                                    <small>${l.location} · ${new Date(l.created_at).toLocaleString('id-ID')}</small>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `;
            } else {
                resultDiv.className = 'qt-result error';
                resultDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${data.message}`;
            }
        } catch (err) {
            resultDiv.className = 'qt-result error';
            resultDiv.innerHTML = '<i class="fas fa-exclamation-circle"></i> Gagal terhubung ke server.';
        }
    });
}

function formatRp(val) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
}

// Scroll reveal animation
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.feature-card-new, .step-card, .pricing-card, .testimonial-card-new, .quick-tool-card').forEach(el => {
    el.classList.add('reveal-on-scroll');
    observer.observe(el);
});

// ============================================================
// Lapor Admin Floating Widget & Modal Handlers
// ============================================================
const laporToggle = document.getElementById('lapor-toggle');
const laporModal = document.getElementById('lapor-admin-modal');

if (laporToggle) {
    laporToggle.addEventListener('click', () => {
        openLaporModal();
    });
}

function openLaporModal() {
    if (laporModal) {
        laporModal.style.display = 'flex';
        // Trigger reflow for transition
        void laporModal.offsetWidth;
        laporModal.style.opacity = '1';
        laporModal.querySelector('.modal-content').style.transform = 'translateY(0)';
    }
}

function closeLaporModal() {
    if (laporModal) {
        laporModal.style.opacity = '0';
        laporModal.querySelector('.modal-content').style.transform = 'translateY(-30px)';
        setTimeout(() => {
            laporModal.style.display = 'none';
        }, 300);
    }
}

// Close modal when clicking outside content
if (laporModal) {
    laporModal.addEventListener('click', (e) => {
        if (e.target === laporModal) {
            closeLaporModal();
        }
    });
}

async function handleLaporSubmit(e) {
    e.preventDefault();
    
    const name = document.getElementById('lapor-nama').value.trim();
    const email = document.getElementById('lapor-email').value.trim();
    const awb_number = document.getElementById('lapor-resi').value.trim();
    const report_type = document.getElementById('lapor-tipe').value;
    const message = document.getElementById('lapor-pesan').value.trim();

    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalBtnHtml = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Mengirim...';

    try {
        const res = await fetch('/api/v1/reports', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, awb_number, report_type, message })
        });
        const data = await res.json();

        if (res.ok && data.status === 'Success') {
            alert(data.message || 'Laporan berhasil terkirim!');
            document.getElementById('lapor-admin-form').reset();
            closeLaporModal();
        } else {
            alert(data.message || 'Gagal mengirim laporan. Silakan coba lagi.');
        }
    } catch (err) {
        console.error('[Lapor Submit Error]', err);
        alert('Koneksi ke server terputus. Gagal mengirim aduan.');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnHtml;
    }
}
