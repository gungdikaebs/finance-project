import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBudgetPolicyDto } from './dto/create-budget-policy.dto';

@Injectable()
export class BudgetPoliciesService {
  constructor(private prisma: PrismaService) {}

  calculateAllocations(
    amount: bigint,
    needsRatio: number,
    savingsRatio: number,
    _wantsRatio: number,
  ) {
    void _wantsRatio;
    const needs = (amount * BigInt(needsRatio)) / BigInt(10000);
    const savings = (amount * BigInt(savingsRatio)) / BigInt(10000);
    const wants = amount - needs - savings;
    return {
      allocatedNeeds: needs,
      allocatedSavings: savings,
      allocatedWants: wants,
    };
  }

  async getActivePolicy(userId: number, year: number, month: number) {
    const policies = await this.prisma.budgetPolicy.findMany({
      where: {
        userId,
        OR: [
          { effectiveYear: { lt: year } },
          {
            effectiveYear: year,
            effectiveMonth: { lte: month },
          },
        ],
      },
      include: {
        overrides: {
          include: {
            incomeSource: true,
          },
        },
      },
      orderBy: [{ effectiveYear: 'desc' }, { effectiveMonth: 'desc' }],
      take: 1,
    });

    if (policies.length > 0) {
      return policies[0];
    }

    // Default policy 50/30/20 jika belum ada yang disimpan
    return {
      id: 0,
      userId,
      effectiveYear: year,
      effectiveMonth: month,
      needsRatio: 5000,
      savingsRatio: 3000,
      wantsRatio: 2000,
      overrides: [],
      isDefault: true,
    };
  }

  getRatiosForSource(policy: any, incomeSourceId?: number | null) {
    if (incomeSourceId && policy.overrides && policy.overrides.length > 0) {
      const override = policy.overrides.find(
        (o: any) => o.incomeSourceId === incomeSourceId,
      );
      if (override) {
        return {
          needsRatio: override.needsRatio,
          savingsRatio: override.savingsRatio,
          wantsRatio: override.wantsRatio,
        };
      }
    }
    return {
      needsRatio: policy.needsRatio,
      savingsRatio: policy.savingsRatio,
      wantsRatio: policy.wantsRatio,
    };
  }

  async upsertPolicy(userId: number, dto: CreateBudgetPolicyDto) {
    if (dto.needsRatio + dto.savingsRatio + dto.wantsRatio !== 10000) {
      throw new BadRequestException(
        'Total rasio anggaran umum harus tepat 100% (10000 basis points)',
      );
    }

    if (dto.overrides && dto.overrides.length > 0) {
      const sourceIds = dto.overrides.map(
        (override) => override.incomeSourceId,
      );
      if (new Set(sourceIds).size !== sourceIds.length) {
        throw new BadRequestException(
          'Satu sumber pemasukan hanya boleh memiliki satu override',
        );
      }

      for (const ov of dto.overrides) {
        if (ov.needsRatio + ov.savingsRatio + ov.wantsRatio !== 10000) {
          throw new BadRequestException(
            `Total rasio untuk sumber ID ${ov.incomeSourceId} harus tepat 100%`,
          );
        }
      }

      const ownedActiveSources = await this.prisma.incomeSource.findMany({
        where: {
          id: { in: sourceIds },
          userId,
          isArchived: false,
        },
        select: { id: true },
      });
      if (ownedActiveSources.length !== sourceIds.length) {
        throw new BadRequestException(
          'Semua override harus menggunakan sumber pemasukan aktif milik pengguna',
        );
      }
    }

    return this.prisma.$transaction(async (prisma) => {
      const policy = await prisma.budgetPolicy.upsert({
        where: {
          userId_effectiveYear_effectiveMonth: {
            userId,
            effectiveYear: dto.effectiveYear,
            effectiveMonth: dto.effectiveMonth,
          },
        },
        update: {
          needsRatio: dto.needsRatio,
          savingsRatio: dto.savingsRatio,
          wantsRatio: dto.wantsRatio,
        },
        create: {
          userId,
          effectiveYear: dto.effectiveYear,
          effectiveMonth: dto.effectiveMonth,
          needsRatio: dto.needsRatio,
          savingsRatio: dto.savingsRatio,
          wantsRatio: dto.wantsRatio,
        },
      });

      // Update overrides
      await prisma.budgetSourceOverride.deleteMany({
        where: { policyId: policy.id },
      });

      if (dto.overrides && dto.overrides.length > 0) {
        for (const ov of dto.overrides) {
          await prisma.budgetSourceOverride.create({
            data: {
              policyId: policy.id,
              incomeSourceId: ov.incomeSourceId,
              needsRatio: ov.needsRatio,
              savingsRatio: ov.savingsRatio,
              wantsRatio: ov.wantsRatio,
            },
          });
        }
      }

      // Jika diminta diterapkan ke bulan berjalan, hitung ulang transaksi pemasukan aktif bulan itu
      if (dto.applyToCurrentMonth) {
        const startDate = new Date(
          dto.effectiveYear,
          dto.effectiveMonth - 1,
          1,
        );
        const endDate = new Date(
          dto.effectiveYear,
          dto.effectiveMonth,
          0,
          23,
          59,
          59,
          999,
        );

        const incomeTransactions = await prisma.transaction.findMany({
          where: {
            userId,
            typeSnapshot: 'INCOME',
            status: 'ACTIVE',
            date: {
              gte: startDate,
              lte: endDate,
            },
          },
        });

        const fullPolicy = await prisma.budgetPolicy.findUnique({
          where: { id: policy.id },
          include: { overrides: true },
        });

        for (const trx of incomeTransactions) {
          const ratios = this.getRatiosForSource(
            fullPolicy,
            trx.incomeSourceId,
          );
          const alloc = this.calculateAllocations(
            trx.amount,
            ratios.needsRatio,
            ratios.savingsRatio,
            ratios.wantsRatio,
          );

          await prisma.transaction.update({
            where: { id: trx.id },
            data: {
              allocatedNeeds: alloc.allocatedNeeds,
              allocatedSavings: alloc.allocatedSavings,
              allocatedWants: alloc.allocatedWants,
            },
          });
        }
      }

      return prisma.budgetPolicy.findUnique({
        where: { id: policy.id },
        include: {
          overrides: {
            include: { incomeSource: true },
          },
        },
      });
    });
  }

  async getHistory(userId: number) {
    return this.prisma.budgetPolicy.findMany({
      where: { userId },
      include: {
        overrides: {
          include: { incomeSource: true },
        },
      },
      orderBy: [{ effectiveYear: 'desc' }, { effectiveMonth: 'desc' }],
    });
  }
}
