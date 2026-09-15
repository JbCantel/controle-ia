import { normalizeText } from './transactions';

// Paleta original do ORBE (recuperada dos dados) + dois tons extras.
export const CATEGORY_PALETTE = [
  '#8b7cf6', '#f5a65b', '#56b4d3', '#e8739c', '#55c995',
  '#65d39b', '#8cb8ff', '#d9c26a', '#9aa5a1',
];

export const DEFAULT_CATEGORIES = [
  { name: 'Moradia', type: 'despesa', color: '#8b7cf6' },
  { name: 'Alimentação', type: 'despesa', color: '#f5a65b' },
  { name: 'Transporte', type: 'despesa', color: '#56b4d3' },
  { name: 'Lazer', type: 'despesa', color: '#e8739c' },
  { name: 'Saúde', type: 'despesa', color: '#55c995' },
  { name: 'Salário', type: 'receita', color: '#65d39b' },
  { name: 'Freelance', type: 'receita', color: '#8cb8ff' },
];

const CATEGORY_TYPES = ['despesa', 'receita'];

export function validateCategory(input, categories, currentId = null) {
  const errors = {};
  const name = (input.name || '').trim();
  const validType = CATEGORY_TYPES.includes(input.type);

  if (!name) errors.name = 'Informe um nome.';
  else if (validType && categories.some((category) => (
    category.id !== currentId
    && category.type === input.type
    && normalizeText(category.name) === normalizeText(name)
  ))) {
    errors.name = `Já existe uma categoria de ${input.type} com este nome.`;
  }

  if (!validType) errors.type = 'Escolha o tipo.';
  if (!CATEGORY_PALETTE.includes(input.color)) errors.color = 'Escolha uma cor da paleta.';

  return errors;
}

export function summarizeCategoryUsage(categoryId, { transactions = [], budgets = [], recurrences = [] } = {}) {
  const usage = {
    transactions: transactions.filter((item) => item.categoryId === categoryId).length,
    budgets: budgets.filter((item) => item.categoryId === categoryId).length,
    recurrences: recurrences.filter((item) => item.categoryId === categoryId).length,
  };
  return { ...usage, total: usage.transactions + usage.budgets + usage.recurrences };
}

const usageLabel = (count, singular, plural) => `${count} ${count === 1 ? singular : plural}`;

export function categoryUsageMessage(usage) {
  const parts = [];
  if (usage.transactions) parts.push(usageLabel(usage.transactions, 'transação', 'transações'));
  if (usage.budgets) parts.push(usageLabel(usage.budgets, 'orçamento', 'orçamentos'));
  if (usage.recurrences) parts.push(usageLabel(usage.recurrences, 'recorrência', 'recorrências'));
  if (parts.length === 0) return 'nenhum uso';
  if (parts.length === 1) return parts[0];
  return `${parts.slice(0, -1).join(', ')} e ${parts.at(-1)}`;
}
