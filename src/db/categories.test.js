import Dexie from 'dexie';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createDb } from './db';
import { addCategory, categoryUsageOf, deleteCategory, updateCategory } from './categories';

let database;

beforeEach(async () => {
  database = createDb(`categorias-${crypto.randomUUID()}`);
  await database.open();
});

afterEach(async () => {
  database.close();
  await Dexie.delete(database.name);
});

const food = { name: 'Alimentação', type: 'despesa', color: '#f5a65b' };

describe('categories db', () => {
  it('cria categoria e revalida duplicidade normalizada', async () => {
    const id = await addCategory(food, { database });
    expect(await database.categories.get(id)).toEqual({ id, ...food });

    await expect(addCategory({ ...food, name: ' ALIMENTACAO ' }, { database }))
      .rejects.toMatchObject({ code: 'CATEGORY_INVALID', details: { name: 'Já existe uma categoria de despesa com este nome.' } });
    expect(await database.categories.count()).toBe(1);
  });

  it('conta usos nas três tabelas dependentes', async () => {
    const id = await addCategory(food, { database });
    await database.transactions.bulkAdd([
      { type: 'despesa', value: 20, date: '2026-09-01', categoryId: id, description: 'Feira' },
      { type: 'despesa', value: 10, date: '2026-09-02', categoryId: id, description: 'Padaria' },
    ]);
    await database.budgets.add({ month: '2026-09', categoryId: id, limit: 500 });
    await database.recurrences.add({ type: 'despesa', value: 10, categoryId: id, description: 'Assinatura', dayOfMonth: 2, startMonth: '2026-09', lastGeneratedMonth: '2026-09', active: true });

    expect(await categoryUsageOf(id, { database })).toEqual({ transactions: 2, budgets: 1, recurrences: 1, total: 4 });
  });

  it('permite editar nome e cor, mas bloqueia trocar o tipo em uso', async () => {
    const id = await addCategory(food, { database });
    await database.transactions.add({ type: 'despesa', value: 20, date: '2026-09-01', categoryId: id, description: 'Feira' });

    await updateCategory(id, { ...food, name: 'Mercado', color: '#55c995' }, { database });
    await expect(updateCategory(id, { name: 'Mercado', type: 'receita', color: '#55c995' }, { database }))
      .rejects.toMatchObject({ code: 'CATEGORY_TYPE_IN_USE', details: { total: 1 } });
    expect(await database.categories.get(id)).toMatchObject({ name: 'Mercado', type: 'despesa', color: '#55c995' });
  });

  it('permite trocar o tipo quando a categoria não está em uso', async () => {
    const id = await addCategory(food, { database });
    await updateCategory(id, { ...food, type: 'receita' }, { database });
    expect((await database.categories.get(id)).type).toBe('receita');
  });

  it('exclui categoria livre e bloqueia exclusão com usos sem alterar dados', async () => {
    const freeId = await addCategory(food, { database });
    await deleteCategory(freeId, { database });
    expect(await database.categories.get(freeId)).toBeUndefined();

    const usedId = await addCategory({ ...food, name: 'Moradia' }, { database });
    await database.budgets.add({ month: '2026-09', categoryId: usedId, limit: 1200 });
    await expect(deleteCategory(usedId, { database }))
      .rejects.toMatchObject({ code: 'CATEGORY_IN_USE', details: { budgets: 1, total: 1 } });
    expect(await database.categories.get(usedId)).toBeDefined();
    expect(await database.budgets.count()).toBe(1);
  });
});
