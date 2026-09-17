<script setup lang="ts">
import { ref, watch } from 'vue';
import {
  financeApi,
  type SavingsGoal,
  type GoalSimulationResult,
  type MortgageSimulationResult,
} from '../../api/services';
import { formatRupiah } from '../../utils/format';

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
const simReferenceDate = ref(new Date().toISOString().slice(0, 10));
const simInflation = ref<number | ''>('');
const simCurrentSavings = ref('');
const simMode = ref<'FULL' | 'DOWN_PAYMENT'>('FULL');
const simDpPercent = ref(20);
const simInitialFees = ref('');
const simCalcMode = ref<'MONTHLY_SAVINGS' | 'TARGET_DATE'>('MONTHLY_SAVINGS');
const simTargetMonths = ref<number | ''>(24);
const simMonthlySavings = ref('');
const simGoalResult = ref<GoalSimulationResult | null>(null);
const simGoalLoading = ref(false);

// Mortgage Sim state
const simMortgagePrincipal = ref('');
const simMortgageTenorYears = ref(15);
const simMortgageFixedRate = ref(5.5);
const simMortgageFixedYears = ref(3);
const simMortgageFloatingRate = ref(10.5);
const simMortgageIncome = ref('');
const simMortgageResult = ref<MortgageSimulationResult | null>(null);
const simMortgageLoading = ref(false);

watch(
  () => [props.show, props.initialGoal],
  ([show]) => {
    if (show) {
      if (props.initialGoal) {
        simGoalName.value = props.initialGoal.name;
        simPrice.value = props.initialGoal.priceReference || props.initialGoal.targetAmount || '';
        simReferenceDate.value = props.initialGoal.referenceDate
          ? props.initialGoal.referenceDate.slice(0, 10)
          : new Date().toISOString().slice(0, 10);
        simCurrentSavings.value = props.initialGoal.currentBalance || '0';
        simMode.value = props.initialGoal.mode || 'FULL';
        simInflation.value = '';
        simInitialFees.value = '';
        simDpPercent.value = 20;
        simCalcMode.value = 'MONTHLY_SAVINGS';
        simTargetMonths.value = props.initialGoal.targetMonths || 24;
        simMonthlySavings.value = '';
      } else {
        simGoalName.value = '';
        simPrice.value = '';
        simReferenceDate.value = new Date().toISOString().slice(0, 10);
        simCurrentSavings.value = '0';
        simMode.value = 'FULL';
        simInflation.value = '';
        simInitialFees.value = '';
        simDpPercent.value = 20;
        simCalcMode.value = 'MONTHLY_SAVINGS';
        simTargetMonths.value = 24;
        simMonthlySavings.value = '';
      }
      simActiveTab.value = 'goal';
      simGoalResult.value = null;
      simMortgageResult.value = null;
      if (simPrice.value) {
        handleRunGoalSim();
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
      annualPriceIncreaseRatio: simInflation.value ? Math.round(Number(simInflation.value) * 100) : 0,
      currentSavings: cleanSavings,
      mode: simMode.value,
      dpPercent: simMode.value === 'DOWN_PAYMENT' ? Math.round(Number(simDpPercent.value) * 100) : undefined,
      initialFees: cleanFees,
      calculationMode: simCalcMode.value,
      targetMonths: simCalcMode.value === 'MONTHLY_SAVINGS' ? Number(simTargetMonths.value || 1) : undefined,
      monthlySavings: simCalcMode.value === 'TARGET_DATE' ? cleanMonthly : undefined,
    });
    simGoalResult.value = res.data.data;
  } catch (err: any) {
    alert(err.response?.data?.message || 'Gagal menghitung simulasi target');
  } finally {
    simGoalLoading.value = false;
  }
};

