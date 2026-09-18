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
    <div class="bg-white rounded-t-3xl sm:rounded-2xl max-h-[92dvh] sm:max-h-[85vh] w-full max-w-lg mx-auto flex flex-col shadow-2xl border border-stone-200/90 overflow-hidden animate-modal-enter">
      <!-- Header (shrink-0) -->
      <div class="px-5 sm:px-6 py-4 border-b border-stone-100 flex items-center justify-between shrink-0 bg-white">
        <div class="flex items-center gap-2.5">
          <div class="w-10 h-10 rounded-xl bg-purple-50 text-purple-800 flex items-center justify-center shrink-0">
            <CalendarCheck class="w-5 h-5" :stroke-width="2" />
          </div>
          <div>
            <h3 id="review-modal-title" class="text-base font-extrabold text-[#18221B] leading-tight">
              Tinjauan Bulan {{ review.reviewedMonth }}/{{ review.reviewedYear }}
            </h3>
            <span class="text-[11px] text-stone-500 font-medium">Evaluasi efisiensi anggaran periode lalu</span>
          </div>
        </div>

        <button
          type="button"
          @click="emit('close')"
          class="tactile-btn min-w-[44px] min-h-[44px] flex items-center justify-center text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-xl cursor-pointer"
          aria-label="Tutup dialog"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Body (scrollable) -->
      <div class="p-5 sm:p-6 overflow-y-auto flex-1 overscroll-contain space-y-4">
        <div class="grid grid-cols-2 gap-3">
          <div class="p-3.5 bg-stone-50/70 rounded-xl border border-stone-200/80">
            <span class="text-[11px] font-medium text-stone-500 block">Total Pemasukan</span>
            <span class="text-base font-extrabold text-[#18221B] tabular-nums block mt-0.5">{{ formatRupiah(review.income) }}</span>
          </div>
          <div class="p-3.5 bg-stone-50/70 rounded-xl border border-stone-200/80">
            <span class="text-[11px] font-medium text-stone-500 block">Total Pengeluaran</span>
            <span class="text-base font-extrabold text-[#18221B] tabular-nums block mt-0.5">{{ formatRupiah(review.expense) }}</span>
          </div>
        </div>

        <div class="p-4 bg-blue-50/60 border border-blue-200/70 rounded-xl space-y-2 text-xs">
          <div class="flex justify-between">
            <span class="text-blue-950 font-medium">Sisa Batas Kebutuhan:</span>
            <span class="font-bold text-blue-950 tabular-nums">{{ formatRupiah(review.remainingNeeds) }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-purple-950 font-medium">Sisa Batas Keinginan:</span>
            <span class="font-bold text-purple-950 tabular-nums">{{ formatRupiah(review.remainingWants) }}</span>
          </div>
          <div class="flex justify-between pt-2 border-t border-blue-200/70 font-bold">
            <span class="text-[#18221B]">Total Sisa Anggaran Positif:</span>
            <span class="text-[#183D2B] font-black tabular-nums">{{ formatRupiah(review.totalUnspentBudget) }}</span>
          </div>
        </div>

        <!-- Tawaran Penyisihan Tambahan (D-006) -->
        <div class="p-4 bg-[#183D2B]/5 border border-[#183D2B]/15 rounded-xl space-y-2">
          <div class="flex items-center gap-1.5">
            <Sparkles class="w-3.5 h-3.5 text-[#183D2B]" />
            <h4 class="text-xs font-bold text-[#183D2B] uppercase tracking-wider">Rekomendasi Penyisihan Tambahan (D-006)</h4>
          </div>
          <p class="text-xs text-stone-600 leading-relaxed font-normal">
            Uang belum disisihkan saat ini adalah <strong class="font-black text-[#18221B] tabular-nums">{{ formatRupiah(review.unallocatedMoney) }}</strong>.
            Saran nominal tabungan ekstra dari efisiensi bulan lalu:
          </p>
          <div class="text-2xl font-black text-[#183D2B] tabular-nums">
            {{ formatRupiah(review.suggestedSavings) }}
          </div>
          <p class="text-[11px] text-stone-500 leading-relaxed font-normal">
            Catatan: Uang yang tidak disisihkan tetap aman di Saldo utama dan terbawa ke bulan berjalan tanpa menjadi pemasukan baru.
          </p>
        </div>
      </div>

      <!-- Action Buttons (shrink-0) -->
      <div class="flex items-center justify-end p-4 border-t border-stone-100 bg-stone-50/80 shrink-0">
        <button
          type="button"
          @click="emit('close')"
          class="tactile-btn min-h-[44px] px-6 py-2 bg-[#183D2B] hover:bg-[#24553d] text-white rounded-xl text-xs font-bold cursor-pointer transition shadow-sm"
        >
          Tutup Tinjauan
        </button>
      </div>
    </div>
  </div>
</template>
