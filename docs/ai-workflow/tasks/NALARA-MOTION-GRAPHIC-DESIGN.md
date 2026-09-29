# Rencana peningkatan visual dan motion Nalara

## Status dan keputusan awal

- Status: **implementasi bertahap; fondasi CTA dan visual hero landing tersedia untuk ditinjau**.
- Baseline visual: palet navy-biru yang saat ini ada di `finance-frontend/src/style.css`, sesuai pilihan pengguna. Jangan kembali ke hijau-lime sebagai aksen utama.
- Tujuan: membuat Nalara terasa lebih hidup, rapi, dan tepercaya tanpa mengorbankan kemudahan membaca kondisi keuangan.
- Mode pekerjaan: evolusi desain bertahap. Identitas, alur, fungsi, dan isi finansial yang sudah ada dipertahankan.
- Titik persetujuan: **setiap tahap di bawah dieksekusi dan ditinjau satu per satu**. Dokumen ini bukan izin otomatis untuk mengerjakan semua tahap.

## Design read

Nalara adalah produk keuangan pribadi bagi pengguna awam, bukan situs teknologi eksperimental. Halaman publik boleh lebih ekspresif untuk menjelaskan produk; dashboard harus lebih tenang agar angka dan tindakan tetap menjadi fokus. Arah yang diinginkan: editorial yang hangat, navy yang tepercaya, biru sebagai aksen tindakan, grafis yang menjelaskan, dan motion yang menunjukkan perubahan keadaan. Hindari glow neon, dekorasi teknis yang tidak bermakna, serta animasi terus-menerus.

| Area | Variasi komposisi | Intensitas motion | Kepadatan informasi | Alasan |
| --- | ---: | ---: | ---: | --- |
| Landing dan About | 6/10 | 4/10 | 3/10 | Memerlukan ritme visual dan cerita produk, tetapi tetap mudah dipindai. |
| Login | 3/10 | 2/10 | 3/10 | Form dan keputusan autentikasi harus menjadi pusat perhatian. |
| Dashboard dan modal | 3/10 | 2/10 | 5/10 | Pengguna memerlukan data yang jelas, stabil, dan cepat dibaca. |

## Audit baseline sebelum mengubah UI

- Stack: Vue 3, Vite 7, Tailwind 4, Plus Jakarta Sans, `lucide-vue-next`, Chart.js. Komponen dan gaya yang ada menjadi titik awal; tidak perlu mengganti framework.
- Token saat ini: navy `#0B192C`, latar dark `#070B14`, biru aksi `#2563EB`, latar light `#F8FAFC`, teks light `#0F172A`. Variabel light/dark sudah tersedia di `style.css`; pemakaian warna hardcoded dan alias lama perlu diaudit sebelum perapian token.
- Halaman publik: `/` memiliki hero, penjelasan manfaat, simulator, bagian aplikasi mobile, FAQ, dan CTA; `/login` memiliki form serta Google sign-in; `/about` sudah memiliki narasi dan foto. Jangan mengubah slug, anchor navigasi, atau urutan field form secara diam-diam.
- Masalah visual yang hendak disasar: hero landing memakai kartu UI buatan dengan angka dekoratif, sementara `public/landing-dashboard.jpg` masih memperlihatkan versi hijau lama; animasi `pulse`/`ping` pada halaman publik tidak semuanya mengomunikasikan status nyata; beberapa section dan card memiliki bobot visual serupa sehingga ritme halaman terasa datar.
- Hal yang dipertahankan: nama Nalara, logo yang ada, alur CTA publik, opsi login Google dan email, data dan perhitungan finansial, struktur navigasi aplikasi, status semantik warna, serta copy yang masih benar. Perubahan logo memerlukan keputusan terpisah.
- Sebelum mengerjakan tiap tahap: cek `git status`, bandingkan tampilan light/dark pada 390, 768, dan 1440 px, catat screenshot baseline, serta periksa pekerjaan lokal pihak lain agar tidak tertimpa.

### Catatan baseline dan progres awal - 29 September 2026

