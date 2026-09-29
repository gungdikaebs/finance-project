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
    class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
    role="dialog"
    aria-modal="true"
    aria-labelledby="onboarding-title"
  >
    <!-- Locked Deep Frosted Backdrop (prevents distracting background glows) -->
    <div class="fixed inset-0 bg-[#070B14]/85 backdrop-blur-xl transition-opacity"></div>

    <!-- Modal Container -->
    <div
      class="relative w-full max-w-lg bg-white dark:bg-[#0D1524] rounded-3xl max-h-[88dvh] shadow-2xl border border-slate-200/90 dark:border-slate-800 overflow-hidden flex flex-col my-auto animate-modal-enter"
    >
      <!-- Header: Step Indicators & Title (shrink-0) -->
      <div class="px-5 sm:px-6 pt-5 pb-4 border-b border-slate-100 dark:border-slate-800 shrink-0 bg-white dark:bg-[#0D1524]">
        <div class="flex items-center justify-between mb-3.5">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/50 flex items-center justify-center font-bold text-xs">
              <Sparkles class="w-4 h-4" />
            </div>
            <div>
              <span class="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Panduan Pengguna Baru
              </span>
              <h2 id="onboarding-title" class="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 leading-tight">
                Setup Awal Keuangan Anda
              </h2>
            </div>
          </div>
          <span class="text-xs font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-[#070B14] px-2.5 py-1 rounded-full border border-slate-200/80 dark:border-slate-800">
            {{ currentStep }} / {{ totalSteps }}
          </span>
        </div>

        <!-- Step Progress Segmented Bar -->
        <div class="grid grid-cols-5 gap-1.5 pt-1">
          <div
            v-for="step in totalSteps"
            :key="step"
            class="h-1 rounded-full transition-all duration-300"
            :class="[
              step < currentStep
                ? 'bg-[#0B192C]/70 dark:bg-blue-600/50'
                : step === currentStep
                ? 'bg-[#0B192C] dark:bg-blue-500'
                : 'bg-slate-200 dark:bg-slate-800'
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
          <div class="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-[#070B14] border border-blue-100 dark:border-slate-800 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto shadow-2xs">
            <Layers class="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div class="text-center space-y-1.5">
            <h3 class="text-base font-bold text-slate-900 dark:text-slate-100">
              Filosofi "Satu Saldo Utama"
            </h3>
            <p class="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-sm mx-auto">
              Aplikasi ini menggabungkan seluruh uang riil Anda ke dalam satu komitmen kas yang transparan agar tidak terjadi kebocoran uang terselubung.
            </p>
          </div>

          <div class="bg-slate-50 dark:bg-[#070B14] rounded-2xl p-4 border border-slate-200/70 dark:border-slate-800 space-y-3 text-xs text-slate-700 dark:text-slate-300">
            <div class="flex items-start gap-2.5">
              <CheckCircle2 class="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <span><strong>Bebas Fragmentasi:</strong> Tanpa ribet mencatat transfer antar-rekening fisik yang semu.</span>
            </div>
            <div class="flex items-start gap-2.5">
              <CheckCircle2 class="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <span><strong>Sistem Proteksi:</strong> Menandai uang untuk <em>Dana Pengaman</em> dan <em>Target Impian</em> tanpa perlu memindahkannya ke bank lain.</span>
            </div>
            <div class="flex items-start gap-2.5">
              <CheckCircle2 class="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <span><strong>Anggaran 50/30/20:</strong> Membatasi belanja kebutuhan (50%), tabungan (30%), dan keinginan santai (20%).</span>
            </div>
          </div>
        </div>

        <!-- STEP 2: Input Saldo Awal -->
        <div v-if="currentStep === 2" class="space-y-4 animate-in fade-in slide-in-from-right-4 duration-200">
          <div class="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-[#070B14] border border-blue-100 dark:border-slate-800 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto shadow-2xs">
            <Wallet class="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div class="text-center space-y-1.5">
            <h3 class="text-base font-bold text-slate-900 dark:text-slate-100">
              Berapa Total Uang Riil Anda Saat Ini?
            </h3>
            <p class="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-sm mx-auto">
              Jumlahkan saldo di seluruh rekening bank, e-wallet, dan uang tunai yang Anda pegang hari ini sebagai saldo awal.
            </p>
          </div>

          <div class="space-y-2">
            <label for="onboarding-balance" class="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Total Saldo Awal Riil
            </label>
            <div class="relative">
              <span class="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400 dark:text-slate-500">
                Rp
              </span>
              <input
                id="onboarding-balance"
                type="text"
                :value="initialBalanceInput"
                @input="onBalanceInput"
                placeholder="0"
                class="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-[#070B14] border border-slate-200 dark:border-slate-800 rounded-xl text-base font-bold text-slate-900 dark:text-slate-100 tabular-nums focus:bg-white dark:focus:bg-[#070B14] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 dark:focus:border-blue-500 transition-all"
                autofocus
              />
            </div>
            <p class="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Info class="w-3.5 h-3.5 shrink-0 text-slate-400 dark:text-slate-500" />
              Saldo awal ini tidak akan tercatat sebagai pemasukan baru bulan berjalan.
            </p>
          </div>
        </div>

        <!-- STEP 3: Estimasi Kebutuhan Pokok -->
        <div v-if="currentStep === 3" class="space-y-4 animate-in fade-in slide-in-from-right-4 duration-200">
          <div class="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-[#070B14] border border-blue-100 dark:border-slate-800 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto shadow-2xs">
            <ReceiptText class="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div class="text-center space-y-1.5">
            <h3 class="text-base font-bold text-slate-900 dark:text-slate-100">
              Estimasi Pengeluaran Pokok Bulanan
            </h3>
            <p class="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-sm mx-auto">
              Perkiraan biaya bertahan hidup sebulan (makan, sewa/kost, tagihan listrik, internet, transportasi harian).
            </p>
          </div>

          <div class="space-y-2">
            <label for="onboarding-essentials" class="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Kebutuhan Pokok per Bulan
            </label>
            <div class="relative">
              <span class="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400 dark:text-slate-500">
                Rp
              </span>
              <input
                id="onboarding-essentials"
                type="text"
                :value="monthlyNeedsInput"
                @input="onNeedsInput"
                placeholder="0"
                class="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-[#070B14] border border-slate-200 dark:border-slate-800 rounded-xl text-base font-bold text-slate-900 dark:text-slate-100 tabular-nums focus:bg-white dark:focus:bg-[#070B14] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 dark:focus:border-blue-500 transition-all"
                autofocus
              />
            </div>
            <p class="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Info class="w-3.5 h-3.5 shrink-0 text-slate-400 dark:text-slate-500" />
              Nominal ini menjadi tolok ukur ketahanan Dana Pengaman (Emergency Fund) Anda.
            </p>
          </div>
        </div>

        <!-- STEP 4: Setup Dana Pengaman -->
        <div v-if="currentStep === 4" class="space-y-4 animate-in fade-in slide-in-from-right-4 duration-200">
          <div class="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-[#070B14] border border-blue-100 dark:border-slate-800 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto shadow-2xs">
            <ShieldAlert class="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div class="text-center space-y-1.5">
            <h3 class="text-base font-bold text-slate-900 dark:text-slate-100">
              Target Ketahanan Dana Pengaman
            </h3>
            <p class="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-sm mx-auto">
              Berapa bulan Anda ingin merasa tenang terlindungi jika terjadi krisis atau kehilangan pekerjaan mendadak?
            </p>
          </div>

          <div class="grid grid-cols-1 gap-2.5">
            <button
              v-for="opt in emergencyMonthOptions"
              :key="opt.value"
              type="button"
              @click="emergencyMonths = opt.value"
              class="p-3.5 rounded-xl border text-left flex items-center justify-between transition-all tactile-btn cursor-pointer"
              :class="[
                emergencyMonths === opt.value
                  ? 'border-blue-600 dark:border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 text-slate-900 dark:text-slate-100 ring-2 ring-blue-500/20'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070B14] text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
              ]"
            >
              <div>
                <div class="text-xs font-bold">{{ opt.label }}</div>
                <div class="text-[11px] text-slate-500 dark:text-slate-400">{{ opt.desc }}</div>
              </div>
              <div
                class="w-5 h-5 rounded-full flex items-center justify-center border transition-all"
                :class="[
                  emergencyMonths === opt.value
                    ? 'border-blue-600 dark:border-blue-500 bg-[#0B192C] dark:bg-blue-600 text-white'
                    : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-[#070B14]'
                ]"
              >
                <Check v-if="emergencyMonths === opt.value" class="w-3 h-3" :stroke-width="3" />
              </div>
            </button>
          </div>

          <!-- Target Preview Box -->
          <div class="p-3.5 bg-slate-50 dark:bg-[#070B14] rounded-2xl border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
            <span class="text-xs text-slate-600 dark:text-slate-400 font-medium">Target Nominal Dana Pengaman:</span>
            <span class="text-sm font-bold text-slate-900 dark:text-slate-100 tabular-nums">
              {{ formatRupiah(targetEmergencyAmount) }}
            </span>
          </div>
        </div>

        <!-- STEP 5: Konfirmasi Rasio Anggaran 50/30/20 -->
        <div v-if="currentStep === 5" class="space-y-4 animate-in fade-in slide-in-from-right-4 duration-200">
          <div class="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-[#070B14] border border-blue-100 dark:border-slate-800 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto shadow-2xs">
            <PieChart class="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div class="text-center space-y-1.5">
            <h3 class="text-base font-bold text-slate-900 dark:text-slate-100">
              Siap Memulai Pengelolaan Finansial!
            </h3>
            <p class="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-sm mx-auto">
              Aplikasi telah menyiapkan template kategori lengkap dan menerapkan aturan pembagian anggaran 50/30/20 secara otomatis.
            </p>
          </div>

          <!-- Summary Bento Cards -->
          <div class="space-y-2 text-xs">
            <div class="p-3 bg-slate-50 dark:bg-[#070B14] rounded-xl border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
              <span class="text-slate-600 dark:text-slate-400">Saldo Awal Riil:</span>
              <span class="font-bold text-slate-900 dark:text-slate-100 tabular-nums">{{ formatRupiah(rawInitialBalance) }}</span>
            </div>
            <div class="p-3 bg-slate-50 dark:bg-[#070B14] rounded-xl border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
              <span class="text-slate-600 dark:text-slate-400">Kebutuhan Pokok Bulanan:</span>
              <span class="font-bold text-slate-900 dark:text-slate-100 tabular-nums">{{ formatRupiah(rawMonthlyNeeds) }}</span>
            </div>
            <div class="p-3 bg-slate-50 dark:bg-[#070B14] rounded-xl border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
              <span class="text-slate-600 dark:text-slate-400">Target Dana Pengaman ({{ emergencyMonths }} Bln):</span>
              <span class="font-bold text-slate-900 dark:text-slate-100 tabular-nums">{{ formatRupiah(targetEmergencyAmount) }}</span>
            </div>
          </div>

          <!-- 50/30/20 Ratio Visual Bar -->
          <div class="space-y-1.5 pt-1">
            <div class="flex items-center justify-between text-[11px] font-bold">
              <span class="text-blue-700 dark:text-blue-400">50% Kebutuhan</span>
              <span class="text-emerald-700 dark:text-emerald-400">30% Tabungan</span>
              <span class="text-amber-700 dark:text-amber-400">20% Keinginan</span>
            </div>
            <div class="h-2 w-full rounded-full overflow-hidden flex bg-slate-200 dark:bg-slate-800">
              <div class="bg-blue-600 h-full w-[50%]"></div>
              <div class="bg-emerald-500 h-full w-[30%]"></div>
              <div class="bg-amber-400 h-full w-[20%]"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer Actions -->
      <div class="px-5 sm:px-6 py-4 bg-slate-50/90 dark:bg-[#070B14] border-t border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0 gap-3">
        <!-- Back button or Skip button -->
        <div>
          <button
            v-if="currentStep > 1"
            type="button"
            @click="prevStep"
            class="min-h-[42px] px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all flex items-center gap-1.5 tactile-btn cursor-pointer"
          >
            <ArrowLeft class="w-3.5 h-3.5" />
            Kembali
          </button>
          <button
            v-else
            type="button"
            @click="skipOnboarding"
            :disabled="saving"
            class="min-h-[42px] flex items-center text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors py-2 px-1 cursor-pointer disabled:opacity-50"
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
            class="min-h-[42px] px-5 py-2 rounded-xl bg-[#0B192C] hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 tactile-btn cursor-pointer"
          >
            Lanjut
            <ArrowRight class="w-3.5 h-3.5" />
          </button>
          <button
            v-else
            type="button"
            @click="finishOnboarding"
            :disabled="saving"
            class="min-h-[42px] px-5 py-2 rounded-xl bg-[#0B192C] hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 tactile-btn disabled:opacity-50 cursor-pointer"
          >
            <Check class="w-4 h-4" :stroke-width="2.5" />
            {{ saving ? 'Menyimpan...' : 'Selesai & Buka Dashboard' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
