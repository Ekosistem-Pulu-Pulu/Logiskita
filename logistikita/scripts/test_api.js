const axios = require('axios');

const API_KEY = 'lsk_live_mktA_9f8a8b7c6d5e4f3a2b1c';
const BASE_URL = 'http://localhost:3000/api/v1/marketplace';

async function runTests() {
    console.log('--- Testing check-ongkir ---');
    try {
        const res = await axios.post(`${BASE_URL}/check-ongkir`, {
            kota_asal: 'Jakarta',
            kota_tujuan: 'Bandung',
            origin_lat: -6.200000,
            origin_lng: 106.816666,
            destination_lat: -6.914744,
            destination_lng: 107.609810,
            weight: 2
        }, { headers: { 'x-api-key': API_KEY } });
        console.log('OK check-ongkir:', res.data.data.options);
    } catch (e) {
        console.error('Failed check-ongkir:', e.response?.data || e.message);
    }

    let awb = null;
    console.log('\n--- Testing create-shipment ---');
    try {
        const res = await axios.post(`${BASE_URL}/create-shipment`, {
            external_order_id: 'TEST-' + Date.now(),
            sender_name: 'Test Sender',
            sender_address: 'Jl Test Sender 1',
            sender_city: 'Jakarta',
            receiver_name: 'Test Receiver',
            receiver_address: 'Jl Test Receiver 2',
            receiver_city: 'Bandung',
            weight: 2,
            service_type: 'Reguler'
        }, { headers: { 'x-api-key': API_KEY } });
        awb = res.data.data.awb_number;
        console.log('OK create-shipment:', res.data.data);
    } catch (e) {
        console.error('Failed create-shipment:', e.response?.data || e.message);
    }

    if (awb) {
        console.log('\n--- Testing tracking ---');
        try {
            const res = await axios.get(`${BASE_URL}/tracking/${awb}`, { headers: { 'x-api-key': API_KEY } });
            console.log('OK tracking:', res.data.data.shipment.awb_number, res.data.data.shipment.status);
        } catch (e) {
            console.error('Failed tracking:', e.response?.data || e.message);
        }

        console.log('\n--- Testing list shipments ---');
        try {
            const res = await axios.get(`${BASE_URL}/shipments`, { headers: { 'x-api-key': API_KEY } });
            console.log(`OK list shipments: found ${res.data.data.length} shipments.`);
        } catch (e) {
            console.error('Failed list shipments:', e.response?.data || e.message);
        }

        console.log('\n--- Testing cancel shipment ---');
        try {
            const res = await axios.post(`${BASE_URL}/shipments/${awb}/cancel`, {}, { headers: { 'x-api-key': API_KEY } });
            console.log('OK cancel shipment:', res.data.message);
        } catch (e) {
            console.error('Failed cancel shipment:', e.response?.data || e.message);
        }
    }
}

runTests();
