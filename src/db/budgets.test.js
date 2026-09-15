import Dexie from 'dexie';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createDb } from './db';
import { setBudgetLimit } from './budgets';

let database;
let categoryId;

beforeEach(async () => {
  database = createDb(`orcamentos-${crypto.randomUUID()}`);
  await database.open();
  categoryId = await database.categories.add({ name: 'Casa', type: 'despesa', color: '#f5a65b' });
});

afterEach(async () => {
  database.close();
  await Dexie.delete(database.name);
});

const rowsForCategory = () => database.budgets.where('categoryId').equals(categoryId).sortBy('month');

describe('setBudgetLimit', () => {
  it('faz upsert e remove apenas linhas futuras herdaveis no escopo a partir do mes', async () => {
    await database.budgets.bulkAdd([
      { month: '2026-06', categoryId, limit: 400, onlyThisMonth: false },
      { month: '2026-09', categoryId, limit: 900, onlyThisMonth: false },
      { month: '2026-10', categoryId, limit: 300, onlyThisMonth: true },
      { month: '2026-11', categoryId, limit: 1_100, onlyThisMonth: false },
    ]);

    await setBudgetLimit({ month: '2026-09', categoryId, limit: 750, scope: 'from-month' }, { database });

    expect(await rowsForCategory()).toEqual([
      expect.objectContaining({ month: '2026-06', limit: 400, onlyThisMonth: false }),
      expect.objectContaining({ month: '2026-09', limit: 750, onlyThisMonth: false }),
      expect.objectContaining({ month: '2026-10', limit: 300, onlyThisMonth: true }),
    ]);
  });

  it('nao cria duplicata ao atualizar a mesma categoria e mes', async () => {
    await setBudgetLimit({ month: '2026-09', categoryId, limit: 500, scope: 'from-month' }, { database });
    await setBudgetLimit({ month: '2026-09', categoryId, limit: 650, scope: 'only-month' }, { database });

    expect(await database.budgets.count()).toBe(1);
    expect(await database.budgets.get({ month: '2026-09', categoryId })).toMatchObject({
      limit: 650,
      onlyThisMonth: true,
    });
  });

  it('preserva todos os outros meses no escopo so este mes', async () => {
    await database.budgets.bulkAdd([
      { month: '2026-08', categoryId, limit: 400, onlyThisMonth: false },
      { month: '2026-10', categoryId, limit: 800, onlyThisMonth: false },
    ]);

    await setBudgetLimit({ month: '2026-09', categoryId, limit: 525, scope: 'only-month' }, { database });

    expect((await rowsForCategory()).map(({ month, limit, onlyThisMonth }) => ({ month, limit, onlyThisMonth }))).toEqual([
      { month: '2026-08', limit: 400, onlyThisMonth: false },
      { month: '2026-09', limit: 525, onlyThisMonth: true },
      { month: '2026-10', limit: 800, onlyThisMonth: false },
    ]);
  });

  it('remove o limite a partir do mes gravando null e limpando regras futuras', async () => {
    await database.budgets.bulkAdd([
      { month: '2026-08', categoryId, limit: 400, onlyThisMonth: false },
      { month: '2026-10', categoryId, limit: 800, onlyThisMonth: false },
    ]);

    await setBudgetLimit({ month: '2026-09', categoryId, limit: null, scope: 'from-month' }, { database });

    expect(await rowsForCategory()).toEqual([
      expect.objectContaining({ month: '2026-08', limit: 400, onlyThisMonth: false }),
      expect.objectContaining({ month: '2026-09', limit: null, onlyThisMonth: false }),
    ]);
  });

  it('remove o limite somente no mes sem alterar a regra seguinte', async () => {
    await database.budgets.add({ month: '2026-10', categoryId, limit: 800, onlyThisMonth: false });

    await setBudgetLimit({ month: '2026-09', categoryId, limit: null, scope: 'only-month' }, { database });

    expect((await rowsForCategory()).map(({ month, limit, onlyThisMonth }) => ({ month, limit, onlyThisMonth }))).toEqual([
      { month: '2026-09', limit: null, onlyThisMonth: true },
      { month: '2026-10', limit: 800, onlyThisMonth: false },
    ]);
  });

  it('rejeita mes, categoria, limite e escopo invalidos sem gravar', async () => {
    await expect(setBudgetLimit({ month: '09/2026', categoryId, limit: 10, scope: 'from-month' }, { database }))
      .rejects.toMatchObject({ code: 'BUDGET_INVALID' });
    await expect(setBudgetLimit({ month: '2026-09', categoryId: 999, limit: 10, scope: 'from-month' }, { database }))
      .rejects.toMatchObject({ code: 'BUDGET_INVALID' });
    await expect(setBudgetLimit({ month: '2026-09', categoryId, limit: -1, scope: 'from-month' }, { database }))
      .rejects.toMatchObject({ code: 'BUDGET_INVALID' });
    await expect(setBudgetLimit({ month: '2026-09', categoryId, limit: 10, scope: 'forever' }, { database }))
      .rejects.toMatchObject({ code: 'BUDGET_INVALID' });
    expect(await database.budgets.count()).toBe(0);
  });
});
