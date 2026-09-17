<script setup lang="ts">
import { computed } from 'vue';
import { formatRupiah, formatDate } from '../utils/format';
import type { SavingsGoal, FinanceProfile } from '../api/services';

const props = defineProps<{
  emergencyGoal?: SavingsGoal;
  purchaseGoals: SavingsGoal[];
  unassignedGoal?: SavingsGoal;
  profile?: FinanceProfile | null;
  emergencyMonths?: number;
}>();

const emit = defineEmits<{
  (e: 'openSharesModal'): void;
  (e: 'openAddGoalModal'): void;
  (e: 'openReleaseModal', goalId?: number): void;
  (e: 'openSimulatorWithGoal', goal: SavingsGoal): void;
}>();

const coverageMonths = computed(() => {
  if (props.emergencyMonths !== undefined && props.emergencyMonths !== null) {
    return props.emergencyMonths;
  }
  const needs = Number(props.profile?.monthlyNeeds || 0);
  const bal = Number(props.emergencyGoal?.currentBalance || 0);
  if (needs <= 0) return 0;
  return bal / needs;
});

const emergencyTargetNominal = computed(() => {
  const targetM = BigInt(props.emergencyGoal?.targetMonths || 6);
  const monthlyN = BigInt(props.profile?.monthlyNeeds || 0);
  return targetM * monthlyN;
});

const emergencyProgress = computed(() => {
  const targetM = Number(props.emergencyGoal?.targetMonths || 6);
  if (targetM <= 0) return 0;
  return Math.min(100, Math.round((coverageMonths.value / targetM) * 100));
});

const getGoalTargetPrice = (goal: SavingsGoal): string => {
  return goal.priceReference || goal.targetAmount || '0';
};

const isGoalFunded = (goal: SavingsGoal): boolean => {
  const target = BigInt(getGoalTargetPrice(goal) || '0');
  const bal = BigInt(goal.currentBalance || '0');
  return target > 0n && bal >= target;
};

const getGoalProgress = (goal: SavingsGoal): number => {
  const target = Number(getGoalTargetPrice(goal) || 1);
  const bal = Number(goal.currentBalance || 0);
  if (target <= 0) return 0;
  return Math.min(100, Math.round((bal / target) * 100));
};
</script>

