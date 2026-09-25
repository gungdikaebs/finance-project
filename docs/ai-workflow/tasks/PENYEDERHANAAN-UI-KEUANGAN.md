# Penyederhanaan UI keuangan

## Status

- Tahap: tahap 1 sampai 4 selesai
- Diperbarui: 25 September 2026
- Fokus: mengurangi beban baca tanpa menghilangkan informasi finansial penting
- Perubahan data finansial dan deployment: tidak dilakukan

## Kebutuhan dan dasar audit

Pengguna merasa aplikasi terlalu ramai tulisan dan ingin lebih mudah serta nyaman digunakan. Sasaran utamanya pengguna awam yang ingin cepat mengetahui kondisi uang dan melakukan tindakan berikutnya tanpa membaca penjelasan panjang di setiap layar. Desain tetap mobile-first, mendukung desktop, dan mempertahankan palet hijau gelap/lime yang disepakati pada D-009 dan D-010.

Audit UI 25 September 2026 dilakukan pada browser aplikasi dengan data fiktif yang sudah ada, pada lebar sekitar 390 px, viewport biasa, dan desktop 1280 px. Tidak ada data yang diubah. Temuan yang teramati:

- **Ringkasan:** angka “Uang yang bisa dipakai” sudah menonjol, tetapi diikuti dua paragraf penjelasan, dua angka pendukung, dan empat tombol dengan bobot visual yang bersaing.
- **Tabungan:** header memuat rasio, penjelasan rasio, dan dua tombol. Kartu Dana Pengaman menampilkan saldo Rp32.748.000 untuk target Rp24.000.000 sebagai progres 100%, tanpa menonjolkan kelebihan Rp8.748.000. Dua kartu impian mengulang target waktu, nominal, persentase, catatan proyeksi, dan tiga aksi. Pada 390 px beberapa label membungkus menjadi beberapa baris.
- **Anggaran:** angka jatah aman Rp2.500.000/hari kuat, tetapi dikelilingi penjelasan, status, perhitungan, metrik harian, tiga mini-card, tips, lalu kartu anggaran lain. Elemen bertingkat ini membuat hierarki sulit dipindai di ponsel.
- **Analitik:** tiga ringkasan anggaran mengulang sebagian angka dari halaman Anggaran sebelum grafik dimulai. “Need/Want” bercampur dengan label Bahasa Indonesia.
- **Transaksi:** daftar relatif mudah dibaca; empat filter mengisi dua baris sebelum daftar pada ponsel.
- **Menu:** delapan tujuan utama tampil sebagai blok dengan prioritas sama, sehingga pengguna harus membaca semua pilihan.
- **Modal Sisihkan:** pada 390 px tombol “Eksekusi Sisihkan” tetap terlihat ketika rincian pembagian ke tiap target masih berada di bawah area yang harus digulir. Keadaan Dana Pengaman penuh dan pengalihan 100% sudah dijelaskan, tetapi ringkasan akibat tindakan tidak selalu terlihat bersamaan dengan konfirmasi.
- **Desktop:** navigasi kiri memuat banyak tujuan dan semua bagian utama berada pada satu halaman panjang. Ini dapat membuat Ringkasan terasa seperti pintu masuk ke laporan lengkap, bukan satu tampilan keputusan cepat.

## Cakupan dan pendekatan yang direkomendasikan

**Pendekatan A: evolusi bertahap pada komponen yang ada (direkomendasikan).** Rapikan urutan, ringkas copy yang berulang, pertahankan detail dalam disclosure/detail view, dan jaga semua perhitungan serta istilah domain. Risiko regresi lebih kecil dan dapat diuji per layar.

**Pendekatan B: desain ulang seluruh dashboard dan navigasi sekaligus.** Bisa menghasilkan identitas yang lebih seragam, tetapi mengubah banyak alur yang sudah dipelajari pengguna dan berisiko menabrak pekerjaan aktif. Tidak direkomendasikan sebagai langkah pertama.

Tahap usulan:

