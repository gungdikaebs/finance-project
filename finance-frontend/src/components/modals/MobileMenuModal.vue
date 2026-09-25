<script setup lang="ts">
import {
  X,
  Wallet,
  Tag,
  Clock,
  Calculator,
  CalendarCheck,
  LogOut,
  ChevronRight,
  TrendingUp,
  ArrowRightLeft,
  Sun,
  Moon,
} from 'lucide-vue-next';
import type { FinanceProfile } from '../../api/services';
import { useTheme } from '../../composables/useTheme';

defineProps<{
  show: boolean;
  profile?: FinanceProfile | null;
  userName?: string;
  userEmail?: string;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'openProfile'): void;
  (e: 'openWallets'): void;
  (e: 'openTransfer'): void;
  (e: 'openManage'): void;
  (e: 'openRecurring'): void;
  (e: 'openSimulator'): void;
  (e: 'openMonthEndReview'): void;
  (e: 'openAnalytics'): void;
  (e: 'logout'): void;
}>();

const { isDark, toggleTheme } = useTheme();
</script>

<template>
  <div
    v-if="show"
    class="fixed inset-0 z-50 flex flex-col justify-end glass-modal-backdrop sm:hidden"
    role="dialog"
    aria-modal="true"
    aria-labelledby="mobile-menu-title"
  >
    <div
      class="bg-white dark:bg-[#16201A] rounded-t-3xl border-t border-stone-200/90 dark:border-[#243329] shadow-2xl p-5 space-y-4 max-h-[85dvh] overflow-y-auto animate-in slide-in-from-bottom-8 duration-200 text-[#18221B] dark:text-[#F0F4F1] transition-colors"
    >
      <!-- Drag handle / bar -->
      <div class="w-12 h-1.5 bg-stone-200 dark:bg-stone-700 rounded-full mx-auto mb-1"></div>

      <!-- Header & User Info -->
      <div class="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-[#243329]">
        <div class="flex items-center gap-3 min-w-0">
          <div class="w-10 h-10 rounded-2xl bg-[#183D2B] dark:bg-[#132E21] text-[#B8DF38] font-bold text-sm flex items-center justify-center shrink-0 shadow-xs border border-emerald-900/40">
            {{ (userName || userEmail || 'P').charAt(0).toUpperCase() }}
          </div>
          <div class="min-w-0">
            <h3 id="mobile-menu-title" class="text-sm font-extrabold text-[#18221B] dark:text-[#F0F4F1] truncate">Menu akun {{ userName || 'Memuat akun…' }}</h3>
            <p v-if="userEmail" class="text-[11px] text-stone-500 dark:text-[#98A79D] truncate">{{ userEmail }}</p>
          </div>
        </div>

        <button
          type="button"
          @click="emit('close')"
          aria-label="Tutup menu"
          class="tactile-btn p-2 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-[#F0F4F1] hover:bg-stone-100 dark:hover:bg-[#0E1410] transition cursor-pointer"
        >
          <X class="w-4 h-4" />
        </button>
      </div>

      <!-- Menu Items -->
      <div class="space-y-1.5">
        <p class="text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-[#98A79D]/70 px-1">Kelola keuangan</p>

        <!-- Profil Keuangan -->
        <button
          type="button"
          @click="emit('openProfile'); emit('close');"
          class="tactile-btn w-full p-3 rounded-xl bg-stone-50 dark:bg-[#0E1410] hover:bg-stone-100 dark:hover:bg-[#243329]/50 flex items-center justify-between text-xs font-bold text-stone-800 dark:text-[#F0F4F1] transition cursor-pointer"
        >
          <span class="flex items-center gap-2.5">
            <div class="w-7 h-7 rounded-lg bg-white dark:bg-[#16201A] text-[#183D2B] dark:text-[#B8DF38] flex items-center justify-center shadow-2xs border border-stone-200/60 dark:border-[#243329]">
              <Wallet class="w-4 h-4" />
            </div>
            <span>Profil & Saldo Awal</span>
          </span>
          <ChevronRight class="w-4 h-4 text-stone-400 dark:text-[#98A79D]" />
        </button>

        <!-- Dompet & Rekening Fisik (Modul 6) -->
        <button
          type="button"
          @click="emit('openWallets'); emit('close');"
          class="tactile-btn w-full p-3 rounded-xl bg-stone-50 dark:bg-[#0E1410] hover:bg-stone-100 dark:hover:bg-[#243329]/50 flex items-center justify-between text-xs font-bold text-stone-800 dark:text-[#F0F4F1] transition cursor-pointer"
        >
          <span class="flex items-center gap-2.5">
            <div class="w-7 h-7 rounded-lg bg-white dark:bg-[#16201A] text-[#183D2B] dark:text-[#B8DF38] flex items-center justify-center shadow-2xs border border-stone-200/60 dark:border-[#243329]">
              <Wallet class="w-4 h-4 text-emerald-600 dark:text-[#B8DF38]" />
            </div>
            <span>Dompet & Rekening Fisik</span>
          </span>
          <ChevronRight class="w-4 h-4 text-stone-400 dark:text-[#98A79D]" />
        </button>

        <!-- Pindah Dana / Transfer (Modul 6) -->
        <button
          type="button"
          @click="emit('openTransfer'); emit('close');"
          class="tactile-btn w-full p-3 rounded-xl bg-stone-50 dark:bg-[#0E1410] hover:bg-stone-100 dark:hover:bg-[#243329]/50 flex items-center justify-between text-xs font-bold text-stone-800 dark:text-[#F0F4F1] transition cursor-pointer"
        >
          <span class="flex items-center gap-2.5">
            <div class="w-7 h-7 rounded-lg bg-white dark:bg-[#16201A] text-emerald-600 dark:text-[#B8DF38] flex items-center justify-center shadow-2xs border border-stone-200/60 dark:border-[#243329]">
              <ArrowRightLeft class="w-4 h-4" />
            </div>
            <span>Pindah Dana Antar Dompet</span>
          </span>
          <ChevronRight class="w-4 h-4 text-stone-400 dark:text-[#98A79D]" />
        </button>

        <!-- Kelola Kategori -->
        <button
          type="button"
          @click="emit('openManage'); emit('close');"
          class="tactile-btn w-full p-3 rounded-xl bg-stone-50 dark:bg-[#0E1410] hover:bg-stone-100 dark:hover:bg-[#243329]/50 flex items-center justify-between text-xs font-bold text-stone-800 dark:text-[#F0F4F1] transition cursor-pointer"
        >
          <span class="flex items-center gap-2.5">
            <div class="w-7 h-7 rounded-lg bg-white dark:bg-[#16201A] text-[#183D2B] dark:text-[#B8DF38] flex items-center justify-center shadow-2xs border border-stone-200/60 dark:border-[#243329]">
              <Tag class="w-4 h-4" />
            </div>
            <span>Kategori & Sumber Dana</span>
          </span>
          <ChevronRight class="w-4 h-4 text-stone-400 dark:text-[#98A79D]" />
        </button>

        <!-- Transaksi Berulang -->
        <button
          type="button"
          @click="emit('openRecurring'); emit('close');"
          class="tactile-btn w-full p-3 rounded-xl bg-stone-50 dark:bg-[#0E1410] hover:bg-stone-100 dark:hover:bg-[#243329]/50 flex items-center justify-between text-xs font-bold text-stone-800 dark:text-[#F0F4F1] transition cursor-pointer"
        >
          <span class="flex items-center gap-2.5">
            <div class="w-7 h-7 rounded-lg bg-white dark:bg-[#16201A] text-[#183D2B] dark:text-[#B8DF38] flex items-center justify-center shadow-2xs border border-stone-200/60 dark:border-[#243329]">
              <Clock class="w-4 h-4" />
            </div>
            <span>Transaksi Berulang & Tagihan</span>
          </span>
          <ChevronRight class="w-4 h-4 text-stone-400 dark:text-[#98A79D]" />
        </button>

        <p class="pt-2 text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-[#98A79D]/70 px-1">Rencana dan laporan</p>

        <!-- Simulator KPR & Target -->
        <button
          type="button"
          @click="emit('openSimulator'); emit('close');"
          class="tactile-btn w-full p-3 rounded-xl bg-stone-50 dark:bg-[#0E1410] hover:bg-stone-100 dark:hover:bg-[#243329]/50 flex items-center justify-between text-xs font-bold text-stone-800 dark:text-[#F0F4F1] transition cursor-pointer"
        >
          <span class="flex items-center gap-2.5">
            <div class="w-7 h-7 rounded-lg bg-white dark:bg-[#16201A] text-[#183D2B] dark:text-[#B8DF38] flex items-center justify-center shadow-2xs border border-stone-200/60 dark:border-[#243329]">
              <Calculator class="w-4 h-4" />
            </div>
            <span>Simulasi KPR & Target Impian</span>
          </span>
          <ChevronRight class="w-4 h-4 text-stone-400 dark:text-[#98A79D]" />
        </button>

        <!-- Analitik & Tren Finansial -->
        <button
          type="button"
          @click="emit('openAnalytics'); emit('close');"
          class="tactile-btn w-full p-3 rounded-xl bg-stone-50 dark:bg-[#0E1410] hover:bg-stone-100 dark:hover:bg-[#243329]/50 flex items-center justify-between text-xs font-bold text-stone-800 dark:text-[#F0F4F1] transition cursor-pointer"
        >
          <span class="flex items-center gap-2.5">
            <div class="w-7 h-7 rounded-lg bg-white dark:bg-[#16201A] text-[#183D2B] dark:text-[#B8DF38] flex items-center justify-center shadow-2xs border border-stone-200/60 dark:border-[#243329]">
              <TrendingUp class="w-4 h-4" />
            </div>
            <span>Analitik & Tren Finansial</span>
          </span>
          <ChevronRight class="w-4 h-4 text-stone-400 dark:text-[#98A79D]" />
        </button>

        <!-- Review Akhir Bulan -->
        <button
          type="button"
          @click="emit('openMonthEndReview'); emit('close');"
          class="tactile-btn w-full p-3 rounded-xl bg-stone-50 dark:bg-[#0E1410] hover:bg-stone-100 dark:hover:bg-[#243329]/50 flex items-center justify-between text-xs font-bold text-stone-800 dark:text-[#F0F4F1] transition cursor-pointer"
        >
          <span class="flex items-center gap-2.5">
            <div class="w-7 h-7 rounded-lg bg-white dark:bg-[#16201A] text-[#183D2B] dark:text-[#B8DF38] flex items-center justify-center shadow-2xs border border-stone-200/60 dark:border-[#243329]">
              <CalendarCheck class="w-4 h-4" />
            </div>
            <span>Tinjauan Evaluasi Akhir Bulan</span>
          </span>
          <ChevronRight class="w-4 h-4 text-stone-400 dark:text-[#98A79D]" />
        </button>

        <p class="pt-2 text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-[#98A79D]/70 px-1">Tampilan</p>

        <!-- Toggle Mode Gelap / Terang (Modul 9) -->
        <button
          type="button"
          @click="toggleTheme"
          class="tactile-btn w-full p-3 rounded-xl bg-stone-50 dark:bg-[#0E1410] hover:bg-stone-100 dark:hover:bg-[#243329]/50 flex items-center justify-between text-xs font-bold text-stone-800 dark:text-[#F0F4F1] transition cursor-pointer"
        >
          <span class="flex items-center gap-2.5">
            <div class="w-7 h-7 rounded-lg bg-white dark:bg-[#16201A] text-[#183D2B] dark:text-[#B8DF38] flex items-center justify-center shadow-2xs border border-stone-200/60 dark:border-[#243329]">
              <Sun v-if="isDark" class="w-4 h-4 text-[#B8DF38]" />
              <Moon v-else class="w-4 h-4 text-[#18221B]/60" />
            </div>
            <span>{{ isDark ? 'Mode Gelap Aktif' : 'Mode Terang Aktif' }}</span>
          </span>
          <div class="w-8 h-4.5 rounded-full p-0.5 transition-colors" :class="isDark ? 'bg-[#B8DF38]' : 'bg-stone-200'">
            <div class="w-3.5 h-3.5 rounded-full transition-transform" :class="isDark ? 'translate-x-3.5 bg-[#0E1410]' : 'translate-x-0 bg-white shadow-2xs'"></div>
          </div>
        </button>
      </div>

      <!-- Logout Button -->
      <div class="pt-2 border-t border-stone-100 dark:border-[#243329]">
        <button
          type="button"
          @click="emit('logout'); emit('close');"
          class="tactile-btn w-full py-2.5 px-4 bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-rose-800 dark:text-rose-300 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition cursor-pointer border border-rose-200/60 dark:border-rose-900/50"
        >
          <LogOut class="w-4 h-4 text-rose-600 dark:text-rose-400" />
          <span>Keluar dari Akun</span>
        </button>
      </div>
    </div>
  </div>
</template>
