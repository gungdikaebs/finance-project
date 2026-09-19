# 📘 Spesifikasi Teknis & Roadmap Perbaikan Project-Keuangan (AI-Executable Spec)

Dokumen ini adalah panduan teknis, arsitektur, dan rencana implementasi rinci (*Product Requirements Document* & *Technical Design Document*) yang dirancang secara terstruktur agar dapat dipahami dan dieksekusi secara presisi oleh AI coding agent maupun pengembang perangkat lunak.

---

## 🏛️ 1. Fondasi Arsitektur & Aturan Domain (Domain Constraints)

Sebelum mengeksekusi revisi fitur apa pun, setiap AI agent **wajib** mematuhi batasan domain yang telah ditetapkan pada `CONTEXT.md` dan `DECISIONS.md`:

1. **Integritas Moneter & Presisi Numerik**:
   - Seluruh nilai moneter pada database SQLite/Prisma disimpan dalam format `BigInt` (misal: Rp 1.500.000 disimpan sebagai `1500000n`). Tidak diperbolehkan menggunakan tipe data floating point (`Float`) untuk saldo atau nominal transaksi.
   - Pada API responses, `BigInt` diserialisasi menjadi `string` untuk mencegah hilangnya presisi di runtime JavaScript client.
   - Rasio persentase disimpan dalam *basis points* (`Int`), di mana `10000` = `100.00%` (misal 50% = 5000, 30% = 3000, 20% = 2000).
2. **Prinsip Saldo Utama (D-003, D-004, D-005)**:
   - **Saldo Utama**: Total kas riil aktual (`mainBalance`).
   - **Dana Tersisih (Tabungan)**: Bagian dari saldo utama yang ditandai untuk Dana Pengaman (`EMERGENCY`) atau Target Impian (`PURCHASE`). Penyisihan **bukan** pengeluaran riil dan **tidak** mengubah Saldo Utama.
   - **Uang Belum Disisihkan**: `mainBalance - totalAllocatedSavings`. Ini adalah kas bebas yang boleh dibelanjakan.
   - **Pelepasan Alokasi**: Mengembalikan dana tersisih kembali ke uang belum disisihkan tanpa mengubah saldo fisik.
3. **Audit Trail & Keamanan Data Transaksi**:
   - Pembatalan transaksi menggunakan metode *Soft Cancel* (`status = CANCELLED`) dengan `cancelledAt` dan `cancelReason`. Hard delete tidak diizinkan.
   - Koreksi transaksi mencatat relasi riwayat revisi pada model `TransactionRevision`.
4. **Desain & Palet Warna (D-010)**:
   - Identitas & Kartu Saldo: Hijau Gelap Hutan (`#183D2B`).
   - Aksi Utama & Active State: Lime Segar (`#B8DF38`).
   - Background Kanvas: Abu Hangat (`#F3F5EF`).
   - Kartu Konten & Modal: Putih Bersih (`#FFFFFF`).
   - Teks Utama: Gelap Kontras Tinggi (`#202820` / `#18221B`).

---

## 📋 2. Rincian Spesifikasi Teknis Perbaikan (Detail per Modul)

---

### Modul 1: Onboarding Wizard & Guided Setup (First-Time User Experience)

#### 1.1 Masalah & Kebutuhan Pengguna
Pengguna yang baru mendaftar langsung melihat dashboard dengan nilai serba Rp 0 atau saldo bawaan tanpa memahami alur aplikasi. Pengguna tidak mengetahui apa perbedaan Saldo Awal, Dana Pengaman, Uang Belum Disisihkan, dan bagaimana rumus 50/30/20 bekerja.

#### 1.2 Perubahan Skema Database (Prisma)
Tambahkan kolom penanda status onboarding pada `FinanceProfile`:
```prisma
model FinanceProfile {
  // Field eksisting ...
  isOnboardingCompleted Boolean  @default(false)
  onboardingStep        Int      @default(1)
}
```

#### 1.3 Spesifikasi Backend (NestJS)
- **Endpoint**: `PATCH /finance-profile/onboarding`
- **Payload DTO (`UpdateOnboardingDto`)**:
  ```typescript
  export class UpdateOnboardingDto {
    @IsOptional() @IsBoolean() isOnboardingCompleted?: boolean;
    @IsOptional() @IsInt() @Min(1) @Max(5) onboardingStep?: number;
    @IsOptional() @IsString() initialBalance?: string;
    @IsOptional() @IsString() monthlyNeeds?: string;
    @IsOptional() @IsInt() @Min(1) @Max(24) emergencyMonthsTarget?: number;
  }
  ```
- **Business Logic**:
  Jika `initialBalance` diisi saat wizard selesai, buat otomatis transaksi saldo awal atau update profil keuangan `initialBalance`, serta siapkan Dana Pengaman (`SavingsGoal` tipe `EMERGENCY`) dengan target bulan yang dipilih.

#### 1.4 Spesifikasi Frontend (Vue 3)
- **Komponen Baru**: `finance-frontend/src/components/modals/OnboardingWizardModal.vue`
- **Alur Interaktif (5 Step Modal)**:
  1. *Step 1 - Selamat Datang*: Penjelasan singkat filosofi "Satu Saldo Utama" dan sistem anti-kebocoran uang.
  2. *Step 2 - Input Saldo Awal*: Input nominal uang riil yang saat ini dimiliki (di bank, e-wallet, dompet tunai).
  3. *Step 3 - Estimasi Kebutuhan Pokok*: Input kebutuhan hidup bulanan (makan, sewa/kost, tagihan). Menjadi dasar perhitungan Dana Pengaman.
  4. *Step 4 - Setup Dana Pengaman*: Pilihan target ketahanan (misal: 3 bulan, 6 bulan, atau 12 bulan).
  5. *Step 5 - Konfirmasi Rasio Anggaran*: Preview rasio 50% Kebutuhan, 30% Tabungan, 20% Keinginan.
