<script setup lang="ts">
import {
  Clock,
  ArrowRight,
  Play,
  CheckCircle2,
  Repeat,
} from 'lucide-vue-next';
import type { RecurringTransaction } from '../api/services';
import { formatRupiah, formatDate } from '../utils/format';

const props = defineProps<{
  upcomingBills: RecurringTransaction[];
  loading?: boolean;
}>();

const emit = defineEmits<{
  (e: 'openManageRecurring'): void;
  (e: 'executeBill', bill: RecurringTransaction): void;
}>();

const getRelativeDays = (dateStr: string): string => {
  const target = new Date(dateStr);
  const now = new Date();
  target.setUTCHours(0, 0, 0, 0);
  now.setUTCHours(0, 0, 0, 0);

  const diffDays = Math.round((target.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
  if (diffDays === 0) return 'Hari ini';
  if (diffDays === 1) return 'Besok';
  if (diffDays === -1) return 'Kemarin';
  if (diffDays > 1) return `${diffDays} hari lagi`;
  return `${Math.abs(diffDays)} hari lalu`;
};
</script>

<template>
  <!-- Widget Container -->
  <div
    v-if="upcomingBills && upcomingBills.length > 0"
    class="fintech-card rounded-2xl p-4 sm:p-5 border border-amber-200/70 bg-gradient-to-br from-amber-50/40 via-white to-white space-y-3.5 shadow-xs"
  >
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-amber-100 pb-3">
      <div class="flex items-center gap-2.5">
        <div class="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-900 flex items-center justify-center shrink-0">
          <Clock class="w-4 h-4" :stroke-width="2.2" />
        </div>
        <div>
          <div class="flex items-center gap-2">
            <h3 class="text-sm font-extrabold text-[#18221B]">Tagihan Jatuh Tempo (7 Hari ke Depan)</h3>
            <span class="px-2 py-0.2 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300/60 tabular-nums">
              {{ upcomingBills.length }} Tagihan
            </span>
          </div>
          <p class="text-xs text-stone-500 font-normal">
            Jangan sampai terlewat. Bayar lebih awal atau biarkan sistem mencatatnya otomatis saat jatuh tempo.
          </p>
        </div>
      </div>

      <button
        type="button"
        @click="emit('openManageRecurring')"
        class="tactile-btn inline-flex items-center gap-1 text-xs font-bold text-[#183D2B] hover:text-[#285d43] self-start sm:self-auto cursor-pointer"
      >
        <span>Kelola Semua Jadwal</span>
        <ArrowRight class="w-3.5 h-3.5" />
      </button>
    </div>

    <!-- Bill Cards Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
      <div
        v-for="bill in upcomingBills"
        :key="bill.id"
        class="p-3.5 rounded-xl bg-white border border-stone-200/90 shadow-2xs hover:border-amber-400/80 transition-all flex items-center justify-between gap-3"
      >
        <div class="min-w-0 space-y-1">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="text-xs font-bold text-[#18221B] truncate">
              {{ bill.note || (bill.type === 'expense' ? 'Tagihan Rutin' : 'Pemasukan Rutin') }}
            </span>
            <span
              class="px-1.5 py-0.2 text-[10px] font-bold rounded"
              :class="getRelativeDays(bill.nextRunDate) === 'Hari ini'
                ? 'bg-rose-100 text-rose-800 border border-rose-300/60'
                : 'bg-amber-100 text-amber-900'"
            >
              {{ getRelativeDays(bill.nextRunDate) }}
            </span>
          </div>

          <div class="flex items-center gap-2 text-[11px] text-stone-500">
            <span class="font-medium text-stone-700">{{ bill.category?.name || bill.incomeSource?.name || 'Rutin' }}</span>
            <span>•</span>
            <span class="tabular-nums">{{ formatDate(bill.nextRunDate) }}</span>
          </div>

          <div class="text-xs font-extrabold text-[#183D2B] tabular-nums">
            {{ formatRupiah(bill.amount) }}
          </div>
        </div>

        <button
          type="button"
          @click="emit('executeBill', bill)"
          class="tactile-btn shrink-0 px-3 py-1.5 bg-[#183D2B] hover:bg-[#224e39] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer select-none"
          title="Catat dan bayar tagihan ini sekarang"
        >
          <Play class="w-3 h-3 text-[#B8DF38] fill-current" />
          <span>Bayar Sekarang</span>
        </button>
      </div>
    </div>
  </div>

  <!-- Empty / Compact State (Optional Info Pill) -->
  <div
    v-else
    class="flex items-center justify-between p-3 rounded-2xl bg-white border border-stone-200/70 text-xs text-stone-600 shadow-2xs"
  >
    <div class="flex items-center gap-2.5 min-w-0">
      <div class="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
        <CheckCircle2 class="w-3.5 h-3.5" />
      </div>
      <span class="truncate font-medium">
        Tidak ada tagihan rutin yang jatuh tempo dalam 7 hari ke depan.
      </span>
    </div>

    <button
      type="button"
      @click="emit('openManageRecurring')"
      class="tactile-btn shrink-0 inline-flex items-center gap-1 font-bold text-[#183D2B] hover:underline cursor-pointer text-xs"
    >
      <Repeat class="w-3 h-3" />
      <span>Atur Transaksi Berulang</span>
    </button>
  </div>
</template>
