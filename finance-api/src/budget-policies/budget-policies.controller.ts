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
import { BudgetPoliciesService } from './budget-policies.service';
import { CreateBudgetPolicyDto } from './dto/create-budget-policy.dto';

@UseGuards(JwtAuthGuard)
@Controller('budget-policies')
export class BudgetPoliciesController {
  constructor(private service: BudgetPoliciesService) {}

  @Get('active')
  getActive(
    @Request() req,
    @Query('year') year?: string,
    @Query('month') month?: string,
  ) {
    const now = new Date();
    const y = year ? parseInt(year, 10) : now.getFullYear();
    const m = month ? parseInt(month, 10) : now.getMonth() + 1;
    return this.service.getActivePolicy(req.user.sub, y, m);
  }

  @Post()
  upsert(@Request() req, @Body() dto: CreateBudgetPolicyDto) {
    return this.service.upsertPolicy(req.user.sub, dto);
  }

  @Get('history')
  getHistory(@Request() req) {
    return this.service.getHistory(req.user.sub);
  }
}
