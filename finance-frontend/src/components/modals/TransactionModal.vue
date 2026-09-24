<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { financeApi, type Category, type IncomeSource, type SavingsGoal, type WalletAccount } from '../../api/services';
import { formatRupiah, formatNumberInput, parseCleanNumber } from '../../utils/format';
import { useToast } from '../../composables/useToast';
import { X, ArrowDownLeft, ArrowUpRight } from 'lucide-vue-next';

const props = defineProps<{
  show: boolean;
  type: 'income' | 'expense';
  categories: Category[];
  incomeSources: IncomeSource[];
  savingsGoals: SavingsGoal[];
  wallets?: WalletAccount[];
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
const useSavingsForExpense = ref(false);
const walletAccountId = ref<number | null>(null);
const submitting = ref(false);

const todayDateString = computed(() => new Date().toISOString().slice(0, 10));

const filteredCategories = computed(() => {
  return props.categories.filter((c) => c.type === 'expense' && !c.isArchived);
});
const fundedSavingsGoals = computed(() => props.savingsGoals.filter(
  (goal) => !goal.isArchived && BigInt(goal.currentBalance ?? 0) > 0n
));
const activeWallets = computed(() => props.wallets?.filter((wallet) => !wallet.isArchived) ?? []);
const selectedGoal = computed(() => fundedSavingsGoals.value.find((goal) => goal.id === sourceGoalId.value));
const selectedWallet = computed(() => activeWallets.value.find((wallet) => wallet.id === walletAccountId.value));

const toast = useToast();
const fieldErrors = ref<{
  amount?: string;
  date?: string;
  category?: string;
  incomeSource?: string;
  sourceGoal?: string;
  wallet?: string;
}>({});

const handleAmountInput = (e: Event) => {
  const target = e.target as HTMLInputElement;
  amount.value = formatNumberInput(target.value);
  if (fieldErrors.value.amount) {
    delete fieldErrors.value.amount;
  }
  if (fieldErrors.value.sourceGoal) {
    delete fieldErrors.value.sourceGoal;
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
      useSavingsForExpense.value = false;

      categoryId.value = null;

      const defaultSrc = props.incomeSources.find((s) => !s.isArchived);
      incomeSourceId.value = defaultSrc ? defaultSrc.id : null;

      const defaultWallet = activeWallets.value[0];
      walletAccountId.value = props.type === 'expense' && activeWallets.value.length > 1
        ? null
        : (defaultWallet?.id ?? null);
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

  if (props.type === 'expense' && activeWallets.value.length > 1 && !walletAccountId.value) {
    fieldErrors.value.wallet = 'Pilih rekening atau dompet untuk membayar';
    if (!hasError) toast.error(fieldErrors.value.wallet);
    hasError = true;
  }

  if (props.type === 'expense' && useSavingsForExpense.value) {
    if (!selectedGoal.value) {
      fieldErrors.value.sourceGoal = 'Pilih tabungan yang akan digunakan';
      if (!hasError) toast.error('Pilih tabungan yang akan digunakan');
      hasError = true;
    } else if (cleanAmount && BigInt(cleanAmount) > BigInt(selectedGoal.value.currentBalance ?? 0)) {
      fieldErrors.value.sourceGoal = `Dana di tabungan ini hanya ${formatRupiah(selectedGoal.value.currentBalance)}`;
      if (!hasError) toast.error(fieldErrors.value.sourceGoal);
      hasError = true;
    }
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
      walletAccountId: walletAccountId.value || undefined,
      sourceGoalId: props.type === 'expense' && useSavingsForExpense.value && sourceGoalId.value ? sourceGoalId.value : undefined,
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
    <div class="bg-white dark:bg-[#16201A] rounded-t-3xl sm:rounded-2xl max-h-[92dvh] sm:max-h-[85vh] w-full max-w-md mx-auto flex flex-col shadow-2xl border border-stone-200/90 dark:border-[#243329] overflow-hidden animate-modal-enter">
      <!-- Modal Header (shrink-0) -->
      <div class="px-5 py-4 border-b border-stone-100 dark:border-[#243329] flex items-center justify-between shrink-0 bg-white dark:bg-[#16201A]">
        <div class="flex items-center gap-2.5">
          <div
            class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            :class="type === 'income' ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400' : 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-400'"
          >
            <ArrowDownLeft v-if="type === 'income'" class="w-5 h-5" :stroke-width="2.5" />
            <ArrowUpRight v-else class="w-5 h-5" :stroke-width="2.5" />
          </div>
          <div>
            <h3 id="trx-modal-title" class="text-base font-extrabold text-[#18221B] dark:text-[#F0F4F1] leading-tight">
              {{ type === 'income' ? 'Catat Pemasukan' : 'Catat Pengeluaran' }}
            </h3>
            <span
              :class="type === 'income' ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'"
              class="text-[11px] font-bold"
            >
              {{ type === 'income' ? 'Arus Uang Masuk' : 'Arus Uang Keluar' }}
            </span>
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
        <div>
          <label for="transaction-amount" class="block text-xs font-bold text-[#18221B] dark:text-[#F0F4F1] mb-1">Nominal (Rp)</label>
          <input
            id="transaction-amount"
            :value="amount"
            @input="handleAmountInput"
            type="text"
            inputmode="numeric"
            placeholder="0"
            class="w-full px-3.5 py-3 border rounded-xl text-base font-bold tabular-nums text-[#18221B] dark:text-[#F0F4F1] bg-stone-50/70 dark:bg-[#0E1410] focus:bg-white dark:focus:bg-[#0E1410] focus:outline-none focus:ring-2"
            :class="fieldErrors.amount ? 'border-rose-400 focus:ring-rose-200 focus:border-rose-500' : 'border-stone-200 dark:border-[#243329] focus:ring-[#183D2B]/20 dark:focus:ring-[#B8DF38]/20 focus:border-[#183D2B] dark:focus:border-[#B8DF38]'"
            autofocus
          />
          <p v-if="fieldErrors.amount" class="text-xs text-rose-600 dark:text-rose-400 mt-1 font-semibold">
            {{ fieldErrors.amount }}
          </p>
        </div>

        <!-- Expense: Pilih Kategori -->
        <div v-if="type === 'expense'">
          <label for="expense-category" class="block text-xs font-bold text-[#18221B] dark:text-[#F0F4F1] mb-1">Pengeluaran untuk apa?</label>
          <select
            id="expense-category"
            v-model="categoryId"
            class="w-full min-h-[44px] px-3.5 py-2.5 border rounded-xl text-xs font-semibold bg-stone-50/70 dark:bg-[#0E1410] focus:bg-white dark:focus:bg-[#0E1410] text-[#18221B] dark:text-[#F0F4F1] focus:outline-none focus:ring-2 cursor-pointer"
            :class="fieldErrors.category ? 'border-rose-400 focus:ring-rose-200 focus:border-rose-500' : 'border-stone-200 dark:border-[#243329] focus:ring-[#183D2B]/20 dark:focus:ring-[#B8DF38]/20 focus:border-[#183D2B] dark:focus:border-[#B8DF38]'"
          >
            <option :value="null" disabled>Pilih kategori</option>
            <option v-for="cat in filteredCategories" :key="cat.id" :value="cat.id">
              {{ cat.name }} ({{ cat.group === 'NEED' ? 'Kebutuhan' : 'Keinginan' }})
            </option>
          </select>
          <p v-if="fieldErrors.category" class="text-xs text-rose-600 dark:text-rose-400 mt-1 font-semibold">
            {{ fieldErrors.category }}
          </p>
          <div v-else-if="filteredCategories.length === 0" class="text-xs text-amber-600 dark:text-amber-400 mt-1">
            Belum ada kategori pengeluaran aktif. Silakan buat via menu "Kategori & Pos Dana".
          </div>
        </div>

        <!-- Income: Sumber Dana / Pemasukan -->
        <div v-if="type === 'income'">
          <label for="transaction-income-source" class="block text-xs font-bold text-[#18221B] dark:text-[#F0F4F1] mb-1">Sumber Pemasukan</label>
          <select
            id="transaction-income-source"
            v-model="incomeSourceId"
            class="w-full min-h-[44px] px-3.5 py-2.5 border rounded-xl text-xs font-semibold bg-stone-50/70 dark:bg-[#0E1410] focus:bg-white dark:focus:bg-[#0E1410] text-[#18221B] dark:text-[#F0F4F1] focus:outline-none focus:ring-2 cursor-pointer"
            :class="fieldErrors.incomeSource ? 'border-rose-400 focus:ring-rose-200 focus:border-rose-500' : 'border-stone-200 dark:border-[#243329] focus:ring-[#183D2B]/20 dark:focus:ring-[#B8DF38]/20 focus:border-[#183D2B] dark:focus:border-[#B8DF38]'"
          >
            <option v-for="src in incomeSources.filter(s => !s.isArchived)" :key="src.id" :value="src.id">
              {{ src.name }}
            </option>
          </select>
          <p v-if="fieldErrors.incomeSource" class="text-xs text-rose-600 dark:text-rose-400 mt-1 font-semibold">
            {{ fieldErrors.incomeSource }}
          </p>
          <div v-else-if="incomeSources.filter(s => !s.isArchived).length === 0" class="text-xs text-amber-600 dark:text-amber-400 mt-1">
            Belum ada sumber pemasukan aktif. Silakan buat via menu "Kategori & Pos Dana".
          </div>
        </div>

        <!-- Rekening fisik: tampilkan pilihan hanya bila ada lebih dari satu. -->
        <div v-if="activeWallets.length > 0">
          <template v-if="type === 'expense' && activeWallets.length === 1">
            <p class="text-xs font-bold text-[#18221B] dark:text-[#F0F4F1]">Dibayar lewat</p>
            <p class="text-xs text-stone-600 dark:text-[#98A79D] mt-1">{{ selectedWallet?.name }}. Saldo rekening/dompet ini akan berkurang.</p>
          </template>
          <template v-else>
            <label for="transaction-wallet" class="block text-xs font-bold text-[#18221B] dark:text-[#F0F4F1] mb-1">
              {{ type === 'income' ? 'Masuk ke rekening/dompet mana?' : 'Dibayar lewat rekening/dompet mana?' }}
            </label>
            <select
              id="transaction-wallet"
              v-model="walletAccountId"
              class="w-full min-h-[44px] px-3.5 py-2.5 border rounded-xl text-xs font-semibold bg-stone-50/70 dark:bg-[#0E1410] focus:bg-white dark:focus:bg-[#0E1410] text-[#18221B] dark:text-[#F0F4F1] focus:outline-none focus:ring-2 focus:ring-[#183D2B]/20 dark:focus:ring-[#B8DF38]/20 cursor-pointer"
              :class="fieldErrors.wallet ? 'border-rose-400' : 'border-stone-200 dark:border-[#243329]'"
              @change="fieldErrors.wallet = undefined"
            >
              <option v-if="type === 'expense'" :value="null" disabled>Pilih rekening/dompet</option>
              <option v-for="wallet in activeWallets" :key="wallet.id" :value="wallet.id">
                {{ wallet.name }} (Saldo: {{ formatRupiah(wallet.balance) }})
              </option>
            </select>
            <p v-if="fieldErrors.wallet" class="text-xs text-rose-600 dark:text-rose-400 mt-1 font-semibold">{{ fieldErrors.wallet }}</p>
            <p class="text-[11px] text-stone-500 dark:text-[#98A79D] mt-1">
              {{ type === 'income' ? 'Saldo rekening/dompet ini akan bertambah.' : 'Saldo rekening/dompet ini akan berkurang.' }}
            </p>
          </template>
        </div>

        <!-- Pengeluaran biasa memakai uang yang belum disisihkan. Dana tabungan adalah pilihan lanjutan. -->
        <div v-if="type === 'expense' && fundedSavingsGoals.length > 0" class="border-t border-stone-200 dark:border-[#243329] pt-4">
          <label class="flex items-start gap-3 cursor-pointer">
            <input
              v-model="useSavingsForExpense"
              type="checkbox"
              class="w-4 h-4 mt-0.5 accent-[#183D2B] dark:accent-[#B8DF38] shrink-0"
              @change="sourceGoalId = null; fieldErrors.sourceGoal = undefined"
            />
            <span>
              <span class="block text-xs font-bold text-[#18221B] dark:text-[#F0F4F1]">Gunakan dana yang sudah disisihkan</span>
              <span class="block text-[11px] text-stone-500 dark:text-[#98A79D] mt-1">Aktifkan hanya jika pengeluaran ini memakai dana tabungan atau dana darurat.</span>
            </span>
          </label>
          <div v-if="useSavingsForExpense" class="mt-3 pl-7">
            <label for="expense-savings-goal" class="block text-xs font-bold text-[#18221B] dark:text-[#F0F4F1] mb-1">Dana mana yang digunakan?</label>
            <select
              id="expense-savings-goal"
              v-model="sourceGoalId"
              class="w-full min-h-[44px] px-3.5 py-2.5 border rounded-xl text-xs font-semibold bg-stone-50/70 dark:bg-[#0E1410] text-[#18221B] dark:text-[#F0F4F1] focus:outline-none focus:ring-2 focus:ring-[#183D2B]/20 dark:focus:ring-[#B8DF38]/20 cursor-pointer"
              :class="fieldErrors.sourceGoal ? 'border-rose-400' : 'border-stone-200 dark:border-[#243329]'"
              @change="fieldErrors.sourceGoal = undefined"
            >
              <option :value="null" disabled>Pilih tabungan</option>
              <option v-for="goal in fundedSavingsGoals" :key="goal.id" :value="goal.id">
                {{ goal.name }} (Tersedia: {{ formatRupiah(goal.currentBalance) }})
              </option>
            </select>
            <p v-if="fieldErrors.sourceGoal" class="text-xs text-rose-600 dark:text-rose-400 mt-1 font-semibold">{{ fieldErrors.sourceGoal }}</p>
          </div>
        </div>

        <p v-if="type === 'expense'" class="text-[11px] leading-relaxed text-stone-600 dark:text-[#98A79D] bg-stone-50 dark:bg-[#0E1410] rounded-xl px-3 py-2.5">
          <template v-if="useSavingsForExpense && selectedGoal">Setelah dicatat, saldo rekening/dompet dan dana {{ selectedGoal.name }} berkurang. Uang yang bisa dipakai tetap.</template>
          <template v-else-if="useSavingsForExpense">Pilih dana tabungan terlebih dahulu untuk melihat dampaknya.</template>
          <template v-else>Setelah dicatat, saldo rekening/dompet dan uang yang bisa dipakai berkurang.</template>
        </p>

        <div>
          <label for="transaction-date" class="block text-xs font-bold text-[#18221B] dark:text-[#F0F4F1] mb-1">Tanggal Transaksi</label>
          <input
            id="transaction-date"
            v-model="date"
            type="date"
            :max="todayDateString"
            class="w-full min-h-[44px] px-3.5 py-2.5 border border-stone-200 dark:border-[#243329] rounded-xl text-xs font-semibold bg-stone-50/70 dark:bg-[#0E1410] focus:bg-white dark:focus:bg-[#0E1410] text-[#18221B] dark:text-[#F0F4F1] focus:outline-none focus:ring-2 focus:ring-[#183D2B]/20 dark:focus:ring-[#B8DF38]/20 cursor-pointer"
          />
          <span class="text-[10px] text-stone-500 dark:text-[#98A79D] mt-1 block">Tanggal masa depan tidak diizinkan.</span>
        </div>

        <div>
          <label for="transaction-note" class="block text-xs font-bold text-[#18221B] dark:text-[#F0F4F1] mb-1">Catatan Tambahan (Opsional)</label>
          <input
            id="transaction-note"
            v-model="note"
            type="text"
            placeholder="Keterangan singkat..."
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
          @click="handleSave"
          :disabled="submitting"
          class="tactile-btn min-h-[44px] px-5 py-2 text-xs font-bold text-white dark:text-[#0E1410] bg-[#183D2B] dark:bg-[#B8DF38] hover:bg-[#24553d] dark:hover:bg-[#A3C82E] rounded-xl shadow-sm disabled:opacity-50 cursor-pointer"
        >
          {{ submitting ? 'Menyimpan...' : 'Simpan Transaksi' }}
        </button>
      </div>
    </div>
  </div>
</template>
