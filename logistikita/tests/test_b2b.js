// Test Script: Menguji semua endpoint B2B LogistiKita
const API_URL = 'http://localhost:3000';

async function testAll() {
    console.log('\n=== TEST 1: Login Admin Internal ===');
    const loginRes = await fetch(`${API_URL}/internal/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@logistikita.com', password: 'admin123' })
    });
    const loginData = await loginRes.json();
    console.log(JSON.stringify(loginData, null, 2));
    const adminToken = loginData.token;

    console.log('\n=== TEST 2: Admin Daftarkan Mitra Baru ===');
    const regRes = await fetch(`${API_URL}/internal/partners`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-token': adminToken },
        body: JSON.stringify({
            nama_mitra: 'Marketplace TestBaru',
            email_pic: 'test@baru.com',
            smartbak_account_no: 'SB-ACC-TEST',
            webhook_url: 'https://baru.com/webhook'
        })
    });
    const regData = await regRes.json();
    console.log(JSON.stringify(regData, null, 2));

    console.log('\n=== TEST 3: Admin Lihat Semua Mitra ===');
    const partnersRes = await fetch(`${API_URL}/internal/partners`, {
        headers: { 'x-admin-token': adminToken }
    });
    const partnersData = await partnersRes.json();
    console.log(JSON.stringify(partnersData, null, 2));

    // Gunakan API Key dari partner seed (Marketplace TokoBagus)
    const PARTNER_API_KEY = 'lsk_live_mktA_9f8a8b7c6d5e4f3a2b1c';

    console.log('\n=== TEST 4: Mitra Cek Ongkir via API Key ===');
    const rateRes = await fetch(`${API_URL}/api/v1/rates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': PARTNER_API_KEY },
        body: JSON.stringify({ kota_asal: 'Jakarta', kota_tujuan: 'Bandung', weight: 2 })
    });
    const rateData = await rateRes.json();
    console.log(JSON.stringify(rateData, null, 2));

    console.log('\n=== TEST 5: Mitra Buat Pengiriman (Create Resi) ===');
    const shipRes = await fetch(`${API_URL}/api/v1/shipments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': PARTNER_API_KEY },
        body: JSON.stringify({
            external_order_id: 'ORD-TOKOBAGUS-12345',
            sender_name: 'Toko ABC',
            sender_address: 'Jl. Sudirman No. 1, Jakarta',
            sender_phone: '081234567890',
            receiver_name: 'Budi Santoso',
            receiver_address: 'Jl. Asia Afrika No. 10, Bandung',
            receiver_phone: '089876543210',
            weight: 2.5,
            service_type: 'Express'
        })
    });
    const shipData = await shipRes.json();
    console.log(JSON.stringify(shipData, null, 2));

    if (shipData.data && shipData.data.awb_number) {
        const awb = shipData.data.awb_number;

        console.log('\n=== TEST 6: Mitra Tracking Resi ===');
        const trackRes = await fetch(`${API_URL}/api/v1/shipments/${awb}`, {
            headers: { 'x-api-key': PARTNER_API_KEY }
        });
        const trackData = await trackRes.json();
        console.log(JSON.stringify(trackData, null, 2));

        console.log('\n=== TEST 7: Admin Update Status Resi ===');
        const updateRes = await fetch(`${API_URL}/internal/shipments/update-status`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-admin-token': adminToken },
            body: JSON.stringify({
                awb_number: awb,
                status: 'Picked Up',
                description: 'Kurir telah menjemput paket',
                location: 'Gudang Jakarta Pusat'
            })
        });
        const updateData = await updateRes.json();
        console.log(JSON.stringify(updateData, null, 2));

        console.log('\n=== TEST 8: Tracking Setelah Update ===');
        const trackRes2 = await fetch(`${API_URL}/api/v1/shipments/${awb}`, {
            headers: { 'x-api-key': PARTNER_API_KEY }
        });
        const trackData2 = await trackRes2.json();
        console.log(JSON.stringify(trackData2, null, 2));
    }

    console.log('\n=== TEST 9: Request TANPA API Key (harus 401) ===');
    const noKeyRes = await fetch(`${API_URL}/api/v1/rates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kota_asal: 'Jakarta', kota_tujuan: 'Bandung' })
    });
    const noKeyData = await noKeyRes.json();
    console.log(JSON.stringify(noKeyData, null, 2));

    console.log('\n=== SEMUA TEST SELESAI ===\n');
}

testAll().catch(console.error);
