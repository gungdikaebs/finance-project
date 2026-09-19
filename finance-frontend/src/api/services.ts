import api from './axios';

export interface FinanceProfile {
  id: number;
  userId: number;
  initialBalance: string;
  startDate: string;
  timezone: string;
  monthlyNeeds: string;
  isOnboardingCompleted?: boolean;
  onboardingStep?: number;
}

export interface IncomeSource {
  id: number;
  name: string;
  isArchived: boolean;
}

export interface Category {
  id: number;
  name: string;
  type: 'income' | 'expense';
  group: 'NEED' | 'WANT' | 'UNASSIGNED';
  isArchived: boolean;
}

export interface TransactionRevision {
  id: number;
  previousAmount: string;
  newAmount: string;
  previousDate: string;
  newDate: string;
  reason?: string;
  createdAt: string;
}

export interface SavingsGoal {
  id: number;
  userId: number;
  name: string;
  type: 'EMERGENCY' | 'UNASSIGNED' | 'PURCHASE';
  targetAmount?: string;
  targetMonths?: number;
  priceReference?: string;
  referenceDate?: string;
  mode?: 'FULL' | 'DOWN_PAYMENT';
  annualPriceIncreaseRatio?: number;
  isArchived: boolean;
  currentBalance?: string;
  shareRatio?: number;
}

export interface AllocationEvent {
  id: number;
  userId: number;
  sourceGoalId?: number;
  sourceGoal?: SavingsGoal;
  targetGoalId?: number;
  targetGoal?: SavingsGoal;
  amount: string;
  date: string;
  type: 'ALLOCATE' | 'RELEASE' | 'TRANSFER' | 'SPEND' | 'REVERSAL';
  note?: string;
  createdAt: string;
}

export interface AllocationStatus {
  mainBalance: string;
  totalAllocated: string;
  unallocatedMoney: string;
}

export interface SavePreviewItem {
  targetGoalId: number;
  name: string;
  amount: string;
  type: string;
}

export interface SavePreview {
  totalAmount: string;
  unallocatedMoney: string;
  previewItems: SavePreviewItem[];
}

export interface GoalSimulationParams {
  priceReference: string;
  referenceDate?: string;
  annualPriceIncreaseRatio?: number;
  currentSavings?: string;
  mode: 'FULL' | 'DOWN_PAYMENT';
  dpPercent?: number;
  dpAmount?: string;
  initialFees?: string;
  calculationMode: 'MONTHLY_SAVINGS' | 'TARGET_DATE';
  targetMonths?: number;
  monthlySavings?: string;
}

export interface TopUpSuggestion {
  extraMonthlySavings: string;
  monthsSaved: number;
  newTargetMonths: number;
  newTargetDateFormatted: string;
}

export interface GoalMilestone {
  currentPercent: number;
  achievedMilestones: number[];
  nextMilestone: number | null;
  label: string;
}

export interface GoalForecast {
  goalId: number;
  goalName: string;
  mode: string | null;
  currentBalance: string;
  targetPrice: string;
  estimatedMonthlySavings: string;
  averageMonthlyIncome: string;
  savingsRatioBps: number;
  shareRatioBps: number;
  inflationRateBps: number;
  isAchieved: boolean;
  isUnachievable: boolean;
  unachievableReason?: 'INFLATION_OUTPACING' | 'ZERO_SAVINGS' | 'HORIZON_EXCEEDED' | null;
  unachievableMessage?: string | null;
  targetMonths: number | null;
  targetDate: string | null;
  targetDateFormatted: string | null;
  projectedPrice: string;
  topUpSuggestion?: TopUpSuggestion | null;
  milestone: GoalMilestone;
}

export interface GoalSimulationResult {
  isAchievable: boolean;
  calculationMode: 'MONTHLY_SAVINGS' | 'TARGET_DATE';
  targetMonths?: number | null;
  monthlySavings?: string;
  projectedPrice?: string;
  requiredFunds?: string;
  downPayment?: string;
  loanPrincipal?: string;
  initialFees?: string;
  currentSavings?: string;
  totalSavedAtEnd?: string;
  referenceDate?: string;
  calculatedAt?: string;
  reason?: 'ZERO_MONTHLY_SAVINGS' | 'HORIZON_EXCEEDED';
  message?: string;
}

