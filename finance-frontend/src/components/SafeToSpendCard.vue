<script setup lang="ts">
import { ref, computed } from 'vue';
import { formatRupiah } from '../utils/format';
import type { MonthlyReport, Transaction } from '../api/services';
import {
  Sparkles,
  Coffee,
  ShoppingBag,
  Clock,
} from 'lucide-vue-next';

const props = defineProps<{
  monthlyReport?: MonthlyReport | null;
  transactions?: Transaction[];
  currentMonth: number;
  currentYear: number;
}>();

// Mode: 'WANTS' (Khusus Keinginan/Jajan - Rekomendasi) vs 'ALL' (Total Belanja Fleksibel)
const mode = ref<'WANTS' | 'ALL'>('WANTS');

const getLocalDateString = (d: Date = new Date()): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const now = new Date();
const todayStr = getLocalDateString(now);

const isCurrentMonth = computed(() => {
  return props.currentYear === now.getFullYear() && props.currentMonth === now.getMonth() + 1;
});

const isPastMonth = computed(() => {
  if (props.currentYear < now.getFullYear()) return true;
  if (props.currentYear === now.getFullYear() && props.currentMonth < now.getMonth() + 1) return true;
  return false;
});

const daysInMonth = computed(() => {
  return new Date(props.currentYear, props.currentMonth, 0).getDate();
});

// Sisa hari termasuk hari ini jika bulan berjalan
const remainingDays = computed(() => {
  if (isPastMonth.value) return 0;
  if (!isCurrentMonth.value) return daysInMonth.value;
  return Math.max(1, daysInMonth.value - now.getDate() + 1);
});

// --- PERHITUNGAN ANGGARAN ---
// 1. Pos Keinginan & Gaya Hidup (Wants)
const budgetWants = computed(() => BigInt(props.monthlyReport?.budgetWants || '0'));
const wantsExpense = computed(() => BigInt(props.monthlyReport?.wantsExpense || '0'));
const remainingWants = computed(() => {
  return budgetWants.value > wantsExpense.value ? budgetWants.value - wantsExpense.value : 0n;
});
const isWantsOverbudget = computed(() => wantsExpense.value > budgetWants.value);

// 2. Total Belanja (Needs + Wants)
const budgetTotal = computed(() => {
  return BigInt(props.monthlyReport?.budgetNeeds || '0') + BigInt(props.monthlyReport?.budgetWants || '0');
});
const expenseTotal = computed(() => {
  return BigInt(props.monthlyReport?.needsExpense || '0') + BigInt(props.monthlyReport?.wantsExpense || '0');
});
const remainingTotal = computed(() => {
  return budgetTotal.value > expenseTotal.value ? budgetTotal.value - expenseTotal.value : 0n;
});
const isTotalOverbudget = computed(() => expenseTotal.value > budgetTotal.value);

// Sisa Anggaran Aktif Berdasarkan Mode
const activeRemainingBudget = computed(() => {
  return mode.value === 'WANTS' ? remainingWants.value : remainingTotal.value;
});

const isOverbudget = computed(() => {
  return mode.value === 'WANTS' ? isWantsOverbudget.value : isTotalOverbudget.value;
});

// Kuota Harian (Safe-to-Spend per Day)
const dailyQuota = computed(() => {
  if (remainingDays.value <= 0 || activeRemainingBudget.value <= 0n) return 0n;
  return activeRemainingBudget.value / BigInt(remainingDays.value);
});

// --- REALISASI BELANJA HARI INI ---
const todayTransactions = computed(() => {
  if (!props.transactions) return [];
  return props.transactions.filter(
    (t) =>
      (t.typeSnapshot === 'EXPENSE' || t.category?.type === 'expense') &&
      t.status !== 'CANCELLED' &&
      t.date?.slice(0, 10) === todayStr,
  );
});

const spentToday = computed(() => {
  if (mode.value === 'WANTS') {
    return todayTransactions.value
      .filter((t) => t.groupSnapshot === 'WANT' || t.category?.group === 'WANT')
      .reduce((sum, t) => sum + BigInt(t.amount || 0), 0n);
  }
  return todayTransactions.value.reduce((sum, t) => sum + BigInt(t.amount || 0), 0n);
});

// Sisa Jatah Belanja Hari Ini
const remainingToday = computed(() => {
  return dailyQuota.value - spentToday.value;
});

const isSpentOverToday = computed(() => spentToday.value > dailyQuota.value && dailyQuota.value > 0n);
const spendingScopeLabel = computed(() => mode.value === 'WANTS' ? 'Keinginan' : 'Semua Pengeluaran');

