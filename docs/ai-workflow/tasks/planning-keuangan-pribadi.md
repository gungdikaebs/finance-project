# Planning keuangan pribadi

## Status

- Tahap: Tahap 1–4 diterima setelah stabilisasi; berikutnya Tahap 5 (Penyatuan UX & Layout Final).
- Diperbarui: 2026-09-17
- Persetujuan: arah produk/desain D-001–D-012, pembagian peran D-013, dan stabilisasi D-014 disepakati. Tahap 1–4 telah diimplementasikan dan melewati acceptance terotomasi. Kewenangan migrasi data nyata, deployment, commit, merge, dan push tetap terpisah sesuai RULES.md.
- Peran: Codex menyelesaikan planning dan handoff; Antigravity AI mengimplementasikan rencana yang disetujui.

## Kebutuhan

Aplikasi untuk mencatat pemasukan/pengeluaran, mengatur anggaran bulanan, membangun dana pengaman, dan memperkirakan pencapaian target rumah atau kendaraan. Keputusan lintas fitur berada di [DECISIONS.md](../DECISIONS.md).

Alur awal disepakati: isi saldo awal dan tandai dana tujuan yang sudah ada → catat pemasukan → lihat alokasi anggaran → catat pengeluaran dan konfirmasi manual “Sisihkan” untuk tabungan → pantau sisa anggaran, dana pengaman, dan target. Semantik saldo awal dan penyisihan mengikuti D-004; aturan penggunaan dana dan pergantian bulan mengikuti D-011.

## Usulan cakupan versi pertama

- Satu Saldo utama, pencatatan pemasukan/pengeluaran, kategori dan sumber pemasukan.
- Anggaran bulanan dengan pembagian fleksibel dan indikator realisasi/sisa.
- Pencatatan dana pengaman dan alokasi ke masing-masing target impian.
- Simulasi waktu tercapai berdasarkan setoran, atau setoran yang dibutuhkan berdasarkan tenggat.
- Target harga penuh atau DP, dengan simulasi cicilan rumah (D-007); detail perhitungan masih diusulkan di bawah.
- Asumsi kenaikan harga tahunan yang dapat diubah; hasil simulasi dipisahkan dari realisasi.
- Di luar usulan awal: pemisahan rekening/dompet dan transfer antar rekening, integrasi bank, perhitungan hasil investasi. Pengambilan inflasi otomatis dikeluarkan dari versi pertama; asumsi manual mengikuti D-012.

## Kriteria penerimaan calon

- [x] Pemasukan dari beberapa sumber menambah saldo dan anggaran tanpa menggandakan pencatatan. (Tahap 1 selesai)
- [x] Pembagian 50/30/20 dapat diubah dengan total alokasi yang valid. (Tahap 2 selesai)
- [x] Porsi tabungan dibagi secara default 60% dana pengaman dan 40% impian sesuai D-005; nominal dapat disesuaikan sebelum konfirmasi tanpa menggandakan dana. (Tahap 3 selesai)
- [x] Pengeluaran memperbarui saldo serta realisasi anggaran yang sesuai. (Tahap 1 selesai)
- [x] Penyisihan ke dana pengaman/target tidak menciptakan pemasukan baru atau menggandakan total uang. (Tahap 3 selesai)
- [x] Saldo awal tidak menambah laporan pemasukan bulan berjalan; alokasi tujuan dari saldo awal tidak dihitung sebagai setoran baru bulan berjalan. (Tahap 1 selesai)
- [x] Saran tabungan belum menambah dana tujuan sebelum tindakan “Sisihkan” dikonfirmasi; konfirmasi mempertahankan total Saldo utama. (Tahap 3 selesai)
- [x] Dana pengaman dapat diterjemahkan menjadi bulan kebutuhan pokok; kebutuhan nol/belum diisi ditangani secara eksplisit. (Tahap 3 selesai)
- [x] Proyeksi target mempertimbangkan dana target saat ini, setoran, dan kenaikan harga majemuk, dengan penjelasan jika tidak tercapai dalam batas simulasi. (Tahap 4 selesai)
- [x] Dana pengaman dan dana target lain tidak ikut dihitung sebagai dana tersedia untuk satu target. (Tahap 3 & 4 selesai)
- [x] Tawaran penyisihan akhir bulan hanya mengubah dana tujuan setelah konfirmasi; melewati tawaran mempertahankan dana tersedia, dan saldo terbawa tanpa pemasukan baru (D-006). (Tahap 2 selesai)
- [x] Target DP menampilkan pencapaian dana awal secara terpisah dari estimasi cicilan dan pelunasan rumah; simulasi tidak mencatat utang atau pengeluaran aktual secara otomatis. (Tahap 4 selesai)
- [x] Simulasi mendukung periode fixed dan perubahan bunga floating, dengan penanda waktu perubahan dan dampak cicilan; setiap bunga masa depan ditandai sebagai asumsi (D-008). (Tahap 4 selesai)

## Rencana berikutnya

1. [DITERIMA] Tahap 1: fondasi saldo dan transaksi, termasuk koreksi ledger transaksi dari Dana tujuan.
2. [DITERIMA] Tahap 2: kebijakan anggaran fleksibel dan isolasi override sumber pemasukan.
3. [DITERIMA] Tahap 3: penyisihan, target, pembagian impian, dan konsistensi saldo `currentBalance` pada frontend.
4. [DITERIMA] Tahap 4: proyeksi dengan tanggal acuan, batas nominal, setoran nol, serta KPR fixed/floating bersyarat.
5. Melanjutkan ke Tahap 5: Penyatuan UX & Layout Final (penyempurnaan responsivitas mobile-first vs desktop, loading skeleton, empty states, keyboard shortcuts / a11y, dan build production final).
6. Migrasi data nyata dan deployment tetap memerlukan izin tersendiri.

## Progres dan verifikasi

- Selesai:
  - Keputusan produk D-001–D-014.
  - Implementasi dan stabilisasi Tahap 1–4.
  - Unit test backend: 18/18 lulus pada 8 suite.
  - E2E API dengan SQLite sementara: 3/3 lulus (isolasi dua pengguna, transaksi Dana tujuan, dan simulator read-only).
  - Skema database termigrasi (`20260917040811_tahap3_tabungan_target`).
  - Build frontend dan backend sukses tanpa error TypeScript.
  - Tidak ada migrasi schema atau perubahan pada data pengguna nyata selama stabilisasi.

## Serah terima

Tahap 1–4 telah melewati stabilisasi berdasarkan [rencana implementasi versi pertama](rencana-implementasi-v1.md). Tahap berikutnya adalah planning dan implementasi Tahap 5. Perubahan scope atau pendekatan utama tetap dikembalikan untuk revisi planning.
