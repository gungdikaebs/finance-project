<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import {
  financeApi,
  type SavingsGoal,
  type Category,
  type WalletAccount,
} from '../../api/services';
import {
  formatRupiah,
  formatNumberInput,
  parseCleanNumber,
} from '../../utils/format';
import { useToast } from '../../composables/useToast';
import {
  X,
  CheckCircle2,
  ShoppingBag,
  Info,
  Wallet,
  ArrowRight,
} from 'lucide-vue-next';

const props = defineProps<{
  show: boolean;
  goal: SavingsGoal | null;
  categories: Category[];
  wallets?: WalletAccount[];
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'completed'): void;
}>();

const toast = useToast();
const mode = ref<'SPEND' | 'MARK_ONLY'>('SPEND');
const spendAmount = ref('');
const categoryId = ref<number | null>(null);
const walletAccountId = ref<number | null>(null);
const note = ref('');
const date = ref(new Date().toISOString().slice(0, 10));
const submitting = ref(false);
const fieldErrors = ref<{
  amount?: string;
  category?: string;
  wallet?: string;
}>({});

const activeWallets = computed(
  () => props.wallets?.filter((w) => !w.isArchived) ?? [],
);
const expenseCategories = computed(
  () => props.categories.filter((c) => c.type === 'expense' && !c.isArchived),
);

const goalBalanceBig = computed(() => BigInt(props.goal?.currentBalance || '0'));
const targetPriceBig = computed(() =>
  BigInt(props.goal?.priceReference || props.goal?.targetAmount || '0'),
);

const cleanSpendAmount = computed(() => parseCleanNumber(spendAmount.value));
const cleanSpendAmountBig = computed(() =>
  cleanSpendAmount.value ? BigInt(cleanSpendAmount.value) : 0n,
);

const excessAmountBig = computed(() => {
  if (cleanSpendAmountBig.value <= 0n) return 0n;
  if (goalBalanceBig.value > cleanSpendAmountBig.value) {
    return goalBalanceBig.value - cleanSpendAmountBig.value;
  }
  return 0n;
});

const selectedWallet = computed(() =>
  activeWallets.value.find((w) => w.id === walletAccountId.value),
);

watch(
  () => props.show,
  (val) => {
    if (val && props.goal) {
      mode.value = 'SPEND';
      fieldErrors.value = {};
      date.value = new Date().toISOString().slice(0, 10);
      note.value = `Pembelian target: ${props.goal.name}`;

      // Default amount to target price or current balance (whichever is smaller if balance > target, or full balance)
      const defaultAmt =
        targetPriceBig.value > 0n && goalBalanceBig.value >= targetPriceBig.value
          ? targetPriceBig.value.toString()
          : goalBalanceBig.value.toString();
      spendAmount.value = formatNumberInput(defaultAmt);

      // Default category
      const wantCat = expenseCategories.value.find((c) => c.group === 'WANT');
      categoryId.value = wantCat ? wantCat.id : expenseCategories.value[0]?.id || null;

      // Default wallet
      const defaultW = activeWallets.value[0];
      walletAccountId.value = defaultW ? defaultW.id : null;
    }
  },
);

const handleAmountInput = (e: Event) => {
  const target = e.target as HTMLInputElement;
  spendAmount.value = formatNumberInput(target.value);
  if (fieldErrors.value.amount) delete fieldErrors.value.amount;
};

