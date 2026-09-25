<script setup lang="ts">
import { ref, watch, computed, nextTick } from 'vue';
import { financeApi, type SavePreview } from '../../api/services';
import { formatRupiah, formatNumberInput, parseCleanNumber } from '../../utils/format';
import { PiggyBank, X, ShieldCheck, Sparkles } from 'lucide-vue-next';
import { useToast } from '../../composables/useToast';

const props = defineProps<{
  show: boolean;
  unallocatedMoney?: string | null;
  recommendedSavingAmount?: string | null;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'saved'): void;
}>();

const toast = useToast();
const saveAmountInput = ref('');
const savePreviewData = ref<SavePreview | null>(null);
const submitting = ref(false);
const previewLoading = ref(false);
const previewError = ref('');
const step = ref<'input' | 'review'>('input');
const stepHeading = ref<HTMLElement | null>(null);
let previewRequestId = 0;
const currentAmount = computed(() => parseCleanNumber(saveAmountInput.value));
const exceedsAvailable = computed(() =>
  BigInt(currentAmount.value || '0') > BigInt(props.unallocatedMoney || '0'),
);
const hasCurrentPreview = computed(() => {
  const preview = savePreviewData.value;
  return !!preview &&
    !previewLoading.value &&
    !exceedsAvailable.value &&
    preview.totalAmount === currentAmount.value &&
    preview.previewItems.length > 0;
});
const remainingAfterSave = computed(() => {
  if (!savePreviewData.value) return '0';
  const remaining = BigInt(props.unallocatedMoney || '0') - BigInt(savePreviewData.value.totalAmount);
  return (remaining > 0n ? remaining : 0n).toString();
});

const calculatedRecommended = computed(() => {
  const unallocated = BigInt(props.unallocatedMoney || '0');
  const fromProp = BigInt(props.recommendedSavingAmount || '0');
  if (fromProp > 0n && fromProp <= unallocated) {
    return fromProp.toString();
  }
  // Fallback: 30% dari sisa unallocated jika ada
  if (unallocated > 0n) {
    const fallback = (unallocated * 30n) / 100n;
    return fallback > 0n ? fallback.toString() : unallocated.toString();
  }
  return '0';
});

const halfUnallocated = computed(() => {
  const unallocated = BigInt(props.unallocatedMoney || '0');
  return (unallocated / 2n).toString();
});

const updateSavePreview = async () => {
  const clean = parseCleanNumber(saveAmountInput.value);
  const requestId = ++previewRequestId;
  savePreviewData.value = null;
  previewError.value = '';
  if (!clean || clean === '0') {
    previewLoading.value = false;
    return;
  }
  if (BigInt(clean) > BigInt(props.unallocatedMoney || '0')) {
    previewLoading.value = false;
    return;
  }
  previewLoading.value = true;
  try {
    const res = await financeApi.getSavePreview(clean);
    if (requestId === previewRequestId && clean === currentAmount.value) {
      savePreviewData.value = res.data.data;
    }
  } catch (err) {
    if (requestId === previewRequestId) {
      previewError.value = 'Pembagian belum dapat dimuat. Periksa koneksi lalu coba lagi.';
    }
  } finally {
    if (requestId === previewRequestId) previewLoading.value = false;
  }
};

const handleSaveInput = (e: Event) => {
  const target = e.target as HTMLInputElement;
  saveAmountInput.value = formatNumberInput(target.value);
  updateSavePreview();
};

const applyQuickFill = (amountStr: string) => {
  saveAmountInput.value = formatNumberInput(amountStr);
  updateSavePreview();
};

watch(
  () => props.show,
  (show) => {
    if (show) {
      step.value = 'input';
      // Default: gunakan porsi rekomendasi tabungan (UX-03), bukan 100% uang bebas
      saveAmountInput.value = formatNumberInput(calculatedRecommended.value);
      updateSavePreview();
    } else {
      previewRequestId += 1;
      previewLoading.value = false;
      savePreviewData.value = null;
      previewError.value = '';
      step.value = 'input';
    }
  }
);

const openReview = () => {
  if (!hasCurrentPreview.value) return;
  step.value = 'review';
  nextTick(() => stepHeading.value?.focus());
};

const returnToAmount = () => {
  if (submitting.value) return;
  step.value = 'input';
  nextTick(() => document.getElementById('save-amount')?.focus());
};