- **Trigger**: Dashboard memeriksa `profile.isOnboardingCompleted`. Jika `false`, tampilkan modal dengan backdrop terkunci (`backdrop-blur-md`, tidak dapat ditutup dengan klik luar sebelum selesai atau menekan tombol "Lewati untuk sekarang").

---

### Modul 2: Template Kategori & Sumber Pemasukan Default (Zero-Setup Seeding)

#### 2.1 Masalah & Kebutuhan Pengguna
Saat pengguna baru selesai registrasi, daftar kategori kosong. Ketika pengguna ingin mencatat transaksi pertama, mereka terhambat karena harus masuk ke menu pengaturan kategori terlebih dahulu.

#### 2.2 Spesifikasi Backend (NestJS)
- **File**: `finance-api/src/auth/auth.service.ts` atau handler registrasi pengguna (`register`).
- **Data Template Default**:
  Saat user berhasil registrasi, otomatis sisipkan daftar record default ke database:
  1. **Sumber Pemasukan (`IncomeSource`)**:
     - `Gaji Pokok`
     - `Freelance / Proyek Sampingan`
     - `Investasi / Pasif`
  2. **Kategori Pengeluaran Kebutuhan (`Category`, type: `expense`, group: `NEED`)**:
     - `Makanan & Minuman Pokok`
     - `Tempat Tinggal (Sewa / Cicilan)`
     - `Listrik, Air & Internet`
     - `Transportasi Harian & BBM`
     - `Kesehatan & Obat-obatan`
  3. **Kategori Pengeluaran Keinginan (`Category`, type: `expense`, group: `WANT`)**:
     - `Nongkrong & Kuliner Santai`
     - `Belanja Pakaian & Gadget`
     - `Langganan Streaming & Hiburan`
     - `Liburan & Rekreasi`
  4. **Kategori Pemasukan (`Category`, type: `income`)**:
     - `Pemasukan Rutin`
     - `Bonus & THR`
     - `Pendapatan Lain-lain`
  5. **Goal Dana Pengaman Awal (`SavingsGoal`)**:
     - Name: `Dana Pengaman (Darurat)`, Type: `EMERGENCY`, `targetMonths`: 6, `shareRatio`: 6000.

---

### Modul 3: Visualisasi Data Arus Kas & Analitik Grafis (Charts & Trends)

#### 3.1 Masalah & Kebutuhan Pengguna
Data keuangan hanya ditampilkan dalam format tabel angka dan kartu ringkasan teks. Pengguna tidak dapat mengevaluasi tren pengeluaran bulanan, perbandingan rasio realisasi terhadap anggaran, maupun distribusi pengeluaran per kategori secara visual.

#### 3.2 Pemilihan Pustaka & Dependensi
- Gunakan `chart.js` dan wrapper `vue-chartjs`.
  ```bash
  cd finance-frontend && npm install chart.js vue-chartjs
  ```

#### 3.3 Spesifikasi Endpoint Backend (NestJS)
- **Endpoint**: `GET /reports/analytics?year=YYYY&month=M`
- **Output Response Schema**:
  ```typescript
  export interface MonthlyAnalyticsDto {
    incomeVsExpenseTrend: {
      months: string[]; // ["Mei", "Jun", "Jul", "Ags", "Sep", "Okt"]
      incomeData: string[]; // nominal per bulan (string BigInt)
      expenseData: string[];
    };
    categoryDistribution: {
      categoryId: number;
      categoryName: string;
      group: 'NEED' | 'WANT';
      totalAmount: string;
      percentage: number; // e.g. 35.5
      color: string; // hex code unik untuk chart
    }[];
    budgetVsActual: {
      needs: { budget: string; actual: string; variancePercent: number };
      wants: { budget: string; actual: string; variancePercent: number };
      savings: { target: string; allocated: string; achievementPercent: number };
    };
  }
  ```

#### 3.4 Spesifikasi Komponen Frontend (Vue 3)
- **Komponen Baru**: `finance-frontend/src/components/CashflowAnalyticsSection.vue`
- **Tampilan UI**:
  1. **Donut / Pie Chart (Distribusi Pengeluaran)**: Menampilkan proporsi pengeluaran kategori Kebutuhan vs Keinginan dengan palet Emerald, Lime, Slate, dan Rose.
  2. **Bar / Line Chart (Tren 6 Bulan Terakhir)**: Grafik garis ganda membandingkan arus uang masuk vs uang keluar.
  3. **Indikator Rasio Realisasi**: Menampilkan persentase aktual konsumsi pendapatan (misal: "Bulan ini Anda menghabiskan 42% untuk Kebutuhan, 18% untuk Keinginan, 40% Tersimpan").

---

### Modul 4: Proyeksi & Estimasi Cerdas Target Impian (Goal Forecaster)

#### 4.1 Masalah & Kebutuhan Pengguna
Target Impian saat ini hanya menampilkan persentase statis (`currentBalance / targetPrice`). Pengguna tidak mendapatkan wawasan kapan target tersebut akan tercapai jika alokasi tabungan bulanan saat ini dipertahankan, serta tidak ada rekomendasi penyesuaian nominal nabung.

