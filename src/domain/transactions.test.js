import { describe, it, expect } from 'vitest';
import { filterTransactions, totalsOf, groupByDay, validateTransaction, validateRecurrence } from './transactions';

const list = [
  { id: 1, type: 'receita', value: 1200, date: '2026-09-05', categoryId: 6, description: 'Pagamento' },
  { id: 2, type: 'despesa', value: 0.1, date: '2026-09-05', categoryId: 2, description: 'Pão de queijo' },
  { id: 3, type: 'despesa', value: 0.2, date: '2026-09-07', categoryId: 2, description: 'Café' },
];
const categories = [
  { id: 2, name: 'Alimentação', type: 'despesa' },
  { id: 6, name: 'Salário', type: 'receita' },
];

describe('filterTransactions', () => {
  it('filtra por tipo, categoria e busca sem acento', () => {
    expect(filterTransactions(list, { type: 'despesa' }).map((t) => t.id)).toEqual([2, 3]);
    expect(filterTransactions(list, { categoryId: 6 }).map((t) => t.id)).toEqual([1]);
    expect(filterTransactions(list, { search: 'PAO' }).map((t) => t.id)).toEqual([2]);
    expect(filterTransactions(list, {}).length).toBe(3);
  });
});

describe('totalsOf', () => {
  it('soma em centavos', () => {
    expect(totalsOf(list)).toEqual({ incomeCents: 120000, expenseCents: 30, balanceCents: 119970 });
  });
});

describe('groupByDay', () => {
  it('agrupa por data, mais recente primeiro, id desc no mesmo dia', () => {
    expect(groupByDay(list).map((g) => [g.date, g.items.map((t) => t.id)]))
      .toEqual([['2026-09-07', [3]], ['2026-09-05', [2, 1]]]);
  });
});

describe('validateTransaction', () => {
  const ok = { type: 'despesa', cents: 1500, date: '2026-09-14', categoryId: 2, description: 'Almoço' };
  it('aceita entrada válida', () => {
    expect(validateTransaction(ok, categories)).toEqual({});
  });
  it('aponta cada campo inválido', () => {
    expect(validateTransaction({ type: 'receita', cents: 0, date: '', categoryId: 2, description: '  ' }, categories)).toEqual({
      value: 'Informe um valor maior que zero.',
      date: 'Informe a data.',
      categoryId: 'A categoria não é do mesmo tipo.',
      description: 'Informe uma descrição.',
    });
    expect(validateTransaction({ ...ok, categoryId: 99, description: 'x'.repeat(81) }, categories)).toEqual({
      categoryId: 'Escolha uma categoria.',
      description: 'Use no máximo 80 caracteres.',
    });
  });
});

describe('validateRecurrence', () => {
  it('exige dia do mês entre 1 e 31', () => {
    const base = { type: 'despesa', cents: 1500, categoryId: 2, description: 'Aluguel' };
    expect(validateRecurrence({ ...base, dayOfMonth: 31 }, categories)).toEqual({});
    expect(validateRecurrence({ ...base, dayOfMonth: 0 }, categories)).toEqual({ dayOfMonth: 'Use um dia entre 1 e 31.' });
  });
});
