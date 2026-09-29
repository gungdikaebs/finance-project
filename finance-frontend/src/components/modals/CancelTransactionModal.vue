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
    <div class="bg-white dark:bg-[#0D1524] rounded-t-3xl sm:rounded-2xl max-h-[92dvh] sm:max-h-[85vh] w-full max-w-md mx-auto flex flex-col shadow-2xl border border-rose-200/90 dark:border-rose-900/60 overflow-hidden animate-modal-enter">
      <!-- Header (shrink-0) -->
      <div class="px-5 sm:px-6 py-4 border-b border-rose-100 dark:border-slate-800 flex items-center justify-between shrink-0 bg-white dark:bg-[#0D1524]">
        <div class="flex items-center gap-2.5">
          <div class="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 flex items-center justify-center shrink-0 border border-rose-200 dark:border-rose-900/50">
            <AlertTriangle class="w-5 h-5" :stroke-width="2" />
          </div>
          <div>
            <h3 id="cancel-trx-title" class="text-base font-extrabold text-rose-950 dark:text-rose-300 leading-tight">Batalkan Transaksi?</h3>
            <span class="text-[11px] text-rose-700 dark:text-rose-400 font-medium">Transaksi dibatalkan dan tercatat dalam riwayat perubahan</span>
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

      <!-- Body (scrollable) -->
      <div class="p-5 sm:p-6 overflow-y-auto flex-1 overscroll-contain space-y-4">
        <p class="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
          Transaksi senilai <strong class="font-black text-slate-900 dark:text-slate-100 tabular-nums">{{ formatRupiah(transaction.amount) }}</strong> pada tanggal {{ formatDate(transaction.date) }} akan berstatus Dibatalkan dan tetap terlihat di riwayat. Pengaruhnya pada saldo akan dibalik: {{ transaction.typeSnapshot === 'INCOME' ? 'pemasukan ini dikurangi kembali dari saldo' : 'pengeluaran ini dikembalikan ke saldo' }}.
        </p>

        <div>
          <label for="cancel-transaction-reason" class="block text-xs font-bold text-slate-900 dark:text-slate-100 mb-1">Alasan Pembatalan (Opsional)</label>
          <input
            id="cancel-transaction-reason"
            v-model="cancelReason"
            type="text"
            placeholder="Contoh: Transaksi salah / dibatalkan toko"
            class="w-full min-h-[44px] px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl text-xs bg-slate-50 dark:bg-[#070B14] focus:bg-white dark:focus:bg-[#070B14] text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
          />
        </div>
      </div>

      <!-- Footer Action (shrink-0) -->
      <div class="flex items-center justify-end gap-2 p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-[#0D1524] shrink-0">
        <button
          type="button"
          @click="emit('close')"
          data-initial-focus
          class="tactile-btn min-h-[44px] px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 rounded-xl cursor-pointer border border-slate-200 dark:border-slate-800"
        >
          Kembali
        </button>
        <button
          type="button"
          @click="handleCancel"
          :disabled="submitting"
          class="tactile-btn min-h-[44px] px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs disabled:opacity-50 cursor-pointer"
        >
          {{ submitting ? 'Membatalkan...' : 'Ya, Batalkan Transaksi' }}
        </button>
      </div>
    </div>
  </div>
</template>
