# Konteks proyek

Status: Seluruh Tahap 1, 2, 3, 4, dan 5 (Penyatuan UX & Modularisasi Komponen) telah 100% selesai diimplementasikan dan terverifikasi. Keputusan yang disepakati berada di [DECISIONS.md](DECISIONS.md); rincian tugas aktif berada di [tugas planning](tasks/planning-keuangan-pribadi.md) dan [rencana implementasi versi pertama](tasks/rencana-implementasi-v1.md).

## Tujuan dan pengguna

- Nama kerja: Project-Keuangan; aplikasi pengelolaan keuangan pribadi.
- Pengguna utama: pemilik proyek. Dukungan pengguna lain belum dibahas.
- Tujuan: mencatat arus uang, mengontrol anggaran, membangun dana pengaman, dan memproyeksikan target tabungan dengan kenaikan harga.
- Batas awal: satu Saldo utama; cakupan implementasi lengkap masih dibahas.

## Alur dan istilah penting

- Glosarium domain kanonis berada di [`CONTEXT.md`](../../CONTEXT.md). Gunakan istilah tersebut pada rencana, interface, UI, dan kode.
- Saldo utama: total uang yang dicatat tanpa pemisahan rekening, tunai, atau e-wallet.
- Alokasi anggaran: rencana penggunaan uang; tidak otomatis membuktikan uang telah disisihkan.
- Dana pengaman: uang untuk kondisi darurat atau terhentinya pemasukan, terpisah dari dana target impian.
- Target impian: tujuan seperti rumah atau kendaraan dengan dana tersendiri dan proyeksi pencapaian.
- Lokasi uang dan tujuan uang merupakan konsep berbeda; pemisahan tujuan tetap berlaku pada satu Saldo utama.

## Navigasi kode dan teknologi

- `finance-api/src/`: backend NestJS, termasuk modul `auth`, `finance-profile`, `income-sources`, `budget-policies`, `transactions`, `reports`, `savings-goals`, `allocations`, dan `simulations`. Berjalan di port `3001` (dikonfigurasi via `.env`).
- `finance-api/prisma/schema.prisma`: model data Prisma SQLite untuk profil, anggaran, transaksi, Dana tujuan, dan allocation ledger. Nominal moneter menggunakan tipe `BigInt` dengan serialisasi JSON string otomatis.
- `finance-frontend/src/`: frontend Vue 3 + Vite, Tailwind 4 (`@tailwindcss/vite`), token desain D-010 di `src/style.css`, halaman `Login.vue` dan `Dashboard.vue`, API client di `src/api/services.ts`.
- Stack/dependency dan command: `finance-api/package.json`, `finance-frontend/package.json`.
- Pendekatan styling disepakati: Tailwind 4 utility classes dengan token palet D-010, mobile-first responsif.

## Referensi desain

- Mobile-first dengan dukungan laptop disepakati pengguna; lihat D-009.
- Palet disepakati di D-010: hijau gelap `#183D2B` sebagai kartu saldo utama/identitas, lime `#B8DF38` untuk aksi utama dan pilihan aktif, latar `#F3F5EF`, kartu putih `#FFFFFF`, teks `#202820`. Biru dan peach untuk aksen badge/status.
- Dashboard memuat Hero Card Saldo Utama, Panel Kontrol Anggaran Bulanan (batas vs realisasi, progress bar Kebutuhan/Keinginan, indikator over-budget, peringatan penggunaan saldo lama), modal kebijakan anggaran, modal tinjauan akhir bulan, modal transaksi, filter riwayat transaksi, koreksi transaksi, dan pembatalan transaksi dengan jejak revisi.

## Lingkungan dan batas penting

- Backend API aktif di `http://localhost:3001`, frontend Vite dev server aktif di port lokal.
- Integrasi bank belum disepakati; asumsi kenaikan harga diisi manual per target tanpa integrasi inflasi otomatis untuk versi pertama (D-012).
- Saldo awal, alokasi tabungan, dan transaksi dibedakan agar uang tidak dihitung dua kali (D-004, D-011).

## Pemeliharaan konteks
 
- Terakhir dicocokkan dengan kode: 2026-09-17; Seluruh Tahap (Tahap 1, 2, 3, 4, dan 5: Penyatuan UX & Modular Component) selesai diimplementasikan dan terverifikasi penuh.
- Backend: 18 unit test lulus, 3 E2E test scenarios lulus, production build lulus.
- Frontend: Dashboard.vue berhasil direfaktor dari 3100+ baris menjadi ~360 baris modular, mobile bottom nav aktif, loading skeletons, empty states, keyboard a11y, dan production build lulus tanpa error typecheck.
 
Perbarui hanya bagian yang terdampak perubahan. Aturan umum dan kewenangan Git berada di [RULES.md](RULES.md).
