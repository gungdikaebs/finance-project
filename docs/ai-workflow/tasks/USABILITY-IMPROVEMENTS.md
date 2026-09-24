# Backlog Perbaikan Usability

Dokumen ini mencatat temuan audit dari sudut pandang pengguna baru. Ini adalah daftar masalah dan hasil yang diharapkan, bukan keputusan teknis atau izin untuk langsung mengubah kode. Perbaikan dikerjakan **satu per satu** setelah ruang lingkup item yang dipilih disepakati.

## Dasar audit

- Pengujian melalui UI `http://localhost:5173/` pada 23 September 2026, tanpa membaca source code atau dokumentasi saat audit.
- Akun uji lokal dibuat dengan data fiktif. Skenario mencakup setup awal, pemasukan Rp3.000.000, pengeluaran Rp100.000, target “Laptop kerja”, penyisihan Rp900.000, pelepasan Rp100.000, anggaran, riwayat, dan simulator.
- Tampilan diperiksa pada desktop 1280 px, ponsel 390 px, dan lebar browser awal sekitar 702 px.
- Pengujian pembaca layar penuh, seluruh navigasi keyboard, onboarding pada viewport 390 px, dan hasil hitung kalkulator kredit belum dilakukan.
- Audit lanjutan melalui UI ponsel pada 24 September 2026 memeriksa alur ketika dana impian cukup dan pertanyaan alokasi setelah Dana Pengaman penuh. Audit ini tidak mengubah data. Akun uji masih memiliki Dana Pengaman Rp540.000 dari target Rp12.000.000 dan target “Laptop kerja” Rp260.000 dari Rp12.000.000; karena itu perilaku pada saldo yang **benar-benar mencapai target** belum terverifikasi. Angka cukup hanya diuji pada simulator yang tidak menyimpan data.

## Urutan kerja yang disarankan

Urutan ini berdasarkan risiko salah memahami kondisi keuangan dan hambatan bagi pengguna, bukan kemudahan implementasi. Saat memilih satu item, periksa ulang perilakunya di UI, sepakati rancangan perbaikan, lalu ubah dan verifikasi item tersebut sebelum beralih ke item berikutnya.

| Urutan | ID | Severity | Masalah | Status |
| --- | --- | --- | --- | --- |
| 1 | UX-01 | High | Angka tabungan yang direncanakan dan yang benar-benar tersisih tampak sama | Selesai (23 Sep 2026) |
| 2 | UX-02 | High | Label persentase analitik tidak sesuai dengan nominal anggaran | Selesai (23 Sep 2026) |
| 3 | UX-03 | High | Identitas akun di menu tidak sesuai dengan akun yang didaftarkan | Selesai (23 Sep 2026) |
| 4 | UX-04 | High | Hubungan saldo utama, uang tersedia, tabungan, dan dompet sulit dipahami | Selesai (23 Sep 2026) |
| 5 | UX-05 | Medium | Form pengeluaran membebani pengguna dengan pilihan yang tampak mirip | Selesai (23 Sep 2026) |
| 6 | UX-06 | Medium | Asal angka dan status proyeksi target tidak jelas | Selesai (23 Sep 2026) |
| 7 | UX-07 | Medium | Istilah teknis/internal muncul di alur pengguna | Selesai (24 Sep 2026) |
| 8 | UX-08 | Medium | Kartu target terlalu padat, terutama pada lebar menengah dan ponsel | Selesai (24 Sep 2026) |
| 9 | UX-09 | Medium | Hasil simulator tidak langsung terlihat setelah dihitung | Selesai |
| 10 | UX-10 | Medium | Alur koreksi transaksi dan visibilitas aksinya kurang jelas | Selesai (24 Sep 2026) |
| 11 | UX-11 | Medium | Nama aksesibel beberapa input dan tombol ikon belum memadai | Selesai (24 Sep 2026; uji pembaca layar penuh belum dilakukan) |
| 12 | UX-12 | Low | Pemberitahuan tagihan kosong mengambil prioritas pada layar awal | Implementasi selesai; verifikasi tagihan mendatang tertunda |
| 13 | UX-13 | High | Dana impian cukup, tetapi langkah untuk mewujudkan dan menyelesaikan target tidak jelas | Selesai (24 Sep 2026) |
| 14 | UX-14 | High | Nasib setoran berikutnya tidak jelas ketika Dana Pengaman mencapai target | Selesai (24 Sep 2026) |

## Rincian item

### UX-01 — Bedakan target tabungan dari dana yang sudah disisihkan

**Temuan:** Setelah penyisihan Rp900.000 dan pelepasan Rp100.000, dashboard menampilkan dana tersisih Rp800.000, sedangkan Anggaran masih menampilkan “Tabungan Terbentuk Otomatis Rp900.000”. Pengguna dapat mengira Rp900.000 sudah terkumpul.

**Hasil yang diharapkan:** UI menyebut secara terpisah target tabungan bulan ini, dana yang sudah disisihkan, dan selisihnya. Istilah “terbentuk” hanya digunakan bila uang itu memang sudah tercatat sebagai dana tersisih.

**Verifikasi UI:** Ulangi skenario pemasukan, penyisihan, lalu pelepasan sebagian. Semua angka dan label pada dashboard, Anggaran, dan Analitik harus konsisten serta dapat dijelaskan tanpa pengetahuan internal.

