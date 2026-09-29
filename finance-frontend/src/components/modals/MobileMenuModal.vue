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
  SlidersHorizontal,
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
    class="fixed inset-0 z-50 flex flex-col justify-end glass-modal-backdrop lg:hidden"
    role="dialog"
    aria-modal="true"
    aria-labelledby="mobile-menu-title"
    @click.self="emit('close')"
  >
    <div
      class="w-full sm:max-w-lg md:max-w-xl mx-auto bg-white dark:bg-[#0D1524] rounded-t-[28px] sm:rounded-3xl border-t sm:border border-slate-200/90 dark:border-slate-800 shadow-2xl flex flex-col max-h-[92dvh] animate-in slide-in-from-bottom-8 duration-200 text-slate-900 dark:text-slate-100 transition-colors overflow-hidden"
    >
      <!-- Top Drag Bar & User Header (shrink-0) -->
      <div class="px-5 pt-3 pb-3.5 border-b border-slate-100 dark:border-slate-800/80 shrink-0 bg-white dark:bg-[#0D1524]">
        <!-- Drag handle -->
        <div class="w-10 h-1 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-3"></div>

        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3 min-w-0">
            <div class="w-10 h-10 rounded-xl bg-[#0B192C] text-white dark:bg-blue-600 dark:text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-xs border border-blue-900/30">
              {{ (userName || userEmail || 'P').charAt(0).toUpperCase() }}
            </div>
            <div class="min-w-0">
              <h3 id="mobile-menu-title" class="text-sm font-bold text-slate-900 dark:text-slate-100 truncate leading-tight">
                {{ userName || 'Akun Saya' }}
              </h3>
              <p v-if="userEmail" class="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                {{ userEmail }}
              </p>
            </div>
          </div>

          <button
            type="button"
            @click="emit('close')"
            aria-label="Tutup menu"
            class="p-2 -mr-1 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 transition cursor-pointer"
          >
            <X class="w-5 h-5" />
          </button>
        </div>
      </div>

      <!-- Scrollable List of Cards (flex-1) -->
      <div class="flex-1 overflow-y-auto overscroll-contain px-4 py-4 space-y-5">
        <!-- Seksi 1: Kelola Keuangan -->
        <div class="space-y-2">
          <p class="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-1">
            Kelola Keuangan
          </p>

          <div class="space-y-1.5">
            <!-- Profil & Saldo Awal -->
            <button
              type="button"
              @click="emit('openProfile'); emit('close');"
              class="tactile-btn w-full p-3 rounded-xl bg-slate-50 dark:bg-[#070B14] hover:bg-slate-100 dark:hover:bg-[#111C30] border border-slate-200/70 dark:border-slate-800/80 flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200 transition cursor-pointer"
            >
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <SlidersHorizontal class="w-4 h-4" />
                </div>
                <span>Profil & Saldo Awal</span>
              </div>
              <ChevronRight class="w-4 h-4 text-slate-400 dark:text-slate-500" />
            </button>

            <!-- Dompet & Rekening Fisik -->
            <button
              type="button"
              @click="emit('openWallets'); emit('close');"
              class="tactile-btn w-full p-3 rounded-xl bg-slate-50 dark:bg-[#070B14] hover:bg-slate-100 dark:hover:bg-[#111C30] border border-slate-200/70 dark:border-slate-800/80 flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200 transition cursor-pointer"
            >
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <Wallet class="w-4 h-4" />
                </div>
                <span>Dompet & Rekening Fisik</span>
              </div>
              <ChevronRight class="w-4 h-4 text-slate-400 dark:text-slate-500" />
            </button>

            <!-- Pindah Dana Antar Dompet -->
            <button
              type="button"
              @click="emit('openTransfer'); emit('close');"
              class="tactile-btn w-full p-3 rounded-xl bg-slate-50 dark:bg-[#070B14] hover:bg-slate-100 dark:hover:bg-[#111C30] border border-slate-200/70 dark:border-slate-800/80 flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200 transition cursor-pointer"
            >
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <ArrowRightLeft class="w-4 h-4" />
                </div>
                <span>Pindah Dana Antar Dompet</span>
              </div>
              <ChevronRight class="w-4 h-4 text-slate-400 dark:text-slate-500" />
            </button>

            <!-- Kategori & Sumber Dana -->
            <button
              type="button"
              @click="emit('openManage'); emit('close');"
              class="tactile-btn w-full p-3 rounded-xl bg-slate-50 dark:bg-[#070B14] hover:bg-slate-100 dark:hover:bg-[#111C30] border border-slate-200/70 dark:border-slate-800/80 flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200 transition cursor-pointer"
            >
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <Tag class="w-4 h-4" />
                </div>
                <span>Kategori & Sumber Dana</span>
              </div>
              <ChevronRight class="w-4 h-4 text-slate-400 dark:text-slate-500" />
            </button>

            <!-- Transaksi Berulang & Tagihan -->
            <button
              type="button"
              @click="emit('openRecurring'); emit('close');"
              class="tactile-btn w-full p-3 rounded-xl bg-slate-50 dark:bg-[#070B14] hover:bg-slate-100 dark:hover:bg-[#111C30] border border-slate-200/70 dark:border-slate-800/80 flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200 transition cursor-pointer"
            >
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <Clock class="w-4 h-4" />
                </div>
                <span>Transaksi Berulang & Tagihan</span>
              </div>
              <ChevronRight class="w-4 h-4 text-slate-400 dark:text-slate-500" />
            </button>
          </div>
        </div>

        <!-- Seksi 2: Rencana & Laporan -->
        <div class="space-y-2">
          <p class="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-1">
            Rencana dan Laporan
          </p>

          <div class="space-y-1.5">
            <!-- Simulator KPR & Target -->
            <button
              type="button"
              @click="emit('openSimulator'); emit('close');"
              class="tactile-btn w-full p-3 rounded-xl bg-slate-50 dark:bg-[#070B14] hover:bg-slate-100 dark:hover:bg-[#111C30] border border-slate-200/70 dark:border-slate-800/80 flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200 transition cursor-pointer"
            >
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <Calculator class="w-4 h-4" />
                </div>
                <span>Simulasi KPR & Target Impian</span>
              </div>
              <ChevronRight class="w-4 h-4 text-slate-400 dark:text-slate-500" />
            </button>

            <!-- Analitik & Tren Finansial -->
            <button
              type="button"
              @click="emit('openAnalytics'); emit('close');"
              class="tactile-btn w-full p-3 rounded-xl bg-slate-50 dark:bg-[#070B14] hover:bg-slate-100 dark:hover:bg-[#111C30] border border-slate-200/70 dark:border-slate-800/80 flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200 transition cursor-pointer"
            >
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <TrendingUp class="w-4 h-4" />
                </div>
                <span>Analitik & Tren Finansial</span>
              </div>
              <ChevronRight class="w-4 h-4 text-slate-400 dark:text-slate-500" />
            </button>

            <!-- Review Akhir Bulan -->
            <button
              type="button"
              @click="emit('openMonthEndReview'); emit('close');"
              class="tactile-btn w-full p-3 rounded-xl bg-slate-50 dark:bg-[#070B14] hover:bg-slate-100 dark:hover:bg-[#111C30] border border-slate-200/70 dark:border-slate-800/80 flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200 transition cursor-pointer"
            >
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <CalendarCheck class="w-4 h-4" />
                </div>
                <span>Tinjauan Evaluasi Akhir Bulan</span>
              </div>
              <ChevronRight class="w-4 h-4 text-slate-400 dark:text-slate-500" />
            </button>
          </div>
        </div>

        <!-- Seksi 3: Tampilan -->
        <div class="space-y-2">
          <p class="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-1">
            Tampilan
          </p>

          <button
            type="button"
            @click="toggleTheme"
            class="tactile-btn w-full p-3 rounded-xl bg-slate-50 dark:bg-[#070B14] hover:bg-slate-100 dark:hover:bg-[#111C30] border border-slate-200/70 dark:border-slate-800/80 flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200 transition cursor-pointer"
          >
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <Sun v-if="isDark" class="w-4 h-4 text-amber-400" />
                <Moon v-else class="w-4 h-4 text-slate-700" />
              </div>
              <span>{{ isDark ? 'Mode Gelap Aktif' : 'Mode Terang Aktif' }}</span>
            </div>
            <div class="w-9 h-5 rounded-full p-0.5 transition-colors" :class="isDark ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'">
              <div class="w-4 h-4 rounded-full transition-transform" :class="isDark ? 'translate-x-4 bg-white' : 'translate-x-0 bg-white shadow-2xs'"></div>
            </div>
          </button>
        </div>

        <!-- Seksi 4: Logout -->
        <div class="pt-2 pb-6">
          <button
            type="button"
            @click="emit('logout'); emit('close');"
            class="tactile-btn w-full py-3 px-4 bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-rose-800 dark:text-rose-300 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer border border-rose-200/70 dark:border-rose-900/50"
          >
            <LogOut class="w-4 h-4 text-rose-600 dark:text-rose-400" />
            <span>Keluar dari Akun</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