#### 4.2 Logika Matematika & Algoritma Proyeksi
- **Input yang Diketahui**:
  - Saldo saat ini target: $B$ (`currentBalance`)
  - Target harga saat ini: $P_0$ (`priceReference`)
  - Asumsi inflasi tahunan: $r$ (misal 5% = 0.05)
  - Alokasi tabungan bulanan rata-rata yang mengalir ke target ini: $S_{monthly}$
    $$S_{monthly} = \text{Pemasukan Bulanan Rata-rata} \times \text{Rasio Tabungan} \times 40\% \times \text{Share Ratio Target}$$
- **Rumus Harga Masa Depan Berinflasi pada bulan ke-$m$**:
  $$P(m) = P_0 \times \left(1 + \frac{r}{12}\right)^m$$
- **Akumulasi Dana pada bulan ke-$m$**:
  $$A(m) = B + (S_{monthly} \times m)$$
- **Kondisi Tercapai**:
  Cari nilai integer $m$ terkecil di mana $A(m) \ge P(m)$.
  Jika $S_{monthly} \le \text{Kenaikan Harga Bulanan}$, sistem menandai `isUnachievable: true` dan memberikan peringatan bahwa tabungan saat ini kalah cepat dari inflasi.

#### 4.3 Spesifikasi Frontend (Vue 3)
- Modifikasi `SavingsSection.vue` dan card masing-masing target impian:
  - Tampilkan *badge* estimasi waktu: `Tercapai dalam ~14 bulan (Nov 2027)`.
  - Tampilkan rekomendasi top-up: `Nabung ekstra Rp 250.000/bln untuk maju 3 bulan lebih cepat`.
  - Tambahkan milestone badge: `25% Tercapai`, `50% Tercapai`, `75% Tercapai`.

---

### Modul 5: Transaksi Berulang & Pengingat Tagihan (Recurring Transactions)

#### 5.1 Masalah & Kebutuhan Pengguna
Pengguna harus memasukkan pengeluaran rutin setiap bulan secara manual (sewa rumah, internet Indihome, listrik PLN, langganan Netflix/Spotify, gym). Sering terjadi kelupaan yang mengakibatkan pencatatan keuangan tidak akurat.

#### 5.2 Perubahan Skema Database (Prisma)
```prisma
model RecurringTransaction {
  id             Int           @id @default(autoincrement())
  userId         Int
  user           User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  type           String        // 'expense' | 'income'
  amount         BigInt
  categoryId     Int?
  category       Category?     @relation(fields: [categoryId], references: [id])
  incomeSourceId Int?
  incomeSource   IncomeSource? @relation(fields: [incomeSourceId], references: [id])
  frequency      String        // 'WEEKLY' | 'MONTHLY' | 'YEARLY'
  interval       Int           @default(1) // tiap 1 bulan, tiap 2 minggu, dst
  dayOfExecution Int           // tanggal 1 s.d. 31
  startDate      DateTime
  endDate        DateTime?
  lastExecutedAt DateTime?
  nextRunDate    DateTime
  isActive       Boolean       @default(true)
  note           String?

  createdAt      DateTime      @default(now())
  updatedAt      DateTime      @updatedAt
}
```

#### 5.3 Spesifikasi Backend (NestJS)
- **Modul**: `recurring-transactions/`
- **Cron / Scheduler**: Menggunakan `@nestjs/schedule` untuk evaluasi harian pada pukul `00:05` UTC:
  - Memeriksa `RecurringTransaction` yang aktif dan `nextRunDate <= now()`.
  - Membuat record transaksi baru di tabel `Transaction`.
  - Mengupdate `lastExecutedAt = now()` dan memajukan `nextRunDate` ke periode berikutnya.
- **Endpoints**:
  - `POST /recurring-transactions`: Membuat jadwal transaksi berulang.
  - `GET /recurring-transactions`: Daftar jadwal rutin pengguna.
  - `PATCH /recurring-transactions/:id`: Edit atau jeda (pause/resume).
  - `DELETE /recurring-transactions/:id`: Hapus jadwal.

#### 5.4 Spesifikasi Frontend (Vue 3)
- **Komponen Modal**: `finance-frontend/src/components/modals/RecurringTransactionModal.vue`.
- **UI Indikator**: Widget di dashboard: "Tagihan Mendatang (7 Hari ke Depan)" dengan tombol aksi cepat `Bayar Sekarang` atau `Catat Otomatis`.

---

### Modul 6: Dukungan Akun Penyimpanan Fisik (Sub-Accounts / Multi-Wallets)

#### 6.1 Masalah & Kebutuhan Pengguna
Berdasarkan `D-003`, aplikasi menggunakan satu Saldo Utama gabungan untuk kemudahan. Namun dari evaluasi pengguna riil, pengguna kesulitan mencocokkan saldo fisik di bank BCA, dompet tunai, dan e-wallet (GoPay/ShopeePay) dengan saldo yang tertera di aplikasi saat melakukan rekonsiliasi bulanan.

#### 6.2 Solusi Desain Kompatibel Domain
Tetap pertahankan konsep `Saldo Utama Aktual` sebagai agregasi total moneter, namun tambahkan pembagian wadah fisik (*Wallet / Account Pocket*) di bawahnya tanpa merusak konsep alokasi tabungan D-005.

#### 6.3 Perubahan Skema Database (Prisma)
```prisma
model WalletAccount {
  id            Int           @id @default(autoincrement())
  userId        Int
  user          User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  name          String        // 'BCA Utama', 'Tunai Dompet', 'GoPay'
  type          String        // 'BANK' | 'E_WALLET' | 'CASH' | 'INVESTMENT'
  accountNumber String?
  balance       BigInt        @default(0)
  isArchived    Boolean       @default(false)
  transactions  Transaction[]
  
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt
}
```

