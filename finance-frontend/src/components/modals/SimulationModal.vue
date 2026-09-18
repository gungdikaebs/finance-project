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
  simLoanType.value = 'STEPPED_MORTGAGE';
  simTenorUnit.value = 'YEARS';
  simMortgageTenorValue.value = 15;
  simMortgageFixedYears.value = 3;
  simMortgageFixedRate.value = 5.5;
  simMortgageFloatingRate.value = 11.0;
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
      class="bg-white rounded-t-3xl sm:rounded-2xl w-full max-w-4xl mx-auto max-h-[92dvh] sm:max-h-[85vh] flex flex-col shadow-2xl border border-stone-200/90 overflow-hidden animate-modal-enter"
    >
      <!-- Modal Header (shrink-0) -->
      <div class="px-5 sm:px-6 py-4 border-b border-stone-100 flex items-center justify-between shrink-0 bg-white">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-emerald-50 text-[#183D2B] flex items-center justify-center shrink-0">
            <Calculator class="w-5 h-5" :stroke-width="2" />
          </div>
          <div>
            <h3 id="sim-modal-title" class="text-base font-extrabold text-[#18221B] leading-tight">
              Simulator Finansial Majemuk
            </h3>
            <p class="text-xs text-[#5E6961] mt-0.5">
              Kalkulator read-only: bebas bereksperimen tanpa mengubah saldo atau anggaran aktual.
            </p>
          </div>
        </div>

        <button
          type="button"
          @click="emit('close')"
          class="tactile-btn min-w-[44px] min-h-[44px] flex items-center justify-center text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-xl cursor-pointer"
          aria-label="Tutup Modal"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Body Content (flex-1 overscroll-contain) -->
      <div class="p-5 sm:p-6 overflow-y-auto flex-1 overscroll-contain space-y-5">

      <!-- Tab Buttons -->
      <div class="flex gap-2 border-b border-stone-100 pb-2 shrink-0">
        <button
          type="button"
          @click="simActiveTab = 'goal'"
          class="tactile-btn inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl cursor-pointer transition select-none"
          :class="simActiveTab === 'goal' ? 'bg-[#183D2B] text-white shadow-xs' : 'bg-stone-100 text-stone-600 hover:bg-stone-200/80'"
        >
          <Target class="w-3.5 h-3.5" :stroke-width="2" />
          <span>Proyeksi Target Impian</span>
        </button>

        <button
          type="button"
          @click="simActiveTab = 'mortgage'"
          class="tactile-btn inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl cursor-pointer transition select-none"
          :class="simActiveTab === 'mortgage' ? 'bg-[#183D2B] text-white shadow-xs' : 'bg-stone-100 text-stone-600 hover:bg-stone-200/80'"
        >
          <Calculator class="w-3.5 h-3.5" :stroke-width="2" />
          <span>Simulasi Cicilan & KPR</span>
        </button>
      </div>

      <!-- Tab Content Area -->
      <div class="space-y-4">
        <!-- TAB 1: SIMULASI TARGET IMPIAN -->
        <div v-if="simActiveTab === 'goal'" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Kolom Input -->
            <div class="space-y-3 p-4 bg-stone-50/70 border border-stone-200/80 rounded-2xl">
              <div>
                <label class="block text-xs font-bold text-[#18221B] mb-1">Nama Target (Opsional)</label>
                <input
                  v-model="simGoalName"
                  type="text"
                  placeholder="Contoh: Rumah Impian, Mobil, Laptop..."
                  class="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs bg-white text-[#18221B] focus:outline-none focus:ring-2 focus:ring-[#183D2B]/20"
                />
              </div>

              <div>
                <label class="block text-xs font-bold text-[#18221B] mb-1">Skema Pembelian</label>
                <select
                  v-model="simMode"
                  class="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs bg-white text-[#18221B] focus:outline-none focus:ring-2 focus:ring-[#183D2B]/20 cursor-pointer font-bold"
                >
                  <option value="FULL">Beli Lunas Penuh (Cash)</option>
                  <option value="DOWN_PAYMENT">Uang Muka (DP) + KPR / Kredit Cicilan</option>
                </select>
              </div>

              <div>
                <label class="block text-xs font-bold text-[#18221B] mb-1">Harga Acuan Saat Ini (Rp)</label>
                <input
                  :value="simPrice"
                  @input="handlePriceInput"
                  @keyup.enter="handleRunGoalSim"
                  type="text"
                  inputmode="numeric"
                  placeholder="0"
                  class="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm font-extrabold bg-white text-[#18221B] focus:outline-none focus:ring-2 focus:ring-[#183D2B]/20 tabular-nums"
                />
              </div>

              <div>
                <label class="block text-xs font-bold text-[#18221B] mb-1">Tanggal Harga Acuan</label>
                <input
                  v-model="simReferenceDate"
                  type="date"
                  :max="new Date().toISOString().slice(0, 10)"
                  class="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs bg-white text-[#18221B] focus:outline-none focus:ring-2 focus:ring-[#183D2B]/20 cursor-pointer"
                />
                <span class="text-[10px] text-stone-500 mt-1 block font-normal">
                  Harga lama akan disesuaikan dengan asumsi inflasi hingga tanggal proyeksi.
                </span>
              </div>

              <div class="grid grid-cols-2 gap-2.5">
                <div>
                  <label class="block text-[11px] font-bold text-[#18221B] mb-1">Asumsi Inflasi/Thn (%)</label>
                  <input
                    v-model.number="simInflation"
                    @keyup.enter="handleRunGoalSim"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    placeholder="Contoh: 5"
                    class="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs bg-white text-[#18221B] focus:outline-none focus:ring-2 focus:ring-[#183D2B]/20 font-bold"
                  />
                </div>
                <div>
                  <label class="block text-[11px] font-bold text-[#18221B] mb-1">Tabungan Tersedia (Rp)</label>
                  <input
                    :value="simCurrentSavings"
                    @input="handleSavingsInput"
                    @keyup.enter="handleRunGoalSim"
                    type="text"
                    inputmode="numeric"
                    placeholder="0"
                    class="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs bg-white text-[#18221B] focus:outline-none focus:ring-2 focus:ring-[#183D2B]/20 tabular-nums font-bold"
                  />
                </div>
              </div>

              <!-- Bagian Khusus DP & Biaya Transaksi Legalitas -->
              <div v-if="simMode === 'DOWN_PAYMENT'" class="space-y-2.5 pt-2.5 border-t border-stone-200/80">
                <!-- Info Edukatif: Penjelasan Mengapa Ada DP & Biaya Legalitas -->
                <div class="p-3 rounded-xl bg-amber-50/90 border border-amber-200/90 text-[11px] text-amber-950 flex items-start gap-2">
                  <Info class="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <div class="leading-relaxed">
                    <span class="font-bold text-amber-900 block">Mengapa ada DP dan Biaya Legalitas/Pajak?</span>
                    <p class="text-amber-800/90 mt-0.5">
                      <strong>DP (Uang Muka)</strong> langsung memotong harga barang & pokok kredit Anda. Sedangkan <strong>Biaya Legalitas/Pajak</strong> adalah biaya transaksi di luar harga barang (seperti BPHTB, akta notaris, balik nama, atau provisi bank).
                    </p>
                  </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label class="block text-[11px] font-bold text-[#18221B] mb-1">
                      Porsi Uang Muka / DP (%)
                    </label>
                    <div class="relative">
                      <input
                        v-model.number="simDpPercent"
                        @keyup.enter="handleRunGoalSim"
                        type="number"
                        min="1"
                        max="100"
                        placeholder="20"
                        class="w-full px-3 py-2 pr-7 border border-stone-200 rounded-xl text-xs font-bold bg-white text-[#18221B] focus:outline-none focus:ring-2 focus:ring-[#183D2B]/20 tabular-nums"
                      />
                      <span class="absolute right-3 top-2 text-xs font-bold text-stone-400">%</span>
                    </div>
                    <span class="text-[10px] text-stone-500 mt-1 block">
                      Persentase DP dari total harga aset (umumnya 10% - 30%).
                    </span>
                  </div>

                  <div>
                    <label class="block text-[11px] font-bold text-[#18221B] mb-1">
                      Biaya Legalitas & Notaris / Pajak (Opsional)
                    </label>
                    <input
                      :value="simInitialFees"
                      @input="handleInitialFeesInput"
                      @keyup.enter="handleRunGoalSim"
                      type="text"
                      inputmode="numeric"
                      placeholder="0 (Kosongkan jika tidak ada)"
                      class="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs bg-white text-[#18221B] focus:outline-none focus:ring-2 focus:ring-[#183D2B]/20 tabular-nums"
                    />
                    <span class="text-[10px] text-stone-500 mt-1 block">
                      Khusus properti/KPR. Kosongkan (Rp 0) jika beli kendaraan/laptop.
                    </span>
                  </div>
                </div>
              </div>

              <!-- Pilihan Mode Kalkulasi -->
              <div class="pt-2 border-t border-stone-200/80 space-y-2">
                <label class="block text-xs font-bold text-[#18221B]">Metode Perhitungan</label>
                <div class="space-y-1.5 text-xs font-medium">
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input type="radio" v-model="simCalcMode" value="MONTHLY_SAVINGS" class="text-[#183D2B] focus:ring-[#183D2B]" />
                    <span>Tentukan Target Waktu (Cari Setoran)</span>
                  </label>
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input type="radio" v-model="simCalcMode" value="TARGET_DATE" class="text-[#183D2B] focus:ring-[#183D2B]" />
                    <span>Tentukan Setoran Tetap (Cari Waktu Tercapai)</span>
                  </label>
                </div>

                <div v-if="simCalcMode === 'MONTHLY_SAVINGS'" class="pt-1">
                  <label class="block text-[11px] font-bold text-stone-600 mb-1">Target Waktu (Bulan)</label>
                  <input
                    v-model.number="simTargetMonths"
                    @keyup.enter="handleRunGoalSim"
                    type="number"
                    min="1"
                    max="600"
                    class="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs bg-white text-[#18221B] focus:outline-none focus:ring-2 focus:ring-[#183D2B]/20 font-bold tabular-nums"
                  />
                </div>

                <div v-if="simCalcMode === 'TARGET_DATE'" class="pt-1">
                  <label class="block text-[11px] font-bold text-stone-600 mb-1">Setoran Bulanan Mampu (Rp)</label>
                  <input
                    :value="simMonthlySavings"
                    @input="handleMonthlySavingsInput"
                    @keyup.enter="handleRunGoalSim"
                    type="text"
                    inputmode="numeric"
                    placeholder="Contoh: 1.500.000"
                    class="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs bg-white text-[#18221B] focus:outline-none focus:ring-2 focus:ring-[#183D2B]/20 tabular-nums font-bold"
                  />
                </div>
              </div>

              <button
                type="button"
                @click="handleRunGoalSim"
                :disabled="simGoalLoading"
                class="tactile-btn w-full py-2.5 bg-[#183D2B] hover:bg-[#24553D] text-white text-xs font-bold rounded-xl disabled:opacity-50 transition shadow-xs cursor-pointer inline-flex items-center justify-center gap-1.5"
              >
                <TrendingUp class="w-3.5 h-3.5 text-[#B8DF38]" :stroke-width="2.5" />
                <span>{{ simGoalLoading ? 'Menghitung...' : 'Hitung Proyeksi Target' }}</span>
              </button>
            </div>

            <!-- Kolom Hasil Visual Proyeksi -->
            <div class="flex flex-col justify-between">
              <div v-if="simGoalResult" class="p-5 rounded-2xl border border-emerald-200 bg-emerald-50/50 space-y-4">
                <div v-if="simGoalResult.isAchievable">
                  <div class="flex items-center justify-between border-b border-emerald-200/60 pb-2.5">
                    <span class="text-xs font-extrabold text-[#183D2B] uppercase tracking-wider">Hasil Proyeksi</span>
                    <span class="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                      <CheckCircle2 class="w-3 h-3 text-emerald-600" />
                      <span>Tercapai</span>
                    </span>
                  </div>

                  <div class="mt-3 space-y-2.5 text-xs">
                    <p class="text-[10px] text-emerald-900 font-medium">
                      Harga acuan {{ simGoalResult.referenceDate }} dihitung per {{ simGoalResult.calculatedAt }} dengan asumsi kenaikan {{ simInflation || 0 }}% per tahun.
                    </p>

                    <div class="p-3.5 bg-white rounded-xl border border-emerald-100 shadow-xs">
                      <span class="text-stone-500 block text-xs font-medium">Waktu Ketercapaian:</span>
                      <div class="text-xl font-black text-[#18221B] mt-0.5 tabular-nums">
                        {{ simGoalResult.targetMonths }} Bulan
                        <span class="text-xs font-normal text-stone-500">
                          (~{{ Math.floor((simGoalResult.targetMonths || 0) / 12) }} thn {{ (simGoalResult.targetMonths || 0) % 12 }} bln)
                        </span>
                      </div>
                    </div>

                    <div class="p-3.5 bg-white rounded-xl border border-emerald-100 shadow-xs">
                      <span class="text-stone-500 block text-xs font-medium">Setoran Bulanan yang Perlu Disisihkan:</span>
                      <div class="text-lg font-black text-[#183D2B] mt-0.5 tabular-nums">
                        {{ formatRupiah(simGoalResult.monthlySavings) }} / bulan
                      </div>
                    </div>

                    <div class="space-y-1.5 pt-1 text-stone-600 text-xs">
                      <div class="flex justify-between">
                        <span>Proyeksi Harga di Masa Depan:</span>
                        <strong class="text-[#18221B] tabular-nums">{{ formatRupiah(simGoalResult.projectedPrice) }}</strong>
                      </div>
                      <div v-if="simMode === 'DOWN_PAYMENT'" class="flex justify-between">
                        <span>Uang Muka (DP):</span>
                        <strong class="text-blue-800 tabular-nums">{{ formatRupiah(simGoalResult.downPayment) }}</strong>
                      </div>
                      <div v-if="Number(simGoalResult.initialFees || 0) > 0" class="flex justify-between">
                        <span>Biaya Legalitas & Pajak Tambahan:</span>
                        <strong class="text-stone-800 tabular-nums">{{ formatRupiah(simGoalResult.initialFees) }}</strong>
                      </div>
                      <div class="flex justify-between pt-1.5 border-t border-emerald-200/60 font-semibold">
                        <span class="text-[#18221B]">
                          {{ simMode === 'DOWN_PAYMENT' ? 'Total Dana Tunai Awal (DP + Biaya Legalitas):' : 'Total Kebutuhan Dana Pembelian:' }}
                        </span>
                        <strong class="text-[#183D2B] font-black tabular-nums">{{ formatRupiah(simGoalResult.requiredFunds) }}</strong>
                      </div>
                      <div v-if="simMode === 'DOWN_PAYMENT'" class="flex justify-between pt-1">
                        <span>Sisa Pokok yang Memerlukan Kredit/KPR:</span>
                        <strong class="text-indigo-800 font-bold tabular-nums">{{ formatRupiah(simGoalResult.loanPrincipal) }}</strong>
                      </div>
                    </div>
                  </div>

                  <!-- Tombol Lanjut ke KPR jika mode DP -->
                  <div v-if="simMode === 'DOWN_PAYMENT' && Number(simGoalResult.loanPrincipal || 0) > 0" class="pt-3 border-t border-emerald-200">
                    <button
                      type="button"
                      @click="continueToMortgage(simGoalResult.loanPrincipal!)"
                      class="tactile-btn w-full py-2.5 bg-indigo-700 hover:bg-indigo-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <span>Lanjut Simulasi KPR untuk Pokok Ini</span>
                      <ArrowRight class="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div v-else class="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1">
                  <div class="flex items-center gap-2 font-bold">
                    <AlertCircle class="w-4 h-4 text-amber-600" />
                    <span>Tidak Tercapai dalam Batas Simulasi</span>
                  </div>
                  <p class="font-normal">{{ simGoalResult.message }}</p>
                </div>
              </div>

              <div v-else class="p-8 border-2 border-dashed border-stone-200 rounded-2xl text-center text-xs text-stone-400 flex flex-col items-center justify-center h-full bg-stone-50/40">
                <TrendingUp class="w-8 h-8 text-stone-300 mb-2" :stroke-width="1.5" />
                <p class="max-w-xs leading-relaxed">
                  Isi parameter di sebelah kiri lalu klik "Hitung Proyeksi Target" untuk melihat kalkulasi nilai masa depan.
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- TAB 2: SIMULASI CICILAN & KPR -->
        <div v-if="simActiveTab === 'mortgage'" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Kolom Input Cicilan -->
            <div class="space-y-3.5 p-4 bg-stone-50/70 border border-stone-200/80 rounded-2xl">
              <!-- Pilihan Skema Bunga / Cicilan -->
              <div>
                <label class="block text-xs font-bold text-[#18221B] mb-1.5">Skema Bunga / Cicilan</label>
                <div class="grid grid-cols-3 gap-1.5 p-1 bg-stone-200/60 rounded-xl text-[11px] font-bold">
                  <button
                    type="button"
                    @click="simLoanType = 'ANNUITY'"
                    class="tactile-btn py-1.5 px-2 rounded-lg text-center transition cursor-pointer"
                    :class="simLoanType === 'ANNUITY' ? 'bg-white text-[#183D2B] shadow-2xs' : 'text-stone-600 hover:text-stone-900'"
                  >
                    Anuitas
                  </button>
                  <button
                    type="button"
                    @click="simLoanType = 'FLAT'"
                    class="tactile-btn py-1.5 px-2 rounded-lg text-center transition cursor-pointer"
                    :class="simLoanType === 'FLAT' ? 'bg-white text-[#183D2B] shadow-2xs' : 'text-stone-600 hover:text-stone-900'"
                  >
                    Flat
                  </button>
                  <button
                    type="button"
                    @click="simLoanType = 'STEPPED_MORTGAGE'"
                    class="tactile-btn py-1.5 px-2 rounded-lg text-center transition cursor-pointer"
                    :class="simLoanType === 'STEPPED_MORTGAGE' ? 'bg-white text-[#183D2B] shadow-2xs' : 'text-stone-600 hover:text-stone-900'"
                  >
                    KPR Bertahap
                  </button>
                </div>
                <p class="text-[10px] text-stone-500 mt-1 font-normal">
                  <template v-if="simLoanType === 'ANNUITY'">Bunga efektif konstan standar bank (porsi bunga menurun tiap bulan).</template>
                  <template v-else-if="simLoanType === 'FLAT'">Bunga flat dihitung dari pokok awal (khas kredit motor, mobil, HP, atau KTA).</template>
                  <template v-else>KPR bank dengan suku bunga promo (Fixed) lalu mengambang (Floating).</template>
                </p>
              </div>

              <!-- Pokok Pinjaman -->
              <div>
                <label class="block text-xs font-bold text-[#18221B] mb-1">Pokok Pinjaman / Hutang (Rp)</label>
                <input
                  :value="simMortgagePrincipal"
                  @input="handlePrincipalInput"
                  @keyup.enter="handleRunMortgageSim"
                  type="text"
                  inputmode="numeric"
                  placeholder="0"
                  class="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm font-extrabold bg-white text-[#18221B] focus:outline-none focus:ring-2 focus:ring-[#183D2B]/20 tabular-nums"
                />
                <!-- Quick Amount Pills -->
                <div class="flex items-center gap-1.5 mt-1.5 flex-wrap">
                  <span class="text-[10px] text-stone-400 font-semibold">Cepat:</span>
                  <button
                    v-for="amt in [10000000, 50000000, 200000000, 500000000]"
                    :key="amt"
                    type="button"
                    @click="simMortgagePrincipal = Number(amt).toLocaleString('id-ID')"
                    class="tactile-btn px-2 py-0.5 text-[10px] font-bold bg-white hover:bg-stone-100 text-stone-700 border border-stone-200/80 rounded-md cursor-pointer tabular-nums"
                  >
                    {{ amt >= 1000000000 ? amt / 1000000000 + ' M' : amt / 1000000 + ' Jt' }}
                  </button>
                </div>
              </div>

              <!-- Jangka Waktu (Tenor) dengan Switch Satuan Tahun / Bulan -->
              <div>
                <div class="flex items-center justify-between mb-1">
                  <label class="block text-xs font-bold text-[#18221B]">Jangka Waktu (Tenor)</label>
                  <div class="flex items-center bg-stone-200/70 p-0.5 rounded-lg text-[10px] font-bold">
                    <button
                      type="button"
                      @click="simTenorUnit = 'YEARS'"
                      class="px-2 py-0.5 rounded-md transition cursor-pointer"
                      :class="simTenorUnit === 'YEARS' ? 'bg-white text-[#183D2B] shadow-2xs' : 'text-stone-500'"
                    >
                      Tahun
                    </button>
                    <button
                      type="button"
                      @click="simTenorUnit = 'MONTHS'"
                      class="px-2 py-0.5 rounded-md transition cursor-pointer"
                      :class="simTenorUnit === 'MONTHS' ? 'bg-white text-[#183D2B] shadow-2xs' : 'text-stone-500'"
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
                    class="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs bg-white text-[#18221B] focus:outline-none focus:ring-2 focus:ring-[#183D2B]/20 font-bold tabular-nums"
                  />
                  <span class="text-xs font-bold text-stone-600 shrink-0">
                    {{ simTenorUnit === 'YEARS' ? 'Tahun' : 'Bulan' }}
                  </span>
                </div>
                <span class="text-[10px] text-stone-500 mt-1 block font-medium">
                  Total durasi: <strong class="text-stone-800 tabular-nums">{{ computedTenorMonths }} bulan</strong>
                  <span v-if="computedTenorMonths >= 12"> ({{ (computedTenorMonths / 12).toFixed(1) }} tahun)</span>
                </span>
              </div>

              <!-- Suku Bunga Form Input -->
              <template v-if="simLoanType !== 'STEPPED_MORTGAGE'">
                <div>
                  <label class="block text-xs font-bold text-[#18221B] mb-1">
                    Suku Bunga (%/tahun)
                  </label>
                  <input
                    v-model.number="simMortgageFixedRate"
                    @keyup.enter="handleRunMortgageSim"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    placeholder="Contoh: 8.5"
                    class="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs font-bold bg-white text-[#18221B] focus:outline-none focus:ring-2 focus:ring-[#183D2B]/20 tabular-nums"
                  />
                  <span class="text-[10px] text-stone-500 mt-1 block font-normal">
                    {{ simLoanType === 'FLAT' ? 'Bunga flat per tahun yang dibebankan kreditur.' : 'Bunga efektif per tahun (anuitas standar).' }}
                  </span>
                </div>
              </template>

              <template v-else>
                <!-- Suku Bunga Bertahap (KPR) -->
                <div class="grid grid-cols-2 gap-2.5">
                  <div>
                    <label class="block text-[11px] font-bold text-[#18221B] mb-1">Masa Promo Fixed</label>
                    <input
                      v-model.number="simMortgageFixedYears"
                      @keyup.enter="handleRunMortgageSim"
                      type="number"
                      min="0"
                      :max="Math.floor(computedTenorMonths / 12)"
                      placeholder="3"
                      class="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs bg-white text-[#18221B] focus:outline-none focus:ring-2 focus:ring-[#183D2B]/20 font-bold"
                    />
                    <span class="text-[10px] text-stone-500 mt-0.5 block">{{ (Number(simMortgageFixedYears) || 0) * 12 }} bulan</span>
                  </div>
                  <div>
                    <label class="block text-[11px] font-bold text-[#18221B] mb-1">Bunga Fixed (%/thn)</label>
                    <input
                      v-model.number="simMortgageFixedRate"
                      @keyup.enter="handleRunMortgageSim"
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      placeholder="5.5"
                      class="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs font-bold bg-white text-[#18221B] focus:outline-none focus:ring-2 focus:ring-[#183D2B]/20"
                    />
                  </div>
                </div>

                <div>
                  <label class="block text-[11px] font-bold text-[#18221B] mb-1">Bunga Floating Pasca-Fixed (%/thn)</label>
                  <input
                    v-model.number="simMortgageFloatingRate"
                    @keyup.enter="handleRunMortgageSim"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    placeholder="11.0"
                    :disabled="Number(simMortgageFixedYears) * 12 >= computedTenorMonths"
                    class="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs font-bold bg-white text-[#18221B] disabled:bg-stone-100 disabled:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#183D2B]/20"
                  />
                  <span class="text-[10px] text-stone-500 mt-0.5 block font-normal">
                    Estimasi suku bunga mengambang setelah masa promo fixed berakhir.
                  </span>
                </div>
              </template>

              <!-- Pemasukan Bulanan (Opsional) -->
              <div class="pt-2 border-t border-stone-200/80">
                <label class="block text-[11px] font-bold text-[#18221B] mb-1">Pemasukan Bulanan (Rp - Opsional)</label>
                <input
                  :value="simMortgageIncome"
                  @input="handleIncomeInput"
                  @keyup.enter="handleRunMortgageSim"
                  type="text"
                  inputmode="numeric"
                  placeholder="Untuk analisa beban cicilan (DSR)..."
                  class="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs bg-white text-[#18221B] focus:outline-none focus:ring-2 focus:ring-[#183D2B]/20 tabular-nums"
                />
                <span class="text-[10px] text-stone-500 mt-1 block font-normal">
                  Porsi cicilan sehat adalah di bawah 30% dari pemasukan bulanan.
                </span>
              </div>

              <!-- Submit Button -->
              <button
                type="button"
                @click="handleRunMortgageSim"
                :disabled="simMortgageLoading"
                class="tactile-btn w-full py-2.5 bg-[#183D2B] hover:bg-[#24553D] text-white text-xs font-bold rounded-xl disabled:opacity-50 transition shadow-xs cursor-pointer inline-flex items-center justify-center gap-1.5"
              >
                <Calculator class="w-3.5 h-3.5 text-[#B8DF38]" :stroke-width="2" />
                <span>{{ simMortgageLoading ? 'Menghitung...' : 'Hitung Angsuran Cicilan' }}</span>
              </button>
            </div>

            <!-- Kolom Hasil Visual Cicilan -->
            <div class="flex flex-col justify-between">
              <div v-if="simMortgageResult" class="p-5 rounded-2xl border border-indigo-200 bg-indigo-50/30 space-y-4">
                <div class="flex items-center justify-between border-b border-indigo-200/60 pb-2.5">
                  <span class="text-xs font-extrabold text-indigo-950 uppercase tracking-wider">Hasil Simulasi Cicilan</span>
                  <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800">
                    {{ simMortgageResult.loanType === 'FLAT' ? 'Bunga Flat' : simMortgageResult.loanType === 'ANNUITY' ? 'Bunga Efektif' : 'KPR Bertahap' }}
                  </span>
                </div>

                <!-- HASIL SKEMA 1: CICILAN TETAP (FLAT ATAU ANUITAS) -->
                <div v-if="!simMortgageResult.hasFloatingPhase || simMortgageResult.loanType === 'FLAT' || simMortgageResult.loanType === 'ANNUITY'" class="p-4 bg-white rounded-xl border border-indigo-100 shadow-xs space-y-2">
                  <span class="text-stone-500 text-[10px] uppercase font-bold block">
                    Angsuran Bulanan Tetap
                  </span>
                  <div class="text-2xl font-black text-[#183D2B] tabular-nums">
                    {{ formatRupiah(simMortgageResult.fixedInstallment) }}
                    <span class="text-xs font-medium text-stone-500">/ bulan</span>
                  </div>
                  <p class="text-[11px] text-stone-600 font-medium pt-1 border-t border-stone-100">
                    Bunga: <strong>{{ simMortgageResult.fixedRate }}% per tahun</strong> • Tenor: <strong>{{ simMortgageResult.tenorMonths }} bulan</strong>
                  </p>
                </div>

                <!-- HASIL SKEMA 2: KPR BERTAHAP (FIXED + FLOATING) -->
                <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                  <!-- Cicilan Fixed -->
                  <div v-if="simMortgageResult.hasFixedPhase" class="p-3.5 bg-white rounded-xl border border-indigo-100 shadow-xs">
                    <span class="text-stone-500 text-[10px] uppercase font-bold block">
                      Fase Fixed (Thn 1 - {{ simMortgageFixedYears }})
                    </span>
                    <div class="text-base font-black text-indigo-950 mt-1 tabular-nums">
                      {{ formatRupiah(simMortgageResult.fixedInstallment) }}
                      <span class="text-[10px] font-medium text-stone-500 block">/ bulan ({{ simMortgageResult.fixedRate }}%)</span>
                    </div>
                  </div>

                  <!-- Cicilan Floating -->
                  <div v-if="simMortgageResult.hasFloatingPhase" class="p-3.5 bg-white rounded-xl border border-indigo-100 shadow-xs">
                    <span class="text-stone-500 text-[10px] uppercase font-bold block">
                      Fase Floating (ke-{{ simMortgageResult.floatingStartsAtPayment }}+)
                    </span>
                    <div class="text-base font-black text-rose-950 mt-1 tabular-nums">
                      {{ formatRupiah(simMortgageResult.floatingInstallment) }}
                      <span class="text-[10px] font-medium text-stone-500 block">/ bulan ({{ simMortgageResult.floatingRate }}%)</span>
                    </div>
                  </div>
                </div>

                <!-- Lonjakan Cicilan Alert (Khusus KPR Bertahap jika ada kenaikan) -->
                <div
                  v-if="simMortgageResult.hasFloatingPhase && Number(simMortgageResult.installmentJump || 0) > 0"
                  class="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 flex items-center justify-between shadow-2xs"
                >
                  <span class="font-bold flex items-center gap-1">
                    <AlertCircle class="w-3.5 h-3.5 text-rose-600" />
                    <span>Lonjakan Cicilan Saat Floating:</span>
                  </span>
                  <strong class="font-black tabular-nums">+{{ formatRupiah(simMortgageResult.installmentJump) }} / bln</strong>
                </div>

                <!-- Ringkasan Angka Finansial -->
                <div class="space-y-1.5 text-xs text-stone-600 pt-1">
                  <div class="flex justify-between">
                    <span>Pokok Pinjaman:</span>
                    <strong class="text-[#18221B] tabular-nums">{{ formatRupiah(simMortgageResult.principal) }}</strong>
                  </div>
                  <div v-if="simMortgageResult.hasFloatingPhase && Number(simMortgageResult.balanceBeforeFloating || 0) > 0" class="flex justify-between">
                    <span>Sisa Pokok Sebelum Floating:</span>
                    <strong class="text-[#18221B] tabular-nums">{{ formatRupiah(simMortgageResult.balanceBeforeFloating) }}</strong>
                  </div>
                  <div class="flex justify-between">
                    <span>Total Beban Bunga Tenor:</span>
                    <strong class="text-rose-700 tabular-nums">{{ formatRupiah(simMortgageResult.totalInterest) }}</strong>
                  </div>
                  <div class="flex justify-between pt-1.5 border-t border-indigo-200/60 font-semibold">
                    <span class="text-[#18221B]">Total Pengeluaran Pelunasan:</span>
                    <strong class="text-indigo-950 font-black tabular-nums">{{ formatRupiah(simMortgageResult.totalLoanPayment) }}</strong>
                  </div>
                </div>

                <!-- Analisa DSR jika ada pemasukan -->
                <div v-if="simMortgageResult.fixedDsr" class="p-3 bg-white rounded-xl border border-stone-200/80 text-xs space-y-1.5 shadow-2xs">
                  <span class="font-bold text-[#18221B] block">Analisa Beban Hutang (Debt Service Ratio):</span>
                  <div class="flex justify-between items-center text-[11px]">
                    <span class="text-stone-600">Porsi Cicilan:</span>
                    <span
                      class="font-bold px-2 py-0.5 rounded-full tabular-nums"
                      :class="(simMortgageResult.fixedDsr || 0) <= 30 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'"
                    >
                      {{ simMortgageResult.fixedDsr }}% dari Pemasukan
                    </span>
                  </div>
                  <div v-if="simMortgageResult.floatingDsr" class="flex justify-between items-center text-[11px]">
                    <span class="text-stone-600">Porsi Cicilan Floating:</span>
                    <span
                      class="font-bold px-2 py-0.5 rounded-full tabular-nums"
                      :class="(simMortgageResult.floatingDsr || 0) <= 35 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'"
                    >
                      {{ simMortgageResult.floatingDsr }}% dari Pemasukan
                    </span>
                  </div>
                </div>

                <p class="text-[10px] text-stone-400 italic">
                  *Perhitungan merupakan estimasi matematis. Asuransi jiwa/kebakaran, provisi, dan biaya administrasi bank belum termasuk.
                </p>
              </div>

              <div v-else class="p-8 border-2 border-dashed border-stone-200 rounded-2xl text-center text-xs text-stone-400 flex flex-col items-center justify-center h-full bg-stone-50/40">
                <Calculator class="w-8 h-8 text-stone-300 mb-2" :stroke-width="1.5" />
                <p class="max-w-xs leading-relaxed">
                  Pilih skema bunga (Anuitas, Flat, atau KPR), isi pokok pinjaman dan tenor, lalu klik "Hitung Angsuran Cicilan".
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>

      <!-- Footer Button (shrink-0) -->
      <div class="flex items-center justify-end px-5 sm:px-6 py-3.5 border-t border-stone-100 bg-stone-50/80 shrink-0">
        <button
          type="button"
          @click="emit('close')"
          class="tactile-btn min-h-[44px] px-6 py-2 bg-[#183D2B] text-white hover:bg-emerald-900 rounded-xl text-xs font-bold cursor-pointer transition shadow-sm"
        >
          Tutup Simulator
        </button>
      </div>
    </div>
  </div>
</template>
