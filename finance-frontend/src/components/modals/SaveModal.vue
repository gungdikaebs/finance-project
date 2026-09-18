<script setup lang="ts">
import { ref, watch } from 'vue';
import { financeApi, type SavePreview } from '../../api/services';
import { formatRupiah } from '../../utils/format';
import { PiggyBank, X, ShieldCheck, Target } from 'lucide-vue-next';

const props = defineProps<{
  show: boolean;
  unallocatedMoney?: string | null;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'saved'): void;
}>();

const saveAmountInput = ref('');
const savePreviewData = ref<SavePreview | null>(null);
const submitting = ref(false);

const updateSavePreview = async () => {
  const clean = saveAmountInput.value.replace(/[^0-9]/g, '');
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

watch(
  () => props.show,
  (show) => {
    if (show) {
      saveAmountInput.value = props.unallocatedMoney || '0';
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
      note: 'Penyisihan tabungan otomatis (D-005)',
    });
    emit('saved');
    emit('close');
  } catch (err: any) {
    alert(err.response?.data?.message || 'Gagal menyisihkan tabungan');
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
    aria-labelledby="save-modal-title"
    @click.self="emit('close')"
  >
    <div class="fintech-card rounded-2xl w-full max-w-lg p-5 sm:p-6 space-y-4 animate-modal-enter border border-stone-200/90 shadow-2xl">
      <!-- Header -->
      <div class="flex items-center justify-between border-b border-stone-100 pb-3.5">
        <div class="flex items-center gap-2.5">
          <div class="w-9 h-9 rounded-xl bg-emerald-50 text-[#183D2B] flex items-center justify-center shrink-0">
            <PiggyBank class="w-5 h-5 text-[#183D2B]" :stroke-width="2" />
          </div>
          <div>
            <h3 id="save-modal-title" class="text-base font-extrabold text-[#18221B]">Sisihkan ke Tabungan</h3>
            <span class="text-[11px] text-emerald-800 font-bold">Aturan D-005: 60% Dana Pengaman & 40% Target Impian</span>
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

      <div class="p-3.5 bg-emerald-50/70 border border-emerald-200/80 rounded-xl text-xs space-y-1">
        <div class="flex justify-between text-stone-700 font-medium">
          <span>Uang Belum Disisihkan (Maksimal):</span>
          <strong class="text-[#183D2B] font-extrabold tabular-nums">{{ formatRupiah(unallocatedMoney) }}</strong>
        </div>
        <p class="text-[11px] text-stone-500 leading-relaxed font-normal">
          Penyisihan ini tidak memindahkan uang keluar dari rekening bank, melainkan menandai komitmen uang secara mental ke pos tujuan.
        </p>
      </div>

      <div class="space-y-3.5">
        <div>
          <div class="flex justify-between items-center mb-1">
            <label class="block text-xs font-bold text-[#18221B]">Nominal yang Disisihkan (Rp)</label>
            <button
              type="button"
              @click="saveAmountInput = unallocatedMoney || '0'; updateSavePreview();"
              class="text-xs text-emerald-800 font-bold hover:underline cursor-pointer"
            >
              Gunakan Semua Uang Bebas
            </button>
          </div>
          <input
            v-model="saveAmountInput"
            @input="updateSavePreview"
            type="text"
            placeholder="0"
            class="w-full px-3.5 py-2.5 border border-stone-200 rounded-xl text-lg font-black text-[#18221B] bg-stone-50/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#183D2B]/20 tabular-nums"
          />
          <span class="text-xs text-[#183D2B] font-bold mt-1 block tabular-nums">
            Pratinjau: {{ formatRupiah(saveAmountInput) }}
          </span>
        </div>

        <!-- Pratinjau Alokasi Otomatis (Live Preview) -->
        <div v-if="savePreviewData && savePreviewData.previewItems.length > 0" class="space-y-2 pt-2 border-t border-stone-100">
          <span class="text-xs font-bold text-stone-700 uppercase tracking-wider block">Rincian Pembagian Otomatis:</span>
          <div class="space-y-2">
            <div
              v-for="item in savePreviewData.previewItems"
              :key="item.targetGoalId"
              class="p-3 rounded-xl border border-stone-200/70 bg-stone-50/80 flex items-center justify-between text-xs"
            >
              <div class="flex items-center gap-2.5">
                <div class="w-7 h-7 rounded-lg bg-white border border-stone-200 flex items-center justify-center">
                  <ShieldCheck v-if="item.type === 'EMERGENCY'" class="w-4 h-4 text-[#183D2B]" />
                  <Target v-else class="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <span class="font-bold text-[#18221B] block">{{ item.name }}</span>
                  <span class="text-[10px] text-stone-500 font-medium">
                    {{ item.type === 'EMERGENCY' ? 'Porsi 60% Dana Pengaman' : 'Porsi Target Impian' }}
                  </span>
                </div>
              </div>
              <div class="text-right">
                <span class="font-black text-[#183D2B] text-sm tabular-nums">{{ formatRupiah(item.amount) }}</span>
              </div>
            </div>
          </div>
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
          @click="handleExecuteSave"
          :disabled="submitting || !savePreviewData"
          class="tactile-btn px-5 py-2 bg-[#183D2B] hover:bg-[#24553d] text-white text-xs font-bold rounded-xl disabled:opacity-50 cursor-pointer transition shadow-xs"
        >
          {{ submitting ? 'Menyimpan...' : 'Eksekusi Sisihkan' }}
        </button>
      </div>
    </div>
  </div>
</template>