#### 6.4 Aturan Bisnis Transfer Antar Akun
- Transfer antar akun (`TRANSFER`):
  - Mengurangi saldo pada `walletAccount` asal dan menambah pada `walletAccount` tujuan.
  - **Dilarang keras** memicu pencatatan pemasukan atau pengeluaran pada laporan anggaran 50/30/20.
  - Total `mainBalance` tetap konstan (tidak berubah sama sekali).

---

### Modul 7: Ekspor Data & Pelaporan Komprehensif (CSV, Excel & PDF)

#### 7.1 Masalah & Kebutuhan Pengguna
Pengguna tidak memiliki kendali untuk mencadangkan data mereka secara mandiri (*data ownership*), mengolah data transaksi di spreadsheet kantor, atau mencetak laporan pertanggungjawaban keuangan keluarga bulanan.

#### 7.2 Spesifikasi Backend (NestJS)
- **Endpoint**:
  - `GET /reports/export/csv?year=YYYY&month=M`
  - `GET /reports/export/excel?year=YYYY&month=M`
  - `GET /reports/export/pdf?year=YYYY&month=M`
- **Format Header CSV / Excel**:
  ```csv
  Tanggal,Tipe,Kategori,Grup Anggaran,Sumber Pemasukan,Nominal (IDR),Catatan,Status,ID Referensi
  2026-09-18,Pemasukan,Gaji Pokok,TABUNGAN 30%,Kantor Utama,3000000,Gaji Bulanan,Aktif,TRX-00124
  ```
- **Implementasi Engine**:
  - Untuk Excel: Pustaka `exceljs`.
  - Untuk PDF: Pustaka `pdfkit` dengan tata letak minimalis resmi palet warna `#183D2B`.

#### 7.3 Spesifikasi Frontend (Vue 3)
- Tambahkan dropdown aksi pada `TransactionSection.vue`:
  - Tombol `Ekspor Data` dengan pilihan: `Unduh CSV`, `Unduh Spreadsheet (.xlsx)`, `Cetak Laporan PDF`.
  - Mengunduh file langsung melalui blob download browser dengan nama file: `Laporan_Keuangan_YYYY_MM.xlsx`.

---

### Modul 8: Penyesuaian Responsivitas Modal Mobile & UX Sentuh (Mobile Polish)

#### 8.1 Masalah & Kebutuhan Pengguna
Pada layar perangkat *smartphone* dengan rasio tinggi terbatas atau saat keyboard virtual aktif:
- Modal panjang (`TransactionModal`, `SimulationModal`, `ManageCategoriesModal`) mengalami *clipping* tombol simpan di bagian bawah.
- *Touch target* beberapa ikon tombol edit/hapus di bawah standar ergonomi jempol (kurang dari 44x44 piksel).

#### 8.2 Checklist Perbaikan UI/CSS (Tailwind CSS v4)
1. **Modal Container Layout**:
   Ganti class wrapper modal dari `max-h-[90vh] overflow-y-auto` menjadi:
   ```html
   <div class="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center p-0 sm:p-4">
     <div class="bg-white rounded-t-3xl sm:rounded-2xl max-h-[92dvh] sm:max-h-[85vh] flex flex-col shadow-2xl">
       <!-- Header (shrink-0) -->
       <!-- Content Body (overflow-y-auto flex-1 overscroll-contain p-5) -->
       <!-- Footer Action (shrink-0 border-t bg-stone-50/80 p-4) -->
     </div>
   </div>
   ```
2. **Keyboard Virtual Avoidance**:
   Gunakan unit viewport modern `dvh` (*dynamic viewport height*) agar tidak terdorong keluar layar saat software keyboard iOS/Android muncul.
3. **Ergonomi Sentuh**:
   Pastikan setiap tombol aksi minimal memiliki dimensi `min-h-[44px]` dan `min-w-[44px]`.

---

### Modul 9: Mode Gelap Konsisten (High-Contrast Dark Mode)

#### 9.1 Masalah & Kebutuhan Pengguna
Saat digunakan pada malam hari untuk mencatat pengeluaran sebelum tidur, latar belakang putih terang `#F3F5EF` menyilaukan mata pengguna.

#### 9.2 Spesifikasi Palet Mode Gelap (Sesuai D-010)
- **Kanvas Utama**: `#0E1410` (Abu-abu Hutan Gelap Pekat).
- **Kartu Konten / Panel Modal**: `#16201A` (Hijau Hutan Sangat Gelap).
- **Border / Garis Pemisah**: `#243329`.
- **Teks Utama**: `#F0F4F1` (Kontras Tajam).
- **Teks Sekunder**: `#98A79D`.
- **Kartu Saldo Hero**: Gradient `#132E21` ke `#0A1B13` dengan border aksen `#B8DF38/30`.
- **Aksen CTA & Tombol Aktif**: Tetap `#B8DF38` dengan teks hitam `#0E1410`.

#### 9.3 Implementasi State
- Gunakan selector class Tailwind `.dark` pada tag `<html>`.
- Buat Pinia store atau composable `useTheme()` yang membaca preferensi `localStorage.getItem('theme')` dan `window.matchMedia('(prefers-color-scheme: dark)')`.

---

### Modul 10: Penguatan Keamanan & Sesi (Security & Auth Hardening)

