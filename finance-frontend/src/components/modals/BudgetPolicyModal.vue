<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { financeApi, type BudgetPolicy, type IncomeSource } from '../../api/services';
import { SlidersHorizontal, X, Plus, Trash2 } from 'lucide-vue-next';

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
    class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 glass-modal-backdrop overflow-y-auto"
    role="dialog"
    aria-modal="true"
    aria-labelledby="budget-modal-title"
    @click.self="emit('close')"
  >
    <div class="fintech-card rounded-2xl w-full max-w-lg p-5 sm:p-6 space-y-4 animate-modal-enter border border-stone-200/90 shadow-2xl max-h-[90vh] overflow-y-auto">
      <!-- Header -->
      <div class="flex items-center justify-between border-b border-stone-100 pb-3.5">
        <div class="flex items-center gap-2.5">
          <div class="w-9 h-9 rounded-xl bg-emerald-50 text-[#183D2B] flex items-center justify-center shrink-0">
            <SlidersHorizontal class="w-5 h-5" :stroke-width="2" />
          </div>
          <div>
            <h3 id="budget-modal-title" class="text-base font-extrabold text-[#18221B]">
              Kebijakan Anggaran ({{ currentMonth }}/{{ currentYear }})
            </h3>
            <span class="text-[11px] text-stone-500 font-medium">Pengaturan rasio 50/30/20 & override per sumber</span>
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

      <p class="text-xs text-stone-500 leading-relaxed font-normal">
        Atur rasio alokasi pemasukan untuk Kebutuhan, Tabungan, dan Keinginan. Total porsi harus tepat 100%.
      </p>

      <!-- Rasio Umum -->
      <div class="space-y-3 bg-stone-50/70 p-4 rounded-xl border border-stone-200/80">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-stone-700 uppercase tracking-wider">Rasio Umum</span>
          <span
            class="text-xs font-bold px-2 py-0.5 rounded-full tabular-nums"
            :class="totalPercent === 100 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'"
          >
            Total: {{ totalPercent }}%
          </span>
        </div>

        <div class="grid grid-cols-3 gap-2.5">
          <div>
            <label class="block text-[11px] font-bold text-blue-900 mb-1">Kebutuhan (%)</label>
            <input
              v-model.number="needsPercent"
              type="number"
              min="0"
              max="100"
              class="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm font-bold bg-white focus:outline-none focus:ring-2 focus:ring-[#183D2B]/20 tabular-nums"
            />
          </div>
          <div>
            <label class="block text-[11px] font-bold text-emerald-900 mb-1">Tabungan (%)</label>
            <input
              v-model.number="savingsPercent"
              type="number"
              min="0"
              max="100"
              class="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm font-bold bg-white focus:outline-none focus:ring-2 focus:ring-[#183D2B]/20 tabular-nums"
            />
          </div>
          <div>
            <label class="block text-[11px] font-bold text-purple-900 mb-1">Keinginan (%)</label>
            <input
              v-model.number="wantsPercent"
              type="number"
              min="0"
              max="100"
              class="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm font-bold bg-white focus:outline-none focus:ring-2 focus:ring-[#183D2B]/20 tabular-nums"
            />
          </div>
        </div>
      </div>

      <!-- Override per Sumber Pemasukan -->
      <div class="space-y-3 pt-1">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-[#18221B] uppercase tracking-wider">Override Khusus per Sumber</span>
        </div>

        <div v-if="overrides.length > 0" class="space-y-2">
          <div
            v-for="(ov, idx) in overrides"
            :key="ov.incomeSourceId"
            class="p-3.5 bg-stone-50/70 border border-stone-200/80 rounded-xl space-y-2"
          >
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-[#18221B]">
                {{ incomeSources.find(s => s.id === ov.incomeSourceId)?.name || 'Sumber ID ' + ov.incomeSourceId }}
              </span>
              <button
                type="button"
                @click="handleRemoveOverride(idx)"
                class="tactile-btn text-xs text-rose-600 hover:text-rose-800 font-bold inline-flex items-center gap-1 cursor-pointer"
              >
                <Trash2 class="w-3 h-3" />
                <span>Hapus</span>
              </button>
            </div>
            <div class="grid grid-cols-3 gap-2">
              <div>
                <label class="block text-[10px] font-medium text-stone-500 mb-0.5">Need (%)</label>
                <input v-model.number="ov.needs" type="number" class="w-full px-2.5 py-1.5 border border-stone-200 rounded-lg text-xs font-bold bg-white tabular-nums" />
              </div>
              <div>
                <label class="block text-[10px] font-medium text-stone-500 mb-0.5">Save (%)</label>
                <input v-model.number="ov.savings" type="number" class="w-full px-2.5 py-1.5 border border-stone-200 rounded-lg text-xs font-bold bg-white tabular-nums" />
              </div>
              <div>
                <label class="block text-[10px] font-medium text-stone-500 mb-0.5">Want (%)</label>
                <input v-model.number="ov.wants" type="number" class="w-full px-2.5 py-1.5 border border-stone-200 rounded-lg text-xs font-bold bg-white tabular-nums" />
              </div>
            </div>
          </div>
        </div>

        <!-- Tambah Override Dropdown -->
        <div class="flex items-center gap-2">
          <select
            v-model="selectedOverrideSourceId"
            class="flex-1 text-xs border border-stone-200 rounded-xl px-3 py-2 bg-stone-50/70 focus:bg-white text-[#18221B] focus:outline-none focus:ring-2 focus:ring-[#183D2B]/20 cursor-pointer font-medium"
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
            class="tactile-btn px-3 py-2 text-xs bg-stone-100 hover:bg-stone-200 text-[#18221B] font-bold rounded-xl border border-stone-200 cursor-pointer inline-flex items-center gap-1"
          >
            <Plus class="w-3.5 h-3.5" />
            <span>Tambah</span>
          </button>
        </div>
      </div>

      <!-- Opsi Terapkan ke Bulan Berjalan -->
      <div class="pt-2 border-t border-stone-100 flex items-center gap-2">
        <input type="checkbox" id="chkApplyCurrent" v-model="applyToCurrent" class="rounded text-[#183D2B] focus:ring-[#183D2B] cursor-pointer" />
        <label for="chkApplyCurrent" class="text-xs text-stone-700 font-medium cursor-pointer">
          Terapkan & hitung ulang transaksi pemasukan bulan ini ({{ currentMonth }}/{{ currentYear }})
        </label>
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
          @click="handleSave"
          :disabled="submitting || totalPercent !== 100"
          class="tactile-btn px-4 py-2 text-xs font-bold text-white bg-[#183D2B] hover:bg-[#24553d] rounded-xl shadow-xs disabled:opacity-50 cursor-pointer transition"
        >
          {{ submitting ? 'Menyimpan...' : 'Simpan Kebijakan' }}
        </button>
      </div>
    </div>
  </div>
</template>