const handleRunMortgageSim = async () => {
  const cleanPrincipal = simMortgagePrincipal.value.replace(/[^0-9]/g, '');
  if (!cleanPrincipal || cleanPrincipal === '0') {
    alert('Pokok pinjaman harus lebih besar dari 0');
    return;
  }

  simMortgageLoading.value = true;
  try {
    const totalTenorMonths = Number(simMortgageTenorYears.value) * 12;
    const fixedDurationMonths = Number(simMortgageFixedYears.value) * 12;
    if (fixedDurationMonths > totalTenorMonths) {
      alert('Masa fixed tidak boleh melebihi total tenor KPR');
      return;
    }
    const cleanIncome = simMortgageIncome.value.replace(/[^0-9]/g, '') || undefined;

    const res = await financeApi.simulateMortgage({
      principal: cleanPrincipal,
      tenorMonths: totalTenorMonths,
      fixedRate: fixedDurationMonths > 0 ? Number(simMortgageFixedRate.value || 0) : undefined,
      fixedMonths: fixedDurationMonths,
      floatingRate: fixedDurationMonths < totalTenorMonths
        ? Number(simMortgageFloatingRate.value || 0)
        : undefined,
      monthlyIncome: cleanIncome,
    });
    simMortgageResult.value = res.data.data;
  } catch (err: any) {
    alert(err.response?.data?.message || 'Gagal menghitung simulasi KPR');
  } finally {
    simMortgageLoading.value = false;
  }
};

const continueToMortgage = (principal: string) => {
  simMortgagePrincipal.value = principal;
  simActiveTab.value = 'mortgage';
  handleRunMortgageSim();
};
</script>

