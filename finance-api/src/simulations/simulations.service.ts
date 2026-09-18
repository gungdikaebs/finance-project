import { Injectable, BadRequestException } from '@nestjs/common';
import { SimulateGoalDto } from './dto/simulate-goal.dto';
import { SimulateMortgageDto } from './dto/simulate-mortgage.dto';

@Injectable()
export class SimulationsService {
  private readonly maxInputAmount = BigInt('1000000000000');

  private parseAmount(value: string | undefined, field: string): bigint {
    const amount = BigInt(value || '0');
    if (amount > this.maxInputAmount) {
      throw new BadRequestException(`${field} maksimal Rp1 triliun`);
    }
    return amount;
  }

  private toUtcDate(date: string): Date {
    const parsed = new Date(`${date}T00:00:00.000Z`);
    if (Number.isNaN(parsed.getTime())) {
      throw new BadRequestException('referenceDate tidak valid');
    }
    return parsed;
  }

  private calendarMonthsBetween(from: Date, to: Date): number {
    let wholeMonths =
      (to.getUTCFullYear() - from.getUTCFullYear()) * 12 +
      to.getUTCMonth() -
      from.getUTCMonth();
    let anchor = new Date(
      Date.UTC(
        from.getUTCFullYear(),
        from.getUTCMonth() + wholeMonths,
        from.getUTCDate(),
      ),
    );
    if (anchor > to) {
      wholeMonths -= 1;
      anchor = new Date(
        Date.UTC(
          from.getUTCFullYear(),
          from.getUTCMonth() + wholeMonths,
          from.getUTCDate(),
        ),
      );
    }
    const nextAnchor = new Date(
      Date.UTC(
        from.getUTCFullYear(),
        from.getUTCMonth() + wholeMonths + 1,
        from.getUTCDate(),
      ),
    );
    const fraction =
      nextAnchor.getTime() === anchor.getTime()
        ? 0
        : (to.getTime() - anchor.getTime()) /
          (nextAnchor.getTime() - anchor.getTime());
    return wholeMonths + fraction;
  }

