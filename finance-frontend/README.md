# 🖥️ Finance Frontend (Client SPA)

Frontend Single Page Application (SPA) untuk **Project-Keuangan**, dibangun menggunakan Vue 3, Vite, TypeScript, dan Tailwind CSS v4.

---

## 🌟 Fitur & Keunggulan Frontend

- **Arsitektur Komponen Modular**:
  - Halaman `Dashboard.vue` dirombak dari 3.100+ baris menjadi ~360 baris sebagai koordinator data reaktif yang bersih.
  - Komponen tampilan mandiri di `src/components/` (`Navbar`, `HeroBalanceCard`, `SavingsSection`, `BudgetSection`, `TransactionSection`, `MobileBottomNav`).
  - 12 modal dialog terpisah di `src/components/modals/`.
- **Pengalaman Pengguna (UX) Ramah Mobile**:
  - *Mobile Bottom Navigation* (`md:hidden`) untuk akses cepat dengan ibu jari (*thumb-friendly*): Ringkasan, Anggaran, Tabungan, Transaksi, dan Simulator.
  - *Smooth scroll* otomatis saat berpindah tab seksi.
  - Indikator *Loading Skeleton* beranimasi pulse saat mengambil data dari server.
  - *Interactive Empty States* dengan tombol aksi (*Call-to-Action*) saat data belum ada.
- **Ketahanan Jaringan & Aksesibilitas**:
  - Axios response interceptor untuk menangani `401 Unauthorized` (sesi habis) secara elegan dengan pengalihan aman ke halaman Login.
  - Penutupan modal dan dialog secara otomatis saat menekan tombol `Escape` atau mengeklik area backdrop.
- **Sistem Desain D-010**:
  - Implementasi token palet warna: Hijau Hutan (`#183D2B`), Lime (`#B8DF38`), Kartu Putih (`#FFFFFF`), Teks Gelap Kontras (`#202820`), dan Latar Kanvas (`#F3F5EF`).

---

## 📂 Struktur Komponen Frontend

```text
src/
├── api/
│   ├── axios.ts                  # Instance Axios + 401 Interceptor
│   └── services.ts               # Typed API client methods & interfaces
├── components/
│   ├── Navbar.vue                # Navigasi atas, timezone, & desktop actions
│   ├── MobileBottomNav.vue       # Navigasi bawah mobile (5 tab)
│   ├── HeroBalanceCard.vue       # Kartu saldo utama & status uang bebas
│   ├── SavingsSection.vue        # Seksi dana darurat & grid target impian
│   ├── BudgetSection.vue         # Seksi pemantauan anggaran 50/30/20
│   ├── TransactionSection.vue    # Daftar & filter transaksi
│   └── modals/                   # 12 Modal Dialog Terpisah
│       ├── ProfileModal.vue
│       ├── TransactionModal.vue
│       ├── EditTransactionModal.vue
│       ├── CancelTransactionModal.vue
│       ├── ManageCategoriesModal.vue
│       ├── BudgetPolicyModal.vue
│       ├── MonthEndReviewModal.vue
│       ├── SaveModal.vue
│       ├── ReleaseModal.vue
│       ├── AddGoalModal.vue
│       ├── GoalSharesModal.vue
│       └── SimulationModal.vue
├── pages/
│   ├── Dashboard.vue             # Dashboard orchestrator (~360 lines)
│   └── Login.vue                 # Halaman login & register
├── stores/
│   └── auth.store.ts             # Pinia state untuk token & profil user
├── utils/
│   └── format.ts                 # formatRupiah & formatDate
├── style.css                     # Tailwind 4 configuration & token palet
└── main.ts                       # App entry point
```

---

## 🚀 Menjalankan Frontend

### 1. Instalasi Dependensi
```bash
npm install
```

### 2. Environment Variables
Buat file `.env` berdasarkan `.env.example`:
```env
VITE_API_URL=http://localhost:3001
```

### 3. Menjalankan Server Development
```bash
npm run dev
```
Aplikasi akan aktif di `http://localhost:5173`.

### 4. Build Produksi & Type-Check
```bash
npm run build
```
Menjalankan pemeriksaan tipe komprehensif (`vue-tsc -b`) dan bundler Vite.
