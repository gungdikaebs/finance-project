import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { ResponseInterceptor } from '../src/common/interceptors/response.interceptor';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';

describe('Alur keuangan utama (e2e)', () => {
  let app: INestApplication<App>;
  let temporaryDirectory: string;
  let tokenA: string;
  let tokenB: string;

  beforeAll(async () => {
    (BigInt.prototype as any).toJSON = function () {
      return this.toString();
    };
    temporaryDirectory = mkdtempSync(join(tmpdir(), 'finance-api-e2e-'));
    process.env.DATABASE_URL = `file:${join(temporaryDirectory, 'test.db')}`;
    process.env.JWT_SECRET = 'integration-test-secret-32-characters-minimum';

    execFileSync(
      process.execPath,
      [require.resolve('prisma/build/index.js'), 'migrate', 'deploy'],
      {
        cwd: join(__dirname, '..'),
        env: process.env,
        stdio: 'pipe',
      },
    );

    const { AppModule } = require('../src/app.module');
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.useGlobalInterceptors(new ResponseInterceptor());
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.init();

    for (const user of [
      { name: 'Pengguna A', email: 'a@example.com' },
      { name: 'Pengguna B', email: 'b@example.com' },
    ]) {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({ ...user, password: 'password-ku' })
        .expect(201);
    }

    tokenA = (
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'a@example.com', password: 'password-ku' })
        .expect(201)
    ).body.data.token;
    tokenB = (
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'b@example.com', password: 'password-ku' })
        .expect(201)
    ).body.data.token;
  });

  afterAll(async () => {
    if (app) await app.close();
    if (temporaryDirectory) {
      rmSync(temporaryDirectory, { recursive: true, force: true });
    }
  });

  it('menolak penggunaan sumber pemasukan milik pengguna lain', async () => {
    const sourceId = (
      await request(app.getHttpServer())
        .post('/income-sources')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ name: 'Freelance A' })
        .expect(201)
    ).body.data.id;

    await request(app.getHttpServer())
      .post('/budget-policies')
      .set('Authorization', `Bearer ${tokenB}`)
      .send({
        effectiveYear: 2026,
        effectiveMonth: 9,
        needsRatio: 5000,
        savingsRatio: 3000,
        wantsRatio: 2000,
        overrides: [
          {
            incomeSourceId: sourceId,
            needsRatio: 4000,
            savingsRatio: 4000,
            wantsRatio: 2000,
          },
        ],
      })
      .expect(400);

    const foreignGoalId = (
      await request(app.getHttpServer())
        .post('/savings-goals')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          name: 'Rumah A',
          type: 'PURCHASE',
          targetAmount: '100000000',
          mode: 'FULL',
        })
        .expect(201)
    ).body.data.id;

    await request(app.getHttpServer())
      .patch('/savings-goals/shares')
      .set('Authorization', `Bearer ${tokenB}`)
      .send({ shares: [{ goalId: foreignGoalId, shareRatio: 10000 }] })
      .expect(400);

    await request(app.getHttpServer())
      .put('/finance-profile')
      .set('Authorization', `Bearer ${tokenB}`)
      .send({ initialBalance: '100' })
      .expect(200);
    await request(app.getHttpServer())
      .post('/allocations/allocate')
      .set('Authorization', `Bearer ${tokenB}`)
      .send({ allocations: [{ targetGoalId: foreignGoalId, amount: '50' }] })
      .expect(404);
  });

  it('merekonsiliasi transaksi dari Dana tujuan sampai pembatalan', async () => {
    await request(app.getHttpServer())
      .put('/finance-profile')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ initialBalance: '1000', monthlyNeeds: '100' })
      .expect(200);

    const goals = (
      await request(app.getHttpServer())
        .get('/savings-goals')
        .set('Authorization', `Bearer ${tokenA}`)
        .expect(200)
    ).body.data;
    const emergencyGoal = goals.find((goal: any) => goal.type === 'EMERGENCY');

    await request(app.getHttpServer())
      .post('/allocations/allocate')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        allocations: [{ targetGoalId: emergencyGoal.id, amount: '1000' }],
      })
      .expect(201);

    const categoryId = (
      await request(app.getHttpServer())
        .post('/categories')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ name: 'Darurat', type: 'expense', group: 'NEED' })
        .expect(201)
    ).body.data.id;

    const transactionId = (
      await request(app.getHttpServer())
        .post('/transactions')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          amount: '400',
          categoryId,
          sourceGoalId: emergencyGoal.id,
          date: new Date().toISOString().slice(0, 10),
          note: 'Pengeluaran darurat',
        })
        .expect(201)
    ).body.data.id;

    await request(app.getHttpServer())
      .get(`/transactions/${transactionId}`)
      .set('Authorization', `Bearer ${tokenB}`)
      .expect(404);

    await request(app.getHttpServer())
      .patch(`/transactions/${transactionId}`)
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ amount: '600', reason: 'Koreksi struk' })
      .expect(200);

    const afterCorrection = await request(app.getHttpServer())
      .get(`/savings-goals/${emergencyGoal.id}`)
      .set('Authorization', `Bearer ${tokenA}`)
      .expect(200);
    expect(afterCorrection.body.data.currentBalance).toBe('400');

    await request(app.getHttpServer())
      .delete(`/transactions/${transactionId}`)
      .query({ reason: 'Batal membeli' })
      .set('Authorization', `Bearer ${tokenA}`)
      .expect(200);

    const afterCancellation = await request(app.getHttpServer())
      .get(`/savings-goals/${emergencyGoal.id}`)
      .set('Authorization', `Bearer ${tokenA}`)
      .expect(200);
    expect(afterCancellation.body.data.currentBalance).toBe('1000');
  });

  it('menghitung target dan KPR tanpa memutasi saldo', async () => {
    const before = await request(app.getHttpServer())
      .get('/reports/summary')
      .set('Authorization', `Bearer ${tokenA}`)
      .expect(200);

    const targetResult = await request(app.getHttpServer())
      .post('/simulations/goal')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        priceReference: '25000000',
        referenceDate: new Date().toISOString().slice(0, 10),
        annualPriceIncreaseRatio: 0,
        currentSavings: '1000000',
        mode: 'FULL',
        calculationMode: 'TARGET_DATE',
        monthlySavings: '500000',
      })
      .expect(201);
    expect(targetResult.body.data.targetMonths).toBe(48);

    const mortgageResult = await request(app.getHttpServer())
      .post('/simulations/mortgage')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        principal: '120000000',
        tenorMonths: 120,
        fixedRate: 0,
        fixedMonths: 120,
      })
      .expect(201);
    expect(mortgageResult.body.data.fixedInstallment).toBe('1000000');
    expect(mortgageResult.body.data.hasFloatingPhase).toBe(false);

    const after = await request(app.getHttpServer())
      .get('/reports/summary')
      .set('Authorization', `Bearer ${tokenA}`)
      .expect(200);
    expect(after.body.data).toEqual(before.body.data);
  });
});