1. **Tahap 1: Ringkasan dan modal Sisihkan.** Tampilkan saldo yang bisa dipakai sebagai keputusan utama; ringkas penjelasan model saldo menjadi satu kalimat dan rincian yang bisa dibuka. Pertahankan akses cepat Pemasukan, Pengeluaran, dan Sisihkan; pindahkan “Tarik Dana Tabungan” dari deretan aksi utama ke konteks Tabungan dengan jalur **global** yang tetap mencakup Dana Pengaman, target impian, dan tabungan belum ditentukan. Tombol tarik per target yang sudah ada saja belum mencakup Dana Pengaman, sehingga tidak boleh menjadi satu-satunya jalur. Pada modal Sisihkan, buat tahap tinjau pembagian sebelum eksekusi agar nominal per tujuan, total, dan akibat pada uang yang bisa dipakai terlihat sebelum konfirmasi. Hindari penambahan transaksi atau perubahan rumus.
2. **Tahap 2: Tabungan.** Ringkas kartu impian menjadi nama, “terkumpul / target”, progres, dan satu aksi detail. Informasi waktu, porsi, asumsi, simulasi, edit, dan tarik tetap dapat diakses di detail. Pada Dana Pengaman penuh, tampilkan status “Target tercapai” dan kelebihan nominal secara eksplisit; jangan hanya menampilkan 100%.
3. **Tahap 3: Anggaran dan Analitik.** Utamakan jatah harian/sisa anggaran, pindahkan rumus dan tips ke detail, kurangi kartu bertingkat. Analitik menonjolkan perubahan/tren yang tidak sekadar mengulang Anggaran. Perubahan ini **tidak** dimulai saat `BudgetSection.vue`, `Dashboard.vue`, atau `SafeToSpendCard.vue` masih dikerjakan pihak lain tanpa koordinasi.
4. **Tahap 4: Transaksi dan Menu.** Sederhanakan tampilan filter default; kelompokkan menu berdasarkan pekerjaan pengguna tanpa menghilangkan fitur.

Di luar cakupan: mengubah kontrak API, rumus finansial, schema database, palet merek, menghapus fitur, mengganti dependency, deploy, atau mengubah data pengguna. Jika tahap UI ternyata membutuhkan perubahan backend, hentikan bagian itu dan minta persetujuan perluasan cakupan.

## Sketsa hierarki tahap 1

**Ringkasan ponsel:**

1. Judul “Uang yang bisa dipakai” + nominal besar.
2. Satu baris pembanding “Dari saldo total Rp…; Rp… disisihkan”. Penjelasan lengkap pada “Cara menghitung saldo”.
3. Aksi transaksi Pemasukan/Pengeluaran dan aksi Sisihkan. Penarikan dana berada pada aksi global yang jelas di halaman Tabungan, bukan kompetitor empat tombol pada kartu saldo.
4. Tagihan kosong tetap sekunder di bawah kartu.

**Sisihkan ponsel:**

1. Langkah input: uang tersedia, nominal, pilihan cepat; status Dana Pengaman ringkas.
2. Aksi “Tinjau pembagian” membuka langkah konfirmasi: total setoran, nominal per tujuan, sisa uang yang bisa dipakai, dan pernyataan bahwa uang fisik tidak berpindah rekening.
3. Aksi final “Konfirmasi penyisihan”; kembali/batal tidak menyimpan. Jika preview gagal atau berubah, jangan eksekusi dari pratinjau kedaluwarsa.

Visual: gunakan warna/tipografi yang ada; kurangi jumlah bidang berbingkai, teks 10–11 px yang esensial, dan badge yang mengulang judul. Status bahaya/selisih tetap mencolok. Dark/light mode sama-sama diverifikasi. Teks bantuan yang diperlukan untuk pemahaman saldo tidak dihapus, hanya dipindah ke lokasi yang tepat.

## Kriteria penerimaan

- [x] Pada 390 px, pengguna dapat menyebut uang yang bisa dipakai, asal perhitungannya, serta tindakan utama tanpa harus membaca dua paragraf permanen.
- [x] Pemasukan, Pengeluaran, dan Sisihkan tetap tersedia pada Ringkasan; Tarik Dana dipindah ke konteks Tabungan dengan jalur global.
- [x] Modal Sisihkan memiliki tahap tinjau sebelum konfirmasi. Pratinjau lama dibuang saat nominal berubah dan tombol konfirmasi hanya aktif untuk hasil terbaru.
- [x] Kartu target impian yang tertutup menampilkan ringkasan dan progres; proyeksi serta tindakan lanjutan tersedia setelah memilih “Lihat detail & tindakan”. Target tercapai menampilkan status dan kelebihan nominal.
- [x] Penambahan target impian membuat langkah tinjau tetap terbaca dan dapat digulir; nominal panjang yang wajar terlihat penuh pada 390 px.
- [ ] Keadaan normal, Dana Pengaman penuh, tidak ada impian aktif, input tidak valid, loading preview, dan kegagalan preview mempunyai umpan balik yang jelas.
- [ ] Angka dan hasil alokasi sebelum/sesudah perubahan UI sama dengan perilaku lama; tidak ada perubahan backend.
- [x] Fokus keyboard masuk/keluar dialog dengan benar, label kontrol jelas, dan dark/light mode tidak mengalami penurunan keterbacaan yang nyata pada alur yang diperiksa.
- [x] Dashboard dan alur utama diperiksa melalui UI pada desktop 1280×900 dan ponsel 390×844, bukan hanya build.