const handleExecuteComplete = async () => {
  if (!props.goal) return;
  fieldErrors.value = {};
  let hasError = false;

  if (mode.value === 'SPEND') {
    const clean = cleanSpendAmount.value;
    if (!clean || clean === '0') {
      fieldErrors.value.amount = 'Nominal pembelian harus lebih besar dari Rp 0';
      hasError = true;
    } else if (cleanSpendAmountBig.value > goalBalanceBig.value) {
      fieldErrors.value.amount = `Nominal pembelian melebihi saldo tabungan (${formatRupiah(props.goal.currentBalance)})`;
      hasError = true;
    }

    if (!categoryId.value) {
      fieldErrors.value.category = 'Pilih kategori pengeluaran';
      hasError = true;
    }

    if (activeWallets.value.length > 0 && !walletAccountId.value) {
      fieldErrors.value.wallet = 'Pilih rekening/dompet pembayaran';
      hasError = true;
    }
  }

  if (hasError) {
    toast.error('Harap lengkapi formulir dengan benar');
    return;
  }

  submitting.value = true;
  try {
    await financeApi.completeSavingsGoal(props.goal.id, {
      action: mode.value,
      amount: mode.value === 'SPEND' ? cleanSpendAmount.value : undefined,
      categoryId: mode.value === 'SPEND' ? categoryId.value || undefined : undefined,
      walletAccountId: mode.value === 'SPEND' ? walletAccountId.value || undefined : undefined,
      note: note.value || undefined,
      date: date.value,
      excessAction: 'RELEASE_TO_UNALLOCATED',
    });

    toast.success(
      mode.value === 'SPEND'
        ? `Selamat! Pembelian "${props.goal.name}" tercatat & target selesai.`
        : `Target "${props.goal.name}" berhasil ditandai selesai.`,
    );
    emit('completed');
    emit('close');
  } catch (err: any) {
    toast.error(err.response?.data?.message || 'Gagal menyelesaikan target');
  } finally {
    submitting.value = false;
  }
};
</script>

