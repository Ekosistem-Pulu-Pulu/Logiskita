// ============================================================
// BranchLookupService.js
// Service terpusat untuk pencarian cabang berdasarkan koordinat atau kota.
// Menghilangkan duplikasi findNearestBranch di customerController
// dan integrationController.
// ============================================================

const db = require('../db');
const { calculateDistance } = require('./geocodeService');

/**
 * Cari cabang terdekat berdasarkan koordinat (lat, lng).
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @param {object} [conn=null] - Koneksi DB aktif (opsional, untuk transaksi)
 * @returns {Promise<number|null>} ID cabang terdekat, atau null
 */
async function findNearestBranch(lat, lng, conn = null) {
    if (lat === undefined || lat === null || lng === undefined || lng === null) return null;
    const targetLat = parseFloat(lat);
    const targetLng = parseFloat(lng);
    if (isNaN(targetLat) || isNaN(targetLng)) return null;

    const dbClient = conn || db;
    const [branches] = await dbClient.execute(
        'SELECT id, lat, lng FROM branches WHERE status = "Active"'
    );
    if (branches.length === 0) return null;

    let nearestBranchId = null;
    let minDistance = Infinity;

    for (const branch of branches) {
        if (branch.lat !== null && branch.lng !== null) {
            const bLat = parseFloat(branch.lat);
            const bLng = parseFloat(branch.lng);
            if (isNaN(bLat) || isNaN(bLng)) continue;

            const dist = calculateDistance(targetLat, targetLng, bLat, bLng);
            if (dist < minDistance) {
                minDistance = dist;
                nearestBranchId = branch.id;
            }
        }
    }
    return nearestBranchId;
}

/**
 * Cari cabang berdasarkan nama kota (LIKE match).
 * @param {string} city - Nama kota
 * @param {object} [conn=null] - Koneksi DB aktif (opsional)
 * @returns {Promise<number|null>} ID cabang, atau null
 */
async function findBranchByCity(city, conn = null) {
    if (!city) return null;
    const dbClient = conn || db;
    const [rows] = await dbClient.execute(
        'SELECT id FROM branches WHERE city LIKE ? OR ? LIKE CONCAT("%", city, "%") LIMIT 1',
        [`%${city}%`, city]
    );
    return rows.length > 0 ? rows[0].id : null;
}

/**
 * Resolusi cabang asal dan tujuan dari koordinat dan/atau kota.
 * Menggunakan fallback bertingkat: koordinat → kota → default.
 * @param {object} params - { senderLat, senderLng, senderCity, receiverLat, receiverLng, receiverCity }
 * @param {object} [conn=null] - Koneksi DB aktif
 * @returns {Promise<{ originBranchId: number, destBranchId: number }>}
 */
async function resolveBranches(params, conn = null) {
    const { senderLat, senderLng, senderCity, receiverLat, receiverLng, receiverCity } = params;

    let originBranchId = null;
    let destBranchId = null;

    // Coba dari koordinat dulu
    if (senderLat && senderLng) {
        originBranchId = await findNearestBranch(senderLat, senderLng, conn);
    }
    if (receiverLat && receiverLng) {
        destBranchId = await findNearestBranch(receiverLat, receiverLng, conn);
    }

    // Fallback ke kota jika koordinat gagal
    if (!originBranchId && senderCity) {
        originBranchId = await findBranchByCity(senderCity, conn);
    }
    if (!destBranchId && receiverCity) {
        destBranchId = await findBranchByCity(receiverCity, conn);
    }

    // Hard fallback ke default
    if (!originBranchId) originBranchId = 1;
    if (!destBranchId) destBranchId = 2;

    return { originBranchId, destBranchId };
}

module.exports = {
    findNearestBranch,
    findBranchByCity,
    resolveBranches
};
