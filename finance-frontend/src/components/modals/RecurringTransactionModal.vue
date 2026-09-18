<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import {
  financeApi,
  type RecurringTransaction,
  type Category,
  type IncomeSource,
} from '../../api/services';
import { formatRupiah, formatDate } from '../../utils/format';
import { useToast } from '../../composables/useToast';
import { useConfirm } from '../../composables/useConfirm';
import {
  Clock,
  Plus,
  Repeat,
  X,
  Play,
  Pause,
  Trash2,
  Calendar,
  ArrowUpRight,
  ArrowDownLeft,
  Sparkles,
} from 'lucide-vue-next';

const props = defineProps<{
  show: boolean;
  categories: Category[];
  incomeSources: IncomeSource[];
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'changed'): void;
}>();

const toast = useToast();
const confirmDialog = useConfirm();

const activeTab = ref<'list' | 'add'>('list');
const loadingList = ref(false);
const submitting = ref(false);
const recurringList = ref<RecurringTransaction[]>([]);

// Form State
const formType = ref<'expense' | 'income'>('expense');
const formAmount = ref('');
const formCategoryId = ref<number | ''>('');
const formIncomeSourceId = ref<number | ''>('');
const formFrequency = ref<'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY'>('MONTHLY');
const formInterval = ref(1);
const formDayOfExecution = ref(new Date().getDate());
const formStartDate = ref(new Date().toISOString().substring(0, 10));
const formEndDate = ref('');
const formNote = ref('');

// Field Validation Touched State
const touched = ref({
  amount: false,
  category: false,
  incomeSource: false,
});

// Errors
const errors = computed(() => {
  const errs: Record<string, string> = {};
  const cleanAmount = formAmount.value.replace(/[^0-9]/g, '');
  if (!cleanAmount || Number(cleanAmount) <= 0) {
    errs.amount = 'Nominal harus lebih besar dari Rp 0';
  }

  if (formType.value === 'expense' && !formCategoryId.value) {
    errs.category = 'Pilih kategori pengeluaran';
  }

  if (formType.value === 'income' && !formIncomeSourceId.value) {
    errs.incomeSource = 'Pilih sumber pemasukan';
  }

  return errs;
});

const isFormValid = computed(() => Object.keys(errors.value).length === 0);

const expenseCategories = computed(() =>
  props.categories.filter((c) => c.type === 'expense' && !c.isArchived),
);

const activeIncomeSources = computed(() =>
  props.incomeSources.filter((s) => !s.isArchived),
);

const loadRecurringList = async () => {
  loadingList.value = true;
  try {
    const res = await financeApi.getRecurringTransactions();
    recurringList.value = res.data.data;
  } catch (err: any) {
    toast.error(err.response?.data?.message || 'Gagal memuat jadwal transaksi');
  } finally {
    loadingList.value = false;
  }
};

watch(
  () => props.show,
  (newVal) => {
    if (newVal) {
      activeTab.value = 'list';
      resetForm();
      loadRecurringList();
    }
  },
);

const resetForm = () => {
  formType.value = 'expense';
  formAmount.value = '';
  formCategoryId.value = expenseCategories.value[0]?.id || '';
  formIncomeSourceId.value = activeIncomeSources.value[0]?.id || '';
  formFrequency.value = 'MONTHLY';
  formInterval.value = 1;
  formDayOfExecution.value = new Date().getDate();
  formStartDate.value = new Date().toISOString().substring(0, 10);
  formEndDate.value = '';
  formNote.value = '';
  touched.value = { amount: false, category: false, incomeSource: false };
};

watch(formFrequency, (newFreq) => {
  if (newFreq === 'DAILY') {
    formDayOfExecution.value = 1;
  } else if (newFreq === 'WEEKLY') {
    if (formDayOfExecution.value > 7 || formDayOfExecution.value < 1) {
      formDayOfExecution.value = 1; // Default to Senin
    }
  } else if (newFreq === 'MONTHLY') {
    if (formDayOfExecution.value < 1 || formDayOfExecution.value > 31) {
      formDayOfExecution.value = new Date().getDate();
    }
  }
});