#### 10.1 Masalah & Kebutuhan Pengguna
- Tidak ada indikator kekuatan kata sandi saat mendaftar.
- Belum ada pembatasan *rate limiting* untuk serangan *brute force* pada rute `/auth/login`.
- Belum ada mekanisme konfirmasi ulang kata sandi sebelum aksi krusial (seperti reset data keuangan atau hapus akun).

#### 10.2 Spesifikasi Backend (NestJS)
- **Rate Limiting**:
  Pasang `@nestjs/throttler`:
  ```typescript
  ThrottlerModule.forRoot([{
    ttl: 60000,
    limit: 5, // maks 5 percobaan login gagal per menit per IP
  }])
  ```
- **Validasi Password (`RegisterDto`)**:
  ```typescript
  @IsString()
  @MinLength(8, { message: 'Kata sandi minimal 8 karakter' })
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'Kata sandi harus mengandung huruf besar, huruf kecil, dan angka',
  })
  password: string;
  ```

---

## 📅 3. Matriks Prioritas & Urutan Eksekusi AI (Execution Plan)

Setiap tahapan dirancang mandiri (*self-contained*) agar AI agent dapat mengimplementasikan fitur per modul secara bertahap tanpa memutus fungsionalitas sistem yang sedang berjalan.

| Tahap | Modul Fitur | Kompleksitas | Dampak UX | Status | Target File Utama |
|:---|:---|:---:|:---:|:---:|:---|
| **P1** | **Template Kategori & Seeding Otomatis** (Modul 2) | Rendah | Kritis | **SELESAI** | `finance-api/src/auth/`, `prisma/seed.ts` |
| **P1** | **Onboarding Wizard Modal** (Modul 1) | Sedang | Kritis | **SELESAI** | `finance-frontend/src/components/modals/`, `Dashboard.vue` |
| **P1** | **Mobile Modal & Touch Target Refactor** (Modul 8) | Rendah | Tinggi | **SELESAI** | `finance-frontend/src/components/modals/*.vue` |
| **P2** | **Visualisasi Grafik Arus Kas (Chart.js)** (Modul 3) | Sedang | Sangat Tinggi | **SELESAI** | `finance-api/src/reports/`, `CashflowAnalyticsSection.vue` |
| **P2** | **Ekspor Laporan (Excel, CSV, PDF)** (Modul 7) | Sedang | Tinggi | **SELESAI** | `finance-api/src/reports/`, `TransactionSection.vue` |
| **P2** | **Proyeksi Tanggal Target Impian** (Modul 4) | Sedang | Tinggi | **SELESAI** | `SavingsSection.vue`, `SimulationModal.vue`, `savings-goals.*` |
| **P3** | **Transaksi Berulang & Scheduler** (Modul 5) | Tinggi | Tinggi | **SELESAI** | `recurring-transactions/*`, `RecurringTransactionModal.vue` |
| **P3** | **Dukungan Dompet Fisik (Wallet Accounts)** (Modul 6) | Tinggi | Tinggi | **SELESAI** | `prisma/schema.prisma`, `wallets/*`, `HeroBalanceCard.vue`, `modals/*` |
| **P3** | **Mode Gelap (Dark Mode)** (Modul 9) | Sedang | Sedang | **SELESAI** | `style.css`, `useTheme.ts`, `Sidebar.vue`, `MobileMenuModal.vue`, `index.html` |
| **P4** | **Penguatan Keamanan & Rate Limiting** (Modul 10) | Rendah | Fondasi | **SELESAI** | `finance-api/src/auth/`, `app.module.ts`, `Login.vue` |

---

## 🧪 4. Standar Verifikasi & Pengujian Kualitas (Testing & QA)

Sebelum menyatakan bahwa suatu modul perbaikan selesai, AI agent **wajib** melakukan 3 lapisan verifikasi berikut:

1. **Verifikasi Database & Type Safety**:
   ```bash
   cd finance-api && npx prisma validate && npm run build
   cd ../finance-frontend && npm run build # Memastikan vue-tsc 0 error
   ```
2. **Verifikasi Unit & E2E Testing**:
   - Menjalankan suite pengujian API:
     ```bash
     cd finance-api && npm test -- --runInBand
     ```
   - Pastikan tidak ada regresi pada logika perhitungan BigInt D-005 dan simulasi bunga D-008.
3. **Verifikasi Visual Antarmuka (Browser Testing)**:
   - Gunakan browser tool untuk membuka `http://localhost:5173/dashboard`.
   - Pastikan tidak ada pesan error merah pada console log browser.
   - Uji klik tombol utama dan pastikan dialog modal tampil di tengah viewport dengan benar.

---

## 🔬 5. Audit UX Mendalam (Post-Implementation Review)

Berdasarkan inspeksi langsung terhadap kode sumber dan antarmuka live (`http://localhost:5173/dashboard`) setelah implementasi modul sebelumnya, ditemukan **7 (tujuh) isu UX kritis** yang belum tertangani. Isu-isu ini bersifat *runtime behavioral* dan *cognitive friction* — tidak terlihat di kode statis, hanya muncul saat pengguna benar-benar mengoperasikan aplikasi.

Setiap isu di bawah ini **wajib diperbaikan** dan dapat dieksekusi secara mandiri oleh AI agent.

---

### Isu UX-01: Disparitas Saldo Utama vs Wadah Fisik (Kebingungan Mental Model)

#### Masalah
Pada `HeroBalanceCard.vue`, terdapat dua angka saldo yang ditampilkan berdampingan:
- `SALDO UTAMA AKTUAL: Rp 0` (diambil dari `summary.mainBalance = initialBalance + income - expense`).
- `Wadah Fisik (1) → Rekening Utama / Tunai: Rp 5.000.000` (diambil dari `WalletAccount.balance`).

