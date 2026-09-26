import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  afterEach(() => jest.restoreAllMocks());

  it('tidak mengembalikan password hash setelah registrasi dan men-seed data awal', async () => {
    const mockCreatedUser = {
      id: 1,
      name: 'rukamaru',
      email: 'ruka@example.com',
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
      $queryRaw: jest.fn().mockResolvedValue([]),
      $transaction: jest.fn().mockImplementation(async (callback) => {
        return callback(mockTx);
      }),
    } as any;

    const service = new AuthService(prisma, {} as any);

    const result = await service.register({
      name: 'rukamaru',
      email: 'ruka@example.com',
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
      name: 'rukamaru',
      email: 'ruka@example.com',
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

    it('menolak akun Google tanpa kata sandi secara jelas', async () => {
      const prisma = { user: { findUnique: jest.fn().mockResolvedValue({ id: 1, password: null }) } } as any;
      const service = new AuthService(prisma, {} as any);
      await expect(service.verifyPassword(1, 'apa-pun')).rejects.toThrow('Akun ini tidak memakai kata sandi');
    });
  });

  describe('Google login', () => {
    const identity = { sub: 'google-123', email: 'ruka@example.com', name: 'Ruka' };

    it('menolak ID token yang tidak valid dan memeriksa client ID', async () => {
      const service = new AuthService({} as any, {} as any, { get: () => 'web-client-id' } as any);
      const verify = jest.spyOn((service as any).googleClient, 'verifyIdToken').mockRejectedValue(new Error('invalid'));

      await expect(service.googleLogin('invalid-token')).rejects.toThrow(UnauthorizedException);
      expect(verify).toHaveBeenCalledWith({ idToken: 'invalid-token', audience: 'web-client-id' });
    });

    it('tidak memproses Google login saat Client ID belum dikonfigurasi', async () => {
      const service = new AuthService({} as any, {} as any, { get: () => undefined } as any);
      const verify = jest.spyOn((service as any).googleClient, 'verifyIdToken');

      await expect(service.googleLogin('token')).rejects.toThrow('Masuk dengan Google belum tersedia');
      expect(verify).not.toHaveBeenCalled();
    });

    it('menolak akun Google dengan email yang belum terverifikasi', async () => {
      const service = new AuthService({} as any, {} as any, { get: () => 'web-client-id' } as any);
      jest.spyOn((service as any).googleClient, 'verifyIdToken').mockResolvedValue({
        getPayload: () => ({ sub: identity.sub, email: identity.email, email_verified: false }),
      });
      await expect(service.googleLogin('unverified-token')).rejects.toThrow(UnauthorizedException);
    });

    it('memakai sub Google untuk masuk ke akun yang sudah terhubung', async () => {
      const user = { id: 7, email: 'lama@example.com', googleSub: identity.sub, password: null };
      const prisma = { user: { findUnique: jest.fn().mockResolvedValue(user) } } as any;
      const jwt = { sign: jest.fn().mockReturnValue('app-jwt') } as any;
      const service = new AuthService(prisma, jwt);
      jest.spyOn(service as any, 'verifyGoogleIdentity').mockResolvedValue(identity);

      await expect(service.googleLogin('valid-token')).resolves.toEqual({ token: 'app-jwt' });
      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { googleSub: identity.sub } });
      expect(jwt.sign).toHaveBeenCalledWith({ sub: 7, email: 'lama@example.com' });
    });

    it('membuat pengguna Google baru beserta semua data awal', async () => {
      const createdUser = { id: 8, email: identity.email, name: identity.name, password: null, googleSub: identity.sub };
      const tx = {
        user: { create: jest.fn().mockResolvedValue(createdUser) },
        financeProfile: { create: jest.fn() },
        incomeSource: { create: jest.fn() },
        category: { create: jest.fn() },
        savingsGoal: { create: jest.fn() },
        budgetPolicy: { create: jest.fn() },
        walletAccount: { create: jest.fn() },
      };
      const prisma = {
        user: { findUnique: jest.fn().mockResolvedValue(null) },
        $queryRaw: jest.fn().mockResolvedValue([]),
        $transaction: jest.fn().mockImplementation((callback) => callback(tx)),
      } as any;
      const service = new AuthService(prisma, { sign: () => 'new-jwt' } as any);
      jest.spyOn(service as any, 'verifyGoogleIdentity').mockResolvedValue(identity);

      await expect(service.googleLogin('valid-token')).resolves.toEqual({ token: 'new-jwt' });
      expect(tx.user.create).toHaveBeenCalledWith({ data: { name: identity.name, email: identity.email, password: null, googleSub: identity.sub } });
      expect(tx.financeProfile.create).toHaveBeenCalledTimes(1);
      expect(tx.category.create).toHaveBeenCalledTimes(12);
      expect(tx.savingsGoal.create).toHaveBeenCalledTimes(2);
      expect(tx.budgetPolicy.create).toHaveBeenCalledTimes(1);
      expect(tx.walletAccount.create).toHaveBeenCalledTimes(1);
    });

    it('meminta kata sandi jika email Google sama dengan akun lama', async () => {
      const prisma = { user: { findUnique: jest.fn().mockResolvedValueOnce(null).mockResolvedValueOnce({ id: 5, email: identity.email, password: 'hash', googleSub: null }) } } as any;
      const service = new AuthService(prisma, {} as any);
      jest.spyOn(service as any, 'verifyGoogleIdentity').mockResolvedValue(identity);

      await expect(service.googleLogin('valid-token')).rejects.toMatchObject({
        response: { code: 'ACCOUNT_LINK_REQUIRED' },
      });
    });

    it('mengenali akun email lama meski kapitalisasinya berbeda', async () => {
      const prisma = { user: {
        findUnique: jest.fn().mockResolvedValue(null),
      }, $queryRaw: jest.fn().mockResolvedValue([{ id: 5, email: 'Ruka@Example.com', password: 'hash', googleSub: null }]) } as any;
      const service = new AuthService(prisma, {} as any);
      jest.spyOn(service as any, 'verifyGoogleIdentity').mockResolvedValue(identity);

      await expect(service.googleLogin('valid-token')).rejects.toMatchObject({
        response: { code: 'ACCOUNT_LINK_REQUIRED' },
      });
      expect(prisma.$queryRaw).toHaveBeenCalledTimes(1);
    });

    it('menghubungkan akun lama hanya setelah kata sandi benar', async () => {
      const user = { id: 5, email: identity.email, password: 'hashed', googleSub: null };
      const prisma = { user: {
        findUnique: jest.fn().mockResolvedValueOnce(null).mockResolvedValueOnce(user),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      } } as any;
      const jwt = { sign: jest.fn().mockReturnValue('linked-jwt') } as any;
      const service = new AuthService(prisma, jwt);
      jest.spyOn(service as any, 'verifyGoogleIdentity').mockResolvedValue(identity);
      const bcrypt = require('bcrypt');
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);

      await expect(service.linkGoogleAccount('valid-token', 'Password123!')).resolves.toEqual({ token: 'linked-jwt' });
      expect(prisma.user.updateMany).toHaveBeenCalledWith({ where: { id: 5, googleSub: null }, data: { googleSub: identity.sub } });
    });

    it('tidak menautkan akun jika kata sandi salah', async () => {
      const prisma = { user: {
        findUnique: jest.fn().mockResolvedValueOnce(null).mockResolvedValueOnce({ id: 5, email: identity.email, password: 'hashed', googleSub: null }),
        updateMany: jest.fn(),
      } } as any;
      const service = new AuthService(prisma, {} as any);
      jest.spyOn(service as any, 'verifyGoogleIdentity').mockResolvedValue(identity);
      const bcrypt = require('bcrypt');
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);

      await expect(service.linkGoogleAccount('valid-token', 'wrong')).rejects.toThrow(UnauthorizedException);
      expect(prisma.user.updateMany).not.toHaveBeenCalled();
    });

    it('menolak percobaan menghubungkan akun Google yang sudah terhubung', async () => {
      const prisma = { user: {
        findUnique: jest.fn().mockResolvedValue({ id: 5, googleSub: identity.sub }),
        updateMany: jest.fn(),
      } } as any;
      const service = new AuthService(prisma, {} as any);
      jest.spyOn(service as any, 'verifyGoogleIdentity').mockResolvedValue(identity);

      await expect(service.linkGoogleAccount('valid-token', 'Password123!')).rejects.toThrow(ConflictException);
      expect(prisma.user.updateMany).not.toHaveBeenCalled();
    });

    it('menolak penghubungan ketika akun lebih dulu ditautkan oleh permintaan lain', async () => {
      const user = { id: 5, email: identity.email, password: 'hashed', googleSub: null };
      const prisma = { user: {
        findUnique: jest.fn().mockResolvedValueOnce(null).mockResolvedValueOnce(user),
        updateMany: jest.fn().mockResolvedValue({ count: 0 }),
      } } as any;
      const service = new AuthService(prisma, {} as any);
      jest.spyOn(service as any, 'verifyGoogleIdentity').mockResolvedValue(identity);
      const bcrypt = require('bcrypt');
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);

      await expect(service.linkGoogleAccount('valid-token', 'Password123!')).rejects.toThrow(ConflictException);
      expect(prisma.user.updateMany).toHaveBeenCalledTimes(1);
    });

    it('tidak menghubungkan email yang sudah terkait ke Google lain', async () => {
      const prisma = { user: { findUnique: jest.fn().mockResolvedValueOnce(null).mockResolvedValueOnce({ id: 5, email: identity.email, googleSub: 'another-google' }) } } as any;
      const service = new AuthService(prisma, {} as any);
      jest.spyOn(service as any, 'verifyGoogleIdentity').mockResolvedValue(identity);
      await expect(service.googleLogin('valid-token')).rejects.toThrow(ConflictException);
    });

    it('menolak login kata sandi pada akun yang hanya memakai Google', async () => {
      const prisma = { user: { findUnique: jest.fn().mockResolvedValue({ id: 8, email: identity.email, password: null }) } } as any;
      const service = new AuthService(prisma, {} as any);
      await expect(service.login({ email: identity.email, password: 'apa-pun' })).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('getCurrentUser', () => {
    it('mengembalikan hanya identitas akun yang sedang masuk', async () => {
      const currentUser = { id: 1, name: 'rukamaru', email: 'ruka@example.com' };
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
