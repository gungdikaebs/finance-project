# Keuangan Pribadi

Konteks ini memodelkan uang pribadi satu pengguna, rencana penggunaannya, dan proyeksi tujuan masa depan. Catatan aktual selalu dibedakan dari anggaran dan simulasi.

## Language

**Saldo utama**:
Total uang aktual yang dicatat pengguna dalam versi pertama, tanpa pemisahan rekening, tunai, atau e-wallet.
_Avoid_: Saldo rekening, dompet

**Uang belum disisihkan**:
Bagian Saldo utama yang belum ditandai untuk Dana tujuan mana pun dan masih bebas dialokasikan.
_Avoid_: Saldo bebas, sisa anggaran

**Dana tujuan**:
Bagian Saldo utama yang ditandai untuk tujuan tertentu, seperti Dana pengaman atau Target impian. Penandaan tidak memindahkan uang keluar dari Saldo utama.
_Avoid_: Rekening tabungan, dompet target

**Dana pengaman**:
Dana tujuan untuk menghadapi kebutuhan darurat atau periode tanpa pemasukan, diukur terhadap kebutuhan pokok bulanan.
_Avoid_: Dana impian

**Target impian**:
Tujuan pembelian masa depan yang mempunyai dana, harga acuan, dan proyeksi tersendiri, seperti rumah atau kendaraan.
_Avoid_: Dana pengaman

**Tabungan belum ditentukan**:
Dana tujuan sementara untuk bagian tabungan impian yang belum dialokasikan ke Target impian tertentu.
_Avoid_: Uang belum disisihkan

**Penyisihan**:
Penandaan Uang belum disisihkan menjadi Dana tujuan. Penyisihan tidak mengubah Saldo utama dan baru menjadi realisasi setelah dikonfirmasi pengguna.
_Avoid_: Pengeluaran, transfer bank

**Pelepasan alokasi**:
Perubahan Dana tujuan kembali menjadi Uang belum disisihkan tanpa mengubah Saldo utama.
_Avoid_: Penarikan tunai, pengeluaran

**Transaksi**:
Catatan uang aktual yang masuk atau keluar dari Saldo utama pada tanggal tertentu.
_Avoid_: Penyisihan, proyeksi

**Anggaran**:
Rencana pembagian pemasukan aktual untuk kebutuhan, tabungan, dan keinginan dalam satu bulan. Anggaran bukan saldo dan bukan bukti Penyisihan.
_Avoid_: Saldo, Dana tujuan

**Simulasi**:
Perhitungan skenario masa depan dari input pengguna, tanpa mengubah Transaksi, Saldo utama, Anggaran, atau Dana tujuan.
_Avoid_: Prediksi pasti, realisasi
