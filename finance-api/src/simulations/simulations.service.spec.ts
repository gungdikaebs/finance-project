import { BadRequestException } from '@nestjs/common';
import { SimulationsService } from './simulations.service';

describe('SimulationsService', () => {
  const service = new SimulationsService();

  afterEach(() => {
    jest.useRealTimers();
  });

  it('menyesuaikan harga acuan lama sebelum menghitung target', () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-09-17T00:00:00.000Z'));

    const result = service.simulateGoal({
      priceReference: '100000000',
      referenceDate: '2025-09-17',
      annualPriceIncreaseRatio: 300,
      currentSavings: '103000000',
      mode: 'FULL',
      calculationMode: 'TARGET_DATE',
      monthlySavings: '0',
    });

    expect(result.isAchievable).toBe(true);
    expect(result.targetMonths).toBe(0);
    expect(result.projectedPrice).toBe('103000000');
    expect(result.referenceDate).toBe('2025-09-17');
    expect(result.calculatedAt).toBe('2026-09-17');
  });

  it('menjelaskan setoran nol ketika target belum tercapai', () => {
    const result = service.simulateGoal({
      priceReference: '25000000',
      annualPriceIncreaseRatio: 0,
      currentSavings: '1000000',
      mode: 'FULL',
      calculationMode: 'TARGET_DATE',
      monthlySavings: '0',
    });

    expect(result.isAchievable).toBe(false);
    expect(result.reason).toBe('ZERO_MONTHLY_SAVINGS');
  });

  it('menolak tanggal harga acuan di masa depan', () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-09-17T00:00:00.000Z'));

    expect(() =>
      service.simulateGoal({
        priceReference: '25000000',
        referenceDate: '2026-09-18',
        mode: 'FULL',
        calculationMode: 'MONTHLY_SAVINGS',
        targetMonths: 12,
      }),
    ).toThrow(BadRequestException);
  });

  it('mendukung pinjaman fixed sepanjang tenor tanpa floating rate', () => {
    const result = service.simulateMortgage({
      principal: '120000000',
      tenorMonths: 120,
      fixedRate: 0,
      fixedMonths: 120,
    });

    expect(result.fixedInstallment).toBe('1000000');
    expect(result.floatingInstallment).toBe('0');
    expect(result.hasFixedPhase).toBe(true);
    expect(result.hasFloatingPhase).toBe(false);
    expect(result.floatingStartsAtPayment).toBeNull();
  });

  it('menggunakan floating sejak pembayaran pertama ketika fixed nol', () => {
    const result = service.simulateMortgage({
      principal: '120000000',
      tenorMonths: 120,
      fixedMonths: 0,
      floatingRate: 0,
    });

    expect(result.fixedInstallment).toBe('0');
    expect(result.floatingInstallment).toBe('1000000');
    expect(result.hasFixedPhase).toBe(false);
    expect(result.hasFloatingPhase).toBe(true);
    expect(result.floatingStartsAtPayment).toBe(1);
  });

  it('menolak periode fixed yang melebihi tenor', () => {
    expect(() =>
      service.simulateMortgage({
        principal: '120000000',
        tenorMonths: 120,
        fixedRate: 5,
        fixedMonths: 121,
      }),
    ).toThrow(BadRequestException);
  });
});
