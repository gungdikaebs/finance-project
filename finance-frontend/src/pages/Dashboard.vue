<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
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
} from '../api/services';

// Modular Components
import Navbar from '../components/Navbar.vue';
import MobileBottomNav from '../components/MobileBottomNav.vue';
import HeroBalanceCard from '../components/HeroBalanceCard.vue';
import SavingsSection from '../components/SavingsSection.vue';
import BudgetSection from '../components/BudgetSection.vue';
import TransactionSection from '../components/TransactionSection.vue';

// Modular Modals
import ProfileModal from '../components/modals/ProfileModal.vue';
import TransactionModal from '../components/modals/TransactionModal.vue';
import EditTransactionModal from '../components/modals/EditTransactionModal.vue';
import CancelTransactionModal from '../components/modals/CancelTransactionModal.vue';
import ManageCategoriesModal from '../components/modals/ManageCategoriesModal.vue';
import BudgetPolicyModal from '../components/modals/BudgetPolicyModal.vue';
import MonthEndReviewModal from '../components/modals/MonthEndReviewModal.vue';
import SaveModal from '../components/modals/SaveModal.vue';
import ReleaseModal from '../components/modals/ReleaseModal.vue';
import AddGoalModal from '../components/modals/AddGoalModal.vue';
import GoalSharesModal from '../components/modals/GoalSharesModal.vue';
import SimulationModal from '../components/modals/SimulationModal.vue';

const router = useRouter();
const auth = useAuthStore();

// Core Data State
const profile = ref<FinanceProfile | null>(null);
const summary = ref<ReportSummary | null>(null);
const monthlyReport = ref<MonthlyReport | null>(null);
const activePolicy = ref<BudgetPolicy | null>(null);
const monthEndReview = ref<MonthEndReview | null>(null);
const transactions = ref<Transaction[]>([]);
const categories = ref<Category[]>([]);
const incomeSources = ref<IncomeSource[]>([]);
const savingsGoals = ref<SavingsGoal[]>([]);
const allocationStatus = ref<AllocationStatus | null>(null);
const loading = ref(false);
const loadError = ref<string | null>(null);

// Responsive Navigation & Filter State
const mobileTab = ref<'ringkasan' | 'anggaran' | 'tabungan' | 'transaksi' | 'semua'>('ringkasan');
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
const showReleaseModal = ref(false);
const releaseGoalId = ref<number | null>(null);
const showAddGoalModal = ref(false);
const showSharesModal = ref(false);
const showSimModal = ref(false);
const simInitialGoal = ref<SavingsGoal | null>(null);

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
    const [profRes, sumRes, monthRes, policyRes, catRes, srcRes, trxRes, goalsRes, allocRes] = await Promise.all([
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
    ]);

    profile.value = profRes.data.data;
    summary.value = sumRes.data.data;
    monthlyReport.value = monthRes.data.data;
    activePolicy.value = policyRes.data.data;
    categories.value = catRes.data.data;
    incomeSources.value = srcRes.data.data;
    transactions.value = trxRes.data.data.items;
    savingsGoals.value = goalsRes.data.data;
    allocationStatus.value = allocRes.data.data;
  } catch (err: any) {
    if (err.response?.status === 401) {
      auth.logout();
      router.push('/');
    } else {
      console.error(err);
      loadError.value = err.response?.data?.message || err.message || 'Gagal memuat data keuangan dari server. Silakan coba lagi.';
    }
  } finally {
    loading.value = false;
  }
};

// Modal Openers
const openCreateTransaction = (type: 'income' | 'expense') => {
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
    alert(err.response?.data?.message || 'Gagal memuat tinjauan akhir bulan');
  }
};

const openSimulator = (goal?: SavingsGoal) => {
  simInitialGoal.value = goal || null;
  showSimModal.value = true;
};

const handleLogout = () => {
  auth.logout();
  router.push('/');
};

// Keyboard Accessibility: Escape key closes top modal
const closeTopModal = () => {
  if (showSimModal.value) { showSimModal.value = false; return; }
  if (showAddGoalModal.value) { showAddGoalModal.value = false; return; }
  if (showSharesModal.value) { showSharesModal.value = false; return; }
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
  if (e.key === 'Escape') {
    closeTopModal();
  }
};

