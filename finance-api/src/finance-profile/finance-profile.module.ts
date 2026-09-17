import { Module } from '@nestjs/common';
import { FinanceProfileController } from './finance-profile.controller';
import { FinanceProfileService } from './finance-profile.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [FinanceProfileController],
  providers: [FinanceProfileService],
  exports: [FinanceProfileService],
})
export class FinanceProfileModule {}
