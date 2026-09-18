import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateFinanceProfileDto } from './dto/update-finance-profile.dto';
import { UpdateOnboardingDto } from './dto/update-onboarding.dto';

@Injectable()
export class FinanceProfileService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: number) {
    let profile = await this.prisma.financeProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      profile = await this.prisma.financeProfile.create({
        data: {
          userId,
          initialBalance: BigInt(0),
          startDate: new Date(),
          timezone: 'Asia/Makassar',
          monthlyNeeds: BigInt(0),
          isOnboardingCompleted: false,
          onboardingStep: 1,
        },
      });
    }

    return profile;
  }

  async upsertProfile(userId: number, dto: UpdateFinanceProfileDto) {
    const data: any = {};
    if (dto.initialBalance !== undefined) {
      data.initialBalance = BigInt(dto.initialBalance);
    }
    if (dto.startDate !== undefined) {
      data.startDate = new Date(dto.startDate);
    }
    if (dto.timezone !== undefined) {
      data.timezone = dto.timezone;
    }
    if (dto.monthlyNeeds !== undefined) {
      data.monthlyNeeds = BigInt(dto.monthlyNeeds);
    }

    return this.prisma.financeProfile.upsert({
      where: { userId },
      update: data,
      create: {
        userId,
        initialBalance: dto.initialBalance !== undefined ? BigInt(dto.initialBalance) : BigInt(0),
        startDate: dto.startDate !== undefined ? new Date(dto.startDate) : new Date(),
        timezone: dto.timezone || 'Asia/Makassar',
        monthlyNeeds: dto.monthlyNeeds !== undefined ? BigInt(dto.monthlyNeeds) : BigInt(0),
      },
    });
  }

  async updateOnboarding(userId: number, dto: UpdateOnboardingDto) {
    const data: any = {};
    if (dto.isOnboardingCompleted !== undefined) {
      data.isOnboardingCompleted = dto.isOnboardingCompleted;
    }
    if (dto.onboardingStep !== undefined) {
      data.onboardingStep = dto.onboardingStep;
    }
    if (dto.initialBalance !== undefined) {
      data.initialBalance = BigInt(dto.initialBalance);
    }
    if (dto.monthlyNeeds !== undefined) {
      data.monthlyNeeds = BigInt(dto.monthlyNeeds);
    }

    const updatedProfile = await this.prisma.financeProfile.upsert({
      where: { userId },
      update: data,
      create: {
        userId,
        initialBalance: dto.initialBalance !== undefined ? BigInt(dto.initialBalance) : BigInt(0),
        startDate: new Date(),
        timezone: 'Asia/Makassar',
        monthlyNeeds: dto.monthlyNeeds !== undefined ? BigInt(dto.monthlyNeeds) : BigInt(0),
        isOnboardingCompleted: dto.isOnboardingCompleted ?? false,
        onboardingStep: dto.onboardingStep ?? 1,
      },
    });

    // Sinkronisasi Dana Pengaman (EMERGENCY) jika emergencyMonthsTarget atau monthlyNeeds diisi
    if (dto.emergencyMonthsTarget !== undefined || dto.monthlyNeeds !== undefined) {
      const emergencyGoal = await this.prisma.savingsGoal.findFirst({
        where: { userId, type: 'EMERGENCY' },
      });

      const months = dto.emergencyMonthsTarget ?? emergencyGoal?.targetMonths ?? 6;
      const monthlyNeedsVal = updatedProfile.monthlyNeeds;
      const targetAmount = monthlyNeedsVal > BigInt(0) ? monthlyNeedsVal * BigInt(months) : null;

      if (emergencyGoal) {
        await this.prisma.savingsGoal.update({
          where: { id: emergencyGoal.id },
          data: {
            targetMonths: months,
            targetAmount,
          },
        });
      } else {
        await this.prisma.savingsGoal.create({
          data: {
            userId,
            name: 'Dana Pengaman (Darurat)',
            type: 'EMERGENCY',
            targetMonths: months,
            targetAmount,
          },
        });
      }
    }

    return updatedProfile;
  }
}
