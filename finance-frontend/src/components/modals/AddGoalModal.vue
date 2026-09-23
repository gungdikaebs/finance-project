<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { financeApi } from '../../api/services';
import { formatNumberInput, parseCleanNumber, formatRupiah } from '../../utils/format';
import { Target, X, Info } from 'lucide-vue-next';

const props = defineProps<{
  show: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'saved'): void;
}>();

const newGoalName = ref('');
const newGoalPrice = ref('');
const newGoalMonths = ref<number | null>(null);
const newGoalMode = ref<'FULL' | 'DOWN_PAYMENT'>('FULL');
const submitting = ref(false);

import { useToast } from '../../composables/useToast';

const toast = useToast();
const nameError = ref('');
const priceError = ref('');

const targetMonthlyEstimate = computed(() => {
  if (!newGoalMonths.value || newGoalMonths.value <= 0) return null;
  const cleanPrice = parseCleanNumber(newGoalPrice.value);
  if (!cleanPrice || cleanPrice === '0') return null;
  const numPrice = Number(cleanPrice);
  if (isNaN(numPrice) || numPrice <= 0) return null;
  const iMonthly = 0.05 / 12;
  const factor = Math.pow(1 + iMonthly, newGoalMonths.value);
  const projectedPrice = Math.round(numPrice * factor);
  return Math.ceil(projectedPrice / newGoalMonths.value);
});

const handlePriceInput = (e: Event) => {
  const target = e.target as HTMLInputElement;
  newGoalPrice.value = formatNumberInput(target.value);
  if (priceError.value) priceError.value = '';
};

watch(
  () => props.show,
  (show) => {
    if (show) {
      nameError.value = '';
      priceError.value = '';
      newGoalName.value = '';
      newGoalPrice.value = '';
      newGoalMonths.value = null;
      newGoalMode.value = 'FULL';
    }
  }
);

