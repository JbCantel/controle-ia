import { describe, it, expect } from 'vitest';
import { buildSummary } from './summary';

const cats = [
  { id: 1, name: 'Lazer', type: 'despesa' },
  { id: 2, name: 'Mercado', type: 'despesa' },
];

function tx(type, amount, categoryId, description = 'x') {
  return { type, amount, categoryId, description, date: '2026-06-05' };
}

describe('buildSummary', () => {
  it('compara com o mês anterior', () => {
    const out = buildSummary({
      monthTx: [tx('despesa', 12300, 1)],
      prevTx: [tx('despesa', 10000, 1)],
      prevLabel: 'maio',
      categories: cats,
      budgets: [],
    });
    expect(out[0]).toBe('Você gastou 23% a mais que em maio.');
  });

  it('aponta a categoria com maior variação', () => {
    const out = buildSummary({
      monthTx: [tx('despesa', 20000, 1), tx('despesa', 10000, 2)],
      prevTx: [tx('despesa', 10000, 1), tx('despesa', 10000, 2)],
      prevLabel: 'maio',
      categories: cats,
      budgets: [],
    });
    expect(out).toContain('Seus gastos com Lazer subiram 100%.');
  });

  it('mostra o maior gasto individual', () => {
    const out = buildSummary({
      monthTx: [tx('despesa', 84000, 2, 'Mercado do mês'), tx('despesa', 5000, 1)],
      prevTx: [],
      prevLabel: 'maio',
      categories: cats,
      budgets: [],
    });
    expect(out).toContain('Maior gasto do mês: Mercado do mês (R$ 840,00).');
  });

  it('alerta orçamento >= 80%', () => {
    const out = buildSummary({
      monthTx: [tx('despesa', 9200, 1)],
      prevTx: [],
      prevLabel: 'maio',
      categories: cats,
      budgets: [{ categoryId: 1, monthlyLimit: 10000 }],
    });
    expect(out).toContain('⚠️ Orçamento de Lazer está em 92%.');
  });

  it('sem mês anterior: não compara, não quebra (divisão por zero)', () => {
    const out = buildSummary({
      monthTx: [tx('despesa', 5000, 1, 'Pizza')],
      prevTx: [],
      prevLabel: 'maio',
      categories: cats,
      budgets: [],
    });
    expect(out).toEqual(['Maior gasto do mês: Pizza (R$ 50,00).']);
  });

  it('sem nenhum dado retorna vazio', () => {
    expect(buildSummary({ monthTx: [], prevTx: [], prevLabel: 'maio', categories: cats, budgets: [] })).toEqual([]);
  });
});
