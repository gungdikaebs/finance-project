<script setup lang="ts">
import { computed, ref } from 'vue';
import { formatRupiah, formatDate } from '../utils/format';
import { financeApi, type Transaction } from '../api/services';
import {
  ReceiptText,
  Filter,
  Edit3,
  XCircle,
  Plus,
  Minus,
  Target,
  Download,
  FileText,
  FileSpreadsheet,
  FileDown,
  ChevronDown,
  Loader2,
} from 'lucide-vue-next';
import { useToast } from '../composables/useToast';
import TransactionRevisionHistory from './TransactionRevisionHistory.vue';

const toast = useToast();

const props = defineProps<{
  transactions: Transaction[];
  currentMonth: number;
  currentYear: number;
  filterType: string;
  filterStatus: string;
}>();

const emit = defineEmits<{
  (e: 'update:currentMonth', val: number): void;
  (e: 'update:currentYear', val: number): void;
  (e: 'update:filterType', val: string): void;
  (e: 'update:filterStatus', val: string): void;
  (e: 'changeFilter'): void;
  (e: 'openEditTransaction', trx: Transaction): void;
  (e: 'openCancelTransaction', trx: Transaction): void;
  (e: 'openCreateIncome'): void;
  (e: 'openCreateExpense'): void;
}>();

const isExporting = ref(false);
const exportFormat = ref<string | null>(null);
const showExportDropdown = ref(false);
const showAdditionalFilters = ref(false);
const additionalFilterCount = computed(() => [
  props.filterType !== '',
  props.filterStatus !== 'ACTIVE',
].filter(Boolean).length);

const clearAdditionalFilters = () => {
  emit('update:filterType', '');
  emit('update:filterStatus', 'ACTIVE');
  showAdditionalFilters.value = false;
  emit('changeFilter');
};

const monthNames = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