- Source audit memastikan palet navy-biru sudah terpasang, dengan biru aksi `#2563EB` dan navy `#0B192C`.
- CTA utama pada header publik sebelumnya memakai navy di mode terang dan putih di mode gelap. Ini membuat peran warna CTA berbeda antar tema.
- Potongan awal Tahap 1 menyatukan CTA utama di navigasi publik, landing, About, dan form login ke aksen biru yang sama di light/dark. Hover, pressed, focus-visible, disabled, dan reduced-motion memakai aturan bersama.
- Motion awal landing memberi hero copy dan visual transisi masuk singkat satu kali. Tidak ada dependency baru; reduced motion menonaktifkan gerak tersebut.
- Preview dashboard tiruan di hero sudah diganti dengan grafis pembagian pemasukan yang memakai nilai contoh dari state simulator. Angka 50/30/20 dihitung dari pemasukan contoh yang sama, diberi label contoh, serta memiliki label aksesibilitas berisi kategori dan nominal. Data saldo, transaksi, sinkronisasi, kenaikan, dan progres tujuan dekoratif di hero dihilangkan.
- Audit foto menemukan gambar section mobile memakai layar aplikasi generik yang bukan Nalara. Label “Pratinjau Antarmuka Mobile” dan strip klaim dukungan perangkat di atas foto dihapus; alt text dan caption sekarang menyebut visual tersebut sebagai ilustrasi penggunaan ponsel.
- FAQ landing membuka jawaban dengan transisi tinggi singkat. Tombol menyatakan `aria-expanded` dan mengendalikan panel jawaban; panel tertutup dikeluarkan dari aksesibilitas/fokus, dan transisi mengikuti reduced motion.
- Visual manfaat tentang alokasi kini memperlihatkan satu saldo rekening sebagai dua rencana penggunaan. Nominal diberi label ilustrasi, proporsi bar dihitung dari nilai contoh, dan keterangan menjelaskan bahwa uang fisik tetap berada di rekening yang sama.
- Simulator anggaran mengganti tiga kartu angka setara dengan satu bar pembagian dan daftar ringkas. Pilihan pemasukan/target aktif memakai aksen biru pada kedua tema; pilihan pemasukan memiliki `aria-pressed` dan slider menyampaikan nilai rupiah melalui `aria-valuetext`.
- Section aplikasi mobile mengganti badge monospasi dan pulse dekoratif dengan status ketersediaan yang tenang. Dua manfaat ditampilkan sebagai daftar tanpa kartu berulang agar foto dan judul tetap dominan. Status “Segera hadir” dipertahankan karena install banner sementara dinonaktifkan di aplikasi.
- Perbandingan kini menyajikan empat kriteria sebagai daftar berlabel pada layar kecil sehingga tidak perlu scroll horizontal. Tabel desktop dipertahankan; isi disatukan di satu daftar agar kedua tampilan tidak menyimpang.
- CTA sekunder landing dan About kini memakai satu gaya tombol outlined yang konsisten dengan token tema, punya hover/focus/pressed state, dan menghormati reduced motion. Foto About diberi label jelas sebagai ilustrasi karena bukan screenshot produk Nalara.
- Tahap visual landing berikutnya menambah ilustrasi editorial alur tujuan keuangan (`nalara-goal-flow.jpg`, 311 KB) pada section target. Ilustrasi diberi alt text dan caption yang menyebutnya sebagai ilustrasi, bukan screenshot. Reveal satu kali saat masuk viewport memakai `IntersectionObserver`, hanya pada pengguna yang tidak meminta reduced motion, dan observer dibersihkan saat halaman dilepas. Hasil proyeksi simulator memberi highlight singkat saat pemasukan atau target diubah, agar perubahan hasil terasa terkonfirmasi tanpa count-up yang mengganggu.
- Pemeriksaan visual langsung di browser belum selesai: akses Google Chrome melalui UI automation ditolak oleh izin komputer. Karena itu hasil tahap ini perlu ditinjau di browser oleh pengguna sebelum perubahan fondasi lain diteruskan.
- Screenshot lama `landing-dashboard.jpg` masih merupakan aset versi hijau dan belum layak dipakai sebagai bukti visual produk biru.