const handleAmountInput = (e: Event) => {
  const val = (e.target as HTMLInputElement).value;
  const num = val.replace(/[^0-9]/g, '');
  formAmount.value = num ? Number(num).toLocaleString('id-ID') : '';
};

const handleCreate = async () => {
  touched.value = { amount: true, category: true, incomeSource: true };
  if (!isFormValid.value) {
    toast.error('Periksa kembali kolom yang belum valid');
    return;
  }

  const cleanAmount = formAmount.value.replace(/[^0-9]/g, '');

  submitting.value = true;
  try {
    await financeApi.createRecurringTransaction({
      type: formType.value,
      amount: cleanAmount,
      categoryId: formType.value === 'expense' ? Number(formCategoryId.value) : undefined,
      incomeSourceId: formType.value === 'income' ? Number(formIncomeSourceId.value) : undefined,
      frequency: formFrequency.value,
      interval: Number(formInterval.value) || 1,
      dayOfExecution: Number(formDayOfExecution.value),
      startDate: formStartDate.value,
      endDate: formEndDate.value || undefined,
      note: formNote.value.trim() || undefined,
      isActive: true,
    });

    toast.success('Jadwal transaksi rutin berhasil ditambahkan');
    emit('changed');
    activeTab.value = 'list';
    resetForm();
    await loadRecurringList();
  } catch (err: any) {
    toast.error(err.response?.data?.message || 'Gagal menambahkan jadwal rutin');
  } finally {
    submitting.value = false;
  }
};

const handleToggleActive = async (item: RecurringTransaction) => {
  const nextState = !item.isActive;
  try {
    await financeApi.updateRecurringTransaction(item.id, { isActive: nextState });
    item.isActive = nextState;
    toast.info(nextState ? 'Jadwal rutin diaktifkan kembali' : 'Jadwal rutin dijeda sementara');
    emit('changed');
  } catch (err: any) {
    toast.error(err.response?.data?.message || 'Gagal mengubah status jadwal');
  }
};

const handleExecuteNow = async (item: RecurringTransaction) => {
  const confirmed = await confirmDialog.ask({
    title: 'Catat Transaksi Sekarang?',
    message: `Catat transaksi "${item.note || (item.type === 'expense' ? 'Tagihan Rutin' : 'Pemasukan Rutin')}" sebesar ${formatRupiah(item.amount)} ke buku kas saat ini? Tanggal jadwal berikutnya akan otomatis dimajukan.`,
    confirmText: 'Ya, Catat Sekarang',
    cancelText: 'Batal',
    type: 'warning',
  });

  if (!confirmed) return;

  try {
    await financeApi.executeRecurringNow(item.id);
    toast.success('Transaksi berhasil dicatat dan jadwal telah dimajukan');
    emit('changed');
    await loadRecurringList();
  } catch (err: any) {
    toast.error(err.response?.data?.message || 'Gagal mengeksekusi transaksi');
  }
};

const handleDelete = async (item: RecurringTransaction) => {
  const confirmed = await confirmDialog.ask({
    title: 'Hapus Jadwal Rutin?',
    message: `Apakah Anda yakin ingin menghapus jadwal "${item.note || 'Transaksi Rutin'}"? Riwayat transaksi sebelumnya yang sudah tercatat tidak akan terhapus.`,
    confirmText: 'Hapus Jadwal',
    cancelText: 'Batal',
    type: 'danger',
  });

  if (!confirmed) return;

  try {
    await financeApi.deleteRecurringTransaction(item.id);
    toast.success('Jadwal transaksi rutin berhasil dihapus');
    emit('changed');
    await loadRecurringList();
  } catch (err: any) {
    toast.error(err.response?.data?.message || 'Gagal menghapus jadwal');
  }
};

