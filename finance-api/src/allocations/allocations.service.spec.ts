import { BadRequestException } from '@nestjs/common';
import { AllocationsService } from './allocations.service';

describe('AllocationsService', () => {
  it('menolak Dana tujuan yang sama dua kali dalam satu penyisihan', async () => {
    const service = new AllocationsService({} as any, {} as any);

    await expect(
      service.allocate(1, {
        allocations: [
          { targetGoalId: 5, amount: '100000' },
          { targetGoalId: 5, amount: '200000' },
        ],
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  describe('getPreviewSave (UX-14)', () => {
    it('menggunakan rasio 60:40 normal saat Dana Pengaman masih butuh banyak dana', async () => {
      const emergencyGoal = { id: 1, name: 'Dana Pengaman', type: 'EMERGENCY', targetMonths: 6 };
      const laptopGoal = { id: 2, name: 'Laptop Kerja', type: 'PURCHASE', shareRatio: 10000, isArchived: false, isCompleted: false };

      const prisma = {
        financeProfile: {
          findUnique: jest.fn().mockResolvedValue({
            monthlyNeeds: BigInt('2000000'), // Target 6 x 2M = 12M
            initialBalance: BigInt('10000000'),
          }),
        },
        transaction: { findMany: jest.fn().mockResolvedValue([]) },
        walletAccount: {
          aggregate: jest.fn().mockResolvedValue({ _sum: { balance: BigInt('10000000') } }),
          count: jest.fn().mockResolvedValue(1),
        },
        allocationEvent: {
          aggregate: jest
            .fn()
            .mockResolvedValueOnce({ _sum: { amount: BigInt('1000000') } })
            .mockResolvedValueOnce({ _sum: { amount: BigInt('0') } }),
        },
      } as any;

      const goalsService = {
        findAll: jest.fn().mockResolvedValue([emergencyGoal, laptopGoal]),
        getGoalBalance: jest.fn().mockResolvedValue(BigInt('1000000')), // Saldo 1M dari 12M
      } as any;

      const service = new AllocationsService(prisma, goalsService);
      const preview = await service.getPreviewSave(1, '500000'); // Setoran 500.000

      // 60% = 300.000, 40% = 200.000
      expect(preview.totalAmount).toBe(BigInt('500000'));
      expect(preview.emergencyDetails.isFull).toBe(false);
      expect(preview.previewItems).toEqual([
        { targetGoalId: 1, name: 'Dana Pengaman', amount: BigInt('300000'), type: 'EMERGENCY' },
        { targetGoalId: 2, name: 'Laptop Kerja', amount: BigInt('200000'), type: 'PURCHASE' },
      ]);
    });

    it('mengisi Dana Pengaman hanya sampai kekurangan target (overflow) dan mengalihkan sisanya ke Impian', async () => {
      const emergencyGoal = { id: 1, name: 'Dana Pengaman', type: 'EMERGENCY', targetMonths: 6 };
      const laptopGoal = { id: 2, name: 'Laptop Kerja', type: 'PURCHASE', shareRatio: 10000, isArchived: false, isCompleted: false };

      const prisma = {
        financeProfile: {
          findUnique: jest.fn().mockResolvedValue({
            monthlyNeeds: BigInt('2000000'), // Target 12M
            initialBalance: BigInt('15000000'),
          }),
        },
        transaction: { findMany: jest.fn().mockResolvedValue([]) },
        walletAccount: {
          aggregate: jest.fn().mockResolvedValue({ _sum: { balance: BigInt('15000000') } }),
          count: jest.fn().mockResolvedValue(1),
        },
        allocationEvent: {
          aggregate: jest
            .fn()
            .mockResolvedValueOnce({ _sum: { amount: BigInt('11900000') } })
            .mockResolvedValueOnce({ _sum: { amount: BigInt('0') } }),
        },
      } as any;

      const goalsService = {
        findAll: jest.fn().mockResolvedValue([emergencyGoal, laptopGoal]),
        getGoalBalance: jest.fn().mockResolvedValue(BigInt('11900000')), // Saldo 11.9M dari 12M (kurang 100.000)
      } as any;

      const service = new AllocationsService(prisma, goalsService);
      const preview = await service.getPreviewSave(1, '500000'); // Setoran 500.000

      // 60% base = 300.000, tapi kebutuhan hanya 100.000
      // Dana Pengaman dapat 100.000, kelebihan 200.000 dialihkan ke Impian (total impian 200k + 200k = 400k)
      expect(preview.totalAmount).toBe(BigInt('500000'));
      expect(preview.emergencyDetails.allocatedAmount).toBe(BigInt('100000'));
      expect(preview.emergencyDetails.overflowAmount).toBe(BigInt('200000'));
      expect(preview.previewItems).toEqual([
        { targetGoalId: 1, name: 'Dana Pengaman', amount: BigInt('100000'), type: 'EMERGENCY' },
        { targetGoalId: 2, name: 'Laptop Kerja', amount: BigInt('400000'), type: 'PURCHASE' },
      ]);
    });

    it('mengalihkan 100% setoran ke Target Impian jika Dana Pengaman sudah 100% penuh', async () => {
      const emergencyGoal = { id: 1, name: 'Dana Pengaman', type: 'EMERGENCY', targetMonths: 6 };
      const laptopGoal = { id: 2, name: 'Laptop Kerja', type: 'PURCHASE', shareRatio: 10000, isArchived: false, isCompleted: false };

      const prisma = {
        financeProfile: {
          findUnique: jest.fn().mockResolvedValue({
            monthlyNeeds: BigInt('2000000'), // Target 12M
            initialBalance: BigInt('20000000'),
          }),
        },
        transaction: { findMany: jest.fn().mockResolvedValue([]) },
        walletAccount: {
          aggregate: jest.fn().mockResolvedValue({ _sum: { balance: BigInt('20000000') } }),
          count: jest.fn().mockResolvedValue(1),
        },
        allocationEvent: {
          aggregate: jest
            .fn()
            .mockResolvedValueOnce({ _sum: { amount: BigInt('12000000') } })
            .mockResolvedValueOnce({ _sum: { amount: BigInt('0') } }),
        },
      } as any;

      const goalsService = {
        findAll: jest.fn().mockResolvedValue([emergencyGoal, laptopGoal]),
        getGoalBalance: jest.fn().mockResolvedValue(BigInt('12000000')), // Saldo tepat 12M (100% penuh)
      } as any;

      const service = new AllocationsService(prisma, goalsService);
      const preview = await service.getPreviewSave(1, '500000'); // Setoran 500.000

      // Dana Pengaman 0, seluruh 500.000 ke Impian
      expect(preview.totalAmount).toBe(BigInt('500000'));
      expect(preview.emergencyDetails.isFull).toBe(true);
      expect(preview.emergencyDetails.allocatedAmount).toBe(BigInt('0'));
      expect(preview.previewItems).toEqual([
        { targetGoalId: 2, name: 'Laptop Kerja', amount: BigInt('500000'), type: 'PURCHASE' },
      ]);
    });
  });
});
