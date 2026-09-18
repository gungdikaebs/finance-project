# Keputusan proyek

Preferensi workflow berada di [RULES.md](RULES.md). Persetujuan arah produk di bawah belum merupakan persetujuan implementasi.

### D-001 — Anggaran fleksibel dan pemasukan dari beberapa sumber

- Tanggal: 2026-09-16
- Status: disetujui
- Keputusan: mendukung pemasukan tidak tetap maupun kombinasi gaji dan freelance; pembagian awal 50% kebutuhan, 30% tabungan, 20% keinginan dapat diubah. Anggaran aktual mengikuti penerimaan uang.
- Alasan: pengguna ingin membatasi pengeluaran dan memperbesar tabungan tanpa mengunci sistem pada satu jenis penghasilan.
- Dasar persetujuan: pengguna menerima dukungan gaji/freelance dan secara eksplisit memilih 30% tabungan dibanding 30% keinginan.
- Batas: detail pembagian per sumber dan waktu berlakunya perubahan belum difinalkan.

### D-002 — Dana pengaman terpisah dari target impian

- Tanggal: 2026-09-16
- Status: disetujui
- Keputusan: membedakan dana pengaman dan dana target; menampilkan ketahanan dana pengaman dalam bulan kebutuhan pokok. Proyeksi target mempertimbangkan asumsi kenaikan harga.
- Alasan: dana bertahan hidup harus tetap terlihat terpisah dari uang yang tersedia untuk impian.
- Dasar persetujuan: pengguna menyatakan tujuan bertahan saat krisis dan menerima usulan tersebut dengan “oke sudah cukup baik”.
- Batas: nominal kebutuhan, target dana pengaman, dan parameter simulasi belum ditentukan. Pembagian porsi tabungan ditetapkan di D-005. Angka inflasi 3% adalah contoh pengguna, bukan data inflasi Indonesia yang terverifikasi.

### D-003 — Satu Saldo utama untuk versi pertama

- Tanggal: 2026-09-16
- Status: disetujui
- Keputusan: mulai dengan satu saldo gabungan; kebutuhan, dana pengaman, dan tabungan impian tetap dapat dibedakan menurut tujuan.
- Alasan dan trade-off: mengurangi langkah pencatatan, tetapi belum menunjukkan saldo setiap rekening atau dompet.
- Alternatif: saldo terpisah per rekening, tunai, dan e-wallet dengan pencatatan transfer; ditunda untuk kemungkinan pengembangan berikutnya.
- Dasar persetujuan: pengguna menjawab “ya aku coba dulu sesuai dengan rekomendasimu” setelah usulan satu Saldo utama.

### D-004 — Saldo awal dan konfirmasi manual penyisihan

- Tanggal: 2026-09-16
- Status: disetujui
- Keputusan: uang yang sudah dimiliki dimasukkan sebagai saldo awal, bukan pemasukan bulan berjalan. Pengguna dapat menandai bagian saldo awal sebagai dana pengaman atau dana target. Untuk pemasukan berikutnya, aplikasi menyarankan nominal tabungan sesuai pengaturan; pencatatan penyisihan dilakukan setelah pengguna mengonfirmasi tindakan “Sisihkan”.
- Makna: penyisihan menandai tujuan uang di aplikasi, bukan transfer bank. Total Saldo utama tidak berubah; bagian yang sudah disisihkan tidak boleh dihitung kembali sebagai uang bebas atau dana target lain.
- Alasan dan trade-off: membedakan rencana anggaran dengan komitmen tabungan, dengan tambahan satu langkah konfirmasi dibanding alokasi otomatis.
- Dasar persetujuan: pengguna menjawab “iya boleh aku mengikuti rekomendasimu” setelah usulan alur saldo awal dan konfirmasi manual.
- Batas: aturan penggunaan/penarikan dana masih dibahas; pembagian antara dana pengaman dan target mengikuti D-005.

### D-005 — Dana pengaman dan impian berjalan bersamaan

