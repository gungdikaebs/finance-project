<script setup lang="ts">
import { computed } from 'vue';
import { formatPercentageShare, formatRupiah } from '../utils/format';
import type { MonthlyReport, BudgetPolicy, Transaction } from '../api/services';
import { SlidersHorizontal, Info, PieChart, ShieldCheck } from 'lucide-vue-next';
import SafeToSpendCard from './SafeToSpendCard.vue';

const props = defineProps<{
  monthlyReport?: MonthlyReport | null;
  activePolicy?: BudgetPolicy | null;
  allocatedSavingsThisMonth?: string | null;
  currentMonth: number;
  currentYear: number;
  progressNeeds: number;
  progressWants: number;
  transactions?: Transaction[];
}>();

const savingsTarget = computed(() => BigInt(props.monthlyReport?.budgetSavings || '0'));
const savingsAllocated = computed(() => BigInt(props.allocatedSavingsThisMonth || '0'));
const savingsRemaining = computed(() =>
  savingsTarget.value > savingsAllocated.value
    ? savingsTarget.value - savingsAllocated.value
    : 0n
);
const monthlyBudgetTotal = computed(() =>
  BigInt(props.monthlyReport?.budgetNeeds || '0') +
  BigInt(props.monthlyReport?.budgetSavings || '0') +
  BigInt(props.monthlyReport?.budgetWants || '0')
);
const budgetShares = computed(() => {
  if (monthlyBudgetTotal.value > 0n) {
    return {
      needs: formatPercentageShare(props.monthlyReport?.budgetNeeds || '0', monthlyBudgetTotal.value),
      savings: formatPercentageShare(props.monthlyReport?.budgetSavings || '0', monthlyBudgetTotal.value),
      wants: formatPercentageShare(props.monthlyReport?.budgetWants || '0', monthlyBudgetTotal.value),
    };
  }
  return {
    needs: `${(props.activePolicy?.needsRatio ?? 5000) / 100}%`,
    savings: `${(props.activePolicy?.savingsRatio ?? 3000) / 100}%`,
    wants: `${(props.activePolicy?.wantsRatio ?? 2000) / 100}%`,
  };
});

const emit = defineEmits<{
  (e: 'openBudgetPolicyModal'): void;
}>();
</script>

