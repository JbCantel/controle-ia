import { toCents } from './money';

export function normalizeText(text) {
  return text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim();
}

export function filterTransactions(list, { type = 'todas', categoryId = null, search = '' } = {}) {
  const query = normalizeText(search);
  return list.filter((t) =>
    (type === 'todas' || t.type === type)
    && (categoryId == null || t.categoryId === categoryId)
    && (!query || normalizeText(t.description).includes(query)));
}

export function totalsOf(list) {
  let incomeCents = 0;
  let expenseCents = 0;
  for (const t of list) {
    if (t.type === 'receita') incomeCents += toCents(t.value);
    else expenseCents += toCents(t.value);
  }
  return { incomeCents, expenseCents, balanceCents: incomeCents - expenseCents };
}

export function groupByDay(list) {
  const sorted = [...list].sort((a, b) => (a.date === b.date ? b.id - a.id : a.date < b.date ? 1 : -1));
  const groups = [];
  for (const t of sorted) {
    const last = groups[groups.length - 1];
    if (last && last.date === t.date) last.items.push(t);
    else groups.push({ date: t.date, items: [t] });
  }
  return groups;
}

const ERROR_ORDER = ['value', 'date', 'dayOfMonth', 'categoryId', 'description'];
const ordered = (errors) => Object.fromEntries(ERROR_ORDER.filter((k) => errors[k]).map((k) => [k, errors[k]]));

// Campos comuns a transação e regra de recorrência.
export function validateEntry(input, categories) {
  const errors = {};
  if (!Number.isInteger(input.cents) || input.cents <= 0) errors.value = 'Informe um valor maior que zero.';
  const category = categories.find((c) => c.id === input.categoryId);
  if (!category) errors.categoryId = 'Escolha uma categoria.';
  else if (category.type !== input.type) errors.categoryId = 'A categoria não é do mesmo tipo.';
  const description = (input.description || '').trim();
  if (!description) errors.description = 'Informe uma descrição.';
  else if (description.length > 80) errors.description = 'Use no máximo 80 caracteres.';
  return errors;
}

export function validateTransaction(input, categories) {
  const errors = validateEntry(input, categories);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date || '')) errors.date = 'Informe a data.';
  return ordered(errors);
}

export function validateRecurrence(input, categories) {
  const errors = validateEntry(input, categories);
  if (!Number.isInteger(input.dayOfMonth) || input.dayOfMonth < 1 || input.dayOfMonth > 31) {
    errors.dayOfMonth = 'Use um dia entre 1 e 31.';
  }
  return ordered(errors);
}
