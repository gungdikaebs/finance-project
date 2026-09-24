<script setup lang="ts">
import { ref, computed, nextTick, watch } from 'vue';
import {
  financeApi,
  type SavingsGoal,
  type GoalSimulationResult,
  type MortgageSimulationResult,
} from '../../api/services';
import { formatRupiah } from '../../utils/format';
import {
  Calculator,
  Target,
  X,
  TrendingUp,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Info,
  ChevronDown,
} from 'lucide-vue-next';

const props = defineProps<{
  show: boolean;
  initialGoal?: SavingsGoal | null;
  initialMonthlySavings?: string | number | null;
  initialTab?: 'goal' | 'mortgage';
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const simActiveTab = ref<'goal' | 'mortgage'>('goal');

// Goal Sim state
const simGoalName = ref('');
const simPrice = ref('');
const simReferenceDate = ref(new Date().toISOString().substring(0, 10));
const simCurrentSavings = ref('');
const simInflation = ref<number | string>(5.0);
const simMode = ref<'FULL' | 'DOWN_PAYMENT'>('FULL');
const simDpPercent = ref<number | string>(20);
const simInitialFees = ref('');
const simCalcMode = ref<'MONTHLY_SAVINGS' | 'TARGET_DATE'>('MONTHLY_SAVINGS');
const simTargetMonths = ref<number | string>(24);
const simMonthlySavings = ref('');
const simGoalLoading = ref(false);
const simGoalResult = ref<GoalSimulationResult | null>(null);
const simGoalError = ref('');
const simGoalPriceInput = ref<HTMLInputElement | null>(null);
const simGoalResultPanel = ref<HTMLElement | null>(null);
const simGoalErrorMessage = ref<HTMLElement | null>(null);

const isSavingsSufficient = computed(() => {
  if (!simGoalResult.value) return false;
  const monthly = Number(simGoalResult.value.monthlySavings);
  const cur = BigInt(simGoalResult.value.currentSavings || '0');
  const req = BigInt(simGoalResult.value.requiredFunds || '0');
  return monthly === 0 || cur >= req;
});

// Loan / Mortgage Sim state (D-007, D-008 & General Installment)
const simLoanType = ref<'ANNUITY' | 'FLAT' | 'STEPPED_MORTGAGE'>('ANNUITY');
const simTenorUnit = ref<'YEARS' | 'MONTHS'>('YEARS');
const simMortgagePrincipal = ref('');
const simMortgageTenorValue = ref<number | string>(15);
const simMortgageFixedRate = ref<number | string>(6.5);
const simMortgageFixedYears = ref<number | string>(3);
const simMortgageFloatingRate = ref<number | string>(11.0);
const simMortgageIncome = ref('');
const simMortgageLoading = ref(false);
const simMortgageResult = ref<MortgageSimulationResult | null>(null);
const simMortgageError = ref('');
const simMortgagePrincipalInput = ref<HTMLInputElement | null>(null);
const simMortgageTenorInput = ref<HTMLInputElement | null>(null);
const simMortgageResultPanel = ref<HTMLElement | null>(null);
const simMortgageErrorMessage = ref<HTMLElement | null>(null);

const revealFeedback = async (element: HTMLElement | null) => {
  await nextTick();
  element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  element?.focus({ preventScroll: true });
};

const computedTenorMonths = computed(() => {
  const val = Number(simMortgageTenorValue.value) || 1;
  return simTenorUnit.value === 'YEARS'
    ? Math.min(360, Math.max(1, Math.round(val * 12)))
    : Math.min(360, Math.max(1, Math.round(val)));
});

watch(simTenorUnit, (newUnit) => {
  if (newUnit === 'MONTHS') {
    simMortgageTenorValue.value = Math.min(360, (Number(simMortgageTenorValue.value) || 1) * 12);
  } else {
    simMortgageTenorValue.value = Math.max(1, Math.round((Number(simMortgageTenorValue.value) || 12) / 12));
  }
});

watch(computedTenorMonths, (months) => {
  const maxFixedYears = Math.floor(months / 12);
  if (Number(simMortgageFixedYears.value) > maxFixedYears) {
    simMortgageFixedYears.value = Math.max(0, maxFixedYears);
  }
});

watch(simLoanType, () => {
  if (simMortgagePrincipal.value && simMortgageResult.value) {
    handleRunMortgageSim();
  } else {
    simMortgageResult.value = null;
  }
});

const handlePriceInput = (e: Event) => {
  const val = (e.target as HTMLInputElement).value;
  const num = val.replace(/[^0-9]/g, '');
  simPrice.value = num ? Number(num).toLocaleString('id-ID') : '';
};

const handleSavingsInput = (e: Event) => {
  const val = (e.target as HTMLInputElement).value;
  const num = val.replace(/[^0-9]/g, '');
  simCurrentSavings.value = num ? Number(num).toLocaleString('id-ID') : '';
};

const handleInitialFeesInput = (e: Event) => {
  const val = (e.target as HTMLInputElement).value;
  const num = val.replace(/[^0-9]/g, '');
  simInitialFees.value = num ? Number(num).toLocaleString('id-ID') : '';
};

const handleMonthlySavingsInput = (e: Event) => {
  const val = (e.target as HTMLInputElement).value;
  const num = val.replace(/[^0-9]/g, '');
  simMonthlySavings.value = num ? Number(num).toLocaleString('id-ID') : '';
};

const handlePrincipalInput = (e: Event) => {
  const val = (e.target as HTMLInputElement).value;
  const num = val.replace(/[^0-9]/g, '');
  simMortgagePrincipal.value = num ? Number(num).toLocaleString('id-ID') : '';
};

const handleIncomeInput = (e: Event) => {
  const val = (e.target as HTMLInputElement).value;
  const num = val.replace(/[^0-9]/g, '');
  simMortgageIncome.value = num ? Number(num).toLocaleString('id-ID') : '';
};

// Reset / Init when opened
watch(
  () => props.show,
  (val) => {
    if (val) {
      simActiveTab.value = props.initialTab || 'goal';
      simGoalResult.value = null;
      simMortgageResult.value = null;
      simGoalError.value = '';
      simMortgageError.value = '';

      if (props.initialGoal) {
        simGoalName.value = props.initialGoal.name;
        const rawPrice = props.initialGoal.priceReference || props.initialGoal.targetAmount || '';
        simPrice.value = rawPrice ? Number(String(rawPrice).replace(/[^0-9]/g, '')).toLocaleString('id-ID') : '';
        const rawBal = props.initialGoal.currentBalance || '';
        simCurrentSavings.value = rawBal ? Number(String(rawBal).replace(/[^0-9]/g, '')).toLocaleString('id-ID') : '';
        simMode.value = props.initialGoal.mode || 'FULL';
        if (props.initialGoal.annualPriceIncreaseRatio !== undefined && props.initialGoal.annualPriceIncreaseRatio !== null) {
          simInflation.value = props.initialGoal.annualPriceIncreaseRatio / 100;
        }
        if (props.initialGoal.targetMonths) {
          simTargetMonths.value = props.initialGoal.targetMonths;
        }
      }

      if (props.initialMonthlySavings) {
        simCalcMode.value = 'TARGET_DATE';
        const rawMonthly = String(props.initialMonthlySavings).replace(/[^0-9]/g, '');
        simMonthlySavings.value = rawMonthly ? Number(rawMonthly).toLocaleString('id-ID') : '';
        setTimeout(() => {
          handleRunGoalSim();
        }, 60);
      } else {
        simMonthlySavings.value = '';
        simCalcMode.value = 'MONTHLY_SAVINGS';
      }
    }
  }
);

const handleRunGoalSim = async () => {
  if (simGoalLoading.value) return;
  simGoalError.value = '';
  const cleanPrice = simPrice.value.replace(/[^0-9]/g, '');
  if (!cleanPrice || cleanPrice === '0') {
    simGoalError.value = 'Isi harga acuan lebih besar dari Rp 0 untuk menghitung rencana.';
    await nextTick();
    simGoalPriceInput.value?.focus();
    return;
  }

  simGoalLoading.value = true;
  simGoalResult.value = null;
  try {
    const cleanSavings = simCurrentSavings.value.replace(/[^0-9]/g, '') || '0';
    const cleanFees = simInitialFees.value.replace(/[^0-9]/g, '') || '0';
    const cleanMonthly = simMonthlySavings.value.replace(/[^0-9]/g, '') || undefined;

    const res = await financeApi.simulateGoal({
      priceReference: cleanPrice,
      referenceDate: simReferenceDate.value,
      annualPriceIncreaseRatio: simInflation.value !== '' ? Math.round(Number(simInflation.value) * 100) : 0,
      currentSavings: cleanSavings,
      mode: simMode.value,
      dpPercent: simMode.value === 'DOWN_PAYMENT' ? Math.round(Number(simDpPercent.value) * 100) : undefined,
      initialFees: simMode.value === 'DOWN_PAYMENT' ? cleanFees : undefined,
      calculationMode: simCalcMode.value,
      targetMonths: simCalcMode.value === 'MONTHLY_SAVINGS' ? Number(simTargetMonths.value) : undefined,
      monthlySavings: cleanMonthly,
    });
    simGoalResult.value = res.data.data;
    await nextTick();
    await revealFeedback(simGoalResultPanel.value);
  } catch (err: any) {
    simGoalError.value = err?.response?.data?.message || 'Rencana belum bisa dihitung. Periksa isian lalu coba lagi.';
    await nextTick();
    await revealFeedback(simGoalErrorMessage.value);
  } finally {
    simGoalLoading.value = false;
  }
};

const handleRunMortgageSim = async () => {
  if (simMortgageLoading.value) return;
  simMortgageError.value = '';
  const cleanPrincipal = simMortgagePrincipal.value.replace(/[^0-9]/g, '');
  if (!cleanPrincipal || cleanPrincipal === '0') {
    simMortgageError.value = 'Isi pokok pinjaman lebih besar dari Rp 0 untuk menghitung cicilan.';
    await nextTick();
    simMortgagePrincipalInput.value?.focus();
    return;
  }

  const tenorValue = Number(simMortgageTenorValue.value);
  const tenorMonths = computedTenorMonths.value;
  if (!Number.isFinite(tenorValue) || tenorValue < 1 || tenorValue > (simTenorUnit.value === 'YEARS' ? 30 : 360)) {
    simMortgageError.value = 'Isi jangka waktu antara 1 sampai 30 tahun atau 1 sampai 360 bulan.';
    await nextTick();
    simMortgageTenorInput.value?.focus();
    return;
  }

  simMortgageLoading.value = true;
  simMortgageResult.value = null;
  try {
    const cleanIncome = simMortgageIncome.value.replace(/[^0-9]/g, '') || undefined;
    const rate = simMortgageFixedRate.value !== '' ? Number(simMortgageFixedRate.value) : 0;
    const fixedMonths = simLoanType.value === 'STEPPED_MORTGAGE'
      ? Math.min(tenorMonths, Number(simMortgageFixedYears.value) * 12)
      : tenorMonths;
    const floatingRate = simLoanType.value === 'STEPPED_MORTGAGE' && fixedMonths < tenorMonths
      ? (simMortgageFloatingRate.value !== '' ? Number(simMortgageFloatingRate.value) : rate)
      : undefined;

    const res = await financeApi.simulateMortgage({
      principal: cleanPrincipal,
      tenorMonths,
      loanType: simLoanType.value,
      fixedRate: rate,
      fixedMonths,
      floatingRate,
      monthlyIncome: cleanIncome,
    });
    simMortgageResult.value = res.data.data;
    await nextTick();
    await revealFeedback(simMortgageResultPanel.value);
  } catch (err: any) {
    simMortgageError.value = err?.response?.data?.message || 'Cicilan belum bisa dihitung. Periksa isian lalu coba lagi.';
    await nextTick();
    await revealFeedback(simMortgageErrorMessage.value);
  } finally {
    simMortgageLoading.value = false;
  }
};

const continueToMortgage = (principalAmount: string) => {
  const clean = principalAmount.replace(/[^0-9]/g, '');
  simMortgagePrincipal.value = clean ? Number(clean).toLocaleString('id-ID') : '';
  simActiveTab.value = 'mortgage';

  const months = Number(simTargetMonths.value) || 12;
  if (months <= 60) {
    // Di bawah / sampai 5 tahun: Angsuran bulanan umum / kendaraan / anuitas
    simTenorUnit.value = 'MONTHS';
    simMortgageTenorValue.value = months;
    simLoanType.value = 'ANNUITY';
    simMortgageFixedRate.value = 8.5;
  } else {
    // Di atas 5 tahun: Skema KPR properti bertahap
    simTenorUnit.value = 'YEARS';
    simMortgageTenorValue.value = Math.max(1, Math.round(months / 12));
    simLoanType.value = 'STEPPED_MORTGAGE';
    simMortgageFixedYears.value = Math.min(3, Math.floor(months / 12));
    simMortgageFixedRate.value = 5.5;
    simMortgageFloatingRate.value = 11.0;
  }

  setTimeout(() => {
    handleRunMortgageSim();
  }, 60);
};
</script>

<template>
  <div
    v-if="show"
    class="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center p-0 sm:p-4 glass-modal-backdrop"
    role="dialog"
    aria-modal="true"
    aria-labelledby="sim-modal-title"
    @click.self="emit('close')"
  >
    <div
      class="bg-white dark:bg-[#16201A] rounded-t-3xl sm:rounded-2xl w-full max-w-4xl mx-auto max-h-[92dvh] sm:max-h-[88vh] flex flex-col shadow-2xl border border-stone-200/90 dark:border-[#243329] overflow-hidden animate-modal-enter"
    >
      <!-- Modal Header (shrink-0) -->
      <div class="px-5 sm:px-6 py-4 border-b border-stone-100 dark:border-[#243329] flex items-center justify-between shrink-0 bg-white dark:bg-[#16201A]">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl bg-stone-100 dark:bg-[#243329] text-[#183D2B] dark:text-[#B8DF38] flex items-center justify-center shrink-0 border border-stone-200/70 dark:border-[#344639]">
            <Calculator class="w-4 h-4" :stroke-width="2.2" />
          </div>
          <div>
            <h3 id="sim-modal-title" class="text-sm sm:text-base font-extrabold text-[#18221B] dark:text-[#F0F4F1] leading-tight">
              Simulator Finansial
            </h3>
            <p class="text-xs text-[#5E6961] dark:text-[#98A79D] mt-0.5">
              Kalkulator mandiri untuk proyeksi tabungan target dan estimasi angsuran kredit.
            </p>
          </div>
        </div>

        <button
          type="button"
          @click="emit('close')"
          class="tactile-btn min-w-[36px] min-h-[36px] flex items-center justify-center text-stone-400 hover:text-stone-700 dark:hover:text-[#F0F4F1] hover:bg-stone-100 dark:hover:bg-[#243329] rounded-xl cursor-pointer"
          aria-label="Tutup Modal"
        >
          <X class="w-4 h-4" />
        </button>
      </div>

      <!-- Pinned Segmented Control Tabs (shrink-0, stays visible on scroll) -->
      <div class="px-5 sm:px-6 py-2.5 border-b border-stone-100 dark:border-[#243329] bg-stone-50/60 dark:bg-[#121A15] shrink-0">
        <div class="inline-flex p-1 bg-stone-200/70 dark:bg-[#1B2620] rounded-xl w-full sm:w-auto gap-1">
          <button
            type="button"
            @click="simActiveTab = 'goal'"
            :aria-pressed="simActiveTab === 'goal'"
            class="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition select-none cursor-pointer"
            :class="simActiveTab === 'goal' ? 'bg-white dark:bg-[#16201A] text-[#18221B] dark:text-[#F0F4F1] shadow-xs' : 'text-stone-600 dark:text-[#98A79D] hover:text-stone-900 dark:hover:text-[#F0F4F1]'"
          >
            <Target class="w-3.5 h-3.5" :stroke-width="2.2" />
            <span>1. Rencana Menabung DP / Tunai</span>
          </button>
          <button
            type="button"
            @click="simActiveTab = 'mortgage'"
            :aria-pressed="simActiveTab === 'mortgage'"
            class="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition select-none cursor-pointer"
            :class="simActiveTab === 'mortgage' ? 'bg-white dark:bg-[#16201A] text-[#18221B] dark:text-[#F0F4F1] shadow-xs' : 'text-stone-600 dark:text-[#98A79D] hover:text-stone-900 dark:hover:text-[#F0F4F1]'"
          >
            <Calculator class="w-3.5 h-3.5" :stroke-width="2.2" />
            <span>2. Kalkulator Cicilan Kredit</span>
          </button>
        </div>
      </div>

      <!-- Body Content (flex-1 overscroll-contain) -->
      <div class="p-5 sm:p-6 overflow-y-auto flex-1 overscroll-contain">
        <div class="space-y-4">
          <!-- TAB 1: RENCANA MENABUNG (KUMPUL DP / CASH) -->
          <div v-if="simActiveTab === 'goal'" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
              <!-- Kolom Kiri: Form Input Parameter -->
              <div class="space-y-3.5 p-4 sm:p-5 bg-white dark:bg-[#16201A] border border-stone-200/80 dark:border-[#243329] rounded-2xl shadow-2xs">
                <div>
                  <label for="sim-goal-name" class="block text-xs font-bold text-[#18221B] dark:text-[#F0F4F1] mb-1.5">Nama Target (Opsional)</label>
                  <input
                    id="sim-goal-name"
                    v-model="simGoalName"
                    type="text"
                    placeholder="Contoh: Rumah Impian, Mobil, Laptop..."
                    class="w-full px-3 py-2 border border-stone-200 dark:border-[#243329] rounded-xl text-xs bg-stone-50/50 dark:bg-[#0E1410] text-[#18221B] dark:text-[#F0F4F1] focus:bg-white dark:focus:bg-[#0E1410] focus:outline-none focus:ring-2 focus:ring-[#183D2B]/15 dark:focus:ring-[#B8DF38]/20 focus:border-[#183D2B] dark:focus:border-[#B8DF38]"
                  />
                </div>

                <div>
                  <label for="sim-goal-mode" class="block text-xs font-bold text-[#18221B] dark:text-[#F0F4F1] mb-1.5">Tujuan Menabung</label>
                  <select
                    id="sim-goal-mode"
                    v-model="simMode"
                    class="w-full px-3 py-2 border border-stone-200 dark:border-[#243329] rounded-xl text-xs bg-stone-50/50 dark:bg-[#0E1410] text-[#18221B] dark:text-[#F0F4F1] focus:bg-white dark:focus:bg-[#0E1410] focus:outline-none focus:ring-2 focus:ring-[#183D2B]/15 dark:focus:ring-[#B8DF38]/20 focus:border-[#183D2B] dark:focus:border-[#B8DF38] cursor-pointer font-bold"
                  >
                    <option value="FULL">Beli Lunas Tunai (100% Cash)</option>
                    <option value="DOWN_PAYMENT">Kredit / Cicilan (Kumpulkan DP Saja Dulu)</option>
                  </select>
                </div>

                <div>
                  <label for="sim-goal-price" class="block text-xs font-bold text-[#18221B] dark:text-[#F0F4F1] mb-1.5">Harga Acuan Saat Ini (Rp)</label>
                  <input
                    id="sim-goal-price"
                    ref="simGoalPriceInput"
                    :value="simPrice"
                    @input="handlePriceInput"
                    @keyup.enter="handleRunGoalSim"
                    :aria-invalid="!!simGoalError && (!simPrice || simPrice === '0')"
                    type="text"
                    inputmode="numeric"
                    placeholder="0"
                    class="w-full px-3 py-2 border border-stone-200 dark:border-[#243329] rounded-xl text-sm font-extrabold bg-stone-50/50 dark:bg-[#0E1410] text-[#18221B] dark:text-[#F0F4F1] focus:bg-white dark:focus:bg-[#0E1410] focus:outline-none focus:ring-2 focus:ring-[#183D2B]/15 dark:focus:ring-[#B8DF38]/20 focus:border-[#183D2B] dark:focus:border-[#B8DF38] tabular-nums"
                  />
                </div>

                <div>
                  <label for="sim-goal-date" class="block text-xs font-bold text-[#18221B] dark:text-[#F0F4F1] mb-1.5">Tanggal Harga Acuan</label>
                  <input
                    id="sim-goal-date"
                    v-model="simReferenceDate"
                    type="date"
                    :max="new Date().toISOString().slice(0, 10)"
                    class="w-full px-3 py-2 border border-stone-200 dark:border-[#243329] rounded-xl text-xs bg-stone-50/50 dark:bg-[#0E1410] text-[#18221B] dark:text-[#F0F4F1] focus:bg-white dark:focus:bg-[#0E1410] focus:outline-none focus:ring-2 focus:ring-[#183D2B]/15 dark:focus:ring-[#B8DF38]/20 focus:border-[#183D2B] dark:focus:border-[#B8DF38] cursor-pointer"
                  />
                  <span class="text-[10px] text-stone-400 dark:text-[#98A79D] mt-1 block">
                    Harga disesuaikan dengan inflasi jika target dibeli di masa mendatang.
                  </span>
                </div>

                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label for="sim-goal-inflation" class="block text-[11px] font-bold text-[#18221B] dark:text-[#F0F4F1] mb-1">Inflasi Tahunan (%)</label>
                    <input
                      id="sim-goal-inflation"
                      v-model.number="simInflation"
                      @keyup.enter="handleRunGoalSim"
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      placeholder="5"
                      class="w-full px-3 py-2 border border-stone-200 dark:border-[#243329] rounded-xl text-xs bg-stone-50/50 dark:bg-[#0E1410] text-[#18221B] dark:text-[#F0F4F1] focus:bg-white dark:focus:bg-[#0E1410] focus:outline-none focus:ring-2 focus:ring-[#183D2B]/15 dark:focus:ring-[#B8DF38]/20 focus:border-[#183D2B] dark:focus:border-[#B8DF38] font-bold"
                    />
                  </div>
                  <div>
                    <label for="sim-goal-savings" class="block text-[11px] font-bold text-[#18221B] dark:text-[#F0F4F1] mb-1">Tabungan Dimiliki (Rp)</label>
                    <input
                      id="sim-goal-savings"
                      :value="simCurrentSavings"
                      @input="handleSavingsInput"
                      @keyup.enter="handleRunGoalSim"
                      type="text"
                      inputmode="numeric"
                      placeholder="0"
                      class="w-full px-3 py-2 border border-stone-200 dark:border-[#243329] rounded-xl text-xs bg-stone-50/50 dark:bg-[#0E1410] text-[#18221B] dark:text-[#F0F4F1] focus:bg-white dark:focus:bg-[#0E1410] focus:outline-none focus:ring-2 focus:ring-[#183D2B]/15 dark:focus:ring-[#B8DF38]/20 focus:border-[#183D2B] dark:focus:border-[#B8DF38] tabular-nums font-bold"
                    />
                  </div>
                </div>

                <!-- Parameter Khusus DP & Biaya Legalitas -->
                <div v-if="simMode === 'DOWN_PAYMENT'" class="space-y-3 pt-3 border-t border-stone-100 dark:border-[#243329]">
                  <details class="group text-[11px] text-stone-500 dark:text-[#98A79D] bg-stone-50/80 dark:bg-[#0E1410] rounded-xl p-2.5 border border-stone-200/70 dark:border-[#243329] cursor-pointer">
                    <summary class="font-bold text-stone-700 dark:text-[#F0F4F1] flex items-center justify-between select-none list-none">
                      <span class="flex items-center gap-1.5">
                        <Info class="w-3.5 h-3.5 text-stone-400 dark:text-[#98A79D]" />
                        <span>Tentang DP & Biaya Legalitas</span>
                      </span>
                      <ChevronDown class="w-3.5 h-3.5 text-stone-400 dark:text-[#98A79D] group-open:rotate-180 transition-transform" />
                    </summary>
                    <p class="mt-2 text-[11px] text-stone-600 dark:text-[#98A79D] leading-relaxed pt-2 border-t border-stone-200/60 dark:border-[#243329]">
                      DP langsung memotong pokok kredit. Biaya legalitas/pajak (BPHTB, notaris, provisi bank) adalah biaya transaksi terpisah di luar harga pokok barang.
                    </p>
                  </details>

                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label for="sim-goal-dp" class="block text-[11px] font-bold text-[#18221B] dark:text-[#F0F4F1] mb-1">Porsi DP (%)</label>
                      <div class="relative">
                        <input
                          id="sim-goal-dp"
                          v-model.number="simDpPercent"
                          @keyup.enter="handleRunGoalSim"
                          type="number"
                          min="0"
                          max="100"
                          placeholder="20"
                          class="w-full px-3 py-2 pr-7 border border-stone-200 dark:border-[#243329] rounded-xl text-xs font-bold bg-stone-50/50 dark:bg-[#0E1410] text-[#18221B] dark:text-[#F0F4F1] focus:bg-white dark:focus:bg-[#0E1410] focus:outline-none focus:ring-2 focus:ring-[#183D2B]/15 dark:focus:ring-[#B8DF38]/20 focus:border-[#183D2B] dark:focus:border-[#B8DF38] tabular-nums"
                        />
                        <span class="absolute right-3 top-2 text-xs font-bold text-stone-400 dark:text-[#98A79D]">%</span>
                      </div>
                    </div>

                    <div>
                      <label for="sim-goal-fees" class="block text-[11px] font-bold text-[#18221B] dark:text-[#F0F4F1] mb-1">Biaya Legalitas / Pajak (Rp)</label>
                      <input
                        id="sim-goal-fees"
                        :value="simInitialFees"
                        @input="handleInitialFeesInput"
                        @keyup.enter="handleRunGoalSim"
                        type="text"
                        inputmode="numeric"
                        placeholder="0 (Opsional)"
                        class="w-full px-3 py-2 border border-stone-200 dark:border-[#243329] rounded-xl text-xs bg-stone-50/50 dark:bg-[#0E1410] text-[#18221B] dark:text-[#F0F4F1] focus:bg-white dark:focus:bg-[#0E1410] focus:outline-none focus:ring-2 focus:ring-[#183D2B]/15 dark:focus:ring-[#B8DF38]/20 focus:border-[#183D2B] dark:focus:border-[#B8DF38] tabular-nums"
                      />
                    </div>
                  </div>
                </div>

                <!-- Mode Kalkulasi Waktu vs Setoran -->
                <div class="pt-3 border-t border-stone-100 dark:border-[#243329] space-y-2">
                  <label class="block text-xs font-bold text-[#18221B] dark:text-[#F0F4F1]">Metode Perhitungan</label>
                  <div class="space-y-1.5 text-xs font-medium text-stone-700 dark:text-[#98A79D]">
                    <label class="flex items-center gap-2 cursor-pointer select-none">
                      <input type="radio" v-model="simCalcMode" value="MONTHLY_SAVINGS" class="text-[#183D2B] focus:ring-[#183D2B] dark:focus:ring-[#B8DF38]" />
                      <span>Tentukan Target Waktu (Hitung Setoran Bulanan)</span>
                    </label>
                    <label class="flex items-center gap-2 cursor-pointer select-none">
                      <input type="radio" v-model="simCalcMode" value="TARGET_DATE" class="text-[#183D2B] focus:ring-[#183D2B] dark:focus:ring-[#B8DF38]" />
                      <span>Tentukan Setoran Tetap (Hitung Waktu Tercapai)</span>
                    </label>
                  </div>

                  <div v-if="simCalcMode === 'MONTHLY_SAVINGS'" class="pt-1.5">
                    <label for="sim-goal-months" class="block text-[11px] font-bold text-stone-600 dark:text-[#98A79D] mb-1">Target Waktu (Bulan)</label>
                    <input
                      id="sim-goal-months"
                      v-model.number="simTargetMonths"
                      @keyup.enter="handleRunGoalSim"
                      type="number"
                      min="1"
                      max="600"
                      class="w-full px-3 py-2 border border-stone-200 dark:border-[#243329] rounded-xl text-xs bg-stone-50/50 dark:bg-[#0E1410] text-[#18221B] dark:text-[#F0F4F1] focus:bg-white dark:focus:bg-[#0E1410] focus:outline-none focus:ring-2 focus:ring-[#183D2B]/15 dark:focus:ring-[#B8DF38]/20 focus:border-[#183D2B] dark:focus:border-[#B8DF38] font-bold tabular-nums"
                    />
                  </div>

                  <div v-if="simCalcMode === 'TARGET_DATE'" class="pt-1.5">
                    <label for="sim-goal-monthly" class="block text-[11px] font-bold text-stone-600 dark:text-[#98A79D] mb-1">Setoran Tabungan per Bulan (Rp)</label>
                    <input
                      id="sim-goal-monthly"
                      :value="simMonthlySavings"
                      @input="handleMonthlySavingsInput"
                      @keyup.enter="handleRunGoalSim"
                      type="text"
                      inputmode="numeric"
                      placeholder="Contoh: 1.500.000"
                      class="w-full px-3 py-2 border border-stone-200 dark:border-[#243329] rounded-xl text-xs bg-stone-50/50 dark:bg-[#0E1410] text-[#18221B] dark:text-[#F0F4F1] focus:bg-white dark:focus:bg-[#0E1410] focus:outline-none focus:ring-2 focus:ring-[#183D2B]/15 dark:focus:ring-[#B8DF38]/20 focus:border-[#183D2B] dark:focus:border-[#B8DF38] tabular-nums font-bold"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  @click="handleRunGoalSim"
                  :disabled="simGoalLoading"
                  class="tactile-btn w-full py-2.5 bg-[#183D2B] hover:bg-[#24553D] dark:bg-[#B8DF38] dark:hover:bg-[#a3c82e] text-white dark:text-[#0E1410] text-xs font-bold rounded-xl disabled:opacity-50 transition shadow-xs cursor-pointer inline-flex items-center justify-center gap-2"
                >
                  <TrendingUp class="w-3.5 h-3.5 text-[#B8DF38] dark:text-[#0E1410]" :stroke-width="2.5" />
                  <span>{{ simGoalLoading ? 'Menghitung...' : (simMode === 'DOWN_PAYMENT' ? 'Hitung Rencana DP' : 'Hitung Rencana Tabungan') }}</span>
                </button>
                <p v-if="simGoalError" ref="simGoalErrorMessage" tabindex="-1" role="alert" class="text-xs text-rose-700 dark:text-rose-300 leading-relaxed">
                  {{ simGoalError }}
                </p>
              </div>

              <!-- Kolom Kanan: Hasil Visual / Ringkasan Ledger -->
              <div class="flex flex-col justify-between">
                <div v-if="simGoalResult" ref="simGoalResultPanel" tabindex="-1" aria-label="Hasil rencana tabungan" class="p-5 rounded-2xl border border-stone-200/80 dark:border-[#243329] bg-stone-50/70 dark:bg-[#0E1410] flex flex-col justify-between space-y-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#183D2B] dark:focus-visible:ring-[#B8DF38]">
                  <div v-if="simGoalResult.isAchievable" class="space-y-3.5">
                    <!-- Header Ringkasan -->
                    <div class="flex items-center justify-between pb-3 border-b border-stone-200/70 dark:border-[#243329]">
                      <span class="text-xs font-black text-[#18221B] dark:text-[#F0F4F1] uppercase tracking-wider">
                        {{ simMode === 'DOWN_PAYMENT' ? 'Ringkasan Rencana DP' : 'Ringkasan Rencana Tabungan' }}
                      </span>
                      <span
                        class="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full border"
                        :class="isSavingsSufficient ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60' : 'bg-stone-100 dark:bg-[#243329] text-stone-700 dark:text-[#98A79D] border-stone-200 dark:border-[#344639]'"
                      >
                        <CheckCircle2 class="w-3 h-3" :class="isSavingsSufficient ? 'text-emerald-600 dark:text-emerald-400' : 'text-stone-500 dark:text-[#98A79D]'" />
                        <span>{{ isSavingsSufficient ? 'Dana Sudah Cukup' : 'Rencana Tercapai' }}</span>
                      </span>
                    </div>

                    <!-- KONDISI A: TABUNGAN SUDAH MENCUKUPI (DP TERPENUHI) -->
                    <div
                      v-if="isSavingsSufficient"
                      class="p-4 bg-white dark:bg-[#16201A] rounded-xl border border-stone-200/80 dark:border-[#243329] shadow-2xs space-y-2"
                    >
                      <div class="flex items-center gap-1.5 text-xs font-black text-[#183D2B] dark:text-[#B8DF38]">
                        <CheckCircle2 class="w-4 h-4 text-emerald-600 dark:text-[#B8DF38] shrink-0" />
                        <span>{{ simMode === 'DOWN_PAYMENT' ? 'Uang Muka (DP) Sudah Terpenuhi' : 'Dana Pembelian Sudah Terpenuhi' }}</span>
                      </div>
                      <p class="text-xs text-stone-600 dark:text-[#98A79D] leading-relaxed">
                        Tabungan Anda (<strong>{{ formatRupiah(simGoalResult.currentSavings) }}</strong>) sudah mencukupi kebutuhan {{ simMode === 'DOWN_PAYMENT' ? 'DP' : 'dana' }} sebesar <strong>{{ formatRupiah(simGoalResult.requiredFunds) }}</strong>.
                      </p>
                      <div class="pt-2 border-t border-stone-100 dark:border-[#243329] flex items-center justify-between text-xs">
                        <span class="text-stone-500 dark:text-[#98A79D]">Tambahan tabungan bulanan:</span>
                        <span class="font-bold text-[#183D2B] dark:text-[#B8DF38]">Rp 0 / bulan</span>
                      </div>
                    </div>

                    <!-- KONDISI B: MASIH PERLU MENABUNG BULANAN -->
                    <div v-else class="p-4 bg-white dark:bg-[#16201A] rounded-xl border border-stone-200/80 dark:border-[#243329] shadow-2xs space-y-1">
                      <span class="text-[11px] font-semibold text-stone-400 dark:text-[#98A79D] block">Setoran Tabungan Bulanan</span>
                      <div class="flex flex-col sm:flex-row sm:items-baseline sm:gap-1.5">
                        <span class="text-xl sm:text-3xl font-black text-[#18221B] dark:text-[#F0F4F1] tabular-nums tracking-tight whitespace-nowrap">
                          {{ formatRupiah(simGoalResult.monthlySavings) }}
                        </span>
                        <span class="text-xs font-semibold text-stone-500 dark:text-[#98A79D]">/ bulan</span>
                      </div>
                      <span class="text-[11px] text-stone-500 dark:text-[#98A79D] block pt-1 font-medium">
                        Estimasi terkumpul dalam <strong class="text-stone-800 dark:text-[#F0F4F1] tabular-nums">{{ simGoalResult.targetMonths }} bulan</strong>
                        <span v-if="(simGoalResult.targetMonths || 0) >= 12" class="text-stone-400 dark:text-stone-500"> ({{ ((simGoalResult.targetMonths || 0) / 12).toFixed(1) }} tahun)</span>
                      </span>
                    </div>

                    <!-- Rincian Biaya (Ledger Rows) -->
                    <div class="bg-white dark:bg-[#16201A] rounded-xl border border-stone-200/80 dark:border-[#243329] p-3.5 divide-y divide-stone-100 dark:divide-[#243329] text-xs">
                      <div class="flex justify-between py-1.5">
                        <span class="text-stone-500 dark:text-[#98A79D]">Harga Acuan Awal</span>
                        <span class="font-bold text-[#18221B] dark:text-[#F0F4F1] tabular-nums">{{ formatRupiah(simPrice.replace(/[^0-9]/g, '')) }}</span>
                      </div>
                      <div v-if="Number(simInflation || 0) > 0" class="flex justify-between py-1.5">
                        <span class="text-stone-500 dark:text-[#98A79D]">Proyeksi Harga (+Inflasi {{ simInflation }}%/thn)</span>
                        <span class="font-bold text-[#18221B] dark:text-[#F0F4F1] tabular-nums">{{ formatRupiah(simGoalResult.projectedPrice) }}</span>
                      </div>
                      <div v-if="simMode === 'DOWN_PAYMENT'" class="flex justify-between py-1.5">
                        <span class="text-stone-500 dark:text-[#98A79D]">Kebutuhan Uang Muka (DP {{ simDpPercent }}%)</span>
                        <span class="font-bold text-stone-800 dark:text-[#F0F4F1] tabular-nums">{{ formatRupiah(simGoalResult.downPayment) }}</span>
                      </div>
                      <div v-if="Number(simGoalResult.initialFees || 0) > 0" class="flex justify-between py-1.5">
                        <span class="text-stone-500 dark:text-[#98A79D]">Biaya Legalitas & Notaris / Pajak</span>
                        <span class="font-bold text-stone-800 dark:text-[#F0F4F1] tabular-nums">{{ formatRupiah(simGoalResult.initialFees) }}</span>
                      </div>
                      <div class="flex justify-between py-2 font-bold text-stone-700 dark:text-[#F0F4F1]">
                        <span>{{ simMode === 'DOWN_PAYMENT' ? 'Total Dana Tunai Awal (DP + Biaya)' : 'Total Kebutuhan Dana' }}</span>
                        <span class="font-black text-[#183D2B] dark:text-[#B8DF38] tabular-nums">{{ formatRupiah(simGoalResult.requiredFunds) }}</span>
                      </div>
                      <div class="flex justify-between py-1.5 text-stone-500 dark:text-[#98A79D] text-[11px]">
                        <span>Tabungan Dimiliki Saat Ini</span>
                        <span class="font-bold tabular-nums text-stone-700 dark:text-[#F0F4F1]">{{ formatRupiah(simGoalResult.currentSavings) }}</span>
                      </div>
                      <div v-if="simMode === 'DOWN_PAYMENT'" class="flex justify-between pt-2 border-t border-stone-200/80 dark:border-[#243329]">
                        <span class="font-bold text-stone-800 dark:text-[#F0F4F1]">Sisa Pokok yang Memerlukan Cicilan</span>
                        <span class="font-black text-[#18221B] dark:text-[#B8DF38] tabular-nums text-sm">{{ formatRupiah(simGoalResult.loanPrincipal) }}</span>
                      </div>
                    </div>

                    <!-- Tombol Lanjut ke Cicilan jika mode DP -->
                    <div v-if="simMode === 'DOWN_PAYMENT' && Number(simGoalResult.loanPrincipal || 0) > 0" class="pt-1">
                      <button
                        type="button"
                        @click="continueToMortgage(simGoalResult.loanPrincipal!)"
                        class="tactile-btn w-full py-2.5 px-4 bg-[#183D2B] hover:bg-[#24553D] dark:bg-[#B8DF38] dark:hover:bg-[#a3c82e] text-white dark:text-[#0E1410] rounded-xl text-xs font-bold transition flex items-center justify-between cursor-pointer shadow-xs group"
                      >
                        <div class="flex items-center gap-2 text-left">
                          <Calculator class="w-4 h-4 text-[#B8DF38] dark:text-[#0E1410]" />
                          <span>Simulasikan Cicilan Sisa Pokok</span>
                        </div>
                        <div class="flex items-center gap-1.5 text-stone-300 dark:text-[#0E1410]/70 font-semibold tabular-nums text-[11px]">
                          <span>{{ formatRupiah(simGoalResult.loanPrincipal) }}</span>
                          <ArrowRight class="w-3.5 h-3.5 text-[#B8DF38] dark:text-[#0E1410] group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </button>
                      <span class="text-[10px] text-stone-400 dark:text-[#98A79D] text-center block mt-1.5">
                        Lanjut ke Tab 2 untuk menghitung tagihan per bulan ke leasing atau bank.
                      </span>
                    </div>
                  </div>

                  <div v-else class="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-xl text-xs text-amber-900 dark:text-amber-200 space-y-1">
                    <div class="flex items-center gap-2 font-bold">
                      <AlertCircle class="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      <span>Tidak Tercapai dalam Batas Waktu</span>
                    </div>
                    <p class="font-normal">{{ simGoalResult.message }}</p>
                  </div>
                </div>

                <!-- Empty State Tab 1 -->
                <div v-else role="status" class="p-8 border border-dashed border-stone-200 dark:border-[#243329] rounded-2xl text-center text-xs text-stone-400 dark:text-[#98A79D] flex flex-col items-center justify-center h-full bg-stone-50/40 dark:bg-[#0E1410]/50">
                  <TrendingUp class="w-7 h-7 text-stone-300 dark:text-stone-600 mb-2" :stroke-width="1.5" />
                  <p class="max-w-xs leading-relaxed">
                    {{ simGoalLoading ? 'Sedang menghitung rencana tabungan...' : 'Isi nominal target di sebelah kiri lalu klik tombol hitung untuk melihat proyeksi tabungan.' }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- TAB 2: SIMULASI CICILAN & KPR -->
          <div v-if="simActiveTab === 'mortgage'" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
              <!-- Kolom Kiri: Input Cicilan -->
              <div class="space-y-3.5 p-4 sm:p-5 bg-white dark:bg-[#16201A] border border-stone-200/80 dark:border-[#243329] rounded-2xl shadow-2xs">
                <!-- Skema Bunga -->
                <div>
                  <label class="block text-xs font-bold text-[#18221B] dark:text-[#F0F4F1] mb-1.5">Skema Bunga / Cicilan</label>
                  <div class="grid grid-cols-3 gap-1.5 p-1 bg-stone-100 dark:bg-[#0E1410] rounded-xl text-[11px] font-bold">
                    <button
                      type="button"
                      @click="simLoanType = 'ANNUITY'"
                      :aria-pressed="simLoanType === 'ANNUITY'"
                      class="tactile-btn py-1.5 px-2 rounded-lg text-center transition cursor-pointer"
                      :class="simLoanType === 'ANNUITY' ? 'bg-white dark:bg-[#243329] text-[#18221B] dark:text-[#F0F4F1] shadow-2xs' : 'text-stone-600 dark:text-[#98A79D] hover:text-stone-900 dark:hover:text-[#F0F4F1]'"
                    >
                      Anuitas
                    </button>
                    <button
                      type="button"
                      @click="simLoanType = 'FLAT'"
                      :aria-pressed="simLoanType === 'FLAT'"
                      class="tactile-btn py-1.5 px-2 rounded-lg text-center transition cursor-pointer"
                      :class="simLoanType === 'FLAT' ? 'bg-white dark:bg-[#243329] text-[#18221B] dark:text-[#F0F4F1] shadow-2xs' : 'text-stone-600 dark:text-[#98A79D] hover:text-stone-900 dark:hover:text-[#F0F4F1]'"
                    >
                      Flat
                    </button>
                    <button
                      type="button"
                      @click="simLoanType = 'STEPPED_MORTGAGE'"
                      :aria-pressed="simLoanType === 'STEPPED_MORTGAGE'"
                      class="tactile-btn py-1.5 px-2 rounded-lg text-center transition cursor-pointer"
                      :class="simLoanType === 'STEPPED_MORTGAGE' ? 'bg-white dark:bg-[#243329] text-[#18221B] dark:text-[#F0F4F1] shadow-2xs' : 'text-stone-600 dark:text-[#98A79D] hover:text-stone-900 dark:hover:text-[#F0F4F1]'"
                    >
                      KPR Bertahap
                    </button>
                  </div>
                  <p class="text-[10px] text-stone-400 dark:text-[#98A79D] mt-1">
                    <template v-if="simLoanType === 'ANNUITY'">Bunga efektif konstan standar bank (porsi bunga menurun tiap bulan).</template>
                    <template v-else-if="simLoanType === 'FLAT'">Bunga flat dihitung dari pokok awal (kredit motor, mobil, elektronik, KTA).</template>
                    <template v-else>KPR bank dengan suku bunga promo (Fixed) lalu mengambang (Floating).</template>
                  </p>
                </div>

                <!-- Pokok Pinjaman -->
                <div>
                  <label for="sim-loan-principal" class="block text-xs font-bold text-[#18221B] dark:text-[#F0F4F1] mb-1.5">Pokok Pinjaman / Hutang (Rp)</label>
                  <input
                    id="sim-loan-principal"
                    ref="simMortgagePrincipalInput"
                    :value="simMortgagePrincipal"
                    @input="handlePrincipalInput"
                    @keyup.enter="handleRunMortgageSim"
                    :aria-invalid="!!simMortgageError && (!simMortgagePrincipal || simMortgagePrincipal === '0')"
                    type="text"
                    inputmode="numeric"
                    placeholder="0"
                    class="w-full px-3 py-2 border border-stone-200 dark:border-[#243329] rounded-xl text-sm font-extrabold bg-stone-50/50 dark:bg-[#0E1410] text-[#18221B] dark:text-[#F0F4F1] focus:bg-white dark:focus:bg-[#0E1410] focus:outline-none focus:ring-2 focus:ring-[#183D2B]/15 dark:focus:ring-[#B8DF38]/20 focus:border-[#183D2B] dark:focus:border-[#B8DF38] tabular-nums"
                  />
                  <!-- Quick Amount Pills -->
                  <div class="flex items-center gap-1.5 mt-1.5 flex-wrap">
                    <span class="text-[10px] text-stone-400 dark:text-[#98A79D] font-semibold">Cepat:</span>
                    <button
                      v-for="amt in [10000000, 50000000, 200000000, 500000000]"
                      :key="amt"
                      type="button"
                      @click="simMortgagePrincipal = Number(amt).toLocaleString('id-ID')"
                      class="tactile-btn px-2 py-0.5 text-[10px] font-bold bg-stone-50 dark:bg-[#0E1410] hover:bg-stone-100 dark:hover:bg-[#243329] text-stone-700 dark:text-[#98A79D] border border-stone-200/80 dark:border-[#243329] rounded-md cursor-pointer tabular-nums"
                    >
                      {{ amt >= 1000000000 ? amt / 1000000000 + ' M' : amt / 1000000 + ' Jt' }}
                    </button>
                  </div>
                </div>

                <!-- Tenor -->
                <div>
                  <div class="flex items-center justify-between mb-1.5">
                    <label for="sim-loan-tenor" class="block text-xs font-bold text-[#18221B] dark:text-[#F0F4F1]">Jangka Waktu (Tenor)</label>
                    <div class="flex items-center bg-stone-100 dark:bg-[#0E1410] p-0.5 rounded-lg text-[10px] font-bold">
                      <button
                        type="button"
                        @click="simTenorUnit = 'YEARS'"
                        :aria-pressed="simTenorUnit === 'YEARS'"
                        class="px-2 py-0.5 rounded-md transition cursor-pointer"
                        :class="simTenorUnit === 'YEARS' ? 'bg-white dark:bg-[#243329] text-[#18221B] dark:text-[#F0F4F1] shadow-2xs' : 'text-stone-500 dark:text-[#98A79D]'"
                      >
                        Tahun
                      </button>
                      <button
                        type="button"
                        @click="simTenorUnit = 'MONTHS'"
                        :aria-pressed="simTenorUnit === 'MONTHS'"
                        class="px-2 py-0.5 rounded-md transition cursor-pointer"
                        :class="simTenorUnit === 'MONTHS' ? 'bg-white dark:bg-[#243329] text-[#18221B] dark:text-[#F0F4F1] shadow-2xs' : 'text-stone-500 dark:text-[#98A79D]'"
                      >
                        Bulan
                      </button>
                    </div>
                  </div>

                  <div class="flex items-center gap-2">
                    <input
                      id="sim-loan-tenor"
                      ref="simMortgageTenorInput"
                      v-model.number="simMortgageTenorValue"
                      @keyup.enter="handleRunMortgageSim"
                      :aria-invalid="!!simMortgageError && (!simMortgageTenorValue || Number(simMortgageTenorValue) < 1)"
                      type="number"
                      min="1"
                      :max="simTenorUnit === 'YEARS' ? 30 : 360"
                      placeholder="Contoh: 12, 24, atau 5"
                      class="w-full px-3 py-2 border border-stone-200 dark:border-[#243329] rounded-xl text-xs bg-stone-50/50 dark:bg-[#0E1410] text-[#18221B] dark:text-[#F0F4F1] focus:bg-white dark:focus:bg-[#0E1410] focus:outline-none focus:ring-2 focus:ring-[#183D2B]/15 dark:focus:ring-[#B8DF38]/20 focus:border-[#183D2B] dark:focus:border-[#B8DF38] font-bold tabular-nums"
                    />
                    <span class="text-xs font-bold text-stone-600 dark:text-[#98A79D] shrink-0">
                      {{ simTenorUnit === 'YEARS' ? 'Tahun' : 'Bulan' }}
                    </span>
                  </div>
                  <span class="text-[10px] text-stone-400 dark:text-[#98A79D] mt-1 block">
                    Total durasi: <strong class="text-stone-700 dark:text-[#F0F4F1] tabular-nums">{{ computedTenorMonths }} bulan</strong>
                    <span v-if="computedTenorMonths >= 12"> ({{ (computedTenorMonths / 12).toFixed(1) }} tahun)</span>
                  </span>
                </div>

                <!-- Suku Bunga Form Input -->
                <template v-if="simLoanType !== 'STEPPED_MORTGAGE'">
                  <div>
                    <label for="sim-loan-rate" class="block text-xs font-bold text-[#18221B] dark:text-[#F0F4F1] mb-1.5">
                      Suku Bunga (%/tahun)
                    </label>
                    <input
                      id="sim-loan-rate"
                      v-model.number="simMortgageFixedRate"
                      @keyup.enter="handleRunMortgageSim"
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      placeholder="8.5"
                      class="w-full px-3 py-2 border border-stone-200 dark:border-[#243329] rounded-xl text-xs font-bold bg-stone-50/50 dark:bg-[#0E1410] text-[#18221B] dark:text-[#F0F4F1] focus:bg-white dark:focus:bg-[#0E1410] focus:outline-none focus:ring-2 focus:ring-[#183D2B]/15 dark:focus:ring-[#B8DF38]/20 focus:border-[#183D2B] dark:focus:border-[#B8DF38] tabular-nums"
                    />
                  </div>
                </template>

                <template v-else>
                  <!-- Suku Bunga Bertahap (KPR) -->
                  <div class="grid grid-cols-2 gap-3">
                    <div>
                      <label for="sim-loan-fixed-years" class="block text-[11px] font-bold text-[#18221B] dark:text-[#F0F4F1] mb-1">Masa Promo Fixed</label>
                      <input
                        id="sim-loan-fixed-years"
                        v-model.number="simMortgageFixedYears"
                        @keyup.enter="handleRunMortgageSim"
                        type="number"
                        min="0"
                        :max="Math.floor(computedTenorMonths / 12)"
                        placeholder="3"
                        class="w-full px-3 py-2 border border-stone-200 dark:border-[#243329] rounded-xl text-xs bg-stone-50/50 dark:bg-[#0E1410] text-[#18221B] dark:text-[#F0F4F1] focus:bg-white dark:focus:bg-[#0E1410] focus:outline-none focus:ring-2 focus:ring-[#183D2B]/15 dark:focus:ring-[#B8DF38]/20 focus:border-[#183D2B] dark:focus:border-[#B8DF38] font-bold"
                      />
                      <span class="text-[10px] text-stone-400 dark:text-[#98A79D] mt-0.5 block">{{ (Number(simMortgageFixedYears) || 0) * 12 }} bulan</span>
                    </div>
                    <div>
                      <label for="sim-loan-fixed-rate" class="block text-[11px] font-bold text-[#18221B] dark:text-[#F0F4F1] mb-1">Bunga Promo (%/thn)</label>
                      <input
                        id="sim-loan-fixed-rate"
                        v-model.number="simMortgageFixedRate"
                        @keyup.enter="handleRunMortgageSim"
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        placeholder="5.5"
                        class="w-full px-3 py-2 border border-stone-200 dark:border-[#243329] rounded-xl text-xs font-bold bg-stone-50/50 dark:bg-[#0E1410] text-[#18221B] dark:text-[#F0F4F1] focus:bg-white dark:focus:bg-[#0E1410] focus:outline-none focus:ring-2 focus:ring-[#183D2B]/15 dark:focus:ring-[#B8DF38]/20 focus:border-[#183D2B] dark:focus:border-[#B8DF38]"
                      />
                    </div>
                  </div>

                  <div>
                    <label for="sim-loan-floating-rate" class="block text-[11px] font-bold text-[#18221B] dark:text-[#F0F4F1] mb-1">Bunga Floating Pasca-Promo (%/thn)</label>
                    <input
                      id="sim-loan-floating-rate"
                      v-model.number="simMortgageFloatingRate"
                      @keyup.enter="handleRunMortgageSim"
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      placeholder="11.0"
                      :disabled="Number(simMortgageFixedYears) * 12 >= computedTenorMonths"
                      class="w-full px-3 py-2 border border-stone-200 dark:border-[#243329] rounded-xl text-xs font-bold bg-stone-50/50 dark:bg-[#0E1410] text-[#18221B] dark:text-[#F0F4F1] disabled:bg-stone-100 dark:disabled:bg-[#121A15] disabled:text-stone-400 dark:disabled:text-stone-600 focus:bg-white dark:focus:bg-[#0E1410] focus:outline-none focus:ring-2 focus:ring-[#183D2B]/15 dark:focus:ring-[#B8DF38]/20 focus:border-[#183D2B] dark:focus:border-[#B8DF38]"
                    />
                  </div>
                </template>

                <!-- Pemasukan Bulanan (Opsional) -->
                <div class="pt-2 border-t border-stone-100 dark:border-[#243329]">
                  <label for="sim-loan-income" class="block text-[11px] font-bold text-[#18221B] dark:text-[#F0F4F1] mb-1">Pemasukan Bulanan (Rp - Opsional)</label>
                  <input
                    id="sim-loan-income"
                    :value="simMortgageIncome"
                    @input="handleIncomeInput"
                    @keyup.enter="handleRunMortgageSim"
                    type="text"
                    inputmode="numeric"
                    placeholder="Untuk analisa beban cicilan..."
                    class="w-full px-3 py-2 border border-stone-200 dark:border-[#243329] rounded-xl text-xs bg-stone-50/50 dark:bg-[#0E1410] text-[#18221B] dark:text-[#F0F4F1] focus:bg-white dark:focus:bg-[#0E1410] focus:outline-none focus:ring-2 focus:ring-[#183D2B]/15 dark:focus:ring-[#B8DF38]/20 focus:border-[#183D2B] dark:focus:border-[#B8DF38] tabular-nums"
                  />
                  <span class="text-[10px] text-stone-400 dark:text-[#98A79D] mt-1 block">
                    Beban cicilan aman berada di bawah 30% dari total pemasukan.
                  </span>
                </div>

                <!-- Submit Button -->
                <button
                  type="button"
                  @click="handleRunMortgageSim"
                  :disabled="simMortgageLoading"
                  class="tactile-btn w-full py-2.5 bg-[#183D2B] hover:bg-[#24553D] dark:bg-[#B8DF38] dark:hover:bg-[#a3c82e] text-white dark:text-[#0E1410] text-xs font-bold rounded-xl disabled:opacity-50 transition shadow-xs cursor-pointer inline-flex items-center justify-center gap-2"
                >
                  <Calculator class="w-3.5 h-3.5 text-[#B8DF38] dark:text-[#0E1410]" :stroke-width="2" />
                  <span>{{ simMortgageLoading ? 'Menghitung...' : 'Hitung Angsuran Cicilan' }}</span>
                </button>
                <p v-if="simMortgageError" ref="simMortgageErrorMessage" tabindex="-1" role="alert" class="text-xs text-rose-700 dark:text-rose-300 leading-relaxed">
                  {{ simMortgageError }}
                </p>
              </div>

              <!-- Kolom Kanan: Hasil Visual Cicilan -->
              <div class="flex flex-col justify-between">
                <div v-if="simMortgageResult" ref="simMortgageResultPanel" tabindex="-1" aria-label="Hasil simulasi cicilan" class="p-5 rounded-2xl border border-stone-200/80 dark:border-[#243329] bg-stone-50/70 dark:bg-[#0E1410] flex flex-col justify-between space-y-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#183D2B] dark:focus-visible:ring-[#B8DF38]">
                  <div class="space-y-3.5">
                    <!-- Header -->
                    <div class="flex items-center justify-between pb-3 border-b border-stone-200/70 dark:border-[#243329]">
                      <span class="text-xs font-black text-[#18221B] dark:text-[#F0F4F1] uppercase tracking-wider">Hasil Simulasi Cicilan</span>
                      <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-stone-100 dark:bg-[#243329] text-stone-700 dark:text-[#98A79D] border border-stone-200 dark:border-[#344639]">
                        {{ simMortgageResult.loanType === 'FLAT' ? 'Bunga Flat' : simMortgageResult.loanType === 'ANNUITY' ? 'Bunga Efektif' : 'KPR Bertahap' }}
                      </span>
                    </div>

                    <!-- SKEMA 1: CICILAN TETAP (FLAT ATAU ANUITAS) -->
                    <div v-if="!simMortgageResult.hasFloatingPhase || simMortgageResult.loanType === 'FLAT' || simMortgageResult.loanType === 'ANNUITY'" class="p-4 bg-white dark:bg-[#16201A] rounded-xl border border-stone-200/80 dark:border-[#243329] shadow-2xs space-y-1">
                      <span class="text-[11px] font-semibold text-stone-400 dark:text-[#98A79D] block">
                        Tagihan Cicilan per Bulan
                      </span>
                      <div class="flex flex-col sm:flex-row sm:items-baseline sm:gap-1.5">
                        <span class="text-xl sm:text-3xl font-black text-[#18221B] dark:text-[#F0F4F1] tabular-nums tracking-tight whitespace-nowrap">
                          {{ formatRupiah(simMortgageResult.fixedInstallment) }}
                        </span>
                        <span class="text-xs font-semibold text-stone-500 dark:text-[#98A79D]">/ bulan</span>
                      </div>
                      <span class="text-[11px] text-stone-500 dark:text-[#98A79D] block pt-1 font-medium">
                        Suku bunga: <strong class="text-stone-800 dark:text-[#F0F4F1] tabular-nums">{{ simMortgageResult.fixedRate }}%/thn</strong> • Tenor: <strong class="text-stone-800 dark:text-[#F0F4F1] tabular-nums">{{ simMortgageResult.tenorMonths }} bulan</strong>
                        <span v-if="simMortgageResult.tenorMonths >= 12" class="text-stone-400 dark:text-stone-500"> ({{ (simMortgageResult.tenorMonths / 12).toFixed(1) }} tahun)</span>
                      </span>
                    </div>

                    <!-- SKEMA 2: KPR BERTAHAP (FIXED + FLOATING) -->
                    <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                      <div v-if="simMortgageResult.hasFixedPhase" class="p-3.5 bg-white dark:bg-[#16201A] rounded-xl border border-stone-200/80 dark:border-[#243329] shadow-2xs">
                        <span class="text-stone-400 dark:text-[#98A79D] text-[10px] uppercase font-bold block">
                          Fase Promo (Thn 1 - {{ simMortgageFixedYears }})
                        </span>
                        <div class="text-lg font-black text-[#18221B] dark:text-[#F0F4F1] mt-1 tabular-nums">
                          {{ formatRupiah(simMortgageResult.fixedInstallment) }}
                          <span class="text-[10px] font-medium text-stone-500 dark:text-[#98A79D] block">/ bulan ({{ simMortgageResult.fixedRate }}%)</span>
                        </div>
                      </div>

                      <div v-if="simMortgageResult.hasFloatingPhase" class="p-3.5 bg-white dark:bg-[#16201A] rounded-xl border border-stone-200/80 dark:border-[#243329] shadow-2xs">
                        <span class="text-stone-400 dark:text-[#98A79D] text-[10px] uppercase font-bold block">
                          Fase Floating (Bulan {{ simMortgageResult.floatingStartsAtPayment }}+)
                        </span>
                        <div class="text-lg font-black text-rose-950 dark:text-rose-300 mt-1 tabular-nums">
                          {{ formatRupiah(simMortgageResult.floatingInstallment) }}
                          <span class="text-[10px] font-medium text-stone-500 dark:text-[#98A79D] block">/ bulan ({{ simMortgageResult.floatingRate }}%)</span>
                        </div>
                      </div>
                    </div>

                    <!-- Lonjakan Alert -->
                    <div
                      v-if="simMortgageResult.hasFloatingPhase && Number(simMortgageResult.installmentJump || 0) > 0"
                      class="p-3 bg-rose-50/70 dark:bg-rose-950/40 border border-rose-200/80 dark:border-rose-900/60 rounded-xl text-xs text-rose-900 dark:text-rose-200 flex items-center justify-between"
                    >
                      <span class="font-bold flex items-center gap-1.5">
                        <AlertCircle class="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                        <span>Kenaikan saat Floating:</span>
                      </span>
                      <strong class="font-black tabular-nums">+{{ formatRupiah(simMortgageResult.installmentJump) }} / bln</strong>
                    </div>

                    <!-- Rincian Pinjaman -->
                    <div class="bg-white dark:bg-[#16201A] rounded-xl border border-stone-200/80 dark:border-[#243329] p-3.5 divide-y divide-stone-100 dark:divide-[#243329] text-xs">
                      <div class="flex justify-between py-1.5">
                        <span class="text-stone-500 dark:text-[#98A79D]">Pokok Pinjaman</span>
                        <span class="font-bold text-[#18221B] dark:text-[#F0F4F1] tabular-nums">{{ formatRupiah(simMortgageResult.principal) }}</span>
                      </div>
                      <div v-if="simMortgageResult.hasFloatingPhase && Number(simMortgageResult.balanceBeforeFloating || 0) > 0" class="flex justify-between py-1.5">
                        <span class="text-stone-500 dark:text-[#98A79D]">Sisa Pokok Sebelum Floating</span>
                        <span class="font-bold text-[#18221B] dark:text-[#F0F4F1] tabular-nums">{{ formatRupiah(simMortgageResult.balanceBeforeFloating) }}</span>
                      </div>
                      <div class="flex justify-between py-1.5">
                        <span class="text-stone-500 dark:text-[#98A79D]">Total Beban Bunga</span>
                        <span class="font-bold text-rose-700 dark:text-rose-400 tabular-nums">{{ formatRupiah(simMortgageResult.totalInterest) }}</span>
                      </div>
                      <div class="flex justify-between pt-2 border-t border-stone-200/80 dark:border-[#243329] font-bold">
                        <span class="text-stone-800 dark:text-[#F0F4F1]">Total Pengeluaran Pelunasan</span>
                        <span class="font-black text-[#18221B] dark:text-[#B8DF38] tabular-nums text-sm">{{ formatRupiah(simMortgageResult.totalLoanPayment) }}</span>
                      </div>
                    </div>

                    <!-- Analisa DSR jika ada pemasukan -->
                    <div v-if="simMortgageResult.fixedDsr" class="p-3 bg-white dark:bg-[#16201A] border border-stone-200/80 dark:border-[#243329] rounded-xl text-xs space-y-1.5">
                      <span class="font-bold text-[#18221B] dark:text-[#F0F4F1] block">Beban Cicilan Terhadap Pemasukan:</span>
                      <div class="flex justify-between items-center text-[11px]">
                        <span class="text-stone-600 dark:text-[#98A79D]">Porsi Cicilan:</span>
                        <span
                          class="font-bold px-2 py-0.5 rounded-full tabular-nums"
                          :class="(simMortgageResult.fixedDsr || 0) <= 30 ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60' : 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60'"
                        >
                          {{ simMortgageResult.fixedDsr }}% dari Pemasukan
                        </span>
                      </div>
                    </div>

                    <p class="text-[10px] text-stone-400 dark:text-[#98A79D]">
                      *Estimasi matematis. Biaya provisi, asuransi, dan administrasi bank belum termasuk.
                    </p>
                  </div>
                </div>

                <!-- Empty State Tab 2 -->
                <div v-else role="status" class="p-8 border border-dashed border-stone-200 dark:border-[#243329] rounded-2xl text-center text-xs text-stone-400 dark:text-[#98A79D] flex flex-col items-center justify-center h-full bg-stone-50/40 dark:bg-[#0E1410]/50">
                  <Calculator class="w-7 h-7 text-stone-300 dark:text-stone-600 mb-2" :stroke-width="1.5" />
                  <p class="max-w-xs leading-relaxed">
                    {{ simMortgageLoading ? 'Sedang menghitung cicilan...' : 'Pilih skema bunga dan jangka waktu, lalu klik tombol hitung untuk melihat rincian angsuran.' }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Footer (shrink-0) -->
      <div class="flex items-center justify-end px-5 sm:px-6 py-3.5 border-t border-stone-100 dark:border-[#243329] bg-stone-50/80 dark:bg-[#16201A] shrink-0">
        <button
          type="button"
          @click="emit('close')"
          class="tactile-btn min-h-[40px] px-5 py-2 bg-[#183D2B] dark:bg-[#B8DF38] text-white dark:text-[#0E1410] hover:bg-[#24553D] dark:hover:bg-[#A3C82E] rounded-xl text-xs font-bold cursor-pointer transition shadow-xs"
        >
          Tutup Simulator
        </button>
      </div>
    </div>
  </div>
</template>
