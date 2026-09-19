<script setup lang="ts">
import { computed } from 'vue';
import { formatRupiah } from '../utils/format';
import type { MonthlyAnalyticsData } from '../api/services';
import { useTheme } from '../composables/useTheme';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Filler,
} from 'chart.js';
import { Bar, Doughnut } from 'vue-chartjs';
import {
  TrendingUp,
  PieChart,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
} from 'lucide-vue-next';

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Filler,
);

const props = defineProps<{
  analytics: MonthlyAnalyticsData | null;
  loading?: boolean;
  currentMonth: number;
  currentYear: number;
}>();

const { isDark } = useTheme();

const monthNames = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

const periodLabel = computed(() => {
  return `${monthNames[props.currentMonth - 1] || ''} ${props.currentYear}`;
});

// Bar Chart (Tren 6 Bulan)
const barChartData = computed(() => {
  const trend = props.analytics?.incomeVsExpenseTrend;
  if (!trend) {
    return { labels: [], datasets: [] };
  }

  return {
    labels: trend.months,
    datasets: [
      {
        label: 'Pemasukan',
        data: trend.incomeData.map(v => Number(v)),
        backgroundColor: isDark.value ? '#22C55E' : '#183D2B',
        hoverBackgroundColor: isDark.value ? '#16A34A' : '#24553D',
        borderRadius: 6,
        barPercentage: 0.7,
        categoryPercentage: 0.8,
      },
      {
        label: 'Pengeluaran',
        data: trend.expenseData.map(v => Number(v)),
        backgroundColor: '#E11D48',
        hoverBackgroundColor: '#BE123C',
        borderRadius: 6,
        barPercentage: 0.7,
        categoryPercentage: 0.8,
      },
    ],
  };
});

const barChartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  animation: {
    duration: 600,
  },
  plugins: {
    legend: {
      position: 'top' as const,
      align: 'end' as const,
      labels: {
        usePointStyle: true,
        pointStyle: 'circle',
        boxWidth: 6,
        boxHeight: 6,
        padding: 14,
        font: { family: 'Plus Jakarta Sans', size: 11, weight: 600 },
        color: isDark.value ? '#F0F4F1' : '#18221B',
      },
    },
    tooltip: {
      backgroundColor: isDark.value ? '#16201A' : '#18221B',
      borderColor: isDark.value ? '#243329' : 'transparent',
      borderWidth: 1,
      titleColor: '#FFFFFF',
      bodyColor: '#F3F5EF',
      padding: 10,
      cornerRadius: 10,
      titleFont: { family: 'Plus Jakarta Sans', size: 12, weight: 700 },
      bodyFont: { family: 'Plus Jakarta Sans', size: 11, weight: 500 },
      displayColors: true,
      boxPadding: 4,
      callbacks: {
        label: (context: any) => {
          const label = context.dataset.label || '';
          const value = formatRupiah(context.raw);
          return ` ${label}: ${value}`;
        },
      },
    },
  },
  scales: {
    x: {
      grid: { display: false },
      border: { display: false },
      ticks: {
        font: { family: 'Plus Jakarta Sans', size: 11, weight: 600 },
        color: isDark.value ? '#98A79D' : '#5E6961',
      },
    },
    y: {
      border: { display: false },
      grid: {
        color: isDark.value ? 'rgba(255, 255, 255, 0.08)' : 'rgba(24, 34, 27, 0.06)',
      },
      ticks: {
        font: { family: 'Plus Jakarta Sans', size: 10, weight: 500 },
        color: isDark.value ? '#98A79D' : '#5E6961',
        callback: (val: any) => {
          if (val >= 1000000000) return (val / 1000000000).toFixed(1) + 'M';
          if (val >= 1000000) return (val / 1000000).toFixed(0) + 'jt';
          if (val >= 1000) return (val / 1000).toFixed(0) + 'rb';
          return val;
        },
      },
    },
  },
}));