const handleExecuteSave = async () => {
  if (!hasCurrentPreview.value || step.value !== 'review') return;
  const preview = savePreviewData.value;
  if (!preview) return;
  submitting.value = true;
  try {
    await financeApi.allocateSavings({
      allocations: preview.previewItems.map((p) => ({
        targetGoalId: p.targetGoalId,
        amount: p.amount,
      })),
      date: new Date().toISOString().slice(0, 10),
      note: 'Tabungan rutin bulanan',
    });
    toast.success('Dana tabungan berhasil disisihkan!');
    emit('saved');
    emit('close');
  } catch (err: any) {
    toast.error(err.response?.data?.message || 'Gagal menyisihkan tabungan');
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
    aria-labelledby="save-modal-title"
    @click.self="emit('close')"
  >
    <div class="bg-white dark:bg-[#16201A] rounded-t-3xl sm:rounded-2xl max-h-[92dvh] sm:max-h-[85vh] w-full max-w-lg mx-auto flex flex-col shadow-2xl border border-stone-200/90 dark:border-[#243329] overflow-hidden animate-modal-enter">
      <!-- Header (shrink-0) -->
      <div class="px-5 sm:px-6 py-4 border-b border-stone-100 dark:border-[#243329] flex items-center justify-between shrink-0 bg-white dark:bg-[#16201A]">
        <div class="flex items-center gap-2.5">
          <div class="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-[#183D2B] dark:text-[#B8DF38] flex items-center justify-center shrink-0 border border-emerald-100 dark:border-emerald-800/40">
            <PiggyBank class="w-5 h-5 text-[#183D2B] dark:text-[#B8DF38]" :stroke-width="2" />
          </div>
          <div>
            <h3 id="save-modal-title" ref="stepHeading" tabindex="-1" class="text-base font-extrabold text-[#18221B] dark:text-[#F0F4F1] leading-tight focus:outline-none">
              {{ step === 'input' ? 'Sisihkan ke Tabungan' : 'Tinjau Pembagian' }}
            </h3>
            <span
              v-if="step === 'input'"
              class="text-[11px] font-bold"
              :class="savePreviewData?.emergencyDetails?.isFull
                ? 'text-[#183D2B] dark:text-[#B8DF38]'
                : 'text-emerald-800 dark:text-[#B8DF38]'"
            >
              <template v-if="savePreviewData?.emergencyDetails?.isFull">
                Dana Pengaman Penuh • 100% Setoran ke Impian
              </template>
              <template v-else-if="savePreviewData?.emergencyDetails?.overflowAmount && BigInt(savePreviewData.emergencyDetails.overflowAmount) > 0n">
                Pengaman Terpenuhi • Sisa Dialihkan ke Impian
              </template>
              <template v-else>
                Rasio Otomatis: 60% Dana Pengaman & 40% Target Impian
              </template>
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

      <div class="px-5 sm:px-6 py-2.5 border-b border-stone-100 dark:border-[#243329] bg-stone-50/70 dark:bg-[#0E1410]/50 flex items-center gap-2 text-[11px] font-semibold shrink-0" aria-live="polite">
        <span :class="step === 'input' ? 'text-[#183D2B] dark:text-[#B8DF38]' : 'text-emerald-700 dark:text-emerald-400'">1. Masukkan nominal</span>
        <span class="text-stone-300 dark:text-stone-600">→</span>
        <span :class="step === 'review' ? 'text-[#183D2B] dark:text-[#B8DF38]' : 'text-stone-400 dark:text-stone-500'">2. Periksa lalu konfirmasi</span>
      </div>

      <!-- Form Body (flex-1 overscroll-contain) -->
      <div class="p-5 sm:p-6 overflow-y-auto flex-1 overscroll-contain space-y-4">

        <!-- Status Saldo Belum Disisihkan -->
        <div v-if="step === 'input'" class="p-3.5 bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/30 rounded-xl text-xs space-y-1">
          <div class="flex justify-between text-stone-700 dark:text-[#F0F4F1] font-medium">
            <span>Uang yang bisa dipakai sekarang:</span>
            <strong class="text-[#183D2B] dark:text-[#B8DF38] font-extrabold tabular-nums">{{ formatRupiah(unallocatedMoney) }}</strong>
          </div>
          <p class="text-[11px] text-stone-500 dark:text-[#98A79D] leading-relaxed font-normal">
            Penyisihan hanya memberi tujuan pada uang; uang tetap di rekening atau dompet semula.
          </p>
        </div>

        <div v-if="step === 'input'" class="space-y-3.5">
          <div>
            <div class="flex justify-between items-center mb-1.5">
              <label for="save-amount" class="block text-xs font-bold text-[#18221B] dark:text-[#F0F4F1]">Nominal yang Disisihkan (Rp)</label>
              <span class="text-[11px] text-stone-500 dark:text-[#98A79D] font-medium">Maksimal: {{ formatRupiah(unallocatedMoney) }}</span>
            </div>

            <input
              id="save-amount"
              :value="saveAmountInput"
              @input="handleSaveInput"
              type="text"
              inputmode="numeric"
              placeholder="0"
              class="w-full px-3.5 py-2.5 border border-stone-200 dark:border-[#243329] rounded-xl text-lg font-black text-[#18221B] dark:text-[#F0F4F1] bg-stone-50/70 dark:bg-[#0E1410] focus:bg-white dark:focus:bg-[#0E1410] focus:outline-none focus:ring-2 focus:ring-[#183D2B]/20 dark:focus:ring-[#B8DF38]/20 tabular-nums"
            />

            <p
              v-if="exceedsAvailable"
              class="mt-2 text-xs text-red-700 dark:text-red-300"
              role="alert"
            >
              Nominal melebihi uang yang bisa dipakai. Kurangi hingga maksimal {{ formatRupiah(unallocatedMoney) }}.
            </p>

            <!-- Tombol Pilihan Cepat (Quick Fill Buttons UX-03) -->
            <div class="flex items-center gap-2 mt-2.5 flex-wrap">
              <button
                type="button"
                @click="applyQuickFill(calculatedRecommended)"
                class="tactile-btn inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-[#183D2B] dark:text-[#B8DF38] border border-emerald-200/80 dark:border-emerald-800/50 cursor-pointer transition shadow-2xs"
              >
                <Sparkles class="w-3.5 h-3.5 text-[#183D2B] dark:text-[#B8DF38]" />
                <span>Rekomendasi ({{ formatRupiah(calculatedRecommended) }})</span>
              </button>

              <button
                type="button"
                @click="applyQuickFill(halfUnallocated)"
                class="tactile-btn text-xs font-semibold px-3 py-1.5 rounded-lg bg-stone-100 dark:bg-[#0E1410] hover:bg-stone-200 dark:hover:bg-[#243329] text-stone-700 dark:text-[#F0F4F1] border border-stone-200/80 dark:border-[#243329] cursor-pointer transition shadow-2xs"
              >
                50% Sisa ({{ formatRupiah(halfUnallocated) }})
              </button>

              <button
                type="button"
                @click="applyQuickFill(unallocatedMoney || '0')"
                class="tactile-btn text-xs font-semibold px-3 py-1.5 rounded-lg bg-stone-100 dark:bg-[#0E1410] hover:bg-stone-200 dark:hover:bg-[#243329] text-stone-700 dark:text-[#F0F4F1] border border-stone-200/80 dark:border-[#243329] cursor-pointer transition shadow-2xs"
              >
                Semua Uang Belum Disisihkan
              </button>
            </div>
          </div>

          <!-- Status Dana Pengaman & Penjelasan Aturan (UX-14) -->
          <div
            v-if="savePreviewData?.emergencyDetails"
            class="p-3.5 rounded-xl border text-xs space-y-2"
            :class="savePreviewData.emergencyDetails.isFull
              ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200/80 dark:border-emerald-800/40'
              : 'bg-stone-50 dark:bg-[#0E1410] border-stone-200/80 dark:border-[#243329]'"
          >
            <div class="flex items-center justify-between">
              <span class="font-bold text-[#18221B] dark:text-[#F0F4F1] flex items-center gap-1.5">
                <ShieldCheck class="w-4 h-4 text-[#183D2B] dark:text-[#B8DF38]" />
                <span>Status Dana Pengaman</span>
              </span>
              <span
                v-if="savePreviewData.emergencyDetails.isFull"
                class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-[#B8DF38]"
              >
                Sudah Penuh (100%)
              </span>
              <span
                v-else
                class="text-[11px] text-stone-500 dark:text-[#98A79D] font-medium"
              >
                Sisa menuju penuh: <strong class="text-[#18221B] dark:text-[#F0F4F1]">{{ formatRupiah(savePreviewData.emergencyDetails.remainingNeeded) }}</strong>
              </span>
            </div>

            <p class="text-[11px] leading-relaxed text-stone-600 dark:text-[#98A79D]">
              {{ savePreviewData.ruleExplanation }}
            </p>
          </div>

          <p
            v-if="savePreviewData && !previewLoading && savePreviewData.previewItems.length === 0"
            class="text-xs text-amber-800 dark:text-amber-300 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 p-3"
            role="status"
          >
            Belum ada tujuan tabungan aktif. Tutup dialog, lalu buat target di bagian Tabungan sebelum menyisihkan uang.
          </p>

        </div>

        <div v-else class="space-y-4" aria-live="polite">
          <div class="rounded-xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/30 p-4 space-y-3">
            <div class="flex justify-between items-start gap-3 text-sm">
              <span class="text-stone-600 dark:text-[#98A79D]">Total yang akan disisihkan</span>
              <strong class="text-[#183D2B] dark:text-[#B8DF38] font-extrabold tabular-nums text-right">{{ formatRupiah(savePreviewData?.totalAmount) }}</strong>
            </div>
            <div class="flex justify-between items-start gap-3 text-sm border-t border-emerald-200/70 dark:border-emerald-800/40 pt-3">
              <span class="text-stone-600 dark:text-[#98A79D]">Uang yang bisa dipakai setelahnya</span>
              <strong class="text-[#18221B] dark:text-[#F0F4F1] font-bold tabular-nums text-right">{{ formatRupiah(remainingAfterSave) }}</strong>
            </div>
          </div>

          <div class="space-y-2">
            <h4 class="text-xs font-bold text-stone-700 dark:text-[#F0F4F1]">Pembagian ke tiap tujuan</h4>
            <div
              v-for="item in savePreviewData?.previewItems || []"
              :key="item.targetGoalId"
              class="flex justify-between items-start gap-3 p-3 rounded-xl border border-stone-200/80 dark:border-[#243329] bg-white dark:bg-[#0E1410]"
            >
              <span class="text-sm font-semibold text-[#18221B] dark:text-[#F0F4F1]">{{ item.name }}</span>
              <strong class="text-sm font-bold text-[#183D2B] dark:text-[#B8DF38] tabular-nums text-right">{{ formatRupiah(item.amount) }}</strong>
            </div>
          </div>

          <div v-if="savePreviewData?.emergencyDetails" class="rounded-xl border border-stone-200 dark:border-[#243329] bg-stone-50 dark:bg-[#0E1410] p-3.5 space-y-1.5 text-xs">
            <strong class="text-[#18221B] dark:text-[#F0F4F1]">Dana Pengaman</strong>
            <p class="text-stone-600 dark:text-[#98A79D] leading-relaxed">{{ savePreviewData.emergencyDetails.isFull ? 'Target Dana Pengaman sudah tercapai. Setoran ini dialihkan ke target impian.' : `Sisa menuju target: ${formatRupiah(savePreviewData.emergencyDetails.remainingNeeded)}.` }}</p>
            <p v-if="!savePreviewData.emergencyDetails.isFull && savePreviewData.ruleExplanation" class="text-stone-500 dark:text-[#98A79D] leading-relaxed">{{ savePreviewData.ruleExplanation }}</p>
          </div>

          <p class="text-xs text-stone-500 dark:text-[#98A79D] leading-relaxed">
            Ini adalah pembagian untuk tujuan di aplikasi. Uang tetap berada di rekening atau dompet semula.
          </p>
        </div>

        <p v-if="previewLoading" class="text-xs text-stone-500 dark:text-[#98A79D]" role="status">Menghitung pembagian…</p>
        <div v-if="previewError" class="space-y-2" role="alert">
          <p class="text-xs text-red-700 dark:text-red-300">{{ previewError }}</p>
          <button type="button" @click="updateSavePreview" class="text-xs font-bold text-[#183D2B] dark:text-[#B8DF38] underline underline-offset-2 disabled:opacity-50" :disabled="previewLoading">
            Coba lagi
          </button>
        </div>

      </div>

      <!-- Action Buttons (shrink-0) -->
      <div class="flex items-center justify-between gap-2.5 p-4 border-t border-stone-100 dark:border-[#243329] bg-stone-50/80 dark:bg-[#0E1410]/70 shrink-0">
        <button
          type="button"
          @click="step === 'review' ? returnToAmount() : emit('close')"
          class="tactile-btn min-h-[44px] px-4 py-2 text-xs font-semibold text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-[#243329] rounded-xl cursor-pointer border border-stone-200 dark:border-[#243329]"
        >
          {{ step === 'review' ? 'Ubah nominal' : 'Batal' }}
        </button>
        <button
          v-if="step === 'input'"
          type="button"
          @click="openReview"
          :disabled="!hasCurrentPreview"
          class="tactile-btn min-h-[44px] px-5 py-2 bg-[#183D2B] dark:bg-[#B8DF38] hover:bg-[#24553d] dark:hover:bg-[#a3c82e] text-white dark:text-[#0E1410] text-xs font-bold rounded-xl disabled:opacity-50 cursor-pointer transition shadow-sm"
        >
          Tinjau Pembagian
        </button>
        <button
          v-else
          type="button"
          @click="handleExecuteSave"
          :disabled="submitting || !hasCurrentPreview"
          class="tactile-btn min-h-[44px] px-5 py-2 bg-[#183D2B] dark:bg-[#B8DF38] hover:bg-[#24553d] dark:hover:bg-[#a3c82e] text-white dark:text-[#0E1410] text-xs font-bold rounded-xl disabled:opacity-50 cursor-pointer transition shadow-sm"
        >
          {{ submitting ? 'Menyimpan…' : 'Konfirmasi Sisihkan' }}
        </button>
      </div>
    </div>
  </div>
</template>
