import Dexie from 'dexie';
import { describe, it, expect } from 'vitest';
import { createDb, SCHEMA_V2, ALL_TABLES } from './db';

// Dados fictícios no mesmo formato do banco real recuperado.
const FIXTURE = {
  transactions: [
    { type: 'receita', value: 4100, date: '2026-05-05', categoryId: 6, description: 'Pagamento', id: 1 },
    { type: 'despesa', value: 212.37, date: '2026-05-08', categoryId: 2, description: 'Feira', id: 2 },
  ],
  categories: [
    { name: 'Alimentação', type: 'despesa', color: '#f5a65b', id: 2 },
    { name: 'Salário', type: 'receita', color: '#65d39b', id: 6 },
  ],
  budgets: [{ month: '2026-05', categoryId: 2, limit: 900, id: 1 }],
  goals: [{ name: 'Viagem', target: 8000, deadline: '2027-12-01', id: 1 }],
  contributions: [{ goalId: 1, value: 500, date: '2026-05-10', id: 1 }],
  habits: [
    { day: 'seg', time: '07:00', endTime: '07:30', name: 'Caminhada', kind: 'saude', order: 0, active: true, id: 1 },
    { day: 'seg', time: '23:00', endTime: '07:00', name: 'Sono', kind: 'sono', order: 1, active: true, id: 2 },
  ],
  habitChecks: [{ habitId: 1, date: '2026-05-04', id: 1 }],
};

async function createV2Database(name) {
  const old = new Dexie(name);
  old.version(2).stores(SCHEMA_V2);
  await old.open();
  for (const [table, rows] of Object.entries(FIXTURE)) await old.table(table).bulkAdd(rows);
  old.close();
}

describe('migração OrbeFinanceiro v2 -> v3', () => {
  it('preserva todas as linhas e acrescenta recurrences e o índice recurrenceId', async () => {
    const name = `migracao-${crypto.randomUUID()}`;
    await createV2Database(name);

    const db = createDb(name);
    await db.open();

    expect(db.verno).toBe(3);
    for (const [table, rows] of Object.entries(FIXTURE)) {
      expect(await db.table(table).toArray()).toEqual(rows);
    }
    const native = db.backendDB();
    expect(Array.from(native.objectStoreNames).sort()).toEqual([...ALL_TABLES].sort());
    const indexNames = Array.from(native.transaction('transactions').objectStore('transactions').indexNames);
    expect(indexNames).toContain('recurrenceId');

    await db.transactions.add({ type: 'despesa', value: 50, date: '2026-06-01', categoryId: 2, description: 'Streaming', recurrenceId: 9 });
    expect(await db.transactions.where('recurrenceId').equals(9).count()).toBe(1);
    db.close();
    await Dexie.delete(name);
  });

  it('cria banco novo direto na v3', async () => {
    const name = `novo-${crypto.randomUUID()}`;
    const db = createDb(name);
    await db.open();
    expect(db.tables.map((t) => t.name).sort()).toEqual([...ALL_TABLES].sort());
    db.close();
    await Dexie.delete(name);
  });
});
