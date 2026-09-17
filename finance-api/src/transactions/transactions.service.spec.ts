import { TransactionsService } from './transactions.service';

describe('TransactionsService', () => {
  const makeHarness = () => {
    const transaction: any = {
      id: 7,
      userId: 1,
      amount: BigInt(400),
      date: new Date('2026-09-10T00:00:00.000Z'),
      note: 'Belanja target',
      categoryId: 3,
      category: { id: 3, type: 'expense', group: 'WANT' },
      typeSnapshot: 'EXPENSE',
      groupSnapshot: 'WANT',
      status: 'ACTIVE',
      incomeSourceId: null,
      paymentMethodId: null,
      sourceGoalId: 5,
      allocatedNeeds: null,
      allocatedSavings: null,
      allocatedWants: null,
    };
    const events: any[] = [
      {
        type: 'ALLOCATE',
        targetGoalId: 5,
        sourceGoalId: null,
        amount: BigInt(1000),
      },
      {
        type: 'SPEND',
        targetGoalId: null,
        sourceGoalId: 5,
        amount: BigInt(400),
      },
    ];
    const aggregateAllocation = jest.fn(async ({ where }: any) => ({
      _sum: {
        amount: events
          .filter((event) =>
            where.targetGoalId !== undefined
              ? event.targetGoalId === where.targetGoalId
              : event.sourceGoalId === where.sourceGoalId,
          )
          .reduce((sum, event) => sum + event.amount, BigInt(0)),
      },
    }));
    const txClient: any = {
      transactionRevision: { create: jest.fn().mockResolvedValue({}) },
      transaction: {
        update: jest.fn(async ({ data }: any) =>
          Object.assign(transaction, data),
        ),
      },
      allocationEvent: {
        aggregate: aggregateAllocation,
        create: jest.fn(async ({ data }: any) => {
          events.push(data);
          return data;
        }),
      },
    };
    const prisma: any = {
      transaction: {
        findFirst: jest.fn().mockImplementation(async () => transaction),
      },
      allocationEvent: {
        aggregate: aggregateAllocation,
      },
      $transaction: jest.fn(async (callback: any) => callback(txClient)),
    };
    const service = new TransactionsService(prisma, {} as any);
    const goalBalance = () =>
      events.reduce(
        (balance, event) =>
          balance +
          (event.targetGoalId === 5 ? event.amount : BigInt(0)) -
          (event.sourceGoalId === 5 ? event.amount : BigInt(0)),
        BigInt(0),
      );

    return { service, events, goalBalance };
  };

  it('merekonsiliasi Dana tujuan ketika nominal transaksi dikoreksi', async () => {
    const { service, events, goalBalance } = makeHarness();

    await service.update(1, 7, { amount: '600', reason: 'Koreksi struk' });

    expect(goalBalance()).toBe(BigInt(400));
    expect(events.slice(-2).map((event) => event.type)).toEqual([
      'REVERSAL',
      'SPEND',
    ]);
  });

  it('mengembalikan Dana tujuan dengan event REVERSAL ketika transaksi dibatalkan', async () => {
    const { service, events, goalBalance } = makeHarness();

    await service.cancel(1, 7, 'Batal membeli');

    expect(goalBalance()).toBe(BigInt(1000));
    expect(events.at(-1)?.type).toBe('REVERSAL');
  });
});
