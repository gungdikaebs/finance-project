import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SavingsGoalsService } from '../savings-goals/savings-goals.service';
import { AllocateDto } from './dto/allocate.dto';
import { ReleaseDto } from './dto/release.dto';
import { TransferDto } from './dto/transfer.dto';

@Injectable()
export class AllocationsService {
  constructor(
    private prisma: PrismaService,
    private goalsService: SavingsGoalsService,
  ) {}

  async getUnallocatedStatus(userId: number) {
    const profile = await this.prisma.financeProfile.findUnique({
      where: { userId },
    });
    const initialBalance = profile ? profile.initialBalance : BigInt(0);

    const transactions = await this.prisma.transaction.findMany({
      where: { userId, status: 'ACTIVE' },
      include: { category: true },
    });

    let income = BigInt(0);
    let expense = BigInt(0);
    for (const t of transactions) {
      if (t.typeSnapshot === 'INCOME' || t.category.type === 'income') {
        income += t.amount;
      } else {
        expense += t.amount;
      }
    }
    const mainBalance = initialBalance + income - expense;

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

    const totalAllocated =
      (inflows._sum.amount || BigInt(0)) - (outflows._sum.amount || BigInt(0));
    const unallocatedMoney = mainBalance - totalAllocated;

    return {
      mainBalance,
      totalAllocated,
      unallocatedMoney,
    };
  }

  async getPreviewSave(userId: number, amountStr?: string) {
    const goals = await this.goalsService.findAll(userId);
    const emergencyGoal = goals.find((g) => g.type === 'EMERGENCY');
    const unassignedGoal = goals.find((g) => g.type === 'UNASSIGNED');
    const purchaseGoals = goals.filter(
      (g) => g.type === 'PURCHASE' && !g.isArchived,
    );

    const { unallocatedMoney } = await this.getUnallocatedStatus(userId);

    let amount = BigInt(0);
    if (amountStr) {
      amount = BigInt(amountStr);
    } else {
      amount = unallocatedMoney > BigInt(0) ? unallocatedMoney : BigInt(0);
    }

    // Default D-005: 60% Dana Pengaman, 40% Impian
    const emergencyPart = (amount * BigInt(6000)) / BigInt(10000);
    const impianPart = amount - emergencyPart;

    const items: {
      targetGoalId: number;
      name: string;
      amount: bigint;
      type: string;
    }[] = [];

    if (emergencyGoal) {
      items.push({
        targetGoalId: emergencyGoal.id,
        name: emergencyGoal.name,
        amount: emergencyPart,
        type: 'EMERGENCY',
      });
    }

    if (purchaseGoals.length > 0) {
      // Bagi antar target impian sesuai shareRatio
      let allocatedImpian = BigInt(0);
      for (let i = 0; i < purchaseGoals.length; i++) {
        const p = purchaseGoals[i];
        let pAmount = BigInt(0);
        if (i === purchaseGoals.length - 1) {
          pAmount = impianPart - allocatedImpian;
        } else {
          pAmount = (impianPart * BigInt(p.shareRatio || 0)) / BigInt(10000);
          allocatedImpian += pAmount;
        }

        items.push({
          targetGoalId: p.id,
          name: p.name,
          amount: pAmount,
          type: 'PURCHASE',
        });
      }
    } else if (unassignedGoal) {
      items.push({
        targetGoalId: unassignedGoal.id,
        name: unassignedGoal.name,
        amount: impianPart,
        type: 'UNASSIGNED',
      });
    }

    return {
      totalAmount: amount,
      unallocatedMoney,
      previewItems: items,
    };
  }

