import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import Card from '../components/Card';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import { todayISO, currentMonthKey, daysInMonth, weekdayOf } from '../utils/dates';
import { isExpectedOn, currentStreak, bestStreak } from '../utils/streaks';

const WEEKDAYS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
const NEW_FORM = { name: '', icon: '✅', color: '#6366f1', freqMode: 'daily', weekdays: [] };

export default function Habitos() {
  const [form, setForm] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [error, setError] = useState('');

  const habits = useLiveQuery(() => db.habits.filter((h) => !h.archived).toArray(), []) ?? [];
  const logs = useLiveQuery(() => db.habitLogs.toArray(), []) ?? [];

  const today = todayISO();
  const month = currentMonthKey();
  const logsByHabit = {};
  for (const l of logs) (logsByHabit[l.habitId] ??= new Set()).add(l.date);

  // Amendment 1: closeForm helper
  function closeForm() {
    setForm(null);
    setError('');
  }

  async function toggle(habit, iso) {
    if (iso > today) return; // não marcar o futuro
    const existing = await db.habitLogs.where('[habitId+date]').equals([habit.id, iso]).first();
    if (existing) await db.habitLogs.delete(existing.id);
    else await db.habitLogs.add({ habitId: habit.id, date: iso });
  }

  async function save(e) {
    e.preventDefault();
    const name = form.name.trim();
    if (!name) return setError('Dê um nome para o hábito.');
    if (form.freqMode === 'weekdays' && form.weekdays.length === 0)
      return setError('Escolha pelo menos um dia da semana.');
    const frequency = form.freqMode === 'daily' ? 'daily' : [...form.weekdays].sort();
    if (form.id) {
      await db.habits.update(form.id, { name, icon: form.icon, color: form.color, frequency });
    } else {
      await db.habits.add({ name, icon: form.icon, color: form.color, frequency, archived: false, createdAt: today });
    }
    closeForm(); // Amendment 1: use closeForm after successful save
  }

  // Amendment 2: try/finally on delete
  async function remove() {
    try {
      await db.transaction('rw', db.habits, db.habitLogs, async () => {
        await db.habitLogs.where('habitId').equals(toDelete.id).delete();
        await db.habits.delete(toDelete.id);
      });
    } finally {
      setToDelete(null);
    }
  }

  function edit(habit) {
    setForm({
      id: habit.id,
      name: habit.name,
      icon: habit.icon,
      color: habit.color,
      freqMode: habit.frequency === 'daily' ? 'daily' : 'weekdays',
      weekdays: habit.frequency === 'daily' ? [] : habit.frequency,
    });
  }

  // Calendário do mês atual: células alinhadas pelo dia da semana
  function MonthCalendar({ habit, logSet }) {
    const total = daysInMonth(month);
    const offset = weekdayOf(`${month}-01`);
    const cells = [
      ...Array.from({ length: offset }, () => null),
      ...Array.from({ length: total }, (_, i) => `${month}-${String(i + 1).padStart(2, '0')}`),
    ];
    return (
      <div className="mt-3 grid grid-cols-7 gap-1 text-center">
        {WEEKDAYS.map((w, i) => (
          <span key={i} className="text-[10px] font-semibold text-slate-400">{w}</span>
        ))}
        {cells.map((iso, i) => {
          if (!iso) return <span key={`v-${i}`} />;
          const done = logSet.has(iso);
          const expected = isExpectedOn(habit, iso) && iso <= today;
          return (
            <button
              key={iso}
              onClick={() => toggle(habit, iso)}
              disabled={iso > today}
              aria-label={`Dia ${iso.slice(8)}`}
              className={`mx-auto flex h-7 w-7 items-center justify-center rounded-full text-[11px] transition
                ${done ? 'font-bold text-white' : ''}
                ${!done && expected ? 'border-2 border-dashed border-slate-300 text-slate-400 dark:border-slate-600' : ''}
                ${!done && !expected ? 'text-slate-300 dark:text-slate-600' : ''}
                ${iso > today ? 'cursor-default opacity-40' : 'hover:scale-110'}`}
              style={done ? { backgroundColor: habit.color } : undefined}
            >
              {Number(iso.slice(8))}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Hábitos</h1>
        <button onClick={() => setForm({ ...NEW_FORM })}
          className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
          + Novo hábito
        </button>
      </div>

      {habits.length === 0 && (
        <Card><p className="py-6 text-center text-sm text-slate-400">
          Nenhum hábito ainda. Que tal começar com "Beber água"? 💧
        </p></Card>
      )}

      <div className="grid gap-3 lg:grid-cols-2">
        {habits.map((habit) => {
          const logSet = logsByHabit[habit.id] ?? new Set();
          const doneToday = logSet.has(today);
          const expectedToday = isExpectedOn(habit, today);
          const streak = currentStreak(habit, logSet, today);
          const best = bestStreak(habit, logSet, today);
          return (
            <Card key={habit.id}>
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full text-xl"
                  style={{ backgroundColor: `${habit.color}22` }}>{habit.icon}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{habit.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    🔥 {streak} {streak === 1 ? 'dia' : 'dias'} · recorde: {best}
                    {habit.frequency !== 'daily' && ' · dias específicos'}
                  </p>
                </div>
                <button onClick={() => edit(habit)} aria-label="Editar"
                  className="rounded-lg px-2 py-1 text-sm text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700">✏️</button>
                <button onClick={() => setToDelete(habit)} aria-label="Excluir"
                  className="rounded-lg px-2 py-1 text-sm text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/30">🗑️</button>
              </div>

              <button
                onClick={() => toggle(habit, today)}
                className={`mt-3 w-full rounded-xl py-2.5 text-sm font-semibold transition ${
                  doneToday
                    ? 'bg-emerald-600 text-white'
                    : expectedToday
                      ? 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600'
                      : 'bg-slate-50 text-slate-400 dark:bg-slate-800'
                }`}
              >
                {doneToday ? '✓ Feito hoje!' : expectedToday ? 'Marcar como feito hoje' : 'Hoje é dia de descanso 😴'}
              </button>

              <MonthCalendar habit={habit} logSet={logSet} />
            </Card>
          );
        })}
      </div>

      <Modal open={form !== null} title={form?.id ? 'Editar hábito' : 'Novo hábito'} onClose={closeForm}>
        {form && (
          <form onSubmit={save} className="space-y-3">
            <label className="block text-sm font-medium">
              Nome
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Ex: Beber água" autoFocus
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-900" />
            </label>
            <div className="flex gap-3">
              <label className="block flex-1 text-sm font-medium">
                Ícone (emoji)
                <input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} maxLength={4}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-center dark:border-slate-600 dark:bg-slate-900" />
              </label>
              <label className="block text-sm font-medium">
                Cor
                <input type="color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })}
                  className="mt-1 h-10 w-16 cursor-pointer rounded-lg border border-slate-300 dark:border-slate-600" />
              </label>
            </div>
            <fieldset className="text-sm font-medium">
              Frequência
              <div className="mt-1 grid grid-cols-2 gap-2">
                <button type="button" onClick={() => setForm({ ...form, freqMode: 'daily' })}
                  className={`rounded-xl py-2 text-sm font-semibold ${form.freqMode === 'daily' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'}`}>
                  Todos os dias
                </button>
                <button type="button" onClick={() => setForm({ ...form, freqMode: 'weekdays' })}
                  className={`rounded-xl py-2 text-sm font-semibold ${form.freqMode === 'weekdays' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'}`}>
                  Dias específicos
                </button>
              </div>
              {form.freqMode === 'weekdays' && (
                <div className="mt-2 flex justify-between gap-1">
                  {WEEKDAYS.map((w, i) => (
                    <button key={i} type="button"
                      onClick={() => setForm({
                        ...form,
                        weekdays: form.weekdays.includes(i)
                          ? form.weekdays.filter((d) => d !== i)
                          : [...form.weekdays, i],
                      })}
                      className={`h-9 w-9 rounded-full text-sm font-semibold ${
                        form.weekdays.includes(i) ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-300'
                      }`}>
                      {w}
                    </button>
                  ))}
                </div>
              )}
            </fieldset>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <button type="submit" className="w-full rounded-xl bg-indigo-600 py-2.5 font-semibold text-white hover:bg-indigo-700">Salvar</button>
          </form>
        )}
      </Modal>

      <ConfirmDialog
        open={toDelete !== null}
        message={`Excluir o hábito "${toDelete?.name}"? Todo o histórico de dias marcados será removido.`}
        onConfirm={remove}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
