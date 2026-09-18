# ⚙️ Finance API (Backend Service)

RESTful backend service untuk **Project-Keuangan**, dibangun menggunakan NestJS 11, Prisma ORM dengan SQLite, dan TypeScript.

---

## 🌟 Modul & Fungsionalitas Utama

- **`AuthModule`**: Registrasi pengguna, hashing password bcrypt, login JWT, dan proteksi rute via `JwtAuthGuard`.
- **`FinanceProfileModule`**: Pengaturan profil finansial pengguna, saldo awal (*initial balance*), pengeluaran pokok bulanan referensi, dan preferensi zona waktu (IANA).
- **`IncomeSourcesModule` & `CategoriesModule`**: Manajemen sumber pemasukan (Gaji, Freelance, dll) dan kategori pengeluaran (Kebutuhan vs Keinginan) dengan proteksi pengarsipan.
- **`BudgetPoliciesModule`**: Konfigurasi kebijakan anggaran fleksibel (default 50% Kebutuhan, 30% Tabungan, 20% Keinginan) dan kemampuan override per sumber pemasukan.
- **`TransactionsModule`**: Pencatatan pemasukan dan pengeluaran aktual dengan validasi tipe, relasi alokasi, serta jejak audit (*audit reason*) saat pembaruan dan pembatalan transaksi (*soft cancel*).
- **`SavingsGoalsModule` & `AllocationsModule`**: Pengelolaan Dana Pengaman (Darurat) dan Target Impian (Beli Lunas / DP), eksekusi penyisihan otomatis 60/40, penyesuaian bobot target (*goal shares*), dan pelepasan alokasi (*release*).
- **`ReportsModule`**: Laporan ringkasan saldo aktual, total uang belum disisihkan, realisasi anggaran bulanan, dan deteksi konsumsi saldo lama.
- **`SimulationsModule`**: Simulator kalkulator *read-only* (tanpa memutasi saldo) untuk proyeksi target impian berinflasi majemuk dan kalkulator cicilan KPR anuitas bertahap (Fixed ➡️ Floating + analisa DSR).

---

## 🗄️ Model Data (Prisma SQLite)

- Nominal moneter disimpan menggunakan tipe `BigInt` pada SQLite dan diserialisasikan secara otomatis menjadi JSON string oleh `BigIntInterceptor` untuk mencegah hilangnya presisi angka di JavaScript.
- Skema data utama:
  - `User`, `FinanceProfile`
  - `IncomeSource`, `Category`
  - `BudgetPolicy`, `BudgetSourceOverride`
  - `SavingsGoal`, `AllocationLedger`
  - `Transaction` (mendukung `auditReason`, `status: ACTIVE | CANCELLED`, dan `allocatedNeeds/Savings/Wants`)

---

## 🚀 Menjalankan Backend

### 1. Instalasi Dependensi
```bash
npm install
```

### 2. Environment Variables
Buat file `.env` berdasarkan `.env.example`:
```env
PORT=3001
DATABASE_URL="file:./dev.db"
JWT_SECRET=super-secret-jwt-key-finance-project-min-32-chars
```

> [!IMPORTANT]
> `JWT_SECRET` wajib memiliki panjang minimal 32 karakter. NestJS akan menolak startup jika variabel ini tidak ada atau kurang dari 32 karakter.

### 3. Migrasi Database
```bash
# Menjalankan migrasi Prisma ke file SQLite lokal (prisma/dev.db)
npx prisma migrate dev
```

### 4. Menjalankan Server
```bash
# Mode development dengan hot reload
npm run start:dev

# Mode produksi
npm run build
npm run start:prod
```

---

## 🧪 Testing & Verifikasi

```bash
# Menjalankan seluruh Unit Tests (8 test suites, 18 tests)
npm test -- --runInBand

# Menjalankan E2E Tests (menggunakan temporary in-memory/temp SQLite database)
npm run test:e2e -- --runInBand

# Menjalankan type-check dan build kompilasi NestJS
npm run build
```

---

## 📡 Daftar Endpoint API

| Method | Endpoint | Keterangan |
|:---|:---|:---|
| `POST` | `/auth/register` | Mendaftarkan user baru |
| `POST` | `/auth/login` | Login user & memperoleh access token JWT |
| `GET` | `/finance-profile` | Mengambil profil saldo awal & zona waktu |
| `PUT` | `/finance-profile` | Memperbarui profil saldo awal & pengeluaran referensi |
| `GET` | `/income-sources` | Daftar sumber pemasukan aktif |
| `POST` | `/income-sources` | Membuat sumber pemasukan baru |
| `GET` | `/categories` | Daftar kategori pengeluaran (Kebutuhan / Keinginan) |
| `POST` | `/categories` | Membuat kategori pengeluaran baru |
| `GET` | `/budget-policies/current` | Mengambil kebijakan anggaran aktif |
| `POST` | `/budget-policies` | Mengubah kebijakan anggaran & override per sumber |
| `GET` | `/transactions` | Filter transaksi (bulan, tahun, tipe, status) |
| `POST` | `/transactions` | Mencatat transaksi pemasukan atau pengeluaran baru |
| `PATCH` | `/transactions/:id` | Koreksi transaksi dengan alasan audit wajib |
| `DELETE` | `/transactions/:id` | Pembatalan lunak transaksi dengan alasan audit wajib |
| `GET` | `/savings-goals` | Mengambil daftar target impian dan dana pengaman |
| `POST` | `/savings-goals` | Membuat target impian baru (Beli Lunas / DP) |
| `PATCH` | `/savings-goals/shares` | Mengatur bobot pembagian antar target impian |
| `POST` | `/allocations/allocate` | Menyisihkan uang ke tabungan (60/40 default) |
| `POST` | `/allocations/release` | Melepaskan alokasi dana kembali ke saldo bebas |
| `GET` | `/reports/summary` | Ringkasan saldo utama, tabungan, dan uang bebas |
| `GET` | `/reports/monthly` | Laporan realisasi anggaran dan konsumsi saldo lama |
| `POST` | `/simulations/goal` | Simulasi proyeksi target impian berinflasi tahunan majemuk |
| `POST` | `/simulations/mortgage` | Simulasi KPR anuitas bunga bertahap (Fixed ➡️ Floating) |