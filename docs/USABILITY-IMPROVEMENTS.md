# Backlog Perbaikan Usability

Dokumen ini mencatat temuan audit dari sudut pandang pengguna baru. Ini adalah daftar masalah dan hasil yang diharapkan, bukan keputusan teknis atau izin untuk langsung mengubah kode. Perbaikan dikerjakan **satu per satu** setelah ruang lingkup item yang dipilih disepakati.

## Dasar audit

- Pengujian melalui UI `http://localhost:5173/` pada 23 September 2026, tanpa membaca source code atau dokumentasi saat audit.
- Akun uji lokal dibuat dengan data fiktif. Skenario mencakup setup awal, pemasukan Rp3.000.000, pengeluaran Rp100.000, target “Laptop kerja”, penyisihan Rp900.000, pelepasan Rp100.000, anggaran, riwayat, dan simulator.
- Tampilan diperiksa pada desktop 1280 px, ponsel 390 px, dan lebar browser awal sekitar 702 px.
- Pengujian pembaca layar penuh, seluruh navigasi keyboard, onboarding pada viewport 390 px, dan hasil hitung kalkulator kredit belum dilakukan.

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
| 7 | UX-07 | Medium | Istilah teknis/internal muncul di alur pengguna | Belum dikerjakan |
| 8 | UX-08 | Medium | Kartu target terlalu padat, terutama pada lebar menengah dan ponsel | Belum dikerjakan |
| 9 | UX-09 | Medium | Hasil simulator tidak langsung terlihat setelah dihitung | Belum dikerjakan |
| 10 | UX-10 | Medium | Alur koreksi transaksi dan visibilitas aksinya kurang jelas | Belum dikerjakan |
| 11 | UX-11 | Medium | Nama aksesibel beberapa input dan tombol ikon belum memadai | Belum dikerjakan |
| 12 | UX-12 | Low | Pemberitahuan tagihan kosong mengambil prioritas pada layar awal | Belum dikerjakan |

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

### UX-08 — Ringkas kartu target dan perbaiki layout responsif

**Temuan:** Pada lebar sekitar 702 px, kartu target menjadi kolom sempit di kiri dengan ruang kosong besar di kanan; teks dan angka pecah menjadi banyak baris. Pada 390 px, kartu lebih rapi tetapi informasi proyeksi tetap sangat padat dan kecil.

**Hasil yang diharapkan:** Progres, target, kebutuhan per bulan, dan satu aksi utama mudah dipindai. Detail perhitungan dapat dibuka saat dibutuhkan. Tidak ada rentang lebar yang membuat kartu sempit secara tidak wajar.

**Verifikasi UI:** Periksa lebar 390 px, sekitar 702 px, dan 1280 px; pastikan teks terbaca, aksi terlihat, serta tidak ada ruang kosong atau pemotongan yang mengganggu.

### UX-09 — Tampilkan hasil simulator segera setelah aksi hitung

**Temuan:** Setelah tombol “Hitung Rencana Tabungan” ditekan, hasil muncul di bawah area modal yang sedang terlihat. Pengguna harus menggulir untuk memastikan perhitungan berhasil.

**Hasil yang diharapkan:** Hasil baru langsung terlihat atau fokus berpindah ke ringkasan hasil. Keadaan menghitung, berhasil, dan input tidak valid memberikan umpan balik yang jelas.

**Verifikasi UI:** Jalankan simulasi pada desktop dan ponsel; hasil dan angka utama terlihat tanpa pengguna harus menebak ke mana harus menggulir.

### UX-10 — Perjelas koreksi dan pembatalan transaksi

**Temuan:** Modal koreksi memakai istilah “jejak audit D-004”. Pada lebar sekitar 702 px, tabel transaksi perlu digeser untuk menemukan semua aksi. Pengguna dapat ragu apakah koreksi mengubah transaksi atau mencatat transaksi tambahan.

**Hasil yang diharapkan:** Penjelasan sebelum menyimpan menyebut bahwa transaksi dan saldo akan diperbarui, serta riwayat perubahan tetap tersedia. Aksi koreksi dan pembatalan mudah ditemukan pada semua lebar layar.

**Verifikasi UI:** Koreksi nominal transaksi contoh, periksa perubahan saldo dan riwayatnya, lalu pastikan aksi dapat ditemukan tanpa geser horizontal pada lebar yang diuji.

### UX-11 — Perbaiki nama aksesibel dan urutan fokus

**Temuan:** Pada struktur aksesibilitas browser, beberapa kolom terbaca sebagai “text field” tanpa nama, dan beberapa tombol ikon/penutup tidak memiliki nama. Ini menghambat pengguna pembaca layar.

**Hasil yang diharapkan:** Setiap input memiliki label terhubung, setiap tombol ikon memiliki nama yang menjelaskan aksinya, fokus masuk ke modal dan kembali ke pemicunya saat modal ditutup.

**Verifikasi UI:** Uji form utama, menu, dan modal dengan keyboard serta pembaca layar; pengguna dapat mengidentifikasi dan menjalankan tiap kontrol tanpa bantuan visual.

### UX-12 — Turunkan prioritas pemberitahuan tagihan kosong

**Temuan:** Baris paling atas dashboard menyatakan tidak ada tagihan tujuh hari ke depan sambil menawarkan pengaturan transaksi berulang, bahkan untuk pengguna yang baru selesai setup.

**Hasil yang diharapkan:** Layar awal memprioritaskan saldo dan tindakan pertama yang relevan. Informasi tagihan kosong tetap tersedia sebagai informasi sekunder.

**Verifikasi UI:** Buka akun baru tanpa tagihan dan akun yang memiliki tagihan mendatang; kedua keadaan harus menonjolkan informasi yang paling berguna bagi pengguna.

## Hal yang sudah baik dan perlu dipertahankan

- Panduan awal lima langkah dengan contoh saldo awal dan kebutuhan pokok.
- Tombol Pemasukan dan Pengeluaran yang jelas serta umpan balik setelah menyimpan.
- Rincian pembagian rupiah sebelum dana disisihkan.
- Koreksi dan pembatalan transaksi yang tersedia.
- Navigasi bawah dan kartu transaksi pada ponsel.

## Cara memakai backlog ini

Untuk setiap sesi perbaikan, pilih satu ID. Mulai dari bukti dan kriteria pada item tersebut, periksa perilaku UI terkini, lalu sepakati solusi yang paling sederhana. Setelah implementasi disetujui, verifikasi skenario item dan perbarui statusnya menjadi **Selesai** atau **Perlu tindak lanjut** beserta catatan singkat. Jangan menganggap item berikutnya otomatis disetujui hanya karena item sebelumnya selesai.
