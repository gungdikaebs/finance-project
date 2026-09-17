import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSavingsGoalDto } from './dto/create-savings-goal.dto';
import { UpdateSavingsGoalDto } from './dto/update-savings-goal.dto';
import { UpdateGoalSharesDto } from './dto/update-goal-shares.dto';

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
}
