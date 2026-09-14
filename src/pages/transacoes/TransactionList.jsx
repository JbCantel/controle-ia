import { ArrowDownLeft, ArrowUpRight, Pencil, Repeat, Trash2 } from 'lucide-react';
import Badge from '../../components/ui/Badge';
import { IconButton } from '../../components/ui/Button';
import { formatDayHeader } from '../../domain/dates';
import { formatSigned } from '../../domain/money';

export default function TransactionList({ groups, categoriesById, recurrenceIds, onEdit, onDelete }) {
  return (
    <div className="space-y-5">
      {groups.map((group) => (
        <section key={group.date} aria-label={formatDayHeader(group.date)}>
          <h3 className="mb-1 text-sm font-medium text-ink-3">{formatDayHeader(group.date)}</h3>
          <ul>
            {group.items.map((t) => {
              const category = categoriesById.get(t.categoryId);
              const color = category?.color;
              const Arrow = t.type === 'receita' ? ArrowUpRight : ArrowDownLeft;
              const valueClass = `shrink-0 text-[15px] font-semibold tabular-nums ${t.type === 'receita' ? 'text-brand' : 'text-expense'}`;
              return (
                <li key={t.id} className="flex items-center gap-3 border-t border-line py-3.5 first:border-t-0">
                  <span
                    className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-full bg-line text-ink-2 sm:flex"
                    style={color ? { backgroundColor: `color-mix(in srgb, ${color} 12%, transparent)`, color } : undefined}
                  >
                    <Arrow size={16} aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[15px] font-medium text-ink">{t.description}</p>
                    <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-ink-3">
                      {/* No celular o valor desce para esta linha; no desktop fica em coluna própria. */}
                      <span className={`${valueClass} sm:hidden`}>{formatSigned(t.value, t.type)}</span>
                      <span>{category?.name ?? 'Sem categoria'}</span>
                      {t.recurrenceId && recurrenceIds.has(t.recurrenceId) && <Badge><Repeat size={11} aria-hidden />recorrente</Badge>}
                    </p>
                  </div>
                  <p className={`${valueClass} hidden sm:block`}>
                    {formatSigned(t.value, t.type)}
                  </p>
                  <div className="flex shrink-0">
                    <IconButton label={`Editar ${t.description}`} onClick={() => onEdit(t)}><Pencil size={15} aria-hidden /></IconButton>
                    <IconButton label={`Excluir ${t.description}`} className="hover:text-expense" onClick={() => onDelete(t)}><Trash2 size={15} aria-hidden /></IconButton>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
