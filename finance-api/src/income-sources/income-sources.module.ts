import { Module } from '@nestjs/common';
import { IncomeSourcesController } from './income-sources.controller';
import { IncomeSourcesService } from './income-sources.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [IncomeSourcesController],
  providers: [IncomeSourcesService],
  exports: [IncomeSourcesService],
})
export class IncomeSourcesModule {}
