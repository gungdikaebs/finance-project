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
});