// Doughnut Chart (Distribusi Pengeluaran)
const hasExpenseCategories = computed(() => {
  return (
    props.analytics?.categoryDistribution &&
    props.analytics.categoryDistribution.length > 0
  );
});

const totalCategoryExpense = computed(() => {
  if (!props.analytics?.categoryDistribution) return '0';
  const sum = props.analytics.categoryDistribution.reduce(
    (acc, c) => acc + BigInt(c.totalAmount),
    BigInt(0),
  );
  return sum.toString();
});

const doughnutChartData = computed(() => {
  const cats = props.analytics?.categoryDistribution || [];
  return {
    labels: cats.map(c => c.categoryName),
    datasets: [
      {
        data: cats.map(c => Number(c.totalAmount)),
        backgroundColor: cats.map(c => c.color),
        borderWidth: 2,
        borderColor: isDark.value ? '#16201A' : '#FFFFFF',
        hoverOffset: 4,
      },
    ],
  };
});

const doughnutChartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  cutout: '72%',
  animation: {
    duration: 600,
  },
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: isDark.value ? '#16201A' : '#18221B',
      borderColor: isDark.value ? '#243329' : 'transparent',
      borderWidth: 1,
      titleColor: '#FFFFFF',
      bodyColor: '#F3F5EF',
      padding: 10,
      cornerRadius: 10,
      titleFont: { family: 'Plus Jakarta Sans', size: 12, weight: 700 },
      bodyFont: { family: 'Plus Jakarta Sans', size: 11, weight: 500 },
      displayColors: true,
      boxPadding: 4,
      callbacks: {
        label: (context: any) => {
          const label = context.label || '';
          const value = formatRupiah(context.raw);
          const cat = props.analytics?.categoryDistribution[context.dataIndex];
          const pct = cat ? ` (${cat.percentage}%)` : '';
          return ` ${label}: ${value}${pct}`;
        },
      },
    },
  },
}));

// Budget vs Actual helper
const budgetVsActual = computed(() => props.analytics?.budgetVsActual);
</script>

