<script setup lang="ts">
import { ref, computed, nextTick, onMounted, onUnmounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth.store';
import {
  financeApi,
  type ReportSummary,
  type MonthlyReport,
  type MonthEndReview,
  type BudgetPolicy,
  type Transaction,
  type Category,
  type IncomeSource,
  type FinanceProfile,
  type SavingsGoal,
  type AllocationStatus,
  type GoalForecast,
  type RecurringTransaction,
  type WalletAccount,
} from '../api/services';
import { formatRupiah } from '../utils/format';
import { useConfirm } from '../composables/useConfirm';
import {
  AlertCircle,
  RefreshCw,
  Sun,
  Moon,
} from 'lucide-vue-next';
import { useToast } from '../composables/useToast';
import { useTheme } from '../composables/useTheme';

// Modular Components
import Sidebar from '../components/Sidebar.vue';
import MobileBottomNav from '../components/MobileBottomNav.vue';
import MobileMenuModal from '../components/modals/MobileMenuModal.vue';
import HeroBalanceCard from '../components/HeroBalanceCard.vue';
import SavingsSection from '../components/SavingsSection.vue';
import BudgetSection from '../components/BudgetSection.vue';
import TransactionSection from '../components/TransactionSection.vue';
import CashflowAnalyticsSection from '../components/CashflowAnalyticsSection.vue';
import UpcomingBillsWidget from '../components/UpcomingBillsWidget.vue';
import NalaraLogo from '../components/ui/NalaraLogo.vue';
import type { MonthlyAnalyticsData } from '../api/services';

// Modular Modals
import ProfileModal from '../components/modals/ProfileModal.vue';
import TransactionModal from '../components/modals/TransactionModal.vue';
import EditTransactionModal from '../components/modals/EditTransactionModal.vue';
import CancelTransactionModal from '../components/modals/CancelTransactionModal.vue';
import ManageCategoriesModal from '../components/modals/ManageCategoriesModal.vue';
import BudgetPolicyModal from '../components/modals/BudgetPolicyModal.vue';
import MonthEndReviewModal from '../components/modals/MonthEndReviewModal.vue';
import SaveModal from '../components/modals/SaveModal.vue';
import EmergencyTopUpModal from '../components/modals/EmergencyTopUpModal.vue';
import ReleaseModal from '../components/modals/ReleaseModal.vue';
import AddGoalModal from '../components/modals/AddGoalModal.vue';
import EditGoalModal from '../components/modals/EditGoalModal.vue';
import CompleteGoalModal from '../components/modals/CompleteGoalModal.vue';
import GoalSharesModal from '../components/modals/GoalSharesModal.vue';
import SimulationModal from '../components/modals/SimulationModal.vue';
import OnboardingWizardModal from '../components/modals/OnboardingWizardModal.vue';
import RecurringTransactionModal from '../components/modals/RecurringTransactionModal.vue';
import ManageWalletsModal from '../components/modals/ManageWalletsModal.vue';
import TransferWalletModal from '../components/modals/TransferWalletModal.vue';

const router = useRouter();
const auth = useAuthStore();
const toast = useToast();
const confirmDialog = useConfirm();
const { isDark, toggleTheme } = useTheme();

// Core Data State
const profile = ref<FinanceProfile | null>(null);
const summary = ref<ReportSummary | null>(null);
const monthlyReport = ref<MonthlyReport | null>(null);
const activePolicy = ref<BudgetPolicy | null>(null);
const monthEndReview = ref<MonthEndReview | null>(null);
const analytics = ref<MonthlyAnalyticsData | null>(null);
const transactions = ref<Transaction[]>([]);
const categories = ref<Category[]>([]);
const incomeSources = ref<IncomeSource[]>([]);
const savingsGoals = ref<SavingsGoal[]>([]);
const goalForecasts = ref<Record<number, GoalForecast>>({});
const upcomingBills = ref<RecurringTransaction[]>([]);
const wallets = ref<WalletAccount[]>([]);
const allocationStatus = ref<AllocationStatus | null>(null);
const loading = ref(false);
const loadError = ref<string | null>(null);

// Responsive Navigation & Filter State
const mobileTab = ref<'ringkasan' | 'analitik' | 'anggaran' | 'tabungan' | 'transaksi' | 'semua'>('ringkasan');
const now = new Date();
const currentMonth = ref(now.getMonth() + 1);
const currentYear = ref(now.getFullYear());
const filterType = ref('');
const filterStatus = ref('ACTIVE');

// Modal Control State
const showProfileModal = ref(false);
const showTransactionModal = ref(false);
const txModalType = ref<'income' | 'expense'>('income');
const showEditModal = ref(false);
const editingTx = ref<Transaction | null>(null);
const showCancelModal = ref(false);
const cancellingTx = ref<Transaction | null>(null);
const showManageModal = ref(false);
const showBudgetModal = ref(false);
const showReviewModal = ref(false);
const showSaveModal = ref(false);
const showEmergencyTopUpModal = ref(false);
const showReleaseModal = ref(false);
const releaseGoalId = ref<number | null>(null);
const showAddGoalModal = ref(false);
const showEditGoalModal = ref(false);
const editingGoal = ref<SavingsGoal | null>(null);
const showCompleteGoalModal = ref(false);
const completingGoal = ref<SavingsGoal | null>(null);
const showSharesModal = ref(false);
const showSimModal = ref(false);
const simInitialGoal = ref<SavingsGoal | null>(null);
const simInitialMonthly = ref<string | null>(null);
const showOnboardingModal = ref(false);
const showRecurringModal = ref(false);
const showManageWalletsModal = ref(false);
const showTransferWalletModal = ref(false);
const showMobileMenu = ref(false);

// Keep keyboard focus inside the active dashboard dialog and restore its opener.
const activeModalKey = computed(() => {
  const modals = [
    ['profile', showProfileModal.value], ['transaction', showTransactionModal.value],
    ['edit-transaction', showEditModal.value], ['cancel-transaction', showCancelModal.value],
    ['categories', showManageModal.value], ['budget', showBudgetModal.value],
    ['review', showReviewModal.value], ['save', showSaveModal.value],
    ['emergency-top-up', showEmergencyTopUpModal.value],
    ['release', showReleaseModal.value], ['add-goal', showAddGoalModal.value],
    ['edit-goal', showEditGoalModal.value], ['complete-goal', showCompleteGoalModal.value],
    ['shares', showSharesModal.value],
    ['simulation', showSimModal.value], ['onboarding', showOnboardingModal.value],
    ['recurring', showRecurringModal.value], ['wallets', showManageWalletsModal.value],
    ['transfer', showTransferWalletModal.value], ['mobile-menu', showMobileMenu.value],
  ] as const;
  return modals.find(([, open]) => open)?.[0] ?? null;
});

let modalOpener: HTMLElement | null = null;
let returnFocusPending = false;
const getActiveDialog = () => [...document.querySelectorAll<HTMLElement>('[role="dialog"][aria-modal="true"]')]
  .reverse().find((dialog) => dialog.getClientRects().length > 0) ?? null;
const getDialogControls = (dialog: HTMLElement) => [...dialog.querySelectorAll<HTMLElement>(
  'button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
)].filter((control) => control.getClientRects().length > 0);

const restoreModalFocus = async () => {
  if (!returnFocusPending || loading.value || activeModalKey.value) return;
  await nextTick();
  await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
  if (loading.value || activeModalKey.value) return;
  const returnKey = modalOpener?.dataset.focusReturn;
  const replacement = returnKey
    ? [...document.querySelectorAll<HTMLElement>('[data-focus-return]')]
      .find((element) => element.dataset.focusReturn === returnKey && element.getClientRects().length > 0)
    : null;
  const fallback = [...document.querySelectorAll<HTMLElement>('#section-transaksi h2, #section-ringkasan button, [aria-label="Navigasi Bawah Mobile"] button')]
    .find((element) => element.getClientRects().length > 0);
  const target = modalOpener?.isConnected && modalOpener.getClientRects().length > 0
    ? modalOpener : replacement ?? fallback;
  target?.focus();
  returnFocusPending = false;
  modalOpener = null;
};

watch(activeModalKey, async (current, previous) => {
  if (current && !previous) {
    modalOpener = document.activeElement as HTMLElement;
    returnFocusPending = false;
  }
  await nextTick();
  await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
  if (current !== activeModalKey.value) return;
  if (current) {
    const dialog = getActiveDialog();
    const initial = dialog?.querySelector<HTMLElement>('[data-initial-focus]');
    (initial ?? dialog?.querySelector<HTMLElement>('input:not([type="hidden"]), select, textarea') ?? (dialog ? getDialogControls(dialog)[0] : null))?.focus();
  } else {
    returnFocusPending = true;
    await restoreModalFocus();
  }
}, { flush: 'sync' });

// Computed goal views
const emergencyGoal = computed(() => savingsGoals.value.find((g) => g.type === 'EMERGENCY'));
const purchaseGoals = computed(() => savingsGoals.value.filter((g) => g.type === 'PURCHASE' && !g.isArchived));
const unassignedGoal = computed(() => savingsGoals.value.find((g) => g.type === 'UNASSIGNED'));

// Computed budget progress
const progressNeeds = computed(() => {
  if (!monthlyReport.value) return 0;
  const budget = Number(monthlyReport.value.budgetNeeds || 0);
  const spent = Number(monthlyReport.value.needsExpense || 0);
  if (budget <= 0) return spent > 0 ? 100 : 0;
  return Math.min(100, Math.round((spent / budget) * 100));
});

const progressWants = computed(() => {
  if (!monthlyReport.value) return 0;
  const budget = Number(monthlyReport.value.budgetWants || 0);
  const spent = Number(monthlyReport.value.wantsExpense || 0);
  if (budget <= 0) return spent > 0 ? 100 : 0;
  return Math.min(100, Math.round((spent / budget) * 100));
});

// Data Loading
const loadAllData = async () => {
  loading.value = true;
  loadError.value = null;
  try {
    const [profRes, sumRes, monthRes, policyRes, catRes, srcRes, trxRes, goalsRes, allocRes, analyticsRes, forecastRes, recurringRes, walletsRes] = await Promise.all([
      financeApi.getProfile(),
      financeApi.getSummary(),
      financeApi.getMonthly(currentMonth.value, currentYear.value),
      financeApi.getActiveBudgetPolicy(currentYear.value, currentMonth.value),
      financeApi.getCategories(true),
      financeApi.getIncomeSources(true),
      financeApi.getTransactions({
        month: currentMonth.value,
        year: currentYear.value,
        type: filterType.value || undefined,
        status: filterStatus.value || undefined,
      }),
      financeApi.getSavingsGoals(),
      financeApi.getAllocationStatus(),
      financeApi.getAnalytics(currentMonth.value, currentYear.value),
      financeApi.getGoalForecasts(),
      financeApi.getUpcomingRecurring(7),
      financeApi.getWallets(),
    ]);

    profile.value = profRes.data.data;
    if (profile.value && !profile.value.isOnboardingCompleted) {
      showOnboardingModal.value = true;
    }
    summary.value = sumRes.data.data;
    monthlyReport.value = monthRes.data.data;
    activePolicy.value = policyRes.data.data;
    categories.value = catRes.data.data;
    incomeSources.value = srcRes.data.data;
    transactions.value = trxRes.data.data.items;
    savingsGoals.value = goalsRes.data.data;
    allocationStatus.value = allocRes.data.data;
    analytics.value = analyticsRes.data.data;
    upcomingBills.value = recurringRes.data.data;
    wallets.value = walletsRes.data.data;
    if (forecastRes.data?.data) {
      goalForecasts.value = Object.fromEntries(
        forecastRes.data.data.map((f: GoalForecast) => [f.goalId, f])
      );
    }
  } catch (err: any) {
    if (err.response?.status === 401) {
      auth.logout();
      router.push('/login');
    } else {
      console.error(err);
      loadError.value = err.response?.data?.message || err.message || 'Gagal memuat data keuangan dari server. Silakan coba lagi.';
    }
  } finally {
    loading.value = false;
    void restoreModalFocus();
  }
};

// Modal Openers
const openCreateTransaction = (type: 'income' | 'expense' = 'expense') => {
  txModalType.value = type;
  showTransactionModal.value = true;
};

const openEditTransaction = (trx: Transaction) => {
  editingTx.value = trx;
  showEditModal.value = true;
};

const openCancelTransaction = (trx: Transaction) => {
  cancellingTx.value = trx;
  showCancelModal.value = true;
};

const openReleaseModal = (goalId?: number) => {
  releaseGoalId.value = goalId || null;
  showReleaseModal.value = true;
};

const openMonthEndReview = async () => {
  let revM = currentMonth.value - 1;
  let revY = currentYear.value;
  if (revM === 0) {
    revM = 12;
    revY -= 1;
  }
  try {
    const res = await financeApi.getMonthEndReview(revM, revY);
    monthEndReview.value = res.data.data;
    showReviewModal.value = true;
  } catch (err: any) {
    toast.error(err.response?.data?.message || 'Gagal memuat tinjauan akhir bulan');
  }
};

const openSimulator = (goal?: SavingsGoal) => {
  simInitialGoal.value = goal || null;
  simInitialMonthly.value = null;
  showSimModal.value = true;
};

const openEditGoal = (goal: SavingsGoal) => {
  editingGoal.value = goal;
  showEditGoalModal.value = true;
};

const handleOpenCompleteModal = (goal: SavingsGoal) => {
  completingGoal.value = goal;
  showCompleteGoalModal.value = true;
};

const handleReopenGoal = async (goal: SavingsGoal) => {
  const confirmed = await confirmDialog.ask({
    title: 'Buka Kembali Target Impian?',
    message: `Target "${goal.name}" akan diaktifkan kembali. Persentase pembagian tabungan akan dihitung ulang secara proporsional.`,
    confirmText: 'Ya, Aktifkan Kembali',
    cancelText: 'Batal',
    type: 'info',
  });

  if (!confirmed) return;

  try {
    await financeApi.reopenSavingsGoal(goal.id);
    toast.success(`Target "${goal.name}" berhasil diaktifkan kembali.`);
    await loadAllData();
  } catch (err: any) {
    toast.error(err.response?.data?.message || 'Gagal mengaktifkan kembali target');
  }
};

const handleOpenSimulatorWithTopUp = (payload: { goal: SavingsGoal; recommendedMonthly: string }) => {
  simInitialGoal.value = payload.goal;
  simInitialMonthly.value = payload.recommendedMonthly;
  showSimModal.value = true;
};

const handleExecuteBill = async (bill: RecurringTransaction) => {
  const confirmed = await confirmDialog.ask({
    title: 'Bayar & Catat Tagihan Sekarang?',
    message: `Catat transaksi "${bill.note || (bill.type === 'expense' ? 'Tagihan Rutin' : 'Pemasukan Rutin')}" sebesar ${formatRupiah(bill.amount)} ke buku kas saat ini? Tanggal jadwal berikutnya akan otomatis dimajukan.`,
    confirmText: 'Ya, Bayar Sekarang',
    cancelText: 'Batal',
    type: 'warning',
  });

  if (!confirmed) return;

  try {
    await financeApi.executeRecurringNow(bill.id);
    toast.success('Tagihan berhasil dicatat dan jadwal telah dimajukan');
    await loadAllData();
  } catch (err: any) {
    toast.error(err.response?.data?.message || 'Gagal mengeksekusi tagihan');
  }
};

const handleOnboardingCompleted = () => {
  showOnboardingModal.value = false;
  loadAllData();
};

const handleOnboardingSkipped = () => {
  showOnboardingModal.value = false;
  loadAllData();
};

const handleLogout = () => {
  auth.logout();
  router.push('/');
};

// Keyboard Accessibility: Escape key closes top modal
const closeTopModal = () => {
  if (showMobileMenu.value) { showMobileMenu.value = false; return; }
  if (showTransferWalletModal.value) { showTransferWalletModal.value = false; return; }
  if (showManageWalletsModal.value) { showManageWalletsModal.value = false; return; }
  if (showRecurringModal.value) { showRecurringModal.value = false; return; }
  if (showSimModal.value) { showSimModal.value = false; return; }
  if (showCompleteGoalModal.value) { showCompleteGoalModal.value = false; return; }
  if (showAddGoalModal.value) { showAddGoalModal.value = false; return; }
  if (showSharesModal.value) { showSharesModal.value = false; return; }
  if (showEmergencyTopUpModal.value) { showEmergencyTopUpModal.value = false; return; }
  if (showSaveModal.value) { showSaveModal.value = false; return; }
  if (showReleaseModal.value) { showReleaseModal.value = false; return; }
  if (showBudgetModal.value) { showBudgetModal.value = false; return; }
  if (showReviewModal.value) { showReviewModal.value = false; return; }
  if (showManageModal.value) { showManageModal.value = false; return; }
  if (showProfileModal.value) { showProfileModal.value = false; return; }
  if (showEditModal.value) { showEditModal.value = false; return; }
  if (showCancelModal.value) { showCancelModal.value = false; return; }
  if (showTransactionModal.value) { showTransactionModal.value = false; return; }
};

const handleGlobalKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Tab' && activeModalKey.value) {
    const dialog = getActiveDialog();
    if (dialog) {
      const controls = getDialogControls(dialog);
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (!first || !last) {
        e.preventDefault();
        dialog.focus();
      } else if (!dialog.contains(document.activeElement)) {
        e.preventDefault();
        (e.shiftKey ? last : first).focus();
      } else if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }
  if (e.key === 'Escape') {
    closeTopModal();
  }
};

