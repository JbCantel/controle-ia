import { db } from './db';

const SCOPES = new Set(['from-month', 'only-month']);

export class BudgetDataError extends Error {
  constructor(details) {
    super('Dados do orcamento invalidos.');
    this.name = 'BudgetDataError';
    this.code = 'BUDGET_INVALID';
    this.details = details;
  }
}

function validMonth(month) {
  if (!/^\d{4}-\d{2}$/.test(month || '')) return false;
  const monthNumber = Number(month.slice(5));
  return monthNumber >= 1 && monthNumber <= 12;
}

export async function setBudgetLimit(input, { database = db } = {}) {
  return database.transaction('rw', database.budgets, database.categories, async () => {
    const details = {};
    if (!validMonth(input.month)) details.month = 'Informe um mes valido.';
    if (!Number.isInteger(input.categoryId)) details.categoryId = 'Escolha uma categoria.';
    if (input.limit !== null && (!Number.isFinite(input.limit) || input.limit < 0)) {
      details.limit = 'Informe um valor igual ou maior que zero.';
    }
    if (!SCOPES.has(input.scope)) details.scope = 'Escolha como aplicar este limite.';

    const category = Number.isInteger(input.categoryId)
      ? await database.categories.get(input.categoryId)
      : null;
    if (!category || category.type !== 'despesa') details.categoryId = 'Escolha uma categoria de despesa.';
    if (Object.keys(details).length > 0) throw new BudgetDataError(details);

    const existing = await database.budgets.get({
      month: input.month,
      categoryId: input.categoryId,
    });
    const row = {
      ...(existing?.id ? { id: existing.id } : {}),
      month: input.month,
      categoryId: input.categoryId,
      limit: input.limit === null ? null : Math.round(input.limit * 100) / 100,
      onlyThisMonth: input.scope === 'only-month',
    };

    const id = await database.budgets.put(row);

    if (input.scope === 'from-month') {
      const categoryBudgets = await database.budgets.where('categoryId').equals(input.categoryId).toArray();
      const futureIds = categoryBudgets
        .filter((budget) => budget.month > input.month && !budget.onlyThisMonth)
        .map((budget) => budget.id);
      if (futureIds.length > 0) await database.budgets.bulkDelete(futureIds);
    }

    return id;
  });
}
