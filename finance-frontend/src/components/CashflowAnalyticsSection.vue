<script setup lang="ts">
import { computed } from 'vue';
import { formatRupiah } from '../utils/format';
import type { MonthlyAnalyticsData } from '../api/services';
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
        backgroundColor: '#183D2B',
        hoverBackgroundColor: '#24553D',
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

const barChartOptions = {
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
        color: '#18221B',
      },
    },
    tooltip: {
      backgroundColor: '#18221B',
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
        color: '#5E6961',
      },
    },
    y: {
      border: { display: false },
      grid: {
        color: 'rgba(24, 34, 27, 0.06)',
      },
      ticks: {
        font: { family: 'Plus Jakarta Sans', size: 10, weight: 500 },
        color: '#5E6961',
        callback: (val: any) => {
          if (val >= 1000000000) return (val / 1000000000).toFixed(1) + 'M';
          if (val >= 1000000) return (val / 1000000).toFixed(0) + 'jt';
          if (val >= 1000) return (val / 1000).toFixed(0) + 'rb';
          return val;
        },
      },
    },
  },
};

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
        borderColor: '#FFFFFF',
        hoverOffset: 4,
      },
    ],
  };
});

const doughnutChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '72%',
  animation: {
    duration: 600,
  },
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: '#18221B',
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
};

// Budget vs Actual helper
const budgetVsActual = computed(() => props.analytics?.budgetVsActual);
</script>

