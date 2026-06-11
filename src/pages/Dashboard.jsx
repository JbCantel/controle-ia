import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Link } from 'react-router-dom';
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip,
  BarChart, Bar, XAxis, YAxis, Legend, LineChart, Line, CartesianGrid,
} from 'recharts';
import { db } from '../db/db';
import Card from '../components/Card';
import MonthPicker from '../components/MonthPicker';
import { formatBRL } from '../utils/money';
import { currentMonthKey, addMonths, monthKey, monthLabel, monthShort, lastNMonths, todayISO } from '../utils/dates';
import { buildSummary } from '../utils/summary';
import { isExpectedOn, currentStreak } from '../utils/streaks';

const tooltipFmt = (v) => formatBRL(Math.round(v * 100));

export default function Dashboard() {
  const [month, setMonth] = useState(currentMonthKey());

  const allTx = useLiveQuery(() => db.transactions.toArray(), []) ?? [];
  const categories = useLiveQuery(() => db.categories.toArray(), []) ?? [];
  const budgets = useLiveQuery(() => db.budgets.toArray(), []) ?? [];
  const habits = useLiveQuery(() => db.habits.filter((h) => !h.archived).toArray(), []) ?? [];
  const habitLogs = useLiveQuery(() => db.habitLogs.toArray(), []) ?? [];

  const today = todayISO();
  const monthTx = allTx.filter((t) => monthKey(t.date) === month);
  const prevMonth = addMonths(month, -1);
  const prevTx = allTx.filter((t) => monthKey(t.date) === prevMonth);

  const receitas = monthTx.filter((t) => t.type === 'receita').reduce((s, t) => s + t.amount, 0);
  const despesas = monthTx.filter((t) => t.type === 'despesa').reduce((s, t) => s + t.amount, 0);

  // Pizza: despesas do mês por categoria
  const byCat = {};
  for (const t of monthTx) {
    if (t.type === 'despesa') byCat[t.categoryId] = (byCat[t.categoryId] ?? 0) + t.amount;
  }
  const pieData = Object.entries(byCat).map(([id, amount]) => {
    const cat = categories.find((c) => c.id === Number(id));
    return { name: cat?.name ?? 'Outros', value: amount / 100, color: cat?.color ?? '#94a3b8' };
  }).sort((a, b) => b.value - a.value);

  // Barras: receitas vs despesas, últimos 6 meses
  const months6 = lastNMonths(6);
  const barData = months6.map((k) => {
    const txs = allTx.filter((t) => monthKey(t.date) === k);
    return {
      name: monthShort(k),
      Receitas: txs.filter((t) => t.type === 'receita').reduce((s, t) => s + t.amount, 0) / 100,
      Despesas: txs.filter((t) => t.type === 'despesa').reduce((s, t) => s + t.amount, 0) / 100,
    };
  });

  // Linha: saldo acumulado (todo o histórico, exibindo os últimos 6 meses)
  const monthlyNet = {};
  for (const t of allTx) {
    const k = monthKey(t.date);
    monthlyNet[k] = (monthlyNet[k] ?? 0) + (t.type === 'receita' ? t.amount : -t.amount);
  }
  let acc = 0;
  const cumulative = {};
  for (const k of Object.keys(monthlyNet).sort()) {
    acc += monthlyNet[k];
    cumulative[k] = acc;
  }
  let carry = 0;
  for (const k of Object.keys(cumulative).sort()) {
    if (k < months6[0]) carry = cumulative[k];
  }
  let lineAcc = carry;
  const lineData = months6.map((k) => {
    lineAcc += monthlyNet[k] ?? 0;
    return { name: monthShort(k), Saldo: lineAcc / 100 };
  });

  const summary = buildSummary({
    monthTx, prevTx,
    prevLabel: monthLabel(prevMonth).split(' de ')[0],
    categories, budgets,
  });

  const todaysHabits = habits.filter((h) => isExpectedOn(h, today));
  const logsByHabit = {};
  for (const l of habitLogs) (logsByHabit[l.habitId] ??= new Set()).add(l.date);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <MonthPicker month={month} onChange={setMonth} />
      </div>

      {/* Cards do mês */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="text-center">
          <p className="text-xs text-slate-500 dark:text-slate-400">Receitas</p>
          <p className="mt-1 text-sm font-bold text-emerald-600 sm:text-xl">{formatBRL(receitas)}</p>
        </Card>
        <Card className="text-center">
          <p className="text-xs text-slate-500 dark:text-slate-400">Despesas</p>
          <p className="mt-1 text-sm font-bold text-red-500 sm:text-xl">{formatBRL(despesas)}</p>
        </Card>
        <Card className="text-center">
          <p className="text-xs text-slate-500 dark:text-slate-400">Saldo do mês</p>
          <p className={`mt-1 text-sm font-bold sm:text-xl ${receitas - despesas >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
            {formatBRL(receitas - despesas)}
          </p>
        </Card>
      </div>

      {/* Resumo Inteligente */}
      {summary.length > 0 && (
        <Card className="border-l-4 border-indigo-500">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-indigo-500">💡 Resumo do mês</h2>
          <ul className="space-y-1.5 text-sm">
            {summary.map((s, i) => <li key={i}>{s}</li>)}
          </ul>
        </Card>
      )}

      {/* Hábitos de hoje */}
      {todaysHabits.length > 0 && (
        <Card>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Hábitos de hoje</h2>
            <Link to="/habitos" className="text-xs font-medium text-indigo-500 hover:underline">ver todos →</Link>
          </div>
          <div className="flex flex-wrap gap-2">
            {todaysHabits.map((h) => {
              const logSet = logsByHabit[h.id] ?? new Set();
              const done = logSet.has(today);
              return (
                <span key={h.id}
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium ${
                    done ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                         : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-300'
                  }`}>
                  {h.icon} {h.name} · 🔥{currentStreak(h, logSet, today)}
                  {done && ' ✓'}
                </span>
              );
            })}
          </div>
        </Card>
      )}

      {/* Gráficos */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Gastos por categoria — {monthLabel(month)}
          </h2>
          {pieData.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-400">Sem despesas neste mês. 🎉</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2}>
                  {pieData.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie>
                <Tooltip formatter={tooltipFmt} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Receitas vs Despesas — últimos 6 meses
          </h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
              <XAxis dataKey="name" fontSize={12} />
              <YAxis fontSize={11} tickFormatter={(v) => `${Math.round(v / 1000)}k`} width={32} />
              <Tooltip formatter={tooltipFmt} />
              <Legend />
              <Bar dataKey="Receitas" fill="#10b981" radius={[6, 6, 0, 0]} />
              <Bar dataKey="Despesas" fill="#ef4444" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="lg:col-span-2">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Evolução do saldo acumulado
          </h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={lineData}>
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
              <XAxis dataKey="name" fontSize={12} />
              <YAxis fontSize={11} tickFormatter={(v) => `${Math.round(v / 1000)}k`} width={32} />
              <Tooltip formatter={tooltipFmt} />
              <Line type="monotone" dataKey="Saldo" stroke="#6366f1" strokeWidth={2.5} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}
