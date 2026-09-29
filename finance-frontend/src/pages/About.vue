<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue';
import { RouterLink } from 'vue-router';
import { ArrowRight } from 'lucide-vue-next';
import PublicShell from '../components/PublicShell.vue';
import { useAuthStore } from '../stores/auth.store';

const auth = useAuthStore();
const startLink = computed(() => auth.token ? '/dashboard' : '/login?mode=register');
const startLabel = computed(() => auth.token ? 'Buka Dashboard' : 'Mulai Sekarang');

onMounted(() => {
  document.title = 'Tentang Nalara | Keuangan pribadi lebih jelas';
});
onUnmounted(() => {
  document.title = 'Nalara | Kelola uang tanpa menebak-nebak';
});
</script>

<template>
  <PublicShell>
    <!-- Hero Section -->
    <section class="border-b border-slate-200/80 bg-white dark:border-slate-800/80 dark:bg-[#070B14]">
      <div class="mx-auto grid max-w-7xl items-center gap-10 px-5 py-12 sm:px-8 sm:py-18 lg:grid-cols-[minmax(0,1fr)_minmax(0,.9fr)] lg:gap-20 lg:px-10 lg:py-24">
        <div class="max-w-[620px]">
          <p class="mb-4 text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Tentang Nalara</p>
          <h1 class="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.09] tracking-tight text-[#0B192C] dark:text-[#F8FAFC]">
            Keuangan yang lebih mudah dipahami.
          </h1>
          <p class="mt-6 max-w-[55ch] text-lg leading-relaxed text-slate-600 dark:text-slate-300">
            Nalara adalah aplikasi untuk mencatat keuangan pribadi, memahami uang yang tersedia, dan menjaga rencana tetap terlihat jelas.
          </p>
          <RouterLink
            to="/"
            class="mt-8 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-[#0B192C] underline decoration-slate-300 underline-offset-8 transition hover:text-blue-600 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-current dark:text-white dark:decoration-slate-700 dark:hover:text-blue-400"
          >
            Lihat aplikasinya <ArrowRight class="h-4 w-4" aria-hidden="true" />
          </RouterLink>
        </div>
        <figure class="relative mx-auto w-full max-w-lg lg:mr-0">
          <div class="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-[#070B14] shadow-xl">
            <img
              src="/nalara-about-editorial.jpg"
              alt="Meja kerja dengan buku catatan perencanaan keuangan yang tenang dan teratur"
              width="1536"
              height="1024"
              class="h-[320px] w-full object-cover sm:h-[440px]"
            />
          </div>
          <figcaption class="mt-3 text-xs text-slate-500 dark:text-slate-400">
            Pencatatan keuangan yang tenang, terstruktur, dan terarah.
          </figcaption>
        </figure>
      </div>
    </section>

    <!-- Why Section -->
    <section class="py-16 sm:py-24 bg-[#F8FAFC] dark:bg-[#070B14]">
      <div class="mx-auto grid max-w-7xl gap-8 px-5 sm:px-8 lg:grid-cols-[minmax(0,.65fr)_minmax(0,1fr)] lg:gap-20 lg:px-10">
        <h2 class="max-w-[14ch] text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl text-[#0B192C] dark:text-[#F8FAFC]">
          Mengapa kami membuat Nalara
        </h2>
        <div class="max-w-[66ch] space-y-5 text-base leading-relaxed text-slate-600 dark:text-slate-300">
          <p>
            Catatan transaksi sering tersebar, sementara saldo rekening tidak selalu berarti seluruh uangnya bebas dibelanjakan. Ketika semuanya terlihat sebagai satu angka di rekening, keputusan kecil sehari-hari bisa memicu kecemasan.
          </p>
          <p>
            Nalara membantu menghubungkan catatan pemasukan dan pengeluaran dengan anggaran, tabungan, dana pengaman, serta target pribadi. Tujuannya sederhana: memberi gambaran yang lebih jelas agar kamu dapat membuat keputusan keuangan dengan penuh percaya diri.
          </p>
        </div>
      </div>
    </section>

    <!-- Approach Section -->
    <section class="border-y border-slate-200/80 bg-white py-16 dark:border-slate-800/80 dark:bg-[#0D1524] sm:py-24">
      <div class="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <h2 class="max-w-2xl text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl text-[#0B192C] dark:text-[#F8FAFC]">
          Pendekatan kami
        </h2>
        <div class="mt-10 grid gap-6 lg:grid-cols-3 lg:gap-10">
          <div class="border-t border-slate-200 pt-5 dark:border-slate-800">
            <h3 class="text-lg font-bold text-[#0B192C] dark:text-[#F8FAFC]">Mulai dari yang nyata</h3>
            <p class="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              Pemasukan, pengeluaran, dan saldo dicatat agar rencana berangkat dari keadaan keuangan riil yang terlihat.
            </p>
          </div>
          <div class="border-t border-slate-200 pt-5 dark:border-slate-800">
            <h3 class="text-lg font-bold text-[#0B192C] dark:text-[#F8FAFC]">Pisahkan uang menurut tujuan</h3>
            <p class="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              Uang untuk kebutuhan harian dan uang yang disisihkan untuk masa depan perlu dipisahkan secara mental tanpa memecah rekening bank.
            </p>
          </div>
          <div class="border-t border-slate-200 pt-5 dark:border-slate-800">
            <h3 class="text-lg font-bold text-[#0B192C] dark:text-[#F8FAFC]">Beri ruang untuk pilihan</h3>
            <p class="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              Simulasi dan perkiraan membantu memahami kemungkinan di depan tanpa memaksakan rumus kaku yang sulit dijalani.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Closing CTA Section -->
    <section class="py-16 sm:py-24 bg-[#F8FAFC] dark:bg-[#070B14]">
      <div class="mx-auto flex max-w-7xl flex-col gap-7 px-5 sm:px-8 lg:flex-row lg:items-end lg:justify-between lg:px-10">
        <div class="max-w-2xl">
          <h2 class="text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl text-[#0B192C] dark:text-[#F8FAFC]">
            Kenali keuanganmu, mulai hari ini.
          </h2>
          <p class="mt-4 text-base leading-relaxed text-slate-600 dark:text-slate-400">
            Buat akun dan mulai dengan mencatat satu transaksi. Tidak perlu menunggu semua rencanamu sempurna.
          </p>
        </div>
        <RouterLink
          :to="startLink"
          class="tactile-btn inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#0B192C] px-6 py-3 text-sm font-bold text-white shadow-xs transition hover:bg-[#172B45] hover:-translate-y-0.5 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#0B192C] dark:bg-white dark:text-[#0B192C] dark:hover:bg-slate-100 dark:focus-visible:outline-white"
        >
          {{ startLabel }} <ArrowRight class="h-4 w-4" aria-hidden="true" />
        </RouterLink>
      </div>
    </section>
  </PublicShell>
</template>
