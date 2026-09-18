<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { financeApi, type Category, type IncomeSource, type SavingsGoal } from '../../api/services';
import { formatRupiah } from '../../utils/format';
import { X, ArrowDownLeft, ArrowUpRight } from 'lucide-vue-next';

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
  return props.categories.filter((c) => c.type === 'expense' && !c.isArchived);
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
      incomeSourceId.value = defaultSrc ? defaultSrc.id : null;
    }
  }
);

const handleSave = async () => {
  const cleanAmount = amount.value.replace(/[^0-9]/g, '');
  if (!cleanAmount || cleanAmount === '0') {
    alert('Nominal harus lebih besar dari 0');
    return;
  }

  if (!date.value) {
    alert('Harap tentukan tanggal transaksi');
    return;
  }

  if (props.type === 'expense' && !categoryId.value) {
    alert('Harap pilih kategori pengeluaran');
    return;
  }

  if (props.type === 'income' && !incomeSourceId.value) {
    alert('Harap pilih sumber pemasukan');
    return;
  }

  submitting.value = true;
  try {
    const incomeCat = props.categories.find((c) => c.type === 'income' && !c.isArchived);
    const catIdToSend = props.type === 'expense' ? (categoryId.value || undefined) : (incomeCat ? incomeCat.id : undefined);

    await financeApi.createTransaction({
      amount: cleanAmount,
      categoryId: catIdToSend,
      date: date.value,
      note: note.value || undefined,
      incomeSourceId: props.type === 'income' ? (incomeSourceId.value || undefined) : undefined,
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
    class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 glass-modal-backdrop overflow-y-auto"
    role="dialog"
    aria-modal="true"
    aria-labelledby="trx-modal-title"
    @click.self="emit('close')"
  >
    <div class="fintech-card rounded-2xl w-full max-w-md p-5 sm:p-6 space-y-4 animate-modal-enter border border-stone-200/90 shadow-2xl max-h-[90vh] overflow-y-auto">
      <!-- Modal Header -->
      <div class="flex items-center justify-between border-b border-stone-100 pb-3.5">
        <div class="flex items-center gap-2.5">
          <div
            class="w-9 h-9 rounded-xl flex items-center justify-center"
            :class="type === 'income' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'"
          >
            <ArrowDownLeft v-if="type === 'income'" class="w-5 h-5" :stroke-width="2.5" />
            <ArrowUpRight v-else class="w-5 h-5" :stroke-width="2.5" />
          </div>
          <div>
            <h3 id="trx-modal-title" class="text-base font-extrabold text-[#18221B]">
              {{ type === 'income' ? 'Catat Pemasukan' : 'Catat Pengeluaran' }}
            </h3>
            <span
              :class="type === 'income' ? 'text-emerald-700' : 'text-rose-700'"
              class="text-[11px] font-bold"
            >
              {{ type === 'income' ? 'Arus Uang Masuk' : 'Arus Uang Keluar' }}
            </span>
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

      <!-- Form Inputs -->
      <div class="space-y-3.5">
        <div>
          <label class="block text-xs font-bold text-[#18221B] mb-1">Nominal (Rp)</label>
          <input
            v-model="amount"
            type="text"
            placeholder="0"
            class="w-full px-3.5 py-2.5 border border-stone-200 rounded-xl text-base font-extrabold text-[#18221B] bg-stone-50/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#183D2B]/20 tabular-nums"
          />
          <span class="text-xs text-[#183D2B] font-bold mt-1 block tabular-nums">
            Pratinjau: {{ formatRupiah(amount) }}
          </span>
        </div>

        <!-- Kategori Pengeluaran (Hanya untuk Pengeluaran) -->
        <div v-if="type === 'expense'">
          <label class="block text-xs font-bold text-[#18221B] mb-1">Kategori Pengeluaran</label>
          <select
            v-model="categoryId"
            class="w-full px-3.5 py-2.5 border border-stone-200 rounded-xl text-xs font-semibold bg-stone-50/70 focus:bg-white text-[#18221B] focus:outline-none focus:ring-2 focus:ring-[#183D2B]/20 cursor-pointer"
          >
            <option v-for="cat in filteredCategories" :key="cat.id" :value="cat.id">
              {{ cat.name }} ({{ cat.group === 'NEED' ? 'Kebutuhan' : 'Keinginan' }})
            </option>
          </select>
          <div v-if="filteredCategories.length === 0" class="text-xs text-amber-600 mt-1">
            Belum ada kategori pengeluaran aktif. Silakan buat via menu "Kategori & Pos Dana".
          </div>
        </div>

        <!-- Sumber Pemasukan (Hanya untuk Pemasukan) -->
        <div v-if="type === 'income'">
          <label class="block text-xs font-bold text-[#18221B] mb-1">Sumber Pemasukan</label>
          <select
            v-model="incomeSourceId"
            class="w-full px-3.5 py-2.5 border border-stone-200 rounded-xl text-xs font-semibold bg-stone-50/70 focus:bg-white text-[#18221B] focus:outline-none focus:ring-2 focus:ring-[#183D2B]/20 cursor-pointer"
          >
            <option v-for="src in incomeSources.filter(s => !s.isArchived)" :key="src.id" :value="src.id">
              {{ src.name }}
            </option>
          </select>
          <div v-if="incomeSources.filter(s => !s.isArchived).length === 0" class="text-xs text-amber-600 mt-1">
            Belum ada sumber pemasukan aktif. Silakan buat via menu "Kategori & Pos Dana".
          </div>
        </div>

        <div v-if="type === 'expense'">
          <label class="block text-xs font-bold text-[#18221B] mb-1">Pos / Sumber Dana (Opsional)</label>
          <select
            v-model="sourceGoalId"
            class="w-full px-3.5 py-2.5 border border-stone-200 rounded-xl text-xs font-semibold bg-stone-50/70 focus:bg-white text-[#18221B] focus:outline-none focus:ring-2 focus:ring-[#183D2B]/20 cursor-pointer"
          >
            <option :value="null">Uang Belum Disisihkan / Bebas (Default)</option>
            <option
              v-for="goal in savingsGoals.filter(g => !g.isArchived)"
              :key="goal.id"
              :value="goal.id"
            >
              [{{ goal.type === 'EMERGENCY' ? 'Darurat' : 'Target' }}] {{ goal.name }} (Saldo: {{ formatRupiah(goal.currentBalance) }})
            </option>
          </select>
          <span class="text-[10px] text-stone-500 mt-1 block">
            Pilih jika biaya ini diambil dari dana darurat atau target impian yang telah disisihkan.
          </span>
        </div>

        <div>
          <label class="block text-xs font-bold text-[#18221B] mb-1">Tanggal Transaksi</label>
          <input
            v-model="date"
            type="date"
            :max="todayDateString"
            class="w-full px-3.5 py-2.5 border border-stone-200 rounded-xl text-xs font-semibold bg-stone-50/70 focus:bg-white text-[#18221B] focus:outline-none focus:ring-2 focus:ring-[#183D2B]/20 cursor-pointer"
          />
          <span class="text-[10px] text-stone-500 mt-1 block">Tanggal masa depan tidak diizinkan.</span>
        </div>

        <div>
          <label class="block text-xs font-bold text-[#18221B] mb-1">Catatan Tambahan (Opsional)</label>
          <input
            v-model="note"
            type="text"
            placeholder="Keterangan singkat..."
            class="w-full px-3.5 py-2.5 border border-stone-200 rounded-xl text-xs bg-stone-50/70 focus:bg-white text-[#18221B] focus:outline-none focus:ring-2 focus:ring-[#183D2B]/20"
          />
        </div>
      </div>

      <!-- Action Buttons -->
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
          @click="handleSave"
          :disabled="submitting"
          class="tactile-btn px-4 py-2 text-xs font-bold text-white bg-[#183D2B] hover:bg-[#24553d] rounded-xl shadow-sm disabled:opacity-50 cursor-pointer"
        >
          {{ submitting ? 'Menyimpan...' : 'Simpan Transaksi' }}
        </button>
      </div>
    </div>
  </div>
</template>