export interface MortgageSimulationParams {
  principal: string;
  tenorMonths: number;
  loanType?: 'STEPPED_MORTGAGE' | 'FLAT' | 'ANNUITY';
  fixedRate?: number;
  fixedMonths?: number;
  floatingRate?: number;
  monthlyIncome?: string;
}

export interface MortgageSimulationResult {
  principal: string;
  tenorMonths: number;
  fixedRate: number;
  fixedMonths: number;
  floatingRate: number;
  floatingMonths: number;
  fixedInstallment: string;
  floatingInstallment: string;
  highestInstallment: string;
  installmentJump: string;
  balanceBeforeFloating: string;
  totalInterest: string;
  totalLoanPayment: string;
  fixedDsr?: number | null;
  floatingDsr?: number | null;
  hasFixedPhase: boolean;
  hasFloatingPhase: boolean;
  floatingStartsAtPayment: number | null;
  loanType?: 'STEPPED_MORTGAGE' | 'FLAT' | 'ANNUITY';
}

export interface Transaction {
  id: number;
  amount: string;
  date: string;
  note?: string;
  typeSnapshot: 'INCOME' | 'EXPENSE';
  groupSnapshot?: 'NEED' | 'WANT';
  status: 'ACTIVE' | 'CANCELLED';
  allocatedNeeds?: string;
  allocatedSavings?: string;
  allocatedWants?: string;
  categoryId: number;
  category: Category;
  incomeSourceId?: number;
  incomeSource?: IncomeSource;
  walletAccountId?: number | null;
  walletAccount?: WalletAccount | null;
  paymentMethodId?: number;
  sourceGoalId?: number;
  sourceGoal?: SavingsGoal;
  revisions?: TransactionRevision[];
}

export interface ReportSummary {
  initialBalance: string;
  income: string;
  expense: string;
  needsExpense: string;
  wantsExpense: string;
  balance: string;
  mainBalance: string;
  totalAllocatedSavings?: string;
  unallocatedMoney: string;
  emergencyBalance?: string;
  emergencyMonths?: number;
  monthlyNeedsReference: string;
  timezone: string;
  startDate: string;
}

export interface MonthlyReport {
  month: number;
  year: number;
  income: string;
  expense: string;
  balance: string;
  mainBalance: string;
  budgetNeeds: string;
  budgetSavings: string;
  budgetWants: string;
  needsExpense: string;
  wantsExpense: string;
  remainingNeeds: string;
  remainingWants: string;
  overBudgetNeeds: string;
  overBudgetWants: string;
  consumedPreviousBalance: string;
  transactions: Transaction[];
}

export interface MonthEndReview {
  reviewedMonth: number;
  reviewedYear: number;
  income: string;
  expense: string;
  budgetNeeds: string;
  needsExpense: string;
  remainingNeeds: string;
  overBudgetNeeds: string;
  budgetWants: string;
  wantsExpense: string;
  remainingWants: string;
  overBudgetWants: string;
  budgetSavings: string;
  totalUnspentBudget: string;
  consumedPreviousBalance: string;
  unallocatedMoney: string;
  suggestedSavings: string;
}

export interface MonthlyAnalyticsData {
  incomeVsExpenseTrend: {
    months: string[];
    incomeData: string[];
    expenseData: string[];
  };
  categoryDistribution: {
    categoryId: number;
    categoryName: string;
    group: 'NEED' | 'WANT';
    totalAmount: string;
    percentage: number;
    color: string;
  }[];
  budgetVsActual: {
    needs: { budget: string; actual: string; variancePercent: number };
    wants: { budget: string; actual: string; variancePercent: number };
    savings: { target: string; allocated: string; achievementPercent: number };
  };
}

export interface BudgetSourceOverride {
  id?: number;
  incomeSourceId: number;
  incomeSource?: IncomeSource;
  needsRatio: number;
  savingsRatio: number;
  wantsRatio: number;
}

