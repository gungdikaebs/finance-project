<script setup lang="ts">
import { ref, watch } from 'vue';
import { financeApi } from '../../api/services';
import { formatRupiah } from '../../utils/format';

const props = defineProps<{
  show: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'saved'): void;
}>();

const newGoalName = ref('');
const newGoalPrice = ref('');
const newGoalMonths = ref<number | null>(null);
const newGoalMode = ref<'FULL' | 'DOWN_PAYMENT'>('FULL');
const submitting = ref(false);

watch(
  () => props.show,
  (show) => {
    if (show) {
      newGoalName.value = '';
      newGoalPrice.value = '';
      newGoalMonths.value = null;
      newGoalMode.value = 'FULL';
    }
  }
);

const handleCreateGoal = async () => {
  if (!newGoalName.value.trim()) {
    alert('Nama target wajib diisi');
    return;
  }
  const cleanPrice = newGoalPrice.value.replace(/[^0-9]/g, '');
  if (!cleanPrice || cleanPrice === '0') {
    alert('Harga target harus lebih besar dari 0');
    return;
  }

  submitting.value = true;
  try {
    await financeApi.createSavingsGoal({
      name: newGoalName.value.trim(),
      type: 'PURCHASE',
      mode: newGoalMode.value,
      priceReference: cleanPrice,
      targetAmount: cleanPrice,
      targetMonths: newGoalMonths.value || undefined,
    });
    emit('saved');
    emit('close');
  } catch (err: any) {
    alert(err.response?.data?.message || 'Gagal menambahkan target impian');
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
    aria-labelledby="add-goal-title"
  >
    <div class="bg-white w-full max-w-md rounded-2xl p-6 shadow-xl space-y-4">
      <div class="flex items-center justify-between border-b pb-3">
        <div>
          <h3 id="add-goal-title" class="text-lg font-bold text-[#202820]">Tambah Target Impian</h3>
          <span class="text-xs text-gray-500">Target pembelian barang, properti, atau impian finansial</span>
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
          <label class="block text-xs font-semibold text-gray-700 uppercase mb-1">Nama Target</label>
          <input
            v-model="newGoalName"
            type="text"
            placeholder="Contoh: Beli Rumah Pertama, Laptop Kerja, Liburan..."
            class="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-[#183D2B]"
          />
        </div>

        <div>
          <label class="block text-xs font-semibold text-gray-700 uppercase mb-1">Harga Referensi / Target Dana (Rp)</label>
          <input
            v-model="newGoalPrice"
            type="text"
            placeholder="0"
            class="w-full px-3 py-2 border border-gray-300 rounded-xl text-base font-bold text-gray-900 focus:outline-none focus:border-[#183D2B]"
          />
          <span class="text-xs text-[#183D2B] font-semibold mt-1 block">
            Pratinjau: {{ formatRupiah(newGoalPrice) }}
          </span>
        </div>

        <div>
          <label class="block text-xs font-semibold text-gray-700 uppercase mb-1">Metode Pembelian</label>
          <select
            v-model="newGoalMode"
            class="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm bg-white focus:outline-none focus:border-[#183D2B]"
          >
            <option value="FULL">Beli Lunas Penuh (Cash)</option>
            <option value="DOWN_PAYMENT">Uang Muka (DP) & KPR/Cicilan</option>
          </select>
        </div>

        <div>
          <label class="block text-xs font-semibold text-gray-700 uppercase mb-1">Target Waktu (Bulan - Opsional)</label>
          <input
            v-model.number="newGoalMonths"
            type="number"
            min="1"
            placeholder="Contoh: 12, 24, 36 bulan..."
            class="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-[#183D2B]"
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
          @click="handleCreateGoal"
          :disabled="submitting"
          type="button"
          class="px-5 py-2 bg-[#183D2B] text-white text-xs font-bold rounded-lg hover:bg-[#24553d] disabled:opacity-50 cursor-pointer transition"
        >
          {{ submitting ? 'Menyimpan...' : 'Simpan Target' }}
        </button>
      </div>
    </div>
  </div>
</template>