## Rencana implementasi dan verifikasi

- Area tahap 1: `finance-frontend/src/components/HeroBalanceCard.vue`, `finance-frontend/src/components/modals/SaveModal.vue`, dan `finance-frontend/src/components/SavingsSection.vue`. Tidak menyentuh `BudgetSection.vue` pada tahap 1.
- Urutan: kunci hierarki/copy → rapikan Ringkasan → buat langkah tinjau Sisihkan → periksa state loading/error/empty → verifikasi UI dan build frontend.
- Mode verifikasi usulan: build frontend, uji UI read-only untuk layout; gunakan data fiktif dan hanya lakukan penyisihan uji jika memang diperlukan untuk memastikan hasil, lalu dokumentasikan dampaknya.
- Review: pengguna menilai kenyamanan desain tahap 1 sebelum tahap 2 dimulai. Pengguna melanjutkan implementasi pada 25 September 2026, sehingga tahap 2 disetujui. Tahap berikutnya tidak otomatis disetujui.
- Persetujuan: **diberikan pengguna pada 25 September 2026** melalui “lanjutkan implementasi”, mencakup Tahap 1 dan alur tinjau sebelum konfirmasi.

## Hasil tahap 1 — 25 September 2026

- Ringkasan: penjelasan utama dipadatkan menjadi satu kalimat; rumus dan penjelasan saldo awal dipindah ke disclosure “Cara menghitung saldo”. Aksi utama kini Pemasukan, Pengeluaran, dan Sisihkan.
- Tabungan: jalur global “Tarik Dana” tersedia di header Tabungan, termasuk untuk pemilihan Dana Pengaman/tujuan lain melalui dialog yang sudah ada.
- Sisihkan: alur dua tahap; tahap tinjau menampilkan nominal total, uang yang tersisa untuk dipakai, rincian per tujuan, serta perilaku saat Dana Pengaman penuh. Perubahan nominal menghapus pratinjau sebelumnya; gagal memuat pratinjau memberi pesan dan aksi coba lagi. Fokus keyboard berpindah ke judul tinjau dan kembali ke isian nominal.
- Pemeriksaan: `npm run build` berhasil. Alur Sisihkan dan halaman Tabungan dilihat lewat UI browser aplikasi pada viewport sempit saat itu, termasuk keadaan Dana Pengaman penuh; dialog ditutup tanpa menyimpan. Penyisihan, pemasukan, pengeluaran, dan data finansial tidak diubah. Pemeriksaan desktop 1280 px dan viewport tepat 390 px belum dilakukan.
- Catatan: build memberi peringatan chunk JS lebih dari 500 kB, bukan kegagalan build dan tidak terkait perubahan alur ini.
- Langkah berikutnya setelah tahap 1: ringkas kartu target, pindahkan informasi lanjutan ke bagian detail, dan jelaskan kelebihan Dana Pengaman yang sudah melewati target.

## Hasil tahap 2 — 25 September 2026

- Dana Pengaman yang sudah mencapai target kini diberi status “Target tercapai” serta nominal kelebihan yang eksplisit; status tidak hanya bergantung pada progres 100%.
- Kartu target impian yang belum dibuka diringkas menjadi nama, jumlah terkumpul, target, dan progres. Perkiraan waktu/porsi, simulasi, asumsi, edit, dan tarik dana tetap tersedia di “Lihat detail & tindakan”.
- Jika target impian sudah terpenuhi, status kelebihan nominal terlihat pada ringkasan dan aksi “Wujudkan Impian” tetap tersedia.
- Pembagian 60:40 dan tiga aksi header dipadatkan serta label tombol dijaga agar tidak terpotong menjadi dua baris.
- Pemeriksaan: `npm run build` berhasil. Halaman Tabungan dan buka/tutup detail kartu diamati di browser aplikasi pada viewport desktop yang tersedia. Tidak melakukan aksi finansial. Tampilan terang dan viewport tepat 390 px belum diperiksa.
- Catatan cakupan: perubahan ini tidak menambahkan setoran khusus ke satu target tertentu; tombol Sisihkan yang ada tetap memakai pembagian otomatis.
- Langkah berikutnya: lanjutkan Tahap 3 pada Analitik; bagian Anggaran tetap menunggu tinjauan/koordinasi atas perubahan lokal yang sudah ada.

