import { ValidationPipe, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import request from 'supertest';
import { App } from 'supertest/types';
import { ResponseInterceptor } from '../src/common/interceptors/response.interceptor';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';

describe('Pendaftaran pada database SQLite baru', () => {
  let app: INestApplication<App>;
  let temporaryDirectory: string;

  beforeAll(async () => {
    (BigInt.prototype as any).toJSON = function () {
      return this.toString();
    };
    temporaryDirectory = mkdtempSync(join(tmpdir(), 'finance-api-registration-'));
    const databasePath = join(temporaryDirectory, 'test.db');
    writeFileSync(databasePath, '');
    process.env.DATABASE_URL = `file:${databasePath}`;
    process.env.JWT_SECRET = 'integration-test-secret-32-characters-minimum';

    execFileSync(
      process.execPath,
      [require.resolve('prisma/build/index.js'), 'migrate', 'deploy'],
      { cwd: join(__dirname, '..'), env: process.env, stdio: 'pipe' },
    );

    const { AppModule } = require('../src/app.module');
    const moduleFixture = await Test.createTestingModule({
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
  });

  afterAll(async () => {
    if (app) await app.close();
    if (temporaryDirectory) rmSync(temporaryDirectory, { recursive: true, force: true });
  });

  it('mendaftarkan pengguna dan menyediakan profil serta dompet awal', async () => {
    const credentials = {
      name: 'Pengguna Baru',
      email: 'baru@example.test',
      password: 'KataSandi123!',
    };

    await request(app.getHttpServer())
      .post('/auth/register')
      .send(credentials)
      .expect(201);

    const login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: credentials.email, password: credentials.password })
      .expect(201);
    const token = login.body.data.token;

    await request(app.getHttpServer())
      .get('/finance-profile')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    await request(app.getHttpServer())
      .get('/wallets')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
  });
});
