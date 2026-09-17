-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN "allocatedNeeds" BIGINT;
ALTER TABLE "Transaction" ADD COLUMN "allocatedSavings" BIGINT;
ALTER TABLE "Transaction" ADD COLUMN "allocatedWants" BIGINT;

-- CreateTable
CREATE TABLE "BudgetPolicy" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "effectiveYear" INTEGER NOT NULL,
    "effectiveMonth" INTEGER NOT NULL,
    "needsRatio" INTEGER NOT NULL DEFAULT 5000,
    "savingsRatio" INTEGER NOT NULL DEFAULT 3000,
    "wantsRatio" INTEGER NOT NULL DEFAULT 2000,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "BudgetPolicy_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BudgetSourceOverride" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "policyId" INTEGER NOT NULL,
    "incomeSourceId" INTEGER NOT NULL,
    "needsRatio" INTEGER NOT NULL,
    "savingsRatio" INTEGER NOT NULL,
    "wantsRatio" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "BudgetSourceOverride_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "BudgetPolicy" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "BudgetSourceOverride_incomeSourceId_fkey" FOREIGN KEY ("incomeSourceId") REFERENCES "IncomeSource" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "BudgetPolicy_userId_effectiveYear_effectiveMonth_key" ON "BudgetPolicy"("userId", "effectiveYear", "effectiveMonth");

-- CreateIndex
CREATE UNIQUE INDEX "BudgetSourceOverride_policyId_incomeSourceId_key" ON "BudgetSourceOverride"("policyId", "incomeSourceId");