  /**
   * Simulasi Akumulasi Target Pembelian (Cash vs DP)
   * Mengikuti kontrak perhitungan rencana-implementasi-v1.md
   */
  simulateGoal(dto: SimulateGoalDto) {
    const basePrice = this.parseAmount(dto.priceReference, 'priceReference');
    const inflationRatio = (dto.annualPriceIncreaseRatio || 0) / 10000;
    const currentSavings = this.parseAmount(
      dto.currentSavings,
      'currentSavings',
    );
    const initialFees = this.parseAmount(dto.initialFees, 'initialFees');
    if (dto.dpAmount) this.parseAmount(dto.dpAmount, 'dpAmount');
    if (dto.monthlySavings)
      this.parseAmount(dto.monthlySavings, 'monthlySavings');

    const calculatedAt = new Date().toISOString().slice(0, 10);
    const referenceDate = dto.referenceDate || calculatedAt;
    const reference = this.toUtcDate(referenceDate);
    const calculationDate = this.toUtcDate(calculatedAt);
    if (reference > calculationDate) {
      throw new BadRequestException(
        'referenceDate tidak boleh berada di masa depan',
      );
    }
    const elapsedMonths = this.calendarMonthsBetween(
      reference,
      calculationDate,
    );

    // Helper: Hitung harga acuan pada bulan ke-m dengan inflasi tahunan majemuk
    const getPriceAtMonth = (m: number): bigint => {
      if (inflationRatio === 0 || elapsedMonths + m === 0) return basePrice;
      const factor = Math.pow(1 + inflationRatio, (elapsedMonths + m) / 12);
      const projected = Math.round(Number(basePrice) * factor);
      if (!Number.isSafeInteger(projected)) {
        throw new BadRequestException(
          'Hasil proyeksi nominal melewati batas aman',
        );
      }
      return BigInt(projected);
    };

    // Helper: Hitung rincian kebutuhan dana pada bulan ke-m
    const getDetailsAtMonth = (m: number) => {
      const priceAtM = getPriceAtMonth(m);
      let dp = BigInt(0);
      let loanPrincipal = BigInt(0);

      if (dto.mode === 'FULL') {
        dp = BigInt(0);
        loanPrincipal = BigInt(0);
      } else {
        // Mode DOWN_PAYMENT
        if (dto.dpAmount) {
          const requestedDp = BigInt(dto.dpAmount);
          dp = requestedDp > priceAtM ? priceAtM : requestedDp;
        } else {
          const ratio = (dto.dpPercent || 2000) / 10000;
          dp = BigInt(Math.round(Number(priceAtM) * ratio));
        }
        loanPrincipal = priceAtM > dp ? priceAtM - dp : BigInt(0);
      }

      const targetNeeded = (dto.mode === 'FULL' ? priceAtM : dp) + initialFees;

      return {
        projectedPrice: priceAtM,
        downPayment: dp,
        loanPrincipal,
        initialFees,
        targetNeeded,
      };
    };

    // 1. Mode: Cari Setoran Bulanan dari Target Waktu (N Bulan)
    if (dto.calculationMode === 'MONTHLY_SAVINGS') {
      const N = dto.targetMonths;
      if (!N || N < 1) {
        throw new BadRequestException(
          'targetMonths wajib diisi dan minimal 1 bulan',
        );
      }

      const details = getDetailsAtMonth(N);
      const deficit =
        details.targetNeeded > currentSavings
          ? details.targetNeeded - currentSavings
          : BigInt(0);
      const monthlySavingsNum = Math.ceil(Number(deficit) / N);
      const monthlySavings = BigInt(monthlySavingsNum);

      return {
        isAchievable: true,
        calculationMode: 'MONTHLY_SAVINGS',
        targetMonths: N,
        monthlySavings: monthlySavings.toString(),
        projectedPrice: details.projectedPrice.toString(),
        requiredFunds: details.targetNeeded.toString(),
        downPayment: details.downPayment.toString(),
        loanPrincipal: details.loanPrincipal.toString(),
        initialFees: details.initialFees.toString(),
        currentSavings: currentSavings.toString(),
        totalSavedAtEnd: (
          currentSavings +
          monthlySavings * BigInt(N)
        ).toString(),
        referenceDate,
        calculatedAt,
      };
    }

    // 2. Mode: Cari Bulan Ketercapaian dari Setoran Tetap Bulanan (Cek Sekuensial Bulan 0..600)
    if (dto.calculationMode === 'TARGET_DATE') {
      if (dto.monthlySavings === undefined) {
        throw new BadRequestException(
          'monthlySavings wajib diisi untuk mode TARGET_DATE',
        );
      }
      const s = BigInt(dto.monthlySavings);

      const initialDetails = getDetailsAtMonth(0);
      if (currentSavings >= initialDetails.targetNeeded) {
        return {
          isAchievable: true,
          calculationMode: 'TARGET_DATE',
          targetMonths: 0,
          monthlySavings: s.toString(),
          projectedPrice: initialDetails.projectedPrice.toString(),
          requiredFunds: initialDetails.targetNeeded.toString(),
          downPayment: initialDetails.downPayment.toString(),
          loanPrincipal: initialDetails.loanPrincipal.toString(),
          initialFees: initialDetails.initialFees.toString(),
          currentSavings: currentSavings.toString(),
          totalSavedAtEnd: currentSavings.toString(),
          referenceDate,
          calculatedAt,
        };
      }

      if (s === BigInt(0)) {
        return {
          isAchievable: false,
          reason: 'ZERO_MONTHLY_SAVINGS',
          calculationMode: 'TARGET_DATE',
          targetMonths: null,
          monthlySavings: '0',
          referenceDate,
          calculatedAt,
          message: 'Target belum tercapai karena setoran bulanan bernilai nol.',
        };
      }

      for (let m = 0; m <= 600; m++) {
        const accumulated = currentSavings + s * BigInt(m);
        const details = getDetailsAtMonth(m);

        if (accumulated >= details.targetNeeded) {
          return {
            isAchievable: true,
            calculationMode: 'TARGET_DATE',
            targetMonths: m,
            monthlySavings: s.toString(),
            projectedPrice: details.projectedPrice.toString(),
            requiredFunds: details.targetNeeded.toString(),
            downPayment: details.downPayment.toString(),
            loanPrincipal: details.loanPrincipal.toString(),
            initialFees: details.initialFees.toString(),
            currentSavings: currentSavings.toString(),
            totalSavedAtEnd: accumulated.toString(),
            referenceDate,
            calculatedAt,
          };
        }
      }

      // Jika dalam 600 bulan (50 tahun) belum tercapai
      return {
        isAchievable: false,
        calculationMode: 'TARGET_DATE',
        targetMonths: null,
        monthlySavings: s.toString(),
        reason: 'HORIZON_EXCEEDED',
        referenceDate,
        calculatedAt,
        message:
          'Belum tercapai dalam simulasi 50 tahun (600 bulan). Pertimbangkan menambah setoran bulanan atau menyesuaikan target.',
      };
    }

    throw new BadRequestException('calculationMode tidak valid');
  }