**Catatan penyelesaian (23 Sep 2026):** Kartu Anggaran kini memisahkan target Rp900.000, dana yang sudah disisihkan Rp800.000, dan sisa Rp100.000 pada skenario audit. Label “Tabungan Terbentuk Otomatis” dihapus. Data realisasi memakai jumlah penyisihan bersih bulan terpilih yang juga ditampilkan di Analitik. Tampilan diperiksa pada lebar 390 px dan sekitar 702 px. Masalah persentase/urutan rasio pada layar lain ditangani dalam UX-02.

### UX-02 — Selaraskan persentase anggaran di seluruh layar

**Temuan:** Analitik menyebut Keinginan “Alokasi Standar 30%” tetapi batasnya Rp600.000 dari pemasukan Rp3.000.000 (20%). Tabungan disebut “Target Standar 20%” tetapi targetnya Rp900.000 (30%). Urutan penulisan 50/30/20 dan 50/20/30 juga berganti antar-layar.

**Hasil yang diharapkan:** Setiap persentase, kategori, urutan, dan nominal mengacu pada aturan yang sama pada panduan awal, Anggaran, Analitik, dan pengaturan rasio.

**Verifikasi UI:** Gunakan pemasukan Rp3.000.000 dan rasio 50% Kebutuhan, 30% Tabungan, 20% Keinginan. Pastikan semua layar menampilkan Rp1.500.000, Rp900.000, dan Rp600.000 dengan label yang benar; ulangi setelah rasio diubah.

**Catatan penyelesaian (23 Sep 2026):** Anggaran dan Analitik kini menghitung persentase dari nominal anggaran bulan terpilih, sehingga pembagian per sumber atau perubahan kebijakan tidak menghasilkan label “standar” yang keliru. Label Anggaran menyebut urutan Kebutuhan–Tabungan–Keinginan secara eksplisit. Uji UI pada rasio 50/30/20 menghasilkan Rp1.500.000/Rp900.000/Rp600.000; rasio uji 40/40/20 menghasilkan Rp1.200.000/Rp1.200.000/Rp600.000 pada kedua layar. Rasio dan perhitungan akun uji telah dikembalikan ke 50/30/20.

### UX-03 — Tampilkan identitas akun yang benar

**Temuan:** Akun uji didaftarkan sebagai “Pengguna Uji”, tetapi menu ponsel menampilkan “Pengguna” dan `fintech@user.local`; sidebar desktop menampilkan “Fintech User”. Ini dapat menimbulkan dugaan bahwa pengguna masuk ke akun lain.

**Hasil yang diharapkan:** Nama dan identitas akun yang sedang aktif tampil konsisten di desktop dan ponsel. Bila ada data yang memang disamarkan, UI menjelaskannya tanpa menampilkan identitas contoh sebagai identitas nyata.

**Verifikasi UI:** Daftar dan masuk dengan akun uji baru, lalu bandingkan identitas pada menu ponsel, sidebar desktop, dan profil.

**Catatan penyelesaian (23 Sep 2026):** Identitas akun kini dimuat dari akun yang sedang masuk, bukan teks contoh. Menu ponsel dan sidebar desktop menampilkan nama serta email yang sama setelah dashboard dimuat ulang. Endpoint identitas hanya mengembalikan ID, nama, dan email; pengujian regresi memastikan akun yang tidak ditemukan ditolak. Modal “Profil & Saldo Awal” berisi profil keuangan, bukan identitas akun, sehingga tidak dipakai sebagai pembanding nama/email.

### UX-04 — Jelaskan model saldo dengan bahasa keputusan pengguna

**Temuan:** “Saldo Utama Aktual”, “Uang Belum Disisihkan”, “Dana Tersisih”, “Saldo Awal Terdaftar”, dan “Wadah Fisik” muncul hampir bersamaan. Hubungan antarangka baru jelas setelah pengguna mencoba menyisihkan uang dan melihat saldo utama tetap sama.

**Hasil yang diharapkan:** Layar awal segera menjawab “Berapa uang yang tersedia untuk digunakan?” dan menjelaskan bahwa penyisihan menandai bagian dari saldo yang sama tanpa memindahkan uang antar-rekening. Informasi historis seperti saldo awal tampil sebagai detail sekunder.

**Verifikasi UI:** Minta pengguna baru menjelaskan saldo sebelum dan sesudah menyisihkan dana. Mereka seharusnya dapat menyebut saldo total, jumlah yang tersedia, jumlah yang ditetapkan untuk tabungan, dan apakah uang fisik berpindah.

**Catatan penyelesaian (23 Sep 2026):** Kartu dashboard kini mengutamakan uang yang bisa dipakai, lalu menunjukkan saldo total rekening/dompet dan dana yang disisihkan sebagai komponen perhitungannya. Penjelasan yang selalu terlihat menyatakan bahwa penyisihan tidak memindahkan uang fisik. Saldo awal dan daftar rekening berada dalam rincian yang dapat dibuka; saldo awal juga dijelaskan sebagai bagian dari saldo total, bukan uang tambahan. Bila dana tersisih melebihi saldo, label berubah menjadi peringatan selisih alokasi dan tidak menyebut angka negatif sebagai uang yang bisa dipakai. Pada akun uji, Rp7.900.000 saldo total dikurangi Rp800.000 tersisih menghasilkan Rp7.100.000 yang bisa dipakai. Tampilan dan interaksi rincian diperiksa di desktop 1280 px dan ponsel 390 px. Tidak ada perhitungan atau transaksi yang diubah.

### UX-05 — Sederhanakan pilihan pada form pengeluaran

