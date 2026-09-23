<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import {
  financeApi,
  type WalletAccount,
  type TransferWalletPayload,
} from '../../api/services';
import {
  formatRupiah,
  formatNumberInput,
  parseCleanNumber,
} from '../../utils/format';
import { useToast } from '../../composables/useToast';
import {
  X,
  ArrowRightLeft,
  Check,
  AlertCircle,
  Info,
} from 'lucide-vue-next';

const props = defineProps<{
  show: boolean;
  wallets: WalletAccount[];
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'transferred'): void;
}>();

const toast = useToast();

const sourceWalletId = ref<number | null>(null);
const targetWalletId = ref<number | null>(null);
const amount = ref('');
const date = ref(new Date().toISOString().slice(0, 10));
const note = ref('');
const isSubmitting = ref(false);

const fieldErrors = ref<{
  source?: string;
  target?: string;
  amount?: string;
}>({});

const selectedSourceWallet = computed(() => {
  return props.wallets.find((w) => w.id === sourceWalletId.value) || null;
});

const selectedTargetWallet = computed(() => {
  return props.wallets.find((w) => w.id === targetWalletId.value) || null;
});

const isSourceBalanceInsufficient = computed(() => {
  if (!selectedSourceWallet.value) return false;
  const clean = parseCleanNumber(amount.value);
  if (!clean) return false;
  try {
    const amtBig = BigInt(clean);
    const srcBal = BigInt(selectedSourceWallet.value.balance);
    return amtBig > srcBal;
  } catch {
    return false;
  }
});

watch(
  () => props.show,
  (val) => {
    if (val) {
      fieldErrors.value = {};
      amount.value = '';
      date.value = new Date().toISOString().slice(0, 10);
      note.value = '';

      if (props.wallets.length >= 2) {
        sourceWalletId.value = props.wallets[0]?.id ?? null;
        targetWalletId.value = props.wallets[1]?.id ?? null;
      } else if (props.wallets.length === 1) {
        sourceWalletId.value = props.wallets[0]?.id ?? null;
        targetWalletId.value = null;
      } else {
        sourceWalletId.value = null;
        targetWalletId.value = null;
      }
    }
  },
);

const handleAmountInput = (e: Event) => {
  const target = e.target as HTMLInputElement;
  amount.value = formatNumberInput(target.value);
  if (fieldErrors.value.amount) {
    delete fieldErrors.value.amount;
  }
};

const handleSwap = () => {
  const temp = sourceWalletId.value;
  sourceWalletId.value = targetWalletId.value;
  targetWalletId.value = temp;
};

