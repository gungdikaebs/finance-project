import { AuthService } from './auth.service';

describe('AuthService', () => {
  it('tidak mengembalikan password hash setelah registrasi', async () => {
    const prisma = {
      user: {
        findUnique: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue({
          id: 1,
          name: 'Dika',
          email: 'dika@example.com',
          password: '$2b$10$hash',
          createdAt: new Date('2026-09-17T00:00:00.000Z'),
          updatedAt: new Date('2026-09-17T00:00:00.000Z'),
        }),
      },
    } as any;
    const service = new AuthService(prisma, {} as any);

    const result = await service.register({
      name: 'Dika',
      email: 'dika@example.com',
      password: 'password-ku',
    });

    expect(result).toEqual({
      id: 1,
      name: 'Dika',
      email: 'dika@example.com',
      createdAt: new Date('2026-09-17T00:00:00.000Z'),
      updatedAt: new Date('2026-09-17T00:00:00.000Z'),
    });
  });
});
