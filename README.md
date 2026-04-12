# Residential Management System

Sistem manajemen residensial yang mencakup pengelolaan penghuni, rumah, pembayaran iuran, dan laporan keuangan. Proyek ini terdiri dari **Backend (Laravel)** dan **Frontend (React + Vite)**.

## Prasyarat (Environment)

Pastikan perangkat Anda memiliki software berikut yang terinstal:
- **PHP**: ^8.2
- **Composer**: ^2.0
- **Node.js**: ^18.x atau lebih baru
- **NPM**: ^9.x atau lebih baru
- **MySQL/MariaDB**: ^8.0 atau ^10.4

## Langkah Instalasi

### 1. Clone Repository
```bash
git clone <url-repository>
cd skill_fit_test
```

### 2. Konfigurasi Backend
```bash
cd backend
composer install
cp .env.example .env
```
Buka file `.env` dan sesuaikan pengaturan database Anda:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=skill_jagoan_hosting
DB_USERNAME=root
DB_PASSWORD=root
```
*Pastikan Anda sudah membuat database dengan nama `skill_jagoan_hosting` di MySQL Anda.*

Lanjutkan dengan perintah berikut:
```bash
php artisan key:generate
php artisan migrate --seed
```

### 3. Konfigurasi Frontend
```bash
cd ../frontend
npm install
```
Buat file `.env` di folder `frontend` (jika belum ada):
```bash
VITE_API_BASE_URL=http://127.0.0.1:8000/api
```

## Menjalankan Server Lokal

### Menjalankan Backend
Di folder `backend`, jalankan:
```bash
php artisan serve
```
Server backend akan berjalan di `http://127.0.0.1:8000`.

### Menjalankan Frontend
Di folder `frontend`, jalankan:
```bash
npm run dev
```
Server frontend akan berjalan (biasanya di `http://localhost:5173`).

## Environment Lengkap (.env) untuk Lokal

### Backend (.env)
```env
APP_NAME=Laravel
APP_ENV=local
APP_KEY=base64:GpDP/KdeHzcddg0Ye8S5cFVnS0wgp6sTuxf7UahUMX0=
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=skill_jagoan_hosting
DB_USERNAME=root
DB_PASSWORD=root

SESSION_DRIVER=database
CACHE_STORE=database
QUEUE_CONNECTION=database
```

### Frontend (.env)
```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api
```

---
*Dibuat untuk kebutuhan Skill Fit Test - Jagoan Hosting.*
