import { validateEnvironment } from './env.validation';

describe('validateEnvironment', () => {
  it('menolak JWT_SECRET yang tidak tersedia', () => {
    expect(() =>
      validateEnvironment({ DATABASE_URL: 'file:./test.db' }),
    ).toThrow('JWT_SECRET wajib diisi');
  });

  it('menolak JWT_SECRET yang terlalu pendek', () => {
    expect(() =>
      validateEnvironment({
        DATABASE_URL: 'file:./test.db',
        JWT_SECRET: 'terlalu-pendek',
      }),
    ).toThrow('minimal 32 karakter');
  });

  it('mengembalikan konfigurasi yang valid', () => {
    const config = validateEnvironment({
      DATABASE_URL: 'file:./test.db',
      JWT_SECRET: '0123456789abcdef0123456789abcdef',
    });

    expect(config.JWT_SECRET).toHaveLength(32);
  });
});