const activeSection = ref<'ringkasan' | 'analitik' | 'anggaran' | 'tabungan' | 'transaksi'>('ringkasan');

const scrollToSection = (section: 'ringkasan' | 'analitik' | 'anggaran' | 'tabungan' | 'transaksi') => {
  activeSection.value = section;
  if (mobileTab.value !== 'semua' && mobileTab.value !== section) {
    mobileTab.value = section;
  }
  const el = document.getElementById(`section-${section}`);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
};

let sectionObserver: IntersectionObserver | null = null;

onMounted(() => {
  window.addEventListener('keydown', handleGlobalKeydown);
  if (!auth.token) {
    router.push('/login');
    return;
  }
  if (!auth.user) {
    auth.fetchUser().catch((err) => {
      if (err.response?.status === 401) {
        auth.logout();
        router.push('/login');
      } else {
        toast.error('Identitas akun belum dapat dimuat. Coba buka ulang halaman.');
      }
    });
  }
  loadAllData();

  // Scroll spy setup
  sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.id.replace('section-', '') as any;
          if (id) activeSection.value = id;
        }
      });
    },
    { threshold: 0.25 }
  );

  setTimeout(() => {
    ['ringkasan', 'tabungan', 'anggaran', 'analitik', 'transaksi'].forEach((s) => {
      const el = document.getElementById(`section-${s}`);
      if (el) sectionObserver?.observe(el);
    });
  }, 600);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleGlobalKeydown);
  sectionObserver?.disconnect();
});
</script>

