import Dexie from 'dexie';
import { seedDatabase } from './seed';

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

db.version(2).stores({
  habitLogs: '++id, habitId, date, &[habitId+date]',
});

export const ALL_TABLES = [
  'transactions', 'categories', 'budgets', 'goals',
  'contributions', 'habits', 'habitLogs', 'settings',
];

db.on('populate', (tx) => seedDatabase(tx));