Pengguna melihat dua angka yang berbeda dan bertanya: *"Uang saya sebenarnya Rp 0 atau Rp 5 juta?"* Ini memutus kepercayaan pengguna terhadap akurasi aplikasi.

#### Akar Penyebab
Laporan `mainBalance` dihitung dari `FinanceProfile.initialBalance + sum(income) - sum(expense)` pada `reports.service.ts`. Sementara `WalletAccount.balance` dihitung dari transaksi yang ditautkan langsung ke `walletAccountId`. Saat `ensureDefaultWallet()` membuat dompet default, ia menyalin `currentMainBalance` sebagai saldo awal dompet, tetapi `FinanceProfile.initialBalance` tidak diupdate sinkron. Setelah dompet dibuat, kedua sistem bereputasi secara paralel tanpa rekonsiliasi.

#### Solusi & Spesifikasi Perbaikan
- **Prinsip**: `mainBalance` (Saldo Utama Aktual) **HARUS** selalu sama dengan `SUM(WalletAccount.balance WHERE isArchived = false)`. Tidak boleh ada disparitas.
- **Backend (`reports.service.ts`)**:
  Ubah perhitungan `mainBalance`:
  ```typescript
  // GANTI perhitungan lama:
  // const mainBalance = profile.initialBalance + income - expense;
  
  // MENJADI:
  const wallets = await this.prisma.walletAccount.aggregate({
    where: { userId, isArchived: false },
    _sum: { balance: true },
  });
  const mainBalance = wallets._sum.balance || BigInt(0);
  ```
- **Backend (`wallets.service.ts` — `ensureDefaultWallet`)**:
  Saat membuat dompet default pertama kali, set `FinanceProfile.initialBalance = 0` (karena saldo kini hidup di dompet, bukan di profil). Tambahkan transaksi saldo awal ke dompet default, bukan ke profil.
- **Frontend (`HeroBalanceCard.vue`)**:
  Tambahkan tooltip kecil di sebelah label "Saldo Utama Aktual":
  ```html
  <span class="text-[10px] text-emerald-200/60">= Total gabungan seluruh wadah fisik</span>
  ```

**Prioritas**: 🔴 Kritis (langsung setelah modul 6)

---

### Isu UX-02: Banner Peringatan Anggaran yang Menimbulkan Rasa Bersalah (Guilt-Inducing Alert)

#### Masalah
Pada `BudgetSection.vue` baris 52-63, ketika pengeluaran bulan berjalan melampaui pemasukan baru bulan tersebut (misal: gaji cair tanggal 25, tapi pengeluaran tercatat tanggal 1-24), muncul banner kuning besar:
> *"Peringatan: Menggunakan Saldo Bulan Lalu. Total pengeluaran bulan ini melampaui pemasukan baru yang diterima."*

Banner berwarna amber/oranye dengan ikon `AlertCircle` terlihat seperti peringatan krisis keuangan. Padahal, membelanjakan sisa gaji bulan lalu sebelum tanggal gajian berikutnya adalah perilaku keuangan yang normal dan sehat.

#### Dampak
Pengguna merasa "dituduh tekor/overbudget" oleh aplikasi. Ini memicu rasa bersalah dan resistensi untuk mencatat transaksi secara jujur.

#### Solusi & Spesifikasi Perbaikan
- **Frontend (`BudgetSection.vue`)**:
  Ganti komponen peringatan dari "Alert Kritis" menjadi "Info Netral":
  ```html
  <!-- GANTI class dari amber/rose ke biru/slate netral -->
  <div
    v-if="monthlyReport && BigInt(monthlyReport.consumedPreviousBalance || 0) > 0n"
    class="p-4 bg-blue-50/80 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/40 rounded-xl text-xs text-blue-800 dark:text-blue-200 flex items-start gap-3"
  >
    <Info class="w-5 h-5 text-blue-500 dark:text-blue-400 shrink-0 mt-0.5" :stroke-width="2" />
    <div>
      <span class="font-bold text-blue-900 dark:text-blue-100 block text-xs">
        Arus kas didukung saldo berjalan
      </span>
      <p class="mt-0.5 text-blue-700 dark:text-blue-300/90 leading-relaxed font-normal">
        Pengeluaran bulan ini sebagian menggunakan sisa saldo dari bulan sebelumnya. Ini normal dan tidak memengaruhi saldo total Anda.
      </p>
    </div>
  </div>
  ```
  - Ganti ikon `AlertCircle` menjadi `Info`.
  - Hapus kata "Peringatan" dan ganti dengan "Informasi".
  - Hilangkan warna `amber` (yang berasosiasi dengan bahaya), gunakan `blue` (informatif).

**Prioritas**: 🟡 Tinggi (perbaikan copywriting & emosi UX)

---

### Isu UX-03: Form "Sisihkan ke Tabungan" Mengusulkan 100% Seluruh Uang Bebas

#### Masalah
Pada `SaveModal.vue` baris 44-48, saat modal dibuka, input nominal otomatis terisi dengan **seluruh** `unallocatedMoney` (total uang bebas pengguna).
```typescript
// KODE SAAT INI:
saveAmountInput.value = formatNumberInput(props.unallocatedMoney || '0');
```

Jika pengguna baru menerima gaji Rp 3.000.000 dan anggaran menentukan tabungan 30%, seharusnya sistem merekomendasikan Rp 900.000. Namun form mengusarkan untuk menyisihkan seluruh Rp 3.000.000.