<template>
  <section class="space-y-5" aria-labelledby="analytics-section-title">
    <!-- Header Section -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1">
      <div class="flex items-center gap-2.5">
        <div class="w-10 h-10 rounded-2xl bg-[#183D2B] dark:bg-[#132E21] text-[#B8DF38] flex items-center justify-center shadow-xs border border-emerald-900/40">
          <TrendingUp class="w-5 h-5" :stroke-width="2" />
        </div>
        <div>
          <h2 id="analytics-section-title" class="text-base sm:text-lg font-bold text-[#18221B] dark:text-[#F0F4F1] leading-tight">
            Analitik & Tren Arus Kas
          </h2>
          <p class="text-xs text-stone-500 dark:text-[#98A79D] font-medium">
            Visualisasi perbandingan pendapatan, pengeluaran, dan rasio anggaran {{ periodLabel }}
          </p>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#183D2B]/10 dark:bg-[#B8DF38]/15 text-[#183D2B] dark:text-[#B8DF38] border border-[#183D2B]/15 dark:border-[#B8DF38]/20">
          <Sparkles class="w-3 h-3 text-[#183D2B] dark:text-[#B8DF38]" />
          <span>Periode {{ periodLabel }}</span>
        </span>
      </div>
    </div>

    <!-- 3 Kartu Realisasi Anggaran 50/30/20 -->
    <div v-if="budgetVsActual" class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <!-- 1. Kebutuhan (Needs) -->
      <div class="fintech-card p-4 rounded-2xl bg-white dark:bg-[#16201A] border border-stone-200/90 dark:border-[#243329] shadow-xs space-y-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 flex items-center justify-center">
              <ShieldCheck class="w-4 h-4" />
            </div>
            <div>
              <span class="text-xs font-bold text-[#18221B] dark:text-[#F0F4F1] block">Kebutuhan (Need)</span>
              <span class="text-[10px] text-stone-500 dark:text-[#98A79D] font-medium">Alokasi Standar 50%</span>
            </div>
          </div>
          <span
            class="text-xs font-black tabular-nums px-2 py-0.5 rounded-full"
            :class="[
              budgetVsActual.needs.variancePercent > 100
                ? 'bg-rose-100 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300'
                : budgetVsActual.needs.variancePercent > 80
                ? 'bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300'
                : 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300'
            ]"
          >
            {{ budgetVsActual.needs.variancePercent }}%
          </span>
        </div>

        <div class="space-y-1">
          <div class="flex items-baseline justify-between text-xs">
            <span class="text-stone-500 dark:text-[#98A79D] font-medium">Realisasi / Anggaran:</span>
            <span class="font-extrabold text-[#18221B] dark:text-[#F0F4F1] tabular-nums">
              {{ formatRupiah(budgetVsActual.needs.actual) }}
              <span class="text-stone-400 dark:text-[#98A79D] font-normal">/ {{ formatRupiah(budgetVsActual.needs.budget) }}</span>
            </span>
          </div>

          <!-- Progress Bar -->
          <div class="h-2 w-full bg-stone-100 dark:bg-[#0E1410] rounded-full overflow-hidden">
            <div
              class="h-full rounded-full transition-all duration-500"
              :class="[
                budgetVsActual.needs.variancePercent > 100
                  ? 'bg-rose-600'
                  : budgetVsActual.needs.variancePercent > 80
                  ? 'bg-amber-500'
                  : 'bg-blue-600 dark:bg-blue-500'
              ]"
              :style="{ width: `${Math.min(budgetVsActual.needs.variancePercent, 100)}%` }"
            ></div>
          </div>
        </div>

        <p class="text-[11px] text-stone-500 dark:text-[#98A79D] font-medium leading-tight">
          <template v-if="budgetVsActual.needs.variancePercent > 100">
            Terlewati sebesar <span class="text-rose-700 dark:text-rose-400 font-bold tabular-nums">{{ formatRupiah(BigInt(budgetVsActual.needs.actual) - BigInt(budgetVsActual.needs.budget)) }}</span> dari batas alokasi.
          </template>
          <template v-else-if="Number(budgetVsActual.needs.budget) === 0">
            Belum ada batas kebutuhan tercatat bulan ini.
          </template>
          <template v-else>
            Tersisa aman <span class="text-emerald-800 dark:text-[#B8DF38] font-bold tabular-nums">{{ formatRupiah(BigInt(budgetVsActual.needs.budget) - BigInt(budgetVsActual.needs.actual)) }}</span> di batas pos kebutuhan.
          </template>
        </p>
      </div>

      <!-- 2. Keinginan (Wants) -->
      <div class="fintech-card p-4 rounded-2xl bg-white dark:bg-[#16201A] border border-stone-200/90 dark:border-[#243329] shadow-xs space-y-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 flex items-center justify-center">
              <ShoppingBag class="w-4 h-4" />
            </div>
            <div>
              <span class="text-xs font-bold text-[#18221B] dark:text-[#F0F4F1] block">Keinginan (Want)</span>
              <span class="text-[10px] text-stone-500 dark:text-[#98A79D] font-medium">Alokasi Standar 30%</span>
            </div>
          </div>
          <span
            class="text-xs font-black tabular-nums px-2 py-0.5 rounded-full"
            :class="[
              budgetVsActual.wants.variancePercent > 100
                ? 'bg-rose-100 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300'
                : budgetVsActual.wants.variancePercent > 80
                ? 'bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300'
                : 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300'
            ]"
          >
            {{ budgetVsActual.wants.variancePercent }}%
          </span>
        </div>

        <div class="space-y-1">
          <div class="flex items-baseline justify-between text-xs">
            <span class="text-stone-500 dark:text-[#98A79D] font-medium">Realisasi / Anggaran:</span>
            <span class="font-extrabold text-[#18221B] dark:text-[#F0F4F1] tabular-nums">
              {{ formatRupiah(budgetVsActual.wants.actual) }}
              <span class="text-stone-400 dark:text-[#98A79D] font-normal">/ {{ formatRupiah(budgetVsActual.wants.budget) }}</span>
            </span>
          </div>

          <!-- Progress Bar -->
          <div class="h-2 w-full bg-stone-100 dark:bg-[#0E1410] rounded-full overflow-hidden">
            <div
              class="h-full rounded-full transition-all duration-500"
              :class="[
                budgetVsActual.wants.variancePercent > 100
                  ? 'bg-rose-600'
                  : budgetVsActual.wants.variancePercent > 80
                  ? 'bg-amber-500'
                  : 'bg-amber-600 dark:bg-amber-500'
              ]"
              :style="{ width: `${Math.min(budgetVsActual.wants.variancePercent, 100)}%` }"
            ></div>
          </div>
        </div>

        <p class="text-[11px] text-stone-500 dark:text-[#98A79D] font-medium leading-tight">
          <template v-if="budgetVsActual.wants.variancePercent > 100">
            Terlewati sebesar <span class="text-rose-700 dark:text-rose-400 font-bold tabular-nums">{{ formatRupiah(BigInt(budgetVsActual.wants.actual) - BigInt(budgetVsActual.wants.budget)) }}</span>.
          </template>
          <template v-else-if="Number(budgetVsActual.wants.budget) === 0">
            Belum ada batas keinginan tercatat bulan ini.
          </template>
          <template v-else>
            Tersisa aman <span class="text-emerald-800 dark:text-[#B8DF38] font-bold tabular-nums">{{ formatRupiah(BigInt(budgetVsActual.wants.budget) - BigInt(budgetVsActual.wants.actual)) }}</span> untuk belanja santai.
          </template>
        </p>
      </div>

      <!-- 3. Tabungan (Savings) -->
      <div class="fintech-card p-4 rounded-2xl bg-white dark:bg-[#16201A] border border-stone-200/90 dark:border-[#243329] shadow-xs space-y-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-[#183D2B] dark:text-[#B8DF38] flex items-center justify-center">
              <Sparkles class="w-4 h-4 text-[#183D2B] dark:text-[#B8DF38]" />
            </div>
            <div>
              <span class="text-xs font-bold text-[#18221B] dark:text-[#F0F4F1] block">Tabungan & Investasi</span>
              <span class="text-[10px] text-stone-500 dark:text-[#98A79D] font-medium">Target Standar 20%</span>
            </div>
          </div>
          <span
            class="text-xs font-black tabular-nums px-2 py-0.5 rounded-full"
            :class="[
              budgetVsActual.savings.achievementPercent >= 100
                ? 'bg-emerald-100 dark:bg-emerald-950/50 text-[#183D2B] dark:text-[#B8DF38]'
                : budgetVsActual.savings.achievementPercent >= 50
                ? 'bg-blue-100 dark:bg-blue-950/50 text-blue-900 dark:text-blue-300'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
            ]"
          >
            {{ budgetVsActual.savings.achievementPercent }}%
          </span>
        </div>

        <div class="space-y-1">
          <div class="flex items-baseline justify-between text-xs">
            <span class="text-stone-500 dark:text-[#98A79D] font-medium">Tersisih / Target:</span>
            <span class="font-extrabold text-[#18221B] dark:text-[#F0F4F1] tabular-nums">
              {{ formatRupiah(budgetVsActual.savings.allocated) }}
              <span class="text-stone-400 dark:text-[#98A79D] font-normal">/ {{ formatRupiah(budgetVsActual.savings.target) }}</span>
            </span>
          </div>

          <!-- Progress Bar -->
          <div class="h-2 w-full bg-stone-100 dark:bg-[#0E1410] rounded-full overflow-hidden">
            <div
              class="h-full rounded-full transition-all duration-500 bg-[#183D2B] dark:bg-[#B8DF38]"
              :style="{ width: `${Math.min(budgetVsActual.savings.achievementPercent, 100)}%` }"
            ></div>
          </div>
        </div>

        <p class="text-[11px] text-stone-500 dark:text-[#98A79D] font-medium leading-tight">
          <template v-if="budgetVsActual.savings.achievementPercent >= 100">
            Target tabungan periode ini <strong class="text-[#183D2B] dark:text-[#B8DF38]">telah tercapai penuh</strong>.
          </template>
          <template v-else-if="Number(budgetVsActual.savings.target) === 0">
            Belum ada target tabungan dari pemasukan bulan ini.
          </template>
          <template v-else>
            Perlu disisihkan <span class="text-[#183D2B] dark:text-[#B8DF38] font-bold tabular-nums">{{ formatRupiah(BigInt(budgetVsActual.savings.target) - BigInt(budgetVsActual.savings.allocated)) }}</span> lagi untuk memenuhi komitmen.
          </template>
        </p>
      </div>
    </div>

    <!-- Dua Kolom Chart Utama: Tren 6 Bulan (Kiri) & Donut Distribusi (Kanan) -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <!-- Kolom Kiri: Tren Arus Kas 6 Bulan Terakhir (lg:col-span-7) -->
      <div class="lg:col-span-7 fintech-card p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#16201A] border border-stone-200/90 dark:border-[#243329] shadow-xs flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded-xl bg-stone-100 dark:bg-[#0E1410] text-stone-700 dark:text-[#F0F4F1] flex items-center justify-center">
                <TrendingUp class="w-4 h-4" />
              </div>
              <div>
                <h3 class="text-sm font-bold text-[#18221B] dark:text-[#F0F4F1]">Tren Arus Kas (6 Bulan Terakhir)</h3>
                <span class="text-[11px] text-stone-500 dark:text-[#98A79D] font-medium">Perbandingan nominal Pemasukan vs Pengeluaran</span>
              </div>
            </div>

            <div class="hidden sm:flex items-center gap-3 text-xs font-semibold">
              <span class="inline-flex items-center gap-1.5 text-[#183D2B] dark:text-[#22C55E]">
                <span class="w-2.5 h-2.5 rounded-full bg-[#183D2B] dark:bg-[#22C55E]"></span>
                Pemasukan
              </span>
              <span class="inline-flex items-center gap-1.5 text-rose-700 dark:text-rose-400">
                <span class="w-2.5 h-2.5 rounded-full bg-rose-600 dark:bg-rose-500"></span>
                Pengeluaran
              </span>
            </div>
          </div>

          <!-- Canvas Bar Chart -->
          <div class="h-64 sm:h-72 w-full relative">
            <Bar
              v-if="props.analytics?.incomeVsExpenseTrend?.months?.length"
              :data="barChartData"
              :options="barChartOptions"
            />
            <div
              v-else
              class="h-full flex flex-col items-center justify-center text-center p-6 text-stone-400 dark:text-[#98A79D]"
            >
              <TrendingUp class="w-8 h-8 mb-2 stroke-1" />
              <p class="text-xs font-medium">Data tren belum tersedia</p>
            </div>
          </div>
        </div>

        <div class="pt-3 border-t border-stone-100 dark:border-[#243329] mt-4 flex items-center justify-between text-[11px] text-stone-500 dark:text-[#98A79D]">
          <span>*Data diagregasi dari transaksi aktif per bulan kalender</span>
          <span class="font-semibold text-stone-700 dark:text-[#F0F4F1]">Skala otomatis (IDR)</span>
        </div>
      </div>

      <!-- Kolom Kanan: Distribusi Pengeluaran per Kategori (lg:col-span-5) -->
      <div class="lg:col-span-5 fintech-card p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#16201A] border border-stone-200/90 dark:border-[#243329] shadow-xs flex flex-col">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-800 dark:text-purple-300 flex items-center justify-center">
              <PieChart class="w-4 h-4" />
            </div>
            <div>
              <h3 class="text-sm font-bold text-[#18221B] dark:text-[#F0F4F1]">Distribusi Pengeluaran</h3>
              <span class="text-[11px] text-stone-500 dark:text-[#98A79D] font-medium">Berdasarkan kategori di {{ periodLabel }}</span>
            </div>
          </div>

          <span class="text-xs font-extrabold text-[#18221B] dark:text-[#F0F4F1] tabular-nums bg-stone-100 dark:bg-[#0E1410] border border-stone-200/50 dark:border-[#243329] px-2.5 py-1 rounded-full">
            {{ formatRupiah(totalCategoryExpense) }}
          </span>
        </div>

        <!-- Donut Canvas & Category List -->
        <div v-if="hasExpenseCategories" class="flex-1 flex flex-col justify-between space-y-4">
          <!-- Donut Graphic -->
          <div class="h-44 sm:h-48 w-full relative flex items-center justify-center my-1">
            <Doughnut :data="doughnutChartData" :options="doughnutChartOptions" />
            <!-- Donut Center Label -->
            <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span class="text-[10px] text-stone-400 dark:text-[#98A79D] font-medium uppercase tracking-wider">Total</span>
              <span class="text-xs font-black text-[#18221B] dark:text-[#F0F4F1] tabular-nums max-w-[90px] truncate text-center">
                {{ formatRupiah(totalCategoryExpense) }}
              </span>
            </div>
          </div>

          <!-- Legenda Kategori Rinci -->
          <div class="space-y-2 max-h-48 overflow-y-auto pr-1">
            <div
              v-for="cat in props.analytics?.categoryDistribution"
              :key="cat.categoryId"
              class="flex items-center justify-between p-2 rounded-xl bg-stone-50/70 dark:bg-[#0E1410] hover:bg-stone-100/70 dark:hover:bg-[#243329]/50 border border-stone-200/70 dark:border-[#243329] transition text-xs"
            >
              <div class="flex items-center gap-2 min-w-0">
                <span
                  class="w-3 h-3 rounded-md shrink-0"
                  :style="{ backgroundColor: cat.color }"
                ></span>
                <span class="font-semibold text-[#18221B] dark:text-[#F0F4F1] truncate">{{ cat.categoryName }}</span>
                <span
                  class="text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider shrink-0"
                  :class="cat.group === 'NEED' ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300' : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'"
                >
                  {{ cat.group === 'NEED' ? 'Need' : 'Want' }}
                </span>
              </div>

              <div class="text-right shrink-0 ml-2">
                <span class="font-extrabold text-[#18221B] dark:text-[#F0F4F1] tabular-nums block">{{ formatRupiah(cat.totalAmount) }}</span>
                <span class="text-[10px] text-stone-500 dark:text-[#98A79D] font-medium tabular-nums">{{ cat.percentage }}%</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State ketika belum ada pengeluaran -->
        <div
          v-else
          class="flex-1 min-h-[220px] flex flex-col items-center justify-center text-center p-6 bg-stone-50/60 dark:bg-[#0E1410]/60 rounded-xl border border-dashed border-stone-200 dark:border-[#243329]"
        >
          <div class="w-12 h-12 rounded-2xl bg-stone-100 dark:bg-[#16201A] text-stone-400 dark:text-[#98A79D] flex items-center justify-center mb-2.5">
            <PieChart class="w-6 h-6 stroke-1" />
          </div>
          <h4 class="text-xs font-bold text-[#18221B] dark:text-[#F0F4F1] mb-1">Belum Ada Pengeluaran</h4>
          <p class="text-[11px] text-stone-500 dark:text-[#98A79D] max-w-xs leading-relaxed font-normal">
            Catat transaksi pengeluaran pada bulan {{ periodLabel }} untuk melihat grafik komposisi pos kebutuhan vs keinginan.
          </p>
        </div>
      </div>
    </div>
  </section>
</template>