  /**
   * Simulasi Angsuran Cicilan & KPR (Flat, Anuitas Tetap, atau KPR Bertahap)
   * Mengikuti kontrak perhitungan rencana-implementasi-v1.md dan D-007 / D-008
   */
  simulateMortgage(dto: SimulateMortgageDto) {
    const principal = this.parseAmount(dto.principal, 'principal');
    const principalNum = Number(principal);
    const totalTenor = dto.tenorMonths;
    const loanType = dto.loanType || 'STEPPED_MORTGAGE';

    // 1. Skema Bunga FLAT (Khas cicilan barang, kendaraan, KTA)
    if (loanType === 'FLAT') {
      const annualRate = dto.fixedRate ?? 0;
      const totalInterest = Math.round(
        principalNum * (annualRate / 100) * (totalTenor / 12),
      );
      const totalLoanPayment = principalNum + totalInterest;
      const monthlyInstallment = Math.round(totalLoanPayment / totalTenor);

      let dsr: number | null = null;
      if (dto.monthlyIncome && Number(dto.monthlyIncome) > 0) {
        dsr =
          Math.round((monthlyInstallment / Number(dto.monthlyIncome)) * 1000) /
          10;
      }

      return {
        principal: dto.principal,
        tenorMonths: totalTenor,
        fixedRate: annualRate,
        fixedMonths: totalTenor,
        floatingRate: 0,
        floatingMonths: 0,
        fixedInstallment: monthlyInstallment.toString(),
        floatingInstallment: '0',
        highestInstallment: monthlyInstallment.toString(),
        installmentJump: '0',
        balanceBeforeFloating: '0',
        totalInterest: totalInterest.toString(),
        totalLoanPayment: totalLoanPayment.toString(),
        fixedDsr: dsr,
        floatingDsr: null,
        hasFixedPhase: true,
        hasFloatingPhase: false,
        floatingStartsAtPayment: null,
        loanType: 'FLAT',
      };
    }

    // 2. Skema Bunga ANUITAS TETAP (Bunga efektif konstan sepanjang tenor)
    if (loanType === 'ANNUITY') {
      const annualRate = dto.fixedRate ?? 0;
      const r = annualRate / 100 / 12;
      const calcAnnuity = (L: number, n: number, rate: number): number => {
        if (n <= 0 || L <= 0) return 0;
        if (rate === 0) return L / n;
        return (L * rate) / (1 - Math.pow(1 + rate, -n));
      };
      const monthlyInstallmentRaw = calcAnnuity(principalNum, totalTenor, r);
      const monthlyInstallment = Math.round(monthlyInstallmentRaw);

      let balance = principalNum;
      let totalInterest = 0;
      for (let m = 1; m <= totalTenor; m++) {
        const interestMonth = balance * r;
        let principalPaid = monthlyInstallmentRaw - interestMonth;
        if (m === totalTenor) principalPaid = balance;
        balance = Math.max(0, balance - principalPaid);
        totalInterest += interestMonth;
      }
      const totalLoanPayment = Math.round(principalNum + totalInterest);

      let dsr: number | null = null;
      if (dto.monthlyIncome && Number(dto.monthlyIncome) > 0) {
        dsr =
          Math.round((monthlyInstallment / Number(dto.monthlyIncome)) * 1000) /
          10;
      }

      return {
        principal: dto.principal,
        tenorMonths: totalTenor,
        fixedRate: annualRate,
        fixedMonths: totalTenor,
        floatingRate: 0,
        floatingMonths: 0,
        fixedInstallment: monthlyInstallment.toString(),
        floatingInstallment: '0',
        highestInstallment: monthlyInstallment.toString(),
        installmentJump: '0',
        balanceBeforeFloating: '0',
        totalInterest: Math.round(totalInterest).toString(),
        totalLoanPayment: totalLoanPayment.toString(),
        fixedDsr: dsr,
        floatingDsr: null,
        hasFixedPhase: true,
        hasFloatingPhase: false,
        floatingStartsAtPayment: null,
        loanType: 'ANNUITY',
      };
    }

    // 3. Skema KPR BERTAHAP (STEPPED_MORTGAGE: Fixed -> Floating)
    const fixedMonths = dto.fixedMonths ?? 0;
    if (fixedMonths > totalTenor) {
      throw new BadRequestException(
        'fixedMonths tidak boleh melebihi tenorMonths',
      );
    }
    if (fixedMonths > 0 && dto.fixedRate === undefined) {
      throw new BadRequestException(
        'fixedRate wajib diisi ketika ada periode fixed',
      );
    }
    if (fixedMonths < totalTenor && dto.floatingRate === undefined) {
      throw new BadRequestException(
        'floatingRate wajib diisi ketika ada periode floating',
      );
    }

    const floatingMonths = totalTenor - fixedMonths;

    const fixedRate = dto.fixedRate ?? 0;
    const floatingRate = dto.floatingRate ?? 0;
    const rFixed = fixedRate / 100 / 12;
    const rFloating = floatingRate / 100 / 12;

    // Helper rumus angsuran anuitas: A = L * r / (1 - (1 + r)^(-n))
    const calcAnnuity = (L: number, n: number, r: number): number => {
      if (n <= 0 || L <= 0) return 0;
      if (r === 0) return L / n;
      return (L * r) / (1 - Math.pow(1 + r, -n));
    };

    // 1. Angsuran Fase Fixed
    const fixedInstallmentRaw =
      fixedMonths > 0 ? calcAnnuity(principalNum, totalTenor, rFixed) : 0;

    let balance = principalNum;
    let totalInterest = 0;
    let floatingInstallmentRaw = 0;
    let balanceBeforeFloating = 0;

    // Amortisasi bulan demi bulan
    for (let m = 1; m <= fixedMonths; m++) {
      const interestMonth = balance * rFixed;
      const principalPaid = fixedInstallmentRaw - interestMonth;
      balance = Math.max(0, balance - principalPaid);
      totalInterest += interestMonth;
    }

    balanceBeforeFloating = balance;

    // 2. Angsuran Fase Floating
    if (floatingMonths > 0 && balance > 0) {
      floatingInstallmentRaw = calcAnnuity(balance, floatingMonths, rFloating);

      for (let m = 1; m <= floatingMonths; m++) {
        const interestMonth = balance * rFloating;
        let principalPaid = floatingInstallmentRaw - interestMonth;

        if (m === floatingMonths) {
          principalPaid = balance;
        }

        balance = Math.max(0, balance - principalPaid);
        totalInterest += interestMonth;
      }
    }

    const fixedInstallment = Math.round(fixedInstallmentRaw);
    const floatingInstallment = Math.round(floatingInstallmentRaw);
    const highestInstallment = Math.max(fixedInstallment, floatingInstallment);
    const totalLoanPayment = Math.round(principalNum + totalInterest);

    // Debt Service Ratio (jika pemasukan diisi)
    let fixedDsr: number | null = null;
    let floatingDsr: number | null = null;
    if (dto.monthlyIncome && Number(dto.monthlyIncome) > 0) {
      const inc = Number(dto.monthlyIncome);
      if (fixedMonths > 0) {
        fixedDsr = Math.round((fixedInstallment / inc) * 1000) / 10;
      }
      if (floatingMonths > 0 && floatingInstallment > 0) {
        floatingDsr = Math.round((floatingInstallment / inc) * 1000) / 10;
      }
    }

    return {
      principal: dto.principal,
      tenorMonths: totalTenor,
      fixedRate,
      fixedMonths,
      floatingRate,
      floatingMonths,
      fixedInstallment: fixedInstallment.toString(),
      floatingInstallment: floatingInstallment.toString(),
      highestInstallment: highestInstallment.toString(),
      installmentJump:
        fixedMonths > 0 &&
        floatingMonths > 0 &&
        floatingInstallment > fixedInstallment
          ? (floatingInstallment - fixedInstallment).toString()
          : '0',
      balanceBeforeFloating: Math.round(balanceBeforeFloating).toString(),
      totalInterest: Math.round(totalInterest).toString(),
      totalLoanPayment: totalLoanPayment.toString(),
      fixedDsr,
      floatingDsr,
      hasFixedPhase: fixedMonths > 0,
      hasFloatingPhase: floatingMonths > 0,
      floatingStartsAtPayment: floatingMonths > 0 ? fixedMonths + 1 : null,
      loanType: 'STEPPED_MORTGAGE',
    };
  }
}
