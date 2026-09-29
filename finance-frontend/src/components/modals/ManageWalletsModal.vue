<script setup lang="ts">
import { ref, watch } from 'vue';
import {
  financeApi,
  type WalletAccount,
  type CreateWalletPayload,
  type UpdateWalletPayload,
} from '../../api/services';
import { formatRupiah } from '../../utils/format';
import { useToast } from '../../composables/useToast';
import { useConfirm } from '../../composables/useConfirm';
import {
  X,
  Wallet,
  Building2,
  Smartphone,
  Banknote,
  TrendingUp,
  Plus,
  Pencil,
  Archive,
  Check,
  Info,
  ArrowRightLeft,
} from 'lucide-vue-next';

const props = defineProps<{
  show: boolean;
  wallets: WalletAccount[];
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'refresh'): void;
  (e: 'openTransfer'): void;
}>();

const toast = useToast();
const confirm = useConfirm();

const activeTab = ref<'list' | 'add'>('list');

// Form Tambah
const newName = ref('');
const newType = ref<'BANK' | 'E_WALLET' | 'CASH' | 'INVESTMENT'>('BANK');
const newAccountNumber = ref('');
const isSubmitting = ref(false);

// State Edit Inline
const editingId = ref<number | null>(null);
const editName = ref('');
const editType = ref<'BANK' | 'E_WALLET' | 'CASH' | 'INVESTMENT'>('BANK');
const editAccountNumber = ref('');
const isUpdating = ref(false);

const walletTypeMeta: Record<
  string,
  { label: string; icon: any; bg: string; text: string }
> = {
  BANK: {
    label: 'Bank Transfer',
    icon: Building2,
    bg: 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900/40',
    text: 'text-blue-700 dark:text-blue-300',
  },
  E_WALLET: {
    label: 'E-Wallet',
    icon: Smartphone,
    bg: 'bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-900/40',
    text: 'text-sky-700 dark:text-sky-300',
  },
  CASH: {
    label: 'Uang Tunai',
    icon: Banknote,
    bg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/40',
    text: 'text-amber-700 dark:text-amber-300',
  },
  INVESTMENT: {
    label: 'Investasi / Aset',
    icon: TrendingUp,
    bg: 'bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-900/40',
    text: 'text-purple-700 dark:text-purple-300',
  },
};

watch(
  () => props.show,
  (val) => {
    if (val) {
      activeTab.value = 'list';
      resetNewForm();
      cancelEdit();
    }
  },
);

const resetNewForm = () => {
  newName.value = '';
  newType.value = 'BANK';
  newAccountNumber.value = '';
};

const handleCreateWallet = async () => {
  if (!newName.value.trim()) {
    toast.error('Harap masukkan nama dompet atau rekening');
    return;
  }

  try {
    isSubmitting.value = true;
    const payload: CreateWalletPayload = {
      name: newName.value.trim(),
      type: newType.value,
      accountNumber: newAccountNumber.value.trim() || undefined,
    };

    await financeApi.createWallet(payload);
    toast.success(`Dompet '${newName.value.trim()}' berhasil ditambahkan!`);
    resetNewForm();
    activeTab.value = 'list';
    emit('refresh');
  } catch (err: any) {
    toast.error(
      err.response?.data?.message || 'Gagal menambahkan dompet baru',
    );
  } finally {
    isSubmitting.value = false;
  }
};

const startEdit = (wallet: WalletAccount) => {
  editingId.value = wallet.id;
  editName.value = wallet.name;
  editType.value = wallet.type;
  editAccountNumber.value = wallet.accountNumber || '';
};

const cancelEdit = () => {
  editingId.value = null;
  editName.value = '';
  editType.value = 'BANK';
  editAccountNumber.value = '';
};

const handleUpdateWallet = async (walletId: number) => {
  if (!editName.value.trim()) {
    toast.error('Nama dompet tidak boleh kosong');
    return;
  }

  try {
    isUpdating.value = true;
    const payload: UpdateWalletPayload = {
      name: editName.value.trim(),
      type: editType.value,
      accountNumber: editAccountNumber.value.trim() || undefined,
    };

    await financeApi.updateWallet(walletId, payload);
    toast.success('Informasi dompet berhasil diperbarui');
    cancelEdit();
    emit('refresh');
  } catch (err: any) {
    toast.error(
      err.response?.data?.message || 'Gagal memperbarui dompet',
    );
  } finally {
    isUpdating.value = false;
  }
};

