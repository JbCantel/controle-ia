// Dinheiro sempre em centavos (inteiro). Conversao so na borda da UI.

export function formatBRL(cents) {
  const str = (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  // Intl pode usar espaco nao-quebavel (U+00A0) como separador de moeda.
  // U+2212 (sinal de menos matematico) ocorre em builds ICU mais antigos -- normaliza para ASCII.
  return str.replace(/\u00a0/g, ' ').replace(/\u2212/g, '-');
}

export function parseBRL(input) {
  // parseBRL espera formato pt-BR (ponto = milhar, virgula = decimal).
  if (typeof input !== 'string') return NaN;
  const stripped = input.replace(/[R$\s]/g, '');
  // Rejeita decimal no estilo americano ('10.50'): ponto seguido de 1-2 digitos sem virgula.
  if (/\.\d{1,2}$/.test(stripped) && !stripped.includes(',')) return NaN;
  const clean = stripped.replace(/\./g, '').replace(',', '.');
  if (clean === '' || isNaN(Number(clean))) return NaN;
  return Math.round(Number(clean) * 100);
}