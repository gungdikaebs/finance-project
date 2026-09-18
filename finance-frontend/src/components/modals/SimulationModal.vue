<script setup lang="ts">
import { ref, watch } from 'vue';
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
  Home,
  X,
  TrendingUp,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
} from 'lucide-vue-next';

const props = defineProps<{
  show: boolean;
  initialGoal?: SavingsGoal | null;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const simActiveTab = ref<'goal' | 'mortgage'>('goal');

// Goal Sim state
const simGoalName = ref('');
const simPrice = ref('');
const simReferenceDate = ref(new Date().toISOString().substring(0, 10));
const simInflation = ref<number | string>(5);
const simCurrentSavings = ref('');
const simMode = ref<'FULL' | 'DOWN_PAYMENT'>('FULL');
const simDpPercent = ref<number | string>(20);
const simInitialFees = ref('');
const simCalcMode = ref<'MONTHLY_SAVINGS' | 'TARGET_DATE'>('MONTHLY_SAVINGS');
const simTargetMonths = ref<number | string>(24);
const simMonthlySavings = ref('');
const simGoalLoading = ref(false);
const simGoalResult = ref<GoalSimulationResult | null>(null);

// Mortgage Sim state
const simMortgagePrincipal = ref('');
const simMortgageTenorYears = ref<number | string>(15);
const simMortgageFixedRate = ref<number | string>(5.5);
const simMortgageFixedYears = ref<number | string>(3);
const simMortgageFloatingRate = ref<number | string>(11.0);
const simMortgageIncome = ref('');
const simMortgageLoading = ref(false);
const simMortgageResult = ref<MortgageSimulationResult | null>(null);

// Reset / Init when opened
watch(
  () => props.show,
  (val) => {
    if (val) {
      simActiveTab.value = 'goal';
      simGoalResult.value = null;
      simMortgageResult.value = null;

      if (props.initialGoal) {
        simGoalName.value = props.initialGoal.name;
        simPrice.value = props.initialGoal.priceReference || props.initialGoal.targetAmount || '';
        simCurrentSavings.value = props.initialGoal.currentBalance || '';
        simMode.value = props.initialGoal.mode || 'FULL';
        if (props.initialGoal.annualPriceIncreaseRatio !== undefined && props.initialGoal.annualPriceIncreaseRatio !== null) {
          simInflation.value = props.initialGoal.annualPriceIncreaseRatio / 100;
        }
        if (props.initialGoal.targetMonths) {
          simTargetMonths.value = props.initialGoal.targetMonths;
        }
      }
    }
  }
);

const handleRunGoalSim = async () => {
  const cleanPrice = simPrice.value.replace(/[^0-9]/g, '');
  if (!cleanPrice || cleanPrice === '0') {
    alert('Harga acuan harus lebih besar dari 0');
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
      dpPercent: simMode.value === 'DOWN_PAYMENT' ? Number(simDpPercent.value) : undefined,
      initialFees: simMode.value === 'DOWN_PAYMENT' ? cleanFees : undefined,
      calculationMode: simCalcMode.value,
      targetMonths: simCalcMode.value === 'MONTHLY_SAVINGS' ? Number(simTargetMonths.value) : undefined,
      monthlySavings: cleanMonthly,
    });
    simGoalResult.value = res.data.data;
  } catch (err: any) {
    alert(err?.response?.data?.message || 'Gagal menghitung simulasi target');
  } finally {
    simGoalLoading.value = false;
  }
};

const handleRunMortgageSim = async () => {
  const cleanPrincipal = simMortgagePrincipal.value.replace(/[^0-9]/g, '');
  if (!cleanPrincipal || cleanPrincipal === '0') {
    alert('Pokok pinjaman KPR harus lebih besar dari 0');
    return;
  }

  simMortgageLoading.value = true;
  try {
    const cleanIncome = simMortgageIncome.value.replace(/[^0-9]/g, '') || undefined;
    const res = await financeApi.simulateMortgage({
      principal: cleanPrincipal,
      tenorMonths: Number(simMortgageTenorYears.value) * 12,
      fixedRate: simMortgageFixedRate.value !== '' ? Number(simMortgageFixedRate.value) : undefined,
      fixedMonths: Number(simMortgageFixedYears.value) * 12,
      floatingRate: simMortgageFloatingRate.value !== '' ? Number(simMortgageFloatingRate.value) : undefined,
      monthlyIncome: cleanIncome,
    });
    simMortgageResult.value = res.data.data;
  } catch (err: any) {
    alert(err?.response?.data?.message || 'Gagal menghitung simulasi KPR');
  } finally {
    simMortgageLoading.value = false;
  }
};

