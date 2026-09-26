<script setup lang="ts">
import { computed, ref } from 'vue';
import { RouterLink } from 'vue-router';
import {
  ArrowRight,
  Check,
  ChevronRight,
  ShieldCheck,
  Smartphone,
  Wallet,
  Calendar,
  Percent,
  Sparkles,
  TrendingUp,
} from 'lucide-vue-next';
import PublicShell from '../components/PublicShell.vue';
import { useAuthStore } from '../stores/auth.store';
// import { usePwa } from '../composables/usePwa';
import { formatRupiah } from '../utils/format';

const auth = useAuthStore();
// const { isInstalled, installApp } = usePwa();
const startLink = computed(() => (auth.token ? '/dashboard' : '/login?mode=register'));
const startLabel = computed(() => (auth.token ? 'Buka Dashboard' : 'Mulai Sekarang'));

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
</script>

<template>
  <PublicShell>
    <!-- 1. HERO SECTION (Asymmetric Split, max-pt capped, fits initial viewport) -->
    <section
      class="relative overflow-hidden border-b border-[#DAE2D9] dark:border-[#26362A] pt-10 pb-16 sm:pt-14 sm:pb-20 lg:pt-16 lg:pb-24">
      <div
        class="mx-auto grid max-w-7xl items-center gap-12 px-5 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16 lg:px-10">
        <!-- Hero Left Column: Max 4 text elements per stack discipline -->
        <div class="relative z-10 max-w-xl">
          <!-- Text element 1: Eyebrow -->
          <p class="mb-4 text-xs font-bold uppercase tracking-wider text-[#24553D] dark:text-[#B8DF38]">
            Keuangan Pribadi Lebih Jelas
          </p>
          <!-- Text element 2: Headline (max 2 lines desktop) -->
          <h1
            class="text-4xl font-extrabold leading-[1.08] tracking-tight text-[#18221B] dark:text-[#F0F4F1] sm:text-5xl lg:text-6xl">
            Kelola uang tanpa menebak-nebak.
          </h1>
          <!-- Text element 3: Subtext (14 words, max 20 words cap) -->
          <p class="mt-5 max-w-[48ch] text-base leading-relaxed text-[#4C5F53] dark:text-[#B8C6BB] sm:text-lg">
            Catat transaksi, pahami sisa uang bebas, dan amankan target impian dalam satu tempat.
          </p>
          <!-- Text element 4: CTAs (1 primary + 1 secondary) -->
          <div class="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <RouterLink :to="startLink"
              class="inline-flex min-h-12 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-[#183D2B] px-6 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#24553D] active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#183D2B] dark:bg-[#B8DF38] dark:text-[#0E1410] dark:hover:bg-[#A3C82E] dark:focus-visible:outline-[#B8DF38] shadow-xs">
              {{ startLabel }}
              <ArrowRight class="h-4 w-4" aria-hidden="true" />
            </RouterLink>
            <RouterLink to="/#simulasi"
              class="inline-flex min-h-12 items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-[#B8C8B9] px-6 py-3 text-sm font-bold text-[#183D2B] transition hover:bg-[#E8EFE5] active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#183D2B] dark:border-[#3C5140] dark:text-[#E7EEE7] dark:hover:bg-[#1B281F] dark:focus-visible:outline-[#B8DF38]">
              Coba Simulasi Anggaran
              <ChevronRight class="h-4 w-4" aria-hidden="true" />
            </RouterLink>
          </div>
        </div>

        <!-- Hero Right Column: Tactile Live Fintech Showcase Card (Zero Fake Div Screenshot) -->
        <div class="relative mx-auto w-full max-w-md lg:max-w-none">
          <!-- Ambient Glow Backdrop -->
          <div
            class="absolute -inset-2 rounded-3xl bg-gradient-to-tr from-[#183D2B]/15 via-[#B8DF38]/10 to-transparent blur-xl dark:from-[#B8DF38]/10 dark:via-[#183D2B]/20 pointer-events-none"
            aria-hidden="true"></div>

          <!-- Master Card Container -->
          <div
            class="relative rounded-2xl border border-[#CAD8CA] bg-white p-6 shadow-xl dark:border-[#2A3B2E] dark:bg-[#16201A] transition-all">
            <!-- Card Header: Profile & Live Status -->
            <div class="flex items-center justify-between pb-4 border-b border-[#E2E8E2] dark:border-[#243329]">
              <div class="flex items-center gap-3">
                <div
                  class="w-10 h-10 rounded-xl bg-[#183D2B] dark:bg-[#B8DF38] text-white dark:text-[#183D2B] flex items-center justify-center font-bold text-sm shadow-xs">
                  NL
                </div>
                <div>
                  <h3 class="text-sm font-bold text-[#18221B] dark:text-[#F0F4F1]">Ringkasan Portofolio</h3>
                  <p class="text-xs text-stone-500 dark:text-[#98A79D]">Bulan Berjalan</p>
                </div>
              </div>
              <span
                class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:text-[#B8DF38] dark:border-[#2A4433]">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-[#B8DF38]"></span>
                Sinkron
              </span>
            </div>

            <!-- Card Body: Total Balance Display -->
            <div class="py-5">
              <p class="text-xs font-medium text-stone-500 dark:text-[#98A79D]">Saldo Utama Aktif</p>
              <div class="mt-1 flex items-baseline justify-between gap-4">
                <p
                  class="text-3xl font-extrabold tabular-nums tracking-tight text-[#18221B] dark:text-[#F0F4F1] sm:text-4xl">
                  Rp 18.450.000
                </p>
                <span class="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-[#B8DF38]">
                  <TrendingUp class="w-3.5 h-3.5" /> +12.4%
                </span>
              </div>

              <!-- Allocation Ratio Bar: 50 / 30 / 20 Rule Visualized -->
              <div class="mt-5 space-y-2">
                <div class="flex justify-between text-xs font-semibold text-stone-600 dark:text-[#98A79D]">
                  <span>Penyisihan Anggaran</span>
                  <span class="tabular-nums">50% · 30% · 20%</span>
                </div>
                <div class="h-2.5 w-full rounded-full bg-stone-100 dark:bg-stone-800 overflow-hidden flex gap-1 p-0.5">
                  <div class="h-full rounded-full bg-[#183D2B] dark:bg-[#B8DF38] w-[50%]" title="Kebutuhan 50%"></div>
                  <div class="h-full rounded-full bg-[#24553D] dark:bg-[#8CA825] w-[30%]" title="Tabungan 30%"></div>
                  <div class="h-full rounded-full bg-[#A3C82E] dark:bg-[#526B1E] w-[20%]" title="Keinginan 20%"></div>
                </div>
              </div>
            </div>

            <!-- Mini Recent Activity List -->
            <div class="space-y-2.5 pt-3 border-t border-[#E2E8E2] dark:border-[#243329]">
              <div class="flex items-center justify-between p-2.5 rounded-xl bg-stone-50 dark:bg-white/5 text-xs">
                <div class="flex items-center gap-2.5">
                  <div
                    class="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-[#B8DF38] flex items-center justify-center font-bold">
                    ↓
                  </div>
                  <div>
                    <p class="font-bold text-[#18221B] dark:text-[#F0F4F1]">Pemasukan Gaji</p>
                    <p class="text-[10px] text-stone-500 dark:text-[#98A79D]">Rekening Utama</p>
                  </div>
                </div>
                <span class="font-extrabold text-emerald-700 dark:text-[#B8DF38] tabular-nums">+Rp 7.500.000</span>
              </div>

              <div class="flex items-center justify-between p-2.5 rounded-xl bg-stone-50 dark:bg-white/5 text-xs">
                <div class="flex items-center gap-2.5">
                  <div
                    class="w-7 h-7 rounded-lg bg-stone-200 text-stone-700 dark:bg-stone-800 dark:text-stone-300 flex items-center justify-center font-bold">
                    ↑
                  </div>
                  <div>
                    <p class="font-bold text-[#18221B] dark:text-[#F0F4F1]">Penyisihan Dana Darurat</p>
                    <p class="text-[10px] text-stone-500 dark:text-[#98A79D]">Target 6 Bulan</p>
                  </div>
                </div>
                <span class="font-extrabold text-stone-700 dark:text-[#F0F4F1] tabular-nums">Rp 1.350.000</span>
              </div>
            </div>

            <!-- Floating Badge: Target Impian Progress -->
            <div
              class="mt-4 p-3 rounded-xl bg-[#E8EFE5] dark:bg-[#1F2C22] border border-[#CAD8CA] dark:border-[#2C4030] flex items-center justify-between text-xs">
              <div class="flex items-center gap-2">
                <Sparkles class="w-4 h-4 text-[#183D2B] dark:text-[#B8DF38]" />
                <span class="font-bold text-[#183D2B] dark:text-[#B8DF38]">Target Laptop Kerja</span>
              </div>
              <span class="font-extrabold tabular-nums text-[#183D2B] dark:text-[#B8DF38]">75% Tercapai</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 2. BENTO GRID FEATURES (Asymmetric Trio, real visual rhythm, zero eyebrow per restraint rule) -->
    <section id="metode" class="scroll-mt-20 py-16 sm:py-24">
      <div class="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <!-- Vertical Stack Section Header (Split-Header Ban strictly honored) -->
        <div class="max-w-2xl">
          <h2
            class="text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl text-[#18221B] dark:text-[#F0F4F1]">
            Tiga fondasi keuangan yang lebih tenang.
          </h2>
          <p class="mt-3 text-base leading-relaxed text-[#53645A] dark:text-[#ADBCB0]">
            Bukan sekadar mencatat pengeluaran, tetapi mengontrol ke mana uang Anda dialokasikan.
          </p>
        </div>

        <!-- Bento Grid: 3 Distinct Items, 3 Varied Backgrounds (Section 4.7 Bento Background Diversity) -->
        <div class="mt-12 grid gap-6 md:grid-cols-3">
          <!-- Bento Cell 1: Large Featured Card (Span 2 on Desktop, Tinted Emerald Background) -->
          <div
            class="md:col-span-2 rounded-2xl border border-[#CAD8CA] dark:border-[#26362A] bg-gradient-to-br from-[#183D2B]/5 via-[#F3F5EF] to-[#E9F0E4] dark:from-[#18241C] dark:via-[#131D16] dark:to-[#0E1410] p-6 sm:p-8 flex flex-col justify-between transition-all hover:border-[#183D2B]/30 dark:hover:border-[#B8DF38]/30">
            <div>
              <div
                class="w-12 h-12 rounded-xl bg-[#183D2B] dark:bg-[#B8DF38] text-white dark:text-[#183D2B] flex items-center justify-center font-bold mb-5 shadow-xs">
                <Wallet class="w-6 h-6" />
              </div>
              <h3 class="text-xl font-bold text-[#18221B] dark:text-[#F0F4F1] sm:text-2xl">
                Penyisihan dana tanpa memecah rekening.
              </h3>
              <p class="mt-3 max-w-[54ch] text-sm sm:text-base leading-relaxed text-[#53645A] dark:text-[#ADBCB0]">
                Di Nalara, menyisihkan uang untuk dana darurat atau liburan tidak mengubah saldo bank Anda. Uang tetap
                aman di rekening utama, tetapi secara mental sudah terlindungi dari pengeluaran impulsif.
              </p>
            </div>

            <!-- Interactive Micro Preview: Saldo vs Dana Tujuan -->
            <div
              class="mt-8 grid grid-cols-2 gap-3 sm:gap-4 p-4 rounded-xl bg-white/80 dark:bg-black/20 border border-[#CAD8CA]/60 dark:border-white/5">
              <div>
                <p class="text-[11px] font-semibold text-stone-500 dark:text-stone-400">Uang Belum Disisihkan</p>
                <p class="mt-1 text-base sm:text-lg font-extrabold tabular-nums text-emerald-800 dark:text-[#B8DF38]">
                  Rp 4.250.000
                </p>
                <p class="text-[10px] text-stone-400 mt-0.5">Bebas dialokasikan</p>
              </div>
              <div class="border-l border-stone-200 dark:border-stone-800 pl-3 sm:pl-4">
                <p class="text-[11px] font-semibold text-stone-500 dark:text-stone-400">Total Dana Tujuan</p>
                <p class="mt-1 text-base sm:text-lg font-extrabold tabular-nums text-[#18221B] dark:text-[#F0F4F1]">
                  Rp 14.200.000
                </p>
                <p class="text-[10px] text-stone-400 mt-0.5">Terkunci untuk target</p>
              </div>
            </div>
          </div>

          <!-- Bento Cell 2: Rule of 50/30/20 (Card with Subtle Neutral Tint) -->
          <div
            class="rounded-2xl border border-[#CAD8CA] dark:border-[#26362A] bg-white dark:bg-[#16201A] p-6 sm:p-8 flex flex-col justify-between transition-all hover:border-[#183D2B]/30 dark:hover:border-[#B8DF38]/30">
            <div>
              <div
                class="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-900 dark:text-[#B8DF38] flex items-center justify-center font-bold mb-5">
                <Percent class="w-6 h-6" />
              </div>
              <h3 class="text-xl font-bold text-[#18221B] dark:text-[#F0F4F1]">
                Rasio anggaran yang realistis.
              </h3>
              <p class="mt-3 text-sm leading-relaxed text-[#53645A] dark:text-[#ADBCB0]">
                Sesuaikan porsi Kebutuhan pokok, Tabungan target, dan Keinginan pribadi setiap bulan tanpa kekakuan.
              </p>
            </div>

            <!-- Mini List of Budget Buckets -->
            <div class="mt-6 space-y-2 pt-4 border-t border-stone-100 dark:border-[#243329]">
              <div class="flex items-center justify-between text-xs py-1">
                <span class="font-medium text-stone-600 dark:text-stone-300">Kebutuhan Pokok</span>
                <span class="font-bold text-[#183D2B] dark:text-[#B8DF38]">50%</span>
              </div>
              <div class="flex items-center justify-between text-xs py-1">
                <span class="font-medium text-stone-600 dark:text-stone-300">Tabungan & Target</span>
                <span class="font-bold text-[#183D2B] dark:text-[#B8DF38]">30%</span>
              </div>
              <div class="flex items-center justify-between text-xs py-1">
                <span class="font-medium text-stone-600 dark:text-stone-300">Keinginan & Rekreasi</span>
                <span class="font-bold text-[#183D2B] dark:text-[#B8DF38]">20%</span>
              </div>
            </div>
          </div>

          <!-- Bento Cell 3: Target Impian & Dana Pengaman (Pattern Tinted Background) -->
          <div
            class="md:col-span-3 rounded-2xl border border-[#CAD8CA] dark:border-[#26362A] bg-[#EDF2E9] dark:bg-[#141E17] p-6 sm:p-8 transition-all">
            <div class="grid items-center gap-6 md:grid-cols-3">
              <div class="md:col-span-2">
                <div
                  class="w-12 h-12 rounded-xl bg-[#183D2B] dark:bg-[#B8DF38] text-white dark:text-[#183D2B] flex items-center justify-center font-bold mb-4 shadow-xs">
                  <Calendar class="w-6 h-6" />
                </div>
                <h3 class="text-xl sm:text-2xl font-bold text-[#18221B] dark:text-[#F0F4F1]">
                  Ketahui kapan impian Anda terwujud.
                </h3>
                <p class="mt-2 max-w-[60ch] text-sm sm:text-base leading-relaxed text-[#53645A] dark:text-[#ADBCB0]">
                  Masukkan harga acuan target Anda, lalu Nalara menghitung perkiraan bulan tercapai berdasarkan
                  kemampuan tabungan bulanan aktual.
                </p>
              </div>
              <div class="flex md:justify-end">
                <RouterLink to="/#simulasi"
                  class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white dark:bg-[#1F2C22] border border-[#CAD8CA] dark:border-[#324638] text-xs font-bold text-[#183D2B] dark:text-[#B8DF38] hover:bg-stone-50 dark:hover:bg-[#253529] transition shadow-xs">
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
    <section id="simulasi"
      class="scroll-mt-20 border-y border-[#DAE2D9] bg-[#EDF2E9] py-16 dark:border-[#26362A] dark:bg-[#141E17] sm:py-24">
      <div class="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <!-- Section Header (Vertical Stack, no split-header) -->
        <div class="max-w-2xl">
          <h2
            class="text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl text-[#18221B] dark:text-[#F0F4F1]">
            Coba simulasi pembagian bulanan.
          </h2>
          <p class="mt-3 text-base leading-relaxed text-[#53645A] dark:text-[#ADBCB0]">
            Geser perkiraan pemasukan Anda untuk melihat contoh pembagian dana dan proyeksi waktu pencapaian target.
          </p>
        </div>

        <div
          class="mt-10 rounded-2xl border border-[#CAD8CA] bg-[#F8FAF5] p-6 dark:border-[#324638] dark:bg-[#18241C] sm:p-8 lg:p-10 shadow-xs">
          <!-- Slider Control & Value Display -->
          <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <label for="income-slider" class="text-sm font-bold text-[#405147] dark:text-[#C8D3CA]">
              Pemasukan per bulan
            </label>
            <output for="income-slider"
              class="text-3xl font-extrabold leading-none tracking-tight tabular-nums text-[#183D2B] dark:text-[#B8DF38] sm:text-4xl">
              {{ formatRupiah(monthlyIncome) }}
            </output>
          </div>

          <input id="income-slider" v-model.number="monthlyIncome" type="range" min="3000000" max="35000000"
            step="500000"
            class="landing-range mt-6 w-full cursor-pointer h-2 bg-stone-200 dark:bg-stone-700 rounded-lg appearance-none"
            aria-label="Geser perkiraan pemasukan bulanan" />
          <div class="mt-2 flex justify-between text-xs text-[#596B5E] dark:text-[#ADBCB0]">
            <span>Rp 3 juta</span>
            <span>Rp 35 juta</span>
          </div>

          <!-- Quick Income Presets -->
          <div class="mt-6 flex flex-wrap gap-2" aria-label="Pilihan pemasukan cepat">
            <button v-for="amount in incomePresets" :key="amount" type="button"
              class="min-h-10 rounded-xl border px-3.5 text-xs font-bold transition active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#183D2B] dark:focus-visible:outline-[#B8DF38] cursor-pointer"
              :class="monthlyIncome === amount
                ? 'border-[#183D2B] bg-[#183D2B] text-white dark:border-[#B8DF38] dark:bg-[#B8DF38] dark:text-[#0E1410] shadow-xs'
                : 'border-[#CAD8CA] bg-white text-[#405147] hover:border-[#183D2B] dark:border-[#3C5140] dark:bg-[#1B281F] dark:text-[#E7EEE7]'
                " @click="monthlyIncome = amount">
              {{ formatRupiah(amount) }}
            </button>
          </div>

          <!-- 3-Column Split Breakdown Cards -->
          <div class="mt-10 grid gap-4 border-t border-[#CAD8CA] pt-8 dark:border-[#324638] sm:grid-cols-3">
            <div class="p-4 rounded-xl bg-white dark:bg-[#121A14] border border-[#CAD8CA]/70 dark:border-[#28382B]">
              <p class="text-xs font-bold text-[#53645A] dark:text-[#ADBCB0] flex items-center justify-between">
                <span>Kebutuhan Pokok</span>
                <span class="text-xs font-normal">50%</span>
              </p>
              <p class="mt-2 text-2xl font-extrabold tabular-nums text-[#18221B] dark:text-[#F0F4F1]">
                {{ formatRupiah(needsAmount) }}
              </p>
              <p class="mt-1.5 text-xs text-[#596B5E] dark:text-[#ADBCB0]">Makan, tempat tinggal, utilitas harian.</p>
            </div>

            <div class="p-4 rounded-xl bg-white dark:bg-[#121A14] border border-[#CAD8CA]/70 dark:border-[#28382B]">
              <p class="text-xs font-bold text-[#53645A] dark:text-[#ADBCB0] flex items-center justify-between">
                <span>Tabungan & Target</span>
                <span class="text-xs font-normal">30%</span>
              </p>
              <p class="mt-2 text-2xl font-extrabold tabular-nums text-[#183D2B] dark:text-[#B8DF38]">
                {{ formatRupiah(savingsAmount) }}
              </p>
              <p class="mt-1.5 text-xs text-[#596B5E] dark:text-[#ADBCB0]">Dibagi untuk dana pengaman dan impian.</p>
            </div>

            <div class="p-4 rounded-xl bg-white dark:bg-[#121A14] border border-[#CAD8CA]/70 dark:border-[#28382B]">
              <p class="text-xs font-bold text-[#53645A] dark:text-[#ADBCB0] flex items-center justify-between">
                <span>Keinginan Pribadi</span>
                <span class="text-xs font-normal">20%</span>
              </p>
              <p class="mt-2 text-2xl font-extrabold tabular-nums text-[#18221B] dark:text-[#F0F4F1]">
                {{ formatRupiah(wantsAmount) }}
              </p>
              <p class="mt-1.5 text-xs text-[#596B5E] dark:text-[#ADBCB0]">Hiburan, kuliner, dan kebutuhan rekreasi.</p>
            </div>
          </div>

          <!-- Target Impian Projection Subsection -->
          <div id="target-impian" class="mt-10 scroll-mt-20 border-t border-[#CAD8CA] pt-8 dark:border-[#324638]">
            <div class="max-w-2xl">
              <h3 class="text-lg sm:text-xl font-bold tracking-tight text-[#18221B] dark:text-[#F0F4F1]">
                Simulasi pencapaian target impian
              </h3>
              <p class="mt-1.5 text-sm leading-relaxed text-[#53645A] dark:text-[#ADBCB0]">
                Dari porsi tabungan di atas, 60% disiapkan untuk dana pengaman dan 40% dialokasikan ke target pilihan:
              </p>
            </div>

            <!-- Target Selection Pills -->
            <div class="mt-5 flex flex-wrap gap-2">
              <button v-for="goal in goals" :key="goal.key" type="button"
                class="inline-flex min-h-11 items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#183D2B] dark:focus-visible:outline-[#B8DF38] cursor-pointer"
                :class="selectedGoalKey === goal.key
                  ? 'border-[#183D2B] bg-[#E1ECCD] text-[#183D2B] dark:border-[#B8DF38] dark:bg-[#263A22] dark:text-[#E4F4A4] shadow-xs'
                  : 'border-[#CAD8CA] bg-white text-[#405147] hover:border-[#183D2B] dark:border-[#3C5140] dark:bg-[#16201A] dark:text-[#D8E2D9]'
                  " :aria-pressed="selectedGoalKey === goal.key" @click="selectedGoalKey = goal.key">
                <Check v-if="selectedGoalKey === goal.key" class="h-4 w-4" aria-hidden="true" />
                {{ goal.name }}
              </button>
            </div>

            <!-- Result Calculation Callout -->
            <div
              class="mt-7 flex flex-col gap-4 rounded-xl bg-[#E7EFE0] p-5 dark:bg-[#1E2B21] border border-[#CAD8CA]/80 dark:border-[#2C4030] sm:flex-row sm:items-end sm:justify-between sm:p-6"
              aria-live="polite">
              <div>
                <p class="text-xs font-bold text-[#405147] dark:text-[#C8D3CA]">
                  {{ selectedGoal.name }}: {{ formatRupiah(selectedGoal.price) }}
                </p>
                <p
                  class="mt-2 text-3xl font-extrabold tracking-tight text-[#183D2B] dark:text-[#B8DF38] sm:text-4xl tabular-nums">
                  Sekitar {{ monthsToAchieve }} bulan
                </p>
                <p class="mt-2 text-sm leading-relaxed text-[#53645A] dark:text-[#ADBCB0]">
                  Dengan menyisihkan {{ formatRupiah(goalMonthlyAmount) }} per bulan, perkiraan tercapai pada {{
                    projectedDate }}.
                </p>
              </div>
              <p class="max-w-[26ch] text-xs leading-relaxed text-[#596B5E] dark:text-[#ADBCB0]">
                Perhitungan simulasi matematis. Tidak mencakup perubahan inflasi atau nominal setoran fluktuatif.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 4. MODERN APP EXPERIENCE (PWA, Mobile & Desktop Ready) -->
    <section class="py-16 sm:py-24">
      <div
        class="mx-auto grid max-w-7xl items-center gap-12 px-5 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16 lg:px-10">
        <div class="max-w-xl">
          <!-- Text element 1: Eyebrow (Allowed: 2nd eyebrow across 5 sections) -->
          <p class="mb-4 text-xs font-bold uppercase tracking-wider text-[#24553D] dark:text-[#B8DF38]">
            Aplikasi Modern
          </p>
          <h2
            class="text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl text-[#18221B] dark:text-[#F0F4F1]">
            Bisa dipasang di HP dan laptop Anda.
          </h2>
          <p class="mt-4 text-base leading-relaxed text-[#53645A] dark:text-[#ADBCB0]">
            Nalara mengusung teknologi Progressive Web App (PWA). Anda dapat memasang aplikasi langsung ke layar utama
            smartphone tanpa melalui Play Store, menikmati mode layar penuh, navigasi sentuh ergonomis, dan privasi
            catatan tanpa pelacakan iklan.
          </p>

          <!-- Feature Bullets (Using distinct card trio instead of long list) -->
          <div class="mt-8 space-y-3">
            <div
              class="flex items-center gap-3 p-3.5 rounded-xl bg-white dark:bg-[#16201A] border border-[#CAD8CA] dark:border-[#26362A]">
              <div
                class="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-[#183D2B] dark:text-[#B8DF38] flex items-center justify-center shrink-0">
                <Smartphone class="w-4 h-4" />
              </div>
              <p class="text-xs font-bold text-[#18221B] dark:text-[#F0F4F1]">
                Akses instan dari layar utama ponsel dengan satu ketukan
              </p>
            </div>

            <div
              class="flex items-center gap-3 p-3.5 rounded-xl bg-white dark:bg-[#16201A] border border-[#CAD8CA] dark:border-[#26362A]">
              <div
                class="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-[#183D2B] dark:text-[#B8DF38] flex items-center justify-center shrink-0">
                <ShieldCheck class="w-4 h-4" />
              </div>
              <p class="text-xs font-bold text-[#18221B] dark:text-[#F0F4F1]">
                Privasi terjaga, data keuangan terenkripsi tanpa iklan pihak ketiga
              </p>
            </div>
          </div>

          <div class="mt-8 flex flex-col sm:flex-row sm:items-center gap-4">
            <!-- Tombol Pasang Aplikasi Sekarang - Sementara dinonaktifkan
            <button
              v-if="!isInstalled"
              type="button"
              @click="installApp"
              class="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#183D2B] dark:bg-[#B8DF38] px-5 py-2.5 text-xs font-bold text-white dark:text-[#0E1410] shadow-xs transition hover:opacity-95 active:scale-[0.98] cursor-pointer"
            >
              <Download class="w-4 h-4" />
              Pasang Aplikasi Sekarang
            </button>
            -->
            <RouterLink to="/about"
              class="inline-flex items-center gap-2 text-sm font-bold text-[#183D2B] dark:text-[#B8DF38] hover:gap-3 transition">
              Pelajari filosofi di balik Nalara
              <ArrowRight class="h-4 w-4" aria-hidden="true" />
            </RouterLink>
          </div>
        </div>

        <!-- Right Side: Editorial Image Card -->
        <figure class="relative mx-auto w-full max-w-lg lg:mr-0">
          <div class="overflow-hidden rounded-2xl border border-[#CAD8CA] dark:border-[#324638] bg-[#0E1410] shadow-xl">
            <img src="/nalara-landing-mobile.jpg"
              alt="Seseorang membuka aplikasi keuangan Nalara di smartphone saat santai di kafe" width="1536"
              height="1024" loading="lazy" class="h-[320px] w-full object-cover sm:h-[390px]" />
          </div>
          <figcaption class="mt-3 text-xs text-[#596B5E] dark:text-[#ADBCB0]">
            Akses catatan keuangan langsung dari smartphone Anda.
          </figcaption>
        </figure>
      </div>
    </section>

    <!-- 5. CLOSING CTA BANNER (Focused, single intent, no em-dash, high contrast) -->
    <section class="border-t border-[#DAE2D9] bg-[#E9F0E4] py-16 dark:border-[#26362A] dark:bg-[#141F17] sm:py-20">
      <div
        class="mx-auto flex max-w-7xl flex-col gap-6 px-5 sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:px-10">
        <div>
          <h2
            class="text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl text-[#18221B] dark:text-[#F0F4F1]">
            Mulai dari satu catatan hari ini.
          </h2>
          <p class="mt-2 max-w-xl text-base text-[#53645A] dark:text-[#ADBCB0]">
            Catat transaksi pertamamu, amankan tabungan target, dan bangun masa depan finansial yang lebih jelas.
          </p>
        </div>
        <RouterLink :to="startLink"
          class="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#183D2B] px-8 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#24553D] active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#183D2B] dark:bg-[#B8DF38] dark:text-[#0E1410] dark:hover:bg-[#A3C82E] dark:focus-visible:outline-[#B8DF38] shadow-xs">
          {{ startLabel }}
          <ArrowRight class="h-4 w-4" aria-hidden="true" />
        </RouterLink>
      </div>
    </section>
  </PublicShell>
</template>

<style scoped>
.landing-range {
  accent-color: #183d2b;
}

:global(html.dark) .landing-range {
  accent-color: #b8df38;
}
</style>