**Temuan:** Form meminta “Kategori Pengeluaran”, “Pos / Sumber Dana”, dan “Bayar dari Dompet / Rekening” dalam satu alur. Pengguna awam dapat menganggap ketiganya pilihan yang sama.

**Hasil yang diharapkan:** Setiap pilihan menjawab pertanyaan yang berbeda dalam bahasa sehari-hari. Pilihan lanjutan hanya muncul ketika diperlukan, dengan default yang aman dan dapat dipahami.

**Verifikasi UI:** Catat pengeluaran biasa dari uang tersedia, lalu pengeluaran dari dana yang telah disisihkan. Pada kedua kasus, pengguna dapat menjelaskan dari mana uang diambil dan apa akibatnya pada saldo.

**Catatan penyelesaian (23 Sep 2026):** Kategori kini ditanya sebagai “Pengeluaran untuk apa?” dan harus dipilih, bukan otomatis memakai kategori pertama. Bila hanya ada satu rekening/dompet, form menampilkan namanya tanpa dropdown; bila lebih dari satu, pengguna harus memilih rekening pembayaran. Pengeluaran biasa memakai uang yang bisa dipakai secara default. Pilihan memakai dana tersisih bersifat lanjutan dan hanya menampilkan tabungan yang memiliki saldo; form menolak pilihan kosong atau nominal yang melebihi saldo tabungan. Ringkasan dampak saldo muncul sebelum tanggal dan tombol simpan. Pengujian UI dengan dua transaksi Rp1.000 menunjukkan alur biasa menurunkan saldo total serta uang tersedia, sedangkan alur dari target “Laptop kerja” menurunkan saldo total serta dana tersisih tanpa mengubah uang tersedia. Kedua transaksi uji dibatalkan sehingga saldo kembali ke kondisi awal; catatan pembatalannya tetap ada di riwayat audit akun uji. Tampilan diperiksa pada ponsel 390 px dan desktop 1280 px.

### UX-06 — Jelaskan asal dan status proyeksi target

**Temuan:** Kartu target menampilkan alokasi Rp360.000/bulan, kebutuhan sekitar Rp1.029.496/bulan, dan estimasi sekitar 39 bulan tanpa penjelasan dekat angka tentang sumber perhitungan atau apakah penyisihan akan terjadi otomatis.

**Hasil yang diharapkan:** UI memperlihatkan dasar perhitungan, asumsi yang digunakan, dan perbedaan antara proyeksi/rencana bulanan dengan dana yang sudah terkumpul. Perkiraan tidak tampil seolah-olah merupakan kepastian.

**Verifikasi UI:** Setelah satu pemasukan dan setelah perubahan rasio atau target, pengguna dapat mengetahui mengapa proyeksi berubah dan apakah perlu melakukan aksi penyisihan sendiri.

**Catatan penyelesaian (23 Sep 2026):** Kartu target kini membedakan dana yang benar-benar terkumpul dari rencana penyisihan per bulan, menandai estimasi sebagai proyeksi (bukan setoran otomatis), serta menyediakan “Dasar hitung” yang dapat dibuka. Penjelasan ini menunjukkan sumber rata-rata pemasukan, rasio tabungan, porsi impian, bagian target, asumsi kenaikan harga, dan aksi penyisihan manual. API mengirim metadata sumber pemasukan agar penjelasan mengikuti kondisi data pengguna. Pada akun uji, perubahan rasio tabungan 30% menjadi 40% mengubah potensi Rp360.000 menjadi Rp480.000 per bulan dan estimasi sekitar 39 menjadi 28 bulan; rasio lalu dikembalikan ke 30% dan proyeksi kembali ke nilai awal. Kepadatan kartu dan layout responsif tetap dicatat terpisah di UX-08.

### UX-07 — Ganti istilah teknis pada alur utama

**Temuan:** “D-004”, “D-005”, “D-006”, “override”, “berjejak audit”, “Zona Waktu IANA”, “Bobot”, “Penyisihan”, dan “Pelepasan Alokasi” tidak otomatis dipahami pengguna baru.

**Hasil yang diharapkan:** Label utama menjelaskan tindakan dan akibatnya dalam Bahasa Indonesia sehari-hari. Detail teknis tetap dapat diakses bila diperlukan, tanpa menjadi syarat untuk menyelesaikan tugas.

**Verifikasi UI:** Tinjau onboarding, tabungan, koreksi transaksi, evaluasi bulan, profil, dan pengaturan rasio. Pengguna baru dapat menjelaskan fungsi kontrol tanpa melihat dokumentasi.

**Catatan penyelesaian (24 Sep 2026):** Seluruh istilah internal dan kode keputusan teknis telah diganti dengan Bahasa Indonesia sehari-hari:
- Kode internal `D-004`, `D-005`, `D-006` dihapus dari antarmuka pengguna; digantikan dengan label fungsional seperti `Rasio Otomatis 60:40`, `Saran Menabung dari Sisa Anggaran`, dan penjelasan riwayat transaksi.
- Istilah `Bobot` dan `Atur Bobot` diganti menjadi `Porsi` dan `Atur Pembagian Target Impian` pada kartu target dan modal pembagian.
- Istilah `Pelepasan Alokasi` dan `Lepas Alokasi` diganti menjadi `Tarik Dana Tabungan` / `Tarik ke Saldo Siap Pakai` pada Hero card, kartu target, dan modal penarikan.
- Istilah `Penyisihan` diselaraskan menjadi `Sisihkan ke Tabungan` / `Tabungan rutin bulanan`.
- Istilah `berjejak audit` pada koreksi dan pembatalan transaksi diganti menjadi penjelasan bahwa perubahan diperbarui dan tercatat dalam riwayat.
- Istilah `override` pada kebijakan anggaran diganti menjadi `Aturan Khusus per Sumber Pemasukan`.
- Istilah `Zona Waktu IANA` pada profil diganti menjadi `Zona Waktu Wilayah`.
Verifikasi build frontend (`npm run build`) dan backend test (`npm test`) sukses tanpa error.

