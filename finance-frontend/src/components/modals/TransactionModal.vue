<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { financeApi, type Category, type IncomeSource, type SavingsGoal } from '../../api/services';
import { formatRupiah, formatNumberInput, parseCleanNumber } from '../../utils/format';
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

import { useToast } from '../../composables/useToast';

const toast = useToast();
const fieldErrors = ref<{
  amount?: string;
  date?: string;
  category?: string;
  incomeSource?: string;
}>({});

const handleAmountInput = (e: Event) => {
  const target = e.target as HTMLInputElement;
  amount.value = formatNumberInput(target.value);
  if (fieldErrors.value.amount) {
    delete fieldErrors.value.amount;
  }
};

watch(
  () => props.show,
  (val) => {
    if (val) {
      fieldErrors.value = {};
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
  fieldErrors.value = {};
  const cleanAmount = parseCleanNumber(amount.value);
  let hasError = false;

  if (!cleanAmount || cleanAmount === '0') {
    fieldErrors.value.amount = 'Nominal harus lebih besar dari Rp 0';
    toast.error('Nominal harus lebih besar dari Rp 0');
    hasError = true;
  }

  if (!date.value) {
    fieldErrors.value.date = 'Harap tentukan tanggal transaksi';
    if (!hasError) toast.error('Harap tentukan tanggal transaksi');
    hasError = true;
  }

  if (props.type === 'expense' && !categoryId.value) {
    fieldErrors.value.category = 'Harap pilih kategori pengeluaran';
    if (!hasError) toast.error('Harap pilih kategori pengeluaran');
    hasError = true;
  }

  if (props.type === 'income' && !incomeSourceId.value) {
    fieldErrors.value.incomeSource = 'Harap pilih sumber pemasukan';
    if (!hasError) toast.error('Harap pilih sumber pemasukan');
    hasError = true;
  }

  if (hasError) return;

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
    toast.success(
      props.type === 'income'
        ? 'Pemasukan berhasil dicatat!'
        : 'Pengeluaran berhasil dicatat!'
    );
    emit('saved');
    emit('close');
  } catch (err: any) {
    toast.error(err.response?.data?.message || 'Gagal menyimpan transaksi');
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
    aria-labelledby="trx-modal-title"
    @click.self="emit('close')"
  >
    <div class="bg-white rounded-t-3xl sm:rounded-2xl max-h-[92dvh] sm:max-h-[85vh] w-full max-w-md mx-auto flex flex-col shadow-2xl border border-stone-200/90 overflow-hidden animate-modal-enter">
      <!-- Modal Header (shrink-0) -->
      <div class="px-5 py-4 border-b border-stone-100 flex items-center justify-between shrink-0 bg-white">
        <div class="flex items-center gap-2.5">
          <div
            class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            :class="type === 'income' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'"
          >
            <ArrowDownLeft v-if="type === 'income'" class="w-5 h-5" :stroke-width="2.5" />
            <ArrowUpRight v-else class="w-5 h-5" :stroke-width="2.5" />
          </div>
          <div>
            <h3 id="trx-modal-title" class="text-base font-extrabold text-[#18221B] leading-tight">
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
          class="tactile-btn min-w-[44px] min-h-[44px] flex items-center justify-center text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-xl cursor-pointer"
          aria-label="Tutup dialog"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Form Inputs (flex-1 overscroll-contain) -->
      <div class="p-5 overflow-y-auto flex-1 overscroll-contain space-y-4">
        <div>
          <label class="block text-xs font-bold text-[#18221B] mb-1">Nominal (Rp)</label>
          <input
            :value="amount"
            @input="handleAmountInput"
            type="text"
            inputmode="numeric"
            placeholder="0"
            class="w-full px-3.5 py-3 border rounded-xl text-base font-bold tabular-nums text-[#18221B] bg-stone-50/70 focus:bg-white focus:outline-none focus:ring-2"
            :class="fieldErrors.amount ? 'border-rose-400 focus:ring-rose-200 focus:border-rose-500' : 'border-stone-200 focus:ring-[#183D2B]/20 focus:border-[#183D2B]'"
            autofocus
          />
          <p v-if="fieldErrors.amount" class="text-xs text-rose-600 mt-1 font-semibold">
            {{ fieldErrors.amount }}
          </p>
        </div>

        <!-- Expense: Pilih Kategori -->
        <div v-if="type === 'expense'">
          <label class="block text-xs font-bold text-[#18221B] mb-1">Kategori Pengeluaran</label>
          <select
            v-model="categoryId"
            class="w-full min-h-[44px] px-3.5 py-2.5 border rounded-xl text-xs font-semibold bg-stone-50/70 focus:bg-white text-[#18221B] focus:outline-none focus:ring-2 cursor-pointer"
            :class="fieldErrors.category ? 'border-rose-400 focus:ring-rose-200 focus:border-rose-500' : 'border-stone-200 focus:ring-[#183D2B]/20 focus:border-[#183D2B]'"
          >
            <option v-for="cat in filteredCategories" :key="cat.id" :value="cat.id">
              {{ cat.name }} ({{ cat.group === 'NEED' ? 'Kebutuhan' : 'Keinginan' }})
            </option>
          </select>
          <p v-if="fieldErrors.category" class="text-xs text-rose-600 mt-1 font-semibold">
            {{ fieldErrors.category }}
          </p>
          <div v-else-if="filteredCategories.length === 0" class="text-xs text-amber-600 mt-1">
            Belum ada kategori pengeluaran aktif. Silakan buat via menu "Kategori & Pos Dana".
          </div>
        </div>

        <!-- Income: Sumber Dana / Pemasukan -->
        <div v-if="type === 'income'">
          <label class="block text-xs font-bold text-[#18221B] mb-1">Sumber Pemasukan</label>
          <select
            v-model="incomeSourceId"
            class="w-full min-h-[44px] px-3.5 py-2.5 border rounded-xl text-xs font-semibold bg-stone-50/70 focus:bg-white text-[#18221B] focus:outline-none focus:ring-2 cursor-pointer"
            :class="fieldErrors.incomeSource ? 'border-rose-400 focus:ring-rose-200 focus:border-rose-500' : 'border-stone-200 focus:ring-[#183D2B]/20 focus:border-[#183D2B]'"
          >
            <option v-for="src in incomeSources.filter(s => !s.isArchived)" :key="src.id" :value="src.id">
              {{ src.name }}
            </option>
          </select>
          <p v-if="fieldErrors.incomeSource" class="text-xs text-rose-600 mt-1 font-semibold">
            {{ fieldErrors.incomeSource }}
          </p>
          <div v-else-if="incomeSources.filter(s => !s.isArchived).length === 0" class="text-xs text-amber-600 mt-1">
            Belum ada sumber pemasukan aktif. Silakan buat via menu "Kategori & Pos Dana".
          </div>
        </div>

        <!-- Expense: Sumber Dana Tersisih (Opsional) -->
        <div v-if="type === 'expense'">
          <label class="block text-xs font-bold text-[#18221B] mb-1">Pos / Sumber Dana (Opsional)</label>
          <select
            v-model="sourceGoalId"
            class="w-full min-h-[44px] px-3.5 py-2.5 border border-stone-200 rounded-xl text-xs font-semibold bg-stone-50/70 focus:bg-white text-[#18221B] focus:outline-none focus:ring-2 focus:ring-[#183D2B]/20 cursor-pointer"
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
            class="w-full min-h-[44px] px-3.5 py-2.5 border border-stone-200 rounded-xl text-xs font-semibold bg-stone-50/70 focus:bg-white text-[#18221B] focus:outline-none focus:ring-2 focus:ring-[#183D2B]/20 cursor-pointer"
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

      <!-- Action Buttons (shrink-0) -->
      <div class="flex items-center justify-end gap-2.5 p-4 border-t border-stone-100 bg-stone-50/80 shrink-0">
        <button
          type="button"
          @click="emit('close')"
          class="tactile-btn min-h-[44px] px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl cursor-pointer border border-stone-200"
        >
          Batal
        </button>
        <button
          type="button"
          @click="handleSave"
          :disabled="submitting"
          class="tactile-btn min-h-[44px] px-5 py-2 text-xs font-bold text-white bg-[#183D2B] hover:bg-[#24553d] rounded-xl shadow-sm disabled:opacity-50 cursor-pointer"
        >
          {{ submitting ? 'Menyimpan...' : 'Simpan Transaksi' }}
        </button>
      </div>
    </div>
  </div>
</template>