const handleExport = async (format: 'csv' | 'excel' | 'pdf') => {
  isExporting.value = true;
  exportFormat.value = format;
  showExportDropdown.value = false;
  try {
    let response: any;
    let extension = '';
    if (format === 'csv') {
      response = await financeApi.exportCsv(props.currentMonth, props.currentYear);
      extension = 'csv';
    } else if (format === 'excel') {
      response = await financeApi.exportExcel(props.currentMonth, props.currentYear);
      extension = 'xlsx';
    } else {
      response = await financeApi.exportPdf(props.currentMonth, props.currentYear);
      extension = 'pdf';
    }

    const blob = new Blob([response.data]);
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    const monthStr = String(props.currentMonth).padStart(2, '0');
    link.download = `Laporan_Keuangan_${props.currentYear}_${monthStr}.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
    toast.success(`Berkas ${format.toUpperCase()} berhasil diunduh!`);
  } catch (err: any) {
    toast.error(err.response?.data?.message || 'Gagal mengekspor berkas laporan');
  } finally {
    isExporting.value = false;
    exportFormat.value = null;
  }
};
</script>

<template>
  <div class="fintech-card rounded-2xl overflow-hidden bg-white dark:bg-[#0D1524] border border-slate-200 dark:border-slate-800 transition-colors">
    <!-- Header & Filter Bar -->
    <div class="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200/60 dark:border-blue-900/50 shadow-2xs">
            <ReceiptText class="w-4 h-4" :stroke-width="2" />
          </div>
          <h2 tabindex="-1" class="text-base font-extrabold text-[#0B192C] dark:text-[#F8FAFC]">Riwayat Transaksi</h2>
        </div>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 font-normal">
          Catatan arus uang masuk dan keluar dengan riwayat perubahan yang tersimpan rapi.
        </p>
      </div>

      <!-- Filter Controls -->
      <div class="flex flex-wrap items-center gap-2">
        <select
          aria-label="Bulan transaksi"
          :value="currentMonth"
          @change="emit('update:currentMonth', Number(($event.target as HTMLSelectElement).value)); emit('changeFilter')"
          class="min-h-10 text-xs font-semibold border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 bg-slate-50 dark:bg-[#070B14] text-slate-800 dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#0B192C]/20 dark:focus:ring-blue-400/20 cursor-pointer"
        >
          <option v-for="(mName, idx) in monthNames" :key="idx + 1" :value="idx + 1">
            {{ mName }}
          </option>
        </select>

        <select
          aria-label="Tahun transaksi"
          :value="currentYear"
          @change="emit('update:currentYear', Number(($event.target as HTMLSelectElement).value)); emit('changeFilter')"
          class="min-h-10 text-xs font-semibold border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 bg-slate-50 dark:bg-[#070B14] text-slate-800 dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#0B192C]/20 dark:focus:ring-blue-400/20 cursor-pointer"
        >
          <option :value="2025">2025</option>
          <option :value="2026">2026</option>
          <option :value="2027">2027</option>
        </select>

        <button
          type="button"
          @click="showAdditionalFilters = !showAdditionalFilters"
          :aria-expanded="showAdditionalFilters"
          aria-controls="additional-transaction-filters"
          class="tactile-btn inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B192C] dark:border-slate-700 dark:bg-[#070B14] dark:text-[#F8FAFC] dark:hover:bg-slate-800 cursor-pointer"
        >
          <Filter class="h-3.5 w-3.5" aria-hidden="true" />
          <span>{{ additionalFilterCount ? `Filter lain (${additionalFilterCount} aktif)` : 'Filter lain' }}</span>
          <ChevronDown class="h-3.5 w-3.5 transition-transform" :class="showAdditionalFilters ? 'rotate-180' : ''" aria-hidden="true" />
        </button>

        <!-- Export Dropdown -->
        <div class="relative">
          <button
            type="button"
            @click="showExportDropdown = !showExportDropdown"
            :disabled="isExporting"
            class="tactile-btn inline-flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-[#070B14] hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[#0B192C] dark:text-[#F8FAFC] rounded-xl text-xs font-bold transition shadow-2xs cursor-pointer disabled:opacity-50 min-h-10"
            title="Ekspor data transaksi bulan ini"
          >
            <Loader2 v-if="isExporting" class="w-3.5 h-3.5 animate-spin text-blue-600 dark:text-blue-400" />
            <Download v-else class="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" :stroke-width="2" />
            <span>{{ isExporting ? 'Mengekspor...' : 'Ekspor Data' }}</span>
            <ChevronDown class="w-3.5 h-3.5 text-slate-400" />
          </button>

          <!-- Backdrop click listener for closing dropdown -->
          <div
            v-if="showExportDropdown"
            class="fixed inset-0 z-10"
            @click="showExportDropdown = false"
          ></div>

          <!-- Dropdown Menu -->
          <div
            v-if="showExportDropdown"
            class="absolute right-0 mt-1.5 w-52 bg-white dark:bg-[#0D1524] rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 py-1.5 z-20 animate-modal-enter"
          >
            <div class="px-3 py-1.5 border-b border-slate-100 dark:border-slate-800 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Pilihan Format Ekspor
            </div>

            <!-- CSV Option -->
            <button
              type="button"
              @click="handleExport('csv')"
              class="w-full flex items-center gap-2.5 px-3.5 py-2 text-left text-xs font-semibold text-slate-700 dark:text-[#F8FAFC] hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              <div class="w-6 h-6 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 flex items-center justify-center shrink-0">
                <FileText class="w-3.5 h-3.5" />
              </div>
              <div>
                <span class="block leading-tight">Unduh CSV</span>
                <span class="text-[10px] text-slate-400 dark:text-slate-500 font-normal">Data tabel mentah (.csv)</span>
              </div>
            </button>

            <!-- Excel Option -->
            <button
              type="button"
              @click="handleExport('excel')"
              class="w-full flex items-center gap-2.5 px-3.5 py-2 text-left text-xs font-semibold text-slate-700 dark:text-[#F8FAFC] hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              <div class="w-6 h-6 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
                <FileSpreadsheet class="w-3.5 h-3.5" />
              </div>
              <div>
                <span class="block leading-tight">Unduh Spreadsheet</span>
                <span class="text-[10px] text-slate-400 dark:text-slate-500 font-normal">Format Excel rapi (.xlsx)</span>
              </div>
            </button>

            <!-- PDF Option -->
            <button
              type="button"
              @click="handleExport('pdf')"
              class="w-full flex items-center gap-2.5 px-3.5 py-2 text-left text-xs font-semibold text-slate-700 dark:text-[#F8FAFC] hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              <div class="w-6 h-6 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 flex items-center justify-center shrink-0">
                <FileDown class="w-3.5 h-3.5" />
              </div>
              <div>
                <span class="block leading-tight">Cetak Laporan PDF</span>
                <span class="text-[10px] text-slate-400 dark:text-slate-500 font-normal">Dokumen siap cetak (.pdf)</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      <div
        v-if="showAdditionalFilters"
        id="additional-transaction-filters"
        class="grid grid-cols-2 gap-2 border-t border-slate-100 pt-3 dark:border-slate-800"
      >
        <select
          aria-label="Jenis transaksi"
          :value="filterType"
          @change="emit('update:filterType', ($event.target as HTMLSelectElement).value); emit('changeFilter')"
          class="min-h-10 min-w-0 text-xs font-semibold border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 bg-slate-50 dark:bg-[#070B14] text-slate-800 dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#0B192C]/20 dark:focus:ring-blue-400/20 cursor-pointer"
        >
          <option value="">Semua jenis</option>
          <option value="income">Pemasukan</option>
          <option value="expense">Pengeluaran</option>
        </select>

        <select
          aria-label="Status transaksi"
          :value="filterStatus"
          @change="emit('update:filterStatus', ($event.target as HTMLSelectElement).value); emit('changeFilter')"
          class="min-h-10 min-w-0 text-xs font-semibold border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 bg-slate-50 dark:bg-[#070B14] text-slate-800 dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#0B192C]/20 dark:focus:ring-blue-400/20 cursor-pointer"
        >
          <option value="ACTIVE">Aktif</option>
          <option value="">Semua status</option>
          <option value="CANCELLED">Dibatalkan</option>
        </select>
      </div>
    </div>

    <!-- Mobile Card View -->
    <div v-if="transactions.length > 0" class="lg:hidden divide-y divide-slate-100 dark:divide-slate-800">
      <div
        v-for="trx in transactions"
        :key="trx.id"
        class="p-4 space-y-2.5 transition-colors"
        :class="trx.status === 'CANCELLED' ? 'bg-slate-50/70 dark:bg-[#070B14]/40' : 'hover:bg-slate-50/70 dark:hover:bg-[#070B14]/50'"
      >
        <div class="flex justify-between items-start gap-2">
          <div class="space-y-0.5 flex-1 min-w-0">
            <span class="text-xs font-bold text-[#0B192C] dark:text-[#F8FAFC] block truncate leading-tight">
              {{ trx.note || trx.category?.name || 'Transaksi' }}
            </span>
            <div class="flex items-center gap-1.5 flex-wrap">
              <span class="text-[10px] text-slate-500 dark:text-slate-400 font-medium">{{ formatDate(trx.date) }}</span>
              <span class="text-[10px] text-slate-300 dark:text-slate-700">•</span>
              <span class="text-[10px] text-slate-500 dark:text-slate-400 font-medium">{{ trx.category?.name || 'Umum' }}</span>
              <!-- Group Snapshot Badge -->
              <span
                v-if="trx.groupSnapshot === 'NEED'"
                class="text-[9px] px-1.5 py-0.2 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold border border-blue-200/60 dark:border-blue-900/50"
              >
                Kebutuhan
              </span>
              <span
                v-else-if="trx.groupSnapshot === 'WANT'"
                class="text-[9px] px-1.5 py-0.2 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-bold border border-purple-200/60 dark:border-purple-900/50"
              >
                Keinginan
              </span>
            </div>
          </div>

          <!-- Nominal -->
          <span
            class="font-black text-sm tabular-nums shrink-0"
            :class="trx.typeSnapshot === 'INCOME' ? 'text-emerald-600 dark:text-emerald-400' : 'text-[#0B192C] dark:text-[#F8FAFC]'"
          >
            {{ trx.typeSnapshot === 'INCOME' ? '+' : '-' }} {{ formatRupiah(trx.amount) }}
          </span>
        </div>

        <!-- Meta & Actions Bar -->
        <div class="flex items-center justify-between gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
          <div class="text-[10px] text-slate-500 dark:text-slate-400 truncate">
            <span v-if="trx.typeSnapshot === 'INCOME'" class="font-semibold text-emerald-700 dark:text-emerald-400">
              {{ trx.incomeSource?.name || 'Pemasukan Umum' }}
            </span>
            <span v-else>
              <span
                v-if="trx.sourceGoal"
                class="inline-flex items-center gap-1 font-semibold text-blue-700 dark:text-blue-400"
              >
                <Target class="w-3 h-3 text-blue-600 dark:text-blue-400 shrink-0" />
                <span>{{ trx.sourceGoal.name }}</span>
              </span>
              <span v-else class="text-slate-400 dark:text-slate-500 font-medium">Uang Belum Disisihkan</span>
            </span>
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-1 shrink-0">
            <span
              v-if="trx.status === 'ACTIVE'"
              class="inline-flex items-center gap-1"
            >
              <button
                type="button"
                @click="emit('openEditTransaction', trx)"
                :data-focus-return="`edit-${trx.id}`"
                class="tactile-btn text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 font-bold px-2 py-1 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/40 cursor-pointer inline-flex items-center gap-1 min-h-[32px]"
              >
                <Edit3 class="w-3 h-3" />
                <span>Koreksi</span>
              </button>
              <button
                type="button"
                @click="emit('openCancelTransaction', trx)"
                :data-focus-return="`cancel-${trx.id}`"
                class="tactile-btn text-xs text-rose-600 dark:text-rose-400 hover:text-rose-800 dark:hover:text-rose-200 font-bold px-2 py-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer inline-flex items-center gap-1 min-h-[32px]"
              >
                <XCircle class="w-3 h-3" />
                <span>Batal</span>
              </button>
            </span>
            <span v-else class="text-[10px] font-bold text-slate-500 dark:text-slate-400">Dibatalkan</span>
          </div>
        </div>
        <TransactionRevisionHistory v-if="trx.revisions?.length" :revisions="trx.revisions" />
      </div>
    </div>

    <!-- Desktop Table View -->
    <div v-if="transactions.length > 0" class="hidden lg:block overflow-x-auto">
      <table class="w-full text-left border-collapse text-sm">
        <thead>
          <tr class="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-[#070B14] text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            <th class="py-3 px-5">Tanggal</th>
            <th class="py-3 px-4">Keterangan / Kategori</th>
            <th class="py-3 px-4">Sumber / Pos Dana</th>
            <th class="py-3 px-4 text-right">Nominal</th>
            <th class="py-3 px-4 text-center">Status</th>
            <th class="py-3 px-5 text-right">Aksi</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
          <tr
            v-for="trx in transactions"
            :key="trx.id"
            :class="trx.status === 'CANCELLED' ? 'bg-slate-50/70 dark:bg-[#070B14]/40' : 'hover:bg-slate-50/70 dark:hover:bg-[#070B14]/50'"
            class="transition-colors"
          >
            <!-- Tanggal -->
            <td class="py-3.5 px-5 whitespace-nowrap text-xs font-medium text-slate-600 dark:text-slate-400">
              {{ formatDate(trx.date) }}
            </td>

            <!-- Keterangan & Kategori -->
            <td class="py-3.5 px-4">
              <div class="font-bold text-[#0B192C] dark:text-[#F8FAFC] text-xs">
                {{ trx.note || trx.category?.name || 'Transaksi' }}
              </div>
              <div class="flex items-center gap-1.5 mt-0.5">
                <span class="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{{ trx.category?.name || 'Umum' }}</span>
                <!-- Badge Grup Kategori -->
                <span
                  v-if="trx.groupSnapshot === 'NEED'"
                  class="text-[9px] px-1.5 py-0.2 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold border border-blue-200/60 dark:border-blue-900/50"
                >
                  Kebutuhan
                </span>
                <span
                  v-else-if="trx.groupSnapshot === 'WANT'"
                  class="text-[9px] px-1.5 py-0.2 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-bold border border-purple-200/60 dark:border-purple-900/50"
                >
                  Keinginan
                </span>
              </div>
              <TransactionRevisionHistory v-if="trx.revisions?.length" :revisions="trx.revisions" class="mt-2" />
            </td>

            <!-- Sumber / Pos Dana -->
            <td class="py-3.5 px-4 text-xs text-slate-600 dark:text-slate-400">
              <span v-if="trx.typeSnapshot === 'INCOME'" class="font-semibold text-emerald-700 dark:text-emerald-400">
                {{ trx.incomeSource?.name || 'Pemasukan Umum' }}
              </span>
              <span v-else>
                <!-- Badge Sumber Dana Tabungan -->
                <span
                  v-if="trx.sourceGoal"
                  class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50"
                >
                  <Target class="w-3 h-3 text-blue-600 dark:text-blue-400" />
                  <span>{{ trx.sourceGoal.name }}</span>
                </span>
                <span v-else class="text-slate-400 dark:text-slate-500 font-medium">Uang Belum Disisihkan</span>
              </span>
            </td>

            <!-- Nominal -->
            <td class="py-3.5 px-4 text-right whitespace-nowrap">
              <span
                class="font-extrabold text-xs tabular-nums inline-flex items-center gap-0.5"
                :class="trx.typeSnapshot === 'INCOME' ? 'text-emerald-600 dark:text-emerald-400' : 'text-[#0B192C] dark:text-[#F8FAFC]'"
              >
                <span>{{ trx.typeSnapshot === 'INCOME' ? '+' : '-' }}</span>
                <span>{{ formatRupiah(trx.amount) }}</span>
              </span>
            </td>

            <!-- Status -->
            <td class="py-3.5 px-4 text-center whitespace-nowrap">
              <span
                v-if="trx.status === 'ACTIVE'"
                class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50"
              >
                Aktif
              </span>
              <span
                v-else
                class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700"
              >
                Dibatalkan
              </span>
            </td>

            <!-- Aksi -->
            <td class="py-3.5 px-5 text-right whitespace-nowrap">
              <div v-if="trx.status === 'ACTIVE'" class="inline-flex items-center gap-1">
                <button
                  type="button"
                  @click="emit('openEditTransaction', trx)"
                  :data-focus-return="`edit-${trx.id}`"
                  class="tactile-btn text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 font-bold px-2 py-1 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/40 cursor-pointer inline-flex items-center gap-1"
                  title="Koreksi Transaksi"
                >
                  <Edit3 class="w-3 h-3" />
                  <span>Koreksi</span>
                </button>
                <button
                  type="button"
                  @click="emit('openCancelTransaction', trx)"
                  :data-focus-return="`cancel-${trx.id}`"
                  class="tactile-btn text-xs text-rose-600 dark:text-rose-400 hover:text-rose-800 dark:hover:text-rose-200 font-bold px-2 py-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer inline-flex items-center gap-1"
                  title="Batalkan Transaksi"
                >
                  <XCircle class="w-3 h-3" />
                  <span>Batal</span>
                </button>
              </div>
              <span v-else class="text-[11px] text-slate-400 dark:text-slate-500 italic font-medium">Batal</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Empty State Transaksi -->
    <div v-else class="text-center py-12 px-4 space-y-3">
      <div class="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-[#070B14] text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto border border-slate-200 dark:border-slate-800">
        <ReceiptText class="w-6 h-6" :stroke-width="1.75" />
      </div>
      <div>
        <h3 class="text-sm font-bold text-[#0B192C] dark:text-[#F8FAFC]">
          {{ additionalFilterCount ? 'Tidak ada transaksi yang cocok' : 'Belum ada transaksi' }}
        </h3>
        <p class="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1 leading-relaxed font-normal">
          <template v-if="additionalFilterCount">Coba ubah filter jenis atau status, atau tampilkan semua transaksi.</template>
          <template v-else>Catat pemasukan atau pengeluaran agar riwayat keuangan bulan ini tercatat.</template>
        </p>
      </div>
      <div class="flex items-center justify-center gap-2 pt-2">
        <button
          v-if="additionalFilterCount"
          type="button"
          @click="clearAdditionalFilters"
          class="tactile-btn min-h-10 px-3.5 py-2 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-[#F8FAFC] rounded-xl text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 shadow-xs cursor-pointer"
        >
          Tampilkan semua transaksi
        </button>
        <template v-else>
          <button
            type="button"
            @click="emit('openCreateIncome')"
            class="tactile-btn px-3.5 py-2 bg-[#0B192C] text-white rounded-xl text-xs font-extrabold hover:bg-[#172B45] shadow-xs cursor-pointer inline-flex items-center gap-1 dark:bg-white dark:text-[#0B192C] dark:hover:bg-slate-100"
          >
            <Plus class="w-3.5 h-3.5 text-white dark:text-[#0B192C]" :stroke-width="2.5" />
            <span>Catat Pemasukan</span>
          </button>
          <button
            type="button"
            @click="emit('openCreateExpense')"
            class="tactile-btn px-3.5 py-2 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-[#F8FAFC] rounded-xl text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 shadow-xs cursor-pointer inline-flex items-center gap-1"
          >
            <Minus class="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" :stroke-width="2.5" />
            <span>Catat Pengeluaran</span>
          </button>
        </template>
      </div>
    </div>
  </div>
</template>
