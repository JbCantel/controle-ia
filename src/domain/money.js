// Valores são gravados em reais (2 casas); toda conta é feita em centavos inteiros.

const MINUS_SIGN = String.fromCharCode(0x2212);

export function formatBRL(cents) {
  const str = (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  // Intl usa espaços não quebráveis e, em ICU antigo, o sinal de menos matemático.
  return str.replace(/\s/g, ' ').split(MINUS_SIGN).join('-');
}

export function centsToBRLInput(cents) {
  return (cents / 100).toFixed(2).replace('.', ',');
}

export function parseBRL(input) {
  if (typeof input !== 'string') return NaN;
  const stripped = input.replace(/[R$\s]/g, '');
  // Rejeita decimal americano ('10.50'): ponto seguido de 1-2 dígitos sem vírgula.
  if (/\.\d{1,2}$/.test(stripped) && !stripped.includes(',')) return NaN;
  const clean = stripped.replace(/\./g, '').replace(',', '.');
  if (clean === '' || isNaN(Number(clean))) return NaN;
  return Math.round(Number(clean) * 100);
}

export function toCents(reais) {
  return Math.round(reais * 100);
}

export function fromCents(cents) {
  return cents / 100;
}

export function sumCents(values) {
  return values.reduce((total, v) => total + toCents(v), 0);
}

export function formatReais(reais) {
  return formatBRL(toCents(reais));
}

export function formatSigned(reais, type) {
  return `${type === 'receita' ? '+' : '-'} ${formatBRL(Math.abs(toCents(reais)))}`;
}

// Texto da máscara estilo caixa eletrônico: 123456 -> '1.234,56'
export function formatMoneyInput(cents) {
  return formatBRL(cents).replace('R$ ', '');
}