<template>
  <div class="fintech-card rounded-2xl p-5 sm:p-6 space-y-5 bg-white dark:bg-[#0D1524] border border-slate-200 dark:border-slate-800 transition-colors">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
      <div>
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-200/60 dark:border-blue-900/50 shadow-2xs">
            <PieChart class="w-4 h-4" :stroke-width="2" />
          </div>
          <h2 class="text-base font-extrabold text-[#0B192C] dark:text-[#F8FAFC] tracking-tight">Alokasi Anggaran Bulanan</h2>
        </div>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 font-normal">
          {{ monthlyBudgetTotal > 0n ? 'Porsi anggaran dari pemasukan bulan ini:' : 'Rasio acuan:' }}
          <span class="font-bold text-blue-600 dark:text-blue-400">
            {{ budgetShares.needs }} Kebutuhan · {{ budgetShares.savings }} Tabungan · {{ budgetShares.wants }} Keinginan
          </span>
        </p>
      </div>

      <!-- Tombol Ubah Rasio Kebijakan Anggaran -->
      <button
        type="button"
        @click="emit('openBudgetPolicyModal')"
        class="tactile-btn self-start sm:self-auto inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700 cursor-pointer transition shadow-2xs"
        aria-label="Atur rasio pembagian anggaran"
      >
        <SlidersHorizontal class="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" :stroke-width="2" />
        <span>Ubah Rasio</span>
      </button>
    </div>

    <!-- Arus Kas Didukung Saldo Berjalan -->
    <div
      v-if="monthlyReport && BigInt(monthlyReport.consumedPreviousBalance || 0) > 0n"
      class="p-4 bg-blue-50/80 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/40 rounded-xl text-xs text-blue-800 dark:text-blue-200 flex items-start gap-3 shadow-2xs"
    >
      <Info class="w-5 h-5 text-blue-500 dark:text-blue-400 shrink-0 mt-0.5" :stroke-width="2" />
      <div>
        <span class="font-bold text-blue-900 dark:text-blue-100 block text-xs">
          Arus kas didukung saldo berjalan
        </span>
        <p class="mt-0.5 text-blue-700 dark:text-blue-300/90 leading-relaxed font-normal">
          Pengeluaran bulan ini sebagian menggunakan sisa saldo dari bulan sebelumnya (<strong class="font-bold tabular-nums text-blue-900 dark:text-blue-100">{{ formatRupiah(monthlyReport.consumedPreviousBalance) }}</strong>). Ini normal dan tidak memengaruhi saldo total Anda.
        </p>
      </div>
    </div>

    <!-- Batas Belanja Harian (Safe-to-Spend Daily) -->
    <SafeToSpendCard
      :monthly-report="monthlyReport"
      :transactions="transactions"
      :current-month="currentMonth"
      :current-year="currentYear"
    />

    <!-- 3-Column Budget Cards -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-3.5 pt-1">
      <!-- Kebutuhan (Need) -->
      <div class="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-[#070B14] space-y-3">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-slate-700 dark:text-slate-300">Kebutuhan Pokok</span>
          <span
            v-if="Number(monthlyReport?.needsExpense || 0) > Number(monthlyReport?.budgetNeeds || 0)"
            class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/50 tabular-nums"
          >
            Lebih {{ formatRupiah(BigInt(monthlyReport?.needsExpense || 0) - BigInt(monthlyReport?.budgetNeeds || 0)) }}
          </span>
          <span v-else class="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 tabular-nums">
            Sisa {{ formatRupiah(BigInt(monthlyReport?.budgetNeeds || 0) - BigInt(monthlyReport?.needsExpense || 0)) }}
          </span>
        </div>

        <div class="flex items-baseline justify-between">
          <span class="text-base font-extrabold text-[#0B192C] dark:text-[#F8FAFC] tabular-nums">
            {{ formatRupiah(monthlyReport?.needsExpense) }}
          </span>
          <span class="text-xs font-medium text-slate-500 dark:text-slate-400 tabular-nums">
            dari {{ formatRupiah(monthlyReport?.budgetNeeds) }}
          </span>
        </div>

        <!-- Progress Bar -->
        <div class="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
          <div
            class="h-2.5 rounded-full transition-all duration-300"
            :class="progressNeeds > 100 ? 'bg-rose-500' : progressNeeds > 80 ? 'bg-amber-500' : 'bg-blue-600 dark:bg-blue-500'"
            :style="{ width: `${Math.min(100, progressNeeds)}%` }"
          ></div>
        </div>
        <p class="text-[10px] text-slate-500 dark:text-slate-400 text-right font-semibold tabular-nums">{{ progressNeeds }}% terpakai</p>
      </div>

      <!-- Keinginan (Want) -->
      <div class="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-[#070B14] space-y-3">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-slate-700 dark:text-slate-300">Keinginan & Gaya Hidup</span>
          <span
            v-if="Number(monthlyReport?.wantsExpense || 0) > Number(monthlyReport?.budgetWants || 0)"
            class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/50 tabular-nums"
          >
            Lebih {{ formatRupiah(BigInt(monthlyReport?.wantsExpense || 0) - BigInt(monthlyReport?.budgetWants || 0)) }}
          </span>
          <span v-else class="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 tabular-nums">
            Sisa {{ formatRupiah(BigInt(monthlyReport?.budgetWants || 0) - BigInt(monthlyReport?.wantsExpense || 0)) }}
          </span>
        </div>

        <div class="flex items-baseline justify-between">
          <span class="text-base font-extrabold text-[#0B192C] dark:text-[#F8FAFC] tabular-nums">
            {{ formatRupiah(monthlyReport?.wantsExpense) }}
          </span>
          <span class="text-xs font-medium text-slate-500 dark:text-slate-400 tabular-nums">
            dari {{ formatRupiah(monthlyReport?.budgetWants) }}
          </span>
        </div>

        <!-- Progress Bar -->
        <div class="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
          <div
            class="h-2.5 rounded-full transition-all duration-300"
            :class="progressWants > 100 ? 'bg-rose-500' : progressWants > 80 ? 'bg-amber-500' : 'bg-blue-600 dark:bg-blue-500'"
            :style="{ width: `${Math.min(100, progressWants)}%` }"
          ></div>
        </div>
        <p class="text-[10px] text-slate-500 dark:text-slate-400 text-right font-semibold tabular-nums">{{ progressWants }}% terpakai</p>
      </div>

      <!-- Target dan realisasi tabungan bulan ini -->
      <div class="p-4 rounded-xl border border-blue-200/60 dark:border-blue-900/40 bg-blue-50/40 dark:bg-blue-950/20 space-y-3">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-[#0B192C] dark:text-[#F8FAFC] flex items-center gap-1.5">
            <ShieldCheck class="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" :stroke-width="2" />
            <span>Tabungan Bulan Ini</span>
          </span>
          <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300">
            Rencana
          </span>
        </div>

        <div>
          <p class="text-[11px] text-slate-500 dark:text-slate-400">Target dari pemasukan bulan ini</p>
          <span class="font-extrabold text-[#0B192C] dark:text-[#F8FAFC] text-base sm:text-lg tabular-nums">
            {{ formatRupiah(savingsTarget) }}
          </span>
        </div>

        <div class="border-t border-blue-200/60 dark:border-blue-900/40 pt-2 space-y-1 text-[11px]">
          <div class="flex items-baseline justify-between gap-2">
            <span class="text-slate-500 dark:text-slate-400">Sudah disisihkan bulan ini</span>
            <span class="font-bold text-[#0B192C] dark:text-[#F8FAFC] tabular-nums">{{ formatRupiah(savingsAllocated) }}</span>
          </div>
          <div v-if="savingsTarget > 0n" class="flex items-baseline justify-between gap-2">
            <span class="text-slate-500 dark:text-slate-400">{{ savingsRemaining > 0n ? 'Masih perlu disisihkan' : 'Target bulan ini tercapai' }}</span>
            <span v-if="savingsRemaining > 0n" class="font-bold text-blue-600 dark:text-blue-400 tabular-nums">{{ formatRupiah(savingsRemaining) }}</span>
          </div>
        </div>

        <p class="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
          Buka Tabungan, lalu pilih "Sisihkan ke Tabungan" untuk menyimpan uang.
        </p>
        <details class="group border-t border-blue-200/60 dark:border-blue-900/40 pt-2 text-[11px]">
          <summary class="cursor-pointer list-none font-semibold text-blue-600 dark:text-blue-400 underline decoration-dotted underline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">
            Bagaimana angka tabungan dihitung?
          </summary>
          <p class="mt-2 leading-relaxed text-slate-600 dark:text-slate-400">
            Jumlah "Sudah disisihkan" adalah tabungan bulan ini setelah dikurangi dana yang ditarik kembali.
          </p>
        </details>
      </div>
    </div>
  </div>
</template>
