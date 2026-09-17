<script setup lang="ts">
import { ref, watch } from 'vue';
import { financeApi, type SavingsGoal } from '../../api/services';
import { formatRupiah } from '../../utils/format';

const props = defineProps<{
  show: boolean;
  savingsGoals: SavingsGoal[];
  initialGoalId?: number | null;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'saved'): void;
}>();

const releaseSourceGoalId = ref<number | null>(null);
const releaseAmountInput = ref('');
const releaseNoteInput = ref('');
const submitting = ref(false);

watch(
  () => [props.show, props.initialGoalId],
  ([show]) => {
    if (show) {
      releaseSourceGoalId.value = props.initialGoalId || (props.savingsGoals[0]?.id || null);
      releaseAmountInput.value = '';
      releaseNoteInput.value = '';
    }
  }
);

const handleExecuteRelease = async () => {
  if (!releaseSourceGoalId.value) {
    alert('Pilih target sumber dana yang ingin dilepas');
    return;
  }
  const clean = releaseAmountInput.value.replace(/[^0-9]/g, '');
  if (!clean || clean === '0') {
    alert('Nominal harus lebih besar dari 0');
    return;
  }

  submitting.value = true;
  try {
    await financeApi.releaseAllocation({
      sourceGoalId: releaseSourceGoalId.value,
      amount: clean,
      date: new Date().toISOString().slice(0, 10),
      note: releaseNoteInput.value || undefined,
    });
    emit('saved');
    emit('close');
  } catch (err: any) {
    alert(err.response?.data?.message || 'Gagal melepas alokasi');
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
    aria-labelledby="release-modal-title"
  >
    <div class="bg-white w-full max-w-md rounded-2xl p-6 shadow-xl space-y-4">
      <div class="flex items-center justify-between border-b pb-3">
        <div>
          <h3 id="release-modal-title" class="text-lg font-bold text-[#202820]">Lepas Alokasi Dana</h3>
          <span class="text-xs text-gray-500">Kembalikan dana ke pos "Uang Belum Disisihkan"</span>
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
        <div>
          <label class="block text-xs font-semibold text-gray-700 uppercase mb-1">Target Sumber Dana</label>
          <select
            v-model="releaseSourceGoalId"
            class="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm bg-white focus:outline-none focus:border-amber-700"
          >
            <option :value="null">-- Pilih Target Tabungan --</option>
            <option
              v-for="g in savingsGoals"
              :key="g.id"
              :value="g.id"
            >
              {{ g.type === 'EMERGENCY' ? '🛡️' : '🎯' }} {{ g.name }} (Saldo: {{ formatRupiah(g.currentBalance) }})
            </option>
          </select>
        </div>

        <div>
          <label class="block text-xs font-semibold text-gray-700 uppercase mb-1">Nominal Dilepas (Rp)</label>
          <input
            v-model="releaseAmountInput"
            type="text"
            placeholder="0"
            class="w-full px-3 py-2 border border-gray-300 rounded-xl text-base font-bold text-gray-900 focus:outline-none focus:border-amber-700"
          />
          <span class="text-xs text-[#183D2B] font-semibold mt-1 block">
            Pratinjau: {{ formatRupiah(releaseAmountInput) }}
          </span>
        </div>

        <div>
          <label class="block text-xs font-semibold text-gray-700 uppercase mb-1">Catatan / Alasan Pelepasan</label>
          <input
            v-model="releaseNoteInput"
            type="text"
            placeholder="Contoh: Kebutuhan mendesak, relokasi dana..."
            class="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-amber-700"
          />
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
          @click="handleExecuteRelease"
          :disabled="submitting"
          type="button"
          class="px-5 py-2 bg-amber-700 text-white text-xs font-bold rounded-lg hover:bg-amber-800 disabled:opacity-50 cursor-pointer transition"
        >
          {{ submitting ? 'Memproses...' : 'Lepas Alokasi ke Bebas' }}
        </button>
      </div>
    </div>
  </div>
</template>
