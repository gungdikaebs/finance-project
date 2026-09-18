import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { PaymentMethodsModule } from './payment-methods/payment-methods.module';
import { CategoriesModule } from './categories/categories.module';
import { TransactionsModule } from './transactions/transactions.module';
import { ReportsModule } from './reports/reports.module';
import { FinanceProfileModule } from './finance-profile/finance-profile.module';
import { IncomeSourcesModule } from './income-sources/income-sources.module';
import { BudgetPoliciesModule } from './budget-policies/budget-policies.module';
import { SavingsGoalsModule } from './savings-goals/savings-goals.module';
import { AllocationsModule } from './allocations/allocations.module';
import { SimulationsModule } from './simulations/simulations.module';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { validateEnvironment } from './config/env.validation';
import { RecurringTransactionsModule } from './recurring-transactions/recurring-transactions.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnvironment,
    }),
    ScheduleModule.forRoot(),
    AuthModule,
    PrismaModule,
    UsersModule,
    PaymentMethodsModule,
    CategoriesModule,
    TransactionsModule,
    ReportsModule,
    FinanceProfileModule,
    IncomeSourcesModule,
    BudgetPoliciesModule,
    SavingsGoalsModule,
    AllocationsModule,
    SimulationsModule,
    RecurringTransactionsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
