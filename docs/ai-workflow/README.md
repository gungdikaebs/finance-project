# AI workflow pribadi

Paket instruksi kerja untuk Project-Keuangan. Konteks proyek dan planning dicatat berdasarkan pemeriksaan repository serta pembahasan pengguna; usulan yang belum disepakati ditandai terpisah.

## Memulai

Tempel instruksi berikut saat membuka percakapan dengan Codex, Antigravity, atau agent lain:

```text
Gunakan docs/ai-workflow/README.md sebagai pintu masuk workflow proyek ini.
Baca aturan dan konteks yang dirujuk sesuai pekerjaan, lalu lanjutkan tugas aktif.
Jika belum ada tugas aktif, pahami permintaan saya dan ikuti jalur pekerjaan yang sesuai.
```

Folder `/docs` tidak menjamin instruksi otomatis dibaca. Untuk penggunaan berulang, tambahkan petunjuk di atas ke file instruksi yang memang dibaca oleh agent pilihanmu; pertahankan instruksi proyek yang sudah ada. Paket ini tidak bergantung pada mekanisme konfigurasi satu produk.

## Urutan membaca untuk agent

1. Baca [RULES.md](RULES.md) dan [PROJECT.md](PROJECT.md) saat pertama memasuki proyek atau ketika keduanya berubah.
2. Baca file tugas aktif di bawah. Jika ada beberapa tugas dan target tidak jelas dari permintaan, minta pengguna menentukan target.
3. Baca [DECISIONS.md](DECISIONS.md) bila pekerjaan menyentuh keputusan teknis, alur, atau desain yang telah disepakati.
4. Periksa kode dan konfigurasi yang relevan untuk memastikan catatan masih sesuai. Perluas penelusuran hanya jika ada ketergantungan atau ketidakpastian yang konkret.

Saat konteks masih tersedia dan file belum berubah, gunakan pemahaman yang sudah ada. Riwayat tugas selesai hanya perlu dibuka jika berkaitan dengan pekerjaan sekarang.

## Tugas aktif

[Planning keuangan pribadi](tasks/planning-keuangan-pribadi.md) — kebutuhan dan keputusan produk.

[Rencana implementasi versi pertama](tasks/rencana-implementasi-v1.md) — usulan teknis lengkap, menunggu persetujuan sebelum implementasi.

Pembagian peran: Codex adalah planner; Antigravity AI adalah implementer setelah pengguna menyetujui rencana. Lihat D-013 dan bagian handoff pada rencana implementasi.

Untuk pekerjaan signifikan, buat `tasks/nama-pekerjaan.md` dari [tasks/TEMPLATE.md](tasks/TEMPLATE.md). Untuk perubahan kecil yang selesai dalam satu sesi, file tugas tidak wajib; buat catatan ringkas jika pekerjaan tertunda atau akan dipindahkan ke agent lain.

## Penyesuaian pertama pada proyek tujuan

Agent mempelajari struktur dan konfigurasi proyek, lalu mengisi `PROJECT.md` dengan temuan yang relevan. Konfirmasi tujuan, kebiasaan, atau pilihan penting yang belum dapat ditemukan. Penyesuaian dokumentasi tidak memberi izin mengubah kode atau memasang dependency.

Saat memakai paket ini untuk proyek berbeda, gunakan template bersih. Jika menyalin dari proyek lama, kosongkan konteks, keputusan, dan tugas proyek lama sebelum menjadikannya konteks proyek baru.

## Kepemilikan informasi

- `RULES.md`: aturan kerja yang dapat dipakai ulang.
- `PROJECT.md`: konteks dan petunjuk navigasi khusus proyek.
- `DECISIONS.md`: alasan keputusan lintas tugas yang masih berlaku.
- `tasks/`: kebutuhan, persetujuan, progres, dan serah terima per pekerjaan.

Agent memperbarui catatan pada perubahan keputusan, akhir tahap bermakna, atau sebelum serah terima. Gunakan fakta ringkas; hindari menyalin seluruh percakapan atau kode. Simpan kredensial dan data pribadi di luar dokumen ini.
