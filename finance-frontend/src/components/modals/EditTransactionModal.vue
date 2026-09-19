<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { financeApi, type Transaction, type Category } from '../../api/services';
import { formatNumberInput, parseCleanNumber } from '../../utils/format';
import { Edit3, X } from 'lucide-vue-next';

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

import { useToast } from '../../composables/useToast';

const toast = useToast();
const amountError = ref('');

const handleAmountInput = (e: Event) => {
  const target = e.target as HTMLInputElement;
  editAmount.value = formatNumberInput(target.value);
  if (amountError.value) amountError.value = '';
};

watch(
  () => [props.show, props.transaction],
  ([newShow, newTx]) => {
    amountError.value = '';
    const tx = newTx as Transaction | null;
    if (newShow && tx) {
      editAmount.value = formatNumberInput(tx.amount);
      editCategoryId.value = tx.categoryId;
      editDate.value = tx.date.slice(0, 10);
      editReason.value = '';
    }
  },
  { immediate: true }
);

const handleUpdate = async () => {
  amountError.value = '';
  if (!props.transaction) return;
  const cleanAmount = parseCleanNumber(editAmount.value);
  if (!cleanAmount || cleanAmount === '0') {
    amountError.value = 'Nominal harus lebih besar dari Rp 0';
    toast.error('Nominal harus lebih besar dari Rp 0');
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
    toast.success('Koreksi transaksi berhasil disimpan!');
    emit('saved');
    emit('close');
  } catch (err: any) {
    toast.error(err.response?.data?.message || 'Gagal mengoreksi transaksi');
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
    aria-labelledby="edit-trx-title"
    @click.self="emit('close')"
  >
    <div class="bg-white dark:bg-[#16201A] rounded-t-3xl sm:rounded-2xl max-h-[92dvh] sm:max-h-[85vh] w-full max-w-md mx-auto flex flex-col shadow-2xl border border-stone-200/90 dark:border-[#243329] overflow-hidden animate-modal-enter">
      <!-- Modal Header (shrink-0) -->
      <div class="px-5 py-4 border-b border-stone-100 dark:border-[#243329] flex items-center justify-between shrink-0 bg-white dark:bg-[#16201A]">
        <div class="flex items-center gap-2.5">
          <div class="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Edit3 class="w-5 h-5" />
          </div>
          <div>
            <h3 id="edit-trx-title" class="text-base font-extrabold text-[#18221B] dark:text-[#F0F4F1] leading-tight">Koreksi Transaksi</h3>
            <span class="text-[11px] text-stone-500 dark:text-[#98A79D] font-medium">Revisi nilai dengan jejak audit D-004</span>
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
      <div class="p-5 overflow-y-auto flex-1 overscroll-contain space-y-4">
        <p class="text-xs text-stone-500 dark:text-[#98A79D] leading-relaxed font-normal">
          Perubahan nilai atau tanggal akan dicatat sebagai riwayat revisi dan saldo utama akan dihitung ulang secara otomatis.
        </p>

        <div>
          <label class="block text-xs font-bold text-[#18221B] dark:text-[#F0F4F1] mb-1">Nominal Baru (Rp)</label>
          <input
            :value="editAmount"
            @input="handleAmountInput"
            type="text"
            inputmode="numeric"
            class="w-full px-3.5 py-3 border rounded-xl text-base font-bold tabular-nums text-[#18221B] dark:text-[#F0F4F1] bg-stone-50/70 dark:bg-[#0E1410] focus:bg-white dark:focus:bg-[#0E1410] focus:outline-none focus:ring-2"
            :class="amountError ? 'border-rose-400 focus:ring-rose-200 focus:border-rose-500' : 'border-stone-200 dark:border-[#243329] focus:ring-[#183D2B]/20 dark:focus:ring-[#B8DF38]/20 focus:border-[#183D2B] dark:focus:border-[#B8DF38]'"
            autofocus
          />
          <p v-if="amountError" class="text-xs text-rose-600 dark:text-rose-400 mt-1 font-semibold">
            {{ amountError }}
          </p>
        </div>

        <div>
          <label class="block text-xs font-bold text-[#18221B] dark:text-[#F0F4F1] mb-1">Kategori</label>
          <select
            v-model="editCategoryId"
            class="w-full min-h-[44px] px-3.5 py-2.5 border border-stone-200 dark:border-[#243329] rounded-xl text-xs font-semibold bg-stone-50/70 dark:bg-[#0E1410] focus:bg-white dark:focus:bg-[#0E1410] text-[#18221B] dark:text-[#F0F4F1] focus:outline-none focus:ring-2 focus:ring-[#183D2B]/20 dark:focus:ring-[#B8DF38]/20 cursor-pointer"
          >
            <option
              v-for="cat in categories.filter(c => c.type.toUpperCase() === transaction?.typeSnapshot && !c.isArchived)"
              :key="cat.id"
              :value="cat.id"
            >
              {{ cat.name }} {{ cat.type === 'expense' ? `(${cat.group === 'NEED' ? 'Kebutuhan' : 'Keinginan'})` : '' }}
            </option>
          </select>
        </div>

        <div>
          <label class="block text-xs font-bold text-[#18221B] dark:text-[#F0F4F1] mb-1">Tanggal Transaksi</label>
          <input
            v-model="editDate"
            type="date"
            :max="todayDateString"
            class="w-full min-h-[44px] px-3.5 py-2.5 border border-stone-200 dark:border-[#243329] rounded-xl text-xs font-semibold bg-stone-50/70 dark:bg-[#0E1410] focus:bg-white dark:focus:bg-[#0E1410] text-[#18221B] dark:text-[#F0F4F1] focus:outline-none focus:ring-2 focus:ring-[#183D2B]/20 dark:focus:ring-[#B8DF38]/20 cursor-pointer"
          />
        </div>

        <div>
          <label class="block text-xs font-bold text-[#18221B] dark:text-[#F0F4F1] mb-1">Alasan Koreksi</label>
          <input
            v-model="editReason"
            type="text"
            placeholder="Contoh: Salah ketik nominal kasir"
            class="w-full px-3.5 py-2.5 border border-stone-200 dark:border-[#243329] rounded-xl text-xs bg-stone-50/70 dark:bg-[#0E1410] focus:bg-white dark:focus:bg-[#0E1410] text-[#18221B] dark:text-[#F0F4F1] focus:outline-none focus:ring-2 focus:ring-[#183D2B]/20 dark:focus:ring-[#B8DF38]/20"
          />
        </div>
      </div>

      <!-- Action Buttons (shrink-0) -->
      <div class="flex items-center justify-end gap-2.5 p-4 border-t border-stone-100 dark:border-[#243329] bg-stone-50/80 dark:bg-[#16201A] shrink-0">
        <button
          type="button"
          @click="emit('close')"
          class="tactile-btn min-h-[44px] px-4 py-2 text-xs font-semibold text-stone-600 dark:text-[#98A79D] hover:bg-stone-100 dark:hover:bg-[#243329] rounded-xl cursor-pointer border border-stone-200 dark:border-[#243329]"
        >
          Batal
        </button>
        <button
          type="button"
          @click="handleUpdate"
          :disabled="submitting"
          class="tactile-btn min-h-[44px] px-5 py-2 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-xl shadow-sm disabled:opacity-50 cursor-pointer"
        >
          {{ submitting ? 'Menyimpan...' : 'Terapkan Koreksi' }}
        </button>
      </div>
    </div>
  </div>
</template>
