# Goal Description

Pembaruan sistem operasional kurir dan flow transit antar cabang, yang mencakup:
1. **Automasi Rute Transit**: Kurir tidak perlu lagi memilih cabang tujuan secara manual saat melakukan transit. Sistem akan secara otomatis mengarahkan paket ke `destination_branch_id` yang telah ditentukan sejak awal pengiriman.
2. **Detail Pesanan & Map Tracking**: Menambahkan antarmuka (UI) pada aplikasi Kurir untuk melihat detail lengkap pesanan beserta peta (Map Tracking) rute dari alamat pengirim ke alamat penerima menggunakan Leaflet.js.
3. **Pembaruan Flow Kedatangan (Pending Confirmation)**: Saat kurir menekan "Tiba di Cabang", paket tidak akan langsung lepas dari tanggung jawab kurir. Statusnya akan berubah menjadi `Waiting for Branch Confirmation` (Menunggu Konfirmasi Cabang). Paket tersebut akan masuk ke antrean operator cabang tujuan. Setelah operator mengklik "Konfirmasi Terima", barulah paket berstatus `Arrived at Branch` dan kurir sebelumnya dibebaskan dari tugas (released).

## User Review Required

> [!IMPORTANT]
> **Perubahan Flow Transit**
> Saat ini, sistem kurir mengharuskan kurir memilih cabang tujuan. Dengan pembaruan ini, tombol "Mulai Transit" dan "Tiba di Cabang" hanya akan memerlukan konfirmasi (tanpa *dropdown* pilihan cabang), karena sistem akan langsung mengirimkannya ke cabang tujuan akhir (`destination_branch_id`). Apakah Anda setuju dengan asumsi *direct routing* ini?

> [!IMPORTANT]
> **Penambahan Status Baru**
> Kita akan menambahkan satu status transisi baru di database: `Waiting Branch Confirmation`. Status ini akan menjembatani antara status `In Transit` dan `Arrived at Branch`. Kurir tetap memegang tugas ini (tampil di "Tugas Saya" tapi dengan *action* "Menunggu Operator") hingga operator memvalidasinya.

## Proposed Changes

---

### Database Changes
Kita perlu mengizinkan status baru di tabel database (meskipun pada migrasi sebelumnya kita me-redefine ENUM, kita mungkin akan menyesuaikannya di level kode jika validasi ketat, atau menambahkannya ke enum database).
- **Update ENUM di tabel `shipments`**: Tambahkan `'Waiting Branch Confirmation'`.

---

### Backend Controller Updates

#### [MODIFY] `c:\Users\nural\Downloads\RPL BARU\logistikita\controllers\kurirController.js`
- **`startTransit`**: Hapus argumen `next_branch_id` dari *request body*. Sistem akan mengambil `destination_branch_id` dari data resi sebagai tujuan transit.
- **`arriveAtBranch`**: Hapus argumen `branch_id`. Sistem akan menggunakan `destination_branch_id`. Ubah pembaruan data: set status menjadi `Waiting Branch Confirmation` dan update log. *Jangan set `assigned_kurir_id = NULL`*.
- **`getMyShipments` & `getTransitTasks`**: Pastikan menampilkan tugas yang berstatus `Waiting Branch Confirmation` sebagai "Tugas Selesai Sementara (Menunggu Cabang)".

#### [MODIFY] `c:\Users\nural\Downloads\RPL BARU\logistikita\controllers\branchController.js`
- **`getIncomingPackages`**: Sesuaikan query untuk mengambil paket dengan status `Waiting Branch Confirmation` di mana `destination_branch_id` sama dengan `branch_id` milik operator.
- **`confirmReceivePackage`**: Saat operator mengkonfirmasi, update status menjadi `Arrived at Destination Branch` (atau `Arrived at Branch`), *release* kurir sebelumnya (`assigned_kurir_id = NULL`), dan assign ke kurir cabang yang baru (round-robin) jika diperlukan.

---

### Frontend Updates

#### [MODIFY] `c:\Users\nural\Downloads\RPL BARU\logistikita\public\kurir.html`
- Tambahkan library **Leaflet.js** untuk peta interaktif.
- Hapus *dropdown* pilihan cabang di modal `start-transit-modal` dan `arrive-branch-modal`.
- Tambahkan **Modal Detail Pesanan & Peta** (`order-detail-modal`), yang menampilkan rute dari koordinat asal ke tujuan secara visual (menggunakan geocoding sederhana atau koordinat dummy berdasarkan kota).

#### [MODIFY] `c:\Users\nural\Downloads\RPL BARU\logistikita\public\js\kurir.js`
- Perbarui logika UI untuk card kurir: tambahkan tombol "Detail & Maps".
- Perbaiki logika fungsi `submitStartTransit` dan `submitArriveBranch` agar tidak mengirimkan `branch_id` lagi.
- Jika statusnya `Waiting Branch Confirmation`, hilangkan tombol "Tiba di Cabang" dan tampilkan teks "Menunggu Konfirmasi Operator".

#### [MODIFY] `c:\Users\nural\Downloads\RPL BARU\logistikita\public\js\branch-dashboard.js`
- Sesuaikan tampilan list *incoming packages* agar mengambil data dari status yang baru dan merefleksikan alur konfirmasi yang benar.

## Verification Plan

### Manual Verification
1. Login sebagai Kurir yang memiliki paket transit.
2. Klik tombol "Detail & Maps" untuk memastikan pop-up peta muncul dan menampilkan detail rute.
3. Klik "Mulai Transit" tanpa perlu memilih tujuan (harus berhasil otomatis).
4. Klik "Tiba di Cabang". Cek di "Tugas Saya" apakah paket berubah menjadi "Menunggu Konfirmasi Operator".
5. Login sebagai Operator Cabang tujuan, masuk ke tab "Ringkasan", lihat ada paket di antrean Konfirmasi.
6. Klik "Konfirmasi", lalu login kembali sebagai kurir pertama; paket seharusnya sudah hilang dari "Tugas Saya" dan masuk ke "Histori".
