import { Injectable, BadRequestException, ConflictException, ServiceUnavailableException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';
import { Prisma } from '@prisma/client';
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
    private readonly googleClient = new OAuth2Client();

    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
        private configService: ConfigService = new ConfigService(),
    ) { }
    async register(dto: RegisterDto) {
        const email = dto.email.trim().toLowerCase();
        const userExist = await this.findUserByEmail(email);

        if (userExist) {
            throw new BadRequestException('Email already registered');
        }

        const user = await this.createUserWithDefaults({
            name: dto.name,
            email,
            password: await bcrypt.hash(dto.password, 10),
        });

        const { password, googleSub, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }

    private async createUserWithDefaults(data: {
        name: string;
        email: string;
        password: string | null;
        googleSub?: string;
    }) {
        return this.prisma.$transaction(async (tx) => {
            const createdUser = await tx.user.create({
                data,
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

    }

    private issueToken(user: { id: number; email: string }) {
        return { token: this.jwtService.sign({ sub: user.id, email: user.email }) };
    }

    private async findUserByEmail(email: string) {
        const exact = await this.prisma.user.findUnique({ where: { email } });
        if (exact) return exact;

        // Akun lama bisa menyimpan kapitalisasi email yang berbeda. SQLite memakai
        // perbandingan case-sensitive untuk indeks email bawaan Prisma.
        const matches = await this.prisma.$queryRaw<Array<{
            id: number;
            email: string;
            password: string | null;
            googleSub: string | null;
        }>>`SELECT "id", "email", "password", "googleSub" FROM "User" WHERE LOWER("email") = ${email} LIMIT 1`;
        return matches[0] ?? null;
    }

    private async verifyGoogleIdentity(credential: string) {
        const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
        if (!clientId || clientId === 'isi-dengan-google-web-client-id') {
            throw new ServiceUnavailableException('Masuk dengan Google belum tersedia saat ini. Gunakan email dan kata sandi.');
        }

        try {
            const ticket = await this.googleClient.verifyIdToken({ idToken: credential, audience: clientId });
            const payload = ticket.getPayload();
            if (!payload?.sub || !payload.email || payload.email_verified !== true) {
                throw new UnauthorizedException('Akun Google tidak memiliki email terverifikasi.');
            }
            const email = payload.email.trim().toLowerCase();
            return { sub: payload.sub, email, name: payload.name || email.split('@')[0] };
        } catch (error) {
            if (error instanceof UnauthorizedException) throw error;
            throw new UnauthorizedException('Sesi Google tidak valid atau sudah kedaluwarsa. Coba lagi.');
        }
    }

    private isUniqueConflict(error: unknown) {
        return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002';
    }

    async googleLogin(credential: string) {
        const identity = await this.verifyGoogleIdentity(credential);
        const linkedUser = await this.prisma.user.findUnique({ where: { googleSub: identity.sub } });
        if (linkedUser) return this.issueToken(linkedUser);

        const emailUser = await this.findUserByEmail(identity.email);
        if (emailUser) {
            if (emailUser.googleSub) {
                throw new ConflictException('Email ini sudah terhubung ke akun Google lain. Masuk dengan metode sebelumnya.');
            }
            throw new ConflictException({
                code: 'ACCOUNT_LINK_REQUIRED',
                message: 'Email ini sudah terdaftar. Masukkan kata sandi akun lama untuk menghubungkannya dengan Google.',
            });
        }

        try {
            const user = await this.createUserWithDefaults({
                name: identity.name,
                email: identity.email,
                password: null,
                googleSub: identity.sub,
            });
            return this.issueToken(user);
        } catch (error) {
            if (!this.isUniqueConflict(error)) throw error;
            const concurrentUser = await this.prisma.user.findUnique({ where: { googleSub: identity.sub } });
            if (concurrentUser) return this.issueToken(concurrentUser);
            const emailUser = await this.findUserByEmail(identity.email);
            if (emailUser?.googleSub) {
                throw new ConflictException('Email ini sudah terhubung ke akun Google lain. Masuk dengan metode sebelumnya.');
            }
            throw new ConflictException({
                code: 'ACCOUNT_LINK_REQUIRED',
                message: 'Email ini sudah terdaftar. Masukkan kata sandi akun lama untuk menghubungkannya dengan Google.',
            });
        }
    }

    async linkGoogleAccount(credential: string, password: string) {
        const identity = await this.verifyGoogleIdentity(credential);
        const linkedUser = await this.prisma.user.findUnique({ where: { googleSub: identity.sub } });
        if (linkedUser) {
            throw new ConflictException('Akun Google ini sudah terhubung. Coba masuk kembali.');
        }

        const user = await this.findUserByEmail(identity.email);
        if (!user?.password || user.googleSub) {
            throw new UnauthorizedException('Akun tidak dapat dihubungkan. Masuk dengan metode sebelumnya.');
        }
        if (!(await bcrypt.compare(password, user.password))) {
            throw new UnauthorizedException('Kata sandi akun lama tidak sesuai.');
        }

        try {
            const result = await this.prisma.user.updateMany({
                where: { id: user.id, googleSub: null },
                data: { googleSub: identity.sub },
            });
            if (result.count !== 1) {
                throw new ConflictException('Akun ini baru saja terhubung ke Google lain. Coba masuk kembali.');
            }
            return this.issueToken(user);
        } catch (error) {
            if (this.isUniqueConflict(error)) {
                throw new ConflictException('Akun Google ini sudah terhubung. Coba masuk kembali.');
            }
            throw error;
        }
    }

    async login(dto: LoginDto) {
        const user = await this.findUserByEmail(dto.email.trim().toLowerCase());

        if (!user?.password) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const isPasswordValid = await bcrypt.compare(dto.password, user.password);

        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        return this.issueToken(user);
    }

    async getCurrentUser(userId: number) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, name: true, email: true },
        });

        if (!user) {
            throw new UnauthorizedException('Pengguna tidak ditemukan');
        }

        return user;
    }

    async verifyPassword(userId: number, passwordInput: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user?.password) {
            throw new UnauthorizedException('Akun ini tidak memakai kata sandi. Masuk dengan Google.');
        }

        const isMatch = await bcrypt.compare(passwordInput, user.password);
        if (!isMatch) {
            throw new UnauthorizedException('Kata sandi yang dimasukkan tidak sesuai');
        }

        return { valid: true };
    }
}
