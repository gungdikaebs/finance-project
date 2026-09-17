import {
  Controller,
  Get,
  Query,
  UseGuards,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ReportsService } from './reports.service';

@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportsController {
  constructor(private service: ReportsService) {}

  @Get('summary')
  getSummary(@Request() req) {
    return this.service.getSummary(req.user.sub);
  }

  @Get('monthly')
  getMonthly(
    @Request() req,
    @Query('month') month: string,
    @Query('year') year: string,
  ) {
    if (!month || !year) {
      throw new BadRequestException('month and year are required');
    }

    return this.service.getMonthly(
      req.user.sub,
      Number(month),
      Number(year),
    );
  }

  @Get('month-end-review')
  getMonthEndReview(
    @Request() req,
    @Query('month') month: string,
    @Query('year') year: string,
  ) {
    if (!month || !year) {
      throw new BadRequestException('month and year are required');
    }

    return this.service.getMonthEndReview(
      req.user.sub,
      Number(month),
      Number(year),
    );
  }
}
