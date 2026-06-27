// ============================================================
// CourierAssignmentService.js
// Service untuk mengelola logika assignment kurir ke paket.
// Mengekstrak algoritma round-robin dan penentuan status transit
// dari branchController ke dalam domain service terpisah.
// ============================================================

const db = require('../db');

/**
 * Pilih kurir dengan beban kerja paling rendah (round-robin least-load) di cabang tertentu.
 * @param {number} branchId - ID cabang tempat kurir beroperasi
 * @param {object} [conn=null] - Opsional: koneksi DB aktif (untuk transaksi)
 * @returns {Promise<{ id: number, nama: string } | null>}
 */
async function assignLeastLoadedCourier(branchId, conn = null) {
    const dbClient = conn || db;
    const [availableKurir] = await dbClient.execute(
        `SELECT iu.id, iu.nama, 
            (SELECT COUNT(*) FROM shipments s2 
             WHERE s2.assigned_kurir_id = iu.id 
             AND s2.status IN ('Out For Delivery','Picked Up','In Transit','Arrived at Destination Branch','Arrived at Branch')
            ) as active_count
         FROM internal_users iu 
         WHERE iu.branch_id = ? AND iu.role = 'Kurir' AND iu.is_active = 1 AND iu.approval_status = 'approved'
         ORDER BY active_count ASC, iu.id ASC LIMIT 1`,
        [branchId]
    );

    if (availableKurir.length > 0) {
        return { id: availableKurir[0].id, nama: availableKurir[0].nama };
    }
    return null;
}

/**
 * Tentukan status dan aksi setelah paket diterima di suatu cabang.
 * Mengembalikan status baru, deskripsi, dan kurir yang di-assign (jika cabang tujuan akhir).
 * @param {object} shipment - Data shipment dari DB
 * @param {number} branchId - ID cabang penerima saat ini
 * @param {object} transitService - Referensi ke transitService untuk getNextLeg
 * @param {object} [conn=null] - Koneksi DB aktif
 * @returns {Promise<{ newStatus: string, description: string, assignedKurir: number|null, nextBranchId: number }>}
 */
async function determineReceiveAction(shipment, branchId, transitService, conn = null) {
    const finalBranch = shipment.final_branch_id || shipment.destination_branch_id;
    const isDestinationBranch = finalBranch === branchId;

    let newStatus, description, assignedKurir = null;
    let nextBranchId = branchId;

    if (isDestinationBranch) {
        // Paket sudah sampai di cabang tujuan akhir
        newStatus = 'Arrived at Destination Branch';
        description = 'Paket tiba di cabang tujuan akhir. Siap untuk delivery ke penerima.';

        // Auto-assign ke kurir cabang tujuan
        const courier = await assignLeastLoadedCourier(branchId, conn);
        if (courier) {
            assignedKurir = courier.id;
            description += ` Auto-assign ke kurir: ${courier.nama}`;
        }
    } else {
        // Paket tiba di cabang transit (bukan tujuan akhir)
        newStatus = 'Arrived at Branch';
        description = 'Paket tiba di cabang transit. Menunggu diteruskan ke cabang berikutnya.';

        // Ambil cabang berikutnya dari transit legs
        const nextLeg = await transitService.getNextLeg(shipment.id);
        if (nextLeg) {
            nextBranchId = nextLeg.to_branch_id;
        } else {
            nextBranchId = finalBranch;
        }
    }

    return { newStatus, description, assignedKurir, nextBranchId, isDestinationBranch };
}

module.exports = {
    assignLeastLoadedCourier,
    determineReceiveAction
};
