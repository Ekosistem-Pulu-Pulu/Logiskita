# 🚚 LogistiKita — Sistem Informasi Logistik Terpadu

LogistiKita adalah sebuah platform sistem informasi logistik terpadu berbasis **Node.js** dan **Express.js** yang melayani berbagai peran operasional logistik secara real-time, serta memfasilitasi integrasi B2B (Business-to-Business) melalui API Gateway. Aplikasi ini mengimplementasikan konsep *Clean Architecture* dan *Service-Oriented Patterns* (seperti Pricing Service, Courier Assignment Service, dan Webhook Orchestrator) untuk memisahkan logika bisnis dari controller.

---

## 1. Identitas Aplikasi

* **Nama Aplikasi**: LogistiKita
* **Jenis Aplikasi**: Web API (Express.js) & Multi-Role Dashboard
* **Tujuan Aplikasi**: Mempermudah manajemen logistik nasional, pelacakan paket secara real-time, perhitungan tarif pengiriman dinamis, otomatisasi pembayaran billing Virtual Account, serta menyediakan integrasi pengiriman bagi mitra bisnis (B2B).
* **Teknologi Utama**:
  * **Backend**: Node.js, Express.js (Multi-Port Server)
  * **Database**: MySQL (menggunakan driver `mysql2` untuk performa query)
  * **Frontend**: HTML5, Vanilla CSS (Dengan tema gelap & efek transparansi modern), Vanilla Javascript
  * **Libraries/API**: Leaflet.js (Peta interaktif), OpenStreetMap (Nominatim Geocoding), FontAwesome Icons, Google Fonts (Outfit & Inter)
  * **Dokumentasi API**: Swagger UI (`swagger-jsdoc` & `swagger-ui-express`)
* **Disusun Oleh** (Berdasarkan laporan pada folder `dokumentasi`):
  1. Wa Ode Nur Alia (NIM: 7142400)
  2. Muhammad Bagus Tri Atmaja (NIM: 714240060)
  * **Institusi**: School of Information Technology, Universitas Logistik dan Bisnis Internasional (ULBI)
  * **Tanggal Pembuatan**: 22 Juni 2026

---

## 2. Panduan Instalasi (Duplikasi Aplikasi)

Ikuti langkah-langkah di bawah ini untuk menduplikasi dan menjalankan aplikasi LogistiKita di lingkungan lokal Anda.

### Langkah 1: Clone atau Download Project
1. **Menggunakan Git (Clone)**:
   Buka terminal/command prompt Anda, lalu jalankan perintah:
   ```bash
   git clone https://github.com/username/logistikita.git
   ```
2. **Tanpa Git (ZIP)**:
   * Klik tombol **Code** lalu pilih **Download ZIP** pada repository GitHub.
   * Ekstrak file ZIP tersebut ke folder kerja Anda (misalnya `C:\laragon\www\logistikita` jika menggunakan Laragon).

### Langkah 2: Pemasangan Folder Project
Pastikan folder project terstruktur dengan benar di dalam direktori web server lokal Anda.
```
workspace-root/
├── Database/
│   └── logistik_db.sql    <-- SQL DATABASE UNTUK IMPORT LARAGON
├── dokumentasi/
└── logistikita/           <-- FOLDER APLIKASI UTAMA
    ├── controllers/
    ├── database/          <-- (BIARKAN SAJA, JANGAN DIGUNAKAN UNTUK IMPORT)
    ├── public/
    ├── routes/
    ├── services/
    ├── server.js
    └── package.json
```

### Langkah 3: Instalasi Dependency
Buka terminal baru, arahkan ke dalam direktori aplikasi `logistikita`, lalu jalankan:
```bash
npm install
```
Perintah ini akan mengunduh seluruh library yang dibutuhkan seperti `express`, `mysql2`, `cors`, `dotenv`, dan `swagger`.

### Langkah 4: Konfigurasi Environment (`.env`)
1. Di dalam folder `logistikita`, buat file bernama `.env` (atau ubah nama file `.env.example` menjadi `.env`).
2. Masukkan konfigurasi koneksi database MySQL Anda. Contoh konfigurasi default:
   ```env
   PORT=3000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=logistik_db
   ```

