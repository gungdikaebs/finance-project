<script setup lang="ts">
import { ref } from 'vue';
import { financeApi, type Transaction } from '../../api/services';
import { formatRupiah, formatDate } from '../../utils/format';
import { AlertTriangle, X } from 'lucide-vue-next';

import { useToast } from '../../composables/useToast';

const props = defineProps<{
  show: boolean;
  transaction: Transaction | null;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'saved'): void;
}>();

const toast = useToast();
const cancelReason = ref('');
const submitting = ref(false);

const handleCancel = async () => {
  if (!props.transaction) return;
  submitting.value = true;
  try {
    await financeApi.cancelTransaction(props.transaction.id, cancelReason.value || undefined);
    toast.success('Transaksi berhasil dibatalkan');
    emit('saved');
    emit('close');
  } catch (err: any) {
    toast.error(err.response?.data?.message || 'Gagal membatalkan transaksi');
  } finally {
    submitting.value = false;
  }
};
</script>

<template>
  <div
    v-if="show && transaction"
    class="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center p-0 sm:p-4 glass-modal-backdrop"
    role="dialog"
    aria-modal="true"
    aria-labelledby="cancel-trx-title"
    @click.self="emit('close')"
  >
    <div class="bg-white rounded-t-3xl sm:rounded-2xl max-h-[92dvh] sm:max-h-[85vh] w-full max-w-md mx-auto flex flex-col shadow-2xl border border-rose-200/90 overflow-hidden animate-modal-enter">
      <!-- Header (shrink-0) -->
      <div class="px-5 sm:px-6 py-4 border-b border-rose-100 flex items-center justify-between shrink-0 bg-white">
        <div class="flex items-center gap-2.5">
          <div class="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
            <AlertTriangle class="w-5 h-5" :stroke-width="2" />
          </div>
          <div>
            <h3 id="cancel-trx-title" class="text-base font-extrabold text-rose-950 leading-tight">Batalkan Transaksi?</h3>
            <span class="text-[11px] text-rose-700 font-medium">Pembatalan lunak berjejak audit (D-004)</span>
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
        <p class="text-xs text-stone-600 leading-relaxed font-normal">
          Transaksi senilai <strong class="font-black text-[#18221B] tabular-nums">{{ formatRupiah(transaction.amount) }}</strong> pada tanggal {{ formatDate(transaction.date) }} akan ditandai sebagai transaksi dibatalkan dan tidak lagi memengaruhi Saldo utama.
        </p>

        <div>
          <label class="block text-xs font-bold text-[#18221B] mb-1">Alasan Pembatalan (Opsional)</label>
          <input
            v-model="cancelReason"
            type="text"
            placeholder="Contoh: Transaksi salah / dibatalkan toko"
            class="w-full min-h-[44px] px-3.5 py-2.5 border border-stone-200 rounded-xl text-xs bg-stone-50/70 focus:bg-white text-[#18221B] focus:outline-none focus:ring-2 focus:ring-rose-500/20"
          />
        </div>
      </div>

      <!-- Footer Action (shrink-0) -->
      <div class="flex items-center justify-end gap-2 p-4 border-t border-stone-100 bg-stone-50/80 shrink-0">
        <button
          type="button"
          @click="emit('close')"
          class="tactile-btn min-h-[44px] px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl cursor-pointer border border-stone-200"
        >
          Kembali
        </button>
        <button
          type="button"
          @click="handleCancel"
          :disabled="submitting"
          class="tactile-btn min-h-[44px] px-4 py-2 text-xs font-bold text-white bg-rose-700 hover:bg-rose-800 rounded-xl shadow-xs disabled:opacity-50 cursor-pointer"
        >
          {{ submitting ? 'Membatalkan...' : 'Ya, Batalkan Transaksi' }}
        </button>
      </div>
    </div>
  </div>
</template>
