# Menjalankan Nalara API di VPS dengan Docker

Dokumen ini hanya untuk backend NestJS dan SQLite. Frontend Vue/Vite dapat dideploy terpisah ke Vercel setelah API memiliki domain HTTPS.

## Sebelum mulai

- Gunakan satu instance service `api`. Proses transaksi berulang berjalan di dalam NestJS; menjalankan beberapa replika dapat memproses jadwal yang sama lebih dari sekali.
- Pastikan Docker dan Docker Compose tersedia, serta reverse proxy HTTPS di VPS sudah diketahui konfigurasinya.
- `compose.yaml` hanya mengikat port API ke `127.0.0.1:3001`. Reverse proxy yang berjalan di host dapat meneruskan trafik ke port ini. Jika reverse proxy juga berada di Docker, sambungkan kedua service melalui jaringan Docker yang sesuai sebelum membuka akses publik; jangan mengubah port API menjadi terbuka ke seluruh internet hanya untuk mengatasi koneksi proxy.
- Database produksi memakai `file:/data/finance.db`. Named volume `nalara_sqlite` menjaga file tersebut tetap ada saat container diganti. Jangan memasang volume di `/app/prisma`, karena itu akan menutupi schema dan file migrasi yang ada di image.

## Konfigurasi dan startup pertama

Jalankan perintah berikut dari direktori `finance-api`:

```bash
cp production.env.example .env.production
# Isi .env.production dengan JWT_SECRET acak minimal 32 karakter,
# GOOGLE_CLIENT_ID, dan FRONTEND_ORIGINS yang sesuai.
docker compose build api
docker compose run --rm --no-deps api sh -c "sqlite3 /data/finance.db 'PRAGMA user_version;' >/dev/null && npx prisma migrate deploy"
docker compose up -d api
docker compose ps
curl --fail http://127.0.0.1:3001/
```

Jangan menaruh secret produksi di repo. `FRONTEND_ORIGINS` berisi origin frontend lengkap, misalnya `https://app.example.com`, tanpa path atau garis miring di akhir. `DATABASE_URL`, `NODE_ENV`, dan `PORT` sudah diatur oleh Compose. Perintah `sqlite3` membuat file database kosong pada volume baru sebelum Prisma bermigrasi; ia aman untuk file database yang sudah ada, tetapi **jangan gunakan volume berisi data lama tanpa memastikan sumbernya**. Jangan menjalankan `prisma migrate dev`, `prisma db push`, atau seed demo pada database produksi. Migrasi produksi dijalankan secara eksplisit dengan `prisma migrate deploy` sebelum API menerima trafik.

### Jika membawa database SQLite lama

Riwayat migrasi lama belum mencakup semua perubahan skema. Migrasi `20260928000000_sync_schema_for_deployment` melengkapinya dan mempertahankan baris yang sudah ada. **Backup database terlebih dahulu**, lalu jalankan `prisma migrate deploy` pada salinan database di staging dan uji data serta fungsi utama sebelum menjalankannya pada database produksi.

Ada kemungkinan database lama sudah memiliki skema terbaru karena sebelumnya memakai `prisma db push`, tetapi riwayat migrasinya belum mencatat migrasi baru. Dalam keadaan ini, menjalankan migrasi baru akan gagal karena tabel atau kolom sudah ada. Bandingkan database tersebut dengan `prisma/schema.prisma` menggunakan `prisma migrate diff --from-url <URL_DATABASE> --to-schema-datamodel prisma/schema.prisma --exit-code` pada salinan. **Hanya jika hasilnya `No difference detected`**, tandai migrasi tersebut sebagai sudah diterapkan dengan `prisma migrate resolve --applied 20260928000000_sync_schema_for_deployment`, kemudian periksa `prisma migrate status`. Jangan menandai migrasi sebagai diterapkan hanya agar pesan error hilang; jika masih ada perbedaan skema, hentikan deploy dan periksa jalur migrasinya.

Setelah API sehat, atur reverse proxy ke API dan pasang HTTPS. Baru kemudian arahkan `VITE_API_URL` frontend Vercel ke domain API, serta tambahkan domain frontend yang benar pada pengaturan Google OAuth. Uji CORS, registrasi, login email dan Google, transaksi, dan transaksi berulang pada lingkungan produksi.

## Backup

Saat API sedang berjalan:

```bash
bash scripts/backup-sqlite.sh
```

Script memakai fasilitas `.backup` SQLite agar menghasilkan snapshot database yang konsisten, memeriksa integritasnya, lalu menyalinnya ke `finance-api/backups/`. Direktori itu diabaikan Git, tetapi **masih berada di VPS yang sama**. Salin hasilnya ke penyimpanan lain di luar VPS dan atur retensi serta pengujian pemulihan secara berkala. Jangan mengandalkan `docker cp` langsung terhadap file database aktif sebagai satu-satunya metode backup.

Sebelum memperbarui aplikasi, jalankan backup dan pastikan salinan di luar VPS tersedia. Untuk menguji pemulihan, gunakan salinan backup pada volume atau lingkungan *staging* yang terpisah. Jangan menimpa `/data/finance.db` produksi saat API masih berjalan.

## Pembaruan aplikasi

Setelah kode baru tersedia di VPS, dari direktori `finance-api`:

```bash
bash scripts/backup-sqlite.sh
docker compose build api
docker compose stop api
docker compose run --rm --no-deps api npx prisma migrate deploy
docker compose up -d --no-deps api
docker compose ps
```

Jika migrasi gagal, jangan langsung menjalankan versi lama terhadap database yang mungkin sudah berubah. Periksa log dan rencana pemulihan dari backup dahulu. `docker compose down` tidak menghapus named volume, tetapi **`docker compose down -v` akan menghapusnya**; jangan gunakan opsi `-v` pada deployment ini.

## Pemeriksaan awal setelah deploy

- `docker compose ps` menunjukkan service `api` sehat.
- `curl --fail http://127.0.0.1:3001/` berhasil dari VPS.
- Domain API HTTPS dapat diakses melalui reverse proxy, tanpa mengekspos port 3001 secara langsung.
- Registrasi, login, Google OAuth, pencatatan transaksi, dan pembacaan ulang data setelah restart container berhasil.
- Backup terbaru berhasil dibuat, disalin ke luar VPS, dan pernah diuji pulih.
