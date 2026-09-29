<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue';
import { financeApi, type SavingsGoal } from '../../api/services';
import { formatNumberInput, formatRupiah, parseCleanNumber } from '../../utils/format';
import { ShieldCheck, X } from 'lucide-vue-next';
import { useToast } from '../../composables/useToast';

const props = defineProps<{
  show: boolean;
  goal?: SavingsGoal;
  unallocatedMoney?: string | null;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'saved'): void;
}>();

const toast = useToast();
const amountInput = ref('');
const step = ref<'amount' | 'review'>('amount');
const submitting = ref(false);
const actionError = ref('');
const stepHeading = ref<HTMLElement | null>(null);

const amount = computed(() => BigInt(parseCleanNumber(amountInput.value)));
const available = computed(() => BigInt(props.unallocatedMoney || '0'));
const exceedsAvailable = computed(() => amount.value > available.value);
const canReview = computed(() => !!props.goal && amount.value > 0n && !exceedsAvailable.value && !submitting.value);
const availableAfterTopUp = computed(() => available.value - amount.value);
const emergencyBalanceAfterTopUp = computed(() =>
  BigInt(props.goal?.currentBalance || '0') + amount.value,
);

watch(
  () => props.show,
  (show) => {
    if (show) {
      amountInput.value = '';
      step.value = 'amount';
      actionError.value = '';
    }
  },
);

const handleAmountInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  amountInput.value = formatNumberInput(target.value);
  actionError.value = '';
};

const openReview = () => {
  if (!canReview.value) return;
  step.value = 'review';
  nextTick(() => stepHeading.value?.focus());
};

const returnToAmount = () => {
  if (submitting.value) return;
  step.value = 'amount';
  actionError.value = '';
  nextTick(() => document.getElementById('emergency-top-up-amount')?.focus());
};