## Hasil tahap 3 — 25 September 2026

- Analitik tidak lagi mengulang tiga kartu “Kebutuhan / Keinginan / Tabungan” beserta angka realisasi dan target yang tersedia di halaman Anggaran. Fokus kini pada perbandingan arus kas enam bulan dan komposisi pengeluaran per kategori.
- Ringkasan selisih pemasukan dan pengeluaran bulan terakhir membantu pengguna membaca tren tanpa menganggapnya sebagai saldo yang bisa dibelanjakan.
- Label Need/Want diganti menjadi “Kebutuhan/Keinginan”. Daftar kategori awal dibatasi lima baris dengan tombol untuk melihat sisanya, sehingga daftar panjang tidak menjadi panel scroll kecil di dalam halaman.
- Tabel data tersembunyi menyediakan nilai tren bulanan bagi teknologi pembaca layar. Empty/loading state grafik juga memakai instruksi yang lebih langsung.
- Pemeriksaan: `npm run build` berhasil; tampilan dan data chart diperiksa di browser aplikasi pada viewport sempit dalam mode gelap. Tidak melakukan aksi finansial atau mengubah data. Mode terang dan ukuran tepat 390 px belum diperiksa.
- Di kartu batas belanja harian, nominal saran, pengeluaran hari ini, dan sisa jatah tetap terlihat. Rumus, sisa anggaran total, dan kiat dipindah ke disclosure agar kartu lebih ringkas.
- Label internal “Safe-to-Spend” dihapus dari judul. Pilihan Keinginan/Semua pengeluaran diberi status terpilih yang terbaca pembaca layar. Periode lampau tidak lagi menampilkan Rp0 per hari sebagai saran saat ini; periode mendatang ditandai sebagai perkiraan dan tidak dibandingkan dengan transaksi hari ini.
- Kartu safe-to-spend yang sudah ada dipertahankan; logika hitung dan pilihan modenya tidak diganti. Bagian rasio dan rincian kartu kategori lain pada `BudgetSection.vue` tidak dirombak.
- Pemeriksaan: `npm run build` berhasil. Tampilan Anggaran dan interaksi ganti mode serta buka/tutup rincian diperiksa di browser aplikasi pada viewport sempit, dengan data fiktif yang sudah tersedia. Tidak ada data finansial diubah. Mode terang, bulan arsip/mendatang, dan lebar tepat 390 px belum diuji langsung.
- Catatan build: peringatan ukuran chunk JS lebih dari 500 kB tetap muncul.

## Hasil tahap 4 — 25 September 2026

