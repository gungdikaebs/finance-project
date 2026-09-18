import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { FilterTransactionDto } from './dto/filter-transaction.dto';

import { BudgetPoliciesService } from '../budget-policies/budget-policies.service';

@Injectable()
export class TransactionsService {
  constructor(
    private prisma: PrismaService,
    private budgetService: BudgetPoliciesService,
  ) {}

  private validateDateNotFuture(dateStr: string) {
    const txDate = new Date(dateStr);
    if (isNaN(txDate.getTime())) {
      throw new BadRequestException('Format tanggal tidak valid');
    }

    const now = new Date();
    // Allow up to end of today
    const endOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      23,
      59,
      59,
      999,
    );
    if (txDate > endOfToday) {
      throw new BadRequestException(
        'Transaksi aktual bertanggal masa depan ditolak',
      );
    }
    return txDate;
  }

  async create(userId: number, dto: CreateTransactionDto) {
    const txDate = this.validateDateNotFuture(dto.date);

    // VALIDASI CATEGORY MILIK USER
    let category: any = null;
    if (dto.categoryId) {
      category = await this.prisma.category.findFirst({
        where: {
          id: dto.categoryId,
          userId,
        },
      });
      if (!category) {
        throw new NotFoundException('Kategori tidak ditemukan');
      }
    } else if (dto.incomeSourceId) {
      // Auto-resolve atau buat kategori income default jika tidak disertakan
      category = await this.prisma.category.findFirst({
        where: { userId, type: 'income', isArchived: false },
      });
      if (!category) {
        category = await this.prisma.category.create({
          data: {
            name: 'Pemasukan',
            type: 'income',
            group: 'UNASSIGNED',
            userId,
          },
        });
      }
    } else {
      throw new BadRequestException('Kategori transaksi atau Sumber Pemasukan harus ditentukan');
    }

    // VALIDASI INCOME SOURCE (JIKA ADA)
    if (dto.incomeSourceId) {
      const source = await this.prisma.incomeSource.findFirst({
        where: { id: dto.incomeSourceId, userId },
      });
      if (!source) {
        throw new NotFoundException('Sumber pemasukan tidak ditemukan');
      }
    }

    // VALIDASI PAYMENT METHOD (LEGACY COMPATIBILITY)
    if (dto.paymentMethodId) {
      const pm = await this.prisma.paymentMethod.findFirst({
        where: { id: dto.paymentMethodId, userId },
      });
      if (!pm) {
        throw new NotFoundException('Metode pembayaran tidak ditemukan');
      }
    }

    const amount = BigInt(dto.amount);
    if (amount <= BigInt(0)) {
      throw new BadRequestException('Nominal harus lebih besar dari 0');
    }

    // VALIDASI SUMBER DANA TABUNGAN (D-005)
    let sourceGoal: any = null;
    if (dto.sourceGoalId) {
      if (category.type !== 'expense') {
        throw new BadRequestException(
          'Target tabungan hanya dapat digunakan sebagai sumber dana untuk transaksi pengeluaran',
        );
      }
      sourceGoal = await this.prisma.savingsGoal.findFirst({
        where: { id: dto.sourceGoalId, userId },
      });
      if (!sourceGoal) {
        throw new NotFoundException(
          'Target tabungan sumber dana tidak ditemukan',
        );
      }

      const [inflow, outflow] = await Promise.all([
        this.prisma.allocationEvent.aggregate({
          where: { targetGoalId: dto.sourceGoalId },
          _sum: { amount: true },
        }),
        this.prisma.allocationEvent.aggregate({
          where: { sourceGoalId: dto.sourceGoalId },
          _sum: { amount: true },
        }),
      ]);
      const currentGoalBalance =
        (inflow._sum.amount || BigInt(0)) - (outflow._sum.amount || BigInt(0));

      if (amount > currentGoalBalance) {
        throw new BadRequestException(
          `Saldo target '${sourceGoal.name}' (${currentGoalBalance}) tidak mencukupi untuk transaksi ${amount}`,
        );
      }
    }

    const typeSnapshot = category.type.toUpperCase();
    const groupSnapshot = category.type === 'expense' ? category.group : null;

    let allocatedNeeds: bigint | null = null;
    let allocatedSavings: bigint | null = null;
    let allocatedWants: bigint | null = null;

    if (typeSnapshot === 'INCOME') {
      const year = txDate.getFullYear();
      const month = txDate.getMonth() + 1;
      const policy = await this.budgetService.getActivePolicy(
        userId,
        year,
        month,
      );
      const ratios = this.budgetService.getRatiosForSource(
        policy,
        dto.incomeSourceId,
      );
      const alloc = this.budgetService.calculateAllocations(
        amount,
        ratios.needsRatio,
        ratios.savingsRatio,
        ratios.wantsRatio,
      );
      allocatedNeeds = alloc.allocatedNeeds;
      allocatedSavings = alloc.allocatedSavings;
      allocatedWants = alloc.allocatedWants;
    }

    return this.prisma.$transaction(async (prisma) => {
      const trx = await prisma.transaction.create({
        data: {
          amount,
          date: txDate,
          note: dto.note,
          typeSnapshot,
          groupSnapshot,
          status: 'ACTIVE',
          allocatedNeeds,
          allocatedSavings,
          allocatedWants,
          userId,
          categoryId: category.id,
          incomeSourceId: dto.incomeSourceId,
          paymentMethodId: dto.paymentMethodId,
          sourceGoalId: dto.sourceGoalId,
        },
        include: {
          category: true,
          incomeSource: true,
          paymentMethod: true,
          sourceGoal: true,
        },
      });

      if (dto.sourceGoalId) {
        await prisma.allocationEvent.create({
          data: {
            userId,
            transactionId: trx.id,
            sourceGoalId: dto.sourceGoalId,
            targetGoalId: null,
            amount,
            date: txDate,
            type: 'SPEND',
            note: `Belanja dari target: ${dto.note || category.name}`,
          },
        });
      }

      return trx;
    });
  }

  async findAll(userId: number, filter?: FilterTransactionDto) {
    const where: any = { userId };

    if (filter?.status && filter.status !== 'ALL') {
      where.status = filter.status;
    } else if (!filter?.status) {
      where.status = 'ACTIVE';
    }

    if (filter?.type) {
      where.typeSnapshot = filter.type.toUpperCase();
    }

    if (filter?.year && filter?.month) {
      const startDate = new Date(filter.year, filter.month - 1, 1);
      const endDate = new Date(filter.year, filter.month, 0, 23, 59, 59, 999);
      where.date = {
        gte: startDate,
        lte: endDate,
      };
    } else if (filter?.year) {
      const startDate = new Date(filter.year, 0, 1);
      const endDate = new Date(filter.year, 11, 31, 23, 59, 59, 999);
      where.date = {
        gte: startDate,
        lte: endDate,
      };
    }

    const page = filter?.page || 1;
    const limit = filter?.limit || 20;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where,
        include: {
          category: true,
          incomeSource: true,
          paymentMethod: true,
          sourceGoal: true,
          revisions: {
            orderBy: { createdAt: 'desc' },
          },
        },
        orderBy: [{ date: 'desc' }, { id: 'desc' }],
        skip,
        take: limit,
      }),
      this.prisma.transaction.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(userId: number, id: number) {
    const trx = await this.prisma.transaction.findFirst({
      where: { id, userId },
      include: {
        category: true,
        incomeSource: true,
        paymentMethod: true,
        sourceGoal: true,
        revisions: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!trx) {
      throw new NotFoundException('Transaksi tidak ditemukan');
    }

    return trx;
  }

  async update(userId: number, id: number, dto: UpdateTransactionDto) {
    const existing = await this.prisma.transaction.findFirst({
      where: { id, userId },
      include: { category: true },
    });

    if (!existing) {
      throw new NotFoundException('Transaksi tidak ditemukan');
    }

    let nextDate = existing.date;
    if (dto.date) {
      nextDate = this.validateDateNotFuture(dto.date);
    }

    let nextAmount = existing.amount;
    if (dto.amount) {
      nextAmount = BigInt(dto.amount);
      if (nextAmount <= BigInt(0)) {
        throw new BadRequestException('Nominal harus lebih besar dari 0');
      }
    }

    let categoryId = existing.categoryId;
    let typeSnapshot = existing.typeSnapshot;
    let groupSnapshot = existing.groupSnapshot;

    if (dto.categoryId && dto.categoryId !== existing.categoryId) {
      const cat = await this.prisma.category.findFirst({
        where: { id: dto.categoryId, userId },
      });
      if (!cat) {
        throw new NotFoundException('Kategori tidak ditemukan');
      }
      categoryId = cat.id;
      typeSnapshot = cat.type.toUpperCase();
      groupSnapshot = cat.type === 'expense' ? cat.group : null;
    }

    if (existing.sourceGoalId && typeSnapshot !== 'EXPENSE') {
      throw new BadRequestException(
        'Transaksi dari Dana tujuan harus tetap berupa pengeluaran',
      );
    }

    if (dto.incomeSourceId) {
      const source = await this.prisma.incomeSource.findFirst({
        where: { id: dto.incomeSourceId, userId },
      });
      if (!source) {
        throw new NotFoundException('Sumber pemasukan tidak ditemukan');
      }
    }

    let allocatedNeeds = existing.allocatedNeeds;
    let allocatedSavings = existing.allocatedSavings;
    let allocatedWants = existing.allocatedWants;

    if (typeSnapshot === 'INCOME') {
      const year = nextDate.getFullYear();
      const month = nextDate.getMonth() + 1;
      const policy = await this.budgetService.getActivePolicy(
        userId,
        year,
        month,
      );
      const incSrcId =
        dto.incomeSourceId !== undefined
          ? dto.incomeSourceId
          : existing.incomeSourceId;
      const ratios = this.budgetService.getRatiosForSource(policy, incSrcId);
      const alloc = this.budgetService.calculateAllocations(
        nextAmount,
        ratios.needsRatio,
        ratios.savingsRatio,
        ratios.wantsRatio,
      );
      allocatedNeeds = alloc.allocatedNeeds;
      allocatedSavings = alloc.allocatedSavings;
      allocatedWants = alloc.allocatedWants;
    }

    return this.prisma.$transaction(async (prisma) => {
      const goalTransactionChanged =
        existing.sourceGoalId &&
        (existing.amount !== nextAmount ||
          existing.date.getTime() !== nextDate.getTime());

      if (goalTransactionChanged && existing.sourceGoalId) {
        const [inflow, outflow] = await Promise.all([
          prisma.allocationEvent.aggregate({
            where: { userId, targetGoalId: existing.sourceGoalId },
            _sum: { amount: true },
          }),
          prisma.allocationEvent.aggregate({
            where: { userId, sourceGoalId: existing.sourceGoalId },
            _sum: { amount: true },
          }),
        ]);
        const currentGoalBalance =
          (inflow._sum.amount || BigInt(0)) -
          (outflow._sum.amount || BigInt(0));
        const availableAfterReversal = currentGoalBalance + existing.amount;
        if (nextAmount > availableAfterReversal) {
          throw new BadRequestException(
            `Saldo Dana tujuan tidak mencukupi untuk koreksi transaksi ${nextAmount}`,
          );
        }

        await prisma.allocationEvent.create({
          data: {
            userId,
            transactionId: id,
            sourceGoalId: null,
            targetGoalId: existing.sourceGoalId,
            amount: existing.amount,
            date: existing.date,
            type: 'REVERSAL',
            note: `Pengembalian koreksi transaksi #${id}: ${dto.reason || 'Koreksi transaksi'}`,
          },
        });
        await prisma.allocationEvent.create({
          data: {
            userId,
            transactionId: id,
            sourceGoalId: existing.sourceGoalId,
            targetGoalId: null,
            amount: nextAmount,
            date: nextDate,
            type: 'SPEND',
            note: `Belanja hasil koreksi transaksi #${id}: ${dto.reason || 'Koreksi transaksi'}`,
          },
        });
      }

      // Record revision if amount or date changes
      if (
        existing.amount !== nextAmount ||
        existing.date.getTime() !== nextDate.getTime()
      ) {
        await prisma.transactionRevision.create({
          data: {
            transactionId: id,
            previousAmount: existing.amount,
            newAmount: nextAmount,
            previousDate: existing.date,
            newDate: nextDate,
            reason: dto.reason || 'Koreksi transaksi',
          },
        });
      }

      return prisma.transaction.update({
        where: { id },
        data: {
          amount: nextAmount,
          date: nextDate,
          categoryId,
          typeSnapshot,
          groupSnapshot,
          allocatedNeeds,
          allocatedSavings,
          allocatedWants,
          ...(dto.note !== undefined ? { note: dto.note } : {}),
          ...(dto.incomeSourceId !== undefined
            ? { incomeSourceId: dto.incomeSourceId }
            : {}),
        },
        include: {
          category: true,
          incomeSource: true,
          paymentMethod: true,
          sourceGoal: true,
          revisions: {
            orderBy: { createdAt: 'desc' },
          },
        },
      });
    });
  }

  async cancel(userId: number, id: number, reason?: string) {
    const existing = await this.prisma.transaction.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      throw new NotFoundException('Transaksi tidak ditemukan');
    }

    if (existing.status === 'CANCELLED') {
      throw new BadRequestException('Transaksi sudah dibatalkan sebelumnya');
    }

    return this.prisma.$transaction(async (prisma) => {
      await prisma.transactionRevision.create({
        data: {
          transactionId: id,
          previousAmount: existing.amount,
          newAmount: BigInt(0),
          previousDate: existing.date,
          newDate: existing.date,
          reason: `Dibatalkan: ${reason || 'Dibatalkan oleh pengguna'}`,
        },
      });

      if (existing.sourceGoalId && existing.typeSnapshot === 'EXPENSE') {
        await prisma.allocationEvent.create({
          data: {
            userId,
            transactionId: id,
            sourceGoalId: null,
            targetGoalId: existing.sourceGoalId,
            amount: existing.amount,
            date: new Date(),
            type: 'REVERSAL',
            note: `Pengembalian dana pembatalan transaksi #${existing.id}`,
          },
        });
      }

      return prisma.transaction.update({
        where: { id },
        data: {
          status: 'CANCELLED',
        },
        include: {
          category: true,
          incomeSource: true,
          paymentMethod: true,
          sourceGoal: true,
          revisions: {
            orderBy: { createdAt: 'desc' },
          },
        },
      });
    });
  }
}
