<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { financeApi, type Transaction, type Category } from '../../api/services';
import { formatRupiah } from '../../utils/format';
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
    class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 glass-modal-backdrop overflow-y-auto"
    role="dialog"
    aria-modal="true"
    aria-labelledby="edit-trx-title"
    @click.self="emit('close')"
  >
    <div class="fintech-card rounded-2xl w-full max-w-md p-5 sm:p-6 space-y-4 animate-modal-enter border border-stone-200/90 shadow-2xl">
      <!-- Header -->
      <div class="flex items-center justify-between border-b border-stone-100 pb-3.5">
        <div class="flex items-center gap-2.5">
          <div class="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
            <Edit3 class="w-4 h-4" :stroke-width="2" />
          </div>
          <div>
            <h3 id="edit-trx-title" class="text-base font-extrabold text-[#18221B]">Koreksi Transaksi</h3>
            <span class="text-[11px] text-stone-500 font-medium">Revisi nilai dengan jejak audit D-004</span>
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

      <p class="text-xs text-stone-500 leading-relaxed font-normal">
        Perubahan nilai atau tanggal akan dicatat sebagai riwayat revisi dan saldo utama akan dihitung ulang secara otomatis.
      </p>

      <div class="space-y-3.5">
        <div>
          <label class="block text-xs font-bold text-[#18221B] mb-1">Nominal Baru (Rp)</label>
          <input
            v-model="editAmount"
            type="text"
            class="w-full px-3.5 py-2.5 border border-stone-200 rounded-xl text-base font-extrabold text-[#18221B] bg-stone-50/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#183D2B]/20 tabular-nums"
          />
          <span class="text-xs text-[#183D2B] font-bold mt-1 block tabular-nums">
            Pratinjau: {{ formatRupiah(editAmount) }}
          </span>
        </div>

        <div>
          <label class="block text-xs font-bold text-[#18221B] mb-1">Kategori</label>
          <select
            v-model="editCategoryId"
            class="w-full px-3.5 py-2.5 border border-stone-200 rounded-xl text-xs font-semibold bg-stone-50/70 focus:bg-white text-[#18221B] focus:outline-none focus:ring-2 focus:ring-[#183D2B]/20 cursor-pointer"
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
          <label class="block text-xs font-bold text-[#18221B] mb-1">Tanggal Transaksi</label>
          <input
            v-model="editDate"
            type="date"
            :max="todayDateString"
            class="w-full px-3.5 py-2.5 border border-stone-200 rounded-xl text-xs font-semibold bg-stone-50/70 focus:bg-white text-[#18221B] focus:outline-none focus:ring-2 focus:ring-[#183D2B]/20 cursor-pointer"
          />
        </div>

        <div>
          <label class="block text-xs font-bold text-[#18221B] mb-1">Alasan Koreksi</label>
          <input
            v-model="editReason"
            type="text"
            placeholder="Contoh: Salah ketik nominal kasir"
            class="w-full px-3.5 py-2.5 border border-stone-200 rounded-xl text-xs bg-stone-50/70 focus:bg-white text-[#18221B] focus:outline-none focus:ring-2 focus:ring-[#183D2B]/20"
          />
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
          @click="handleUpdate"
          :disabled="submitting"
          class="tactile-btn px-4 py-2 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-xl shadow-xs disabled:opacity-50 cursor-pointer"
        >
          {{ submitting ? 'Menyimpan...' : 'Terapkan Koreksi' }}
        </button>
      </div>
    </div>
  </div>
</template>
