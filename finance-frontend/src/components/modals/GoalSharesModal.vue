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

const handleSaveShares = async () => {
  if (totalShares.value !== 100) {
    alert('Total bobot alokasi target harus tepat 100%');
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
    emit('saved');
    emit('close');
  } catch (err: any) {
    alert(err.response?.data?.message || 'Gagal menyimpan bobot target');
  } finally {
    submitting.value = false;
  }
};
</script>

<template>
  <div
    v-if="show"
    class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 glass-modal-backdrop overflow-y-auto"
    role="dialog"
    aria-modal="true"
    aria-labelledby="shares-modal-title"
    @click.self="emit('close')"
  >
    <div class="fintech-card rounded-2xl w-full max-w-md p-5 sm:p-6 space-y-4 animate-modal-enter border border-stone-200/90 shadow-2xl">
      <!-- Header -->
      <div class="flex items-center justify-between border-b border-stone-100 pb-3.5">
        <div class="flex items-center gap-2.5">
          <div class="w-9 h-9 rounded-xl bg-emerald-50 text-[#183D2B] flex items-center justify-center shrink-0">
            <SlidersHorizontal class="w-5 h-5" :stroke-width="2" />
          </div>
          <div>
            <h3 id="shares-modal-title" class="text-base font-extrabold text-[#18221B]">Atur Bobot Target Impian</h3>
            <span class="text-[11px] text-stone-500 font-medium">Pembagian kuota tabungan impian (Total tepat 100%)</span>
          </div>
        </div>

        <button
          type="button"
          @click="emit('close')"
          class="tactile-btn p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-xl cursor-pointer"
          aria-label="Tutup dialog"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <div class="space-y-3">
        <div
          v-for="share in sharesInputs"
          :key="share.goalId"
          class="flex items-center justify-between p-3.5 border border-stone-200/80 rounded-xl bg-stone-50/70"
        >
          <span class="text-xs font-bold text-[#18221B]">{{ share.name }}</span>
          <div class="flex items-center gap-1.5">
            <input
              v-model.number="share.sharePercent"
              type="number"
              min="0"
              max="100"
              class="w-16 px-2.5 py-1.5 border border-stone-200 rounded-lg text-sm text-right font-extrabold text-[#18221B] bg-white focus:outline-none focus:ring-2 focus:ring-[#183D2B]/20 tabular-nums"
            />
            <span class="text-xs font-bold text-stone-500">%</span>
          </div>
        </div>

        <div class="flex justify-between items-center p-3.5 bg-stone-100/90 rounded-xl text-xs font-bold border border-stone-200/80">
          <span class="text-stone-700">Total Akumulasi Bobot:</span>
          <span
            :class="totalShares === 100 ? 'text-emerald-800' : 'text-rose-600'"
            class="tabular-nums font-black"
          >
            {{ totalShares }}%
            <span v-if="totalShares !== 100" class="font-normal text-[11px] ml-1">(Wajib 100%)</span>
          </span>
        </div>
      </div>

      <div class="flex justify-end gap-2 pt-3 border-t border-stone-100">
        <button
          type="button"
          @click="emit('close')"
          class="tactile-btn px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl cursor-pointer border border-stone-200"
        >
          Batal
        </button>
        <button
          type="button"
          @click="handleSaveShares"
          :disabled="submitting || totalShares !== 100"
          class="tactile-btn px-5 py-2 bg-[#183D2B] text-white text-xs font-bold rounded-xl hover:bg-[#24553d] disabled:opacity-50 cursor-pointer transition shadow-xs"
        >
          {{ submitting ? 'Menyimpan...' : 'Simpan Bobot' }}
        </button>
      </div>
    </div>
  </div>
</template>