export interface BudgetPolicy {
  id: number;
  userId: number;
  effectiveYear: number;
  effectiveMonth: number;
  needsRatio: number;
  savingsRatio: number;
  wantsRatio: number;
  overrides?: BudgetSourceOverride[];
  isDefault?: boolean;
}

export const financeApi = {
  // Profile
  getProfile: () => api.get<{ data: FinanceProfile }>('/finance-profile'),
  updateProfile: (data: {
    initialBalance?: string;
    startDate?: string;
    timezone?: string;
    monthlyNeeds?: string;
  }) => api.put<{ data: FinanceProfile }>('/finance-profile', data),
  updateOnboarding: (data: {
    isOnboardingCompleted?: boolean;
    onboardingStep?: number;
    initialBalance?: string;
    monthlyNeeds?: string;
    emergencyMonthsTarget?: number;
  }) => api.patch<{ data: FinanceProfile }>('/finance-profile/onboarding', data),

  // Income Sources
  getIncomeSources: (includeArchived = false) =>
    api.get<{ data: IncomeSource[] }>(`/income-sources?includeArchived=${includeArchived}`),
  createIncomeSource: (name: string) =>
    api.post<{ data: IncomeSource }>('/income-sources', { name }),
  updateIncomeSource: (id: number, data: { name: string }) =>
    api.patch<{ data: IncomeSource }>(`/income-sources/${id}`, data),
  archiveIncomeSource: (id: number) =>
    api.patch<{ data: IncomeSource }>(`/income-sources/${id}/archive`),
  unarchiveIncomeSource: (id: number) =>
    api.patch<{ data: IncomeSource }>(`/income-sources/${id}/unarchive`),
  deleteIncomeSource: (id: number) =>
    api.delete<{ data: IncomeSource }>(`/income-sources/${id}`),

  // Categories
  getCategories: (includeArchived = false, type?: string) => {
    let url = `/categories?includeArchived=${includeArchived}`;
    if (type) url += `&type=${type}`;
    return api.get<{ data: Category[] }>(url);
  },
  createCategory: (data: { name: string; type: 'income' | 'expense'; group?: string }) =>
    api.post<{ data: Category }>('/categories', data),
  updateCategory: (id: number, data: { name?: string; group?: string }) =>
    api.patch<{ data: Category }>(`/categories/${id}`, data),
  archiveCategory: (id: number) =>
    api.patch<{ data: Category }>(`/categories/${id}/archive`),
  unarchiveCategory: (id: number) =>
    api.patch<{ data: Category }>(`/categories/${id}/unarchive`),
  deleteCategory: (id: number) =>
    api.delete<{ data: Category }>(`/categories/${id}`),

  // Budget Policies
  getActiveBudgetPolicy: (year?: number, month?: number) => {
    let url = '/budget-policies/active';
    if (year && month) url += `?year=${year}&month=${month}`;
    return api.get<{ data: BudgetPolicy }>(url);
  },
  upsertBudgetPolicy: (data: {
    effectiveYear: number;
    effectiveMonth: number;
    needsRatio: number;
    savingsRatio: number;
    wantsRatio: number;
    overrides?: {
      incomeSourceId: number;
      needsRatio: number;
      savingsRatio: number;
      wantsRatio: number;
    }[];
    applyToCurrentMonth?: boolean;
  }) => api.post<{ data: BudgetPolicy }>('/budget-policies', data),

  // Transactions
  getTransactions: (params?: { month?: number; year?: number; status?: string; type?: string; page?: number; limit?: number }) =>
    api.get<{ data: { items: Transaction[]; total: number; page: number; totalPages: number } }>(
      '/transactions',
      { params }
    ),
  createTransaction: (data: {
    amount: string;
    categoryId?: number;
    date: string;
    note?: string;
    incomeSourceId?: number;
    walletAccountId?: number;
    paymentMethodId?: number;
    sourceGoalId?: number;
  }) => api.post<{ data: Transaction }>('/transactions', data),
  updateTransaction: (
    id: number,
    data: {
      amount?: string;
      categoryId?: number;
      date?: string;
      note?: string;
      incomeSourceId?: number;
      walletAccountId?: number;
      reason?: string;
    }
  ) => api.patch<{ data: Transaction }>(`/transactions/${id}`, data),
  cancelTransaction: (id: number, reason?: string) =>
    api.delete<{ data: Transaction }>(`/transactions/${id}`, { params: { reason } }),

  // Savings Goals
  getSavingsGoals: (includeArchived = false) =>
    api.get<{ data: SavingsGoal[] }>(`/savings-goals?includeArchived=${includeArchived}`),
  createSavingsGoal: (data: {
    name: string;
    type: 'EMERGENCY' | 'UNASSIGNED' | 'PURCHASE';
    targetAmount?: string;
    targetMonths?: number;
    priceReference?: string;
    referenceDate?: string;
    mode?: 'FULL' | 'DOWN_PAYMENT';
    annualPriceIncreaseRatio?: number;
  }) => api.post<{ data: SavingsGoal }>('/savings-goals', data),
  updateSavingsGoal: (id: number, data: Partial<SavingsGoal>) =>
    api.patch<{ data: SavingsGoal }>(`/savings-goals/${id}`, data),
  archiveSavingsGoal: (id: number) =>
    api.patch<{ data: SavingsGoal }>(`/savings-goals/${id}/archive`),
  updateGoalShares: (shares: { goalId: number; shareRatio: number }[]) =>
    api.patch<{ data: any }>('/savings-goals/shares', { shares }),
  getGoalForecasts: () =>
    api.get<{ data: GoalForecast[] }>('/savings-goals/forecast'),
  getGoalForecast: (id: number) =>
    api.get<{ data: GoalForecast }>(`/savings-goals/${id}/forecast`),

  // Allocations
  getAllocationStatus: () =>
    api.get<{ data: AllocationStatus }>('/allocations/status'),
  getSavePreview: (amount?: string) => {
    const url = amount ? `/allocations/preview-save?amount=${amount}` : '/allocations/preview-save';
    return api.get<{ data: SavePreview }>(url);
  },
  allocateSavings: (data: {
    allocations: { targetGoalId: number; amount: string }[];
    date?: string;
    note?: string;
  }) => api.post<{ data: AllocationEvent[] }>('/allocations/allocate', data),
  releaseAllocation: (data: {
    sourceGoalId: number;
    amount: string;
    date?: string;
    note?: string;
  }) => api.post<{ data: AllocationEvent }>('/allocations/release', data),
  transferAllocation: (data: {
    sourceGoalId: number;
    targetGoalId: number;
    amount: string;
    date?: string;
    note?: string;
  }) => api.post<{ data: AllocationEvent }>('/allocations/transfer', data),
  getAllocationHistory: (limit = 50) =>
    api.get<{ data: AllocationEvent[] }>(`/allocations/history?limit=${limit}`),

  // Reports
  getSummary: () => api.get<{ data: ReportSummary }>('/reports/summary'),
  getMonthly: (month: number, year: number) =>
    api.get<{ data: MonthlyReport }>(`/reports/monthly?month=${month}&year=${year}`),
  getMonthEndReview: (month: number, year: number) =>
    api.get<{ data: MonthEndReview }>(`/reports/month-end-review?month=${month}&year=${year}`),
  getAnalytics: (month: number, year: number) =>
    api.get<{ data: MonthlyAnalyticsData }>(`/reports/analytics?month=${month}&year=${year}`),
  exportCsv: (month: number, year: number) =>
    api.get(`/reports/export/csv?month=${month}&year=${year}`, {
      responseType: 'blob',
    }),
  exportExcel: (month: number, year: number) =>
    api.get(`/reports/export/excel?month=${month}&year=${year}`, {
      responseType: 'blob',
    }),
  exportPdf: (month: number, year: number) =>
    api.get(`/reports/export/pdf?month=${month}&year=${year}`, {
      responseType: 'blob',
    }),

  // Simulations (Tahap 4)
  simulateGoal: (data: GoalSimulationParams) =>
    api.post<{ data: GoalSimulationResult }>('/simulations/goal', data),
  simulateMortgage: (data: MortgageSimulationParams) =>
    api.post<{ data: MortgageSimulationResult }>('/simulations/mortgage', data),

  // Recurring Transactions (Modul 5)
  getRecurringTransactions: () =>
    api.get<{ data: RecurringTransaction[] }>('/recurring-transactions'),
  getUpcomingRecurring: (days = 7) =>
    api.get<{ data: RecurringTransaction[] }>(`/recurring-transactions/upcoming?days=${days}`),
  createRecurringTransaction: (data: CreateRecurringDto) =>
    api.post<{ data: RecurringTransaction }>('/recurring-transactions', data),
  updateRecurringTransaction: (id: number, data: UpdateRecurringDto) =>
    api.patch<{ data: RecurringTransaction }>(`/recurring-transactions/${id}`, data),
  deleteRecurringTransaction: (id: number) =>
    api.delete<{ data: { success: boolean; message: string } }>(`/recurring-transactions/${id}`),
  executeRecurringNow: (id: number) =>
    api.post<{ data: { transaction: Transaction; recurringTransaction: RecurringTransaction } }>(
      `/recurring-transactions/${id}/execute`,
    ),

  // Wallets / Sub-Accounts (Modul 6)
  getWallets: () =>
    api.get<{ data: WalletAccount[] }>('/wallets'),
  createWallet: (data: CreateWalletPayload) =>
    api.post<{ data: WalletAccount }>('/wallets', data),
  updateWallet: (id: number, data: UpdateWalletPayload) =>
    api.patch<{ data: WalletAccount }>(`/wallets/${id}`, data),
  archiveWallet: (id: number) =>
    api.delete<{ data: WalletAccount }>(`/wallets/${id}`),
  transferWallet: (data: TransferWalletPayload) =>
    api.post<{
      data: {
        message: string;
        transfer: WalletTransfer;
        sourceWallet: WalletAccount;
        targetWallet: WalletAccount;
      };
    }>('/wallets/transfer', data),
  getWalletTransfers: (limit = 20) =>
    api.get<{ data: WalletTransfer[] }>(`/wallets/transfers?limit=${limit}`),
};