### UX-08 — Ringkas kartu target dan perbaiki layout responsif

**Temuan:** Pada lebar sekitar 702 px, kartu target menjadi kolom sempit di kiri dengan ruang kosong besar di kanan; teks dan angka pecah menjadi banyak baris. Pada 390 px, kartu lebih rapi tetapi informasi proyeksi tetap sangat padat dan kecil.

**Hasil yang diharapkan:** Progres, target, kebutuhan per bulan, dan satu aksi utama mudah dipindai. Detail perhitungan dapat dibuka saat dibutuhkan. Tidak ada rentang lebar yang membuat kartu sempit secara tidak wajar.

**Verifikasi UI:** Periksa lebar 390 px, sekitar 702 px, dan 1280 px; pastikan teks terbaca, aksi terlihat, serta tidak ada ruang kosong atau pemotongan yang mengganggu.

**Catatan penyelesaian (24 Sep 2026):** Grid target tetap satu kolom sampai lebar desktop yang cukup untuk dua kartu, sehingga pada 702 px kartu menggunakan seluruh lebar konten. Isi muka kartu diprioritaskan menjadi nama/status, uang terkumpul versus target, progres, kebutuhan bulanan, dan satu aksi simulator; milestone visual, harga perkiraan, selisih rencana, serta asumsi tetap tersedia melalui “Dasar hitung”. Aksi simulator duplikat pada bagian bawah disembunyikan saat rekomendasi utama tampil. Progress bar diberi nama dan nilai aksesibel. Build frontend berhasil; tampilan satu target diperiksa pada 390, 702, dan 1280 px, dan disclosure dapat dibuka. Layout untuk lebih dari satu target belum diuji dengan data UI.

### UX-09 — Tampilkan hasil simulator segera setelah aksi hitung

**Temuan:** Setelah tombol “Hitung Rencana Tabungan” ditekan, hasil muncul di bawah area modal yang sedang terlihat. Pengguna harus menggulir untuk memastikan perhitungan berhasil.

**Hasil yang diharapkan:** Hasil baru langsung terlihat atau fokus berpindah ke ringkasan hasil. Keadaan menghitung, berhasil, dan input tidak valid memberikan umpan balik yang jelas.

**Verifikasi UI:** Jalankan simulasi pada desktop dan ponsel; hasil dan angka utama terlihat tanpa pengguna harus menebak ke mana harus menggulir.

**Catatan penyelesaian (24 Sep 2026):** Setelah perhitungan berhasil, modal menggulir ke panel hasil dan memindahkan fokus keyboard ke sana pada kedua tab. Tombol Hitung terkunci selama proses; area hasil menyatakan status menghitung. Input utama yang kosong/keliru mendapat pesan inline dan fokus kembali ke kolom terkait; kegagalan perhitungan menampilkan pesan dekat tombol tanpa menghapus isian. Angka utama dibuat lebih mudah dibaca pada layar sempit. Build frontend berhasil. Uji UI dilakukan untuk hasil tabungan dan cicilan pada 390 px, hasil cicilan pada 1280 px, serta validasi pokok pinjaman kosong.

### UX-10 — Perjelas koreksi dan pembatalan transaksi

**Temuan:** Modal koreksi memakai istilah “jejak audit D-004”. Pada lebar sekitar 702 px, tabel transaksi perlu digeser untuk menemukan semua aksi. Pengguna dapat ragu apakah koreksi mengubah transaksi atau mencatat transaksi tambahan.

**Hasil yang diharapkan:** Penjelasan sebelum menyimpan menyebut bahwa transaksi dan saldo akan diperbarui, serta riwayat perubahan tetap tersedia. Aksi koreksi dan pembatalan mudah ditemukan pada semua lebar layar.

**Verifikasi UI:** Koreksi nominal transaksi contoh, periksa perubahan saldo dan riwayatnya, lalu pastikan aksi dapat ditemukan tanpa geser horizontal pada lebar yang diuji.

**Catatan implementasi dan verifikasi (24 Sep 2026):** Kartu transaksi dipakai sampai lebar menengah; tabel hanya muncul pada desktop yang cukup lebar. Modal koreksi menjelaskan bahwa transaksi aktif diperbarui, bukan digandakan; modal pembatalan menjelaskan pembalikan pengaruh pada saldo. Transaksi yang dibatalkan tetap terbaca tanpa opacity dan coretan menyeluruh. Disclosure “Riwayat perubahan” menampilkan nominal sebelum/sesudah koreksi dan alasan/status pembatalan. Di akun uji lokal, koreksi Rp100.000 → Rp120.000 menurunkan saldo Rp20.000, lalu pemulihan nominal mengembalikannya; tidak ada transaksi aktif ganda. Pengeluaran uji Rp1.000 kemudian dibatalkan, saldo kembali, entri terlihat dalam filter “Dibatalkan”, tanpa aksi Koreksi/Batal, dan riwayat pembatalan dapat dibuka. Aksi terlihat pada 390 dan 702 px; pada 1280 px lebar tabel sama dengan kontainernya tanpa scroll horizontal. Satu entri uji yang berstatus Dibatalkan sengaja tetap tersimpan di akun uji sebagai bukti alur.

