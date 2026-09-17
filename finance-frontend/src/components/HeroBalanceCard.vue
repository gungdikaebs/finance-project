<script setup lang="ts">
import { formatRupiah } from '../utils/format';
import type { ReportSummary, AllocationStatus } from '../api/services';

defineProps<{
  summary?: ReportSummary | null;
  allocationStatus?: AllocationStatus | null;
}>();

const emit = defineEmits<{
  (e: 'openIncome'): void;
  (e: 'openExpense'): void;
  (e: 'openSave'): void;
  (e: 'openRelease'): void;
}>();
</script>

<template>
  <div class="bg-[#183D2B] text-white rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
    <div class="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
      <div>
        <div class="flex items-center space-x-2 mb-1">
          <span class="text-xs font-semibold uppercase tracking-wider text-gray-300">Saldo Utama Gabungan</span>
          <span class="inline-block w-2 h-2 rounded-full bg-[#B8DF38]"></span>
        </div>
        <div class="text-3xl sm:text-4xl font-black text-white tracking-tight">
          {{ formatRupiah(summary?.mainBalance) }}
        </div>
        <p class="text-xs text-gray-300 mt-1">
          Total uang riil aktual tanpa memandang lokasi rekening/tunai.
        </p>

        <!-- Breakdown Saldo Awal, Tersisih, & Belum Disisihkan -->
        <div class="grid grid-cols-3 gap-3 mt-6 pt-4 border-t border-white/15 max-w-lg">
          <div>
            <span class="text-[11px] text-gray-300 block">Belum Disisihkan (Bebas)</span>
            <span class="text-base font-bold text-[#B8DF38]">{{ formatRupiah(summary?.unallocatedMoney) }}</span>
          </div>
          <div>
            <span class="text-[11px] text-gray-300 block">Dana Tersisih (Tabungan)</span>
            <span class="text-base font-bold text-white">
              {{ formatRupiah(summary?.totalAllocatedSavings || allocationStatus?.totalAllocated) }}
            </span>
          </div>
          <div>
            <span class="text-[11px] text-gray-300 block">Saldo Awal Terdaftar</span>
            <span class="text-base font-bold text-gray-200">{{ formatRupiah(summary?.initialBalance) }}</span>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex flex-col sm:flex-row flex-wrap gap-2.5">
        <button
          @click="emit('openIncome')"
          class="px-4 py-2.5 rounded-xl bg-[#B8DF38] hover:bg-[#a3c82e] text-[#183D2B] font-bold text-xs shadow-sm transition flex items-center justify-center space-x-1 cursor-pointer"
        >
          <span>+ Pemasukan</span>
        </button>
        <button
          @click="emit('openExpense')"
          class="px-4 py-2.5 rounded-xl bg-white hover:bg-gray-100 text-[#183D2B] font-bold text-xs shadow-sm transition flex items-center justify-center space-x-1 cursor-pointer"
        >
          <span>- Pengeluaran</span>
        </button>
        <button
          @click="emit('openSave')"
          class="px-4 py-2.5 rounded-xl bg-emerald-700/80 hover:bg-emerald-600 text-white font-bold text-xs border border-emerald-500/40 shadow-sm transition flex items-center justify-center space-x-1 cursor-pointer"
        >
          <span>💰 Sisihkan Tabungan</span>
        </button>
        <button
          @click="emit('openRelease')"
          class="px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-semibold text-xs border border-white/20 shadow-sm transition flex items-center justify-center space-x-1 cursor-pointer"
        >
          <span>🔓 Lepas Alokasi</span>
        </button>
      </div>
    </div>
  </div>
</template>