## Prinsip visual yang mengikat semua tahap

1. **Satu aksen utama.** Biru dipakai untuk CTA, fokus, pilihan aktif, dan tautan. Navy membangun struktur. Hijau/merah/oranye tetap boleh untuk makna finansial atau status, bukan aksen dekoratif yang bersaing.
2. **Hierarki sebelum efek.** Perbaiki ukuran, jarak, alignment, dan jumlah elemen yang tampil bersama sebelum menambah animasi atau ornamen.
3. **Grafis harus membantu paham.** Visual pemasukan, anggaran, tabungan, dan target menjelaskan hubungan antarangka. Jangan membuat angka, testimoni, klaim keamanan, atau UI demo yang tampak sebagai data nyata tanpa label contoh.
4. **Satu sistem bentuk.** Radius, border, elevasi, ikon, dan ukuran tombol harus konsisten di public pages dan aplikasi. Jangan memakai glassmorphism sebagai gaya default kartu keuangan.
5. **Dua tema utuh.** Light dan dark masing-masing punya hierarki, kontras, dan kualitas foto yang setara. Jangan mengubah tema mendadak antar-section.
6. **Konten tetap dapat diakses tanpa motion.** Animasi tidak boleh menjadi satu-satunya petunjuk status atau hubungan data.

## Aset grafis yang direncanakan

| Aset | Fungsi dan spesifikasi | Sumber/kriteria |
| --- | --- | --- |
| Screenshot produk desktop dan mobile | Menunjukkan dashboard Nalara yang benar-benar berjalan dengan data demo fiktif; dipakai pada hero atau bagian produk yang relevan. | Ambil dari UI aplikasi pada palet biru, bukan merakit dashboard palsu dari elemen dekoratif. Pastikan tidak ada email, nama, atau angka milik pengguna sungguhan. |
| Ilustrasi alur uang | Menjelaskan hubungan `pemasukan -> anggaran -> uang yang bisa dipakai/tabungan` dengan label bahasa awam. | Grafis ringan yang dirancang sesuai fungsi; angka contoh diberi label “Contoh”. Bukan dekorasi abstrak. |
| Visual fitur pada section manfaat | Membantu membedakan “catat transaksi”, “pahami anggaran”, dan “pantau target” tanpa tiga kartu identik. | Kombinasi screenshot/crop UI nyata dan komposisi editorial, bukan kumpulan ikon besar. |
| Foto yang sudah ada | Menjaga sisi manusiawi di Login, About, dan landing. | Audit `landing-budget-desk.jpg`, `nalara-about-editorial.jpg`, dan `nalara-landing-mobile.jpg` untuk kecocokan crop, kualitas, serta hak pakai. Ganti hanya bila ada alasan jelas dan persetujuan. |

Setiap aset baru perlu ukuran intrinsik atau ruang yang dipesan untuk mencegah layout shift, format terkompresi yang sesuai, alt text yang menjelaskan isi, dan loading priority hanya untuk visual utama di atas fold. Jangan menambah library ilustrasi atau ikon baru sebelum kebutuhan konkretnya jelas.

## Spesifikasi motion

| Peristiwa | Motion yang diusulkan | Tujuan | Reduced motion |
| --- | --- | --- | --- |
| Landing pertama dibuka | Hero copy dan screenshot masuk sekali dengan fade + translasi kecil, berurutan singkat. | Menuntun mata dari pesan ke bukti produk. | Semua elemen langsung terlihat. |
| Section manfaat memasuki viewport | Reveal satu kali untuk visual utama; teks tetap dapat dibaca tanpa menunggu animasi. | Mengikuti urutan cerita. | Tampil statis. |
| Simulator publik mengubah input | Hasil dan diagram berganti halus, tanpa count-up angka panjang. | Menegaskan hasil baru dari tindakan pengguna. | Pembaruan langsung. |
| Tab, FAQ, menu, dialog | Transisi masuk/keluar pendek; fokus dan status aktif tetap jelas. | Umpan balik dan perubahan konteks. | Instan atau fade minimal. |
| Aksi finansial berhasil/gagal | Feedback status yang stabil dan terbaca; bukan confetti atau gerak dramatis. | Memastikan akibat tindakan dipahami. | Teks/status tetap sama. |
| Grafik dashboard setelah filter | Transisi hanya bila mempermudah membaca seri baru. | Menandai pergantian data. | Grafik langsung diperbarui. |

