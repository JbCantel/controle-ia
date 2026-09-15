import { useMemo, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { CircleGauge, Tags } from 'lucide-react';
import PageHeader from '../../components/layout/PageHeader';
import MonthSwitcher from '../../components/layout/MonthSwitcher';
import Card, { CardTitle } from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import ProgressBar from '../../components/ui/ProgressBar';
import BudgetForm from './BudgetForm';
import BudgetRow from './BudgetRow';
import { db } from '../../db/db';
import { budgetStatus, budgetSummary } from '../../domain/budget';
import { monthRange } from '../../domain/dates';
import { formatBRL } from '../../domain/money';
import { useMonthParam } from '../../hooks/useMonthParam';

function SummaryCard({ summary }) {
  const limitedCount = summary.rows.filter((row) => row.limitCents !== null).length;
  const status = budgetStatus(summary.spentCents, limitedCount > 0 ? summary.budgetedCents : null);
  const percentage = limitedCount === 0
    ? 0
    : summary.budgetedCents === 0
      ? (summary.spentCents > 0 ? 100 : 0)
      : (summary.spentCents / summary.budgetedCents) * 100;
  const remaining = summary.budgetedCents - summary.spentCents;

  return (
    <Card className="mt-10 overflow-hidden rounded-kpi">
      <div className="grid divide-y divide-line sm:grid-cols-2 sm:divide-x sm:divide-y-0">
        <div className="p-5 sm:p-6">
          <div className="flex items-center gap-2 text-sm text-ink-2"><CircleGauge size={16} className="text-brand" aria-hidden />Planejado</div>
          <p className="mt-2 text-[28px] font-bold tracking-[-0.01em] tabular-nums text-ink">{formatBRL(summary.budgetedCents)}</p>
          <p className="mt-1 text-[13px] text-ink-3">{limitedCount === 1 ? '1 categoria com limite' : `${limitedCount} categorias com limite`}</p>
        </div>
        <div className="p-5 sm:p-6">
          <p className="text-sm text-ink-2">Gasto dentro do planejamento</p>
          <p className={`mt-2 text-[28px] font-bold tracking-[-0.01em] tabular-nums ${remaining < 0 ? 'text-expense' : 'text-ink'}`}>{formatBRL(summary.spentCents)}</p>
          <p className={`mt-1 text-[13px] ${remaining < 0 ? 'text-expense' : 'text-ink-3'}`}>
            {limitedCount === 0 ? 'Defina um limite para começar.' : remaining < 0 ? `${formatBRL(Math.abs(remaining))} acima do total` : `${formatBRL(remaining)} disponíveis`}
          </p>
        </div>
      </div>
      {limitedCount > 0 && (
        <div className="border-t border-line px-5 py-4 sm:px-6">
          <ProgressBar value={percentage} status={status} label={`${Math.round(percentage)}% do orçamento total usado.`} />
        </div>
      )}
    </Card>
  );
}

export default function Orcamento() {
  const [month, setMonth] = useMonthParam();
  const [editing, setEditing] = useState(null);
  const { start, end } = monthRange(month);

  const data = useLiveQuery(async () => {
    const [categories, budgets, transactions] = await Promise.all([
      db.categories.toArray(),
      db.budgets.toArray(),
      db.transactions.where('date').between(start, end, true, true).toArray(),
    ]);
    return { categories, budgets, transactions };
  }, [start, end]);

  const summary = useMemo(() => {
    if (!data) return null;
    const categories = [...data.categories].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
    return budgetSummary(categories, data.budgets, data.transactions, month);
  }, [data, month]);

  return (
    <>
      <PageHeader
        title="Orçamento"
        subtitle="Defina limites por categoria e veja cedo quando um gasto pede atenção."
        actions={<MonthSwitcher month={month} onChange={setMonth} />}
      />

      {!summary ? (
        <div className="mt-10 min-h-[420px]" aria-busy="true" />
      ) : (
        <>
          <SummaryCard summary={summary} />

          <Card className="mt-5 p-5 sm:p-6">
            <CardTitle title="Limites por categoria" subtitle="O gasto considera somente as despesas do mês selecionado." />
            {summary.rows.length > 0 ? (
              <ul className="mt-5">
                {summary.rows.map((row) => <BudgetRow key={row.category.id} row={row} onEdit={setEditing} />)}
              </ul>
            ) : (
              <EmptyState icon={Tags} title="Nenhuma categoria de despesa" text="Crie uma categoria de despesa antes de definir seus limites." />
            )}
          </Card>
        </>
      )}

      <BudgetForm open={editing !== null} row={editing} month={month} onClose={() => setEditing(null)} />
    </>
  );
}
