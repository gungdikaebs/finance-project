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
import { IncomeSourcesService } from './income-sources.service';
import { CreateIncomeSourceDto } from './dto/create-income-source.dto';
import { UpdateIncomeSourceDto } from './dto/update-income-source.dto';

@UseGuards(JwtAuthGuard)
@Controller('income-sources')
export class IncomeSourcesController {
  constructor(private service: IncomeSourcesService) {}

  @Get()
  findAll(@Request() req, @Query('includeArchived') includeArchived?: string) {
    return this.service.findAll(req.user.sub, includeArchived === 'true');
  }

  @Post()
  create(@Request() req, @Body() dto: CreateIncomeSourceDto) {
    return this.service.create(req.user.sub, dto);
  }

  @Patch(':id')
  update(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateIncomeSourceDto,
  ) {
    return this.service.update(req.user.sub, id, dto);
  }

  @Patch(':id/archive')
  archive(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.service.archive(req.user.sub, id);
  }
}
