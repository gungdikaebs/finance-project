# Aturan kerja

## Komunikasi dan kewenangan

- Gunakan Bahasa Indonesia; pertahankan nama teknis. Jelaskan istilah yang tidak umum secara singkat.
- Perlakukan paket ini sebagai aturan kerja dalam batas instruksi sistem, lingkungan, dan arahan pengguna yang berlaku. Jika konflik penting belum terselesaikan, jelaskan konfliknya sebelum tindakan terkait.
- Pengguna menentukan arah, cakupan, dan pilihan berdampak besar. Agent mengurus detail rutin dalam rencana yang disetujui.
- Commit, merge, dan push dilakukan pengguna. Deploy, operasi destruktif, atau perubahan data nyata memerlukan izin eksplisit untuk tindakan tersebut.
- Pertahankan perubahan pengguna yang sudah ada. Laporkan masalah di luar cakupan sebagai catatan, lalu lanjutkan pekerjaan yang diminta.

## Memilih jalur

**Jalur singkat:** typo, copy, spacing, atau bug sederhana dengan penyebab jelas dan dampak lokal. Periksa konteks, lakukan perubahan minimal jika diminta, periksa hasil sesuai kesepakatan, dan laporkan singkat. Tidak perlu planning gate penuh.

**Jalur lengkap:** fitur baru, perubahan alur, kontrak API, relasi data, dependency baru, refactor besar, atau perubahan dengan dampak belum jelas. Ikuti tahapan di bawah. Nilai risiko dari perilaku yang berubah, bukan jumlah baris atau nama komponen.

Permintaan diagnosis atau review menghasilkan temuan; implementasi dilakukan jika pengguna juga meminta perbaikan. Jika temuan memperbesar cakupan pekerjaan yang disetujui, kembali ke diskusi untuk bagian tersebut.

## 1. Pahami kebutuhan dan proyek

Pelajari pola, stack, dan kode terkait sebelum bertanya tentang fakta yang dapat ditemukan. Interview singkat membahas hal yang belum jelas:

- Masalah, pengguna, pemicu, prasyarat, urutan tindakan, dan hasil akhir.
- Data yang dibutuhkan, hak akses, kondisi gagal yang relevan, serta batas fitur.
- Contoh hasil yang dianggap benar dan cara pengguna ingin memeriksanya.

Ajukan pertanyaan yang jawabannya sudah bisa diputuskan sekarang. Berikan rekomendasi beserta alasan; challenge pilihan yang tidak menyelesaikan masalah atau menambah kerumitan tanpa manfaat jelas.

Tahap selesai ketika alur dan batas pekerjaan dapat dijelaskan kembali secara konkret. Contoh: memilih kamar merupakan prasyarat registrasi tenant jika itu alur yang disepakati; urutan ini tidak boleh diganti berdasarkan asumsi agent.

## 2. Riset dan desain sesuai kebutuhan

Untuk keputusan yang belum jelas, bandingkan 2–3 pendekatan yang relevan dan rekomendasikan satu. Jelaskan manfaat, biaya/kerumitan, serta kecocokan dengan proyek. Gunakan dokumentasi primer untuk fakta teknis dan catat sumber bila riset menjadi dasar keputusan. Riset tidak wajib untuk detail rutin yang sudah ditetapkan proyek.

Untuk pekerjaan visual, periksa screenshot atau link referensi yang diberikan. Identifikasi konsep, layout, warna, tipografi, dan interaksi yang relevan; konfirmasi interpretasi dengan pengguna. Jika referensi tidak dapat diakses, nyatakan keterbatasannya.

Tunjukkan alur, daftar isi halaman, serta sketsa yang cukup konkret untuk menilai layout sebelum implementasi penuh. Bentuk sketsa menyesuaikan kebutuhan dan alat yang tersedia. Tentukan kondisi loading, kosong, error, dan responsif jika relevan. Keputusan warna dan tipografi harus terlihat pada usulan visual atau penjelasan pendampingnya.

Tahap selesai ketika pilihan yang berpengaruh pada rencana sudah disepakati atau ditandai jelas sebagai keputusan yang masih menunggu.

## 3. Rencana dan persetujuan

Simpan pada file tugas: tujuan, alur, cakupan masuk/keluar, kriteria penerimaan, area kode terdampak, langkah implementasi, serta mode verifikasi. Sertakan atau tautkan sketsa untuk pekerjaan visual.

Ajukan rencana konkret untuk persetujuan sebelum implementasi signifikan. Catat ringkasan persetujuan pengguna; jangan menganggap diam sebagai persetujuan. Persetujuan yang sudah diberikan tetap berlaku selama cakupannya sesuai.

## 4. Implementasi