<template>
  <div class="min-h-screen bg-[#F3F5EF] dark:bg-[#0E1410] text-[#18221B] dark:text-[#F0F4F1] transition-colors duration-200">
    <!-- Desktop Sidebar (Visible on lg+) -->
    <Sidebar
      :active-section="activeSection"
      :timezone="profile?.timezone"
      :user-name="auth.user?.name"
      :user-email="auth.user?.email"
      @navigate="scrollToSection"
      @open-create-transaction="openCreateTransaction()"
      @open-simulator="openSimulator()"
      @open-recurring="showRecurringModal = true"
      @open-month-end-review="openMonthEndReview"
      @open-manage="showManageModal = true"
      @open-profile="showProfileModal = true"
      @open-wallets="showManageWalletsModal = true"
      @open-transfer="showTransferWalletModal = true"
      @logout="handleLogout"
    />

    <!-- Main Content Area: Offset on lg+ by lg:pl-64 -->
    <div class="flex-1 min-w-0 flex flex-col min-h-screen lg:pl-64">

      <!-- Mobile Top App Bar (Visible on < lg) -->
      <header class="lg:hidden sticky top-0 z-30 bg-[#F3F5EF]/95 dark:bg-[#0E1410]/95 backdrop-blur-md border-b border-[#DDE6DC] dark:border-[#27372C] px-4 py-2.5 flex items-center justify-between transition-colors">
        <div class="flex items-center gap-2.5">
          <NalaraLogo :with-badge="true" size="sm" />
          <div>
            <span class="text-xs font-extrabold tracking-tight block text-[#18221B] dark:text-[#F0F4F1]">Nalara</span>
            <span class="text-[10px] text-emerald-700 dark:text-[#B8DF38] font-bold flex items-center gap-1">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Fintech Aktif
            </span>
          </div>
        </div>

        <div class="flex items-center gap-1.5">
          <!-- Theme Toggle -->
          <button
            type="button"
            @click="toggleTheme"
            class="tactile-btn p-2 rounded-xl text-stone-600 dark:text-stone-300 hover:bg-stone-200/60 dark:hover:bg-stone-800/60 transition cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center"
            :aria-label="isDark ? 'Beralih ke mode terang' : 'Beralih ke mode gelap'"
          >
            <Sun v-if="isDark" class="w-4 h-4 text-[#B8DF38]" />
            <Moon v-else class="w-4 h-4 text-stone-700" />
          </button>

          <!-- User Profile / Menu Trigger -->
          <button
            type="button"
            @click="showMobileMenu = true"
            class="tactile-btn flex items-center gap-1.5 p-1.5 pl-2 pr-2.5 rounded-xl bg-white dark:bg-[#16201A] border border-stone-200/80 dark:border-[#27372C] text-xs font-bold text-stone-700 dark:text-stone-200 shadow-2xs cursor-pointer min-h-[36px]"
            aria-label="Buka menu pengguna"
          >
            <div class="w-6 h-6 rounded-lg bg-[#183D2B] dark:bg-[#132E21] text-[#B8DF38] text-[11px] font-bold grid place-items-center">
              {{ (auth.user?.name || auth.user?.email || 'P').charAt(0).toUpperCase() }}
            </div>
            <span class="text-[11px] max-w-[80px] truncate hidden min-[360px]:inline">{{ auth.user?.name?.split(' ')[0] || 'Akun' }}</span>
          </button>
        </div>
      </header>

      <!-- Main Content Container -->
      <main class="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-28 lg:pb-12">
      <!-- Error Alert Banner with Retry -->
      <div
        v-if="loadError"
        class="bg-rose-50/90 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-900 dark:text-rose-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-sm"
        role="alert"
      >
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300 flex items-center justify-center shrink-0">
            <AlertCircle class="w-5 h-5" :stroke-width="2" />
          </div>
          <div>
            <h4 class="text-sm font-bold text-rose-950 dark:text-rose-100">Gagal Memuat Data</h4>
            <p class="text-xs text-rose-800 dark:text-rose-300 mt-0.5 font-normal">{{ loadError }}</p>
          </div>
        </div>
        <button
          type="button"
          @click="loadAllData"
          class="tactile-btn inline-flex items-center gap-1.5 px-4 py-2 bg-rose-800 hover:bg-rose-900 text-white rounded-xl text-xs font-bold transition self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw class="w-3.5 h-3.5" />
          <span>Coba Lagi</span>
        </button>
      </div>

      <!-- LOADING SKELETON -->
      <div v-if="loading" class="space-y-6 animate-pulse" aria-busy="true" aria-label="Memuat data...">
        <!-- Hero Card Skeleton -->
        <div class="bg-[#183D2B] rounded-2xl p-6 sm:p-8 shadow-sm">
          <div class="h-4 w-36 bg-white/20 rounded mb-4"></div>
          <div class="h-10 w-64 bg-white/30 rounded mb-6"></div>
          <div class="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
            <div class="space-y-2">
              <div class="h-3 w-28 bg-white/20 rounded"></div>
              <div class="h-5 w-24 bg-white/20 rounded"></div>
            </div>
            <div class="space-y-2">
              <div class="h-3 w-28 bg-white/20 rounded"></div>
              <div class="h-5 w-28 bg-white/20 rounded"></div>
            </div>
          </div>
        </div>

        <!-- Tabungan Skeleton -->
        <div class="bg-white rounded-2xl border border-stone-200/80 p-6 shadow-xs space-y-4">
          <div class="h-5 w-48 bg-stone-200 rounded"></div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="h-32 bg-stone-100 rounded-xl"></div>
            <div class="h-32 bg-stone-100 rounded-xl"></div>
          </div>
        </div>

        <!-- Anggaran Skeleton -->
        <div class="bg-white rounded-2xl border border-stone-200/80 p-6 shadow-xs space-y-4">
          <div class="h-5 w-40 bg-stone-200 rounded"></div>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div class="h-24 bg-stone-100 rounded-xl"></div>
            <div class="h-24 bg-stone-100 rounded-xl"></div>
            <div class="h-24 bg-stone-100 rounded-xl"></div>
          </div>
        </div>

        <!-- Transaksi Skeleton -->
        <div class="bg-white rounded-2xl border border-stone-200/80 p-6 shadow-xs space-y-3">
          <div class="h-5 w-36 bg-stone-200 rounded mb-4"></div>
          <div class="h-10 bg-stone-100 rounded-lg"></div>
          <div class="h-10 bg-stone-100 rounded-lg"></div>
          <div class="h-10 bg-stone-100 rounded-lg"></div>
        </div>
      </div>

      <!-- MAIN CONTENT -->
      <template v-else>

        <!-- Tagihan mendatang tetap menonjol saat perlu ditindaklanjuti. -->
        <UpcomingBillsWidget
          v-if="upcomingBills.length > 0"
          :upcoming-bills="upcomingBills"
          :loading="loading"
          @open-manage-recurring="showRecurringModal = true"
          @execute-bill="handleExecuteBill"
        />

        <!-- SECTION 1: HERO KARTU SALDO UTAMA -->
        <section
          id="section-ringkasan"
          :class="{ 'hidden lg:block': mobileTab !== 'ringkasan' && mobileTab !== 'semua' }"
        >
          <HeroBalanceCard
            :summary="summary"
            :allocation-status="allocationStatus"
            :wallets="wallets"
            @open-income="openCreateTransaction('income')"
            @open-expense="openCreateTransaction('expense')"
            @open-save="showSaveModal = true"
            @open-release="openReleaseModal()"
            @open-wallets="showManageWalletsModal = true"
            @open-transfer="showTransferWalletModal = true"
          />
          <!-- Keadaan tanpa tagihan adalah informasi sekunder, setelah saldo dan aksi utama. -->
          <UpcomingBillsWidget
            v-if="upcomingBills.length === 0"
            class="mt-4"
            :upcoming-bills="upcomingBills"
            :loading="loading"
            @open-manage-recurring="showRecurringModal = true"
            @execute-bill="handleExecuteBill"
          />
        </section>

        <!-- SECTION 2: TABUNGAN & TARGET IMPIAN (D-005) -->
        <section
          id="section-tabungan"
          :class="{ 'hidden lg:block': mobileTab !== 'tabungan' && mobileTab !== 'semua' }"
        >
          <SavingsSection
            :emergency-goal="emergencyGoal"
            :purchase-goals="purchaseGoals"
            :unassigned-goal="unassignedGoal"
            :profile="profile"
            :forecasts="goalForecasts"
            @open-emergency-top-up="showEmergencyTopUpModal = true"
            @open-shares-modal="showSharesModal = true"
            @open-add-goal-modal="showAddGoalModal = true"
            @open-edit-goal-modal="openEditGoal"
            @open-complete-modal="handleOpenCompleteModal"
            @reopen-goal="handleReopenGoal"
            @open-release-modal="openReleaseModal"
            @open-simulator-with-goal="openSimulator"
            @open-simulator-with-top-up="handleOpenSimulatorWithTopUp"
          />
        </section>

        <!-- SECTION 3: KONTROL ANGGARAN BULANAN (BUDGETING FLEKSIBEL) -->
        <section
          id="section-anggaran"
          :class="{ 'hidden lg:block': mobileTab !== 'anggaran' && mobileTab !== 'semua' }"
        >
          <BudgetSection
            :monthly-report="monthlyReport"
            :active-policy="activePolicy"
            :allocated-savings-this-month="analytics?.budgetVsActual.savings.allocated"
            :current-month="currentMonth"
            :current-year="currentYear"
            :progress-needs="progressNeeds"
            :progress-wants="progressWants"
            :transactions="transactions"
            @open-budget-policy-modal="showBudgetModal = true"
          />
        </section>

        <!-- SECTION 4: ANALITIK & TREN ARUS KAS (MODUL 3) -->
        <section
          id="section-analitik"
          :class="{ 'hidden lg:block': mobileTab !== 'analitik' && mobileTab !== 'semua' }"
        >
          <CashflowAnalyticsSection
            :analytics="analytics"
            :loading="loading"
            :current-month="currentMonth"
            :current-year="currentYear"
          />
        </section>

        <!-- SECTION 5: RIWAYAT TRANSAKSI -->
        <section
          id="section-transaksi"
          :class="{ 'hidden lg:block': mobileTab !== 'transaksi' && mobileTab !== 'semua' }"
        >
          <TransactionSection
            :transactions="transactions"
            v-model:current-month="currentMonth"
            v-model:current-year="currentYear"
            v-model:filter-type="filterType"
            v-model:filter-status="filterStatus"
            @change-filter="loadAllData"
            @open-edit-transaction="openEditTransaction"
            @open-cancel-transaction="openCancelTransaction"
            @open-create-income="openCreateTransaction('income')"
            @open-create-expense="openCreateTransaction('expense')"
          />
        </section>
      </template>
    </main>
  </div>

    <!-- Mobile Bottom Navigation Bar (lg:hidden) -->
    <MobileBottomNav
      :active-tab="mobileTab"
      :menu-open="showMobileMenu"
      @update:active-tab="mobileTab = $event"
      @open-menu="showMobileMenu = true"
    />

    <!-- MODALS -->
    <ProfileModal
      :show="showProfileModal"
      :profile="profile"
      @close="showProfileModal = false"
      @saved="loadAllData"
    />

    <TransactionModal
      :show="showTransactionModal"
      :type="txModalType"
      :categories="categories"
      :income-sources="incomeSources"
      :savings-goals="savingsGoals"
      :wallets="wallets"
      @close="showTransactionModal = false"
      @saved="loadAllData"
    />

    <EditTransactionModal
      :show="showEditModal"
      :transaction="editingTx"
      :categories="categories"
      @close="showEditModal = false"
      @saved="loadAllData"
    />

    <CancelTransactionModal
      :show="showCancelModal"
      :transaction="cancellingTx"
      @close="showCancelModal = false"
      @saved="loadAllData"
    />

    <ManageCategoriesModal
      :show="showManageModal"
      :categories="categories"
      :income-sources="incomeSources"
      @close="showManageModal = false"
      @refresh="loadAllData"
    />

    <BudgetPolicyModal
      :show="showBudgetModal"
      :active-policy="activePolicy"
      :income-sources="incomeSources"
      :current-month="currentMonth"
      :current-year="currentYear"
      @close="showBudgetModal = false"
      @saved="loadAllData"
    />

    <MonthEndReviewModal
      :show="showReviewModal"
      :review="monthEndReview"
      @close="showReviewModal = false"
    />

    <SaveModal
      :show="showSaveModal"
      :unallocated-money="summary?.unallocatedMoney || allocationStatus?.unallocatedMoney"
      :recommended-saving-amount="summary?.recommendedSavingAmount"
      @close="showSaveModal = false"
      @saved="loadAllData"
    />

    <EmergencyTopUpModal
      :show="showEmergencyTopUpModal"
      :goal="emergencyGoal"
      :unallocated-money="summary?.unallocatedMoney || allocationStatus?.unallocatedMoney"
      @close="showEmergencyTopUpModal = false"
      @saved="loadAllData"
    />

    <ReleaseModal
      :show="showReleaseModal"
      :savings-goals="savingsGoals"
      :initial-goal-id="releaseGoalId"
      @close="showReleaseModal = false"
      @saved="loadAllData"
    />

    <AddGoalModal
      :show="showAddGoalModal"
      @close="showAddGoalModal = false"
      @saved="loadAllData"
    />

    <EditGoalModal
      :show="showEditGoalModal"
      :goal="editingGoal"
      @close="showEditGoalModal = false"
      @saved="loadAllData"
    />

    <CompleteGoalModal
      :show="showCompleteGoalModal"
      :goal="completingGoal"
      :wallets="wallets"
      :categories="categories"
      @close="showCompleteGoalModal = false"
      @completed="loadAllData"
    />

    <GoalSharesModal
      :show="showSharesModal"
      :purchase-goals="purchaseGoals"
      @close="showSharesModal = false"
      @saved="loadAllData"
    />

    <SimulationModal
      :show="showSimModal"
      :initial-goal="simInitialGoal"
      :initial-monthly-savings="simInitialMonthly"
      @close="showSimModal = false"
    />

    <OnboardingWizardModal
      :show="showOnboardingModal"
      :profile="profile"
      @completed="handleOnboardingCompleted"
      @skipped="handleOnboardingSkipped"
    />

    <RecurringTransactionModal
      :show="showRecurringModal"
      :categories="categories"
      :income-sources="incomeSources"
      @close="showRecurringModal = false"
      @changed="loadAllData"
    />

    <MobileMenuModal
      :show="showMobileMenu"
      :profile="profile"
      :user-name="auth.user?.name"
      :user-email="auth.user?.email"
      @close="showMobileMenu = false"
      @open-profile="showProfileModal = true; showMobileMenu = false"
      @open-wallets="showManageWalletsModal = true; showMobileMenu = false"
      @open-transfer="showTransferWalletModal = true; showMobileMenu = false"
      @open-manage="showManageModal = true; showMobileMenu = false"
      @open-recurring="showRecurringModal = true; showMobileMenu = false"
      @open-simulator="openSimulator(); showMobileMenu = false"
      @open-month-end-review="openMonthEndReview(); showMobileMenu = false"
      @open-analytics="mobileTab = 'analitik'; showMobileMenu = false"
      @logout="handleLogout"
    />

    <ManageWalletsModal
      :show="showManageWalletsModal"
      :wallets="wallets"
      @close="showManageWalletsModal = false"
      @refresh="loadAllData"
      @open-transfer="showTransferWalletModal = true"
    />

    <TransferWalletModal
      :show="showTransferWalletModal"
      :wallets="wallets"
      @close="showTransferWalletModal = false"
      @transferred="loadAllData"
    />
  </div>
</template>
