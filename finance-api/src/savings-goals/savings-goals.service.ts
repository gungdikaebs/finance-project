import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSavingsGoalDto } from './dto/create-savings-goal.dto';
import { UpdateSavingsGoalDto } from './dto/update-savings-goal.dto';
import { UpdateGoalSharesDto } from './dto/update-goal-shares.dto';
import {
  GoalForecastDto,
  TopUpSuggestionDto,
  GoalMilestoneDto,
} from './dto/goal-forecast.dto';

@Injectable()
export class SavingsGoalsService {
  constructor(private prisma: PrismaService) {}

  async ensureDefaultGoals(userId: number) {
    // 1. Dana Pengaman (EMERGENCY)
    let emergency = await this.prisma.savingsGoal.findFirst({
      where: { userId, type: 'EMERGENCY' },
    });

    if (!emergency) {
      emergency = await this.prisma.savingsGoal.create({
        data: {
          userId,
          name: 'Dana Pengaman',
          type: 'EMERGENCY',
          targetMonths: 6,
        },
      });
    }

    // 2. Tabungan Belum Ditentukan (UNASSIGNED)
    let unassigned = await this.prisma.savingsGoal.findFirst({
      where: { userId, type: 'UNASSIGNED' },
    });

    if (!unassigned) {
      unassigned = await this.prisma.savingsGoal.create({
        data: {
          userId,
          name: 'Tabungan Belum Ditentukan',
          type: 'UNASSIGNED',
        },
      });
    }

    return { emergency, unassigned };
  }

  async getGoalBalance(goalId: number): Promise<bigint> {
    const [inflows, outflows] = await Promise.all([
      this.prisma.allocationEvent.aggregate({
        where: { targetGoalId: goalId },
        _sum: { amount: true },
      }),
      this.prisma.allocationEvent.aggregate({
        where: { sourceGoalId: goalId },
        _sum: { amount: true },
      }),
    ]);

    const totalIn = inflows._sum.amount || BigInt(0);
    const totalOut = outflows._sum.amount || BigInt(0);
    return totalIn - totalOut;
  }

  async findAll(userId: number, includeArchived = false) {
    await this.ensureDefaultGoals(userId);

    const goals = await this.prisma.savingsGoal.findMany({
      where: {
        userId,
        ...(includeArchived ? {} : { isArchived: false }),
      },
      include: {
        shares: true,
      },
      orderBy: [{ type: 'asc' }, { createdAt: 'asc' }],
    });

    const goalsWithBalance = await Promise.all(
      goals.map(async (g) => {
        const balance = await this.getGoalBalance(g.id);
        const shareRatio = g.shares.length > 0 ? g.shares[0].shareRatio : 0;
        return {
          ...g,
          currentBalance: balance,
          shareRatio,
        };
      }),
    );

    return goalsWithBalance;
  }

  async findOne(userId: number, id: number) {
    const goal = await this.prisma.savingsGoal.findFirst({
      where: { id, userId },
      include: { shares: true },
    });

    if (!goal) {
      throw new NotFoundException('Target tabungan tidak ditemukan');
    }

    const currentBalance = await this.getGoalBalance(goal.id);
    const shareRatio = goal.shares.length > 0 ? goal.shares[0].shareRatio : 0;

    return {
      ...goal,
      currentBalance,
      shareRatio,
    };
  }

