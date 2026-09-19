<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { financeApi, type SavingsGoal } from '../../api/services';
import { SlidersHorizontal, X } from 'lucide-vue-next';

const props = defineProps<{
  show: boolean;
  purchaseGoals: SavingsGoal[];
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'saved'): void;
}>();

const sharesInputs = ref<{ goalId: number; name: string; sharePercent: number }[]>([]);
const submitting = ref(false);

const totalShares = computed(() => {
  return sharesInputs.value.reduce((a, c) => a + Number(c.sharePercent || 0), 0);
});

watch(
  () => [props.show, props.purchaseGoals],
  ([show]) => {
    if (show) {
      sharesInputs.value = props.purchaseGoals.map((g) => {
        const existing = g.shareRatio;
        return {
          goalId: g.id,
          name: g.name,
          sharePercent: existing !== undefined && existing !== null ? Math.round(existing / 100) : 0,
        };
      });
    }
  }
);

import { useToast } from '../../composables/useToast';

const toast = useToast();

const handleSaveShares = async () => {
  if (totalShares.value !== 100) {
    toast.error('Total bobot alokasi target harus tepat 100%');
    return;
  }

  submitting.value = true;
  try {
    await financeApi.updateGoalShares(
      sharesInputs.value.map((s) => ({
        goalId: s.goalId,
        shareRatio: s.sharePercent * 100,
      }))
    );
    toast.success('Bobot alokasi target berhasil diperbarui!');
    emit('saved');
    emit('close');
  } catch (err: any) {
    toast.error(err.response?.data?.message || 'Gagal menyimpan bobot target');
  } finally {
    submitting.value = false;
  }
};
</script>

<template>
  <div
    v-if="show"
    class="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center p-0 sm:p-4 glass-modal-backdrop"
    role="dialog"
    aria-modal="true"
    aria-labelledby="shares-modal-title"
    @click.self="emit('close')"
  >
    <div class="bg-white dark:bg-[#16201A] rounded-t-3xl sm:rounded-2xl max-h-[92dvh] sm:max-h-[85vh] w-full max-w-md mx-auto flex flex-col shadow-2xl border border-stone-200/90 dark:border-[#243329] overflow-hidden animate-modal-enter">
      <!-- Header (shrink-0) -->
      <div class="px-5 py-4 border-b border-stone-100 dark:border-[#243329] flex items-center justify-between shrink-0 bg-white dark:bg-[#16201A]">
        <div class="flex items-center gap-2.5">
          <div class="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-[#243329] text-[#183D2B] dark:text-[#B8DF38] flex items-center justify-center shrink-0 border border-emerald-100/50 dark:border-[#344639]">
            <SlidersHorizontal class="w-5 h-5" :stroke-width="2" />
          </div>
          <div>
            <h3 id="shares-modal-title" class="text-base font-extrabold text-[#18221B] dark:text-[#F0F4F1] leading-tight">Atur Bobot Target Impian</h3>
            <span class="text-[11px] text-stone-500 dark:text-[#98A79D] font-medium">Pembagian kuota tabungan impian (Total tepat 100%)</span>
          </div>
        </div>

        <button
          type="button"
          @click="emit('close')"
          class="tactile-btn min-w-[44px] min-h-[44px] flex items-center justify-center text-stone-400 hover:text-stone-700 dark:hover:text-[#F0F4F1] hover:bg-stone-100 dark:hover:bg-[#243329] rounded-xl cursor-pointer"
          aria-label="Tutup dialog"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Form Inputs (flex-1 overscroll-contain) -->
      <div class="p-5 overflow-y-auto flex-1 overscroll-contain space-y-3">

      <div class="space-y-3">
        <div
          v-for="share in sharesInputs"
          :key="share.goalId"
          class="flex items-center justify-between p-3.5 border border-stone-200/80 dark:border-[#243329] rounded-xl bg-stone-50/70 dark:bg-[#0E1410]"
        >
          <span class="text-xs font-bold text-[#18221B] dark:text-[#F0F4F1]">{{ share.name }}</span>
          <div class="flex items-center gap-1.5">
            <input
              v-model.number="share.sharePercent"
              type="number"
              min="0"
              max="100"
              class="w-16 px-2.5 py-1.5 border border-stone-200 dark:border-[#243329] rounded-lg text-sm text-right font-extrabold text-[#18221B] dark:text-[#F0F4F1] bg-white dark:bg-[#121A15] focus:outline-none focus:ring-2 focus:ring-[#183D2B]/20 dark:focus:ring-[#B8DF38]/20 focus:border-[#183D2B] dark:focus:border-[#B8DF38] tabular-nums"
            />
            <span class="text-xs font-bold text-stone-500 dark:text-[#98A79D]">%</span>
          </div>
        </div>

        <div class="flex justify-between items-center p-3.5 bg-stone-100/90 dark:bg-[#0E1410] rounded-xl text-xs font-bold border border-stone-200/80 dark:border-[#243329]">
          <span class="text-stone-700 dark:text-[#98A79D]">Total Akumulasi Bobot:</span>
          <span
            :class="totalShares === 100 ? 'text-emerald-800 dark:text-emerald-300' : 'text-rose-600 dark:text-rose-400'"
            class="tabular-nums font-black"
          >
            {{ totalShares }}%
            <span v-if="totalShares !== 100" class="font-normal text-[11px] ml-1">(Wajib 100%)</span>
          </span>
        </div>
      </div>

      </div>

      <!-- Action Buttons (shrink-0) -->
      <div class="flex items-center justify-end gap-2.5 p-4 border-t border-stone-100 dark:border-[#243329] bg-stone-50/80 dark:bg-[#0E1410]/70 shrink-0">
        <button
          type="button"
          @click="emit('close')"
          class="tactile-btn min-h-[44px] px-4 py-2 text-xs font-semibold text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-[#243329] rounded-xl cursor-pointer border border-stone-200 dark:border-[#243329]"
        >
          Batal
        </button>
        <button
          type="button"
          @click="handleSaveShares"
          :disabled="submitting || totalShares !== 100"
          class="tactile-btn min-h-[44px] px-5 py-2 bg-[#183D2B] dark:bg-[#B8DF38] text-white dark:text-[#0E1410] text-xs font-bold rounded-xl hover:bg-[#24553d] dark:hover:bg-[#a3c82e] disabled:opacity-50 cursor-pointer transition shadow-sm"
        >
          {{ submitting ? 'Menyimpan...' : 'Simpan Bobot' }}
        </button>
      </div>
    </div>
  </div>
</template>