const handleArchive = async (wallet: WalletAccount) => {
  if (wallet.balance !== '0' && wallet.balance !== '0n') {
    toast.warning(
      `Dompet '${wallet.name}' masih memiliki saldo (${formatRupiah(wallet.balance)}). Pindahkan saldo ke dompet lain terlebih dahulu.`,
    );
    return;
  }

  const ok = await confirm.ask({
    title: 'Arsipkan Akun Dompet',
    message: `Apakah Anda yakin ingin mengarsipkan '${wallet.name}'? Akun ini tidak akan muncul lagi di pilihan transaksi.`,
    confirmText: 'Ya, Arsipkan',
    cancelText: 'Batal',
    type: 'danger',
  });

  if (!ok) return;

  try {
    await financeApi.archiveWallet(wallet.id);
    toast.success(`Dompet '${wallet.name}' berhasil diarsipkan`);
    emit('refresh');
  } catch (err: any) {
    toast.error(
      err.response?.data?.message || 'Gagal mengarsipkan dompet',
    );
  }
};
</script>

<template>
  <div
    v-if="show"
    class="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center p-0 sm:p-4 glass-modal-backdrop"
    role="dialog"
    aria-modal="true"
    aria-labelledby="manage-wallets-title"
    @click.self="emit('close')"
  >
    <div
      class="bg-white dark:bg-[#0D1524] rounded-t-3xl sm:rounded-2xl max-h-[92dvh] sm:max-h-[85vh] flex flex-col shadow-2xl border border-slate-200/90 dark:border-slate-800 w-full max-w-xl mx-auto overflow-hidden animate-in fade-in zoom-in-95 duration-200"
    >
      <!-- Modal Header (shrink-0) -->
      <div
        class="shrink-0 flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-[#0D1524]"
      >
        <div class="flex items-center gap-3">
          <div
            class="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/50 flex items-center justify-center shadow-xs"
          >
            <Wallet class="w-5 h-5" :stroke-width="2.2" />
          </div>
          <div>
            <h3 id="manage-wallets-title" class="text-base font-extrabold text-slate-900 dark:text-slate-100">
              Dompet & Rekening Fisik
            </h3>
            <p class="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Alokasikan saldo ke wadah bank, e-wallet, atau kas tunai
            </p>
          </div>
        </div>
        <button
          type="button"
          @click="emit('close')"
          aria-label="Tutup dialog dompet dan rekening"
          class="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 tactile-btn transition-colors cursor-pointer"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Tab Switcher -->
      <div class="shrink-0 px-5 pt-3 pb-2 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2 bg-slate-50/50 dark:bg-[#0D1524]">
        <button
          type="button"
          @click="activeTab = 'list'"
          :class="[
            'px-4 py-2 rounded-xl text-xs font-bold transition-all tactile-btn cursor-pointer',
            activeTab === 'list'
              ? 'bg-[#0B192C] text-white dark:bg-blue-600 dark:text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800',
          ]"
        >
          Daftar Akun ({{ wallets.length }})
        </button>
        <button
          type="button"
          @click="activeTab = 'add'"
          :class="[
            'inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all tactile-btn cursor-pointer',
            activeTab === 'add'
              ? 'bg-[#0B192C] text-white dark:bg-blue-600 dark:text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800',
          ]"
        >
          <Plus class="w-3.5 h-3.5" :stroke-width="2.5" />
          <span>Tambah Akun Baru</span>
        </button>
      </div>

      <!-- Modal Body (overflow-y-auto) -->
      <div class="flex-1 overflow-y-auto overscroll-contain p-5 space-y-4">
        <!-- TAB 1: DAFTAR AKUN -->
        <div v-if="activeTab === 'list'" class="space-y-3">
          <div
            v-for="wallet in wallets"
            :key="wallet.id"
            class="p-4 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#070B14] hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
          >
            <!-- Mode Normal -->
            <div
              v-if="editingId !== wallet.id"
              class="flex items-center justify-between gap-3"
            >
              <div class="flex items-center gap-3 min-w-0">
                <div
                  :class="[
                    'w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border',
                    walletTypeMeta[wallet.type]?.bg || 'bg-slate-100 border-slate-200 dark:bg-slate-800 dark:border-slate-700',
                    walletTypeMeta[wallet.type]?.text || 'text-slate-700 dark:text-slate-300',
                  ]"
                >
                  <component
                    :is="walletTypeMeta[wallet.type]?.icon || Wallet"
                    class="w-5 h-5"
                    :stroke-width="2"
                  />
                </div>
                <div class="min-w-0">
                  <div class="flex items-center gap-2">
                    <span class="font-extrabold text-sm text-slate-900 dark:text-slate-100 truncate">
                      {{ wallet.name }}
                    </span>
                    <span
                      class="px-2 py-0.5 rounded-md text-[10px] font-bold border"
                      :class="[
                        walletTypeMeta[wallet.type]?.bg || 'bg-slate-100 border-slate-200 dark:bg-slate-800 dark:border-slate-700',
                        walletTypeMeta[wallet.type]?.text || 'text-slate-700 dark:text-slate-300',
                      ]"
                    >
                      {{ walletTypeMeta[wallet.type]?.label || wallet.type }}
                    </span>
                  </div>
                  <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                    {{ wallet.accountNumber ? `No: ${wallet.accountNumber}` : 'Tanpa nomor rekening' }}
                  </p>
                </div>
              </div>

              <!-- Saldo & Aksi -->
              <div class="text-right shrink-0 flex items-center gap-3">
                <div>
                  <div class="text-sm sm:text-base font-black text-slate-900 dark:text-slate-100 tabular-nums">
                    {{ formatRupiah(wallet.balance) }}
                  </div>
                  <span class="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Saldo tersimpan</span>
                </div>

                <div class="flex items-center gap-1">
                  <button
                    type="button"
                    @click="startEdit(wallet)"
                    title="Ubah info dompet"
                    class="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 tactile-btn transition-colors cursor-pointer"
                  >
                    <Pencil class="w-3.5 h-3.5" />
                  </button>

                  <button
                    v-if="wallets.length > 1"
                    type="button"
                    @click="handleArchive(wallet)"
                    title="Arsipkan dompet"
                    class="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 tactile-btn transition-colors cursor-pointer"
                  >
                    <Archive class="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            <!-- Mode Edit Inline -->
            <div v-else class="space-y-3 pt-1">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label class="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Nama Dompet
                  </label>
                  <input
                    aria-label="Ubah nama dompet"
                    type="text"
                    v-model="editName"
                    class="w-full px-3 py-2 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#070B14] focus:bg-white dark:focus:bg-[#070B14] text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 dark:focus:border-blue-500"
                    placeholder="misal: BCA Operasional"
                  />
                </div>

                <div>
                  <label class="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Tipe Wadah
                  </label>
                  <select
                    aria-label="Ubah tipe wadah dompet"
                    v-model="editType"
                    class="w-full px-3 py-2 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#070B14] focus:bg-white dark:focus:bg-[#070B14] text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 dark:focus:border-blue-500"
                  >
                    <option value="BANK">Bank Transfer</option>
                    <option value="E_WALLET">E-Wallet (GoPay/OVO/ShopeePay)</option>
                    <option value="CASH">Kas Tunai (Dompet)</option>
                    <option value="INVESTMENT">Investasi / Reksadana</option>
                  </select>
                </div>
              </div>

              <div>
                <label class="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nomor Rekening / Akun (Opsional)
                </label>
                <input
                  aria-label="Ubah nomor rekening atau akun dompet"
                  type="text"
                  v-model="editAccountNumber"
                  class="w-full px-3 py-2 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#070B14] focus:bg-white dark:focus:bg-[#070B14] text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 dark:focus:border-blue-500"
                  placeholder="misal: 1234567890 atau 08123456789"
                />
              </div>

              <div class="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  @click="cancelEdit"
                  class="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 tactile-btn cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  :disabled="isUpdating"
                  @click="handleUpdateWallet(wallet.id)"
                  class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-extrabold bg-[#0B192C] dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-500 text-white tactile-btn cursor-pointer disabled:opacity-50"
                >
                  <Check class="w-3.5 h-3.5" />
                  <span>{{ isUpdating ? 'Menyimpan...' : 'Simpan Perubahan' }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- TAB 2: TAMBAH DOMPET BARU -->
        <div v-else class="space-y-4">
          <div class="p-3.5 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800/40 text-xs text-blue-900 dark:text-blue-300 leading-relaxed flex items-start gap-2.5">
            <Info class="w-4 h-4 shrink-0 mt-0.5 text-blue-600 dark:text-blue-400" :stroke-width="2" />
            <div>
              <strong>Catatan:</strong> Dompet baru dibuat dengan saldo <strong>Rp 0</strong>. Untuk mengisi saldo dompet baru, gunakan fitur <strong>Transfer Antar Dompet</strong> dari dompet utama yang sudah memiliki saldo, atau catat pemasukan baru ke dompet ini.
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-900 dark:text-slate-100 mb-1.5">
              Nama Dompet / Rekening <span class="text-rose-500">*</span>
            </label>
            <input
              aria-label="Nama dompet atau rekening baru"
              type="text"
              v-model="newName"
              placeholder="misal: BCA Utama, Dompet Saku, atau GoPay"
              class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#070B14] focus:bg-white dark:focus:bg-[#070B14] text-slate-900 dark:text-slate-100 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 dark:focus:border-blue-500 transition-all"
            />
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-900 dark:text-slate-100 mb-1.5">
              Tipe Wadah Fisik <span class="text-rose-500">*</span>
            </label>
            <div class="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                v-for="(meta, typeKey) in walletTypeMeta"
                :key="typeKey"
                @click="newType = typeKey as any"
                :class="[
                  'flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all tactile-btn cursor-pointer',
                  newType === typeKey
                    ? 'border-blue-600 dark:border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 ring-2 ring-blue-500/20'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070B14] hover:bg-slate-50 dark:hover:bg-slate-800/40',
                ]"
              >
                <component
                  :is="meta.icon"
                  class="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0"
                  :stroke-width="2"
                />
                <div class="min-w-0">
                  <span class="block text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                    {{ meta.label }}
                  </span>
                </div>
              </button>
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-900 dark:text-slate-100 mb-1.5">
              Nomor Rekening / No. HP E-Wallet (Opsional)
            </label>
            <input
              aria-label="Nomor rekening atau HP e-wallet baru"
              type="text"
              v-model="newAccountNumber"
              placeholder="misal: 8820192301 atau 081299998888"
              class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#070B14] focus:bg-white dark:focus:bg-[#070B14] text-slate-900 dark:text-slate-100 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 dark:focus:border-blue-500 transition-all"
            />
          </div>
        </div>
      </div>

      <!-- Modal Footer (shrink-0) -->
      <div
        class="shrink-0 p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-[#0D1524] flex items-center justify-between gap-3"
      >
        <button
          type="button"
          @click="() => { emit('close'); emit('openTransfer'); }"
          class="tactile-btn inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-blue-700 dark:text-blue-400 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/50 dark:hover:bg-blue-900/50 border border-blue-200 dark:border-blue-800/60 cursor-pointer transition-colors"
        >
          <ArrowRightLeft class="w-3.5 h-3.5" :stroke-width="2.2" />
          <span>Pindah Dana / Transfer</span>
        </button>

        <div class="flex items-center gap-2">
          <button
            type="button"
            @click="emit('close')"
            class="tactile-btn px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200/70 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Tutup
          </button>

          <button
            v-if="activeTab === 'add'"
            type="button"
            :disabled="isSubmitting || !newName.trim()"
            @click="handleCreateWallet"
            class="tactile-btn inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-extrabold bg-[#0B192C] hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500 text-white shadow-sm transition-all cursor-pointer disabled:opacity-50"
          >
            <Check class="w-4 h-4 text-white" :stroke-width="2.5" />
            <span>{{ isSubmitting ? 'Menyimpan...' : 'Simpan Dompet' }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
