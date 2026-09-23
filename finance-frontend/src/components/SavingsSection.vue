<script setup lang="ts">
import { computed } from 'vue';
import { formatRupiah, formatDate } from '../utils/format';
import type { SavingsGoal, FinanceProfile, GoalForecast } from '../api/services';
import {
  ShieldCheck,
  Target,
  Plus,
  SlidersHorizontal,
  Calculator,
  Unlock,
  Package,
  CheckCircle2,
  Calendar,
  TrendingUp,
  AlertTriangle,
  Pencil,
} from 'lucide-vue-next';

const props = defineProps<{
  emergencyGoal?: SavingsGoal;
  purchaseGoals: SavingsGoal[];
  unassignedGoal?: SavingsGoal;
  profile?: FinanceProfile | null;
  emergencyMonths?: number;
  forecasts?: Record<number, GoalForecast>;
}>();

const emit = defineEmits<{
  (e: 'openSharesModal'): void;
  (e: 'openAddGoalModal'): void;
  (e: 'openEditGoalModal', goal: SavingsGoal): void;
  (e: 'openReleaseModal', goalId?: number): void;
  (e: 'openSimulatorWithGoal', goal: SavingsGoal): void;
  (e: 'openSimulatorWithTopUp', payload: { goal: SavingsGoal; recommendedMonthly: string }): void;
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

const getForecast = (goalId: number): GoalForecast | undefined => {
  return props.forecasts ? props.forecasts[goalId] : undefined;
};
</script>

<template>
  <div class="fintech-card rounded-2xl p-5 sm:p-6 space-y-6 bg-white dark:bg-[#16201A] border border-stone-200/90 dark:border-[#243329] transition-colors">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-stone-100 dark:border-[#243329] pb-4">
      <div>
        <div class="flex items-center gap-2.5">
          <div class="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-[#0E1410] text-[#183D2B] dark:text-[#B8DF38] flex items-center justify-center border border-emerald-100 dark:border-[#243329]">
            <Target class="w-4 h-4" :stroke-width="2" />
          </div>
          <h2 class="text-base font-extrabold text-[#18221B] dark:text-[#F0F4F1]">Tabungan & Target Impian</h2>
          <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/50">
            Alokasi D-005
          </span>
        </div>
        <p class="text-xs text-[#5E6961] dark:text-[#98A79D] mt-1 font-normal">
          Uang tetap dalam satu rekening gabungan, disisihkan dengan rasio 60% Dana Pengaman dan 40% Target Impian.
        </p>
      </div>

      <div class="flex items-center gap-2 self-start sm:self-auto">
        <button
          v-if="purchaseGoals.length > 1"
          type="button"
          @click="emit('openSharesModal')"
          class="tactile-btn inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-stone-700 dark:text-[#F0F4F1] bg-stone-100 dark:bg-[#0E1410] hover:bg-stone-200 dark:hover:bg-[#243329] rounded-xl cursor-pointer border border-stone-200 dark:border-[#243329]"
        >
          <SlidersHorizontal class="w-3.5 h-3.5 text-stone-600 dark:text-[#98A79D]" :stroke-width="1.75" />
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
      <div v-if="emergencyGoal" class="p-5 rounded-2xl bg-gradient-to-br from-[#183D2B]/8 via-[#183D2B]/5 to-transparent dark:from-[#183D2B]/20 dark:via-[#132E21]/30 dark:to-transparent border border-[#183D2B]/15 dark:border-[#243329] space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-[#183D2B] dark:bg-[#132E21] text-[#B8DF38] flex items-center justify-center shrink-0 shadow-xs border border-emerald-900/40">
              <ShieldCheck class="w-5 h-5" :stroke-width="2" />
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h3 class="text-sm font-bold text-[#183D2B] dark:text-[#B8DF38]">Dana Pengaman (Alokasi 60%)</h3>
                <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#183D2B]/10 dark:bg-[#B8DF38]/15 text-[#183D2B] dark:text-[#B8DF38]">
                  Pondasi Darurat
                </span>
              </div>
              <p class="text-xs text-stone-500 dark:text-[#98A79D] mt-0.5 font-normal">
                Target: {{ emergencyGoal.targetMonths || 6 }} bulan kebutuhan pokok ({{ formatRupiah(profile?.monthlyNeeds || '0') }}/bulan)
              </p>
            </div>
          </div>

          <div class="sm:text-right">
            <div class="text-xl font-black text-[#183D2B] dark:text-[#B8DF38] tabular-nums">
              {{ formatRupiah(emergencyGoal.currentBalance) }}
            </div>
            <span class="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 dark:text-emerald-400">
              Kekuatan Bertahan: {{ coverageMonths.toFixed(1) }} Bulan
            </span>
          </div>
        </div>

        <!-- Progress bar terhadap target bulan pengaman -->
        <div class="space-y-1.5 pt-1">
          <div class="flex justify-between items-baseline text-xs">
            <span class="text-stone-600 dark:text-[#98A79D]">Target Penuh: <strong class="text-[#18221B] dark:text-[#F0F4F1] font-bold tabular-nums">{{ formatRupiah(emergencyTargetNominal) }}</strong></span>
            <span class="font-bold text-[#183D2B] dark:text-[#B8DF38] tabular-nums">{{ emergencyProgress }}%</span>
          </div>
          <div class="relative w-full bg-stone-200/80 dark:bg-[#0E1410] rounded-full h-2.5 overflow-hidden border border-stone-300/40 dark:border-[#243329]">
            <div
              class="bg-[#183D2B] dark:bg-[#B8DF38] h-full rounded-full transition-all duration-500"
              :style="{ width: `${emergencyProgress}%` }"
            ></div>
            <!-- Milestone Notch Ticks (25%, 50%, 75%) -->
            <div class="absolute inset-0 pointer-events-none flex items-center">
              <div class="absolute left-1/4 -translate-x-1/2 w-0.5 h-full bg-white/70 dark:bg-[#16201A]/80 z-10"></div>
              <div class="absolute left-2/4 -translate-x-1/2 w-0.5 h-full bg-white/70 dark:bg-[#16201A]/80 z-10"></div>
              <div class="absolute left-3/4 -translate-x-1/2 w-0.5 h-full bg-white/70 dark:bg-[#16201A]/80 z-10"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- KARTU 2: TARGET IMPIAN (PURCHASE GOALS) -->
      <div class="space-y-3.5">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-[#F0F4F1]">
            Target Impian Terdaftar (Alokasi 40%)
          </span>
          <span class="text-xs font-medium text-stone-500 dark:text-[#98A79D] tabular-nums">
            {{ purchaseGoals.length }} Target Aktif
          </span>
        </div>

        <!-- Empty State Target Impian -->
        <div
          v-if="purchaseGoals.length === 0"
          class="p-8 border-2 border-dashed border-stone-200 dark:border-[#243329] rounded-2xl text-center space-y-3 bg-stone-50/50 dark:bg-[#0E1410]/50"
        >
          <div class="w-12 h-12 rounded-2xl bg-stone-100 dark:bg-[#16201A] text-[#183D2B] dark:text-[#B8DF38] flex items-center justify-center mx-auto">
            <Target class="w-6 h-6" :stroke-width="1.75" />
          </div>
          <div>
            <h4 class="text-sm font-bold text-[#18221B] dark:text-[#F0F4F1]">Belum Ada Target Impian</h4>
            <p class="text-xs text-[#5E6961] dark:text-[#98A79D] max-w-sm mx-auto mt-1 leading-relaxed font-normal">
              Tambahkan rencana target seperti Rumah, Kendaraan, atau Gadget. Sistem akan mendistribusikan 40% porsi tabungan ke target ini.
            </p>
          </div>
          <button
            type="button"
            @click="emit('openAddGoalModal')"
            class="tactile-btn mt-2 px-4 py-2 bg-[#183D2B] dark:bg-[#132E21] text-white rounded-xl text-xs font-bold hover:bg-[#24553d] dark:hover:bg-[#1c3f2d] border border-emerald-900/40 cursor-pointer inline-flex items-center gap-1.5"
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
            class="fintech-card-interactive p-4 sm:p-5 rounded-2xl border border-stone-200/80 dark:border-[#243329] bg-white dark:bg-[#16201A] space-y-3.5"
          >
            <div class="flex items-start justify-between gap-2">
              <div>
                <h4 class="text-sm font-bold text-[#18221B] dark:text-[#F0F4F1]">{{ goal.name }}</h4>
                <div class="flex items-center gap-2 text-[11px] text-[#5E6961] dark:text-[#98A79D] mt-0.5">
                  <span class="font-medium">{{ goal.mode === 'DOWN_PAYMENT' ? 'Uang Muka (DP)' : 'Beli Lunas' }}</span>
                  <span>•</span>
                  <span class="font-bold tabular-nums">Bobot {{ Math.round((goal.shareRatio || 0) / 100) }}%</span>
                </div>
              </div>

              <!-- Time Estimation / Status Badge -->
              <span
                v-if="isGoalFunded(goal) || forecasts?.[goal.id]?.isAchieved"
                class="inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/50"
              >
                <CheckCircle2 class="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Tercapai</span>
              </span>
              <span
                v-else-if="getForecast(goal.id)?.isUnachievable"
                class="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/50"
                title="Laju inflasi tahunan lebih cepat daripada laju tabungan saat ini"
              >
                <AlertTriangle class="w-3 h-3 text-amber-600 dark:text-amber-400" :stroke-width="2" />
                <span>Kalah Inflasi</span>
              </span>
              <span
                v-else-if="getForecast(goal.id)?.targetMonths !== null && getForecast(goal.id)?.targetMonths !== undefined"
                class="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-[#183D2B] dark:text-[#B8DF38] border border-[#183D2B]/20 dark:border-[#B8DF38]/30 tabular-nums"
              >
                <Calendar class="w-3 h-3 text-[#183D2B] dark:text-[#B8DF38]" />
                <span v-if="getForecast(goal.id)?.hasUserTargetMonths">Target: {{ getForecast(goal.id)!.targetMonths }} bln ({{ getForecast(goal.id)!.targetDateFormatted }})</span>
                <span v-else>~{{ getForecast(goal.id)!.targetMonths }} bln ({{ getForecast(goal.id)!.targetDateFormatted }})</span>
              </span>
              <span
                v-else
                class="inline-flex items-center px-2.5 py-0.5 text-[11px] font-semibold rounded-full bg-stone-100 dark:bg-[#0E1410] text-stone-700 dark:text-[#98A79D] border border-stone-200 dark:border-[#243329]"
              >
                Proses
              </span>
            </div>

            <!-- Progress Bar with Embedded Milestone Ticks -->
            <div class="space-y-1.5">
              <div class="flex justify-between items-baseline text-xs">
                <div>
                  <span class="text-xs font-medium text-stone-500 dark:text-[#98A79D]">Terkumpul: </span>
                  <span class="text-sm font-extrabold text-[#183D2B] dark:text-[#B8DF38] tabular-nums">{{ formatRupiah(goal.currentBalance) }}</span>
                </div>
                <div class="text-right">
                  <span class="text-xs text-stone-500 dark:text-[#98A79D]">Target: </span>
                  <span class="text-xs font-bold text-[#18221B] dark:text-[#F0F4F1] tabular-nums">{{ formatRupiah(getGoalTargetPrice(goal)) }}</span>
                </div>
              </div>

              <!-- Track with embedded milestone notch ticks (25%, 50%, 75%) -->
              <div class="relative w-full bg-stone-100 dark:bg-[#0E1410] rounded-full h-2.5 overflow-hidden border border-stone-200/50 dark:border-[#243329]">
                <div
                  class="bg-[#B8DF38] dark:bg-[#B8DF38] h-full rounded-full transition-all duration-500"
                  :style="{ width: `${getGoalProgress(goal)}%` }"
                ></div>
                <!-- Milestone Notch Ticks -->
                <div class="absolute inset-0 pointer-events-none flex items-center">
                  <div class="absolute left-1/4 -translate-x-1/2 w-0.5 h-full bg-white/70 dark:bg-[#16201A]/80 z-10"></div>
                  <div class="absolute left-2/4 -translate-x-1/2 w-0.5 h-full bg-white/70 dark:bg-[#16201A]/80 z-10"></div>
                  <div class="absolute left-3/4 -translate-x-1/2 w-0.5 h-full bg-white/70 dark:bg-[#16201A]/80 z-10"></div>
                </div>
              </div>

              <!-- Sub-track Info: Progress % + Milestones + Future Price -->
              <div class="flex items-center justify-between text-[11px] text-stone-500 dark:text-[#98A79D] font-medium pt-0.5">
                <div class="flex items-center gap-1.5">
                  <span class="font-extrabold text-[#18221B] dark:text-[#F0F4F1] tabular-nums">{{ getGoalProgress(goal) }}%</span>
                  <span class="text-stone-300 dark:text-stone-700">•</span>
                  <span class="text-[10px] text-stone-400 dark:text-stone-500">Tahap:</span>
                  <div class="inline-flex items-center gap-1 text-[10px]">
                    <span :class="getGoalProgress(goal) >= 25 ? 'font-bold text-emerald-700 dark:text-emerald-400' : 'text-stone-400 dark:text-stone-600'">25%</span>
                    <span class="text-stone-300 dark:text-stone-700">·</span>
                    <span :class="getGoalProgress(goal) >= 50 ? 'font-bold text-emerald-700 dark:text-emerald-400' : 'text-stone-400 dark:text-stone-600'">50%</span>
                    <span class="text-stone-300 dark:text-stone-700">·</span>
                    <span :class="getGoalProgress(goal) >= 75 ? 'font-bold text-emerald-700 dark:text-emerald-400' : 'text-stone-400 dark:text-stone-600'">75%</span>
                  </div>
                </div>

                <div>
                  <span
                    v-if="getForecast(goal.id)?.projectedPrice && !getForecast(goal.id)?.isAchieved && !getForecast(goal.id)?.isUnachievable"
                    class="text-stone-500 dark:text-[#98A79D]"
                  >
                    Est. Masa Depan: <strong class="text-stone-700 dark:text-[#F0F4F1] tabular-nums">{{ formatRupiah(getForecast(goal.id)!.projectedPrice) }}</strong>
                  </span>
                  <span v-else class="text-[10px] text-stone-400 dark:text-[#98A79D]">
                    Acuan: {{ formatDate(goal.referenceDate) }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Smart Top-up Recommendation Box -->
            <div
              v-if="getForecast(goal.id)?.topUpSuggestion && !isGoalFunded(goal)"
              class="p-3 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition-colors"
              :class="getForecast(goal.id)?.isUnachievable
                ? 'bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/90 dark:border-amber-900/50'
                : 'bg-emerald-50/70 dark:bg-[#132E21]/50 border border-emerald-200/70 dark:border-[#243329]'"
            >
              <div class="flex items-start gap-2.5 min-w-0">
                <div
                  class="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                  :class="getForecast(goal.id)?.isUnachievable
                    ? 'bg-amber-600 text-white dark:bg-amber-500/20 dark:text-amber-300'
                    : 'bg-[#183D2B] dark:bg-[#132E21] text-[#B8DF38]'"
                >
                  <TrendingUp class="w-3.5 h-3.5" :stroke-width="2.25" />
                </div>
                <div class="min-w-0">
                  <div
                    class="text-[11px] font-bold leading-tight"
                    :class="getForecast(goal.id)?.isUnachievable
                      ? 'text-amber-950 dark:text-amber-200'
                      : 'text-[#183D2B] dark:text-[#B8DF38]'"
                  >
                    <template v-if="getForecast(goal.id)!.isUnachievable">
                      Nabung ekstra <strong class="tabular-nums underline decoration-amber-400">{{ formatRupiah(getForecast(goal.id)!.topUpSuggestion!.extraMonthlySavings) }}</strong>/bln untuk melampaui laju inflasi
                    </template>
                    <template v-else-if="getForecast(goal.id)?.hasUserTargetMonths">
                      Butuh <strong class="tabular-nums underline decoration-emerald-400">{{ formatRupiah(getForecast(goal.id)!.requiredMonthlySavings || '0') }}</strong>/bln untuk capai target dalam {{ getForecast(goal.id)!.targetMonths }} bln
                    </template>
                    <template v-else>
                      Nabung ekstra <strong class="tabular-nums underline decoration-[#B8DF38]">{{ formatRupiah(getForecast(goal.id)!.topUpSuggestion!.extraMonthlySavings) }}</strong>/bln untuk maju <span class="tabular-nums font-extrabold">{{ getForecast(goal.id)!.topUpSuggestion!.monthsSaved }} bln</span> lebih cepat ({{ getForecast(goal.id)!.topUpSuggestion!.newTargetDateFormatted }})
                    </template>
                  </div>
                  <p class="text-[10px] text-stone-500 dark:text-[#98A79D] font-normal mt-0.5">
                    <template v-if="getForecast(goal.id)!.isUnachievable">
                      Alokasi saat ini: {{ formatRupiah(getForecast(goal.id)!.estimatedMonthlySavings) }}/bln
                      <span class="text-amber-700 dark:text-amber-400 font-semibold">
                        (Inflasi {{ ((goal.annualPriceIncreaseRatio ?? 500) / 100).toFixed(0) }}%/thn lebih cepat dari tabungan)
                      </span>
                    </template>
                    <template v-else-if="getForecast(goal.id)?.hasUserTargetMonths">
                      Alokasi saat ini: {{ formatRupiah(getForecast(goal.id)!.estimatedMonthlySavings) }}/bln
                      <span v-if="BigInt(getForecast(goal.id)!.topUpSuggestion?.extraMonthlySavings || '0') > 0n" class="text-amber-700 dark:text-amber-400 font-semibold">
                        (Kurang {{ formatRupiah(getForecast(goal.id)!.topUpSuggestion!.extraMonthlySavings) }}/bln<template v-if="getForecast(goal.id)?.estimatedMonthsWithCurrentSavings"> · Estimasi tabungan saat ini: ~{{ getForecast(goal.id)!.estimatedMonthsWithCurrentSavings }} bln</template>)
                      </span>
                    </template>
                    <template v-else>
                      Alokasi saat ini: {{ formatRupiah(getForecast(goal.id)!.estimatedMonthlySavings) }}/bln
                    </template>
                  </p>
                </div>
              </div>

              <button
                type="button"
                @click="emit('openSimulatorWithTopUp', {
                  goal,
                  recommendedMonthly: getForecast(goal.id)?.hasUserTargetMonths
                    ? (getForecast(goal.id)!.requiredMonthlySavings || getForecast(goal.id)!.estimatedMonthlySavings)
                    : (BigInt(getForecast(goal.id)!.estimatedMonthlySavings) + BigInt(getForecast(goal.id)!.topUpSuggestion!.extraMonthlySavings)).toString()
                })"
                class="tactile-btn shrink-0 px-3 py-1.5 text-xs font-bold rounded-xl cursor-pointer shadow-xs whitespace-nowrap active:scale-[0.98] transition-all"
                :class="getForecast(goal.id)?.isUnachievable
                  ? 'text-white bg-amber-700 hover:bg-amber-800 dark:bg-amber-600 dark:hover:bg-amber-500'
                  : 'text-[#183D2B] bg-[#B8DF38] hover:bg-[#a6cd2b]'"
                title="Uji skenario tabungan ini di simulator"
              >
                Uji di Simulator
              </button>
            </div>

            <!-- Action buttons inside card -->
            <div class="pt-3 border-t border-stone-100 dark:border-[#243329] flex items-center justify-between text-xs">
              <div class="flex items-center gap-1.5">
                <button
                  type="button"
                  @click="emit('openSimulatorWithGoal', goal)"
                  class="tactile-btn px-2.5 py-1.5 rounded-lg text-[#183D2B] dark:text-[#B8DF38] hover:bg-emerald-50 dark:hover:bg-[#132E21] font-bold inline-flex items-center gap-1.5 cursor-pointer active:scale-[0.98] transition"
                >
                  <Calculator class="w-3.5 h-3.5 text-[#183D2B] dark:text-[#B8DF38]" :stroke-width="2" />
                  <span>Simulasi</span>
                </button>

                <button
                  type="button"
                  @click="emit('openEditGoalModal', goal)"
                  class="tactile-btn px-2.5 py-1.5 rounded-lg text-stone-600 dark:text-[#98A79D] hover:text-[#183D2B] dark:hover:text-[#B8DF38] hover:bg-stone-100 dark:hover:bg-[#0E1410] font-semibold inline-flex items-center gap-1 cursor-pointer active:scale-[0.98] transition"
                  title="Ubah nama, harga, atau target waktu"
                >
                  <Pencil class="w-3 h-3 text-stone-500 dark:text-[#98A79D]" :stroke-width="1.75" />
                  <span>Ubah</span>
                </button>
              </div>

              <button
                type="button"
                @click="emit('openReleaseModal', goal.id)"
                class="tactile-btn px-2.5 py-1.5 rounded-lg text-stone-500 dark:text-[#98A79D] hover:text-rose-700 dark:hover:text-rose-400 hover:bg-rose-50/50 dark:hover:bg-rose-950/30 font-medium inline-flex items-center gap-1 cursor-pointer active:scale-[0.98] transition"
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
          class="p-4 bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/40 rounded-xl text-xs flex items-center justify-between gap-2"
        >
          <div class="flex items-center gap-2.5">
            <Package class="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0" :stroke-width="2" />
            <div>
              <span class="font-bold text-amber-900 dark:text-amber-200">Tabungan Belum Ditentukan:</span>
              <span class="font-bold text-amber-950 dark:text-amber-100 ml-1 tabular-nums">{{ formatRupiah(unassignedGoal.currentBalance) }}</span>
            </div>
          </div>
          <button
            type="button"
            @click="emit('openReleaseModal', unassignedGoal.id)"
            class="tactile-btn text-amber-900 dark:text-amber-300 hover:text-amber-950 dark:hover:text-amber-100 font-bold underline cursor-pointer shrink-0"
          >
            Pindahkan / Lepas
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
