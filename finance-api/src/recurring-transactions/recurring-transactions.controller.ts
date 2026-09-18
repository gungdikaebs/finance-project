import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RecurringTransactionsService } from './recurring-transactions.service';
import { CreateRecurringTransactionDto } from './dto/create-recurring-transaction.dto';
import { UpdateRecurringTransactionDto } from './dto/update-recurring-transaction.dto';

@UseGuards(JwtAuthGuard)
@Controller('recurring-transactions')
export class RecurringTransactionsController {
  constructor(private service: RecurringTransactionsService) {}

  @Post()
  create(@Request() req, @Body() dto: CreateRecurringTransactionDto) {
    return this.service.create(req.user.sub, dto);
  }

  @Get()
  findAll(@Request() req) {
    return this.service.findAll(req.user.sub);
  }

  @Get('upcoming')
  getUpcoming(@Request() req, @Query('days') days?: string) {
    const numDays = days ? parseInt(days, 10) : 7;
    return this.service.getUpcoming(req.user.sub, isNaN(numDays) ? 7 : numDays);
  }

  @Get(':id')
  findOne(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(req.user.sub, id);
  }

  @Post(':id/execute')
  execute(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.service.execute(req.user.sub, id);
  }

  @Patch(':id')
  update(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateRecurringTransactionDto,
  ) {
    return this.service.update(req.user.sub, id, dto);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.service.remove(req.user.sub, id);
  }
}
