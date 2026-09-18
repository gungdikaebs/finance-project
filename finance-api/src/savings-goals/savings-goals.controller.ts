import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SavingsGoalsService } from './savings-goals.service';
import { CreateSavingsGoalDto } from './dto/create-savings-goal.dto';
import { UpdateSavingsGoalDto } from './dto/update-savings-goal.dto';
import { UpdateGoalSharesDto } from './dto/update-goal-shares.dto';

@UseGuards(JwtAuthGuard)
@Controller('savings-goals')
export class SavingsGoalsController {
  constructor(private service: SavingsGoalsService) {}

  @Get()
  findAll(@Request() req, @Query('includeArchived') includeArchived?: string) {
    return this.service.findAll(req.user.sub, includeArchived === 'true');
  }

  @Post()
  create(@Request() req, @Body() dto: CreateSavingsGoalDto) {
    return this.service.create(req.user.sub, dto);
  }

  @Patch('shares')
  updateShares(@Request() req, @Body() dto: UpdateGoalSharesDto) {
    return this.service.updateShares(req.user.sub, dto);
  }

  @Get('forecast')
  getForecasts(@Request() req) {
    return this.service.getForecasts(req.user.sub);
  }

  @Get(':id/forecast')
  getGoalForecast(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.service.getForecasts(req.user.sub, id);
  }

  @Get(':id')
  findOne(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(req.user.sub, id);
  }

  @Patch(':id')
  update(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSavingsGoalDto,
  ) {
    return this.service.update(req.user.sub, id, dto);
  }

  @Patch(':id/archive')
  archive(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.service.archive(req.user.sub, id);
  }
}