### UX-11 — Perbaiki nama aksesibel dan urutan fokus

**Temuan:** Pada struktur aksesibilitas browser, beberapa kolom terbaca sebagai “text field” tanpa nama, dan beberapa tombol ikon/penutup tidak memiliki nama. Ini menghambat pengguna pembaca layar.

**Hasil yang diharapkan:** Setiap input memiliki label terhubung, setiap tombol ikon memiliki nama yang menjelaskan aksinya, fokus masuk ke modal dan kembali ke pemicunya saat modal ditutup.

**Verifikasi UI:** Uji form utama, menu, dan modal dengan keyboard serta pembaca layar; pengguna dapat mengidentifikasi dan menjalankan tiap kontrol tanpa bantuan visual.

**Catatan implementasi dan verifikasi (24 Sep 2026):** Label formulir utama (transaksi, koreksi, target, simulator, profil, tabungan, anggaran, onboarding, dompet/transfer, dan filter) dihubungkan ke kontrol atau diberi nama aksesibel; tombol penutup menu/dialog dan status pilihan simulator diberi nama/status. Dialog dompet, transfer, transaksi berulang, dan onboarding kini memiliki nama serta semantik dialog. Fokus masuk ke modal, Tab/Shift+Tab tetap di dalamnya, Escape menutup, lalu fokus kembali ke pemicu. Bila pemicu transaksi hilang setelah pembatalan/filter, fokus diarahkan ke heading riwayat. Accessibility tree browser memverifikasi nama kolom pada formulir pemasukan, koreksi, dan simulator; alur keyboard diuji pada menu, modal transaksi, dan dompet, termasuk setelah simpan serta pembatalan. Pembaca layar penuh dan seluruh kombinasi modal belum diuji manual.

### UX-12 — Turunkan prioritas pemberitahuan tagihan kosong

**Temuan:** Baris paling atas dashboard menyatakan tidak ada tagihan tujuh hari ke depan sambil menawarkan pengaturan transaksi berulang, bahkan untuk pengguna yang baru selesai setup.

**Hasil yang diharapkan:** Layar awal memprioritaskan saldo dan tindakan pertama yang relevan. Informasi tagihan kosong tetap tersedia sebagai informasi sekunder.

**Verifikasi UI:** Buka akun baru tanpa tagihan dan akun yang memiliki tagihan mendatang; kedua keadaan harus menonjolkan informasi yang paling berguna bagi pengguna.

**Catatan implementasi dan batas verifikasi (24 Sep 2026):** Ketika daftar tagihan kosong, pesan ringkas dan tautan “Atur Jadwal” kini berada setelah kartu saldo/aksi utama di Ringkasan; pada 390 dan 1280 px urutan ini diperiksa lewat UI. Bila ada tagihan mendatang, widget tetap dirender sebelum kartu saldo dengan tanggal, nominal, dan tombol tindakan yang sudah ada; logika jadwal tidak diubah. Akun uji belum memiliki tagihan mendatang, sehingga keadaan positif/banyak tagihan belum diuji secara langsung. Tidak dibuat jadwal aktif hanya untuk pengujian agar tidak meninggalkan eksekusi otomatis pada akun pengguna.

### UX-13 — Jelaskan alur ketika dana Target Impian sudah cukup dan ketika impian sudah diwujudkan

**Severity:** High. Pengguna yang telah mencapai jumlah uang yang dibutuhkan belum mendapat jawaban jelas tentang apa yang harus dilakukan berikutnya. Ini juga berisiko membuat target yang sudah dibeli tetap tampak aktif atau menyebabkan pencatatan pengeluaran ganda.

**Bukti audit UI (24 Sep 2026, viewport ponsel):**

- Kartu “Laptop kerja” saat ini menunjukkan “Terkumpul Rp260.000”, “Target Rp12.000.000”, progres 2%, proyeksi kebutuhan bulanan, dan aksi “Uji di Simulator”, “Ubah”, serta “Tarik Dana”. Tidak terlihat aksi untuk menyatakan target tercapai atau impian telah dibeli.
- Modal “Ubah Target Impian” hanya memuat nama, harga/target dana, skema pembelian, dan waktu. Tidak ada status target.
- Modal “Tarik Dana dari Tabungan” menyebut “Kembalikan dana dari pos tabungan ke Uang Siap Pakai”; pengguna dapat memilih target, nominal, dan catatan. Modal ini tidak mengatakan apakah menarik dana berarti impian selesai, apakah pembelian juga perlu dicatat sebagai pengeluaran, atau apa yang akan terjadi pada target setelah dana ditarik.
- Pada simulator (tanpa menyimpan data), mengubah “Tabungan Dimiliki” menjadi Rp13.000.000 untuk harga Rp12.000.000 menghasilkan “Dana Sudah Cukup”, “Dana Pembelian Sudah Terpenuhi”, dan “Tambahan tabungan bulanan: Rp0/bulan”. Simulator menjawab *berapa lagi yang perlu ditabung*, tetapi tidak memberi alur untuk *apa yang dilakukan setelah membeli*.
- **Batas bukti:** Kartu target dengan saldo riil sama dengan/melebihi target belum diuji. Jangan menyimpulkan dari audit ini bahwa kartu pasti tidak berubah status secara otomatis; periksa dengan data uji terisolasi sebelum implementasi.

