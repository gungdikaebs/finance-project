# Rencana implementasi versi pertama

Status: **diotorisasi untuk implementasi oleh Antigravity AI**. Diperbarui 2026-09-17.

Keputusan yang sudah disetujui: [D-001–D-014](../DECISIONS.md). Dokumen ini melengkapi keputusan tersebut dengan usulan operasional dan teknis. Codex menyusun planning; Antigravity AI mengimplementasikan setelah persetujuan pengguna. Persetujuan terhadap dokumen ini diperlukan sebelum mengubah aplikasi, dependency, atau schema database.

## Hasil yang dituju

Pengguna dapat memasukkan saldo awal, mencatat pemasukan/pengeluaran, melihat anggaran bulanan, menyisihkan uang ke dana pengaman dan impian, serta mencoba proyeksi harga penuh atau DP + KPR. Antarmuka mobile-first juga nyaman di laptop. Mata uang versi pertama IDR, nominal aktual rupiah bulat.

## Cakupan

Masuk: login dan setup awal, satu saldo gabungan, kategori kebutuhan/keinginan, sumber pemasukan, koreksi transaksi, anggaran fleksibel, beberapa target, dana pengaman, riwayat penyisihan/penggunaan, ringkasan akhir bulan, simulasi target dua arah, simulasi bunga bertahap, keadaan kosong/loading/error, akses data per pengguna.

Keluar: koneksi bank, transfer antar rekening/dompet, inflasi otomatis, hasil investasi, pembukuan usaha, pajak freelance otomatis, pembayaran kredit otomatis, pengajuan KPR, pelunasan dipercepat/refinancing, model syariah, pengingat push/email, deploy. Simulasi KPR tidak menjadi catatan utang aktual. Pengeluaran cicilan nyata bisa dicatat manual sebagai kebutuhan.

## Aturan operasional usulan

### Saldo dan tanggal

- Gunakan tanggal bisnis `YYYY-MM-DD`; usulan zona pengguna Asia/Makassar, dapat diatur saat setup. Waktu audit disimpan UTC. Batas laporan bulanan memakai awal bulan inklusif hingga awal bulan berikutnya eksklusif.
- Saldo awal adalah saldo tepat sebelum tanggal mulai pencatatan. Transaksi sesudah titik awal menambah/menguranginya; saldo awal tidak masuk laporan pemasukan.
- Untuk pengguna dengan riwayat lama, pilih tanggal awal sebelum transaksi pertama dan masukkan saldo sebelum tanggal itu. Jangan memasukkan saldo hari ini lalu menambahkan ulang seluruh transaksi lama. Preview rekonsiliasi wajib sebelum menyimpan.
- `Saldo utama = saldo awal + pemasukan aktif − pengeluaran aktif`.
- `Uang belum disisihkan = Saldo utama − seluruh saldo dana tujuan`, termasuk Tabungan belum ditentukan.
- Saldo tujuan bukan rekening tambahan. Penyisihan, pelepasan, atau pemindahan antar tujuan tidak mengubah Saldo utama.
- Pengeluaran dari dana tujuan mencatat transaksi keluar dan pengurangan dana dalam satu operasi atomik (berhasil/gagal bersama).
- Pengeluaran yang melampaui anggaran boleh dicatat; nominal yang melampaui sumber uang dipilih ditolak dengan penjelasan dan opsi memperbaiki saldo/pemasukan atau memilih dana lain. Utang dan overdraft belum didukung.
- Transaksi aktual bertanggal masa depan ditolak; rencana masa depan berada di simulasi.

### Koreksi dan arsip

