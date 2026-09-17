<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { financeApi, type BudgetPolicy, type IncomeSource } from '../../api/services';

const props = defineProps<{
  show: boolean;
  activePolicy: BudgetPolicy | null;
  incomeSources: IncomeSource[];
  currentMonth: number;
  currentYear: number;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'saved'): void;
}>();

const needsPercent = ref(50);
const savingsPercent = ref(30);
const wantsPercent = ref(20);
const applyToCurrent = ref(false);
const overrides = ref<{ incomeSourceId: number; needs: number; savings: number; wants: number }[]>([]);
const selectedOverrideSourceId = ref<number | null>(null);
const submitting = ref(false);

const totalPercent = computed(() => {
  return Number(needsPercent.value || 0) + Number(savingsPercent.value || 0) + Number(wantsPercent.value || 0);
});

watch(
  () => props.show,
  (show) => {
    if (show && props.activePolicy) {
      needsPercent.value = Math.round(props.activePolicy.needsRatio / 100);
      savingsPercent.value = Math.round(props.activePolicy.savingsRatio / 100);
      wantsPercent.value = Math.round(props.activePolicy.wantsRatio / 100);
      overrides.value = (props.activePolicy.overrides || []).map((o) => ({
        incomeSourceId: o.incomeSourceId,
        needs: Math.round(o.needsRatio / 100),
        savings: Math.round(o.savingsRatio / 100),
        wants: Math.round(o.wantsRatio / 100),
      }));
      applyToCurrent.value = false;
      selectedOverrideSourceId.value = null;
    }
  }
);

const handleAddOverride = () => {
  if (!selectedOverrideSourceId.value) return;
  overrides.value.push({
    incomeSourceId: selectedOverrideSourceId.value,
    needs: needsPercent.value,
    savings: savingsPercent.value,
    wants: wantsPercent.value,
  });
  selectedOverrideSourceId.value = null;
};

const handleRemoveOverride = (idx: number) => {
  overrides.value.splice(idx, 1);
};

const handleSave = async () => {
  if (totalPercent.value !== 100) {
    alert('Total rasio umum harus tepat 100%');
    return;
  }
  for (const ov of overrides.value) {
    if (ov.needs + ov.savings + ov.wants !== 100) {
      alert('Total rasio setiap override sumber harus tepat 100%');
      return;
    }
  }

  submitting.value = true;
  try {
    await financeApi.upsertBudgetPolicy({
      effectiveMonth: props.currentMonth,
      effectiveYear: props.currentYear,
      needsRatio: needsPercent.value * 100,
      savingsRatio: savingsPercent.value * 100,
      wantsRatio: wantsPercent.value * 100,
      applyToCurrentMonth: applyToCurrent.value,
      overrides: overrides.value.map((o) => ({
        incomeSourceId: o.incomeSourceId,
        needsRatio: o.needs * 100,
        savingsRatio: o.savings * 100,
        wantsRatio: o.wants * 100,
      })),
    });
    emit('saved');
    emit('close');
  } catch (err: any) {
    alert(err.response?.data?.message || 'Gagal menyimpan kebijakan anggaran');
  } finally {
    submitting.value = false;
  }
};
</script>