// Progress Pemakaian Kuota Hari Ini (%)
const progressToday = computed(() => {
  if (dailyQuota.value <= 0n) {
    return spentToday.value > 0n ? 100 : 0;
  }
  const pct = Math.round((Number(spentToday.value) / Number(dailyQuota.value)) * 100);
  return Math.min(100, Math.max(0, pct));
});

// Status Label & Warna
const statusBadge = computed(() => {
  if (isPastMonth.value) {
    return {
      text: 'Periode lampau',
      bgClass: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700',
      dotClass: 'bg-slate-400',
    };
  }
  if (!isCurrentMonth.value) {
    return {
      text: 'Perkiraan',
      bgClass: 'bg-blue-50 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200 dark:border-blue-900/50',
      dotClass: 'bg-blue-500',
    };
  }
  if (isOverbudget.value || activeRemainingBudget.value <= 0n) {
    return {
      text: `Anggaran ${spendingScopeLabel.value} Habis`,
      bgClass: 'bg-rose-50 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-900/50',
      dotClass: 'bg-rose-500',
    };
  }
  if (isSpentOverToday.value) {
    return {
      text: `Melebihi Batas ${mode.value === 'WANTS' ? 'Keinginan' : 'Belanja'}`,
      bgClass: 'bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-900/50',
      dotClass: 'bg-amber-500',
    };
  }
  if (progressToday.value >= 80) {
    return {
      text: `Mendekati Batas ${mode.value === 'WANTS' ? 'Keinginan' : 'Belanja'}`,
      bgClass: 'bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-900/50',
      dotClass: 'bg-amber-500',
    };
  }
  return {
    text: `Aman untuk ${spendingScopeLabel.value}`,
    bgClass: 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/50',
    dotClass: 'bg-emerald-500',
  };
});
</script>