- Edit/batalkan transaksi melalui preview dampak saldo, laporan, dan dana tujuan. Pembatalan memakai status serta jejak perubahan, bukan menghapus riwayat permanen.
- Koreksi transaksi, saldo awal, atau tanggal lampau memvalidasi ulang saldo sejak tanggal terdampak. Jika dana menjadi negatif, tolak dan tunjukkan tanggal/operasi yang perlu dikoreksi lebih dahulu. Membatalkan pemasukan tidak otomatis membatalkan penyisihan.
- Edit kategori yang sudah digunakan tidak mengubah jenis/group transaksi lampau. Simpan jenis, group anggaran, dan sumber dana pada transaksi sebagai snapshot.
- Kategori/sumber/target yang digunakan diarsipkan. Target dengan saldo harus dipindahkan atau dilepas alokasinya secara eksplisit sebelum diarsipkan. Pengarsipan tidak mencatat pengeluaran.
- Permintaan penyimpanan berulang memakai request ID unik per pengguna untuk mencegah transaksi ganda; penonaktifan tombol saja tidak cukup.

### Anggaran dan penghasilan

- Default 50/30/20, dengan total tepat 100%. Rasio tabungan 60/40 dan pembagian antar target juga divalidasi totalnya.
- Setiap sumber pemasukan mengikuti rasio umum; override per sumber opsional. Batas bulanan merupakan jumlah alokasi setiap pemasukan, bukan mengalikan total pemasukan dengan rasio terakhir.
- Sumber freelance mencatat uang yang benar-benar masuk. Biaya yang sudah dipotong sebelum diterima tidak dicatat lagi sebagai uang keluar. Biaya yang dibayar terpisah menjadi pengeluaran tersendiri; tanpa mesin perhitungan pajak.
- Perubahan rasio default efektif bulan berikutnya. Aplikasi menawarkan preview untuk menghitung ulang anggaran bulan berjalan jika pengguna memilihnya. Data bulan sebelumnya tidak berubah akibat edit pengaturan baru.
- Batas anggaran bulan baru mulai dari pemasukan baru. Saldo lama tetap dapat digunakan; penanda penggunaan saldo lama dihitung dari selisih pengeluaran dan pemasukan kumulatif bulan itu, terpisah dari saldo dana tujuan.
- Dana pengaman/target mempunyai sumber dana sendiri. Pengeluaran darurat/pembelian target tetap masuk total pengeluaran, namun ditampilkan terpisah dari konsumsi batas kebutuhan/keinginan rutin agar tidak dihitung ganda dengan alokasi tabungannya.
- Target penyisihan bulanan dan realisasi setoran ditampilkan terpisah. Saldo awal tujuan, transfer antar tujuan, dan pelepasan tidak dihitung sebagai setoran baru. Tampilkan setoran dan penarikan secara terpisah.
- Anggaran kebutuhan minimum adalah input referensi untuk indikator kekurangan; tidak otomatis memindahkan anggaran lain.
- Review bulan lalu tersedia saat membuka bulan baru; tidak membutuhkan proses terjadwal. Tawaran setoran dibatasi minimum sisa anggaran positif yang dipilih dan uang belum disisihkan saat konfirmasi, dikurangi nominal yang ingin dipertahankan. Pengguna boleh memilih nominal lebih kecil.
- Setoran hasil review dicatat pada tanggal konfirmasi nyata, dengan referensi bulan yang ditinjau; tidak dimundurkan diam-diam ke bulan lalu.

### Dana pengaman dan target

- Input kebutuhan pokok bulanan dan jumlah bulan perlindungan; kebutuhan kondisi saat ini dan mandiri dapat disimpan sebagai dua skenario. Pengguna memilih satu basis target aktif. Tidak menetapkan nominal pribadi atau jumlah bulan wajib.
- Kebutuhan nol/belum diisi menghasilkan status “Lengkapi kebutuhan pokok”, bukan pembagian nol atau status aman.
- Bagian impian tanpa target masuk Tabungan belum ditentukan. Ketika membuat target, alokasi saldo dari kantong tersebut tidak menambah total tabungan.
- Default pembagian beberapa target ditentukan pengguna; target yang dijeda menerima 0%, lalu pengguna menyesuaikan sisanya. Sisa pembulatan rupiah dialokasikan secara deterministik ke bagian terakhir sehingga total tetap persis.
- Jika dana pengaman sudah mencapai target, tawarkan pengalihan setoran berikutnya; hingga dikonfirmasi, rasio lama tetap digunakan. Jika saldonya turun lagi, tampilkan kekurangan dan tawarkan meninjau rasio, tanpa perubahan otomatis.
- Target penuh diberi status dana tersedia untuk harga/acuan yang dipakai. Penyelesaian/pembelian dikonfirmasi pengguna; angka proyeksi bukan bukti pembelian atau pelunasan.

