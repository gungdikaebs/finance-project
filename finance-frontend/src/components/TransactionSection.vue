<script setup lang="ts">
import { ref } from 'vue';
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
  <div class="fintech-card rounded-2xl overflow-hidden bg-white dark:bg-[#16201A] border border-stone-200/90 dark:border-[#243329] transition-colors">
    <!-- Header & Filter Bar -->
    <div class="p-5 sm:p-6 border-b border-stone-100 dark:border-[#243329] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <div class="flex items-center gap-2.5">
          <div class="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-[#0E1410] text-[#183D2B] dark:text-[#B8DF38] flex items-center justify-center border border-emerald-100 dark:border-[#243329]">
            <ReceiptText class="w-4 h-4" :stroke-width="2" />
          </div>
          <h2 class="text-base font-extrabold text-[#18221B] dark:text-[#F0F4F1]">Riwayat Transaksi</h2>
        </div>
        <p class="text-xs text-[#5E6961] dark:text-[#98A79D] mt-1 font-normal">
          Catatan arus uang aktual dengan dukungan koreksi dan pembatalan berjejak audit.
        </p>
      </div>

      <!-- Filter Controls -->
      <div class="flex flex-wrap items-center gap-2">
        <div class="flex items-center gap-1.5 bg-stone-100/80 dark:bg-[#0E1410] px-2 py-1 rounded-xl border border-stone-200/70 dark:border-[#243329] text-stone-600 dark:text-[#98A79D] text-xs">
          <Filter class="w-3.5 h-3.5 text-stone-500 dark:text-[#98A79D]" :stroke-width="1.75" />
          <span class="font-semibold text-[11px]">Filter:</span>
        </div>

        <select
          :value="currentMonth"
          @change="emit('update:currentMonth', Number(($event.target as HTMLSelectElement).value)); emit('changeFilter')"
          class="text-xs font-semibold border border-stone-200/80 dark:border-[#243329] rounded-xl px-2.5 py-1.5 bg-stone-50/80 dark:bg-[#0E1410] text-stone-800 dark:text-[#F0F4F1] focus:outline-none focus:ring-2 focus:ring-[#183D2B]/20 dark:focus:ring-[#B8DF38]/20 cursor-pointer"
        >
          <option v-for="(mName, idx) in monthNames" :key="idx + 1" :value="idx + 1">
            {{ mName }}
          </option>
        </select>

        <select
          :value="currentYear"
          @change="emit('update:currentYear', Number(($event.target as HTMLSelectElement).value)); emit('changeFilter')"
          class="text-xs font-semibold border border-stone-200/80 dark:border-[#243329] rounded-xl px-2.5 py-1.5 bg-stone-50/80 dark:bg-[#0E1410] text-stone-800 dark:text-[#F0F4F1] focus:outline-none focus:ring-2 focus:ring-[#183D2B]/20 dark:focus:ring-[#B8DF38]/20 cursor-pointer"
        >
          <option :value="2025">2025</option>
          <option :value="2026">2026</option>
          <option :value="2027">2027</option>
        </select>

        <select
          :value="filterType"
          @change="emit('update:filterType', ($event.target as HTMLSelectElement).value); emit('changeFilter')"
          class="text-xs font-semibold border border-stone-200/80 dark:border-[#243329] rounded-xl px-2.5 py-1.5 bg-stone-50/80 dark:bg-[#0E1410] text-stone-800 dark:text-[#F0F4F1] focus:outline-none focus:ring-2 focus:ring-[#183D2B]/20 dark:focus:ring-[#B8DF38]/20 cursor-pointer"
        >
          <option value="">Semua Tipe</option>
          <option value="income">Pemasukan Saja</option>
          <option value="expense">Pengeluaran Saja</option>
        </select>

        <select
          :value="filterStatus"
          @change="emit('update:filterStatus', ($event.target as HTMLSelectElement).value); emit('changeFilter')"
          class="text-xs font-semibold border border-stone-200/80 dark:border-[#243329] rounded-xl px-2.5 py-1.5 bg-stone-50/80 dark:bg-[#0E1410] text-stone-800 dark:text-[#F0F4F1] focus:outline-none focus:ring-2 focus:ring-[#183D2B]/20 dark:focus:ring-[#B8DF38]/20 cursor-pointer"
        >
          <option value="">Semua Status</option>
          <option value="ACTIVE">Aktif</option>
          <option value="CANCELLED">Dibatalkan</option>
        </select>

        <!-- Export Dropdown (Modul 7) -->
        <div class="relative">
          <button
            type="button"
            @click="showExportDropdown = !showExportDropdown"
            :disabled="isExporting"
            class="tactile-btn inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-[#0E1410] hover:bg-stone-50 dark:hover:bg-[#243329]/50 border border-stone-200/90 dark:border-[#243329] text-[#18221B] dark:text-[#F0F4F1] rounded-xl text-xs font-bold transition shadow-2xs cursor-pointer disabled:opacity-50"
            title="Ekspor data transaksi bulan ini"
          >
            <Loader2 v-if="isExporting" class="w-3.5 h-3.5 animate-spin text-[#183D2B] dark:text-[#B8DF38]" />
            <Download v-else class="w-3.5 h-3.5 text-[#183D2B] dark:text-[#B8DF38]" :stroke-width="2" />
            <span>{{ isExporting ? 'Mengekspor...' : 'Ekspor Data' }}</span>
            <ChevronDown class="w-3.5 h-3.5 text-stone-400" />
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
            class="absolute right-0 mt-1.5 w-52 bg-white dark:bg-[#16201A] rounded-2xl shadow-xl border border-stone-200/90 dark:border-[#243329] py-1.5 z-20 animate-modal-enter"
          >
            <div class="px-3 py-1.5 border-b border-stone-100 dark:border-[#243329] text-[10px] font-bold text-stone-400 dark:text-[#98A79D] uppercase tracking-wider">
              Pilihan Format Ekspor
            </div>

            <!-- CSV Option -->
            <button
              type="button"
              @click="handleExport('csv')"
              class="w-full flex items-center gap-2.5 px-3.5 py-2 text-left text-xs font-semibold text-stone-700 dark:text-[#F0F4F1] hover:bg-stone-50 dark:hover:bg-[#0E1410] hover:text-[#183D2B] dark:hover:text-[#B8DF38] transition cursor-pointer"
            >
              <div class="w-6 h-6 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 flex items-center justify-center shrink-0">
                <FileText class="w-3.5 h-3.5" />
              </div>
              <div>
                <span class="block leading-tight">Unduh CSV</span>
                <span class="text-[10px] text-stone-400 dark:text-[#98A79D] font-normal">Data tabel mentah (.csv)</span>
              </div>
            </button>

            <!-- Excel Option -->
            <button
              type="button"
              @click="handleExport('excel')"
              class="w-full flex items-center gap-2.5 px-3.5 py-2 text-left text-xs font-semibold text-stone-700 dark:text-[#F0F4F1] hover:bg-stone-50 dark:hover:bg-[#0E1410] hover:text-[#183D2B] dark:hover:text-[#B8DF38] transition cursor-pointer"
            >
              <div class="w-6 h-6 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-[#183D2B] dark:text-[#B8DF38] flex items-center justify-center shrink-0">
                <FileSpreadsheet class="w-3.5 h-3.5" />
              </div>
              <div>
                <span class="block leading-tight">Unduh Spreadsheet</span>
                <span class="text-[10px] text-stone-400 dark:text-[#98A79D] font-normal">Format Excel rapi (.xlsx)</span>
              </div>
            </button>

            <!-- PDF Option -->
            <button
              type="button"
              @click="handleExport('pdf')"
              class="w-full flex items-center gap-2.5 px-3.5 py-2 text-left text-xs font-semibold text-stone-700 dark:text-[#F0F4F1] hover:bg-stone-50 dark:hover:bg-[#0E1410] hover:text-rose-700 dark:hover:text-rose-400 transition cursor-pointer"
            >
              <div class="w-6 h-6 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 flex items-center justify-center shrink-0">
                <FileDown class="w-3.5 h-3.5" />
              </div>
              <div>
                <span class="block leading-tight">Cetak Laporan PDF</span>
                <span class="text-[10px] text-stone-400 dark:text-[#98A79D] font-normal">Dokumen siap cetak (.pdf)</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Mobile: Card List Vertikal (< sm, UX-06) -->
    <div v-if="transactions.length > 0" class="sm:hidden divide-y divide-stone-100 dark:divide-[#243329]">
      <div
        v-for="trx in transactions"
        :key="trx.id"
        class="p-4 space-y-2.5 transition-colors"
        :class="trx.status === 'CANCELLED' ? 'opacity-40 bg-stone-50/50 dark:bg-[#0E1410]/30 line-through' : 'hover:bg-stone-50/70 dark:hover:bg-[#0E1410]/50'"
      >
        <div class="flex justify-between items-start gap-2">
          <div class="space-y-0.5 flex-1 min-w-0">
            <span class="text-xs font-bold text-[#18221B] dark:text-[#F0F4F1] block truncate leading-tight">
              {{ trx.note || trx.category?.name || 'Transaksi' }}
            </span>
            <div class="flex items-center gap-1.5 flex-wrap">
              <span class="text-[10px] text-stone-500 dark:text-[#98A79D] font-medium">{{ formatDate(trx.date) }}</span>
              <span class="text-[10px] text-stone-300 dark:text-[#243329]">•</span>
              <span class="text-[10px] text-stone-500 dark:text-[#98A79D] font-medium">{{ trx.category?.name || 'Umum' }}</span>
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
            :class="trx.typeSnapshot === 'INCOME' ? 'text-emerald-700 dark:text-[#B8DF38]' : 'text-[#18221B] dark:text-[#F0F4F1]'"
          >
            {{ trx.typeSnapshot === 'INCOME' ? '+' : '-' }} {{ formatRupiah(trx.amount) }}
          </span>
        </div>

        <!-- Meta & Actions Bar -->
        <div class="flex items-center justify-between gap-2 pt-1 border-t border-stone-100/80 dark:border-[#243329]/60">
          <div class="text-[10px] text-stone-500 dark:text-[#98A79D] truncate">
            <span v-if="trx.typeSnapshot === 'INCOME'" class="font-semibold text-emerald-800 dark:text-[#B8DF38]">
              {{ trx.incomeSource?.name || 'Pemasukan Umum' }}
            </span>
            <span v-else>
              <span
                v-if="trx.sourceGoal"
                class="inline-flex items-center gap-1 font-semibold text-emerald-800 dark:text-emerald-300"
              >
                <Target class="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>{{ trx.sourceGoal.name }}</span>
              </span>
              <span v-else class="text-stone-400 dark:text-[#98A79D] font-medium">Uang Belum Disisihkan</span>
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
                class="tactile-btn text-xs text-blue-700 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-200 font-bold px-2 py-1 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/40 cursor-pointer inline-flex items-center gap-1 min-h-[36px]"
              >
                <Edit3 class="w-3 h-3" />
                <span>Koreksi</span>
              </button>
              <button
                type="button"
                @click="emit('openCancelTransaction', trx)"
                class="tactile-btn text-xs text-rose-600 dark:text-rose-400 hover:text-rose-800 dark:hover:text-rose-200 font-bold px-2 py-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer inline-flex items-center gap-1 min-h-[36px]"
              >
                <XCircle class="w-3 h-3" />
                <span>Batal</span>
              </button>
            </span>
            <span v-else class="text-[10px] text-stone-400 dark:text-stone-500 italic">Dibatalkan</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Desktop: Tabel Riwayat Transaksi (>= sm) -->
    <div v-if="transactions.length > 0" class="hidden sm:block overflow-x-auto">
      <table class="w-full text-left border-collapse text-sm">
        <thead>
          <tr class="border-b border-stone-100 dark:border-[#243329] bg-stone-50/60 dark:bg-[#0E1410] text-[11px] font-bold text-stone-500 dark:text-[#98A79D] uppercase tracking-wider">
            <th class="py-3 px-5">Tanggal</th>
            <th class="py-3 px-4">Keterangan / Kategori</th>
            <th class="py-3 px-4">Sumber / Pos Dana</th>
            <th class="py-3 px-4 text-right">Nominal</th>
            <th class="py-3 px-4 text-center">Status</th>
            <th class="py-3 px-5 text-right">Aksi</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-stone-100 dark:divide-[#243329]">
          <tr
            v-for="trx in transactions"
            :key="trx.id"
            :class="trx.status === 'CANCELLED' ? 'opacity-40 bg-stone-50/50 dark:bg-[#0E1410]/30 line-through' : 'hover:bg-stone-50/70 dark:hover:bg-[#0E1410]/50'"
            class="transition-colors"
          >
            <!-- Tanggal -->
            <td class="py-3.5 px-5 whitespace-nowrap text-xs font-medium text-stone-600 dark:text-[#98A79D]">
              {{ formatDate(trx.date) }}
            </td>

            <!-- Keterangan & Kategori -->
            <td class="py-3.5 px-4">
              <div class="font-bold text-[#18221B] dark:text-[#F0F4F1] text-xs">
                {{ trx.note || trx.category?.name || 'Transaksi' }}
              </div>
              <div class="flex items-center gap-1.5 mt-0.5">
                <span class="text-[11px] text-stone-500 dark:text-[#98A79D] font-medium">{{ trx.category?.name || 'Umum' }}</span>
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
            </td>

            <!-- Sumber / Pos Dana -->
            <td class="py-3.5 px-4 text-xs text-stone-600 dark:text-[#98A79D]">
              <span v-if="trx.typeSnapshot === 'INCOME'" class="font-semibold text-emerald-800 dark:text-[#B8DF38]">
                {{ trx.incomeSource?.name || 'Pemasukan Umum' }}
              </span>
              <span v-else>
                <!-- Badge Sumber Dana Tabungan -->
                <span
                  v-if="trx.sourceGoal"
                  class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50"
                >
                  <Target class="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  <span>{{ trx.sourceGoal.name }}</span>
                </span>
                <span v-else class="text-stone-400 dark:text-[#98A79D] font-medium">Uang Belum Disisihkan</span>
              </span>
            </td>

            <!-- Nominal -->
            <td class="py-3.5 px-4 text-right whitespace-nowrap">
              <span
                class="font-black text-xs tabular-nums inline-flex items-center gap-0.5"
                :class="trx.typeSnapshot === 'INCOME' ? 'text-emerald-700 dark:text-[#B8DF38]' : 'text-[#18221B] dark:text-[#F0F4F1]'"
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
                class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 border border-stone-200 dark:border-stone-700"
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
                  class="tactile-btn text-xs text-blue-700 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-200 font-bold px-2 py-1 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/40 cursor-pointer inline-flex items-center gap-1"
                  title="Koreksi Transaksi"
                >
                  <Edit3 class="w-3 h-3" />
                  <span>Koreksi</span>
                </button>
                <button
                  type="button"
                  @click="emit('openCancelTransaction', trx)"
                  class="tactile-btn text-xs text-rose-600 dark:text-rose-400 hover:text-rose-800 dark:hover:text-rose-200 font-bold px-2 py-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer inline-flex items-center gap-1"
                  title="Batalkan Transaksi"
                >
                  <XCircle class="w-3 h-3" />
                  <span>Batal</span>
                </button>
              </div>
              <span v-else class="text-[11px] text-stone-400 dark:text-stone-500 italic font-medium">Batal</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Empty State Transaksi -->
    <div v-else class="text-center py-12 px-4 space-y-3">
      <div class="w-12 h-12 rounded-2xl bg-stone-100 dark:bg-[#0E1410] text-[#183D2B] dark:text-[#B8DF38] flex items-center justify-center mx-auto border border-stone-200/60 dark:border-[#243329]">
        <ReceiptText class="w-6 h-6" :stroke-width="1.75" />
      </div>
      <div>
        <h3 class="text-sm font-bold text-[#18221B] dark:text-[#F0F4F1]">Belum Ada Transaksi</h3>
        <p class="text-xs text-[#5E6961] dark:text-[#98A79D] max-w-sm mx-auto mt-1 leading-relaxed font-normal">
          Mulai catat transaksi pemasukan atau pengeluaran untuk memantau batas kebutuhan dan tabungan bulan ini.
        </p>
      </div>
      <div class="flex items-center justify-center gap-2 pt-2">
        <button
          type="button"
          @click="emit('openCreateIncome')"
          class="tactile-btn px-3.5 py-2 bg-[#B8DF38] text-[#183D2B] rounded-xl text-xs font-extrabold hover:bg-[#a3c82e] shadow-xs cursor-pointer inline-flex items-center gap-1"
        >
          <Plus class="w-3.5 h-3.5 text-[#183D2B]" :stroke-width="2.5" />
          <span>Catat Pemasukan</span>
        </button>
        <button
          type="button"
          @click="emit('openCreateExpense')"
          class="tactile-btn px-3.5 py-2 bg-stone-100 dark:bg-[#0E1410] text-[#18221B] dark:text-[#F0F4F1] rounded-xl text-xs font-bold hover:bg-stone-200 dark:hover:bg-[#243329] border border-stone-200 dark:border-[#243329] shadow-xs cursor-pointer inline-flex items-center gap-1"
        >
          <Minus class="w-3.5 h-3.5 text-[#18221B] dark:text-[#F0F4F1]" :stroke-width="2.5" />
          <span>Catat Pengeluaran</span>
        </button>
      </div>
    </div>
  </div>
</template>
