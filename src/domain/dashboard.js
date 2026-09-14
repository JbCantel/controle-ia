import { toCents } from './money';
import { monthRange, monthsEndingAt, monthShort } from './dates';

const signed = (t) => (t.type === 'receita' ? 1 : -1) * toCents(t.value);
const byRecency = (a, b) => (a.date === b.date ? b.id - a.id : a.date < b.date ? 1 : -1);

export function monthSummary(transactions, month) {
  const { start, end } = monthRange(month);
  const summary = { incomeCents: 0, expenseCents: 0, balanceCents: 0, incomeCount: 0, expenseCount: 0 };
  for (const t of transactions) {
    if (t.date < start || t.date > end) continue;
    if (t.type === 'receita') { summary.incomeCents += toCents(t.value); summary.incomeCount += 1; }
    else { summary.expenseCents += toCents(t.value); summary.expenseCount += 1; }
  }
  summary.balanceCents = summary.incomeCents - summary.expenseCents;
  return summary;
}

// Saldo acumulado: todas as receitas menos despesas até o último dia de cada mês.
export function cumulativeBalance(transactions, endMonth, count = 6) {
  return monthsEndingAt(endMonth, count).map((month) => {
    const { end } = monthRange(month);
    let cents = 0;
    for (const t of transactions) if (t.date <= end) cents += signed(t);
    return { month, label: monthShort(month).replace('.', ''), cents };
  });
}

export function expensesByCategory(transactions, month, categories) {
  const { start, end } = monthRange(month);
  const totals = new Map();
  for (const t of transactions) {
    if (t.type !== 'despesa' || t.date < start || t.date > end) continue;
    totals.set(t.categoryId, (totals.get(t.categoryId) ?? 0) + toCents(t.value));
  }
  const grand = [...totals.values()].reduce((sum, v) => sum + v, 0);
  const byId = new Map(categories.map((c) => [c.id, c]));
  return [...totals.entries()]
    .map(([categoryId, cents]) => ({
      categoryId,
      name: byId.get(categoryId)?.name ?? 'Sem categoria',
      color: byId.get(categoryId)?.color ?? null,
      cents,
      share: grand ? cents / grand : 0,
    }))
    .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
}

export function recentTransactions(transactions, endDate, limit = 5) {
  return transactions.filter((t) => t.date <= endDate).sort(byRecency).slice(0, limit);
}

export function savingsSummary(goals, contributions, endDate) {
  const savedByGoal = new Map();
  let totalCents = 0;
  for (const c of contributions) {
    if (c.date > endDate) continue;
    const cents = toCents(c.value);
    totalCents += cents;
    savedByGoal.set(c.goalId, (savedByGoal.get(c.goalId) ?? 0) + cents);
  }
  const activeGoals = goals.filter((g) => (savedByGoal.get(g.id) ?? 0) < toCents(g.target)).length;
  return { totalCents, activeGoals };
}

export function plural(n, singular, pluralForm) {
  return `${n} ${n === 1 ? singular : pluralForm}`;
}