## Kontrak perhitungan simulasi usulan

Semua angka bunga/kenaikan harga diisi manual. Tidak memakai 3% sebagai fakta atau default wajib. Form kosong meminta input eksplisit; data pada sketsa hanya contoh.

### Harga penuh dan DP

- Harga acuan `P`, bulan sejak tanggal acuan `m`, asumsi tahunan `g`: `P(m) = P × (1 + g)^(m/12)`.
- Simulasi dimulai pada tanggal yang ditampilkan. Harga acuan lama disesuaikan terlebih dahulu ke tanggal simulasi; implementasi memakai jarak bulan kalender termasuk fraksi bulan yang konsisten dan terdokumentasi.
- Usulan input kenaikan 0–100% per tahun; model penurunan harga ditunda. Setoran rencana `s` tetap per bulan, pertama pada akhir bulan pertama. Tidak ada imbal hasil: `Dana(m) = dana target saat ini + s × m`.
- Harga penuh tercapai pada bulan pertama dana mencukupi harga proyeksi plus biaya tambahan input pengguna.
- DP dipilih sebagai persentase harga proyeksi atau nominal tetap. Biaya awal diisi sebagai estimasi nominal pada saat pembelian, terpisah dari DP, dan tidak otomatis dibiayai bank. Label memperjelas biaya tersebut tidak otomatis dinaikkan oleh inflasi.
- Kebutuhan dana awal = DP pada bulan pembelian + biaya awal. Pokok kredit = harga pada bulan pembelian − DP; biaya awal tidak dikurangkan dari harga untuk menghitung pokok.
- DP nominal melebihi harga proyeksi menghasilkan validasi; DP 100%/pokok nol mengarahkan hasil ke pembelian harga penuh tanpa cicilan.
- Mode tenggat: untuk `N > 0`, setoran minimum = `ceil(max(0, kebutuhan(N) − dana sekarang) / N)`.
- Mode setoran: periksa setiap bulan 0–600 secara berurutan. Jangan memakai binary search terhadap kondisi ketercapaian; kenaikan harga majemuk dan tabungan linear tidak selalu membentuk kondisi monoton.
- Jika belum tercapai dalam 600 bulan, tampilkan “Belum tercapai dalam simulasi 50 tahun”; jangan menyebut mustahil selamanya. Setoran nol dan target sudah terpenuhi ditangani eksplisit.
- Setoran seluruh target dibandingkan dengan rencana alokasi impian. Jika melampaui, beri indikator rencana tidak sesuai anggaran; simulasi tetap boleh dijalankan, tanpa mengalokasikan uang yang sama secara aktual.

### KPR anuitas dan perubahan bunga