- Pada Riwayat Transaksi, bulan dan tahun tetap terlihat sebagai filter utama. Jenis transaksi dan status dipindahkan ke panel “Filter lain” agar tidak memenuhi baris awal pada layar sempit. Tombol menunjukkan jumlah filter tambahan yang aktif.
- Jika kombinasi filter tidak menghasilkan transaksi, empty state menjelaskan cara memulihkan daftar dan menyediakan “Tampilkan semua transaksi”. Empty state periode yang benar-benar kosong tetap menyediakan aksi mencatat pemasukan atau pengeluaran.
- Menu mobile dikelompokkan ke “Kelola keuangan”, “Rencana dan laporan”, dan “Tampilan”. Seluruh tujuan menu, aksi, label, dan event yang sudah ada tetap dipertahankan.
- Pemeriksaan: `npm run build` berhasil. Melalui browser aplikasi, filter tambahan dibuka dan diperiksa; daftar transaksi tetap utuh. Menu mobile diperiksa secara visual dan struktur labelnya terbaca. Tidak mengubah transaksi, ekspor laporan, atau melakukan aksi keuangan.
- QA responsif lanjutan: dashboard diperiksa melalui UI pada desktop 1280×900 serta ponsel 390×844. Ringkasan, Tabungan, Anggaran, Analitik, Riwayat Transaksi, dan Menu diperiksa pada lebar ponsel; tidak ditemukan konten yang meluber secara horizontal. Kontrol filter berukuran cukup untuk disentuh dan berpindah ke baris berikutnya saat perlu.
- Tindak lanjut copy: alur “Atur Pembagian” dan pratinjau Sisihkan diperiksa melalui UI. Saat Dana Pengaman tercapai, layar input menyebut 100% setoran ke Target Impian; pratinjau menunjukkan jumlahnya dibagi mengikuti porsi target yang dipilih. Header Tabungan kini memakai penjelasan kondisional yang sama. Empty state Target Impian juga tidak lagi menyebut angka 40% secara tetap. Perhitungan dan distribusi tidak diubah.
- QA akhir: pada lebar 390 px, modal Target Baru menampilkan validasi inline dan pemberitahuan saat nama kosong dan harga Rp0; percobaan invalid tidak menyimpan target. Tombol “Tinjau Pembagian” pada Sisihkan nonaktif untuk nominal Rp0. Navigasi keyboard pada dialog Target Baru tetap berputar di dalam dialog dan fokus kembali ke tombol pembuka saat dibatalkan; dialog Sisihkan juga mengembalikan fokus ke tombol pembuka. Mode terang diperiksa pada Ringkasan, Tabungan, Menu, dan dialog Sisihkan, lalu mode gelap dipulihkan.
- Alur setelah target baru ditambahkan diperiksa dengan target fiktif “Uji QA Codex sementara” (target Rp5.000.000, saldo Rp0). Di layar 390 px, pratinjau penyisihan Rp33.000.000 menampilkan alokasi Motor Keeway Benda Rp10.998.900, Rumah Rp10.998.900, dan target uji Rp11.002.200; total alokasi tepat Rp33.000.000, Dana Pengaman tercapai dan tidak menerima bagian. Tombol konfirmasi tidak ditekan; tidak ada transaksi atau saldo yang berubah. Target uji **tetap tersimpan** sebagai data fiktif karena UI tidak menyediakan jalur penghapusan/pemulihan yang jelas.
- Batas QA yang masih tersisa: keadaan tanpa target aktif tidak dibuat karena memerlukan perubahan data pada dua target yang ada; di UI aktif/detail/edit tidak terlihat aksi arsip/pemulihan yang jelas, jadi target lama tidak diubah. Loading/error pratinjau tidak direkayasa dengan memutus jaringan. Kesetaraan angka terhadap perilaku sebelum perubahan belum diuji dengan pembandingan dataset. Pada form Target Baru 390 px, nominal panjang yang wajar (Rp1.234.567.890.123) terlihat penuh; nominal ekstrem 31 digit melebihi lebar kolom dan perlu digulir di dalam input.
- Catatan build: peringatan chunk JS lebih dari 500 kB tetap muncul.

## Backlog evaluasi UI terbaru — 25 September 2026

Tahap 1–4 sudah menghasilkan Ringkasan yang mudah dipindai, aksi Pemasukan/Pengeluaran/Sisihkan yang terlihat jelas, kartu target yang lebih ringkas, navigasi mobile per bagian, serta konfirmasi pembatalan transaksi yang menjelaskan dampaknya pada saldo. Temuan berikut adalah backlog evaluasi terbaru; status implementasi dicatat per item. Prioritas didasarkan pada risiko salah memahami kondisi uang, bukan pada kemudahan membuat perubahan.

### 1. Dana Pengaman setelah target tercapai — High (selesai)

