<script setup lang="ts">
import { formatRupiah } from '../../utils/format';
import type { MonthEndReview } from '../../api/services';
import { CalendarCheck, X, Sparkles } from 'lucide-vue-next';

defineProps<{
  show: boolean;
  review: MonthEndReview | null;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();
</script>

<template>
  <div
    v-if="show && review"
    class="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center p-0 sm:p-4 glass-modal-backdrop"
    role="dialog"
    aria-modal="true"
    aria-labelledby="review-modal-title"
    @click.self="emit('close')"
  >
    <div class="bg-white dark:bg-[#0D1524] rounded-t-3xl sm:rounded-2xl max-h-[92dvh] sm:max-h-[85vh] w-full max-w-lg mx-auto flex flex-col shadow-2xl border border-slate-200/90 dark:border-slate-800 overflow-hidden animate-modal-enter">
      <!-- Header (shrink-0) -->
      <div class="px-5 sm:px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0 bg-white dark:bg-[#0D1524]">
        <div class="flex items-center gap-2.5">
          <div class="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300 flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-800/40">
            <CalendarCheck class="w-5 h-5" :stroke-width="2" />
          </div>
          <div>
            <h3 id="review-modal-title" class="text-base font-extrabold text-slate-900 dark:text-slate-100 leading-tight">
              Tinjauan Bulan {{ review.reviewedMonth }}/{{ review.reviewedYear }}
            </h3>
            <span class="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Evaluasi efisiensi anggaran periode lalu</span>
          </div>
        </div>

        <button
          type="button"
          @click="emit('close')"
          class="tactile-btn min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
          aria-label="Tutup dialog"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Body (scrollable) -->
      <div class="p-5 sm:p-6 overflow-y-auto flex-1 overscroll-contain space-y-4">
        <div class="grid grid-cols-2 gap-3">
          <div class="p-3.5 bg-slate-50 dark:bg-[#070B14] rounded-xl border border-slate-200/80 dark:border-slate-800">
            <span class="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">Total Pemasukan</span>
            <span class="text-base font-extrabold text-slate-900 dark:text-slate-100 tabular-nums block mt-0.5">{{ formatRupiah(review.income) }}</span>
          </div>
          <div class="p-3.5 bg-slate-50 dark:bg-[#070B14] rounded-xl border border-slate-200/80 dark:border-slate-800">
            <span class="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">Total Pengeluaran</span>
            <span class="text-base font-extrabold text-slate-900 dark:text-slate-100 tabular-nums block mt-0.5">{{ formatRupiah(review.expense) }}</span>
          </div>
        </div>

        <div class="p-4 bg-slate-50 dark:bg-[#070B14] border border-slate-200/80 dark:border-slate-800 rounded-xl space-y-2 text-xs">
          <div class="flex justify-between">
            <span class="text-slate-600 dark:text-slate-400 font-medium">Sisa Batas Kebutuhan:</span>
            <span class="font-bold text-blue-600 dark:text-blue-400 tabular-nums">{{ formatRupiah(review.remainingNeeds) }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-600 dark:text-slate-400 font-medium">Sisa Batas Keinginan:</span>
            <span class="font-bold text-purple-600 dark:text-purple-400 tabular-nums">{{ formatRupiah(review.remainingWants) }}</span>
          </div>
          <div class="flex justify-between pt-2 border-t border-slate-200 dark:border-slate-800 font-bold">
            <span class="text-slate-900 dark:text-slate-100">Total Sisa Anggaran Positif:</span>
            <span class="text-blue-600 dark:text-blue-400 font-black tabular-nums">{{ formatRupiah(review.totalUnspentBudget) }}</span>
          </div>
        </div>

        <!-- Tawaran Tabungan Ekstra -->
        <div class="p-4 bg-blue-50/50 dark:bg-[#070B14] border border-blue-100 dark:border-slate-800 rounded-xl space-y-2">
          <div class="flex items-center gap-1.5">
            <Sparkles class="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <h4 class="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider">Saran Menabung dari Sisa Anggaran</h4>
          </div>
          <p class="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
            Dana yang belum dialokasikan ke tabungan saat ini adalah <strong class="font-black text-slate-900 dark:text-slate-100 tabular-nums">{{ formatRupiah(review.unallocatedMoney) }}</strong>.
            Saran nominal tabungan ekstra dari sisa anggaran bulan lalu:
          </p>
          <div class="text-2xl font-black text-slate-900 dark:text-slate-100 tabular-nums">
            {{ formatRupiah(review.suggestedSavings) }}
          </div>
          <p class="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
            Catatan: Uang yang belum ditabung tetap aman di Saldo utama dan terbawa ke bulan berjalan tanpa dihitung sebagai pemasukan baru.
          </p>
        </div>
      </div>

      <!-- Action Buttons (shrink-0) -->
      <div class="flex items-center justify-end p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-[#0D1524] shrink-0">
        <button
          type="button"
          @click="emit('close')"
          class="tactile-btn min-h-[44px] px-6 py-2 bg-[#0B192C] hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500 text-white rounded-xl text-xs font-bold cursor-pointer transition shadow-sm"
        >
          Tutup Tinjauan
        </button>
      </div>
    </div>
  </div>
</template>
