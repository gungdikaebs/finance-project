import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  private async getOrCreateProfile(userId: number) {
    let profile = await this.prisma.financeProfile.findUnique({
      where: { userId },
    });
    if (!profile) {
      profile = await this.prisma.financeProfile.create({
        data: {
          userId,
          initialBalance: BigInt(0),
          startDate: new Date(),
          timezone: 'Asia/Makassar',
          monthlyNeeds: BigInt(0),
        },
      });
    }
    return profile;
  }

  async getSummary(userId: number) {
    const profile = await this.getOrCreateProfile(userId);

    const transactions = await this.prisma.transaction.findMany({
      where: {
        userId,
        status: 'ACTIVE',
      },
      include: {
        category: true,
      },
    });

    let income = BigInt(0);
    let expense = BigInt(0);
    let needsExpense = BigInt(0);
    let wantsExpense = BigInt(0);

    for (const trx of transactions) {
      const isIncome =
        trx.typeSnapshot === 'INCOME' || trx.category.type === 'income';

      if (isIncome) {
        income += trx.amount;
      } else {
        expense += trx.amount;
        const group = trx.groupSnapshot || trx.category.group;
        if (group === 'NEED') {
          needsExpense += trx.amount;
        } else if (group === 'WANT') {
          wantsExpense += trx.amount;
        }
      }
    }

    const mainBalance = profile.initialBalance + income - expense;

    // Hitung total dana tersisih dari seluruh goal aktif
    const [inflows, outflows] = await Promise.all([
      this.prisma.allocationEvent.aggregate({
        where: { userId, targetGoalId: { not: null } },
        _sum: { amount: true },
      }),
      this.prisma.allocationEvent.aggregate({
        where: { userId, sourceGoalId: { not: null } },
        _sum: { amount: true },
      }),
    ]);

    const totalAllocatedSavings =
      (inflows._sum.amount || BigInt(0)) - (outflows._sum.amount || BigInt(0));
    const unallocatedMoney = mainBalance - totalAllocatedSavings;

    // Hitung saldo dana darurat (EMERGENCY)
    const emergencyGoal = await this.prisma.savingsGoal.findFirst({
      where: { userId, type: 'EMERGENCY' },
    });
    let emergencyBalance = BigInt(0);
    if (emergencyGoal) {
      const [eIn, eOut] = await Promise.all([
        this.prisma.allocationEvent.aggregate({
          where: { targetGoalId: emergencyGoal.id },
          _sum: { amount: true },
        }),
        this.prisma.allocationEvent.aggregate({
          where: { sourceGoalId: emergencyGoal.id },
          _sum: { amount: true },
        }),
      ]);
      emergencyBalance =
        (eIn._sum.amount || BigInt(0)) - (eOut._sum.amount || BigInt(0));
    }

    let emergencyMonths = 0;
    if (profile.monthlyNeeds > BigInt(0)) {
      emergencyMonths = Number(emergencyBalance) / Number(profile.monthlyNeeds);
    }

    return {
      initialBalance: profile.initialBalance,
      income,
      expense,
      needsExpense,
      wantsExpense,
      balance: income - expense,
      mainBalance,
      totalAllocatedSavings,
      unallocatedMoney,
      emergencyBalance,
      emergencyMonths: Math.round(emergencyMonths * 10) / 10,
      monthlyNeedsReference: profile.monthlyNeeds,
      timezone: profile.timezone,
      startDate: profile.startDate,
    };
  }

  async getMonthly(userId: number, month: number, year: number) {
    const profile = await this.getOrCreateProfile(userId);

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    const transactions = await this.prisma.transaction.findMany({
      where: {
        userId,
        status: 'ACTIVE',
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        category: true,
        incomeSource: true,
        paymentMethod: true,
      },
      orderBy: {
        date: 'desc',
      },
    });

    let income = BigInt(0);
    let expense = BigInt(0);
    let needsExpense = BigInt(0);
    let wantsExpense = BigInt(0);

    let budgetNeeds = BigInt(0);
    let budgetSavings = BigInt(0);
    let budgetWants = BigInt(0);

    for (const trx of transactions) {
      const isIncome =
        trx.typeSnapshot === 'INCOME' || trx.category.type === 'income';

      if (isIncome) {
        income += trx.amount;
        budgetNeeds += trx.allocatedNeeds || BigInt(0);
        budgetSavings += trx.allocatedSavings || BigInt(0);
        budgetWants += trx.allocatedWants || BigInt(0);
      } else {
        expense += trx.amount;
        const group = trx.groupSnapshot || trx.category.group;
        if (group === 'NEED') {
          needsExpense += trx.amount;
        } else if (group === 'WANT') {
          wantsExpense += trx.amount;
        }
      }
    }

    const remainingNeeds = budgetNeeds - needsExpense;
    const remainingWants = budgetWants - wantsExpense;
    const overBudgetNeeds =
      needsExpense > budgetNeeds ? needsExpense - budgetNeeds : BigInt(0);
    const overBudgetWants =
      wantsExpense > budgetWants ? wantsExpense - budgetWants : BigInt(0);
    const consumedPreviousBalance =
      expense > income ? expense - income : BigInt(0);

    // Saldo kumulatif hingga akhir bulan ini
    const allTrxUntilMonth = await this.prisma.transaction.findMany({
      where: {
        userId,
        status: 'ACTIVE',
        date: {
          lte: endDate,
        },
      },
      include: {
        category: true,
      },
    });

    let cumulativeIncome = BigInt(0);
    let cumulativeExpense = BigInt(0);
    for (const trx of allTrxUntilMonth) {
      const isIncome =
        trx.typeSnapshot === 'INCOME' || trx.category.type === 'income';
      if (isIncome) {
        cumulativeIncome += trx.amount;
      } else {
        cumulativeExpense += trx.amount;
      }
    }

    const mainBalance =
      profile.initialBalance + cumulativeIncome - cumulativeExpense;

    return {
      month,
      year,
      income,
      expense,
      balance: income - expense,
      mainBalance,
      budgetNeeds,
      budgetSavings,
      budgetWants,
      needsExpense,
      wantsExpense,
      remainingNeeds,
      remainingWants,
      overBudgetNeeds,
      overBudgetWants,
      consumedPreviousBalance,
      transactions,
    };
  }

  async getMonthEndReview(userId: number, month: number, year: number) {
    const monthly = await this.getMonthly(userId, month, year);
    const summary = await this.getSummary(userId);

    const unspentNeeds =
      monthly.remainingNeeds > BigInt(0) ? monthly.remainingNeeds : BigInt(0);
    const unspentWants =
      monthly.remainingWants > BigInt(0) ? monthly.remainingWants : BigInt(0);
    const totalUnspentBudget = unspentNeeds + unspentWants;

    const suggestedSavings =
      totalUnspentBudget < summary.unallocatedMoney
        ? totalUnspentBudget
        : summary.unallocatedMoney > BigInt(0)
        ? summary.unallocatedMoney
        : BigInt(0);

    return {
      reviewedMonth: month,
      reviewedYear: year,
      income: monthly.income,
      expense: monthly.expense,
      budgetNeeds: monthly.budgetNeeds,
      needsExpense: monthly.needsExpense,
      remainingNeeds: monthly.remainingNeeds,
      overBudgetNeeds: monthly.overBudgetNeeds,
      budgetWants: monthly.budgetWants,
      wantsExpense: monthly.wantsExpense,
      remainingWants: monthly.remainingWants,
      overBudgetWants: monthly.overBudgetWants,
      budgetSavings: monthly.budgetSavings,
      totalUnspentBudget,
      consumedPreviousBalance: monthly.consumedPreviousBalance,
      unallocatedMoney: summary.unallocatedMoney,
      suggestedSavings,
    };
  }
}
