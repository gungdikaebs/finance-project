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
});
