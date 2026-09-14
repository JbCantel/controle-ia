import { db, ALL_TABLES } from './db';
import { buildBackup, backupFileName } from '../domain/backup';
import { DEFAULT_CATEGORIES } from '../domain/categories';
import { todayISO } from '../domain/dates';

export async function readAllTables({ database = db } = {}) {
  const tables = {};
  for (const name of ALL_TABLES) tables[name] = await database.table(name).toArray();
  return tables;
}

// Transação única: se qualquer gravação falhar, nada muda.
export async function replaceAllTables(tables, { database = db } = {}) {
  await database.transaction('rw', ALL_TABLES, async () => {
    for (const name of ALL_TABLES) {
      await database.table(name).clear();
      if (tables[name].length) await database.table(name).bulkAdd(tables[name]);
    }
  });
}

export async function clearAllTables({ database = db } = {}) {
  await database.transaction('rw', ALL_TABLES, async () => {
    for (const name of ALL_TABLES) await database.table(name).clear();
  });
}

export async function startFresh({ database = db } = {}) {
  await database.transaction('rw', database.categories, async () => {
    if ((await database.categories.count()) === 0) await database.categories.bulkAdd(DEFAULT_CATEGORIES);
  });
}

export async function downloadBackup() {
  const data = buildBackup(await readAllTables());
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = backupFileName(todayISO());
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
