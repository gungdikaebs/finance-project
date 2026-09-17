<script setup lang="ts">
import { formatRupiah } from '../../utils/format';
import type { MonthEndReview } from '../../api/services';

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
    class="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50"
    role="dialog"
    aria-modal="true"
    aria-labelledby="review-modal-title"
  >
    <div class="bg-white w-full max-w-lg rounded-2xl p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
      <div class="flex items-center justify-between border-b pb-3">
        <h3 id="review-modal-title" class="text-lg font-bold text-[#202820]">
          Tinjauan Performa Bulan {{ review.reviewedMonth }}/{{ review.reviewedYear }}
        </h3>
        <button
          @click="emit('close')"
          class="text-gray-400 hover:text-gray-600 cursor-pointer text-lg"
          aria-label="Tutup dialog"
        >
          ✕
        </button>
      </div>

      <p class="text-xs text-gray-500">
        Evaluasi realisasi anggaran bulan sebelumnya untuk mengoptimalkan penyisihan tabungan secara terarah.
      </p>

      <div class="space-y-3">
        <div class="grid grid-cols-2 gap-3">
          <div class="p-3 bg-gray-50 rounded-xl border border-gray-200">
            <span class="text-[11px] text-gray-500 block">Total Pemasukan</span>
            <span class="text-sm font-bold text-green-700">{{ formatRupiah(review.income) }}</span>
          </div>
          <div class="p-3 bg-gray-50 rounded-xl border border-gray-200">
            <span class="text-[11px] text-gray-500 block">Total Pengeluaran</span>
            <span class="text-sm font-bold text-gray-900">{{ formatRupiah(review.expense) }}</span>
          </div>
        </div>

        <div class="p-3 bg-blue-50/60 border border-blue-200 rounded-xl space-y-1.5 text-xs">
          <div class="flex justify-between">
            <span class="text-blue-900 font-semibold">Sisa Batas Kebutuhan:</span>
            <span class="font-bold text-blue-900">{{ formatRupiah(review.remainingNeeds) }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-orange-900 font-semibold">Sisa Batas Keinginan:</span>
            <span class="font-bold text-orange-900">{{ formatRupiah(review.remainingWants) }}</span>
          </div>
          <div class="flex justify-between pt-1 border-t border-blue-200">
            <span class="font-bold text-gray-900">Total Sisa Anggaran Positif:</span>
            <span class="font-bold text-[#183D2B]">{{ formatRupiah(review.totalUnspentBudget) }}</span>
          </div>
        </div>

        <!-- Tawaran Penyisihan Tambahan (D-006) -->
        <div class="p-4 bg-[#183D2B]/5 border border-[#183D2B]/20 rounded-xl space-y-2">
          <h4 class="text-xs font-bold text-[#183D2B] uppercase">Rekomendasi Penyisihan Tambahan</h4>
          <p class="text-xs text-gray-600">
            Uang riil yang belum disisihkan saat ini adalah <strong>{{ formatRupiah(review.unallocatedMoney) }}</strong>.
            Saran nominal tabungan tambahan dari efisiensi bulan lalu:
          </p>
          <div class="text-xl font-black text-[#183D2B]">
            {{ formatRupiah(review.suggestedSavings) }}
          </div>
          <p class="text-[11px] text-gray-400">
            Catatan: Uang yang tidak disisihkan tetap aman berada di Saldo utama dan terbawa ke bulan berjalan tanpa menjadi pemasukan baru.
          </p>
        </div>
      </div>

      <div class="flex justify-end pt-3 border-t">
        <button
          @click="emit('close')"
          class="px-5 py-2 bg-[#183D2B] text-white rounded-lg text-xs font-bold hover:bg-[#24553d] cursor-pointer transition"
        >
          Tutup Tinjauan
        </button>
      </div>
    </div>
  </div>
</template>
