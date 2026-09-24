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
    <div class="bg-white dark:bg-[#16201A] rounded-t-3xl sm:rounded-2xl max-h-[92dvh] sm:max-h-[85vh] w-full max-w-md mx-auto flex flex-col shadow-2xl border border-stone-200/90 dark:border-[#243329] overflow-hidden animate-modal-enter">
      <!-- Header (shrink-0) -->
      <div class="px-5 py-4 border-b border-stone-100 dark:border-[#243329] flex items-center justify-between shrink-0 bg-white dark:bg-[#16201A]">
        <div class="flex items-center gap-2.5">
          <div class="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-[#243329] text-[#183D2B] dark:text-[#B8DF38] flex items-center justify-center shrink-0 border border-emerald-100/50 dark:border-[#344639]">
            <Wallet class="w-5 h-5" :stroke-width="2" />
          </div>
          <div>
            <h3 id="profile-modal-title" class="text-base font-extrabold text-[#18221B] dark:text-[#F0F4F1] leading-tight">Setup Profil & Saldo Awal</h3>
            <span class="text-[11px] text-stone-500 dark:text-[#98A79D] font-medium">Pengaturan basis uang dan zona waktu</span>
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
        <p class="text-xs text-stone-500 dark:text-[#98A79D] leading-relaxed font-normal">
          Saldo awal adalah total uang yang Anda miliki sebelum mulai pencatatan. Penyesuaian saldo awal akan memperbarui Saldo utama secara otomatis.
        </p>

      <div class="space-y-3.5 pt-1">
        <div>
          <label for="profile-initial-balance" class="block text-xs font-bold text-[#18221B] dark:text-[#F0F4F1] mb-1">Saldo Awal (Rp)</label>
          <input
            id="profile-initial-balance"
            :value="initialBalance"
            @input="handleInitialBalanceInput"
            type="text"
            inputmode="numeric"
            placeholder="Contoh: 10.000.000"
            class="w-full px-3.5 py-2.5 border border-stone-200 dark:border-[#243329] rounded-xl text-base font-extrabold text-[#18221B] dark:text-[#F0F4F1] bg-stone-50/70 dark:bg-[#0E1410] focus:bg-white dark:focus:bg-[#0E1410] focus:outline-none focus:ring-2 focus:ring-[#183D2B]/20 dark:focus:ring-[#B8DF38]/20 focus:border-[#183D2B] dark:focus:border-[#B8DF38] tabular-nums"
          />
        </div>

        <div>
          <label for="profile-essentials" class="block text-xs font-bold text-[#18221B] dark:text-[#F0F4F1] mb-1">Kebutuhan Pokok Bulanan (Rp)</label>
          <input
            id="profile-essentials"
            :value="monthlyNeeds"
            @input="handleMonthlyNeedsInput"
            type="text"
            inputmode="numeric"
            placeholder="Contoh: 3.000.000"
            class="w-full px-3.5 py-2.5 border border-stone-200 dark:border-[#243329] rounded-xl text-xs font-semibold bg-stone-50/70 dark:bg-[#0E1410] focus:bg-white dark:focus:bg-[#0E1410] text-[#18221B] dark:text-[#F0F4F1] focus:outline-none focus:ring-2 focus:ring-[#183D2B]/20 dark:focus:ring-[#B8DF38]/20 focus:border-[#183D2B] dark:focus:border-[#B8DF38] tabular-nums"
          />
          <span class="text-[10px] text-stone-500 dark:text-[#98A79D] mt-1 block">
            Digunakan sebagai acuan ketahanan Dana Pengaman.
          </span>
        </div>

        <div>
          <label for="profile-timezone" class="block text-xs font-bold text-[#18221B] dark:text-[#F0F4F1] mb-1">Zona Waktu Wilayah</label>
          <select
            id="profile-timezone"
            v-model="timezone"
            class="w-full px-3.5 py-2.5 border border-stone-200 dark:border-[#243329] rounded-xl text-xs font-semibold bg-stone-50/70 dark:bg-[#0E1410] focus:bg-white dark:focus:bg-[#0E1410] text-[#18221B] dark:text-[#F0F4F1] focus:outline-none focus:ring-2 focus:ring-[#183D2B]/20 dark:focus:ring-[#B8DF38]/20 cursor-pointer"
          >
            <option value="Asia/Jakarta">WIB (Asia/Jakarta)</option>
            <option value="Asia/Makassar">WITA (Asia/Makassar)</option>
            <option value="Asia/Jayapura">WIT (Asia/Jayapura)</option>
          </select>
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
          @click="handleSave"
          :disabled="submitting"
          class="tactile-btn min-h-[44px] px-5 py-2 text-xs font-bold text-white dark:text-[#0E1410] bg-[#183D2B] dark:bg-[#B8DF38] hover:bg-[#24553d] dark:hover:bg-[#a3c82e] disabled:opacity-50 rounded-xl shadow-sm cursor-pointer"
        >
          {{ submitting ? 'Menyimpan...' : 'Simpan Profil' }}
        </button>
      </div>
    </div>
  </div>
</template>
