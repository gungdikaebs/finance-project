import { Module } from '@nestjs/common';
import { AllocationsService } from './allocations.service';
import { AllocationsController } from './allocations.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { SavingsGoalsModule } from '../savings-goals/savings-goals.module';

@Module({
  imports: [PrismaModule, SavingsGoalsModule],
  controllers: [AllocationsController],
  providers: [AllocationsService],
  exports: [AllocationsService],
})
export class AllocationsModule {}
