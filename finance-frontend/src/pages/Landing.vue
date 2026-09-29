<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { RouterLink } from 'vue-router';
import {
  ArrowRight,
  Check,
  ChevronDown,
  ChevronRight,
  Layers,
  Percent,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Wallet,
  X as XIcon,
} from 'lucide-vue-next';
import PublicShell from '../components/PublicShell.vue';
import { useAuthStore } from '../stores/auth.store';
import { formatRupiah } from '../utils/format';

const auth = useAuthStore();
const startLink = computed(() => (auth.token ? '/dashboard' : '/login?mode=register'));
const startLabel = computed(() => (auth.token ? 'Buka Dashboard' : 'Mulai Sekarang'));
const exampleBalanceTotal = 18450000;
const exampleUnplannedAmount = 4250000;
const examplePlannedAmount = 14200000;
const exampleUnplannedShare = computed(() =>
  (exampleUnplannedAmount / exampleBalanceTotal) * 100
);

// Interactive Simulation State
const monthlyIncome = ref(7500000);
const incomePresets = [5000000, 7500000, 10000000, 15000000];
const needsAmount = computed(() => Math.round(monthlyIncome.value * 0.5));
const savingsAmount = computed(() => Math.round(monthlyIncome.value * 0.3));
const wantsAmount = computed(() => Math.round(monthlyIncome.value * 0.2));
const emergencyFundPart = computed(() => Math.round(savingsAmount.value * 0.6));
const dreamGoalPart = computed(() => savingsAmount.value - emergencyFundPart.value);

type GoalKey = 'laptop' | 'emergency' | 'house' | 'vacation';
const selectedGoalKey = ref<GoalKey>('laptop');
const goals = computed(() => [
  { key: 'laptop' as GoalKey, name: 'Laptop Kerja', price: 12000000 },
  { key: 'emergency' as GoalKey, name: 'Dana Darurat 6 Bulan', price: needsAmount.value * 6 },
  { key: 'house' as GoalKey, name: 'DP Rumah Pertama', price: 50000000 },
  { key: 'vacation' as GoalKey, name: 'Liburan Impian', price: 8000000 },
]);

const selectedGoal = computed(
  () => goals.value.find((g) => g.key === selectedGoalKey.value) ?? goals.value[0]!
);

const goalMonthlyAmount = computed(() =>
  selectedGoalKey.value === 'emergency' ? emergencyFundPart.value : dreamGoalPart.value
);

const monthsToAchieve = computed(() =>
  goalMonthlyAmount.value > 0 ? Math.ceil(selectedGoal.value.price / goalMonthlyAmount.value) : 0
);

const projectedDate = computed(() => {
  const date = new Date();
  date.setMonth(date.getMonth() + monthsToAchieve.value);
  return date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
});

const simulationResultUpdated = ref(false);
let simulationFeedbackTimer: number | undefined;

watch([monthlyIncome, selectedGoalKey], () => {
  simulationResultUpdated.value = true;
  window.clearTimeout(simulationFeedbackTimer);
  simulationFeedbackTimer = window.setTimeout(() => {
    simulationResultUpdated.value = false;
  }, 360);
});

const comparisonRows = [
  {
    feature: 'Penyisihan dana mental dalam 1 rekening fisik',
    nalara: 'Otomatis & Terkunci',
    spreadsheet: 'Rumus manual rawan rusak',
    bank: 'Harus buka rekening baru',
    bankUnavailable: false,
  },
  {
    feature: 'Pembagian rasio 50/30/20 real-time',
    nalara: 'Langsung dihitung',
    spreadsheet: 'Butuh setup tabel rumit',
    bank: 'Tidak ada',
    bankUnavailable: true,
  },
  {
    feature: 'Proyeksi target impian berbasis waktu',
    nalara: 'Estimasi bulan akurat',
    spreadsheet: 'Perlu rumus manual',
    bank: 'Tidak ada',
    bankUnavailable: true,
  },
  {
    feature: 'Bebas iklan, penawaran pinjol, dan pelacak data',
    nalara: '100% Bersih & Privat',
    spreadsheet: 'Tergantung penyedia cloud',
    bank: 'Penuh banner promosi & paylater',
    bankUnavailable: false,
  },
];

// FAQ State
const faqs = [
  {
    q: 'Apakah Nalara membutuhkan akses login ke rekening bank saya?',
    a: 'Tidak. Nalara sama sekali tidak meminta nomor kartu, kode OTP, PIN, atau kredensial internet banking Anda. Nalara adalah sistem pembukuan dan alokasi anggaran mandiri yang aman dan berfokus pada privasi.',
  },
  {
    q: 'Apa perbedaan antara "Uang Belum Disisihkan" dan "Dana Tujuan"?',
    a: 'Uang Belum Disisihkan adalah saldo bebas yang siap Anda belanjakan untuk operasional harian. Dana Tujuan adalah uang yang Anda kunci secara mental untuk kebutuhan spesifik seperti tabungan darurat atau target impian, meskipun uang fisiknya tetap berada di satu rekening yang sama.',
  },
  {
    q: 'Mengapa Nalara menganjurkan sistem kantong mental daripada membuka banyak rekening fisik?',
    a: 'Membuka banyak rekening bank fisik membebani Anda dengan biaya administrasi bulanan ganda, saldo mengendap minimum di tiap rekening, serta kerepotan transfer antar bank. Nalara memberikan ketertiban yang sama tanpa biaya ekstra.',
  },
  {
    q: 'Bagaimana rumus 50/30/20 diterapkan di Nalara?',
    a: 'Secara default, Nalara memandu Anda mengalokasikan 50% untuk kebutuhan pokok (makan, sewa, utilitas), 30% untuk tabungan dan target masa depan, serta 20% untuk keinginan rekreasi. Anda tetap bebas menyesuaikan angka ini sesuai kondisi riil Anda.',
  },
];

