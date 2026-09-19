import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { UpdateWalletDto } from './dto/update-wallet.dto';
import { TransferWalletDto } from './dto/transfer-wallet.dto';

@Injectable()
export class WalletsService {
  constructor(private prisma: PrismaService) {}

  private serializeWallet(wallet: any) {
    return {
      ...wallet,
      balance: wallet.balance.toString(),
    };
  }

  private serializeTransfer(transfer: any) {
    return {
      ...transfer,
      amount: transfer.amount.toString(),
      sourceWallet: transfer.sourceWallet
        ? this.serializeWallet(transfer.sourceWallet)
        : undefined,
      targetWallet: transfer.targetWallet
        ? this.serializeWallet(transfer.targetWallet)
        : undefined,
    };
  }

  /**
   * Memastikan pengguna memiliki setidaknya 1 dompet default.
   * Jika belum ada, otomatis buatkan "Rekening Utama / Tunai" dan tautkan transaksi lama.
   */
  async ensureDefaultWallet(userId: number) {
    const existing = await this.prisma.walletAccount.findFirst({
      where: { userId, isArchived: false },
    });

    if (existing) {
      return existing;
    }

    // Ambil profil untuk menghitung saldo saat ini
    const profile = await this.prisma.financeProfile.findUnique({
      where: { userId },
    });
    const initialBalance = profile ? profile.initialBalance : BigInt(0);

    // Ambil seluruh transaksi aktif pengguna
    const transactions = await this.prisma.transaction.findMany({
      where: { userId, status: 'ACTIVE' },
      include: { category: true },
    });

    let income = BigInt(0);
    let expense = BigInt(0);

    for (const trx of transactions) {
      const isIncome =
        trx.typeSnapshot === 'INCOME' || trx.category.type === 'income';
      if (isIncome) {
        income += trx.amount;
      } else {
        expense += trx.amount;
      }
    }

    const currentMainBalance = initialBalance + income - expense;

    // Buat dompet default
    const defaultWallet = await this.prisma.walletAccount.create({
      data: {
        userId,
        name: 'Rekening Utama / Tunai',
        type: 'BANK',
        color: '#183D2B',
        balance: currentMainBalance,
      },
    });

    // Tautkan transaksi lama yang belum memiliki walletAccountId
    await this.prisma.transaction.updateMany({
      where: { userId, walletAccountId: null },
      data: { walletAccountId: defaultWallet.id },
    });

    return defaultWallet;
  }

  async findAll(userId: number) {
    await this.ensureDefaultWallet(userId);

    const wallets = await this.prisma.walletAccount.findMany({
      where: { userId, isArchived: false },
      orderBy: { id: 'asc' },
    });

    return wallets.map((w) => this.serializeWallet(w));
  }

  async findOne(userId: number, id: number) {
    const wallet = await this.prisma.walletAccount.findFirst({
      where: { id, userId, isArchived: false },
    });
    if (!wallet) {
      throw new NotFoundException('Akun dompet / rekening tidak ditemukan');
    }
    return this.serializeWallet(wallet);
  }

  async create(userId: number, dto: CreateWalletDto) {
    const wallet = await this.prisma.walletAccount.create({
      data: {
        userId,
        name: dto.name.trim(),
        type: dto.type,
        accountNumber: dto.accountNumber ? dto.accountNumber.trim() : null,
        color: dto.color || '#183D2B',
        balance: BigInt(0),
      },
    });

    return this.serializeWallet(wallet);
  }

  async update(userId: number, id: number, dto: UpdateWalletDto) {
    const wallet = await this.prisma.walletAccount.findFirst({
      where: { id, userId },
    });
    if (!wallet) {
      throw new NotFoundException('Akun dompet / rekening tidak ditemukan');
    }

    const updated = await this.prisma.walletAccount.update({
      where: { id },
      data: {
        name: dto.name ? dto.name.trim() : undefined,
        type: dto.type || undefined,
        accountNumber:
          dto.accountNumber !== undefined
            ? dto.accountNumber?.trim() || null
            : undefined,
        color: dto.color || undefined,
      },
    });

    return this.serializeWallet(updated);
  }

