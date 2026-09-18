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
} from 'lucide-vue-next';
import type { FinanceProfile } from '../../api/services';

defineProps<{
  show: boolean;
  profile?: FinanceProfile | null;
  userName?: string;
  userEmail?: string;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'openProfile'): void;
  (e: 'openManage'): void;
  (e: 'openRecurring'): void;
  (e: 'openSimulator'): void;
  (e: 'openMonthEndReview'): void;
  (e: 'openAnalytics'): void;
  (e: 'logout'): void;
}>();
</script>

<template>
  <div
    v-if="show"
    class="fixed inset-0 z-50 flex flex-col justify-end glass-modal-backdrop sm:hidden"
    role="dialog"
    aria-modal="true"
  >
    <div
      class="bg-white rounded-t-3xl border-t border-stone-200/90 shadow-2xl p-5 space-y-4 max-h-[85dvh] overflow-y-auto animate-in slide-in-from-bottom-8 duration-200 text-[#18221B]"
    >
      <!-- Drag handle / bar -->
      <div class="w-12 h-1.5 bg-stone-200 rounded-full mx-auto mb-1"></div>

      <!-- Header & User Info -->
      <div class="flex items-center justify-between pb-3 border-b border-stone-100">
        <div class="flex items-center gap-3 min-w-0">
          <div class="w-10 h-10 rounded-2xl bg-[#183D2B] text-[#B8DF38] font-bold text-sm flex items-center justify-center shrink-0 shadow-xs">
            {{ (userName || userEmail || 'P').charAt(0).toUpperCase() }}
          </div>
          <div class="min-w-0">
            <h3 class="text-sm font-extrabold text-[#18221B] truncate">{{ userName || 'Pengguna' }}</h3>
            <p class="text-[11px] text-stone-500 truncate">{{ userEmail || 'fintech@user.local' }}</p>
          </div>
        </div>

        <button
          type="button"
          @click="emit('close')"
          class="tactile-btn p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition cursor-pointer"
        >
          <X class="w-4 h-4" />
        </button>
      </div>

      <!-- Menu Items -->
      <div class="space-y-1.5">
        <p class="text-[10px] font-bold uppercase tracking-wider text-stone-400 px-1">Menu & Pengaturan</p>

        <!-- Profil Keuangan -->
        <button
          type="button"
          @click="emit('openProfile'); emit('close');"
          class="tactile-btn w-full p-3 rounded-xl bg-stone-50 hover:bg-stone-100 flex items-center justify-between text-xs font-bold text-stone-800 transition cursor-pointer"
        >
          <span class="flex items-center gap-2.5">
            <div class="w-7 h-7 rounded-lg bg-white text-[#183D2B] flex items-center justify-center shadow-2xs border border-stone-200/60">
              <Wallet class="w-4 h-4" />
            </div>
            <span>Profil & Saldo Awal</span>
          </span>
          <ChevronRight class="w-4 h-4 text-stone-400" />
        </button>

        <!-- Kelola Kategori -->
        <button
          type="button"
          @click="emit('openManage'); emit('close');"
          class="tactile-btn w-full p-3 rounded-xl bg-stone-50 hover:bg-stone-100 flex items-center justify-between text-xs font-bold text-stone-800 transition cursor-pointer"
        >
          <span class="flex items-center gap-2.5">
            <div class="w-7 h-7 rounded-lg bg-white text-[#183D2B] flex items-center justify-center shadow-2xs border border-stone-200/60">
              <Tag class="w-4 h-4" />
            </div>
            <span>Kategori & Sumber Dana</span>
          </span>
          <ChevronRight class="w-4 h-4 text-stone-400" />
        </button>

        <!-- Transaksi Berulang -->
        <button
          type="button"
          @click="emit('openRecurring'); emit('close');"
          class="tactile-btn w-full p-3 rounded-xl bg-stone-50 hover:bg-stone-100 flex items-center justify-between text-xs font-bold text-stone-800 transition cursor-pointer"
        >
          <span class="flex items-center gap-2.5">
            <div class="w-7 h-7 rounded-lg bg-white text-[#183D2B] flex items-center justify-center shadow-2xs border border-stone-200/60">
              <Clock class="w-4 h-4" />
            </div>
            <span>Transaksi Berulang & Tagihan</span>
          </span>
          <ChevronRight class="w-4 h-4 text-stone-400" />
        </button>

        <!-- Simulator KPR & Target -->
        <button
          type="button"
          @click="emit('openSimulator'); emit('close');"
          class="tactile-btn w-full p-3 rounded-xl bg-stone-50 hover:bg-stone-100 flex items-center justify-between text-xs font-bold text-stone-800 transition cursor-pointer"
        >
          <span class="flex items-center gap-2.5">
            <div class="w-7 h-7 rounded-lg bg-white text-[#183D2B] flex items-center justify-center shadow-2xs border border-stone-200/60">
              <Calculator class="w-4 h-4" />
            </div>
            <span>Simulasi KPR & Target Impian</span>
          </span>
          <ChevronRight class="w-4 h-4 text-stone-400" />
        </button>

        <!-- Analitik & Tren Finansial -->
        <button
          type="button"
          @click="emit('openAnalytics'); emit('close');"
          class="tactile-btn w-full p-3 rounded-xl bg-stone-50 hover:bg-stone-100 flex items-center justify-between text-xs font-bold text-stone-800 transition cursor-pointer"
        >
          <span class="flex items-center gap-2.5">
            <div class="w-7 h-7 rounded-lg bg-white text-[#183D2B] flex items-center justify-center shadow-2xs border border-stone-200/60">
              <TrendingUp class="w-4 h-4" />
            </div>
            <span>Analitik & Tren Finansial</span>
          </span>
          <ChevronRight class="w-4 h-4 text-stone-400" />
        </button>

        <!-- Review Akhir Bulan -->
        <button
          type="button"
          @click="emit('openMonthEndReview'); emit('close');"
          class="tactile-btn w-full p-3 rounded-xl bg-stone-50 hover:bg-stone-100 flex items-center justify-between text-xs font-bold text-stone-800 transition cursor-pointer"
        >
          <span class="flex items-center gap-2.5">
            <div class="w-7 h-7 rounded-lg bg-white text-[#183D2B] flex items-center justify-center shadow-2xs border border-stone-200/60">
              <CalendarCheck class="w-4 h-4" />
            </div>
            <span>Tinjauan Evaluasi Akhir Bulan</span>
          </span>
          <ChevronRight class="w-4 h-4 text-stone-400" />
        </button>
      </div>

      <!-- Logout Button -->
      <div class="pt-2 border-t border-stone-100">
        <button
          type="button"
          @click="emit('logout'); emit('close');"
          class="tactile-btn w-full py-2.5 px-4 bg-rose-50 hover:bg-rose-100 text-rose-800 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition cursor-pointer border border-rose-200/60"
        >
          <LogOut class="w-4 h-4 text-rose-600" />
          <span>Keluar dari Akun</span>
        </button>
      </div>
    </div>
  </div>
</template>