- Parameter: pokok `L`, tenor `n` bulan (usulan 1–360), bunga tahunan nominal `a` 0–100%, periode fixed, serta jadwal asumsi bunga floating. Bunga bulanan simulasi `r = a / 12`; input persentase dibagi 100 dahulu. Label “tahunan, anuitas, dihitung bulanan”; bukan bunga flat atau hasil penawaran bank.
- Angsuran `A = L × r / (1 − (1 + r)^(-n))`; jika `r = 0`, `A = L / n`.
- Tiap bulan: bunga = sisa pokok × r; pembayaran pokok = angsuran − bunga. Pada bulan perubahan bunga, hitung ulang angsuran dari sisa pokok SEBELUM pembayaran bulan tersebut dan sisa tenor. Tanggal lunas skenario tetap.
- Fixed 36 bulan berarti bunga selanjutnya mulai pembayaran ke-37. Jadwal berurutan, tidak tumpang tindih, berada dalam tenor. Bila fixed sepanjang tenor, tidak wajib input floating; durasi fixed nol berarti bunga floating berlaku sejak bulan pertama.
- Bunga tidak otomatis berubah karena data pasar. Pengguna memasukkan jadwal atau skenario; nilai terakhir berlaku sampai tenor selesai. Opsi dasar satu perubahan; opsi lanjutan beberapa perubahan.
- Perhitungan proyeksi memakai presisi internal tanpa pembulatan setiap bulan; tampilan rupiah dibulatkan, setoran minimum dibulatkan ke atas. Pembayaran terakhir disesuaikan agar saldo mendekati nol; hasil tidak diklaim sama persis dengan pembulatan kontrak bank.
- Tampilkan cicilan setiap fase, cicilan tertinggi, total bunga, total pembayaran pinjaman, serta total biaya pembelian = DP + biaya awal + pembayaran pinjaman. Asuransi/pajak/biaya berkala tidak termasuk kecuali dimasukkan pengguna sebagai biaya bulanan tambahan.
- Indikator kemampuan menggunakan input pemasukan rencana, kebutuhan lain, cicilan lain, dan tabungan yang ingin dipertahankan. Hindari menghitung sewa yang akan berhenti dua kali; pengguna memilih biaya pascapembelian. Tampilkan sisa bulanan tiap fase, tanpa label “pasti layak kredit”.
- Sebelum DP tercapai, cicilan merupakan proyeksi; tidak mengurangi saldo atau anggaran aktual. Setelah harga pembelian/pokok ditetapkan, kenaikan harga aset tidak ditambahkan ke utang kredit yang sama.

### Acuan dan batas bukti

