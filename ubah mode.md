
# Panduan Praktikum Integrasi LogistiKita

kalau misalnya kurang jelas prompt aja lagi di antigravitinya buat ubah dari mode simulasi ke mode yang siap buat nyambungin aplikasi nya

Dokumen ini berisi panduan lengkap dan terstruktur untuk menyambungkan aplikasi **LogistiKita** di laptop Anda dengan aplikasi dari kelompok lain (API Gateway, SmartBank, Marketplace) dalam **Mode Praktikum Gabungan (Real Integration)**.

---

## 🛠️ Persiapan: Menyambungkan Antar Laptop

Agar aplikasi di laptop yang berbeda-beda bisa saling terhubung, semua laptop **wajib berada dalam satu jaringan yang sama**.

1. **Gunakan Jaringan yang Sama:** Pastikan laptop Anda dan laptop kelompok lain terhubung ke jaringan Wi-Fi yang sama (misalnya Wi-Fi kampus atau tethering hotspot dari satu HP).
2. **Cari Tahu Alamat IP Laptop Anda:**
   - **Windows:** Buka `Command Prompt` (cmd) lalu ketik `ipconfig`. Cari bagian "IPv4 Address" (contoh: `192.168.1.15`).
   - **Mac/Linux:** Buka terminal dan ketik `ifconfig` atau `ip a`. Cari alamat inet (contoh: `192.168.1.15`).

> [!IMPORTANT]  
> Catat alamat IPv4 Anda, karena ini akan diberikan kepada kelompok lain agar mereka bisa mengakses aplikasi LogistiKita Anda.

---

## 🔄 Mengganti Mode Simulasi (Mock) ke Mode Praktikum Gabungan

Secara bawaan (default), LogistiKita berjalan pada **Mode Simulasi** sehingga tidak mengirimkan request asli ke luar. Untuk mematikan mode simulasi dan mengaktifkan integrasi nyata, lakukan langkah berikut:

### Opsi 1: Mengubah file `.env` (Sangat Disarankan)
Jika Anda menggunakan file `.env` di dalam folder `logistikita`, cukup tambahkan atau ubah baris berikut:

```env
INTEGRATION_SIMULATOR_MODE=false
```

### Opsi 2: Mengubah file `config/integration.js`
Jika Anda tidak menggunakan file `.env` (atau tidak menggunakan variabel environment), Anda dapat mengubah konfigurasi langsung di dalam file `logistikita/config/integration.js`.

1. Buka file `logistikita/config/integration.js`.
2. Cari bagian `integration` dan ubah nilai pada baris `simulatorMode` menjadi `false`.

```javascript
// logistikita/config/integration.js
module.exports = {
    // ... konfigurasi lainnya ...
    integration: {
        // UBAH INI MENJADI false
        simulatorMode: false, 
        
        webhookSecret: process.env.LOGISTIKITA_WEBHOOK_SECRET || 'lsk-webhook-secret-xyz'
    }
};
```

> [!CAUTION]  
> Setelah mengubah file `.env` atau `integration.js`, **Anda WAJIB me-restart server LogistiKita** (Matikan aplikasi di terminal dengan `Ctrl+C` lalu jalankan kembali).

---

## 🔗 Apa Saja yang Harus Diinputkan ke Aplikasi LogistiKita?

Setelah mode simulasi dimatikan, LogistiKita akan mencoba menghubungi aplikasi kelompok lain (API Gateway, SmartBank, dll). Anda harus memasukkan alamat (URL) dari kelompok-kelompok tersebut.

### Minta Data Ini dari Kelompok Lain:
Datangi kelompok API Gateway, SmartBank, dan Marketplace, lalu minta informasi berikut dari mereka:
1. **IP Address & Port aplikasi mereka** (Misalnya: `192.168.1.20:4000`).
2. **Endpoint URL spesifik mereka**.
3. **API Key atau Secret Key mereka** (jika ada).

### Masukkan Data ke Konfigurasi LogistiKita:
Buka file `logistikita/config/integration.js` (atau sesuaikan via `.env`) dan masukkan data dari kelompok lain:

```javascript
module.exports = {
    // 1. INPUT DATA DARI KELOMPOK API GATEWAY
    apiGateway: {
        // Ganti dengan IP, Port, dan Endpoint asli dari API Gateway
        url: 'http://[IP_API_GATEWAY]:[PORT]/api/gateway/payment', 
        apiKey: '[API_KEY_DARI_MEREKA]',
        secretKey: '[SECRET_KEY_DARI_MEREKA]',
        timeout: 5000
    },

    // 2. INPUT DATA DARI KELOMPOK SMARTBANK (Jika LogistiKita perlu panggil SmartBank langsung)
    smartBank: {
        url: 'http://[IP_SMARTBANK]:[PORT]/api/v1',
        apiKey: '[API_KEY_SMARTBANK]'
    },

    // 3. INPUT DATA DARI KELOMPOK MARKETPLACE (Jika perlu)
    marketplace: {
        url: 'http://[IP_MARKETPLACE]:[PORT]',
        webhookUrl: 'http://[IP_MARKETPLACE]:[PORT]/webhook/tokobagus'
    },
    // ...
```
*Ganti teks di dalam kurung siku `[...]` dengan data sebenarnya yang Anda dapatkan dari kelompok lain.*

---

## 📤 Apa Saja yang Harus Diberikan ke Kelompok Lain?

Kelompok lain juga perlu mengakses LogistiKita Anda. Berikan informasi berikut kepada mereka agar bisa disambungkan.

### 1. Ke Kelompok API Gateway / Marketplace
Berikan mereka URL untuk **Mengecek Ongkos Kirim**:
- **URL Endpoint:** `http://[IP_LAPTOP_ANDA]:3000/api/shipping/calculate`
- **Method:** `POST`

### 2. Ke Kelompok Marketplace / Gateway
Berikan mereka URL Webhook agar mereka bisa menerima update status resi pengiriman dari LogistiKita Anda:
- **URL Webhook Update Status:** `http://[IP_LAPTOP_ANDA]:3000/api/shipping/webhook/update-status`
- **Method:** `POST`
- **Webhook Secret:** Berikan `webhookSecret` milik Anda (`lsk-webhook-secret-xyz` atau secret lain yang Anda atur).

> [!TIP]  
> Jika aplikasi error/timeout saat dicoba di-hit antar kelompok, pastikan **Firewall** di laptop Anda dan laptop kelompok lain tidak memblokir port yang digunakan (Port 3000 untuk LogistiKita). Anda mungkin perlu **mematikan Windows Defender Firewall** untuk sementara selama praktikum integrasi.


👑 1. Super Admin
Email: superadmin@logistikita.com
Password: superadmin123

🏢 2. Operator Cabang (Branch Admin), buat pw operator semua sama

Cabang Jakarta:
Email: op_jakarta@logistikita.com
Password: operator123
Cabang Bandung:
Email: op_bandung@logistikita.com
Password: operator123
Cabang Surabaya:
Email: op_surabaya@logistikita.com
Password: operator123

🛵 3. Kurir Lapangan, buat pw kurir nya semua sama tinggal nama awal di emailnya aja yang diganti

Kurir 1: andi.kurir@logistikita.com / kurir123 (Cabang Jakarta)
Kurir 2: budi.kurir@logistikita.com / kurir123 (Cabang Jakarta)
Kurir 3: citra.kurir@logistikita.com / kurir123 (bandung)
