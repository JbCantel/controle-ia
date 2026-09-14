import { describe, it, expect } from 'vitest';
import { formatBRL, parseBRL, centsToBRLInput, toCents, fromCents, sumCents, formatReais, formatSigned, formatMoneyInput } from './money';

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
  it('rejeita decimal no estilo americano (ponto como decimal)', () => {
    expect(parseBRL('10.50')).toBeNaN();
    expect(parseBRL('1.5')).toBeNaN();
  });
  it('aceita milhar brasileiro sem decimal', () => {
    expect(parseBRL('1.050')).toBe(105000);
  });
});

describe('centsToBRLInput', () => {
  it('converte centavos para texto de input com vírgula', () => {
    expect(centsToBRLInput(123456)).toBe('1234,56');
  });
  it('roundtrip com parseBRL', () => {
    expect(parseBRL(centsToBRLInput(123456))).toBe(123456);
  });
});

describe('reais <-> centavos', () => {
  it('converte reais para centavos sem erro de ponto flutuante', () => {
    expect(toCents(386.42)).toBe(38642);
    expect(toCents(0.1 + 0.2)).toBe(30);
    expect(fromCents(38642)).toBe(386.42);
  });
  it('soma valores em reais via centavos', () => {
    expect(sumCents([0.1, 0.2])).toBe(30);
    expect(sumCents([])).toBe(0);
  });
  it('formata reais', () => {
    expect(formatReais(2106.32)).toBe('R$ 2.106,32');
  });
  it('formata com sinal por tipo', () => {
    expect(formatSigned(850, 'receita')).toBe('+ R$ 850,00');
    expect(formatSigned(89.9, 'despesa')).toBe('- R$ 89,90');
  });
  it('formata o texto da máscara de valor', () => {
    expect(formatMoneyInput(123456)).toBe('1.234,56');
    expect(formatMoneyInput(5)).toBe('0,05');
  });
});