<template>
  <div class="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 shadow-xs space-y-5">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-gray-100 pb-4">
      <div>
        <div class="flex items-center space-x-2">
          <h2 class="text-base font-bold text-[#202820]">Tabungan & Target Impian</h2>
          <span class="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
            Pemisahan Mental (D-005)
          </span>
        </div>
        <p class="text-xs text-gray-500 mt-0.5">
          Dana tetap berada dalam satu rekening gabungan, disimulasikan 60% Dana Pengaman & 40% Target Impian.
        </p>
      </div>

      <div class="flex items-center space-x-2">
        <button
          v-if="purchaseGoals.length > 1"
          @click="emit('openSharesModal')"
          class="inline-flex items-center text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition cursor-pointer"
        >
          ⚙ Atur Bobot Target
        </button>
        <button
          @click="emit('openAddGoalModal')"
          class="inline-flex items-center text-xs font-bold text-[#183D2B] bg-[#B8DF38] hover:bg-[#a3c82e] px-3.5 py-1.5 rounded-lg transition shadow-xs cursor-pointer"
        >
          + Target Impian Baru
        </button>
      </div>
    </div>

    <!-- Grid Tabungan -->
    <div class="space-y-4">
      <!-- KARTU 1: DANA PENGAMAN (EMERGENCY FUND) -->
      <div v-if="emergencyGoal" class="p-4 sm:p-5 rounded-2xl bg-[#183D2B]/5 border border-[#183D2B]/15 space-y-3">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div class="flex items-center space-x-2.5">
            <span class="text-xl">🛡️</span>
            <div>
              <h3 class="text-sm font-bold text-[#183D2B]">Dana Pengaman (Alokasi 60%)</h3>
              <p class="text-xs text-gray-500">
                Target: {{ emergencyGoal.targetMonths || 6 }} bulan kebutuhan pokok ({{ formatRupiah(profile?.monthlyNeeds || '0') }}/bulan)
              </p>
            </div>
          </div>
          <div class="text-right sm:text-right">
            <div class="text-lg font-black text-[#183D2B]">
              {{ formatRupiah(emergencyGoal.currentBalance) }}
            </div>
            <span class="text-[11px] font-semibold text-emerald-800">
              Kekuatan: {{ coverageMonths.toFixed(1) }} Bulan
            </span>
          </div>
        </div>

        <!-- Progress bar terhadap target bulan pengaman -->
        <div class="space-y-1">
          <div class="flex justify-between text-[11px] text-gray-500">
            <span>
              Target Nominal: {{ formatRupiah(emergencyTargetNominal) }}
            </span>
            <span class="font-bold">
              {{ emergencyProgress }}%
            </span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              class="bg-[#183D2B] h-2 rounded-full transition-all duration-500"
              :style="{ width: `${emergencyProgress}%` }"
            ></div>
          </div>
        </div>
      </div>

      <!-- KARTU 2 & 3: TARGET IMPIAN (PURCHASE GOALS) -->
      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold uppercase tracking-wider text-gray-700">
            Target Impian Terdaftar (Alokasi 40%)
          </span>
          <span class="text-xs text-gray-500">
            {{ purchaseGoals.length }} Target Aktif
          </span>
        </div>

        <!-- Empty State Target Impian -->
        <div
          v-if="purchaseGoals.length === 0"
          class="p-6 border-2 border-dashed border-gray-200 rounded-2xl text-center space-y-2 bg-gray-50/50"
        >
          <div class="text-2xl">🎯</div>
          <p class="text-sm font-bold text-gray-700">Belum Ada Target Impian</p>
          <p class="text-xs text-gray-500 max-w-sm mx-auto">
            Tambahkan target seperti Rumah, Mobil, Gadget, atau Liburan. Sistem akan membagi 40% porsi tabungan ke target ini.
          </p>
          <button
            @click="emit('openAddGoalModal')"
            class="mt-2 px-4 py-2 bg-[#183D2B] text-white rounded-xl text-xs font-bold hover:bg-[#24553d] cursor-pointer"
          >
            + Buat Target Impian Pertama
          </button>
        </div>

        <!-- Grid Items Target Impian -->
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div
            v-for="goal in purchaseGoals"
            :key="goal.id"
            class="p-4 rounded-xl border border-gray-200 bg-gray-50/40 hover:bg-gray-50 transition space-y-3"
          >
            <div class="flex items-start justify-between">
              <div>
                <h4 class="text-sm font-bold text-gray-900">{{ goal.name }}</h4>
                <div class="flex items-center space-x-1 text-[11px] text-gray-500">
                  <span>{{ goal.mode === 'DOWN_PAYMENT' ? 'Down Payment (DP)' : 'Harga Penuh' }}</span>
                  <span>•</span>
                  <span>Bobot {{ Math.round((goal.shareRatio || 0) / 100) }}%</span>
                </div>
              </div>
              <span
                v-if="isGoalFunded(goal)"
                class="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-100 text-emerald-800"
              >
                Tercapai 🎉
              </span>
              <span
                v-else
                class="px-2 py-0.5 text-[10px] font-bold rounded bg-blue-100 text-blue-800"
              >
                Mengumpulkan
              </span>
            </div>

            <!-- Progress Bar -->
            <div class="space-y-1">
              <div class="flex justify-between text-xs font-semibold">
                <span class="text-emerald-900">{{ formatRupiah(goal.currentBalance) }}</span>
                <span class="text-gray-500">{{ formatRupiah(getGoalTargetPrice(goal)) }}</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                <div
                  class="bg-[#B8DF38] h-1.5 rounded-full transition-all duration-500"
                  :style="{ width: `${getGoalProgress(goal)}%` }"
                ></div>
              </div>
              <div class="flex justify-between text-[10px] text-gray-500">
                <span>Acuan: {{ formatDate(goal.referenceDate) }}</span>
                <span>{{ getGoalProgress(goal) }}%</span>
              </div>
            </div>

            <!-- Action buttons inside card -->
            <div class="pt-2 border-t border-gray-200/60 flex items-center justify-between text-xs">
              <button
                @click="emit('openSimulatorWithGoal', goal)"
                class="text-emerald-800 hover:text-emerald-950 font-bold flex items-center space-x-1 cursor-pointer"
              >
                <span>📊 Simulasi KPR/Target</span>
              </button>
              <button
                @click="emit('openReleaseModal', goal.id)"
                class="text-gray-500 hover:text-red-700 transition cursor-pointer"
              >
                Lepas Alokasi
              </button>
            </div>
          </div>
        </div>

        <!-- Tabungan Belum Ditentukan (jika ada saldo) -->
        <div
          v-if="unassignedGoal && BigInt(unassignedGoal.currentBalance || 0) > 0n"
          class="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs flex items-center justify-between"
        >
          <div class="flex items-center space-x-2">
            <span>📦</span>
            <div>
              <span class="font-bold text-amber-900">Tabungan Belum Ditentukan:</span>
              <span class="font-bold text-amber-950 ml-1">{{ formatRupiah(unassignedGoal.currentBalance) }}</span>
            </div>
          </div>
          <button
            @click="emit('openReleaseModal', unassignedGoal.id)"
            class="text-amber-800 hover:text-amber-950 underline font-semibold text-xs cursor-pointer"
          >
            Pindahkan / Lepas
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
