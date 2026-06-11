// Dinheiro sempre em centavos (inteiro). Conversão só na borda da UI.

export function formatBRL(cents) {
  const str = (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  // Intl pode usar espaço não-quebrável (U+00A0) e/ou sinal de menos alternativo (U+2212).
  // Normaliza ambos para caracteres ASCII comuns.
  return str.replace(/ /g, ' ').replace(/−/g, '-');
}

export function parseBRL(input) {
  if (typeof input !== 'string') return NaN;
  const clean = input.replace(/[R$\s ]/g, '').replace(/\./g, '').replace(',', '.');
  if (clean === '' || isNaN(Number(clean))) return NaN;
  return Math.round(Number(clean) * 100);
}
