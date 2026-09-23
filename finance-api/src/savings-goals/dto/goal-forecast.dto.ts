export interface TopUpSuggestionDto {
  extraMonthlySavings: string;
  monthsSaved: number;
  newTargetMonths: number;
  newTargetDateFormatted: string;
}

export interface GoalMilestoneDto {
  currentPercent: number;
  achievedMilestones: number[]; // e.g. [25, 50]
  nextMilestone: number | null; // e.g. 75
  label: string; // e.g. "50% Tercapai"
}

export interface GoalForecastDto {
  goalId: number;
  goalName: string;
  mode: string | null;
  currentBalance: string;
  targetPrice: string;
  estimatedMonthlySavings: string;
  averageMonthlyIncome: string;
  incomeBasis: 'RECENT_6_MONTHS' | 'ALL_RECORDED' | 'PROFILE_ESTIMATE' | 'NO_DATA';
  incomeMonths: number;
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
  hasUserTargetMonths: boolean;
  userTargetMonths: number | null;
  requiredMonthlySavings: string | null;
  monthlyShortfall: string | null;
  estimatedMonthsWithCurrentSavings: number | null;
  topUpSuggestion?: TopUpSuggestionDto | null;
  milestone: GoalMilestoneDto;
}