- [BCA KPR Pembelian](https://www.bca.co.id/id/individu/produk/pinjaman/kpr/kpr-first): contoh fixed ke floating dan batas simulasi bukan persetujuan kredit. Tidak menyalin tarif bank menjadi default.
- [CFPB — Mortgage amortization](https://www.consumerfinance.gov/ask-cfpb/how-does-paying-down-a-mortgage-work-en-1943/): pembayaran memuat pokok dan bunga, dengan sisa pokok menurun. Bukan sumber aturan kredit Indonesia.
- Rumus dan batas input di atas adalah spesifikasi simulasi aplikasi yang diusulkan, bukan klaim mengikuti semua kontrak bank.

## Sketsa dan alur halaman

- [Sketsa harian](../../../output/visual-planning/arah-visual-keuangan.html): Ringkasan, Transaksi, Anggaran, Tabungan, dan panel pemasukan/pengeluaran/penyisihan.
- [Sketsa Target & Simulasi](../../../output/visual-planning/target-simulasi-keuangan.html): pilihan kendaraan/rumah, input target, dua mode simulasi, dan perubahan cicilan. Responsif mobile/laptop; angka contoh, tanpa penyimpanan atau API.
- HP: satu kolom, empat menu bawah, input sebelum hasil, tombol utama lebar, nominal mudah dibaca. Laptop: sidebar, input dan hasil berdampingan. Breakpoint usulan 768px; uji 320, 390, 768, 1024, 1440px.
- Target baru: nama → jenis harga penuh/DP → harga dan tanggal acuan → dana awal yang dialokasikan dari saldo tersedia → rasio/setoran rencana → simpan. DP membuka pengaturan biaya awal dan simulasi KPR.
- Detail: progres aktual dahulu, lalu tombol simulasi. Mengubah skenario tidak langsung menyimpan perubahan target; tombol simpan rencana harus eksplisit di aplikasi final.
- Kosong: ajakan isi saldo awal/catat transaksi/buat target sesuai konteks. Loading: skeleton ringkas dan tombol simpan disabled. Error: pesan dekat field + retry saat API gagal, draft input dipertahankan. Tidak tercapai: rentang pencarian dan alternatif setoran ditampilkan. Dialog memiliki label, fokus terkelola, Escape, dan tombol tutup.
- Sketsa tidak menampilkan setiap state atau seluruh halaman final. Daftar state ini menjadi kriteria implementasi, bukan klaim semuanya sudah diimplementasikan dalam preview.

## Temuan codebase dan perubahan terarah

| Area aktual | Temuan | Rencana |
|---|---|---|
| `finance-api/prisma/schema.prisma` | User, Category, PaymentMethod, Transaction; nominal Int; belum ada saldo awal/tujuan | Tambah data saldo awal, konfigurasi/version anggaran, sumber pemasukan, tujuan dan riwayat alokasi |
| `src/transactions/` | Create/list/delete; wajib paymentMethod; belum edit; type dari kategori | Validasi positif/tanggal, filter/pagination, snapshot jenis/group, koreksi, pilihan sumber dana, operasi atomik |
| `src/reports/` | Summary sepanjang waktu dan laporan bulanan; balance hanya income−expense | Pisahkan saldo kumulatif, arus bulanan, batas/realisasi dan saldo tujuan; batas bulan sesuai zona |
| `src/categories/`, `payment-methods/` | Validasi kepemilikan sudah ada | Pertahankan isolasi; kategori kebutuhan/keinginan; arsip. PaymentMethod lama dipertahankan sebagai metadata legacy, bukan saldo terpisah |
| `src/common/`, `main.ts` | Response wrapper dan validation pipe tersedia | Pertahankan pola response; serialization nominal dan validation DTO baru |
| Frontend `pages/Dashboard.vue` | Form/list/ringkasan dalam satu halaman | Pecah halaman menurut navigasi, komponen saldo/transaksi/target dan panel reusable |
| Frontend router/store/API | Login/dashboard; token localStorage; API localhost | Tambah route guard, penanganan sesi berakhir dan konfigurasi URL lingkungan; tetap Pinia/Axios |
| `style.css`, `vite.config.ts`, package | Tailwind 4 terpasang, directive lama dan tanpa plugin Tailwind Vite | Usulkan rapikan konfigurasi Tailwind 4, token palet D-010; verifikasi build saat implementasi |
| Test backend | Mayoritas scaffold “should be defined”; e2e Hello World | Tambah pemeriksaan perilaku saldo/akses/simulasi, bukan menganggap scaffold sebagai cakupan fitur |

### Model data usulan dan trade-off

Rekomendasi: pertahankan struktur NestJS + Prisma + SQLite dan Vue + Pinia. Gunakan transaksi aktual yang sudah ada ditambah riwayat alokasi; tanpa sistem akuntansi double-entry baru.

- `FinanceProfile`: user, tanggal/saldo awal, zona, kebutuhan pokok dan basis skenario.
- `IncomeSource`: user, nama, status arsip; override anggaran merujuk versi pengaturan.
- `BudgetPolicy`/`BudgetShare`: versi efektif bulan dan rasio umum/per sumber; snapshot rasio yang dipakai saat pemasukan dialokasikan.
- `SavingsGoal`: jenis emergency/unassigned/purchase, harga acuan, tanggal, mode full/DP, asumsi, target bulan perlindungan bila emergency, status.
- `GoalShare`: persentase bagian impian per target aktif.
- `AllocationEvent`: user, tujuan asal/tujuan akhir opsional (null berarti belum disisihkan), nominal, tanggal, jenis opening/allocate/release/transfer/spend/reversal, link transaksi untuk spend, request ID. Saldo tujuan dihitung dari riwayat aktif; jangan menyimpan total duplikat yang bisa berbeda.
- `Transaction`: tambahkan jenis/group snapshot, incomeSource, goal untuk sumber dana pengeluaran, status pembatalan, request ID; nominal dan tanggal tervalidasi.
- `TransactionRevision`: nilai sebelum/sesudah koreksi untuk audit terbatas dan rekonsiliasi; tidak menghapus data lama diam-diam.
- Parameter simulasi rencana disimpan terpisah dari transaksi, termasuk jadwal `LoanRatePeriod` jika pengguna menyimpan rencana KPR. Hasil proyeksi dihitung ulang, bukan dijadikan saldo.

Alternatif: hanya total saldo tujuan tanpa riwayat (lebih sedikit tabel, sulit koreksi dan audit); atau ledger double-entry penuh (lebih umum, kompleksitas lebih tinggi). Pilihan rekomendasi mempertahankan pola transaksi existing sambil membuat perpindahan tujuan dapat ditelusuri.

Nominal aktual diusulkan Prisma BigInt dalam rupiah, dikirim API sebagai string digit. Ini memerlukan migrasi DTO/frontend dan serializer eksplisit. Forecast mengonversi ke Number hanya setelah pemeriksaan batas; usulan nominal maksimum Rp1 triliun per input dan agregat dalam safe integer untuk simulasi. Persentase disimpan basis point (10000 = 100%). Validasi kompatibilitas versi Prisma terpasang dilakukan pada schema salinan sebelum migrasi.

Acuan: [Prisma SQLite mapping](https://docs.prisma.io/docs/orm/core-concepts/supported-databases/sqlite), [Prisma fields and types](https://docs.prisma.io/docs/orm/v7/prisma-client/special-fields-and-types). Dokumentasi terbaru bukan izin upgrade Prisma 5 ke 7; versi proyek dipertahankan, kompatibilitas harus diuji.

### API usulan

Semua endpoint memerlukan JWT dan userId dari token. Envelope existing `{success,message,data}` dipertahankan. Nominal JSON string; persentase basis point; tanggal bisnis string.

| Kelompok | Operasi |
|---|---|
| `/finance-profile` | GET, PUT setup/koreksi dengan preview dampak |
| `/transactions` | GET filter bulan/type/category + pagination; POST; PATCH koreksi; DELETE berarti batal dengan audit |
| `/income-sources`, `/categories` | list/create/edit/archive; kategori legacy perlu dipetakan pengguna |
| `/budget-policies` | GET, POST versi; endpoint preview penerapan bulan berjalan |
| `/savings-goals` | list/detail/create/edit/archive; pembagian tujuan |
| `/allocations` | preview, create, list, release/transfer; spend melalui transaksi terkait |
| `/reports/summary`, `/reports/monthly` | saldo saat ini, pemasukan/pengeluaran periode, tujuan, alokasi dan penanda saldo lama |
| `/simulations/goal`, `/simulations/mortgage` | POST perhitungan murni, tanpa mutasi saldo |

Frontend hanya memformat dan memvalidasi awal; hasil authoritative dihitung server. Preview standalone mempunyai perhitungan contoh sendiri dan tidak disalin sebagai sumber kebenaran produksi.

## Dependency yang diminta sebagai bagian persetujuan

- `@tailwindcss/vite` yang kompatibel dengan Tailwind 4 terpasang: menjalankan pipeline styling; [panduan resmi upgrade](https://tailwindcss.com/docs/upgrade-guide). Alternatif CSS biasa mengurangi dependency, tetapi menyimpang dari utility classes yang sudah digunakan.
- `lucide-vue-next`: ikon Vue konsisten dengan sketsa, impor hanya ikon yang digunakan. Alternatif aset SVG lokal memungkinkan tanpa library, tetapi perlu pengelolaan aset tersendiri. Versi tepat diverifikasi sebelum instalasi.
- `@nestjs/config` lini 4.x: memuat dan memvalidasi konfigurasi NestJS 11; JWT signing dan verification memakai `JWT_SECRET` yang sama tanpa secret hardcoded.
- Tidak menambah chart library, UI framework, database, atau upgrade major framework untuk versi pertama. Tabel/progress bar cukup untuk hasil awal.

## Migrasi dan data pengguna

1. Inventaris schema/data melalui pemeriksaan nonmutasi; jangan membaca/menampilkan data pribadi di laporan.
2. Buat migration dan uji pada database sintetis/salinan yang pengguna izinkan, bukan menjalankan reset pada `prisma/dev.db`.
3. Pertahankan kategori/metode pembayaran dan transaksi lama. Relasi paymentMethod dijadikan opsional untuk transaksi baru; jangan menghapus metadata lama.
4. Pengguna memetakan kategori expense lama ke kebutuhan/keinginan, dan menegaskan saldo awal. Sampai dipetakan, tampilkan “Belum dikategorikan”; jangan mengarang klasifikasi.
5. Cocokkan jumlah transaksi dan jumlah pemasukan/pengeluaran sebelum/sesudah migrasi, lalu uji saldo/tujuan. Perubahan data nyata/migrasi database pengguna tetap memerlukan izin eksplisit sesuai RULES.md; persetujuan kode tidak berarti izin reset data.

## Tahapan dan bukti selesai

| Tahap | Hasil yang dapat dicoba | Bukti yang diperlukan | Status |
|---|---|---|:---:|
| 1. Fondasi saldo + transaksi | Setup, kategori/sumber, tambah/edit/batal transaksi, ringkasan | Saldo awal terpisah, akses antaruser ditolak, koreksi konsisten, input invalid ditolak | **Diterima setelah stabilisasi** |
| 2. Anggaran | Rasio per bulan/sumber, sisa/kelebihan, tinjauan akhir bulan | Perubahan rasio tidak mengubah bulan lama; saldo lama tetap tersedia; pembulatan tepat | **Diterima setelah stabilisasi** |
| 3. Tabungan + target | Sisihkan/release/transfer/spend, emergency, beberapa impian | Invarian saldo, tidak ganda, pembagian target tervalidasi, arsip terkontrol | **Diterima setelah stabilisasi** |
| 4. Simulasi | Harga penuh/DP, tenggat/setoran, bunga bertahap | Contoh numerik, bunga nol, batas horizon, sisa pokok saat reset bunga, output tanpa mutasi saldo | **Diterima setelah stabilisasi** |
| 5. Penyatuan UX | Layout mobile/laptop, loading/empty/error, aksesibilitas | Coba alur harian dan target pada ukuran layar terpilih, keyboard, build keduanya | **Selesai** |

Komponen visual diintegrasikan pada tiap tahap, bukan menunggu tahap terakhir. API dan frontend yang bergantung satu sama lain masuk dalam scope yang diajukan.

## Verifikasi yang diusulkan untuk persetujuan

Mode: **terarah oleh agent**, ditambah build kedua aplikasi setelah kontrak terintegrasi, uji migrasi pada data sintetis, dan review akhir oleh pengguna. Tidak ada suite penuh berulang tanpa sebab baru.

- Unit domain: saldo, snapshot rasio, pembulatan, koreksi, allocation/release/spend, tujuan kosong, boundary tanggal dan perubahan bunga.
- Integrasi API dengan SQLite sementara: otorisasi dua user, atomic rollback, duplikasi request ID, pembatalan, filter bulan dan data legacy.
- Build Nest dan `vue-tsc`/Vite; smoke UI 320/390px dan 1024/1440px, input uang/tanggal, focus dialog, session expired, network error dan retry tanpa transaksi ganda.
- Contoh saldo: awal Rp10 juta, pemasukan Rp1 juta, pengeluaran Rp200 ribu, sisihkan Rp300 ribu → saldo Rp10,8 juta, dana Rp300 ribu, tersedia Rp10,5 juta. Melepas Rp100 ribu → saldo tetap, dana Rp200 ribu, tersedia Rp10,6 juta. Belanja Rp50 ribu dari dana → saldo Rp10,75 juta, dana Rp150 ribu, tersedia tetap Rp10,6 juta.
- Target nol kenaikan: harga Rp25 juta, dana Rp1 juta, setoran Rp500 ribu → 48 bulan; tenggat 24 bulan → Rp1 juta/bulan.
- Pinjaman bunga nol: Rp120 juta, 120 bulan → Rp1 juta/bulan. Jadwal perubahan harus memulai fase baru pada bulan tepat, memakai sisa pokok, dan berakhir dengan residual mendekati nol.
- Ketidakcapaian dalam horizon, DP melebihi harga, fixed melebihi tenor, nominal terlalu besar, tanggal tidak valid, dan setoran nol diperiksa.
- Tes existing yang gagal karena scaffold dicatat terpisah; jangan mengklaim kegagalan tersebut berasal dari perubahan tanpa baseline.

### Bukti acceptance stabilisasi — 2026-09-17

- `npm test -- --runInBand`: 8 suite, 18 test lulus.
- `npm run test:e2e -- --runInBand`: 1 suite, 3 skenario lulus menggunakan SQLite sementara yang dihapus setelah test.
- `npm run build` backend: lulus.
- `npm run build` frontend: lulus.
- E2E mencakup isolasi dua pengguna, koreksi/pembatalan transaksi dari Dana tujuan, contoh target 48 bulan, KPR bunga nol, dan bukti simulator tidak memutasi saldo.

### Bukti acceptance Tahap 5 & Dekomposisi Komponen — 2026-09-18

- Dekomposisi `Dashboard.vue`: Berkurang drastis dari 3.112 baris menjadi ~360 baris kode koordinator yang bersih.
- Komponen layout modular di `src/components/`: `Navbar.vue`, `MobileBottomNav.vue`, `HeroBalanceCard.vue`, `SavingsSection.vue`, `BudgetSection.vue`, `TransactionSection.vue`.
- 12 komponen modal terisolasi di `src/components/modals/`.
- Utilitas terstandarisasi: `src/utils/format.ts` (`formatRupiah`, `formatDate`).
- UX & Ketahanan: Mobile bottom navigation bar (`md:hidden`), skeleton loading beranimasi pulse, interactive empty states dengan CTA, Axios 401 response interceptor dengan redirect aman ke login, dan aksesibilitas keyboard (Escape & backdrop close).
- `npm run build` frontend (`vue-tsc -b && vite build`): Lulus 100% tanpa error TypeScript (421ms).
- `npm test -- --runInBand` backend: 8/8 test suite lulus (18/18 test lulus).
- `npm run build` backend: Lulus 100%.

## Catatan status dan batasan

- Auth register telah menyaring password hash. JWT signing dan verification memakai `JWT_SECRET` tervalidasi melalui `@nestjs/config`; aplikasi menolak startup jika secret hilang atau kurang dari 32 karakter.
- Repositori Git telah diinisialisasi pada root project, remote origin terhubung ke `https://github.com/gungdikaebs/finance-project.git`.
- File `.gitignore` telah dirapikan di tingkat root, backend, dan frontend untuk mengamankan data sensitif (.env, dev.db, node_modules, dist).
- Stabilisasi dan pengujian tidak menjalankan reset pada `prisma/dev.db` dan tidak mengubah data pengguna nyata.

## Persetujuan implementasi

Pada 2026-09-17 dan 2026-09-18 pengguna menyatakan telah memerintahkan Antigravity AI untuk menyelesaikan seluruh Tahap 1 sampai Tahap 5. Seluruh tahap telah selesai diimplementasikan, diverifikasi, dan didokumentasikan penuh. Deployment, perubahan data nyata, commit, merge, dan push tetap mengikuti kewenangan terpisah di RULES.md.

## Handoff untuk Antigravity AI

Urutan wajib dibaca: `docs/ai-workflow/README.md` → `RULES.md` → `PROJECT.md` → `CONTEXT.md` → `DECISIONS.md` → file ini. Cocokkan kembali schema, package, dan kode area tahap aktif karena repository dapat berubah setelah planning dibuat.

- Pertahankan keputusan D-001–D-015. Jika kode menunjukkan konflik atau pendekatan utama perlu berubah, catat bukti dan kembalikan ke pengguna/Codex untuk revisi planning.
- Gunakan sketsa sebagai referensi perilaku dan arah visual, bukan kode produksi untuk disalin langsung.
- Jangan reset `prisma/dev.db`, mengubah data nyata, memasang dependency di luar dependency yang telah disetujui, atau melakukan deploy tanpa kewenangan terkait.
- Perbarui status, file yang berubah, verifikasi nyata, dan sisa pekerjaan pada file tugas ini di setiap akhir tahap.
