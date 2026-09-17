<script setup lang="ts">
import { ref } from 'vue';
import { financeApi, type Transaction } from '../../api/services';
import { formatRupiah, formatDate } from '../../utils/format';

const props = defineProps<{
  show: boolean;
  transaction: Transaction | null;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'saved'): void;
}>();

const cancelReason = ref('');
const submitting = ref(false);

const handleCancel = async () => {
  if (!props.transaction) return;
  submitting.value = true;
  try {
    await financeApi.cancelTransaction(props.transaction.id, cancelReason.value || undefined);
    emit('saved');
    emit('close');
  } catch (err: any) {
    alert(err.response?.data?.message || 'Gagal membatalkan transaksi');
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
    aria-labelledby="cancel-trx-title"
  >
    <div class="bg-white w-full max-w-md rounded-2xl p-6 shadow-xl space-y-4">
      <div class="flex items-center justify-between border-b pb-3">
        <h3 id="cancel-trx-title" class="text-lg font-bold text-red-600">Batalkan Transaksi?</h3>
        <button
          @click="emit('close')"
          class="text-gray-400 hover:text-gray-600 text-lg cursor-pointer"
          aria-label="Tutup dialog"
        >
          ✕
        </button>
      </div>

      <p class="text-xs text-gray-600">
        Transaksi senilai <strong>{{ formatRupiah(transaction.amount) }}</strong> pada tanggal {{ formatDate(transaction.date) }} akan ditandai berstatus dibatalkan dan tidak lagi memengaruhi Saldo utama.
      </p>

      <div>
        <label class="block text-xs font-semibold text-gray-700 uppercase mb-1">Alasan Pembatalan (Opsional)</label>
        <input
          v-model="cancelReason"
          type="text"
          placeholder="Contoh: Transaksi salah/dibatalkan toko"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-red-500"
        />
      </div>

      <div class="flex justify-end space-x-2 pt-4 border-t border-gray-100">
        <button
          @click="emit('close')"
          type="button"
          class="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer"
        >
          Kembali
        </button>
        <button
          @click="handleCancel"
          :disabled="submitting"
          type="button"
          class="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-xs disabled:opacity-50 cursor-pointer transition"
        >
          {{ submitting ? 'Membatalkan...' : 'Ya, Batalkan Transaksi' }}
        </button>
      </div>
    </div>
  </div>
</template>