const handleTransfer = async () => {
  fieldErrors.value = {};
  let hasError = false;

  if (!sourceWalletId.value) {
    fieldErrors.value.source = 'Pilih dompet asal pemindahan';
    toast.error('Pilih dompet asal pemindahan');
    hasError = true;
  }

  if (!targetWalletId.value) {
    fieldErrors.value.target = 'Pilih dompet tujuan';
    if (!hasError) toast.error('Pilih dompet tujuan');
    hasError = true;
  }

  if (sourceWalletId.value && targetWalletId.value && sourceWalletId.value === targetWalletId.value) {
    fieldErrors.value.target = 'Dompet sumber dan dompet tujuan tidak boleh sama';
    toast.error('Dompet sumber dan dompet tujuan tidak boleh sama');
    hasError = true;
  }

  const cleanAmt = parseCleanNumber(amount.value);
  if (!cleanAmt || cleanAmt === '0') {
    fieldErrors.value.amount = 'Nominal transfer harus lebih besar dari Rp 0';
    if (!hasError) toast.error('Nominal transfer harus lebih besar dari Rp 0');
    hasError = true;
  }

  if (isSourceBalanceInsufficient.value) {
    fieldErrors.value.amount = 'Saldo dompet asal tidak mencukupi untuk nominal transfer ini';
    if (!hasError) toast.error('Saldo dompet asal tidak mencukupi');
    hasError = true;
  }

  if (hasError) return;

  try {
    isSubmitting.value = true;
    const payload: TransferWalletPayload = {
      sourceWalletId: sourceWalletId.value!,
      targetWalletId: targetWalletId.value!,
      amount: cleanAmt,
      date: date.value,
      note: note.value.trim() || undefined,
    };

    const res = await financeApi.transferWallet(payload);
    toast.success(res.data.data.message || 'Transfer antar dompet berhasil diproses!');
    emit('transferred');
    emit('close');
  } catch (err: any) {
    toast.error(
      err.response?.data?.message || 'Gagal memproses transfer saldo',
    );
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <div
    v-if="show"
    class="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center p-0 sm:p-4 glass-modal-backdrop"
    @click.self="emit('close')"
  >
    <div
      class="bg-white dark:bg-[#16201A] rounded-t-3xl sm:rounded-2xl max-h-[92dvh] sm:max-h-[85vh] flex flex-col shadow-2xl border border-stone-200/80 dark:border-[#243329] w-full max-w-lg mx-auto overflow-hidden animate-in fade-in zoom-in-95 duration-200"
    >
      <!-- Modal Header (shrink-0) -->
      <div
        class="shrink-0 flex items-center justify-between p-5 border-b border-stone-100 dark:border-[#243329] bg-stone-50/50 dark:bg-[#16201A]"
      >
        <div class="flex items-center gap-3">
          <div
            class="w-10 h-10 rounded-xl bg-[#183D2B] text-[#B8DF38] flex items-center justify-center shadow-xs"
          >
            <ArrowRightLeft class="w-5 h-5" :stroke-width="2.2" />
          </div>
          <div>
            <h3 class="text-base font-extrabold text-[#18221B] dark:text-[#F0F4F1]">
              Pindah Dana Antar Dompet
            </h3>
            <p class="text-xs text-stone-500 dark:text-[#98A79D] font-medium">
              Transfer saldo antar rekening bank, dompet tunai, atau e-wallet
            </p>
          </div>
        </div>
        <button
          type="button"
          @click="emit('close')"
          class="w-10 h-10 rounded-xl flex items-center justify-center text-stone-400 hover:text-stone-700 dark:hover:text-[#F0F4F1] hover:bg-stone-100 dark:hover:bg-[#243329] tactile-btn transition-colors cursor-pointer"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Modal Body (overflow-y-auto) -->
      <div class="flex-1 overflow-y-auto overscroll-contain p-5 space-y-4">
        <!-- Callout Penjelasan Finansial D-003 -->
        <div class="p-3.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/40 text-xs text-emerald-900 dark:text-emerald-300 leading-relaxed flex items-start gap-2.5">
          <Info class="w-4 h-4 shrink-0 mt-0.5 text-emerald-700 dark:text-emerald-400" :stroke-width="2" />
          <div>
            Pemindahan ini <strong>murni memindahkan saldo fisik</strong> antar rekening atau e-wallet. Tindakan ini <strong>TIDAK</strong> dihitung sebagai pengeluaran maupun pemasukan, serta <strong>Total Saldo Utama tetap utuh</strong>.
          </div>
        </div>

        <!-- Pemilihan Dompet Asal & Tujuan -->
        <div class="space-y-3 p-4 rounded-2xl bg-stone-50/70 dark:bg-[#121A15] border border-stone-200/80 dark:border-[#243329]">
          <!-- Dompet Asal -->
          <div>
            <div class="flex items-center justify-between mb-1.5">
              <label class="text-xs font-bold text-[#18221B] dark:text-[#F0F4F1]">
                Dari Dompet (Sumber) <span class="text-rose-500">*</span>
              </label>
              <span
                v-if="selectedSourceWallet"
                class="text-xs font-bold text-[#183D2B] dark:text-[#B8DF38] tabular-nums"
              >
                Sisa: {{ formatRupiah(selectedSourceWallet.balance) }}
              </span>
            </div>
            <select
              v-model="sourceWalletId"
              class="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-[#243329] text-sm font-semibold bg-white dark:bg-[#0E1410] text-[#18221B] dark:text-[#F0F4F1] focus:outline-none focus:ring-2 focus:ring-[#183D2B]/20 dark:focus:ring-[#B8DF38]/20 focus:border-[#183D2B] dark:focus:border-[#B8DF38]"
              :class="{ 'border-rose-400 focus:ring-rose-200': fieldErrors.source }"
            >
              <option :value="null" disabled>Pilih dompet asal pemindahan...</option>
              <option
                v-for="w in wallets"
                :key="w.id"
                :value="w.id"
              >
                {{ w.name }} ({{ formatRupiah(w.balance) }})
              </option>
            </select>
            <p v-if="fieldErrors.source" class="text-xs text-rose-600 dark:text-rose-400 mt-1 font-semibold">
              {{ fieldErrors.source }}
            </p>
          </div>

          <!-- Tombol Swap Tengah -->
          <div class="flex justify-center -my-1">
            <button
              type="button"
              @click="handleSwap"
              title="Tukar posisi asal dan tujuan"
              class="w-8 h-8 rounded-full bg-white dark:bg-[#16201A] border border-stone-300 dark:border-[#243329] shadow-xs flex items-center justify-center text-stone-600 dark:text-[#98A79D] hover:text-[#183D2B] dark:hover:text-[#B8DF38] hover:border-[#183D2B] dark:hover:border-[#B8DF38] tactile-btn transition-colors cursor-pointer"
            >
              <ArrowRightLeft class="w-3.5 h-3.5 rotate-90 sm:rotate-0" />
            </button>
          </div>

          <!-- Dompet Tujuan -->
          <div>
            <div class="flex items-center justify-between mb-1.5">
              <label class="text-xs font-bold text-[#18221B] dark:text-[#F0F4F1]">
                Ke Dompet (Tujuan) <span class="text-rose-500">*</span>
              </label>
              <span
                v-if="selectedTargetWallet"
                class="text-xs font-bold text-stone-600 dark:text-[#98A79D] tabular-nums"
              >
                Saldo saat ini: {{ formatRupiah(selectedTargetWallet.balance) }}
              </span>
            </div>
            <select
              v-model="targetWalletId"
              class="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-[#243329] text-sm font-semibold bg-white dark:bg-[#0E1410] text-[#18221B] dark:text-[#F0F4F1] focus:outline-none focus:ring-2 focus:ring-[#183D2B]/20 dark:focus:ring-[#B8DF38]/20 focus:border-[#183D2B] dark:focus:border-[#B8DF38]"
              :class="{ 'border-rose-400 focus:ring-rose-200': fieldErrors.target }"
            >
              <option :value="null" disabled>Pilih dompet tujuan...</option>
              <option
                v-for="w in wallets"
                :key="w.id"
                :value="w.id"
              >
                {{ w.name }} ({{ formatRupiah(w.balance) }})
              </option>
            </select>
            <p v-if="fieldErrors.target" class="text-xs text-rose-600 dark:text-rose-400 mt-1 font-semibold">
              {{ fieldErrors.target }}
            </p>
          </div>
        </div>

        <!-- Nominal Transfer -->
        <div>
          <label class="block text-xs font-bold text-[#18221B] dark:text-[#F0F4F1] mb-1.5">
            Nominal Pindah Dana (Rp) <span class="text-rose-500">*</span>
          </label>
          <div class="relative">
            <span class="absolute left-3.5 top-1/2 -translate-y-1/2 font-extrabold text-sm text-stone-400 dark:text-[#98A79D]">
              Rp
            </span>
            <input
              type="text"
              :value="amount"
              @input="handleAmountInput"
              placeholder="0"
              class="w-full pl-11 pr-4 py-2.5 rounded-xl border border-stone-300 dark:border-[#243329] text-base font-extrabold text-[#18221B] dark:text-[#F0F4F1] bg-white dark:bg-[#0E1410] tabular-nums focus:outline-none focus:ring-2 focus:ring-[#183D2B]/20 dark:focus:ring-[#B8DF38]/20 focus:border-[#183D2B] dark:focus:border-[#B8DF38] transition-all"
              :class="{
                'border-rose-400 focus:ring-rose-200': fieldErrors.amount || isSourceBalanceInsufficient,
              }"
            />
          </div>
          <p v-if="isSourceBalanceInsufficient" class="text-xs text-rose-600 dark:text-rose-400 mt-1 font-semibold flex items-center gap-1">
            <AlertCircle class="w-3.5 h-3.5" />
            <span>Nominal melebihi saldo dompet asal ({{ formatRupiah(selectedSourceWallet?.balance) }})</span>
          </p>
          <p v-else-if="fieldErrors.amount" class="text-xs text-rose-600 dark:text-rose-400 mt-1 font-semibold">
            {{ fieldErrors.amount }}
          </p>
        </div>

        <!-- Tanggal & Catatan -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-bold text-[#18221B] dark:text-[#F0F4F1] mb-1.5">
              Tanggal Transfer
            </label>
            <input
              type="date"
              v-model="date"
              class="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-[#243329] text-sm font-semibold bg-white dark:bg-[#0E1410] text-[#18221B] dark:text-[#F0F4F1] focus:outline-none focus:ring-2 focus:ring-[#183D2B]/20 dark:focus:ring-[#B8DF38]/20 focus:border-[#183D2B] dark:focus:border-[#B8DF38]"
            />
          </div>

          <div>
            <label class="block text-xs font-bold text-[#18221B] dark:text-[#F0F4F1] mb-1.5">
              Catatan / Keterangan (Opsional)
            </label>
            <input
              type="text"
              v-model="note"
              placeholder="misal: Top up GoPay jajan"
              class="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-[#243329] text-sm font-medium bg-white dark:bg-[#0E1410] text-[#18221B] dark:text-[#F0F4F1] placeholder:text-stone-400 dark:placeholder:text-[#5E6961] focus:outline-none focus:ring-2 focus:ring-[#183D2B]/20 dark:focus:ring-[#B8DF38]/20 focus:border-[#183D2B] dark:focus:border-[#B8DF38]"
            />
          </div>
        </div>
      </div>

      <!-- Modal Footer (shrink-0) -->
      <div
        class="shrink-0 p-4 border-t border-stone-100 dark:border-[#243329] bg-stone-50/80 dark:bg-[#16201A] flex items-center justify-end gap-2.5"
      >
        <button
          type="button"
          @click="emit('close')"
          class="tactile-btn px-4 py-2.5 rounded-xl text-xs font-bold text-stone-600 dark:text-[#98A79D] hover:bg-stone-200/70 dark:hover:bg-[#243329] border border-stone-200 dark:border-[#243329] transition-colors cursor-pointer"
        >
          Batal
        </button>

        <button
          type="button"
          :disabled="isSubmitting || isSourceBalanceInsufficient || !amount || amount === '0'"
          @click="handleTransfer"
          class="tactile-btn inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-extrabold bg-[#183D2B] dark:bg-[#B8DF38] text-white dark:text-[#0E1410] hover:bg-[#122e20] dark:hover:bg-[#a3c82e] shadow-sm transition-all cursor-pointer disabled:opacity-50"
        >
          <Check class="w-4 h-4 text-[#B8DF38] dark:text-[#0E1410]" :stroke-width="2.5" />
          <span>{{ isSubmitting ? 'Memproses...' : 'Proses Pindah Dana' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>