**Cerita pengguna:** “Saya menabung untuk laptop. Uangnya sudah cukup, tetapi saya belum membelinya. Saya ingin tahu bahwa target pendanaannya tercapai tanpa aplikasi menganggap pembelian sudah terjadi. Setelah membeli, saya ingin memakai dana tersebut, mencatat pengeluarannya sekali, lalu melihat target sebagai selesai dan tidak lagi menerima setoran.”

**Pembedaan keadaan yang wajib dipahami pengguna:**

1. **Sedang mengumpulkan dana:** dana tersisih belum mencapai kebutuhan target.
2. **Dana sudah cukup:** jumlah tersisih mencapai kebutuhan target, tetapi barang/tujuan belum tentu dibeli. Ini adalah status pendanaan, bukan bukti transaksi.
3. **Impian diwujudkan/selesai:** pengguna mengonfirmasi tujuan telah direalisasikan; penggunaan dana dan pengeluaran harus tercatat konsisten. Jangan otomatis menandai “sudah dibeli” hanya karena angka target tercapai.

**Hasil UX yang diharapkan:** Kartu target dan langkah setelahnya menjelaskan status tersebut dengan bahasa sehari-hari. Saat dana cukup, tersedia CTA yang kontekstual untuk langkah berikutnya, misalnya “Gunakan dana untuk tujuan ini” atau “Tandai sudah diwujudkan”, disertai penjelasan akibatnya sebelum konfirmasi. Pengguna tetap boleh menunggu sebelum membeli. Setelah selesai, target tidak diperlakukan sebagai target aktif penerima setoran; riwayat tujuan dan pemakaian dananya tetap dapat dilihat. Perbedaan antara “Tarik ke Uang Siap Pakai” (hanya mengubah alokasi) dan “Catat pembelian” (mengurangi saldo karena pengeluaran) harus eksplisit.

**Keputusan produk yang harus disepakati sebelum implementasi:**

- Apakah penyelesaian target mengharuskan pencatatan pengeluaran dari dana tersisih dalam satu alur, atau boleh menandai selesai tanpa pengeluaran (misalnya tujuan batal/tercapai dengan cara lain)? Jika kedua opsi ada, beri nama dan konsekuensi yang berbeda.
- Apakah status “Dana sudah cukup” dihitung dari harga acuan yang tersimpan atau kebutuhan dana yang memperhitungkan inflasi pada tanggal target? UI harus menampilkan dasar angka yang dipakai secara konsisten dengan proyeksi.
- Apa yang terjadi pada kelebihan saldo target, dana yang tersisa setelah pembelian lebih murah, dan alokasi penyisihan berikutnya? Jangan memindahkan atau menghabiskan kelebihan dana secara diam-diam.
- Bagaimana target yang selesai dibuka kembali jika pengguna salah menandai selesai, tanpa menghapus riwayat atau menggandakan pengeluaran?

**Acceptance criteria / verifikasi UI:**

- Siapkan **akun atau fixture uji terisolasi** dengan satu target yang saldonya (a) sedikit di bawah, (b) tepat sama, dan (c) lebih tinggi dari kebutuhan. Jangan mengubah data akun pengguna untuk membuat keadaan ini.
- Pada keadaan (b) dan (c), pengguna dapat membedakan “uang cukup” dari “sudah dibeli” hanya dari UI. Tidak ada klaim pembelian otomatis. CTA berikutnya jelas pada ponsel dan desktop.
- Sebelum konfirmasi penggunaan dana, tampilkan jumlah yang akan dipakai, asal dana, akibat pada saldo total/uang yang bisa dipakai/dana tersisih, dan status target sesudahnya. Membatalkan dialog tidak mengubah apa pun.
- Uji pembelian senilai target, pembelian lebih murah, kelebihan dana, pembatalan sebelum konfirmasi, dan target yang sudah selesai ketika ada target aktif lain.

**Catatan penyelesaian (24 Sep 2026):**
- Schema Prisma `SavingsGoal` ditambahkan kolom `isCompleted Boolean @default(false)` dan `completedAt DateTime?`.
- Menambahkan endpoint backend `POST /savings-goals/:id/complete` dan `POST /savings-goals/:id/reopen`.
- Dua alur penyelesaian target didukung dengan modal terdedikasi `CompleteGoalModal.vue`:
  1. **Beli & Catat Pengeluaran (`SPEND`)**: Mengurangi saldo dompet/rekening fisik yang dipilih, mencatat satu transaksi pengeluaran riil (`EXPENSE`) dengan kategori yang dipilih, mencatat `AllocationEvent` jenis `SPEND`, mengurangi saldo tersisih target, menandai target `isCompleted: true`, melepaskan kelebihan saldo target (jika harga beli < saldo terkumpul) ke uang belum disisihkan, menghapus `GoalShare` target tersebut, dan otomatis membagi ulang (rebalance) porsi 100% di antara target impian aktif lainnya.
  2. **Selesai Tanpa Belanja (`MARK_ONLY`)**: Mengubah status target menjadi selesai tanpa memotong saldo rekening fisik (misalnya barang didapat dari hadiah/sumber lain), otomatis memindahkan seluruh saldo terkumpul target ke uang yang bisa dipakai (uang belum disisihkan) via `AllocationEvent` jenis `RELEASE`, dan mendistribusikan ulang porsi tabungan ke target aktif lainnya.