  async archive(userId: number, id: number) {
    const wallet = await this.prisma.walletAccount.findFirst({
      where: { id, userId, isArchived: false },
    });
    if (!wallet) {
      throw new NotFoundException('Akun dompet / rekening tidak ditemukan');
    }

    if (wallet.balance !== BigInt(0)) {
      throw new BadRequestException(
        `Dompet '${wallet.name}' masih memiliki saldo (${wallet.balance.toString()}). Pindahkan (transfer) atau kosongkan saldo terlebih dahulu sebelum mengarsipkan.`,
      );
    }

    // Pastikan bukan satu-satunya dompet aktif
    const activeCount = await this.prisma.walletAccount.count({
      where: { userId, isArchived: false },
    });
    if (activeCount <= 1) {
      throw new BadRequestException(
        'Tidak dapat mengarsipkan satu-satunya akun dompet yang aktif',
      );
    }

    const archived = await this.prisma.walletAccount.update({
      where: { id },
      data: { isArchived: true },
    });

    return this.serializeWallet(archived);
  }

  async transfer(userId: number, dto: TransferWalletDto) {
    if (dto.sourceWalletId === dto.targetWalletId) {
      throw new BadRequestException(
        'Dompet sumber dan dompet tujuan tidak boleh sama',
      );
    }

    const amount = BigInt(dto.amount);
    if (amount <= BigInt(0)) {
      throw new BadRequestException(
        'Nominal transfer harus lebih besar dari Rp 0',
      );
    }

    const [source, target] = await Promise.all([
      this.prisma.walletAccount.findFirst({
        where: { id: dto.sourceWalletId, userId, isArchived: false },
      }),
      this.prisma.walletAccount.findFirst({
        where: { id: dto.targetWalletId, userId, isArchived: false },
      }),
    ]);

    if (!source) {
      throw new NotFoundException('Dompet sumber tidak ditemukan');
    }
    if (!target) {
      throw new NotFoundException('Dompet tujuan tidak ditemukan');
    }

    if (source.balance < amount) {
      throw new BadRequestException(
        `Saldo dompet '${source.name}' (${source.balance.toString()}) tidak mencukupi untuk transfer nominal ${amount.toString()}`,
      );
    }

    const transferDate = dto.date ? new Date(dto.date) : new Date();

    // Jalankan transfer dalam transaksi database atomik
    const result = await this.prisma.$transaction(async (tx) => {
      // 1. Kurangi saldo sumber
      const updatedSource = await tx.walletAccount.update({
        where: { id: source.id },
        data: { balance: { decrement: amount } },
      });

      // 2. Tambah saldo tujuan
      const updatedTarget = await tx.walletAccount.update({
        where: { id: target.id },
        data: { balance: { increment: amount } },
      });

      // 3. Catat riwayat log transfer
      const record = await tx.walletTransfer.create({
        data: {
          userId,
          sourceWalletId: source.id,
          targetWalletId: target.id,
          amount,
          date: transferDate,
          note: dto.note ? dto.note.trim() : null,
        },
        include: {
          sourceWallet: true,
          targetWallet: true,
        },
      });

      return {
        transfer: record,
        sourceWallet: updatedSource,
        targetWallet: updatedTarget,
      };
    });

    return {
      message: 'Transfer antar dompet berhasil diproses',
      transfer: this.serializeTransfer(result.transfer),
      sourceWallet: this.serializeWallet(result.sourceWallet),
      targetWallet: this.serializeWallet(result.targetWallet),
    };
  }

  async getTransfers(userId: number, limit = 20) {
    const transfers = await this.prisma.walletTransfer.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: limit,
      include: {
        sourceWallet: true,
        targetWallet: true,
      },
    });

    return transfers.map((t) => this.serializeTransfer(t));
  }
}
