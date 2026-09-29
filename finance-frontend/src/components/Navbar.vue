<script setup lang="ts">
import { ref } from 'vue';
import {
  Calculator,
  CalendarCheck,
  Tag,
  Wallet,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Clock,
} from 'lucide-vue-next';
import NalaraLogo from './ui/NalaraLogo.vue';

defineProps<{
  timezone?: string;
}>();

const emit = defineEmits<{
  (e: 'openSimulator'): void;
  (e: 'openRecurring'): void;
  (e: 'openMonthEndReview'): void;
  (e: 'openManage'): void;
  (e: 'openProfile'): void;
  (e: 'logout'): void;
}>();

const showMobileMenu = ref(false);
</script>

<template>
  <header class="bg-white/90 dark:bg-[#070B14]/90 backdrop-blur-md border-b border-slate-200/90 dark:border-slate-800 sticky top-0 z-30 transition-all">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
      <!-- Brand & Status -->
      <div class="flex items-center space-x-3">
        <NalaraLogo :with-badge="true" size="sm" />
        <div>
          <div class="flex items-center space-x-2">
            <h1 class="text-sm sm:text-base font-extrabold text-slate-900 dark:text-slate-100 tracking-tight leading-none">
              Nalara
            </h1>
            <span class="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/50">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1 animate-pulse"></span>
              Aktif
            </span>
          </div>
          <p class="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5 font-medium">
            <span>{{ timezone || 'Asia/Makassar' }}</span>
          </p>
        </div>
      </div>

      <!-- Desktop Action Buttons (md:flex) -->
      <nav class="hidden md:flex items-center space-x-2" aria-label="Navigasi Utama">
        <button
          type="button"
          @click="emit('openSimulator')"
          class="tactile-btn inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/40 border border-blue-200 dark:border-blue-800/60 rounded-xl cursor-pointer"
        >
          <Calculator class="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" :stroke-width="2" />
          <span>Simulator KPR</span>
        </button>

        <button
          type="button"
          @click="emit('openMonthEndReview')"
          class="tactile-btn inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100/90 dark:bg-[#0D1524] hover:bg-slate-200/90 dark:hover:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-xl cursor-pointer"
        >
          <CalendarCheck class="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" :stroke-width="1.75" />
          <span>Tinjauan Bulan</span>
        </button>

        <button
          type="button"
          @click="emit('openManage')"
          class="tactile-btn inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100/90 dark:bg-[#0D1524] hover:bg-slate-200/90 dark:hover:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-xl cursor-pointer"
        >
          <Tag class="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" :stroke-width="1.75" />
          <span>Kategori</span>
        </button>

        <button
          type="button"
          @click="emit('openProfile')"
          class="tactile-btn inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100/90 dark:bg-[#0D1524] hover:bg-slate-200/90 dark:hover:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-xl cursor-pointer"
        >
          <Wallet class="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" :stroke-width="2" />
          <span>Saldo Awal</span>
        </button>

        <div class="h-4 w-px bg-slate-200 dark:bg-slate-800 mx-1"></div>

        <button
          type="button"
          @click="emit('logout')"
          class="tactile-btn inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 border border-rose-200/60 dark:border-rose-900/50 rounded-xl cursor-pointer"
          title="Keluar dari akun"
        >
          <LogOut class="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" :stroke-width="1.75" />
          <span>Keluar</span>
        </button>
      </nav>

      <!-- Mobile Action Controls (md:hidden) -->
      <div class="flex md:hidden items-center space-x-2">
        <button
          type="button"
          @click="emit('openProfile')"
          class="tactile-btn inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-[#0D1524] border border-slate-200 dark:border-slate-800 rounded-xl cursor-pointer"
        >
          <Wallet class="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" :stroke-width="2" />
          <span>Saldo</span>
        </button>

        <button
          type="button"
          @click="showMobileMenu = !showMobileMenu"
          class="tactile-btn p-2 text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-[#0D1524] hover:bg-slate-200 dark:hover:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-xl cursor-pointer"
          :aria-expanded="showMobileMenu"
          aria-label="Buka Menu Opsi"
        >
          <component :is="showMobileMenu ? X : Menu" class="w-5 h-5" :stroke-width="2" />
        </button>
      </div>
    </div>

    <!-- Mobile Dropdown Menu -->
    <div
      v-if="showMobileMenu"
      class="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-[#0D1524]/95 backdrop-blur-xl px-4 py-3 space-y-2 shadow-lg animate-modal-enter"
    >
      <button
        type="button"
        @click="emit('openSimulator'); showMobileMenu = false;"
        class="w-full text-left px-3.5 py-2.5 text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 rounded-xl flex items-center justify-between border border-blue-200 dark:border-blue-800/60 cursor-pointer"
      >
        <span class="flex items-center gap-2">
          <Calculator class="w-4 h-4 text-blue-600 dark:text-blue-400" :stroke-width="2" />
          <span>Simulator KPR & Target Impian</span>
        </span>
        <ChevronRight class="w-4 h-4 text-blue-600 dark:text-blue-400" />
      </button>

      <button
        type="button"
        @click="emit('openRecurring'); showMobileMenu = false;"
        class="w-full text-left px-3.5 py-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-[#070B14] rounded-xl flex items-center justify-between border border-slate-200 dark:border-slate-800 cursor-pointer"
      >
        <span class="flex items-center gap-2">
          <Clock class="w-4 h-4 text-slate-600 dark:text-slate-400" :stroke-width="1.75" />
          <span>Transaksi Berulang & Tagihan</span>
        </span>
        <ChevronRight class="w-4 h-4 text-slate-400" />
      </button>

      <button
        type="button"
        @click="emit('openMonthEndReview'); showMobileMenu = false;"
        class="w-full text-left px-3.5 py-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-[#070B14] rounded-xl flex items-center justify-between border border-slate-200 dark:border-slate-800 cursor-pointer"
      >
        <span class="flex items-center gap-2">
          <CalendarCheck class="w-4 h-4 text-slate-600 dark:text-slate-400" :stroke-width="1.75" />
          <span>Tinjauan Evaluasi Akhir Bulan</span>
        </span>
        <ChevronRight class="w-4 h-4 text-slate-400" />
      </button>

      <button
        type="button"
        @click="emit('openManage'); showMobileMenu = false;"
        class="w-full text-left px-3.5 py-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-[#070B14] rounded-xl flex items-center justify-between border border-slate-200 dark:border-slate-800 cursor-pointer"
      >
        <span class="flex items-center gap-2">
          <Tag class="w-4 h-4 text-slate-600 dark:text-slate-400" :stroke-width="1.75" />
          <span>Kelola Kategori & Sumber Dana</span>
        </span>
        <ChevronRight class="w-4 h-4 text-slate-400" />
      </button>

      <button
        type="button"
        @click="emit('logout'); showMobileMenu = false;"
        class="w-full text-left px-3.5 py-2.5 text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50/70 dark:bg-rose-950/40 rounded-xl flex items-center justify-between border border-rose-200/60 dark:border-rose-900/50 cursor-pointer"
      >
        <span class="flex items-center gap-2">
          <LogOut class="w-4 h-4 text-rose-600 dark:text-rose-400" :stroke-width="1.75" />
          <span>Keluar dari Akun</span>
        </span>
        <ChevronRight class="w-4 h-4 text-rose-400" />
      </button>
    </div>
  </header>
</template>