const getRelativeDays = (dateStr: string): string => {
  const target = new Date(dateStr);
  const now = new Date();
  target.setUTCHours(0, 0, 0, 0);
  now.setUTCHours(0, 0, 0, 0);

  const diffDays = Math.round((target.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
  if (diffDays === 0) return 'Hari ini';
  if (diffDays === 1) return 'Besok';
  if (diffDays === -1) return 'Kemarin';
  if (diffDays > 1) return `${diffDays} hari lagi`;
  return `${Math.abs(diffDays)} hari lalu`;
};
</script>

<template>
  <div
    v-if="show"
    class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 glass-modal-backdrop overflow-y-auto"
    role="dialog"
    aria-modal="true"
  >
    <div
      class="bg-white rounded-2xl border border-stone-200/90 shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden text-[#18221B] animate-in fade-in zoom-in-95 duration-150"
    >
      <!-- Header -->
      <div class="px-5 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-xl bg-[#183D2B] text-[#B8DF38] flex items-center justify-center shadow-xs">
            <Clock class="w-4 h-4" :stroke-width="2.2" />
          </div>
          <div>
            <h3 class="text-base font-extrabold text-[#18221B]">Transaksi Berulang & Tagihan Rutin</h3>
            <p class="text-xs text-stone-500 font-normal">
              Otomatisasi pengeluaran dan pemasukan rutin dengan pengingat jatuh tempo
            </p>
          </div>
        </div>

        <button
          type="button"
          @click="emit('close')"
          class="tactile-btn p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition cursor-pointer"
          title="Tutup dialog"
        >
          <X class="w-4 h-4" />
        </button>
      </div>

      <!-- Tab Switcher -->
      <div class="px-5 pt-3 pb-1 border-b border-stone-100 flex gap-2">
        <button
          type="button"
          @click="activeTab = 'list'"
          class="tactile-btn px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
          :class="activeTab === 'list' ? 'bg-[#183D2B] text-white shadow-xs' : 'text-stone-600 hover:bg-stone-100'"
        >
          <Repeat class="w-3.5 h-3.5" />
          <span>Daftar Jadwal ({{ recurringList.length }})</span>
        </button>
        <button
          type="button"
          @click="activeTab = 'add'"
          class="tactile-btn px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
          :class="activeTab === 'add' ? 'bg-[#183D2B] text-white shadow-xs' : 'text-stone-600 hover:bg-stone-100'"
        >
          <Plus class="w-3.5 h-3.5" />
          <span>Tambah Jadwal Baru</span>
        </button>
      </div>

      <!-- Body Container -->
      <div class="flex-1 overflow-y-auto p-5 space-y-4">
        <!-- TAB 1: DAFTAR JADWAL -->
        <template v-if="activeTab === 'list'">
          <div v-if="loadingList" class="py-12 text-center text-stone-400 text-xs flex flex-col items-center gap-2">
            <Clock class="w-6 h-6 animate-spin text-stone-300" />
            <span>Memuat jadwal transaksi...</span>
          </div>

          <div
            v-else-if="recurringList.length === 0"
            class="py-12 px-4 text-center rounded-2xl bg-[#F3F5EF] border border-dashed border-stone-200/90 space-y-3"
          >
            <div class="w-12 h-12 mx-auto rounded-2xl bg-white shadow-xs flex items-center justify-center text-stone-400">
              <Clock class="w-6 h-6" />
            </div>
            <div>
              <h4 class="text-sm font-bold text-stone-800">Belum Ada Transaksi Rutin</h4>
              <p class="text-xs text-stone-500 max-w-sm mx-auto mt-1">
                Jadwalkan tagihan bulanan (sewa kost, internet PLN) atau gaji rutin agar tercatat otomatis tepat waktu.
              </p>
            </div>
            <button
              type="button"
              @click="activeTab = 'add'"
              class="tactile-btn inline-flex items-center gap-1.5 px-4 py-2 bg-[#B8DF38] hover:bg-[#a5cb2c] text-[#183D2B] font-bold text-xs rounded-xl shadow-xs cursor-pointer"
            >
              <Plus class="w-3.5 h-3.5" />
              <span>Buat Jadwal Pertama</span>
            </button>
          </div>

          <div v-else class="space-y-3">
            <div
              v-for="item in recurringList"
              :key="item.id"
              class="p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              :class="item.isActive
                ? 'bg-white border-stone-200/90 hover:border-emerald-700/40 shadow-xs'
                : 'bg-stone-50/70 border-stone-200/60 opacity-75'"
            >
              <div class="flex items-start gap-3 min-w-0">
                <div
                  class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                  :class="item.type === 'income' ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'"
                >
                  <ArrowUpRight v-if="item.type === 'income'" class="w-4 h-4" :stroke-width="2.2" />
                  <ArrowDownLeft v-else class="w-4 h-4" :stroke-width="2.2" />
                </div>

                <div class="min-w-0 space-y-0.5">
                  <div class="flex items-center gap-2 flex-wrap">
                    <span class="text-sm font-extrabold text-[#18221B] truncate">
                      {{ item.note || (item.type === 'expense' ? 'Tagihan Rutin' : 'Pemasukan Rutin') }}
                    </span>
                    <span
                      class="px-2 py-0.5 text-[10px] font-bold rounded-md"
                      :class="item.isActive
                        ? 'bg-emerald-100/70 text-emerald-900 border border-emerald-300/60'
                        : 'bg-stone-200/80 text-stone-700'"
                    >
                      {{ item.isActive ? 'Aktif' : 'Dijeda' }}
                    </span>
                  </div>

                  <div class="flex items-center gap-2 text-xs text-stone-500 flex-wrap">
                    <span class="font-semibold text-stone-700">
                      {{ item.category?.name || item.incomeSource?.name || '-' }}
                    </span>
                    <span>•</span>
                    <span class="capitalize">
                      {{ item.frequency === 'MONTHLY' ? `Bulanan (Tgl ${item.dayOfExecution})` : item.frequency }}
                    </span>
                  </div>

                  <div class="flex items-center gap-1.5 text-[11px] font-medium pt-1">
                    <Calendar class="w-3.5 h-3.5 text-stone-400" />
                    <span class="text-stone-600">
                      Jatuh tempo: <strong class="text-stone-900 font-bold tabular-nums">{{ formatDate(item.nextRunDate) }}</strong>
                    </span>
                    <span
                      class="ml-1 px-1.5 py-0.2 text-[10px] font-bold rounded"
                      :class="getRelativeDays(item.nextRunDate).includes('lalu')
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-900'"
                    >
                      {{ getRelativeDays(item.nextRunDate) }}
                    </span>
                  </div>
                </div>
              </div>

              <div class="flex items-center justify-between sm:justify-end gap-3 sm:shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-100">
                <div class="text-left sm:text-right">
                  <div
                    class="text-sm font-extrabold tabular-nums"
                    :class="item.type === 'income' ? 'text-emerald-800' : 'text-[#183D2B]'"
                  >
                    {{ item.type === 'income' ? '+' : '-' }}{{ formatRupiah(item.amount) }}
                  </div>
                  <div v-if="item.lastExecutedAt" class="text-[10px] text-stone-400">
                    Terakhir: {{ formatDate(item.lastExecutedAt) }}
                  </div>
                </div>

                <div class="flex items-center gap-1.5">
                  <button
                    v-if="item.isActive"
                    type="button"
                    @click="handleExecuteNow(item)"
                    class="tactile-btn px-2.5 py-1.5 bg-[#183D2B] hover:bg-[#204e37] text-white text-xs font-bold rounded-xl flex items-center gap-1 shadow-2xs cursor-pointer"
                    title="Catat dan bayar sekarang"
                  >
                    <Play class="w-3.5 h-3.5 text-[#B8DF38] fill-current" />
                    <span class="hidden sm:inline">Bayar</span>
                  </button>

                  <button
                    type="button"
                    @click="handleToggleActive(item)"
                    class="tactile-btn p-2 rounded-xl text-stone-500 hover:text-stone-800 hover:bg-stone-100 border border-stone-200 transition cursor-pointer"
                    :title="item.isActive ? 'Jeda jadwal' : 'Aktifkan kembali'"
                  >
                    <Pause v-if="item.isActive" class="w-3.5 h-3.5" />
                    <Play v-else class="w-3.5 h-3.5 text-emerald-700" />
                  </button>

                  <button
                    type="button"
                    @click="handleDelete(item)"
                    class="tactile-btn p-2 rounded-xl text-rose-600 hover:bg-rose-50 border border-rose-200 transition cursor-pointer"
                    title="Hapus jadwal"
                  >
                    <Trash2 class="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </template>

        <!-- TAB 2: TAMBAH JADWAL BARU -->
        <template v-else>
          <form @submit.prevent="handleCreate" class="space-y-4">
            <!-- Tipe Selector -->
            <div>
              <label class="block text-xs font-bold text-stone-700 mb-1.5">Jenis Transaksi</label>
              <div class="grid grid-cols-2 gap-2 p-1 bg-stone-100 rounded-xl">
                <button
                  type="button"
                  @click="formType = 'expense'"
                  class="tactile-btn py-2 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer"
                  :class="formType === 'expense' ? 'bg-white text-rose-700 shadow-xs' : 'text-stone-600 hover:text-stone-900'"
                >
                  <ArrowDownLeft class="w-3.5 h-3.5" />
                  <span>Pengeluaran Rutin</span>
                </button>
                <button
                  type="button"
                  @click="formType = 'income'"
                  class="tactile-btn py-2 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer"
                  :class="formType === 'income' ? 'bg-white text-emerald-800 shadow-xs' : 'text-stone-600 hover:text-stone-900'"
                >
                  <ArrowUpRight class="w-3.5 h-3.5" />
                  <span>Pemasukan Rutin</span>
                </button>
              </div>
            </div>

            <!-- Deskripsi / Nama Tagihan -->
            <div>
              <label for="rec-note" class="block text-xs font-bold text-stone-700 mb-1">Nama Tagihan / Keterangan</label>
              <input
                id="rec-note"
                v-model="formNote"
                type="text"
                placeholder="Contoh: Sewa Rumah, Internet Indihome, Gaji Bulanan"
                class="w-full px-3.5 py-2.5 text-xs bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#183D2B]/20 focus:border-[#183D2B]"
              />
            </div>

            <!-- Nominal -->
            <div>
              <label for="rec-amount" class="block text-xs font-bold text-stone-700 mb-1">Nominal Transaksi (Rp)</label>
              <input
                id="rec-amount"
                :value="formAmount"
                @input="handleAmountInput"
                @blur="touched.amount = true"
                type="text"
                inputmode="numeric"
                placeholder="0"
                class="w-full px-3.5 py-2.5 text-sm font-bold tabular-nums bg-white border rounded-xl focus:outline-none transition"
                :class="touched.amount && errors.amount
                  ? 'border-rose-400 focus:ring-2 focus:ring-rose-200 focus:border-rose-500'
                  : 'border-stone-300 focus:ring-2 focus:ring-[#183D2B]/20 focus:border-[#183D2B]'"
              />
              <p v-if="touched.amount && errors.amount" class="text-xs text-rose-600 font-semibold mt-1">
                {{ errors.amount }}
              </p>
            </div>

            <!-- Kategori / Sumber -->
            <div v-if="formType === 'expense'">
              <label for="rec-category" class="block text-xs font-bold text-stone-700 mb-1">Kategori Pengeluaran</label>
              <select
                id="rec-category"
                v-model="formCategoryId"
                @blur="touched.category = true"
                class="w-full px-3.5 py-2.5 text-xs bg-white border rounded-xl focus:outline-none transition"
                :class="touched.category && errors.category
                  ? 'border-rose-400 focus:ring-2 focus:ring-rose-200 focus:border-rose-500'
                  : 'border-stone-300 focus:ring-2 focus:ring-[#183D2B]/20 focus:border-[#183D2B]'"
              >
                <option value="" disabled>Pilih Kategori</option>
                <option v-for="c in expenseCategories" :key="c.id" :value="c.id">
                  {{ c.name }} ({{ c.group === 'NEED' ? 'Kebutuhan' : 'Keinginan' }})
                </option>
              </select>
              <p v-if="touched.category && errors.category" class="text-xs text-rose-600 font-semibold mt-1">
                {{ errors.category }}
              </p>
            </div>

            <div v-else>
              <label for="rec-source" class="block text-xs font-bold text-stone-700 mb-1">Sumber Pemasukan</label>
              <select
                id="rec-source"
                v-model="formIncomeSourceId"
                @blur="touched.incomeSource = true"
                class="w-full px-3.5 py-2.5 text-xs bg-white border rounded-xl focus:outline-none transition"
                :class="touched.incomeSource && errors.incomeSource
                  ? 'border-rose-400 focus:ring-2 focus:ring-rose-200 focus:border-rose-500'
                  : 'border-stone-300 focus:ring-2 focus:ring-[#183D2B]/20 focus:border-[#183D2B]'"
              >
                <option value="" disabled>Pilih Sumber Pemasukan</option>
                <option v-for="s in activeIncomeSources" :key="s.id" :value="s.id">
                  {{ s.name }}
                </option>
              </select>
              <p v-if="touched.incomeSource && errors.incomeSource" class="text-xs text-rose-600 font-semibold mt-1">
                {{ errors.incomeSource }}
              </p>
            </div>

            <!-- Frekuensi & Tanggal Jatuh Tempo / Jadwal Rutin -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label for="rec-freq" class="block text-xs font-bold text-stone-700 mb-1">Frekuensi Berulang</label>
                <select
                  id="rec-freq"
                  v-model="formFrequency"
                  class="w-full px-3.5 py-2.5 text-xs bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#183D2B]/20 focus:border-[#183D2B]"
                >
                  <option value="MONTHLY">Tiap Bulan (Bulanan)</option>
                  <option value="WEEKLY">Tiap Minggu (Mingguan)</option>
                  <option value="DAILY">Tiap Hari (Harian)</option>
                  <option value="YEARLY">Tiap Tahun (Tahunan)</option>
                </select>
              </div>

              <!-- 1. Kondisional Bulanan: Tanggal Jatuh Tempo / Terima -->
              <div v-if="formFrequency === 'MONTHLY'">
                <label for="rec-day" class="block text-xs font-bold text-stone-700 mb-1">
                  {{ formType === 'expense' ? 'Jatuh Tempo Tiap Tanggal (1 - 31)' : 'Tanggal Terima Tiap Bulan (1 - 31)' }}
                </label>
                <input
                  id="rec-day"
                  v-model.number="formDayOfExecution"
                  type="number"
                  min="1"
                  max="31"
                  placeholder="Contoh: 15"
                  class="w-full px-3.5 py-2.5 text-xs bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#183D2B]/20 focus:border-[#183D2B]"
                />
                <p class="text-[11px] text-stone-500 mt-1 font-normal">
                  {{ formType === 'expense'
                    ? `Tagihan akan jatuh tempo setiap tanggal ${formDayOfExecution || 1} bulanan.`
                    : `Pemasukan rutin masuk setiap tanggal ${formDayOfExecution || 1} bulanan.` }}
                </p>
              </div>

              <!-- 2. Kondisional Mingguan: Pilihan Hari (Senin - Minggu) -->
              <div v-else-if="formFrequency === 'WEEKLY'">
                <label for="rec-day-weekly" class="block text-xs font-bold text-stone-700 mb-1">
                  {{ formType === 'expense' ? 'Hari Pembayaran Tiap Minggu' : 'Hari Terima Tiap Minggu' }}
                </label>
                <select
                  id="rec-day-weekly"
                  v-model.number="formDayOfExecution"
                  class="w-full px-3.5 py-2.5 text-xs bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#183D2B]/20 focus:border-[#183D2B]"
                >
                  <option :value="1">Setiap hari Senin</option>
                  <option :value="2">Setiap hari Selasa</option>
                  <option :value="3">Setiap hari Rabu</option>
                  <option :value="4">Setiap hari Kamis</option>
                  <option :value="5">Setiap hari Jumat</option>
                  <option :value="6">Setiap hari Sabtu</option>
                  <option :value="7">Setiap hari Minggu</option>
                </select>
                <p class="text-[11px] text-stone-500 mt-1 font-normal">
                  Transaksi otomatis dicatat setiap minggu pada hari yang dipilih.
                </p>
              </div>

              <!-- 3. Kondisional Harian -->
              <div v-else-if="formFrequency === 'DAILY'" class="flex flex-col justify-end">
                <div class="px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-600 flex items-center gap-2">
                  <Clock class="w-4 h-4 text-[#183D2B] shrink-0" />
                  <span>Transaksi akan dicatat otomatis <strong>setiap hari</strong>.</span>
                </div>
              </div>

              <!-- 4. Kondisional Tahunan -->
              <div v-else-if="formFrequency === 'YEARLY'" class="flex flex-col justify-end">
                <div class="px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-600 flex items-center gap-2">
                  <Calendar class="w-4 h-4 text-[#183D2B] shrink-0" />
                  <span>Jatuh tempo <strong>setahun sekali</strong> mengikuti tanggal mulai.</span>
                </div>
              </div>
            </div>

            <!-- Tanggal Mulai & Akhir -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label for="rec-start" class="block text-xs font-bold text-stone-700 mb-1">Mulai Berlaku Sejak</label>
                <input
                  id="rec-start"
                  v-model="formStartDate"
                  type="date"
                  class="w-full px-3.5 py-2.5 text-xs bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#183D2B]/20 focus:border-[#183D2B]"
                />
                <p class="text-[11px] text-stone-500 mt-1 font-normal">
                  Kapan jadwal ini pertama kali aktif (default: hari ini).
                </p>
              </div>

              <div>
                <label for="rec-end" class="block text-xs font-bold text-stone-700 mb-1">
                  Berakhir Pada (Opsional)
                </label>
                <input
                  id="rec-end"
                  v-model="formEndDate"
                  type="date"
                  class="w-full px-3.5 py-2.5 text-xs bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#183D2B]/20 focus:border-[#183D2B]"
                />
                <p class="text-[11px] text-stone-500 mt-1 font-normal">
                  Khusus cicilan / kontrak tertentu. Kosongkan jika rutin selamanya.
                </p>
              </div>
            </div>

            <!-- Submit Button -->
            <div class="pt-3 border-t border-stone-100 flex items-center justify-end gap-2">
              <button
                type="button"
                @click="activeTab = 'list'"
                class="tactile-btn px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                :disabled="submitting"
                class="tactile-btn px-5 py-2 bg-[#B8DF38] hover:bg-[#a5cb2c] text-[#183D2B] font-extrabold text-xs rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Sparkles class="w-3.5 h-3.5" />
                <span>{{ submitting ? 'Menyimpan...' : 'Simpan Jadwal Rutin' }}</span>
              </button>
            </div>
          </form>
        </template>
      </div>
    </div>
  </div>
</template>
