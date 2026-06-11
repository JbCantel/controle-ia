import Dexie from 'dexie';

export const db = new Dexie('controle-pessoal');

db.version(1).stores({
  transactions: '++id, type, date, categoryId',
  categories: '++id, type',
  budgets: '++id, &categoryId',
  goals: '++id',
  contributions: '++id, goalId, date',
  habits: '++id',
  habitLogs: '++id, habitId, date, [habitId+date]',
  settings: 'key',
});

export const ALL_TABLES = [
  'transactions', 'categories', 'budgets', 'goals',
  'contributions', 'habits', 'habitLogs', 'settings',
];