<template>
  <section class="space-y-5" aria-labelledby="analytics-section-title">
    <!-- Header Section -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1">
      <div class="flex items-center gap-2.5">
        <div class="w-10 h-10 rounded-2xl bg-[#183D2B] text-[#B8DF38] flex items-center justify-center shadow-xs">
          <TrendingUp class="w-5 h-5" :stroke-width="2" />
        </div>
        <div>
          <h2 id="analytics-section-title" class="text-base sm:text-lg font-bold text-[#18221B] leading-tight">
            Analitik & Tren Arus Kas
          </h2>
          <p class="text-xs text-stone-500 font-medium">
            Visualisasi perbandingan pendapatan, pengeluaran, dan rasio anggaran {{ periodLabel }}
          </p>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#183D2B]/10 text-[#183D2B] border border-[#183D2B]/15">
          <Sparkles class="w-3 h-3 text-[#183D2B]" />
          <span>Periode {{ periodLabel }}</span>
        </span>
      </div>
    </div>

    <!-- 3 Kartu Realisasi Anggaran 50/30/20 -->
    <div v-if="budgetVsActual" class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <!-- 1. Kebutuhan (Needs) -->
      <div class="fintech-card p-4 rounded-2xl bg-white border border-stone-200/90 shadow-xs space-y-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-xl bg-blue-50 text-blue-800 flex items-center justify-center">
              <ShieldCheck class="w-4 h-4" />
            </div>
            <div>
              <span class="text-xs font-bold text-[#18221B] block">Kebutuhan (Need)</span>
              <span class="text-[10px] text-stone-500 font-medium">Alokasi Standar 50%</span>
            </div>
          </div>
          <span
            class="text-xs font-black tabular-nums px-2 py-0.5 rounded-full"
            :class="[
              budgetVsActual.needs.variancePercent > 100
                ? 'bg-rose-100 text-rose-800'
                : budgetVsActual.needs.variancePercent > 80
                ? 'bg-amber-100 text-amber-800'
                : 'bg-emerald-100 text-emerald-800'
            ]"
          >
            {{ budgetVsActual.needs.variancePercent }}%
          </span>
        </div>

        <div class="space-y-1">
          <div class="flex items-baseline justify-between text-xs">
            <span class="text-stone-500 font-medium">Realisasi / Anggaran:</span>
            <span class="font-extrabold text-[#18221B] tabular-nums">
              {{ formatRupiah(budgetVsActual.needs.actual) }}
              <span class="text-stone-400 font-normal">/ {{ formatRupiah(budgetVsActual.needs.budget) }}</span>
            </span>
          </div>

          <!-- Progress Bar -->
          <div class="h-2 w-full bg-stone-100 rounded-full overflow-hidden">
            <div
              class="h-full rounded-full transition-all duration-500"
              :class="[
                budgetVsActual.needs.variancePercent > 100
                  ? 'bg-rose-600'
                  : budgetVsActual.needs.variancePercent > 80
                  ? 'bg-amber-500'
                  : 'bg-blue-600'
              ]"
              :style="{ width: `${Math.min(budgetVsActual.needs.variancePercent, 100)}%` }"
            ></div>
          </div>
        </div>

        <p class="text-[11px] text-stone-500 font-medium leading-tight">
          <template v-if="budgetVsActual.needs.variancePercent > 100">
            Terlewati sebesar <span class="text-rose-700 font-bold tabular-nums">{{ formatRupiah(BigInt(budgetVsActual.needs.actual) - BigInt(budgetVsActual.needs.budget)) }}</span> dari batas alokasi.
          </template>
          <template v-else-if="Number(budgetVsActual.needs.budget) === 0">
            Belum ada batas kebutuhan tercatat bulan ini.
          </template>
          <template v-else>
            Tersisa aman <span class="text-emerald-800 font-bold tabular-nums">{{ formatRupiah(BigInt(budgetVsActual.needs.budget) - BigInt(budgetVsActual.needs.actual)) }}</span> di batas pos kebutuhan.
          </template>
        </p>
      </div>

      <!-- 2. Keinginan (Wants) -->
      <div class="fintech-card p-4 rounded-2xl bg-white border border-stone-200/90 shadow-xs space-y-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center">
              <ShoppingBag class="w-4 h-4" />
            </div>
            <div>
              <span class="text-xs font-bold text-[#18221B] block">Keinginan (Want)</span>
              <span class="text-[10px] text-stone-500 font-medium">Alokasi Standar 30%</span>
            </div>
          </div>
          <span
            class="text-xs font-black tabular-nums px-2 py-0.5 rounded-full"
            :class="[
              budgetVsActual.wants.variancePercent > 100
                ? 'bg-rose-100 text-rose-800'
                : budgetVsActual.wants.variancePercent > 80
                ? 'bg-amber-100 text-amber-800'
                : 'bg-emerald-100 text-emerald-800'
            ]"
          >
            {{ budgetVsActual.wants.variancePercent }}%
          </span>
        </div>

        <div class="space-y-1">
          <div class="flex items-baseline justify-between text-xs">
            <span class="text-stone-500 font-medium">Realisasi / Anggaran:</span>
            <span class="font-extrabold text-[#18221B] tabular-nums">
              {{ formatRupiah(budgetVsActual.wants.actual) }}
              <span class="text-stone-400 font-normal">/ {{ formatRupiah(budgetVsActual.wants.budget) }}</span>
            </span>
          </div>

          <!-- Progress Bar -->
          <div class="h-2 w-full bg-stone-100 rounded-full overflow-hidden">
            <div
              class="h-full rounded-full transition-all duration-500"
              :class="[
                budgetVsActual.wants.variancePercent > 100
                  ? 'bg-rose-600'
                  : budgetVsActual.wants.variancePercent > 80
                  ? 'bg-amber-500'
                  : 'bg-amber-600'
              ]"
              :style="{ width: `${Math.min(budgetVsActual.wants.variancePercent, 100)}%` }"
            ></div>
          </div>
        </div>

        <p class="text-[11px] text-stone-500 font-medium leading-tight">
          <template v-if="budgetVsActual.wants.variancePercent > 100">
            Terlewati sebesar <span class="text-rose-700 font-bold tabular-nums">{{ formatRupiah(BigInt(budgetVsActual.wants.actual) - BigInt(budgetVsActual.wants.budget)) }}</span>.
          </template>
          <template v-else-if="Number(budgetVsActual.wants.budget) === 0">
            Belum ada batas keinginan tercatat bulan ini.
          </template>
          <template v-else>
            Tersisa aman <span class="text-emerald-800 font-bold tabular-nums">{{ formatRupiah(BigInt(budgetVsActual.wants.budget) - BigInt(budgetVsActual.wants.actual)) }}</span> untuk belanja santai.
          </template>
        </p>
      </div>

      <!-- 3. Tabungan (Savings) -->
      <div class="fintech-card p-4 rounded-2xl bg-white border border-stone-200/90 shadow-xs space-y-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-xl bg-emerald-50 text-[#183D2B] flex items-center justify-center">
              <Sparkles class="w-4 h-4 text-[#183D2B]" />
            </div>
            <div>
              <span class="text-xs font-bold text-[#18221B] block">Tabungan & Investasi</span>
              <span class="text-[10px] text-stone-500 font-medium">Target Standar 20%</span>
            </div>
          </div>
          <span
            class="text-xs font-black tabular-nums px-2 py-0.5 rounded-full"
            :class="[
              budgetVsActual.savings.achievementPercent >= 100
                ? 'bg-emerald-100 text-[#183D2B]'
                : budgetVsActual.savings.achievementPercent >= 50
                ? 'bg-blue-100 text-blue-900'
                : 'bg-stone-100 text-stone-700'
            ]"
          >
            {{ budgetVsActual.savings.achievementPercent }}%
          </span>
        </div>

        <div class="space-y-1">
          <div class="flex items-baseline justify-between text-xs">
            <span class="text-stone-500 font-medium">Tersisih / Target:</span>
            <span class="font-extrabold text-[#18221B] tabular-nums">
              {{ formatRupiah(budgetVsActual.savings.allocated) }}
              <span class="text-stone-400 font-normal">/ {{ formatRupiah(budgetVsActual.savings.target) }}</span>
            </span>
          </div>

          <!-- Progress Bar -->
          <div class="h-2 w-full bg-stone-100 rounded-full overflow-hidden">
            <div
              class="h-full rounded-full transition-all duration-500 bg-[#183D2B]"
              :style="{ width: `${Math.min(budgetVsActual.savings.achievementPercent, 100)}%` }"
            ></div>
          </div>
        </div>

        <p class="text-[11px] text-stone-500 font-medium leading-tight">
          <template v-if="budgetVsActual.savings.achievementPercent >= 100">
            Target tabungan periode ini <strong class="text-[#183D2B]">telah tercapai penuh</strong>.
          </template>
          <template v-else-if="Number(budgetVsActual.savings.target) === 0">
            Belum ada target tabungan dari pemasukan bulan ini.
          </template>
          <template v-else>
            Perlu disisihkan <span class="text-[#183D2B] font-bold tabular-nums">{{ formatRupiah(BigInt(budgetVsActual.savings.target) - BigInt(budgetVsActual.savings.allocated)) }}</span> lagi untuk memenuhi komitmen.
          </template>
        </p>
      </div>
    </div>

    <!-- Dua Kolom Chart Utama: Tren 6 Bulan (Kiri) & Donut Distribusi (Kanan) -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <!-- Kolom Kiri: Tren Arus Kas 6 Bulan Terakhir (lg:col-span-7) -->
      <div class="lg:col-span-7 fintech-card p-5 sm:p-6 rounded-2xl bg-white border border-stone-200/90 shadow-xs flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded-xl bg-stone-100 text-stone-700 flex items-center justify-center">
                <TrendingUp class="w-4 h-4" />
              </div>
              <div>
                <h3 class="text-sm font-bold text-[#18221B]">Tren Arus Kas (6 Bulan Terakhir)</h3>
                <span class="text-[11px] text-stone-500 font-medium">Perbandingan nominal Pemasukan vs Pengeluaran</span>
              </div>
            </div>

            <div class="hidden sm:flex items-center gap-3 text-xs font-semibold">
              <span class="inline-flex items-center gap-1.5 text-[#183D2B]">
                <span class="w-2.5 h-2.5 rounded-full bg-[#183D2B]"></span>
                Pemasukan
              </span>
              <span class="inline-flex items-center gap-1.5 text-rose-700">
                <span class="w-2.5 h-2.5 rounded-full bg-rose-600"></span>
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
              class="h-full flex flex-col items-center justify-center text-center p-6 text-stone-400"
            >
              <TrendingUp class="w-8 h-8 mb-2 stroke-1" />
              <p class="text-xs font-medium">Data tren belum tersedia</p>
            </div>
          </div>
        </div>

        <div class="pt-3 border-t border-stone-100 mt-4 flex items-center justify-between text-[11px] text-stone-500">
          <span>*Data diagregasi dari transaksi aktif per bulan kalender</span>
          <span class="font-semibold text-stone-700">Skala otomatis (IDR)</span>
        </div>
      </div>

      <!-- Kolom Kanan: Distribusi Pengeluaran per Kategori (lg:col-span-5) -->
      <div class="lg:col-span-5 fintech-card p-5 sm:p-6 rounded-2xl bg-white border border-stone-200/90 shadow-xs flex flex-col">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-xl bg-purple-50 text-purple-800 flex items-center justify-center">
              <PieChart class="w-4 h-4" />
            </div>
            <div>
              <h3 class="text-sm font-bold text-[#18221B]">Distribusi Pengeluaran</h3>
              <span class="text-[11px] text-stone-500 font-medium">Berdasarkan kategori di {{ periodLabel }}</span>
            </div>
          </div>

          <span class="text-xs font-extrabold text-[#18221B] tabular-nums bg-stone-100 px-2.5 py-1 rounded-full">
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
              <span class="text-[10px] text-stone-400 font-medium uppercase tracking-wider">Total</span>
              <span class="text-xs font-black text-[#18221B] tabular-nums max-w-[90px] truncate text-center">
                {{ formatRupiah(totalCategoryExpense) }}
              </span>
            </div>
          </div>

          <!-- Legenda Kategori Rinci -->
          <div class="space-y-2 max-h-48 overflow-y-auto pr-1">
            <div
              v-for="cat in props.analytics?.categoryDistribution"
              :key="cat.categoryId"
              class="flex items-center justify-between p-2 rounded-xl bg-stone-50/70 hover:bg-stone-100/70 border border-stone-200/70 transition text-xs"
            >
              <div class="flex items-center gap-2 min-w-0">
                <span
                  class="w-3 h-3 rounded-md shrink-0"
                  :style="{ backgroundColor: cat.color }"
                ></span>
                <span class="font-semibold text-[#18221B] truncate">{{ cat.categoryName }}</span>
                <span
                  class="text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider shrink-0"
                  :class="cat.group === 'NEED' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'"
                >
                  {{ cat.group === 'NEED' ? 'Need' : 'Want' }}
                </span>
              </div>

              <div class="text-right shrink-0 ml-2">
                <span class="font-extrabold text-[#18221B] tabular-nums block">{{ formatRupiah(cat.totalAmount) }}</span>
                <span class="text-[10px] text-stone-500 font-medium tabular-nums">{{ cat.percentage }}%</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State ketika belum ada pengeluaran -->
        <div
          v-else
          class="flex-1 min-h-[220px] flex flex-col items-center justify-center text-center p-6 bg-stone-50/60 rounded-xl border border-dashed border-stone-200"
        >
          <div class="w-12 h-12 rounded-2xl bg-stone-100 text-stone-400 flex items-center justify-center mb-2.5">
            <PieChart class="w-6 h-6 stroke-1" />
          </div>
          <h4 class="text-xs font-bold text-[#18221B] mb-1">Belum Ada Pengeluaran</h4>
          <p class="text-[11px] text-stone-500 max-w-xs leading-relaxed font-normal">
            Catat transaksi pengeluaran pada bulan {{ periodLabel }} untuk melihat grafik komposisi pos kebutuhan vs keinginan.
          </p>
        </div>
      </div>
    </div>
  </section>
</template>