onMounted(() => {
  window.addEventListener('keydown', handleGlobalKeydown);
  if (!auth.token) {
    router.push('/');
    return;
  }
  loadAllData();
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleGlobalKeydown);
});
</script>

<template>
  <div class="min-h-screen bg-[#F3F5EF] text-[#202820] pb-16">
    <!-- Navbar Header -->
    <Navbar
      :timezone="profile?.timezone"
      @open-simulator="openSimulator()"
      @open-month-end-review="openMonthEndReview"
      @open-manage="showManageModal = true"
      @open-profile="showProfileModal = true"
      @logout="handleLogout"
    />

    <!-- Main Content Container -->
    <main class="max-w-5xl mx-auto px-4 py-6 space-y-6 pb-28 md:pb-12">
      <!-- Error Alert Banner with Retry -->
      <div
        v-if="loadError"
        class="bg-red-50 border border-red-200 text-red-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-xs"
        role="alert"
      >
        <div class="flex items-center space-x-3">
          <span class="text-xl">⚠️</span>
          <div>
            <h4 class="text-sm font-bold text-red-900">Gagal Memuat Data</h4>
            <p class="text-xs text-red-700 mt-0.5">{{ loadError }}</p>
          </div>
        </div>
        <button
          @click="loadAllData"
          class="px-4 py-2 bg-red-800 hover:bg-red-900 text-white rounded-xl text-xs font-bold transition self-start sm:self-auto cursor-pointer"
        >
          🔄 Coba Lagi
        </button>
      </div>

      <!-- LOADING SKELETON -->
      <div v-if="loading" class="space-y-6 animate-pulse" aria-busy="true" aria-label="Memuat data...">
        <!-- Hero Card Skeleton -->
        <div class="bg-[#183D2B] rounded-3xl p-6 sm:p-8 shadow-sm">
          <div class="h-4 w-36 bg-white/20 rounded mb-4"></div>
          <div class="h-10 w-64 bg-white/30 rounded mb-6"></div>
          <div class="grid grid-cols-3 gap-4 pt-4 border-t border-white/10">
            <div class="space-y-2">
              <div class="h-3 w-20 bg-white/20 rounded"></div>
              <div class="h-5 w-28 bg-[#B8DF38]/40 rounded"></div>
            </div>
            <div class="space-y-2">
              <div class="h-3 w-20 bg-white/20 rounded"></div>
              <div class="h-5 w-28 bg-white/20 rounded"></div>
            </div>
            <div class="space-y-2">
              <div class="h-3 w-20 bg-white/20 rounded"></div>
              <div class="h-5 w-28 bg-white/20 rounded"></div>
            </div>
          </div>
        </div>

        <!-- Tabungan Skeleton -->
        <div class="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4">
          <div class="h-5 w-48 bg-gray-200 rounded"></div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="h-32 bg-gray-100 rounded-xl"></div>
            <div class="h-32 bg-gray-100 rounded-xl"></div>
          </div>
        </div>

        <!-- Anggaran Skeleton -->
        <div class="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4">
          <div class="h-5 w-40 bg-gray-200 rounded"></div>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div class="h-24 bg-gray-100 rounded-xl"></div>
            <div class="h-24 bg-gray-100 rounded-xl"></div>
            <div class="h-24 bg-gray-100 rounded-xl"></div>
          </div>
        </div>

        <!-- Transaksi Skeleton -->
        <div class="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-3">
          <div class="h-5 w-36 bg-gray-200 rounded mb-4"></div>
          <div class="h-10 bg-gray-100 rounded-lg"></div>
          <div class="h-10 bg-gray-100 rounded-lg"></div>
          <div class="h-10 bg-gray-100 rounded-lg"></div>
        </div>
      </div>

      <!-- MAIN CONTENT -->
      <template v-else>
        <!-- Mobile Section Filter Bar (md:hidden) -->
        <div class="flex md:hidden items-center justify-between bg-white p-1 rounded-xl border border-gray-200 shadow-xs mb-2 text-xs overflow-x-auto gap-1">
          <button
            @click="mobileTab = 'ringkasan'"
            :class="mobileTab === 'ringkasan' ? 'bg-[#183D2B] text-white font-bold' : 'text-gray-600 hover:bg-gray-100'"
            class="px-2.5 py-1.5 rounded-lg whitespace-nowrap transition cursor-pointer"
          >
            🏠 Ringkasan
          </button>
          <button
            @click="mobileTab = 'anggaran'"
            :class="mobileTab === 'anggaran' ? 'bg-[#183D2B] text-white font-bold' : 'text-gray-600 hover:bg-gray-100'"
            class="px-2.5 py-1.5 rounded-lg whitespace-nowrap transition cursor-pointer"
          >
            📊 Anggaran
          </button>
          <button
            @click="mobileTab = 'tabungan'"
            :class="mobileTab === 'tabungan' ? 'bg-[#183D2B] text-white font-bold' : 'text-gray-600 hover:bg-gray-100'"
            class="px-2.5 py-1.5 rounded-lg whitespace-nowrap transition cursor-pointer"
          >
            🎯 Tabungan
          </button>
          <button
            @click="mobileTab = 'transaksi'"
            :class="mobileTab === 'transaksi' ? 'bg-[#183D2B] text-white font-bold' : 'text-gray-600 hover:bg-gray-100'"
            class="px-2.5 py-1.5 rounded-lg whitespace-nowrap transition cursor-pointer"
          >
            💸 Transaksi
          </button>
          <button
            @click="mobileTab = 'semua'"
            :class="mobileTab === 'semua' ? 'bg-gray-200 text-gray-800 font-bold' : 'text-gray-500 hover:bg-gray-100'"
            class="px-2 py-1.5 rounded-lg whitespace-nowrap transition cursor-pointer text-[11px]"
          >
            Semua
          </button>
        </div>

        <!-- SECTION 1: HERO KARTU SALDO UTAMA -->
        <section
          id="section-ringkasan"
          :class="{ 'hidden md:block': mobileTab !== 'ringkasan' && mobileTab !== 'semua' }"
        >
          <HeroBalanceCard
            :summary="summary"
            :allocation-status="allocationStatus"
            @open-income="openCreateTransaction('income')"
            @open-expense="openCreateTransaction('expense')"
            @open-save="showSaveModal = true"
            @open-release="openReleaseModal()"
          />
        </section>

        <!-- SECTION 2: TABUNGAN & TARGET IMPIAN (D-005) -->
        <section
          id="section-tabungan"
          :class="{ 'hidden md:block': mobileTab !== 'tabungan' && mobileTab !== 'semua' }"
        >
          <SavingsSection
            :emergency-goal="emergencyGoal"
            :purchase-goals="purchaseGoals"
            :unassigned-goal="unassignedGoal"
            :profile="profile"
            @open-shares-modal="showSharesModal = true"
            @open-add-goal-modal="showAddGoalModal = true"
            @open-release-modal="openReleaseModal"
            @open-simulator-with-goal="openSimulator"
          />
        </section>

        <!-- SECTION 3: KONTROL ANGGARAN BULANAN (BUDGETING FLEKSIBEL) -->
        <section
          id="section-anggaran"
          :class="{ 'hidden md:block': mobileTab !== 'anggaran' && mobileTab !== 'semua' }"
        >
          <BudgetSection
            :monthly-report="monthlyReport"
            :active-policy="activePolicy"
            :current-month="currentMonth"
            :current-year="currentYear"
            :progress-needs="progressNeeds"
            :progress-wants="progressWants"
            @open-budget-policy-modal="showBudgetModal = true"
          />
        </section>

        <!-- SECTION 4: RIWAYAT TRANSAKSI -->
        <section
          id="section-transaksi"
          :class="{ 'hidden md:block': mobileTab !== 'transaksi' && mobileTab !== 'semua' }"
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

    <!-- Mobile Bottom Navigation Bar (md:hidden) -->
    <MobileBottomNav
      :active-tab="mobileTab"
      @update:active-tab="mobileTab = $event"
      @open-simulator="openSimulator()"
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
      @close="showSaveModal = false"
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

    <GoalSharesModal
      :show="showSharesModal"
      :purchase-goals="purchaseGoals"
      @close="showSharesModal = false"
      @saved="loadAllData"
    />

    <SimulationModal
      :show="showSimModal"
      :initial-goal="simInitialGoal"
      @close="showSimModal = false"
    />
  </div>
</template>
