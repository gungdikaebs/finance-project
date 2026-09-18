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

watch(
  () => props.show,
  (show) => {
    if (show) {
      newGoalName.value = '';
      newGoalPrice.value = '';
      newGoalMonths.value = null;
      newGoalMode.value = 'FULL';
    }
  }
);

const handleCreateGoal = async () => {
  if (!newGoalName.value.trim()) {
    alert('Nama target wajib diisi');
    return;
  }
  const cleanPrice = newGoalPrice.value.replace(/[^0-9]/g, '');
  if (!cleanPrice || cleanPrice === '0') {
    alert('Harga target harus lebih besar dari 0');
    return;
  }

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
    emit('saved');
    emit('close');
  } catch (err: any) {
    alert(err.response?.data?.message || 'Gagal menambahkan target impian');
  } finally {
    submitting.value = false;
  }
};
</script>

<template>
  <div
    v-if="show"
    class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 glass-modal-backdrop overflow-y-auto"
    role="dialog"
    aria-modal="true"
    aria-labelledby="add-goal-title"
    @click.self="emit('close')"
  >
    <div class="fintech-card rounded-2xl w-full max-w-md p-5 sm:p-6 space-y-4 animate-modal-enter border border-stone-200/90 shadow-2xl">
      <!-- Header -->
      <div class="flex items-center justify-between border-b border-stone-100 pb-3.5">
        <div class="flex items-center gap-2.5">
          <div class="w-9 h-9 rounded-xl bg-emerald-50 text-[#183D2B] flex items-center justify-center shrink-0">
            <Target class="w-5 h-5 text-[#183D2B]" :stroke-width="2" />
          </div>
          <div>
            <h3 id="add-goal-title" class="text-base font-extrabold text-[#18221B]">Tambah Target Impian</h3>
            <span class="text-[11px] text-stone-500 font-medium">Target pembelian barang, properti, atau dana tujuan</span>
          </div>
        </div>

        <button
          type="button"
          @click="emit('close')"
          class="tactile-btn p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-xl cursor-pointer"
          aria-label="Tutup dialog"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <div class="space-y-3.5">
        <div>
          <label class="block text-xs font-bold text-[#18221B] mb-1">Nama Target</label>
          <input
            v-model="newGoalName"
            type="text"
            placeholder="Contoh: Beli Rumah Pertama, Mobil, Laptop..."
            class="w-full px-3.5 py-2.5 border border-stone-200 rounded-xl text-xs bg-stone-50/70 focus:bg-white text-[#18221B] focus:outline-none focus:ring-2 focus:ring-[#183D2B]/20"
          />
        </div>

        <div>
          <label class="block text-xs font-bold text-[#18221B] mb-1">Harga Acuan / Target Dana (Rp)</label>
          <input
            v-model="newGoalPrice"
            type="text"
            placeholder="0"
            class="w-full px-3.5 py-2.5 border border-stone-200 rounded-xl text-base font-extrabold text-[#18221B] bg-stone-50/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#183D2B]/20 tabular-nums"
          />
          <span class="text-xs text-[#183D2B] font-bold mt-1 block tabular-nums">
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

      <div class="flex justify-end gap-2 pt-3 border-t border-stone-100">
        <button
          type="button"
          @click="emit('close')"
          class="tactile-btn px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl cursor-pointer border border-stone-200"
        >
          Batal
        </button>
        <button
          type="button"
          @click="handleCreateGoal"
          :disabled="submitting"
          class="tactile-btn px-5 py-2 bg-[#183D2B] hover:bg-[#24553d] text-white text-xs font-bold rounded-xl disabled:opacity-50 cursor-pointer transition shadow-xs"
        >
          {{ submitting ? 'Menyimpan...' : 'Simpan Target' }}
        </button>
      </div>
    </div>
  </div>
</template>
