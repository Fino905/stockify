<div align="center">

  <img src="https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/boxes.svg" width="80" height="80" alt="Stockify Logo" />

  # 📦 Stockify
  
  **Modern Intelligent Inventory, Warehouse & Commerce Management System**  
  *Powered by Laravel 11/12, Inertia.js v3, React 19, TypeScript & Tailwind CSS v4*

  <p align="center">
    <a href="#-fitur-utama">Fitur</a> •
    <a href="#-demo-akun">Akun Demo</a> •
    <a href="#-teknologi">Teknologi</a> •
    <a href="#-instalasi--menjalankan">Instalasi</a> •
    <a href="#-struktur-direktori">Struktur</a> •
    <a href="#-lisensi">Lisensi</a>
  </p>

  <p align="center">
    <img src="https://img.shields.io/badge/Laravel-FF2D20?style=for-the-badge&logo=laravel&logoColor=white" alt="Laravel" />
    <img src="https://img.shields.io/badge/Inertia.js-9553E9?style=for-the-badge&logo=inertia&logoColor=white" alt="Inertia.js" />
    <img src="https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React 19" />
    <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Tailwind_CSS_v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
    <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
    <img src="https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge" alt="License" />
  </p>

</div>

---

## 🌟 Tentang Stockify

**Stockify** adalah platform manajemen persediaan barang (inventory) dan transaksi gudang terpadu yang menjembatani operasional internal gudang dengan kebutuhan belanja pelanggan (*customer*). 

Dibangun dengan arsitektur modern berbasis **Single Page Application (SPA)** menggunakan **Inertia.js** dan **React 19**, Stockify menawarkan performa cepat tanpa reload halaman, visual antarmuka elegan bertema *Unified Royal Blue* (`#3B5BFD`), dan kontrol hak akses multi-peran (*Role-Based Access Control*).

---

## ✨ Fitur Utama

### 👑 1. Portal Admin & Manajer Gudang
- **Executive Analytics Dashboard**: Metrik perputaran stok (*turnover rate*), total nilai aset gudang, SKU hampir habis (*low-stock alerts*), dan tren pesanan.
- **Order & Transaction Review**: Pemantauan pesanan pelanggan secara langsung dan riwayat transaksi barang masuk/keluar (*Stock In / Stock Out*).
- **Refund Management**: Verifikasi permohonan pengembalian dana (*refund*) dari pelanggan dengan opsi persetujuan (*Approve*) atau penolakan (*Reject*) disertai alasan.
- **Supplier & Category Management**: Manajemen pemasok mitra dan kategori produk.

### 📦 2. Portal Staff Gudang (Petugas)
- **Task Center**: Pusat tugas harian petugas gudang untuk memproses verifikasi barang masuk dan pengeluaran pesanan.
- **Inventory Control**: Pembaruan stok instan saat barang diterima dari supplier atau saat dipersiapkan untuk pengiriman.
- **Product Management**: Pengelolaan data produk dan varian atribut barang.

### 🛒 3. Portal Customer (Katalog & Belanja)
- **Direct Catalog Browsing**: Penjelajahan katalog produk responsif dengan filter pencarian, indikator ketersediaan stok, dan foto produk.
- **Automated Stock Deduction**: Stok barang di gudang otomatis berkurang secara konsisten setiap kali pesanan berhasil dilakukan.
- **Interactive Dummy Payment Simulation**: Modal simulasi pembayaran (Virtual Account, QRIS, Transfer Bank) yang aman untuk pengujian alur *checkout* tanpa gateway finansial riil.
- **Order Tracking & History**: Pelacakan status pesanan pelanggan (*pending, diproses, dikirim, selesai*).
- **Ratings & Feedback**: Pelanggan dapat memberikan ulasan bintang (1–5) dan komentar ulasan produk setelah transaksi.
- **Refund Request**: Pengajuan komplain/refund barang rusak atau tidak sesuai dengan input bukti dan alasan.

### 🔐 4. Autentikasi & Keamanan (RBAC)
- **Restricted Public Registration**: Formulir registrasi publik dikunci otomatis khusus untuk pendaftaran role **Customer**, mencegah eskalasi hak akses internal.
- **Fortify & Middleware Guard**: Proteksi rute tingkat controller dan middleware berbasis peran pengguna (`admin`, `manajer_gudang`, `staff_gudang`, `customer`).

---

## 🛠️ Teknologi yang Digunakan

