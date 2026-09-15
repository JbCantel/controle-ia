import { ChevronDown, Trash2 } from 'lucide-react';
import { IconButton } from '../../components/ui/Button';
import { formatDateBR } from '../../domain/dates';
import { formatBRL, toCents } from '../../domain/money';

export default function ContributionHistory({ contributions, onDelete }) {
  const sorted = [...contributions].sort((a, b) => (a.date === b.date ? b.id - a.id : b.date.localeCompare(a.date)));

  return (
    <details className="group mt-5 border-t border-line pt-4">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-lg py-1 text-sm font-medium text-ink-2 hover:text-ink">
        <span>Histórico <span className="font-normal text-ink-3">({sorted.length})</span></span>
        <ChevronDown size={16} className="transition-transform duration-150 group-open:rotate-180" aria-hidden />
      </summary>
      {sorted.length > 0 ? (
        <ul className="mt-3 divide-y divide-line">
          {sorted.map((contribution) => {
            const cents = toCents(contribution.value);
            const isWithdrawal = cents < 0;
            return (
              <li key={contribution.id} className="flex items-center gap-3 py-3 first:pt-1">
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-ink-2">{isWithdrawal ? 'Resgate' : 'Aporte'}</p>
                  <p className="mt-0.5 text-xs text-ink-3">{formatDateBR(contribution.date)}</p>
                </div>
                <span className={`text-sm font-semibold tabular-nums ${isWithdrawal ? 'text-expense' : 'text-brand'}`}>
                  {isWithdrawal ? '- ' : '+ '}{formatBRL(Math.abs(cents))}
                </span>
                <IconButton label={`Excluir ${isWithdrawal ? 'resgate' : 'aporte'} de ${formatDateBR(contribution.date)}`} onClick={() => onDelete(contribution)}>
                  <Trash2 size={15} aria-hidden />
                </IconButton>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="mt-3 text-[13px] text-ink-3">Nenhum movimento registrado.</p>
      )}
    </details>
  );
}
