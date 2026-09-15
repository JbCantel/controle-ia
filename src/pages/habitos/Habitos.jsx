import { useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useSearchParams } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';
import Tabs from '../../components/ui/Tabs';
import Hoje from './Hoje';
import Semana from './Semana';
import Mes from './Mes';
import { db } from '../../db/db';
import { currentMonthKey, todayISO, weekdayKey } from '../../domain/dates';
import { ROUTINE_DAYS } from '../../domain/routine';

const TABS = [
  { value: 'hoje', label: 'Hoje' },
  { value: 'semana', label: 'Semana' },
  { value: 'mes', label: 'Mês' },
];

export default function Habitos() {
  const [params, setParams] = useSearchParams();
  const rawTab = params.get('aba');
  const tab = TABS.some((item) => item.value === rawTab) ? rawTab : 'hoje';
  const rawDate = params.get('data');
  const date = /^\d{4}-\d{2}-\d{2}$/.test(rawDate || '') ? rawDate : todayISO();
  const rawMonth = params.get('mes');
  const month = /^\d{4}-\d{2}$/.test(rawMonth || '') ? rawMonth : currentMonthKey();
  const rawDay = params.get('dia');
  const selectedDay = ROUTINE_DAYS.includes(rawDay) ? rawDay : weekdayKey(todayISO());

  const updateParams = useCallback((changes) => {
    setParams((current) => {
      const next = new URLSearchParams(current);
      for (const [key, value] of Object.entries(changes)) {
        if (value === null) next.delete(key);
        else next.set(key, value);
      }
      return next;
    }, { replace: true });
  }, [setParams]);

  const data = useLiveQuery(async () => {
    const [habits, checks] = await Promise.all([db.habits.toArray(), db.habitChecks.toArray()]);
    return { habits, checks };
  }, []);

  return (
    <>
      <PageHeader title="Rotina" subtitle="Organize seus blocos de tempo e acompanhe a constância sem transformar o dia em cobrança." />
      <div className="mt-8"><Tabs label="Visão da rotina" tabs={TABS} value={tab} onChange={(value) => updateParams({ aba: value })} idBase="routine-tab" panelId="routine-panel" /></div>

      <div id="routine-panel" className="mt-5 min-h-[460px]" role="tabpanel" aria-labelledby={`routine-tab-${tab}`} tabIndex={0}>
        {!data ? (
          <div aria-busy="true" />
        ) : tab === 'hoje' ? (
          <Hoje habits={data.habits} checks={data.checks} date={date} onDateChange={(next) => updateParams({ data: next })} onOpenWeek={() => updateParams({ aba: 'semana' })} />
        ) : tab === 'semana' ? (
          <Semana habits={data.habits} selectedDay={selectedDay} onDayChange={(day) => updateParams({ dia: day })} />
        ) : (
          <Mes habits={data.habits} checks={data.checks} month={month} onMonthChange={(next) => updateParams({ mes: next })} onOpenDate={(next) => updateParams({ aba: 'hoje', data: next })} />
        )}
      </div>
    </>
  );
}
