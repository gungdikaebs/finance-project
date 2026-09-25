<script setup lang="ts">
import { computed, ref } from 'vue';
import { Bar, Doughnut } from 'vue-chartjs';
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
} from 'chart.js';
import { PieChart, TrendingUp } from 'lucide-vue-next';
import type { MonthlyAnalyticsData } from '../api/services';
import { useTheme } from '../composables/useTheme';
import { formatRupiah } from '../utils/format';

ChartJS.register(ArcElement, BarElement, CategoryScale, Legend, LinearScale, Tooltip);

const props = defineProps<{
  analytics: MonthlyAnalyticsData | null;
  loading?: boolean;
  currentMonth: number;
  currentYear: number;
}>();

const { isDark } = useTheme();
const showAllCategories = ref(false);

const monthNames = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

const periodLabel = computed(() => `${monthNames[props.currentMonth - 1] || ''} ${props.currentYear}`);
const trend = computed(() => props.analytics?.incomeVsExpenseTrend);

const cashflowInsight = computed(() => {
  const data = trend.value;
  const index = data ? data.months.length - 1 : -1;
  if (!data || index < 0) return null;

  const income = BigInt(data.incomeData[index] || '0');
  const expense = BigInt(data.expenseData[index] || '0');
  const difference = income >= expense ? income - expense : expense - income;
  const month = data.months[index];

  if (difference === 0n) return `Pemasukan dan pengeluaran pada ${month} sama besar.`;
  return income > expense
    ? `Pemasukan pada ${month} lebih besar ${formatRupiah(difference)} daripada pengeluaran.`
    : `Pengeluaran pada ${month} lebih besar ${formatRupiah(difference)} daripada pemasukan.`;
});

const barChartData = computed(() => ({
  labels: trend.value?.months || [],
  datasets: [
    {
      label: 'Pemasukan',
      data: trend.value?.incomeData.map(Number) || [],
      backgroundColor: isDark.value ? '#22C55E' : '#183D2B',
      hoverBackgroundColor: isDark.value ? '#16A34A' : '#24553D',
      borderRadius: 6,
      barPercentage: 0.7,
      categoryPercentage: 0.8,
    },
    {
      label: 'Pengeluaran',
      data: trend.value?.expenseData.map(Number) || [],
      backgroundColor: '#E11D48',
      hoverBackgroundColor: '#BE123C',
      borderRadius: 6,
      barPercentage: 0.7,
      categoryPercentage: 0.8,
    },
  ],
}));

const barChartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
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
      titleColor: '#FFFFFF',
      bodyColor: '#F3F5EF',
      padding: 10,
      cornerRadius: 10,
      callbacks: {
        label: (context: any) => ` ${context.dataset.label}: ${formatRupiah(context.raw)}`,
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
      grid: { color: isDark.value ? 'rgba(255, 255, 255, 0.08)' : 'rgba(24, 34, 27, 0.06)' },
      ticks: {
        font: { family: 'Plus Jakarta Sans', size: 10, weight: 500 },
        color: isDark.value ? '#98A79D' : '#5E6961',
        callback: (value: any) => {
          if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)} M`;
          if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(0)} jt`;
          if (value >= 1_000) return `${(value / 1_000).toFixed(0)} rb`;
          return value;
        },
      },
    },
  },
}));

const categories = computed(() => props.analytics?.categoryDistribution || []);
const visibleCategories = computed(() =>
  showAllCategories.value ? categories.value : categories.value.slice(0, 5),
);
const totalCategoryExpense = computed(() => categories.value.reduce(
  (sum, category) => sum + BigInt(category.totalAmount),
  BigInt(0),
).toString());

const doughnutChartData = computed(() => ({
  labels: categories.value.map(category => category.categoryName),
  datasets: [{
    data: categories.value.map(category => Number(category.totalAmount)),
    backgroundColor: categories.value.map(category => category.color),
    borderWidth: 2,
    borderColor: isDark.value ? '#16201A' : '#FFFFFF',
    hoverOffset: 4,
  }],
}));

const doughnutChartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  cutout: '72%',
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: isDark.value ? '#16201A' : '#18221B',
      titleColor: '#FFFFFF',
      bodyColor: '#F3F5EF',
      padding: 10,
      cornerRadius: 10,
      callbacks: {
        label: (context: any) => {
          const category = categories.value[context.dataIndex];
          return ` ${context.label}: ${formatRupiah(context.raw)} (${category?.percentage ?? 0}%)`;
        },
      },
    },
  },
}));
</script>

<template>
  <section class="space-y-4" aria-labelledby="analytics-section-title">
    <header class="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 id="analytics-section-title" class="text-base sm:text-lg font-bold text-[#18221B] dark:text-[#F0F4F1]">
          Analitik keuangan
        </h2>
        <p class="text-xs text-stone-500 dark:text-[#98A79D]">
          Bandingkan pemasukan dan pengeluaran, lalu lihat kategori belanja terbesar.
        </p>
      </div>
      <span class="text-xs font-semibold text-stone-600 dark:text-[#B8C5BB]">{{ periodLabel }}</span>
    </header>

    <p
      v-if="cashflowInsight"
      class="rounded-xl border border-emerald-900/10 bg-emerald-50/70 px-4 py-3 text-sm font-semibold text-[#183D2B] dark:border-[#B8DF38]/15 dark:bg-[#132E21] dark:text-[#F0F4F1]"
      aria-live="polite"
    >
      {{ cashflowInsight }}
    </p>

    <div class="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-5">
      <section class="fintech-card flex flex-col rounded-2xl border border-stone-200/90 bg-white p-4 shadow-xs dark:border-[#243329] dark:bg-[#16201A] sm:p-5 lg:col-span-7" aria-labelledby="cashflow-chart-title">
        <div class="mb-3">
          <h3 id="cashflow-chart-title" class="text-sm font-bold text-[#18221B] dark:text-[#F0F4F1]">
            Pemasukan dan pengeluaran per bulan
          </h3>
          <p class="text-[11px] text-stone-500 dark:text-[#98A79D]">Enam bulan terakhir. Nilai dalam rupiah.</p>
        </div>

        <div v-if="loading" class="flex h-64 items-center justify-center text-sm text-stone-500 dark:text-[#98A79D]" role="status">
          Memuat analitik...
        </div>
        <div v-else-if="trend?.months.length" class="relative h-64 w-full sm:h-72">
          <Bar :data="barChartData" :options="barChartOptions" />
          <table class="visually-hidden">
            <caption>Perbandingan pemasukan dan pengeluaran per bulan</caption>
            <thead><tr><th>Bulan</th><th>Pemasukan</th><th>Pengeluaran</th></tr></thead>
            <tbody>
              <tr v-for="(month, index) in trend.months" :key="month">
                <th>{{ month }}</th>
                <td>{{ formatRupiah(trend.incomeData[index]) }}</td>
                <td>{{ formatRupiah(trend.expenseData[index]) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else class="flex h-64 flex-col items-center justify-center text-center text-stone-500 dark:text-[#98A79D]">
          <TrendingUp class="mb-2 h-7 w-7" aria-hidden="true" />
          <p class="text-sm font-semibold">Belum ada data tren</p>
          <p class="mt-1 max-w-xs text-xs">Catat pemasukan atau pengeluaran untuk mulai melihat perubahan arus uang.</p>
        </div>
      </section>

      <section class="fintech-card flex flex-col rounded-2xl border border-stone-200/90 bg-white p-4 shadow-xs dark:border-[#243329] dark:bg-[#16201A] sm:p-5 lg:col-span-5" aria-labelledby="expense-chart-title">
        <div class="mb-3 flex items-start justify-between gap-3">
          <div>
            <h3 id="expense-chart-title" class="text-sm font-bold text-[#18221B] dark:text-[#F0F4F1]">Pengeluaran menurut kategori</h3>
            <p class="text-[11px] text-stone-500 dark:text-[#98A79D]">{{ periodLabel }}</p>
          </div>
          <span class="shrink-0 rounded-full bg-stone-100 px-2.5 py-1 text-xs font-bold tabular-nums text-[#18221B] dark:bg-[#0E1410] dark:text-[#F0F4F1]">
            {{ formatRupiah(totalCategoryExpense) }}
          </span>
        </div>

        <div v-if="loading" class="flex min-h-[220px] flex-1 items-center justify-center text-sm text-stone-500 dark:text-[#98A79D]" role="status">
          Memuat kategori...
        </div>
        <div v-else-if="categories.length" class="flex flex-1 flex-col">
          <div class="relative mx-auto my-2 h-40 w-full max-w-[220px] sm:h-44">
            <Doughnut :data="doughnutChartData" :options="doughnutChartOptions" />
          </div>

          <ul class="space-y-1.5" aria-label="Rincian pengeluaran per kategori">
            <li
              v-for="category in visibleCategories"
              :key="category.categoryId"
              class="flex items-center justify-between gap-3 rounded-lg px-2.5 py-2 text-xs odd:bg-stone-50 dark:odd:bg-[#0E1410]"
            >
              <div class="flex min-w-0 items-center gap-2">
                <span class="h-2.5 w-2.5 shrink-0 rounded-full" :style="{ backgroundColor: category.color }" aria-hidden="true"></span>
                <span class="truncate font-semibold text-[#18221B] dark:text-[#F0F4F1]">{{ category.categoryName }}</span>
                <span class="shrink-0 text-[10px] text-stone-500 dark:text-[#98A79D]">
                  {{ category.group === 'NEED' ? 'Kebutuhan' : 'Keinginan' }}
                </span>
              </div>
              <div class="shrink-0 text-right tabular-nums">
                <span class="block font-bold text-[#18221B] dark:text-[#F0F4F1]">{{ formatRupiah(category.totalAmount) }}</span>
                <span class="text-[10px] text-stone-500 dark:text-[#98A79D]">{{ category.percentage }}%</span>
              </div>
            </li>
          </ul>

          <button
            v-if="categories.length > 5"
            type="button"
            class="mt-2 min-h-10 self-start rounded-lg px-2 text-xs font-semibold text-[#183D2B] underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#183D2B] dark:text-[#B8DF38] dark:focus-visible:outline-[#B8DF38]"
            :aria-expanded="showAllCategories"
            @click="showAllCategories = !showAllCategories"
          >
            {{ showAllCategories ? 'Tampilkan lebih sedikit' : `Lihat semua ${categories.length} kategori` }}
          </button>
        </div>
        <div v-else class="flex min-h-[220px] flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-stone-200 bg-stone-50/60 p-5 text-center dark:border-[#243329] dark:bg-[#0E1410]/60">
          <PieChart class="mb-2 h-7 w-7 text-stone-500 dark:text-[#98A79D]" aria-hidden="true" />
          <h4 class="text-sm font-semibold text-[#18221B] dark:text-[#F0F4F1]">Belum ada pengeluaran</h4>
          <p class="mt-1 max-w-xs text-xs text-stone-500 dark:text-[#98A79D]">
            Catat pengeluaran pada bulan {{ periodLabel }} untuk melihat kategori belanja.
          </p>
        </div>
      </section>
    </div>
  </section>
</template>

<style scoped>
.visually-hidden {
  position: absolute !important;
  width: 1px !important;
  height: 1px !important;
  padding: 0 !important;
  margin: -1px !important;
  overflow: hidden !important;
  clip: rect(0, 0, 0, 0) !important;
  white-space: nowrap !important;
  border: 0 !important;
}
</style>
