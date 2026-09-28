-- Bring databases created from the committed migration history up to the
-- current Prisma schema. Existing rows are copied when SQLite tables need
-- to be redefined for new foreign keys and defaulted columns.

CREATE TABLE "RecurringTransaction" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "amount" BIGINT NOT NULL,
    "categoryId" INTEGER,
    "incomeSourceId" INTEGER,
    "frequency" TEXT NOT NULL,
    "interval" INTEGER NOT NULL DEFAULT 1,
    "dayOfExecution" INTEGER NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME,
    "lastExecutedAt" DATETIME,
    "nextRunDate" DATETIME NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "note" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "RecurringTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "RecurringTransaction_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "RecurringTransaction_incomeSourceId_fkey" FOREIGN KEY ("incomeSourceId") REFERENCES "IncomeSource" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE "WalletAccount" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "accountNumber" TEXT,
    "color" TEXT,
    "balance" BIGINT NOT NULL DEFAULT 0,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "WalletAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "WalletTransfer" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "sourceWalletId" INTEGER NOT NULL,
    "targetWalletId" INTEGER NOT NULL,
    "amount" BIGINT NOT NULL,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "note" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WalletTransfer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "WalletTransfer_sourceWalletId_fkey" FOREIGN KEY ("sourceWalletId") REFERENCES "WalletAccount" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "WalletTransfer_targetWalletId_fkey" FOREIGN KEY ("targetWalletId") REFERENCES "WalletAccount" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Transaction" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "amount" BIGINT NOT NULL,
    "note" TEXT,
    "date" DATETIME NOT NULL,
    "typeSnapshot" TEXT NOT NULL DEFAULT 'EXPENSE',
    "groupSnapshot" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "allocatedNeeds" BIGINT,
    "allocatedSavings" BIGINT,
    "allocatedWants" BIGINT,
    "sourceGoalId" INTEGER,
    "userId" INTEGER NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "incomeSourceId" INTEGER,
    "walletAccountId" INTEGER,
    "paymentMethodId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Transaction_sourceGoalId_fkey" FOREIGN KEY ("sourceGoalId") REFERENCES "SavingsGoal" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Transaction_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Transaction_incomeSourceId_fkey" FOREIGN KEY ("incomeSourceId") REFERENCES "IncomeSource" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Transaction_walletAccountId_fkey" FOREIGN KEY ("walletAccountId") REFERENCES "WalletAccount" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Transaction_paymentMethodId_fkey" FOREIGN KEY ("paymentMethodId") REFERENCES "PaymentMethod" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Transaction" ("allocatedNeeds", "allocatedSavings", "allocatedWants", "amount", "categoryId", "createdAt", "date", "groupSnapshot", "id", "incomeSourceId", "note", "paymentMethodId", "sourceGoalId", "status", "typeSnapshot", "updatedAt", "userId") SELECT "allocatedNeeds", "allocatedSavings", "allocatedWants", "amount", "categoryId", "createdAt", "date", "groupSnapshot", "id", "incomeSourceId", "note", "paymentMethodId", "sourceGoalId", "status", "typeSnapshot", "updatedAt", "userId" FROM "Transaction";
DROP TABLE "Transaction";
ALTER TABLE "new_Transaction" RENAME TO "Transaction";

CREATE TABLE "new_FinanceProfile" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "initialBalance" BIGINT NOT NULL DEFAULT 0,
    "startDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Makassar',
    "monthlyNeeds" BIGINT NOT NULL DEFAULT 0,
    "isOnboardingCompleted" BOOLEAN NOT NULL DEFAULT false,
    "onboardingStep" INTEGER NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "FinanceProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_FinanceProfile" ("createdAt", "id", "initialBalance", "monthlyNeeds", "startDate", "timezone", "updatedAt", "userId") SELECT "createdAt", "id", "initialBalance", "monthlyNeeds", "startDate", "timezone", "updatedAt", "userId" FROM "FinanceProfile";
DROP TABLE "FinanceProfile";
ALTER TABLE "new_FinanceProfile" RENAME TO "FinanceProfile";
CREATE UNIQUE INDEX "FinanceProfile_userId_key" ON "FinanceProfile"("userId");

CREATE TABLE "new_SavingsGoal" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "targetAmount" BIGINT,
    "targetMonths" INTEGER,
    "priceReference" BIGINT,
    "referenceDate" DATETIME,
    "mode" TEXT,
    "annualPriceIncreaseRatio" INTEGER,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SavingsGoal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_SavingsGoal" ("annualPriceIncreaseRatio", "createdAt", "id", "isArchived", "mode", "name", "priceReference", "referenceDate", "targetAmount", "targetMonths", "type", "updatedAt", "userId") SELECT "annualPriceIncreaseRatio", "createdAt", "id", "isArchived", "mode", "name", "priceReference", "referenceDate", "targetAmount", "targetMonths", "type", "updatedAt", "userId" FROM "SavingsGoal";
DROP TABLE "SavingsGoal";
ALTER TABLE "new_SavingsGoal" RENAME TO "SavingsGoal";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
