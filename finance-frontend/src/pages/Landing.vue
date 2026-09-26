<script setup lang="ts">
import { ref, computed } from 'vue';
import {
  ArrowRight,
  ChevronDown,
  ChevronRight,
  Wallet,
  ShieldCheck,
  Target,
  Sparkles,
  Coffee,
  CheckCircle2,
  Check,
  Sun,
  Moon,
  Laptop,
  Home,
  Plane,
} from 'lucide-vue-next';
import { useAuthStore } from '../stores/auth.store';
import { useTheme } from '../composables/useTheme';
import { formatRupiah } from '../utils/format';
import NalaraLogo from '../components/ui/NalaraLogo.vue';

const auth = useAuthStore();
const { isDark, toggleTheme } = useTheme();

const mobileMenuOpen = ref(false);

const startLink = computed(() => (auth.token ? '/dashboard' : '/login?mode=register'));
const startLabel = computed(() => (auth.token ? 'Buka Dashboard' : 'Mulai Sekarang — Gratis'));

// --- LIVE INTERACTIVE FINANCIAL SIMULATION STATE ---
const monthlyIncome = ref(7500000); // Default Rp 7.500.000

const incomePresets = [
  { label: 'Rp 5 Jt', value: 5000000 },
  { label: 'Rp 7,5 Jt', value: 7500000 },
  { label: 'Rp 10 Jt', value: 10000000 },
  { label: 'Rp 15 Jt', value: 15000000 },
  { label: 'Rp 20 Jt', value: 20000000 },
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

const scrollToSection = (id: string) => {
  mobileMenuOpen.value = false;
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
};

const scrollToSimulation = () => scrollToSection('simulasi');
</script>

<template>
  <div class="landing min-h-[100dvh] bg-[#F3F5EF] dark:bg-[#0E1410] text-[#18221B] dark:text-[#F0F4F1] transition-colors duration-200">
    <!-- NAVIGATION BAR -->
    <header class="sticky top-0 z-40 bg-[#F3F5EF]/90 dark:bg-[#0E1410]/90 backdrop-blur-md border-b border-[#DDE6DC] dark:border-[#27372C] transition-colors">
      <nav class="max-w-7xl mx-auto px-4 sm:px-8 lg:px-10 h-16 sm:h-[72px] flex items-center justify-between gap-4" aria-label="Navigasi utama">
        <!-- Brand Mark -->
        <RouterLink
          to="/"
          class="inline-flex items-center gap-2.5 sm:gap-3 shrink-0 rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#183D2B] dark:focus-visible:outline-[#B8DF38] group"
          aria-label="Nalara, beranda"
        >
          <NalaraLogo :with-badge="true" size="sm" class="sm:scale-110" />
          <span class="font-extrabold tracking-tight text-sm sm:text-base text-[#18221B] dark:text-[#F0F4F1]">
            Nalara
          </span>
        </RouterLink>

        <!-- Section Navigation Links (Desktop: md+) -->
        <div class="hidden md:flex items-center gap-1 lg:gap-2 text-xs lg:text-sm font-bold text-[#425348] dark:text-[#C8D3CA]">
          <button
            type="button"
            @click="scrollToSection('simulasi')"
            class="tactile-btn px-3.5 py-2 rounded-xl hover:text-[#183D2B] dark:hover:text-[#B8DF38] hover:bg-stone-200/50 dark:hover:bg-[#16201A] transition cursor-pointer"
          >
            Simulasi Gaji
          </button>
          <button
            type="button"
            @click="scrollToSection('target-impian')"
            class="tactile-btn px-3.5 py-2 rounded-xl hover:text-[#183D2B] dark:hover:text-[#B8DF38] hover:bg-stone-200/50 dark:hover:bg-[#16201A] transition cursor-pointer"
          >
            Target Impian
          </button>
          <button
            type="button"
            @click="scrollToSection('metode')"
            class="tactile-btn px-3.5 py-2 rounded-xl hover:text-[#183D2B] dark:hover:text-[#B8DF38] hover:bg-stone-200/50 dark:hover:bg-[#16201A] transition cursor-pointer"
          >
            Cara Kerja
          </button>
        </div>

        <!-- Right Controls: Theme Toggle + Auth / Menu Trigger -->
        <div class="flex items-center gap-2 sm:gap-3 shrink-0">
          <!-- Theme Toggle -->
          <button
            type="button"
            @click="toggleTheme"
            class="tactile-btn w-9 h-9 sm:w-10 sm:h-10 rounded-xl border border-stone-200/80 dark:border-[#27372C] bg-white/80 dark:bg-[#16201A]/80 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-[#243329] transition grid place-items-center cursor-pointer shadow-2xs"
            :aria-label="isDark ? 'Beralih ke mode terang' : 'Beralih ke mode gelap'"
            title="Ubah tema"
          >
            <Sun v-if="isDark" class="w-4 h-4 text-[#B8DF38]" />
            <Moon v-else class="w-4 h-4 text-stone-700" />
          </button>

          <!-- Desktop & Tablet Auth Buttons (sm:flex) -->
          <div class="hidden sm:flex items-center gap-2">
            <RouterLink
              v-if="!auth.token"
              to="/login"
              class="tactile-btn text-xs sm:text-sm font-bold text-stone-700 dark:text-stone-200 hover:text-[#183D2B] dark:hover:text-[#B8DF38] px-3.5 py-2 rounded-xl hover:bg-stone-200/50 dark:hover:bg-stone-800/50 transition cursor-pointer"
            >
              Masuk
            </RouterLink>

            <RouterLink
              :to="startLink"
              class="tactile-btn inline-flex items-center gap-1.5 sm:gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-[#183D2B] dark:bg-[#B8DF38] text-[#F3F5EF] dark:text-[#0E1410] text-xs sm:text-sm font-extrabold shadow-sm hover:bg-[#24553D] dark:hover:bg-[#a3c82e] active:scale-[0.98] transition cursor-pointer shrink-0 min-h-[40px]"
            >
              <span>{{ startLabel }}</span>
              <ArrowRight class="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </RouterLink>
          </div>

          <!-- Mobile Hamburger Toggle (Bespoke 2-Line Animated Menu) -->
          <button
            type="button"
            @click="mobileMenuOpen = !mobileMenuOpen"
            class="md:hidden tactile-btn w-9 h-9 rounded-xl flex flex-col items-center justify-center gap-1.5 text-stone-700 dark:text-stone-200 hover:bg-stone-200/50 dark:hover:bg-[#16201A] transition cursor-pointer"
            :aria-expanded="mobileMenuOpen"
            aria-label="Buka menu navigasi"
          >
            <span
              class="h-[2px] bg-current rounded-full transition-all duration-200 origin-center"
              :class="mobileMenuOpen ? 'w-4 rotate-45 translate-y-[4px] text-[#183D2B] dark:text-[#B8DF38]' : 'w-4'"
            ></span>
            <span
              class="h-[2px] bg-current rounded-full transition-all duration-200 origin-center"
              :class="mobileMenuOpen ? 'w-4 -rotate-45 -translate-y-[4px] text-[#183D2B] dark:text-[#B8DF38]' : 'w-2.5 self-end mr-2.5'"
            ></span>
          </button>
        </div>
      </nav>

      <!-- Mobile Backdrop Overlay -->
      <div
        v-if="mobileMenuOpen"
        @click="mobileMenuOpen = false"
        class="fixed inset-0 top-16 sm:top-[72px] bg-black/40 backdrop-blur-xs z-30 md:hidden transition-opacity"
        aria-hidden="true"
      ></div>

      <!-- Mobile Dropdown Navigation Drawer -->
      <div
        v-if="mobileMenuOpen"
        class="fixed top-16 sm:top-[72px] inset-x-0 z-40 md:hidden bg-white/95 dark:bg-[#121A15]/95 backdrop-blur-xl border-b border-stone-200/90 dark:border-[#27372C] shadow-2xl p-4 sm:p-5 space-y-4 animate-in slide-in-from-top-3 duration-200 text-[#18221B] dark:text-[#F0F4F1]"
      >
        <!-- Mobile Actions: Clean Two-Column Auth Buttons -->
        <div class="grid grid-cols-2 gap-2 pt-1">
          <RouterLink
            v-if="!auth.token"
            to="/login"
            @click="mobileMenuOpen = false"
            class="tactile-btn py-2.5 px-3 rounded-xl border border-stone-200/90 dark:border-[#27372C] bg-stone-50 dark:bg-[#16201A] text-stone-800 dark:text-[#F0F4F1] font-bold text-xs flex items-center justify-center text-center hover:bg-stone-100 dark:hover:bg-[#243329] transition"
          >
            Masuk
          </RouterLink>

          <RouterLink
            :to="startLink"
            @click="mobileMenuOpen = false"
            class="tactile-btn py-2.5 px-3 rounded-xl bg-[#183D2B] dark:bg-[#B8DF38] text-white dark:text-[#0E1410] font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-sm text-center transition"
            :class="{ 'col-span-2': auth.token }"
          >
            <span>{{ auth.token ? 'Buka Dashboard' : 'Mulai Sekarang' }}</span>
            <ArrowRight class="w-3.5 h-3.5" />
          </RouterLink>
        </div>

        <!-- Section Navigation Links (Editorial Monospaced Indices, Anti-Slop) -->
        <div class="space-y-0.5 pt-2 border-t border-stone-100 dark:border-[#27372C]">
          <p class="text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500 px-3 pb-1">
            Navigasi Halaman
          </p>

          <button
            type="button"
            @click="scrollToSection('simulasi')"
            class="group flex items-center justify-between w-full py-2.5 px-3 rounded-xl hover:bg-stone-100 dark:hover:bg-[#16201A] transition text-left cursor-pointer"
          >
            <div class="flex items-center gap-3">
              <span class="font-mono text-xs font-bold text-stone-400 dark:text-stone-500 group-hover:text-[#183D2B] dark:group-hover:text-[#B8DF38] transition-colors">01</span>
              <span class="text-xs font-bold text-stone-800 dark:text-[#F0F4F1] group-hover:text-[#183D2B] dark:group-hover:text-[#B8DF38] transition-colors">Simulasi Gaji & Anggaran</span>
            </div>
            <ChevronRight class="w-3.5 h-3.5 text-stone-300 dark:text-stone-600 group-hover:text-stone-700 dark:group-hover:text-stone-200 group-hover:translate-x-0.5 transition-all" />
          </button>

          <button
            type="button"
            @click="scrollToSection('target-impian')"
            class="group flex items-center justify-between w-full py-2.5 px-3 rounded-xl hover:bg-stone-100 dark:hover:bg-[#16201A] transition text-left cursor-pointer"
          >
            <div class="flex items-center gap-3">
              <span class="font-mono text-xs font-bold text-stone-400 dark:text-stone-500 group-hover:text-[#183D2B] dark:group-hover:text-[#B8DF38] transition-colors">02</span>
              <span class="text-xs font-bold text-stone-800 dark:text-[#F0F4F1] group-hover:text-[#183D2B] dark:group-hover:text-[#B8DF38] transition-colors">Proyeksi Target Impian</span>
            </div>
            <ChevronRight class="w-3.5 h-3.5 text-stone-300 dark:text-stone-600 group-hover:text-stone-700 dark:group-hover:text-stone-200 group-hover:translate-x-0.5 transition-all" />
          </button>

          <button
            type="button"
            @click="scrollToSection('metode')"
            class="group flex items-center justify-between w-full py-2.5 px-3 rounded-xl hover:bg-stone-100 dark:hover:bg-[#16201A] transition text-left cursor-pointer"
          >
            <div class="flex items-center gap-3">
              <span class="font-mono text-xs font-bold text-stone-400 dark:text-stone-500 group-hover:text-[#183D2B] dark:group-hover:text-[#B8DF38] transition-colors">03</span>
              <span class="text-xs font-bold text-stone-800 dark:text-[#F0F4F1] group-hover:text-[#183D2B] dark:group-hover:text-[#B8DF38] transition-colors">Cara Kerja</span>
            </div>
            <ChevronRight class="w-3.5 h-3.5 text-stone-300 dark:text-stone-600 group-hover:text-stone-700 dark:group-hover:text-stone-200 group-hover:translate-x-0.5 transition-all" />
          </button>
        </div>
      </div>
    </header>

    <main>
      <!-- HERO SECTION (Mobile-First, Anti-Center Bias) -->
      <section class="max-w-7xl mx-auto px-4 sm:px-8 lg:px-10 min-h-0 lg:min-h-[calc(100dvh-72px)] grid lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] gap-8 sm:gap-10 lg:gap-14 items-center pt-6 pb-12 sm:py-14 lg:py-16">
        <!-- Hero Copy -->
        <div class="space-y-4 sm:space-y-6 max-w-[580px]">
          <!-- Eyebrow: Restricted to exactly 1 in hero per anti-slop rules -->
          <div class="flex">
            <span class="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-extrabold tracking-wider uppercase bg-[#183D2B]/10 dark:bg-[#B8DF38]/15 text-[#183D2B] dark:text-[#B8DF38] border border-[#183D2B]/15 dark:border-[#B8DF38]/20">
              <Sparkles class="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
              <span>Pengelolaan Arus Kas & Target Impian</span>
            </span>
          </div>

          <h1 class="text-[1.85rem] min-[390px]:text-[2.15rem] sm:text-5xl lg:text-[3.5rem] font-black tracking-[-0.04em] leading-[1.14] sm:leading-[1.08] text-[#18221B] dark:text-[#F0F4F1]">
            Uangmu, Lebih Jelas Hari Ini. Lebih Siap Hari Esok.
          </h1>

          <p class="text-sm sm:text-lg text-[#425348] dark:text-[#C8D3CA] leading-relaxed max-w-[48ch]">
            Satu tempat tenang untuk membagi anggaran 50/30/20, mempercepat target impian, dan tahu batas aman jajan harian.
          </p>

          <!-- CTAs (Full width on mobile for thumb accessibility) -->
          <div class="pt-1 sm:pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3">
            <RouterLink
              :to="startLink"
              class="tactile-btn inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#183D2B] dark:bg-[#B8DF38] text-white dark:text-[#0E1410] font-extrabold text-sm shadow-md hover:bg-[#24553D] dark:hover:bg-[#a3c82e] active:scale-[0.98] transition cursor-pointer min-h-[48px] w-full sm:w-auto"
            >
              <span>{{ startLabel }}</span>
              <ArrowRight class="w-4 h-4" />
            </RouterLink>

            <button
              type="button"
              @click="scrollToSimulation"
              class="tactile-btn inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-white dark:bg-[#16201A] hover:bg-stone-100 dark:hover:bg-[#243329] text-[#183D2B] dark:text-[#F0F4F1] font-bold text-sm border border-stone-200/90 dark:border-[#27372C] shadow-2xs active:scale-[0.98] transition cursor-pointer min-h-[48px] w-full sm:w-auto"
            >
              <span>Uji Simulasi Langsung</span>
              <ChevronDown class="w-4 h-4 text-stone-400" />
            </button>
          </div>

          <!-- Micro Trust Reassurance -->
          <p class="text-[11px] sm:text-xs text-[#5E6961] dark:text-[#98A79D] flex items-center gap-2 flex-wrap pt-0.5">
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
        <div class="relative min-w-0 mt-2 sm:mt-0">
          <!-- Background Ambient Glow -->
          <div class="absolute -right-6 -top-6 w-60 h-60 rounded-full bg-[#B8DF38]/15 blur-3xl pointer-events-none"></div>

          <div class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#183D2B] via-[#143425] to-[#0D2218] dark:from-[#132E21] dark:via-[#0F241A] dark:to-[#0A1B13] text-white p-4.5 sm:p-7 shadow-[0_20px_50px_-20px_rgba(24,61,43,0.35)] border border-emerald-800/50 dark:border-[#B8DF38]/30">
            <!-- Header Card Preview -->
            <div class="flex items-center justify-between border-b border-white/10 pb-3 sm:pb-4">
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
            <div class="py-3.5 sm:py-5 space-y-1">
              <span class="text-xs font-semibold text-emerald-100/80">Uang yang aman bisa dipakai</span>
              <p class="text-2xl min-[380px]:text-3xl sm:text-4xl font-black text-[#B8DF38] tracking-tight tabular-nums">
                Rp 3.850.000
              </p>
              <p class="text-[10px] sm:text-[11px] text-emerald-100/70 leading-relaxed">
                Sudah dikurangi pos cicilan wajib & tabungan. Kamu bebas belanja tanpa khawatir boncos.
              </p>
            </div>

            <!-- 2 Mini Split Columns -->
            <div class="grid grid-cols-2 gap-2 sm:gap-3 pt-3 border-t border-white/10">
              <div class="p-2 sm:p-3 rounded-xl bg-white/5 border border-white/10">
                <span class="text-[9px] sm:text-[10px] text-emerald-100/70 block">Total Saldo Bank</span>
                <span class="text-xs sm:text-sm font-bold text-white tabular-nums block mt-0.5">Rp 12.500.000</span>
              </div>
              <div class="p-2 sm:p-3 rounded-xl bg-white/5 border border-white/10">
                <span class="text-[9px] sm:text-[10px] text-emerald-100/70 block">Disisihkan Tabungan</span>
                <span class="text-xs sm:text-sm font-bold text-white tabular-nums block mt-0.5">Rp 8.650.000</span>
              </div>
            </div>

            <!-- Safe to Spend Live Gauge (Mobile-optimized inline bar) -->
            <div class="mt-3 sm:mt-4 p-2.5 sm:p-3.5 rounded-xl bg-[#B8DF38]/10 border border-[#B8DF38]/20 flex items-center justify-between gap-2">
              <div class="flex items-center gap-2 min-w-0">
                <div class="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-[#B8DF38]/20 flex items-center justify-center shrink-0">
                  <Coffee class="w-3.5 h-3.5 text-[#B8DF38]" />
                </div>
                <div class="min-w-0">
                  <span class="text-[10px] sm:text-[11px] font-bold text-[#B8DF38] block truncate">Safe-to-Spend Hari Ini</span>
                  <span class="text-xs sm:text-sm font-black text-white tabular-nums">Rp 65.000 / hari</span>
                </div>
              </div>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#B8DF38] text-[#183D2B] shrink-0">
                Aman
              </span>
            </div>
          </div>
        </div>
      </section>

      <!-- LIVE INTERACTIVE FINANCIAL SANDBOX (SIMULATOR) SECTION -->
      <section id="simulasi" class="border-t border-[#DDE6DC] dark:border-[#27372C] py-12 sm:py-24 bg-white dark:bg-[#16201A] scroll-mt-16">
        <div class="max-w-7xl mx-auto px-4 sm:px-8 lg:px-10 space-y-6 sm:space-y-12">
          <!-- Section Title -->
          <div class="max-w-2xl space-y-2 sm:space-y-3">
            <h2 class="text-xl min-[380px]:text-2xl sm:text-4xl font-extrabold tracking-tight text-[#18221B] dark:text-[#F0F4F1]">
              Uji Rencana Keuanganmu Dalam 10 Detik
            </h2>
            <p class="text-xs sm:text-base text-[#425348] dark:text-[#C8D3CA] leading-relaxed">
              Geser estimasi pemasukan bulananmu dan lihat bagaimana sistem membagi uangmu secara cerdas tanpa bikin tersiksa.
            </p>
          </div>

          <!-- Interactive Calculator Container -->
          <div class="rounded-2xl sm:rounded-3xl p-4 sm:p-8 lg:p-10 bg-[#F3F5EF] dark:bg-[#0E1410] border border-stone-200/90 dark:border-[#27372C] shadow-sm space-y-6 sm:space-y-10">
            <!-- 1. Income Slider & Quick Chips -->
            <div class="space-y-3 sm:space-y-4 max-w-3xl">
              <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
                <label for="income-slider" class="text-xs sm:text-sm font-bold text-stone-700 dark:text-[#F0F4F1] flex items-center gap-2">
                  <span>Pemasukan Bulanan Bersihmu:</span>
                </label>
                <div class="text-2xl min-[380px]:text-3xl sm:text-4xl font-black text-[#183D2B] dark:text-[#B8DF38] tabular-nums tracking-tight">
                  {{ formatRupiah(monthlyIncome) }}
                  <span class="text-xs font-semibold text-stone-500 dark:text-[#98A79D]">/ bulan</span>
                </div>
              </div>

              <!-- Range Slider (Touch-optimized custom thumb) -->
              <div class="py-2.5">
                <input
                  id="income-slider"
                  type="range"
                  v-model.number="monthlyIncome"
                  min="3000000"
                  max="35000000"
                  step="500000"
                  class="custom-range w-full h-3 bg-stone-200 dark:bg-stone-800 rounded-lg appearance-none cursor-pointer"
                  aria-label="Geser pemasukan bulanan"
                />
                <!-- Range Min/Max Footers -->
                <div class="flex items-center justify-between text-[10px] sm:text-xs text-stone-600 dark:text-stone-300 font-semibold pt-1.5 tabular-nums">
                  <span>Min: Rp 3.000.000</span>
                  <span>Maks: Rp 35.000.000</span>
                </div>
              </div>

              <!-- Preset Chips (Horizontally swipeable on mobile) -->
              <div class="flex items-center gap-2 overflow-x-auto pb-1.5 pt-1 -mx-2 px-2 sm:mx-0 sm:px-0 sm:flex-wrap sm:overflow-visible no-scrollbar">
                <span class="text-[11px] text-stone-500 dark:text-[#98A79D] font-medium shrink-0">Preset Cepat:</span>
                <button
                  v-for="chip in incomePresets"
                  :key="chip.value"
                  type="button"
                  @click="monthlyIncome = chip.value"
                  class="tactile-btn px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer shrink-0 min-h-[36px]"
                  :class="monthlyIncome === chip.value ? 'bg-[#183D2B] dark:bg-[#B8DF38] text-white dark:text-[#0E1410] shadow-xs' : 'bg-white dark:bg-[#16201A] text-stone-700 dark:text-stone-300 border border-stone-200/80 dark:border-[#27372C] hover:bg-stone-100'"
                >
                  {{ chip.label }}
                </button>
              </div>
            </div>

            <!-- 2. The 3-Pillar 50/30/20 Smart Split Cards -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-5">
              <!-- Pillar 1: Kebutuhan 50% -->
              <div class="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#16201A] border border-stone-200/80 dark:border-[#27372C] space-y-2 sm:space-y-3">
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
                  Sewa tempat tinggal, makan pokok, tagihan listrik, kuota internet, dan transportasi kerja.
                </p>
              </div>

              <!-- Pillar 2: Tabungan & Investasi 30% -->
              <div class="p-4 sm:p-5 rounded-2xl bg-emerald-50/70 dark:bg-[#132E21]/40 border border-emerald-200/80 dark:border-emerald-900/50 space-y-2 sm:space-y-3">
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
                <!-- Visual Sub-allocation Breakdown -->
                <div class="space-y-1.5 pt-2 border-t border-emerald-200/50 dark:border-emerald-800/40 text-xs">
                  <div class="flex justify-between text-stone-700 dark:text-stone-300">
                    <span>🛡️ Dana Darurat (60%):</span>
                    <strong class="tabular-nums font-bold">{{ formatRupiah(emergencyFundPart) }}</strong>
                  </div>
                  <div class="flex justify-between text-stone-700 dark:text-stone-300">
                    <span>🎯 Target Impian (40%):</span>
                    <strong class="tabular-nums font-bold">{{ formatRupiah(dreamGoalPart) }}</strong>
                  </div>
                </div>
              </div>

              <!-- Pillar 3: Keinginan & Safe-to-Spend 20% -->
              <div class="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#16201A] border border-stone-200/80 dark:border-[#27372C] space-y-2 sm:space-y-3">
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

                <!-- Safe to spend box highlight -->
                <div class="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-900/40 text-xs text-amber-900 dark:text-amber-200 space-y-0.5">
                  <span class="text-[10px] font-bold block text-amber-800 dark:text-amber-300">Batas Jajan Harian (Safe-to-Spend):</span>
                  <span class="text-sm font-black tabular-nums block">
                    {{ formatRupiah(dailySafeSpend) }} <span class="text-[10px] font-normal">/ hari</span>
                  </span>
                </div>
              </div>
            </div>

            <!-- 3. Interactive Goal Projection Simulator -->
            <div id="target-impian" class="pt-4 sm:pt-6 border-t border-stone-200/80 dark:border-[#27372C] space-y-4 sm:space-y-6 scroll-mt-20">
              <div class="space-y-1">
                <h3 class="text-sm sm:text-lg font-bold text-[#18221B] dark:text-[#F0F4F1] flex items-center gap-2">
                  <Target class="w-4 h-4 sm:w-5 sm:h-5 text-[#183D2B] dark:text-[#B8DF38] shrink-0" />
                  <span>Uji Kecepatan Impianmu: Kapan Barang Ini Bisa Dibeli?</span>
                </h3>
                <p class="text-xs text-stone-500 dark:text-[#98A79D]">
                  Pilih salah satu impian untuk melihat estimasi waktu tercapainya dengan porsi tabunganmu (<strong>{{ formatRupiah(dreamGoalPart) }}/bulan</strong>).
                </p>
              </div>

              <!-- Preset Buttons (2x2 on phone, 4 on desktop, no truncation cut-off) -->
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
                <button
                  v-for="goal in goalPresets"
                  :key="goal.key"
                  type="button"
                  @click="selectedGoalKey = goal.key"
                  class="tactile-btn p-3 sm:p-3.5 rounded-xl sm:rounded-2xl text-left border transition-all cursor-pointer space-y-1.5 sm:space-y-2 min-h-[84px] relative"
                  :class="selectedGoalKey === goal.key ? 'bg-white dark:bg-[#16201A] border-[#183D2B] dark:border-[#B8DF38] shadow-sm ring-2 ring-[#183D2B]/10 dark:ring-[#B8DF38]/20' : 'bg-white/60 dark:bg-[#16201A]/60 border-stone-200/70 dark:border-[#27372C] hover:border-stone-400'"
                >
                  <div class="flex items-center justify-between">
                    <component :is="goal.icon" class="w-4 h-4 sm:w-5 sm:h-5 shrink-0" :class="selectedGoalKey === goal.key ? 'text-[#183D2B] dark:text-[#B8DF38]' : 'text-stone-400'" />
                    <span v-if="selectedGoalKey === goal.key" class="w-4 h-4 rounded-full bg-[#183D2B] dark:bg-[#B8DF38] text-white dark:text-[#183D2B] flex items-center justify-center">
                      <Check class="w-2.5 h-2.5" />
                    </span>
                  </div>
                  <div>
                    <span class="text-xs font-bold block text-stone-800 dark:text-stone-100 line-clamp-2 min-h-[2rem] leading-tight">
                      {{ goal.name }}
                    </span>
                    <span class="text-[10px] sm:text-[11px] font-semibold text-stone-500 dark:text-stone-400 tabular-nums block mt-0.5">
                      {{ formatRupiah(goal.price) }}
                    </span>
                  </div>
                </button>
              </div>

              <!-- Output Projection Box (Mobile-first stat callout) -->
              <div class="p-4 sm:p-6 rounded-2xl bg-gradient-to-r from-[#183D2B] to-[#1E4D36] text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-5 shadow-sm">
                <div class="space-y-1.5 max-w-xl">
                  <span class="text-[10px] sm:text-xs font-bold text-[#B8DF38] uppercase tracking-wider block">
                    Hasil Proyeksi Realistis
                  </span>
                  <div class="flex items-baseline gap-2">
                    <span class="text-3xl sm:text-4xl font-black text-[#B8DF38] tabular-nums tracking-tight">
                      {{ monthsToAchieve }}
                    </span>
                    <span class="text-base sm:text-lg font-bold text-white">Bulan Lagi</span>
                    <span class="text-xs text-emerald-200 font-normal">({{ projectedAchieveDate }})</span>
                  </div>
                  <p class="text-xs text-emerald-100/85 leading-snug">
                    Dengan menyisihkan <strong>{{ formatRupiah(dreamGoalPart) }}/bulan</strong>, target impian <strong>{{ currentSelectedGoal.name }}</strong> tercapai tanpa mengorbankan pos kebutuhan atau dana darurat.
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
      <section id="metode" class="py-12 sm:py-24 border-t border-[#DDE6DC] dark:border-[#27372C] scroll-mt-16">
        <div class="max-w-7xl mx-auto px-4 sm:px-8 lg:px-10 space-y-6 sm:space-y-14">
          <div class="max-w-2xl space-y-2 sm:space-y-3">
            <h2 class="text-xl min-[380px]:text-2xl sm:text-4xl font-extrabold tracking-tight text-[#18221B] dark:text-[#F0F4F1]">
              Tiga Alasan Kenapa Cara Ini Tidak Bikin Boncos
            </h2>
            <p class="text-xs sm:text-base text-[#425348] dark:text-[#C8D3CA] leading-relaxed">
              Bukan sekadar mencatat nota, melainkan sistem psikologis yang membuatmu tetap disiplin tanpa rasa tertekan.
            </p>
          </div>

          <!-- 3 Asymmetric Bento Cards -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-6">
            <!-- Card 1 -->
            <div class="p-5 sm:p-8 rounded-2xl bg-white dark:bg-[#16201A] border border-stone-200/90 dark:border-[#27372C] space-y-3 sm:space-y-4 shadow-2xs">
              <div class="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-emerald-100/80 dark:bg-emerald-950/60 text-[#183D2B] dark:text-[#B8DF38] flex items-center justify-center font-bold text-xs sm:text-sm">
                01
              </div>
              <h3 class="text-sm sm:text-lg font-bold text-[#18221B] dark:text-[#F0F4F1] leading-snug">
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
              <h3 class="text-sm sm:text-lg font-bold text-[#18221B] dark:text-[#F0F4F1] leading-snug">
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
              <h3 class="text-sm sm:text-lg font-bold text-[#18221B] dark:text-[#F0F4F1] leading-snug">
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
      <section class="py-12 sm:py-24 bg-[#183D2B] text-white">
        <div class="max-w-7xl mx-auto px-4 sm:px-8 lg:px-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6 sm:gap-8">
          <div class="space-y-2 sm:space-y-3 max-w-xl">
            <h2 class="text-xl min-[380px]:text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
              Siap Melihat Kondisi Keuanganmu Dengan Lebih Jelas?
            </h2>
            <p class="text-xs sm:text-base text-emerald-100/80 leading-relaxed">
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
          <NalaraLogo :with-badge="true" size="xs" />
          <span class="font-bold text-[#18221B] dark:text-[#F0F4F1]">Nalara</span>
          <span class="hidden sm:inline">· Pengelolaan Anggaran & Impian</span>
        </div>

        <div class="flex items-center gap-4 sm:gap-6 font-semibold flex-wrap justify-center">
          <button
            type="button"
            @click="scrollToSection('simulasi')"
            class="hover:underline cursor-pointer py-1"
          >
            Simulasi Gaji
          </button>
          <button
            type="button"
            @click="scrollToSection('target-impian')"
            class="hover:underline cursor-pointer py-1"
          >
            Target Impian
          </button>
          <button
            type="button"
            @click="scrollToSection('metode')"
            class="hover:underline cursor-pointer py-1"
          >
            Cara Kerja
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

/* Touch-optimized Range Slider Thumb */
.custom-range::-webkit-slider-thumb {
  appearance: none;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #183D2B;
  border: 3px solid #B8DF38;
  cursor: grab;
  box-shadow: 0 2px 8px rgba(24, 61, 43, 0.35);
  transition: transform 0.1s ease;
}
.dark .custom-range::-webkit-slider-thumb {
  background: #B8DF38;
  border: 3px solid #183D2B;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.6);
}
.custom-range:active::-webkit-slider-thumb {
  transform: scale(1.15);
  cursor: grabbing;
}
.custom-range::-moz-range-thumb {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #183D2B;
  border: 3px solid #B8DF38;
  cursor: grab;
  box-shadow: 0 2px 8px rgba(24, 61, 43, 0.35);
}
.dark .custom-range::-moz-range-thumb {
  background: #B8DF38;
  border: 3px solid #183D2B;
}
</style>
