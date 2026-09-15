import { Flame, Trophy } from 'lucide-react';
import MonthSwitcher from '../../components/layout/MonthSwitcher';
import Card, { CardTitle } from '../../components/ui/Card';
import { todayISO, weekdayOf } from '../../domain/dates';
import { routineCalendar, routineStreaks } from '../../domain/routine';

const WEEKDAYS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

function dayClass(progress) {
  if (progress === null) return 'border-line bg-surface-2 text-ink-3 hover:border-deco';
  if (progress.percentage >= 80) return 'border-brand-line bg-brand-soft text-brand';
  if (progress.percentage >= 50) return 'border-amber/30 bg-amber/10 text-amber';
  if (progress.percentage > 0) return 'border-expense/30 bg-expense/10 text-expense';
  return 'border-line bg-line text-ink-2';
}

function StreakCard({ icon: Icon, label, value, caption }) {
  return (
    <Card className="p-5 sm:p-6">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-soft text-brand ring-1 ring-brand-line"><Icon size={18} aria-hidden /></span>
        <div>
          <p className="text-sm text-ink-2">{label}</p>
          <p className="mt-0.5 text-[26px] font-bold tabular-nums text-ink">{value} <span className="text-sm font-normal text-ink-3">{value === 1 ? 'dia' : 'dias'}</span></p>
        </div>
      </div>
      <p className="mt-3 text-[13px] leading-relaxed text-ink-3">{caption}</p>
    </Card>
  );
}

export default function Mes({ habits, checks, month, onMonthChange, onOpenDate }) {
  const today = todayISO();
  const calendar = routineCalendar(habits, checks, month, today);
  const streaks = routineStreaks(habits, checks, today);
  const leading = (weekdayOf(`${month}-01`) + 6) % 7;

  return (
    <>
      <div className="flex justify-start sm:justify-end"><MonthSwitcher month={month} onChange={onMonthChange} /></div>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <StreakCard icon={Flame} label="Sequência atual" value={streaks.current} caption="Dias com pelo menos 80%; hoje incompleto não quebra a sequência." />
        <StreakCard icon={Trophy} label="Recorde" value={streaks.record} caption="Sua maior sequência desde a primeira marcação registrada." />
      </div>

      <Card className="mt-5 p-4 sm:p-6">
        <CardTitle title="Constância no mês" subtitle="Verde é 80% ou mais; dias sem rotina ficam neutros." />
        <div className="mt-5 grid grid-cols-7 gap-1.5 sm:gap-2">
          {WEEKDAYS.map((day) => <div key={day} className="pb-1 text-center text-[11px] font-semibold text-ink-3 sm:text-xs">{day}</div>)}
          {Array.from({ length: leading }, (_, index) => <span key={`blank-${index}`} aria-hidden />)}
          {calendar.map(({ date, progress }) => {
            const day = Number(date.slice(8));
            const percentage = progress ? Math.round(progress.percentage) : null;
            return (
              <button
                key={date}
                type="button"
                onClick={() => onOpenDate(date)}
                aria-label={`${date}${percentage === null ? ', sem rotina' : `, ${percentage}% concluído`}`}
                className={`min-h-14 rounded-xl border p-1.5 text-left transition-colors duration-150 sm:min-h-20 sm:p-2.5 ${dayClass(progress)}`}
              >
                <span className="block text-xs font-semibold tabular-nums sm:text-sm">{day}</span>
                <span className="mt-2 block text-[10px] tabular-nums opacity-90 sm:mt-4 sm:text-xs">{percentage === null ? '—' : `${percentage}%`}</span>
              </button>
            );
          })}
        </div>
      </Card>
    </>
  );
}
