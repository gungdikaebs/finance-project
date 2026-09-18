import { Controller, Get, Put, Patch, Body, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FinanceProfileService } from './finance-profile.service';
import { UpdateFinanceProfileDto } from './dto/update-finance-profile.dto';
import { UpdateOnboardingDto } from './dto/update-onboarding.dto';

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

  @Patch('onboarding')
  updateOnboarding(@Request() req, @Body() dto: UpdateOnboardingDto) {
    return this.service.updateOnboarding(req.user.sub, dto);
  }
}
