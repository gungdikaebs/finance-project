import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import {
  DEFAULT_INCOME_SOURCES,
  DEFAULT_NEED_CATEGORIES,
  DEFAULT_WANT_CATEGORIES,
  DEFAULT_INCOME_CATEGORIES,
} from '../src/auth/auth.service';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding initial database templates...');

  const email = 'dika@example.com';
  const hashedPassword = await bcrypt.hash('password123', 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      name: 'Dika Developer',
      password: hashedPassword,
    },
  });

  console.log(`User seeded: ${user.email} (ID: ${user.id})`);

  // 1. Finance Profile
  await prisma.financeProfile.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      initialBalance: BigInt(5000000), // Rp 5.000.000 saldo awal contoh
      startDate: new Date(),
      timezone: 'Asia/Makassar',
      monthlyNeeds: BigInt(2500000),
    },
  });

  // 2. Default Income Sources
  for (const name of DEFAULT_INCOME_SOURCES) {
    const existing = await prisma.incomeSource.findFirst({
      where: { userId: user.id, name },
    });
    if (!existing) {
      await prisma.incomeSource.create({
        data: { name, userId: user.id },
      });
    }
  }

  // 3. Default Need Categories
  for (const name of DEFAULT_NEED_CATEGORIES) {
    const existing = await prisma.category.findFirst({
      where: { userId: user.id, name, type: 'expense' },
    });
    if (!existing) {
      await prisma.category.create({
        data: { name, type: 'expense', group: 'NEED', userId: user.id },
      });
    }
  }

  // 4. Default Want Categories
  for (const name of DEFAULT_WANT_CATEGORIES) {
    const existing = await prisma.category.findFirst({
      where: { userId: user.id, name, type: 'expense' },
    });
    if (!existing) {
      await prisma.category.create({
        data: { name, type: 'expense', group: 'WANT', userId: user.id },
      });
    }
  }

  // 5. Default Income Categories
  for (const name of DEFAULT_INCOME_CATEGORIES) {
    const existing = await prisma.category.findFirst({
      where: { userId: user.id, name, type: 'income' },
    });
    if (!existing) {
      await prisma.category.create({
        data: { name, type: 'income', group: 'UNASSIGNED', userId: user.id },
      });
    }
  }

  // 6. Savings Goals
  const existingEmergency = await prisma.savingsGoal.findFirst({
    where: { userId: user.id, type: 'EMERGENCY' },
  });
  if (!existingEmergency) {
    await prisma.savingsGoal.create({
      data: {
        userId: user.id,
        name: 'Dana Pengaman (Darurat)',
        type: 'EMERGENCY',
        targetMonths: 6,
      },
    });
  }

  const existingUnassigned = await prisma.savingsGoal.findFirst({
    where: { userId: user.id, type: 'UNASSIGNED' },
  });
  if (!existingUnassigned) {
    await prisma.savingsGoal.create({
      data: {
        userId: user.id,
        name: 'Tabungan Belum Ditentukan',
        type: 'UNASSIGNED',
      },
    });
  }

  // 7. Budget Policy
  const now = new Date();
  const existingPolicy = await prisma.budgetPolicy.findUnique({
    where: {
      userId_effectiveYear_effectiveMonth: {
        userId: user.id,
        effectiveYear: now.getFullYear(),
        effectiveMonth: now.getMonth() + 1,
      },
    },
  });

  if (!existingPolicy) {
    await prisma.budgetPolicy.create({
      data: {
        userId: user.id,
        effectiveYear: now.getFullYear(),
        effectiveMonth: now.getMonth() + 1,
        needsRatio: 5000,
        savingsRatio: 3000,
        wantsRatio: 2000,
      },
    });
  }

  // 8. Default Wallet Account
  const existingWallet = await prisma.walletAccount.findFirst({
    where: { userId: user.id, isArchived: false },
  });
  if (!existingWallet) {
    await prisma.walletAccount.create({
      data: {
        userId: user.id,
        name: 'Rekening Utama / Tunai',
        type: 'BANK',
        color: '#183D2B',
        balance: BigInt(5000000),
      },
    });
  }

  console.log('Seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
