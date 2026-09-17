import { Controller, Post, Get, Body, UseGuards, Request, Delete, Param, ParseIntPipe } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PaymentMethodsService } from './payment-methods.service';
import { CreatePaymentMethodDto } from './dto/create-payment-method.dto';

@UseGuards(JwtAuthGuard)
@Controller('payment-methods')
export class PaymentMethodsController {
    constructor(private service: PaymentMethodsService) { }

    @Post()
    create(@Request() req, @Body() dto: CreatePaymentMethodDto) {
        const userId = req.user.sub;
        return this.service.create(userId, dto.name);
    }

    @Get()
    findAll(@Request() req) {
        const userId = req.user.sub;
        return this.service.findAll(userId);
    }
    @Delete(':id')
    delete(
        @Request() req,
        @Param('id', ParseIntPipe) id: number,
    ) {
        return this.service.delete(req.user.sub, id);
    }
}
