<script setup lang="ts">
import { computed } from 'vue';
import { formatRupiah, formatDate } from '../utils/format';
import type { SavingsGoal, FinanceProfile } from '../api/services';
import {
  ShieldCheck,
  Target,
  Plus,
  SlidersHorizontal,
  Calculator,
  Unlock,
  Package,
  CheckCircle2,
} from 'lucide-vue-next';

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
  <div class="fintech-card rounded-2xl p-5 sm:p-6 space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-stone-100 pb-4">
      <div>
        <div class="flex items-center gap-2.5">
          <div class="w-7 h-7 rounded-lg bg-emerald-50 text-[#183D2B] flex items-center justify-center">
            <Target class="w-4 h-4" :stroke-width="2" />
          </div>
          <h2 class="text-base font-extrabold text-[#18221B]">Tabungan & Target Impian</h2>
          <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200/80">
            Alokasi D-005
          </span>
        </div>
        <p class="text-xs text-[#5E6961] mt-1 font-normal">
          Uang tetap dalam satu rekening gabungan, disisihkan dengan rasio 60% Dana Pengaman dan 40% Target Impian.
        </p>
      </div>

      <div class="flex items-center gap-2 self-start sm:self-auto">
        <button
          v-if="purchaseGoals.length > 1"
          type="button"
          @click="emit('openSharesModal')"
          class="tactile-btn inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-xl cursor-pointer border border-stone-200"
        >
          <SlidersHorizontal class="w-3.5 h-3.5 text-stone-600" :stroke-width="1.75" />
          <span>Atur Bobot</span>
        </button>

        <button
          type="button"
          @click="emit('openAddGoalModal')"
          class="tactile-btn inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-[#183D2B] bg-[#B8DF38] hover:bg-[#a3c82e] rounded-xl shadow-xs cursor-pointer select-none"
        >
          <Plus class="w-4 h-4 text-[#183D2B]" :stroke-width="2.5" />
          <span>Target Baru</span>
        </button>
      </div>
    </div>

    <!-- Seksi Tabungan Grid -->
    <div class="space-y-5">
      <!-- KARTU 1: DANA PENGAMAN (EMERGENCY FUND) -->
      <div v-if="emergencyGoal" class="p-5 rounded-2xl bg-gradient-to-br from-[#183D2B]/8 via-[#183D2B]/5 to-transparent border border-[#183D2B]/15 space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-[#183D2B] text-[#B8DF38] flex items-center justify-center shrink-0 shadow-xs">
              <ShieldCheck class="w-5 h-5" :stroke-width="2" />
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h3 class="text-sm font-bold text-[#183D2B]">Dana Pengaman (Alokasi 60%)</h3>
                <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#183D2B]/10 text-[#183D2B]">
                  Pondasi Darurat
                </span>
              </div>
              <p class="text-xs text-stone-500 mt-0.5 font-normal">
                Target: {{ emergencyGoal.targetMonths || 6 }} bulan kebutuhan pokok ({{ formatRupiah(profile?.monthlyNeeds || '0') }}/bulan)
              </p>
            </div>
          </div>

          <div class="sm:text-right">
            <div class="text-xl font-black text-[#183D2B] tabular-nums">
              {{ formatRupiah(emergencyGoal.currentBalance) }}
            </div>
            <span class="inline-flex items-center gap-1 text-xs font-bold text-emerald-800">
              Kekuatan Bertahan: {{ coverageMonths.toFixed(1) }} Bulan
            </span>
          </div>
        </div>

        <!-- Progress bar terhadap target bulan pengaman -->
        <div class="space-y-1.5 pt-1">
          <div class="flex justify-between text-xs font-medium text-stone-600">
            <span>Target Penuh: <strong class="text-[#18221B] font-bold tabular-nums">{{ formatRupiah(emergencyTargetNominal) }}</strong></span>
            <span class="font-bold text-[#183D2B] tabular-nums">{{ emergencyProgress }}%</span>
          </div>
          <div class="w-full bg-stone-200/80 rounded-full h-2.5 overflow-hidden">
            <div
              class="bg-[#183D2B] h-2.5 rounded-full transition-all duration-500"
              :style="{ width: `${emergencyProgress}%` }"
            ></div>
          </div>
        </div>
      </div>

      <!-- KARTU 2: TARGET IMPIAN (PURCHASE GOALS) -->
      <div class="space-y-3.5">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold uppercase tracking-wider text-stone-700">
            Target Impian Terdaftar (Alokasi 40%)
          </span>
          <span class="text-xs font-medium text-stone-500 tabular-nums">
            {{ purchaseGoals.length }} Target Aktif
          </span>
        </div>

        <!-- Empty State Target Impian -->
        <div
          v-if="purchaseGoals.length === 0"
          class="p-8 border-2 border-dashed border-stone-200 rounded-2xl text-center space-y-3 bg-stone-50/50"
        >
          <div class="w-12 h-12 rounded-2xl bg-stone-100 text-[#183D2B] flex items-center justify-center mx-auto">
            <Target class="w-6 h-6" :stroke-width="1.75" />
          </div>
          <div>
            <h4 class="text-sm font-bold text-[#18221B]">Belum Ada Target Impian</h4>
            <p class="text-xs text-[#5E6961] max-w-sm mx-auto mt-1 leading-relaxed font-normal">
              Tambahkan rencana target seperti Rumah, Kendaraan, atau Gadget. Sistem akan mendistribusikan 40% porsi tabungan ke target ini.
            </p>
          </div>
          <button
            type="button"
            @click="emit('openAddGoalModal')"
            class="tactile-btn mt-2 px-4 py-2 bg-[#183D2B] text-white rounded-xl text-xs font-bold hover:bg-[#24553d] cursor-pointer inline-flex items-center gap-1.5"
          >
            <Plus class="w-4 h-4 text-[#B8DF38]" :stroke-width="2.5" />
            <span>Buat Target Pertama</span>
          </button>
        </div>

        <!-- Grid Items Target Impian -->
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div
            v-for="goal in purchaseGoals"
            :key="goal.id"
            class="fintech-card-interactive p-4 sm:p-5 rounded-2xl border border-stone-200/80 bg-white space-y-3.5"
          >
            <div class="flex items-start justify-between gap-2">
              <div>
                <h4 class="text-sm font-bold text-[#18221B]">{{ goal.name }}</h4>
                <div class="flex items-center gap-2 text-[11px] text-[#5E6961] mt-0.5">
                  <span class="font-medium">{{ goal.mode === 'DOWN_PAYMENT' ? 'Uang Muka (DP)' : 'Beli Lunas' }}</span>
                  <span>•</span>
                  <span class="font-bold tabular-nums">Bobot {{ Math.round((goal.shareRatio || 0) / 100) }}%</span>
                </div>
              </div>

              <span
                v-if="isGoalFunded(goal)"
                class="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200"
              >
                <CheckCircle2 class="w-3 h-3 text-emerald-600" />
                <span>Tercapai</span>
              </span>
              <span
                v-else
                class="inline-flex items-center px-2 py-0.5 text-[10px] font-semibold rounded-full bg-stone-100 text-stone-700 border border-stone-200"
              >
                Proses
              </span>
            </div>

            <!-- Progress Bar -->
            <div class="space-y-1.5">
              <div class="flex justify-between text-xs font-semibold">
                <span class="text-[#183D2B] font-bold tabular-nums">{{ formatRupiah(goal.currentBalance) }}</span>
                <span class="text-stone-500 tabular-nums">Target {{ formatRupiah(getGoalTargetPrice(goal)) }}</span>
              </div>
              <div class="w-full bg-stone-100 rounded-full h-2 overflow-hidden">
                <div
                  class="bg-[#B8DF38] h-2 rounded-full transition-all duration-500"
                  :style="{ width: `${getGoalProgress(goal)}%` }"
                ></div>
              </div>
              <div class="flex justify-between text-[10px] text-stone-500 font-medium">
                <span>Acuan: {{ formatDate(goal.referenceDate) }}</span>
                <span class="font-bold text-[#18221B] tabular-nums">{{ getGoalProgress(goal) }}%</span>
              </div>
            </div>

            <!-- Action buttons inside card -->
            <div class="pt-2.5 border-t border-stone-100 flex items-center justify-between text-xs">
              <button
                type="button"
                @click="emit('openSimulatorWithGoal', goal)"
                class="tactile-btn text-[#183D2B] hover:text-emerald-950 font-bold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Calculator class="w-3.5 h-3.5 text-[#183D2B]" :stroke-width="2" />
                <span>Simulasi Target</span>
              </button>

              <button
                type="button"
                @click="emit('openReleaseModal', goal.id)"
                class="tactile-btn text-stone-500 hover:text-rose-700 font-medium inline-flex items-center gap-1 transition cursor-pointer"
              >
                <Unlock class="w-3 h-3" :stroke-width="1.75" />
                <span>Lepas Alokasi</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Tabungan Belum Ditentukan (jika ada saldo) -->
        <div
          v-if="unassignedGoal && BigInt(unassignedGoal.currentBalance || 0) > 0n"
          class="p-4 bg-amber-50/80 border border-amber-200/80 rounded-xl text-xs flex items-center justify-between gap-2"
        >
          <div class="flex items-center gap-2.5">
            <Package class="w-4 h-4 text-amber-700 shrink-0" :stroke-width="2" />
            <div>
              <span class="font-bold text-amber-900">Tabungan Belum Ditentukan:</span>
              <span class="font-bold text-amber-950 ml-1 tabular-nums">{{ formatRupiah(unassignedGoal.currentBalance) }}</span>
            </div>
          </div>
          <button
            type="button"
            @click="emit('openReleaseModal', unassignedGoal.id)"
            class="tactile-btn text-amber-900 hover:text-amber-950 font-bold underline cursor-pointer shrink-0"
          >
            Pindahkan / Lepas
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
