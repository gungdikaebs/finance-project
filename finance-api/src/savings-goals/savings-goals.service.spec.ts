import { BadRequestException } from '@nestjs/common';
import { SavingsGoalsService } from './savings-goals.service';

describe('SavingsGoalsService', () => {
  it('menolak pembagian yang tidak mencakup seluruh Target impian aktif', async () => {
    const prisma = {
      savingsGoal: {
        findMany: jest.fn().mockResolvedValue([
          { id: 10, userId: 1, type: 'PURCHASE', isArchived: false },
          { id: 11, userId: 1, type: 'PURCHASE', isArchived: false },
        ]),
      },
      $transaction: jest.fn(),
    } as any;
    const service = new SavingsGoalsService(prisma);

    await expect(
      service.updateShares(1, { shares: [{ goalId: 10, shareRatio: 10000 }] }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('menolak target yang muncul dua kali dalam pembagian', async () => {
    const prisma = {
      savingsGoal: {
        findMany: jest
          .fn()
          .mockResolvedValue([
            { id: 10, userId: 1, type: 'PURCHASE', isArchived: false },
          ]),
      },
      $transaction: jest.fn(),
    } as any;
    const service = new SavingsGoalsService(prisma);

    await expect(
      service.updateShares(1, {
        shares: [
          { goalId: 10, shareRatio: 5000 },
          { goalId: 10, shareRatio: 5000 },
        ],
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  describe('getForecasts', () => {
    it('menghitung estimasi waktu tercapai, inflasi majemuk, milestone, dan top-up dengan benar', async () => {
      const prisma = {
        transaction: {
          findMany: jest.fn().mockResolvedValue([
            {
              amount: BigInt('10000000'), // Pemasukan Rp 10.000.000
              typeSnapshot: 'INCOME',
              date: new Date(),
              category: { type: 'income' },
            },
          ]),
        },
        budgetPolicy: {
          findFirst: jest.fn().mockResolvedValue({
            savingsRatio: 3000, // 30% dari Rp 10M = Rp 3M; Porsi impian 40% = Rp 1.2M
          }),
        },
        savingsGoal: {
          findMany: jest.fn().mockResolvedValue([
            {
              id: 101,
              userId: 1,
              name: 'Laptop Developer',
              type: 'PURCHASE',
              mode: 'FULL',
              targetAmount: BigInt('15000000'),
              priceReference: BigInt('15000000'),
              annualPriceIncreaseRatio: 500, // 5% inflasi tahunan
              shares: [{ shareRatio: 10000 }], // 100% dari Rp 1.2M = Rp 1.2M/bln
            },
          ]),
        },
        allocationEvent: {
          aggregate: jest
            .fn()
            .mockResolvedValueOnce({ _sum: { amount: BigInt('3000000') } }) // Saldo awal Rp 3M (20%)
            .mockResolvedValueOnce({ _sum: { amount: BigInt('0') } }),
        },
      } as any;

      const service = new SavingsGoalsService(prisma);
      const forecasts = (await service.getForecasts(1)) as any[];

      expect(forecasts).toHaveLength(1);
      const f = forecasts[0];
      expect(f.goalName).toBe('Laptop Developer');
      expect(f.currentBalance).toBe('3000000');
      expect(f.targetPrice).toBe('15000000');
      expect(f.estimatedMonthlySavings).toBe('1200000');
      expect(f.isAchieved).toBe(false);
      expect(f.isUnachievable).toBe(false);
      // Saldo awal 3M, target 15M berinflasi 5%. Tabungan 1.2M/bln.
      // Sisa ~12M / 1.2M = ~11-12 bulan
      expect(f.targetMonths).toBeGreaterThanOrEqual(10);
      expect(f.targetMonths).toBeLessThanOrEqual(13);
      expect(f.targetDateFormatted).toBeDefined();
      expect(f.milestone.currentPercent).toBe(20);
      expect(f.milestone.label).toBe('Awal Perjalanan');
      expect(f.topUpSuggestion).not.toBeNull();
      expect(Number(f.topUpSuggestion.extraMonthlySavings)).toBeGreaterThan(0);
    });

    it('menandai INFLATION_OUTPACING jika setoran bulanan kalah cepat dari kenaikan harga inflasi', async () => {
      const prisma = {
        transaction: {
          findMany: jest.fn().mockResolvedValue([
            {
              amount: BigInt('2000000'), // Pemasukan Rp 2.000.000
              typeSnapshot: 'INCOME',
              date: new Date(),
              category: { type: 'income' },
            },
          ]),
        },
        budgetPolicy: {
          findFirst: jest.fn().mockResolvedValue({
            savingsRatio: 1000, // 10% dari 2M = 200rb. Impian 40% = 80rb/bln
          }),
        },
        savingsGoal: {
          findMany: jest.fn().mockResolvedValue([
            {
              id: 102,
              userId: 1,
              name: 'Rumah Impian',
              type: 'PURCHASE',
              targetAmount: BigInt('1000000000'), // 1 Milyar
              priceReference: BigInt('1000000000'),
              annualPriceIncreaseRatio: 1000, // 10% inflasi tahunan -> kenaikan ~8.33 jt/bln!
              shares: [{ shareRatio: 10000 }],
            },
          ]),
        },
        allocationEvent: {
          aggregate: jest
            .fn()
            .mockResolvedValueOnce({ _sum: { amount: BigInt('0') } })
            .mockResolvedValueOnce({ _sum: { amount: BigInt('0') } }),
        },
      } as any;

      const service = new SavingsGoalsService(prisma);
      const forecasts = (await service.getForecasts(1)) as any[];

      expect(forecasts[0].isUnachievable).toBe(true);
      expect(forecasts[0].unachievableReason).toBe('INFLATION_OUTPACING');
      expect(forecasts[0].targetMonths).toBeNull();
    });

    it('menandai isAchieved: true dan targetMonths: 0 jika saldo target telah terpenuhi', async () => {
      const prisma = {
        transaction: {
          findMany: jest.fn().mockResolvedValue([]),
        },
        budgetPolicy: {
          findFirst: jest.fn().mockResolvedValue(null),
        },
        financeProfile: {
          findUnique: jest.fn().mockResolvedValue({ monthlyNeeds: BigInt('3000000') }),
        },
        savingsGoal: {
          findMany: jest.fn().mockResolvedValue([
            {
              id: 103,
              userId: 1,
              name: 'Sepeda Lipat',
              type: 'PURCHASE',
              targetAmount: BigInt('5000000'),
              priceReference: BigInt('5000000'),
              shares: [{ shareRatio: 10000 }],
            },
          ]),
        },
        allocationEvent: {
          aggregate: jest
            .fn()
            .mockResolvedValueOnce({ _sum: { amount: BigInt('5000000') } })
            .mockResolvedValueOnce({ _sum: { amount: BigInt('0') } }),
        },
      } as any;

      const service = new SavingsGoalsService(prisma);
      const forecasts = (await service.getForecasts(1)) as any[];

      expect(forecasts[0].isAchieved).toBe(true);
      expect(forecasts[0].targetMonths).toBe(0);
      expect(forecasts[0].milestone.currentPercent).toBe(100);
      expect(forecasts[0].milestone.label).toBe('Tercapai Penuh (100%)');
    });

    it('menggunakan targetMonths jika diisi pengguna dan menghitung requiredMonthlySavings & shortfall', async () => {
      const prisma = {
        transaction: {
          findMany: jest.fn().mockResolvedValue([
            {
              amount: BigInt('10000000'), // Pemasukan Rp 10.000.000
              typeSnapshot: 'INCOME',
              date: new Date(),
              category: { type: 'income' },
            },
          ]),
        },
        budgetPolicy: {
          findFirst: jest.fn().mockResolvedValue({
            savingsRatio: 4000, // 40% = 4.000.000. Impian 40% = 1.600.000/bln
          }),
        },
        savingsGoal: {
          findMany: jest.fn().mockResolvedValue([
            {
              id: 104,
              userId: 1,
              name: 'Motor Keeway Benda',
              type: 'PURCHASE',
              targetAmount: BigInt('80000000'),
              priceReference: BigInt('80000000'),
              targetMonths: 24, // Pengguna menginput 24 bulan
              annualPriceIncreaseRatio: 500, // 5% inflasi tahunan
              shares: [{ shareRatio: 10000 }], // 100% dari 1.6M = 1.6M/bln
            },
          ]),
        },
        allocationEvent: {
          aggregate: jest
            .fn()
            .mockResolvedValueOnce({ _sum: { amount: BigInt('0') } })
            .mockResolvedValueOnce({ _sum: { amount: BigInt('0') } }),
        },
      } as any;

      const service = new SavingsGoalsService(prisma);
      const forecasts = (await service.getForecasts(1)) as any[];

      expect(forecasts).toHaveLength(1);
      const f = forecasts[0];
      expect(f.targetMonths).toBe(24);
      expect(f.hasUserTargetMonths).toBe(true);
      expect(f.userTargetMonths).toBe(24);
      // Harga berinflasi 24 bulan ~88.384.884, dibagi 24 ~3.682.704
      expect(Number(f.requiredMonthlySavings)).toBeGreaterThan(3600000);
      expect(Number(f.requiredMonthlySavings)).toBeLessThan(3700000);
      // Alokasi saat ini adalah 1.600.000
      expect(f.estimatedMonthlySavings).toBe('1600000');
      // Shortfall ~2.082.704
      expect(Number(f.monthlyShortfall)).toBeGreaterThan(2000000);
      // Kecepatan tabungan berjalan (jika hanya 1.6M/bln) adalah ~66 bulan
      expect(f.estimatedMonthsWithCurrentSavings).toBe(66);
      expect(f.topUpSuggestion).not.toBeNull();
      expect(f.topUpSuggestion.newTargetMonths).toBe(24);
    });
  });
});

