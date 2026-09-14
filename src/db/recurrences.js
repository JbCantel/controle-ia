import { db } from './db';
import { dueOccurrences, resumeMarker } from '../domain/recurrence';
import { todayISO } from '../domain/dates';

// Lê regras e grava lançamentos na MESMA transação rw: chamadas simultâneas
// (ex.: StrictMode) enfileiram e a segunda já vê o marcador atualizado.
export async function runDueRecurrences({ database = db, today = todayISO() } = {}) {
  return database.transaction('rw', database.recurrences, database.transactions, async () => {
    const rules = await database.recurrences.toArray();
    const { transactions, updates } = dueOccurrences(rules, today);
    if (transactions.length) await database.transactions.bulkAdd(transactions);
    for (const u of updates) await database.recurrences.update(u.id, { lastGeneratedMonth: u.lastGeneratedMonth });
    return transactions.length;
  });
}

export async function updateRecurrence(id, changes, { database = db, today = todayISO() } = {}) {
  await database.recurrences.update(id, changes);
  await runDueRecurrences({ database, today });
}

export async function pauseRecurrence(id, { database = db } = {}) {
  await database.recurrences.update(id, { active: false });
}

export async function resumeRecurrence(id, { database = db, today = todayISO() } = {}) {
  await database.transaction('rw', database.recurrences, async () => {
    const rule = await database.recurrences.get(id);
    await database.recurrences.update(id, { active: true, lastGeneratedMonth: resumeMarker(rule.lastGeneratedMonth, today) });
  });
  await runDueRecurrences({ database, today });
}

export async function deleteRecurrence(id, { database = db } = {}) {
  await database.transaction('rw', database.recurrences, database.transactions, async () => {
    await database.transactions.where('recurrenceId').equals(id).modify((t) => { delete t.recurrenceId; });
    await database.recurrences.delete(id);
  });
}
