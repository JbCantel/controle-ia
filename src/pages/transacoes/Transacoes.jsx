import { useMemo, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Inbox, Plus, Search } from 'lucide-react';
import PageHeader from '../../components/layout/PageHeader';
import MonthSwitcher from '../../components/layout/MonthSwitcher';
import Card, { CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Segmented from '../../components/ui/Segmented';
import EmptyState from '../../components/ui/EmptyState';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { inputClass } from '../../components/ui/Field';
import TransactionForm from './TransactionForm';
import TransactionList from './TransactionList';
import RecurrenceList from './RecurrenceList';
import RecurrenceForm from './RecurrenceForm';
import { useMonthParam } from '../../hooks/useMonthParam';
import { db } from '../../db/db';
import { deleteTransaction } from '../../db/transactions';
import { pauseRecurrence, resumeRecurrence, deleteRecurrence } from '../../db/recurrences';
import { filterTransactions, totalsOf, groupByDay } from '../../domain/transactions';
import { currentMonthKey, monthRange, todayISO } from '../../domain/dates';
import { formatBRL } from '../../domain/money';

const TYPE_FILTERS = [{ value: 'todas', label: 'Todas' }, { value: 'receita', label: 'Receitas' }, { value: 'despesa', label: 'Despesas' }];

// Um cartão só: 3 colunas quando o espaço permite, linhas compactas quando estreito (celular, tablet com menu).
function Totals({ items }) {
  return (
    <Card className="@container mt-10 rounded-kpi">
      <dl className="grid divide-y divide-line @xl:grid-cols-3 @xl:divide-x @xl:divide-y-0">
        {items.map(({ label, cents, tone }) => (
          <div key={label} className="flex items-baseline justify-between gap-3 px-5 py-3.5 @xl:block @xl:px-6 @xl:py-5">
            <dt className="text-sm text-ink-2">{label}</dt>
            <dd className={`whitespace-nowrap text-xl font-bold tabular-nums @xl:mt-1.5 @xl:text-[26px] ${tone}`}>{formatBRL(cents)}</dd>
          </div>
        ))}
      </dl>
    </Card>
  );
}

export default function Transacoes() {
  const [month, setMonth] = useMonthParam();
  const { start, end } = monthRange(month);
  const [type, setType] = useState('todas');
  const [categoryId, setCategoryId] = useState(null);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [toDelete, setToDelete] = useState(null);
  const [ruleEditing, setRuleEditing] = useState(null);
  const [ruleToDelete, setRuleToDelete] = useState(null);

  const monthTransactions = useLiveQuery(() => db.transactions.where('date').between(start, end, true, true).toArray(), [start, end]);
  const categories = useLiveQuery(() => db.categories.toArray(), []);
  const rules = useLiveQuery(() => db.recurrences.toArray(), []);

  const categoriesById = useMemo(() => new Map((categories ?? []).map((c) => [c.id, c])), [categories]);
  const recurrenceIds = useMemo(() => new Set((rules ?? []).map((r) => r.id)), [rules]);
  const filtered = useMemo(() => filterTransactions(monthTransactions ?? [], { type, categoryId, search }), [monthTransactions, type, categoryId, search]);
  const totals = useMemo(() => totalsOf(filtered), [filtered]);
  const groups = useMemo(() => groupByDay(filtered), [filtered]);
  const categoryOptions = (categories ?? []).filter((c) => type === 'todas' || c.type === type);
  const loading = monthTransactions === undefined || categories === undefined;
  const hasFilters = type !== 'todas' || categoryId !== null || search.trim() !== '';
  const defaultDate = month === currentMonthKey() ? todayISO() : `${month}-01`;

  function openNew() { setEditing(null); setFormOpen(true); }
  function openEdit(transaction) { setEditing(transaction); setFormOpen(true); }

  return (
    <>
      <PageHeader
        title="Transações"
        subtitle="Tudo o que entrou e saiu no mês."
        actions={(
          <>
            <MonthSwitcher month={month} onChange={setMonth} />
            <Button variant="primary" onClick={openNew}><Plus size={16} aria-hidden />Nova transação</Button>
          </>
        )}
      />

      <Totals
        items={[
          { label: 'Entradas', cents: totals.incomeCents, tone: 'text-brand' },
          { label: 'Saídas', cents: totals.expenseCents, tone: 'text-expense' },
          { label: 'Saldo', cents: totals.balanceCents, tone: totals.balanceCents < 0 ? 'text-expense' : 'text-ink' },
        ]}
      />

      <Card className="mt-5 p-5 sm:p-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <Segmented label="Filtrar por tipo" options={TYPE_FILTERS} value={type} onChange={(value) => { setType(value); setCategoryId(null); }} />
          <select aria-label="Filtrar por categoria" className={`${inputClass} lg:w-52`} value={categoryId ?? ''} onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : null)}>
            <option value="">Todas as categorias</option>
            {categoryOptions.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <div className="relative lg:ml-auto lg:w-64">
            <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-3" aria-hidden />
            <input type="search" aria-label="Buscar na descrição" placeholder="Buscar descrição" className={`${inputClass} pl-9`} value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>

        <div className="mt-5 min-h-[240px]">
          {loading ? null : groups.length > 0 ? (
            <TransactionList groups={groups} categoriesById={categoriesById} recurrenceIds={recurrenceIds} onEdit={openEdit} onDelete={setToDelete} />
          ) : hasFilters ? (
            <EmptyState icon={Search} title="Nada encontrado" text="Nenhuma transação combina com os filtros deste mês." />
          ) : (
            <EmptyState icon={Inbox} title="Nenhuma transação neste mês" text="Registre receitas e despesas para acompanhar o saldo." action={<Button variant="primary" onClick={openNew}><Plus size={16} aria-hidden />Nova transação</Button>} />
          )}
        </div>
      </Card>

      <Card className="mt-5 p-5 sm:p-6">
        <CardTitle title="Recorrências" subtitle="Lançadas automaticamente todo mês" />
        <div className="mt-3">
          {rules && rules.length > 0
            ? <RecurrenceList rules={rules} categoriesById={categoriesById} onEdit={setRuleEditing} onToggle={(rule) => (rule.active ? pauseRecurrence(rule.id) : resumeRecurrence(rule.id))} onDelete={setRuleToDelete} />
            : <p className="py-4 text-sm text-ink-3">Nenhuma regra ainda. Marque “Repetir todo mês” ao criar uma transação.</p>}
        </div>
      </Card>

      {categories && (
        <TransactionForm open={formOpen} transaction={editing} defaultDate={defaultDate} categories={categories} onClose={() => setFormOpen(false)} />
      )}
      {categories && (
        <RecurrenceForm open={ruleEditing !== null} rule={ruleEditing} categories={categories} onClose={() => setRuleEditing(null)} />
      )}
      <ConfirmDialog
        open={toDelete !== null}
        message={toDelete ? `Excluir “${toDelete.description}”? ${toDelete.recurrenceId && recurrenceIds.has(toDelete.recurrenceId) ? 'A regra continua ativa, mas este lançamento não será refeito. ' : ''}Não dá para desfazer.` : ''}
        onCancel={() => setToDelete(null)}
        onConfirm={async () => { await deleteTransaction(toDelete.id); setToDelete(null); }}
      />
      <ConfirmDialog
        open={ruleToDelete !== null}
        title="Excluir recorrência"
        message={ruleToDelete ? `Excluir a regra “${ruleToDelete.description}”? Os lançamentos já feitos continuam.` : ''}
        onCancel={() => setRuleToDelete(null)}
        onConfirm={async () => { await deleteRecurrence(ruleToDelete.id); setRuleToDelete(null); }}
      />
    </>
  );
}
