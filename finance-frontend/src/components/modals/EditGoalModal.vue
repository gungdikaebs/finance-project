<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { financeApi, type SavingsGoal } from '../../api/services';
import { formatNumberInput, parseCleanNumber, formatRupiah } from '../../utils/format';
import { X, Pencil, Target, Info } from 'lucide-vue-next';
import { useToast } from '../../composables/useToast';

const props = defineProps<{
  show: boolean;
  goal: SavingsGoal | null;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'saved'): void;
}>();

const toast = useToast();

const editName = ref('');
const editPrice = ref('');
const editMonths = ref<number | null>(null);
const editMode = ref<'FULL' | 'DOWN_PAYMENT'>('FULL');
const submitting = ref(false);

const nameError = ref('');
const priceError = ref('');

const targetMonthlyEstimate = computed(() => {
  if (!editMonths.value || editMonths.value <= 0) return null;
  const cleanPrice = parseCleanNumber(editPrice.value);
  if (!cleanPrice || cleanPrice === '0') return null;
  const numPrice = Number(cleanPrice);
  if (isNaN(numPrice) || numPrice <= 0) return null;
  const iMonthly = 0.05 / 12;
  const factor = Math.pow(1 + iMonthly, editMonths.value);
  const projectedPrice = Math.round(numPrice * factor);
  return Math.ceil(projectedPrice / editMonths.value);
});

const handlePriceInput = (e: Event) => {
  const target = e.target as HTMLInputElement;
  editPrice.value = formatNumberInput(target.value);
  if (priceError.value) priceError.value = '';
};

watch(
  () => props.show,
  (show) => {
    if (show && props.goal) {
      nameError.value = '';
      priceError.value = '';
      editName.value = props.goal.name || '';
      const rawPrice = props.goal.priceReference || props.goal.targetAmount || '';
      editPrice.value = rawPrice ? formatNumberInput(String(rawPrice)) : '';
      editMonths.value = props.goal.targetMonths ?? null;
      editMode.value = (props.goal.mode as any) || 'FULL';
    }
  }
);