Target awal: respons tombol 120-180 ms, perubahan komponen 200-300 ms, reveal halaman publik paling lama sekitar 400 ms. Angka finansial penting tidak dihitung naik secara animatif. Utamakan `transform` dan `opacity`; hindari animasi ukuran/posisi yang membuat layout bergeser. Hilangkan loop `pulse`/`ping` jika bukan status langsung. `prefers-reduced-motion: reduce` juga harus mencakup animasi utility dan smooth scroll, bukan hanya kelas custom.

## Tahapan eksekusi dan titik review

### Tahap 0 - Kunci baseline dan sistem keputusan

Hasil: screenshot baseline light/dark untuk landing, login, about, dashboard, dan modal penting; inventaris komponen/tokens yang dipakai; daftar elemen yang benar-benar perlu diubah. Tentukan prioritas visual tanpa menyentuh logika finansial. Verifikasi bahwa screenshot lama berwarna hijau tidak dipakai sebagai bukti produk biru. **Gate:** pengguna menyetujui daftar sasaran visual dan aset yang perlu dibuat.

### Tahap 1 - Fondasi visual

Rapikan pemakaian token warna, spacing, radius, tipografi, tombol, kartu, focus ring, dan state hover/disabled yang sudah ada. Jangan langsung mengubah semua halaman; mulai dari komponen shared yang dampaknya dapat diprediksi. Hasil: matriks token light/dark dan contoh komponen nyata pada kedua tema. **Gate:** pengguna membandingkan tampilan dasar sebelum komposisi halaman berubah.

### Tahap 2 - Landing dan aset produk

Gunakan grafis alur uang yang bersumber dari nilai contoh simulator sebagai visual hero; screenshot produk aktual dari akun demo fiktif dapat dipakai di section produk setelah tersedia dan cocok dengan palet. Pastikan tidak ada preview aplikasi tiruan. Variasikan komposisi manfaat, rapikan simulator dan visual alur uang, lalu pertahankan navigasi/anchor yang ada. Tinjau klaim atau angka yang tidak bisa dibuktikan; perubahan copy substantif dibahas terpisah. Terapkan motion publik yang beralasan. **Gate:** review mobile/desktop, light/dark, dan kesan tepercaya sebelum halaman lain diubah.

### Tahap 3 - Login dan About

Samakan bahasa visual foto, tipografi, dan CTA dengan landing. Form tetap dominan di mobile; Google sign-in dan email tidak berubah perilakunya. About tampil seperti profil Nalara yang kredibel, bukan halaman dengan ornamen berlebihan. **Gate:** uji alur login dan register melalui UI; pengguna menilai konsistensi ketiga halaman publik.

### Tahap 4 - Dashboard

Audit satu section per iterasi: ringkasan saldo, transaksi, anggaran, tabungan/target, lalu analitik. Perjelas angka dan aksi primer, kurangi card dengan bobot sama, jaga status penting tetap terlihat. Perubahan bersifat presentasional; rumus, nilai, urutan operasi, dan hasil finansial tidak berubah. Grafik boleh diberi transisi ringan hanya jika membantu membedakan data lama dan baru. **Gate per section:** pengguna meninjau desktop dan mobile sebelum section berikutnya.

### Tahap 5 - Modal, empty/loading/error state

Samakan tampilan dan transisi dialog tanpa mengubah urutan pengambilan keputusan yang penting. Pastikan ringkasan akibat tindakan tetap terbaca sebelum konfirmasi, fokus keyboard terkelola, kesalahan dapat dipulihkan, dan keadaan kosong memiliki langkah berikutnya. **Gate:** verifikasi alur finansial memakai data uji yang disetujui, tanpa mengubah data produksi.

