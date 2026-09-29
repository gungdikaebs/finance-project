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
    toast.error('Total pembagian porsi target harus tepat 100%');
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
    toast.success('Pembagian porsi target berhasil diperbarui!');
    emit('saved');
    emit('close');
  } catch (err: any) {
    toast.error(err.response?.data?.message || 'Gagal menyimpan pembagian target');
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
    <div class="bg-white dark:bg-[#0D1524] rounded-t-3xl sm:rounded-2xl max-h-[92dvh] sm:max-h-[85vh] w-full max-w-md mx-auto flex flex-col shadow-2xl border border-slate-200/90 dark:border-slate-800 overflow-hidden animate-modal-enter">
      <!-- Header (shrink-0) -->
      <div class="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0 bg-white dark:bg-[#0D1524]">
        <div class="flex items-center gap-2.5">
          <div class="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-200/60 dark:border-blue-900/40">
            <SlidersHorizontal class="w-5 h-5" :stroke-width="2" />
          </div>
          <div>
            <h3 id="shares-modal-title" class="text-base font-extrabold text-slate-900 dark:text-slate-100 leading-tight">Atur Pembagian Target Impian</h3>
            <span class="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Tentukan persentase tabungan untuk tiap target impian (Total 100%)</span>
          </div>
        </div>

        <button
          type="button"
          @click="emit('close')"
          class="tactile-btn min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60 rounded-xl cursor-pointer"
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
            class="flex items-center justify-between p-3.5 border border-slate-200/80 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-[#070B14]"
          >
            <span class="text-xs font-bold text-slate-900 dark:text-slate-100">{{ share.name }}</span>
            <div class="flex items-center gap-1.5">
              <input
                :aria-label="`Porsi ${share.name} dalam persen`"
                v-model.number="share.sharePercent"
                type="number"
                min="0"
                max="100"
                class="w-16 px-2.5 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-right font-extrabold text-slate-900 dark:text-slate-100 bg-white dark:bg-[#0D1524] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 dark:focus:border-blue-500 tabular-nums"
              />
              <span class="text-xs font-bold text-slate-500 dark:text-slate-400">%</span>
            </div>
          </div>

          <div class="flex justify-between items-center p-3.5 bg-slate-100/90 dark:bg-[#070B14] rounded-xl text-xs font-bold border border-slate-200/80 dark:border-slate-800">
            <span class="text-slate-700 dark:text-slate-300">Total Pembagian Porsi:</span>
            <span
              :class="totalShares === 100 ? 'text-blue-600 dark:text-blue-400' : 'text-rose-600 dark:text-rose-400'"
              class="tabular-nums font-black"
            >
              {{ totalShares }}%
              <span v-if="totalShares !== 100" class="font-normal text-[11px] ml-1">(Wajib 100%)</span>
            </span>
          </div>
        </div>
      </div>

      <!-- Action Buttons (shrink-0) -->
      <div class="flex items-center justify-end gap-2.5 p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-[#0D1524] shrink-0">
        <button
          type="button"
          @click="emit('close')"
          class="tactile-btn min-h-[44px] px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 rounded-xl cursor-pointer border border-slate-200 dark:border-slate-800"
        >
          Batal
        </button>
        <button
          type="button"
          @click="handleSaveShares"
          :disabled="submitting || totalShares !== 100"
          class="tactile-btn min-h-[44px] px-5 py-2 bg-[#0B192C] hover:bg-[#1E293B] dark:bg-blue-600 dark:hover:bg-blue-500 text-white text-xs font-bold rounded-xl disabled:opacity-50 cursor-pointer transition shadow-sm"
        >
          {{ submitting ? 'Menyimpan...' : 'Simpan Pembagian' }}
        </button>
      </div>
    </div>
  </div>
</template>