  async allocate(userId: number, dto: AllocateDto) {
    if (!dto.allocations || dto.allocations.length === 0) {
      throw new BadRequestException('Daftar alokasi tidak boleh kosong');
    }

    const targetIds = dto.allocations.map((item) => item.targetGoalId);
    if (new Set(targetIds).size !== targetIds.length) {
      throw new BadRequestException(
        'Satu Dana tujuan hanya boleh muncul satu kali dalam penyisihan',
      );
    }

    let totalRequested = BigInt(0);
    for (const item of dto.allocations) {
      const amt = BigInt(item.amount);
      if (amt <= BigInt(0)) {
        throw new BadRequestException(
          'Setiap nominal alokasi harus lebih besar dari 0',
        );
      }
      totalRequested += amt;
    }

    const { unallocatedMoney } = await this.getUnallocatedStatus(userId);
    if (totalRequested > unallocatedMoney) {
      throw new BadRequestException(
        `Total penyisihan (${totalRequested}) melebihi Uang Belum Disisihkan yang tersedia (${unallocatedMoney})`,
      );
    }

    // Verifikasi semua targetGoalId milik user
    for (const item of dto.allocations) {
      const goal = await this.prisma.savingsGoal.findFirst({
        where: { id: item.targetGoalId, userId },
      });
      if (!goal) {
        throw new NotFoundException(
          `Target ID ${item.targetGoalId} tidak ditemukan`,
        );
      }
    }

    const allocDate = dto.date ? new Date(dto.date) : new Date();

    return this.prisma.$transaction(async (prisma) => {
      const events: any[] = [];
      for (const item of dto.allocations) {
        const ev = await prisma.allocationEvent.create({
          data: {
            userId,
            sourceGoalId: null, // Dari uang belum disisihkan
            targetGoalId: item.targetGoalId,
            amount: BigInt(item.amount),
            date: allocDate,
            type: 'ALLOCATE',
            note: dto.note || 'Penyisihan tabungan',
          },
          include: {
            targetGoal: true,
          },
        });
        events.push(ev);
      }
      return events;
    });
  }

  async release(userId: number, dto: ReleaseDto) {
    const goal = await this.prisma.savingsGoal.findFirst({
      where: { id: dto.sourceGoalId, userId },
    });
    if (!goal) {
      throw new NotFoundException('Target tujuan tidak ditemukan');
    }

    const currentBalance = await this.goalsService.getGoalBalance(goal.id);
    const releaseAmount = BigInt(dto.amount);
    if (releaseAmount <= BigInt(0)) {
      throw new BadRequestException(
        'Nominal pelepasan harus lebih besar dari 0',
      );
    }

    if (releaseAmount > currentBalance) {
      throw new BadRequestException(
        `Nominal pelepasan (${releaseAmount}) melebihi saldo yang tersedia pada target ini (${currentBalance})`,
      );
    }

    const releaseDate = dto.date ? new Date(dto.date) : new Date();

    return this.prisma.allocationEvent.create({
      data: {
        userId,
        sourceGoalId: dto.sourceGoalId,
        targetGoalId: null, // Kembali ke uang belum disisihkan
        amount: releaseAmount,
        date: releaseDate,
        type: 'RELEASE',
        note: dto.note || 'Pelepasan alokasi',
      },
      include: {
        sourceGoal: true,
      },
    });
  }

  async transfer(userId: number, dto: TransferDto) {
    if (dto.sourceGoalId === dto.targetGoalId) {
      throw new BadRequestException('Tujuan transfer harus berbeda');
    }

    const [srcGoal, tgtGoal] = await Promise.all([
      this.prisma.savingsGoal.findFirst({
        where: { id: dto.sourceGoalId, userId },
      }),
      this.prisma.savingsGoal.findFirst({
        where: { id: dto.targetGoalId, userId },
      }),
    ]);

    if (!srcGoal || !tgtGoal) {
      throw new NotFoundException('Target asal atau tujuan tidak ditemukan');
    }

    const currentBalance = await this.goalsService.getGoalBalance(srcGoal.id);
    const transferAmount = BigInt(dto.amount);
    if (transferAmount <= BigInt(0)) {
      throw new BadRequestException(
        'Nominal transfer harus lebih besar dari 0',
      );
    }

    if (transferAmount > currentBalance) {
      throw new BadRequestException(
        `Saldo target asal (${currentBalance}) tidak mencukupi untuk transfer ${transferAmount}`,
      );
    }

    const transferDate = dto.date ? new Date(dto.date) : new Date();

    return this.prisma.allocationEvent.create({
      data: {
        userId,
        sourceGoalId: dto.sourceGoalId,
        targetGoalId: dto.targetGoalId,
        amount: transferAmount,
        date: transferDate,
        type: 'TRANSFER',
        note: dto.note || 'Transfer antar tujuan tabungan',
      },
      include: {
        sourceGoal: true,
        targetGoal: true,
      },
    });
  }

  async getHistory(userId: number, limit = 50) {
    return this.prisma.allocationEvent.findMany({
      where: { userId },
      include: {
        sourceGoal: true,
        targetGoal: true,
      },
      orderBy: [{ date: 'desc' }, { id: 'desc' }],
      take: limit,
    });
  }
}