#### Dampak
Jika pengguna asal klik "Simpan", seluruh kas mereka langsung terkunci ke pos tabungan, menyisakan `Uang Belum Disisihkan = Rp 0`. Akibatnya pengguna tidak punya alokasi untuk makan esok hari dan harus melepas alokasi manual — proses yang membingungkan dan memicu frustrasi.

#### Solusi & Spesifikasi Perbaikan
- **Frontend (`SaveModal.vue`)**:
  Ubah default input agar hanya mengusulkan **porsi tabungan** (bukan seluruh uang bebas):
  ```typescript
  watch(
    () => props.show,
    (show) => {
      if (show) {
        // Hitung rekomendasi tabungan (30% dari pemasukan bulan ini, atau default)
        const recommendedSave = props.recommendedSavingAmount || '0';
        saveAmountInput.value = formatNumberInput(recommendedSave);
        updateSavePreview();
      }
    }
  );
  ```
- **Tambahkan Tombol Pilihan Cepat (Quick Fill Buttons)** di bawah input nominal:
  ```html
  <div class="flex gap-2 mt-2">
    <button @click="saveAmountInput = formatNumberInput(recommendedSaving)" class="quick-btn">
      Rekomendasi ({{ formatRupiah(recommendedSaving) }})
    </button>
    <button @click="saveAmountInput = formatNumberInput(halfOfUnallocated)" class="quick-btn">
      50% Sisa
    </button>
    <button @click="saveAmountInput = formatNumberInput(unallocatedMoney)" class="quick-btn">
      Semua ({{ formatRupiah(unallocatedMoney) }})
    </button>
  </div>
  ```
- **Backend (`reports.service.ts`)**:
  Tambahkan field `recommendedSavingAmount` pada response summary, dihitung dari:
  `recommendedSaving = monthlyIncome * (savingsRatio / 10000)`

**Prioritas**: 🔴 Kritis (mencegah pengguna "mengunci" seluruh uangnya secara tidak sengaja)

---

### Isu UX-04: Filter Bulan "Bulan 1" s/d "Bulan 12" (Label Robotik)

#### Masalah
Pada `TransactionSection.vue` baris 114-116, dropdown filter bulan menampilkan opsi sebagai angka ordinal:
```html
<option v-for="m in 12" :key="m" :value="m">
  Bulan {{ m }}
</option>
```
Pengguna manusia mencari berdasarkan nama bulan: "Januari", "Februari", ..., "September". Label "Bulan 9" tidak intuitif dan membutuhkan translasi mental.

#### Solusi & Spesifikasi Perbaikan
- **Frontend (`TransactionSection.vue`)**:
  Ganti opsi dropdown dengan nama bulan dalam Bahasa Indonesia:
  ```html
  <option v-for="(monthName, index) in monthNames" :key="index + 1" :value="index + 1">
    {{ monthName }}
  </option>
  ```
  Tambahkan array nama bulan di `<script setup>`:
  ```typescript
  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  ```

**Prioritas**: 🟢 Cepat (Quick Win, 5 menit perbaikan)

---

### Isu UX-05: Inkonsistensi Terminologi "Uang Bebas"

#### Masalah
Aplikasi menggunakan tiga istilah berbeda untuk konsep yang sama:
1. `HeroBalanceCard.vue`: **"Uang Belum Disisihkan"**
2. `ReleaseModal.vue` baris 96: **"Uang Bebas"**
3. `TransactionSection.vue` baris 291: **"Kas Bebas"**

`CONTEXT.md` hanya mendefinisikan **"Uang belum disisihkan"** sebagai istilah kanonis. Dua variasi lain muncul tidak resmi.

#### Dampak
Pengguna ragu apakah "Uang Belum Disisihkan", "Uang Bebas", dan "Kas Bebas" adalah tiga saldo yang berbeda. Ini memicu kebingungan konseptual tentang arsitektur keuangan aplikasi.

#### Solusi & Spesifikasi Perbaikan
- **Lakukan global search-replace** pada seluruh file `.vue`:
  - Ganti `"Uang Bebas"` → `"Uang Belum Disisihkan"`
  - Ganti `"Kas Bebas"` → `"Uang Belum Disisihkan"`
- **File yang harus diperbaiki**:
  - `finance-frontend/src/components/modals/ReleaseModal.vue` (baris 96)
  - `finance-frontend/src/components/TransactionSection.vue` (baris 291)
  - `finance-frontend/src/components/modals/SaveModal.vue` (jika ada)
  - `finance-frontend/src/components/HeroBalanceCard.vue` (konsistensi label)

**Prioritas**: 🟢 Cepat (Quick Win, konsistensi domain)

---

### Isu UX-06: Tabel Transaksi Horizontal Scroll di Mobile (Bukan Card List)

#### Masalah
Pada `TransactionSection.vue` baris 230-239, riwayat transaksi menggunakan `<table>` HTML tradisional dengan 6 kolom (Tanggal, Keterangan, Sumber, Nominal, Status, Aksi). Pada layar smartphone (< 480px), tabel ini terlalu lebar dan pengguna harus menggeser horizontal (*horizontal scroll*) untuk melihat nominal dan menekan tombol Edit/Batal.

#### Dampak
Ergonomi jempol buruk. Pengguna harus scroll kiri-kanan bolak-balik hanya untuk membaca satu baris transaksi. Ini adalah anti-pattern mobile UX yang paling umum dikeluhkan.

