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
import { WalletsService } from './wallets.service';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { UpdateWalletDto } from './dto/update-wallet.dto';
import { TransferWalletDto } from './dto/transfer-wallet.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('wallets')
@UseGuards(JwtAuthGuard)
export class WalletsController {
  constructor(private readonly walletsService: WalletsService) {}

  @Get()
  findAll(@Request() req) {
    return this.walletsService.findAll(req.user.sub ?? req.user.id);
  }

  @Post()
  create(@Request() req, @Body() dto: CreateWalletDto) {
    return this.walletsService.create(req.user.sub ?? req.user.id, dto);
  }

  @Get('transfers')
  getTransfers(@Request() req, @Query('limit') limit?: string) {
    const take = limit ? parseInt(limit, 10) : 20;
    return this.walletsService.getTransfers(req.user.sub ?? req.user.id, take);
  }

  @Post('transfer')
  transfer(@Request() req, @Body() dto: TransferWalletDto) {
    return this.walletsService.transfer(req.user.sub ?? req.user.id, dto);
  }

  @Get(':id')
  findOne(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.walletsService.findOne(req.user.sub ?? req.user.id, id);
  }

  @Patch(':id')
  update(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateWalletDto,
  ) {
    return this.walletsService.update(req.user.sub ?? req.user.id, id, dto);
  }

  @Delete(':id')
  archive(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.walletsService.archive(req.user.sub ?? req.user.id, id);
  }
}
