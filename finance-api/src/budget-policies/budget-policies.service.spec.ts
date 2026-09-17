import { BadRequestException } from '@nestjs/common';
import { BudgetPoliciesService } from './budget-policies.service';

describe('BudgetPoliciesService', () => {
  it('menolak override sumber pemasukan yang bukan milik pengguna aktif', async () => {
    const prisma = {
      incomeSource: { findMany: jest.fn().mockResolvedValue([]) },
      $transaction: jest.fn(),
    } as any;
    const service = new BudgetPoliciesService(prisma);

    await expect(
      service.upsertPolicy(1, {
        effectiveYear: 2026,
        effectiveMonth: 9,
        needsRatio: 5000,
        savingsRatio: 3000,
        wantsRatio: 2000,
        overrides: [
          {
            incomeSourceId: 99,
            needsRatio: 4000,
            savingsRatio: 4000,
            wantsRatio: 2000,
          },
        ],
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('menolak sumber pemasukan yang muncul dua kali dalam override', async () => {
    const prisma = {
      incomeSource: {
        findMany: jest
          .fn()
          .mockResolvedValue([{ id: 2, userId: 1, isArchived: false }]),
      },
      $transaction: jest.fn(),
    } as any;
    const service = new BudgetPoliciesService(prisma);

    await expect(
      service.upsertPolicy(1, {
        effectiveYear: 2026,
        effectiveMonth: 9,
        needsRatio: 5000,
        savingsRatio: 3000,
        wantsRatio: 2000,
        overrides: [
          {
            incomeSourceId: 2,
            needsRatio: 4000,
            savingsRatio: 4000,
            wantsRatio: 2000,
          },
          {
            incomeSourceId: 2,
            needsRatio: 5000,
            savingsRatio: 3000,
            wantsRatio: 2000,
          },
        ],
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
