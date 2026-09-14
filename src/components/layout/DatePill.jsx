import { CalendarDays } from 'lucide-react';
import { formatLongDate, todayISO } from '../../domain/dates';

export default function DatePill() {
  const today = todayISO();
  return (
    <span className="inline-flex h-10 items-center gap-2 rounded-full border border-line px-4 text-[13px] text-ink-2">
      <CalendarDays size={15} strokeWidth={1.75} aria-hidden />
      <time dateTime={today} className="tabular-nums">{formatLongDate(today)}</time>
    </span>
  );
}
