<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { financeApi, type SavePreview } from '../../api/services';
import { formatRupiah, formatNumberInput, parseCleanNumber } from '../../utils/format';
import { PiggyBank, X, ShieldCheck, Target, Sparkles } from 'lucide-vue-next';
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
  if (!clean || clean === '0') {
    savePreviewData.value = null;
    return;
  }
  try {
    const res = await financeApi.getSavePreview(clean);
    savePreviewData.value = res.data.data;
  } catch (err) {
    savePreviewData.value = null;
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
      // Default: gunakan porsi rekomendasi tabungan (UX-03), bukan 100% uang bebas
      saveAmountInput.value = formatNumberInput(calculatedRecommended.value);
      updateSavePreview();
    }
  }
);

const handleExecuteSave = async () => {
  if (!savePreviewData.value || !savePreviewData.value.previewItems.length) return;
  submitting.value = true;
  try {
    await financeApi.allocateSavings({
      allocations: savePreviewData.value.previewItems.map((p) => ({
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
            <h3 id="save-modal-title" class="text-base font-extrabold text-[#18221B] dark:text-[#F0F4F1] leading-tight">Sisihkan ke Tabungan</h3>
            <span
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

      <!-- Form Body (flex-1 overscroll-contain) -->
      <div class="p-5 sm:p-6 overflow-y-auto flex-1 overscroll-contain space-y-4">

        <!-- Status Saldo Belum Disisihkan -->
        <div class="p-3.5 bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/30 rounded-xl text-xs space-y-1">
          <div class="flex justify-between text-stone-700 dark:text-[#F0F4F1] font-medium">
            <span>Uang Belum Disisihkan:</span>
            <strong class="text-[#183D2B] dark:text-[#B8DF38] font-extrabold tabular-nums">{{ formatRupiah(unallocatedMoney) }}</strong>
          </div>
          <p class="text-[11px] text-stone-500 dark:text-[#98A79D] leading-relaxed font-normal">
            Tabungan ini mengalokasikan porsi uang ke pos tabungan tanpa memindahkannya keluar dari rekening bank.
          </p>
        </div>

        <div class="space-y-3.5">
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

          <!-- Pratinjau Alokasi Otomatis (Live Preview) -->
          <div v-if="savePreviewData && (savePreviewData.previewItems.length > 0 || savePreviewData.emergencyDetails?.isFull)" class="space-y-2 pt-3 border-t border-stone-100 dark:border-[#243329]">
            <span class="text-xs font-bold text-stone-700 dark:text-[#98A79D] uppercase tracking-wider block">Rincian Pembagian Otomatis:</span>
            <div class="space-y-2">
              <!-- Baris status Rp 0 Dana Pengaman jika sudah penuh -->
              <div
                v-if="savePreviewData.emergencyDetails?.isFull"
                class="p-3 rounded-xl border border-dashed border-stone-200 dark:border-[#243329] bg-stone-50/50 dark:bg-[#0E1410]/50 flex items-center justify-between text-xs opacity-75"
              >
                <div class="flex items-center gap-2.5">
                  <div class="w-8 h-8 rounded-lg bg-stone-100 dark:bg-[#16201A] border border-stone-200 dark:border-[#243329] flex items-center justify-center shrink-0">
                    <ShieldCheck class="w-4 h-4 text-stone-400 dark:text-stone-500" />
                  </div>
                  <div>
                    <span class="font-bold text-[#18221B] dark:text-[#F0F4F1] block">Dana Pengaman</span>
                    <span class="text-[10px] text-stone-500 dark:text-[#98A79D] font-medium">
                      Target Penuh {{ formatRupiah(savePreviewData.emergencyDetails.targetNominal) }} sudah tercapai
                    </span>
                  </div>
                </div>
                <div class="text-right">
                  <span class="font-bold text-stone-500 dark:text-[#98A79D] text-sm tabular-nums">Rp 0 (Penuh)</span>
                </div>
              </div>

              <div
                v-for="item in savePreviewData.previewItems"
                :key="item.targetGoalId"
                class="p-3 rounded-xl border border-stone-200/70 dark:border-[#243329] bg-stone-50/80 dark:bg-[#0E1410] flex items-center justify-between text-xs"
              >
                <div class="flex items-center gap-2.5">
                  <div class="w-8 h-8 rounded-lg bg-white dark:bg-[#16201A] border border-stone-200 dark:border-[#243329] flex items-center justify-center shrink-0">
                    <ShieldCheck v-if="item.type === 'EMERGENCY'" class="w-4 h-4 text-[#183D2B] dark:text-[#B8DF38]" />
                    <Target v-else class="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <span class="font-bold text-[#18221B] dark:text-[#F0F4F1] block">{{ item.name }}</span>
                    <span class="text-[10px] text-stone-500 dark:text-[#98A79D] font-medium">
                      <template v-if="item.type === 'EMERGENCY'">
                        Porsi Dana Pengaman
                      </template>
                      <template v-else-if="savePreviewData.emergencyDetails?.isFull">
                        Porsi Target Impian (Mendapat pengalihan 100%)
                      </template>
                      <template v-else-if="savePreviewData.emergencyDetails?.overflowAmount && BigInt(savePreviewData.emergencyDetails.overflowAmount) > 0n">
                        Porsi Target Impian (Termasuk pengalihan sisa)
                      </template>
                      <template v-else>
                        Porsi Target Impian
                      </template>
                    </span>
                  </div>
                </div>
                <div class="text-right">
                  <span class="font-black text-[#183D2B] dark:text-[#B8DF38] text-sm tabular-nums">{{ formatRupiah(item.amount) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      <!-- Action Buttons (shrink-0) -->
      <div class="flex items-center justify-end gap-2.5 p-4 border-t border-stone-100 dark:border-[#243329] bg-stone-50/80 dark:bg-[#0E1410]/70 shrink-0">
        <button
          type="button"
          @click="emit('close')"
          class="tactile-btn min-h-[44px] px-4 py-2 text-xs font-semibold text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-[#243329] rounded-xl cursor-pointer border border-stone-200 dark:border-[#243329]"
        >
          Batal
        </button>
        <button
          type="button"
          @click="handleExecuteSave"
          :disabled="submitting || !savePreviewData"
          class="tactile-btn min-h-[44px] px-5 py-2 bg-[#183D2B] dark:bg-[#B8DF38] hover:bg-[#24553d] dark:hover:bg-[#a3c82e] text-white dark:text-[#0E1410] text-xs font-bold rounded-xl disabled:opacity-50 cursor-pointer transition shadow-sm"
        >
          {{ submitting ? 'Menyimpan...' : 'Eksekusi Sisihkan' }}
        </button>
      </div>
    </div>
  </div>
</template>
