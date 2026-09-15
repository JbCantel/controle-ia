import { describe, expect, it } from 'vitest';
import { categoryUsageMessage, summarizeCategoryUsage, validateCategory } from './categories';

const categories = [
  { id: 1, name: 'Alimentação', type: 'despesa', color: '#f5a65b' },
  { id: 2, name: 'Freelance', type: 'receita', color: '#8cb8ff' },
];

describe('validateCategory', () => {
  it('aceita categoria válida e permite o mesmo nome em tipos diferentes', () => {
    expect(validateCategory({ name: 'Transporte', type: 'despesa', color: '#56b4d3' }, categories)).toEqual({});
    expect(validateCategory({ name: 'Alimentacao', type: 'receita', color: '#65d39b' }, categories)).toEqual({});
  });

  it('exige nome, tipo válido e cor da paleta', () => {
    expect(validateCategory({ name: '  ', type: 'outro', color: '#ffffff' }, categories)).toEqual({
      name: 'Informe um nome.',
      type: 'Escolha o tipo.',
      color: 'Escolha uma cor da paleta.',
    });
  });

  it('bloqueia nome duplicado no mesmo tipo ignorando caixa, acentos e espaços', () => {
    expect(validateCategory({ name: '  ALIMENTACAO ', type: 'despesa', color: '#55c995' }, categories)).toEqual({
      name: 'Já existe uma categoria de despesa com este nome.',
    });
  });

  it('ignora o próprio registro durante a edição', () => {
    expect(validateCategory({ name: 'alimentacao', type: 'despesa', color: '#f5a65b' }, categories, 1)).toEqual({});
  });
});

describe('summarizeCategoryUsage', () => {
  const records = {
    transactions: [{ categoryId: 1 }, { categoryId: 1 }, { categoryId: 2 }],
    budgets: [{ categoryId: 1 }, { categoryId: 2 }],
    recurrences: [{ categoryId: 1 }, { categoryId: 1 }, { categoryId: 1 }],
  };

  it('conta cada origem e o total', () => {
    expect(summarizeCategoryUsage(1, records)).toEqual({ transactions: 2, budgets: 1, recurrences: 3, total: 6 });
    expect(summarizeCategoryUsage(99, records)).toEqual({ transactions: 0, budgets: 0, recurrences: 0, total: 0 });
  });

  it('descreve os usos com singular e plural', () => {
    expect(categoryUsageMessage({ transactions: 2, budgets: 1, recurrences: 3, total: 6 }))
      .toBe('2 transações, 1 orçamento e 3 recorrências');
    expect(categoryUsageMessage({ transactions: 0, budgets: 0, recurrences: 1, total: 1 }))
      .toBe('1 recorrência');
    expect(categoryUsageMessage({ transactions: 0, budgets: 0, recurrences: 0, total: 0 }))
      .toBe('nenhum uso');
  });
});