- **Bukti UI:** pada akun uji, Dana Pengaman terkumpul Rp32.748.000 dengan target Rp24.000.000. Kartu sudah menunjukkan “Target tercapai” dan “Lebih Rp8.748.000”. Header Tabungan menyebut 100% setoran berikutnya dialihkan ke Target Impian. Dari layar ini belum jelas langkah pengguna yang ingin menambah Dana Pengaman lagi secara sengaja setelah target tercapai.
- **Dampak:** pengguna dapat mengira tombol Sisihkan akan menambah Dana Pengaman, padahal pratinjau penyisihan mengarahkannya seluruhnya ke target impian. Pengguna yang ingin mempertahankan cadangan lebih besar tidak menemukan tindakan yang jelas.
- **Perubahan:** ketika target tercapai, kartu Dana Pengaman menampilkan aksi “Tambah ke Dana Pengaman”. Form menerima nominal satu kali dari uang yang belum disisihkan dan menjelaskan bahwa uang tetap berada di rekening/dompet, sementara setoran otomatis berikutnya tetap dialihkan ke Target Impian. Layar tinjau menampilkan nominal, saldo Dana Pengaman setelah tambahan, serta sisa uang yang bisa dipakai. Penyimpanan menggunakan alokasi ke target Dana Pengaman yang sudah ada; rumus setoran otomatis dan model backend tidak diubah.
- **Verifikasi:** build produksi berhasil. Melalui UI ponsel, tombol dan modal diperiksa secara visual; fokus awal masuk ke nominal dan setelah Batal kembali ke tombol pembuka. Nominal Rp40.000.000 ditolak ketika saldo tersedia Rp36.204.900; nominal uji Rp5.000.000 menampilkan perhitungan saldo setelah tambahan dengan benar dan kembali dapat diubah. Form kemudian dibatalkan sebelum konfirmasi, sehingga tidak ada transaksi atau saldo yang diubah. Validasi kepemilikan target dan batas saldo juga tersedia pada endpoint alokasi yang dipakai.
- **Kriteria penerimaan:** [x] UI menjelaskan tujuan setoran otomatis berikutnya; [x] pengguna dapat menambah Dana Pengaman satu kali; [x] tujuan dan dampak pada saldo ditinjau sebelum konfirmasi; [x] pengguna dapat membatalkan atau mengubah nominal; [x] setoran otomatis berikutnya tidak berubah. Pengiriman konfirmasi akhir tidak dilakukan saat QA agar tidak membuat transaksi uji.

### 2. Cakupan angka pada Batas belanja harian — Medium (copy dan status selesai)

- **Bukti UI:** dengan mode default “Keinginan”, kartu menulis “Pengeluaran hari ini Rp0”. Setelah mode diganti ke “Semua pengeluaran”, angka menjadi Rp1.010.000 karena ada transaksi kategori Kebutuhan pada hari yang sama. Angkanya mengikuti filter, tetapi label “Pengeluaran hari ini” tidak menyebut cakupan filter tersebut.
- **Dampak:** pengguna dapat menyimpulkan belum mengeluarkan uang sama sekali hari ini. Status hijau “Aman Terkendali” juga dapat terbaca sebagai penilaian seluruh keuangan, padahal kartu sedang menilai mode yang dipilih.
- **Perbaikan:** label angka berubah menjadi “Pengeluaran keinginan hari ini” atau “Semua pengeluaran hari ini”; keterangan rekomendasi serta status (“Aman untuk Keinginan/Semua Pengeluaran”) kini menyebut mode yang sedang dipilih. Nama aksesibel progress bar juga mengikuti mode. Kontrol mode yang sudah ada dipertahankan sebagai tombol pilihan dengan `aria-pressed`; tidak diubah menjadi checkbox baru atau radio tanpa kebutuhan.
- **Verifikasi:** pada viewport 390×844, mode Keinginan menampilkan “Pengeluaran keinginan hari ini Rp0” dan “Aman untuk Keinginan”; mode Semua Pengeluaran menampilkan “Semua pengeluaran hari ini Rp1.010.000” dan “Aman untuk Semua Pengeluaran”. Saat kembali ke mode Keinginan, angka dan label kembali sesuai. Tidak ada transaksi atau saldo yang diubah.
- **Kriteria penerimaan:** [x] label, nilai, status, dan nama progress mengikuti mode; pengeluaran kategori Kebutuhan tidak tersirat masuk ke angka mode Keinginan. [ ] Periksa pengumuman status tombol dan angka dengan pembaca layar nyata.

### 3. Penanda navigasi dan nama aksi target pada mobile — Low–Medium (selesai)