### Langkah 5: Penyiapan Database & Import
> [!IMPORTANT]
> **PERHATIAN PENTING**: Database yang harus di-import ke Laragon berada di folder **`Database`** pada root directory proyek (yaitu file **`Database/logistik_db.sql`**). Folder database bawaan aplikasi di dalam **`logistikita/database/`** harus dibiarkan saja dan tidak boleh digunakan untuk proses import Laragon.

1. Buka aplikasi **Laragon** (atau XAMPP/MySQL lokal Anda) dan pastikan service **MySQL** sudah aktif (*Start All*).
2. Buka Database Manager bawaan Laragon (seperti HeidiSQL) atau PHPMyAdmin (`http://localhost/phpmyadmin/`).
3. Buat database baru dengan nama **`logistik_db`**.
4. Pilih database `logistik_db` tersebut, buka menu **Import** atau **Query**, lalu pilih file **`Database/logistik_db.sql`**.
5. Eksekusi script SQL tersebut sampai selesai. Ini akan membuat tabel-tabel utama serta memasukkan data awal (*seed data*) berupa user admin, kurir cabang, tarif, dan partner.

### Langkah 6: Menjalankan Aplikasi
Kembali ke terminal di dalam folder `logistikita`, jalankan perintah:
```bash
npm run dev
```
atau
```bash
npm start
```

### Langkah 7: Memastikan Aplikasi Berhasil Dijalankan
Periksa output terminal Anda. Jika server berhasil berjalan, konsol akan menampilkan log port seperti berikut:
```text
========================================
  LogistiKita Multi-Port Server
========================================
  🌐 Customer/Landing : http://localhost:3000/
  🛡️  Admin Dashboard   : http://localhost:3002/superadmin-login.html
  🏢 Operator Cabang   : http://localhost:3003/operator-login.html
  🚚 Kurir Lapangan    : http://localhost:3004/kurir-login.html
  🏪 Simulator Mitra   : http://localhost:3005/partner-simulator.html
========================================
```

---

## 3. Link Akses Aplikasi

Aplikasi LogistiKita berjalan menggunakan arsitektur **Multi-Port Server**, di mana setiap peran (role) memiliki port server tersendiri untuk menjaga independensi tampilan:

