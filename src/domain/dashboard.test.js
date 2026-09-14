import { describe, it, expect } from 'vitest';
import { monthSummary, cumulativeBalance, expensesByCategory, recentTransactions, savingsSummary, plural } from './dashboard';

// Dados fictícios.
const tx = [
  { id: 1, type: 'receita', value: 2500, date: '2026-04-05', categoryId: 10, description: 'Pagamento abril' },
  { id: 2, type: 'despesa', value: 800.5, date: '2026-04-20', categoryId: 1, description: 'Aluguel' },
  { id: 3, type: 'receita', value: 2500, date: '2026-05-05', categoryId: 10, description: 'Pagamento maio' },
  { id: 4, type: 'despesa', value: 0.1, date: '2026-05-06', categoryId: 2, description: 'Bala' },
  { id: 5, type: 'despesa', value: 0.2, date: '2026-05-06', categoryId: 2, description: 'Chiclete' },
  { id: 6, type: 'despesa', value: 120, date: '2026-05-31', categoryId: 1, description: 'Luz' },
  { id: 7, type: 'despesa', value: 99, date: '2026-06-01', categoryId: 3, description: 'Ônibus' },
];
const categories = [
  { id: 1, name: 'Moradia', type: 'despesa', color: '#8b7cf6' },
  { id: 2, name: 'Alimentação', type: 'despesa', color: '#f5a65b' },
  { id: 3, name: 'Transporte', type: 'despesa', color: '#56b4d3' },
  { id: 10, name: 'Salário', type: 'receita', color: '#65d39b' },
];

describe('monthSummary', () => {
  it('soma só o mês pedido, em centavos, com contagens', () => {
    expect(monthSummary(tx, '2026-05')).toEqual({ incomeCents: 250000, expenseCents: 12030, balanceCents: 237970, incomeCount: 1, expenseCount: 3 });
  });
  it('mês sem lançamentos zera tudo', () => {
    expect(monthSummary(tx, '2026-01')).toEqual({ incomeCents: 0, expenseCents: 0, balanceCents: 0, incomeCount: 0, expenseCount: 0 });
  });
});

describe('cumulativeBalance', () => {
  it('acumula até o fim de cada mês, terminando no mês pedido', () => {
    expect(cumulativeBalance(tx, '2026-06', 4)).toEqual([
      { month: '2026-03', label: 'mar', cents: 0 },
      { month: '2026-04', label: 'abr', cents: 169950 },
      { month: '2026-05', label: 'mai', cents: 407920 },
      { month: '2026-06', label: 'jun', cents: 398020 },
    ]);
  });
  it('usa 6 meses por padrão', () => {
    expect(cumulativeBalance(tx, '2026-06').map((p) => p.label)).toEqual(['jan', 'fev', 'mar', 'abr', 'mai', 'jun']);
  });
});

describe('expensesByCategory', () => {
  it('agrupa despesas do mês em ordem alfabética com participação', () => {
    expect(expensesByCategory(tx, '2026-05', categories)).toEqual([
      { categoryId: 2, name: 'Alimentação', color: '#f5a65b', cents: 30, share: 30 / 12030 },
      { categoryId: 1, name: 'Moradia', color: '#8b7cf6', cents: 12000, share: 12000 / 12030 },
    ]);
  });
  it('categoria apagada aparece como "Sem categoria"', () => {
    expect(expensesByCategory(tx, '2026-06', [])).toEqual([
      { categoryId: 3, name: 'Sem categoria', color: null, cents: 9900, share: 1 },
    ]);
  });
  it('mês sem despesas devolve lista vazia', () => {
    expect(expensesByCategory(tx, '2026-01', categories)).toEqual([]);
  });
});

describe('recentTransactions', () => {
  it('pega as mais recentes até a data, desempatando por id', () => {
    expect(recentTransactions(tx, '2026-05-31', 3).map((t) => t.id)).toEqual([6, 5, 4]);
    expect(recentTransactions(tx, '2026-06-30').map((t) => t.id)).toEqual([7, 6, 5, 4, 3]);
  });
});

describe('savingsSummary', () => {
  const goals = [{ id: 1, name: 'Viagem', target: 1000 }, { id: 2, name: 'Notebook', target: 300 }];
  const contributions = [
    { id: 1, goalId: 1, value: 400, date: '2026-05-10' },
    { id: 2, goalId: 2, value: 300, date: '2026-05-11' },
    { id: 3, goalId: 1, value: -50, date: '2026-05-20' },
    { id: 4, goalId: 1, value: 700, date: '2026-07-01' },
  ];
  it('soma aportes e resgates até a data e conta metas ainda não atingidas', () => {
    expect(savingsSummary(goals, contributions, '2026-05-31')).toEqual({ totalCents: 65000, activeGoals: 1 });
    expect(savingsSummary(goals, contributions, '2026-07-31')).toEqual({ totalCents: 135000, activeGoals: 0 });
  });
});

describe('plural', () => {
  it('escolhe singular ou plural', () => {
    expect(plural(1, 'entrada', 'entradas')).toBe('1 entrada');
    expect(plural(0, 'meta ativa', 'metas ativas')).toBe('0 metas ativas');
    expect(plural(3, 'saída', 'saídas')).toBe('3 saídas');
  });
});
