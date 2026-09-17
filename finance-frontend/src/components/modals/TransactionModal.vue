<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { financeApi, type Category, type IncomeSource, type SavingsGoal } from '../../api/services';
import { formatRupiah } from '../../utils/format';

const props = defineProps<{
  show: boolean;
  type: 'income' | 'expense';
  categories: Category[];
  incomeSources: IncomeSource[];
  savingsGoals: SavingsGoal[];
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'saved'): void;
}>();

const amount = ref('');
const categoryId = ref<number | null>(null);
const date = ref(new Date().toISOString().slice(0, 10));
const note = ref('');
const incomeSourceId = ref<number | null>(null);
const sourceGoalId = ref<number | null>(null);
const submitting = ref(false);

const todayDateString = computed(() => new Date().toISOString().slice(0, 10));

const filteredCategories = computed(() => {
  return props.categories.filter((c) => c.type === props.type && !c.isArchived);
});

watch(
  () => [props.show, props.type],
  ([newShow]) => {
    if (newShow) {
      amount.value = '';
      date.value = new Date().toISOString().slice(0, 10);
      note.value = '';
      sourceGoalId.value = null;

      const defaultCat = filteredCategories.value[0];
      categoryId.value = defaultCat ? defaultCat.id : null;

      const defaultSrc = props.incomeSources.find((s) => !s.isArchived);
      incomeSourceId.value = props.type === 'income' && defaultSrc ? defaultSrc.id : null;
    }
  }
);

const handleSave = async () => {
  if (!amount.value || !categoryId.value || !date.value) {
    alert('Harap lengkapi nominal, kategori, dan tanggal');
    return;
  }

  const cleanAmount = amount.value.replace(/[^0-9]/g, '');
  if (!cleanAmount || cleanAmount === '0') {
    alert('Nominal harus lebih besar dari 0');
    return;
  }

  submitting.value = true;
  try {
    await financeApi.createTransaction({
      amount: cleanAmount,
      categoryId: categoryId.value,
      date: date.value,
      note: note.value || undefined,
      incomeSourceId: props.type === 'income' ? incomeSourceId.value || undefined : undefined,
      sourceGoalId: props.type === 'expense' && sourceGoalId.value ? sourceGoalId.value : undefined,
    });
    emit('saved');
    emit('close');
  } catch (err: any) {
    alert(err.response?.data?.message || 'Gagal menyimpan transaksi');
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
    aria-labelledby="trx-modal-title"
  >
    <div class="bg-white w-full max-w-md rounded-2xl p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
      <div class="flex items-center justify-between border-b pb-3">
        <div class="flex items-center space-x-2">
          <h3 id="trx-modal-title" class="text-lg font-bold text-[#202820]">
            {{ type === 'income' ? 'Catat Pemasukan' : 'Catat Pengeluaran' }}
          </h3>
          <span
            :class="type === 'income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
            class="text-xs font-bold px-2 py-0.5 rounded"
          >
            {{ type === 'income' ? 'Uang Masuk' : 'Uang Keluar' }}
          </span>
        </div>
        <button
          @click="emit('close')"
          class="text-gray-400 hover:text-gray-600 text-lg cursor-pointer"
          aria-label="Tutup dialog"
        >
          ✕
        </button>
      </div>

      <div class="space-y-3">
        <div>
          <label class="block text-xs font-semibold text-gray-700 uppercase mb-1">Nominal (Rp)</label>
          <input
            v-model="amount"
            type="text"
            placeholder="0"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-base font-bold text-gray-900 focus:outline-none focus:border-[#183D2B]"
          />
          <span class="text-xs text-[#183D2B] font-semibold mt-1 block">
            Pratinjau: {{ formatRupiah(amount) }}
          </span>
        </div>

        <div>
          <label class="block text-xs font-semibold text-gray-700 uppercase mb-1">Kategori</label>
          <select
            v-model="categoryId"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:border-[#183D2B]"
          >
            <option v-for="cat in filteredCategories" :key="cat.id" :value="cat.id">
              {{ cat.name }} {{ cat.type === 'expense' ? `(${cat.group})` : '' }}
            </option>
          </select>
          <div v-if="filteredCategories.length === 0" class="text-xs text-amber-600 mt-1">
            Belum ada kategori aktif. Silakan buat via tombol "Kelola Kategori".
          </div>
        </div>

        <div v-if="type === 'income'">
          <label class="block text-xs font-semibold text-gray-700 uppercase mb-1">Sumber Pemasukan (Opsional)</label>
          <select
            v-model="incomeSourceId"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:border-[#183D2B]"
          >
            <option :value="null">-- Pilih Sumber Pemasukan --</option>
            <option v-for="src in incomeSources.filter(s => !s.isArchived)" :key="src.id" :value="src.id">
              {{ src.name }}
            </option>
          </select>
        </div>

        <div v-if="type === 'expense'">
          <label class="block text-xs font-semibold text-gray-700 uppercase mb-1">Sumber Dana (Opsional)</label>
          <select
            v-model="sourceGoalId"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:border-[#183D2B]"
          >
            <option :value="null">Uang Belum Disisihkan / Bebas (Default)</option>
            <option
              v-for="goal in savingsGoals.filter(g => !g.isArchived)"
              :key="goal.id"
              :value="goal.id"
            >
              {{ goal.type === 'EMERGENCY' ? '🛡️' : '🎯' }} {{ goal.name }} (Saldo: {{ formatRupiah(goal.currentBalance) }})
            </option>
          </select>
          <span class="text-[11px] text-gray-400 mt-0.5 block">
            Pilih jika biaya ini diambil dari dana darurat atau target impian yang telah disisihkan.
          </span>
        </div>

        <div>
          <label class="block text-xs font-semibold text-gray-700 uppercase mb-1">Tanggal Transaksi</label>
          <input
            v-model="date"
            type="date"
            :max="todayDateString"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#183D2B]"
          />
          <span class="text-[11px] text-gray-400 mt-0.5 block">Tanggal di masa depan tidak diizinkan.</span>
        </div>

        <div>
          <label class="block text-xs font-semibold text-gray-700 uppercase mb-1">Catatan (Opsional)</label>
          <input
            v-model="note"
            type="text"
            placeholder="Keterangan singkat..."
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#183D2B]"
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
          @click="handleSave"
          :disabled="submitting"
          type="button"
          class="px-4 py-2 text-xs font-semibold text-white bg-[#183D2B] hover:bg-[#24553d] rounded-lg shadow-xs disabled:opacity-50 cursor-pointer transition"
        >
          {{ submitting ? 'Menyimpan...' : 'Simpan Transaksi' }}
        </button>
      </div>
    </div>
  </div>
</template>
