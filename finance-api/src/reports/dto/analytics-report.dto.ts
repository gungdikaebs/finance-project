export interface MonthlyAnalyticsDto {
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
