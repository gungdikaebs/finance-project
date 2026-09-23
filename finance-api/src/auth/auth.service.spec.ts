import { UnauthorizedException } from '@nestjs/common';
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
      walletAccount: {
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
      password: 'Password123!',
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
    expect(mockTx.walletAccount.create).toHaveBeenCalled();

    expect(result).toEqual({
      id: 1,
      name: 'Dika',
      email: 'dika@example.com',
      createdAt: new Date('2026-09-17T00:00:00.000Z'),
      updatedAt: new Date('2026-09-17T00:00:00.000Z'),
    });
  });

  describe('verifyPassword', () => {
    it('mengembalikan { valid: true } saat kata sandi cocok', async () => {
      const bcrypt = require('bcrypt');
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(true));

      const prisma = {
        user: {
          findUnique: jest.fn().mockResolvedValue({ id: 1, password: '$2b$10$hashed' }),
        },
      } as any;

      const service = new AuthService(prisma, {} as any);
      const res = await service.verifyPassword(1, 'Password123!');
      expect(res).toEqual({ valid: true });
    });

    it('melempar UnauthorizedException saat kata sandi salah', async () => {
      const bcrypt = require('bcrypt');
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(false));

      const prisma = {
        user: {
          findUnique: jest.fn().mockResolvedValue({ id: 1, password: '$2b$10$hashed' }),
        },
      } as any;

      const service = new AuthService(prisma, {} as any);
      await expect(service.verifyPassword(1, 'SalahPassword')).rejects.toThrow('Kata sandi yang dimasukkan tidak sesuai');
    });
  });

  describe('getCurrentUser', () => {
    it('mengembalikan hanya identitas akun yang sedang masuk', async () => {
      const currentUser = { id: 1, name: 'Dika', email: 'dika@example.com' };
      const prisma = {
        user: { findUnique: jest.fn().mockResolvedValue(currentUser) },
      } as any;
      const service = new AuthService(prisma, {} as any);

      await expect(service.getCurrentUser(1)).resolves.toEqual(currentUser);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        select: { id: true, name: true, email: true },
      });
    });

    it('menolak token ketika akun tidak lagi ditemukan', async () => {
      const prisma = {
        user: { findUnique: jest.fn().mockResolvedValue(null) },
      } as any;
      const service = new AuthService(prisma, {} as any);

      await expect(service.getCurrentUser(1)).rejects.toThrow(UnauthorizedException);
    });
  });
});