<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50"
    role="dialog"
    aria-modal="true"
    aria-labelledby="budget-modal-title"
  >
    <div class="bg-white w-full max-w-lg rounded-2xl p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
      <div class="flex items-center justify-between border-b pb-3">
        <h3 id="budget-modal-title" class="text-lg font-bold text-[#202820]">
          Kebijakan Anggaran ({{ currentMonth }}/{{ currentYear }})
        </h3>
        <button
          @click="emit('close')"
          class="text-gray-400 hover:text-gray-600 text-lg cursor-pointer"
          aria-label="Tutup dialog"
        >
          ✕
        </button>
      </div>

      <p class="text-xs text-gray-500">
        Atur rasio alokasi pemasukan untuk Kebutuhan, Tabungan, dan Keinginan. Total seluruh porsi harus tepat 100%.
      </p>

      <!-- Rasio Umum -->
      <div class="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-200">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-gray-800 uppercase">Rasio Umum</span>
          <span
            class="text-xs font-bold px-2 py-0.5 rounded"
            :class="totalPercent === 100 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
          >
            Total: {{ totalPercent }}%
          </span>
        </div>

        <div class="grid grid-cols-3 gap-2">
          <div>
            <label class="block text-[11px] font-semibold text-blue-800 mb-1">Kebutuhan (%)</label>
            <input
              v-model.number="needsPercent"
              type="number"
              min="0"
              max="100"
              class="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:border-[#183D2B]"
            />
          </div>
          <div>
            <label class="block text-[11px] font-semibold text-green-800 mb-1">Tabungan (%)</label>
            <input
              v-model.number="savingsPercent"
              type="number"
              min="0"
              max="100"
              class="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:border-[#183D2B]"
            />
          </div>
          <div>
            <label class="block text-[11px] font-semibold text-orange-800 mb-1">Keinginan (%)</label>
            <input
              v-model.number="wantsPercent"
              type="number"
              min="0"
              max="100"
              class="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:border-[#183D2B]"
            />
          </div>
        </div>
      </div>

      <!-- Override per Sumber Pemasukan -->
      <div class="space-y-3 pt-2">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-gray-800 uppercase">Override Khusus per Sumber</span>
        </div>

        <div v-if="overrides.length > 0" class="space-y-2">
          <div
            v-for="(ov, idx) in overrides"
            :key="ov.incomeSourceId"
            class="p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-2"
          >
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-gray-800">
                {{ incomeSources.find(s => s.id === ov.incomeSourceId)?.name || 'Sumber ID ' + ov.incomeSourceId }}
              </span>
              <button
                @click="handleRemoveOverride(idx)"
                class="text-xs text-red-500 hover:text-red-700 cursor-pointer"
              >
                Hapus
              </button>
            </div>
            <div class="grid grid-cols-3 gap-2">
              <div>
                <label class="block text-[10px] text-gray-500">Need (%)</label>
                <input v-model.number="ov.needs" type="number" class="w-full px-2 py-1 border rounded text-xs bg-white" />
              </div>
              <div>
                <label class="block text-[10px] text-gray-500">Save (%)</label>
                <input v-model.number="ov.savings" type="number" class="w-full px-2 py-1 border rounded text-xs bg-white" />
              </div>
              <div>
                <label class="block text-[10px] text-gray-500">Want (%)</label>
                <input v-model.number="ov.wants" type="number" class="w-full px-2 py-1 border rounded text-xs bg-white" />
              </div>
            </div>
          </div>
        </div>

        <!-- Tambah Override Dropdown -->
        <div class="flex items-center space-x-2">
          <select
            v-model="selectedOverrideSourceId"
            class="flex-1 text-xs border border-gray-300 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:border-[#183D2B]"
          >
            <option :value="null">-- Pilih Sumber Pemasukan untuk Override --</option>
            <option
              v-for="src in incomeSources.filter(s => !s.isArchived && !overrides.some(o => o.incomeSourceId === s.id))"
              :key="src.id"
              :value="src.id"
            >
              {{ src.name }}
            </option>
          </select>
          <button
            type="button"
            @click="handleAddOverride"
            class="px-3 py-1.5 text-xs bg-gray-200 hover:bg-gray-300 font-semibold rounded-lg cursor-pointer"
          >
            + Tambah
          </button>
        </div>
      </div>

      <!-- Opsi Terapkan ke Bulan Berjalan -->
      <div class="pt-2 border-t flex items-center space-x-2">
        <input type="checkbox" id="chkApplyCurrent" v-model="applyToCurrent" class="rounded text-[#183D2B] cursor-pointer" />
        <label for="chkApplyCurrent" class="text-xs text-gray-700 font-medium cursor-pointer">
          Terapkan & hitung ulang transaksi pemasukan bulan ini ({{ currentMonth }}/{{ currentYear }})
        </label>
      </div>

      <div class="flex justify-end space-x-2 pt-3 border-t border-gray-100">
        <button
          @click="emit('close')"
          type="button"
          class="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer"
        >
          Batal
        </button>
        <button
          @click="handleSave"
          :disabled="submitting || totalPercent !== 100"
          type="button"
          class="px-4 py-2 text-xs font-semibold text-white bg-[#183D2B] hover:bg-[#24553d] rounded-lg shadow-xs disabled:opacity-50 cursor-pointer transition"
        >
          {{ submitting ? 'Menyimpan...' : 'Simpan Kebijakan' }}
        </button>
      </div>
    </div>
  </div>
</template>
