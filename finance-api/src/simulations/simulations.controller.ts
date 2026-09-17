import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SimulationsService } from './simulations.service';
import { SimulateGoalDto } from './dto/simulate-goal.dto';
import { SimulateMortgageDto } from './dto/simulate-mortgage.dto';

@UseGuards(JwtAuthGuard)
@Controller('simulations')
export class SimulationsController {
  constructor(private readonly service: SimulationsService) {}

  @Post('goal')
  simulateGoal(@Body() dto: SimulateGoalDto) {
    return this.service.simulateGoal(dto);
  }

  @Post('mortgage')
  simulateMortgage(@Body() dto: SimulateMortgageDto) {
    return this.service.simulateMortgage(dto);
  }
}
