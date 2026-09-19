import { Test, TestingModule } from '@nestjs/testing';
import { WalletsService } from './wallets.service';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('WalletsService', () => {
  let service: WalletsService;
  let prisma: any;

  const mockPrismaService = {
    walletAccount: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    walletTransfer: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    financeProfile: {
      findUnique: jest.fn(),
    },
    transaction: {
      findMany: jest.fn(),
      updateMany: jest.fn(),
    },
    $transaction: jest.fn((cb) => cb(mockPrismaService)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WalletsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<WalletsService>(WalletsService);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  describe('ensureDefaultWallet', () => {
    it('mengembalikan dompet yang sudah ada jika ditemukan', async () => {
      const existing = { id: 1, userId: 1, name: 'BCA Utama', balance: BigInt(5000000) };
      mockPrismaService.walletAccount.findFirst.mockResolvedValue(existing);

      const result = await service.ensureDefaultWallet(1);
      expect(result).toEqual(existing);
      expect(mockPrismaService.walletAccount.create).not.toHaveBeenCalled();
    });

    it('membuat dompet default jika belum ada dompet sama sekali', async () => {
      mockPrismaService.walletAccount.findFirst.mockResolvedValue(null);
      mockPrismaService.financeProfile.findUnique.mockResolvedValue({ initialBalance: BigInt(1000000) });
      mockPrismaService.transaction.findMany.mockResolvedValue([]);
      const created = { id: 1, userId: 1, name: 'Rekening Utama / Tunai', balance: BigInt(1000000) };
      mockPrismaService.walletAccount.create.mockResolvedValue(created);

      const result = await service.ensureDefaultWallet(1);
      expect(result).toEqual(created);
      expect(mockPrismaService.walletAccount.create).toHaveBeenCalled();
    });
  });

  describe('transfer', () => {
    it('melempar BadRequestException jika dompet sumber dan tujuan sama', async () => {
      await expect(
        service.transfer(1, {
          sourceWalletId: 1,
          targetWalletId: 1,
          amount: '100000',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('melempar BadRequestException jika saldo sumber tidak mencukupi', async () => {
      mockPrismaService.walletAccount.findFirst
        .mockResolvedValueOnce({ id: 1, userId: 1, name: 'BCA', balance: BigInt(50000), isArchived: false })
        .mockResolvedValueOnce({ id: 2, userId: 1, name: 'GoPay', balance: BigInt(10000), isArchived: false });

      await expect(
        service.transfer(1, {
          sourceWalletId: 1,
          targetWalletId: 2,
          amount: '100000',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('berhasil memproses transfer jika saldo mencukupi', async () => {
      const source = { id: 1, userId: 1, name: 'BCA', balance: BigInt(500000), isArchived: false };
      const target = { id: 2, userId: 1, name: 'GoPay', balance: BigInt(50000), isArchived: false };

      mockPrismaService.walletAccount.findFirst
        .mockResolvedValueOnce(source)
        .mockResolvedValueOnce(target);

      const updatedSource = { ...source, balance: BigInt(300000) };
      const updatedTarget = { ...target, balance: BigInt(250000) };
      const transferLog = {
        id: 10,
        userId: 1,
        sourceWalletId: 1,
        targetWalletId: 2,
        amount: BigInt(200000),
        date: new Date(),
        note: 'Topup GoPay',
      };

      mockPrismaService.walletAccount.update
        .mockResolvedValueOnce(updatedSource)
        .mockResolvedValueOnce(updatedTarget);
      mockPrismaService.walletTransfer.create.mockResolvedValue(transferLog);

      const result = await service.transfer(1, {
        sourceWalletId: 1,
        targetWalletId: 2,
        amount: '200000',
        note: 'Topup GoPay',
      });

      expect(result.message).toContain('berhasil');
      expect(result.sourceWallet.balance).toBe('300000');
      expect(result.targetWallet.balance).toBe('250000');
    });
  });

  describe('archive', () => {
    it('menolak arsip jika saldo dompet masih ada (> 0)', async () => {
      mockPrismaService.walletAccount.findFirst.mockResolvedValue({
        id: 1,
        userId: 1,
        name: 'BCA',
        balance: BigInt(50000),
        isArchived: false,
      });

      await expect(service.archive(1, 1)).rejects.toThrow(BadRequestException);
    });

    it('menolak arsip jika ini satu-satunya dompet aktif', async () => {
      mockPrismaService.walletAccount.findFirst.mockResolvedValue({
        id: 1,
        userId: 1,
        name: 'BCA',
        balance: BigInt(0),
        isArchived: false,
      });
      mockPrismaService.walletAccount.count.mockResolvedValue(1);

      await expect(service.archive(1, 1)).rejects.toThrow(BadRequestException);
    });
  });
});
