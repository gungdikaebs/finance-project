import { Test, TestingModule } from '@nestjs/testing';
import {
  RecurringTransactionsService,
  calculateNextRunDate,
  determineInitialRunDate,
} from './recurring-transactions.service';
import { PrismaService } from '../prisma/prisma.service';
import { TransactionsService } from '../transactions/transactions.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('RecurringTransactionsService', () => {
  let service: RecurringTransactionsService;
  let prisma: any;
  let transactionsService: any;

  beforeEach(async () => {
    prisma = {
      recurringTransaction: {
        create: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      category: {
        findFirst: jest.fn(),
      },
      incomeSource: {
        findFirst: jest.fn(),
      },
    };

    transactionsService = {
      create: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecurringTransactionsService,
        { provide: PrismaService, useValue: prisma },
        { provide: TransactionsService, useValue: transactionsService },
      ],
    }).compile();

    service = module.get<RecurringTransactionsService>(RecurringTransactionsService);
  });

  describe('Date Calculation Helpers', () => {
    it('should correctly calculate next monthly run date preserving day of month', () => {
      const current = new Date('2026-01-31T00:00:00.000Z');
      const nextFeb = calculateNextRunDate(current, 'MONTHLY', 1, 31);
      expect(nextFeb.getUTCFullYear()).toBe(2026);
      expect(nextFeb.getUTCMonth()).toBe(1); // February (0-indexed)
      expect(nextFeb.getUTCDate()).toBe(28); // 2026 is non-leap year

      const nextMar = calculateNextRunDate(nextFeb, 'MONTHLY', 1, 31);
      expect(nextMar.getUTCFullYear()).toBe(2026);
      expect(nextMar.getUTCMonth()).toBe(2); // March
      expect(nextMar.getUTCDate()).toBe(31);
    });

    it('should calculate next weekly run date', () => {
      const current = new Date('2026-09-01T00:00:00.000Z');
      const next = calculateNextRunDate(current, 'WEEKLY', 2, 1);
      // 14 days later
      expect(next.getUTCDate()).toBe(15);
    });

    it('should determine initial run date correctly', () => {
      // Start date 2026-09-10 with dayOfExecution 25
      const init = determineInitialRunDate('2026-09-10', 'MONTHLY', 25);
      expect(init.getUTCDate()).toBe(25);
      expect(init.getUTCMonth()).toBe(8); // Sept

      // Start date 2026-09-26 with dayOfExecution 10 -> moves to Oct 10
      const initNextMonth = determineInitialRunDate('2026-09-26', 'MONTHLY', 10);
      expect(initNextMonth.getUTCDate()).toBe(10);
      expect(initNextMonth.getUTCMonth()).toBe(9); // Oct
    });
  });

  describe('create', () => {
    it('should create recurring transaction successfully', async () => {
      prisma.category.findFirst.mockResolvedValue({ id: 1, name: 'Listrik' });
      prisma.recurringTransaction.create.mockResolvedValue({
        id: 10,
        userId: 1,
        type: 'expense',
        amount: 250000n,
        categoryId: 1,
        frequency: 'MONTHLY',
        nextRunDate: new Date('2026-09-25T00:00:00.000Z'),
        isActive: true,
      });

      const res = await service.create(1, {
        type: 'expense',
        amount: '250000',
        categoryId: 1,
        frequency: 'MONTHLY',
        dayOfExecution: 25,
        startDate: '2026-09-10',
      });

      expect(res.id).toBe(10);
      expect(prisma.recurringTransaction.create).toHaveBeenCalled();
    });

    it('should throw if category not found for expense', async () => {
      prisma.category.findFirst.mockResolvedValue(null);

      await expect(
        service.create(1, {
          type: 'expense',
          amount: '250000',
          categoryId: 999,
          frequency: 'MONTHLY',
          dayOfExecution: 25,
          startDate: '2026-09-10',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('execute', () => {
    it('should create transaction and advance nextRunDate on manual execution', async () => {
      const mockRecurring = {
        id: 1,
        userId: 1,
        type: 'expense',
        amount: 500000n,
        categoryId: 2,
        incomeSourceId: null,
        frequency: 'MONTHLY',
        interval: 1,
        dayOfExecution: 20,
        nextRunDate: new Date('2026-09-20T00:00:00.000Z'),
        isActive: true,
        note: 'Sewa Kost',
      };

      prisma.recurringTransaction.findFirst.mockResolvedValue(mockRecurring);
      transactionsService.create.mockResolvedValue({ id: 101, amount: 500000n });
      prisma.recurringTransaction.update.mockResolvedValue({
        ...mockRecurring,
        nextRunDate: new Date('2026-10-20T00:00:00.000Z'),
        lastExecutedAt: new Date(),
      });

      const result = await service.execute(1, 1);

      expect(transactionsService.create).toHaveBeenCalledWith(1, expect.objectContaining({
        amount: '500000',
        categoryId: 2,
        note: 'Sewa Kost',
      }));
      expect(prisma.recurringTransaction.update).toHaveBeenCalled();
      expect(result.transaction.id).toBe(101);
    });

    it('should throw if recurring transaction is paused (isActive = false)', async () => {
      prisma.recurringTransaction.findFirst.mockResolvedValue({
        id: 1,
        userId: 1,
        isActive: false,
      });

      await expect(service.execute(1, 1)).rejects.toThrow(BadRequestException);
    });
  });
});