  async create(userId: number, dto: CreateSavingsGoalDto) {
    const goal = await this.prisma.savingsGoal.create({
      data: {
        userId,
        name: dto.name,
        type: dto.type,
        targetAmount: dto.targetAmount ? BigInt(dto.targetAmount) : null,
        targetMonths: dto.targetMonths || null,
        priceReference: dto.priceReference ? BigInt(dto.priceReference) : null,
        referenceDate: dto.referenceDate ? new Date(dto.referenceDate) : null,
        mode: dto.mode || null,
        annualPriceIncreaseRatio: dto.annualPriceIncreaseRatio || null,
      },
    });

    // Otomatis atur share jika target pembelian (PURCHASE)
    if (dto.type === 'PURCHASE') {
      const allPurchases = await this.prisma.savingsGoal.findMany({
        where: { userId, type: 'PURCHASE', isArchived: false },
      });

      if (allPurchases.length === 1) {
        // Target pembelian pertama: 100% share
        await this.prisma.goalShare.create({
          data: {
            userId,
            goalId: goal.id,
            shareRatio: 10000,
          },
        });
      } else {
        // Bagi rata sementara
        const equalShare = Math.floor(10000 / allPurchases.length);
        const remainder = 10000 - equalShare * allPurchases.length;
        for (let i = 0; i < allPurchases.length; i++) {
          const p = allPurchases[i];
          const finalShare =
            equalShare + (i === allPurchases.length - 1 ? remainder : 0);
          await this.prisma.goalShare.upsert({
            where: { userId_goalId: { userId, goalId: p.id } },
            update: { shareRatio: finalShare },
            create: { userId, goalId: p.id, shareRatio: finalShare },
          });
        }
      }
    }

    return this.findOne(userId, goal.id);
  }

  async update(userId: number, id: number, dto: UpdateSavingsGoalDto) {
    const existing = await this.prisma.savingsGoal.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      throw new NotFoundException('Target tabungan tidak ditemukan');
    }

