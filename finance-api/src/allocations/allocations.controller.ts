import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AllocationsService } from './allocations.service';
import { AllocateDto } from './dto/allocate.dto';
import { ReleaseDto } from './dto/release.dto';
import { TransferDto } from './dto/transfer.dto';

@UseGuards(JwtAuthGuard)
@Controller('allocations')
export class AllocationsController {
  constructor(private service: AllocationsService) {}

  @Get('status')
  getStatus(@Request() req) {
    return this.service.getUnallocatedStatus(req.user.sub);
  }

  @Get('preview-save')
  getPreviewSave(@Request() req, @Query('amount') amount?: string) {
    return this.service.getPreviewSave(req.user.sub, amount);
  }

  @Post('allocate')
  allocate(@Request() req, @Body() dto: AllocateDto) {
    return this.service.allocate(req.user.sub, dto);
  }

  @Post('release')
  release(@Request() req, @Body() dto: ReleaseDto) {
    return this.service.release(req.user.sub, dto);
  }

  @Post('transfer')
  transfer(@Request() req, @Body() dto: TransferDto) {
    return this.service.transfer(req.user.sub, dto);
  }

  @Get('history')
  getHistory(@Request() req, @Query('limit') limit?: string) {
    return this.service.getHistory(
      req.user.sub,
      limit ? parseInt(limit, 10) : 50,
    );
  }
}
