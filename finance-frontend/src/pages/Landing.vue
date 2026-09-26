<script setup lang="ts">
import { ref, computed } from 'vue';
import {
  ArrowRight,
  ChevronDown,
  Wallet,
  ShieldCheck,
  Target,
  Sparkles,
  Coffee,
  CheckCircle2,
  Sun,
  Moon,
  Laptop,
  Home,
  Plane,
} from 'lucide-vue-next';
import { useAuthStore } from '../stores/auth.store';
import { useTheme } from '../composables/useTheme';
import { formatRupiah } from '../utils/format';

const auth = useAuthStore();
const { isDark, toggleTheme } = useTheme();

const startLink = computed(() => (auth.token ? '/dashboard' : '/login?mode=register'));
const startLabel = computed(() => (auth.token ? 'Buka Dashboard' : 'Mulai Sekarang'));

// --- LIVE INTERACTIVE FINANCIAL SIMULATION STATE ---
const monthlyIncome = ref(7500000); // Default Rp 7.500.000

const incomePresets = [
  { label: 'Rp 5 Juta', value: 5000000 },
  { label: 'Rp 7,5 Juta', value: 7500000 },
  { label: 'Rp 10 Juta', value: 10000000 },
  { label: 'Rp 15 Juta', value: 15000000 },
  { label: 'Rp 20 Juta', value: 20000000 },
];

// 50/30/20 Smart Split
const needsAmount = computed(() => Math.round(monthlyIncome.value * 0.5));
const savingsAmount = computed(() => Math.round(monthlyIncome.value * 0.3));
const wantsAmount = computed(() => Math.round(monthlyIncome.value * 0.2));

// Tabungan: 60% Dana Pengaman, 40% Target Impian
const emergencyFundPart = computed(() => Math.round(savingsAmount.value * 0.6));
const dreamGoalPart = computed(() => Math.round(savingsAmount.value * 0.4));

// Batas Belanja Harian (Safe-to-Spend per Day) dari Pos Keinginan (asumsi 30 hari)
const dailySafeSpend = computed(() => Math.round(wantsAmount.value / 30));

// Target Impian Simulator Presets
type GoalPresetKey = 'laptop' | 'emergency' | 'house_dp' | 'vacation';

interface GoalPreset {
  key: GoalPresetKey;
  name: string;
  price: number;
  icon: any;
  desc: string;
}

const selectedGoalKey = ref<GoalPresetKey>('laptop');

const goalPresets = computed<GoalPreset[]>(() => [
  {
    key: 'laptop',
    name: 'Laptop Kerja',
    price: 12000000,
    icon: Laptop,
    desc: 'Untuk upgrade produktivitas atau kerja lepas',
  },
  {
    key: 'emergency',
    name: 'Dana Darurat 6 Bulan',
    price: needsAmount.value * 6,
    icon: ShieldCheck,
    desc: 'Bantalan tenang jika terjadi krisis tak terduga',
  },
  {
    key: 'house_dp',
    name: 'DP Rumah Pertama',
    price: 50000000,
    icon: Home,
    desc: 'Modal awal cicilan hunian masa depan',
  },
  {
    key: 'vacation',
    name: 'Liburan & Healing',
    price: 8000000,
    icon: Plane,
    desc: 'Self-reward sehat tanpa menguras tabungan',
  },
]);

const currentSelectedGoal = computed<GoalPreset>(() => {
  return goalPresets.value.find((g) => g.key === selectedGoalKey.value) ?? goalPresets.value[0]!;
});

// Bulan yang dibutuhkan untuk mencapai target dari porsi impian
const monthsToAchieve = computed(() => {
  const monthlyPart = dreamGoalPart.value;
  if (monthlyPart <= 0) return 0;
  return Math.ceil(currentSelectedGoal.value.price / monthlyPart);
});

// Estimasi tanggal tercapai
const projectedAchieveDate = computed(() => {
  const d = new Date();
  d.setMonth(d.getMonth() + monthsToAchieve.value);
  return d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
});

const scrollToSimulation = () => {
  const el = document.getElementById('simulasi');
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
};
</script>

