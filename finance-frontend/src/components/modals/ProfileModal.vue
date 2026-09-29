<script setup lang="ts">
import { ref, watch } from 'vue';
import { financeApi, type FinanceProfile } from '../../api/services';
import { formatNumberInput, parseCleanNumber } from '../../utils/format';
import { Wallet, X } from 'lucide-vue-next';

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

const handleInitialBalanceInput = (e: Event) => {
  const target = e.target as HTMLInputElement;
  initialBalance.value = formatNumberInput(target.value);
};

const handleMonthlyNeedsInput = (e: Event) => {
  const target = e.target as HTMLInputElement;
  monthlyNeeds.value = formatNumberInput(target.value);
};

watch(
  () => props.profile,
  (newVal) => {
    if (newVal) {
      initialBalance.value = formatNumberInput(newVal.initialBalance || '0');
      monthlyNeeds.value = formatNumberInput(newVal.monthlyNeeds || '0');
      timezone.value = newVal.timezone || 'Asia/Makassar';
    }
  },
  { immediate: true }
);

import { useToast } from '../../composables/useToast';

const toast = useToast();

const handleSave = async () => {
  submitting.value = true;
  try {
    await financeApi.updateProfile({
      initialBalance: parseCleanNumber(initialBalance.value),
      monthlyNeeds: parseCleanNumber(monthlyNeeds.value),
      timezone: timezone.value,
    });
    toast.success('Profil keuangan berhasil diperbarui!');
    emit('saved');
    emit('close');
  } catch (err: any) {
    toast.error(err.response?.data?.message || 'Gagal memperbarui profil');
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
    aria-labelledby="profile-modal-title"
    @click.self="emit('close')"
  >
    <div class="bg-white dark:bg-[#0D1524] rounded-t-3xl sm:rounded-2xl max-h-[92dvh] sm:max-h-[85vh] w-full max-w-md mx-auto flex flex-col shadow-2xl border border-slate-200/90 dark:border-slate-800 overflow-hidden animate-modal-enter">
      <!-- Header (shrink-0) -->
      <div class="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0 bg-white dark:bg-[#0D1524]">
        <div class="flex items-center gap-2.5">
          <div class="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-100/50 dark:border-blue-900/50">
            <Wallet class="w-5 h-5" :stroke-width="2" />
          </div>
          <div>
            <h3 id="profile-modal-title" class="text-base font-extrabold text-slate-900 dark:text-slate-100 leading-tight">Setup Profil & Saldo Awal</h3>
            <span class="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Pengaturan basis uang dan zona waktu</span>
          </div>
        </div>

        <button
          type="button"
          @click="emit('close')"
          class="tactile-btn min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
          aria-label="Tutup dialog"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Form Inputs (flex-1 overscroll-contain) -->
      <div class="p-5 overflow-y-auto flex-1 overscroll-contain space-y-4">
        <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
          Saldo awal adalah total uang yang Anda miliki sebelum mulai pencatatan. Penyesuaian saldo awal akan memperbarui Saldo utama secara otomatis.
        </p>

      <div class="space-y-3.5 pt-1">
        <div>
          <label for="profile-initial-balance" class="block text-xs font-bold text-slate-900 dark:text-slate-100 mb-1">Saldo Awal (Rp)</label>
          <input
            id="profile-initial-balance"
            :value="initialBalance"
            @input="handleInitialBalanceInput"
            type="text"
            inputmode="numeric"
            placeholder="Contoh: 10.000.000"
            class="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl text-base font-extrabold text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-[#070B14] focus:bg-white dark:focus:bg-[#070B14] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 dark:focus:border-blue-500 tabular-nums"
          />
        </div>

        <div>
          <label for="profile-essentials" class="block text-xs font-bold text-slate-900 dark:text-slate-100 mb-1">Kebutuhan Pokok Bulanan (Rp)</label>
          <input
            id="profile-essentials"
            :value="monthlyNeeds"
            @input="handleMonthlyNeedsInput"
            type="text"
            inputmode="numeric"
            placeholder="Contoh: 3.000.000"
            class="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-[#070B14] focus:bg-white dark:focus:bg-[#070B14] text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 dark:focus:border-blue-500 tabular-nums"
          />
          <span class="text-[10px] text-slate-500 dark:text-slate-400 mt-1 block">
            Digunakan sebagai acuan ketahanan Dana Pengaman.
          </span>
        </div>

        <div>
          <label for="profile-timezone" class="block text-xs font-bold text-slate-900 dark:text-slate-100 mb-1">Zona Waktu Wilayah</label>
          <select
            id="profile-timezone"
            v-model="timezone"
            class="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-[#070B14] focus:bg-white dark:focus:bg-[#070B14] text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
          >
            <option value="Asia/Jakarta">WIB (Asia/Jakarta)</option>
            <option value="Asia/Makassar">WITA (Asia/Makassar)</option>
            <option value="Asia/Jayapura">WIT (Asia/Jayapura)</option>
          </select>
        </div>
      </div>

      </div>

      <!-- Action Buttons (shrink-0) -->
      <div class="flex items-center justify-end gap-2.5 p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-[#0D1524] shrink-0">
        <button
          type="button"
          @click="emit('close')"
          class="tactile-btn min-h-[44px] px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer border border-slate-200 dark:border-slate-800"
        >
          Batal
        </button>
        <button
          type="button"
          @click="handleSave"
          :disabled="submitting"
          class="tactile-btn min-h-[44px] px-5 py-2 text-xs font-bold text-white bg-[#0B192C] hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500 disabled:opacity-50 rounded-xl shadow-sm cursor-pointer"
        >
          {{ submitting ? 'Menyimpan...' : 'Simpan Profil' }}
        </button>
      </div>
    </div>
  </div>
</template>
