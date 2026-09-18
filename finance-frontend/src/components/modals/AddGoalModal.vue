<script setup lang="ts">
import { ref, watch } from 'vue';
import { financeApi } from '../../api/services';
import { formatRupiah } from '../../utils/format';
import { Target, X } from 'lucide-vue-next';

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
  const cleanPrice = newGoalPrice.value.replace(/[^0-9]/g, '');
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
    <div class="bg-white rounded-t-3xl sm:rounded-2xl max-h-[92dvh] sm:max-h-[85vh] w-full max-w-md mx-auto flex flex-col shadow-2xl border border-stone-200/90 overflow-hidden animate-modal-enter">
      <!-- Header (shrink-0) -->
      <div class="px-5 py-4 border-b border-stone-100 flex items-center justify-between shrink-0 bg-white">
        <div class="flex items-center gap-2.5">
          <div class="w-10 h-10 rounded-xl bg-emerald-50 text-[#183D2B] flex items-center justify-center shrink-0">
            <Target class="w-5 h-5 text-[#183D2B]" :stroke-width="2" />
          </div>
          <div>
            <h3 id="add-goal-title" class="text-base font-extrabold text-[#18221B] leading-tight">Tambah Target Impian</h3>
            <span class="text-[11px] text-stone-500 font-medium">Target pembelian barang, properti, atau dana tujuan</span>
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
          <label class="block text-xs font-bold text-[#18221B] mb-1">Nama Target</label>
          <input
            v-model="newGoalName"
            type="text"
            placeholder="Contoh: Beli Rumah Pertama, Mobil, Laptop..."
            class="w-full px-3.5 py-2.5 border rounded-xl text-xs bg-stone-50/70 focus:bg-white text-[#18221B] focus:outline-none focus:ring-2"
            :class="nameError ? 'border-rose-400 focus:ring-rose-200 focus:border-rose-500' : 'border-stone-200 focus:ring-[#183D2B]/20 focus:border-[#183D2B]'"
          />
          <p v-if="nameError" class="text-xs text-rose-600 mt-1 font-semibold">
            {{ nameError }}
          </p>
        </div>

        <div>
          <label class="block text-xs font-bold text-[#18221B] mb-1">Harga Acuan / Target Dana (Rp)</label>
          <input
            v-model="newGoalPrice"
            type="text"
            placeholder="0"
            class="w-full px-3.5 py-2.5 border rounded-xl text-base font-extrabold text-[#18221B] bg-stone-50/70 focus:bg-white focus:outline-none focus:ring-2 tabular-nums"
            :class="priceError ? 'border-rose-400 focus:ring-rose-200 focus:border-rose-500' : 'border-stone-200 focus:ring-[#183D2B]/20 focus:border-[#183D2B]'"
          />
          <p v-if="priceError" class="text-xs text-rose-600 mt-1 font-semibold">
            {{ priceError }}
          </p>
          <span v-else class="text-xs text-[#183D2B] font-bold mt-1 block tabular-nums">
            Pratinjau: {{ formatRupiah(newGoalPrice) }}
          </span>
        </div>

        <div>
          <label class="block text-xs font-bold text-[#18221B] mb-1">Skema Pembelian</label>
          <select
            v-model="newGoalMode"
            class="w-full px-3.5 py-2.5 border border-stone-200 rounded-xl text-xs font-semibold bg-stone-50/70 focus:bg-white text-[#18221B] focus:outline-none focus:ring-2 focus:ring-[#183D2B]/20 cursor-pointer"
          >
            <option value="FULL">Beli Lunas Penuh (Cash)</option>
            <option value="DOWN_PAYMENT">Uang Muka (DP) & KPR / Cicilan</option>
          </select>
        </div>

        <div>
          <label class="block text-xs font-bold text-[#18221B] mb-1">Target Waktu (Bulan - Opsional)</label>
          <input
            v-model.number="newGoalMonths"
            type="number"
            min="1"
            placeholder="Contoh: 12, 24, 36 bulan..."
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
          @click="handleCreateGoal"
          :disabled="submitting"
          class="tactile-btn min-h-[44px] px-5 py-2 bg-[#183D2B] hover:bg-[#24553d] text-white text-xs font-bold rounded-xl disabled:opacity-50 cursor-pointer transition shadow-sm"
        >
          {{ submitting ? 'Menyimpan...' : 'Simpan Target' }}
        </button>
      </div>
    </div>
  </div>
</template>
