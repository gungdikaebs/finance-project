import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { TransactionsService } from '../transactions/transactions.service';
import { CreateRecurringTransactionDto } from './dto/create-recurring-transaction.dto';
import { UpdateRecurringTransactionDto } from './dto/update-recurring-transaction.dto';

export function calculateNextRunDate(
  currentRunDate: Date,
  frequency: string,
  interval: number = 1,
  dayOfExecution: number = 1,
): Date {
  const next = new Date(currentRunDate);
  if (frequency === 'DAILY') {
    next.setDate(next.getDate() + interval);
  } else if (frequency === 'WEEKLY') {
    next.setDate(next.getDate() + interval * 7);
  } else if (frequency === 'MONTHLY') {
    const nextMonth = next.getMonth() + interval;
    next.setDate(1);
    next.setMonth(nextMonth);
    const maxDays = new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate();
    next.setDate(Math.min(dayOfExecution, maxDays));
  } else if (frequency === 'YEARLY') {
    const nextYear = next.getFullYear() + interval;
    next.setDate(1);
    next.setFullYear(nextYear);
    const maxDays = new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate();
    next.setDate(Math.min(dayOfExecution, maxDays));
  }
  next.setUTCHours(0, 0, 0, 0);
  return next;
}

export function determineInitialRunDate(
  startDateStr: string,
  frequency: string,
  dayOfExecution: number = 1,
): Date {
  const start = new Date(startDateStr);
  start.setUTCHours(0, 0, 0, 0);

  if (frequency === 'MONTHLY') {
    const maxDays = new Date(start.getFullYear(), start.getMonth() + 1, 0).getDate();
    const effectiveDay = Math.min(dayOfExecution, maxDays);
    const candidate = new Date(Date.UTC(start.getFullYear(), start.getMonth(), effectiveDay, 0, 0, 0));
    if (candidate >= start) {
      return candidate;
    } else {
      return calculateNextRunDate(candidate, 'MONTHLY', 1, dayOfExecution);
    }
  }

  return start;
}

@Injectable()
export class RecurringTransactionsService {
  private readonly logger = new Logger(RecurringTransactionsService.name);

  constructor(
    private prisma: PrismaService,
    private transactionsService: TransactionsService,
  ) {}

  async create(userId: number, dto: CreateRecurringTransactionDto) {
    if (dto.type === 'expense' && dto.categoryId) {
      const cat = await this.prisma.category.findFirst({
        where: { id: dto.categoryId, userId },
      });
      if (!cat) throw new NotFoundException('Kategori tidak ditemukan');
    }

    if (dto.type === 'income' && dto.incomeSourceId) {
      const src = await this.prisma.incomeSource.findFirst({
        where: { id: dto.incomeSourceId, userId },
      });
      if (!src) throw new NotFoundException('Sumber pemasukan tidak ditemukan');
    }

    // Hitung tanggal jadwal pertama
    const nextRunDate = determineInitialRunDate(
      dto.startDate,
      dto.frequency,
      dto.dayOfExecution,
    );

    const recurring = await this.prisma.recurringTransaction.create({
      data: {
        userId,
        type: dto.type,
        amount: BigInt(dto.amount),
        categoryId: dto.categoryId || null,
        incomeSourceId: dto.incomeSourceId || null,
        frequency: dto.frequency,
        interval: dto.interval || 1,
        dayOfExecution: dto.dayOfExecution,
        startDate: new Date(dto.startDate),
        endDate: dto.endDate ? new Date(dto.endDate) : null,
        nextRunDate,
        isActive: dto.isActive !== undefined ? dto.isActive : true,
        note: dto.note || null,
      },
      include: {
        category: true,
        incomeSource: true,
      },
    });

    return recurring;
  }

  async findAll(userId: number) {
    return this.prisma.recurringTransaction.findMany({
      where: { userId },
      include: {
        category: true,
        incomeSource: true,
      },
      orderBy: { nextRunDate: 'asc' },
    });
  }

  async findOne(userId: number, id: number) {
    const recurring = await this.prisma.recurringTransaction.findFirst({
      where: { id, userId },
      include: {
        category: true,
        incomeSource: true,
      },
    });
    if (!recurring) {
      throw new NotFoundException('Jadwal transaksi berulang tidak ditemukan');
    }
    return recurring;
  }

  async getUpcoming(userId: number, days: number = 7) {
    const now = new Date();
    now.setUTCHours(0, 0, 0, 0);

    const limitDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    limitDate.setUTCHours(23, 59, 59, 999);

    return this.prisma.recurringTransaction.findMany({
      where: {
        userId,
        isActive: true,
        nextRunDate: {
          lte: limitDate,
        },
      },
      include: {
        category: true,
        incomeSource: true,
      },
      orderBy: { nextRunDate: 'asc' },
    });
  }

