<script setup lang="ts">
import { ref, watch } from 'vue';
import { financeApi, type FinanceProfile } from '../../api/services';
import { formatRupiah } from '../../utils/format';

const props = defineProps<{
  show: boolean;
  profile: FinanceProfile | null;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'saved'): void;
}>();

const initialBalance = ref('');
const monthlyNeeds = ref('');
const timezone = ref('Asia/Makassar');
const submitting = ref(false);

watch(
  () => props.profile,
  (newVal) => {
    if (newVal) {
      initialBalance.value = newVal.initialBalance || '0';
      monthlyNeeds.value = newVal.monthlyNeeds || '0';
      timezone.value = newVal.timezone || 'Asia/Makassar';
    }
  },
  { immediate: true }
);

const handleSave = async () => {
  submitting.value = true;
  try {
    await financeApi.updateProfile({
      initialBalance: initialBalance.value.replace(/[^0-9]/g, '') || '0',
      monthlyNeeds: monthlyNeeds.value.replace(/[^0-9]/g, '') || '0',
      timezone: timezone.value,
    });
    emit('saved');
    emit('close');
  } catch (err: any) {
    alert(err.response?.data?.message || 'Gagal memperbarui profil');
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
    aria-labelledby="profile-modal-title"
  >
    <div class="bg-white w-full max-w-md rounded-2xl p-6 shadow-xl space-y-4">
      <div class="flex items-center justify-between border-b pb-3">
        <h3 id="profile-modal-title" class="text-lg font-bold text-[#202820]">Setup Profil & Saldo Awal</h3>
        <button
          @click="emit('close')"
          class="text-gray-400 hover:text-gray-600 text-lg cursor-pointer"
          aria-label="Tutup dialog"
        >
          ✕
        </button>
      </div>

      <p class="text-xs text-gray-500">
        Saldo awal adalah uang yang Anda miliki sebelum mulai mencatat. Pengubahan saldo awal akan menyesuaikan Saldo utama secara otomatis.
      </p>

      <div class="space-y-3 pt-1">
        <div>
          <label class="block text-xs font-semibold text-gray-700 uppercase mb-1">Saldo Awal (Rp)</label>
          <input
            v-model="initialBalance"
            type="text"
            placeholder="Contoh: 10000000"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#183D2B]"
          />
          <span class="text-xs text-[#183D2B] font-semibold mt-1 block">
            Pratinjau: {{ formatRupiah(initialBalance) }}
          </span>
        </div>

        <div>
          <label class="block text-xs font-semibold text-gray-700 uppercase mb-1">Referensi Kebutuhan Pokok Bulanan (Rp)</label>
          <input
            v-model="monthlyNeeds"
            type="text"
            placeholder="Contoh: 3000000"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#183D2B]"
          />
          <span class="text-xs text-gray-500 mt-1 block">
            Sebagai patokan ketahanan dana pengaman.
          </span>
        </div>

        <div>
          <label class="block text-xs font-semibold text-gray-700 uppercase mb-1">Zona Waktu</label>
          <select v-model="timezone" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:border-[#183D2B]">
            <option value="Asia/Jakarta">WIB (Asia/Jakarta)</option>
            <option value="Asia/Makassar">WITA (Asia/Makassar)</option>
            <option value="Asia/Jayapura">WIT (Asia/Jayapura)</option>
          </select>
        </div>
      </div>

      <div class="flex justify-end space-x-2 pt-4 border-t border-gray-100">
        <button
          @click="emit('close')"
          type="button"
          class="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer"
        >
          Batal
        </button>
        <button
          @click="handleSave"
          :disabled="submitting"
          type="button"
          class="px-4 py-2 text-xs font-semibold text-white bg-[#183D2B] hover:bg-[#24553d] disabled:opacity-50 rounded-lg shadow-xs cursor-pointer transition"
        >
          {{ submitting ? 'Menyimpan...' : 'Simpan Profil' }}
        </button>
      </div>
    </div>
  </div>
</template>
