import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateIncomeSourceDto } from './dto/create-income-source.dto';
import { UpdateIncomeSourceDto } from './dto/update-income-source.dto';

@Injectable()
export class IncomeSourcesService {
  constructor(private prisma: PrismaService) {}

  findAll(userId: number, includeArchived = false) {
    return this.prisma.incomeSource.findMany({
      where: {
        userId,
        ...(includeArchived ? {} : { isArchived: false }),
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
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
        select: { id: true },
      });
      const txIds = txs.map((t) => t.id);

      if (txIds.length > 0) {
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