const continueToMortgage = (principalAmount: string) => {
  simMortgagePrincipal.value = principalAmount;
  simActiveTab.value = 'mortgage';
  handleRunMortgageSim();
};
</script>

<template>
  <div
    v-if="show"
    class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 glass-modal-backdrop overflow-y-auto"
    role="dialog"
    aria-modal="true"
    aria-labelledby="sim-modal-title"
    @click.self="emit('close')"
  >
    <div
      class="fintech-card rounded-2xl w-full max-w-4xl p-5 sm:p-7 space-y-5 animate-modal-enter my-auto border border-stone-200/90 shadow-2xl max-h-[92vh] flex flex-col"
    >
      <!-- Modal Header -->
      <div class="flex items-center justify-between border-b border-stone-100 pb-3.5 shrink-0">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-emerald-50 text-[#183D2B] flex items-center justify-center shrink-0">
            <Calculator class="w-5 h-5" :stroke-width="2" />
          </div>
          <div>
            <h3 id="sim-modal-title" class="text-base font-extrabold text-[#18221B]">
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
          class="tactile-btn p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-xl cursor-pointer"
          aria-label="Tutup Modal"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

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
          <Home class="w-3.5 h-3.5" :stroke-width="2" />
          <span>Kalkulator KPR Anuitas</span>
        </button>
      </div>

      <!-- Scrollable Tab Content Area -->
      <div class="overflow-y-auto space-y-4 pr-1">
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
                  class="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs bg-white text-[#18221B] focus:outline-none focus:ring-2 focus:ring-[#183D2B]/20 cursor-pointer"
                >
                  <option value="FULL">Beli Lunas Penuh (Cash)</option>
                  <option value="DOWN_PAYMENT">Uang Muka (DP) + KPR Cicilan</option>
                </select>
              </div>

              <div>
                <label class="block text-xs font-bold text-[#18221B] mb-1">Harga Acuan Saat Ini (Rp)</label>
                <input
                  v-model="simPrice"
                  type="text"
                  placeholder="0"
                  class="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm font-extrabold bg-white text-[#18221B] focus:outline-none focus:ring-2 focus:ring-[#183D2B]/20 tabular-nums"
                />
                <span class="text-[11px] text-stone-500 font-bold mt-1 block tabular-nums">
                  {{ formatRupiah(simPrice) }}
                </span>
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
                  Harga lama akan disesuaikan dengan inflasi hingga tanggal simulasi.
                </span>
              </div>

              <div class="grid grid-cols-2 gap-2.5">
                <div>
                  <label class="block text-[11px] font-bold text-[#18221B] mb-1">Asumsi Kenaikan/Thn (%)</label>
                  <input
                    v-model.number="simInflation"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    placeholder="Contoh: 5"
                    class="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs bg-white text-[#18221B] focus:outline-none focus:ring-2 focus:ring-[#183D2B]/20"
                  />
                </div>
                <div>
                  <label class="block text-[11px] font-bold text-[#18221B] mb-1">Dana Tersedia (Rp)</label>
                  <input
                    v-model="simCurrentSavings"
                    type="text"
                    placeholder="0"
                    class="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs bg-white text-[#18221B] focus:outline-none focus:ring-2 focus:ring-[#183D2B]/20 tabular-nums"
                  />
                </div>
              </div>

              <div v-if="simMode === 'DOWN_PAYMENT'" class="grid grid-cols-2 gap-2.5 pt-2 border-t border-stone-200/80">
                <div>
                  <label class="block text-[11px] font-bold text-[#18221B] mb-1">Porsi DP (%)</label>
                  <input
                    v-model.number="simDpPercent"
                    type="number"
                    min="1"
                    max="100"
                    placeholder="20"
                    class="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs bg-white text-[#18221B] focus:outline-none focus:ring-2 focus:ring-[#183D2B]/20"
                  />
                </div>
                <div>
                  <label class="block text-[11px] font-bold text-[#18221B] mb-1">Biaya Awal (Rp)</label>
                  <input
                    v-model="simInitialFees"
                    type="text"
                    placeholder="Notaris, Pajak..."
                    class="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs bg-white text-[#18221B] focus:outline-none focus:ring-2 focus:ring-[#183D2B]/20 tabular-nums"
                  />
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
                    type="number"
                    min="1"
                    max="600"
                    class="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs bg-white text-[#18221B] focus:outline-none focus:ring-2 focus:ring-[#183D2B]/20"
                  />
                </div>

                <div v-if="simCalcMode === 'TARGET_DATE'" class="pt-1">
                  <label class="block text-[11px] font-bold text-stone-600 mb-1">Setoran Bulanan Mampu (Rp)</label>
                  <input
                    v-model="simMonthlySavings"
                    type="text"
                    placeholder="Contoh: 1500000"
                    class="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs bg-white text-[#18221B] focus:outline-none focus:ring-2 focus:ring-[#183D2B]/20 tabular-nums"
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
                        <span>Estimasi Biaya Awal:</span>
                        <strong class="text-stone-800 tabular-nums">{{ formatRupiah(simGoalResult.initialFees) }}</strong>
                      </div>
                      <div class="flex justify-between pt-1.5 border-t border-emerald-200/60 font-semibold">
                        <span class="text-[#18221B]">Total Kebutuhan Dana Awal:</span>
                        <strong class="text-[#183D2B] font-black tabular-nums">{{ formatRupiah(simGoalResult.requiredFunds) }}</strong>
                      </div>
                      <div v-if="simMode === 'DOWN_PAYMENT'" class="flex justify-between pt-1">
                        <span>Sisa Pokok yang Memerlukan KPR:</span>
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

        <!-- TAB 2: SIMULASI KPR ANUITAS BERTAHAP -->
        <div v-if="simActiveTab === 'mortgage'" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Kolom Input KPR -->
            <div class="space-y-3 p-4 bg-stone-50/70 border border-stone-200/80 rounded-2xl">
              <div>
                <label class="block text-xs font-bold text-[#18221B] mb-1">Pokok Pinjaman KPR (Rp)</label>
                <input
                  v-model="simMortgagePrincipal"
                  type="text"
                  placeholder="0"
                  class="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm font-extrabold bg-white text-[#18221B] focus:outline-none focus:ring-2 focus:ring-[#183D2B]/20 tabular-nums"
                />
                <span class="text-[11px] text-stone-500 font-bold mt-1 block tabular-nums">
                  {{ formatRupiah(simMortgagePrincipal) }}
                </span>
              </div>

              <div class="grid grid-cols-2 gap-2.5">
                <div>
                  <label class="block text-[11px] font-bold text-[#18221B] mb-1">Total Tenor (Tahun)</label>
                  <input
                    v-model.number="simMortgageTenorYears"
                    type="number"
                    min="1"
                    max="30"
                    placeholder="15"
                    class="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs bg-white text-[#18221B] focus:outline-none focus:ring-2 focus:ring-[#183D2B]/20"
                  />
                  <span class="text-[10px] text-stone-500 mt-0.5 block">Total: {{ (Number(simMortgageTenorYears) || 0) * 12 }} bln</span>
                </div>
                <div>
                  <label class="block text-[11px] font-bold text-[#18221B] mb-1">Masa Fixed (Tahun)</label>
                  <input
                    v-model.number="simMortgageFixedYears"
                    type="number"
                    min="0"
                    :max="simMortgageTenorYears"
                    placeholder="3"
                    class="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs bg-white text-[#18221B] focus:outline-none focus:ring-2 focus:ring-[#183D2B]/20"
                  />
                  <span class="text-[10px] text-stone-500 mt-0.5 block">Durasi: {{ (Number(simMortgageFixedYears) || 0) * 12 }} bln</span>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-2.5">
                <div>
                  <label class="block text-[11px] font-bold text-[#18221B] mb-1">Bunga Fixed (%/thn)</label>
                  <input
                    v-model.number="simMortgageFixedRate"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    placeholder="5.5"
                    :disabled="Number(simMortgageFixedYears) === 0"
                    class="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs font-bold bg-white text-[#18221B] disabled:bg-stone-100 disabled:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#183D2B]/20"
                  />
                </div>
                <div>
                  <label class="block text-[11px] font-bold text-[#18221B] mb-1">Bunga Floating (%/thn)</label>
                  <input
                    v-model.number="simMortgageFloatingRate"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    placeholder="10.5"
                    :disabled="Number(simMortgageFixedYears) >= Number(simMortgageTenorYears)"
                    class="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs font-bold bg-white text-[#18221B] disabled:bg-stone-100 disabled:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#183D2B]/20"
                  />
                </div>
              </div>

              <div class="pt-2 border-t border-stone-200/80">
                <label class="block text-[11px] font-bold text-[#18221B] mb-1">Pemasukan Bulanan (Rp - Opsional)</label>
                <input
                  v-model="simMortgageIncome"
                  type="text"
                  placeholder="Untuk analisa beban cicilan (DSR)..."
                  class="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs bg-white text-[#18221B] focus:outline-none focus:ring-2 focus:ring-[#183D2B]/20 tabular-nums"
                />
                <span class="text-[10px] text-stone-500 mt-1 block font-normal">
                  Rasio beban cicilan ideal (DSR) adalah di bawah 30% dari pemasukan.
                </span>
              </div>

              <button
                type="button"
                @click="handleRunMortgageSim"
                :disabled="simMortgageLoading"
                class="tactile-btn w-full py-2.5 bg-[#183D2B] hover:bg-[#24553D] text-white text-xs font-bold rounded-xl disabled:opacity-50 transition shadow-xs cursor-pointer inline-flex items-center justify-center gap-1.5"
              >
                <Home class="w-3.5 h-3.5 text-[#B8DF38]" :stroke-width="2" />
                <span>{{ simMortgageLoading ? 'Menghitung...' : 'Hitung Angsuran KPR' }}</span>
              </button>
            </div>

            <!-- Kolom Hasil Visual KPR -->
            <div class="flex flex-col justify-between">
              <div v-if="simMortgageResult" class="p-5 rounded-2xl border border-indigo-200 bg-indigo-50/30 space-y-4">
                <div class="flex items-center justify-between border-b border-indigo-200/60 pb-2.5">
                  <span class="text-xs font-extrabold text-indigo-950 uppercase tracking-wider">Hasil Amortisasi KPR</span>
                  <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800">
                    Anuitas Bertahap
                  </span>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                  <!-- Cicilan Fixed -->
                  <div v-if="simMortgageResult.hasFixedPhase" class="p-3.5 bg-white rounded-xl border border-indigo-100 shadow-xs">
                    <span class="text-stone-500 text-[10px] uppercase font-bold block">
                      Fase Fixed (Thn 1 - {{ simMortgageFixedYears }})
                    </span>
                    <div class="text-base font-black text-indigo-950 mt-1 tabular-nums">
                      {{ formatRupiah(simMortgageResult.fixedInstallment) }}
                      <span class="text-[10px] font-medium text-stone-500 block">/ bulan ({{ simMortgageFixedRate }}%)</span>
                    </div>
                  </div>

                  <!-- Cicilan Floating -->
                  <div v-if="simMortgageResult.hasFloatingPhase" class="p-3.5 bg-white rounded-xl border border-indigo-100 shadow-xs">
                    <span class="text-stone-500 text-[10px] uppercase font-bold block">
                      Fase Floating (ke-{{ simMortgageResult.floatingStartsAtPayment }}+)
                    </span>
                    <div class="text-base font-black text-rose-950 mt-1 tabular-nums">
                      {{ formatRupiah(simMortgageResult.floatingInstallment) }}
                      <span class="text-[10px] font-medium text-stone-500 block">/ bulan ({{ simMortgageFloatingRate }}%)</span>
                    </div>
                  </div>
                </div>

                <!-- Lonjakan Cicilan Alert -->
                <div
                  v-if="Number(simMortgageResult.installmentJump || 0) > 0"
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
                    <span class="text-stone-600">Porsi Cicilan Fixed:</span>
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
                  *Perhitungan menggunakan amortisasi anuitas standar. Asuransi jiwa/kebakaran dan biaya provisi bank belum termasuk.
                </p>
              </div>

              <div v-else class="p-8 border-2 border-dashed border-stone-200 rounded-2xl text-center text-xs text-stone-400 flex flex-col items-center justify-center h-full bg-stone-50/40">
                <Home class="w-8 h-8 text-stone-300 mb-2" :stroke-width="1.5" />
                <p class="max-w-xs leading-relaxed">
                  Isi pokok pinjaman dan suku bunga fixed/floating lalu klik "Hitung Angsuran KPR" untuk melihat simulasi.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer Button -->
      <div class="flex justify-end pt-3 border-t border-stone-100 shrink-0">
        <button
          type="button"
          @click="emit('close')"
          class="tactile-btn px-5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold cursor-pointer transition border border-stone-200"
        >
          Tutup Simulator
        </button>
      </div>
    </div>
  </div>
</template>
