<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue';
import { RouterLink } from 'vue-router';
import { ArrowRight } from 'lucide-vue-next';
import PublicShell from '../components/PublicShell.vue';
import { useAuthStore } from '../stores/auth.store';

const auth = useAuthStore();
const startLink = computed(() => auth.token ? '/dashboard' : '/login?mode=register');
const startLabel = computed(() => auth.token ? 'Buka dashboard' : 'Buat akun');

onMounted(() => { document.title = 'Tentang Nalara | Keuangan pribadi lebih jelas'; });
onUnmounted(() => { document.title = 'Nalara | Kelola uang tanpa menebak-nebak'; });
</script>

<template>
  <PublicShell>
    <section class="border-b border-[#DAE2D9] dark:border-[#26362A]">
      <div class="mx-auto grid max-w-7xl items-center gap-10 px-5 py-12 sm:px-8 sm:py-18 lg:grid-cols-[minmax(0,1fr)_minmax(0,.9fr)] lg:gap-20 lg:px-10 lg:py-24">
        <div class="max-w-[620px]">
          <p class="mb-5 text-sm font-bold text-[#24553D] dark:text-[#B8DF38]">Tentang Nalara</p>
          <h1 class="text-[2.6rem] font-extrabold leading-[1.09] tracking-[-.05em] sm:text-[4rem]">Keuangan yang lebih mudah dipahami.</h1>
          <p class="mt-6 max-w-[55ch] text-lg leading-relaxed text-[#4C5F53] dark:text-[#B8C6BB]">Nalara adalah aplikasi untuk mencatat keuangan pribadi, memahami uang yang tersedia, dan menjaga rencana tetap terlihat.</p>
          <RouterLink to="/" class="mt-8 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-[#183D2B] underline decoration-[#9EBB91] underline-offset-8 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-current dark:text-[#B8DF38]">Lihat aplikasinya <ArrowRight class="h-4 w-4" aria-hidden="true" /></RouterLink>
        </div>
        <figure class="relative mx-auto w-full max-w-lg lg:mr-0">
          <div class="overflow-hidden rounded-2xl border border-[#CAD8CA] dark:border-[#324638] bg-[#0E1410] shadow-xl">
            <img
              src="/nalara-about-editorial.jpg"
              alt="Meja kerja dengan buku catatan perencanaan keuangan yang tenang dan teratur"
              width="1536"
              height="1024"
              class="h-[320px] w-full object-cover sm:h-[440px]"
            />
          </div>
          <figcaption class="mt-3 text-xs text-[#596B5E] dark:text-[#ADBCB0]">
            Pencatatan keuangan yang tenang dan terarah.
          </figcaption>
        </figure>
      </div>
    </section>

    <section class="py-16 sm:py-24">
      <div class="mx-auto grid max-w-7xl gap-8 px-5 sm:px-8 lg:grid-cols-[minmax(0,.65fr)_minmax(0,1fr)] lg:gap-20 lg:px-10">
        <h2 class="max-w-[14ch] text-[2rem] font-extrabold leading-tight tracking-[-.04em] sm:text-[2.8rem]">Mengapa kami membuat Nalara</h2>
        <div class="max-w-[66ch] space-y-5 text-base leading-[1.8] text-[#4C5F53] dark:text-[#B8C6BB]">
          <p>Catatan transaksi sering tersebar, sementara saldo rekening tidak selalu berarti seluruh uangnya bebas dibelanjakan. Ketika semuanya terlihat sebagai satu angka, keputusan kecil sehari-hari bisa terasa sulit.</p>
          <p>Nalara membantu menghubungkan catatan pemasukan dan pengeluaran dengan anggaran, tabungan, dana pengaman, serta target pribadi. Tujuannya sederhana: memberi gambaran yang lebih jelas agar kamu dapat membuat keputusan sesuai keadaanmu sendiri.</p>
        </div>
      </div>
    </section>

    <section class="border-y border-[#DAE2D9] bg-[#EDF2E9] py-16 dark:border-[#26362A] dark:bg-[#141E17] sm:py-24">
      <div class="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <h2 class="max-w-2xl text-[2rem] font-extrabold leading-tight tracking-[-.04em] sm:text-[2.8rem]">Pendekatan kami</h2>
        <div class="mt-10 grid gap-0 lg:grid-cols-3 lg:gap-10">
          <div class="border-t border-[#CAD8CA] py-5 dark:border-[#324638]"><h3 class="text-lg font-bold">Mulai dari yang nyata</h3><p class="mt-3 text-sm leading-relaxed text-[#53645A] dark:text-[#ADBCB0]">Pemasukan, pengeluaran, dan saldo dicatat agar rencana berangkat dari keadaan keuangan yang terlihat.</p></div>
          <div class="border-t border-[#CAD8CA] py-5 dark:border-[#324638]"><h3 class="text-lg font-bold">Pisahkan uang menurut tujuan</h3><p class="mt-3 text-sm leading-relaxed text-[#53645A] dark:text-[#ADBCB0]">Uang untuk kebutuhan sehari-hari dan uang yang disisihkan untuk nanti perlu mudah dibedakan.</p></div>
          <div class="border-t border-b border-[#CAD8CA] py-5 dark:border-[#324638] lg:border-b-0"><h3 class="text-lg font-bold">Beri ruang untuk pilihan</h3><p class="mt-3 text-sm leading-relaxed text-[#53645A] dark:text-[#ADBCB0]">Simulasi dan perkiraan membantu memahami kemungkinan, bukan menggantikan keputusan finansial pribadi.</p></div>
        </div>
      </div>
    </section>

    <section class="py-16 sm:py-24">
      <div class="mx-auto flex max-w-7xl flex-col gap-7 px-5 sm:px-8 lg:flex-row lg:items-end lg:justify-between lg:px-10">
        <div class="max-w-2xl"><h2 class="text-[2rem] font-extrabold leading-tight tracking-[-.04em] sm:text-[2.8rem]">Kenali keuanganmu, mulai hari ini.</h2><p class="mt-4 text-base leading-relaxed text-[#53645A] dark:text-[#ADBCB0]">Buat akun dan mulai dengan mencatat satu transaksi. Tidak perlu menunggu semua rencanamu sempurna.</p></div>
        <RouterLink :to="startLink" class="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#183D2B] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#24553D] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#183D2B] dark:bg-[#B8DF38] dark:text-[#0E1410] dark:hover:bg-[#A3C82E] dark:focus-visible:outline-[#B8DF38]">{{ startLabel }} <ArrowRight class="h-4 w-4" aria-hidden="true" /></RouterLink>
      </div>
    </section>
  </PublicShell>
</template>