<template>
  <div class="landing min-h-[100dvh] bg-[#F3F5EF] dark:bg-[#0E1410] text-[#18221B] dark:text-[#F0F4F1] transition-colors duration-200">
    <!-- NAVIGATION BAR (Mobile-friendly max height 64px on phone, 72px on desktop) -->
    <header class="sticky top-0 z-40 bg-[#F3F5EF]/95 dark:bg-[#0E1410]/95 backdrop-blur-md border-b border-[#DDE6DC] dark:border-[#27372C] transition-colors">
      <nav class="max-w-7xl mx-auto px-3.5 sm:px-8 lg:px-10 h-16 sm:h-[72px] flex items-center justify-between gap-2 sm:gap-6" aria-label="Navigasi utama">
        <!-- Brand Mark -->
        <RouterLink
          to="/"
          class="inline-flex items-center gap-2 sm:gap-3 shrink-0 rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#183D2B] dark:focus-visible:outline-[#B8DF38]"
          aria-label="Project-Keuangan, beranda"
        >
          <span class="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-[#183D2B] dark:bg-[#B8DF38] text-[#B8DF38] dark:text-[#183D2B] grid place-items-center font-black text-xs sm:text-sm tracking-wider shadow-sm shrink-0">
            PK
          </span>
          <span class="font-extrabold tracking-tight text-sm sm:text-base hidden min-[360px]:inline">
            Project-Keuangan
          </span>
        </RouterLink>

        <!-- Section Navigation Links (Desktop) -->
        <div class="hidden md:flex items-center gap-8 text-sm font-semibold text-[#425348] dark:text-[#C8D3CA]">
          <button
            type="button"
            @click="scrollToSimulation"
            class="hover:text-[#183D2B] dark:hover:text-[#B8DF38] cursor-pointer transition-colors"
          >
            Simulasi Gaji & Target
          </button>
          <a
            href="#metode"
            class="hover:text-[#183D2B] dark:hover:text-[#B8DF38] cursor-pointer transition-colors"
          >
            Cara Kerja
          </a>
          <a
            href="#keunggulan"
            class="hover:text-[#183D2B] dark:hover:text-[#B8DF38] cursor-pointer transition-colors"
          >
            Kenapa Berbeda
          </a>
        </div>

        <!-- Auth Controls & Dark Mode Toggle -->
        <div class="flex items-center gap-1.5 sm:gap-4 shrink-0">
          <!-- Theme Toggle -->
          <button
            type="button"
            @click="toggleTheme"
            class="p-2 sm:p-2.5 rounded-xl text-stone-600 dark:text-stone-300 hover:bg-stone-200/60 dark:hover:bg-stone-800/60 transition cursor-pointer"
            :aria-label="isDark ? 'Beralih ke mode terang' : 'Beralih ke mode gelap'"
          >
            <Sun v-if="isDark" class="w-4 h-4 text-[#B8DF38]" />
            <Moon v-else class="w-4 h-4 text-stone-700" />
          </button>

          <RouterLink
            v-if="!auth.token"
            to="/login"
            class="text-xs sm:text-sm font-bold text-[#183D2B] dark:text-[#B8DF38] hover:underline px-2 py-1"
          >
            Masuk
          </RouterLink>

          <RouterLink
            :to="startLink"
            class="tactile-btn inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-[#183D2B] dark:bg-[#B8DF38] text-[#F3F5EF] dark:text-[#0E1410] text-xs sm:text-sm font-extrabold shadow-sm hover:bg-[#24553D] dark:hover:bg-[#a3c82e] active:scale-[0.98] transition cursor-pointer shrink-0"
          >
            <span class="hidden sm:inline">{{ startLabel }}</span>
            <span class="sm:hidden">{{ auth.token ? 'Dashboard' : 'Mulai' }}</span>
            <ArrowRight class="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </RouterLink>
        </div>
      </nav>
    </header>

    <main>
      <!-- HERO SECTION (Split Screen, Anti-Center Bias, fits viewport) -->
      <section class="max-w-7xl mx-auto px-4 sm:px-8 lg:px-10 min-h-[calc(100dvh-64px)] sm:min-h-[calc(100dvh-72px)] grid lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] gap-8 sm:gap-10 lg:gap-14 items-center py-8 sm:py-14 lg:py-16">
        <!-- Hero Copy -->
        <div class="space-y-5 sm:space-y-6 max-w-[580px]">
          <!-- Eyebrow: Restricted to exactly 1 in hero per anti-slop rules -->
          <div class="flex">
            <span class="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-extrabold tracking-wider uppercase bg-[#183D2B]/10 dark:bg-[#B8DF38]/15 text-[#183D2B] dark:text-[#B8DF38] border border-[#183D2B]/15 dark:border-[#B8DF38]/20">
              <Sparkles class="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
              <span>Pengelolaan Arus Kas & Target Impian</span>
            </span>
          </div>

          <h1 class="text-[2rem] sm:text-5xl lg:text-[3.5rem] font-black tracking-[-0.04em] leading-[1.12] sm:leading-[1.08] text-[#18221B] dark:text-[#F0F4F1]">
            Uangmu, Lebih Jelas Hari Ini. Lebih Siap Hari Esok.
          </h1>

          <p class="text-sm sm:text-lg text-[#425348] dark:text-[#C8D3CA] leading-relaxed max-w-[48ch]">
            Satu tempat tenang untuk membagi anggaran 50/30/20, mempercepat target impian, dan tahu batas aman jajan harian.
          </p>

          <!-- CTAs (Full width on mobile for thumb accessibility) -->
          <div class="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <RouterLink
              :to="startLink"
              class="tactile-btn inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#183D2B] dark:bg-[#B8DF38] text-white dark:text-[#0E1410] font-extrabold text-sm shadow-md hover:bg-[#24553D] dark:hover:bg-[#a3c82e] active:scale-[0.98] transition cursor-pointer min-h-[48px]"
            >
              <span>{{ startLabel }}</span>
              <ArrowRight class="w-4 h-4" />
            </RouterLink>

            <button
              type="button"
              @click="scrollToSimulation"
              class="tactile-btn inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-white dark:bg-[#16201A] hover:bg-stone-100 dark:hover:bg-[#243329] text-[#183D2B] dark:text-[#F0F4F1] font-bold text-sm border border-stone-200/90 dark:border-[#27372C] shadow-2xs active:scale-[0.98] transition cursor-pointer min-h-[48px]"
            >
              <span>Uji Simulasi Langsung</span>
              <ChevronDown class="w-4 h-4 text-stone-400" />
            </button>
          </div>

          <!-- Micro Trust Reassurance -->
          <p class="text-[11px] sm:text-xs text-[#5E6961] dark:text-[#98A79D] flex items-center gap-2 flex-wrap">
            <span class="inline-flex items-center gap-1 font-semibold text-[#183D2B] dark:text-[#B8DF38]">
              <CheckCircle2 class="w-3.5 h-3.5" /> Bebas Iklan
            </span>
            <span>·</span>
            <span>Tanpa Sambung Rekening Paksa</span>
            <span>·</span>
            <span>Privasi Aman</span>
          </p>
        </div>

        <!-- Hero Visual: Signature Forest Balance Card Component Preview -->
        <div class="relative min-w-0">
          <!-- Background Ambient Glow -->
          <div class="absolute -right-6 -top-6 w-60 h-60 rounded-full bg-[#B8DF38]/15 blur-3xl pointer-events-none"></div>

          <div class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#183D2B] via-[#143425] to-[#0D2218] dark:from-[#132E21] dark:via-[#0F241A] dark:to-[#0A1B13] text-white p-5 sm:p-7 shadow-[0_20px_50px_-20px_rgba(24,61,43,0.35)] border border-emerald-800/50 dark:border-[#B8DF38]/30">
            <!-- Header Card Preview -->
            <div class="flex items-center justify-between border-b border-white/10 pb-3.5 sm:pb-4">
              <div class="flex items-center gap-2 sm:gap-2.5">
                <div class="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#B8DF38]/20 flex items-center justify-center text-[#B8DF38] shrink-0">
                  <Wallet class="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
                <div>
                  <span class="text-xs font-bold text-emerald-200 block">Kondisi Kas Realistis</span>
                  <span class="text-[10px] sm:text-[11px] text-emerald-100/70">Bulan Berjalan</span>
                </div>
              </div>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#B8DF38] text-[#183D2B]">
                Aktif
              </span>
            </div>

            <!-- Big Focal Point: Uang Yang Bisa Dipakai -->
            <div class="py-4 sm:py-5 space-y-1">
              <span class="text-xs font-semibold text-emerald-100/80">Uang yang aman bisa dipakai</span>
              <p class="text-2xl sm:text-4xl font-black text-[#B8DF38] tracking-tight tabular-nums">
                Rp 3.850.000
              </p>
              <p class="text-[10px] sm:text-[11px] text-emerald-100/70 leading-relaxed">
                Sudah dikurangi pos cicilan wajib & tabungan. Kamu bebas belanja tanpa khawatir boncos.
              </p>
            </div>

            <!-- 2 Mini Split Columns -->
            <div class="grid grid-cols-2 gap-2 sm:gap-3 pt-3 border-t border-white/10">
              <div class="p-2.5 sm:p-3 rounded-xl bg-white/5 border border-white/10">
                <span class="text-[9px] sm:text-[10px] text-emerald-100/70 block">Total Saldo Rekening</span>
                <span class="text-xs sm:text-sm font-bold text-white tabular-nums block mt-0.5">Rp 12.500.000</span>
              </div>
              <div class="p-2.5 sm:p-3 rounded-xl bg-white/5 border border-white/10">
                <span class="text-[9px] sm:text-[10px] text-emerald-100/70 block">Disisihkan Tabungan</span>
                <span class="text-xs sm:text-sm font-bold text-white tabular-nums block mt-0.5">Rp 8.650.000</span>
              </div>
            </div>

            <!-- Safe to Spend Live Gauge -->
            <div class="mt-3.5 sm:mt-4 p-3 sm:p-3.5 rounded-xl bg-[#B8DF38]/10 border border-[#B8DF38]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-3">
              <div class="flex items-center gap-2">
                <Coffee class="w-4 h-4 text-[#B8DF38] shrink-0" />
                <div>
                  <span class="text-[10px] sm:text-[11px] font-bold text-[#B8DF38] block">Batas Belanja Hari Ini (Safe-to-Spend)</span>
                  <span class="text-xs font-black text-white tabular-nums">Rp 65.000 / hari</span>
                </div>
              </div>
              <span class="text-[10px] font-semibold text-emerald-200 self-end sm:self-auto">Aman Terkendali</span>
            </div>
          </div>
        </div>
      </section>

      <!-- LIVE INTERACTIVE FINANCIAL SANDBOX (SIMULATOR) SECTION -->
      <section id="simulasi" class="border-t border-[#DDE6DC] dark:border-[#27372C] py-14 sm:py-24 bg-white dark:bg-[#16201A] scroll-mt-16">
        <div class="max-w-7xl mx-auto px-4 sm:px-8 lg:px-10 space-y-8 sm:space-y-12">
          <!-- Section Title -->
          <div class="max-w-2xl space-y-2 sm:space-y-3">
            <h2 class="text-2xl sm:text-4xl font-extrabold tracking-tight text-[#18221B] dark:text-[#F0F4F1]">
              Uji Rencana Keuanganmu Dalam 10 Detik
            </h2>
            <p class="text-sm sm:text-base text-[#425348] dark:text-[#C8D3CA] leading-relaxed">
              Geser estimasi pemasukan bulananmu dan lihat bagaimana sistem membagi uangmu secara cerdas tanpa bikin tersiksa.
            </p>
          </div>

          <!-- Interactive Calculator Container -->
          <div class="rounded-2xl sm:rounded-3xl p-4 sm:p-8 lg:p-10 bg-[#F3F5EF] dark:bg-[#0E1410] border border-stone-200/90 dark:border-[#27372C] shadow-sm space-y-8 sm:space-y-10">
            <!-- 1. Income Slider & Quick Chips -->
            <div class="space-y-3 sm:space-y-4 max-w-3xl">
              <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
                <label for="income-slider" class="text-xs sm:text-sm font-bold text-stone-700 dark:text-[#F0F4F1] flex items-center gap-2">
                  <span>Pemasukan Bulanan Bersihmu:</span>
                </label>
                <div class="text-2xl sm:text-3xl font-black text-[#183D2B] dark:text-[#B8DF38] tabular-nums tracking-tight">
                  {{ formatRupiah(monthlyIncome) }}
                  <span class="text-xs font-semibold text-stone-500 dark:text-[#98A79D]">/ bulan</span>
                </div>
              </div>

              <!-- Range Slider (Comfortable touch target) -->
              <div class="py-2">
                <input
                  id="income-slider"
                  type="range"
                  v-model.number="monthlyIncome"
                  min="3000000"
                  max="35000000"
                  step="500000"
                  class="w-full h-3 bg-stone-200 dark:bg-stone-800 rounded-lg appearance-none cursor-pointer accent-[#183D2B] dark:accent-[#B8DF38]"
                />
              </div>

              <!-- Preset Chips (Horizontally swipeable on mobile) -->
              <div class="flex items-center gap-2 overflow-x-auto pb-1.5 pt-1 -mx-2 px-2 sm:mx-0 sm:px-0 sm:flex-wrap sm:overflow-visible no-scrollbar">
                <span class="text-[11px] text-stone-500 dark:text-[#98A79D] font-medium shrink-0">Contoh:</span>
                <button
                  v-for="chip in incomePresets"
                  :key="chip.value"
                  type="button"
                  @click="monthlyIncome = chip.value"
                  class="tactile-btn px-2.5 sm:px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer shrink-0"
                  :class="monthlyIncome === chip.value ? 'bg-[#183D2B] dark:bg-[#B8DF38] text-white dark:text-[#0E1410]' : 'bg-white dark:bg-[#16201A] text-stone-700 dark:text-stone-300 border border-stone-200/80 dark:border-[#27372C] hover:bg-stone-100'"
                >
                  {{ chip.label }}
                </button>
              </div>
            </div>

            <!-- 2. The 3-Pillar 50/30/20 Smart Split Cards -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
              <!-- Pillar 1: Kebutuhan 50% -->
              <div class="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#16201A] border border-stone-200/80 dark:border-[#27372C] space-y-2.5 sm:space-y-3">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-bold text-stone-600 dark:text-[#98A79D]">Pos Kebutuhan (50%)</span>
                  <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                    Wajib Hidup
                  </span>
                </div>
                <div>
                  <span class="text-xl sm:text-2xl font-black text-[#18221B] dark:text-[#F0F4F1] tabular-nums block tracking-tight">
                    {{ formatRupiah(needsAmount) }}
                  </span>
                  <span class="text-[11px] text-stone-500 dark:text-[#98A79D]">Maksimal pengeluaran pokok</span>
                </div>
                <p class="text-xs text-stone-500 dark:text-[#98A79D] leading-relaxed pt-2 border-t border-stone-100 dark:border-[#27372C]">
                  Sewa tempat tinggal, makan sehari-hari, tagihan listrik/air, kuota, dan transportasi kerja.
                </p>
              </div>

              <!-- Pillar 2: Tabungan & Investasi 30% -->
              <div class="p-4 sm:p-5 rounded-2xl bg-emerald-50/70 dark:bg-[#132E21]/40 border border-emerald-200/80 dark:border-emerald-900/50 space-y-2.5 sm:space-y-3">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-bold text-[#183D2B] dark:text-[#B8DF38] flex items-center gap-1">
                    <ShieldCheck class="w-4 h-4 shrink-0" />
                    <span>Tabungan & Target (30%)</span>
                  </span>
                  <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#183D2B]/10 dark:bg-[#B8DF38]/15 text-[#183D2B] dark:text-[#B8DF38]">
                    Masa Depan
                  </span>
                </div>
                <div>
                  <span class="text-xl sm:text-2xl font-black text-[#183D2B] dark:text-[#B8DF38] tabular-nums block tracking-tight">
                    {{ formatRupiah(savingsAmount) }}
                  </span>
                  <span class="text-[11px] text-stone-500 dark:text-[#98A79D]">Disisihkan setiap bulan</span>
                </div>
                <div class="space-y-1.5 pt-2 border-t border-emerald-200/50 dark:border-emerald-800/40 text-xs">
                  <div class="flex justify-between text-stone-600 dark:text-stone-300">
                    <span>🛡️ Dana Darurat (60%):</span>
                    <strong class="tabular-nums">{{ formatRupiah(emergencyFundPart) }}</strong>
                  </div>
                  <div class="flex justify-between text-stone-600 dark:text-stone-300">
                    <span>🎯 Target Impian (40%):</span>
                    <strong class="tabular-nums">{{ formatRupiah(dreamGoalPart) }}</strong>
                  </div>
                </div>
              </div>

              <!-- Pillar 3: Keinginan & Safe-to-Spend 20% -->
              <div class="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#16201A] border border-stone-200/80 dark:border-[#27372C] space-y-2.5 sm:space-y-3">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-bold text-stone-600 dark:text-[#98A79D]">Keinginan & Jajan (20%)</span>
                  <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300">
                    Fleksibel
                  </span>
                </div>
                <div>
                  <span class="text-xl sm:text-2xl font-black text-[#18221B] dark:text-[#F0F4F1] tabular-nums block tracking-tight">
                    {{ formatRupiah(wantsAmount) }}
                  </span>
                  <span class="text-[11px] text-stone-500 dark:text-[#98A79D]">Batas jajan & gaya hidup sebulan</span>
                </div>

                <!-- Safe to spend box -->
                <div class="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-900/40 text-xs text-amber-900 dark:text-amber-200 space-y-0.5">
                  <span class="text-[10px] font-bold block text-amber-800 dark:text-amber-300">Batas Jajan Harian (Safe-to-Spend):</span>
                  <span class="text-sm font-black tabular-nums block">
                    {{ formatRupiah(dailySafeSpend) }} <span class="text-[10px] font-normal">/ hari</span>
                  </span>
                </div>
              </div>
            </div>

            <!-- 3. Interactive Goal Projection Simulator -->
            <div class="pt-5 sm:pt-6 border-t border-stone-200/80 dark:border-[#27372C] space-y-5 sm:space-y-6">
              <div class="space-y-1">
                <h3 class="text-base sm:text-lg font-bold text-[#18221B] dark:text-[#F0F4F1] flex items-center gap-2">
                  <Target class="w-5 h-5 text-[#183D2B] dark:text-[#B8DF38] shrink-0" />
                  <span>Uji Kecepatan Impianmu: Kapan Barang Ini Bisa Dibeli?</span>
                </h3>
                <p class="text-xs text-stone-500 dark:text-[#98A79D]">
                  Pilih salah satu impian di bawah untuk melihat estimasi waktu tercapainya dengan porsi tabungan impianmu (<strong>{{ formatRupiah(dreamGoalPart) }}/bulan</strong>).
                </p>
              </div>

              <!-- Preset Buttons (2x2 on phone, 4 on desktop) -->
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
                <button
                  v-for="goal in goalPresets"
                  :key="goal.key"
                  type="button"
                  @click="selectedGoalKey = goal.key"
                  class="tactile-btn p-3 sm:p-3.5 rounded-xl sm:rounded-2xl text-left border transition-all cursor-pointer space-y-1.5 sm:space-y-2 min-h-[72px]"
                  :class="selectedGoalKey === goal.key ? 'bg-white dark:bg-[#16201A] border-[#183D2B] dark:border-[#B8DF38] shadow-sm ring-2 ring-[#183D2B]/10 dark:ring-[#B8DF38]/20' : 'bg-white/60 dark:bg-[#16201A]/60 border-stone-200/70 dark:border-[#27372C] hover:border-stone-400'"
                >
                  <component :is="goal.icon" class="w-4 h-4 sm:w-5 sm:h-5 shrink-0" :class="selectedGoalKey === goal.key ? 'text-[#183D2B] dark:text-[#B8DF38]' : 'text-stone-400'" />
                  <div>
                    <span class="text-xs font-bold block text-stone-800 dark:text-stone-100 truncate">{{ goal.name }}</span>
                    <span class="text-[10px] sm:text-[11px] font-semibold text-stone-500 dark:text-stone-400 tabular-nums">{{ formatRupiah(goal.price) }}</span>
                  </div>
                </button>
              </div>

              <!-- Output Projection Banner -->
              <div class="p-4 sm:p-6 rounded-2xl bg-gradient-to-r from-[#183D2B] to-[#1E4D36] text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-5 shadow-sm">
                <div class="space-y-1 max-w-xl">
                  <span class="text-[10px] sm:text-xs font-bold text-[#B8DF38] uppercase tracking-wider block">Hasil Proyeksi Realistis</span>
                  <p class="text-sm sm:text-lg font-bold leading-snug">
                    Dengan menyisihkan <strong>{{ formatRupiah(dreamGoalPart) }}/bulan</strong>, impian <strong>{{ currentSelectedGoal.name }}</strong> diproyeksikan tercapai dalam <span class="text-[#B8DF38] font-black underline underline-offset-4">{{ monthsToAchieve }} Bulan</span> (sekitar {{ projectedAchieveDate }}).
                  </p>
                  <p class="text-[11px] sm:text-xs text-emerald-100/75 pt-0.5">
                    Kebutuhan pokok dan dana daruratmu tetap aman terisi bersamaan tanpa rasa cemas.
                  </p>
                </div>

                <RouterLink
                  :to="startLink"
                  class="tactile-btn inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#B8DF38] hover:bg-[#a3c82e] text-[#183D2B] font-extrabold text-xs sm:text-sm shrink-0 shadow-md cursor-pointer transition w-full sm:w-auto min-h-[44px]"
                >
                  <span>Simpan Rencana Ini</span>
                  <ArrowRight class="w-4 h-4" />
                </RouterLink>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- METHODOLOGY & CORE PHILOSOPHY SECTION -->
      <section id="metode" class="py-14 sm:py-24 border-t border-[#DDE6DC] dark:border-[#27372C] scroll-mt-16">
        <div class="max-w-7xl mx-auto px-4 sm:px-8 lg:px-10 space-y-8 sm:space-y-14">
          <div class="max-w-2xl space-y-2 sm:space-y-3">
            <h2 class="text-2xl sm:text-4xl font-extrabold tracking-tight text-[#18221B] dark:text-[#F0F4F1]">
              Tiga Alasan Kenapa Cara Ini Tidak Bikin Boncos
            </h2>
            <p class="text-sm sm:text-base text-[#425348] dark:text-[#C8D3CA] leading-relaxed">
              Bukan sekadar mencatat nota, melainkan sistem psikologis yang membuatmu tetap disiplin tanpa rasa tertekan.
            </p>
          </div>

          <!-- 3 Asymmetric Bento Cards -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            <!-- Card 1 -->
            <div class="p-5 sm:p-8 rounded-2xl bg-white dark:bg-[#16201A] border border-stone-200/90 dark:border-[#27372C] space-y-3 sm:space-y-4 shadow-2xs">
              <div class="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-emerald-100/80 dark:bg-emerald-950/60 text-[#183D2B] dark:text-[#B8DF38] flex items-center justify-center font-bold text-xs sm:text-sm">
                01
              </div>
              <h3 class="text-base sm:text-lg font-bold text-[#18221B] dark:text-[#F0F4F1] leading-snug">
                Bukan Saldo Rekening, Tapi Uang yang Bebas Dipakai
              </h3>
              <p class="text-xs sm:text-sm text-[#425348] dark:text-[#C8D3CA] leading-relaxed">
                Banyak orang merasa kaya saat melihat saldo rekening bank besar, padahal sebagian adalah uang sewa dan darurat. Kami pisahkan secara cerdas apa yang boleh dibelanjakan hari ini.
              </p>
            </div>

            <!-- Card 2 -->
            <div class="p-5 sm:p-8 rounded-2xl bg-white dark:bg-[#16201A] border border-stone-200/90 dark:border-[#27372C] space-y-3 sm:space-y-4 shadow-2xs">
              <div class="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-emerald-100/80 dark:bg-emerald-950/60 text-[#183D2B] dark:text-[#B8DF38] flex items-center justify-center font-bold text-xs sm:text-sm">
                02
              </div>
              <h3 class="text-base sm:text-lg font-bold text-[#18221B] dark:text-[#F0F4F1] leading-snug">
                Dana Darurat & Impian Berjalan Berdampingan
              </h3>
              <p class="text-xs sm:text-sm text-[#425348] dark:text-[#C8D3CA] leading-relaxed">
                Nabung hanya untuk darurat bikin jenuh; nabung hanya untuk impian bikin rentan. Rasio 60:40 membangun benteng pertahanan sekaligus mengabulkan target wishlist idamanmu.
              </p>
            </div>

            <!-- Card 3 -->
            <div class="p-5 sm:p-8 rounded-2xl bg-white dark:bg-[#16201A] border border-stone-200/90 dark:border-[#27372C] space-y-3 sm:space-y-4 shadow-2xs">
              <div class="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-emerald-100/80 dark:bg-emerald-950/60 text-[#183D2B] dark:text-[#B8DF38] flex items-center justify-center font-bold text-xs sm:text-sm">
                03
              </div>
              <h3 class="text-base sm:text-lg font-bold text-[#18221B] dark:text-[#F0F4F1] leading-snug">
                Panduan Belanja Harian (Safe-to-Spend)
              </h3>
              <p class="text-xs sm:text-sm text-[#425348] dark:text-[#C8D3CA] leading-relaxed">
                Menghitung sisa hari dalam bulan dan membagi jatah jajanmu. Jika hari ini kamu berhemat, jatah jajan hari esok otomatis bertambah secara proporsional.
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- CLOSING BANNER SECTION -->
      <section class="py-14 sm:py-24 bg-[#183D2B] text-white">
        <div class="max-w-7xl mx-auto px-4 sm:px-8 lg:px-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6 sm:gap-8">
          <div class="space-y-2 sm:space-y-3 max-w-xl">
            <h2 class="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
              Siap Melihat Kondisi Keuanganmu Dengan Lebih Jelas?
            </h2>
            <p class="text-sm sm:text-base text-emerald-100/80 leading-relaxed">
              Mulai dari satu catatan kecil hari ini. Tanpa spreadsheet rumit, bebas iklan, dan privasimu terjaga.
            </p>
          </div>

          <div class="flex items-center gap-4">
            <RouterLink
              :to="startLink"
              class="tactile-btn inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#B8DF38] hover:bg-[#a3c82e] text-[#183D2B] font-extrabold text-sm shadow-md transition cursor-pointer w-full sm:w-auto min-h-[48px]"
            >
              <span>{{ startLabel }}</span>
              <ArrowRight class="w-4 h-4" />
            </RouterLink>
          </div>
        </div>
      </section>
    </main>

    <!-- FOOTER (Clean, Compact, & Accessible) -->
    <footer class="border-t border-[#DDE6DC] dark:border-[#27372C] py-6 sm:py-8 text-xs text-[#5E6961] dark:text-[#98A79D]">
      <div class="max-w-7xl mx-auto px-4 sm:px-8 lg:px-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div class="flex items-center gap-2">
          <span class="w-6 h-6 rounded-lg bg-[#183D2B] dark:bg-[#B8DF38] text-[#B8DF38] dark:text-[#183D2B] grid place-items-center font-black text-[10px]">
            PK
          </span>
          <span class="font-bold text-[#18221B] dark:text-[#F0F4F1]">Project-Keuangan</span>
          <span class="hidden sm:inline">· Pengelolaan Anggaran & Impian</span>
        </div>

        <div class="flex items-center gap-4 sm:gap-6 font-semibold flex-wrap justify-center">
          <button
            type="button"
            @click="scrollToSimulation"
            class="hover:underline cursor-pointer py-1"
          >
            Simulasi Gaji
          </button>
          <RouterLink v-if="!auth.token" to="/login" class="hover:underline py-1">
            Masuk Akun
          </RouterLink>
          <RouterLink v-else to="/dashboard" class="hover:underline py-1">
            Dashboard
          </RouterLink>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
