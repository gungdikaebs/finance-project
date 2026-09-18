import { ReportsService } from './reports.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ReportsService', () => {
  let service: ReportsService;
  let prisma: Partial<PrismaService>;

  beforeEach(() => {
    prisma = {
      user: {
        findUnique: jest.fn().mockResolvedValue({
          id: 1,
          name: 'Tester',
          email: 'tester@example.com',
        }),
      } as any,
      financeProfile: {
        findUnique: jest.fn().mockResolvedValue({
          userId: 1,
          initialBalance: BigInt(5000000),
          startDate: new Date('2026-01-01'),
          timezone: 'Asia/Makassar',
          monthlyNeeds: BigInt(2000000),
        }),
      } as any,
      transaction: {
        findMany: jest.fn().mockImplementation(({ where }) => {
          if (where?.date?.gte && where?.date?.lte) {
            return Promise.resolve([
              {
                id: 1,
                userId: 1,
                amount: BigInt(10000000),
                typeSnapshot: 'INCOME',
                date: new Date(2026, 8, 5),
                category: { id: 1, name: 'Gaji', type: 'income', group: 'UNASSIGNED' },
                incomeSource: { id: 1, name: 'Kantor Utama' },
                status: 'ACTIVE',
                allocatedNeeds: BigInt(5000000),
                allocatedWants: BigInt(3000000),
                allocatedSavings: BigInt(2000000),
              },
              {
                id: 2,
                userId: 1,
                amount: BigInt(1500000),
                typeSnapshot: 'EXPENSE',
                groupSnapshot: 'NEED',
                categoryId: 10,
                date: new Date(2026, 8, 10),
                category: { id: 10, name: 'Makan & Minum', type: 'expense', group: 'NEED' },
                status: 'ACTIVE',
              },
              {
                id: 3,
                userId: 1,
                amount: BigInt(500000),
                typeSnapshot: 'EXPENSE',
                groupSnapshot: 'WANT',
                categoryId: 20,
                date: new Date(2026, 8, 15),
                category: { id: 20, name: 'Hiburan', type: 'expense', group: 'WANT' },
                status: 'ACTIVE',
              },
            ]);
          }
          return Promise.resolve([]);
        }),
      } as any,
      allocationEvent: {
        aggregate: jest.fn().mockResolvedValue({ _sum: { amount: BigInt(1000000) } }),
      } as any,
    };

    service = new ReportsService(prisma as PrismaService);
  });

  it('menghasilkan analytics 6 bulan, distribusi kategori, dan perbandingan anggaran secara presisi', async () => {
    const result = await service.getAnalytics(1, 9, 2026);

    expect(result.incomeVsExpenseTrend).toBeDefined();
    expect(result.incomeVsExpenseTrend.months.length).toBe(6);
    expect(result.incomeVsExpenseTrend.months[5]).toBe('Sep');
    expect(result.incomeVsExpenseTrend.incomeData[5]).toBe('10000000');
    expect(result.incomeVsExpenseTrend.expenseData[5]).toBe('2000000');

    expect(result.categoryDistribution).toBeDefined();
    expect(result.categoryDistribution.length).toBe(2);
    expect(result.categoryDistribution[0].categoryName).toBe('Makan & Minum');
    expect(result.categoryDistribution[0].percentage).toBe(75);
    expect(result.categoryDistribution[1].categoryName).toBe('Hiburan');
    expect(result.categoryDistribution[1].percentage).toBe(25);

    expect(result.budgetVsActual).toBeDefined();
    expect(result.budgetVsActual.needs.budget).toBe('5000000');
    expect(result.budgetVsActual.needs.actual).toBe('1500000');
    expect(result.budgetVsActual.needs.variancePercent).toBe(30);
    expect(result.budgetVsActual.wants.budget).toBe('3000000');
    expect(result.budgetVsActual.wants.actual).toBe('500000');
    expect(result.budgetVsActual.wants.variancePercent).toBe(16.7);
  });

  it('menghasilkan ekspor data CSV dengan format header dan baris transaksi', async () => {
    const csv = await service.exportCsv(1, 9, 2026);

    expect(csv.startsWith('\uFEFF')).toBe(true);
    expect(csv).toContain('Tanggal,Tipe,Kategori,Grup Anggaran,Sumber Pemasukan,Nominal (IDR),Catatan,Status,ID Referensi');
    expect(csv).toContain('Pemasukan');
    expect(csv).toContain('Pengeluaran');
    expect(csv).toContain('10000000');
    expect(csv).toContain('TRX-00001');
  });

  it('menghasilkan buffer file Excel (.xlsx) yang valid', async () => {
    const buffer = await service.exportExcel(1, 9, 2026);

    expect(buffer).toBeDefined();
    expect(Buffer.isBuffer(buffer)).toBe(true);
    expect(buffer.length).toBeGreaterThan(100);
  });

  it('menghasilkan buffer file PDF (.pdf) yang valid', async () => {
    const buffer = await service.exportPdf(1, 9, 2026);

    expect(buffer).toBeDefined();
    expect(Buffer.isBuffer(buffer)).toBe(true);
    // PDF signature check '%PDF'
    expect(buffer.toString('utf-8', 0, 4)).toBe('%PDF');
  });
});
