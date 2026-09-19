import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateIncomeSourceDto } from './dto/create-income-source.dto';
import { UpdateIncomeSourceDto } from './dto/update-income-source.dto';

import { DEFAULT_INCOME_SOURCES } from '../auth/auth.service';

@Injectable()
export class IncomeSourcesService {
  constructor(private prisma: PrismaService) {}

  async seedDefaultSources(userId: number) {
    const existing = await this.prisma.incomeSource.count({ where: { userId } });
    if (existing > 0) return;

    for (const name of DEFAULT_INCOME_SOURCES) {
      await this.prisma.incomeSource.create({
        data: { name, userId },
      });
    }
  }

  async findAll(userId: number, includeArchived = false) {
    let sources = await this.prisma.incomeSource.findMany({
      where: {
        userId,
        ...(includeArchived ? {} : { isArchived: false }),
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    if (sources.length === 0 && !includeArchived) {
      const totalCount = await this.prisma.incomeSource.count({ where: { userId } });
      if (totalCount === 0) {
        await this.seedDefaultSources(userId);
        sources = await this.prisma.incomeSource.findMany({
          where: { userId, isArchived: false },
          orderBy: { createdAt: 'asc' },
        });
      }
    }

    return sources;
  }

  create(userId: number, dto: CreateIncomeSourceDto) {
    return this.prisma.incomeSource.create({
      data: {
        name: dto.name,
        userId,
      },
    });
  }

  async update(userId: number, id: number, dto: UpdateIncomeSourceDto) {
    const source = await this.prisma.incomeSource.findFirst({
      where: { id, userId },
    });
    if (!source) {
      throw new NotFoundException('Income source not found');
    }

    return this.prisma.incomeSource.update({
      where: { id },
      data: {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.isArchived !== undefined ? { isArchived: dto.isArchived } : {}),
      },
    });
  }

  async archive(userId: number, id: number) {
    return this.update(userId, id, { isArchived: true });
  }

  async unarchive(userId: number, id: number) {
    return this.update(userId, id, { isArchived: false });
  }

  async delete(userId: number, id: number) {
    const source = await this.prisma.incomeSource.findFirst({
      where: { id, userId },
    });

    if (!source) {
      throw new NotFoundException('Income source not found');
    }

    return this.prisma.$transaction(async (prisma) => {
      await prisma.budgetSourceOverride.deleteMany({
        where: { incomeSourceId: id },
      });

      const txs = await prisma.transaction.findMany({
        where: { incomeSourceId: id, userId },
      });
      const txIds = txs.map((t) => t.id);

      if (txIds.length > 0) {
        // Balikkan saldo dompet untuk transaksi yang aktif
        for (const t of txs) {
          if (t.walletAccountId && t.status === 'ACTIVE') {
            if (t.typeSnapshot === 'INCOME') {
              await prisma.walletAccount.update({
                where: { id: t.walletAccountId },
                data: { balance: { decrement: t.amount } },
              });
            } else {
              await prisma.walletAccount.update({
                where: { id: t.walletAccountId },
                data: { balance: { increment: t.amount } },
              });
            }
          }
        }
        await prisma.transactionRevision.deleteMany({
          where: { transactionId: { in: txIds } },
        });
        await prisma.allocationEvent.deleteMany({
          where: { transactionId: { in: txIds } },
        });
        await prisma.transaction.deleteMany({
          where: { id: { in: txIds } },
        });
      }

      return prisma.incomeSource.delete({
        where: { id },
      });
    });
  }
}
