import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

export const DEFAULT_INCOME_SOURCES = [
    'Gaji Pokok',
    'Freelance / Proyek Sampingan',
    'Investasi / Pasif',
];

export const DEFAULT_NEED_CATEGORIES = [
    'Makanan & Minuman Pokok',
    'Tempat Tinggal (Sewa / Cicilan)',
    'Listrik, Air & Internet',
    'Transportasi Harian & BBM',
    'Kesehatan & Obat-obatan',
];

export const DEFAULT_WANT_CATEGORIES = [
    'Nongkrong & Kuliner Santai',
    'Belanja Pakaian & Gadget',
    'Langganan Streaming & Hiburan',
    'Liburan & Rekreasi',
];

export const DEFAULT_INCOME_CATEGORIES = [
    'Pemasukan Rutin',
    'Bonus & THR',
    'Pendapatan Lain-lain',
];

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService
    ) { }
    async register(dto: RegisterDto) {
        const userExist = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });

        if (userExist) {
            throw new BadRequestException('Email already registered');
        }

        const hashedPassword = await bcrypt.hash(dto.password, 10);

        const user = await this.prisma.$transaction(async (tx) => {
            const createdUser = await tx.user.create({
                data: {
                    name: dto.name,
                    email: dto.email,
                    password: hashedPassword,
                },
            });

            // 1. Finance Profile Default
            await tx.financeProfile.create({
                data: {
                    userId: createdUser.id,
                    initialBalance: BigInt(0),
                    startDate: new Date(),
                    timezone: 'Asia/Makassar',
                    monthlyNeeds: BigInt(0),
                },
            });

            // 2. Default Income Sources
            for (const name of DEFAULT_INCOME_SOURCES) {
                await tx.incomeSource.create({
                    data: {
                        name,
                        userId: createdUser.id,
                    },
                });
            }

            // 3. Default Expense Categories - NEED
            for (const name of DEFAULT_NEED_CATEGORIES) {
                await tx.category.create({
                    data: {
                        name,
                        type: 'expense',
                        group: 'NEED',
                        userId: createdUser.id,
                    },
                });
            }

            // 4. Default Expense Categories - WANT
            for (const name of DEFAULT_WANT_CATEGORIES) {
                await tx.category.create({
                    data: {
                        name,
                        type: 'expense',
                        group: 'WANT',
                        userId: createdUser.id,
                    },
                });
            }

            // 5. Default Income Categories
            for (const name of DEFAULT_INCOME_CATEGORIES) {
                await tx.category.create({
                    data: {
                        name,
                        type: 'income',
                        group: 'UNASSIGNED',
                        userId: createdUser.id,
                    },
                });
            }

            // 6. Default Savings Goals
            await tx.savingsGoal.create({
                data: {
                    name: 'Dana Pengaman (Darurat)',
                    type: 'EMERGENCY',
                    targetMonths: 6,
                    userId: createdUser.id,
                },
            });

            await tx.savingsGoal.create({
                data: {
                    name: 'Tabungan Belum Ditentukan',
                    type: 'UNASSIGNED',
                    userId: createdUser.id,
                },
            });

            // 7. Default Budget Policy (50/30/20) for current period
            const now = new Date();
            await tx.budgetPolicy.create({
                data: {
                    userId: createdUser.id,
                    effectiveYear: now.getFullYear(),
                    effectiveMonth: now.getMonth() + 1,
                    needsRatio: 5000,
                    savingsRatio: 3000,
                    wantsRatio: 2000,
                },
            });

            // 8. Default Wallet Account (Modul 6)
            await tx.walletAccount.create({
                data: {
                    userId: createdUser.id,
                    name: 'Rekening Utama / Tunai',
                    type: 'BANK',
                    color: '#183D2B',
                    balance: BigInt(0),
                },
            });

            return createdUser;
        });

        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }
    async login(dto: LoginDto) {
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const isPasswordValid = await bcrypt.compare(dto.password, user.password);

        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const payload = {
            sub: user.id,
            email: user.email,
        };

        const token = this.jwtService.sign(payload);
        
        return { token };
    }

    async verifyPassword(userId: number, passwordInput: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new UnauthorizedException('Pengguna tidak ditemukan');
        }

        const isMatch = await bcrypt.compare(passwordInput, user.password);
        if (!isMatch) {
            throw new UnauthorizedException('Kata sandi yang dimasukkan tidak sesuai');
        }

        return { valid: true };
    }
}

