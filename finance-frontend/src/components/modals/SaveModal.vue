<script setup lang="ts">
import { ref, watch } from 'vue';
import { financeApi, type SavePreview } from '../../api/services';
import { formatRupiah } from '../../utils/format';

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
    class="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50"
    role="dialog"
    aria-modal="true"
    aria-labelledby="save-modal-title"
  >
    <div class="bg-white w-full max-w-lg rounded-2xl p-6 shadow-xl space-y-5">
      <div class="flex items-center justify-between border-b pb-3">
        <div>
          <h3 id="save-modal-title" class="text-lg font-bold text-[#202820]">Sisihkan Tabungan</h3>
          <span class="text-xs text-emerald-800 font-semibold">Aturan D-005: 60% Dana Pengaman & 40% Target Impian</span>
        </div>
        <button
          @click="emit('close')"
          class="text-gray-400 hover:text-gray-600 text-lg font-bold cursor-pointer"
          aria-label="Tutup dialog"
        >
          ✕
        </button>
      </div>

      <div class="p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl text-xs space-y-1">
        <div class="flex justify-between text-gray-700">
          <span>Uang Belum Disisihkan (Maksimal):</span>
          <strong class="text-emerald-900">{{ formatRupiah(unallocatedMoney) }}</strong>
        </div>
        <p class="text-[11px] text-gray-500">
          Penyisihan ini tidak memindahkan uang keluar dari rekening bank Anda, melainkan mengikatnya secara mental ke pos tabungan.
        </p>
      </div>

      <div class="space-y-3">
        <div>
          <div class="flex justify-between items-center mb-1">
            <label class="block text-xs font-semibold text-gray-700 uppercase">Nominal yang Disisihkan (Rp)</label>
            <button
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
            class="w-full px-3 py-2 border border-gray-300 rounded-xl text-lg font-black text-gray-900 focus:outline-none focus:border-[#183D2B]"
          />
          <span class="text-xs text-[#183D2B] font-semibold mt-1 block">
            Pratinjau: {{ formatRupiah(saveAmountInput) }}
          </span>
        </div>

        <!-- Pratinjau Alokasi Otomatis (Live Preview) -->
        <div v-if="savePreviewData && savePreviewData.previewItems.length > 0" class="space-y-2 pt-2 border-t">
          <span class="text-xs font-bold text-gray-700 uppercase tracking-wider block">Rincian Pembagian Otomatis:</span>
          <div class="space-y-2">
            <div
              v-for="item in savePreviewData.previewItems"
              :key="item.targetGoalId"
              class="p-3 rounded-xl border border-gray-100 bg-gray-50 flex items-center justify-between text-xs"
            >
              <div class="flex items-center space-x-2">
                <span>{{ item.type === 'EMERGENCY' ? '🛡️' : '🎯' }}</span>
                <div>
                  <span class="font-bold text-gray-900">{{ item.name }}</span>
                  <span class="text-[10px] text-gray-500 block">
                    {{ item.type === 'EMERGENCY' ? 'Porsi 60% Dana Pengaman' : 'Porsi Target Impian' }}
                  </span>
                </div>
              </div>
              <div class="text-right">
                <span class="font-black text-emerald-900 text-sm block">{{ formatRupiah(item.amount) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="flex justify-end space-x-2 pt-4 border-t">
        <button
          @click="emit('close')"
          type="button"
          class="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer"
        >
          Batal
        </button>
        <button
          @click="handleExecuteSave"
          :disabled="submitting || !savePreviewData"
          type="button"
          class="px-5 py-2 bg-[#183D2B] text-white text-xs font-bold rounded-lg hover:bg-[#24553d] disabled:opacity-50 cursor-pointer transition"
        >
          {{ submitting ? 'Menyimpan...' : 'Eksekusi Sisihkan' }}
        </button>
      </div>
    </div>
  </div>
</template>
