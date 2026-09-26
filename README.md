# 💰 Project-Keuangan (Personal Finance Tracker & Simulator)

Aplikasi manajemen keuangan pribadi modern, presisi, dan berbasis data yang dirancang dengan pendekatan *mobile-first*, memadukan fondasi pencatatan arus kas aktual, anggaran fleksibel, tabungan otomatis, proteksi dana darurat, hingga simulasi kalkulator target impian berinflasi dan KPR anuitas bertahap.

---

## 📑 Daftar Isi
1. [Fitur Utama](#-fitur-utama)
2. [Arsitektur & Stack Teknologi](#-arsitektur--stack-teknologi)
3. [Struktur Repositori](#-struktur-repositori)
4. [Panduan Instalasi & Menjalankan](#-panduan-instalasi--menjalankan)
5. [Konfigurasi Environment](#-konfigurasi-environment)
6. [Pengujian & Verifikasi](#-pengujian--verifikasi)
7. [Desain & Konvensi Domain](#-desain--konvensi-domain)

---

## 🚀 Fitur Utama

- **Fondasi Saldo & Transaksi Akurat**:
  - Satu saldo utama yang membedakan arus kas aktual, saldo awal, dan dana yang disisihkan (mencegah pencatatan ganda).
  - Nominal moneter menggunakan tipe `BigInt` (bebas dari error floating point pembulatan).
  - Pencatatan transaksi lengkap dengan sumber pemasukan, kategori kebutuhan/keinginan, dan jejak audit (*audit reason*) untuk koreksi serta pembatalan lunak (*soft cancel*).
- **Anggaran Fleksibel 50/30/20**:
  - Konfigurasi rasio Kebutuhan, Tabungan, dan Keinginan bulanan yang dinamis.
  - Dukungan penyesuaian khusus (*override*) per sumber pemasukan (misal: gaji tetap vs freelance).
  - Penanda cerdas konsumsi saldo lama saat pengeluaran melampaui pemasukan bulan berjalan.
  - Tinjauan evaluasi akhir bulan (*month-end review*) dengan rekomendasi tabungan ekstra (D-006).
- **Tabungan Otomatis & Target Impian (D-005)**:
  - Alokasi tabungan otomatis 60% untuk Dana Pengaman (Darurat) dan 40% untuk Target Impian.
  - Metrik ketahanan dana darurat yang diukur secara real-time terhadap pengeluaran pokok bulanan.
  - Manajemen beberapa target impian (metode Beli Lunas maupun Uang Muka / DP) dengan pembagian bobot (*share ratio*).
  - Mekanisme pelepasan alokasi (*release allocation*) kembali ke saldo bebas tanpa mengubah saldo riil.
- **Simulator Finansial Majemuk (Read-Only & In-Memory)**:
  - **Proyeksi Target Impian**: Menghitung waktu ketercapaian atau setoran bulanan yang dibutuhkan dengan mempertimbangkan asumsi kenaikan harga tahunan majemuk (*compound inflation*).
  - **Kalkulator KPR Anuitas Bertahap**: Simulasi transisi bunga bertahap (Fixed ➡️ Floating), lonjakan cicilan, sisa pokok hutang, total bunga, dan evaluasi beban hutang (*Debt Service Ratio* / DSR).
  - Perhitungan murni tanpa memutasi saldo aktual atau menambah utang riil pada database.
- **Pengalaman Pengguna (UX) Modern & Responsif**:
  - Navigasi bawah mobile (*Bottom Navigation Bar*) untuk kemudahan akses satu jempol di smartphone.
  - *Loading skeleton* dengan animasi pulse untuk mencegah pergeseran tata letak (*layout shift*).
  - *Interactive empty states* dengan tombol *Call-to-Action* (CTA).
  - Penanganan sesi kedaluwarsa otomatis (HTTP 401 Response Interceptor).
  - Aksesibilitas keyboard (tombol `Escape` menutup seluruh modal).

---

## 🛠️ Arsitektur & Stack Teknologi

| Lapisan | Teknologi | Penjelasan |
|:---|:---|:---|
| **Backend API** | [NestJS 11](https://nestjs.com/) + TypeScript | RESTful API arsitektur modular, `@nestjs/config`, JWT Auth Guard, Class Validator |
| **Database & ORM** | [Prisma ORM](https://www.prisma.io/) + SQLite | Skema data relasional, integritas referensial, migrasi lokal SQLite |
| **Frontend Client** | [Vue 3](https://vuejs.org/) + Vite + TypeScript | Single Page Application (SPA), Composition API (`<script setup>`), Pinia, Vue Router 4 |
| **Styling & Icons** | [Tailwind CSS v4](https://tailwindcss.com/) + [Lucide Icons](https://lucide.dev/) | Utility-first CSS dengan palet profesional D-010, Lucide icons modern |

---

## 📂 Struktur Repositori

```text
Project-Keuangan/
├── CONTEXT.md                    # Definisi glosarium domain kanonis
├── docs/                         # Dokumentasi AI workflow, keputusan, dan perencanaan
│   └── ai-workflow/
│       ├── PROJECT.md            # Konteks proyek dan status integrasi
│       ├── DECISIONS.md          # Log keputusan arsitektur (D-001 s.d. D-015)
│       ├── RULES.md              # Aturan kerja & batasan kewenangan
│       └── tasks/                # Rencana implementasi & verifikasi
├── finance-api/                  # Backend REST API (NestJS)
│   ├── prisma/                   # Skema Prisma, migrasi SQLite
│   ├── src/                      # Source code (auth, transactions, budgets, savings, simulations)
│   ├── test/                     # E2E test suites
│   └── scripts/                  # Skrip verifikasi integrasi otomatis
├── finance-frontend/             # Frontend Client (Vue 3 + Vite)
│   ├── src/
│   │   ├── api/                  # Axios HTTP client, response interceptor, service layer
│   │   ├── components/           # Komponen layout (Navbar, HeroCard, BudgetSection, dll)
│   │   │   └── modals/           # 12 modal mandiri (Transaction, BudgetPolicy, Simulator, dll)
│   │   ├── pages/                # Halaman Dashboard.vue (koordinator) dan Login.vue
│   │   ├── stores/               # Pinia auth store
│   │   └── utils/                # Formatter mata uang Rupiah & tanggal lokal
│   └── index.html
└── output/visual-planning/       # Referensi visual dan prototipe desain
```

---

## ⚙️ Panduan Instalasi & Menjalankan

### Prasyarat
- [Node.js](https://nodejs.org/) versi `>= 20.x`
- npm versi `>= 10.x`

### 1. Menjalankan Backend (`finance-api`)

```bash
cd finance-api

# Salin contoh konfigurasi environment
cp .env.example .env

# Pasang dependensi
npm install

# Jalankan migrasi database SQLite
npx prisma migrate dev

# Jalankan server dalam mode development
npm run start:dev
```
Backend akan aktif di `http://localhost:3001`.

### 2. Menjalankan Frontend (`finance-frontend`)

Buka terminal baru di direktori root:

```bash
cd finance-frontend

# Salin contoh konfigurasi environment
cp .env.example .env

# Pasang dependensi
npm install

# Jalankan Vite development server
npm run dev
```
Frontend akan aktif di `http://localhost:5173`.
Halaman `/` adalah landing page, `/login` untuk masuk atau mendaftar, dan `/dashboard` untuk aplikasi setelah masuk.

---

## 🔐 Konfigurasi Environment

### Backend (`finance-api/.env`)
```env
PORT=3001
DATABASE_URL="file:./dev.db"
# Minimal 32 karakter rahasia untuk tanda tangan token JWT
JWT_SECRET=super-secret-jwt-key-finance-project-min-32-chars
# Google Web Client ID yang sama dengan frontend; kosongkan jika belum memakai login Google
GOOGLE_CLIENT_ID=xxxxxxxx.apps.googleusercontent.com
# Daftar origin frontend yang diizinkan, pisahkan dengan koma untuk lebih dari satu domain
FRONTEND_ORIGINS=http://localhost:5173
```

### Frontend (`finance-frontend/.env`)
```env
VITE_API_URL=http://localhost:3001
VITE_GOOGLE_CLIENT_ID=xxxxxxxx.apps.googleusercontent.com
```

Untuk mengaktifkan Google login, buat **OAuth 2.0 Client ID** bertipe *Web application* di Google Cloud. Tambahkan `http://localhost:5173` sebagai *Authorized JavaScript origin* saat pengembangan dan origin HTTPS frontend saat produksi. Isi Client ID yang sama di kedua berkas `.env`, lalu mulai ulang frontend dan backend. Alur ini memakai tombol Google Identity Services dan ID token, tanpa Google client secret atau refresh token. Bila Client ID belum diisi, form email-kata sandi tetap dapat dipakai. Publikasi di domain produksi juga memerlukan pengaturan branding dan domain aplikasi pada Google Cloud.

---

## 🧪 Pengujian & Verifikasi

### Backend Tests
```bash
cd finance-api

# Menjalankan seluruh unit test
npm test -- --runInBand

# Menjalankan E2E Test pada SQLite sementara terisolasi
npm run test:e2e -- --runInBand

# Kompilasi build produksi NestJS
npm run build
```

### Frontend Type-Check & Production Build
```bash
cd finance-frontend

# Menjalankan vue-tsc type checking dan Vite production bundle
npm run build
```

---

## 🎨 Desain & Konvensi Domain

- **Palet Warna Profesional (Keputusan D-010)**:
  - Hijau Gelap Hutan (`#183D2B`): Kartu saldo utama dan identitas merek.
  - Lime Segar (`#B8DF38`): Aksi utama (*Call to Action*), pilihan aktif, dan tombol nabung.
  - Latar Belakang Hangat (`#F3F5EF`): Bidang kanvas utama aplikasi.
  - Kartu Bersih (`#FFFFFF`): Panel seksi konten dan modal dialog.
  - Teks Utama (`#202820`): Tipografi tajam dengan kontras tinggi.
- **Konvensi Domain ([CONTEXT.md](file:///Users/gungdikaebs/Project/Project-Keuangan/CONTEXT.md))**:
  - Menggunakan istilah *Saldo utama*, *Uang belum disisihkan*, *Dana tujuan*, *Dana pengaman*, *Target impian*, *Penyisihan*, dan *Pelepasan alokasi*.
  - Menghindari percampuran istilah perbankan seperti "transfer", "tarik tunai", atau "rekening" pada fitur penyisihan internal.
