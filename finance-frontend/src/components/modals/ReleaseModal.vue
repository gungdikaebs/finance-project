<script setup lang="ts">
import { ref, watch } from 'vue';
import { financeApi, type SavingsGoal } from '../../api/services';
import { formatRupiah, formatNumberInput, parseCleanNumber } from '../../utils/format';
import { Unlock, X } from 'lucide-vue-next';

const props = defineProps<{
  show: boolean;
  savingsGoals: SavingsGoal[];
  initialGoalId?: number | null;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'saved'): void;
}>();

const releaseSourceGoalId = ref<number | null>(null);
const releaseAmountInput = ref('');
const releaseNoteInput = ref('');
const submitting = ref(false);

import { useToast } from '../../composables/useToast';

const toast = useToast();
const releaseError = ref('');

const handleReleaseAmountInput = (e: Event) => {
  const target = e.target as HTMLInputElement;
  releaseAmountInput.value = formatNumberInput(target.value);
  if (releaseError.value) releaseError.value = '';
};

watch(
  () => [props.show, props.initialGoalId],
  ([show]) => {
    if (show) {
      releaseError.value = '';
      releaseSourceGoalId.value = props.initialGoalId || (props.savingsGoals[0]?.id || null);
      releaseAmountInput.value = '';
      releaseNoteInput.value = '';
    }
  }
);

const handleExecuteRelease = async () => {
  releaseError.value = '';
  if (!releaseSourceGoalId.value) {
    toast.error('Pilih target sumber dana yang ingin dilepas');
    return;
  }
  const clean = parseCleanNumber(releaseAmountInput.value);
  if (!clean || clean === '0') {
    releaseError.value = 'Nominal harus lebih besar dari Rp 0';
    toast.error('Nominal harus lebih besar dari Rp 0');
    return;
  }

  submitting.value = true;
  try {
    await financeApi.releaseAllocation({
      sourceGoalId: releaseSourceGoalId.value,
      amount: clean,
      date: new Date().toISOString().slice(0, 10),
      note: releaseNoteInput.value || undefined,
    });
    toast.success('Dana tabungan berhasil ditarik ke saldo siap pakai');
    emit('saved');
    emit('close');
  } catch (err: any) {
    toast.error(err.response?.data?.message || 'Gagal menarik dana tabungan');
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
    aria-labelledby="release-modal-title"
    @click.self="emit('close')"
  >
    <div class="bg-white dark:bg-[#0D1524] rounded-t-3xl sm:rounded-2xl max-h-[92dvh] sm:max-h-[85vh] w-full max-w-md mx-auto flex flex-col shadow-2xl border border-slate-200/90 dark:border-slate-800 overflow-hidden animate-modal-enter">
      <!-- Header (shrink-0) -->
      <div class="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0 bg-white dark:bg-[#0D1524]">
        <div class="flex items-center gap-2.5">
          <div class="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-200/60 dark:border-amber-900/40">
            <Unlock class="w-5 h-5" :stroke-width="2" />
          </div>
          <div>
            <h3 id="release-modal-title" class="text-base font-extrabold text-slate-900 dark:text-slate-100 leading-tight">Tarik Dana dari Tabungan</h3>
            <span class="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Kembalikan dana dari pos tabungan ke Uang Siap Pakai</span>
          </div>
        </div>

        <button
          type="button"
          @click="emit('close')"
          class="tactile-btn min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60 rounded-xl cursor-pointer"
          aria-label="Tutup dialog"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Form Inputs (flex-1 overscroll-contain) -->
      <div class="p-5 overflow-y-auto flex-1 overscroll-contain space-y-4">
        <div class="space-y-3.5">
          <div>
            <label for="release-goal" class="block text-xs font-bold text-slate-900 dark:text-slate-100 mb-1">Ambil dari Pos Tabungan</label>
            <select
              id="release-goal"
              v-model="releaseSourceGoalId"
              class="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-[#070B14] focus:bg-white dark:focus:bg-[#070B14] text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
            >
              <option :value="null">-- Pilih Target Tabungan --</option>
              <option
                v-for="g in savingsGoals"
                :key="g.id"
                :value="g.id"
              >
                [{{ g.type === 'EMERGENCY' ? 'Darurat' : 'Target' }}] {{ g.name }} (Saldo: {{ formatRupiah(g.currentBalance) }})
              </option>
            </select>
          </div>

          <div>
            <label for="release-amount" class="block text-xs font-bold text-slate-900 dark:text-slate-100 mb-1">Nominal yang Ditarik (Rp)</label>
            <input
              id="release-amount"
              :value="releaseAmountInput"
              @input="handleReleaseAmountInput"
              type="text"
              inputmode="numeric"
              placeholder="0"
              class="w-full px-3.5 py-2.5 border rounded-xl text-base font-extrabold text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-[#070B14] focus:bg-white dark:focus:bg-[#070B14] focus:outline-none focus:ring-2 tabular-nums"
              :class="releaseError ? 'border-rose-400 focus:ring-rose-200 focus:border-rose-500' : 'border-slate-200 dark:border-slate-800 focus:ring-blue-500/20 focus:border-blue-600 dark:focus:border-blue-500'"
            />
            <p v-if="releaseError" class="text-xs text-rose-600 dark:text-rose-400 mt-1 font-semibold">
              {{ releaseError }}
            </p>
          </div>

          <div>
            <label for="release-note" class="block text-xs font-bold text-slate-900 dark:text-slate-100 mb-1">Catatan / Alasan Penarikan</label>
            <input
              id="release-note"
              v-model="releaseNoteInput"
              type="text"
              placeholder="Contoh: Kebutuhan mendesak, relokasi pos..."
              class="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl text-xs bg-slate-50 dark:bg-[#070B14] focus:bg-white dark:focus:bg-[#070B14] text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>
      </div>

      <!-- Action Buttons (shrink-0) -->
      <div class="flex items-center justify-end gap-2.5 p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-[#0D1524] shrink-0">
        <button
          type="button"
          @click="emit('close')"
          class="tactile-btn min-h-[44px] px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 rounded-xl cursor-pointer border border-slate-200 dark:border-slate-800"
        >
          Batal
        </button>
        <button
          type="button"
          @click="handleExecuteRelease"
          :disabled="submitting"
          class="tactile-btn min-h-[44px] px-5 py-2 bg-[#0B192C] hover:bg-[#1E293B] dark:bg-amber-600 dark:hover:bg-amber-500 text-white text-xs font-bold rounded-xl disabled:opacity-50 cursor-pointer transition shadow-sm"
        >
          {{ submitting ? 'Memproses...' : 'Tarik ke Saldo Siap Pakai' }}
        </button>
      </div>
    </div>
  </div>
</template>