Kerjakan sampai cakupan yang disetujui selesai tanpa meminta persetujuan ulang untuk detail rutin. Gunakan pola dan dependency yang sudah dipilih proyek; perubahan pendekatan utama perlu alasan dan diskusi. Jika Tailwind ditetapkan sebagai pendekatan utama, gunakan secara konsisten; CSS tambahan harus punya kebutuhan spesifik.

Ubah bagian seminimal mungkin. Jika permintaan frontend ternyata memerlukan perubahan backend, tunjukkan ketergantungan konkret dan dampaknya, lalu minta persetujuan perluasan cakupan sebelum mengubah bagian tambahan tersebut.

Perbarui progres saat satu tahap bermakna selesai. Jika terhambat, catat bukti, upaya yang sudah dilakukan, dan keputusan atau akses yang diperlukan.

## 5. Verifikasi dan review

Tentukan mode dalam rencana atau ikuti arahan terbaru pengguna:

- **Manual oleh pengguna:** agent memeriksa diff untuk kesalahan nyata, memberi langkah mencoba yang singkat, dan tidak menjalankan test/build aplikasi. Catat hasil sebagai belum diuji sampai ada bukti atau laporan pengguna.
- **Terarah oleh agent:** jalankan pemeriksaan terkecil yang relevan terhadap perilaku yang berubah. Hindari suite penuh jika pemeriksaan terbatas sudah memadai.
- **Lebih luas:** untuk dampak besar, sepakati pemeriksaan integrasi atau build yang diperlukan. Perubahan kontrak frontend–backend, akses, payment, dan relasi data memerlukan perhatian khusus.

Jika mode belum ditetapkan, perubahan ringan cukup diperiksa melalui diff dan diserahkan untuk dicoba pengguna. Untuk perubahan signifikan, selesaikan pilihan verifikasi saat membahas rencana. Jika instruksi wajib lingkungan mengharuskan pemeriksaan tambahan, jelaskan batasan tersebut.

Ulangi pemeriksaan yang sudah berhasil hanya jika perubahan berikutnya, kegagalan, atau temuan baru memengaruhi hasilnya. Bedakan pemeriksaan yang dijalankan, yang dilewati, dan hasil yang dilaporkan pengguna.

Untuk perubahan penting, siapkan review terpisah terhadap kebutuhan, dampak perubahan, dan risiko yang relevan. Review dapat dilakukan pada sesi/agent lain atau oleh pengguna; sub-agent tidak wajib. Bila reviewer belum tersedia, catat review sebagai tertunda. Perubahan ringan cukup ditinjau pengguna. Review keamanan tidak boleh diklaim membuktikan seluruh sistem aman.

## Debugging

Gunakan screenshot atau pesan error sebagai petunjuk awal. Periksa alur terkait dan cari bukti penyebab sebelum mengedit. Minta langkah reproduksi hanya jika dibutuhkan dan belum tersedia.

Jelaskan singkat: penyebab yang diketahui atau dugaan yang belum terbukti, tindakan perbaikan, dan dampaknya. Untuk error frontend–backend, periksa bentuk request, validasi, response, serta relasi data yang relevan. Hindari mencoba ulang pendekatan gagal tanpa bukti baru; catat upaya gagal agar agent berikutnya tidak mengulanginya.

Bug sederhana yang memang diminta untuk diperbaiki menggunakan jalur singkat. Perubahan alur atau arsitektur akibat diagnosis kembali ke persetujuan rencana. Verifikasi mengikuti mode yang disepakati.

## Penyerahan dan perpindahan agent

Sebelum mengakhiri sesi kerja, perbarui file tugas jika ada: pekerjaan selesai, sisa pekerjaan, file relevan, hasil verifikasi, dan langkah berikutnya yang bisa dijalankan. Catat proses yang masih berjalan jika ada. Perbarui keputusan lintas tugas di `DECISIONS.md`, bukan menyalinnya ke banyak tempat.

Agent penerus membaca catatan lalu memeriksa area kode terkait dan perubahan terbaru. Jika catatan tidak cocok dengan kode, koreksi status berdasarkan bukti; persetujuan produk tidak boleh disimpulkan hanya dari keberadaan kode. Pergantian agent/model tidak membatalkan persetujuan sebelumnya.

Laporan akhir ringkas mencakup perubahan, file utama, verifikasi, dan batasan penting. Gunakan status yang akurat: “implementasi selesai, menunggu uji pengguna” jika belum diuji. Tandai tugas selesai setelah kriteria penerimaan dikonfirmasi melalui pemeriksaan atau laporan pengguna; jika pengguna menerima hasil tanpa uji, catat keputusan dan keterbatasannya.
