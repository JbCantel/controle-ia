import { CalendarDays } from 'lucide-react';
import { formatLongDate, todayISO } from '../../domain/dates';

export default function DatePill() {
  const today = todayISO();
  return (
    <span className="inline-flex h-11 items-center gap-2 rounded-full border border-line bg-surface px-4 text-sm text-ink-2">
      <CalendarDays size={15} strokeWidth={1.75} aria-hidden />
      <time dateTime={today} className="tabular-nums">{formatLongDate(today)}</time>
    </span>
  );
}
