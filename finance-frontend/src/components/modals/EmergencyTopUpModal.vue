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
    <div class="bg-white dark:bg-[#16201A] rounded-t-3xl sm:rounded-2xl max-h-[92dvh] sm:max-h-[85vh] w-full max-w-md mx-auto flex flex-col shadow-2xl border border-stone-200/90 dark:border-[#243329] overflow-hidden animate-modal-enter">
      <div class="px-5 py-4 border-b border-stone-100 dark:border-[#243329] flex items-center justify-between shrink-0 bg-white dark:bg-[#16201A]">
        <div class="flex items-center gap-2.5">
          <div class="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-[#183D2B] dark:text-[#B8DF38] flex items-center justify-center shrink-0 border border-emerald-100 dark:border-emerald-800/40">
            <ShieldCheck class="w-5 h-5" :stroke-width="2" />
          </div>
          <div>
            <h3 id="emergency-top-up-title" ref="stepHeading" tabindex="-1" class="text-base font-extrabold text-[#18221B] dark:text-[#F0F4F1] leading-tight focus:outline-none">
              {{ step === 'amount' ? 'Tambah Dana Pengaman' : 'Tinjau Tambahan' }}
            </h3>
            <span class="text-[11px] text-stone-500 dark:text-[#98A79D] font-medium">Tambahan satu kali, di luar pembagian otomatis</span>
          </div>
        </div>

        <button
          type="button"
          @click="emit('close')"
          :disabled="submitting"
          class="tactile-btn min-w-[44px] min-h-[44px] flex items-center justify-center text-stone-400 hover:text-stone-700 dark:hover:text-[#F0F4F1] hover:bg-stone-100 dark:hover:bg-[#243329] rounded-xl cursor-pointer disabled:opacity-50"
          aria-label="Tutup dialog"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <div class="px-5 py-2.5 border-b border-stone-100 dark:border-[#243329] bg-stone-50/70 dark:bg-[#0E1410]/50 flex items-center gap-2 text-[11px] font-semibold shrink-0" aria-live="polite">
        <span :class="step === 'amount' ? 'text-[#183D2B] dark:text-[#B8DF38]' : 'text-emerald-700 dark:text-emerald-400'">1. Masukkan nominal</span>
        <span class="text-stone-300 dark:text-stone-600">→</span>
        <span :class="step === 'review' ? 'text-[#183D2B] dark:text-[#B8DF38]' : 'text-stone-400 dark:text-stone-500'">2. Periksa lalu konfirmasi</span>
      </div>

      <div class="p-5 overflow-y-auto flex-1 overscroll-contain space-y-4">
        <div v-if="step === 'amount'" class="p-3.5 bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/30 rounded-xl text-xs space-y-2">
          <div class="flex justify-between gap-3 text-stone-700 dark:text-[#F0F4F1] font-medium">
            <span>Uang yang bisa dipakai:</span>
            <strong class="text-[#183D2B] dark:text-[#B8DF38] font-extrabold tabular-nums">{{ formatRupiah(available) }}</strong>
          </div>
          <p class="text-[11px] text-stone-600 dark:text-[#98A79D] leading-relaxed">
            Tambahan ini memakai sebagian uang yang bisa dipakai untuk menambah Dana Pengaman. Uang tetap di rekening atau dompet semula; setoran otomatis berikutnya tetap masuk ke Target Impian.
          </p>
        </div>

        <div v-if="step === 'amount'" class="space-y-2">
          <label for="emergency-top-up-amount" class="block text-xs font-bold text-[#18221B] dark:text-[#F0F4F1]">Nominal tambahan (Rp)</label>
          <input
            id="emergency-top-up-amount"
            :value="amountInput"
            @input="handleAmountInput"
            type="text"
            inputmode="numeric"
            placeholder="Contoh: 500.000"
            autocomplete="off"
            class="w-full px-3.5 py-3 border border-stone-200 dark:border-[#243329] rounded-xl text-lg font-black text-[#18221B] dark:text-[#F0F4F1] bg-stone-50/70 dark:bg-[#0E1410] focus:bg-white dark:focus:bg-[#0E1410] focus:outline-none focus:ring-2 focus:ring-[#183D2B]/20 dark:focus:ring-[#B8DF38]/20 tabular-nums"
            aria-describedby="emergency-top-up-hint"
            :aria-invalid="exceedsAvailable"
          />
          <p id="emergency-top-up-hint" class="text-[11px] text-stone-500 dark:text-[#98A79D]">
            Batas yang tersedia saat ini: {{ formatRupiah(available) }}.
          </p>
          <p v-if="exceedsAvailable" class="text-xs text-red-700 dark:text-red-300" role="alert">
            Nominal melebihi uang yang bisa dipakai. Kurangi hingga maksimal {{ formatRupiah(available) }}.
          </p>
          <p v-else-if="amountInput && amount === 0n" class="text-xs text-red-700 dark:text-red-300" role="alert">
            Masukkan nominal lebih dari Rp 0.
          </p>
          <p v-if="available === 0n" class="text-xs text-amber-800 dark:text-amber-300 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 p-3" role="status">
            Belum ada uang yang bisa ditambahkan. Catat pemasukan atau lepaskan sebagian alokasi terlebih dahulu.
          </p>
        </div>

        <div v-else class="space-y-3" aria-live="polite">
          <div class="rounded-xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/30 p-4 space-y-3">
            <div class="flex justify-between items-start gap-3 text-sm">
              <span class="text-stone-600 dark:text-[#98A79D]">Tujuan</span>
              <strong class="text-[#18221B] dark:text-[#F0F4F1] text-right">Dana Pengaman</strong>
            </div>
            <div class="flex justify-between items-start gap-3 text-sm border-t border-emerald-200/70 dark:border-emerald-800/40 pt-3">
              <span class="text-stone-600 dark:text-[#98A79D]">Tambahan satu kali</span>
              <strong class="text-[#183D2B] dark:text-[#B8DF38] font-extrabold tabular-nums text-right">{{ formatRupiah(amount) }}</strong>
            </div>
            <div class="flex justify-between items-start gap-3 text-sm border-t border-emerald-200/70 dark:border-emerald-800/40 pt-3">
              <span class="text-stone-600 dark:text-[#98A79D]">Saldo Dana Pengaman setelahnya</span>
              <strong class="text-[#18221B] dark:text-[#F0F4F1] font-bold tabular-nums text-right">{{ formatRupiah(emergencyBalanceAfterTopUp) }}</strong>
            </div>
            <div class="flex justify-between items-start gap-3 text-sm border-t border-emerald-200/70 dark:border-emerald-800/40 pt-3">
              <span class="text-stone-600 dark:text-[#98A79D]">Uang yang bisa dipakai setelahnya</span>
              <strong class="text-[#18221B] dark:text-[#F0F4F1] font-bold tabular-nums text-right">{{ formatRupiah(availableAfterTopUp) }}</strong>
            </div>
          </div>
          <p class="text-xs text-stone-500 dark:text-[#98A79D] leading-relaxed">
            Uang tetap di rekening atau dompet semula. Pembagian otomatis setoran berikutnya tidak berubah.
          </p>
        </div>

        <div v-if="actionError" class="space-y-2" role="alert">
          <p class="text-xs text-red-700 dark:text-red-300">{{ actionError }}</p>
          <button v-if="step === 'review'" type="button" @click="returnToAmount" class="text-xs font-bold text-[#183D2B] dark:text-[#B8DF38] underline underline-offset-2">
            Ubah nominal
          </button>
        </div>
      </div>

      <div class="flex items-center justify-between gap-2.5 p-4 border-t border-stone-100 dark:border-[#243329] bg-stone-50/80 dark:bg-[#0E1410]/70 shrink-0">
        <button
          type="button"
          @click="step === 'review' ? returnToAmount() : emit('close')"
          :disabled="submitting"
          class="tactile-btn min-h-[44px] px-4 py-2 text-xs font-semibold text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-[#243329] rounded-xl cursor-pointer border border-stone-200 dark:border-[#243329] disabled:opacity-50"
        >
          {{ step === 'review' ? 'Ubah nominal' : 'Batal' }}
        </button>
        <button
          v-if="step === 'amount'"
          type="button"
          @click="openReview"
          :disabled="!canReview"
          class="tactile-btn min-h-[44px] px-5 py-2 bg-[#183D2B] dark:bg-[#B8DF38] hover:bg-[#24553d] dark:hover:bg-[#a3c82e] text-white dark:text-[#0E1410] text-xs font-bold rounded-xl disabled:opacity-50 cursor-pointer transition shadow-sm"
        >
          Tinjau tambahan
        </button>
        <button
          v-else
          type="button"
          @click="handleTopUp"
          :disabled="submitting || !canReview"
          class="tactile-btn min-h-[44px] px-5 py-2 bg-[#183D2B] dark:bg-[#B8DF38] hover:bg-[#24553d] dark:hover:bg-[#a3c82e] text-white dark:text-[#0E1410] text-xs font-bold rounded-xl disabled:opacity-50 cursor-pointer transition shadow-sm"
        >
          {{ submitting ? 'Menyimpan…' : 'Tambah ke Dana Pengaman' }}
        </button>
      </div>
    </div>
  </div>
</template>