<template>
  <div
    class="rounded-2xl p-4 sm:p-5 bg-slate-50/80 dark:bg-[#070B14] border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3"
    aria-labelledby="daily-spending-title"
  >
    <div class="flex flex-col gap-3 border-b border-slate-200/80 pb-3 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
      <div class="flex items-center gap-2.5">
        <div class="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 shadow-2xs border border-blue-200/60 dark:border-blue-900/50">
          <Sparkles class="w-4 h-4" :stroke-width="2.2" />
        </div>
        <div>
          <div class="flex items-center gap-2 flex-wrap">
            <h3 id="daily-spending-title" class="text-sm font-extrabold text-[#0B192C] dark:text-[#F8FAFC] tracking-tight">Batas belanja harian</h3>
            <span
              class="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-bold tabular-nums"
              :class="statusBadge.bgClass"
            >
              <span class="w-1.5 h-1.5 rounded-full shrink-0" :class="statusBadge.dotClass"></span>
              {{ statusBadge.text }}
            </span>
          </div>
          <p class="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            {{ mode === 'WANTS'
              ? 'Saran batas untuk Keinginan berdasarkan sisa anggaran bulan ini.'
              : 'Saran batas untuk semua pengeluaran berdasarkan sisa anggaran bulan ini.' }}
          </p>
        </div>
      </div>

      <div class="flex w-fit items-center gap-1 self-start rounded-xl border border-slate-200/80 bg-slate-200/70 p-1 dark:border-slate-700 dark:bg-[#0D1524]" role="group" aria-label="Jenis batas belanja">
        <button
          type="button"
          @click="mode = 'WANTS'"
          :aria-pressed="mode === 'WANTS'"
          class="tactile-btn flex min-h-9 cursor-pointer items-center gap-1.5 rounded-lg px-2.5 text-xs font-bold transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B192C]"
          :class="mode === 'WANTS' ? 'bg-white dark:bg-slate-800 text-[#0B192C] dark:text-white shadow-2xs' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'"
        >
          <Coffee class="h-3.5 w-3.5" aria-hidden="true" />
          <span>Keinginan</span>
        </button>
        <button
          type="button"
          @click="mode = 'ALL'"
          :aria-pressed="mode === 'ALL'"
          class="tactile-btn flex min-h-9 cursor-pointer items-center gap-1.5 rounded-lg px-2.5 text-xs font-bold transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B192C]"
          :class="mode === 'ALL' ? 'bg-white dark:bg-slate-800 text-[#0B192C] dark:text-white shadow-2xs' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'"
        >
          <ShoppingBag class="h-3.5 w-3.5" aria-hidden="true" />
          <span>Semua pengeluaran</span>
        </button>
      </div>
    </div>

    <div class="space-y-4">
      <div class="space-y-1">
        <span class="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
          <Clock class="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" aria-hidden="true" />
          <span>{{ isPastMonth ? 'Ringkasan bulan lampau' : isCurrentMonth ? 'Batas yang disarankan per hari' : 'Perkiraan batas per hari' }}</span>
        </span>
        <div v-if="isPastMonth" class="text-sm font-semibold text-slate-600 dark:text-slate-300">
          Bulan yang dipilih sudah berlalu.
        </div>
        <div v-else class="flex items-baseline gap-2">
          <span class="text-3xl font-extrabold tracking-tight text-[#0B192C] dark:text-[#F8FAFC] tabular-nums sm:text-4xl">
            {{ formatRupiah(dailyQuota) }}
          </span>
        </div>
      </div>

      <div v-if="isCurrentMonth" class="space-y-2 border-t border-slate-200/80 pt-3 dark:border-slate-800">
        <div class="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 text-xs">
          <span class="font-semibold text-slate-700 dark:text-slate-300">
            {{ mode === 'WANTS' ? 'Pengeluaran keinginan hari ini' : 'Semua pengeluaran hari ini' }}
          </span>
          <span class="font-bold tabular-nums text-[#0B192C] dark:text-[#F8FAFC]">
            {{ formatRupiah(spentToday) }}
            <span class="font-medium text-slate-400 dark:text-slate-500">dari {{ formatRupiah(dailyQuota) }}</span>
          </span>
        </div>

        <div
          class="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800"
          role="progressbar"
          :aria-label="`${mode === 'WANTS' ? 'Pengeluaran keinginan' : 'Semua pengeluaran'}, ${progressToday}% dari batas harian`"
          aria-valuemin="0"
          aria-valuemax="100"
          :aria-valuenow="progressToday"
        >
          <div
            class="h-full rounded-full transition-[width] duration-300"
            :class="isSpentOverToday ? 'bg-amber-500' : progressToday >= 80 ? 'bg-amber-400' : 'bg-blue-600 dark:bg-blue-500'"
            :style="{ width: `${progressToday}%` }"
          ></div>
        </div>
        <div class="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-[11px] text-slate-500 dark:text-slate-400">
          <span>{{ isSpentOverToday ? 'Melebihi batas harian' : `${progressToday}% batas terpakai` }}</span>
          <span v-if="!isSpentOverToday && dailyQuota > 0n" class="font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
            Sisa hari ini {{ formatRupiah(remainingToday) }}
          </span>
          <span v-else-if="isSpentOverToday" class="font-semibold tabular-nums text-amber-600 dark:text-amber-400">
            Lebih {{ formatRupiah(spentToday - dailyQuota) }}
          </span>
        </div>
      </div>

      <details class="border-t border-slate-200/80 pt-2 text-xs dark:border-slate-800">
        <summary class="min-h-9 cursor-pointer py-2 font-semibold text-blue-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:text-blue-400">
          Cara hitung dan sisa anggaran
        </summary>
        <div class="space-y-3 pb-1 text-slate-600 dark:text-slate-400">
          <p v-if="isCurrentMonth" class="leading-relaxed">
            Batas harian dihitung dari sisa anggaran {{ mode === 'WANTS' ? 'keinginan' : 'belanja' }} dibagi {{ remainingDays }} hari tersisa, termasuk hari ini.
          </p>
          <p v-else-if="isPastMonth" class="leading-relaxed">
            Ini ringkasan arsip bulan lalu. Bulan tersebut memiliki {{ daysInMonth }} hari dan tidak menghitung jatah hari ini.
          </p>
          <p v-else class="leading-relaxed">
            Ini perkiraan untuk bulan mendatang berdasarkan sisa anggaran dan {{ daysInMonth }} hari dalam bulan tersebut.
          </p>
          <div class="flex flex-wrap gap-x-5 gap-y-2 tabular-nums">
            <span>Sisa anggaran: <strong class="text-[#0B192C] dark:text-[#F8FAFC]">{{ formatRupiah(activeRemainingBudget) }}</strong></span>
            <span>Hari tersisa: <strong class="text-[#0B192C] dark:text-[#F8FAFC]">{{ remainingDays }}</strong></span>
          </div>
          <p v-if="isSpentOverToday" class="leading-relaxed">
            {{ mode === 'WANTS' ? 'Pengeluaran keinginan hari ini' : 'Semua pengeluaran hari ini' }} melebihi batas. Sisa anggaran yang tersedia dibagi ke hari-hari berikutnya.
          </p>
          <p v-else-if="dailyQuota > 0n" class="leading-relaxed">
            Jika {{ mode === 'WANTS' ? 'pengeluaran keinginan' : 'semua pengeluaran' }} hari ini di bawah batas, sisa anggaran dibagi ke hari-hari berikutnya.
          </p>
          <p v-else class="leading-relaxed">
            Sisa anggaran untuk pilihan ini sudah habis. Kurangi belanja atau tinjau pembagian anggaran.
          </p>
        </div>
      </details>
    </div>
  </div>
</template>