const handleUpdateGoal = async () => {
  if (!props.goal) return;

  nameError.value = '';
  priceError.value = '';
  let hasError = false;

  if (!editName.value.trim()) {
    nameError.value = 'Nama target impian wajib diisi';
    toast.error('Nama target impian wajib diisi');
    hasError = true;
  }
  const cleanPrice = parseCleanNumber(editPrice.value);
  if (!cleanPrice || cleanPrice === '0') {
    priceError.value = 'Harga target harus lebih besar dari Rp 0';
    if (!hasError) toast.error('Harga target harus lebih besar dari Rp 0');
    hasError = true;
  }

  if (hasError) return;

  submitting.value = true;
  try {
    await financeApi.updateSavingsGoal(props.goal.id, {
      name: editName.value.trim(),
      mode: editMode.value,
      priceReference: cleanPrice,
      targetAmount: cleanPrice,
      targetMonths: editMonths.value && editMonths.value > 0 ? editMonths.value : undefined,
    });
    toast.success(`Target "${editName.value.trim()}" berhasil diperbarui!`);
    emit('saved');
    emit('close');
  } catch (err: any) {
    toast.error(err.response?.data?.message || 'Gagal memperbarui target impian');
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
    aria-labelledby="edit-goal-title"
    @click.self="emit('close')"
  >
    <div class="bg-white dark:bg-[#0D1524] rounded-t-3xl sm:rounded-2xl max-h-[92dvh] sm:max-h-[85vh] w-full max-w-md mx-auto flex flex-col shadow-2xl border border-slate-200/90 dark:border-slate-800 overflow-hidden animate-modal-enter">
      <!-- Header -->
      <div class="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0 bg-white dark:bg-[#0D1524]">
        <div class="flex items-center gap-2.5">
          <div class="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-200/60 dark:border-blue-900/40">
            <Pencil class="w-5 h-5 text-blue-600 dark:text-blue-400" :stroke-width="2" />
          </div>
          <div>
            <h3 id="edit-goal-title" class="text-base font-extrabold text-slate-900 dark:text-slate-100 leading-tight">Ubah Target Impian</h3>
            <span class="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Sesuaikan nominal atau target waktu</span>
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

      <!-- Form Inputs -->
      <div class="p-5 overflow-y-auto flex-1 overscroll-contain space-y-4">
        <div class="space-y-3.5">
          <div>
            <label for="edit-goal-name" class="block text-xs font-bold text-slate-900 dark:text-slate-100 mb-1">Nama Target</label>
            <input
              id="edit-goal-name"
              v-model="editName"
              type="text"
              placeholder="Contoh: Beli Rumah Pertama, Mobil, Laptop..."
              class="w-full px-3.5 py-2.5 border rounded-xl text-xs bg-slate-50 dark:bg-[#070B14] focus:bg-white dark:focus:bg-[#070B14] text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2"
              :class="nameError ? 'border-rose-400 focus:ring-rose-200 focus:border-rose-500' : 'border-slate-200 dark:border-slate-800 focus:ring-blue-500/20 focus:border-blue-600 dark:focus:border-blue-500'"
            />
            <p v-if="nameError" class="text-xs text-rose-600 dark:text-rose-400 mt-1 font-semibold">
              {{ nameError }}
            </p>
          </div>

          <div>
            <label for="edit-goal-price" class="block text-xs font-bold text-slate-900 dark:text-slate-100 mb-1">Harga Acuan / Target Dana (Rp)</label>
            <input
              id="edit-goal-price"
              :value="editPrice"
              @input="handlePriceInput"
              type="text"
              inputmode="numeric"
              placeholder="0"
              class="w-full px-3.5 py-2.5 border rounded-xl text-base font-extrabold text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-[#070B14] focus:bg-white dark:focus:bg-[#070B14] focus:outline-none focus:ring-2 tabular-nums"
              :class="priceError ? 'border-rose-400 focus:ring-rose-200 focus:border-rose-500' : 'border-slate-200 dark:border-slate-800 focus:ring-blue-500/20 focus:border-blue-600 dark:focus:border-blue-500'"
            />
            <p v-if="priceError" class="text-xs text-rose-600 dark:text-rose-400 mt-1 font-semibold">
              {{ priceError }}
            </p>
          </div>

          <div>
            <label for="edit-goal-mode" class="block text-xs font-bold text-slate-900 dark:text-slate-100 mb-1">Skema Pembelian</label>
            <select
              id="edit-goal-mode"
              v-model="editMode"
              class="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-[#070B14] focus:bg-white dark:focus:bg-[#070B14] text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
            >
              <option value="FULL">Beli Lunas Penuh (Cash)</option>
              <option value="DOWN_PAYMENT">Uang Muka (DP) & KPR / Cicilan</option>
            </select>
          </div>

          <div>
            <label for="edit-goal-months" class="block text-xs font-bold text-slate-900 dark:text-slate-100 mb-1">Target Waktu (Bulan - Opsional)</label>
            <input
              id="edit-goal-months"
              v-model.number="editMonths"
              type="number"
              min="1"
              placeholder="Contoh: 12, 24, 36 bulan (kosongkan untuk estimasi otomatis)..."
              class="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl text-xs bg-slate-50 dark:bg-[#070B14] focus:bg-white dark:focus:bg-[#070B14] text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />

            <!-- Live Preview Estimasi -->
            <div
              v-if="targetMonthlyEstimate && editMonths"
              class="mt-2 p-2.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/40 text-[11px] text-blue-900 dark:text-blue-200 space-y-0.5"
            >
              <div class="font-bold flex items-center gap-1.5 text-blue-700 dark:text-blue-300">
                <Target class="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" :stroke-width="2.25" />
                <span>Target {{ editMonths }} Bulan</span>
              </div>
              <p class="text-slate-600 dark:text-slate-400 font-normal leading-relaxed">
                Estimasi butuh tabungan sekitar <strong class="text-blue-700 dark:text-blue-400 font-bold tabular-nums">{{ formatRupiah(targetMonthlyEstimate) }}</strong>/bulan (asumsi inflasi ~5%/thn).
              </p>
            </div>
            <p v-else class="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 font-normal flex items-start gap-1.5">
              <Info class="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0 mt-0.5" :stroke-width="1.75" />
              <span>Kosongkan jika ingin waktu target dihitung otomatis berdasarkan alokasi tabungan bulanan riil Anda.</span>
            </p>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
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
          @click="handleUpdateGoal"
          :disabled="submitting"
          class="tactile-btn min-h-[44px] px-5 py-2 bg-[#0B192C] hover:bg-[#1E293B] dark:bg-blue-600 dark:hover:bg-blue-500 text-white text-xs font-bold rounded-xl disabled:opacity-50 cursor-pointer transition shadow-sm"
        >
          {{ submitting ? 'Menyimpan...' : 'Simpan Perubahan' }}
        </button>
      </div>
    </div>
  </div>
</template>
