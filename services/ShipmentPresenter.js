// ============================================================
// ShipmentPresenter.js
// Presenter / Resource Transformer untuk memisahkan logika
// penyusunan respons UI (icon, warna, label aksi) dari controller.
// Controller hanya mengirim data mentah, presenter yang memformat.
// ============================================================

/**
 * Konfigurasi mapping status ke aksi yang diizinkan.
 * Struktur ini menggantikan hardcode if-else di lookupResi controller.
 */
const ACTION_DEFINITIONS = {
    pickup: {
        action: 'pickup',
        label: 'Pickup dari Pengirim',
        icon: 'fa-hand-holding-box',
        color: '#06b6d4'
    },
    arrived_origin: {
        action: 'arrived_origin',
        label: 'Paket Diterima di Gudang',
        icon: 'fa-warehouse',
        color: '#3b82f6'
    },
    confirm_receive: {
        action: 'confirm_receive',
        label: 'Konfirmasi Terima di Cabang',
        icon: 'fa-clipboard-check',
        color: '#10b981'
    },
    send_transit: {
        action: 'send_transit',
        label: 'Kirim Transit ke Cabang Berikutnya',
        icon: 'fa-truck-fast',
        color: '#3b82f6'
    },
    out_for_delivery: {
        action: 'out_for_delivery',
        label: 'Assign & Kirim via Kurir',
        icon: 'fa-motorcycle',
        color: '#8b5cf6'
    },
    manual_status: {
        action: 'manual_status',
        label: 'Update Status Manual',
        icon: 'fa-pen-to-square',
        color: '#f59e0b'
    }
};

/**
 * Tentukan daftar aksi yang diizinkan berdasarkan status shipment dan posisi cabang.
 * @param {object} shipment - Data shipment lengkap dari DB
 * @param {object} branchContext - { isOriginBranch, isCurrentBranch, isFinalDestination, branchId }
 * @returns {Array<object>} Array of allowed action objects
 */
function resolveAllowedActions(shipment, branchContext) {
    const { isOriginBranch, isCurrentBranch, isFinalDestination, branchId } = branchContext;
    const actions = [];

    if (shipment.status === 'Pending' && isOriginBranch) {
        actions.push(ACTION_DEFINITIONS.pickup);
    }

    if (shipment.status === 'Picked Up' && isCurrentBranch) {
        actions.push(ACTION_DEFINITIONS.arrived_origin);
    }

    if (shipment.status === 'Waiting Branch Confirmation' && shipment.destination_branch_id === branchId) {
        actions.push(ACTION_DEFINITIONS.confirm_receive);
    }

    if (shipment.status === 'Arrived at Branch' && isCurrentBranch && !isFinalDestination) {
        actions.push(ACTION_DEFINITIONS.send_transit);
    }

    if (shipment.status === 'Arrived at Destination Branch' && isCurrentBranch && isFinalDestination) {
        actions.push(ACTION_DEFINITIONS.out_for_delivery);
    }

    if ((shipment.status === 'Arrived at Branch' || shipment.status === 'Arrived at Destination Branch') && isCurrentBranch) {
        actions.push(ACTION_DEFINITIONS.manual_status);
    }

    return actions;
}

/**
 * Format data shipment untuk respons lookup resi.
 * Memisahkan transformasi data dari query database.
 * @param {object} ship - Raw shipment row dari DB
 * @param {object} extras - { transitLegs, trackingLogs, couriers, nextBranchInfo, branchContext, allowedActions }
 * @returns {object} Formatted response data
 */
function formatLookupResponse(ship, extras) {
    const { transitLegs, trackingLogs, couriers, nextBranchInfo, branchContext, allowedActions } = extras;

    return {
        shipment: {
            id: ship.id,
            awb_number: ship.awb_number,
            sender_name: ship.sender_name,
            sender_phone: ship.sender_phone,
            sender_city: ship.sender_city,
            receiver_name: ship.receiver_name,
            receiver_phone: ship.receiver_phone,
            receiver_address: ship.receiver_address,
            receiver_city: ship.receiver_city,
            weight: ship.weight,
            service_type: ship.service_type,
            status: ship.status,
            payment_status: ship.payment_status,
            total_cost: ship.total_cost,
            order_source: ship.order_source,
            partner_name: ship.nama_mitra,
            created_at: ship.created_at,
            updated_at: ship.updated_at,
            origin_branch: { id: ship.origin_branch_id, name: ship.origin_branch_name, city: ship.origin_city },
            destination_branch: { id: ship.destination_branch_id, name: ship.dest_branch_name, city: ship.dest_city },
            current_branch: { id: ship.current_branch_id, name: ship.current_branch_name, city: ship.current_city },
            final_branch: { id: ship.final_branch_id, name: ship.final_branch_name, city: ship.final_city },
            next_branch: nextBranchInfo,
            kurir: ship.kurir_nama ? { name: ship.kurir_nama, phone: ship.kurir_phone } : null
        },
        transit_legs: transitLegs,
        tracking_history: trackingLogs,
        allowed_actions: allowedActions,
        available_couriers: couriers,
        branch_context: branchContext
    };
}

module.exports = {
    ACTION_DEFINITIONS,
    resolveAllowedActions,
    formatLookupResponse
};
