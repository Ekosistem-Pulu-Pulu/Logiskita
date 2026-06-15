// simulasi pemanggilan HTTP ke API SmartBank
const axios = require('axios'); // Kita asumsikan axios diinstall, tapi kita akan buat fungsi simulasi jika tidak ada

async function processPayment(userId, orderId, amount) {
    console.log(`[SmartBank Service] Memproses pembayaran untuk User: ${userId}, Order: ${orderId}, Amount: ${amount}`);
    
    // Dalam realita, kita memanggil endpoint SmartBank:
    // return await axios.post('http://smartbank.local/api/payment', { userId, orderId, amount });
    
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                success: true,
                transaction_id: "BANK-" + Date.now() + Math.floor(Math.random() * 1000),
                message: "Pembayaran berhasil diproses oleh SmartBank"
            });
        }, 500); // Simulasi latensi jaringan
    });
}

module.exports = {
    processPayment
};