### Tahap 6 - QA akhir dan penyempurnaan

Periksa seluruh tema dan breakpoint, keyboard, focus visible, kontras, reduced motion, loading, error, overflow, ketajaman aset, serta ukuran bundle. Jalankan build frontend dan pemeriksaan visual/performa yang tersedia. Hasil akhir berupa daftar perubahan, sebelum/sesudah, regresi yang ditemukan, dan sisa pekerjaan yang memerlukan keputusan pengguna.

## Dependency dan keputusan teknis

| Kategori | Keputusan awal | Kapan berubah |
| --- | --- | --- |
| Vue `<Transition>`/`<TransitionGroup>` + CSS/Tailwind | **Cukup untuk tahap awal; tidak perlu dependency runtime baru.** | Evaluasi setelah kebutuhan motion nyata terbukti lebih rumit dari transisi state sederhana. |
| `lucide-vue-next`, Chart.js, font saat ini | Pakai ulang. | Ganti hanya jika konsistensi atau aksesibilitas gagal dicapai dengan yang ada. |
| `motion-v` | Opsional, **jangan install sekarang**. | Hanya bila shared-element/layout choreography dibutuhkan dan ada persetujuan atas biaya bundle serta pemeliharaan. |
| GSAP, Three.js, Lottie | Tidak direkomendasikan untuk scope ini. | Butuh proposal dan persetujuan khusus dengan alasan pengalaman pengguna yang kuat. |
| Playwright/axe untuk QA | Opsional sebagai dev dependency. | Diputuskan saat tahap QA bila pengujian yang ada tidak cukup; jangan install otomatis. |

Panduan teknis: [Vue Transition](https://vuejs.org/guide/built-ins/transition), [MDN `prefers-reduced-motion`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion), dan [web.dev animation performance](https://web.dev/articles/animations-and-performance).

## Kriteria selesai

- Pengguna baru segera mengenali pesan utama, CTA, dan bukti produk pada landing tanpa membaca semua section.
- Screenshot/angka demo jelas fiktif; tidak ada data pribadi atau klaim yang tidak dapat diverifikasi.
- Light dan dark mode sama-sama konsisten; CTA, teks, field, status, serta focus ring memiliki kontras yang memadai.
- Layout berfungsi pada sekitar 390 px, 768 px, dan 1440 px; tidak ada scroll horizontal tidak disengaja, tombol terpotong, atau dialog yang menyembunyikan keputusan penting.
- Keyboard dapat menjangkau navigasi, simulator, login, dan dialog. Fokus terlihat dan kembali dengan benar setelah dialog ditutup.
- `prefers-reduced-motion` meniadakan motion non-esensial; konten tidak pernah tersembunyi permanen jika animasi gagal.
- Animasi tidak mengubah angka sebenarnya, tidak menunda feedback penting, dan tidak memperburuk keterbacaan dashboard.
- Build frontend lulus; alur transaksi, login, dan perhitungan yang ada tidak mengalami regresi.
- Performa diperiksa pada perangkat/viewport mobile. Sasaran: LCP < 2,5 detik, INP < 200 ms, CLS < 0,1 pada pengukuran yang representatif, bukan klaim tanpa pengujian.

## Di luar cakupan

Perubahan backend/API/database, logika alokasi dan perhitungan uang, struktur rute, penggantian logo/wordmark, perubahan copy legal, redesain total informasi dashboard, perubahan penyimpanan sesi, dan deployment. Jika desain yang dipilih ternyata memerlukan salah satu perubahan ini, hentikan bagian tersebut dan minta persetujuan baru.

## Langkah berikutnya

Tinjau CTA, motion, dan grafis pembagian pemasukan pada landing dalam mode terang/gelap serta perangkat mobile. Berikutnya rapikan ritme grafis section publik dan cek foto yang sudah ada; screenshot dashboard aktual hanya ditambahkan jika tersedia dari akun demo fiktif dan terlihat konsisten dengan palet biru.
