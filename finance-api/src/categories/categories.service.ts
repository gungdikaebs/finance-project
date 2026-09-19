import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

import {
  DEFAULT_NEED_CATEGORIES,
  DEFAULT_WANT_CATEGORIES,
  DEFAULT_INCOME_CATEGORIES,
} from '../auth/auth.service';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async seedDefaultCategories(userId: number) {
    const existing = await this.prisma.category.count({ where: { userId } });
    if (existing > 0) return;

    for (const name of DEFAULT_NEED_CATEGORIES) {
      await this.prisma.category.create({
        data: { name, type: 'expense', group: 'NEED', userId },
      });
    }
    for (const name of DEFAULT_WANT_CATEGORIES) {
      await this.prisma.category.create({
        data: { name, type: 'expense', group: 'WANT', userId },
      });
    }
    for (const name of DEFAULT_INCOME_CATEGORIES) {
      await this.prisma.category.create({
        data: { name, type: 'income', group: 'UNASSIGNED', userId },
      });
    }
  }

  create(userId: number, dto: CreateCategoryDto) {
    const group = dto.group || (dto.type === 'income' ? 'UNASSIGNED' : 'NEED');
    return this.prisma.category.create({
      data: {
        name: dto.name,
        type: dto.type,
        group,
        userId,
      },
    });
  }

  async findAll(userId: number, includeArchived = false, type?: string) {
    let categories = await this.prisma.category.findMany({
      where: {
        userId,
        ...(includeArchived ? {} : { isArchived: false }),
        ...(type ? { type } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });

    if (categories.length === 0 && !includeArchived && !type) {
      const totalCount = await this.prisma.category.count({ where: { userId } });
      if (totalCount === 0) {
        await this.seedDefaultCategories(userId);
        categories = await this.prisma.category.findMany({
          where: { userId, isArchived: false },
          orderBy: { createdAt: 'desc' },
        });
      }
    }

    return categories;
  }

  async update(userId: number, id: number, dto: UpdateCategoryDto) {
    const category = await this.prisma.category.findFirst({
      where: { id, userId },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return this.prisma.category.update({
      where: { id },
      data: {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.group !== undefined ? { group: dto.group } : {}),
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

  async delete(userId: number, categoryId: number) {
    const category = await this.prisma.category.findFirst({
      where: {
        id: categoryId,
        userId,
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return this.prisma.$transaction(async (prisma) => {
      const txs = await prisma.transaction.findMany({
        where: { categoryId, userId },
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

      return prisma.category.delete({
        where: {
          id: categoryId,
        },
      });
    });
  }
}
