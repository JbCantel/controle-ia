import { db } from './db';
import { ruleFromTransaction } from '../domain/recurrence';
import { todayISO } from '../domain/dates';
import { runDueRecurrences } from './recurrences';

export async function addTransaction(tx, { repeatMonthly = false, database = db, today = todayISO() } = {}) {
  const id = await database.transaction('rw', database.recurrences, database.transactions, async () => {
    if (!repeatMonthly) return database.transactions.add(tx);
    const recurrenceId = await database.recurrences.add(ruleFromTransaction(tx));
    return database.transactions.add({ ...tx, recurrenceId });
  });
  if (repeatMonthly) await runDueRecurrences({ database, today });
  return id;
}

export async function updateTransaction(id, changes, { database = db } = {}) {
  await database.transactions.update(id, changes);
}

export async function deleteTransaction(id, { database = db } = {}) {
  await database.transactions.delete(id);
}