<template>
  <div
    v-if="show && goal"
    class="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center p-0 sm:p-4 glass-modal-backdrop"
    role="dialog"
    aria-modal="true"
    aria-labelledby="complete-goal-modal-title"
    @click.self="emit('close')"
  >
    <div
      class="bg-white dark:bg-[#16201A] rounded-t-3xl sm:rounded-2xl max-h-[92dvh] sm:max-h-[88vh] w-full max-w-lg mx-auto flex flex-col shadow-2xl border border-stone-200/90 dark:border-[#243329] overflow-hidden animate-modal-enter"
    >
      <!-- Header (shrink-0) -->
      <div
        class="px-5 sm:px-6 py-4 border-b border-stone-100 dark:border-[#243329] flex items-center justify-between shrink-0 bg-white dark:bg-[#16201A]"
      >
        <div class="flex items-center gap-2.5">
          <div
            class="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-[#B8DF38] flex items-center justify-center shrink-0 border border-emerald-100 dark:border-emerald-800/40"
          >
            <ShoppingBag class="w-5 h-5" :stroke-width="2" />
          </div>
          <div>
            <h3
              id="complete-goal-modal-title"
              class="text-base font-extrabold text-[#18221B] dark:text-[#F0F4F1] leading-tight"
            >
              Wujudkan & Selesaikan Impian
            </h3>
            <span class="text-[11px] text-emerald-800 dark:text-[#B8DF38] font-bold">
              {{ goal.name }} • Saldo: {{ formatRupiah(goal.currentBalance) }}
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

      <!-- Mode Selector Tabs -->
      <div class="px-5 sm:px-6 pt-3 pb-1 border-b border-stone-100 dark:border-[#243329] bg-stone-50/50 dark:bg-[#0E1410]/50 shrink-0">
        <div class="grid grid-cols-2 p-1 bg-stone-200/60 dark:bg-[#16201A] rounded-xl text-xs font-bold">
          <button
            type="button"
            @click="mode = 'SPEND'"
            class="py-2 px-3 rounded-lg transition-all text-center cursor-pointer"
            :class="
              mode === 'SPEND'
                ? 'bg-white dark:bg-[#0E1410] text-[#183D2B] dark:text-[#B8DF38] shadow-xs'
                : 'text-stone-600 dark:text-[#98A79D] hover:text-stone-900 dark:hover:text-white'
            "
          >
            Beli & Catat Pengeluaran
          </button>
          <button
            type="button"
            @click="mode = 'MARK_ONLY'"
            class="py-2 px-3 rounded-lg transition-all text-center cursor-pointer"
            :class="
              mode === 'MARK_ONLY'
                ? 'bg-white dark:bg-[#0E1410] text-[#183D2B] dark:text-[#B8DF38] shadow-xs'
                : 'text-stone-600 dark:text-[#98A79D] hover:text-stone-900 dark:hover:text-white'
            "
          >
            Selesai Tanpa Belanja
          </button>
        </div>
      </div>

      <!-- Form Body (scrollable) -->
      <div class="p-5 sm:p-6 overflow-y-auto flex-1 overscroll-contain space-y-4">
        <!-- MODE 1: SPEND -->
        <template v-if="mode === 'SPEND'">
          <div class="p-3.5 bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/30 rounded-xl text-xs space-y-1">
            <div class="flex items-center gap-1.5 font-bold text-[#183D2B] dark:text-[#B8DF38]">
              <CheckCircle2 class="w-4 h-4 shrink-0" />
              <span>Gunakan Dana Tabungan yang Terkumpul</span>
            </div>
            <p class="text-[11px] text-stone-600 dark:text-[#98A79D] leading-relaxed">
              Catat pembelian aktual menggunakan uang dari tabungan ini. Saldo rekening pembayaran akan berkurang, dan target akan ditandai selesai.
            </p>
          </div>

          <!-- Nominal Pembelian -->
          <div>
            <div class="flex justify-between items-center mb-1">
              <label for="spend-goal-amount" class="block text-xs font-bold text-[#18221B] dark:text-[#F0F4F1]">
                Nominal Pembelian Aktual (Rp)
              </label>
              <span class="text-[11px] text-stone-500 dark:text-[#98A79D] font-medium">
                Tersedia: {{ formatRupiah(goal.currentBalance) }}
              </span>
            </div>
            <input
              id="spend-goal-amount"
              :value="spendAmount"
              @input="handleAmountInput"
              type="text"
              inputmode="numeric"
              placeholder="0"
              class="w-full px-3.5 py-2.5 border rounded-xl text-base font-bold tabular-nums text-[#18221B] dark:text-[#F0F4F1] bg-stone-50/70 dark:bg-[#0E1410] focus:bg-white dark:focus:bg-[#0E1410] focus:outline-none focus:ring-2"
              :class="
                fieldErrors.amount
                  ? 'border-rose-400 focus:ring-rose-200'
                  : 'border-stone-200 dark:border-[#243329] focus:ring-[#183D2B]/20 dark:focus:ring-[#B8DF38]/20'
              "
            />
            <p v-if="fieldErrors.amount" class="text-xs text-rose-600 dark:text-rose-400 mt-1 font-semibold">
              {{ fieldErrors.amount }}
            </p>

            <!-- Callout bila pembelian lebih murah dari saldo -->
            <div
              v-if="excessAmountBig > 0n"
              class="mt-2.5 p-3 bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/40 rounded-xl text-xs flex items-start gap-2 text-amber-900 dark:text-amber-200"
            >
              <Info class="w-4 h-4 shrink-0 mt-0.5 text-amber-700 dark:text-amber-400" />
              <div class="space-y-0.5">
                <span class="font-bold">Ada sisa dana tabungan sebesar {{ formatRupiah(excessAmountBig) }}</span>
                <p class="text-[11px] text-stone-600 dark:text-[#98A79D]">
                  Sisa dana ini akan otomatis dikembalikan ke <strong>Uang Siap Pakai</strong> tanpa dipindahkan diam-diam.
                </p>
              </div>
            </div>
          </div>

          <!-- Kategori Pengeluaran -->
          <div>
            <label for="spend-category" class="block text-xs font-bold text-[#18221B] dark:text-[#F0F4F1] mb-1">
              Kategori Pengeluaran
            </label>
            <select
              id="spend-category"
              v-model="categoryId"
              class="w-full min-h-[44px] px-3.5 py-2.5 border rounded-xl text-xs font-semibold bg-stone-50/70 dark:bg-[#0E1410] text-[#18221B] dark:text-[#F0F4F1] focus:outline-none focus:ring-2 focus:ring-[#183D2B]/20 dark:focus:ring-[#B8DF38]/20 cursor-pointer"
              :class="fieldErrors.category ? 'border-rose-400' : 'border-stone-200 dark:border-[#243329]'"
            >
              <option :value="null" disabled>-- Pilih Kategori --</option>
              <option v-for="cat in expenseCategories" :key="cat.id" :value="cat.id">
                {{ cat.name }} ({{ cat.group === 'NEED' ? 'Kebutuhan' : 'Keinginan' }})
              </option>
            </select>
            <p v-if="fieldErrors.category" class="text-xs text-rose-600 dark:text-rose-400 mt-1 font-semibold">
              {{ fieldErrors.category }}
            </p>
          </div>

          <!-- Rekening / Dompet Pembayaran -->
          <div v-if="activeWallets.length > 0">
            <label for="spend-wallet" class="block text-xs font-bold text-[#18221B] dark:text-[#F0F4F1] mb-1">
              Dibayar lewat Rekening / Dompet mana?
            </label>
            <select
              id="spend-wallet"
              v-model="walletAccountId"
              class="w-full min-h-[44px] px-3.5 py-2.5 border rounded-xl text-xs font-semibold bg-stone-50/70 dark:bg-[#0E1410] text-[#18221B] dark:text-[#F0F4F1] focus:outline-none focus:ring-2 focus:ring-[#183D2B]/20 dark:focus:ring-[#B8DF38]/20 cursor-pointer"
              :class="fieldErrors.wallet ? 'border-rose-400' : 'border-stone-200 dark:border-[#243329]'"
            >
              <option :value="null" disabled>-- Pilih Rekening / Dompet --</option>
              <option v-for="w in activeWallets" :key="w.id" :value="w.id">
                {{ w.name }} (Saldo: {{ formatRupiah(w.balance) }})
              </option>
            </select>
            <p v-if="fieldErrors.wallet" class="text-xs text-rose-600 dark:text-rose-400 mt-1 font-semibold">
              {{ fieldErrors.wallet }}
            </p>
          </div>

          <!-- Rincian Dampak Finansial Transparan -->
          <div class="p-3.5 bg-stone-50 dark:bg-[#0E1410] border border-stone-200/80 dark:border-[#243329] rounded-xl text-xs space-y-2">
            <span class="font-bold text-stone-700 dark:text-[#98A79D] uppercase tracking-wider block text-[10px]">
              Dampak Setelah Transaksi Disimpan:
            </span>
            <div class="space-y-1.5 text-xs text-[#18221B] dark:text-[#F0F4F1]">
              <div class="flex items-center gap-2">
                <Wallet class="w-3.5 h-3.5 text-stone-500 shrink-0" />
                <span>
                  Saldo dompet <strong>{{ selectedWallet?.name || 'terpilih' }}</strong> berkurang {{ formatRupiah(cleanSpendAmount || '0') }}.
                </span>
              </div>
              <div class="flex items-center gap-2">
                <CheckCircle2 class="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>
                  Target <strong>{{ goal.name }}</strong> dinyatakan <strong>Selesai</strong> dan tidak lagi menerima setoran tabungan.
                </span>
              </div>
              <div class="flex items-center gap-2">
                <ArrowRight class="w-3.5 h-3.5 text-stone-500 shrink-0" />
                <span v-if="excessAmountBig > 0n">
                  Uang Siap Pakai <strong>bertambah {{ formatRupiah(excessAmountBig) }}</strong> dari sisa tabungan.
                </span>
                <span v-else>
                  Uang Siap Pakai <strong>tetap</strong> (karena dana memang sudah disisihkan sebelumnya).
                </span>
              </div>
            </div>
          </div>
        </template>

        <!-- MODE 2: MARK_ONLY -->
        <template v-else>
          <div class="p-4 bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/30 rounded-xl text-xs space-y-2">
            <div class="flex items-center gap-1.5 font-bold text-amber-900 dark:text-amber-300">
              <Info class="w-4 h-4 shrink-0" />
              <span>Selesaikan Target Tanpa Mencatat Pengeluaran</span>
            </div>
            <p class="text-[11px] text-stone-600 dark:text-[#98A79D] leading-relaxed">
              Pilih ini jika impian tercapai melalui cara lain (misalnya hadiah, bonus kantor, atau rencana dibatalkan).
            </p>
          </div>

          <div class="p-3.5 bg-stone-50 dark:bg-[#0E1410] border border-stone-200/80 dark:border-[#243329] rounded-xl text-xs space-y-2">
            <span class="font-bold text-stone-700 dark:text-[#98A79D] uppercase tracking-wider block text-[10px]">
              Dampak Setelah Dikonfirmasi:
            </span>
            <div class="space-y-1.5 text-xs text-[#18221B] dark:text-[#F0F4F1]">
              <div class="flex items-center gap-2">
                <ArrowRight class="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>
                  Seluruh saldo tabungan tersimpan sebesar <strong>{{ formatRupiah(goal.currentBalance) }}</strong> akan otomatis dilepas kembali ke <strong>Uang Siap Pakai</strong>.
                </span>
              </div>
              <div class="flex items-center gap-2">
                <CheckCircle2 class="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>
                  Target <strong>{{ goal.name }}</strong> dipindahkan ke riwayat <strong>Target Selesai</strong> dan tidak lagi menerima porsi setoran.
                </span>
              </div>
            </div>
          </div>
        </template>

        <!-- Catatan dan Tanggal -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div>
            <label for="complete-date" class="block text-xs font-bold text-[#18221B] dark:text-[#F0F4F1] mb-1">
              Tanggal
            </label>
            <input
              id="complete-date"
              v-model="date"
              type="date"
              class="w-full min-h-[44px] px-3.5 py-2.5 border border-stone-200 dark:border-[#243329] rounded-xl text-xs font-semibold bg-stone-50/70 dark:bg-[#0E1410] focus:bg-white dark:focus:bg-[#0E1410] text-[#18221B] dark:text-[#F0F4F1] focus:outline-none focus:ring-2 focus:ring-[#183D2B]/20 cursor-pointer"
            />
          </div>

          <div>
            <label for="complete-note" class="block text-xs font-bold text-[#18221B] dark:text-[#F0F4F1] mb-1">
              Catatan (Opsional)
            </label>
            <input
              id="complete-note"
              v-model="note"
              type="text"
              placeholder="Keterangan..."
              class="w-full px-3.5 py-2.5 border border-stone-200 dark:border-[#243329] rounded-xl text-xs bg-stone-50/70 dark:bg-[#0E1410] focus:bg-white dark:focus:bg-[#0E1410] text-[#18221B] dark:text-[#F0F4F1] focus:outline-none focus:ring-2 focus:ring-[#183D2B]/20"
            />
          </div>
        </div>
      </div>

      <!-- Action Buttons (shrink-0) -->
      <div
        class="flex items-center justify-end gap-2.5 p-4 border-t border-stone-100 dark:border-[#243329] bg-stone-50/80 dark:bg-[#0E1410]/70 shrink-0"
      >
        <button
          type="button"
          @click="emit('close')"
          class="tactile-btn min-h-[44px] px-4 py-2 text-xs font-semibold text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-[#243329] rounded-xl cursor-pointer border border-stone-200 dark:border-[#243329]"
        >
          Batal
        </button>
        <button
          type="button"
          @click="handleExecuteComplete"
          :disabled="submitting"
          class="tactile-btn min-h-[44px] px-5 py-2 text-xs font-bold text-white dark:text-[#0E1410] bg-[#183D2B] dark:bg-[#B8DF38] hover:bg-[#24553d] dark:hover:bg-[#a3c82e] rounded-xl shadow-xs disabled:opacity-50 cursor-pointer transition"
        >
          <span v-if="submitting">Memproses...</span>
          <span v-else-if="mode === 'SPEND'">Beli & Selesaikan Target</span>
          <span v-else>Tandai Selesai & Lepas Saldo</span>
        </button>
      </div>
    </div>
  </div>
</template>