* **Customer / Landing Portal**: [http://localhost:3000/](http://localhost:3000/) *(untuk lacak resi umum)* atau [http://localhost:3000/customer-dashboard.html](http://localhost:3000/customer-dashboard.html) *(setelah customer login)*
* **Admin / Superadmin Dashboard**: [http://localhost:3002/superadmin-login.html](http://localhost:3002/superadmin-login.html)
* **Operator / Cabang Dashboard**: [http://localhost:3003/operator-login.html](http://localhost:3003/operator-login.html)
* **Kurir / Courier Dashboard**: [http://localhost:3004/kurir-login.html](http://localhost:3004/kurir-login.html)
* **Simulator Mitra B2B**: [http://localhost:3005/partner-simulator.html](http://localhost:3005/partner-simulator.html)
* **Swagger API Documentation**: [http://localhost:3000/api-docs/](http://localhost:3000/api-docs/)

---

## 4. Akun Login

Berikut adalah daftar akun default bawaan sistem (sebagai hasil *seeding* database) untuk mempermudah pengujian:

### A. Akun Pusat & Keanggotaan
| Peran | Wilayah / Cabang | Email | Password | Keterangan |
| :--- | :--- | :--- | :--- | :--- |
| **Superadmin** | Pusat (Nasional) | `superadmin@logistikita.com` | `superadmin123` | Hak akses penuh nasional |
| **Admin** | Pusat (Nasional) | `admin@logistikita.com` | `admin123` | Hak akses administratif |
| **Customer** | Jakarta / Umum | `rina@gmail.com` | `customer123` | Customer Member (Rina Kartika) |
| **Customer** | Jakarta / Umum | `hendra@gmail.com` | `customer123` | Customer Member (Hendra Wijaya) |

### B. Admin Cabang (Branch Admin / Operator)
Tersedia akun operator untuk **seluruh kota** yang terdaftar di dalam sistem:
| Wilayah Kota | Nama Cabang | Email Operator | Password |
| :--- | :--- | :--- | :--- |
| **Jakarta** | Cabang Utama Jakarta | `op_jakarta@logistikita.com` | `operator123` |
| **Bandung** | Cabang Utama Bandung | `op_bandung@logistikita.com` | `operator123` |
| **Surabaya** | Cabang Utama Surabaya | `op_surabaya@logistikita.com` | `operator123` |
| **Medan** | Cabang Utama Medan | `op_medan@logistikita.com` | `operator123` |
| **Makassar** | Cabang Utama Makassar | `op_makassar@logistikita.com` | `operator123` |
| **Balikpapan**| Cabang Utama Balikpapan | `op_balikpapan@logistikita.com`| `operator123` |
| **Yogyakarta**| Cabang Utama Yogyakarta | `op_yogyakarta@logistikita.com`| `operator123` |
| **Semarang** | Cabang Utama Semarang | `op_semarang@logistikita.com` | `operator123` |
| **Denpasar** | Cabang Utama Denpasar | `op_denpasar@logistikita.com` | `operator123` |
| **Palembang** | Cabang Utama Palembang | `op_palembang@logistikita.com`| `operator123` |
| **Pontianak** | Cabang Utama Pontianak | `op_pontianak@logistikita.com`| `operator123` |
| **Manado** | Cabang Utama Manado | `op_manado@logistikita.com` | `operator123` |

### C. Kurir Lapangan (Courier)
| Wilayah Cabang | Nama Kurir | Email Kurir | Password |
| :--- | :--- | :--- | :--- |
| **Jakarta** (Cabang 1) | Andi Prasetyo | `andi.kurir@logistikita.com` | `kurir123` |
| **Jakarta** (Cabang 1) | Budi Santoso | `budi.kurir@logistikita.com` | `kurir123` |
| **Bandung** (Cabang 2) | Citra Dewi | `citra.kurir@logistikita.com` | `kurir123` |
| **Bandung** (Cabang 2) | Doni Firmansyah | `doni.kurir@logistikita.com` | `kurir123` |
| **Surabaya** (Cabang 3) | Eka Ramadhan | `eka.kurir@logistikita.com` | `kurir123` |
| **Medan** (Cabang 4) | Nanda Pratiwi | `nanda.kurir@logistikita.com` | `kurir123` |
| **Yogyakarta** (Cabang 7)| Hadi Nugroho | `hadi.kurir@logistikita.com` | `kurir123` |
| **Semarang** (Cabang 8)| Joko Susilo | `joko.kurir@logistikita.com` | `kurir123` |
| **Denpasar** (Cabang 9)| Luki Wibowo | `luki.kurir@logistikita.com` | `kurir123` |
| **Palembang** (Cabang 10)| Bambang | `bambang.kurir@logistikita.com`| `kurir123` |

### D. Partner Mitra B2B
Mitra B2B menggunakan **API Key** untuk autentikasi melalui Simulator atau API Gateway:
| Wilayah PIC | Nama Partner | Email PIC | API Key B2B |
| :--- | :--- | :--- | :--- |
| **Jakarta** | Marketplace TokoBagus | `pic@tokobagus.com` | `lsk_live_mktA_9f8a8b7c6d5e4f3a2b1c` |
| **Bandung** | Toko Elektronik MajuJaya| `admin@majujaya.co.id` | `lsk_live_tokB_a1b2c3d4e5f6a7b8c9d0` |
| **Surabaya** | Supplier SumberMakmur | `ops@sumbermakmur.id` | `lsk_live_splC_f0e1d2c3b4a5968778a9` |

---

## 5. Simulasi Pengiriman Paket (Jakarta → Bandung)

Lakukan simulasi pengiriman paket dari wilayah asal Jakarta ke wilayah tujuan Bandung dengan mengikuti 6 langkah terstruktur berikut:

### Langkah 1: Pembuatan Paket & Resi Baru
1. Buka browser dan akses **Portal Login**: [http://localhost:3000/login.html](http://localhost:3000/login.html).
2. Login sebagai **Customer** menggunakan email `rina@gmail.com` dan password `customer123`.
3. Klik menu **Kirim Paket Baru** di sidebar kiri.
4. Isi data form pengiriman sebagai berikut:
   * **Data Pengirim**: Nama `Rina Kartika`, Telepon `0812-3456-7001`, Kota Asal `Jakarta`, Alamat `Jl. Gatot Subroto No.12, Jakarta Selatan`.
   * **Data Penerima**: Nama `Andi Susanto`, Telepon `0813-8888-9999`, Kota Tujuan `Bandung`, Alamat `Jl. Asia Afrika No.10, Bandung`.
   * **Spesifikasi**: Berat `1.0 Kg`, Layanan `Reguler`.
5. Klik **Buat Pengiriman**. Sistem akan memproses dan menampilkan modal instruksi Virtual Account (VA) SmartBank.
6. Salin kode VA SmartBank yang diberikan. Buka halaman utama SmartBank simulator di [http://localhost:3000/](http://localhost:3000/), masukkan nomor VA, lalu tekan **Proses Bayar**.
7. Setelah pembayaran dikonfirmasi lunas (**Paid**), sistem akan menerbitkan nomor resi (AWB) baru (misalnya: `LSK020113197338`) dengan status awal **Pending**.

### Langkah 2: Proses Transit oleh Kurir Jakarta
1. Keluar dari portal customer, lalu buka **Portal Kurir**: [http://localhost:3004/kurir-login.html](http://localhost:3004/kurir-login.html).
2. Login menggunakan akun kurir Jakarta: `andi.kurir@logistikita.com` / `kurir123`.
3. Buka menu **Paket Tersedia** (Available Pickups). Paket Jakarta → Bandung yang baru Anda buat akan terlihat di sana.
4. Klik tombol **Ambil Tugas** (Take Task) agar paket masuk ke daftar tugas pribadi Anda.
5. Pindah ke menu **Tugas Saya** (My Tasks). Klik tombol **Mulai Transit** (Start Transit).
6. Status paket otomatis berubah menjadi **In Transit** (Sedang Transit) dan posisi paket sedang dalam perjalanan dari Hub Jakarta menuju Hub Bandung.

### Langkah 3: Konfirmasi Paket Tiba di Cabang Bandung
1. Buka **Portal Operator Cabang**: [http://localhost:3003/operator-login.html](http://localhost:3003/operator-login.html).
2. Login menggunakan akun operator Bandung: `op_bandung@logistikita.com` / `operator123`.
3. Di halaman **Ringkasan Cabang** (Ops), cari bagian bawah **Paket Masuk Perlu Konfirmasi**. Nomor resi AWB yang Anda buat akan muncul di sana sebagai paket *inbound*.
4. Masukkan nomor AWB tersebut di input form **Cek Resi & Validasi Paket** lalu klik **Cari Paket**.
5. Detail paket akan muncul. Klik tombol **Konfirmasi Kedatangan Paket** (Confirm Arrive).
6. **Perubahan Otomatis**: Setelah paket tiba di cabang tujuan Bandung (status menjadi *Arrived at Destination Branch*), sistem logistik secara otomatis akan melakukan kalkulasi pembagian tugas (*round-robin assignment*) untuk menunjuk kurir Bandung yang paling rendah beban kerjanya guna mengantarkan paket ke alamat akhir penerima.

### Langkah 4: Memeriksa Kurir Penerima Tugas Akhir
1. Masih di akun **Operator Bandung** (`op_bandung@logistikita.com`).
2. Klik menu **Daftar Pengiriman** (Shipments List) di sidebar.
3. Cari nomor resi AWB Anda pada tabel.
4. Pada baris data paket tersebut di sisi kanan, Anda akan melihat nama kurir Bandung yang ditugaskan secara otomatis oleh sistem (misalnya: `Citra Dewi` atau `Doni Firmansyah`).
5. Catat nama kurir tersebut untuk login pada tahap berikutnya.

### Langkah 5: Mencari Kredensial Email Kurir yang Ditugaskan
1. Apabila Anda tidak mengetahui email kurir tersebut, log out dari operator cabang dan buka **Portal Super Admin**: [http://localhost:3002/superadmin-login.html](http://localhost:3002/superadmin-login.html).
2. Login sebagai Super Admin: `superadmin@logistikita.com` / `superadmin123`.
3. Masuk ke menu **Kelola Pengguna** di sidebar.
4. Cari nama kurir yang ditugaskan tadi (misalnya: *Citra Dewi*).
5. Lihat dan salin alamat email kurir tersebut (misalnya: `citra.kurir@logistikita.com`). Password default untuk semua kurir adalah `kurir123`. Log out dari Super Admin.

### Langkah 6: Pengantaran Akhir & Penyelesaian Tugas
1. Buka kembali **Portal Kurir**: [http://localhost:3004/kurir-login.html](http://localhost:3004/kurir-login.html).
2. Login menggunakan akun kurir Bandung yang telah didapatkan (misal: `citra.kurir@logistikita.com` / `kurir123`).
3. Buka menu **Tugas Saya** (My Tasks). Paket AWB Anda akan muncul dengan status **Arrived at Destination Branch**.
4. Klik tombol **Mulai Delivery** (Start Delivery). Status paket akan berubah menjadi **Out For Delivery** (Kurir sedang mengantar paket ke alamat).
5. Setelah sampai di lokasi penerima, klik tombol **Selesaikan Delivery** (Complete Delivery).
6. Isi formulir **Bukti Pengiriman** (Proof of Delivery) dengan menuliskan nama penerima (misal: *Andi Susanto*), catatan pengiriman, dan lampiran foto bukti.
7. Klik **Kirim Bukti**. Status pengiriman paket resmi berubah menjadi **Delivered** (Selesai/Terkirim).

---

## 6. Simulasi Mitra B2B

Aplikasi LogistiKita memfasilitasi integrasi eksternal B2B via API Gateway. Lakukan simulasi pembuatan order dari sisi merchant/mitra B2B melalui langkah berikut:

1. **Akses Dashboard Simulator**:
   Buka halaman **Simulator Seller Center**: [http://localhost:3005/partner-simulator.html](http://localhost:3005/partner-simulator.html).
2. **Koneksi API & Autentikasi**:
   * Di sidebar kiri bagian *API Configuration*, masukkan API Key TokoBagus Anda: `lsk_live_mktA_9f8a8b7c6d5e4f3a2b1c`.
   * Klik tombol **Test Connection**. Status akan berubah hijau menampilkan pesan "B2B API Connected".
3. **Mengisi Formulir Order**:
   * **Pengirim**: Default terisi otomatis oleh identitas merchant (TokoBagus, Jakarta).
   * **Penerima**: Isi nama pembeli, kota tujuan (contoh: Bandung), dan tulis alamat lengkapnya.
   * **Peta Koordinat**: Klik area peta Leaflet untuk menentukan titik koordinat lintang (*latitude*) dan bujur (*longitude*) penerima guna kalkulasi jarak yang akurat.
4. **Kalkulasi Biaya Terpusat**:
   * Klik tombol **Cek Ongkir & Layanan**.
   * Simulator akan memanggil B2B API (`POST /api/v1/rates/check`) untuk menghitung tarif pengiriman secara otomatis melalui *Pricing Service* terpusat (Reguler & Express).
5. **Penerbitan Resi (AWB)**:
   * Pilih salah satu layanan pengiriman (misal: Reguler).
   * Klik tombol **Buat Resi & Bayar (Auto-Deduct)**.
   * **Sistem Auto-Deduct**: Backend API secara otomatis memotong saldo Virtual Account SmartBank milik mitra bisnis, mencatat log request di `api_logs`, dan mengembalikan response sukses berupa nomor AWB baru berstatus **Pending**.
6. **Alur Webhook Real-time**:
   * Setiap kali operator cabang atau kurir memperbarui status paket (seperti *Picked Up*, *In Transit*, *Delivered*), sistem LogistiKita akan secara otomatis menembakkan payload status terupdate ke Webhook URL milik Mitra.
   * Anda dapat memantau payload JSON yang masuk di tab **Webhook Tester** pada simulator mitra.

---

## 7. Penjelasan Singkat Menu Aplikasi

Setiap dashboard memiliki menu khusus yang terintegrasi langsung dengan database logistik:

### A. Super Admin (`http://localhost:3002/`)
* **Statistik Nasional**: Panel ringkasan eksekutif berisi visualisasi total pengiriman, omset nasional, dan feed aktivitas cabang di seluruh Indonesia.
* **Cabang Logistik**: Mengelola data operasional cabang (menambah cabang baru, mengedit alamat koordinat cabang, mengontrol status aktif).
* **Kelola Pengguna**: CRUD akun admin pusat, operator cabang, dispatcher, dan kurir, serta menyetujui registrasi pendaftaran kurir baru.
* **Partner Marketplace**: Manajemen integrasi mitra B2B (aktivasi API Key, konfigurasi webhook URL, dan data SmartBank milik partner).
* **Monitoring API & Webhook**: Log audit teknis realtime untuk memantau waktu eksekusi API, response status, payload, dan status webhook pengiriman.
* **Laporan Keuangan**: Laporan terperinci mengenai total ongkos kirim, admin fee (3%), dan status tagihan.
* **Lacak Resi**: Fitur pelacakan rute dan riwayat status paket secara global.
* **Aduan Pelanggan**: Layanan aduan keluhan pelanggan (paket rusak/hilang) untuk diselesaikan oleh admin pusat.

### B. Cabang / Operator (`http://localhost:3003/`)
* **Ringkasan Cabang**: Statistik logistik internal cabang, validasi input AWB resi, dan menu pemrosesan paket masuk/keluar.
* **Live Tracking**: Peta visualisasi pergerakan armada pengiriman real-time di area cabang terkait.
* **Staf Kurir Cabang**: Manajemen staf kurir lokal, memantau status keaktifan, dan melihat beban penugasan mereka.
* **Approval Kurir**: Modul persetujuan bagi kurir lokal baru yang mendaftar ke cabang tersebut.
* **Daftar Pengiriman**: Tabel riwayat logistik komprehensif seluruh paket yang melewati cabang asal maupun tujuan.

### C. Kurir Lapangan (`http://localhost:3004/`)
* **Tugas Saya**: Menampilkan daftar pickup dan delivery aktif yang harus diantarkan. Dilengkapi dengan **Optimasi Rute AI** untuk mengurutkan destinasi pengantaran berdasarkan rute terpendek.
* **Transit & Rute**: Daftar paket muatan transit antar cabang hub (antarkota).
* **Paket Tersedia**: Daftar paket di cabang asal yang siap diambil/ditugaskan ke kurir secara mandiri.
* **Histori Selesai**: Riwayat seluruh penugasan pengiriman yang sukses diselesaikan beserta bukti foto/tanda tangan digital.

### D. Mitra B2B (`http://localhost:3005/`)
* **Kirim Pesanan**: Formulir pengisian order penjualan terintegrasi dengan Leaflet Map dan kalkulator ongkir B2B.
* **Riwayat Resi**: Log daftar AWB yang pernah diterbitkan oleh sistem e-commerce mitra.
* **Webhook Tester**: Konsol pengawas untuk melihat data JSON update status kiriman dari API LogistiKita.

---

## 8. Troubleshooting (Penyelesaian Masalah)

Berikut adalah solusi untuk kendala yang sering ditemui pengguna saat menguji aplikasi:

* **Database Gagal di-Import**:
  * *Masalah*: Muncul pesan error sintaksis SQL atau *Database Not Found*.
  * *Solusi*: Pastikan Anda menggunakan MySQL versi 8.0+ atau MariaDB 10.4+. Buat database bernama `logistik_db` terlebih dahulu, baru import file `Database/logistik_db.sql` di root directory. Jangan menggunakan file sql yang ada di folder `logistikita/database/`.
* **Backend Tidak Dapat Dijalankan**:
  * *Masalah*: Pesan error `Error: Cannot find module '...'` atau terminal langsung tertutup.
  * *Solusi*: Pastikan Anda sudah menjalankan perintah `npm install` di dalam direktori `logistikita` sebelum menjalankan `npm start`.
* **Port Sudah Digunakan (Port Conflict)**:
  * *Masalah*: Server gagal *binding* port dengan pesan `EADDRINUSE: address already in use :::3000`.
  * *Solusi*: Aplikasi LogistiKita menggunakan port `3000`, `3002`, `3003`, `3004`, dan `3005`. Matikan aplikasi lain yang menggunakan port tersebut, atau jalankan perintah PowerShell berikut untuk menghentikan proses yang memblokir port (contoh port 3000):
    ```powershell
    Stop-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess -Force
    ```
* **Gagal Login Akun**:
  * *Masalah*: Muncul pesan *Email atau password salah* meskipun data sudah sesuai tabel akun.
  * *Solusi*: Pastikan koneksi database di file `.env` sudah benar dan data tabel `internal_users` telah terisi dengan sukses melalui import file SQL. Jika Anda baru mendaftarkan kurir baru, pastikan Operator Cabang sudah menyetujuinya di tab *Approval Kurir*.
* **API Key Tidak Valid pada Simulator**:
  * *Masalah*: Simulator B2B menunjukkan status *Connection Failed / Unauthorized*.
  * *Solusi*: Periksa file `.env` apakah database yang terhubung adalah `logistik_db`. Pastikan API Key yang Anda input di simulator sama persis dengan kolom `api_key` pada tabel `partners` di database Anda.
