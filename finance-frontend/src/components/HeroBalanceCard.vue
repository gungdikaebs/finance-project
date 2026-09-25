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
  <div class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#183D2B] via-[#143425] to-[#0D2218] dark:from-[#132E21] dark:via-[#0F241A] dark:to-[#0A1B13] text-white p-6 sm:p-8 shadow-[0_12px_40px_-10px_rgba(24,61,43,0.35)] dark:shadow-[0_12px_40px_-10px_rgba(0,0,0,0.6)] border border-emerald-800/40 dark:border-[#B8DF38]/30 transition-all duration-200">
    <!-- Ambient Radial Lighting Glow -->
    <div class="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-[#B8DF38]/10 blur-3xl pointer-events-none"></div>
    <div class="absolute -left-16 -bottom-16 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none"></div>

    <div class="relative z-10 flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
      <!-- Balance Info -->
      <div class="space-y-5 min-w-0 flex-1">
        <div>
          <h2 class="text-sm font-semibold text-emerald-100">{{ hasAllocationShortfall ? 'Alokasi melebihi saldo' : 'Uang yang bisa dipakai' }}</h2>
          <p class="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight tabular-nums mt-1" :class="hasAllocationShortfall ? 'text-amber-200' : 'text-[#B8DF38]'">
            {{ formatRupiah(summary?.unallocatedMoney) }}
          </p>
          <p class="text-xs text-emerald-100/80 mt-2 max-w-md leading-relaxed">
            {{ hasAllocationShortfall ? 'Dana yang dialokasikan lebih besar dari saldo total. Tinjau kembali tabungan Anda.' : 'Sisa saldo yang belum diberi tujuan tabungan atau rencana lain.' }}
          </p>
        </div>

        <div class="max-w-xl border-t border-white/15 pt-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <span class="text-[11px] text-emerald-100/75 block">Saldo total rekening & dompet</span>
              <span class="text-base sm:text-lg font-bold text-white tabular-nums block mt-0.5">
                {{ formatRupiah(summary?.mainBalance) }}
              </span>
            </div>
            <div>
              <span class="text-[11px] text-emerald-100/75 block">Disisihkan untuk tabungan</span>
              <span class="text-base sm:text-lg font-bold text-white tabular-nums block mt-0.5">
                {{ formatRupiah(summary?.totalAllocatedSavings ?? allocationStatus?.totalAllocated) }}
              </span>
            </div>
          </div>
        </div>

        <details class="group max-w-xl border-t border-white/15 pt-3">
          <summary class="flex items-center justify-between gap-2 text-xs font-semibold text-emerald-100 cursor-pointer list-none rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B8DF38]">
            <span>Cara menghitung saldo</span>
            <ChevronDown class="w-4 h-4 shrink-0 transition-transform group-open:rotate-180" aria-hidden="true" />
          </summary>
          <div class="pt-4 space-y-4">
            <p class="text-xs text-emerald-100/85 leading-relaxed">
              Saldo total dikurangi uang yang sudah dialokasikan menjadi uang yang bisa dipakai. Menyisihkan hanya memberi tujuan pada uang; uangnya tetap di rekening atau dompet semula.
            </p>
            <div class="border-t border-white/10 pt-3">
              <span class="text-[11px] text-emerald-100/75 block">Saldo awal saat mulai menggunakan aplikasi</span>
              <span class="text-sm font-semibold text-white tabular-nums block mt-0.5">{{ formatRupiah(summary?.initialBalance) }}</span>
              <p class="text-[11px] text-emerald-100/70 mt-1">Angka ini sudah termasuk dalam saldo total, bukan uang tambahan.</p>
            </div>
            <div v-if="wallets && wallets.length > 0" class="border-t border-white/10 pt-3">
              <div class="flex items-center justify-between gap-2 mb-2">
                <span class="text-[11px] font-bold text-emerald-100 flex items-center gap-1.5">
                  <Wallet class="w-3.5 h-3.5 text-[#B8DF38]" />
                  Rekening & dompet ({{ wallets.length }})
                </span>
                <div class="flex items-center gap-1.5">
                  <button type="button" @click="emit('openTransfer')" class="tactile-btn inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-white/10 hover:bg-white/20 text-emerald-100 border border-white/15 cursor-pointer">
                    <ArrowRightLeft class="w-3 h-3 text-[#B8DF38]" />
                    <span>Pindah Dana</span>
                  </button>
                  <button type="button" @click="emit('openWallets')" class="tactile-btn inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-white/10 hover:bg-white/20 text-emerald-100 border border-white/15 cursor-pointer">
                    <SlidersHorizontal class="w-3 h-3 text-emerald-300" />
                    <span>Kelola</span>
                  </button>
                </div>
              </div>
              <div class="flex items-center gap-2 overflow-x-auto pb-1">
                <div v-for="w in wallets" :key="w.id" class="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 shrink-0">
                  <component :is="getWalletIcon(w.type)" class="w-3.5 h-3.5 text-[#B8DF38]" />
                  <span class="text-xs font-semibold text-stone-200">{{ w.name }}</span>
                  <span class="text-xs font-black text-white tabular-nums">{{ formatRupiah(w.balance) }}</span>
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
            class="tactile-btn inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#B8DF38] hover:bg-[#a3c82e] text-[#183D2B] font-extrabold text-xs shadow-md cursor-pointer select-none"
          >
            <Plus class="w-4 h-4 text-[#183D2B]" :stroke-width="2.5" />
            <span>Pemasukan</span>
          </button>

          <button
            type="button"
            @click="emit('openExpense')"
            data-focus-return="create-expense"
            class="tactile-btn inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white hover:bg-stone-100 text-[#183D2B] font-extrabold text-xs shadow-md cursor-pointer select-none"
          >
            <Minus class="w-4 h-4 text-[#183D2B]" :stroke-width="2.5" />
            <span>Pengeluaran</span>
          </button>
        </div>

        <button
          type="button"
          @click="emit('openSave')"
          class="tactile-btn inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600/90 hover:bg-emerald-500 text-white font-bold text-xs border border-emerald-400/40 shadow-sm cursor-pointer select-none"
        >
          <PiggyBank class="w-4 h-4 text-[#B8DF38]" :stroke-width="2" />
          <span>Sisihkan ke Tabungan</span>
        </button>

      </div>
    </div>
  </div>
</template>
