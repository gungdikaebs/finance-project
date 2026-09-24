<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import {
  Sparkles,
  Wallet,
  ReceiptText,
  ShieldAlert,
  PieChart,
  ArrowRight,
  ArrowLeft,
  Check,
  CheckCircle2,
  Info,
  Layers,
} from 'lucide-vue-next';
import { financeApi, type FinanceProfile } from '../../api/services';
import { formatRupiah } from '../../utils/format';

const props = defineProps<{
  show: boolean;
  profile: FinanceProfile | null;
}>();

const emit = defineEmits<{
  (e: 'completed'): void;
  (e: 'skipped'): void;
}>();

const currentStep = ref(1);
const totalSteps = 5;

// Form State
const initialBalanceInput = ref('');
const monthlyNeedsInput = ref('');
const emergencyMonths = ref(6);
const saving = ref(false);
const errorMessage = ref<string | null>(null);

// Preset options for emergency fund duration
const emergencyMonthOptions = [
  { value: 3, label: '3 Bulan', desc: 'Pemula / Karyawan Tetap' },
  { value: 6, label: '6 Bulan', desc: 'Rekomendasi Standar Ideal' },
  { value: 12, label: '12 Bulan', desc: 'Pekerja Lepas / Berkeluarga' },
];

// Raw numbers
const rawInitialBalance = computed(() => {
  const digits = initialBalanceInput.value.replace(/\D/g, '');
  return digits ? parseInt(digits, 10) : 0;
});

const rawMonthlyNeeds = computed(() => {
  const digits = monthlyNeedsInput.value.replace(/\D/g, '');
  return digits ? parseInt(digits, 10) : 0;
});

// Calculated target emergency amount
const targetEmergencyAmount = computed(() => {
  return rawMonthlyNeeds.value * emergencyMonths.value;
});

// Format input live as Rupiah
const onBalanceInput = (e: Event) => {
  const target = e.target as HTMLInputElement;
  const digits = target.value.replace(/\D/g, '');
  if (!digits) {
    initialBalanceInput.value = '';
    return;
  }
  initialBalanceInput.value = parseInt(digits, 10).toLocaleString('id-ID');
};

const onNeedsInput = (e: Event) => {
  const target = e.target as HTMLInputElement;
  const digits = target.value.replace(/\D/g, '');
  if (!digits) {
    monthlyNeedsInput.value = '';
    return;
  }
  monthlyNeedsInput.value = parseInt(digits, 10).toLocaleString('id-ID');
};

// Sync profile data when modal opens
watch(
  () => props.show,
  (isShown) => {
    if (isShown && props.profile) {
      currentStep.value = props.profile.onboardingStep || 1;
      if (Number(props.profile.initialBalance) > 0) {
        initialBalanceInput.value = Number(props.profile.initialBalance).toLocaleString('id-ID');
      }
      if (Number(props.profile.monthlyNeeds) > 0) {
        monthlyNeedsInput.value = Number(props.profile.monthlyNeeds).toLocaleString('id-ID');
      }
    }
  },
  { immediate: true }
);

// Navigation
const nextStep = () => {
  if (currentStep.value < totalSteps) {
    currentStep.value += 1;
    saveStepProgress();
  } else {
    finishOnboarding();
  }
};

const prevStep = () => {
  if (currentStep.value > 1) {
    currentStep.value -= 1;
  }
};

const saveStepProgress = async () => {
  try {
    await financeApi.updateOnboarding({
      onboardingStep: currentStep.value,
      initialBalance: rawInitialBalance.value > 0 ? String(rawInitialBalance.value) : undefined,
      monthlyNeeds: rawMonthlyNeeds.value > 0 ? String(rawMonthlyNeeds.value) : undefined,
      emergencyMonthsTarget: emergencyMonths.value,
    });
  } catch (err) {
    // Non-blocking background save
    console.warn('Failed to save onboarding progress:', err);
  }
};

