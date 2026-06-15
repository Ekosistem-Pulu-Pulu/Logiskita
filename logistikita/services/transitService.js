const db = require('../db');

/**
 * Find shortest route (in terms of number of hops) between two branches using BFS
 * @param {number} originBranchId 
 * @param {number} destBranchId 
 * @returns {Promise<number[]>} Array of branch IDs representing the path
 */
async function findRoute(originBranchId, destBranchId) {
    if (!originBranchId || !destBranchId) {
        return [];
    }
    originBranchId = parseInt(originBranchId);
    destBranchId = parseInt(destBranchId);
    
    if (originBranchId === destBranchId) {
        return [originBranchId];
    }
    
    // Load all edges from the database
    const [rows] = await db.query('SELECT from_branch_id, to_branch_id FROM transit_routes');
    
    // Build adjacency list
    const adj = {};
    for (const row of rows) {
        const u = parseInt(row.from_branch_id);
        const v = parseInt(row.to_branch_id);
        
        if (!adj[u]) adj[u] = [];
        if (!adj[v]) adj[v] = [];
        
        if (!adj[u].includes(v)) adj[u].push(v);
        if (!adj[v].includes(u)) adj[v].push(u); // bi-directional
    }
    
    // BFS search
    const queue = [[originBranchId]];
    const visited = new Set([originBranchId]);
    
    while (queue.length > 0) {
        const path = queue.shift();
        const node = path[path.length - 1];
        
        if (node === destBranchId) {
            return path;
        }
        
        const neighbors = adj[node] || [];
        for (const neighbor of neighbors) {
            if (!visited.has(neighbor)) {
                visited.add(neighbor);
                queue.push([...path, neighbor]);
            }
        }
    }
    
    // Fallback if no path is found: direct origin -> destination
    return [originBranchId, destBranchId];
}

/**
 * Generate transit legs for a new shipment based on the calculated route
 * @param {number} shipmentId 
 * @param {string} awbNumber 
 * @param {number} originBranchId 
 * @param {number} destBranchId 
 * @returns {Promise<any[]>} The generated legs
 */
async function generateTransitLegs(shipmentId, awbNumber, originBranchId, destBranchId, conn = null) {
    const route = await findRoute(originBranchId, destBranchId);
    const legs = [];
    const dbClient = conn || db;
    
    if (route.length < 2) {
        // Fallback or self-delivery leg
        const fromId = originBranchId;
        const toId = destBranchId || originBranchId;
        
        const [result] = await dbClient.query(
            `INSERT INTO shipment_transit_legs (shipment_id, awb_number, leg_order, from_branch_id, to_branch_id, status)
             VALUES (?, ?, ?, ?, ?, 'Pending')`,
            [shipmentId, awbNumber, 1, fromId, toId]
        );
        legs.push({ id: result.insertId, shipment_id: shipmentId, awb_number: awbNumber, leg_order: 1, from_branch_id: fromId, to_branch_id: toId });
        return legs;
    }
    
    for (let i = 0; i < route.length - 1; i++) {
        const fromId = route[i];
        const toId = route[i + 1];
        const legOrder = i + 1;
        
        const [result] = await dbClient.query(
            `INSERT INTO shipment_transit_legs (shipment_id, awb_number, leg_order, from_branch_id, to_branch_id, status)
             VALUES (?, ?, ?, ?, ?, 'Pending')`,
            [shipmentId, awbNumber, legOrder, fromId, toId]
        );
        
        legs.push({
            id: result.insertId,
            shipment_id: shipmentId,
            awb_number: awbNumber,
            leg_order: legOrder,
            from_branch_id: fromId,
            to_branch_id: toId,
            status: 'Pending'
        });
    }
    
    return legs;
}

/**
 * Get the next incomplete transit leg for a shipment
 * @param {number} shipmentId 
 * @returns {Promise<any|null>}
 */
async function getNextLeg(shipmentId) {
    const [rows] = await db.query(
        `SELECT * FROM shipment_transit_legs 
         WHERE shipment_id = ? AND status != 'Completed' 
         ORDER BY leg_order ASC LIMIT 1`,
        [shipmentId]
    );
    return rows[0] || null;
}

/**
 * Mark a transit leg as completed
 * @param {number} legId 
 * @returns {Promise<void>}
 */
async function completeLeg(legId) {
    await db.query(
        `UPDATE shipment_transit_legs 
         SET status = 'Completed', completed_at = CURRENT_TIMESTAMP 
         WHERE id = ?`,
        [legId]
    );
}

/**
 * Retrieve all transit legs for an AWB number with branch details
 * @param {string} awbNumber 
 * @returns {Promise<any[]>}
 */
async function getTransitRoute(awbNumber) {
    const [rows] = await db.query(
        `SELECT l.*, 
                fb.name as from_branch_name, fb.city as from_branch_city, fb.lat as from_branch_lat, fb.lng as from_branch_lng,
                tb.name as to_branch_name, tb.city as to_branch_city, tb.lat as to_branch_lat, tb.lng as to_branch_lng
         FROM shipment_transit_legs l
         JOIN branches fb ON l.from_branch_id = fb.id
         JOIN branches tb ON l.to_branch_id = tb.id
         WHERE l.awb_number = ?
         ORDER BY l.leg_order ASC`,
        [awbNumber]
    );
    return rows;
}

module.exports = {
    findRoute,
    generateTransitLegs,
    getNextLeg,
    completeLeg,
    getTransitRoute
};