const handleTopUp = async () => {
  if (!canReview.value || step.value !== 'review' || !props.goal) return;

  actionError.value = '';
  submitting.value = true;
  try {
    await financeApi.allocateSavings({
      allocations: [{ targetGoalId: props.goal.id, amount: amount.value.toString() }],
      date: new Date().toISOString().slice(0, 10),
      note: 'Tambahan Dana Pengaman satu kali',
    });
    toast.success('Tambahan ke Dana Pengaman berhasil disimpan.');
    emit('saved');
    emit('close');
  } catch (error: any) {
    actionError.value = error.response?.status === 400
      ? 'Uang yang bisa dipakai mungkin sudah berubah. Perbarui data lalu coba lagi.'
      : 'Tambahan belum berhasil disimpan. Periksa koneksi lalu coba lagi.';
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
    aria-labelledby="emergency-top-up-title"
    @click.self="!submitting && emit('close')"
  >
    <div class="bg-white dark:bg-[#0D1524] rounded-t-3xl sm:rounded-2xl max-h-[92dvh] sm:max-h-[85vh] w-full max-w-md mx-auto flex flex-col shadow-2xl border border-slate-200/90 dark:border-slate-800 overflow-hidden animate-modal-enter">
      <div class="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0 bg-white dark:bg-[#0D1524]">
        <div class="flex items-center gap-2.5">
          <div class="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-200/60 dark:border-blue-900/40">
            <ShieldCheck class="w-5 h-5 text-blue-600 dark:text-blue-400" :stroke-width="2" />
          </div>
          <div>
            <h3 id="emergency-top-up-title" ref="stepHeading" tabindex="-1" class="text-base font-extrabold text-slate-900 dark:text-slate-100 leading-tight focus:outline-none">
              {{ step === 'amount' ? 'Tambah Dana Pengaman' : 'Tinjau Tambahan' }}
            </h3>
            <span class="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Tambahan satu kali, di luar pembagian otomatis</span>
          </div>
        </div>

        <button
          type="button"
          @click="emit('close')"
          :disabled="submitting"
          class="tactile-btn min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60 rounded-xl cursor-pointer disabled:opacity-50"
          aria-label="Tutup dialog"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <div class="px-5 py-2.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-[#070B14]/50 flex items-center gap-2 text-[11px] font-semibold shrink-0" aria-live="polite">
        <span :class="step === 'amount' ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-slate-500 dark:text-slate-400'">1. Masukkan nominal</span>
        <span class="text-slate-300 dark:text-slate-700">→</span>
        <span :class="step === 'review' ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-slate-400 dark:text-slate-500'">2. Periksa lalu konfirmasi</span>
      </div>

      <div class="p-5 overflow-y-auto flex-1 overscroll-contain space-y-4">
        <div v-if="step === 'amount'" class="p-3.5 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/30 rounded-xl text-xs space-y-2">
          <div class="flex justify-between gap-3 text-slate-800 dark:text-slate-200 font-medium">
            <span>Uang yang bisa dipakai:</span>
            <strong class="text-blue-700 dark:text-blue-400 font-extrabold tabular-nums">{{ formatRupiah(available) }}</strong>
          </div>
          <p class="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
            Tambahan ini memakai sebagian uang yang bisa dipakai untuk menambah Dana Pengaman. Uang tetap di rekening atau dompet semula; setoran otomatis berikutnya tetap masuk ke Target Impian.
          </p>
        </div>

        <div v-if="step === 'amount'" class="space-y-2">
          <label for="emergency-top-up-amount" class="block text-xs font-bold text-slate-900 dark:text-slate-100">Nominal tambahan (Rp)</label>
          <input
            id="emergency-top-up-amount"
            :value="amountInput"
            @input="handleAmountInput"
            type="text"
            inputmode="numeric"
            placeholder="Contoh: 500.000"
            autocomplete="off"
            class="w-full px-3.5 py-3 border border-slate-200 dark:border-slate-800 rounded-xl text-lg font-black text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-[#070B14] focus:bg-white dark:focus:bg-[#070B14] focus:outline-none focus:ring-2 focus:ring-blue-500/20 tabular-nums"
            aria-describedby="emergency-top-up-hint"
            :aria-invalid="exceedsAvailable"
          />
          <p id="emergency-top-up-hint" class="text-[11px] text-slate-500 dark:text-slate-400">
            Batas yang tersedia saat ini: {{ formatRupiah(available) }}.
          </p>
          <p v-if="exceedsAvailable" class="text-xs text-rose-600 dark:text-rose-400 font-medium" role="alert">
            Nominal melebihi uang yang bisa dipakai. Kurangi hingga maksimal {{ formatRupiah(available) }}.
          </p>
          <p v-else-if="amountInput && amount === 0n" class="text-xs text-rose-600 dark:text-rose-400 font-medium" role="alert">
            Masukkan nominal lebih dari Rp 0.
          </p>
          <p v-if="available === 0n" class="text-xs text-amber-800 dark:text-amber-300 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 p-3" role="status">
            Belum ada uang yang bisa ditambahkan. Catat pemasukan atau lepaskan sebagian alokasi terlebih dahulu.
          </p>
        </div>

        <div v-else class="space-y-3" aria-live="polite">
          <div class="rounded-xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/70 dark:border-blue-900/30 p-4 space-y-3">
            <div class="flex justify-between items-start gap-3 text-sm">
              <span class="text-slate-600 dark:text-slate-400">Tujuan</span>
              <strong class="text-slate-900 dark:text-slate-100 text-right">Dana Pengaman</strong>
            </div>
            <div class="flex justify-between items-start gap-3 text-sm border-t border-blue-200/50 dark:border-blue-900/30 pt-3">
              <span class="text-slate-600 dark:text-slate-400">Tambahan satu kali</span>
              <strong class="text-blue-700 dark:text-blue-400 font-extrabold tabular-nums text-right">{{ formatRupiah(amount) }}</strong>
            </div>
            <div class="flex justify-between items-start gap-3 text-sm border-t border-blue-200/50 dark:border-blue-900/30 pt-3">
              <span class="text-slate-600 dark:text-slate-400">Saldo Dana Pengaman setelahnya</span>
              <strong class="text-slate-900 dark:text-slate-100 font-bold tabular-nums text-right">{{ formatRupiah(emergencyBalanceAfterTopUp) }}</strong>
            </div>
            <div class="flex justify-between items-start gap-3 text-sm border-t border-blue-200/50 dark:border-blue-900/30 pt-3">
              <span class="text-slate-600 dark:text-slate-400">Uang yang bisa dipakai setelahnya</span>
              <strong class="text-slate-900 dark:text-slate-100 font-bold tabular-nums text-right">{{ formatRupiah(availableAfterTopUp) }}</strong>
            </div>
          </div>
          <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Uang tetap di rekening atau dompet semula. Pembagian otomatis setoran berikutnya tidak berubah.
          </p>
        </div>

        <div v-if="actionError" class="space-y-2" role="alert">
          <p class="text-xs text-rose-600 dark:text-rose-400 font-medium">{{ actionError }}</p>
          <button v-if="step === 'review'" type="button" @click="returnToAmount" class="text-xs font-bold text-blue-600 dark:text-blue-400 underline underline-offset-2">
            Ubah nominal
          </button>
        </div>
      </div>

      <div class="flex items-center justify-between gap-2.5 p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-[#0D1524] shrink-0">
        <button
          type="button"
          @click="step === 'review' ? returnToAmount() : emit('close')"
          :disabled="submitting"
          class="tactile-btn min-h-[44px] px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 rounded-xl cursor-pointer border border-slate-200 dark:border-slate-800 disabled:opacity-50"
        >
          {{ step === 'review' ? 'Ubah nominal' : 'Batal' }}
        </button>
        <button
          v-if="step === 'amount'"
          type="button"
          @click="openReview"
          :disabled="!canReview"
          class="tactile-btn min-h-[44px] px-5 py-2 bg-[#0B192C] hover:bg-[#1E293B] dark:bg-blue-600 dark:hover:bg-blue-500 text-white text-xs font-bold rounded-xl disabled:opacity-50 cursor-pointer transition shadow-sm"
        >
          Tinjau tambahan
        </button>
        <button
          v-else
          type="button"
          @click="handleTopUp"
          :disabled="submitting || !canReview"
          class="tactile-btn min-h-[44px] px-5 py-2 bg-[#0B192C] hover:bg-[#1E293B] dark:bg-blue-600 dark:hover:bg-blue-500 text-white text-xs font-bold rounded-xl disabled:opacity-50 cursor-pointer transition shadow-sm"
        >
          {{ submitting ? 'Menyimpan…' : 'Tambah ke Dana Pengaman' }}
        </button>
      </div>
    </div>
  </div>
</template>
