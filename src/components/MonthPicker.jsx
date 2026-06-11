import { addMonths, monthLabel } from '../utils/dates';

export default function MonthPicker({ month, onChange }) {
  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => onChange(addMonths(month, -1))}
        aria-label="Mês anterior"
        className="rounded-lg px-2.5 py-1.5 hover:bg-slate-200 dark:hover:bg-slate-700"
      >
        ◀
      </button>
      <span className="inline-block min-w-36 text-center text-sm font-semibold first-letter:uppercase">{monthLabel(month)}</span>
      <button
        onClick={() => onChange(addMonths(month, 1))}
        aria-label="Próximo mês"
        className="rounded-lg px-2.5 py-1.5 hover:bg-slate-200 dark:hover:bg-slate-700"
      >
        ▶
      </button>
    </div>
  );
}
