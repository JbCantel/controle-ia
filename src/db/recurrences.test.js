import Dexie from 'dexie';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createDb } from './db';
import { runDueRecurrences, resumeRecurrence, pauseRecurrence, deleteRecurrence } from './recurrences';
import { addTransaction, deleteTransaction } from './transactions';

let database;
beforeEach(async () => { database = createDb(`rec-${crypto.randomUUID()}`); await database.open(); });
afterEach(async () => { database.close(); await Dexie.delete(database.name); });

const tx = { type: 'despesa', value: 45.9, date: '2026-07-10', categoryId: 3, description: 'Academia' };
const dates = async () => (await database.transactions.orderBy('date').toArray()).map((t) => t.date);

describe('recorrências no banco', () => {
  it('criar com repetição gera os meses seguintes até hoje', async () => {
    await addTransaction(tx, { repeatMonthly: true, database, today: '2026-09-14' });
    expect(await dates()).toEqual(['2026-07-10', '2026-08-10', '2026-09-10']);
    const all = await database.transactions.toArray();
    expect(new Set(all.map((t) => t.recurrenceId)).size).toBe(1);
  });

  it('execuções simultâneas não duplicam', async () => {
    await addTransaction(tx, { repeatMonthly: true, database, today: '2026-07-10' });
    await Promise.all([
      runDueRecurrences({ database, today: '2026-09-14' }),
      runDueRecurrences({ database, today: '2026-09-14' }),
    ]);
    expect(await dates()).toEqual(['2026-07-10', '2026-08-10', '2026-09-10']);
  });

  it('lançamento gerado e apagado não volta', async () => {
    await addTransaction(tx, { repeatMonthly: true, database, today: '2026-08-14' });
    const august = await database.transactions.where('date').equals('2026-08-10').first();
    await deleteTransaction(august.id, { database });
    await runDueRecurrences({ database, today: '2026-08-20' });
    expect(await dates()).toEqual(['2026-07-10']);
  });

  it('retomar não preenche meses pausados', async () => {
    await addTransaction(tx, { repeatMonthly: true, database, today: '2026-07-10' });
    const rule = await database.recurrences.toCollection().first();
    await pauseRecurrence(rule.id, { database });
    await runDueRecurrences({ database, today: '2026-09-14' });
    expect(await dates()).toEqual(['2026-07-10']);
    await resumeRecurrence(rule.id, { database, today: '2026-09-14' });
    expect(await dates()).toEqual(['2026-07-10', '2026-09-10']);
  });

  it('excluir a regra mantém lançamentos e limpa recurrenceId', async () => {
    await addTransaction(tx, { repeatMonthly: true, database, today: '2026-08-14' });
    const rule = await database.recurrences.toCollection().first();
    await deleteRecurrence(rule.id, { database });
    expect(await database.recurrences.count()).toBe(0);
    const all = await database.transactions.toArray();
    expect(all).toHaveLength(2);
    expect(all.every((t) => !('recurrenceId' in t))).toBe(true);
  });

  it('criar sem repetição não cria regra', async () => {
    await addTransaction(tx, { database, today: '2026-09-14' });
    expect(await database.recurrences.count()).toBe(0);
    expect(await dates()).toEqual(['2026-07-10']);
  });
});
