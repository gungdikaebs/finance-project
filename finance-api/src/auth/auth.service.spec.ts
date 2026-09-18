import { AuthService } from './auth.service';

describe('AuthService', () => {
  it('tidak mengembalikan password hash setelah registrasi dan men-seed data awal', async () => {
    const mockCreatedUser = {
      id: 1,
      name: 'Dika',
      email: 'dika@example.com',
      password: '$2b$10$hash',
      createdAt: new Date('2026-09-17T00:00:00.000Z'),
      updatedAt: new Date('2026-09-17T00:00:00.000Z'),
    };

    const mockTx = {
      user: {
        create: jest.fn().mockResolvedValue(mockCreatedUser),
      },
      financeProfile: {
        create: jest.fn().mockResolvedValue({}),
      },
      incomeSource: {
        create: jest.fn().mockResolvedValue({}),
      },
      category: {
        create: jest.fn().mockResolvedValue({}),
      },
      savingsGoal: {
        create: jest.fn().mockResolvedValue({}),
      },
      budgetPolicy: {
        create: jest.fn().mockResolvedValue({}),
      },
    };

    const prisma = {
      user: {
        findUnique: jest.fn().mockResolvedValue(null),
      },
      $transaction: jest.fn().mockImplementation(async (callback) => {
        return callback(mockTx);
      }),
    } as any;

    const service = new AuthService(prisma, {} as any);

    const result = await service.register({
      name: 'Dika',
      email: 'dika@example.com',
      password: 'password-ku',
    });

    expect(prisma.$transaction).toHaveBeenCalled();
    expect(mockTx.user.create).toHaveBeenCalled();
    expect(mockTx.financeProfile.create).toHaveBeenCalled();
    expect(mockTx.incomeSource.create).toHaveBeenCalledTimes(3);
    // 5 NEED + 4 WANT + 3 INCOME = 12 categories
    expect(mockTx.category.create).toHaveBeenCalledTimes(12);
    // 2 goals: EMERGENCY (6 months) + UNASSIGNED
    expect(mockTx.savingsGoal.create).toHaveBeenCalledTimes(2);
    expect(mockTx.budgetPolicy.create).toHaveBeenCalled();

    expect(result).toEqual({
      id: 1,
      name: 'Dika',
      email: 'dika@example.com',
      createdAt: new Date('2026-09-17T00:00:00.000Z'),
      updatedAt: new Date('2026-09-17T00:00:00.000Z'),
    });
  });
});
