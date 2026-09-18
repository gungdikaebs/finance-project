import {
  Controller,
  Get,
  Query,
  UseGuards,
  Request,
  BadRequestException,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
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

  @Get('analytics')
  getAnalytics(
    @Request() req,
    @Query('month') month: string,
    @Query('year') year: string,
  ) {
    if (!month || !year) {
      throw new BadRequestException('month and year are required');
    }

    return this.service.getAnalytics(
      req.user.sub,
      Number(month),
      Number(year),
    );
  }

  @Get('export/csv')
  async exportCsv(
    @Request() req,
    @Query('month') month: string,
    @Query('year') year: string,
    @Res() res: Response,
  ) {
    if (!month || !year) {
      throw new BadRequestException('month and year are required');
    }

    const csv = await this.service.exportCsv(
      req.user.sub,
      Number(month),
      Number(year),
    );
    const filename = `Laporan_Keuangan_${year}_${String(month).padStart(2, '0')}.csv`;
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csv);
  }

  @Get('export/excel')
  async exportExcel(
    @Request() req,
    @Query('month') month: string,
    @Query('year') year: string,
    @Res() res: Response,
  ) {
    if (!month || !year) {
      throw new BadRequestException('month and year are required');
    }

    const buffer = await this.service.exportExcel(
      req.user.sub,
      Number(month),
      Number(year),
    );
    const filename = `Laporan_Keuangan_${year}_${String(month).padStart(2, '0')}.xlsx`;
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);
  }

  @Get('export/pdf')
  async exportPdf(
    @Request() req,
    @Query('month') month: string,
    @Query('year') year: string,
    @Res() res: Response,
  ) {
    if (!month || !year) {
      throw new BadRequestException('month and year are required');
    }

    const buffer = await this.service.exportPdf(
      req.user.sub,
      Number(month),
      Number(year),
    );
    const filename = `Laporan_Keuangan_${year}_${String(month).padStart(2, '0')}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);
  }
}