export interface WalletAccount {
  id: number;
  userId: number;
  name: string;
  type: 'BANK' | 'E_WALLET' | 'CASH' | 'INVESTMENT';
  accountNumber?: string | null;
  color?: string | null;
  balance: string;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WalletTransfer {
  id: number;
  userId: number;
  sourceWalletId: number;
  targetWalletId: number;
  amount: string;
  date: string;
  note?: string | null;
  createdAt: string;
  sourceWallet?: WalletAccount;
  targetWallet?: WalletAccount;
}

export interface CreateWalletPayload {
  name: string;
  type: string;
  accountNumber?: string;
  color?: string;
}

export interface UpdateWalletPayload {
  name?: string;
  type?: string;
  accountNumber?: string;
  color?: string;
}

export interface TransferWalletPayload {
  sourceWalletId: number;
  targetWalletId: number;
  amount: string;
  note?: string;
  date?: string;
}

export interface RecurringTransaction {
  id: number;
  userId: number;
  type: 'expense' | 'income';
  amount: string;
  categoryId: number | null;
  incomeSourceId: number | null;
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  interval: number;
  dayOfExecution: number;
  startDate: string;
  endDate: string | null;
  lastExecutedAt: string | null;
  nextRunDate: string;
  isActive: boolean;
  note: string | null;
  createdAt: string;
  updatedAt: string;
  category?: Category | null;
  incomeSource?: IncomeSource | null;
}

export interface CreateRecurringDto {
  type: 'expense' | 'income';
  amount: string;
  categoryId?: number;
  incomeSourceId?: number;
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  interval?: number;
  dayOfExecution: number;
  startDate: string;
  endDate?: string;
  note?: string;
  isActive?: boolean;
}

export interface UpdateRecurringDto {
  type?: 'expense' | 'income';
  amount?: string;
  categoryId?: number;
  incomeSourceId?: number;
  frequency?: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  interval?: number;
  dayOfExecution?: number;
  startDate?: string;
  endDate?: string;
  note?: string;
  isActive?: boolean;
}