  async update(userId: number, id: number, dto: UpdateRecurringTransactionDto) {
    const existing = await this.findOne(userId, id);

    if (dto.categoryId) {
      const cat = await this.prisma.category.findFirst({
        where: { id: dto.categoryId, userId },
      });
      if (!cat) throw new NotFoundException('Kategori tidak ditemukan');
    }

    if (dto.incomeSourceId) {
      const src = await this.prisma.incomeSource.findFirst({
        where: { id: dto.incomeSourceId, userId },
      });
      if (!src) throw new NotFoundException('Sumber pemasukan tidak ditemukan');
    }

    let nextRunDate = existing.nextRunDate;
    if (dto.dayOfExecution || dto.frequency || dto.startDate) {
      const effectiveStart = dto.startDate || existing.startDate.toISOString();
      const effectiveFreq = dto.frequency || existing.frequency;
      const effectiveDay = dto.dayOfExecution || existing.dayOfExecution;
      nextRunDate = determineInitialRunDate(effectiveStart, effectiveFreq, effectiveDay);
    }

    return this.prisma.recurringTransaction.update({
      where: { id },
      data: {
        type: dto.type,
        amount: dto.amount ? BigInt(dto.amount) : undefined,
        categoryId: dto.categoryId !== undefined ? dto.categoryId : undefined,
        incomeSourceId: dto.incomeSourceId !== undefined ? dto.incomeSourceId : undefined,
        frequency: dto.frequency,
        interval: dto.interval,
        dayOfExecution: dto.dayOfExecution,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate !== undefined ? (dto.endDate ? new Date(dto.endDate) : null) : undefined,
        isActive: dto.isActive !== undefined ? dto.isActive : undefined,
        note: dto.note !== undefined ? dto.note : undefined,
        nextRunDate,
      },
      include: {
        category: true,
        incomeSource: true,
      },
    });
  }

  async remove(userId: number, id: number) {
    await this.findOne(userId, id);
    await this.prisma.recurringTransaction.delete({
      where: { id },
    });
    return { success: true, message: 'Jadwal transaksi berulang berhasil dihapus' };
  }

  async execute(userId: number, id: number) {
    const recurring = await this.findOne(userId, id);

    if (!recurring.isActive) {
      throw new BadRequestException('Jadwal transaksi berulang sedang dijeda');
    }

    const todayStr = new Date().toISOString().substring(0, 10);

    // Buat transaksi riil
    const createdTx = await this.transactionsService.create(userId, {
      amount: recurring.amount.toString(),
      date: todayStr,
      categoryId: recurring.categoryId || undefined,
      incomeSourceId: recurring.incomeSourceId || undefined,
      note: recurring.note || (recurring.type === 'expense' ? 'Tagihan Rutin' : 'Pemasukan Rutin'),
    });

    // Majukan tanggal berikutnya
    const newNextRunDate = calculateNextRunDate(
      recurring.nextRunDate,
      recurring.frequency,
      recurring.interval,
      recurring.dayOfExecution,
    );

    // Cek apakah sudah melampaui endDate
    let stillActive = true;
    if (recurring.endDate && newNextRunDate > recurring.endDate) {
      stillActive = false;
    }

    const updatedRecurring = await this.prisma.recurringTransaction.update({
      where: { id },
      data: {
        lastExecutedAt: new Date(),
        nextRunDate: newNextRunDate,
        isActive: stillActive,
      },
      include: {
        category: true,
        incomeSource: true,
      },
    });

    return {
      transaction: createdTx,
      recurringTransaction: updatedRecurring,
    };
  }

  // Cron Task: Dijalankan setiap hari pukul 00:05 UTC
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleDailyRecurringCron() {
    this.logger.log('Menjalankan cron evaluasi transaksi rutin harian...');
    const now = new Date();
    now.setUTCHours(23, 59, 59, 999);

    const dueList = await this.prisma.recurringTransaction.findMany({
      where: {
        isActive: true,
        nextRunDate: {
          lte: now,
        },
      },
    });

    this.logger.log(`Ditemukan ${dueList.length} transaksi rutin yang jatuh tempo.`);

    let successCount = 0;
    for (const item of dueList) {
      try {
        await this.execute(item.userId, item.id);
        successCount++;
      } catch (err: any) {
        this.logger.error(
          `Gagal mengeksekusi recurring ID ${item.id} untuk user ${item.userId}: ${err.message}`,
        );
      }
    }

    this.logger.log(`Selesai memproses ${successCount}/${dueList.length} transaksi rutin.`);
    return { total: dueList.length, success: successCount };
  }
}
