import { describe, expect, it } from 'vitest';
import { budgetStatus, budgetSummary, effectiveLimit } from './budget';

const categoryId = 7;

describe('effectiveLimit', () => {
  it('prefere a linha do proprio mes', () => {
    const budgets = [
      { month: '2026-06', categoryId, limit: 500, onlyThisMonth: false },
      { month: '2026-09', categoryId, limit: 650, onlyThisMonth: true },
    ];
    expect(effectiveLimit(budgets, categoryId, '2026-09')).toBe(650);
  });

  it('herda a linha anterior mais recente que nao seja mensal', () => {
    const budgets = [
      { month: '2026-04', categoryId, limit: 400, onlyThisMonth: false },
      { month: '2026-06', categoryId, limit: 600, onlyThisMonth: false },
    ];
    expect(effectiveLimit(budgets, categoryId, '2026-09')).toBe(600);
  });

  it('ignora linhas anteriores marcadas como so este mes', () => {
    const budgets = [
      { month: '2026-06', categoryId, limit: 500, onlyThisMonth: false },
      { month: '2026-08', categoryId, limit: 800, onlyThisMonth: true },
    ];
    expect(effectiveLimit(budgets, categoryId, '2026-09')).toBe(500);
  });

  it('trata null no proprio mes como remocao do limite', () => {
    const budgets = [
      { month: '2026-06', categoryId, limit: 500, onlyThisMonth: false },
      { month: '2026-09', categoryId, limit: null, onlyThisMonth: true },
    ];
    expect(effectiveLimit(budgets, categoryId, '2026-09')).toBeNull();
  });

  it('retorna null quando nao ha limite aplicavel', () => {
    expect(effectiveLimit([], categoryId, '2026-09')).toBeNull();
  });
});

describe('budgetStatus', () => {
  it.each([
    [7_999, 10_000, 'ok'],
    [8_000, 10_000, 'alerta'],
    [9_999, 10_000, 'alerta'],
    [10_000, 10_000, 'estourado'],
    [10_001, 10_000, 'estourado'],
  ])('classifica %i de %i como %s', (spent, limit, expected) => {
    expect(budgetStatus(spent, limit)).toBe(expected);
  });

  it('considera qualquer gasto acima de um limite zero como estouro', () => {
    expect(budgetStatus(0, 0)).toBe('ok');
    expect(budgetStatus(1, 0)).toBe('estourado');
  });

  it('distingue a ausencia de limite', () => {
    expect(budgetStatus(5_000, null)).toBe('sem-limite');
  });
});

describe('budgetSummary', () => {
  it('resume apenas despesas do mes e totaliza categorias com limite', () => {
    const categories = [
      { id: 1, name: 'Casa', type: 'despesa', color: '#f5a65b' },
      { id: 2, name: 'Lazer', type: 'despesa', color: '#8e8de7' },
      { id: 3, name: 'Salario', type: 'receita', color: '#55c995' },
    ];
    const budgets = [
      { id: 10, month: '2026-08', categoryId: 1, limit: 500, onlyThisMonth: false },
      { id: 11, month: '2026-09', categoryId: 2, limit: null, onlyThisMonth: true },
    ];
    const transactions = [
      { type: 'despesa', date: '2026-09-03', categoryId: 1, value: 120.25 },
      { type: 'despesa', date: '2026-09-04', categoryId: 2, value: 40 },
      { type: 'receita', date: '2026-09-05', categoryId: 1, value: 999 },
      { type: 'despesa', date: '2026-08-31', categoryId: 1, value: 70 },
    ];

    const summary = budgetSummary(categories, budgets, transactions, '2026-09');

    expect(summary.budgetedCents).toBe(50_000);
    expect(summary.spentCents).toBe(12_025);
    expect(summary.rows).toHaveLength(2);
    expect(summary.rows[0]).toMatchObject({
      category: categories[0], limitCents: 50_000, spentCents: 12_025,
      status: 'ok', onlyThisMonth: false,
    });
    expect(summary.rows[1]).toMatchObject({
      category: categories[1], limitCents: null, spentCents: 4_000,
      status: 'sem-limite', onlyThisMonth: true,
    });
  });
});