const openFaqIndex = ref<number | null>(0);
const toggleFaq = (index: number) => {
  openFaqIndex.value = openFaqIndex.value === index ? null : index;
};

let landingRevealObserver: IntersectionObserver | null = null;

onMounted(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion || !('IntersectionObserver' in window)) return;

  const revealItems = document.querySelectorAll<HTMLElement>('[data-landing-reveal]');
  if (revealItems.length === 0) return;

  landingRevealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.remove('landing-reveal-pending');
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.2 });

  revealItems.forEach((item) => {
    item.classList.add('landing-reveal-pending');
    landingRevealObserver?.observe(item);
  });
});

onUnmounted(() => {
  landingRevealObserver?.disconnect();
  window.clearTimeout(simulationFeedbackTimer);
});
</script>

<template>
  <PublicShell>
    <!-- 1. HERO SECTION (Asymmetric Split, bg-grid-pattern, initial viewport fit) -->
    <section class="relative overflow-hidden border-b border-slate-200/80 bg-white pt-10 pb-16 dark:border-slate-800/80 dark:bg-[#070B14] sm:pt-14 sm:pb-20 lg:pt-16 lg:pb-24">
      <div class="bg-grid-pattern absolute inset-0 opacity-40 pointer-events-none" aria-hidden="true"></div>

      <div class="relative mx-auto grid max-w-7xl items-center gap-12 px-5 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16 lg:px-10">
        <!-- Hero Left Column: Max 4 text elements per stack discipline -->
        <div class="landing-hero-copy relative z-10 max-w-xl">
          <!-- Text element 1: Eyebrow (1 of max 2 eyebrows across page) -->
          <p class="mb-4 text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            Keuangan Pribadi Lebih Jelas
          </p>
          <!-- Text element 2: Headline (max 2 lines desktop) -->
          <h1 class="text-4xl font-extrabold leading-[1.08] tracking-tight text-[#0B192C] dark:text-[#F8FAFC] sm:text-5xl lg:text-6xl">
            Kelola uang tanpa menebak-nebak.
          </h1>
          <!-- Text element 3: Subtext (13 words, max 20 words cap) -->
          <p class="mt-5 max-w-[48ch] text-base leading-relaxed text-slate-600 dark:text-slate-300 sm:text-lg">
            Catat transaksi, pahami sisa uang bebas, dan amankan target impian dalam satu tempat.
          </p>
          <!-- Text element 4: CTAs (1 primary + 1 secondary) -->
          <div class="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <RouterLink
              :to="startLink"
              class="nalara-primary-action inline-flex min-h-12 items-center justify-center gap-2 whitespace-nowrap rounded-xl px-6 py-3 text-sm font-bold shadow-xs hover:-translate-y-0.5"
            >
              {{ startLabel }}
              <ArrowRight class="h-4 w-4" aria-hidden="true" />
            </RouterLink>
            <RouterLink
              to="/#simulasi"
              class="nalara-secondary-action inline-flex min-h-12 items-center justify-center gap-2 whitespace-nowrap rounded-xl px-6 py-3 text-sm font-bold"
            >
              Coba Simulasi Anggaran
              <ChevronRight class="h-4 w-4" aria-hidden="true" />
            </RouterLink>
          </div>
        </div>

        <!-- Hero Right Column: explanatory money-allocation graphic -->
        <div class="landing-hero-visual relative mx-auto w-full max-w-md lg:max-w-none">
          <div class="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5 dark:border-slate-800 dark:bg-[#0D1524] dark:shadow-black/50 sm:p-8">
            <div class="flex items-start justify-between gap-4">
              <div>
                <p class="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Contoh pembagian</p>
                <h2 class="mt-2 text-lg font-bold tracking-tight text-[#0B192C] dark:text-[#F8FAFC] sm:text-xl">Satu pemasukan, tiga kebutuhan</h2>
              </div>
              <Wallet class="mt-1 h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400" aria-hidden="true" />
            </div>

            <div class="mt-8">
              <p class="text-sm font-medium text-slate-500 dark:text-slate-400">Contoh pemasukan bulanan</p>
              <p class="mt-1 text-3xl font-extrabold tabular-nums tracking-tight text-[#0B192C] dark:text-[#F8FAFC] sm:text-4xl">
                {{ formatRupiah(monthlyIncome) }}
              </p>
            </div>

            <div
              class="mt-6 flex h-3.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"
              role="img"
              :aria-label="`Contoh pembagian: kebutuhan ${formatRupiah(needsAmount)}, tabungan dan tujuan ${formatRupiah(savingsAmount)}, keinginan ${formatRupiah(wantsAmount)}`"
            >
              <span class="h-full bg-[#0B192C] dark:bg-blue-500" style="width: 50%"></span>
              <span class="h-full bg-blue-600 dark:bg-blue-400" style="width: 30%"></span>
              <span class="h-full bg-slate-300 dark:bg-slate-600" style="width: 20%"></span>
            </div>

            <dl class="mt-6 space-y-4">
              <div class="flex items-center justify-between gap-4">
                <dt class="flex min-w-0 items-center gap-3">
                  <Wallet class="h-4 w-4 shrink-0 text-[#0B192C] dark:text-blue-300" aria-hidden="true" />
                  <span class="min-w-0">
                    <span class="block text-sm font-semibold text-slate-800 dark:text-slate-200">Kebutuhan pokok</span>
                    <span class="block text-xs text-slate-500 dark:text-slate-400">50% dari pemasukan</span>
                  </span>
                </dt>
                <dd class="shrink-0 text-sm font-bold tabular-nums text-[#0B192C] dark:text-slate-100">{{ formatRupiah(needsAmount) }}</dd>
              </div>
              <div class="flex items-center justify-between gap-4">
                <dt class="flex min-w-0 items-center gap-3">
                  <ShieldCheck class="h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" aria-hidden="true" />
                  <span class="min-w-0">
                    <span class="block text-sm font-semibold text-slate-800 dark:text-slate-200">Tabungan dan tujuan</span>
                    <span class="block text-xs text-slate-500 dark:text-slate-400">30% dari pemasukan</span>
                  </span>
                </dt>
                <dd class="shrink-0 text-sm font-bold tabular-nums text-[#0B192C] dark:text-slate-100">{{ formatRupiah(savingsAmount) }}</dd>
              </div>
              <div class="flex items-center justify-between gap-4">
                <dt class="flex min-w-0 items-center gap-3">
                  <Sparkles class="h-4 w-4 shrink-0 text-slate-500 dark:text-slate-400" aria-hidden="true" />
                  <span class="min-w-0">
                    <span class="block text-sm font-semibold text-slate-800 dark:text-slate-200">Keinginan</span>
                    <span class="block text-xs text-slate-500 dark:text-slate-400">20% dari pemasukan</span>
                  </span>
                </dt>
                <dd class="shrink-0 text-sm font-bold tabular-nums text-[#0B192C] dark:text-slate-100">{{ formatRupiah(wantsAmount) }}</dd>
              </div>
            </dl>

            <RouterLink to="/#simulasi" class="mt-7 inline-flex min-h-11 items-center gap-2 rounded-lg text-sm font-semibold text-blue-700 transition-colors hover:text-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:text-blue-300 dark:hover:text-blue-200">
              Sesuaikan di simulasi anggaran <ChevronRight class="h-4 w-4" aria-hidden="true" />
            </RouterLink>
          </div>
        </div>
      </div>
    </section>

    <!-- 2. BENTO GRID FEATURES (Asymmetric Trio, real visual rhythm, zero eyebrow per restraint rule) -->
    <section id="metode" class="scroll-mt-20 py-16 sm:py-24 bg-[#F8FAFC] dark:bg-[#070B14]">
      <div class="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <!-- Vertical Stack Section Header (Split-Header Ban strictly honored) -->
        <div class="max-w-2xl">
          <h2 class="text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl text-[#0B192C] dark:text-[#F8FAFC]">
            Tiga fondasi keuangan yang lebih tenang.
          </h2>
          <p class="mt-3 text-base leading-relaxed text-slate-600 dark:text-slate-400">
            Bukan sekadar mencatat pengeluaran, tetapi mengontrol ke mana uang Anda dialokasikan sejak awal.
          </p>
        </div>

        <!-- Bento Grid: 3 Distinct Items, Varied Visual Weights -->
        <div class="mt-12 grid gap-6 md:grid-cols-3">
          <!-- Bento Cell 1: Large Featured Card (Span 2 on Desktop, Mental Vault Concept) -->
          <div class="md:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 flex flex-col justify-between transition-all hover:border-slate-300 dark:border-slate-800 dark:bg-[#0D1524] dark:hover:border-slate-700">
            <div>
              <div class="w-12 h-12 rounded-xl bg-[#0B192C] text-white flex items-center justify-center font-bold mb-5 shadow-xs dark:bg-blue-600">
                <Wallet class="w-6 h-6" />
              </div>
              <h3 class="text-xl font-bold text-[#0B192C] dark:text-[#F8FAFC] sm:text-2xl">
                Penyisihan dana tanpa memecah rekening fisik.
              </h3>
              <p class="mt-3 max-w-[54ch] text-sm sm:text-base leading-relaxed text-slate-600 dark:text-slate-400">
                Di Nalara, menyisihkan uang untuk dana darurat atau liburan tidak mengubah saldo rekening bank Anda. Uang tetap aman di rekening utama, namun secara mental terlindungi dari pengeluaran impulsif.
              </p>
            </div>

            <!-- Example graphic: one bank balance, two planned uses -->
            <div class="mt-8 rounded-xl border border-slate-200/80 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/40 sm:p-5">
              <div class="flex items-start justify-between gap-4">
                <div>
                  <p class="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Ilustrasi saldo</p>
                  <p class="mt-1 text-xs font-medium text-slate-600 dark:text-slate-300">Saldo di satu rekening</p>
                </div>
                <p class="shrink-0 text-sm font-extrabold tabular-nums text-[#0B192C] dark:text-[#F8FAFC] sm:text-base">
                  {{ formatRupiah(exampleBalanceTotal) }}
                </p>
              </div>

              <div
                class="mt-4 flex h-2.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700"
                role="img"
                :aria-label="`Ilustrasi saldo rekening ${formatRupiah(exampleBalanceTotal)}: ${formatRupiah(exampleUnplannedAmount)} belum direncanakan dan ${formatRupiah(examplePlannedAmount)} sudah direncanakan`"
              >
                <span class="h-full bg-slate-400 dark:bg-slate-500" :style="{ width: `${exampleUnplannedShare}%` }"></span>
                <span class="h-full flex-1 bg-blue-600 dark:bg-blue-400"></span>
              </div>

              <div class="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <p class="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Belum direncanakan</p>
                  <p class="mt-1 text-sm font-extrabold tabular-nums text-[#0B192C] dark:text-[#F8FAFC]">
                    {{ formatRupiah(exampleUnplannedAmount) }}
                  </p>
                </div>
                <div class="border-l border-slate-200 pl-4 dark:border-slate-700">
                  <p class="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Sudah punya tujuan</p>
                  <p class="mt-1 text-sm font-extrabold tabular-nums text-blue-700 dark:text-blue-300">
                    {{ formatRupiah(examplePlannedAmount) }}
                  </p>
                </div>
              </div>
              <p class="mt-4 border-t border-slate-200 pt-3 text-xs leading-relaxed text-slate-500 dark:border-slate-700 dark:text-slate-400">
                Uangnya tetap di rekening yang sama. Nalara mencatat rencana penggunaannya.
              </p>
            </div>
          </div>

          <!-- Bento Cell 2: Rule of 50/30/20 -->
          <div class="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 flex flex-col justify-between transition-all hover:border-slate-300 dark:border-slate-800 dark:bg-[#0D1524] dark:hover:border-slate-700">
            <div>
              <div class="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold mb-5 dark:bg-blue-950/60 dark:text-blue-400">
                <Percent class="w-6 h-6" />
              </div>
              <h3 class="text-xl font-bold text-[#0B192C] dark:text-[#F8FAFC]">
                Rasio anggaran yang realistis.
              </h3>
              <p class="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                Sesuaikan porsi Kebutuhan pokok, Tabungan target, dan Keinginan pribadi setiap bulan tanpa rasa terkekang.
              </p>
            </div>

            <!-- Mini List of Budget Buckets -->
            <div class="mt-6 space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div class="flex items-center justify-between text-xs py-1">
                <span class="font-medium text-slate-600 dark:text-slate-300">Kebutuhan Pokok</span>
                <span class="font-bold text-[#0B192C] dark:text-white">50%</span>
              </div>
              <div class="flex items-center justify-between text-xs py-1">
                <span class="font-medium text-slate-600 dark:text-slate-300">Tabungan & Target</span>
                <span class="font-bold text-blue-600 dark:text-blue-400">30%</span>
              </div>
              <div class="flex items-center justify-between text-xs py-1">
                <span class="font-medium text-slate-600 dark:text-slate-300">Keinginan & Rekreasi</span>
                <span class="font-bold text-slate-600 dark:text-slate-300">20%</span>
              </div>
            </div>
          </div>

          <!-- Bento Cell 3: Target Impian Projection (Span 3) -->
          <div class="md:col-span-3 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 transition-all dark:border-slate-800 dark:bg-[#0D1524]">
            <div class="grid items-center gap-8 lg:grid-cols-[1.05fr_.95fr]">
              <div>
                <div class="w-12 h-12 rounded-xl bg-[#0B192C] text-white flex items-center justify-center font-bold mb-4 shadow-xs dark:bg-blue-600">
                  <Layers class="w-6 h-6" />
                </div>
                <h3 class="text-xl sm:text-2xl font-bold text-[#0B192C] dark:text-[#F8FAFC]">
                  Ketahui kapan impian Anda terwujud secara nyata.
                </h3>
                <p class="mt-2 max-w-[60ch] text-sm sm:text-base leading-relaxed text-slate-600 dark:text-slate-400">
                  Tentukan target barang atau dana pengaman, lalu Nalara menghitung estimasi bulan tercapai berdasarkan kemampuan tabungan bulanan aktual Anda.
                </p>
                <div class="mt-6 flex">
                  <RouterLink
                    to="/#simulasi"
                    class="tactile-btn inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-[#0B192C] hover:bg-slate-100 transition shadow-2xs dark:bg-slate-800/80 dark:border-slate-700 dark:text-white dark:hover:bg-slate-800"
                  >
                    Coba Kalkulator Target
                    <ArrowRight class="w-3.5 h-3.5" />
                  </RouterLink>
                </div>
              </div>
              <figure
                data-landing-reveal
                class="landing-reveal overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-900"
              >
                <img
                  src="/nalara-goal-flow.jpg"
                  alt="Ilustrasi tiga aliran rencana keuangan menuju kebutuhan, tabungan, dan tujuan pribadi"
                  width="1536"
                  height="1024"
                  loading="lazy"
                  class="aspect-[3/2] w-full object-cover"
                />
                <figcaption class="border-t border-slate-200 px-4 py-3 text-xs leading-relaxed text-slate-600 dark:border-slate-700 dark:text-slate-300">
                  Ilustrasi aliran pemasukan menuju kebutuhan, tabungan, dan tujuan pribadi.
                </figcaption>
              </figure>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 3. SIMULASI ANGGARAN INTERAKTIF -->
    <section id="simulasi" class="scroll-mt-20 border-y border-slate-200/80 bg-white py-16 dark:border-slate-800/80 dark:bg-[#070B14] sm:py-24">
      <div class="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <!-- Section Header (Vertical Stack, no split-header) -->
        <div class="max-w-2xl">
          <h2 class="text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl text-[#0B192C] dark:text-[#F8FAFC]">
            Coba simulasi pembagian bulanan.
          </h2>
          <p class="mt-3 text-base leading-relaxed text-slate-600 dark:text-slate-400">
            Geser perkiraan pemasukan Anda untuk melihat contoh pembagian dana dan proyeksi waktu pencapaian target.
          </p>
        </div>

        <div class="mt-10 rounded-2xl border border-slate-200 bg-[#F8FAFC] p-6 dark:border-slate-800 dark:bg-[#0D1524] sm:p-8 lg:p-10 shadow-xs">
          <!-- Slider Control & Value Display -->
          <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <label for="income-slider" class="text-sm font-bold text-slate-700 dark:text-slate-300">
              Pemasukan per bulan
            </label>
            <output for="income-slider" class="text-3xl font-extrabold leading-none tracking-tight tabular-nums text-[#0B192C] dark:text-white sm:text-4xl">
              {{ formatRupiah(monthlyIncome) }}
            </output>
          </div>

          <input
            id="income-slider"
            v-model.number="monthlyIncome"
            type="range"
            min="3000000"
            max="35000000"
            step="500000"
            class="landing-range mt-6 w-full cursor-pointer h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none"
            aria-label="Geser perkiraan pemasukan bulanan"
            :aria-valuetext="formatRupiah(monthlyIncome)"
          />
          <div class="mt-2 flex justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Rp 3 juta</span>
            <span>Rp 35 juta</span>
          </div>

          <!-- Quick Income Presets -->
          <div class="mt-6 flex flex-wrap gap-2" aria-label="Pilihan pemasukan cepat">
            <button
              v-for="amount in incomePresets"
              :key="amount"
              type="button"
              class="min-h-10 rounded-xl border px-3.5 text-xs font-bold transition active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 cursor-pointer"
              :class="monthlyIncome === amount
                ? 'border-blue-600 bg-blue-600 text-white shadow-xs dark:border-blue-500 dark:bg-blue-600'
                : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400 dark:border-slate-700 dark:bg-[#070B14] dark:text-slate-300'"
              :aria-pressed="monthlyIncome === amount"
              @click="monthlyIncome = amount"
            >
              {{ formatRupiah(amount) }}
            </button>
          </div>

          <!-- Example allocation graphic and readable breakdown -->
          <div class="mt-10 border-t border-slate-200 pt-8 dark:border-slate-800">
            <div class="flex items-center justify-between gap-4">
              <h3 class="text-sm font-bold text-slate-700 dark:text-slate-200">Contoh pembagian</h3>
              <span class="text-xs font-semibold tabular-nums text-slate-500 dark:text-slate-400">50 / 30 / 20</span>
            </div>
            <div
              class="mt-4 flex h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700"
              role="img"
              :aria-label="`Contoh pembagian dari ${formatRupiah(monthlyIncome)}: kebutuhan ${formatRupiah(needsAmount)}, tabungan dan target ${formatRupiah(savingsAmount)}, keinginan ${formatRupiah(wantsAmount)}`"
            >
              <span class="h-full bg-[#0B192C] dark:bg-slate-300" style="width: 50%"></span>
              <span class="h-full bg-blue-600 dark:bg-blue-400" style="width: 30%"></span>
              <span class="h-full bg-slate-400 dark:bg-slate-500" style="width: 20%"></span>
            </div>

            <dl class="mt-5 divide-y divide-slate-200 dark:divide-slate-800">
              <div class="flex items-center justify-between gap-4 py-3">
                <dt>
                  <span class="block text-sm font-semibold text-slate-800 dark:text-slate-200">Kebutuhan pokok</span>
                  <span class="block text-xs text-slate-500 dark:text-slate-400">Kebutuhan dan tagihan</span>
                </dt>
                <dd class="shrink-0 text-right">
                  <span class="block text-sm font-bold tabular-nums text-[#0B192C] dark:text-slate-100">{{ formatRupiah(needsAmount) }}</span>
                  <span class="block text-xs text-slate-500 dark:text-slate-400">50%</span>
                </dd>
              </div>
              <div class="flex items-center justify-between gap-4 py-3">
                <dt>
                  <span class="block text-sm font-semibold text-slate-800 dark:text-slate-200">Tabungan dan target</span>
                  <span class="block text-xs text-slate-500 dark:text-slate-400">Dana pengaman dan rencana</span>
                </dt>
                <dd class="shrink-0 text-right">
                  <span class="block text-sm font-bold tabular-nums text-blue-700 dark:text-blue-300">{{ formatRupiah(savingsAmount) }}</span>
                  <span class="block text-xs text-slate-500 dark:text-slate-400">30%</span>
                </dd>
              </div>
              <div class="flex items-center justify-between gap-4 py-3">
                <dt>
                  <span class="block text-sm font-semibold text-slate-800 dark:text-slate-200">Keinginan pribadi</span>
                  <span class="block text-xs text-slate-500 dark:text-slate-400">Belanja dan rekreasi</span>
                </dt>
                <dd class="shrink-0 text-right">
                  <span class="block text-sm font-bold tabular-nums text-[#0B192C] dark:text-slate-100">{{ formatRupiah(wantsAmount) }}</span>
                  <span class="block text-xs text-slate-500 dark:text-slate-400">20%</span>
                </dd>
              </div>
            </dl>
          </div>

          <!-- Target Impian Projection Subsection -->
          <div id="target-impian" class="mt-10 scroll-mt-20 border-t border-slate-200 pt-8 dark:border-slate-800">
            <div class="max-w-2xl">
              <h3 class="text-lg sm:text-xl font-bold tracking-tight text-[#0B192C] dark:text-[#F8FAFC]">
                Simulasi pencapaian target impian
              </h3>
              <p class="mt-1.5 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                Dari porsi tabungan di atas, 60% disiapkan untuk dana pengaman dan 40% dialokasikan ke target pilihan Anda:
              </p>
            </div>

            <!-- Target Selection Pills -->
            <div class="mt-5 flex flex-wrap gap-2">
              <button
                v-for="goal in goals"
                :key="goal.key"
                type="button"
                class="inline-flex min-h-11 items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 cursor-pointer"
                :class="selectedGoalKey === goal.key
                  ? 'border-blue-600 bg-blue-600 text-white shadow-xs dark:border-blue-500 dark:bg-blue-600'
                  : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400 dark:border-slate-700 dark:bg-[#070B14] dark:text-slate-300'"
                :aria-pressed="selectedGoalKey === goal.key"
                @click="selectedGoalKey = goal.key"
              >
                <Check v-if="selectedGoalKey === goal.key" class="h-4 w-4" aria-hidden="true" />
                {{ goal.name }}
              </button>
            </div>

            <!-- Result Calculation Callout -->
            <div
              class="mt-7 flex flex-col gap-4 rounded-xl bg-white p-5 border border-slate-200 sm:flex-row sm:items-end sm:justify-between sm:p-6 dark:bg-[#070B14] dark:border-slate-800"
              :class="{ 'simulation-result-updated': simulationResultUpdated }"
              aria-live="polite"
            >
              <div>
                <p class="text-xs font-bold text-slate-500 dark:text-slate-400">
                  {{ selectedGoal.name }}: {{ formatRupiah(selectedGoal.price) }}
                </p>
                <p class="mt-2 text-3xl font-extrabold tracking-tight text-[#0B192C] dark:text-white sm:text-4xl tabular-nums">
                  Sekitar {{ monthsToAchieve }} bulan
                </p>
                <p class="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                  Dengan menyisihkan {{ formatRupiah(goalMonthlyAmount) }} per bulan, perkiraan tercapai pada {{ projectedDate }}.
                </p>
              </div>
              <p class="max-w-[26ch] text-xs leading-relaxed text-slate-400 dark:text-slate-500">
                Simulasi matematis murni. Tidak mencakup perubahan inflasi atau setoran yang fluktuatif.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 4. COMPARISON MATRIX (Nalara vs Spreadsheet vs Old Banking Apps) -->
    <section class="py-16 sm:py-24 bg-[#F8FAFC] dark:bg-[#070B14]">
      <div class="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <!-- Text element 1: Eyebrow (2nd eyebrow on page per restraint rule) -->
        <p class="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
          Perbandingan Sistem
        </p>
        <!-- Headline -->
        <h2 class="mt-2 text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl text-[#0B192C] dark:text-[#F8FAFC]">
          Mengapa beralih ke Nalara?
        </h2>
        <p class="mt-3 max-w-xl text-base text-slate-600 dark:text-slate-400">
          Lihat perbedaan pendekatan Nalara dibanding mencatat manual di spreadsheet atau mengandalkan aplikasi bank standar.
        </p>

        <!-- Mobile comparison: stacked by feature to avoid horizontal scrolling -->
        <div class="mt-8 space-y-6 md:hidden">
          <article v-for="row in comparisonRows" :key="row.feature" class="border-t border-slate-200 pt-5 dark:border-slate-800">
            <h3 class="text-sm font-bold leading-relaxed text-slate-900 dark:text-slate-100">{{ row.feature }}</h3>
            <div class="mt-3 border-l-2 border-blue-600 pl-3 dark:border-blue-400">
              <p class="text-[11px] font-bold uppercase tracking-wide text-blue-700 dark:text-blue-300">Nalara</p>
              <p class="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-200">{{ row.nalara }}</p>
            </div>
            <dl class="mt-3 grid gap-3 sm:grid-cols-2">
              <div>
                <dt class="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Spreadsheet</dt>
                <dd class="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-300">{{ row.spreadsheet }}</dd>
              </div>
              <div>
                <dt class="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Aplikasi bank biasa</dt>
                <dd class="mt-1 flex items-start gap-1.5 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                  <XIcon v-if="row.bankUnavailable" class="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden="true" />
                  <span>{{ row.bank }}</span>
                </dd>
              </div>
            </dl>
          </article>
        </div>

        <!-- Desktop comparison table -->
        <div class="mt-10 hidden overflow-x-auto rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-[#0D1524] md:block">
          <table class="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr class="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 text-xs font-bold text-slate-700 dark:text-slate-300">
                <th class="p-4 sm:p-5 w-1/3">Fitur & Pendekatan</th>
                <th class="p-4 sm:p-5 w-1/4 bg-blue-50/50 dark:bg-blue-950/20 text-[#0B192C] dark:text-blue-300">
                  Nalara
                </th>
                <th class="p-4 sm:p-5 w-1/5 text-slate-500">Spreadsheet</th>
                <th class="p-4 sm:p-5 w-1/5 text-slate-500">Aplikasi Bank Biasa</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
              <tr v-for="row in comparisonRows" :key="row.feature">
                <td class="p-4 sm:p-5 font-semibold text-slate-800 dark:text-slate-200">{{ row.feature }}</td>
                <td class="bg-blue-50/30 p-4 font-bold text-emerald-600 dark:bg-blue-950/10 dark:text-emerald-400 sm:p-5">
                  <div class="flex items-center gap-1.5"><Check class="h-4 w-4 shrink-0" aria-hidden="true" /> {{ row.nalara }}</div>
                </td>
                <td class="p-4 text-slate-500 sm:p-5">{{ row.spreadsheet }}</td>
                <td class="p-4 text-slate-500 sm:p-5">
                  <div class="flex items-center gap-1.5" :class="row.bankUnavailable ? 'text-slate-400' : ''">
                    <XIcon v-if="row.bankUnavailable" class="h-4 w-4 shrink-0" aria-hidden="true" />
                    {{ row.bank }}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <!-- 5. MODERN APP EXPERIENCE (PWA, Mobile & Desktop Ready) -->
    <section class="border-t border-slate-200/80 bg-white py-16 dark:border-slate-800/80 dark:bg-[#070B14] sm:py-24">
      <div class="mx-auto grid max-w-7xl items-center gap-12 px-5 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16 lg:px-10">
        <div class="max-w-xl">
          <!-- Feature availability -->
          <div class="mb-5 flex flex-wrap items-center gap-3">
            <span class="inline-flex min-h-9 items-center gap-2 rounded-full bg-blue-50 px-3.5 py-1.5 text-xs font-semibold text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
              <Smartphone class="h-4 w-4" aria-hidden="true" />
              Aplikasi mobile
            </span>
            <span class="text-xs font-medium text-slate-500 dark:text-slate-400">Segera hadir</span>
          </div>

          <!-- Headline -->
          <h2 class="text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl text-[#0B192C] dark:text-[#F8FAFC]">
            Bisa dipasang di HP dan laptop Anda.
          </h2>

          <!-- Subtext -->
          <p class="mt-4 text-base leading-relaxed text-slate-600 dark:text-slate-400">
            Kami sedang memfinalisasi dukungan Progressive Web App (PWA). Anda segera dapat memasang Nalara langsung ke layar utama ponsel tanpa perlu unduh lewat app store: cepat, hemat ruang penyimpanan, dan tanpa iklan.
          </p>

          <!-- Feature Highlights -->
          <div class="mt-8 grid gap-x-6 sm:grid-cols-2">
            <div class="flex items-start gap-3 border-t border-slate-200 py-4 dark:border-slate-800">
              <Smartphone class="mt-0.5 h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400" aria-hidden="true" />
              <div>
                <p class="text-xs font-bold text-[#0B192C] dark:text-[#F8FAFC]">
                  Akses instan dari layar utama ponsel dengan satu ketukan
                </p>
                <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Pengalaman ringan layaknya aplikasi native tanpa beban memori tinggi
                </p>
              </div>
            </div>

            <div class="flex items-start gap-3 border-t border-slate-200 py-4 dark:border-slate-800">
              <ShieldCheck class="mt-0.5 h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400" aria-hidden="true" />
              <div>
                <p class="text-xs font-bold text-[#0B192C] dark:text-[#F8FAFC]">
                  Privasi terjaga tanpa iklan pihak ketiga
                </p>
                <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Data catatan finansial tersimpan aman dan terenkripsi
                </p>
              </div>
            </div>
          </div>

          <!-- Bottom Navigation Link -->
          <div class="mt-8 flex flex-col sm:flex-row sm:items-center gap-4">
            <RouterLink
              to="/about"
              class="inline-flex items-center gap-2 text-sm font-bold text-blue-600 dark:text-blue-400 hover:gap-3 transition"
            >
              Pelajari filosofi di balik Nalara
              <ArrowRight class="h-4 w-4" aria-hidden="true" />
            </RouterLink>
          </div>
        </div>

        <!-- Right Side: Editorial Image Card -->
        <figure class="relative mx-auto w-full max-w-lg lg:mr-0">
          <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-900/5 dark:border-slate-800 dark:bg-[#0D1524] dark:shadow-black/30">
            <img
              src="/nalara-landing-mobile.jpg"
              alt="Ilustrasi seseorang melihat aplikasi keuangan di ponsel saat berada di kafe"
              width="1536"
              height="1024"
              loading="lazy"
              class="h-[320px] w-full object-cover sm:h-[390px]"
            />
            <div class="flex items-center gap-3 border-t border-slate-200 px-5 py-4 dark:border-slate-800">
              <Smartphone class="h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400" aria-hidden="true" />
              <p class="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                Ilustrasi mencatat dan memantau keuangan lewat ponsel.
              </p>
            </div>
          </div>
        </figure>
      </div>
    </section>

    <!-- 6. FAQ ACCORDION SECTION (No eyebrow, vertical stack header) -->
    <section class="border-t border-slate-200/80 bg-[#F8FAFC] py-16 dark:border-slate-800/80 dark:bg-[#070B14] sm:py-24">
      <div class="mx-auto max-w-4xl px-5 sm:px-8 lg:px-10">
        <div class="text-center max-w-xl mx-auto">
          <h2 class="text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl text-[#0B192C] dark:text-[#F8FAFC]">
            Pertanyaan yang sering diajukan
          </h2>
          <p class="mt-3 text-base text-slate-600 dark:text-slate-400">
            Semua hal yang perlu Anda ketahui sebelum mulai menggunakan Nalara.
          </p>
        </div>

        <div class="mt-10 space-y-3">
          <div
            v-for="(faq, index) in faqs"
            :key="index"
            class="rounded-xl border border-slate-200 bg-white overflow-hidden transition-all dark:border-slate-800 dark:bg-[#0D1524]"
          >
            <button
              type="button"
              class="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-[#0B192C] dark:text-[#F8FAFC] cursor-pointer"
              :aria-expanded="openFaqIndex === index"
              :aria-controls="`landing-faq-answer-${index}`"
              @click="toggleFaq(index)"
            >
              <span>{{ faq.q }}</span>
              <ChevronDown
                class="w-4 h-4 shrink-0 transition-transform duration-200 text-slate-400"
                :class="openFaqIndex === index ? 'rotate-180 text-blue-600 dark:text-blue-400' : ''"
              />
            </button>
            <div
              :id="`landing-faq-answer-${index}`"
              class="grid overflow-hidden transition-[grid-template-rows] duration-200 ease-out motion-reduce:transition-none"
              :class="openFaqIndex === index ? 'grid-rows-[1fr] border-t border-slate-100 dark:border-slate-800/60' : 'grid-rows-[0fr]'"
              :aria-hidden="openFaqIndex !== index"
              :inert="openFaqIndex !== index"
            >
              <div class="min-h-0 overflow-hidden">
                <p class="px-5 pb-5 pt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{{ faq.a }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 7. CLOSING CTA BANNER (Single intent, zero em-dash, Midnight Navy card) -->
    <section class="border-t border-slate-200/80 bg-white py-16 dark:border-slate-800/80 dark:bg-[#070B14] sm:py-20">
      <div class="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <div class="rounded-3xl bg-[#0B192C] p-8 sm:p-12 lg:p-16 text-white flex flex-col lg:flex-row items-center justify-between gap-8 shadow-xl shadow-slate-900/10">
          <div class="max-w-xl text-center lg:text-left">
            <h2 class="text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
              Mulai dari satu catatan hari ini.
            </h2>
            <p class="mt-3 text-base text-slate-300 leading-relaxed">
              Catat transaksi pertamamu, amankan tabungan target, dan bangun masa depan finansial yang lebih jelas bersama Nalara.
            </p>
          </div>
          <RouterLink
            :to="startLink"
            class="nalara-primary-action inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl px-8 py-3.5 text-sm font-bold shadow-xs hover:-translate-y-0.5"
          >
            {{ startLabel }}
            <ArrowRight class="h-4 w-4" aria-hidden="true" />
          </RouterLink>
        </div>
      </div>
    </section>
  </PublicShell>
</template>

<style scoped>
.landing-hero-copy,
.landing-hero-visual {
  animation: landingHeroEnter 420ms cubic-bezier(0.16, 1, 0.3, 1) both;
}

.landing-hero-visual {
  animation-delay: 90ms;
}

.landing-reveal {
  transition:
    opacity 260ms cubic-bezier(0.16, 1, 0.3, 1),
    transform 260ms cubic-bezier(0.16, 1, 0.3, 1);
}

.landing-reveal-pending {
  opacity: 0;
  transform: translateY(14px) scale(0.99);
}

.landing-reveal.is-visible {
  opacity: 1;
  transform: translateY(0) scale(1);
}

.simulation-result-updated {
  border-color: var(--color-brand-accent);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-brand-accent) 16%, transparent);
}

#target-impian [aria-live] {
  transition:
    border-color 180ms ease,
    box-shadow 180ms ease;
}

@keyframes landingHeroEnter {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.landing-range {
  accent-color: #2563eb;
}

@media (prefers-reduced-motion: reduce) {
  .landing-hero-copy,
  .landing-hero-visual,
  .landing-reveal,
  #target-impian [aria-live] {
    animation: none;
    opacity: 1;
    transform: none;
    transition: none;
  }

}
</style>
