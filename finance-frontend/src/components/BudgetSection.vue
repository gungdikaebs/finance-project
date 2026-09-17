<script setup lang="ts">
import { formatRupiah } from '../utils/format';
import type { MonthlyReport, BudgetPolicy } from '../api/services';

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
  <div class="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 shadow-xs space-y-4">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-gray-100 pb-3">
      <div>
        <div class="flex items-center space-x-2">
          <h2 class="text-base font-bold text-[#202820]">Anggaran Bulan Ini ({{ currentMonth }}/{{ currentYear }})</h2>
          <span class="text-xs font-semibold px-2 py-0.5 rounded bg-gray-100 text-gray-700">
            Rasio: {{ Math.round((activePolicy?.needsRatio || 5000) / 100) }}/{{ Math.round((activePolicy?.savingsRatio || 3000) / 100) }}/{{ Math.round((activePolicy?.wantsRatio || 2000) / 100) }}
          </span>
        </div>
        <p class="text-xs text-gray-500 mt-0.5">
          Batas anggaran dihitung otomatis dari setiap pemasukan aktual yang diterima bulan ini.
        </p>
      </div>

      <button
        @click="emit('openBudgetPolicyModal')"
        class="inline-flex items-center text-xs font-semibold text-[#183D2B] bg-[#B8DF38]/30 hover:bg-[#B8DF38]/50 px-3 py-1.5 rounded-lg transition cursor-pointer"
      >
        ⚙ Ubah Rasio Anggaran
      </button>
    </div>

    <!-- Peringatan Penggunaan Saldo Lama (jika pengeluaran > pemasukan bulan ini) -->
    <div
      v-if="monthlyReport && BigInt(monthlyReport.consumedPreviousBalance || 0) > 0n"
      class="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start space-x-2"
    >
      <span class="text-base leading-none">⚠️</span>
      <div>
        <span class="font-bold">Perhatian: Menggunakan Saldo Lama!</span>
        <p class="mt-0.5 text-amber-700">
          Total pengeluaran bulan ini ({{ formatRupiah(monthlyReport.expense) }}) melampaui pemasukan baru yang diterima bulan ini ({{ formatRupiah(monthlyReport.income) }}). Saldo lama terpakai: {{ formatRupiah(monthlyReport.consumedPreviousBalance) }}.
        </p>
      </div>
    </div>

    <!-- Kartu Progress Anggaran: Kebutuhan, Keinginan, Tabungan -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
      <!-- Kebutuhan (Need) -->
      <div class="p-4 rounded-xl border border-gray-100 bg-gray-50/60 space-y-2">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-gray-700">Kebutuhan Pokok</span>
          <span
            v-if="Number(monthlyReport?.needsExpense || 0) > Number(monthlyReport?.budgetNeeds || 0)"
            class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-100 text-red-700"
          >
            Lebih {{ formatRupiah(BigInt(monthlyReport?.needsExpense || 0) - BigInt(monthlyReport?.budgetNeeds || 0)) }}
          </span>
          <span v-else class="text-[10px] font-medium text-gray-500">
            Sisa {{ formatRupiah(BigInt(monthlyReport?.budgetNeeds || 0) - BigInt(monthlyReport?.needsExpense || 0)) }}
          </span>
        </div>
        <div class="flex items-baseline justify-between">
          <span class="text-sm font-bold text-gray-900">{{ formatRupiah(monthlyReport?.needsExpense) }}</span>
          <span class="text-xs text-gray-400">/ {{ formatRupiah(monthlyReport?.budgetNeeds) }}</span>
        </div>

        <!-- Progress Bar -->
        <div class="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            class="h-2 rounded-full transition-all duration-300"
            :class="progressNeeds > 100 ? 'bg-red-500' : progressNeeds > 80 ? 'bg-amber-500' : 'bg-blue-600'"
            :style="{ width: `${Math.min(100, progressNeeds)}%` }"
          ></div>
        </div>
        <p class="text-[10px] text-gray-400 text-right">{{ progressNeeds }}% terpakai</p>
      </div>

      <!-- Keinginan (Want) -->
      <div class="p-4 rounded-xl border border-gray-100 bg-gray-50/60 space-y-2">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-gray-700">Keinginan & Gaya Hidup</span>
          <span
            v-if="Number(monthlyReport?.wantsExpense || 0) > Number(monthlyReport?.budgetWants || 0)"
            class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-100 text-red-700"
          >
            Lebih {{ formatRupiah(BigInt(monthlyReport?.wantsExpense || 0) - BigInt(monthlyReport?.budgetWants || 0)) }}
          </span>
          <span v-else class="text-[10px] font-medium text-gray-500">
            Sisa {{ formatRupiah(BigInt(monthlyReport?.budgetWants || 0) - BigInt(monthlyReport?.wantsExpense || 0)) }}
          </span>
        </div>
        <div class="flex items-baseline justify-between">
          <span class="text-sm font-bold text-gray-900">{{ formatRupiah(monthlyReport?.wantsExpense) }}</span>
          <span class="text-xs text-gray-400">/ {{ formatRupiah(monthlyReport?.budgetWants) }}</span>
        </div>

        <!-- Progress Bar -->
        <div class="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            class="h-2 rounded-full transition-all duration-300"
            :class="progressWants > 100 ? 'bg-red-500' : progressWants > 80 ? 'bg-amber-500' : 'bg-purple-600'"
            :style="{ width: `${Math.min(100, progressWants)}%` }"
          ></div>
        </div>
        <p class="text-[10px] text-gray-400 text-right">{{ progressWants }}% terpakai</p>
      </div>

      <!-- Tabungan Terbentuk (Savings) -->
      <div class="p-4 rounded-xl border border-gray-100 bg-[#183D2B]/5 space-y-2">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-[#183D2B]">Tabungan Terbentuk</span>
          <span class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#183D2B]/10 text-[#183D2B]">
            Otomatis
          </span>
        </div>
        <div class="flex items-baseline justify-between">
          <span class="font-bold text-[#183D2B] text-base">{{ formatRupiah(monthlyReport?.budgetSavings) }}</span>
        </div>
        <p class="text-[11px] text-gray-500 pt-1">
          Porsi yang dialokasikan dari pemasukan untuk Dana Pengaman dan Target Impian.
        </p>
      </div>
    </div>
  </div>
</template>