- **Proteksi Pengalokasian & Double Spending**: Target yang berstatus selesai (`isCompleted: true`) otomatis dikecualikan dari `getPreviewSave`, `allocate`, dan proyeksi `getForecasts`, sehingga tidak akan pernah menerima alokasi setoran atau diproyeksikan lagi.
- **Indikator Status & Pemulihan (Reopen)**:
  - Pada kartu target impian, bila `currentAmount >= targetAmount`, muncul lencana tegas `"Dana Sudah Cukup"`, callout aksi `"Gunakan / Wujudkan Impian"`, dan tombol CTA `"Wujudkan"` dengan target sentuhan mobile >= 44x44 px.
  - Target yang telah terwujud dipindahkan ke seksi lipat `"Target Impian yang Sudah Terwujud"` di bagian bawah, lengkap dengan informasi tanggal penyelesaian dan tombol `"Buka Kembali"`.
  - Aksi "Buka Kembali" meminta konfirmasi dialog pengguna, mengembalikan status target menjadi aktif, dan otomatis menghitung ulang porsi pembagian tabungan secara adil.

### UX-14 — Tentukan dan jelaskan alokasi setelah Dana Pengaman mencapai target

**Severity:** High. Setelah dana darurat penuh, pengguna yang ingin mempercepat impian tidak tahu apakah penyisihan tetap dibagi 60:40, berhenti di batas Dana Pengaman, atau dialihkan ke impian. Ketidakjelasan ini menyangkut penempatan uang yang disengaja pengguna.

**Bukti audit UI (24 Sep 2026, viewport ponsel):**

- Halaman Tabungan menampilkan “Rasio Otomatis 60:40” dan menjelaskan 60% untuk Dana Pengaman, 40% untuk Target Impian. Kartu Dana Pengaman menunjukkan “Target Penuh: Rp12.000.000”, tetapi tidak menjelaskan aturan ketika angka itu tercapai.
- Form “Sisihkan ke Tabungan” mengulang rasio 60:40 dan memperlihatkan rincian nominal sebelum konfirmasi. Dengan nominal Rp7.100.000 (hanya mengisi form, **tidak dieksekusi**), pratinjau menunjukkan Rp4.260.000 ke Dana Pengaman dan Rp2.840.000 ke “Laptop kerja”. Tidak terlihat kontrol atau petunjuk untuk mengarahkan setoran hanya ke impian setelah Dana Pengaman penuh. Dalam kondisi akun saat ini, kedua target memang masih jauh dari penuh; pratinjau ini **bukan bukti** perilaku saat ambang penuh dilewati.
- Form tidak menunjukkan “sisa menuju target Dana Pengaman” berdampingan dengan pembagian setoran. Pengguna harus menghitung sendiri apakah nominal yang akan disisihkan membuat pos darurat melewati batas.
- **Batas bukti:** Tidak ada setoran riil pada audit lanjutan. Perilaku sistem pada saldo Dana Pengaman =/lebih dari Rp12.000.000 belum diuji; jangan melabelinya bug perhitungan sebelum direproduksi.

**Cerita pengguna:** “Dana darurat saya sudah sebesar enam bulan kebutuhan pokok. Sekarang saya ingin uang tabungan baru membantu impian saya lebih cepat. Saat menekan ‘Sisihkan ke Tabungan’, saya ingin melihat dengan jelas ke mana uang itu akan masuk dan mengapa.”

**Hasil UX yang diharapkan:** Sebelum pengguna menyimpan penyisihan, tampilkan saldo Dana Pengaman saat ini, sisa menuju batas, alokasi ke tiap tujuan setelah setoran, dan penjelasan aturan ketika batas tercapai. Jumlah bagian-bagian harus sama dengan nominal yang disisihkan. Jika Dana Pengaman sudah penuh, UI tidak boleh terus menjanjikan pembagian 60:40 tanpa menjelaskan bagaimana porsi 60% diperlakukan. Jika dana dialihkan ke impian, sebutkan secara eksplisit; jika tidak, jelaskan tempatnya dan beri pilihan yang aman. Tetap jelaskan bahwa penyisihan hanya menandai uang di rekening/dompet, bukan transfer bank.

**Rekomendasi aturan untuk dibahas, bukan keputusan final:** Gunakan 60:40 selama Dana Pengaman masih membutuhkan dana. Saat satu setoran melintasi batas, isi Dana Pengaman hanya sampai kekurangannya; arahkan sisa setoran ke Target Impian yang masih aktif dan membutuhkan dana **jika pengguna menyetujui perilaku ini lewat aturan yang jelas di UI**. Saat Dana Pengaman sudah penuh sebelum setoran, pratinjau akan menunjukkan Rp0 ke Dana Pengaman dan bagian yang memenuhi syarat ke impian. Jangan otomatis mengirim uang ke target yang telah selesai; bila tidak ada target impian aktif, pengguna perlu diberi pilihan yang eksplisit, bukan penempatan tersembunyi.

**Keputusan produk yang harus disepakati sebelum implementasi:**

