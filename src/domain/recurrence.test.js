import { describe, it, expect } from 'vitest';
import { occurrenceDate, dueOccurrences, resumeMarker, ruleFromTransaction } from './recurrence';

const rule = (over = {}) => ({
  id: 1, type: 'despesa', value: 45.9, categoryId: 3, description: 'Academia',
  dayOfMonth: 10, startMonth: '2026-06', lastGeneratedMonth: '2026-06', active: true, ...over,
});

describe('occurrenceDate', () => {
  it('limita o dia ao último dia do mês', () => {
    expect(occurrenceDate('2026-02', 31)).toBe('2026-02-28');
    expect(occurrenceDate('2028-02', 31)).toBe('2028-02-29');
    expect(occurrenceDate('2026-06', 5)).toBe('2026-06-05');
  });
});

describe('dueOccurrences', () => {
  it('gera os meses que faltam até hoje e avança o marcador', () => {
    const { transactions, updates } = dueOccurrences([rule()], '2026-09-14');
    expect(transactions.map((t) => t.date)).toEqual(['2026-07-10', '2026-08-10', '2026-09-10']);
    expect(transactions[0]).toEqual({ type: 'despesa', value: 45.9, date: '2026-07-10', categoryId: 3, description: 'Academia', recurrenceId: 1 });
    expect(updates).toEqual([{ id: 1, lastGeneratedMonth: '2026-09' }]);
  });

  it('não gera ocorrência com data futura no mês atual', () => {
    const { transactions, updates } = dueOccurrences([rule({ dayOfMonth: 20 })], '2026-09-14');
    expect(transactions.map((t) => t.date)).toEqual(['2026-07-20', '2026-08-20']);
    expect(updates).toEqual([{ id: 1, lastGeneratedMonth: '2026-08' }]);
  });

  it('ignora regras pausadas e é idempotente', () => {
    expect(dueOccurrences([rule({ active: false })], '2026-09-14')).toEqual({ transactions: [], updates: [] });
    expect(dueOccurrences([rule({ lastGeneratedMonth: '2026-09' })], '2026-09-14')).toEqual({ transactions: [], updates: [] });
  });

  it('dia 31 cai no último dia de cada mês', () => {
    const { transactions } = dueOccurrences([rule({ dayOfMonth: 31, lastGeneratedMonth: '2026-01' })], '2026-03-31');
    expect(transactions.map((t) => t.date)).toEqual(['2026-02-28', '2026-03-31']);
  });
});

describe('resumeMarker', () => {
  it('não preenche os meses pausados', () => {
    expect(resumeMarker('2026-05', '2026-09-14')).toBe('2026-08');
  });
  it('mantém o marcador se já gerou o mês atual', () => {
    expect(resumeMarker('2026-09', '2026-09-14')).toBe('2026-09');
  });
});

describe('ruleFromTransaction', () => {
  it('cria a regra a partir da data da transação', () => {
    expect(ruleFromTransaction({ type: 'receita', value: 3000, date: '2026-07-05', categoryId: 6, description: 'Pagamento' }))
      .toEqual({ type: 'receita', value: 3000, categoryId: 6, description: 'Pagamento', dayOfMonth: 5, startMonth: '2026-07', lastGeneratedMonth: '2026-07', active: true });
  });
});
