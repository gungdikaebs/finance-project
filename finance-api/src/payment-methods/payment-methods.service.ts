import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PaymentMethodsService {
    constructor(private prisma: PrismaService) { }

    async create(userId: number, name: string) {
        return this.prisma.paymentMethod.create({
            data: {
                name,
                userId,
            },
        });
    }

    async findAll(userId: number) {
        return this.prisma.paymentMethod.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
    }
    async delete(userId: number, paymentMethodId: number) {

        const paymentMethod = await this.prisma.paymentMethod.findFirst({
            where: {
                id: paymentMethodId,
                userId,
            },
        });

        if (!paymentMethod) {
            throw new NotFoundException('Payment method not found');
        }

        const used = await this.prisma.transaction.count({
            where: {
                paymentMethodId,
                userId,
            },
        });

        if (used > 0) {
            throw new BadRequestException(
                'Payment method is used in transactions',
            );
        }

        return this.prisma.paymentMethod.delete({
            where: {
                id: paymentMethodId,
            },
        });
    }
}
