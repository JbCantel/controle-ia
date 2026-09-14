import Dexie from 'dexie';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createDb, ALL_TABLES } from './db';
import { readAllTables, replaceAllTables, clearAllTables, startFresh } from './backupIO';
import { DEFAULT_CATEGORIES } from '../domain/categories';

let database;
beforeEach(async () => { database = createDb(`io-${crypto.randomUUID()}`); await database.open(); });
afterEach(async () => { database.close(); await Dexie.delete(database.name); });

const empty = () => Object.fromEntries(ALL_TABLES.map((n) => [n, []]));

describe('backupIO', () => {
  it('substitui tudo preservando ids', async () => {
    await database.categories.add({ name: 'Antiga', type: 'despesa', color: '#9aa5a1' });
    const tables = { ...empty(), categories: [{ id: 7, name: 'Freelance', type: 'receita', color: '#8cb8ff' }] };
    await replaceAllTables(tables, { database });
    expect(await readAllTables({ database })).toEqual(tables);
  });

  it('não altera nada se a gravação falhar no meio', async () => {
    await database.categories.add({ name: 'Mantida', type: 'despesa', color: '#9aa5a1' });
    const before = await readAllTables({ database });
    const dup = { id: 1, name: 'X', type: 'despesa', color: '#9aa5a1' };
    const broken = { ...empty(), goals: [{ id: 1, name: 'Meta', target: 10 }], categories: [dup, dup] };
    await expect(replaceAllTables(broken, { database })).rejects.toThrow();
    expect(await readAllTables({ database })).toEqual(before);
  });

  it('limpa todas as tabelas', async () => {
    await database.categories.add({ name: 'A', type: 'despesa', color: '#9aa5a1' });
    await database.habits.add({ day: 'seg', time: '07:00', endTime: '08:00', name: 'B', kind: 'pessoal', order: 0, active: true });
    await clearAllTables({ database });
    expect(await readAllTables({ database })).toEqual(empty());
  });

  it('começar do zero cria as categorias padrão só uma vez', async () => {
    await startFresh({ database });
    await startFresh({ database });
    const names = (await database.categories.toArray()).map((c) => c.name);
    expect(names).toEqual(DEFAULT_CATEGORIES.map((c) => c.name));
  });
});