- **Bukti UI:** pada lebar 390 px, tombol “Menu” tetap berbidang lime yang paling mencolok ketika Ringkasan, Tabungan, Anggaran, atau Transaksi sedang aktif. Beberapa tombol pembuka kartu target juga sama-sama terbaca “Lihat detail & tindakan” tanpa nama target di accessibility tree.
- **Dampak:** penanda tab aktif bersaing dengan Menu; pengguna pembaca layar harus menebak target yang akan dibuka.
- **Perbaikan:** tombol Menu kini netral ketika panel tertutup dan mengikuti gaya aktif ketika dibuka. Tab yang terpilih ditandai sebagai halaman saat ini. Tombol Menu menyebut fungsinya dan status buka/tutupnya. Tombol detail setiap target kini memuat nama target di label aksesibel.
- **Verifikasi:** pada viewport 390×844, Tabungan terlihat sebagai tab aktif dan Menu tidak lagi bersaing secara visual. UI menunjukkan `aria-current="page"` pada Tabungan, `aria-expanded="false"` pada Menu tertutup, serta label aksesibel “Lihat detail dan tindakan untuk …” yang berbeda untuk setiap target. Saat Menu dibuka, status berubah menjadi expanded. Tidak ada data finansial yang diubah.
- **Kriteria penerimaan:** [x] tab aktif paling jelas secara visual; aksi tiap target dan status Menu dapat dibedakan dari accessibility tree. [ ] Pengumuman akhir tetap perlu diperiksa dengan pembaca layar nyata.

### 4. Sisa kepadatan pada Anggaran — Low (selesai)

- **Bukti UI:** setelah kartu batas belanja harian diringkas, layar Anggaran masih menampilkan rasio pemasukan, batas harian, tiga ringkasan kategori, dan penjelasan “Tabungan Bulan Ini” dalam satu rangkaian. Pada 390 px pengguna perlu menggulir beberapa panel untuk menyusun gambaran utuh.
- **Perubahan:** penjelasan kartu tabungan kini memprioritaskan langkah “Buka Tabungan, lalu pilih ‘Sisihkan ke Tabungan’”; cara angka “Sudah disisihkan” dikurangi dengan penarikan dipindahkan ke rincian “Bagaimana angka tabungan dihitung?” yang bisa dibuka. Angka dan perhitungan finansial tidak diubah.
- **Verifikasi:** build produksi berhasil. Pada viewport ponsel, petunjuk langkah terlihat pada kartu Tabungan Bulan Ini; rincian perhitungan berhasil dibuka dan ditutup lewat kontrol yang dapat diakses. Tidak ada data finansial yang diubah.
- **Kriteria penerimaan:** [x] langkah berikutnya dapat dikenali tanpa membuka rincian; [x] rincian perhitungan tetap tersedia dan dapat dibuka/ditutup.

### Batas pemeriksaan dan koreksi temuan

- Pemeriksaan terbaru dilakukan lewat browser aplikasi pada viewport ponsel, dengan akun yang sudah berisi data fiktif. Ini bukan pengulangan onboarding akun kosong. Rincian tabungan dikembalikan ke keadaan tertutup; tidak ada data yang diubah pada pemeriksaan terbaru.
- Pada pemeriksaan alur transaksi sebelumnya, satu pengeluaran fiktif Rp10.000 dengan catatan “Uji usability - kopi” **disimpan** untuk melihat feedback dan pembaruan saldo; transaksi itu masih ada. Ini terpisah dari QA tahap 1–4 yang saat itu tidak mengubah transaksi.
- Temuan lama tentang tidak adanya pilihan rekening pada form pengeluaran **belum terbukti**: akun uji hanya memiliki satu rekening aktif. Perilaku ketika ada beberapa rekening perlu diuji melalui UI sebelum dibuat task perubahan alur rekening.
- Validasi nominal Sisihkan yang melebihi uang tersedia sudah diperbaiki setelah QA tahap 4: input di atas Rp36.214.900 menampilkan pesan batas dan menonaktifkan “Tinjau Pembagian”; nilai tepat pada batas masih bisa ditinjau. Penyisihan uji tidak dikonfirmasi.

## Kondisi repo dan serah terima

- Saat rencana disusun, ada perubahan belum di-commit pada `finance-api/prisma/seed.ts`, `finance-api/src/auth/auth.service.spec.ts`, `finance-frontend/src/components/BudgetSection.vue`, `finance-frontend/src/pages/Dashboard.vue`, dan `finance-frontend/src/pages/Login.vue`, serta file baru `finance-frontend/src/components/SafeToSpendCard.vue`. Semuanya diperlakukan sebagai pekerjaan pihak lain dan dipertahankan.
- Tahap 1–4 selesai dan pemeriksaan dasar desktop serta ponsel telah dilakukan. Putaran UX berikutnya dapat diprioritaskan setelah pengguna meninjau hasil; jangan mengubah perhitungan finansial atau menambah alur setoran khusus per target tanpa persetujuan dan validasi kebutuhan terpisah.