| Komponen | Teknologi | Keterangan |
| :--- | :--- | :--- |
| **Backend Framework** | [Laravel 11/12](https://laravel.com) | PHP 8.3+, Eloquent ORM, Fortify Auth |
| **Frontend Adapter** | [Inertia.js v3](https://inertiajs.com) | Monolithic SPA bridge antara Laravel & React |
| **Frontend Library** | [React 19](https://react.dev) | Komponen UI reaktif dengan TypeScript |
| **Bahasa Pemrograman**| PHP 8.3 & TypeScript | Type-safe front-to-back |
| **Styling & Icons** | [Tailwind CSS v4](https://tailwindcss.com) & [Lucide React](https://lucide.dev) | Desain modern, responsive, dan konsisten |
| **Bundler & Tooling** | [Vite](https://vitejs.dev) | Hot Module Replacement (HMR) super cepat |
| **Database** | SQLite / MySQL / PostgreSQL | Didukung penuh via Laravel Migrations |

---

## 👥 Demo Akun Bawaan

Database seeder telah dilengkapi dengan akun pengujian untuk setiap tingkatan peran.  
*Semua akun menggunakan kata sandi:* `password`

| Peran (Role) | Email | Akses Halaman Utama |
| :--- | :--- | :--- |
| **Admin** | `admin@stockify.test` | Full Dashboard, Analytics, Refund & Order Approvals |
| **Manajer Gudang** | `manajer@stockify.test` | Dashboard Operasional & Laporan Stok |
| **Staff Gudang** | `staff@stockify.test` | Task Center, Verifikasi Barang Masuk/Keluar |
| **Customer** | `customer@stockify.test` | Langsung ke Katalog Belanja, Pesanan, Feedback & Refund |

---

## 🚀 Panduan Instalasi & Menjalankan

Ikuti langkah-langkah berikut untuk menjalankan Stockify di komputer lokal:

### 1. Prasyarat Sistem
- **PHP** >= 8.3 (dengan ekstensi `pdo`, `mbstring`, `openssl`, `curl`)
- **Composer** >= 2.x
- **Node.js** >= 20.x & **npm**

### 2. Kloning Repositori
```bash
git clone https://github.com/Fino905/stockify.git
cd stockify
```

### 3. Instal Dependensi Backend & Frontend
```bash
# Instal dependensi PHP
composer install

# Instal dependensi JavaScript/React
npm install
```

### 4. Konfigurasi Lingkungan (`.env`)
Salin file konfigurasi environment dan buat encryption key aplikasi:
```bash
cp .env.example .env
php artisan key:generate
```

> **Catatan Database**: Jika menggunakan SQLite, pastikan file `database/database.sqlite` tersedia:
> ```bash
> touch database/database.sqlite
> ```

### 5. Jalankan Migrasi & Seeder Data
Jalankan migrasi database beserta data awal (*dummy products, categories, stock, orders, dan akun demo*):
```bash
php artisan migrate --seed --seeder=StockifySeeder
```

### 6. Jalankan Server Pengembangan
Jalankan backend Laravel dan frontend Vite secara bersamaan:

```bash
# Terminal 1 - Backend Laravel
php artisan serve

# Terminal 2 - Frontend Vite
npm run dev
```

Buka peramban Anda di [http://127.0.0.1:8000](http://127.0.0.1:8000).

---

## 📁 Struktur Direktori Utama

```plaintext
stockify/
├── app/
│   ├── Actions/Fortify/           # Aksi registrasi & autentikasi pengguna
│   ├── Http/Controllers/          # Controller (DashboardController, CatalogController, dll.)
│   ├── Models/                   # Model Eloquent (Product, Order, OrderFeedback, OrderRefund, dll.)
│   └── Services/                 # Business logic terisolasi (DashboardService.php)
├── database/
│   ├── migrations/               # Skema tabel database
│   └── seeders/                  # StockifySeeder dengan data simulasi lengkap
├── resources/
│   ├── css/                      # Konfigurasi Tailwind CSS v4
│   └── js/
│       ├── components/
│       │   ├── dashboard/
│       │   │   ├── admin/       # Modul Analytics & Overview Admin
│       │   │   ├── staff/       # Modul Task Center & Gudang Staff
│       │   │   └── customer/    # Modul Katalog, Pesanan & Refund Pelanggan
│       │   └── flowbite/        # Navbar & Sidebar responsif
│       ├── layouts/              # AppLayout & AuthLayout
│       └── pages/                # Halaman Inertia (dashboard.tsx, welcome.tsx, auth/)
└── routes/
    └── web.php                   # Routing web & proteksi middleware
```

---

## 🤝 Kontribusi

Kontribusi selalu diterima dengan tangan terbuka!
1. Fork repositori ini
2. Buat branch fitur baru (`git checkout -b fitur/FiturKeren`)
3. Commit perubahan Anda (`git commit -m 'Menambahkan fitur keren'`)
4. Push ke branch Anda (`git push origin fitur/FiturKeren`)
5. Ajukan **Pull Request**

---

## 📄 Lisensi

Projek ini didistribusikan di bawah lisensi open-source **[MIT License](LICENSE)**.

<div align="center">
  <sub>Dibangun dengan dedikasi untuk efisiensi manajemen persediaan dan kepuasan pelanggan.</sub>
</div>