const skipOnboarding = async () => {
  saving.value = true;
  errorMessage.value = null;
  try {
    await financeApi.updateOnboarding({
      isOnboardingCompleted: true,
    });
    emit('skipped');
  } catch (err: any) {
    errorMessage.value = err.response?.data?.message || 'Gagal melewati panduan';
  } finally {
    saving.value = false;
  }
};

const finishOnboarding = async () => {
  saving.value = true;
  errorMessage.value = null;
  try {
    await financeApi.updateOnboarding({
      isOnboardingCompleted: true,
      onboardingStep: 5,
      initialBalance: String(rawInitialBalance.value),
      monthlyNeeds: String(rawMonthlyNeeds.value),
      emergencyMonthsTarget: emergencyMonths.value,
    });
    emit('completed');
  } catch (err: any) {
    errorMessage.value = err.response?.data?.message || 'Gagal menyelesaikan panduan';
  } finally {
    saving.value = false;
  }
};
</script>

<template>
  <div
    v-if="show"
    class="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center p-0 sm:p-4 overflow-hidden"
    role="dialog"
    aria-modal="true"
    aria-labelledby="onboarding-title"
  >
    <!-- Locked Frosted Backdrop -->
    <div class="fixed inset-0 bg-[#0E1410]/70 backdrop-blur-md transition-opacity"></div>

    <!-- Modal Container -->
    <div
      class="relative w-full max-w-lg bg-white dark:bg-[#16201A] rounded-t-3xl sm:rounded-3xl max-h-[92dvh] sm:max-h-[85vh] shadow-2xl border border-stone-200/90 dark:border-[#243329] overflow-hidden flex flex-col mx-auto animate-modal-enter"
    >
      <!-- Top Decorative Accent -->
      <div class="h-2 w-full bg-gradient-to-r from-[#183D2B] via-[#B8DF38] to-[#183D2B]"></div>

      <!-- Header: Step Indicators & Title (shrink-0) -->
      <div class="px-5 sm:px-6 pt-5 pb-4 border-b border-stone-100 dark:border-[#243329] shrink-0 bg-white dark:bg-[#16201A]">
        <div class="flex items-center justify-between mb-3.5">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-xl bg-[#183D2B] dark:bg-[#B8DF38]/10 text-[#B8DF38] flex items-center justify-center font-bold text-xs shadow-sm">
              <Sparkles class="w-4 h-4" />
            </div>
            <div>
              <span class="text-xs font-semibold uppercase tracking-wider text-[#183D2B]/70 dark:text-[#98A79D]">
                Panduan Pengguna Baru
              </span>
              <h2 id="onboarding-title" class="text-lg font-bold text-[#18221B] dark:text-[#F0F4F1] leading-tight">
                Setup Awal Keuangan Anda
              </h2>
            </div>
          </div>
          <span class="text-xs font-bold text-emerald-800 dark:text-[#B8DF38] bg-emerald-50 dark:bg-[#0E1410] px-2.5 py-1 rounded-full border border-emerald-200 dark:border-[#243329]">
            Langkah {{ currentStep }} dari {{ totalSteps }}
          </span>
        </div>

        <!-- Step Progress Dots/Pills -->
        <div class="grid grid-cols-5 gap-1.5 pt-1">
          <div
            v-for="step in totalSteps"
            :key="step"
            class="h-1.5 rounded-full transition-all duration-300"
            :class="[
              step < currentStep
                ? 'bg-[#183D2B] dark:bg-[#B8DF38]'
                : step === currentStep
                ? 'bg-[#B8DF38]'
                : 'bg-stone-200 dark:bg-[#243329]'
            ]"
          ></div>
        </div>
      </div>

      <!-- Body Step Content (scrollable) -->
      <div class="p-5 sm:p-6 overflow-y-auto flex-1 overscroll-contain">
        <!-- Error Alert -->
        <div
          v-if="errorMessage"
          class="mb-4 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-800 dark:text-rose-300 rounded-xl text-xs flex items-center gap-2"
        >
          <Info class="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
          <span>{{ errorMessage }}</span>
        </div>

        <!-- STEP 1: Selamat Datang & Filosofi Satu Saldo Utama -->
        <div v-if="currentStep === 1" class="space-y-4 animate-in fade-in slide-in-from-right-4 duration-200">
          <div class="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-[#0E1410] border border-emerald-200/60 dark:border-[#243329] text-[#183D2B] dark:text-[#B8DF38] flex items-center justify-center mx-auto shadow-sm">
            <Layers class="w-7 h-7 text-[#183D2B] dark:text-[#B8DF38]" />
          </div>
          <div class="text-center space-y-1.5">
            <h3 class="text-base font-bold text-[#18221B] dark:text-[#F0F4F1]">
              Filosofi "Satu Saldo Utama"
            </h3>
            <p class="text-xs text-stone-600 dark:text-[#98A79D] leading-relaxed max-w-sm mx-auto">
              Aplikasi ini menggabungkan seluruh uang riil Anda ke dalam satu komitmen kas yang transparan agar tidak terjadi kebocoran uang terselubung.
            </p>
          </div>

          <div class="bg-[#F3F5EF] dark:bg-[#0E1410] rounded-2xl p-4 border border-emerald-950/5 dark:border-[#243329] space-y-2.5 text-xs text-stone-700 dark:text-stone-300">
            <div class="flex items-start gap-2.5">
              <CheckCircle2 class="w-4 h-4 text-[#183D2B] dark:text-[#B8DF38] shrink-0 mt-0.5" />
              <span><strong>Bebas Fragmentasi:</strong> Tanpa ribet mencatat transfer antar-rekening fisik yang semu.</span>
            </div>
            <div class="flex items-start gap-2.5">
              <CheckCircle2 class="w-4 h-4 text-[#183D2B] dark:text-[#B8DF38] shrink-0 mt-0.5" />
              <span><strong>Sistem Proteksi:</strong> Menandai uang untuk <em>Dana Pengaman</em> dan <em>Target Impian</em> tanpa perlu memindahkannya ke bank lain.</span>
            </div>
            <div class="flex items-start gap-2.5">
              <CheckCircle2 class="w-4 h-4 text-[#183D2B] dark:text-[#B8DF38] shrink-0 mt-0.5" />
              <span><strong>Anggaran 50/30/20:</strong> Membatasi belanja kebutuhan (50%), tabungan (30%), dan keinginan santai (20%).</span>
            </div>
          </div>
        </div>

        <!-- STEP 2: Input Saldo Awal -->
        <div v-if="currentStep === 2" class="space-y-4 animate-in fade-in slide-in-from-right-4 duration-200">
          <div class="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-[#0E1410] border border-emerald-200/60 dark:border-[#243329] text-[#183D2B] dark:text-[#B8DF38] flex items-center justify-center mx-auto shadow-sm">
            <Wallet class="w-7 h-7 text-[#183D2B] dark:text-[#B8DF38]" />
          </div>
          <div class="text-center space-y-1.5">
            <h3 class="text-base font-bold text-[#18221B] dark:text-[#F0F4F1]">
              Berapa Total Uang Riil Anda Saat Ini?
            </h3>
            <p class="text-xs text-stone-600 dark:text-[#98A79D] leading-relaxed max-w-sm mx-auto">
              Jumlahkan saldo di seluruh rekening bank, e-wallet, dan uang tunai yang Anda pegang hari ini sebagai saldo awal.
            </p>
          </div>

          <div class="space-y-2">
            <label for="onboarding-balance" class="block text-xs font-bold text-stone-700 dark:text-[#98A79D] uppercase tracking-wider">
              Total Saldo Awal Riil
            </label>
            <div class="relative">
              <span class="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-stone-400 dark:text-stone-500">
                Rp
              </span>
              <input
                id="onboarding-balance"
                type="text"
                :value="initialBalanceInput"
                @input="onBalanceInput"
                placeholder="0"
                class="w-full pl-12 pr-4 py-3.5 bg-[#F3F5EF] dark:bg-[#0E1410] border border-stone-200 dark:border-[#243329] rounded-xl text-lg font-bold text-[#18221B] dark:text-[#F0F4F1] tabular-nums focus:bg-white dark:focus:bg-[#0E1410] focus:outline-none focus:ring-2 focus:ring-[#B8DF38] focus:border-[#183D2B] dark:focus:border-[#B8DF38] transition-all"
                autofocus
              />
            </div>
            <p class="text-[11px] text-stone-500 dark:text-[#98A79D] flex items-center gap-1.5">
              <Info class="w-3.5 h-3.5 shrink-0 text-stone-400 dark:text-stone-500" />
              Saldo awal ini tidak akan tercatat sebagai pemasukan baru bulan berjalan.
            </p>
          </div>
        </div>

        <!-- STEP 3: Estimasi Kebutuhan Pokok -->
        <div v-if="currentStep === 3" class="space-y-4 animate-in fade-in slide-in-from-right-4 duration-200">
          <div class="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-[#0E1410] border border-emerald-200/60 dark:border-[#243329] text-[#183D2B] dark:text-[#B8DF38] flex items-center justify-center mx-auto shadow-sm">
            <ReceiptText class="w-7 h-7 text-[#183D2B] dark:text-[#B8DF38]" />
          </div>
          <div class="text-center space-y-1.5">
            <h3 class="text-base font-bold text-[#18221B] dark:text-[#F0F4F1]">
              Estimasi Pengeluaran Pokok Bulanan
            </h3>
            <p class="text-xs text-stone-600 dark:text-[#98A79D] leading-relaxed max-w-sm mx-auto">
              Perkiraan biaya bertahan hidup sebulan (makan, sewa/kost, tagihan listrik, internet, transportasi harian).
            </p>
          </div>

          <div class="space-y-2">
            <label for="onboarding-essentials" class="block text-xs font-bold text-stone-700 dark:text-[#98A79D] uppercase tracking-wider">
              Kebutuhan Pokok per Bulan
            </label>
            <div class="relative">
              <span class="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-stone-400 dark:text-stone-500">
                Rp
              </span>
              <input
                id="onboarding-essentials"
                type="text"
                :value="monthlyNeedsInput"
                @input="onNeedsInput"
                placeholder="0"
                class="w-full pl-12 pr-4 py-3.5 bg-[#F3F5EF] dark:bg-[#0E1410] border border-stone-200 dark:border-[#243329] rounded-xl text-lg font-bold text-[#18221B] dark:text-[#F0F4F1] tabular-nums focus:bg-white dark:focus:bg-[#0E1410] focus:outline-none focus:ring-2 focus:ring-[#B8DF38] focus:border-[#183D2B] dark:focus:border-[#B8DF38] transition-all"
                autofocus
              />
            </div>
            <p class="text-[11px] text-stone-500 dark:text-[#98A79D] flex items-center gap-1.5">
              <Info class="w-3.5 h-3.5 shrink-0 text-stone-400 dark:text-stone-500" />
              Nominal ini menjadi tolok ukur ketahanan Dana Pengaman (Emergency Fund) Anda.
            </p>
          </div>
        </div>

        <!-- STEP 4: Setup Dana Pengaman -->
        <div v-if="currentStep === 4" class="space-y-4 animate-in fade-in slide-in-from-right-4 duration-200">
          <div class="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-[#0E1410] border border-emerald-200/60 dark:border-[#243329] text-[#183D2B] dark:text-[#B8DF38] flex items-center justify-center mx-auto shadow-sm">
            <ShieldAlert class="w-7 h-7 text-[#183D2B] dark:text-[#B8DF38]" />
          </div>
          <div class="text-center space-y-1.5">
            <h3 class="text-base font-bold text-[#18221B] dark:text-[#F0F4F1]">
              Target Ketahanan Dana Pengaman
            </h3>
            <p class="text-xs text-stone-600 dark:text-[#98A79D] leading-relaxed max-w-sm mx-auto">
              Berapa bulan Anda ingin merasa tenang terlindungi jika terjadi krisis atau kehilangan pekerjaan mendadak?
            </p>
          </div>

          <div class="grid grid-cols-1 gap-2.5">
            <button
              v-for="opt in emergencyMonthOptions"
              :key="opt.value"
              type="button"
              @click="emergencyMonths = opt.value"
              class="p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all tactile-btn cursor-pointer"
              :class="[
                emergencyMonths === opt.value
                  ? 'border-[#183D2B] dark:border-[#B8DF38] bg-emerald-50/70 dark:bg-[#183D2B]/30 ring-2 ring-[#B8DF38]/50 shadow-sm'
                  : 'border-stone-200 dark:border-[#243329] bg-white dark:bg-[#0E1410] hover:border-stone-300 dark:hover:border-stone-700'
              ]"
            >
              <div>
                <div class="text-xs font-bold text-[#18221B] dark:text-[#F0F4F1]">{{ opt.label }}</div>
                <div class="text-[11px] text-stone-500 dark:text-[#98A79D]">{{ opt.desc }}</div>
              </div>
              <div
                class="w-5 h-5 rounded-full flex items-center justify-center border transition-all"
                :class="[
                  emergencyMonths === opt.value
                    ? 'border-[#183D2B] dark:border-[#B8DF38] bg-[#183D2B] dark:bg-[#B8DF38] text-[#B8DF38] dark:text-[#0E1410]'
                    : 'border-stone-300 dark:border-[#243329] bg-white dark:bg-[#16201A]'
                ]"
              >
                <Check v-if="emergencyMonths === opt.value" class="w-3 h-3" :stroke-width="3" />
              </div>
            </button>
          </div>

          <!-- Target Preview Box -->
          <div class="p-3.5 bg-[#F3F5EF] dark:bg-[#0E1410] rounded-2xl border border-emerald-950/10 dark:border-[#243329] flex items-center justify-between">
            <span class="text-xs text-stone-600 dark:text-[#98A79D] font-medium">Target Nominal Dana Pengaman:</span>
            <span class="text-sm font-bold text-[#183D2B] dark:text-[#B8DF38] tabular-nums">
              {{ formatRupiah(targetEmergencyAmount) }}
            </span>
          </div>
        </div>

        <!-- STEP 5: Konfirmasi Rasio Anggaran 50/30/20 -->
        <div v-if="currentStep === 5" class="space-y-4 animate-in fade-in slide-in-from-right-4 duration-200">
          <div class="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-[#0E1410] border border-emerald-200/60 dark:border-[#243329] text-[#183D2B] dark:text-[#B8DF38] flex items-center justify-center mx-auto shadow-sm">
            <PieChart class="w-7 h-7 text-[#183D2B] dark:text-[#B8DF38]" />
          </div>
          <div class="text-center space-y-1.5">
            <h3 class="text-base font-bold text-[#18221B] dark:text-[#F0F4F1]">
              Siap Memulai Pengelolaan Finansial!
            </h3>
            <p class="text-xs text-stone-600 dark:text-[#98A79D] leading-relaxed max-w-sm mx-auto">
              Aplikasi telah menyiapkan template kategori lengkap dan menerapkan aturan pembagian anggaran 50/30/20 secara otomatis.
            </p>
          </div>

          <!-- Summary Bento Cards -->
          <div class="space-y-2 text-xs">
            <div class="p-3 bg-stone-50 dark:bg-[#0E1410] rounded-xl border border-stone-200/80 dark:border-[#243329] flex items-center justify-between">
              <span class="text-stone-600 dark:text-[#98A79D]">Saldo Awal Riil:</span>
              <span class="font-bold text-[#18221B] dark:text-[#F0F4F1] tabular-nums">{{ formatRupiah(rawInitialBalance) }}</span>
            </div>
            <div class="p-3 bg-stone-50 dark:bg-[#0E1410] rounded-xl border border-stone-200/80 dark:border-[#243329] flex items-center justify-between">
              <span class="text-stone-600 dark:text-[#98A79D]">Kebutuhan Pokok Bulanan:</span>
              <span class="font-bold text-[#18221B] dark:text-[#F0F4F1] tabular-nums">{{ formatRupiah(rawMonthlyNeeds) }}</span>
            </div>
            <div class="p-3 bg-stone-50 dark:bg-[#0E1410] rounded-xl border border-stone-200/80 dark:border-[#243329] flex items-center justify-between">
              <span class="text-stone-600 dark:text-[#98A79D]">Target Dana Pengaman ({{ emergencyMonths }} Bln):</span>
              <span class="font-bold text-[#183D2B] dark:text-[#B8DF38] tabular-nums">{{ formatRupiah(targetEmergencyAmount) }}</span>
            </div>
          </div>

          <!-- 50/30/20 Ratio Visual Bar -->
          <div class="space-y-1.5 pt-1">
            <div class="flex items-center justify-between text-[11px] font-bold">
              <span class="text-emerald-800 dark:text-emerald-400">50% Kebutuhan</span>
              <span class="text-lime-700 dark:text-[#B8DF38]">30% Tabungan</span>
              <span class="text-amber-700 dark:text-amber-400">20% Keinginan</span>
            </div>
            <div class="h-2.5 w-full rounded-full overflow-hidden flex bg-stone-200 dark:bg-[#243329] shadow-inner">
              <div class="bg-[#183D2B] dark:bg-emerald-600 h-full w-[50%]"></div>
              <div class="bg-[#B8DF38] h-full w-[30%]"></div>
              <div class="bg-amber-400 h-full w-[20%]"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer Actions -->
      <div class="px-5 sm:px-6 py-4 bg-stone-50/80 dark:bg-[#16201A] border-t border-stone-100 dark:border-[#243329] flex items-center justify-between shrink-0 gap-3">
        <!-- Back button or Skip button -->
        <div>
          <button
            v-if="currentStep > 1"
            type="button"
            @click="prevStep"
            class="min-h-[44px] px-4 py-2.5 rounded-xl border border-stone-200 dark:border-[#243329] text-xs font-semibold text-stone-600 dark:text-[#98A79D] hover:bg-stone-100 dark:hover:bg-[#243329] transition-all flex items-center gap-1.5 tactile-btn cursor-pointer"
          >
            <ArrowLeft class="w-3.5 h-3.5" />
            Kembali
          </button>
          <button
            v-else
            type="button"
            @click="skipOnboarding"
            :disabled="saving"
            class="min-h-[44px] flex items-center text-xs font-semibold text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-[#F0F4F1] transition-colors py-2 px-1 cursor-pointer"
          >
            Lewati untuk sekarang
          </button>
        </div>

        <!-- Next / Finish Button -->
        <div class="flex items-center gap-2">
          <button
            v-if="currentStep < totalSteps"
            type="button"
            @click="nextStep"
            class="min-h-[44px] px-5 py-2.5 rounded-xl bg-[#183D2B] dark:bg-[#B8DF38] text-white dark:text-[#0E1410] hover:bg-emerald-900 dark:hover:bg-[#a6cb2f] text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 tactile-btn cursor-pointer"
          >
            Lanjut
            <ArrowRight class="w-3.5 h-3.5" />
          </button>
          <button
            v-else
            type="button"
            @click="finishOnboarding"
            :disabled="saving"
            class="min-h-[44px] px-6 py-2.5 rounded-xl bg-[#B8DF38] text-[#18221B] hover:bg-[#a6cb2f] text-xs font-bold transition-all shadow-md flex items-center gap-1.5 tactile-btn disabled:opacity-50 cursor-pointer"
          >
            <Check class="w-4 h-4" :stroke-width="2.5" />
            {{ saving ? 'Menyimpan...' : 'Selesai & Buka Dashboard' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
