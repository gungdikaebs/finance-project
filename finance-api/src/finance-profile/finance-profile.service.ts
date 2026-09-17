import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateFinanceProfileDto } from './dto/update-finance-profile.dto';

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
}