<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50"
    role="dialog"
    aria-modal="true"
    aria-labelledby="sim-modal-title"
  >
    <div class="bg-white w-full max-w-3xl rounded-2xl p-6 shadow-xl space-y-5 max-h-[90vh] overflow-y-auto">
      <div class="flex items-start justify-between border-b pb-3">
        <div>
          <h3 id="sim-modal-title" class="text-lg font-bold text-[#202820]">Simulator Finansial (Tahap 4)</h3>
          <p class="text-xs text-gray-500">
            Perhitungan murni di memori (read-only) tanpa memutasi saldo riil maupun mencatat utang aktual.
          </p>
        </div>
        <button
          @click="emit('close')"
          class="text-gray-400 hover:text-gray-600 text-lg font-bold cursor-pointer"
          aria-label="Tutup dialog"
        >
          ✕
        </button>
      </div>

      <!-- Tab Selector -->
      <div class="flex border-b border-gray-200">
        <button
          @click="simActiveTab = 'goal'"
          class="pb-2.5 px-4 text-xs font-bold transition border-b-2 cursor-pointer"
          :class="simActiveTab === 'goal' ? 'border-[#183D2B] text-[#183D2B]' : 'border-transparent text-gray-400 hover:text-gray-600'"
        >
          🎯 Proyeksi Target (Cash / DP)
        </button>
        <button
          @click="simActiveTab = 'mortgage'"
          class="pb-2.5 px-4 text-xs font-bold transition border-b-2 cursor-pointer"
          :class="simActiveTab === 'mortgage' ? 'border-[#183D2B] text-[#183D2B]' : 'border-transparent text-gray-400 hover:text-gray-600'"
        >
          🏠 Kalkulator KPR Anuitas (Fixed ➡️ Floating)
        </button>
      </div>

      <!-- TAB 1: SIMULASI TARGET IMPIAN -->
      <div v-if="simActiveTab === 'goal'" class="space-y-5">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Kolom Input -->
          <div class="space-y-3 p-4 bg-gray-50/70 border border-gray-200 rounded-xl">
            <div>
              <label class="block text-xs font-semibold text-gray-700 uppercase mb-1">Nama Target (Opsional)</label>
              <input
                v-model="simGoalName"
                type="text"
                placeholder="Contoh: Rumah Impian, Mobil, Laptop..."
                class="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:border-[#183D2B]"
              />
            </div>

            <div>
              <label class="block text-xs font-semibold text-gray-700 uppercase mb-1">Skema Pembelian</label>
              <select
                v-model="simMode"
                class="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs bg-white focus:outline-none focus:border-[#183D2B]"
              >
                <option value="FULL">Beli Lunas Penuh (Cash)</option>
                <option value="DOWN_PAYMENT">Uang Muka (DP) + KPR / Cicilan</option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-semibold text-gray-700 uppercase mb-1">Harga Acuan Saat Ini (Rp)</label>
              <input
                v-model="simPrice"
                type="text"
                placeholder="0"
                class="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-bold focus:outline-none focus:border-[#183D2B]"
              />
              <span class="text-[11px] text-gray-500 font-semibold mt-0.5 block">
                {{ formatRupiah(simPrice) }}
              </span>
            </div>

            <div>
              <label class="block text-xs font-semibold text-gray-700 uppercase mb-1">Tanggal Harga Acuan</label>
              <input
                v-model="simReferenceDate"
                type="date"
                :max="new Date().toISOString().slice(0, 10)"
                class="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs bg-white focus:outline-none focus:border-[#183D2B]"
              />
              <span class="text-[10px] text-gray-400 mt-0.5 block">
                Harga lama akan disesuaikan terlebih dahulu hingga tanggal simulasi.
              </span>
            </div>

            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="block text-[11px] font-semibold text-gray-700 mb-0.5">Asumsi Kenaikan/Thn (%)</label>
                <input
                  v-model.number="simInflation"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  placeholder="Contoh: 5"
                  class="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:border-[#183D2B]"
                />
              </div>
              <div>
                <label class="block text-[11px] font-semibold text-gray-700 mb-0.5">Dana Tersedia (Rp)</label>
                <input
                  v-model="simCurrentSavings"
                  type="text"
                  placeholder="0"
                  class="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:border-[#183D2B]"
                />
              </div>
            </div>

            <div v-if="simMode === 'DOWN_PAYMENT'" class="grid grid-cols-2 gap-2 pt-1 border-t border-gray-200">
              <div>
                <label class="block text-[11px] font-semibold text-gray-700 mb-0.5">Porsi DP (%)</label>
                <input
                  v-model.number="simDpPercent"
                  type="number"
                  min="1"
                  max="100"
                  placeholder="20"
                  class="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:border-[#183D2B]"
                />
              </div>
              <div>
                <label class="block text-[11px] font-semibold text-gray-700 mb-0.5">Biaya Awal (Rp)</label>
                <input
                  v-model="simInitialFees"
                  type="text"
                  placeholder="Notaris, Pajak..."
                  class="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:border-[#183D2B]"
                />
              </div>
            </div>

            <!-- Pilihan Mode Kalkulasi -->
            <div class="pt-2 border-t border-gray-200 space-y-2">
              <label class="block text-xs font-semibold text-gray-700 uppercase">Metode Perhitungan</label>
              <div class="space-y-1 text-xs">
                <label class="flex items-center space-x-2 cursor-pointer">
                  <input type="radio" v-model="simCalcMode" value="MONTHLY_SAVINGS" class="text-[#183D2B]" />
                  <span>Tentukan Target Waktu (Cari Setoran)</span>
                </label>
                <label class="flex items-center space-x-2 cursor-pointer">
                  <input type="radio" v-model="simCalcMode" value="TARGET_DATE" class="text-[#183D2B]" />
                  <span>Tentukan Setoran Tetap (Cari Kapan Tercapai)</span>
                </label>
              </div>

              <div v-if="simCalcMode === 'MONTHLY_SAVINGS'" class="pt-1">
                <label class="block text-[11px] font-semibold text-gray-600 mb-0.5">Target Waktu (Bulan)</label>
                <input
                  v-model.number="simTargetMonths"
                  type="number"
                  min="1"
                  max="600"
                  class="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:border-[#183D2B]"
                />
              </div>

              <div v-if="simCalcMode === 'TARGET_DATE'" class="pt-1">
                <label class="block text-[11px] font-semibold text-gray-600 mb-0.5">Setoran Bulanan yang Mampu Disisihkan (Rp)</label>
                <input
                  v-model="simMonthlySavings"
                  type="text"
                  placeholder="Contoh: 1500000"
                  class="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:border-[#183D2B]"
                />
              </div>
            </div>

            <button
              @click="handleRunGoalSim"
              :disabled="simGoalLoading"
              class="w-full py-2 bg-[#183D2B] text-white text-xs font-bold rounded-lg hover:bg-[#24553d] disabled:opacity-50 transition shadow-xs cursor-pointer"
            >
              {{ simGoalLoading ? 'Menghitung...' : '⚡ Hitung Proyeksi Target' }}
            </button>
          </div>

          <!-- Kolom Hasil Visual Proyeksi -->
          <div class="flex flex-col justify-between">
            <div v-if="simGoalResult" class="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 space-y-4">
              <div v-if="simGoalResult.isAchievable">
                <div class="flex items-center justify-between border-b border-emerald-200/60 pb-2">
                  <span class="text-xs font-bold text-emerald-950 uppercase tracking-wider">Hasil Proyeksi</span>
                  <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900">
                    Tercapai
                  </span>
                </div>

                <div class="mt-3 space-y-2 text-xs">
                  <p class="text-[10px] text-emerald-800">
                    Harga acuan {{ simGoalResult.referenceDate }} · dihitung per {{ simGoalResult.calculatedAt }} · asumsi kenaikan {{ simInflation || 0 }}% per tahun.
                  </p>
                  <div class="p-3 bg-white rounded-lg border border-emerald-100 shadow-2xs">
                    <span class="text-gray-500 block">Waktu Ketercapaian:</span>
                    <div class="text-xl font-black text-gray-900 mt-0.5">
                      {{ simGoalResult.targetMonths }} Bulan
                      <span class="text-xs font-normal text-gray-500">
                        (~{{ Math.floor((simGoalResult.targetMonths || 0) / 12) }} thn {{ (simGoalResult.targetMonths || 0) % 12 }} bln)
                      </span>
                    </div>
                  </div>

                  <div class="p-3 bg-white rounded-lg border border-emerald-100 shadow-2xs">
                    <span class="text-gray-500 block">Setoran Bulanan yang Perlu Disisihkan:</span>
                    <div class="text-lg font-black text-emerald-800 mt-0.5">
                      {{ formatRupiah(simGoalResult.monthlySavings) }} / bulan
                    </div>
                  </div>

                  <div class="space-y-1 pt-1 text-gray-600">
                    <div class="flex justify-between">
                      <span>Proyeksi Harga di Masa Depan:</span>
                      <strong class="text-gray-900">{{ formatRupiah(simGoalResult.projectedPrice) }}</strong>
                    </div>
                    <div v-if="simMode === 'DOWN_PAYMENT'" class="flex justify-between">
                      <span>Uang Muka (DP):</span>
                      <strong class="text-blue-800">{{ formatRupiah(simGoalResult.downPayment) }}</strong>
                    </div>
                    <div v-if="Number(simGoalResult.initialFees || 0) > 0" class="flex justify-between">
                      <span>Estimasi Biaya Awal:</span>
                      <strong class="text-gray-800">{{ formatRupiah(simGoalResult.initialFees) }}</strong>
                    </div>
                    <div class="flex justify-between pt-1 border-t border-gray-100">
                      <span class="font-bold text-gray-800">Total Kebutuhan Dana Awal:</span>
                      <strong class="text-emerald-900 font-black">{{ formatRupiah(simGoalResult.requiredFunds) }}</strong>
                    </div>
                    <div v-if="simMode === 'DOWN_PAYMENT'" class="flex justify-between pt-1">
                      <span>Sisa Pokok yang Memerlukan KPR:</span>
                      <strong class="text-indigo-800 font-bold">{{ formatRupiah(simGoalResult.loanPrincipal) }}</strong>
                    </div>
                  </div>
                </div>

                <!-- Tombol Lanjut ke KPR jika mode DP -->
                <div v-if="simMode === 'DOWN_PAYMENT' && Number(simGoalResult.loanPrincipal || 0) > 0" class="pt-3 border-t border-emerald-200">
                  <button
                    @click="continueToMortgage(simGoalResult.loanPrincipal!)"
                    class="w-full py-2 bg-indigo-700 hover:bg-indigo-800 text-white rounded-lg text-xs font-bold transition flex items-center justify-center space-x-1 cursor-pointer"
                  >
                    <span>🏠 Lanjut Simulasi KPR untuk Pokok {{ formatRupiah(simGoalResult.loanPrincipal) }} ➡️</span>
                  </button>
                </div>
              </div>

              <div v-else class="p-3 bg-amber-100 text-amber-900 rounded-lg text-xs space-y-1">
                <strong>⚠️ Tidak Tercapai dalam Batas Simulasi</strong>
                <p>{{ simGoalResult.message }}</p>
              </div>
            </div>

            <div v-else class="p-6 border-2 border-dashed border-gray-200 rounded-xl text-center text-xs text-gray-400 flex flex-col items-center justify-center h-full">
              <span class="text-2xl mb-1">📈</span>
              <span>Isi parameter di sebelah kiri lalu klik "Hitung Proyeksi Target" untuk melihat hasil kalkulasi.</span>
            </div>
          </div>
        </div>
      </div>

      <!-- TAB 2: SIMULASI KPR ANUITAS BERTAHAP -->
      <div v-if="simActiveTab === 'mortgage'" class="space-y-5">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Kolom Input KPR -->
          <div class="space-y-3 p-4 bg-gray-50/70 border border-gray-200 rounded-xl">
            <div>
              <label class="block text-xs font-semibold text-gray-700 uppercase mb-1">Pokok Pinjaman KPR (Rp)</label>
              <input
                v-model="simMortgagePrincipal"
                type="text"
                placeholder="0"
                class="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-bold focus:outline-none focus:border-[#183D2B]"
              />
              <span class="text-[11px] text-gray-500 font-semibold mt-0.5 block">
                {{ formatRupiah(simMortgagePrincipal) }}
              </span>
            </div>

            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="block text-[11px] font-semibold text-gray-700 mb-0.5">Total Tenor (Tahun)</label>
                <input
                  v-model.number="simMortgageTenorYears"
                  type="number"
                  min="1"
                  max="30"
                  placeholder="15"
                  class="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:border-[#183D2B]"
                />
                <span class="text-[10px] text-gray-400">Total: {{ (simMortgageTenorYears || 0) * 12 }} bln</span>
              </div>
              <div>
                <label class="block text-[11px] font-semibold text-gray-700 mb-0.5">Masa Fixed (Tahun)</label>
                <input
                  v-model.number="simMortgageFixedYears"
                  type="number"
                  min="0"
                  :max="simMortgageTenorYears"
                  placeholder="3"
                  class="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:border-[#183D2B]"
                />
                <span class="text-[10px] text-gray-400">Durasi: {{ (simMortgageFixedYears || 0) * 12 }} bln</span>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="block text-[11px] font-semibold text-gray-700 mb-0.5">Bunga Fixed (%/thn)</label>
                <input
                  v-model.number="simMortgageFixedRate"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  placeholder="5.5"
                  :disabled="Number(simMortgageFixedYears) === 0"
                  class="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs font-semibold disabled:bg-gray-100 disabled:text-gray-400 focus:outline-none focus:border-[#183D2B]"
                />
              </div>
              <div>
                <label class="block text-[11px] font-semibold text-gray-700 mb-0.5">Bunga Floating (%/thn)</label>
                <input
                  v-model.number="simMortgageFloatingRate"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  placeholder="10.5"
                  :disabled="Number(simMortgageFixedYears) >= Number(simMortgageTenorYears)"
                  class="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs font-semibold disabled:bg-gray-100 disabled:text-gray-400 focus:outline-none focus:border-[#183D2B]"
                />
              </div>
            </div>

            <div class="pt-2 border-t border-gray-200">
              <label class="block text-[11px] font-semibold text-gray-700 mb-0.5">Pemasukan Bulanan Anda (Rp - Opsional)</label>
              <input
                v-model="simMortgageIncome"
                type="text"
                placeholder="Untuk analisa beban cicilan (DSR)..."
                class="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:border-[#183D2B]"
              />
              <span class="text-[10px] text-gray-400 mt-0.5 block">
                Rasio beban cicilan ideal adalah di bawah 30% dari pemasukan.
              </span>
            </div>

            <button
              @click="handleRunMortgageSim"
              :disabled="simMortgageLoading"
              class="w-full py-2 bg-[#183D2B] text-white text-xs font-bold rounded-lg hover:bg-[#24553d] disabled:opacity-50 transition shadow-xs cursor-pointer"
            >
              {{ simMortgageLoading ? 'Menghitung...' : '⚡ Hitung Angsuran KPR' }}
            </button>
          </div>

          <!-- Kolom Hasil Visual KPR -->
          <div class="flex flex-col justify-between">
            <div v-if="simMortgageResult" class="p-4 rounded-xl border border-indigo-200 bg-indigo-50/30 space-y-4">
              <div class="flex items-center justify-between border-b border-indigo-200/60 pb-2">
                <span class="text-xs font-bold text-indigo-950 uppercase tracking-wider">Hasil Amortisasi KPR</span>
                <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                  Anuitas Bertahap
                </span>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <!-- Cicilan Fixed -->
                <div v-if="simMortgageResult.hasFixedPhase" class="p-3 bg-white rounded-lg border border-indigo-100 shadow-2xs">
                  <span class="text-gray-500 text-[10px] uppercase font-bold block">
                    Fase Fixed (Thn 1 - {{ simMortgageFixedYears }})
                  </span>
                  <div class="text-base font-black text-indigo-900 mt-0.5">
                    {{ formatRupiah(simMortgageResult.fixedInstallment) }}
                    <span class="text-[10px] font-normal text-gray-500 block">/ bulan ({{ simMortgageFixedRate }}%)</span>
                  </div>
                </div>

                <!-- Cicilan Floating -->
                <div v-if="simMortgageResult.hasFloatingPhase" class="p-3 bg-white rounded-lg border border-indigo-100 shadow-2xs">
                  <span class="text-gray-500 text-[10px] uppercase font-bold block">
                    Fase Floating (mulai pembayaran ke-{{ simMortgageResult.floatingStartsAtPayment }})
                  </span>
                  <div class="text-base font-black text-rose-900 mt-0.5">
                    {{ formatRupiah(simMortgageResult.floatingInstallment) }}
                    <span class="text-[10px] font-normal text-gray-500 block">/ bulan ({{ simMortgageFloatingRate }}%)</span>
                  </div>
                </div>
              </div>

              <!-- Lonjakan Cicilan Alert -->
              <div
                v-if="Number(simMortgageResult.installmentJump || 0) > 0"
                class="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-900 flex items-center justify-between"
              >
                <span>⚠️ Estimasi Lonjakan Cicilan:</span>
                <strong class="font-black">+{{ formatRupiah(simMortgageResult.installmentJump) }} / bln</strong>
              </div>

              <!-- Ringkasan Angka Finansial -->
              <div class="space-y-1 text-xs text-gray-600 pt-1">
                <div class="flex justify-between">
                  <span>Sisa Pokok Saat Beralih ke Floating:</span>
                  <strong class="text-gray-900">{{ formatRupiah(simMortgageResult.balanceBeforeFloating) }}</strong>
                </div>
                <div class="flex justify-between">
                  <span>Total Beban Bunga Selama Tenor:</span>
                  <strong class="text-rose-700">{{ formatRupiah(simMortgageResult.totalInterest) }}</strong>
                </div>
                <div class="flex justify-between pt-1 border-t border-gray-200">
                  <span class="font-bold text-gray-800">Total Pengeluaran Pelunasan KPR:</span>
                  <strong class="text-indigo-950 font-black">{{ formatRupiah(simMortgageResult.totalLoanPayment) }}</strong>
                </div>
              </div>

              <!-- Analisa DSR jika ada pemasukan -->
              <div v-if="simMortgageResult.fixedDsr" class="p-2.5 bg-white rounded-lg border border-gray-200 text-xs space-y-1">
                <span class="font-bold text-gray-700 block">Analisa Beban Hutang (Debt Service Ratio):</span>
                <div class="flex justify-between items-center text-[11px]">
                  <span>Porsi Cicilan Fixed:</span>
                  <span
                    class="font-bold px-1.5 py-0.5 rounded"
                    :class="(simMortgageResult.fixedDsr || 0) <= 30 ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'"
                  >
                    {{ simMortgageResult.fixedDsr }}% dari Pemasukan
                  </span>
                </div>
                <div v-if="simMortgageResult.floatingDsr" class="flex justify-between items-center text-[11px]">
                  <span>Porsi Cicilan Floating:</span>
                  <span
                    class="font-bold px-1.5 py-0.5 rounded"
                    :class="(simMortgageResult.floatingDsr || 0) <= 35 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
                  >
                    {{ simMortgageResult.floatingDsr }}% dari Pemasukan
                  </span>
                </div>
              </div>

              <p class="text-[10px] text-gray-400 italic">
                *Perhitungan menggunakan amortisasi anuitas standar. Asuransi jiwa/kebakaran dan biaya provisi bank belum termasuk.
              </p>
            </div>

            <div v-else class="p-6 border-2 border-dashed border-gray-200 rounded-xl text-center text-xs text-gray-400 flex flex-col items-center justify-center h-full">
              <span class="text-2xl mb-1">🏠</span>
              <span>Isi pokok pinjaman dan suku bunga lalu klik "Hitung Angsuran KPR" untuk melihat amortisasi bertahap.</span>
            </div>
          </div>
        </div>
      </div>

      <div class="flex justify-end pt-3 border-t">
        <button
          @click="emit('close')"
          class="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-bold cursor-pointer transition"
        >
          Tutup Simulator
        </button>
      </div>
    </div>
  </div>
</template>
