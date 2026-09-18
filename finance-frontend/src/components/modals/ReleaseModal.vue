<script setup lang="ts">
import { ref, watch } from 'vue';
import { financeApi, type SavingsGoal } from '../../api/services';
import { formatRupiah } from '../../utils/format';
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
  const clean = releaseAmountInput.value.replace(/[^0-9]/g, '');
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
    toast.success('Alokasi dana berhasil dilepas kembali ke saldo bebas');
    emit('saved');
    emit('close');
  } catch (err: any) {
    toast.error(err.response?.data?.message || 'Gagal melepas alokasi');
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
    <div class="bg-white rounded-t-3xl sm:rounded-2xl max-h-[92dvh] sm:max-h-[85vh] w-full max-w-md mx-auto flex flex-col shadow-2xl border border-stone-200/90 overflow-hidden animate-modal-enter">
      <!-- Header (shrink-0) -->
      <div class="px-5 py-4 border-b border-stone-100 flex items-center justify-between shrink-0 bg-white">
        <div class="flex items-center gap-2.5">
          <div class="w-10 h-10 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center shrink-0">
            <Unlock class="w-5 h-5" :stroke-width="2" />
          </div>
          <div>
            <h3 id="release-modal-title" class="text-base font-extrabold text-[#18221B] leading-tight">Lepas Alokasi Dana</h3>
            <span class="text-[11px] text-stone-500 font-medium">Kembalikan dana tersisih ke Uang Bebas</span>
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

      <div class="space-y-3.5">
        <div>
          <label class="block text-xs font-bold text-[#18221B] mb-1">Target Sumber Dana</label>
          <select
            v-model="releaseSourceGoalId"
            class="w-full px-3.5 py-2.5 border border-stone-200 rounded-xl text-xs font-semibold bg-stone-50/70 focus:bg-white text-[#18221B] focus:outline-none focus:ring-2 focus:ring-[#183D2B]/20 cursor-pointer"
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
          <label class="block text-xs font-bold text-[#18221B] mb-1">Nominal Dilepas (Rp)</label>
          <input
            v-model="releaseAmountInput"
            type="text"
            placeholder="0"
            class="w-full px-3.5 py-2.5 border rounded-xl text-base font-extrabold text-[#18221B] bg-stone-50/70 focus:bg-white focus:outline-none focus:ring-2 tabular-nums"
            :class="releaseError ? 'border-rose-400 focus:ring-rose-200 focus:border-rose-500' : 'border-stone-200 focus:ring-[#183D2B]/20 focus:border-[#183D2B]'"
          />
          <p v-if="releaseError" class="text-xs text-rose-600 mt-1 font-semibold">
            {{ releaseError }}
          </p>
          <span v-else class="text-xs text-[#183D2B] font-bold mt-1 block tabular-nums">
            Pratinjau: {{ formatRupiah(releaseAmountInput) }}
          </span>
        </div>

        <div>
          <label class="block text-xs font-bold text-[#18221B] mb-1">Catatan / Alasan Pelepasan</label>
          <input
            v-model="releaseNoteInput"
            type="text"
            placeholder="Contoh: Kebutuhan mendesak, relokasi pos..."
            class="w-full px-3.5 py-2.5 border border-stone-200 rounded-xl text-xs bg-stone-50/70 focus:bg-white text-[#18221B] focus:outline-none focus:ring-2 focus:ring-[#183D2B]/20"
          />
        </div>
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
          @click="handleExecuteRelease"
          :disabled="submitting"
          class="tactile-btn min-h-[44px] px-5 py-2 bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold rounded-xl disabled:opacity-50 cursor-pointer transition shadow-sm"
        >
          {{ submitting ? 'Memproses...' : 'Lepas Alokasi ke Bebas' }}
        </button>
      </div>
    </div>
  </div>
</template>
