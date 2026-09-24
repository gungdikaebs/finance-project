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
  AlertTriangle,
  Pencil,
  ChevronDown,
  ShoppingBag,
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
  (e: 'openCompleteModal', goal: SavingsGoal): void;
  (e: 'reopenGoal', goal: SavingsGoal): void;
  (e: 'openSimulatorWithGoal', goal: SavingsGoal): void;
  (e: 'openSimulatorWithTopUp', payload: { goal: SavingsGoal; recommendedMonthly: string }): void;
}>();

const activePurchaseGoals = computed(() =>
  props.purchaseGoals.filter((g) => !g.isArchived && !g.isCompleted),
);
const completedPurchaseGoals = computed(() =>
  props.purchaseGoals.filter((g) => !g.isArchived && g.isCompleted),
);


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

const formatRatio = (basisPoints: number): string => {
  return `${(basisPoints / 100).toLocaleString('id-ID', { maximumFractionDigits: 2 })}%`;
};

const incomeBasisDescription = (forecast: GoalForecast): string => {
  switch (forecast.incomeBasis) {
    case 'RECENT_6_MONTHS':
      return `Rata-rata dari ${forecast.incomeMonths} bulan yang memiliki pemasukan dalam 6 bulan terakhir.`;
    case 'ALL_RECORDED':
      return `Belum ada pemasukan baru; rata-rata memakai ${forecast.incomeMonths} bulan berpemasukan yang pernah dicatat.`;
    case 'PROFILE_ESTIMATE':
      return 'Belum ada pemasukan tercatat; perkiraan awal memakai dua kali kebutuhan bulanan pada profil.';
    default:
      return 'Belum ada pemasukan acuan yang tercatat.';
  }
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
            Rasio Otomatis 60:40
          </span>
        </div>
        <p class="text-xs text-[#5E6961] dark:text-[#98A79D] mt-1 font-normal">
          Uang tetap dalam satu rekening gabungan, disisihkan dengan rasio 60% Dana Pengaman dan 40% Target Impian.
        </p>
      </div>

      <div class="flex items-center gap-2 self-start sm:self-auto">
        <button
          v-if="activePurchaseGoals.length > 1"
          type="button"
          @click="emit('openSharesModal')"
          class="tactile-btn inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-stone-700 dark:text-[#F0F4F1] bg-stone-100 dark:bg-[#0E1410] hover:bg-stone-200 dark:hover:bg-[#243329] rounded-xl cursor-pointer border border-stone-200 dark:border-[#243329]"
        >
          <SlidersHorizontal class="w-3.5 h-3.5 text-stone-600 dark:text-[#98A79D]" :stroke-width="1.75" />
          <span>Atur Pembagian</span>
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
            {{ activePurchaseGoals.length }} Target Aktif
          </span>
        </div>

        <!-- Empty State Target Impian -->
        <div
          v-if="activePurchaseGoals.length === 0"
          class="p-8 border-2 border-dashed border-stone-200 dark:border-[#243329] rounded-2xl text-center space-y-3 bg-stone-50/50 dark:bg-[#0E1410]/50"
        >
          <div class="w-12 h-12 rounded-2xl bg-stone-100 dark:bg-[#16201A] text-[#183D2B] dark:text-[#B8DF38] flex items-center justify-center mx-auto">
            <Target class="w-6 h-6" :stroke-width="1.75" />
          </div>
          <div>
            <h4 class="text-sm font-bold text-[#18221B] dark:text-[#F0F4F1]">Belum Ada Target Impian Aktif</h4>
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
        <div v-else class="grid grid-cols-1 xl:grid-cols-2 gap-3.5">
          <div
            v-for="goal in activePurchaseGoals"
            :key="goal.id"
            class="fintech-card-interactive min-w-0 p-4 sm:p-5 rounded-2xl border bg-white dark:bg-[#16201A] space-y-3.5"
            :class="isGoalFunded(goal) ? 'border-emerald-500/50 dark:border-[#B8DF38]/40 ring-1 ring-emerald-500/20' : 'border-stone-200/80 dark:border-[#243329]'"
          >
            <div class="flex flex-wrap items-start justify-between gap-2">
              <div class="min-w-0">
                <h4 class="text-base font-bold text-[#18221B] dark:text-[#F0F4F1] break-words">{{ goal.name }}</h4>
                <div class="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-[#5E6961] dark:text-[#98A79D] mt-0.5">
                  <span class="font-medium">{{ goal.mode === 'DOWN_PAYMENT' ? 'Uang Muka (DP)' : 'Beli Lunas' }}</span>
                  <span>•</span>
                  <span class="font-bold tabular-nums">Porsi {{ Math.round((goal.shareRatio || 0) / 100) }}%</span>
                </div>
              </div>

              <!-- Time Estimation / Status Badge -->
              <span
                v-if="isGoalFunded(goal)"
                class="inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-900 dark:text-[#B8DF38] border border-emerald-300/80 dark:border-[#B8DF38]/40"
              >
                <CheckCircle2 class="w-3.5 h-3.5 text-emerald-700 dark:text-[#B8DF38]" />
                <span>Dana Sudah Cukup</span>
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

            <!-- Progres uang yang benar-benar sudah disisihkan -->
            <div class="space-y-1.5">
              <div class="grid grid-cols-2 items-end gap-3 text-xs">
                <div class="min-w-0">
                  <span class="block text-xs font-medium text-stone-500 dark:text-[#98A79D]">Terkumpul</span>
                  <span class="block text-base font-extrabold text-[#183D2B] dark:text-[#B8DF38] tabular-nums break-words">{{ formatRupiah(goal.currentBalance) }}</span>
                </div>
                <div class="min-w-0 text-right">
                  <span class="block text-xs text-stone-500 dark:text-[#98A79D]">Target</span>
                  <span class="block text-sm font-bold text-[#18221B] dark:text-[#F0F4F1] tabular-nums break-words">{{ formatRupiah(getGoalTargetPrice(goal)) }}</span>
                </div>
              </div>

              <div
                class="relative w-full bg-stone-100 dark:bg-[#0E1410] rounded-full h-2.5 overflow-hidden border border-stone-200/50 dark:border-[#243329]"
                role="progressbar"
                :aria-label="`Progres target ${goal.name}`"
                :aria-valuenow="getGoalProgress(goal)"
                aria-valuemin="0"
                aria-valuemax="100"
              >
                <div
                  class="bg-[#B8DF38] dark:bg-[#B8DF38] h-full rounded-full transition-all duration-500"
                  :style="{ width: `${getGoalProgress(goal)}%` }"
                ></div>
              </div>

              <div class="text-xs font-semibold text-stone-600 dark:text-[#98A79D] tabular-nums">
                {{ getGoalProgress(goal) }}% dari target terkumpul
              </div>
            </div>

            <!-- Callout saat Dana Cukup (UX-13) -->
            <div
              v-if="isGoalFunded(goal)"
              class="p-3.5 rounded-xl bg-gradient-to-br from-emerald-50 via-lime-50/50 to-transparent dark:from-emerald-950/40 dark:via-[#132E21]/50 dark:to-transparent border border-emerald-200/90 dark:border-emerald-800/60 space-y-2.5"
            >
              <div class="flex items-start gap-2.5">
                <div class="w-6 h-6 rounded-lg bg-[#183D2B] dark:bg-[#B8DF38] text-white dark:text-[#0E1410] flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                  <ShoppingBag class="w-3.5 h-3.5" :stroke-width="2" />
                </div>
                <div class="space-y-0.5 min-w-0">
                  <h5 class="text-xs font-bold text-[#183D2B] dark:text-[#F0F4F1]">
                    Dana Impian Sudah Terpenuhi
                  </h5>
                  <p class="text-[11px] text-stone-600 dark:text-[#98A79D] leading-relaxed">
                    Uang untuk target ini sudah terkumpul. Anda dapat merealisasikan pembelian sekarang atau menunggu saat yang tepat.
                  </p>
                </div>
              </div>

              <button
                type="button"
                @click="emit('openCompleteModal', goal)"
                class="tactile-btn px-3.5 py-2 text-xs font-bold rounded-xl text-[#183D2B] dark:text-[#0E1410] bg-[#B8DF38] hover:bg-[#a6cd2b] cursor-pointer shadow-xs inline-flex items-center gap-1.5 active:scale-[0.98] transition-all"
              >
                <ShoppingBag class="w-3.5 h-3.5 text-[#183D2B] dark:text-[#0E1410]" />
                <span>Gunakan / Wujudkan Impian</span>
              </button>
            </div>

            <!-- Ringkasan kebutuhan bulanan; asumsi lengkap ada di Dasar hitung -->
            <div
              v-if="getForecast(goal.id)?.topUpSuggestion && !isGoalFunded(goal)"
              class="p-3.5 rounded-xl flex flex-col gap-3 transition-colors"
              :class="getForecast(goal.id)?.isUnachievable
                ? 'bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/90 dark:border-amber-900/50'
                : 'bg-emerald-50/70 dark:bg-[#132E21]/50 border border-emerald-200/70 dark:border-[#243329]'"
            >
              <div class="min-w-0 space-y-1">
                <p class="text-[11px] font-semibold text-stone-600 dark:text-[#98A79D]">
                  {{ getForecast(goal.id)?.isUnachievable ? 'Agar tabungan mengejar kenaikan harga' : getForecast(goal.id)?.hasUserTargetMonths ? `Agar tercapai dalam ${getForecast(goal.id)!.targetMonths} bulan` : 'Agar target lebih cepat tercapai' }}
                </p>
                <p
                  class="text-base font-extrabold leading-snug tabular-nums break-words"
                  :class="getForecast(goal.id)?.isUnachievable
                    ? 'text-amber-950 dark:text-amber-200'
                    : 'text-[#183D2B] dark:text-[#B8DF38]'"
                >
                  <template v-if="getForecast(goal.id)?.hasUserTargetMonths && !getForecast(goal.id)?.isUnachievable">
                    Perlu sekitar {{ formatRupiah(getForecast(goal.id)!.requiredMonthlySavings || '0') }}/bulan
                  </template>
                  <template v-else>
                    Tambahan sekitar {{ formatRupiah(getForecast(goal.id)!.topUpSuggestion!.extraMonthlySavings) }}/bulan
                  </template>
                </p>
              </div>

              <button
                type="button"
                @click="emit('openSimulatorWithTopUp', {
                  goal,
                  recommendedMonthly: getForecast(goal.id)?.hasUserTargetMonths
                    ? (getForecast(goal.id)!.requiredMonthlySavings || getForecast(goal.id)!.estimatedMonthlySavings)
                    : (BigInt(getForecast(goal.id)!.estimatedMonthlySavings) + BigInt(getForecast(goal.id)!.topUpSuggestion!.extraMonthlySavings)).toString()
                })"
                class="tactile-btn self-start min-h-[40px] px-3.5 py-2 text-xs font-bold rounded-xl cursor-pointer shadow-xs whitespace-nowrap active:scale-[0.98] transition-all"
                :class="getForecast(goal.id)?.isUnachievable
                  ? 'text-white bg-amber-700 hover:bg-amber-800 dark:bg-amber-600 dark:hover:bg-amber-500'
                  : 'text-[#183D2B] bg-[#B8DF38] hover:bg-[#a6cd2b]'"
                title="Uji skenario tabungan ini di simulator"
              >
                Uji di Simulator
              </button>
            </div>

            <details v-if="getForecast(goal.id)" class="group border-t border-stone-100 dark:border-[#243329] pt-3">
              <summary class="flex items-center justify-between gap-2 text-[11px] font-semibold text-[#183D2B] dark:text-[#B8DF38] cursor-pointer list-none rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#183D2B] dark:focus-visible:outline-[#B8DF38]">
                <span>Ini proyeksi, bukan tabungan otomatis</span>
                <span class="inline-flex items-center gap-1 shrink-0">Dasar hitung <ChevronDown class="w-3.5 h-3.5 transition-transform group-open:rotate-180" aria-hidden="true" /></span>
              </summary>
              <div class="mt-3 space-y-2 text-[11px] leading-relaxed text-stone-600 dark:text-[#98A79D]">
                <p>Sudah terkumpul: <strong class="text-[#18221B] dark:text-[#F0F4F1]">{{ formatRupiah(goal.currentBalance) }}</strong>. Angka ini berasal dari uang yang benar-benar disisihkan.</p>
                <p>Rencana dari pembagian anggaran: <strong class="text-[#18221B] dark:text-[#F0F4F1]">{{ formatRupiah(getForecast(goal.id)!.estimatedMonthlySavings) }}/bulan</strong>. Ini bukan setoran otomatis.</p>
                <p v-if="getForecast(goal.id)!.isUnachievable && getForecast(goal.id)!.topUpSuggestion">Dengan rencana saat ini, kenaikan harga dapat lebih cepat daripada tabungan. Perkiraan tambahan yang diperlukan: {{ formatRupiah(getForecast(goal.id)!.topUpSuggestion!.extraMonthlySavings) }}/bulan.</p>
                <p v-else-if="getForecast(goal.id)!.hasUserTargetMonths && getForecast(goal.id)!.topUpSuggestion && BigInt(getForecast(goal.id)!.topUpSuggestion!.extraMonthlySavings || '0') > 0n">Agar mencapai target dalam {{ getForecast(goal.id)!.targetMonths }} bulan, perkiraan tambahan dari rencana saat ini sekitar {{ formatRupiah(getForecast(goal.id)!.topUpSuggestion!.extraMonthlySavings) }}/bulan. <template v-if="getForecast(goal.id)!.estimatedMonthsWithCurrentSavings">Jika rutin menyisihkan sesuai rencana saat ini, perkiraan tercapai sekitar {{ getForecast(goal.id)!.estimatedMonthsWithCurrentSavings }} bulan.</template></p>
                <p v-else-if="getForecast(goal.id)!.topUpSuggestion && !getForecast(goal.id)!.hasUserTargetMonths">Tambahan {{ formatRupiah(getForecast(goal.id)!.topUpSuggestion!.extraMonthlySavings) }}/bulan diperkirakan mempercepat target {{ getForecast(goal.id)!.topUpSuggestion!.monthsSaved }} bulan ({{ getForecast(goal.id)!.topUpSuggestion!.newTargetDateFormatted }}).</p>
                <p>Pemasukan acuan: <strong class="text-[#18221B] dark:text-[#F0F4F1]">{{ formatRupiah(getForecast(goal.id)!.averageMonthlyIncome) }}/bulan</strong>. {{ incomeBasisDescription(getForecast(goal.id)!) }}</p>
                <p>Potensi untuk target ini: {{ formatRupiah(getForecast(goal.id)!.averageMonthlyIncome) }} × {{ formatRatio(getForecast(goal.id)!.savingsRatioBps) }} porsi tabungan × 40% porsi impian × {{ formatRatio(getForecast(goal.id)!.shareRatioBps) }} bagian target = <strong class="text-[#18221B] dark:text-[#F0F4F1]">{{ formatRupiah(getForecast(goal.id)!.estimatedMonthlySavings) }}/bulan</strong>.</p>
                <p v-if="goal.referenceDate">Harga acuan dicatat pada {{ formatDate(goal.referenceDate) }}.</p>
                <p v-if="BigInt(getForecast(goal.id)!.targetPrice || '0') > 0n">Harga acuan {{ formatRupiah(getForecast(goal.id)!.targetPrice) }} diasumsikan naik {{ formatRatio(getForecast(goal.id)!.inflationRateBps) }} per tahun.</p>
                <p v-else>Harga target belum diisi, sehingga perkiraan waktu tercapai belum dapat dihitung.</p>
                <p v-if="getForecast(goal.id)!.targetMonths !== null && BigInt(getForecast(goal.id)!.projectedPrice || '0') > 0n">Perkiraan harga pada waktu proyeksi: {{ formatRupiah(getForecast(goal.id)!.projectedPrice) }}.</p>
                <p>Proyeksi menganggap jumlah yang disisihkan setiap bulan dan laju kenaikan harga tetap sesuai asumsi. Hasil bisa berubah. Untuk menambah jumlah yang terkumpul, pilih “Sisihkan ke Tabungan” di Ringkasan; uang tidak tersisih otomatis.</p>
              </div>
            </details>

            <!-- Action buttons inside card -->
            <div class="pt-3 border-t border-stone-100 dark:border-[#243329] flex items-center justify-between text-xs">
              <div class="flex items-center gap-1.5 flex-wrap">
                <button
                  v-if="isGoalFunded(goal)"
                  type="button"
                  @click="emit('openCompleteModal', goal)"
                  class="tactile-btn px-2.5 py-1.5 rounded-lg text-[#183D2B] dark:text-[#0E1410] bg-[#B8DF38] hover:bg-[#a6cd2b] font-bold inline-flex items-center gap-1 cursor-pointer active:scale-[0.98] transition"
                  title="Wujudkan impian ini"
                >
                  <ShoppingBag class="w-3.5 h-3.5" />
                  <span>Wujudkan</span>
                </button>

                <button
                  v-if="!getForecast(goal.id)?.topUpSuggestion || isGoalFunded(goal)"
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
                <span>Tarik Dana</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Seksi Target Selesai / Terwujud (UX-13) -->
        <details
          v-if="completedPurchaseGoals.length > 0"
          class="group border border-stone-200/80 dark:border-[#243329] rounded-2xl p-4 bg-stone-50/50 dark:bg-[#0E1410]/50 transition-colors"
        >
          <summary class="flex items-center justify-between cursor-pointer list-none select-none">
            <div class="flex items-center gap-2">
              <CheckCircle2 class="w-4 h-4 text-emerald-600 dark:text-[#B8DF38]" />
              <span class="text-xs font-bold text-[#18221B] dark:text-[#F0F4F1]">
                Target Impian yang Sudah Terwujud ({{ completedPurchaseGoals.length }})
              </span>
            </div>
            <span class="text-xs text-stone-500 dark:text-[#98A79D] inline-flex items-center gap-1">
              Lihat Riwayat <ChevronDown class="w-4 h-4 transition-transform group-open:rotate-180" />
            </span>
          </summary>

          <div class="mt-3.5 space-y-3 pt-3 border-t border-stone-200/60 dark:border-[#243329]">
            <div
              v-for="goal in completedPurchaseGoals"
              :key="goal.id"
              class="p-4 rounded-xl border border-stone-200/80 dark:border-[#243329] bg-white dark:bg-[#16201A] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div>
                <div class="flex items-center gap-2">
                  <h4 class="text-sm font-bold text-[#18221B] dark:text-[#F0F4F1]">{{ goal.name }}</h4>
                  <span class="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-[#B8DF38]">
                    Selesai
                  </span>
                </div>
                <p class="text-[11px] text-stone-500 dark:text-[#98A79D] mt-0.5">
                  Target: {{ formatRupiah(getGoalTargetPrice(goal)) }} • Terwujud pada {{ goal.completedAt ? formatDate(goal.completedAt) : 'Sebelumnya' }}
                </p>
              </div>

              <div class="flex items-center gap-2 self-end sm:self-auto">
                <button
                  type="button"
                  @click="emit('reopenGoal', goal)"
                  class="tactile-btn px-3 py-1.5 text-xs font-semibold text-stone-600 dark:text-[#98A79D] hover:text-[#183D2B] dark:hover:text-[#B8DF38] bg-stone-100 dark:bg-[#0E1410] hover:bg-stone-200 dark:hover:bg-[#243329] rounded-lg cursor-pointer transition"
                  title="Buka kembali target ini jika salah menandai selesai"
                >
                  Buka Kembali
                </button>
              </div>
            </div>
          </div>
        </details>

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
            Pindahkan / Tarik
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
