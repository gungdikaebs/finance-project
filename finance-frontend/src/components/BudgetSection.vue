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
  <div class="fintech-card rounded-2xl p-5 sm:p-6 space-y-5 bg-white dark:bg-[#16201A] border border-stone-200/90 dark:border-[#243329] transition-colors">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-stone-100 dark:border-[#243329] pb-4">
      <div>
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-[#183D2B] dark:text-[#B8DF38] flex items-center justify-center shrink-0 border border-emerald-100 dark:border-emerald-800/50">
            <PieChart class="w-4 h-4" :stroke-width="2" />
          </div>
          <h2 class="text-base font-extrabold text-[#18221B] dark:text-[#F0F4F1] tracking-tight">Alokasi Anggaran Bulanan</h2>
        </div>
        <p class="text-xs text-stone-500 dark:text-[#98A79D] mt-1 font-normal">
          {{ monthlyBudgetTotal > 0n ? 'Porsi anggaran dari pemasukan bulan ini:' : 'Rasio umum:' }}
          <span class="font-bold text-[#183D2B] dark:text-[#B8DF38]">
            {{ budgetShares.needs }} Kebutuhan · {{ budgetShares.savings }} Tabungan · {{ budgetShares.wants }} Keinginan
          </span>
        </p>
      </div>

      <!-- Tombol Ubah Rasio Kebijakan Anggaran (Tahap 2) -->
      <button
        type="button"
        @click="emit('openBudgetPolicyModal')"
        class="tactile-btn self-start sm:self-auto inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-stone-100 dark:bg-[#0E1410] hover:bg-stone-200 dark:hover:bg-[#243329] text-[#18221B] dark:text-[#F0F4F1] border border-stone-200/80 dark:border-[#243329] cursor-pointer transition shadow-2xs"
        aria-label="Atur rasio pembagian anggaran"
      >
        <SlidersHorizontal class="w-3.5 h-3.5 text-[#183D2B] dark:text-[#0E1410]" :stroke-width="2" />
        <span>Ubah Rasio</span>
      </button>
    </div>

    <!-- Arus Kas Didukung Saldo Berjalan (UX-02) -->
    <div
      v-if="monthlyReport && BigInt(monthlyReport.consumedPreviousBalance || 0) > 0n"
      class="p-4 bg-blue-50/80 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/40 rounded-xl text-xs text-blue-800 dark:text-blue-200 flex items-start gap-3 shadow-xs"
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
      <div class="p-4 rounded-xl border border-stone-200/70 dark:border-[#243329] bg-stone-50/70 dark:bg-[#0E1410] space-y-3">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-stone-700 dark:text-[#F0F4F1]">Kebutuhan Pokok</span>
          <span
            v-if="Number(monthlyReport?.needsExpense || 0) > Number(monthlyReport?.budgetNeeds || 0)"
            class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/50 tabular-nums"
          >
            Lebih {{ formatRupiah(BigInt(monthlyReport?.needsExpense || 0) - BigInt(monthlyReport?.budgetNeeds || 0)) }}
          </span>
          <span v-else class="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-stone-200/70 dark:bg-[#16201A] text-stone-700 dark:text-[#98A79D] border border-transparent dark:border-[#243329] tabular-nums">
            Sisa {{ formatRupiah(BigInt(monthlyReport?.budgetNeeds || 0) - BigInt(monthlyReport?.needsExpense || 0)) }}
          </span>
        </div>

        <div class="flex items-baseline justify-between">
          <span class="text-base font-black text-[#18221B] dark:text-[#F0F4F1] tabular-nums">
            {{ formatRupiah(monthlyReport?.needsExpense) }}
          </span>
          <span class="text-xs font-medium text-stone-500 dark:text-[#98A79D] tabular-nums">
            dari {{ formatRupiah(monthlyReport?.budgetNeeds) }}
          </span>
        </div>

        <!-- Progress Bar -->
        <div class="w-full bg-stone-200/80 dark:bg-[#16201A] rounded-full h-2.5 overflow-hidden">
          <div
            class="h-2.5 rounded-full transition-all duration-300"
            :class="progressNeeds > 100 ? 'bg-rose-500' : progressNeeds > 80 ? 'bg-amber-500' : 'bg-emerald-600'"
            :style="{ width: `${Math.min(100, progressNeeds)}%` }"
          ></div>
        </div>
        <p class="text-[10px] text-stone-500 dark:text-[#98A79D] text-right font-semibold tabular-nums">{{ progressNeeds }}% terpakai</p>
      </div>

      <!-- Keinginan (Want) -->
      <div class="p-4 rounded-xl border border-stone-200/70 dark:border-[#243329] bg-stone-50/70 dark:bg-[#0E1410] space-y-3">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-stone-700 dark:text-[#F0F4F1]">Keinginan & Gaya Hidup</span>
          <span
            v-if="Number(monthlyReport?.wantsExpense || 0) > Number(monthlyReport?.budgetWants || 0)"
            class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/50 tabular-nums"
          >
            Lebih {{ formatRupiah(BigInt(monthlyReport?.wantsExpense || 0) - BigInt(monthlyReport?.budgetWants || 0)) }}
          </span>
          <span v-else class="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-stone-200/70 dark:bg-[#16201A] text-stone-700 dark:text-[#98A79D] border border-transparent dark:border-[#243329] tabular-nums">
            Sisa {{ formatRupiah(BigInt(monthlyReport?.budgetWants || 0) - BigInt(monthlyReport?.wantsExpense || 0)) }}
          </span>
        </div>

        <div class="flex items-baseline justify-between">
          <span class="text-base font-black text-[#18221B] dark:text-[#F0F4F1] tabular-nums">
            {{ formatRupiah(monthlyReport?.wantsExpense) }}
          </span>
          <span class="text-xs font-medium text-stone-500 dark:text-[#98A79D] tabular-nums">
            dari {{ formatRupiah(monthlyReport?.budgetWants) }}
          </span>
        </div>

        <!-- Progress Bar -->
        <div class="w-full bg-stone-200/80 dark:bg-[#16201A] rounded-full h-2.5 overflow-hidden">
          <div
            class="h-2.5 rounded-full transition-all duration-300"
            :class="progressWants > 100 ? 'bg-rose-500' : progressWants > 80 ? 'bg-amber-500' : 'bg-blue-600'"
            :style="{ width: `${Math.min(100, progressWants)}%` }"
          ></div>
        </div>
        <p class="text-[10px] text-stone-500 dark:text-[#98A79D] text-right font-semibold tabular-nums">{{ progressWants }}% terpakai</p>
      </div>

      <!-- Target dan realisasi tabungan bulan ini -->
      <div class="p-4 rounded-xl border border-emerald-900/10 dark:border-[#243329] bg-[#183D2B]/5 dark:bg-[#132E21]/30 space-y-3">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-[#183D2B] dark:text-[#B8DF38] flex items-center gap-1">
            <ShieldCheck class="w-3.5 h-3.5 text-[#183D2B] dark:text-[#B8DF38]" :stroke-width="2" />
            <span>Tabungan Bulan Ini</span>
          </span>
          <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#183D2B]/10 dark:bg-[#B8DF38]/15 text-[#183D2B] dark:text-[#B8DF38]">
            Rencana
          </span>
        </div>

        <div>
          <p class="text-[11px] text-[#5E6961] dark:text-[#98A79D]">Target dari pemasukan bulan ini</p>
          <span class="font-black text-[#183D2B] dark:text-[#B8DF38] text-base sm:text-lg tabular-nums">
            {{ formatRupiah(savingsTarget) }}
          </span>
        </div>

        <div class="border-t border-emerald-900/10 dark:border-[#243329] pt-2 space-y-1 text-[11px]">
          <div class="flex items-baseline justify-between gap-2">
            <span class="text-[#5E6961] dark:text-[#98A79D]">Sudah disisihkan bulan ini</span>
            <span class="font-bold text-[#18221B] dark:text-[#F0F4F1] tabular-nums">{{ formatRupiah(savingsAllocated) }}</span>
          </div>
          <div v-if="savingsTarget > 0n" class="flex items-baseline justify-between gap-2">
            <span class="text-[#5E6961] dark:text-[#98A79D]">{{ savingsRemaining > 0n ? 'Masih perlu disisihkan' : 'Target bulan ini tercapai' }}</span>
            <span v-if="savingsRemaining > 0n" class="font-bold text-[#18221B] dark:text-[#F0F4F1] tabular-nums">{{ formatRupiah(savingsRemaining) }}</span>
          </div>
        </div>

        <p class="text-[11px] text-[#5E6961] dark:text-[#98A79D] leading-relaxed font-normal">
          Buka Tabungan, lalu pilih “Sisihkan ke Tabungan” untuk menyimpan uang.
        </p>
        <details class="group border-t border-emerald-900/10 dark:border-[#243329] pt-2 text-[11px]">
          <summary class="cursor-pointer list-none font-semibold text-[#183D2B] dark:text-[#B8DF38] underline decoration-dotted underline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 dark:focus-visible:outline-[#B8DF38]">
            Bagaimana angka tabungan dihitung?
          </summary>
          <p class="mt-2 leading-relaxed text-[#5E6961] dark:text-[#98A79D]">
            Jumlah “Sudah disisihkan” adalah tabungan bulan ini setelah dikurangi dana yang ditarik kembali.
          </p>
        </details>
      </div>
    </div>
  </div>
</template>
