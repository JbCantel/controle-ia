import Dexie from 'dexie';
import { TABLES } from '../domain/tables';

export const DB_NAME = 'OrbeFinanceiro';

// Versão 2: idêntica ao banco recuperado do navegador. NUNCA remover nem alterar.
export const SCHEMA_V2 = {
  transactions: '++id, categoryId, date, type',
  categories: '++id, name, type',
  budgets: '++id, &[month+categoryId], categoryId, month',
  goals: '++id, name',
  contributions: '++id, date, goalId',
  habits: '++id, active, day, time',
  habitChecks: '++id, &[habitId+date], date, habitId',
};

// Versão 3: só acréscimos (recorrências). Sem upgrade: nenhum registro é reescrito.
export const SCHEMA_V3 = {
  transactions: '++id, categoryId, date, type, recurrenceId',
  recurrences: '++id',
};

export const ALL_TABLES = TABLES;

export function createDb(name = DB_NAME) {
  const database = new Dexie(name);
  database.version(2).stores(SCHEMA_V2);
  database.version(3).stores(SCHEMA_V3);
  return database;
}

export const db = createDb();
