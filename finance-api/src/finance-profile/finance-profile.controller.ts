import { Controller, Get, Put, Body, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FinanceProfileService } from './finance-profile.service';
import { UpdateFinanceProfileDto } from './dto/update-finance-profile.dto';

@UseGuards(JwtAuthGuard)
@Controller('finance-profile')
export class FinanceProfileController {
  constructor(private service: FinanceProfileService) {}

  @Get()
  getProfile(@Request() req) {
    return this.service.getProfile(req.user.sub);
  }

  @Put()
  updateProfile(@Request() req, @Body() dto: UpdateFinanceProfileDto) {
    return this.service.upsertProfile(req.user.sub, dto);
  }
}
