import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MonthlyAnalyticsDto } from './dto/analytics-report.dto';
import * as ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';

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

    const walletsAgg = await this.prisma.walletAccount.aggregate({
      where: { userId, isArchived: false },
      _sum: { balance: true },
    });
    const walletCount = await this.prisma.walletAccount.count({
      where: { userId, isArchived: false },
    });
    const mainBalance =
      walletCount > 0
        ? (walletsAgg._sum.balance || BigInt(0))
        : profile.initialBalance + income - expense;

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

    // Hitung rekomendasi tabungan (UX-03)
    const activePolicy = await this.prisma.budgetPolicy.findFirst({
      where: { userId },
      orderBy: [{ effectiveYear: 'desc' }, { effectiveMonth: 'desc' }],
    });
    const savingsRatioBps = activePolicy ? activePolicy.savingsRatio : 3000;

    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentMonthEnd = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
      999,
    );

    const currentMonthTrx = await this.prisma.transaction.findMany({
      where: {
        userId,
        status: 'ACTIVE',
        date: { gte: currentMonthStart, lte: currentMonthEnd },
      },
      include: { category: true },
    });

    let currentMonthIncome = BigInt(0);
    for (const trx of currentMonthTrx) {
      if (trx.typeSnapshot === 'INCOME' || trx.category.type === 'income') {
        currentMonthIncome += trx.amount;
      }
    }

    let recommendedSavingAmount = BigInt(0);
    if (currentMonthIncome > BigInt(0)) {
      recommendedSavingAmount =
        (currentMonthIncome * BigInt(savingsRatioBps)) / BigInt(10000);
    } else if (unallocatedMoney > BigInt(0)) {
      recommendedSavingAmount =
        (unallocatedMoney * BigInt(savingsRatioBps)) / BigInt(10000);
    }

    if (recommendedSavingAmount > unallocatedMoney) {
      recommendedSavingAmount =
        unallocatedMoney > BigInt(0) ? unallocatedMoney : BigInt(0);
    }

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
      recommendedSavingAmount,
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

  async getAnalytics(userId: number, month: number, year: number): Promise<MonthlyAnalyticsDto> {
    const MONTH_NAMES = [
      'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
      'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des',
    ];

    // 1. Hitung jendela 6 bulan terakhir hingga (year, month)
    const trendMonths: {
      month: number;
      year: number;
      label: string;
      startDate: Date;
      endDate: Date;
    }[] = [];

    for (let i = 5; i >= 0; i--) {
      let m = month - i;
      let y = year;
      while (m <= 0) {
        m += 12;
        y -= 1;
      }
      const startDate = new Date(y, m - 1, 1);
      const endDate = new Date(y, m, 0, 23, 59, 59, 999);
      const label = `${MONTH_NAMES[m - 1]}${y !== year ? ` '${String(y).slice(2)}` : ''}`;
      trendMonths.push({ month: m, year: y, label, startDate, endDate });
    }

    const windowStart = trendMonths[0].startDate;
    const windowEnd = trendMonths[5].endDate;

    const [windowTrx, monthly] = await Promise.all([
      this.prisma.transaction.findMany({
        where: {
          userId,
          status: 'ACTIVE',
          date: {
            gte: windowStart,
            lte: windowEnd,
          },
        },
        include: {
          category: true,
        },
      }),
      this.getMonthly(userId, month, year),
    ]);

    const months: string[] = [];
    const incomeData: string[] = [];
    const expenseData: string[] = [];

    for (const tm of trendMonths) {
      months.push(tm.label);
      let inc = BigInt(0);
      let exp = BigInt(0);
      for (const trx of windowTrx) {
        if (trx.date >= tm.startDate && trx.date <= tm.endDate) {
          const isIncome =
            trx.typeSnapshot === 'INCOME' || trx.category?.type === 'income';
          if (isIncome) {
            inc += trx.amount;
          } else {
            exp += trx.amount;
          }
        }
      }
      incomeData.push(inc.toString());
      expenseData.push(exp.toString());
    }

    // 2. Distribusi Pengeluaran Berdasarkan Kategori Bulan Ini
    const expenseTrx = monthly.transactions.filter(
      (t) => !(t.typeSnapshot === 'INCOME' || t.category?.type === 'income'),
    );

    const catMap = new Map<
      number,
      { id: number; name: string; group: 'NEED' | 'WANT'; total: bigint }
    >();

    for (const trx of expenseTrx) {
      const catId = trx.categoryId || 0;
      const catName = trx.category?.name || 'Lain-lain';
      const grp = ((trx.groupSnapshot || trx.category?.group || 'NEED') === 'WANT'
        ? 'WANT'
        : 'NEED') as 'NEED' | 'WANT';

      const existing = catMap.get(catId);
      if (existing) {
        existing.total += trx.amount;
      } else {
        catMap.set(catId, { id: catId, name: catName, group: grp, total: trx.amount });
      }
    }

    const sortedCats = Array.from(catMap.values()).sort((a, b) =>
      b.total > a.total ? 1 : b.total < a.total ? -1 : 0,
    );
    const totalExpenseNum = Number(monthly.expense);

    const needColors = [
      '#183D2B', '#2A6A4B', '#0284C7', '#0D9488', '#3B82F6', '#6366F1', '#1E40AF',
    ];
    const wantColors = [
      '#B8DF38', '#F59E0B', '#E11D48', '#8B5CF6', '#EC4899', '#EA580C', '#10B981',
    ];

    let needIdx = 0;
    let wantIdx = 0;

    const categoryDistribution = sortedCats.map((cat) => {
      const pct =
        totalExpenseNum > 0
          ? Math.round((Number(cat.total) / totalExpenseNum) * 1000) / 10
          : 0;
      const color =
        cat.group === 'NEED'
          ? needColors[needIdx++ % needColors.length]
          : wantColors[wantIdx++ % wantColors.length];
      return {
        categoryId: cat.id,
        categoryName: cat.name,
        group: cat.group,
        totalAmount: cat.total.toString(),
        percentage: pct,
        color,
      };
    });

    // 3. Realisasi Anggaran vs Aktual (Budget vs Actual)
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    const [savingsIn, savingsOut] = await Promise.all([
      this.prisma.allocationEvent.aggregate({
        where: {
          userId,
          createdAt: { gte: startDate, lte: endDate },
          targetGoalId: { not: null },
        },
        _sum: { amount: true },
      }),
      this.prisma.allocationEvent.aggregate({
        where: {
          userId,
          createdAt: { gte: startDate, lte: endDate },
          sourceGoalId: { not: null },
        },
        _sum: { amount: true },
      }),
    ]);

    const netSavings =
      (savingsIn._sum.amount || BigInt(0)) - (savingsOut._sum.amount || BigInt(0));
    const actualSavings = netSavings > BigInt(0) ? netSavings : BigInt(0);

    const bNeedsNum = Number(monthly.budgetNeeds);
    const aNeedsNum = Number(monthly.needsExpense);
    const needsVariance =
      bNeedsNum > 0 ? Math.round((aNeedsNum / bNeedsNum) * 1000) / 10 : 0;

    const bWantsNum = Number(monthly.budgetWants);
    const aWantsNum = Number(monthly.wantsExpense);
    const wantsVariance =
      bWantsNum > 0 ? Math.round((aWantsNum / bWantsNum) * 1000) / 10 : 0;

    const bSavingsNum = Number(monthly.budgetSavings);
    const aSavingsNum = Number(actualSavings);
    const savingsAchievement =
      bSavingsNum > 0
        ? Math.round((aSavingsNum / bSavingsNum) * 1000) / 10
        : aSavingsNum > 0
        ? 100
        : 0;

    const budgetVsActual = {
      needs: {
        budget: monthly.budgetNeeds.toString(),
        actual: monthly.needsExpense.toString(),
        variancePercent: needsVariance,
      },
      wants: {
        budget: monthly.budgetWants.toString(),
        actual: monthly.wantsExpense.toString(),
        variancePercent: wantsVariance,
      },
      savings: {
        target: monthly.budgetSavings.toString(),
        allocated: actualSavings.toString(),
        achievementPercent: savingsAchievement,
      },
    };

    return {
      incomeVsExpenseTrend: {
        months,
        incomeData,
        expenseData,
      },
      categoryDistribution,
      budgetVsActual,
    };
  }

  private async getExportTransactions(userId: number, month: number, year: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    const [transactions, user, profile] = await Promise.all([
      this.prisma.transaction.findMany({
        where: {
          userId,
          date: { gte: startDate, lte: endDate },
        },
        include: {
          category: true,
          incomeSource: true,
          paymentMethod: true,
        },
        orderBy: {
          date: 'desc',
        },
      }),
      this.prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, name: true, email: true },
      }),
      this.getOrCreateProfile(userId),
    ]);

    return { transactions, user, profile, startDate, endDate };
  }

  async exportCsv(userId: number, month: number, year: number): Promise<string> {
    const { transactions } = await this.getExportTransactions(userId, month, year);

    const headers = [
      'Tanggal',
      'Tipe',
      'Kategori',
      'Grup Anggaran',
      'Sumber Pemasukan',
      'Nominal (IDR)',
      'Catatan',
      'Status',
      'ID Referensi',
    ];

    const escapeCsv = (val: string | number | undefined | null) => {
      if (val === undefined || val === null) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = transactions.map((trx) => {
      const isIncome =
        trx.typeSnapshot === 'INCOME' || trx.category?.type === 'income';
      const type = isIncome ? 'Pemasukan' : 'Pengeluaran';
      const category = trx.category?.name || (isIncome ? 'Pemasukan' : 'Lain-lain');
      const group = isIncome
        ? 'Pemasukan (50/30/20)'
        : (trx.groupSnapshot || trx.category?.group) === 'WANT'
        ? 'Keinginan (Want)'
        : 'Kebutuhan (Need)';
      const source = trx.incomeSource?.name || '-';
      const amount = trx.amount.toString();
      const note = trx.note || '-';
      const status = trx.status === 'ACTIVE' ? 'Aktif' : 'Dibatalkan';
      const refId = `TRX-${String(trx.id).padStart(5, '0')}`;

      return [
        escapeCsv(trx.date.toISOString().slice(0, 10)),
        escapeCsv(type),
        escapeCsv(category),
        escapeCsv(group),
        escapeCsv(source),
        escapeCsv(amount),
        escapeCsv(note),
        escapeCsv(status),
        escapeCsv(refId),
      ].join(',');
    });

    return '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
  }

  async exportExcel(userId: number, month: number, year: number): Promise<Buffer> {
    const { transactions, user } = await this.getExportTransactions(userId, month, year);

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Project-Keuangan';
    workbook.created = new Date();

    const sheet = workbook.addWorksheet(`Laporan ${month}-${year}`, {
      views: [{ showGridLines: true }],
    });

    // Title Block
    sheet.mergeCells('A1:I1');
    const titleCell = sheet.getCell('A1');
    titleCell.value = 'LAPORAN KEUANGAN BULANAN';
    titleCell.font = { name: 'Calibri', size: 15, bold: true, color: { argb: 'FFFFFFFF' } };
    titleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF183D2B' },
    };
    titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
    sheet.getRow(1).height = 36;

    // Subtitle Block (Period & User)
    sheet.mergeCells('A2:I2');
    const subCell = sheet.getCell('A2');
    subCell.value = `Periode: Bulan ${month}/${year}  |  Pengguna: ${user?.name || user?.email || 'User'}`;
    subCell.font = { name: 'Calibri', size: 10, italic: true, color: { argb: 'FF5E6961' } };
    subCell.alignment = { vertical: 'middle', horizontal: 'center' };
    sheet.getRow(2).height = 20;

    sheet.addRow([]);

    // Headers Row (Row 4)
    const headerRow = sheet.addRow([
      'Tanggal',
      'Tipe',
      'Kategori',
      'Grup Anggaran',
      'Sumber Pemasukan',
      'Nominal (IDR)',
      'Catatan',
      'Status',
      'ID Referensi',
    ]);
    headerRow.height = 24;
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF183D2B' },
      };
      cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFCCCCCC' } },
        bottom: { style: 'thin', color: { argb: 'FFCCCCCC' } },
      };
    });

    let totalIncome = BigInt(0);
    let totalExpense = BigInt(0);

    transactions.forEach((trx, idx) => {
      const isIncome =
        trx.typeSnapshot === 'INCOME' || trx.category?.type === 'income';
      const type = isIncome ? 'Pemasukan' : 'Pengeluaran';
      const category = trx.category?.name || (isIncome ? 'Pemasukan' : 'Lain-lain');
      const group = isIncome
        ? 'Pemasukan (50/30/20)'
        : (trx.groupSnapshot || trx.category?.group) === 'WANT'
        ? 'Keinginan (Want)'
        : 'Kebutuhan (Need)';
      const source = trx.incomeSource?.name || '-';
      const status = trx.status === 'ACTIVE' ? 'Aktif' : 'Dibatalkan';
      const refId = `TRX-${String(trx.id).padStart(5, '0')}`;
      const amountNum = Number(trx.amount);

      if (trx.status === 'ACTIVE') {
        if (isIncome) totalIncome += trx.amount;
        else totalExpense += trx.amount;
      }

      const row = sheet.addRow([
        trx.date.toISOString().slice(0, 10),
        type,
        category,
        group,
        source,
        amountNum,
        trx.note || '-',
        status,
        refId,
      ]);

      row.height = 20;
      const isEven = idx % 2 === 0;
      row.eachCell((cell, colNumber) => {
        cell.alignment = { vertical: 'middle', horizontal: colNumber === 6 ? 'right' : 'left' };
        if (isEven) {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF9FAFB' },
          };
        }
        if (colNumber === 6) {
          cell.numFmt = '#,##0';
          cell.font = { name: 'Calibri', bold: true };
        }
      });
    });

    // Summary Section
    sheet.addRow([]);
    const summaryRow = sheet.addRow([
      'TOTAL RINGKASAN',
      '',
      '',
      '',
      'Total Pemasukan:',
      Number(totalIncome),
      'Total Pengeluaran:',
      Number(totalExpense),
      '',
    ]);
    summaryRow.font = { name: 'Calibri', bold: true };
    summaryRow.getCell(6).numFmt = '#,##0';
    summaryRow.getCell(8).numFmt = '#,##0';

    sheet.columns = [
      { width: 14 },
      { width: 14 },
      { width: 26 },
      { width: 22 },
      { width: 22 },
      { width: 18 },
      { width: 30 },
      { width: 12 },
      { width: 14 },
    ];

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  async exportPdf(userId: number, month: number, year: number): Promise<Buffer> {
    const { transactions, user } = await this.getExportTransactions(userId, month, year);

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 36, size: 'A4' });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', (err) => reject(err));

      // Header Banner
      doc.rect(36, 36, 523, 50).fill('#183D2B');

      doc
        .fillColor('#B8DF38')
        .fontSize(15)
        .font('Helvetica-Bold')
        .text('PROJECT-KEUANGAN', 50, 48, { continued: true })
        .fillColor('#FFFFFF')
        .fontSize(11)
        .font('Helvetica')
        .text('  |  Laporan Arus Kas Bulanan');

      doc
        .fillColor('#F3F5EF')
        .fontSize(9)
        .text(
          `Periode: Bulan ${month}/${year}  •  Pengguna: ${user?.name || user?.email || 'User'}`,
          50,
          68,
        );

      // Summary KPIs
      let totalIncome = BigInt(0);
      let totalExpense = BigInt(0);
      for (const trx of transactions) {
        if (trx.status === 'ACTIVE') {
          const isIncome =
            trx.typeSnapshot === 'INCOME' || trx.category?.type === 'income';
          if (isIncome) totalIncome += trx.amount;
          else totalExpense += trx.amount;
        }
      }
      const netSavings = totalIncome - totalExpense;

      const formatNum = (val: bigint) => {
        const num = val.toString();
        return 'Rp ' + num.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
      };

      const kpiY = 100;
      doc.rect(36, kpiY, 165, 45).fillAndStroke('#F3F5EF', '#E2E8F0');
      doc.fillColor('#5E6961').fontSize(8).font('Helvetica').text('TOTAL PEMASUKAN', 46, kpiY + 8);
      doc.fillColor('#183D2B').fontSize(11).font('Helvetica-Bold').text(formatNum(totalIncome), 46, kpiY + 22);

      doc.rect(215, kpiY, 165, 45).fillAndStroke('#F3F5EF', '#E2E8F0');
      doc.fillColor('#5E6961').fontSize(8).font('Helvetica').text('TOTAL PENGELUARAN', 225, kpiY + 8);
      doc.fillColor('#E11D48').fontSize(11).font('Helvetica-Bold').text(formatNum(totalExpense), 225, kpiY + 22);

      doc.rect(394, kpiY, 165, 45).fillAndStroke('#F3F5EF', '#E2E8F0');
      doc.fillColor('#5E6961').fontSize(8).font('Helvetica').text('SALDO BERSIH BULANAN', 404, kpiY + 8);
      doc
        .fillColor(netSavings >= BigInt(0) ? '#183D2B' : '#E11D48')
        .fontSize(11)
        .font('Helvetica-Bold')
        .text(formatNum(netSavings), 404, kpiY + 22);

      // Table Header
      const tableY = 158;
      doc.rect(36, tableY, 523, 20).fill('#183D2B');
      doc.fillColor('#FFFFFF').fontSize(8).font('Helvetica-Bold');
      doc.text('TANGGAL', 42, tableY + 6, { width: 55 });
      doc.text('TIPE', 100, tableY + 6, { width: 60 });
      doc.text('KATEGORI / SUMBER', 165, tableY + 6, { width: 140 });
      doc.text('NOMINAL (IDR)', 310, tableY + 6, { width: 90, align: 'right' });
      doc.text('STATUS', 415, tableY + 6, { width: 45 });
      doc.text('CATATAN', 465, tableY + 6, { width: 90 });

      let currentY = tableY + 20;

      transactions.forEach((trx, idx) => {
        if (currentY > 750) {
          doc.addPage();
          currentY = 40;
          doc.rect(36, currentY, 523, 20).fill('#183D2B');
          doc.fillColor('#FFFFFF').fontSize(8).font('Helvetica-Bold');
          doc.text('TANGGAL', 42, currentY + 6, { width: 55 });
          doc.text('TIPE', 100, currentY + 6, { width: 60 });
          doc.text('KATEGORI / SUMBER', 165, currentY + 6, { width: 140 });
          doc.text('NOMINAL (IDR)', 310, currentY + 6, { width: 90, align: 'right' });
          doc.text('STATUS', 415, currentY + 6, { width: 45 });
          doc.text('CATATAN', 465, currentY + 6, { width: 90 });
          currentY += 20;
        }

        const isIncome =
          trx.typeSnapshot === 'INCOME' || trx.category?.type === 'income';
        const isEven = idx % 2 === 0;
        if (isEven) {
          doc.rect(36, currentY, 523, 18).fill('#F8FAFC');
        }

        const dateStr = trx.date.toISOString().slice(0, 10);
        const typeStr = isIncome ? 'Pemasukan' : 'Pengeluaran';
        const catStr = trx.category?.name || trx.incomeSource?.name || '-';
        const amountStr = formatNum(trx.amount);
        const statusStr = trx.status === 'ACTIVE' ? 'Aktif' : 'Batal';
        const noteStr = (trx.note || '-').slice(0, 22);

        doc.fillColor('#18221B').fontSize(7.5).font('Helvetica');
        doc.text(dateStr, 42, currentY + 5, { width: 55 });
        doc.fillColor(isIncome ? '#183D2B' : '#E11D48').font('Helvetica-Bold');
        doc.text(typeStr, 100, currentY + 5, { width: 60 });
        doc.fillColor('#18221B').font('Helvetica');
        doc.text(catStr.slice(0, 26), 165, currentY + 5, { width: 140 });
        doc.font('Helvetica-Bold').text(amountStr, 310, currentY + 5, { width: 90, align: 'right' });
        doc
          .font('Helvetica')
          .fillColor(trx.status === 'ACTIVE' ? '#183D2B' : '#94A3B8')
          .text(statusStr, 415, currentY + 5, { width: 45 });
        doc.fillColor('#64748B').text(noteStr, 465, currentY + 5, { width: 90 });

        currentY += 18;
      });

      doc
        .fontSize(7)
        .fillColor('#94A3B8')
        .text(
          'Dokumen ini dihasilkan secara otomatis oleh sistem Project-Keuangan (D-010).',
          36,
          790,
          { align: 'center', width: 523 },
        );

      doc.end();
    });
  }
}
