import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

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

  findAll(userId: number, includeArchived = false, type?: string) {
    return this.prisma.category.findMany({
      where: {
        userId,
        ...(includeArchived ? {} : { isArchived: false }),
        ...(type ? { type } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });
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

      return prisma.category.delete({
        where: {
          id: categoryId,
        },
      });
    });
  }
}
