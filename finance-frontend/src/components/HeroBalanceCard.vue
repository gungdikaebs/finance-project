<script setup lang="ts">
import { computed } from 'vue';
import { formatRupiah } from '../utils/format';
import type { ReportSummary, AllocationStatus, WalletAccount } from '../api/services';
import {
  Plus,
  Minus,
  PiggyBank,
  Wallet,
  Building2,
  Smartphone,
  Banknote,
  TrendingUp,
  ArrowRightLeft,
  SlidersHorizontal,
  ChevronDown,
} from 'lucide-vue-next';

const props = defineProps<{
  summary?: ReportSummary | null;
  allocationStatus?: AllocationStatus | null;
  wallets?: WalletAccount[];
}>();

const hasAllocationShortfall = computed(() => Number(props.summary?.unallocatedMoney ?? 0) < 0);

const emit = defineEmits<{
  (e: 'openIncome'): void;
  (e: 'openExpense'): void;
  (e: 'openSave'): void;
  (e: 'openWallets'): void;
  (e: 'openTransfer'): void;
}>();

const getWalletIcon = (type: string) => {
  switch (type) {
    case 'BANK':
      return Building2;
    case 'E_WALLET':
      return Smartphone;
    case 'CASH':
      return Banknote;
    case 'INVESTMENT':
      return TrendingUp;
    default:
      return Wallet;
  }
};
</script>

<template>
  <div class="relative overflow-hidden rounded-2xl bg-white dark:bg-[#0D1524] text-[#0F172A] dark:text-[#F8FAFC] p-6 sm:p-8 shadow-sm border border-slate-200 dark:border-slate-800 transition-all duration-200">
    <div class="relative z-10 flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
      <!-- Balance Info -->
      <div class="space-y-5 min-w-0 flex-1">
        <div>
          <h2 class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {{ hasAllocationShortfall ? 'Alokasi melebihi saldo' : 'Uang yang bisa dipakai' }}
          </h2>
          <p
            class="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight tabular-nums mt-1.5"
            :class="hasAllocationShortfall ? 'text-rose-600 dark:text-rose-400' : 'text-[#0B192C] dark:text-[#F8FAFC]'"
          >
            {{ formatRupiah(summary?.unallocatedMoney) }}
          </p>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-2 max-w-md leading-relaxed">
            {{ hasAllocationShortfall ? 'Dana yang dialokasikan lebih besar dari saldo total. Tinjau kembali tabungan Anda.' : 'Sisa saldo bebas yang belum dikunci untuk tujuan tabungan atau rencana lain.' }}
          </p>
        </div>

        <div class="max-w-xl border-t border-slate-100 dark:border-slate-800/80 pt-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <span class="text-xs text-slate-500 dark:text-slate-400 block font-medium">Saldo total rekening & dompet</span>
              <span class="text-base sm:text-lg font-bold text-[#0B192C] dark:text-[#F8FAFC] tabular-nums block mt-0.5">
                {{ formatRupiah(summary?.mainBalance) }}
              </span>
            </div>
            <div>
              <span class="text-xs text-slate-500 dark:text-slate-400 block font-medium">Disisihkan untuk tabungan</span>
              <span class="text-base sm:text-lg font-bold text-blue-600 dark:text-blue-400 tabular-nums block mt-0.5">
                {{ formatRupiah(summary?.totalAllocatedSavings ?? allocationStatus?.totalAllocated) }}
              </span>
            </div>
          </div>
        </div>

        <details class="group max-w-xl border-t border-slate-100 dark:border-slate-800/80 pt-3">
          <summary class="flex items-center justify-between gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white cursor-pointer list-none rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B192C] dark:focus-visible:outline-white">
            <span>Cara menghitung saldo</span>
            <ChevronDown class="w-4 h-4 shrink-0 transition-transform group-open:rotate-180 text-slate-400" aria-hidden="true" />
          </summary>
          <div class="pt-4 space-y-4">
            <p class="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Saldo total dikurangi uang yang sudah dialokasikan menjadi uang yang bisa dipakai. Menyisihkan hanya memberi tujuan pada uang; uang fisik tetap aman di rekening atau dompet semula.
            </p>
            <div class="border-t border-slate-100 dark:border-slate-800/60 pt-3">
              <span class="text-xs text-slate-500 dark:text-slate-400 block font-medium">Saldo awal saat mulai menggunakan aplikasi</span>
              <span class="text-sm font-semibold text-[#0B192C] dark:text-[#F8FAFC] tabular-nums block mt-0.5">{{ formatRupiah(summary?.initialBalance) }}</span>
              <p class="text-[11px] text-slate-400 dark:text-slate-500 mt-1">Angka ini sudah termasuk dalam saldo total, bukan uang tambahan.</p>
            </div>
            <div v-if="wallets && wallets.length > 0" class="border-t border-slate-100 dark:border-slate-800/60 pt-3">
              <div class="flex items-center justify-between gap-2 mb-2">
                <span class="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Wallet class="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  Rekening & dompet ({{ wallets.length }})
                </span>
                <div class="flex items-center gap-1.5">
                  <button
                    type="button"
                    @click="emit('openTransfer')"
                    class="tactile-btn inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 cursor-pointer"
                  >
                    <ArrowRightLeft class="w-3 h-3 text-blue-600 dark:text-blue-400" />
                    <span>Pindah Dana</span>
                  </button>
                  <button
                    type="button"
                    @click="emit('openWallets')"
                    class="tactile-btn inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 cursor-pointer"
                  >
                    <SlidersHorizontal class="w-3 h-3 text-slate-500" />
                    <span>Kelola</span>
                  </button>
                </div>
              </div>
              <div class="flex items-center gap-2 overflow-x-auto pb-1">
                <div
                  v-for="w in wallets"
                  :key="w.id"
                  class="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 shrink-0"
                >
                  <component :is="getWalletIcon(w.type)" class="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span class="text-xs font-semibold text-slate-700 dark:text-slate-300">{{ w.name }}</span>
                  <span class="text-xs font-extrabold text-[#0B192C] dark:text-[#F8FAFC] tabular-nums">{{ formatRupiah(w.balance) }}</span>
                </div>
              </div>
            </div>
          </div>
        </details>
      </div>

      <!-- Quick Action Buttons -->
      <div class="flex flex-col sm:flex-row lg:flex-col gap-2.5 min-w-[200px] shrink-0">
        <div class="grid grid-cols-2 gap-2">
          <button
            type="button"
            @click="emit('openIncome')"
            data-focus-return="create-income"
            class="tactile-btn inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#0B192C] hover:bg-[#172B45] text-white font-bold text-xs shadow-xs cursor-pointer select-none dark:bg-white dark:text-[#0B192C] dark:hover:bg-slate-100"
          >
            <Plus class="w-4 h-4 text-white dark:text-[#0B192C]" :stroke-width="2.5" />
            <span>Pemasukan</span>
          </button>

          <button
            type="button"
            @click="emit('openExpense')"
            data-focus-return="create-expense"
            class="tactile-btn inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs border border-slate-200/80 cursor-pointer select-none dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-700"
          >
            <Minus class="w-4 h-4 text-slate-700 dark:text-slate-300" :stroke-width="2.5" />
            <span>Pengeluaran</span>
          </button>
        </div>

        <button
          type="button"
          @click="emit('openSave')"
          class="tactile-btn inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs cursor-pointer select-none dark:bg-blue-600 dark:hover:bg-blue-500"
        >
          <PiggyBank class="w-4 h-4 text-white" :stroke-width="2" />
          <span>Sisihkan ke Tabungan</span>
        </button>
      </div>
    </div>
  </div>
</template>
