<script setup lang="ts">
import { ref, computed, watch } from 'vue';
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
import { useToast } from '../../composables/useToast';

const props = defineProps<{
  show: boolean;
  initialGoal?: SavingsGoal | null;
  initialMonthlySavings?: string | number | null;
  initialTab?: 'goal' | 'mortgage';
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const toast = useToast();

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
  const cleanPrice = simPrice.value.replace(/[^0-9]/g, '');
  if (!cleanPrice || cleanPrice === '0') {
    toast.error('Harga acuan harus lebih besar dari Rp 0');
    return;
  }

  simGoalLoading.value = true;
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
  } catch (err: any) {
    toast.error(err?.response?.data?.message || 'Gagal menghitung simulasi target');
  } finally {
    simGoalLoading.value = false;
  }
};

const handleRunMortgageSim = async () => {
  const cleanPrincipal = simMortgagePrincipal.value.replace(/[^0-9]/g, '');
  if (!cleanPrincipal || cleanPrincipal === '0') {
    toast.error('Pokok pinjaman harus lebih besar dari Rp 0');
    return;
  }

  const tenorMonths = computedTenorMonths.value;
  if (tenorMonths < 1 || tenorMonths > 360) {
    toast.error('Tenor pinjaman harus antara 1 sampai 360 bulan (30 tahun)');
    return;
  }

  simMortgageLoading.value = true;
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
  } catch (err: any) {
    toast.error(err?.response?.data?.message || 'Gagal menghitung simulasi cicilan');
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
      class="bg-white rounded-t-3xl sm:rounded-2xl w-full max-w-4xl mx-auto max-h-[92dvh] sm:max-h-[88vh] flex flex-col shadow-2xl border border-stone-200/90 overflow-hidden animate-modal-enter"
    >
      <!-- Modal Header (shrink-0) -->
      <div class="px-5 sm:px-6 py-4 border-b border-stone-100 flex items-center justify-between shrink-0 bg-white">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl bg-stone-100 text-[#183D2B] flex items-center justify-center shrink-0 border border-stone-200/70">
            <Calculator class="w-4 h-4" :stroke-width="2.2" />
          </div>
          <div>
            <h3 id="sim-modal-title" class="text-sm sm:text-base font-extrabold text-[#18221B] leading-tight">
              Simulator Finansial
            </h3>
            <p class="text-xs text-[#5E6961] mt-0.5">
              Kalkulator mandiri untuk proyeksi tabungan target dan estimasi angsuran kredit.
            </p>
          </div>
        </div>

        <button
          type="button"
          @click="emit('close')"
          class="tactile-btn min-w-[36px] min-h-[36px] flex items-center justify-center text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-xl cursor-pointer"
          aria-label="Tutup Modal"
        >
          <X class="w-4 h-4" />
        </button>
      </div>

      <!-- Pinned Segmented Control Tabs (shrink-0, stays visible on scroll) -->
      <div class="px-5 sm:px-6 py-2.5 border-b border-stone-100 bg-stone-50/60 shrink-0">
        <div class="inline-flex p-1 bg-stone-200/70 rounded-xl w-full sm:w-auto gap-1">
          <button
            type="button"
            @click="simActiveTab = 'goal'"
            class="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition select-none cursor-pointer"
            :class="simActiveTab === 'goal' ? 'bg-white text-[#18221B] shadow-xs' : 'text-stone-600 hover:text-stone-900'"
          >
            <Target class="w-3.5 h-3.5" :stroke-width="2.2" />
            <span>1. Rencana Menabung DP / Tunai</span>
          </button>
          <button
            type="button"
            @click="simActiveTab = 'mortgage'"
            class="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition select-none cursor-pointer"
            :class="simActiveTab === 'mortgage' ? 'bg-white text-[#18221B] shadow-xs' : 'text-stone-600 hover:text-stone-900'"
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
              <div class="space-y-3.5 p-4 sm:p-5 bg-white border border-stone-200/80 rounded-2xl shadow-2xs">
                <div>
                  <label class="block text-xs font-bold text-[#18221B] mb-1.5">Nama Target (Opsional)</label>
                  <input
                    v-model="simGoalName"
                    type="text"
                    placeholder="Contoh: Rumah Impian, Mobil, Laptop..."
                    class="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs bg-stone-50/50 text-[#18221B] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#183D2B]/15 focus:border-[#183D2B]"
                  />
                </div>

                <div>
                  <label class="block text-xs font-bold text-[#18221B] mb-1.5">Tujuan Menabung</label>
                  <select
                    v-model="simMode"
                    class="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs bg-stone-50/50 text-[#18221B] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#183D2B]/15 focus:border-[#183D2B] cursor-pointer font-bold"
                  >
                    <option value="FULL">Beli Lunas Tunai (100% Cash)</option>
                    <option value="DOWN_PAYMENT">Kredit / Cicilan (Kumpulkan DP Saja Dulu)</option>
                  </select>
                </div>

                <div>
                  <label class="block text-xs font-bold text-[#18221B] mb-1.5">Harga Acuan Saat Ini (Rp)</label>
                  <input
                    :value="simPrice"
                    @input="handlePriceInput"
                    @keyup.enter="handleRunGoalSim"
                    type="text"
                    inputmode="numeric"
                    placeholder="0"
                    class="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm font-extrabold bg-stone-50/50 text-[#18221B] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#183D2B]/15 focus:border-[#183D2B] tabular-nums"
                  />
                </div>

                <div>
                  <label class="block text-xs font-bold text-[#18221B] mb-1.5">Tanggal Harga Acuan</label>
                  <input
                    v-model="simReferenceDate"
                    type="date"
                    :max="new Date().toISOString().slice(0, 10)"
                    class="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs bg-stone-50/50 text-[#18221B] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#183D2B]/15 focus:border-[#183D2B] cursor-pointer"
                  />
                  <span class="text-[10px] text-stone-400 mt-1 block">
                    Harga disesuaikan dengan inflasi jika target dibeli di masa mendatang.
                  </span>
                </div>

                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="block text-[11px] font-bold text-[#18221B] mb-1">Inflasi Tahunan (%)</label>
                    <input
                      v-model.number="simInflation"
                      @keyup.enter="handleRunGoalSim"
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      placeholder="5"
                      class="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs bg-stone-50/50 text-[#18221B] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#183D2B]/15 focus:border-[#183D2B] font-bold"
                    />
                  </div>
                  <div>
                    <label class="block text-[11px] font-bold text-[#18221B] mb-1">Tabungan Dimiliki (Rp)</label>
                    <input
                      :value="simCurrentSavings"
                      @input="handleSavingsInput"
                      @keyup.enter="handleRunGoalSim"
                      type="text"
                      inputmode="numeric"
                      placeholder="0"
                      class="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs bg-stone-50/50 text-[#18221B] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#183D2B]/15 focus:border-[#183D2B] tabular-nums font-bold"
                    />
                  </div>
                </div>

                <!-- Parameter Khusus DP & Biaya Legalitas -->
                <div v-if="simMode === 'DOWN_PAYMENT'" class="space-y-3 pt-3 border-t border-stone-100">
                  <details class="group text-[11px] text-stone-500 bg-stone-50/80 rounded-xl p-2.5 border border-stone-200/70 cursor-pointer">
                    <summary class="font-bold text-stone-700 flex items-center justify-between select-none list-none">
                      <span class="flex items-center gap-1.5">
                        <Info class="w-3.5 h-3.5 text-stone-400" />
                        <span>Tentang DP & Biaya Legalitas</span>
                      </span>
                      <ChevronDown class="w-3.5 h-3.5 text-stone-400 group-open:rotate-180 transition-transform" />
                    </summary>
                    <p class="mt-2 text-[11px] text-stone-600 leading-relaxed pt-2 border-t border-stone-200/60">
                      DP langsung memotong pokok kredit. Biaya legalitas/pajak (BPHTB, notaris, provisi bank) adalah biaya transaksi terpisah di luar harga pokok barang.
                    </p>
                  </details>

                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label class="block text-[11px] font-bold text-[#18221B] mb-1">Porsi DP (%)</label>
                      <div class="relative">
                        <input
                          v-model.number="simDpPercent"
                          @keyup.enter="handleRunGoalSim"
                          type="number"
                          min="0"
                          max="100"
                          placeholder="20"
                          class="w-full px-3 py-2 pr-7 border border-stone-200 rounded-xl text-xs font-bold bg-stone-50/50 text-[#18221B] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#183D2B]/15 focus:border-[#183D2B] tabular-nums"
                        />
                        <span class="absolute right-3 top-2 text-xs font-bold text-stone-400">%</span>
                      </div>
                    </div>

                    <div>
                      <label class="block text-[11px] font-bold text-[#18221B] mb-1">Biaya Legalitas / Pajak (Rp)</label>
                      <input
                        :value="simInitialFees"
                        @input="handleInitialFeesInput"
                        @keyup.enter="handleRunGoalSim"
                        type="text"
                        inputmode="numeric"
                        placeholder="0 (Opsional)"
                        class="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs bg-stone-50/50 text-[#18221B] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#183D2B]/15 focus:border-[#183D2B] tabular-nums"
                      />
                    </div>
                  </div>
                </div>

                <!-- Mode Kalkulasi Waktu vs Setoran -->
                <div class="pt-3 border-t border-stone-100 space-y-2">
                  <label class="block text-xs font-bold text-[#18221B]">Metode Perhitungan</label>
                  <div class="space-y-1.5 text-xs font-medium text-stone-700">
                    <label class="flex items-center gap-2 cursor-pointer select-none">
                      <input type="radio" v-model="simCalcMode" value="MONTHLY_SAVINGS" class="text-[#183D2B] focus:ring-[#183D2B]" />
                      <span>Tentukan Target Waktu (Hitung Setoran Bulanan)</span>
                    </label>
                    <label class="flex items-center gap-2 cursor-pointer select-none">
                      <input type="radio" v-model="simCalcMode" value="TARGET_DATE" class="text-[#183D2B] focus:ring-[#183D2B]" />
                      <span>Tentukan Setoran Tetap (Hitung Waktu Tercapai)</span>
                    </label>
                  </div>

                  <div v-if="simCalcMode === 'MONTHLY_SAVINGS'" class="pt-1.5">
                    <label class="block text-[11px] font-bold text-stone-600 mb-1">Target Waktu (Bulan)</label>
                    <input
                      v-model.number="simTargetMonths"
                      @keyup.enter="handleRunGoalSim"
                      type="number"
                      min="1"
                      max="600"
                      class="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs bg-stone-50/50 text-[#18221B] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#183D2B]/15 focus:border-[#183D2B] font-bold tabular-nums"
                    />
                  </div>

                  <div v-if="simCalcMode === 'TARGET_DATE'" class="pt-1.5">
                    <label class="block text-[11px] font-bold text-stone-600 mb-1">Setoran Tabungan per Bulan (Rp)</label>
                    <input
                      :value="simMonthlySavings"
                      @input="handleMonthlySavingsInput"
                      @keyup.enter="handleRunGoalSim"
                      type="text"
                      inputmode="numeric"
                      placeholder="Contoh: 1.500.000"
                      class="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs bg-stone-50/50 text-[#18221B] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#183D2B]/15 focus:border-[#183D2B] tabular-nums font-bold"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  @click="handleRunGoalSim"
                  :disabled="simGoalLoading"
                  class="tactile-btn w-full py-2.5 bg-[#183D2B] hover:bg-[#24553D] text-white text-xs font-bold rounded-xl disabled:opacity-50 transition shadow-xs cursor-pointer inline-flex items-center justify-center gap-2"
                >
                  <TrendingUp class="w-3.5 h-3.5 text-[#B8DF38]" :stroke-width="2.5" />
                  <span>{{ simGoalLoading ? 'Menghitung...' : (simMode === 'DOWN_PAYMENT' ? 'Hitung Rencana DP' : 'Hitung Rencana Tabungan') }}</span>
                </button>
              </div>

              <!-- Kolom Kanan: Hasil Visual / Ringkasan Ledger -->
              <div class="flex flex-col justify-between">
                <div v-if="simGoalResult" class="p-5 rounded-2xl border border-stone-200/80 bg-stone-50/70 flex flex-col justify-between space-y-4">
                  <div v-if="simGoalResult.isAchievable" class="space-y-3.5">
                    <!-- Header Ringkasan -->
                    <div class="flex items-center justify-between pb-3 border-b border-stone-200/70">
                      <span class="text-xs font-black text-[#18221B] uppercase tracking-wider">
                        {{ simMode === 'DOWN_PAYMENT' ? 'Ringkasan Rencana DP' : 'Ringkasan Rencana Tabungan' }}
                      </span>
                      <span
                        class="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full border"
                        :class="isSavingsSufficient ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-stone-100 text-stone-700 border-stone-200'"
                      >
                        <CheckCircle2 class="w-3 h-3" :class="isSavingsSufficient ? 'text-emerald-600' : 'text-stone-500'" />
                        <span>{{ isSavingsSufficient ? 'Dana Sudah Cukup' : 'Rencana Tercapai' }}</span>
                      </span>
                    </div>

                    <!-- KONDISI A: TABUNGAN SUDAH MENCUKUPI (DP TERPENUHI) -->
                    <div
                      v-if="isSavingsSufficient"
                      class="p-4 bg-white rounded-xl border border-stone-200/80 shadow-2xs space-y-2"
                    >
                      <div class="flex items-center gap-1.5 text-xs font-black text-[#183D2B]">
                        <CheckCircle2 class="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{{ simMode === 'DOWN_PAYMENT' ? 'Uang Muka (DP) Sudah Terpenuhi' : 'Dana Pembelian Sudah Terpenuhi' }}</span>
                      </div>
                      <p class="text-xs text-stone-600 leading-relaxed">
                        Tabungan Anda (<strong>{{ formatRupiah(simGoalResult.currentSavings) }}</strong>) sudah mencukupi kebutuhan {{ simMode === 'DOWN_PAYMENT' ? 'DP' : 'dana' }} sebesar <strong>{{ formatRupiah(simGoalResult.requiredFunds) }}</strong>.
                      </p>
                      <div class="pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
                        <span class="text-stone-500">Tambahan tabungan bulanan:</span>
                        <span class="font-bold text-[#183D2B]">Rp 0 / bulan</span>
                      </div>
                    </div>

                    <!-- KONDISI B: MASIH PERLU MENABUNG BULANAN -->
                    <div v-else class="p-4 bg-white rounded-xl border border-stone-200/80 shadow-2xs space-y-1">
                      <span class="text-[11px] font-semibold text-stone-400 block">Setoran Tabungan Bulanan</span>
                      <div class="flex items-baseline gap-1.5">
                        <span class="text-3xl font-black text-[#18221B] tabular-nums tracking-tight">
                          {{ formatRupiah(simGoalResult.monthlySavings) }}
                        </span>
                        <span class="text-xs font-semibold text-stone-500">/ bulan</span>
                      </div>
                      <span class="text-[11px] text-stone-500 block pt-1 font-medium">
                        Estimasi terkumpul dalam <strong class="text-stone-800 tabular-nums">{{ simGoalResult.targetMonths }} bulan</strong>
                        <span v-if="(simGoalResult.targetMonths || 0) >= 12" class="text-stone-400"> ({{ ((simGoalResult.targetMonths || 0) / 12).toFixed(1) }} tahun)</span>
                      </span>
                    </div>

                    <!-- Rincian Biaya (Ledger Rows) -->
                    <div class="bg-white rounded-xl border border-stone-200/80 p-3.5 divide-y divide-stone-100 text-xs">
                      <div class="flex justify-between py-1.5">
                        <span class="text-stone-500">Harga Acuan Awal</span>
                        <span class="font-bold text-[#18221B] tabular-nums">{{ formatRupiah(simPrice.replace(/[^0-9]/g, '')) }}</span>
                      </div>
                      <div v-if="Number(simInflation || 0) > 0" class="flex justify-between py-1.5">
                        <span class="text-stone-500">Proyeksi Harga (+Inflasi {{ simInflation }}%/thn)</span>
                        <span class="font-bold text-[#18221B] tabular-nums">{{ formatRupiah(simGoalResult.projectedPrice) }}</span>
                      </div>
                      <div v-if="simMode === 'DOWN_PAYMENT'" class="flex justify-between py-1.5">
                        <span class="text-stone-500">Kebutuhan Uang Muka (DP {{ simDpPercent }}%)</span>
                        <span class="font-bold text-stone-800 tabular-nums">{{ formatRupiah(simGoalResult.downPayment) }}</span>
                      </div>
                      <div v-if="Number(simGoalResult.initialFees || 0) > 0" class="flex justify-between py-1.5">
                        <span class="text-stone-500">Biaya Legalitas & Notaris / Pajak</span>
                        <span class="font-bold text-stone-800 tabular-nums">{{ formatRupiah(simGoalResult.initialFees) }}</span>
                      </div>
                      <div class="flex justify-between py-2 font-bold text-stone-700">
                        <span>{{ simMode === 'DOWN_PAYMENT' ? 'Total Dana Tunai Awal (DP + Biaya)' : 'Total Kebutuhan Dana' }}</span>
                        <span class="font-black text-[#183D2B] tabular-nums">{{ formatRupiah(simGoalResult.requiredFunds) }}</span>
                      </div>
                      <div class="flex justify-between py-1.5 text-stone-500 text-[11px]">
                        <span>Tabungan Dimiliki Saat Ini</span>
                        <span class="font-bold tabular-nums text-stone-700">{{ formatRupiah(simGoalResult.currentSavings) }}</span>
                      </div>
                      <div v-if="simMode === 'DOWN_PAYMENT'" class="flex justify-between pt-2 border-t border-stone-200/80">
                        <span class="font-bold text-stone-800">Sisa Pokok yang Memerlukan Cicilan</span>
                        <span class="font-black text-[#18221B] tabular-nums text-sm">{{ formatRupiah(simGoalResult.loanPrincipal) }}</span>
                      </div>
                    </div>

                    <!-- Tombol Lanjut ke Cicilan jika mode DP -->
                    <div v-if="simMode === 'DOWN_PAYMENT' && Number(simGoalResult.loanPrincipal || 0) > 0" class="pt-1">
                      <button
                        type="button"
                        @click="continueToMortgage(simGoalResult.loanPrincipal!)"
                        class="tactile-btn w-full py-2.5 px-4 bg-[#183D2B] hover:bg-[#24553D] text-white rounded-xl text-xs font-bold transition flex items-center justify-between cursor-pointer shadow-xs group"
                      >
                        <div class="flex items-center gap-2 text-left">
                          <Calculator class="w-4 h-4 text-[#B8DF38]" />
                          <span>Simulasikan Cicilan Sisa Pokok</span>
                        </div>
                        <div class="flex items-center gap-1.5 text-stone-300 font-semibold tabular-nums text-[11px]">
                          <span>{{ formatRupiah(simGoalResult.loanPrincipal) }}</span>
                          <ArrowRight class="w-3.5 h-3.5 text-[#B8DF38] group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </button>
                      <span class="text-[10px] text-stone-400 text-center block mt-1.5">
                        Lanjut ke Tab 2 untuk menghitung tagihan per bulan ke leasing atau bank.
                      </span>
                    </div>
                  </div>

                  <div v-else class="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1">
                    <div class="flex items-center gap-2 font-bold">
                      <AlertCircle class="w-4 h-4 text-amber-600" />
                      <span>Tidak Tercapai dalam Batas Waktu</span>
                    </div>
                    <p class="font-normal">{{ simGoalResult.message }}</p>
                  </div>
                </div>

                <!-- Empty State Tab 1 -->
                <div v-else class="p-8 border border-dashed border-stone-200 rounded-2xl text-center text-xs text-stone-400 flex flex-col items-center justify-center h-full bg-stone-50/40">
                  <TrendingUp class="w-7 h-7 text-stone-300 mb-2" :stroke-width="1.5" />
                  <p class="max-w-xs leading-relaxed">
                    Isi nominal target di sebelah kiri lalu klik tombol hitung untuk melihat proyeksi tabungan.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- TAB 2: SIMULASI CICILAN & KPR -->
          <div v-if="simActiveTab === 'mortgage'" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
              <!-- Kolom Kiri: Input Cicilan -->
              <div class="space-y-3.5 p-4 sm:p-5 bg-white border border-stone-200/80 rounded-2xl shadow-2xs">
                <!-- Skema Bunga -->
                <div>
                  <label class="block text-xs font-bold text-[#18221B] mb-1.5">Skema Bunga / Cicilan</label>
                  <div class="grid grid-cols-3 gap-1.5 p-1 bg-stone-100 rounded-xl text-[11px] font-bold">
                    <button
                      type="button"
                      @click="simLoanType = 'ANNUITY'"
                      class="tactile-btn py-1.5 px-2 rounded-lg text-center transition cursor-pointer"
                      :class="simLoanType === 'ANNUITY' ? 'bg-white text-[#18221B] shadow-2xs' : 'text-stone-600 hover:text-stone-900'"
                    >
                      Anuitas
                    </button>
                    <button
                      type="button"
                      @click="simLoanType = 'FLAT'"
                      class="tactile-btn py-1.5 px-2 rounded-lg text-center transition cursor-pointer"
                      :class="simLoanType === 'FLAT' ? 'bg-white text-[#18221B] shadow-2xs' : 'text-stone-600 hover:text-stone-900'"
                    >
                      Flat
                    </button>
                    <button
                      type="button"
                      @click="simLoanType = 'STEPPED_MORTGAGE'"
                      class="tactile-btn py-1.5 px-2 rounded-lg text-center transition cursor-pointer"
                      :class="simLoanType === 'STEPPED_MORTGAGE' ? 'bg-white text-[#18221B] shadow-2xs' : 'text-stone-600 hover:text-stone-900'"
                    >
                      KPR Bertahap
                    </button>
                  </div>
                  <p class="text-[10px] text-stone-400 mt-1">
                    <template v-if="simLoanType === 'ANNUITY'">Bunga efektif konstan standar bank (porsi bunga menurun tiap bulan).</template>
                    <template v-else-if="simLoanType === 'FLAT'">Bunga flat dihitung dari pokok awal (kredit motor, mobil, elektronik, KTA).</template>
                    <template v-else>KPR bank dengan suku bunga promo (Fixed) lalu mengambang (Floating).</template>
                  </p>
                </div>

                <!-- Pokok Pinjaman -->
                <div>
                  <label class="block text-xs font-bold text-[#18221B] mb-1.5">Pokok Pinjaman / Hutang (Rp)</label>
                  <input
                    :value="simMortgagePrincipal"
                    @input="handlePrincipalInput"
                    @keyup.enter="handleRunMortgageSim"
                    type="text"
                    inputmode="numeric"
                    placeholder="0"
                    class="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm font-extrabold bg-stone-50/50 text-[#18221B] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#183D2B]/15 focus:border-[#183D2B] tabular-nums"
                  />
                  <!-- Quick Amount Pills -->
                  <div class="flex items-center gap-1.5 mt-1.5 flex-wrap">
                    <span class="text-[10px] text-stone-400 font-semibold">Cepat:</span>
                    <button
                      v-for="amt in [10000000, 50000000, 200000000, 500000000]"
                      :key="amt"
                      type="button"
                      @click="simMortgagePrincipal = Number(amt).toLocaleString('id-ID')"
                      class="tactile-btn px-2 py-0.5 text-[10px] font-bold bg-stone-50 hover:bg-stone-100 text-stone-700 border border-stone-200/80 rounded-md cursor-pointer tabular-nums"
                    >
                      {{ amt >= 1000000000 ? amt / 1000000000 + ' M' : amt / 1000000 + ' Jt' }}
                    </button>
                  </div>
                </div>

                <!-- Tenor -->
                <div>
                  <div class="flex items-center justify-between mb-1.5">
                    <label class="block text-xs font-bold text-[#18221B]">Jangka Waktu (Tenor)</label>
                    <div class="flex items-center bg-stone-100 p-0.5 rounded-lg text-[10px] font-bold">
                      <button
                        type="button"
                        @click="simTenorUnit = 'YEARS'"
                        class="px-2 py-0.5 rounded-md transition cursor-pointer"
                        :class="simTenorUnit === 'YEARS' ? 'bg-white text-[#18221B] shadow-2xs' : 'text-stone-500'"
                      >
                        Tahun
                      </button>
                      <button
                        type="button"
                        @click="simTenorUnit = 'MONTHS'"
                        class="px-2 py-0.5 rounded-md transition cursor-pointer"
                        :class="simTenorUnit === 'MONTHS' ? 'bg-white text-[#18221B] shadow-2xs' : 'text-stone-500'"
                      >
                        Bulan
                      </button>
                    </div>
                  </div>

                  <div class="flex items-center gap-2">
                    <input
                      v-model.number="simMortgageTenorValue"
                      @keyup.enter="handleRunMortgageSim"
                      type="number"
                      min="1"
                      :max="simTenorUnit === 'YEARS' ? 30 : 360"
                      placeholder="Contoh: 12, 24, atau 5"
                      class="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs bg-stone-50/50 text-[#18221B] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#183D2B]/15 focus:border-[#183D2B] font-bold tabular-nums"
                    />
                    <span class="text-xs font-bold text-stone-600 shrink-0">
                      {{ simTenorUnit === 'YEARS' ? 'Tahun' : 'Bulan' }}
                    </span>
                  </div>
                  <span class="text-[10px] text-stone-400 mt-1 block">
                    Total durasi: <strong class="text-stone-700 tabular-nums">{{ computedTenorMonths }} bulan</strong>
                    <span v-if="computedTenorMonths >= 12"> ({{ (computedTenorMonths / 12).toFixed(1) }} tahun)</span>
                  </span>
                </div>

                <!-- Suku Bunga Form Input -->
                <template v-if="simLoanType !== 'STEPPED_MORTGAGE'">
                  <div>
                    <label class="block text-xs font-bold text-[#18221B] mb-1.5">
                      Suku Bunga (%/tahun)
                    </label>
                    <input
                      v-model.number="simMortgageFixedRate"
                      @keyup.enter="handleRunMortgageSim"
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      placeholder="8.5"
                      class="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs font-bold bg-stone-50/50 text-[#18221B] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#183D2B]/15 focus:border-[#183D2B] tabular-nums"
                    />
                  </div>
                </template>

                <template v-else>
                  <!-- Suku Bunga Bertahap (KPR) -->
                  <div class="grid grid-cols-2 gap-3">
                    <div>
                      <label class="block text-[11px] font-bold text-[#18221B] mb-1">Masa Promo Fixed</label>
                      <input
                        v-model.number="simMortgageFixedYears"
                        @keyup.enter="handleRunMortgageSim"
                        type="number"
                        min="0"
                        :max="Math.floor(computedTenorMonths / 12)"
                        placeholder="3"
                        class="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs bg-stone-50/50 text-[#18221B] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#183D2B]/15 focus:border-[#183D2B] font-bold"
                      />
                      <span class="text-[10px] text-stone-400 mt-0.5 block">{{ (Number(simMortgageFixedYears) || 0) * 12 }} bulan</span>
                    </div>
                    <div>
                      <label class="block text-[11px] font-bold text-[#18221B] mb-1">Bunga Promo (%/thn)</label>
                      <input
                        v-model.number="simMortgageFixedRate"
                        @keyup.enter="handleRunMortgageSim"
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        placeholder="5.5"
                        class="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs font-bold bg-stone-50/50 text-[#18221B] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#183D2B]/15 focus:border-[#183D2B]"
                      />
                    </div>
                  </div>

                  <div>
                    <label class="block text-[11px] font-bold text-[#18221B] mb-1">Bunga Floating Pasca-Promo (%/thn)</label>
                    <input
                      v-model.number="simMortgageFloatingRate"
                      @keyup.enter="handleRunMortgageSim"
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      placeholder="11.0"
                      :disabled="Number(simMortgageFixedYears) * 12 >= computedTenorMonths"
                      class="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs font-bold bg-stone-50/50 text-[#18221B] disabled:bg-stone-100 disabled:text-stone-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#183D2B]/15 focus:border-[#183D2B]"
                    />
                  </div>
                </template>

                <!-- Pemasukan Bulanan (Opsional) -->
                <div class="pt-2 border-t border-stone-100">
                  <label class="block text-[11px] font-bold text-[#18221B] mb-1">Pemasukan Bulanan (Rp - Opsional)</label>
                  <input
                    :value="simMortgageIncome"
                    @input="handleIncomeInput"
                    @keyup.enter="handleRunMortgageSim"
                    type="text"
                    inputmode="numeric"
                    placeholder="Untuk analisa beban cicilan..."
                    class="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs bg-stone-50/50 text-[#18221B] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#183D2B]/15 focus:border-[#183D2B] tabular-nums"
                  />
                  <span class="text-[10px] text-stone-400 mt-1 block">
                    Beban cicilan aman berada di bawah 30% dari total pemasukan.
                  </span>
                </div>

                <!-- Submit Button -->
                <button
                  type="button"
                  @click="handleRunMortgageSim"
                  :disabled="simMortgageLoading"
                  class="tactile-btn w-full py-2.5 bg-[#183D2B] hover:bg-[#24553D] text-white text-xs font-bold rounded-xl disabled:opacity-50 transition shadow-xs cursor-pointer inline-flex items-center justify-center gap-2"
                >
                  <Calculator class="w-3.5 h-3.5 text-[#B8DF38]" :stroke-width="2" />
                  <span>{{ simMortgageLoading ? 'Menghitung...' : 'Hitung Angsuran Cicilan' }}</span>
                </button>
              </div>

              <!-- Kolom Kanan: Hasil Visual Cicilan -->
              <div class="flex flex-col justify-between">
                <div v-if="simMortgageResult" class="p-5 rounded-2xl border border-stone-200/80 bg-stone-50/70 flex flex-col justify-between space-y-4">
                  <div class="space-y-3.5">
                    <!-- Header -->
                    <div class="flex items-center justify-between pb-3 border-b border-stone-200/70">
                      <span class="text-xs font-black text-[#18221B] uppercase tracking-wider">Hasil Simulasi Cicilan</span>
                      <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-stone-100 text-stone-700 border border-stone-200">
                        {{ simMortgageResult.loanType === 'FLAT' ? 'Bunga Flat' : simMortgageResult.loanType === 'ANNUITY' ? 'Bunga Efektif' : 'KPR Bertahap' }}
                      </span>
                    </div>

                    <!-- SKEMA 1: CICILAN TETAP (FLAT ATAU ANUITAS) -->
                    <div v-if="!simMortgageResult.hasFloatingPhase || simMortgageResult.loanType === 'FLAT' || simMortgageResult.loanType === 'ANNUITY'" class="p-4 bg-white rounded-xl border border-stone-200/80 shadow-2xs space-y-1">
                      <span class="text-[11px] font-semibold text-stone-400 block">
                        Tagihan Cicilan per Bulan
                      </span>
                      <div class="flex items-baseline gap-1.5">
                        <span class="text-3xl font-black text-[#18221B] tabular-nums tracking-tight">
                          {{ formatRupiah(simMortgageResult.fixedInstallment) }}
                        </span>
                        <span class="text-xs font-semibold text-stone-500">/ bulan</span>
                      </div>
                      <span class="text-[11px] text-stone-500 block pt-1 font-medium">
                        Suku bunga: <strong class="text-stone-800 tabular-nums">{{ simMortgageResult.fixedRate }}%/thn</strong> • Tenor: <strong class="text-stone-800 tabular-nums">{{ simMortgageResult.tenorMonths }} bulan</strong>
                        <span v-if="simMortgageResult.tenorMonths >= 12" class="text-stone-400"> ({{ (simMortgageResult.tenorMonths / 12).toFixed(1) }} tahun)</span>
                      </span>
                    </div>

                    <!-- SKEMA 2: KPR BERTAHAP (FIXED + FLOATING) -->
                    <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                      <div v-if="simMortgageResult.hasFixedPhase" class="p-3.5 bg-white rounded-xl border border-stone-200/80 shadow-2xs">
                        <span class="text-stone-400 text-[10px] uppercase font-bold block">
                          Fase Promo (Thn 1 - {{ simMortgageFixedYears }})
                        </span>
                        <div class="text-lg font-black text-[#18221B] mt-1 tabular-nums">
                          {{ formatRupiah(simMortgageResult.fixedInstallment) }}
                          <span class="text-[10px] font-medium text-stone-500 block">/ bulan ({{ simMortgageResult.fixedRate }}%)</span>
                        </div>
                      </div>

                      <div v-if="simMortgageResult.hasFloatingPhase" class="p-3.5 bg-white rounded-xl border border-stone-200/80 shadow-2xs">
                        <span class="text-stone-400 text-[10px] uppercase font-bold block">
                          Fase Floating (Bulan {{ simMortgageResult.floatingStartsAtPayment }}+)
                        </span>
                        <div class="text-lg font-black text-rose-950 mt-1 tabular-nums">
                          {{ formatRupiah(simMortgageResult.floatingInstallment) }}
                          <span class="text-[10px] font-medium text-stone-500 block">/ bulan ({{ simMortgageResult.floatingRate }}%)</span>
                        </div>
                      </div>
                    </div>

                    <!-- Lonjakan Alert -->
                    <div
                      v-if="simMortgageResult.hasFloatingPhase && Number(simMortgageResult.installmentJump || 0) > 0"
                      class="p-3 bg-rose-50/70 border border-rose-200/80 rounded-xl text-xs text-rose-900 flex items-center justify-between"
                    >
                      <span class="font-bold flex items-center gap-1.5">
                        <AlertCircle class="w-3.5 h-3.5 text-rose-600" />
                        <span>Kenaikan saat Floating:</span>
                      </span>
                      <strong class="font-black tabular-nums">+{{ formatRupiah(simMortgageResult.installmentJump) }} / bln</strong>
                    </div>

                    <!-- Rincian Pinjaman -->
                    <div class="bg-white rounded-xl border border-stone-200/80 p-3.5 divide-y divide-stone-100 text-xs">
                      <div class="flex justify-between py-1.5">
                        <span class="text-stone-500">Pokok Pinjaman</span>
                        <span class="font-bold text-[#18221B] tabular-nums">{{ formatRupiah(simMortgageResult.principal) }}</span>
                      </div>
                      <div v-if="simMortgageResult.hasFloatingPhase && Number(simMortgageResult.balanceBeforeFloating || 0) > 0" class="flex justify-between py-1.5">
                        <span class="text-stone-500">Sisa Pokok Sebelum Floating</span>
                        <span class="font-bold text-[#18221B] tabular-nums">{{ formatRupiah(simMortgageResult.balanceBeforeFloating) }}</span>
                      </div>
                      <div class="flex justify-between py-1.5">
                        <span class="text-stone-500">Total Beban Bunga</span>
                        <span class="font-bold text-rose-700 tabular-nums">{{ formatRupiah(simMortgageResult.totalInterest) }}</span>
                      </div>
                      <div class="flex justify-between pt-2 border-t border-stone-200/80 font-bold">
                        <span class="text-stone-800">Total Pengeluaran Pelunasan</span>
                        <span class="font-black text-[#18221B] tabular-nums text-sm">{{ formatRupiah(simMortgageResult.totalLoanPayment) }}</span>
                      </div>
                    </div>

                    <!-- Analisa DSR jika ada pemasukan -->
                    <div v-if="simMortgageResult.fixedDsr" class="p-3 bg-white rounded-xl border border-stone-200/80 text-xs space-y-1.5">
                      <span class="font-bold text-[#18221B] block">Beban Cicilan Terhadap Pemasukan:</span>
                      <div class="flex justify-between items-center text-[11px]">
                        <span class="text-stone-600">Porsi Cicilan:</span>
                        <span
                          class="font-bold px-2 py-0.5 rounded-full tabular-nums"
                          :class="(simMortgageResult.fixedDsr || 0) <= 30 ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-amber-50 text-amber-800 border border-amber-200'"
                        >
                          {{ simMortgageResult.fixedDsr }}% dari Pemasukan
                        </span>
                      </div>
                    </div>

                    <p class="text-[10px] text-stone-400">
                      *Estimasi matematis. Biaya provisi, asuransi, dan administrasi bank belum termasuk.
                    </p>
                  </div>
                </div>

                <!-- Empty State Tab 2 -->
                <div v-else class="p-8 border border-dashed border-stone-200 rounded-2xl text-center text-xs text-stone-400 flex flex-col items-center justify-center h-full bg-stone-50/40">
                  <Calculator class="w-7 h-7 text-stone-300 mb-2" :stroke-width="1.5" />
                  <p class="max-w-xs leading-relaxed">
                    Pilih skema bunga dan jangka waktu, lalu klik tombol hitung untuk melihat rincian angsuran.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Footer (shrink-0) -->
      <div class="flex items-center justify-end px-5 sm:px-6 py-3.5 border-t border-stone-100 bg-stone-50/80 shrink-0">
        <button
          type="button"
          @click="emit('close')"
          class="tactile-btn min-h-[40px] px-5 py-2 bg-[#183D2B] text-white hover:bg-[#24553D] rounded-xl text-xs font-bold cursor-pointer transition shadow-xs"
        >
          Tutup Simulator
        </button>
      </div>
    </div>
  </div>
</template>
