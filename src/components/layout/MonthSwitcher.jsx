import { ChevronLeft, ChevronRight } from 'lucide-react';
import { addMonths, monthLabel } from '../../domain/dates';
import { IconButton } from '../ui/Button';

export default function MonthSwitcher({ month, onChange }) {
  return (
    <div className="inline-flex h-10 items-center rounded-full border border-line">
      <IconButton label="Mês anterior" onClick={() => onChange(addMonths(month, -1))}><ChevronLeft size={16} aria-hidden /></IconButton>
      <span aria-live="polite" className="inline-block min-w-[9.5rem] text-center text-[13px] text-ink first-letter:uppercase">
        {monthLabel(month)}
      </span>
      <IconButton label="Próximo mês" onClick={() => onChange(addMonths(month, 1))}><ChevronRight size={16} aria-hidden /></IconButton>
    </div>
  );
}
