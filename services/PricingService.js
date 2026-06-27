// ============================================================
// PricingService.js
// Service terpusat untuk kalkulasi tarif, ongkir, dan biaya layanan.
// Menghilangkan duplikasi hardcode harga di berbagai controller.
// ============================================================

const db = require('../db');

// Konstanta tarif terpusat
const DEFAULT_TARIF = {
    reguler: 15000, // per kg
    express: 25000, // per kg
    estimasi_reguler: '3-5 Hari',
    estimasi_express: '1-2 Hari'
};

const ADMIN_FEE_PERCENT = 0.03;  // 3% fee layanan
const BANK_FEE_PERCENT  = 0.01;  // 1% fee bank (SmartBank)

/**
 * Hitung ongkir berdasarkan jarak dan berat (legacy endpoint)
 * @param {number} jarak - Jarak dalam km
 * @param {number} berat - Berat dalam kg
 * @returns {{ estimasi_biaya: number, biaya_layanan: number, total: number, detail: object }}
 */
function hitungOngkirByJarak(jarak, berat = 1) {
    const parsedJarak = parseFloat(jarak);
    const parsedBerat = parseFloat(berat) || 1;
    const biayaDasar = parsedJarak * 5000;
    const biayaBerat = parsedBerat * 2000;
    const estimasi_biaya = biayaDasar + biayaBerat;
    const biaya_layanan = estimasi_biaya * ADMIN_FEE_PERCENT;
    const total = estimasi_biaya + biaya_layanan;

    return {
        estimasi_biaya,
        biaya_layanan,
        total,
        detail: {
            jarak: parsedJarak,
            berat: parsedBerat,
            tarif_per_km: 5000,
            tarif_per_kg: 2000
        }
    };
}

/**
 * Hitung fee layanan dari nominal
 * @param {number} amount - Nominal asli
 * @returns {{ biaya_layanan: number, nominal_asli: number, total_setelah_fee: number }}
 */
function hitungFeeLayanan(amount) {
    const parsedAmount = parseFloat(amount);
    const feeLayanan = parsedAmount * ADMIN_FEE_PERCENT;
    return {
        biaya_layanan: feeLayanan,
        nominal_asli: parsedAmount,
        total_setelah_fee: parsedAmount + feeLayanan
    };
}

/**
 * Hitung breakdown fee untuk transaksi pembayaran
 * @param {number} amount - Nominal utama
 * @param {boolean} includeBank - Apakah fee bank diperlukan
 * @returns {{ fee_layanan: number, fee_bank: number, total: number }}
 */
function hitungFeeBreakdown(amount, includeBank = false) {
    const parsedAmount = parseFloat(amount);
    const feeLayanan = parsedAmount * ADMIN_FEE_PERCENT;
    const feeBank = includeBank ? parsedAmount * BANK_FEE_PERCENT : 0;
    const total = parsedAmount + feeLayanan + feeBank;

    return { fee_layanan: feeLayanan, fee_bank: feeBank, total };
}

/**
 * Hitung ongkir berdasarkan kota asal dan tujuan (via tabel tarif)
 * @param {string} kotaAsal
 * @param {string} kotaTujuan
 * @param {number} berat
 * @returns {Promise<{ options: Array, source: string }>}
 */
async function hitungOngkirByKota(kotaAsal, kotaTujuan, berat = 1) {
    const parsedBerat = parseFloat(berat) || 1;

    const [rows] = await db.execute(
        'SELECT * FROM tarif WHERE LOWER(kota_asal) = LOWER(?) AND LOWER(kota_tujuan) = LOWER(?)',
        [kotaAsal, kotaTujuan]
    );

    if (rows.length === 0) {
        const hargaReguler = parsedBerat * DEFAULT_TARIF.reguler;
        const hargaExpress = parsedBerat * DEFAULT_TARIF.express;
        return {
            source: 'default',
            options: [
                { service: 'Reguler', harga: hargaReguler, biaya_layanan: hargaReguler * ADMIN_FEE_PERCENT, total: hargaReguler * (1 + ADMIN_FEE_PERCENT), estimasi: DEFAULT_TARIF.estimasi_reguler },
                { service: 'Express', harga: hargaExpress, biaya_layanan: hargaExpress * ADMIN_FEE_PERCENT, total: hargaExpress * (1 + ADMIN_FEE_PERCENT), estimasi: DEFAULT_TARIF.estimasi_express }
            ]
        };
    }

    const tarif = rows[0];
    const hargaReguler = tarif.harga_reguler * parsedBerat;
    const hargaExpress = tarif.harga_express * parsedBerat;

    return {
        source: 'database',
        options: [
            { service: 'Reguler', harga: hargaReguler, biaya_layanan: hargaReguler * ADMIN_FEE_PERCENT, total: hargaReguler * (1 + ADMIN_FEE_PERCENT), estimasi: tarif.estimasi_reguler },
            { service: 'Express', harga: hargaExpress, biaya_layanan: hargaExpress * ADMIN_FEE_PERCENT, total: hargaExpress * (1 + ADMIN_FEE_PERCENT), estimasi: tarif.estimasi_express }
        ]
    };
}

/**
 * Hitung ongkir untuk pembuatan shipment eksternal (API v1)
 * @param {number} weight
 * @param {string} serviceType - 'Express' atau 'Reguler'
 * @returns {{ ongkir: number, biayaLayanan: number, totalBiaya: number, pricePerKg: number }}
 */
function hitungOngkirShipment(weight, serviceType = 'Reguler') {
    const parsedWeight = parseFloat(weight) || 1.0;
    const selectedService = serviceType === 'Express' ? 'Express' : 'Reguler';
    const pricePerKg = selectedService === 'Express' ? DEFAULT_TARIF.express : DEFAULT_TARIF.reguler;
    const ongkir = parsedWeight * pricePerKg;
    const biayaLayanan = ongkir * ADMIN_FEE_PERCENT;
    const totalBiaya = ongkir + biayaLayanan;

    return { ongkir, biayaLayanan, totalBiaya, pricePerKg, selectedService };
}

/**
 * Hitung ongkir lengkap berdasarkan rate dari DB, jarak, dan berat
 * @param {object} rate - Row dari tabel shipping_rates
 * @param {number} distanceKm - Jarak pengiriman
 * @param {number} parsedWeight - Berat pengiriman
 * @returns {{ ongkirRounded: number, biayaAdmin: number, totalBiaya: number }}
 */
function calculatePricing(rate, distanceKm, parsedWeight) {
    const biayaJarak = parseFloat(rate.price_per_km) * distanceKm;
    const biayaBerat = parseFloat(rate.price_per_kg) * parsedWeight;
    const ongkir = parseFloat(rate.base_price) + biayaJarak + biayaBerat;
    const ongkirRounded = Math.ceil(ongkir / 100) * 100; // Bulatkan ke 100 terdekat
    const biayaAdmin = Math.round(ongkirRounded * ADMIN_FEE_PERCENT);
    const totalBiaya = ongkirRounded + biayaAdmin;

    return { ongkirRounded, biayaAdmin, totalBiaya, biayaJarak, biayaBerat };
}

module.exports = {
    DEFAULT_TARIF,
    ADMIN_FEE_PERCENT,
    BANK_FEE_PERCENT,
    hitungOngkirByJarak,
    hitungFeeLayanan,
    hitungFeeBreakdown,
    hitungOngkirByKota,
    hitungOngkirShipment,
    calculatePricing
};
