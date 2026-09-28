# Project-Keuangan — Nalara

Nalara adalah aplikasi keuangan pribadi untuk mencatat pemasukan dan pengeluaran, memahami anggaran, serta merencanakan tabungan dan target. Repositori ini berisi frontend Vue dan backend NestJS dengan database SQLite.

## Fitur

- **Pencatatan keuangan:** transaksi, kategori, sumber pemasukan, dompet, dan riwayat perubahan.
- **Anggaran:** pembagian pemasukan untuk kebutuhan, keinginan, dan tabungan yang dapat disesuaikan.
- **Rencana keuangan:** dana pengaman, target impian, penyisihan dana, dan evaluasi akhir bulan.
- **Simulasi:** perkiraan pencapaian target serta cicilan KPR. Hasil simulasi tidak mengubah data keuangan pengguna.
- **Akses akun:** pendaftaran dan login dengan email-kata sandi; login Google tersedia jika dikonfigurasi.

## Teknologi

| Bagian | Teknologi |
| --- | --- |
| Frontend | Vue 3, TypeScript, Vite, Tailwind CSS, Pinia |
| Backend | NestJS, TypeScript, Prisma |
| Database | SQLite |
| Autentikasi | JWT aplikasi, Google Identity Services untuk login Google |

## Menjalankan secara lokal

Siapkan Node.js dan npm, lalu jalankan backend dan frontend pada dua terminal terpisah. Masing-masing memiliki `package-lock.json`, sehingga contoh di bawah menggunakan `npm ci`.

**Terminal 1 — backend**

```bash
cd finance-api
cp .env.example .env
npm ci
npx prisma migrate dev
npm run start:dev
```

Sebelum menjalankan backend, ganti `JWT_SECRET` di `finance-api/.env` dengan nilai acak sepanjang minimal 32 karakter. API berjalan di `http://localhost:3001`.

**Terminal 2 — frontend**

```bash
cd finance-frontend
cp .env.example .env
npm ci
npm run dev
```

Frontend berjalan di `http://localhost:5173`. Buka `/` untuk landing page, `/login` untuk masuk atau mendaftar, dan `/dashboard` untuk menggunakan aplikasi setelah login. Data SQLite lokal tersimpan di `finance-api/prisma/finance.db` sesuai contoh konfigurasi.

Jika sudah memiliki database lokal lama dan Prisma meminta *reset* saat migrasi, jangan setujui sebelum memeriksa skemanya. Database yang dahulu diperbarui dengan `prisma db push` mungkin sudah memiliki struktur terbaru tanpa catatan migrasi yang sesuai; lihat [panduan database lama](finance-api/DEPLOYMENT.md#jika-membawa-database-sqlite-lama).

### Konfigurasi Google login

Login email-kata sandi tetap dapat digunakan tanpa konfigurasi Google. Untuk mengaktifkan login Google:

1. Buat OAuth Client ID bertipe **Web application** di Google Cloud dan tambahkan origin frontend, misalnya `http://localhost:5173`, ke *Authorized JavaScript origins*.
2. Isi Client ID yang sama pada `GOOGLE_CLIENT_ID` di `finance-api/.env` dan `VITE_GOOGLE_CLIENT_ID` di `finance-frontend/.env`.
3. Mulai ulang kedua server setelah mengubah konfigurasi.

Jangan memasukkan client secret atau nilai `JWT_SECRET` ke variabel frontend yang berawalan `VITE_`.

## Pengujian

```bash
cd finance-api
npm test -- --runInBand
npm run test:e2e -- --runInBand
npm run build
```

```bash
cd finance-frontend
npm run build
```

Build frontend juga menjalankan pemeriksaan tipe melalui `vue-tsc`.

## Deployment

Backend memiliki konfigurasi Docker Compose untuk satu instance API dengan volume SQLite persisten. Panduan environment produksi, migrasi, backup, reverse proxy, dan pembaruan ada di [finance-api/DEPLOYMENT.md](finance-api/DEPLOYMENT.md). Frontend dapat dideploy terpisah; URL API-nya diatur melalui `VITE_API_URL` saat build. Jangan menggunakan database pengembangan atau menjalankan `prisma migrate dev` pada produksi.

## Struktur repositori

```text
finance-api/       Backend, skema dan migrasi Prisma, Docker Compose
finance-frontend/  Aplikasi Vue, halaman publik, dan dashboard
docs/              Rencana, keputusan, dan catatan pekerjaan
CONTEXT.md         Istilah dan konsep keuangan yang digunakan proyek
```

Dokumentasi lebih rinci tersedia di [README backend](finance-api/README.md), [README frontend](finance-frontend/README.md), dan [CONTEXT.md](CONTEXT.md).