- Tanggal: 2026-09-16
- Status: disetujui
- Keputusan: pembagian awal di dalam porsi tabungan adalah 60% dana pengaman dan 40% tabungan impian. Rasio dapat diubah; saran nominal ditampilkan pada tindakan “Sisihkan” dan dapat disesuaikan sebelum konfirmasi.
- Contoh: pemasukan Rp1.000.000 dengan tabungan 30% menghasilkan saran Rp300.000, terdiri dari Rp180.000 dana pengaman dan Rp120.000 tabungan impian. Rasio 60/40 berlaku pada porsi tabungan, bukan seluruh pemasukan.
- Alasan dan trade-off: membangun kedua tujuan bersamaan, dengan porsi lebih besar untuk dana pengaman; pengumpulan dana pengaman lebih lambat dibanding mengalokasikan seluruh tabungan ke sana.
- Alternatif: fokus seluruh tabungan ke dana pengaman terlebih dahulu; pengguna memilih keduanya berjalan bersamaan.
- Dasar persetujuan: pengguna memilih “sebaiknya berjalan bersamaan”, lalu menyetujui usulan rasio 60/40 dengan “okee masuk”.
- Batas: pembagian antar beberapa target impian, kondisi belum ada target, dan perilaku setelah dana pengaman mencapai target belum disepakati.

### D-006 — Tawaran penyisihan tambahan di akhir bulan

- Tanggal: 2026-09-16
- Status: disetujui
- Keputusan: ringkasan akhir bulan menawarkan penyisihan tambahan dari uang tersisa. Pengguna menentukan dan mengonfirmasi nominal; tawaran dapat dilewati. Uang yang tidak disisihkan tetap tersedia dan saldo terbawa ke bulan berikutnya tanpa menjadi pemasukan baru.
- Alasan dan trade-off: mendukung kebiasaan menabung dengan kendali nominal pada pengguna, dengan satu langkah tinjauan akhir bulan.
- Alternatif: membiarkan sisa uang tersedia tanpa tawaran penyisihan; pengguna menerima rekomendasi tawaran dengan konfirmasi manual.
- Dasar persetujuan: pengguna menjawab “ya aku mengikuti rekomendasimu” setelah penjelasan alur akhir bulan.
- Batas: saldo uang berbeda dari sisa batas anggaran. Pembawaan batas anggaran, waktu pencatatan penyisihan setelah pergantian bulan, dan perhitungan nominal aman untuk ditawarkan masih perlu dirinci. Dana yang sudah disisihkan mengikuti D-004 dan tidak dihitung sebagai uang bebas.

### D-007 — Target harga penuh atau DP dengan simulasi cicilan rumah

- Tanggal: 2026-09-16
- Status: disetujui (arah fitur; rincian simulasi masih usulan)
- Keputusan: mendukung target harga penuh dan target uang muka (DP). Pengguna menginginkan kendaraan sebagai contoh pembelian harga penuh dan rumah dengan perhitungan cicilan; jenis target tidak harus dikunci berdasarkan jenis barang.
- Dasar persetujuan: pengguna meminta keduanya dimasukkan dan menyebut perhitungan cicilan untuk rumah.
- Batas: tenor, biaya awal, serta pemeriksaan kemampuan membayar belum disepakati. Dukungan perubahan bunga mengikuti D-008; parameter dan metode rinci masih usulan. Tercapainya DP bukan berarti rumah lunas atau pinjaman disetujui. Implementasi belum diotorisasi.

### D-008 — Simulasi perubahan bunga KPR

