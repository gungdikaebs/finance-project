<script setup lang="ts">
import { formatRupiah } from '../utils/format';
import type { MonthlyReport, BudgetPolicy } from '../api/services';
import { SlidersHorizontal, AlertCircle, PieChart, ShieldCheck } from 'lucide-vue-next';

defineProps<{
  monthlyReport?: MonthlyReport | null;
  activePolicy?: BudgetPolicy | null;
  currentMonth: number;
  currentYear: number;
  progressNeeds: number;
  progressWants: number;
}>();

const emit = defineEmits<{
  (e: 'openBudgetPolicyModal'): void;
}>();
</script>

<template>
  <div class="fintech-card rounded-2xl p-5 sm:p-6 space-y-5">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-stone-100 pb-4">
      <div>
        <div class="flex items-center gap-2.5">
          <div class="w-7 h-7 rounded-lg bg-emerald-50 text-[#183D2B] flex items-center justify-center">
            <PieChart class="w-4 h-4" :stroke-width="2" />
          </div>
          <h2 class="text-base font-extrabold text-[#18221B]">
            Anggaran Bulan Ini ({{ currentMonth }}/{{ currentYear }})
          </h2>
          <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-stone-100 text-stone-700 border border-stone-200/60 tabular-nums">
            Rasio {{ Math.round((activePolicy?.needsRatio || 5000) / 100) }}/{{ Math.round((activePolicy?.savingsRatio || 3000) / 100) }}/{{ Math.round((activePolicy?.wantsRatio || 2000) / 100) }}
          </span>
        </div>
        <p class="text-xs text-[#5E6961] mt-1 font-normal">
          Batas anggaran terhitung otomatis dari setiap pemasukan aktual yang diterima bulan ini.
        </p>
      </div>

      <button
        type="button"
        @click="emit('openBudgetPolicyModal')"
        class="tactile-btn self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#183D2B] bg-[#B8DF38]/25 hover:bg-[#B8DF38]/40 border border-[#B8DF38]/60 rounded-xl cursor-pointer"
      >
        <SlidersHorizontal class="w-3.5 h-3.5 text-[#183D2B]" :stroke-width="2" />
        <span>Ubah Rasio</span>
      </button>
    </div>

    <!-- Peringatan Penggunaan Saldo Lama -->
    <div
      v-if="monthlyReport && BigInt(monthlyReport.consumedPreviousBalance || 0) > 0n"
      class="p-4 bg-amber-50/90 border border-amber-200/80 rounded-xl text-xs text-amber-900 flex items-start gap-3 shadow-xs"
    >
      <AlertCircle class="w-5 h-5 text-amber-600 shrink-0 mt-0.5" :stroke-width="2" />
      <div>
        <span class="font-bold text-amber-900 block text-xs">Peringatan: Menggunakan Saldo Bulan Lalu</span>
        <p class="mt-0.5 text-amber-800 leading-relaxed font-normal">
          Total pengeluaran bulan ini ({{ formatRupiah(monthlyReport.expense) }}) melampaui pemasukan baru yang diterima bulan ini ({{ formatRupiah(monthlyReport.income) }}). Saldo lama yang terpakai adalah <strong class="font-bold tabular-nums">{{ formatRupiah(monthlyReport.consumedPreviousBalance) }}</strong>.
        </p>
      </div>
    </div>

    <!-- 3-Column Budget Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1">
      <!-- Kebutuhan (Need) -->
      <div class="p-4 rounded-xl border border-stone-200/70 bg-stone-50/70 space-y-3">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-stone-700">Kebutuhan Pokok</span>
          <span
            v-if="Number(monthlyReport?.needsExpense || 0) > Number(monthlyReport?.budgetNeeds || 0)"
            class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-200 tabular-nums"
          >
            Lebih {{ formatRupiah(BigInt(monthlyReport?.needsExpense || 0) - BigInt(monthlyReport?.budgetNeeds || 0)) }}
          </span>
          <span v-else class="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-stone-200/70 text-stone-700 tabular-nums">
            Sisa {{ formatRupiah(BigInt(monthlyReport?.budgetNeeds || 0) - BigInt(monthlyReport?.needsExpense || 0)) }}
          </span>
        </div>

        <div class="flex items-baseline justify-between">
          <span class="text-base font-black text-[#18221B] tabular-nums">
            {{ formatRupiah(monthlyReport?.needsExpense) }}
          </span>
          <span class="text-xs font-medium text-stone-500 tabular-nums">
            dari {{ formatRupiah(monthlyReport?.budgetNeeds) }}
          </span>
        </div>

        <!-- Progress Bar -->
        <div class="w-full bg-stone-200/80 rounded-full h-2.5 overflow-hidden">
          <div
            class="h-2.5 rounded-full transition-all duration-300"
            :class="progressNeeds > 100 ? 'bg-rose-500' : progressNeeds > 80 ? 'bg-amber-500' : 'bg-emerald-600'"
            :style="{ width: `${Math.min(100, progressNeeds)}%` }"
          ></div>
        </div>
        <p class="text-[10px] text-stone-500 text-right font-semibold tabular-nums">{{ progressNeeds }}% terpakai</p>
      </div>

      <!-- Keinginan (Want) -->
      <div class="p-4 rounded-xl border border-stone-200/70 bg-stone-50/70 space-y-3">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-stone-700">Keinginan & Gaya Hidup</span>
          <span
            v-if="Number(monthlyReport?.wantsExpense || 0) > Number(monthlyReport?.budgetWants || 0)"
            class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-200 tabular-nums"
          >
            Lebih {{ formatRupiah(BigInt(monthlyReport?.wantsExpense || 0) - BigInt(monthlyReport?.budgetWants || 0)) }}
          </span>
          <span v-else class="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-stone-200/70 text-stone-700 tabular-nums">
            Sisa {{ formatRupiah(BigInt(monthlyReport?.budgetWants || 0) - BigInt(monthlyReport?.wantsExpense || 0)) }}
          </span>
        </div>

        <div class="flex items-baseline justify-between">
          <span class="text-base font-black text-[#18221B] tabular-nums">
            {{ formatRupiah(monthlyReport?.wantsExpense) }}
          </span>
          <span class="text-xs font-medium text-stone-500 tabular-nums">
            dari {{ formatRupiah(monthlyReport?.budgetWants) }}
          </span>
        </div>

        <!-- Progress Bar -->
        <div class="w-full bg-stone-200/80 rounded-full h-2.5 overflow-hidden">
          <div
            class="h-2.5 rounded-full transition-all duration-300"
            :class="progressWants > 100 ? 'bg-rose-500' : progressWants > 80 ? 'bg-amber-500' : 'bg-blue-600'"
            :style="{ width: `${Math.min(100, progressWants)}%` }"
          ></div>
        </div>
        <p class="text-[10px] text-stone-500 text-right font-semibold tabular-nums">{{ progressWants }}% terpakai</p>
      </div>

      <!-- Tabungan Terbentuk (Savings) -->
      <div class="p-4 rounded-xl border border-emerald-900/10 bg-[#183D2B]/5 space-y-3">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-[#183D2B] flex items-center gap-1">
            <ShieldCheck class="w-3.5 h-3.5 text-[#183D2B]" :stroke-width="2" />
            <span>Tabungan Terbentuk</span>
          </span>
          <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#183D2B]/10 text-[#183D2B]">
            Otomatis
          </span>
        </div>

        <div class="flex items-baseline justify-between">
          <span class="font-black text-[#183D2B] text-base sm:text-lg tabular-nums">
            {{ formatRupiah(monthlyReport?.budgetSavings) }}
          </span>
        </div>

        <p class="text-[11px] text-[#5E6961] leading-relaxed font-normal">
          Porsi tabungan dari pemasukan yang siap disisihkan ke Dana Pengaman dan Target Impian.
        </p>
      </div>
    </div>
  </div>
</template>
