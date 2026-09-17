<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { financeApi, type Transaction, type Category } from '../../api/services';
import { formatRupiah } from '../../utils/format';

const props = defineProps<{
  show: boolean;
  transaction: Transaction | null;
  categories: Category[];
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'saved'): void;
}>();

const editAmount = ref('');
const editCategoryId = ref<number | null>(null);
const editDate = ref('');
const editReason = ref('');
const submitting = ref(false);

const todayDateString = computed(() => new Date().toISOString().slice(0, 10));

watch(
  () => props.transaction,
  (tx) => {
    if (tx) {
      editAmount.value = tx.amount;
      editCategoryId.value = tx.categoryId;
      editDate.value = tx.date.slice(0, 10);
      editReason.value = '';
    }
  },
  { immediate: true }
);

const handleUpdate = async () => {
  if (!props.transaction) return;
  const cleanAmount = editAmount.value.replace(/[^0-9]/g, '');
  if (!cleanAmount || cleanAmount === '0') {
    alert('Nominal harus lebih besar dari 0');
    return;
  }

  submitting.value = true;
  try {
    await financeApi.updateTransaction(props.transaction.id, {
      amount: cleanAmount,
      categoryId: editCategoryId.value || undefined,
      date: editDate.value,
      reason: editReason.value || undefined,
    });
    emit('saved');
    emit('close');
  } catch (err: any) {
    alert(err.response?.data?.message || 'Gagal mengoreksi transaksi');
  } finally {
    submitting.value = false;
  }
};
</script>

<template>
  <div
    v-if="show && transaction"
    class="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50"
    role="dialog"
    aria-modal="true"
    aria-labelledby="edit-trx-title"
  >
    <div class="bg-white w-full max-w-md rounded-2xl p-6 shadow-xl space-y-4">
      <div class="flex items-center justify-between border-b pb-3">
        <h3 id="edit-trx-title" class="text-lg font-bold text-[#202820]">Koreksi Transaksi</h3>
        <button
          @click="emit('close')"
          class="text-gray-400 hover:text-gray-600 text-lg cursor-pointer"
          aria-label="Tutup dialog"
        >
          ✕
        </button>
      </div>

      <p class="text-xs text-gray-500">
        Perubahan nilai atau tanggal akan dicatat sebagai riwayat revisi dan saldo utama akan dihitung ulang otomatis.
      </p>

      <div class="space-y-3">
        <div>
          <label class="block text-xs font-semibold text-gray-700 uppercase mb-1">Nominal (Rp)</label>
          <input
            v-model="editAmount"
            type="text"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-base font-bold text-gray-900 focus:outline-none focus:border-blue-600"
          />
          <span class="text-xs text-[#183D2B] font-semibold mt-1 block">
            Pratinjau: {{ formatRupiah(editAmount) }}
          </span>
        </div>

        <div>
          <label class="block text-xs font-semibold text-gray-700 uppercase mb-1">Kategori</label>
          <select
            v-model="editCategoryId"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:border-blue-600"
          >
            <option
              v-for="cat in categories.filter(c => c.type.toUpperCase() === transaction?.typeSnapshot && !c.isArchived)"
              :key="cat.id"
              :value="cat.id"
            >
              {{ cat.name }} {{ cat.type === 'expense' ? `(${cat.group})` : '' }}
            </option>
          </select>
        </div>

        <div>
          <label class="block text-xs font-semibold text-gray-700 uppercase mb-1">Tanggal</label>
          <input
            v-model="editDate"
            type="date"
            :max="todayDateString"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-600"
          />
        </div>

        <div>
          <label class="block text-xs font-semibold text-gray-700 uppercase mb-1">Alasan Koreksi</label>
          <input
            v-model="editReason"
            type="text"
            placeholder="Contoh: Salah ketik nominal"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-600"
          />
        </div>
      </div>

      <div class="flex justify-end space-x-2 pt-4 border-t border-gray-100">
        <button
          @click="emit('close')"
          type="button"
          class="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer"
        >
          Batal
        </button>
        <button
          @click="handleUpdate"
          :disabled="submitting"
          type="button"
          class="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs disabled:opacity-50 cursor-pointer transition"
        >
          {{ submitting ? 'Menyimpan...' : 'Terapkan Koreksi' }}
        </button>
      </div>
    </div>
  </div>
</template>
