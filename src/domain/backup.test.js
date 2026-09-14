import { describe, it, expect } from 'vitest';
import { buildBackup, backupFileName, parseBackup, summarizeTables } from './backup';
import { TABLES } from './tables';

const tables = {
  transactions: [{ id: 1, type: 'despesa', value: 12.5, date: '2026-05-02', categoryId: 1, description: 'Café' }],
  categories: [{ id: 1, name: 'Alimentação', type: 'despesa', color: '#f5a65b' }],
  budgets: [{ id: 1, month: '2026-05', categoryId: 1, limit: 300 }],
  goals: [{ id: 1, name: 'Reserva', target: 1000 }],
  contributions: [{ id: 1, goalId: 1, value: -50, date: '2026-05-03' }],
  habits: [{ id: 1, day: 'ter', time: '06:00', endTime: '06:30', name: 'Alongar', kind: 'saude', order: 0, active: true }],
  habitChecks: [{ id: 1, habitId: 1, date: '2026-05-05' }],
  recurrences: [{ id: 1, type: 'despesa', value: 30, categoryId: 1, description: 'App', dayOfMonth: 31, startMonth: '2026-01', lastGeneratedMonth: '2026-05', active: false }],
};

describe('backup', () => {
  it('monta o JSON no formato 1', () => {
    const data = buildBackup(tables, new Date('2026-09-14T12:00:00Z'));
    expect(data).toMatchObject({ app: 'ORBE', format: 1, dbVersion: 3, exportedAt: '2026-09-14T12:00:00.000Z' });
    expect(Object.keys(data.tables)).toEqual(TABLES);
  });

  it('nomeia o arquivo com a data', () => {
    expect(backupFileName('2026-09-14')).toBe('orbe-backup-2026-09-14.json');
  });

  it('aceita o próprio formato (string JSON)', () => {
    const result = parseBackup(JSON.stringify(buildBackup(tables)));
    expect(result.ok).toBe(true);
    expect(result.tables).toEqual(tables);
  });

  it('aceita o formato recuperado e completa tabelas opcionais', () => {
    const recovered = { app: 'ORBE', tabelas: {} };
    for (const name of TABLES) {
      if (name === 'recurrences' || name === 'habitChecks') continue;
      recovered.tabelas[name] = { indices: [], linhas: tables[name] };
    }
    const result = parseBackup(recovered);
    expect(result.ok).toBe(true);
    expect(result.tables.recurrences).toEqual([]);
    expect(result.tables.habitChecks).toEqual([]);
    expect(result.tables.habits).toEqual(tables.habits);
  });

  it('recusa JSON inválido e arquivos de outro app', () => {
    expect(parseBackup('{oops')).toEqual({ ok: false, error: 'O arquivo não é um JSON válido.' });
    expect(parseBackup({ app: 'Outro', tables })).toEqual({ ok: false, error: 'Este arquivo não é um backup do ORBE.' });
  });

  it('recusa tabela obrigatória ausente', () => {
    const { goals, ...rest } = tables;
    expect(parseBackup({ app: 'ORBE', format: 1, tables: rest }))
      .toEqual({ ok: false, error: 'Tabela "goals" ausente ou inválida.' });
  });

  it('aponta tabela, linha e campo inválidos', () => {
    const bad = { ...tables, transactions: [tables.transactions[0], { ...tables.transactions[0], id: 2, date: '14/09/2026' }] };
    expect(parseBackup({ app: 'ORBE', format: 1, tables: bad }))
      .toEqual({ ok: false, error: 'Tabela "transactions", linha 2: campo "date" inválido.' });
  });

  it('resume a quantidade de registros', () => {
    expect(summarizeTables(tables)).toBe('1 transações, 1 categorias, 1 orçamentos, 1 metas, 1 aportes, 1 blocos de rotina');
  });
});