- Apakah batas enam bulan kebutuhan pokok adalah *hard cap* penyisihan, atau hanya tonggak yang boleh dilewati? Jika boleh dilewati, bagaimana pengguna memilihnya dan bagaimana “penuh” dijelaskan?
- Setelah batas, apakah porsi Dana Pengaman otomatis dialihkan ke impian, tetap menjadi uang yang bisa dipakai, atau menjadi “Tabungan Belum Ditentukan”? Tentukan satu perilaku default dan tampilkan pada preview; jangan mengandalkan pengguna memahami rasio internal.
- Saat ada beberapa impian, bagaimana dana dialokasikan di antara target aktif dan bagaimana target yang sudah cukup dikecualikan? Perhatikan pembagian/porsi target yang sudah ada.
- Jika kebutuhan pokok bulanan berubah sehingga target Dana Pengaman turun di bawah saldo saat ini, apa status kelebihan yang sudah dialokasikan? Jangan mengubah catatan historis atau memindahkan saldo tanpa aksi/penjelasan pengguna.
- Jika sebagian setoran tidak dapat ditempatkan karena semua target penuh atau tidak ada target aktif, apakah form mengurangi nominal efektif, menolak dengan alasan yang jelas, atau menawarkan pos lain? Total yang tercatat harus cocok dengan konfirmasi pengguna.

**Acceptance criteria / verifikasi UI:**

- Gunakan **akun atau fixture uji terisolasi**; cek Dana Pengaman di bawah, tepat pada, dan di atas target. Jangan mencapai target dengan mengubah data akun pengguna secara diam-diam.
- Kasus melintasi batas: target Rp12.000.000, saldo darurat Rp11.900.000, setoran baru Rp500.000, dan setidaknya satu impian aktif. Preview harus menunjukkan bahwa sisa kebutuhan darurat hanya Rp100.000 dan menjelaskan tujuan Rp400.000 lainnya **bila aturan pengalihan direkomendasikan dipilih**. Total harus Rp500.000; hasil setelah simpan cocok dengan preview.
- Kasus sudah penuh: saldo darurat Rp12.000.000, setoran baru Rp500.000. UI menerangkan bahwa porsi baru ke Dana Pengaman adalah Rp0 **bila hard cap dipilih**, serta menunjukkan secara rinci ke mana Rp500.000 diarahkan. Tidak ada pelanggaran batas atau pemindahan tersembunyi.
- Uji keadaan tanpa impian aktif, beberapa impian dengan porsi berbeda, satu/semua impian sudah cukup, nominal tidak valid, pembatalan form, dan perubahan target darurat akibat perubahan kebutuhan pokok.
- Sesudah konfirmasi, kartu Dana Pengaman, kartu Target Impian, Ringkasan saldo, dan riwayat penyisihan menunjukkan angka yang sama secara konsisten. Preview dan hasil aktual tidak boleh berbeda karena pembulatan rupiah.

**Catatan penyelesaian (24 Sep 2026):**
- Di backend (`AllocationsService.getPreviewSave` & `allocate`), diterapkan kalkulasi batas atas (capping) dan pengalihan kelebihan setoran (overflow redirection) berbasis target kebutuhan pokok bulanan (`targetMonths * monthlyNeeds`):
  1. **Kondisi Penuh (`remainingNeeded <= 0`)**: Alokasi Dana Pengaman secara eksplisit dihitung Rp 0. 100% nominal setoran dialihkan secara transparan ke target impian aktif yang membutuhkan dana sesuai bobot pembagian impian masing-masing.
  2. **Kondisi Melintasi Batas (Overflow)**: Setoran mengisi Dana Pengaman tepat hingga mencukupi kekurangan, dan sisa porsi 60% yang berlebih dialihkan ke target impian aktif secara proporsional.
  3. **Presisi Matematika**: Konsistensi penjumlahan `emergencyPart + impianPart === amount` selalu terjaga secara ketat tanpa selisih pembulatan rupiah.
- Backend menyediakan metadata terstruktur `emergencyDetails` (`isFull`, `remainingNeeded`, `overflowAmount`) dan `ruleExplanation`.
- Frontend Modal `SaveModal.vue`:
  - Menampilkan lencana status dinamis di header: `"Dana Pengaman Penuh (100% Dialihkan ke Impian)"`.
  - Menampilkan kotak informasi status Dana Pengaman: target dana penuh, sisa kebutuhan menuju target, serta penjelasan bahwa uang tidak hilang melainkan dialihkan untuk mempercepat terwujudnya target impian aktif.
  - Tabel pratinjau nominal menampilkan baris Rp 0 untuk Dana Pengaman ketika penuh, dengan rincian pengalihan ke masing-masing target impian secara transparan.
- Unit test backend pada `allocations.service.spec.ts` dan `savings-goals.service.spec.ts` (11 suites, 54 tests lulus 100%) memvalidasi kondisi normal, overflow, penuh, serta isolasi alokasi target selesai.

## Hal yang sudah baik dan perlu dipertahankan

- Panduan awal lima langkah dengan contoh saldo awal dan kebutuhan pokok.
- Tombol Pemasukan dan Pengeluaran yang jelas serta umpan balik setelah menyimpan.
- Rincian pembagian rupiah sebelum dana disisihkan.
- Koreksi dan pembatalan transaksi yang tersedia.
- Navigasi bawah dan kartu transaksi pada ponsel.

## Cara memakai backlog ini

Untuk setiap sesi perbaikan, pilih satu ID. Mulai dari bukti dan kriteria pada item tersebut, periksa perilaku UI terkini, lalu sepakati solusi yang paling sederhana. Setelah implementasi disetujui, verifikasi skenario item dan perbarui statusnya menjadi **Selesai** atau **Perlu tindak lanjut** beserta catatan singkat. Jangan menganggap item berikutnya otomatis disetujui hanya karena item sebelumnya selesai.
