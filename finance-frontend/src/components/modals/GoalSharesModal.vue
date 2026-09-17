<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { financeApi, type SavingsGoal } from '../../api/services';

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
    class="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50"
    role="dialog"
    aria-modal="true"
    aria-labelledby="shares-modal-title"
  >
    <div class="bg-white w-full max-w-md rounded-2xl p-6 shadow-xl space-y-4">
      <div class="flex items-center justify-between border-b pb-3">
        <div>
          <h3 id="shares-modal-title" class="text-lg font-bold text-[#202820]">Atur Bobot Target Impian</h3>
          <span class="text-xs text-gray-500">Porsi pembagian kuota 40% tabungan (Total harus 100%)</span>
        </div>
        <button
          @click="emit('close')"
          class="text-gray-400 hover:text-gray-600 text-lg font-bold cursor-pointer"
          aria-label="Tutup dialog"
        >
          ✕
        </button>
      </div>

      <div class="space-y-3">
        <div
          v-for="share in sharesInputs"
          :key="share.goalId"
          class="flex items-center justify-between p-3 border border-gray-200 rounded-xl bg-gray-50/50"
        >
          <span class="text-xs font-bold text-gray-800">{{ share.name }}</span>
          <div class="flex items-center space-x-1">
            <input
              v-model.number="share.sharePercent"
              type="number"
              min="0"
              max="100"
              class="w-16 px-2 py-1 border border-gray-300 rounded text-sm text-right font-bold focus:outline-none focus:border-[#183D2B]"
            />
            <span class="text-xs font-bold text-gray-500">%</span>
          </div>
        </div>

        <div class="flex justify-between items-center p-3 bg-gray-100 rounded-xl text-xs font-bold">
          <span>Total Bobot:</span>
          <span
            :class="totalShares === 100 ? 'text-green-700' : 'text-red-600'"
          >
            {{ totalShares }}%
            <span v-if="totalShares !== 100">(Harus 100%)</span>
          </span>
        </div>
      </div>

      <div class="flex justify-end space-x-2 pt-4 border-t">
        <button
          @click="emit('close')"
          type="button"
          class="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer"
        >
          Batal
        </button>
        <button
          @click="handleSaveShares"
          :disabled="submitting || totalShares !== 100"
          type="button"
          class="px-5 py-2 bg-[#183D2B] text-white text-xs font-bold rounded-lg hover:bg-[#24553d] disabled:opacity-50 cursor-pointer transition"
        >
          {{ submitting ? 'Menyimpan...' : 'Simpan Bobot' }}
        </button>
      </div>
    </div>
  </div>
</template>
