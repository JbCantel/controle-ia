import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import Card from '../components/Card';
import Modal from '../components/Modal';
import MonthPicker from '../components/MonthPicker';
import ProgressBar from '../components/ProgressBar';
import { formatBRL, parseBRL, centsToBRLInput } from '../utils/money';
import { currentMonthKey } from '../utils/dates';

export default function Orcamento() {
  const [month, setMonth] = useState(currentMonthKey());
  const [editing, setEditing] = useState(null); // { category, limitStr }
  const [error, setError] = useState('');

  // Amendment 1: helper clears both editing and error state
  function closeEditing() {
    setEditing(null);
    setError('');
  }

  const categories = useLiveQuery(
    () => db.categories.where('type').equals('despesa').toArray(), []) ?? [];
  const budgets = useLiveQuery(() => db.budgets.toArray(), []) ?? [];
  const txs = useLiveQuery(
    () => db.transactions.where('date').startsWith(month).toArray(), [month]) ?? [];

  const budgetByCat = Object.fromEntries(budgets.map((b) => [b.categoryId, b]));
  const spentByCat = {};
  for (const t of txs) {
    // Self-review: only count despesa transactions
    if (t.type === 'despesa') spentByCat[t.categoryId] = (spentByCat[t.categoryId] ?? 0) + t.amount;
  }

  async function saveLimit(e) {
    e.preventDefault();
    const limit = parseBRL(editing.limitStr);
    if (isNaN(limit) || limit <= 0) return setError('Informe um limite válido, maior que zero.');
    // Self-review: upsert — update existing budget or add new one
    const existing = budgetByCat[editing.category.id];
    if (existing) await db.budgets.update(existing.id, { monthlyLimit: limit });
    else await db.budgets.add({ categoryId: editing.category.id, monthlyLimit: limit });
    closeEditing();
  }

  async function removeLimit() {
    // Amendment 3: try/finally so editing is cleared even if delete fails
    try {
      const existing = budgetByCat[editing.category.id];
      if (existing) await db.budgets.delete(existing.id);
    } finally {
      setEditing(null);
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Orçamento</h1>
      <div className="flex justify-center">
        <MonthPicker month={month} onChange={setMonth} />
      </div>

      {categories.length === 0 && (
        <Card><p className="py-4 text-center text-sm text-slate-400">Crie categorias de despesa primeiro. 🏷️</p></Card>
      )}

      <div className="space-y-3">
        {categories.map((cat) => {
          const budget = budgetByCat[cat.id];
          const spent = spentByCat[cat.id] ?? 0;
          const over = budget && spent > budget.monthlyLimit;
          return (
            <Card key={cat.id}>
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full text-lg"
                  style={{ backgroundColor: `${cat.color}22` }}>{cat.icon}</span>
                <div className="flex-1">
                  <p className="font-medium">{cat.name}</p>
                  {budget ? (
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {formatBRL(spent)} de {formatBRL(budget.monthlyLimit)}
                      {over && <span className="ml-1 font-semibold text-red-500">· estourou! 🚨</span>}
                    </p>
                  ) : (
                    <p className="text-xs text-slate-400">Sem orçamento definido · gasto: {formatBRL(spent)}</p>
                  )}
                </div>
                <button
                  onClick={() => setEditing({
                    category: cat,
                    limitStr: budget ? centsToBRLInput(budget.monthlyLimit) : '',
                  })}
                  className="rounded-lg px-3 py-1.5 text-sm font-medium text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-900/30">
                  {budget ? 'Editar' : 'Definir'}
                </button>
              </div>
              {budget && (
                <div className="mt-3">
                  <ProgressBar value={spent} max={budget.monthlyLimit} />
                  <p className={`mt-1 text-right text-xs ${over ? 'font-semibold text-red-500' : 'text-slate-500 dark:text-slate-400'}`}>
                    {Math.round((spent / budget.monthlyLimit) * 100)}%
                  </p>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Amendment 1: onClose uses closeEditing helper to also clear error */}
      <Modal open={editing !== null} title={`Orçamento — ${editing?.category.name}`} onClose={closeEditing}>
        {editing && (
          <form onSubmit={saveLimit} className="space-y-3">
            <label className="block text-sm font-medium">
              Limite mensal (R$)
              <input value={editing.limitStr}
                onChange={(e) => setEditing({ ...editing, limitStr: e.target.value })}
                inputMode="decimal" placeholder="0,00" autoFocus
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-lg dark:border-slate-600 dark:bg-slate-900" />
            </label>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <button type="submit" className="w-full rounded-xl bg-indigo-600 py-2.5 font-semibold text-white hover:bg-indigo-700">
              Salvar limite
            </button>
            {budgetByCat[editing.category.id] && (
              <button type="button" onClick={removeLimit}
                className="w-full rounded-xl py-2 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30">
                Remover orçamento desta categoria
              </button>
            )}
          </form>
        )}
      </Modal>
    </div>
  );
}