- Tanggal: 2026-09-16
- Status: disetujui (kebutuhan; detail desain masih usulan)
- Keputusan: simulasi memperhitungkan periode fixed, perpindahan ke floating, dan perubahan tingkat bunga selama fase floating beserta dampaknya pada cicilan.
- Dasar persetujuan: pengguna secara eksplisit meminta memperhitungkan perubahan fixed ke floating karena kebijakan tertentu.
- Klarifikasi acuan: jadwal perubahan mengikuti ketentuan produk/perjanjian. Contoh KPR BCA menerapkan floating setelah periode fixed berakhir dan meninjaunya setiap enam bulan; ini bukan aturan universal atau bukti bahwa semua bunga fixed berubah sewaktu-waktu.
- Sumber: [BCA — KPR Pembelian](https://www.bca.co.id/id/individu/produk/pinjaman/kpr/kpr-first).
- Batas: angka bunga masa depan adalah asumsi skenario, bukan ramalan kebijakan atau penawaran bank. Jadwal input, skenario pembanding, dan rumus final belum disetujui sebagai rencana implementasi.

### D-009 — Mobile-first dan dukungan laptop

- Tanggal: 2026-09-16
- Status: disetujui
- Keputusan: aplikasi mendukung HP dan laptop; desain diprioritaskan untuk mobile.
- Dasar persetujuan: pengguna meminta “keduannya tetap di dukung tapi usahakan mobile first”.
- Batas: navigasi, warna, nama aplikasi, dan sketsa merupakan usulan yang masih perlu ditinjau. Preview visual bukan implementasi aplikasi.

### D-010 — Palet profesional dengan aksen terbatas

- Tanggal: 2026-09-16
- Status: disetujui
- Keputusan: hijau gelap `#183D2B` sebagai identitas/kartu saldo, lime `#B8DF38` untuk aksi utama dan pilihan aktif, latar `#F3F5EF`, kartu putih `#FFFFFF`, teks `#202820`. Biru dan peach hanya aksen kecil pada ikon/status; lavender tidak digunakan untuk tabungan. Padanan dark mode menjaga hierarki yang sama.
- Alasan: tetap hidup dengan perhatian terarah pada saldo, angka, dan aksi utama, serta mengurangi banyak bidang warna yang bersaing.
- Dasar persetujuan: pengguna menjawab “baik saya setuju” atas usulan penyempurnaan palet tersebut.
- Batas: persetujuan arah palet dan revisi sketsa, bukan persetujuan implementasi aplikasi penuh.

### D-011 — Pergantian bulan, penggunaan dana, dan pembagian target

- Tanggal: 2026-09-16
- Status: disetujui
- Keputusan anggaran: saldo uang dan dana tersisih terbawa antarbulan. Batas anggaran dihitung ulang dari pemasukan bulan baru; sisa bulan lalu ditampilkan terpisah. Pengeluaran boleh memakai saldo lama yang belum disisihkan meskipun belum ada pemasukan, dengan penanda penggunaan saldo sebelumnya. Melebihi anggaran tetap boleh dicatat dengan indikator kelebihan; hal ini bukan izin membuat saldo fiktif.
- Perubahan persentase: default mulai bulan berikutnya; penerapan bulan berjalan memerlukan preview batas baru dan konfirmasi, tanpa mengubah dana yang sudah disisihkan.
- Pembagian impian: persentase antar target berjumlah 100% dari bagian impian; nominal dapat disesuaikan saat Sisihkan. Jika belum ada target, bagian impian masuk Tabungan belum ditentukan; alokasi berikutnya tidak menjadi setoran baru.
- Dana pengaman penuh: tawarkan pengalihan setoran berikutnya ke impian, menunggu konfirmasi; dana pengaman yang terkumpul tetap tersimpan.
- Penggunaan dana: belanja dari dana tersisih mengurangi dana tujuan serta Saldo utama dan mencatat pengeluaran satu kali. Melepas alokasi hanya memindahkan dana tujuan ke uang belum disisihkan; bukan pengeluaran dan tidak mengubah Saldo utama. Pengeluaran biasa tidak otomatis mengambil dana pengaman; sumber dana dipilih pengguna.
- Akhir bulan: sisa batas anggaran berbeda dari uang tersedia. Tawaran penyisihan memperhitungkan uang belum disisihkan; pengguna dapat mempertahankan sebagian untuk kebutuhan berikutnya dan mengonfirmasi penyisihan sisanya.
- Dasar persetujuan: pengguna menyatakan “hmm menurut saya sudah cocock” setelah pembahasan aturan dan contoh penggunaan/melepas alokasi dana.
- Batas: tanggal pencatatan akhir bulan, koreksi transaksi/saldo awal, dan rincian validasi masih perlu dirancang. Rencana implementasi belum disetujui.

### D-012 — Asumsi kenaikan harga diisi manual

- Tanggal: 2026-09-16
- Status: disetujui
- Keputusan: pengguna mengisi Asumsi kenaikan harga (% per tahun) untuk masing-masing target; 0% didukung sebagai skenario harga tetap. Angka 3% adalah contoh, bukan default yang disepakati atau data inflasi aktual. Versi pertama tidak mengambil data inflasi otomatis.
- Pemisahan parameter: kenaikan harga rumah memengaruhi perkiraan harga dan kebutuhan DP; bunga KPR fixed/floating memengaruhi cicilan. Keduanya diisi terpisah.
- Alternatif: data resmi sebagai acuan dengan asumsi yang tetap bisa diubah; pengguna memilih input manual.
- Dasar persetujuan: pengguna menyatakan “input manual saja”, kemudian mengonfirmasi penjelasan dengan “okayy”.
- Batas: keputusan ini tidak mengesahkan seluruh detail metode simulasi atau implementasi aplikasi.

### D-013 — Pembagian peran planner dan implementer

- Tanggal: 2026-09-17
- Status: disetujui
- Keputusan: Codex bertugas sebagai planner. Antigravity AI bertugas mengimplementasikan rencana yang sudah disetujui pengguna.
- Tanggung jawab Codex: memperjelas kebutuhan, keputusan, model domain, cakupan, kriteria penerimaan, rencana teknis, mode verifikasi, dan handoff; tidak mengubah kode aplikasi selama berperan sebagai planner.
- Tanggung jawab Antigravity AI: membaca workflow dan handoff, memeriksa ulang area kode terkait, mengimplementasikan hanya scope yang disetujui, menjalankan verifikasi yang disepakati, serta memperbarui progres dan hasil.
- Gate: draft planning atau keberadaan kode bukan persetujuan. Implementasi dimulai setelah pengguna menyetujui rencana implementasi. Migrasi data nyata, deployment, commit, merge, dan push tetap mengikuti kewenangan di RULES.md.
- Dasar persetujuan: pengguna menyatakan Codex bertugas sebagai planner dan Antigravity AI bertugas sebagai implementer.

### D-014 — Stabilisasi wajib sebelum Tahap 5

- Tanggal: 2026-09-17
- Status: disetujui
- Keputusan: Tahap 1–4 melewati stabilization gate sebelum Tahap 5. Gate mencakup tanggal acuan inflasi, fase KPR bersyarat, rekonsiliasi ledger transaksi dari Dana tujuan, isolasi ID antar pengguna, kontrak saldo target frontend, konfigurasi JWT dari environment, unit test, e2e dengan database sementara, dan build kedua aplikasi.
- Dependency: `@nestjs/config` 4.x disetujui untuk NestJS 11; `JWT_SECRET` minimal 32 karakter dan tidak boleh hardcoded atau dicatat ke dokumentasi/log.
### D-015 — Dekomposisi Komponen Modular Dashboard dan Standarisasi UX Tahap 5

- Tanggal: 2026-09-17
- Status: disetujui
- Konteks: Dashboard.vue bertumbuh hingga 3.100+ baris kode yang memuat seluruh state, sub-komponen, modal, simulator, dan format utilitas dalam satu file monolitik. Hal ini mempersulit pemeliharaan, audit perubahan, dan pengujian responsivitas.
- Keputusan: memecah Dashboard menjadi arsitektur modular bersih:
  1. Halaman koordinator `Dashboard.vue` berukuran ramping (~360 baris kode).
  2. Komponen seksi visual mandiri di `src/components/` (`Navbar`, `HeroBalanceCard`, `SavingsSection`, `BudgetSection`, `TransactionSection`, `MobileBottomNav`).
  3. 12 modal dialog terpisah di `src/components/modals/`.
  4. Formatter terpusat di `src/utils/format.ts`.
  5. Fitur UX Tahap 5: bilah navigasi bawah mobile (`MobileBottomNav.vue`), indikator loading skeleton, interactive empty states dengan tombol aksi, response interceptor 401 (session expired) pada Axios, serta penutupan dialog via tombol keyboard `Escape` dan klik backdrop.
- Alasan dan trade-off: meningkatkan kejelasan dan modularitas kode, mencegah layout shift dengan skeleton loader, serta meningkatkan kenyamanan pengguna di perangkat mobile dengan akses satu jempol; memerlukan props dan emit interfaces yang eksplisit antar komponen.
- Dasar persetujuan: arahan pengguna untuk memecah dashboard menjadi beberapa komponen kecil dan menyetujui implementasi Tahap 5.

### D-016 — Standarisasi Sistem Notifikasi Toast & Dialog Konfirmasi Anti-Slop (Eliminasi alert() & confirm())

- Tanggal: 2026-09-18
- Status: disetujui
- Konteks: Dialog bawaan browser `window.alert()` dan `window.confirm()` memblokir thread JavaScript browser, menampilkan modal abu-abu kaku ("localhost:5173 says"), dan melanggar prinsip desain fintech anti-slop serta standar kanonikal D-010.
- Keputusan: Mengeliminasi 100% pemanggilan `alert(...)` dan `confirm(...)` di seluruh frontend dan menggantikannya dengan:
  1. `useToast.ts` & `ToastContainer.vue`: Notifikasi toast reaktif mengambang (`z-[9999]`) dengan 4 status terformat kanonikal D-010 (Success Deep Forest Green `#183D2B`, Error Crimson `#2A0E12`, Warning Amber `#2B1B0A`, Info Slate `#101F2B`), ikon Lucide, auto-dismiss 4 detik, dan tombol tutup silang (`X`).
  2. `useConfirm.ts` & `ConfirmModal.vue`: Modal konfirmasi dialog berbasis Promise asinkronus (`await confirmDialog.ask(...)`) dengan visualisasi risiko bertingkat dan touch target minimal 44x44px.
  3. Validasi formulir inline: Menampilkan border merah dinamis (`border-rose-400 focus:ring-rose-200`) dan teks panduan kesalahan langsung di bawah input formulir yang tidak valid.
- Alasan dan trade-off: Meningkatkan kenyamanan pengguna (UX) secara dramatis, non-blocking, serta mematuhi aturan WCAG dan skill design-taste-frontend; memerlukan pemanggilan hook composables di setiap komponen dialog.
- Dasar persetujuan: Pengujian pengguna dan arahan eksplisit untuk mengganti alert bawaan javascript menjadi alert yang lebih ber-style dan proper.

### D-017 — Arsitektur Ekspor Data Finansial Mandiri (CSV, Excel, PDF) & Analitik Visual (Chart.js)

- Tanggal: 2026-09-18
- Status: disetujui
- Konteks: Pengguna membutuhkan kepemilikan data mandiri (*data ownership*), backup spreadsheet, laporan bulanan resmi siap cetak, serta analitik visual tren arus kas tanpa harus melakukan kalkulasi manual.
- Keputusan:
  1. Backend `ReportsService` & `ReportsController`: Streaming respon langsung (bypass global interceptor via `@Res()`) untuk `GET /reports/export/csv` (dengan UTF-8 BOM `\uFEFF` untuk kompatibilitas Excel), `GET /reports/export/excel` (menggunakan `exceljs` dengan palet hijau hutan `#183D2B`), dan `GET /reports/export/pdf` (menggunakan `pdfkit` dengan layout A4 minimalis dan kartu KPI).
  2. Visualisasi Grafis `CashflowAnalyticsSection.vue`: Mengintegrasikan `chart.js` dan `vue-chartjs` untuk grafik batang tren pemasukan vs pengeluaran 6 bulan terakhir, distribusi pengeluaran donut chart, dan kartu variansi realisasi 50/30/20.
  3. Frontend Aksi Ekspor `TransactionSection.vue`: Menu dropdown taktil dengan 3 format unduhan langsung via browser blob download URL.
- Alasan dan trade-off: Memenuhi kebutuhan pelaporan komprehensif roadmap P2 (Modul 3 dan Modul 7); menambah dependensi `exceljs`, `pdfkit`, dan `chart.js`.
- Dasar persetujuan: Dokumen IMPROVEMENT-ROADMAP.md Modul 3 dan Modul 7 serta persetujuan rencana implementasi.

### D-018 — Arsitektur Proyeksi & Estimasi Cerdas Target Impian (Goal Forecaster & Smart Top-Up)

- Tanggal: 2026-09-18
- Status: disetujui
- Konteks: Target impian pembelian barang/aset memerlukan estimasi waktu pencapaian dinamis berbasis kapasitas tabungan aktual riil (rata-rata pemasukan bulanan dikalikan rasio tabungan, dikalikan 40% alokasi impian D-005, dikalikan bobot/share target) dan koreksi inflasi harga acuan ($P(m) = P_0 \times (1 + r/12)^m$).
- Keputusan:
  1. Backend `SavingsGoalsService` & `SavingsGoalsController`:
     - Menghitung estimasi tabungan bulanan riil: $S_{monthly} = \text{avgIncome} \times \text{savingsRatio} \times 40\% \times \text{shareRatio}$.
     - Menghitung proyeksi bulan target dengan iterasi majemuk inflasi bulanan hingga saldo terakumulasi melampaui harga terinflasi, serta menghitung tanggal kalender target (misal: "Nov 2030").
     - Deteksi inflasi tak terkejar (`isUnachievable: true`, kode `INFLATION_OUTPACING`) jika tabungan bulanan $\le P_0 \times \frac{r}{12}$.
     - Rekomendasi top-up cerdas (`topUpSuggestion`): menghitung ekstra tabungan bulanan $\Delta S$ yang diperlukan untuk mempercepat target sebanyak 3 bulan (atau melampaui inflasi) dengan pembulatan kelipatan Rp 10.000.
     - Milestone tahapan: Menghitung persentase progres dan penanda batas pencapaian 25%, 50%, 75%, 100%.
     - Endpoint API: `GET /savings-goals/forecast` (daftar proyeksi seluruh target aktif) dan `GET /savings-goals/:id/forecast` (proyeksi spesifik satu target). Rute didaftarkan mendahului `:id` untuk menghindari tabrakan rute NestJS.
  2. Frontend `SavingsSection.vue` & `Dashboard.vue`:
     - Menampilkan badge estimasi waktu (`~X bln (Bulan YYYY)`), badge waspada `Kalah Inflasi`, dan badge `Tercapai`.
     - Menampilkan lintasan tahapan (milestone track: 25%, 50%, 75%) dengan visualisasi centang hijau saat tercapai.
     - Menampilkan harga masa depan (*Future Projected Price*) terinflasi.
     - Kotak rekomendasi tabungan pintar (*Smart Top-up Recommendation Box*) dengan tombol aksi langsung "Uji di Simulator" yang membuka `SimulationModal` dengan nilai mode `TARGET_DATE` dan nilai tabungan terisi otomatis.
- Alasan dan trade-off: Membantu pengguna memvisualisasikan daya beli riil terhadap target impian secara akurat dan proaktif tanpa terkejut oleh erosi daya beli akibat inflasi; membutuhkan perhitungan majemuk bulanan di backend.
- Dasar persetujuan: Dokumen IMPROVEMENT-ROADMAP.md Modul 4 dan persetujuan rencana implementasi.

### D-019 — Arsitektur Transaksi Berulang & Pengingat Tagihan (Recurring Transactions & Upcoming Bills)

- Tanggal: 2026-09-18
- Status: disetujui
- Konteks: Pengeluaran rutin (sewa tempat tinggal, internet, listrik PLN, langganan aplikasi) dan pemasukan rutin bulanan sering kali terlambat dicatat secara manual, menyebabkan saldo aktual dan laporan realisasi 50/30/20 tidak akurat.
- Keputusan:
  1. Skema Database Prisma:
     - Model `RecurringTransaction` mencakup `type` ('expense' | 'income'), `amount` (BigInt), relasi ke `Category` dan `IncomeSource`, `frequency` ('DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY'), `interval`, `dayOfExecution`, `startDate`, `endDate`, `nextRunDate`, `lastExecutedAt`, `isActive`, dan `note`.
  2. Backend Engine NestJS & Scheduler:
     - Menggunakan `@nestjs/schedule` (v5.0.1) untuk cron harian `@Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)` yang mengevaluasi seluruh jadwal aktif dengan `nextRunDate <= now()`.
     - Algoritma `calculateNextRunDate` menangani penyesuaian tanggal akhir bulan (misal tanggal 31 pada bulan Februari atau April) dengan mengamankan `next.setDate(1)` sebelum manipulasi bulan, lalu membatasi hari dengan `Math.min(dayOfExecution, maxDays)`.
     - Eksekusi instan: Endpoint `POST /recurring-transactions/:id/execute` mencatat transaksi langsung ke tabel `Transaction` melalui `TransactionsService` (mematuhi pembagian pos NEED/WANT dan alokasi pemasukan D-004/D-005) serta memajukan `nextRunDate`.
     - Endpoint `GET /recurring-transactions/upcoming?days=7` menyaring jadwal jatuh tempo dalam 7 hari ke depan untuk widget proaktif.
  3. Frontend Taktil D-010:
     - `RecurringTransactionModal.vue`: Manajemen jadwal penuh (tab daftar dan tab tambah formulir), toggle jeda/aktifkan, tombol eksekusi cepat, dan konfirmasi hapus via `useConfirm`.
     - `UpcomingBillsWidget.vue`: Widget pengingat tagihan 7 hari ke depan di dashboard utama dengan tombol aksi cepat `Bayar Sekarang` dan feedback via `useToast`.
- Alasan dan trade-off: Mengurangi beban kognitif pengguna dalam mengingat tagihan rutin dan memastikan integritas ledger transaksi keuangan; membutuhkan package `@nestjs/schedule`.
- Dasar persetujuan: Dokumen IMPROVEMENT-ROADMAP.md Modul 5 dan persetujuan rencana implementasi dari pengguna.

### D-020 — Penataan Urutan Navigasi Dashboard dan Penghapusan Header Navbar Mobile

- Tanggal: 2026-09-18
- Status: disetujui
- Konteks: Pada tampilan mobile dan desktop, urutan item navigasi di sidebar serta bilah filter pil mobile tidak mencerminkan alur visual dashboard yang sebenarnya dari atas ke bawah. Selain itu, header `Navbar.vue` pada layar mobile memakan ruang vertikal layar secara berlebihan dan mengganggu pengalaman pengguna.
- Keputusan:
  1. Urutan Navigasi Kanonikal: Menstandarkan urutan navigasi di `Sidebar.vue` dan horizontal pill bar di `Dashboard.vue` menjadi:
     1. Ringkasan Saldo (`#section-ringkasan`)
     2. Tabungan & Impian (`#section-tabungan`)
     3. Anggaran 50/30/20 (`#section-anggaran`)
     4. Analitik & Tren (`#section-analitik`)
     5. Riwayat Transaksi (`#section-transaksi`)
  2. Penghapusan Navbar Mobile: Menghapus `<Navbar class="lg:hidden" ... />` dari `Dashboard.vue`.
  3. Integrasi Mobile Menu Modal: Menyediakan `MobileMenuModal.vue` (bottom sheet dialog) yang dapat diakses melalui tombol `Menu` ke-5 pada `MobileBottomNav.vue` (`@open-menu`) untuk menampung seluruh fitur utilitas dan akun pengguna (Profil Keuangan, Kategori & Sumber Dana, Transaksi Berulang, Simulator KPR, Evaluasi Akhir Bulan, dan Logout).
- Alasan dan trade-off: Memaksimalkan area pandang mobile screen, navigasi intuitif satu jempol, dan konsistensi urutan seksi secara hierarkis.
- Dasar persetujuan: Permintaan pengguna untuk memperbaiki urutan sidebar dan menghapus navbar pada tampilan mobile.

Catat hanya keputusan yang memengaruhi pekerjaan berikutnya: alur utama, teknologi, konvensi, atau desain lintas fitur. Keputusan lokal cukup berada di file tugas. Gunakan ID berurutan; keputusan pengganti merujuk ID lama dan menandainya sebagai digantikan.

## Format entri

```text
### D-001 — Judul keputusan

- Tanggal: YYYY-MM-DD
- Status: diusulkan / disetujui / digantikan oleh D-...
- Konteks: masalah atau pilihan yang perlu diputuskan.
- Keputusan: pendekatan yang dipilih.
- Alasan dan trade-off: manfaat serta konsekuensi utama.
- Alternatif: pilihan relevan yang dibandingkan, jika ada.
- Dasar persetujuan: ringkasan arahan pengguna atau tautan file tugas.
- Sumber: dokumentasi primer jika keputusan bergantung pada riset.
```

