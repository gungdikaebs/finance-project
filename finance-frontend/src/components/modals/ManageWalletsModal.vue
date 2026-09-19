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
    bg: 'bg-emerald-50 border-emerald-200',
    text: 'text-[#183D2B]',
  },
  E_WALLET: {
    label: 'E-Wallet',
    icon: Smartphone,
    bg: 'bg-sky-50 border-sky-200',
    text: 'text-sky-800',
  },
  CASH: {
    label: 'Uang Tunai',
    icon: Banknote,
    bg: 'bg-amber-50 border-amber-200',
    text: 'text-amber-800',
  },
  INVESTMENT: {
    label: 'Investasi / Aset',
    icon: TrendingUp,
    bg: 'bg-purple-50 border-purple-200',
    text: 'text-purple-800',
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
    @click.self="emit('close')"
  >
    <div
      class="bg-white dark:bg-[#16201A] rounded-t-3xl sm:rounded-2xl max-h-[92dvh] sm:max-h-[85vh] flex flex-col shadow-2xl border border-stone-200/80 dark:border-[#243329] w-full max-w-xl mx-auto overflow-hidden animate-in fade-in zoom-in-95 duration-200"
    >
      <!-- Modal Header (shrink-0) -->
      <div
        class="shrink-0 flex items-center justify-between p-5 border-b border-stone-100 dark:border-[#243329] bg-stone-50/50 dark:bg-[#16201A]"
      >
        <div class="flex items-center gap-3">
          <div
            class="w-10 h-10 rounded-xl bg-[#183D2B] text-[#B8DF38] flex items-center justify-center shadow-xs"
          >
            <Wallet class="w-5 h-5" :stroke-width="2.2" />
          </div>
          <div>
            <h3 class="text-base font-extrabold text-[#18221B] dark:text-[#F0F4F1]">
              Dompet & Rekening Fisik
            </h3>
            <p class="text-xs text-stone-500 dark:text-[#98A79D] font-medium">
              Alokasikan saldo ke wadah bank, e-wallet, atau kas tunai
            </p>
          </div>
        </div>
        <button
          type="button"
          @click="emit('close')"
          class="w-10 h-10 rounded-xl flex items-center justify-center text-stone-400 hover:text-stone-700 dark:hover:text-[#F0F4F1] hover:bg-stone-100 dark:hover:bg-[#243329] tactile-btn transition-colors cursor-pointer"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Tab Switcher -->
      <div class="shrink-0 px-5 pt-3 pb-2 border-b border-stone-100 dark:border-[#243329] flex items-center gap-2">
        <button
          type="button"
          @click="activeTab = 'list'"
          :class="[
            'px-4 py-2 rounded-xl text-xs font-bold transition-all tactile-btn cursor-pointer',
            activeTab === 'list'
              ? 'bg-[#183D2B] dark:bg-[#B8DF38] text-white dark:text-[#0E1410] shadow-xs'
              : 'text-stone-600 dark:text-[#98A79D] hover:bg-stone-100 dark:hover:bg-[#243329]',
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
              ? 'bg-[#183D2B] dark:bg-[#B8DF38] text-white dark:text-[#0E1410] shadow-xs'
              : 'text-stone-600 dark:text-[#98A79D] hover:bg-stone-100 dark:hover:bg-[#243329]',
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
            class="p-4 rounded-xl border border-stone-200/90 dark:border-[#243329] bg-stone-50/40 dark:bg-[#0E1410] hover:bg-stone-50 dark:hover:bg-[#121A15] transition-colors"
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
                    walletTypeMeta[wallet.type]?.bg || 'bg-stone-100 border-stone-200 dark:bg-[#1B2620] dark:border-[#243329]',
                    walletTypeMeta[wallet.type]?.text || 'text-stone-700 dark:text-stone-300',
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
                    <span class="font-extrabold text-sm text-[#18221B] dark:text-[#F0F4F1] truncate">
                      {{ wallet.name }}
                    </span>
                    <span
                      class="px-2 py-0.5 rounded-md text-[10px] font-bold border"
                      :class="[
                        walletTypeMeta[wallet.type]?.bg || 'bg-stone-100 border-stone-200 dark:bg-[#1B2620] dark:border-[#243329]',
                        walletTypeMeta[wallet.type]?.text || 'text-stone-700 dark:text-stone-300',
                      ]"
                    >
                      {{ walletTypeMeta[wallet.type]?.label || wallet.type }}
                    </span>
                  </div>
                  <p class="text-xs text-stone-500 dark:text-[#98A79D] mt-0.5 truncate">
                    {{ wallet.accountNumber ? `No: ${wallet.accountNumber}` : 'Tanpa nomor rekening' }}
                  </p>
                </div>
              </div>

              <!-- Saldo & Aksi -->
              <div class="text-right shrink-0 flex items-center gap-3">
                <div>
                  <div class="text-sm sm:text-base font-black text-[#183D2B] dark:text-[#B8DF38] tabular-nums">
                    {{ formatRupiah(wallet.balance) }}
                  </div>
                  <span class="text-[10px] text-stone-400 dark:text-[#98A79D] font-medium">Saldo tersimpan</span>
                </div>

                <div class="flex items-center gap-1">
                  <button
                    type="button"
                    @click="startEdit(wallet)"
                    title="Ubah info dompet"
                    class="w-8 h-8 rounded-lg flex items-center justify-center text-stone-400 hover:text-stone-800 dark:hover:text-[#F0F4F1] hover:bg-stone-200/60 dark:hover:bg-[#243329] tactile-btn transition-colors cursor-pointer"
                  >
                    <Pencil class="w-3.5 h-3.5" />
                  </button>

                  <button
                    v-if="wallets.length > 1"
                    type="button"
                    @click="handleArchive(wallet)"
                    title="Arsipkan dompet"
                    class="w-8 h-8 rounded-lg flex items-center justify-center text-stone-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 tactile-btn transition-colors cursor-pointer"
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
                  <label class="block text-[11px] font-bold text-stone-600 dark:text-[#F0F4F1] mb-1">
                    Nama Dompet
                  </label>
                  <input
                    type="text"
                    v-model="editName"
                    class="w-full px-3 py-2 text-xs font-semibold rounded-lg border border-stone-300 dark:border-[#243329] dark:bg-[#0E1410] dark:text-[#F0F4F1] focus:outline-none focus:ring-2 focus:ring-[#183D2B] dark:focus:ring-[#B8DF38]"
                    placeholder="misal: BCA Operasional"
                  />
                </div>

                <div>
                  <label class="block text-[11px] font-bold text-stone-600 dark:text-[#F0F4F1] mb-1">
                    Tipe Wadah
                  </label>
                  <select
                    v-model="editType"
                    class="w-full px-3 py-2 text-xs font-semibold rounded-lg border border-stone-300 dark:border-[#243329] dark:bg-[#0E1410] dark:text-[#F0F4F1] focus:outline-none focus:ring-2 focus:ring-[#183D2B] dark:focus:ring-[#B8DF38]"
                  >
                    <option value="BANK">Bank Transfer</option>
                    <option value="E_WALLET">E-Wallet (GoPay/OVO/ShopeePay)</option>
                    <option value="CASH">Kas Tunai (Dompet)</option>
                    <option value="INVESTMENT">Investasi / Reksadana</option>
                  </select>
                </div>
              </div>

              <div>
                <label class="block text-[11px] font-bold text-stone-600 dark:text-[#F0F4F1] mb-1">
                  Nomor Rekening / Akun (Opsional)
                </label>
                <input
                  type="text"
                  v-model="editAccountNumber"
                  class="w-full px-3 py-2 text-xs font-medium rounded-lg border border-stone-300 dark:border-[#243329] dark:bg-[#0E1410] dark:text-[#F0F4F1] focus:outline-none focus:ring-2 focus:ring-[#183D2B] dark:focus:ring-[#B8DF38]"
                  placeholder="misal: 1234567890 atau 08123456789"
                />
              </div>

              <div class="flex items-center justify-end gap-2 pt-2 border-t border-stone-200/80 dark:border-[#243329]">
                <button
                  type="button"
                  @click="cancelEdit"
                  class="px-3 py-1.5 rounded-lg text-xs font-bold text-stone-600 dark:text-[#98A79D] hover:bg-stone-200/60 dark:hover:bg-[#243329] tactile-btn cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  :disabled="isUpdating"
                  @click="handleUpdateWallet(wallet.id)"
                  class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-extrabold bg-[#183D2B] dark:bg-[#B8DF38] text-white dark:text-[#0E1410] hover:bg-[#122e20] dark:hover:bg-[#A3C82E] tactile-btn cursor-pointer disabled:opacity-50"
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
          <div class="p-3.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/40 text-xs text-emerald-900 dark:text-emerald-300 leading-relaxed">
            💡 <strong>Catatan:</strong> Dompet baru dibuat dengan saldo <strong>Rp 0</strong>. Untuk mengisi saldo dompet baru, gunakan fitur <strong>Transfer Antar Dompet</strong> dari dompet utama yang sudah memiliki saldo, atau catat pemasukan baru ke dompet ini.
          </div>

          <div>
            <label class="block text-xs font-bold text-[#18221B] dark:text-[#F0F4F1] mb-1.5">
              Nama Dompet / Rekening <span class="text-rose-500">*</span>
            </label>
            <input
              type="text"
              v-model="newName"
              placeholder="misal: BCA Utama, Dompet Saku, atau GoPay"
              class="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-[#243329] dark:bg-[#0E1410] dark:text-[#F0F4F1] text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#183D2B] dark:focus:ring-[#B8DF38] focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label class="block text-xs font-bold text-[#18221B] dark:text-[#F0F4F1] mb-1.5">
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
                    ? 'border-[#183D2B] dark:border-[#B8DF38] bg-emerald-900/5 dark:bg-[#B8DF38]/10 ring-2 ring-[#183D2B]/20 dark:ring-[#B8DF38]/20'
                    : 'border-stone-200 dark:border-[#243329] hover:bg-stone-50 dark:hover:bg-[#121A15]',
                ]"
              >
                <component
                  :is="meta.icon"
                  class="w-4 h-4 text-[#183D2B] dark:text-[#B8DF38] shrink-0"
                  :stroke-width="2"
                />
                <div class="min-w-0">
                  <span class="block text-xs font-bold text-[#18221B] dark:text-[#F0F4F1] truncate">
                    {{ meta.label }}
                  </span>
                </div>
              </button>
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-[#18221B] dark:text-[#F0F4F1] mb-1.5">
              Nomor Rekening / No. HP E-Wallet (Opsional)
            </label>
            <input
              type="text"
              v-model="newAccountNumber"
              placeholder="misal: 8820192301 atau 081299998888"
              class="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-[#243329] dark:bg-[#0E1410] dark:text-[#F0F4F1] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#183D2B] dark:focus:ring-[#B8DF38] focus:border-transparent transition-all"
            />
          </div>
        </div>
      </div>

      <!-- Modal Footer (shrink-0) -->
      <div
        class="shrink-0 p-4 border-t border-stone-100 dark:border-[#243329] bg-stone-50/80 dark:bg-[#16201A] flex items-center justify-between gap-3"
      >
        <button
          type="button"
          @click="() => { emit('close'); emit('openTransfer'); }"
          class="tactile-btn inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-[#183D2B] dark:text-[#B8DF38] bg-emerald-100/70 dark:bg-emerald-950/60 hover:bg-emerald-200/80 dark:hover:bg-emerald-900/60 border border-emerald-300/50 dark:border-emerald-700/50 cursor-pointer"
        >
          <ArrowRightLeft class="w-3.5 h-3.5" :stroke-width="2.2" />
          <span>Pindah Dana / Transfer</span>
        </button>

        <div class="flex items-center gap-2">
          <button
            type="button"
            @click="emit('close')"
            class="tactile-btn px-4 py-2.5 rounded-xl text-xs font-bold text-stone-600 dark:text-[#98A79D] hover:bg-stone-200/70 dark:hover:bg-[#243329] transition-colors cursor-pointer"
          >
            Tutup
          </button>

          <button
            v-if="activeTab === 'add'"
            type="button"
            :disabled="isSubmitting || !newName.trim()"
            @click="handleCreateWallet"
            class="tactile-btn inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-extrabold bg-[#183D2B] dark:bg-[#B8DF38] text-white dark:text-[#0E1410] hover:bg-[#122e20] dark:hover:bg-[#A3C82E] shadow-sm transition-all cursor-pointer disabled:opacity-50"
          >
            <Check class="w-4 h-4 text-[#B8DF38] dark:text-[#0E1410]" :stroke-width="2.5" />
            <span>{{ isSubmitting ? 'Menyimpan...' : 'Simpan Dompet' }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
