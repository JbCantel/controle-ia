import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import Card from '../components/Card';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import MonthPicker from '../components/MonthPicker';
import { formatBRL, parseBRL, centsToBRLInput } from '../utils/money';
import { todayISO, formatDateBR, currentMonthKey } from '../utils/dates';

const newTx = () => ({ type: 'despesa', amountStr: '', date: todayISO(), categoryId: '', description: '' });

export default function Transacoes() {
  const [month, setMonth] = useState(currentMonthKey());
  const [filterType, setFilterType] = useState('todas');
  const [filterCat, setFilterCat] = useState('todas');
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [error, setError] = useState('');

  // Amendment 1 — closeForm helper (stale-error fix)
  function closeForm() {
    setForm(null);
    setError('');
  }

  const categories = useLiveQuery(() => db.categories.toArray(), []) ?? [];
  const txs = useLiveQuery(async () => {
    const list = await db.transactions.where('date').startsWith(month).toArray();
    return list.sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id);
  }, [month]) ?? [];

  const catById = Object.fromEntries(categories.map((c) => [c.id, c]));

  const filtered = txs.filter((t) =>
    (filterType === 'todas' || t.type === filterType) &&
    (filterCat === 'todas' || t.categoryId === Number(filterCat)) &&
    (search === '' || t.description.toLowerCase().includes(search.toLowerCase()))
  );

  const receitas = txs.filter((t) => t.type === 'receita').reduce((s, t) => s + t.amount, 0);
  const despesas = txs.filter((t) => t.type === 'despesa').reduce((s, t) => s + t.amount, 0);

  async function save(e) {
    e.preventDefault();
    const amount = parseBRL(form.amountStr);
    if (isNaN(amount) || amount <= 0) return setError('Informe um valor válido, maior que zero.');
    if (!form.date) return setError('Informe uma data válida.');
    if (!form.categoryId) return setError('Escolha uma categoria.');
    if (!form.description.trim()) return setError('Descreva a transação.');
    const data = {
      type: form.type,
      amount,
      date: form.date,
      categoryId: Number(form.categoryId),
      description: form.description.trim(),
    };
    if (form.id) await db.transactions.update(form.id, data);
    else await db.transactions.add(data);
    closeForm();
  }

  function edit(tx) {
    setForm({
      id: tx.id,
      type: tx.type,
      amountStr: centsToBRLInput(tx.amount),
      date: tx.date,
      categoryId: String(tx.categoryId),
      description: tx.description,
    });
  }

  const formCats = categories.filter((c) => c.type === form?.type);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-bold">Transações</h1>
        <button onClick={() => setForm(newTx())}
          className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
          + Nova transação
        </button>
      </div>

      <div className="flex justify-center">
        <MonthPicker month={month} onChange={setMonth} />
      </div>

      {/* Totais do mês */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="text-center">
          <p className="text-xs text-slate-500 dark:text-slate-400">Receitas</p>
          <p className="mt-1 text-sm font-bold text-emerald-600 sm:text-lg">{formatBRL(receitas)}</p>
        </Card>
        <Card className="text-center">
          <p className="text-xs text-slate-500 dark:text-slate-400">Despesas</p>
          <p className="mt-1 text-sm font-bold text-red-500 sm:text-lg">{formatBRL(despesas)}</p>
        </Card>
        <Card className="text-center">
          <p className="text-xs text-slate-500 dark:text-slate-400">Saldo</p>
          <p className={`mt-1 text-sm font-bold sm:text-lg ${receitas - despesas >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
            {formatBRL(receitas - despesas)}
          </p>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="flex flex-wrap gap-2">
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)}
          className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-900">
          <option value="todas">Todos os tipos</option>
          <option value="receita">Receitas</option>
          <option value="despesa">Despesas</option>
        </select>
        <select value={filterCat} onChange={(e) => setFilterCat(e.target.value)}
          className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-900">
          <option value="todas">Todas as categorias</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
        </select>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar descrição…"
          className="min-w-32 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-900" />
      </Card>

      {/* Lista */}
      <Card>
        {filtered.length === 0 && (
          <p className="py-6 text-center text-sm text-slate-400">Nenhuma transação neste mês. 📭</p>
        )}
        <ul className="divide-y divide-slate-100 dark:divide-slate-700">
          {filtered.map((tx) => {
            const cat = catById[tx.categoryId];
            return (
              <li key={tx.id} className="flex items-center gap-3 py-2.5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-lg"
                  style={{ backgroundColor: `${cat?.color ?? '#94a3b8'}22` }}>
                  {cat?.icon ?? '❓'}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{tx.description}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {cat?.name ?? 'Sem categoria'} · {formatDateBR(tx.date)}
                  </p>
                </div>
                <span className={`font-semibold ${tx.type === 'receita' ? 'text-emerald-600' : 'text-red-500'}`}>
                  {tx.type === 'receita' ? '+' : '−'}{formatBRL(tx.amount)}
                </span>
                <button onClick={() => edit(tx)} aria-label="Editar"
                  className="rounded-lg px-2 py-1 text-sm text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700">✏️</button>
                <button onClick={() => setToDelete(tx)} aria-label="Excluir"
                  className="rounded-lg px-2 py-1 text-sm text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/30">🗑️</button>
              </li>
            );
          })}
        </ul>
      </Card>

      {/* Formulário */}
      <Modal open={form !== null} title={form?.id ? 'Editar transação' : 'Nova transação'} onClose={closeForm}>
        {form && (
          <form onSubmit={save} className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              {['despesa', 'receita'].map((t) => (
                <button key={t} type="button"
                  onClick={() => setForm({ ...form, type: t, categoryId: '' })}
                  className={`rounded-xl py-2 text-sm font-semibold capitalize ${
                    form.type === t
                      ? t === 'receita' ? 'bg-emerald-600 text-white' : 'bg-red-500 text-white'
                      : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                  }`}>
                  {t}
                </button>
              ))}
            </div>
            <label className="block text-sm font-medium">
              Valor (R$)
              <input value={form.amountStr} onChange={(e) => setForm({ ...form, amountStr: e.target.value })}
                inputMode="decimal" placeholder="0,00" autoFocus
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-lg dark:border-slate-600 dark:bg-slate-900" />
            </label>
            <label className="block text-sm font-medium">
              Data
              <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })}
                required
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-900" />
            </label>
            <label className="block text-sm font-medium">
              Categoria
              <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-900">
                <option value="">Selecione…</option>
                {formCats.map((c) => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
              </select>
            </label>
            <label className="block text-sm font-medium">
              Descrição
              <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Ex: Mercado da semana"
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-900" />
            </label>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <button type="submit" className="w-full rounded-xl bg-indigo-600 py-2.5 font-semibold text-white hover:bg-indigo-700">
              Salvar
            </button>
          </form>
        )}
      </Modal>

      <ConfirmDialog
        open={toDelete !== null}
        message={`Excluir "${toDelete?.description}" (${toDelete ? formatBRL(toDelete.amount) : ''})?`}
        onConfirm={async () => {
          try { await db.transactions.delete(toDelete.id); }
          finally { setToDelete(null); }
        }}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
