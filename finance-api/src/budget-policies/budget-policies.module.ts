import { Module } from '@nestjs/common';
import { BudgetPoliciesController } from './budget-policies.controller';
import { BudgetPoliciesService } from './budget-policies.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [BudgetPoliciesController],
  providers: [BudgetPoliciesService],
  exports: [BudgetPoliciesService],
})
export class BudgetPoliciesModule {}
