import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import Card from '../components/Card';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import ProgressBar from '../components/ProgressBar';
import { formatBRL, parseBRL } from '../utils/money';
import { todayISO, formatDateBR } from '../utils/dates';

export default function Metas() {
  const [goalForm, setGoalForm] = useState(null);     // { id?, name, targetStr }
  const [aporteForm, setAporteForm] = useState(null); // { goal, amountStr, date }
  const [toDelete, setToDelete] = useState(null);
  const [expanded, setExpanded] = useState(null);     // goalId expandido
  const [error, setError] = useState('');

  // Amendment 1: close helpers that also clear error state
  function closeGoalForm() {
    setGoalForm(null);
    setError('');
  }

  function closeAporteForm() {
    setAporteForm(null);
    setError('');
  }

  const goals = useLiveQuery(() => db.goals.toArray(), []) ?? [];
  const contributions = useLiveQuery(() => db.contributions.toArray(), []) ?? [];

  // Self-review: contribsByGoal grouping
  const contribsByGoal = {};
  for (const c of contributions) (contribsByGoal[c.goalId] ??= []).push(c);

  async function saveGoal(e) {
    e.preventDefault();
    const name = goalForm.name.trim();
    const target = parseBRL(goalForm.targetStr);
    if (!name) return setError('Dê um nome para a meta.');
    if (isNaN(target) || target <= 0) return setError('Informe um valor alvo válido.');
    if (goalForm.id) await db.goals.update(goalForm.id, { name, targetAmount: target });
    else await db.goals.add({ name, targetAmount: target, createdAt: todayISO() });
    // Amendment 1: use helper to also clear error
    closeGoalForm();
  }

  async function saveAporte(e) {
    e.preventDefault();
    const amount = parseBRL(aporteForm.amountStr);
    if (isNaN(amount) || amount <= 0) return setError('Informe um valor válido.');
    // Amendment 2: validate date
    if (!aporteForm.date) return setError('Informe uma data válida.');
    await db.contributions.add({ goalId: aporteForm.goal.id, amount, date: aporteForm.date });
    // Amendment 1: use helper to also clear error
    closeAporteForm();
  }

  async function removeGoal() {
    // Amendment 3: try/finally so toDelete is cleared even if transaction fails
    try {
      await db.transaction('rw', db.goals, db.contributions, async () => {
        await db.contributions.where('goalId').equals(toDelete.id).delete();
        await db.goals.delete(toDelete.id);
      });
    } finally {
      setToDelete(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Metas</h1>
        <button onClick={() => setGoalForm({ name: '', targetStr: '' })}
          className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
          + Nova meta
        </button>
      </div>

      {goals.length === 0 && (
        <Card><p className="py-6 text-center text-sm text-slate-400">
          Nenhuma meta ainda. Crie uma, tipo "Reserva de emergência". 🏆
        </p></Card>
      )}

      {goals.map((goal) => {
        const list = (contribsByGoal[goal.id] ?? []).sort((a, b) => b.date.localeCompare(a.date));
        const total = list.reduce((s, c) => s + c.amount, 0);
        // Self-review: pct calc Math.round((total / goal.targetAmount) * 100)
        const pct = Math.round((total / goal.targetAmount) * 100);
        // Self-review: done state total >= goal.targetAmount
        const done = total >= goal.targetAmount;
        return (
          <Card key={goal.id} className={done ? 'ring-2 ring-emerald-500' : ''}>
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-semibold">{done && '🎉 '}{goal.name}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {formatBRL(total)} de {formatBRL(goal.targetAmount)} · {pct}%
                  {done && <span className="ml-1 font-semibold text-emerald-600">Concluída!</span>}
                </p>
              </div>
              <div className="flex gap-1">
                <button onClick={() => setGoalForm({ id: goal.id, name: goal.name, targetStr: (goal.targetAmount / 100).toFixed(2).replace('.', ',') })}
                  aria-label="Editar" className="rounded-lg px-2 py-1 text-sm text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700">✏️</button>
                <button onClick={() => setToDelete({ ...goal, total })}
                  aria-label="Excluir" className="rounded-lg px-2 py-1 text-sm text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/30">🗑️</button>
              </div>
            </div>
            {/* Self-review: ProgressBar value capped at targetAmount so bar never overflows */}
            <div className="mt-3"><ProgressBar value={Math.min(total, goal.targetAmount)} max={goal.targetAmount} /></div>
            <div className="mt-3 flex gap-2">
              <button onClick={() => setAporteForm({ goal, amountStr: '', date: todayISO() })}
                className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-emerald-700">
                + Aporte
              </button>
              <button onClick={() => setExpanded(expanded === goal.id ? null : goal.id)}
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700">
                {expanded === goal.id ? 'Ocultar aportes' : `Ver aportes (${list.length})`}
              </button>
            </div>
            {expanded === goal.id && (
              <ul className="mt-3 divide-y divide-slate-100 border-t border-slate-100 pt-1 dark:divide-slate-700 dark:border-slate-700">
                {list.length === 0 && <li className="py-2 text-sm text-slate-400">Nenhum aporte ainda.</li>}
                {list.map((c) => (
                  <li key={c.id} className="flex items-center justify-between py-2 text-sm">
                    <span className="text-slate-500 dark:text-slate-400">{formatDateBR(c.date)}</span>
                    <span className="font-medium text-emerald-600">+{formatBRL(c.amount)}</span>
                    {/* Amendment 3: individual aporte delete (inline, simple — no try/finally needed as no state to clean after) */}
                    <button onClick={() => db.contributions.delete(c.id)} aria-label="Excluir aporte"
                      className="rounded px-1.5 text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/30">🗑️</button>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        );
      })}

      {/* Amendment 1: onClose uses closeGoalForm helper to also clear error */}
      <Modal open={goalForm !== null} title={goalForm?.id ? 'Editar meta' : 'Nova meta'} onClose={closeGoalForm}>
        {goalForm && (
          <form onSubmit={saveGoal} className="space-y-3">
            <label className="block text-sm font-medium">
              Nome
              <input value={goalForm.name} onChange={(e) => setGoalForm({ ...goalForm, name: e.target.value })}
                placeholder="Ex: Reserva de emergência" autoFocus
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-900" />
            </label>
            <label className="block text-sm font-medium">
              Valor alvo (R$)
              <input value={goalForm.targetStr} onChange={(e) => setGoalForm({ ...goalForm, targetStr: e.target.value })}
                inputMode="decimal" placeholder="5.000,00"
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-lg dark:border-slate-600 dark:bg-slate-900" />
            </label>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <button type="submit" className="w-full rounded-xl bg-indigo-600 py-2.5 font-semibold text-white hover:bg-indigo-700">Salvar</button>
          </form>
        )}
      </Modal>

      {/* Amendment 1: onClose uses closeAporteForm helper to also clear error */}
      <Modal open={aporteForm !== null} title={`Aporte — ${aporteForm?.goal.name}`} onClose={closeAporteForm}>
        {aporteForm && (
          <form onSubmit={saveAporte} className="space-y-3">
            <label className="block text-sm font-medium">
              Valor (R$)
              <input value={aporteForm.amountStr} onChange={(e) => setAporteForm({ ...aporteForm, amountStr: e.target.value })}
                inputMode="decimal" placeholder="0,00" autoFocus
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-lg dark:border-slate-600 dark:bg-slate-900" />
            </label>
            <label className="block text-sm font-medium">
              Data
              {/* Amendment 2: required attribute on date input */}
              <input type="date" value={aporteForm.date} onChange={(e) => setAporteForm({ ...aporteForm, date: e.target.value })}
                required
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-900" />
            </label>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <button type="submit" className="w-full rounded-xl bg-emerald-600 py-2.5 font-semibold text-white hover:bg-emerald-700">
              Registrar aporte
            </button>
          </form>
        )}
      </Modal>

      <ConfirmDialog
        open={toDelete !== null}
        message={`Excluir a meta "${toDelete?.name}"? Os ${toDelete ? formatBRL(toDelete.total) : ''} em aportes registrados também serão removidos.`}
        onConfirm={removeGoal}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
