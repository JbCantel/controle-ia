import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { ArrowRight, CircleDollarSign, Inbox, PiggyBank, TrendingDown, TrendingUp } from 'lucide-react';
import PageHeader from '../../components/layout/PageHeader';
import MonthSwitcher from '../../components/layout/MonthSwitcher';
import DataModal from '../../components/layout/DataModal';
import Card, { CardTitle } from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import StatCard from './StatCard';
import BalanceChart from './BalanceChart';
import CategoryDonut from './CategoryDonut';
import RecentList from './RecentList';
import WelcomeCard from './WelcomeCard';
import DashboardSkeleton from './DashboardSkeleton';
import { useMonthParam } from '../../hooks/useMonthParam';
import { db } from '../../db/db';
import { cumulativeBalance, expensesByCategory, monthSummary, plural, recentTransactions, savingsSummary } from '../../domain/dashboard';
import { currentMonthKey, monthRange } from '../../domain/dates';
import { formatBRL } from '../../domain/money';

export default function Painel() {
  const [month, setMonth] = useMonthParam();
  const { end } = monthRange(month);
  const [importOpen, setImportOpen] = useState(false);

  const data = useLiveQuery(async () => {
    const transactions = await db.transactions.where('date').belowOrEqual(end).toArray();
    const categories = await db.categories.toArray();
    const goals = await db.goals.toArray();
    const contributions = await db.contributions.where('date').belowOrEqual(end).toArray();
    const totalTransactions = await db.transactions.count();
    return { transactions, categories, goals, contributions, totalTransactions };
  }, [end]);

  const view = useMemo(() => data && {
    summary: monthSummary(data.transactions, month),
    balance: cumulativeBalance(data.transactions, month),
    byCategory: expensesByCategory(data.transactions, month, data.categories),
    recent: recentTransactions(data.transactions, end),
    savings: savingsSummary(data.goals, data.contributions, end),
    categoriesById: new Map(data.categories.map((c) => [c.id, c])),
  }, [data, month, end]);

  const isEmpty = data && data.categories.length === 0 && data.totalTransactions === 0;
  const s = view?.summary;

  return (
    <>
      <PageHeader title="Visão geral" subtitle="Seu dinheiro, com contexto." actions={<MonthSwitcher month={month} onChange={setMonth} />} />

      {!view ? (
        <DashboardSkeleton />
      ) : isEmpty ? (
        <WelcomeCard onImport={() => setImportOpen(true)} />
      ) : (
        <>
          <div className="@container mt-10">
            <div className="grid gap-5 @lg:grid-cols-2 @5xl:grid-cols-4">
              <StatCard icon={CircleDollarSign} tone="brand" label="Saldo do mês" value={formatBRL(s.balanceCents)} valueTone={s.balanceCents < 0 ? 'expense' : undefined} caption="Receitas menos despesas" />
              <StatCard icon={TrendingUp} tone="income" label="Receitas" value={formatBRL(s.incomeCents)} caption={`${plural(s.incomeCount, 'entrada', 'entradas')} no mês`} />
              <StatCard icon={TrendingDown} tone="expense" label="Despesas" value={formatBRL(s.expenseCents)} caption={`${plural(s.expenseCount, 'saída', 'saídas')} no mês`} />
              <StatCard icon={PiggyBank} tone="amber" label="Total guardado" value={formatBRL(view.savings.totalCents)} caption={plural(view.savings.activeGoals, 'meta ativa', 'metas ativas')} />
            </div>
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
            <Card className="p-5 sm:p-6">
              <CardTitle title="Evolução do saldo" subtitle="Últimos seis meses" />
              <div className="mt-6"><BalanceChart points={view.balance} /></div>
            </Card>
            <Card className="p-5 sm:p-6">
              <CardTitle title="Gastos por categoria" subtitle="Distribuição deste mês" />
              <div className="mt-6">
                {view.byCategory.length > 0
                  ? <CategoryDonut items={view.byCategory} />
                  : <EmptyState icon={Inbox} title="Nenhuma despesa" text="Não há despesas neste mês." />}
              </div>
            </Card>
          </div>

          <Card className="mt-5 p-5 sm:p-6">
            <CardTitle
              title="Movimentações recentes"
              subtitle="Os últimos cinco lançamentos"
              action={(
                <Link
                  to={month === currentMonthKey() ? '/transacoes' : `/transacoes?mes=${month}`}
                  className="inline-flex h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3 text-[13px] font-medium text-brand transition-colors duration-150 hover:bg-brand/10"
                >
                  Ver todas<ArrowRight size={14} aria-hidden />
                </Link>
              )}
            />
            {view.recent.length > 0
              ? <RecentList transactions={view.recent} categoriesById={view.categoriesById} />
              : <p className="py-6 text-[15px] text-ink-3">Nenhum lançamento até este mês.</p>}
          </Card>
        </>
      )}

      {/* Fora dos cartões: a importação preenche o banco e a boas-vindas some, mas o modal precisa continuar aberto. */}
      <DataModal open={importOpen} mode="import" onClose={() => setImportOpen(false)} />
    </>
  );
}
