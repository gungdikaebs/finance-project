<script setup lang="ts">
import { formatRupiah } from '../utils/format';
import type { ReportSummary, AllocationStatus } from '../api/services';
import { Plus, Minus, PiggyBank, Unlock } from 'lucide-vue-next';

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
  <div class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#183D2B] via-[#143425] to-[#0D2218] text-white p-6 sm:p-8 shadow-[0_12px_40px_-10px_rgba(24,61,43,0.35)] border border-emerald-800/40">
    <!-- Ambient Radial Lighting Glow -->
    <div class="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-[#B8DF38]/10 blur-3xl pointer-events-none"></div>
    <div class="absolute -left-16 -bottom-16 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none"></div>

    <div class="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
      <!-- Balance Info -->
      <div class="space-y-4">
        <div>
          <div class="flex items-center gap-2 mb-1.5">
            <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-white/10 text-emerald-200 border border-white/10">
              <span class="w-1.5 h-1.5 rounded-full bg-[#B8DF38] animate-pulse"></span>
              Saldo Utama Aktual
            </span>
          </div>
          <div class="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight tabular-nums">
            {{ formatRupiah(summary?.mainBalance) }}
          </div>
          <p class="text-xs text-emerald-100/70 mt-1 max-w-md font-normal leading-relaxed">
            Total uang riil aktual tanpa memandang lokasi fisik rekening atau dompet tunai.
          </p>
        </div>

        <!-- 3-Metric Distribution Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-white/15 max-w-xl">
          <div class="p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
            <span class="text-[11px] font-medium text-emerald-200/80 block">Uang Belum Disisihkan</span>
            <span class="text-base sm:text-lg font-black text-[#B8DF38] tabular-nums block mt-0.5">
              {{ formatRupiah(summary?.unallocatedMoney) }}
            </span>
            <span class="text-[10px] text-emerald-100/60 font-medium">Bebas digunakan</span>
          </div>

          <div class="p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
            <span class="text-[11px] font-medium text-emerald-200/80 block">Dana Tersisih (Tabungan)</span>
            <span class="text-base sm:text-lg font-black text-white tabular-nums block mt-0.5">
              {{ formatRupiah(summary?.totalAllocatedSavings || allocationStatus?.totalAllocated) }}
            </span>
            <span class="text-[10px] text-emerald-100/60 font-medium">Darurat + impian</span>
          </div>

          <div class="p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
            <span class="text-[11px] font-medium text-emerald-200/80 block">Saldo Awal Terdaftar</span>
            <span class="text-base sm:text-lg font-bold text-stone-200 tabular-nums block mt-0.5">
              {{ formatRupiah(summary?.initialBalance) }}
            </span>
            <span class="text-[10px] text-emerald-100/60 font-medium">Basis modal awal</span>
          </div>
        </div>
      </div>

      <!-- Quick Action Buttons -->
      <div class="flex flex-col sm:flex-row lg:flex-col gap-2.5 min-w-[200px] shrink-0">
        <div class="grid grid-cols-2 gap-2">
          <button
            type="button"
            @click="emit('openIncome')"
            class="tactile-btn inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#B8DF38] hover:bg-[#a3c82e] text-[#183D2B] font-extrabold text-xs shadow-md cursor-pointer select-none"
          >
            <Plus class="w-4 h-4 text-[#183D2B]" :stroke-width="2.5" />
            <span>Pemasukan</span>
          </button>

          <button
            type="button"
            @click="emit('openExpense')"
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

        <button
          type="button"
          @click="emit('openRelease')"
          class="tactile-btn inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-stone-200 font-semibold text-xs border border-white/15 cursor-pointer select-none"
        >
          <Unlock class="w-3.5 h-3.5 text-stone-300" :stroke-width="1.75" />
          <span>Lepas Alokasi Dana</span>
        </button>
      </div>
    </div>
  </div>
</template>