const handleCreateGoal = async () => {
  nameError.value = '';
  priceError.value = '';
  let hasError = false;

  if (!newGoalName.value.trim()) {
    nameError.value = 'Nama target impian wajib diisi';
    toast.error('Nama target impian wajib diisi');
    hasError = true;
  }
  const cleanPrice = parseCleanNumber(newGoalPrice.value);
  if (!cleanPrice || cleanPrice === '0') {
    priceError.value = 'Harga target harus lebih besar dari Rp 0';
    if (!hasError) toast.error('Harga target harus lebih besar dari Rp 0');
    hasError = true;
  }

  if (hasError) return;

  submitting.value = true;
  try {
    await financeApi.createSavingsGoal({
      name: newGoalName.value.trim(),
      type: 'PURCHASE',
      mode: newGoalMode.value,
      priceReference: cleanPrice,
      targetAmount: cleanPrice,
      targetMonths: newGoalMonths.value || undefined,
    });
    toast.success(`Target "${newGoalName.value.trim()}" berhasil ditambahkan!`);
    emit('saved');
    emit('close');
  } catch (err: any) {
    toast.error(err.response?.data?.message || 'Gagal menambahkan target impian');
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
    aria-labelledby="add-goal-title"
    @click.self="emit('close')"
  >
    <div class="bg-white dark:bg-[#16201A] rounded-t-3xl sm:rounded-2xl max-h-[92dvh] sm:max-h-[85vh] w-full max-w-md mx-auto flex flex-col shadow-2xl border border-stone-200/90 dark:border-[#243329] overflow-hidden animate-modal-enter">
      <!-- Header (shrink-0) -->
      <div class="px-5 py-4 border-b border-stone-100 dark:border-[#243329] flex items-center justify-between shrink-0 bg-white dark:bg-[#16201A]">
        <div class="flex items-center gap-2.5">
          <div class="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-[#183D2B] dark:text-[#B8DF38] flex items-center justify-center shrink-0 border border-emerald-100 dark:border-emerald-800/40">
            <Target class="w-5 h-5 text-[#183D2B] dark:text-[#B8DF38]" :stroke-width="2" />
          </div>
          <div>
            <h3 id="add-goal-title" class="text-base font-extrabold text-[#18221B] dark:text-[#F0F4F1] leading-tight">Tambah Target Impian</h3>
            <span class="text-[11px] text-stone-500 dark:text-[#98A79D] font-medium">Target pembelian barang, properti, atau dana tujuan</span>
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

      <div class="space-y-3.5">
        <div>
          <label class="block text-xs font-bold text-[#18221B] dark:text-[#F0F4F1] mb-1">Nama Target</label>
          <input
            v-model="newGoalName"
            type="text"
            placeholder="Contoh: Beli Rumah Pertama, Mobil, Laptop..."
            class="w-full px-3.5 py-2.5 border rounded-xl text-xs bg-stone-50/70 dark:bg-[#0E1410] focus:bg-white dark:focus:bg-[#0E1410] text-[#18221B] dark:text-[#F0F4F1] focus:outline-none focus:ring-2"
            :class="nameError ? 'border-rose-400 focus:ring-rose-200 focus:border-rose-500' : 'border-stone-200 dark:border-[#243329] focus:ring-[#183D2B]/20 dark:focus:ring-[#B8DF38]/20 focus:border-[#183D2B] dark:focus:border-[#B8DF38]'"
          />
          <p v-if="nameError" class="text-xs text-rose-600 dark:text-rose-400 mt-1 font-semibold">
            {{ nameError }}
          </p>
        </div>

        <div>
          <label class="block text-xs font-bold text-[#18221B] dark:text-[#F0F4F1] mb-1">Harga Acuan / Target Dana (Rp)</label>
          <input
            :value="newGoalPrice"
            @input="handlePriceInput"
            type="text"
            inputmode="numeric"
            placeholder="0"
            class="w-full px-3.5 py-2.5 border rounded-xl text-base font-extrabold text-[#18221B] dark:text-[#F0F4F1] bg-stone-50/70 dark:bg-[#0E1410] focus:bg-white dark:focus:bg-[#0E1410] focus:outline-none focus:ring-2 tabular-nums"
            :class="priceError ? 'border-rose-400 focus:ring-rose-200 focus:border-rose-500' : 'border-stone-200 dark:border-[#243329] focus:ring-[#183D2B]/20 dark:focus:ring-[#B8DF38]/20 focus:border-[#183D2B] dark:focus:border-[#B8DF38]'"
          />
          <p v-if="priceError" class="text-xs text-rose-600 dark:text-rose-400 mt-1 font-semibold">
            {{ priceError }}
          </p>
        </div>

        <div>
          <label class="block text-xs font-bold text-[#18221B] dark:text-[#F0F4F1] mb-1">Skema Pembelian</label>
          <select
            v-model="newGoalMode"
            class="w-full px-3.5 py-2.5 border border-stone-200 dark:border-[#243329] rounded-xl text-xs font-semibold bg-stone-50/70 dark:bg-[#0E1410] focus:bg-white dark:focus:bg-[#0E1410] text-[#18221B] dark:text-[#F0F4F1] focus:outline-none focus:ring-2 focus:ring-[#183D2B]/20 dark:focus:ring-[#B8DF38]/20 cursor-pointer"
          >
            <option value="FULL">Beli Lunas Penuh (Cash)</option>
            <option value="DOWN_PAYMENT">Uang Muka (DP) & KPR / Cicilan</option>
          </select>
        </div>

        <div>
          <label class="block text-xs font-bold text-[#18221B] dark:text-[#F0F4F1] mb-1">Target Waktu (Bulan - Opsional)</label>
          <input
            v-model.number="newGoalMonths"
            type="number"
            min="1"
            placeholder="Contoh: 12, 24, 36 bulan..."
            class="w-full px-3.5 py-2.5 border border-stone-200 dark:border-[#243329] rounded-xl text-xs bg-stone-50/70 dark:bg-[#0E1410] focus:bg-white dark:focus:bg-[#0E1410] text-[#18221B] dark:text-[#F0F4F1] focus:outline-none focus:ring-2 focus:ring-[#183D2B]/20 dark:focus:ring-[#B8DF38]/20"
          />

          <!-- Live Preview Estimasi -->
          <div
            v-if="targetMonthlyEstimate && newGoalMonths"
            class="mt-2 p-2.5 rounded-xl bg-emerald-50/90 dark:bg-[#132E21]/60 border border-emerald-200/80 dark:border-[#243329] text-[11px] text-[#183D2B] dark:text-[#B8DF38] space-y-0.5"
          >
            <div class="font-bold flex items-center gap-1.5">
              <Target class="w-3.5 h-3.5 text-[#183D2B] dark:text-[#B8DF38] shrink-0" :stroke-width="2.25" />
              <span>Target {{ newGoalMonths }} Bulan</span>
            </div>
            <p class="text-stone-600 dark:text-[#98A79D] font-normal leading-relaxed">
              Estimasi butuh tabungan sekitar <strong class="text-[#183D2B] dark:text-[#B8DF38] font-bold tabular-nums">{{ formatRupiah(targetMonthlyEstimate) }}</strong>/bulan (asumsi inflasi ~5%/thn).
            </p>
          </div>
          <p v-else class="text-[11px] text-stone-500 dark:text-[#98A79D] mt-1.5 font-normal flex items-start gap-1.5">
            <Info class="w-3.5 h-3.5 text-stone-400 dark:text-stone-500 shrink-0 mt-0.5" :stroke-width="1.75" />
            <span>Kosongkan jika ingin target waktu dihitung otomatis berdasarkan alokasi tabungan bulanan riil Anda.</span>
          </p>
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
          @click="handleCreateGoal"
          :disabled="submitting"
          class="tactile-btn min-h-[44px] px-5 py-2 bg-[#183D2B] dark:bg-[#B8DF38] hover:bg-[#24553d] dark:hover:bg-[#a3c82e] text-white dark:text-[#0E1410] text-xs font-bold rounded-xl disabled:opacity-50 cursor-pointer transition shadow-sm"
        >
          {{ submitting ? 'Menyimpan...' : 'Simpan Target' }}
        </button>
      </div>
    </div>
  </div>
</template>
