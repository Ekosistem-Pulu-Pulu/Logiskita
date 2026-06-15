// ============================================================
// GeoCode Service - Utility untuk kalkulasi jarak & validasi area
// ============================================================

/**
 * Hitung jarak antara dua titik koordinat menggunakan Haversine Formula
 * @param {number} lat1 - Latitude titik asal
 * @param {number} lng1 - Longitude titik asal
 * @param {number} lat2 - Latitude titik tujuan
 * @param {number} lng2 - Longitude titik tujuan
 * @returns {number} Jarak dalam kilometer (2 desimal)
 */
function calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Radius bumi dalam km
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return Math.round(distance * 100) / 100; // 2 desimal
}

function toRad(deg) {
    return deg * (Math.PI / 180);
}

/**
 * Validasi apakah koordinat berada dalam area layanan Indonesia
 * Bounding box Indonesia: Lat -11.0 to 6.1, Lng 95.0 to 141.0
 * @param {number} lat
 * @param {number} lng
 * @returns {boolean}
 */
function isInServiceArea(lat, lng) {
    const bounds = {
        minLat: -11.0,
        maxLat: 6.1,
        minLng: 95.0,
        maxLng: 141.0
    };
    return lat >= bounds.minLat && lat <= bounds.maxLat &&
           lng >= bounds.minLng && lng <= bounds.maxLng;
}

/**
 * Format komponen alamat menjadi string lengkap
 * @param {object} components - { road, district, city, province, postcode }
 * @returns {string}
 */
function formatAddress(components) {
    const parts = [];
    if (components.road) parts.push(components.road);
    if (components.district) parts.push(components.district);
    if (components.city) parts.push(components.city);
    if (components.province) parts.push(components.province);
    if (components.postcode) parts.push(components.postcode);
    return parts.join(', ');
}

module.exports = {
    calculateDistance,
    isInServiceArea,
    formatAddress
};