    await this.prisma.savingsGoal.update({
      where: { id },
      data: {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.targetAmount !== undefined
          ? { targetAmount: dto.targetAmount ? BigInt(dto.targetAmount) : null }
          : {}),
        ...(dto.targetMonths !== undefined
          ? { targetMonths: dto.targetMonths }
          : {}),
        ...(dto.priceReference !== undefined
          ? {
              priceReference: dto.priceReference
                ? BigInt(dto.priceReference)
                : null,
            }
          : {}),
        ...(dto.referenceDate !== undefined
          ? {
              referenceDate: dto.referenceDate
                ? new Date(dto.referenceDate)
                : null,
            }
          : {}),
        ...(dto.mode !== undefined ? { mode: dto.mode } : {}),
        ...(dto.annualPriceIncreaseRatio !== undefined
          ? { annualPriceIncreaseRatio: dto.annualPriceIncreaseRatio }
          : {}),
        ...(dto.isArchived !== undefined ? { isArchived: dto.isArchived } : {}),
      },
    });

    return this.findOne(userId, id);
  }

  async archive(userId: number, id: number) {
    const goal = await this.findOne(userId, id);

    if (goal.type === 'EMERGENCY' || goal.type === 'UNASSIGNED') {
      throw new BadRequestException('Kantong default tidak boleh diarsipkan');
    }

    if (goal.currentBalance > BigInt(0)) {
      throw new BadRequestException(
        'Target ini masih memiliki saldo tersimpan. Harap lepas alokasi atau pindahkan dana terlebih dahulu sebelum diarsipkan.',
      );
    }

    return this.update(userId, id, { isArchived: true });
  }

  async updateShares(userId: number, dto: UpdateGoalSharesDto) {
    const activeGoals = await this.prisma.savingsGoal.findMany({
      where: { userId, type: 'PURCHASE', isArchived: false },
      select: { id: true },
    });
    const activeIds = new Set(activeGoals.map((goal) => goal.id));
    const submittedIds = dto.shares.map((share) => share.goalId);

    if (new Set(submittedIds).size !== submittedIds.length) {
      throw new BadRequestException(
        'Setiap Target impian hanya boleh muncul satu kali',
      );
    }

    if (
      submittedIds.length !== activeIds.size ||
      submittedIds.some((goalId) => !activeIds.has(goalId))
    ) {
      throw new BadRequestException(
        'Pembagian harus mencakup tepat seluruh Target impian aktif milik pengguna',
      );
    }

    const totalRatio = dto.shares.reduce((sum, s) => sum + s.shareRatio, 0);
    if (activeIds.size > 0 && totalRatio !== 10000) {
      throw new BadRequestException(
        'Total pembagian porsi impian harus tepat 100% (10000 bps)',
      );
    }

    if (activeIds.size === 0 && totalRatio !== 0) {
      throw new BadRequestException(
        'Pembagian harus kosong jika belum ada Target impian aktif',
      );
    }

    await this.prisma.$transaction(async (prisma) => {
      for (const s of dto.shares) {
        await prisma.goalShare.upsert({
          where: { userId_goalId: { userId, goalId: s.goalId } },
          update: { shareRatio: s.shareRatio },
          create: { userId, goalId: s.goalId, shareRatio: s.shareRatio },
        });
      }
    });

    return this.findAll(userId);
  }

  private formatTargetMonth(offsetMonths: number): {
    targetDate: string;
    targetDateFormatted: string;
  } {
    const MONTH_NAMES = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'Mei',
      'Jun',
      'Jul',
      'Ags',
      'Sep',
      'Okt',
      'Nov',
      'Des',
    ];
    const now = new Date();
    let year = now.getFullYear();
    let month = now.getMonth() + offsetMonths;
    year += Math.floor(month / 12);
    month = ((month % 12) + 12) % 12;
    const targetDate = `${year}-${String(month + 1).padStart(2, '0')}`;
    const targetDateFormatted = `${MONTH_NAMES[month]} ${year}`;
    return { targetDate, targetDateFormatted };
  }

  async getForecasts(
    userId: number,
    goalId?: number,
  ): Promise<GoalForecastDto[] | GoalForecastDto> {
    const now = new Date();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    // 1. Hitung rata-rata pemasukan bulanan dari transaksi riil pengguna
    const recentIncomeTrx = await this.prisma.transaction.findMany({
      where: {
        userId,
        status: 'ACTIVE',
        date: { gte: sixMonthsAgo },
      },
      include: { category: true },
    });

    let totalIncome = BigInt(0);
    const distinctMonths = new Set<string>();
    for (const trx of recentIncomeTrx) {
      const isIncome =
        trx.typeSnapshot === 'INCOME' || trx.category?.type === 'income';
      if (isIncome) {
        totalIncome += trx.amount;
        distinctMonths.add(`${trx.date.getFullYear()}-${trx.date.getMonth()}`);
      }
    }

    let avgMonthlyIncome = BigInt(0);
    let incomeBasis: GoalForecastDto['incomeBasis'] = 'NO_DATA';
    let incomeMonths = 0;
    if (distinctMonths.size > 0) {
      avgMonthlyIncome = totalIncome / BigInt(distinctMonths.size);
      incomeBasis = 'RECENT_6_MONTHS';
      incomeMonths = distinctMonths.size;
    } else {
      const allIncomeTrx = await this.prisma.transaction.findMany({
        where: { userId, status: 'ACTIVE' },
        include: { category: true },
      });
      let allIncome = BigInt(0);
      const allMonths = new Set<string>();
      for (const trx of allIncomeTrx) {
        const isIncome =
          trx.typeSnapshot === 'INCOME' || trx.category?.type === 'income';
        if (isIncome) {
          allIncome += trx.amount;
          allMonths.add(`${trx.date.getFullYear()}-${trx.date.getMonth()}`);
        }
      }
      if (allMonths.size > 0) {
        avgMonthlyIncome = allIncome / BigInt(allMonths.size);
        incomeBasis = 'ALL_RECORDED';
        incomeMonths = allMonths.size;
      } else {
        const profile = await this.prisma.financeProfile.findUnique({
          where: { userId },
        });
        if (profile && profile.monthlyNeeds > BigInt(0)) {
          avgMonthlyIncome = profile.monthlyNeeds * BigInt(2);
          incomeBasis = 'PROFILE_ESTIMATE';
        }
      }
    }

    // 2. Ambil kebijakan anggaran aktif pengguna
    const nowYear = now.getFullYear();
    const nowMonth = now.getMonth() + 1;
    const activePolicy = await this.prisma.budgetPolicy.findFirst({
      where: {
        userId,
        OR: [
          { effectiveYear: { lt: nowYear } },
          { effectiveYear: nowYear, effectiveMonth: { lte: nowMonth } },
        ],
      },
      orderBy: [{ effectiveYear: 'desc' }, { effectiveMonth: 'desc' }],
    });
    const savingsRatioBps = activePolicy ? activePolicy.savingsRatio : 3000;

    // 3. Ambil target impian yang akan dihitung proyeksinya
    const goals = await this.prisma.savingsGoal.findMany({
      where: {
        userId,
        type: 'PURCHASE',
        isArchived: false,
        ...(goalId ? { id: goalId } : {}),
      },
      include: {
        shares: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    if (goalId && goals.length === 0) {
      throw new NotFoundException('Target impian tidak ditemukan');
    }

    const forecasts: GoalForecastDto[] = await Promise.all(
      goals.map(async (g) => {
        const balance = await this.getGoalBalance(g.id);
        const targetPriceBig = g.priceReference || g.targetAmount || BigInt(0);
        const shareRatioBps = g.shares.length > 0 ? g.shares[0].shareRatio : 0;
        const inflationRateBps =
          g.annualPriceIncreaseRatio !== null &&
          g.annualPriceIncreaseRatio !== undefined
            ? g.annualPriceIncreaseRatio
            : 500; // default 5% laju inflasi

        const rAnnual = inflationRateBps / 10000;
        const iMonthly = rAnnual / 12;

        // Formula Roadmap 4.2:
        // S_monthly = avgIncome * savingsRatio * 40% (porsi impian) * shareRatio
        const monthlySavingsPot =
          (avgMonthlyIncome * BigInt(savingsRatioBps)) / BigInt(10000);
        const impianPot = (monthlySavingsPot * BigInt(4000)) / BigInt(10000); // 40% D-005
        const sMonthly = (impianPot * BigInt(shareRatioBps)) / BigInt(10000);

        // Milestone perhitungan (25%, 50%, 75%, 100%)
        const targetPriceNum = Number(targetPriceBig);
        const balanceNum = Number(balance);
        const currentPercent =
          targetPriceNum > 0
            ? Math.min(100, Math.round((balanceNum / targetPriceNum) * 100))
            : 0;
        const checkpoints = [25, 50, 75, 100];
        const achievedMilestones = checkpoints.filter(
          (c) => currentPercent >= c,
        );
        const nextMilestone =
          checkpoints.find((c) => currentPercent < c) || null;
        let milestoneLabel = 'Awal Perjalanan';
        if (currentPercent >= 100) milestoneLabel = 'Tercapai Penuh (100%)';
        else if (currentPercent >= 75) milestoneLabel = '75% Tercapai';
        else if (currentPercent >= 50) milestoneLabel = '50% Tercapai';
        else if (currentPercent >= 25) milestoneLabel = '25% Tercapai';

        const milestone: GoalMilestoneDto = {
          currentPercent,
          achievedMilestones,
          nextMilestone,
          label: milestoneLabel,
        };

        // Jika target harga belum diisi
        if (targetPriceBig <= BigInt(0)) {
          return {
            goalId: g.id,
            goalName: g.name,
            mode: g.mode,
            currentBalance: balance.toString(),
            targetPrice: '0',
            estimatedMonthlySavings: sMonthly.toString(),
            averageMonthlyIncome: avgMonthlyIncome.toString(),
            incomeBasis,
            incomeMonths,
            savingsRatioBps,
            shareRatioBps,
            inflationRateBps,
            isAchieved: false,
            isUnachievable: false,
            targetMonths: null,
            targetDate: null,
            targetDateFormatted: null,
            projectedPrice: '0',
            hasUserTargetMonths: !!(g.targetMonths && g.targetMonths > 0),
            userTargetMonths: g.targetMonths || null,
            requiredMonthlySavings: null,
            monthlyShortfall: null,
            estimatedMonthsWithCurrentSavings: null,
            topUpSuggestion: null,
            milestone,
          };
        }

        // Jika target sudah tercapai penuh (Saldo >= Target)
        if (balance >= targetPriceBig) {
          const { targetDate, targetDateFormatted } = this.formatTargetMonth(0);
          return {
            goalId: g.id,
            goalName: g.name,
            mode: g.mode,
            currentBalance: balance.toString(),
            targetPrice: targetPriceBig.toString(),
            estimatedMonthlySavings: sMonthly.toString(),
            averageMonthlyIncome: avgMonthlyIncome.toString(),
            incomeBasis,
            incomeMonths,
            savingsRatioBps,
            shareRatioBps,
            inflationRateBps,
            isAchieved: true,
            isUnachievable: false,
            targetMonths: 0,
            targetDate,
            targetDateFormatted,
            projectedPrice: targetPriceBig.toString(),
            hasUserTargetMonths: !!(g.targetMonths && g.targetMonths > 0),
            userTargetMonths: g.targetMonths || null,
            requiredMonthlySavings: '0',
            monthlyShortfall: '0',
            estimatedMonthsWithCurrentSavings: 0,
            topUpSuggestion: null,
            milestone: {
              ...milestone,
              currentPercent: 100,
              label: 'Tercapai Penuh (100%)',
            },
          };
        }

        // SKENARIO 1: Pengguna secara eksplisit menginput target waktu (targetMonths > 0)
        if (g.targetMonths && g.targetMonths > 0) {
          const userTargetMonths = g.targetMonths;
          const factorUser = Math.pow(1 + iMonthly, userTargetMonths);
          const projectedPriceAtTarget = BigInt(
            Math.round(targetPriceNum * factorUser),
          );
          const deficit =
            projectedPriceAtTarget > balance
              ? projectedPriceAtTarget - balance
              : BigInt(0);
          const reqMonthlyNum = Math.ceil(
            Number(deficit) / userTargetMonths,
          );
          const requiredMonthlySavings = BigInt(reqMonthlyNum);

          // Hitung juga estimasi bulan jika terus menabung sesuai alokasi riil saat ini (sMonthly)
          let currentPaceMonths: number | null = null;
          if (sMonthly > BigInt(0)) {
            for (let m = 1; m <= 600; m++) {
              const factor = Math.pow(1 + iMonthly, m);
              const pM = BigInt(Math.round(targetPriceNum * factor));
              const aM = balance + sMonthly * BigInt(m);
              if (aM >= pM) {
                currentPaceMonths = m;
                break;
              }
            }
          }

          const { targetDate, targetDateFormatted } =
            this.formatTargetMonth(userTargetMonths);

          let topUpSuggestion: TopUpSuggestionDto | null = null;
          let monthlyShortfall = '0';

          if (requiredMonthlySavings > sMonthly) {
            let deltaS = requiredMonthlySavings - sMonthly;
            monthlyShortfall = deltaS.toString();
            deltaS = ((deltaS + BigInt(9999)) / BigInt(10000)) * BigInt(10000);

            topUpSuggestion = {
              extraMonthlySavings: deltaS.toString(),
              monthsSaved: currentPaceMonths
                ? Math.max(0, currentPaceMonths - userTargetMonths)
                : 0,
              newTargetMonths: userTargetMonths,
              newTargetDateFormatted: targetDateFormatted,
            };
          }

          return {
            goalId: g.id,
            goalName: g.name,
            mode: g.mode,
            currentBalance: balance.toString(),
            targetPrice: targetPriceBig.toString(),
            estimatedMonthlySavings: sMonthly.toString(),
            averageMonthlyIncome: avgMonthlyIncome.toString(),
            incomeBasis,
            incomeMonths,
            savingsRatioBps,
            shareRatioBps,
            inflationRateBps,
            isAchieved: false,
            isUnachievable: false,
            targetMonths: userTargetMonths,
            targetDate,
            targetDateFormatted,
            projectedPrice: projectedPriceAtTarget.toString(),
            hasUserTargetMonths: true,
            userTargetMonths,
            requiredMonthlySavings: requiredMonthlySavings.toString(),
            monthlyShortfall,
            estimatedMonthsWithCurrentSavings: currentPaceMonths,
            topUpSuggestion,
            milestone,
          };
        }

        // SKENARIO 2: Pengguna TIDAK menginput target waktu (dihitung otomatis dari alokasi tabungan riil sMonthly)
        if (sMonthly === BigInt(0)) {
          return {
            goalId: g.id,
            goalName: g.name,
            mode: g.mode,
            currentBalance: balance.toString(),
            targetPrice: targetPriceBig.toString(),
            estimatedMonthlySavings: '0',
            averageMonthlyIncome: avgMonthlyIncome.toString(),
            incomeBasis,
            incomeMonths,
            savingsRatioBps,
            shareRatioBps,
            inflationRateBps,
            isAchieved: false,
            isUnachievable: true,
            unachievableReason: 'ZERO_SAVINGS',
            unachievableMessage:
              'Belum ada alokasi tabungan bulanan yang mengalir ke target ini.',
            targetMonths: null,
            targetDate: null,
            targetDateFormatted: null,
            projectedPrice: targetPriceBig.toString(),
            hasUserTargetMonths: false,
            userTargetMonths: null,
            requiredMonthlySavings: null,
            monthlyShortfall: null,
            estimatedMonthsWithCurrentSavings: null,
            topUpSuggestion: null,
            milestone,
          };
        }

        // Cek kondisi kalah cepat dari inflasi (Roadmap 4.2):
        // Kenaikan harga bulanan pada bulan 1 = P0 * (r / 12)
        const monthlyInflationIncrease = Math.round(targetPriceNum * iMonthly);
        if (sMonthly <= BigInt(monthlyInflationIncrease)) {
          const neededToBeat =
            BigInt(monthlyInflationIncrease) - sMonthly + BigInt(50000);
          const cleanExtra =
            ((neededToBeat + BigInt(9999)) / BigInt(10000)) * BigInt(10000);
          return {
            goalId: g.id,
            goalName: g.name,
            mode: g.mode,
            currentBalance: balance.toString(),
            targetPrice: targetPriceBig.toString(),
            estimatedMonthlySavings: sMonthly.toString(),
            averageMonthlyIncome: avgMonthlyIncome.toString(),
            incomeBasis,
            incomeMonths,
            savingsRatioBps,
            shareRatioBps,
            inflationRateBps,
            isAchieved: false,
            isUnachievable: true,
            unachievableReason: 'INFLATION_OUTPACING',
            unachievableMessage:
              'Pertumbuhan tabungan saat ini kalah cepat dari kenaikan harga akibat inflasi.',
            targetMonths: null,
            targetDate: null,
            targetDateFormatted: null,
            projectedPrice: targetPriceBig.toString(),
            hasUserTargetMonths: false,
            userTargetMonths: null,
            requiredMonthlySavings: null,
            monthlyShortfall: null,
            estimatedMonthsWithCurrentSavings: null,
            topUpSuggestion: {
              extraMonthlySavings: cleanExtra.toString(),
              monthsSaved: 0,
              newTargetMonths: 0,
              newTargetDateFormatted: 'Mengatasi Laju Inflasi',
            },
            milestone,
          };
        }

        // Iterasi pencarian integer m terkecil (1 s/d 600 bulan = 50 tahun)
        let targetM: number | null = null;
        let finalProjectedPrice = targetPriceBig;

        for (let m = 1; m <= 600; m++) {
          const factor = Math.pow(1 + iMonthly, m);
          const pM = BigInt(Math.round(targetPriceNum * factor));
          const aM = balance + sMonthly * BigInt(m);

          if (aM >= pM) {
            targetM = m;
            finalProjectedPrice = pM;
            break;
          }
        }

        if (!targetM) {
          const mHorizon = 120;
          const factorH = Math.pow(1 + iMonthly, mHorizon);
          const pH = BigInt(Math.round(targetPriceNum * factorH));
          const deficitH = pH > balance ? pH - balance : BigInt(0);
          const requiredH =
            (deficitH + BigInt(mHorizon - 1)) / BigInt(mHorizon);
          const extraH =
            requiredH > sMonthly ? requiredH - sMonthly : BigInt(50000);
          const cleanExtraH =
            ((extraH + BigInt(9999)) / BigInt(10000)) * BigInt(10000);
          const hFormatted = this.formatTargetMonth(mHorizon);

          return {
            goalId: g.id,
            goalName: g.name,
            mode: g.mode,
            currentBalance: balance.toString(),
            targetPrice: targetPriceBig.toString(),
            estimatedMonthlySavings: sMonthly.toString(),
            averageMonthlyIncome: avgMonthlyIncome.toString(),
            incomeBasis,
            incomeMonths,
            savingsRatioBps,
            shareRatioBps,
            inflationRateBps,
            isAchieved: false,
            isUnachievable: true,
            unachievableReason: 'INFLATION_OUTPACING',
            unachievableMessage:
              'Pertumbuhan tabungan saat ini kalah cepat dari kenaikan harga akibat inflasi tahunan.',
            targetMonths: null,
            targetDate: null,
            targetDateFormatted: null,
            projectedPrice: targetPriceBig.toString(),
            hasUserTargetMonths: false,
            userTargetMonths: null,
            requiredMonthlySavings: requiredH.toString(),
            monthlyShortfall: cleanExtraH.toString(),
            estimatedMonthsWithCurrentSavings: null,
            topUpSuggestion: {
              extraMonthlySavings: cleanExtraH.toString(),
              monthsSaved: 0,
              newTargetMonths: mHorizon,
              newTargetDateFormatted: hFormatted.targetDateFormatted,
            },
            milestone,
          };
        }

        const { targetDate, targetDateFormatted } =
          this.formatTargetMonth(targetM);

        // Rekomendasi Top-up: Nabung ekstra Rp X/bln untuk maju k bulan lebih cepat
        let topUpSuggestion: TopUpSuggestionDto | null = null;
        if (targetM >= 2) {
          const k = targetM >= 6 ? 3 : targetM >= 3 ? 2 : 1;
          const mPrime = targetM - k;
          const factorPrime = Math.pow(1 + iMonthly, mPrime);
          const pMPrime = BigInt(Math.round(targetPriceNum * factorPrime));
          const deficitPrime =
            pMPrime > balance ? pMPrime - balance : BigInt(0);
          const requiredMonthly =
            (deficitPrime + BigInt(mPrime - 1)) / BigInt(mPrime);

          if (requiredMonthly > sMonthly) {
            let deltaS = requiredMonthly - sMonthly;
            deltaS = ((deltaS + BigInt(9999)) / BigInt(10000)) * BigInt(10000);
            const primeFormatted = this.formatTargetMonth(mPrime);

            topUpSuggestion = {
              extraMonthlySavings: deltaS.toString(),
              monthsSaved: k,
              newTargetMonths: mPrime,
              newTargetDateFormatted: primeFormatted.targetDateFormatted,
            };
          }
        }

        return {
          goalId: g.id,
          goalName: g.name,
          mode: g.mode,
          currentBalance: balance.toString(),
          targetPrice: targetPriceBig.toString(),
          estimatedMonthlySavings: sMonthly.toString(),
          averageMonthlyIncome: avgMonthlyIncome.toString(),
          incomeBasis,
          incomeMonths,
          savingsRatioBps,
          shareRatioBps,
          inflationRateBps,
          isAchieved: false,
          isUnachievable: false,
          targetMonths: targetM,
          targetDate,
          targetDateFormatted,
          projectedPrice: finalProjectedPrice.toString(),
          hasUserTargetMonths: false,
          userTargetMonths: null,
          requiredMonthlySavings: null,
          monthlyShortfall: null,
          estimatedMonthsWithCurrentSavings: targetM,
          topUpSuggestion,
          milestone,
        };
      }),
    );

    if (goalId) {
      return forecasts[0];
    }
    return forecasts;
  }
}
