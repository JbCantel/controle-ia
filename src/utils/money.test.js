import { describe, it, expect } from 'vitest';
import { formatBRL, parseBRL } from './money';

describe('formatBRL', () => {
  it('formata centavos em R$ com vírgula e milhar', () => {
    expect(formatBRL(123456)).toBe('R$ 1.234,56');
  });
  it('formata zero', () => {
    expect(formatBRL(0)).toBe('R$ 0,00');
  });
  it('formata negativos', () => {
    expect(formatBRL(-5000)).toBe('-R$ 50,00');
  });
});

describe('parseBRL', () => {
  it('parseia formato brasileiro completo', () => {
    expect(parseBRL('1.234,56')).toBe(123456);
  });
  it('parseia número simples sem vírgula', () => {
    expect(parseBRL('50')).toBe(5000);
  });
  it('parseia com prefixo R$', () => {
    expect(parseBRL('R$ 10,00')).toBe(1000);
  });
  it('retorna NaN para entrada inválida', () => {
    expect(parseBRL('abc')).toBeNaN();
    expect(parseBRL('')).toBeNaN();
    expect(parseBRL(null)).toBeNaN();
  });
});