#### Solusi & Spesifikasi Perbaikan
- **Frontend (`TransactionSection.vue`)**:
  Tambahkan blok `v-if` kondisional berdasarkan breakpoint Tailwind:
  ```html
  <!-- Mobile: Card List (di bawah sm) -->
  <div class="sm:hidden divide-y divide-stone-100 dark:divide-[#243329]">
    <div
      v-for="trx in transactions"
      :key="trx.id"
      class="p-4 space-y-2"
      :class="trx.status === 'CANCELLED' ? 'opacity-40' : ''"
    >
      <div class="flex justify-between items-start">
        <div>
          <span class="text-xs font-bold text-[#18221B] dark:text-[#F0F4F1]">
            {{ trx.note || trx.category?.name || 'Transaksi' }}
          </span>
          <p class="text-[10px] text-stone-500 dark:text-[#98A79D] mt-0.5">
            {{ formatDate(trx.date) }} • {{ trx.category?.name }}
          </p>
        </div>
        <span
          class="font-black text-sm tabular-nums"
          :class="trx.typeSnapshot === 'INCOME' ? 'text-emerald-700 dark:text-[#B8DF38]' : 'text-[#18221B] dark:text-[#F0F4F1]'"
        >
          {{ trx.typeSnapshot === 'INCOME' ? '+' : '-' }} {{ formatRupiah(trx.amount) }}
        </span>
      </div>
      <div class="flex justify-end gap-2 pt-1">
        <button @click="emit('openEditTransaction', trx)" class="text-[10px] ...">Edit</button>
        <button @click="emit('openCancelTransaction', trx)" class="text-[10px] ...">Batal</button>
      </div>
    </div>
  </div>
  
  <!-- Desktop: Tabel (sm ke atas) -->
  <div v-if="transactions.length > 0" class="hidden sm:block overflow-x-auto">
    <table class="w-full ...">
      <!-- Tabel lama tetap di sini -->
    </table>
  </div>
  ```

**Prioritas**: 🟡 Tinggi (mobile ergonomi)

---

### Isu UX-07: Modal Menu Mobile Tidak Tertutup Otomatis Saat Navigasi

#### Masalah
Pada `Dashboard.vue` baris 683:
```html
@open-analytics="mobileTab = 'analitik'"
```
Ketika pengguna membuka `MobileMenuModal` dan mengklik "Analitik & Tren", state `mobileTab` berganti, tetapi modal **tetap terbuka** menutupi layar. Pengguna tidak melihat perubahan terjadi dan mengira tombol tidak berfungsi.

#### Solusi & Spesifikasi Perbaikan
- **Frontend (`Dashboard.vue`)**:
  Tutup modal secara eksplisit setiap emit navigasi diterima:
  ```html
  <MobileMenuModal
    ...
    @open-profile="showProfileModal = true; showMobileMenu = false"
    @open-wallets="showManageWalletsModal = true; showMobileMenu = false"
    @open-transfer="showTransferWalletModal = true; showMobileMenu = false"
    @open-manage="showManageModal = true; showMobileMenu = false"
    @open-recurring="showRecurringModal = true; showMobileMenu = false"
    @open-simulator="openSimulator(); showMobileMenu = false"
    @open-month-end-review="openMonthEndReview(); showMobileMenu = false"
    @open-analytics="mobileTab = 'analitik'; showMobileMenu = false"
    @logout="handleLogout"
  />
  ```
  Setiap handler `@open-*` harus diakhiri dengan `; showMobileMenu = false`.

**Prioritas**: 🟢 Cepat (Quick Win, bug interaction)

---

## 📊 6. Ringkasan Prioritas Eksekusi Audit UX

| Isu | Deskripsi | Kompleksitas | Dampak | Status | Target File |
|:---|:---|:---:|:---:|:---:|:---|
| **UX-01** | Sinkronisasi Saldo Utama vs Wadah Fisik | Sedang | 🔴 Kritis | **SELESAI** | `reports.service.ts`, `finance-profile.service.ts`, `HeroBalanceCard.vue` |
| **UX-02** | Banner Anggaran Guilt-Inducing → Info Netral | Rendah | 🟡 Tinggi | **SELESAI** | `BudgetSection.vue` |
| **UX-03** | Default Form Sisihkan 100% → Rekomendasi 30% | Sedang | 🔴 Kritis | **SELESAI** | `SaveModal.vue`, `reports.service.ts`, `Dashboard.vue` |
| **UX-04** | "Bulan 9" → "September" | Rendah | 🟢 Cepat | **SELESAI** | `TransactionSection.vue` |
| **UX-05** | Konsistensi "Uang Belum Disisihkan" | Rendah | 🟢 Cepat | **SELESAI** | `ReleaseModal.vue`, `TransactionSection.vue`, `SaveModal.vue` |
| **UX-06** | Tabel → Card List di Mobile | Sedang | 🟡 Tinggi | **SELESAI** | `TransactionSection.vue` |
| **UX-07** | Modal Mobile Auto-Close pada Navigasi | Rendah | 🟢 Cepat | **SELESAI** | `Dashboard.vue` |

**Urutan Eksekusi yang Disarankan**:
1. UX-04, UX-05, UX-07 (Quick Wins — 15 menit total)
2. UX-02 (Copywriting fix — 10 menit)
3. UX-03 (Save Modal default — 30 menit)
4. UX-06 (Mobile Card List — 45 menit)
5. UX-01 (Sinkronisasi Saldo — 1-2 jam, butuh modifikasi backend)

---

*Bagian 5 (Audit UX) bersifat temuan empiris dari pengujian langsung antarmuka dan wajib dieksekusi setelah Modul 1-10 pada Bagian 2 selesai.*
