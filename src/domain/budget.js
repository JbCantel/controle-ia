import { toCents } from './money';

function effectiveBudget(budgets, categoryId, month) {
  const ownMonth = budgets.find((budget) => budget.categoryId === categoryId && budget.month === month);
  if (ownMonth) return ownMonth;

  return budgets
    .filter((budget) => (
      budget.categoryId === categoryId
      && budget.month < month
      && !budget.onlyThisMonth
    ))
    .sort((a, b) => b.month.localeCompare(a.month))[0] ?? null;
}

export function effectiveLimit(budgets, categoryId, month) {
  return effectiveBudget(budgets, categoryId, month)?.limit ?? null;
}

export function budgetStatus(spentCents, limitCents) {
  if (limitCents === null) return 'sem-limite';
  if (limitCents === 0) return spentCents > 0 ? 'estourado' : 'ok';
  if (spentCents >= limitCents) return 'estourado';
  if (spentCents * 100 >= limitCents * 80) return 'alerta';
  return 'ok';
}

function percentageOf(spentCents, limitCents) {
  if (limitCents === null) return null;
  if (limitCents === 0) return spentCents > 0 ? 100 : 0;
  return (spentCents / limitCents) * 100;
}

export function budgetSummary(categories, budgets, transactions, month) {
  const rows = categories
    .filter((category) => category.type === 'despesa')
    .map((category) => {
      const budget = effectiveBudget(budgets, category.id, month);
      const limitCents = budget?.limit === null || budget == null ? null : toCents(budget.limit);
      const spentCents = transactions.reduce((total, transaction) => {
        if (
          transaction.type !== 'despesa'
          || transaction.categoryId !== category.id
          || !transaction.date.startsWith(`${month}-`)
        ) return total;
        return total + toCents(transaction.value);
      }, 0);

      return {
        category,
        budget,
        limitCents,
        spentCents,
        status: budgetStatus(spentCents, limitCents),
        percentage: percentageOf(spentCents, limitCents),
        overCents: limitCents === null ? 0 : Math.max(0, spentCents - limitCents),
        onlyThisMonth: Boolean(budget && budget.month === month && budget.onlyThisMonth),
      };
    });

  return rows.reduce((summary, row) => {
    if (row.limitCents !== null) {
      summary.budgetedCents += row.limitCents;
      summary.spentCents += row.spentCents;
    }
    return summary;
  }, { rows, budgetedCents: 0, spentCents: 0 });
}
