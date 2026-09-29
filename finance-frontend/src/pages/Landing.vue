<script setup lang="ts">
import { computed, ref } from 'vue';
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
  TrendingUp,
  Wallet,
  X as XIcon,
} from 'lucide-vue-next';
import PublicShell from '../components/PublicShell.vue';
import { useAuthStore } from '../stores/auth.store';
import { formatRupiah } from '../utils/format';

const auth = useAuthStore();
const startLink = computed(() => (auth.token ? '/dashboard' : '/login?mode=register'));
const startLabel = computed(() => (auth.token ? 'Buka Dashboard' : 'Mulai Sekarang'));

// Hero Card Interactive Tab
const activeHeroTab = ref<'summary' | 'activity'>('summary');

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
</script>

<template>
  <PublicShell>
    <!-- 1. HERO SECTION (Asymmetric Split, bg-grid-pattern, initial viewport fit) -->
    <section class="relative overflow-hidden border-b border-slate-200/80 bg-white pt-10 pb-16 dark:border-slate-800/80 dark:bg-[#070B14] sm:pt-14 sm:pb-20 lg:pt-16 lg:pb-24">
      <div class="bg-grid-pattern absolute inset-0 opacity-40 pointer-events-none" aria-hidden="true"></div>

      <div class="relative mx-auto grid max-w-7xl items-center gap-12 px-5 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16 lg:px-10">
        <!-- Hero Left Column: Max 4 text elements per stack discipline -->
        <div class="relative z-10 max-w-xl">
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
              class="tactile-btn inline-flex min-h-12 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-[#0B192C] px-6 py-3 text-sm font-bold text-white shadow-xs transition hover:bg-[#172B45] hover:-translate-y-0.5 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#0B192C] dark:bg-white dark:text-[#0B192C] dark:hover:bg-slate-100 dark:focus-visible:outline-white"
            >
              {{ startLabel }}
              <ArrowRight class="h-4 w-4" aria-hidden="true" />
            </RouterLink>
            <RouterLink
              to="/#simulasi"
              class="tactile-btn inline-flex min-h-12 items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-bold text-slate-800 transition hover:bg-slate-50 hover:border-slate-400 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#0B192C] dark:border-slate-700 dark:bg-[#0D1524] dark:text-slate-200 dark:hover:bg-[#141F33] dark:focus-visible:outline-[#38BDF8]"
            >
              Coba Simulasi Anggaran
              <ChevronRight class="h-4 w-4" aria-hidden="true" />
            </RouterLink>
          </div>
        </div>

        <!-- Hero Right Column: Tactile Live Fintech Showcase Card (Zero AI-slop green glow) -->
        <div class="relative mx-auto w-full max-w-md lg:max-w-none">
          <!-- Card Container -->
          <div class="relative rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xl shadow-slate-900/5 transition-all dark:border-slate-800 dark:bg-[#0D1524] dark:shadow-black/50">
            <!-- Card Header: Profile & Live Status -->
            <div class="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-[#0B192C] text-white flex items-center justify-center font-bold text-sm shadow-xs dark:bg-blue-600 dark:text-white">
                  NL
                </div>
                <div>
                  <h3 class="text-sm font-bold text-[#0B192C] dark:text-[#F8FAFC]">Ringkasan Portofolio</h3>
                  <p class="text-xs text-slate-500 dark:text-slate-400">Bulan Berjalan</p>
                </div>
              </div>
              <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/40">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse"></span>
                Tersinkron
              </span>
            </div>

            <!-- Card Body: Balance Display -->
            <div class="py-5">
              <p class="text-xs font-medium text-slate-500 dark:text-slate-400">Saldo Utama Aktif</p>
              <div class="mt-1 flex items-baseline justify-between gap-4">
                <p class="text-3xl font-extrabold tabular-nums tracking-tight text-[#0B192C] dark:text-[#F8FAFC] sm:text-4xl">
                  Rp 18.450.000
                </p>
                <span class="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  <TrendingUp class="w-3.5 h-3.5" /> +12.4%
                </span>
              </div>

              <!-- Interactive Tabs for Card View -->
              <div class="mt-4 flex rounded-lg bg-slate-100 p-1 dark:bg-slate-800/60" role="tablist">
                <button
                  type="button"
                  class="flex-1 rounded-md py-1.5 text-xs font-semibold transition-all cursor-pointer"
                  :class="activeHeroTab === 'summary' ? 'bg-white text-[#0B192C] shadow-2xs dark:bg-[#070B14] dark:text-white' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'"
                  @click="activeHeroTab = 'summary'"
                >
                  Alokasi 50/30/20
                </button>
                <button
                  type="button"
                  class="flex-1 rounded-md py-1.5 text-xs font-semibold transition-all cursor-pointer"
                  :class="activeHeroTab === 'activity' ? 'bg-white text-[#0B192C] shadow-2xs dark:bg-[#070B14] dark:text-white' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'"
                  @click="activeHeroTab = 'activity'"
                >
                  Transaksi Terbaru
                </button>
              </div>

              <!-- Tab View 1: 50 / 30 / 20 Rule Visualized -->
              <div v-if="activeHeroTab === 'summary'" class="mt-4 space-y-2">
                <div class="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-300">
                  <span>Penyisihan Anggaran</span>
                  <span class="tabular-nums">50% · 30% · 20%</span>
                </div>
                <div class="h-2.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex gap-1 p-0.5">
                  <div class="h-full rounded-full bg-[#0B192C] dark:bg-blue-500 w-[50%]" title="Kebutuhan 50%"></div>
                  <div class="h-full rounded-full bg-blue-600 dark:bg-blue-400 w-[30%]" title="Tabungan 30%"></div>
                  <div class="h-full rounded-full bg-slate-400 dark:bg-slate-600 w-[20%]" title="Keinginan 20%"></div>
                </div>
                <div class="flex justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                  <span>Kebutuhan: Rp 9,2 jt</span>
                  <span>Tabungan: Rp 5,5 jt</span>
                  <span>Keinginan: Rp 3,7 jt</span>
                </div>
              </div>

              <!-- Tab View 2: Recent Activity List -->
              <div v-else class="mt-4 space-y-2">
                <div class="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-xs">
                  <div class="flex items-center gap-2.5">
                    <div class="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 flex items-center justify-center font-bold">
                      ↓
                    </div>
                    <div>
                      <p class="font-bold text-[#0B192C] dark:text-[#F8FAFC]">Pemasukan Gaji</p>
                      <p class="text-[10px] text-slate-500 dark:text-slate-400">Rekening Utama</p>
                    </div>
                  </div>
                  <span class="font-extrabold text-emerald-600 dark:text-emerald-400 tabular-nums">+Rp 7.500.000</span>
                </div>

                <div class="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-xs">
                  <div class="flex items-center gap-2.5">
                    <div class="w-7 h-7 rounded-lg bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200 flex items-center justify-center font-bold">
                      ↑
                    </div>
                    <div>
                      <p class="font-bold text-[#0B192C] dark:text-[#F8FAFC]">Penyisihan Dana Darurat</p>
                      <p class="text-[10px] text-slate-500 dark:text-slate-400">Target 6 Bulan</p>
                    </div>
                  </div>
                  <span class="font-extrabold text-slate-700 dark:text-slate-300 tabular-nums">Rp 1.350.000</span>
                </div>
              </div>
            </div>

            <!-- Floating Card Strip: Target Impian Progress -->
            <div class="mt-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs">
              <div class="flex items-center gap-2">
                <Sparkles class="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span class="font-bold text-[#0B192C] dark:text-[#F8FAFC]">Target Laptop Kerja</span>
              </div>
              <span class="font-extrabold tabular-nums text-blue-600 dark:text-blue-400">75% Tercapai</span>
            </div>
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

            <!-- Interactive Micro Preview: Saldo vs Dana Tujuan -->
            <div class="mt-8 grid grid-cols-2 gap-3 sm:gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
              <div>
                <p class="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Uang Belum Disisihkan</p>
                <p class="mt-1 text-base sm:text-lg font-extrabold tabular-nums text-[#0B192C] dark:text-[#F8FAFC]">
                  Rp 4.250.000
                </p>
                <p class="text-[10px] text-slate-400 mt-0.5">Bebas dialokasikan</p>
              </div>
              <div class="border-l border-slate-200 dark:border-slate-700 pl-3 sm:pl-4">
                <p class="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Total Dana Tujuan</p>
                <p class="mt-1 text-base sm:text-lg font-extrabold tabular-nums text-blue-600 dark:text-blue-400">
                  Rp 14.200.000
                </p>
                <p class="text-[10px] text-slate-400 mt-0.5">Terkunci untuk target</p>
              </div>
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
            <div class="grid items-center gap-6 md:grid-cols-3">
              <div class="md:col-span-2">
                <div class="w-12 h-12 rounded-xl bg-[#0B192C] text-white flex items-center justify-center font-bold mb-4 shadow-xs dark:bg-blue-600">
                  <Layers class="w-6 h-6" />
                </div>
                <h3 class="text-xl sm:text-2xl font-bold text-[#0B192C] dark:text-[#F8FAFC]">
                  Ketahui kapan impian Anda terwujud secara nyata.
                </h3>
                <p class="mt-2 max-w-[60ch] text-sm sm:text-base leading-relaxed text-slate-600 dark:text-slate-400">
                  Tentukan target barang atau dana pengaman, lalu Nalara menghitung estimasi bulan tercapai berdasarkan kemampuan tabungan bulanan aktual Anda.
                </p>
              </div>
              <div class="flex md:justify-end">
                <RouterLink
                  to="/#simulasi"
                  class="tactile-btn inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-[#0B192C] hover:bg-slate-100 transition shadow-2xs dark:bg-slate-800/80 dark:border-slate-700 dark:text-white dark:hover:bg-slate-800"
                >
                  Coba Kalkulator Target
                  <ArrowRight class="w-3.5 h-3.5" />
                </RouterLink>
              </div>
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
              class="min-h-10 rounded-xl border px-3.5 text-xs font-bold transition active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B192C] dark:focus-visible:outline-[#38BDF8] cursor-pointer"
              :class="monthlyIncome === amount
                ? 'border-[#0B192C] bg-[#0B192C] text-white dark:border-white dark:bg-white dark:text-[#0B192C] shadow-xs'
                : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400 dark:border-slate-700 dark:bg-[#070B14] dark:text-slate-300'"
              @click="monthlyIncome = amount"
            >
              {{ formatRupiah(amount) }}
            </button>
          </div>

          <!-- 3-Column Split Breakdown Cards -->
          <div class="mt-10 grid gap-4 border-t border-slate-200 pt-8 dark:border-slate-800 sm:grid-cols-3">
            <div class="p-4 rounded-xl bg-white dark:bg-[#070B14] border border-slate-200/90 dark:border-slate-800">
              <p class="text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center justify-between">
                <span>Kebutuhan Pokok</span>
                <span class="text-xs font-normal">50%</span>
              </p>
              <p class="mt-2 text-2xl font-extrabold tabular-nums text-[#0B192C] dark:text-[#F8FAFC]">
                {{ formatRupiah(needsAmount) }}
              </p>
              <p class="mt-1.5 text-xs text-slate-500 dark:text-slate-400">Makan, sewa, tagihan listrik, transportasi.</p>
            </div>

            <div class="p-4 rounded-xl bg-white dark:bg-[#070B14] border border-slate-200/90 dark:border-slate-800">
              <p class="text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center justify-between">
                <span>Tabungan & Target</span>
                <span class="text-xs font-normal">30%</span>
              </p>
              <p class="mt-2 text-2xl font-extrabold tabular-nums text-blue-600 dark:text-blue-400">
                {{ formatRupiah(savingsAmount) }}
              </p>
              <p class="mt-1.5 text-xs text-slate-500 dark:text-slate-400">Disisihkan untuk dana pengaman dan impian.</p>
            </div>

            <div class="p-4 rounded-xl bg-white dark:bg-[#070B14] border border-slate-200/90 dark:border-slate-800">
              <p class="text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center justify-between">
                <span>Keinginan Pribadi</span>
                <span class="text-xs font-normal">20%</span>
              </p>
              <p class="mt-2 text-2xl font-extrabold tabular-nums text-[#0B192C] dark:text-[#F8FAFC]">
                {{ formatRupiah(wantsAmount) }}
              </p>
              <p class="mt-1.5 text-xs text-slate-500 dark:text-slate-400">Kopi, makan di luar, belanja santai mingguan.</p>
            </div>
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
                class="inline-flex min-h-11 items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B192C] dark:focus-visible:outline-[#38BDF8] cursor-pointer"
                :class="selectedGoalKey === goal.key
                  ? 'border-[#0B192C] bg-blue-50 text-[#0B192C] dark:border-blue-400 dark:bg-blue-950/50 dark:text-blue-200 shadow-xs'
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

        <!-- Comparison Table Container -->
        <div class="mt-10 overflow-x-auto rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-[#0D1524]">
          <table class="w-full text-left text-sm">
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
              <tr>
                <td class="p-4 sm:p-5 font-semibold text-slate-800 dark:text-slate-200">
                  Penyisihan dana mental dalam 1 rekening fisik
                </td>
                <td class="p-4 sm:p-5 bg-blue-50/30 dark:bg-blue-950/10 font-bold text-emerald-600 dark:text-emerald-400">
                  <div class="flex items-center gap-1.5"><Check class="w-4 h-4" /> Otomatis & Terkunci</div>
                </td>
                <td class="p-4 sm:p-5 text-slate-500">Rumus manual rawan rusak</td>
                <td class="p-4 sm:p-5 text-slate-500">Harus buka rekening baru</td>
              </tr>
              <tr>
                <td class="p-4 sm:p-5 font-semibold text-slate-800 dark:text-slate-200">
                  Pembagian rasio 50/30/20 real-time
                </td>
                <td class="p-4 sm:p-5 bg-blue-50/30 dark:bg-blue-950/10 font-bold text-emerald-600 dark:text-emerald-400">
                  <div class="flex items-center gap-1.5"><Check class="w-4 h-4" /> Langsung dihitung</div>
                </td>
                <td class="p-4 sm:p-5 text-slate-500">Butuh setup tabel rumit</td>
                <td class="p-4 sm:p-5 text-slate-500">
                  <div class="flex items-center gap-1.5 text-slate-400"><XIcon class="w-4 h-4" /> Tidak ada</div>
                </td>
              </tr>
              <tr>
                <td class="p-4 sm:p-5 font-semibold text-slate-800 dark:text-slate-200">
                  Proyeksi target impian berbasis waktu
                </td>
                <td class="p-4 sm:p-5 bg-blue-50/30 dark:bg-blue-950/10 font-bold text-emerald-600 dark:text-emerald-400">
                  <div class="flex items-center gap-1.5"><Check class="w-4 h-4" /> Estimasi bulan akurat</div>
                </td>
                <td class="p-4 sm:p-5 text-slate-500">Perlu rumus manual</td>
                <td class="p-4 sm:p-5 text-slate-500">
                  <div class="flex items-center gap-1.5 text-slate-400"><XIcon class="w-4 h-4" /> Tidak ada</div>
                </td>
              </tr>
              <tr>
                <td class="p-4 sm:p-5 font-semibold text-slate-800 dark:text-slate-200">
                  Bebas iklan, penawaran pinjol, dan pelacak data
                </td>
                <td class="p-4 sm:p-5 bg-blue-50/30 dark:bg-blue-950/10 font-bold text-emerald-600 dark:text-emerald-400">
                  <div class="flex items-center gap-1.5"><Check class="w-4 h-4" /> 100% Bersih & Privat</div>
                </td>
                <td class="p-4 sm:p-5 text-slate-600 dark:text-slate-300">Tergantung penyedia cloud</td>
                <td class="p-4 sm:p-5 text-slate-500">Penuh banner promosi & paylater</td>
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
          <!-- Status Pill -->
          <div class="mb-5 inline-flex items-center gap-2.5 rounded-full border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-xs font-medium text-slate-700 shadow-2xs dark:border-slate-800 dark:bg-[#0D1524] dark:text-slate-300">
            <span class="relative flex h-2 w-2">
              <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-500 opacity-75"></span>
              <span class="relative inline-flex h-2 w-2 rounded-full bg-blue-600"></span>
            </span>
            <span class="font-mono text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Coming Soon</span>
            <span class="h-3 w-px bg-slate-200 dark:bg-slate-700"></span>
            <span>Aplikasi Mobile</span>
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
          <div class="mt-8 space-y-3">
            <div class="flex items-center gap-3.5 p-3.5 rounded-xl bg-slate-50 dark:bg-[#0D1524] border border-slate-200/80 dark:border-slate-800 transition hover:border-slate-300 dark:hover:border-slate-700">
              <div class="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 flex items-center justify-center shrink-0">
                <Smartphone class="w-4 h-4" />
              </div>
              <div>
                <p class="text-xs font-bold text-[#0B192C] dark:text-[#F8FAFC]">
                  Akses instan dari layar utama ponsel dengan satu ketukan
                </p>
                <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Pengalaman ringan layaknya aplikasi native tanpa beban memori tinggi
                </p>
              </div>
            </div>

            <div class="flex items-center gap-3.5 p-3.5 rounded-xl bg-slate-50 dark:bg-[#0D1524] border border-slate-200/80 dark:border-slate-800 transition hover:border-slate-300 dark:hover:border-slate-700">
              <div class="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 flex items-center justify-center shrink-0">
                <ShieldCheck class="w-4 h-4" />
              </div>
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
          <div class="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-[#070B14] shadow-xl">
            <!-- Top Floating Status Pill -->
            <div class="absolute top-4 left-4 z-10 inline-flex items-center gap-2 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md border border-white/15">
              <span class="h-2 w-2 rounded-full bg-blue-400 animate-pulse"></span>
              <span>Pratinjau Antarmuka Mobile</span>
            </div>

            <img
              src="/nalara-landing-mobile.jpg"
              alt="Seseorang membuka aplikasi keuangan Nalara di smartphone saat santai di kafe"
              width="1536"
              height="1024"
              loading="lazy"
              class="h-[320px] w-full object-cover sm:h-[390px]"
            />

            <!-- Bottom Floating Device Support Strip -->
            <div class="absolute bottom-4 inset-x-4 z-10 flex items-center justify-between rounded-xl bg-black/60 px-4 py-2.5 backdrop-blur-md border border-white/10 text-white text-xs">
              <div class="flex items-center gap-2 font-medium">
                <Smartphone class="h-4 w-4 text-blue-400" />
                <span>Mendukung iOS, Android & Desktop</span>
              </div>
              <span class="rounded-md bg-white/20 px-2 py-0.5 font-mono text-[10px] font-bold text-white uppercase">
                PWA
              </span>
            </div>
          </div>
          <figcaption class="mt-3 text-xs text-slate-500 dark:text-slate-400">
            Akses catatan keuangan langsung dari smartphone Anda kapan saja dan di mana saja.
          </figcaption>
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
              @click="toggleFaq(index)"
            >
              <span>{{ faq.q }}</span>
              <ChevronDown
                class="w-4 h-4 shrink-0 transition-transform duration-200 text-slate-400"
                :class="openFaqIndex === index ? 'rotate-180 text-blue-600 dark:text-blue-400' : ''"
              />
            </button>
            <div
              v-show="openFaqIndex === index"
              class="px-5 pb-5 pt-0 text-sm leading-relaxed text-slate-600 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800/60"
            >
              <p class="pt-3">{{ faq.a }}</p>
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
            class="tactile-btn inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-8 py-3.5 text-sm font-bold text-[#0B192C] transition hover:bg-slate-100 hover:-translate-y-0.5 active:scale-[0.98] shadow-xs"
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
.landing-range {
  accent-color: #0b192c;
}

:global(html.dark) .landing-range {
  accent-color: #38bdf8;
}
</style>
