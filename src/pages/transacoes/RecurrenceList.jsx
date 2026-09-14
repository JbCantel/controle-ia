import { Pause, Pencil, Play, Trash2 } from 'lucide-react';
import Badge from '../../components/ui/Badge';
import { IconButton } from '../../components/ui/Button';
import { formatSigned } from '../../domain/money';

export default function RecurrenceList({ rules, categoriesById, onEdit, onToggle, onDelete }) {
  return (
    <ul>
      {rules.map((rule) => {
        const valueClass = `shrink-0 text-sm font-medium tabular-nums ${rule.type === 'receita' ? 'text-brand' : 'text-expense'} ${rule.active ? '' : 'opacity-60'}`;
        return (
          <li key={rule.id} className="flex items-center gap-3 border-t border-line py-3 first:border-t-0">
            <div className="min-w-0 flex-1">
              <p className="flex min-w-0 items-center gap-2 text-sm text-ink">
                <span className="truncate">{rule.description}</span>
                {!rule.active && <Badge>pausada</Badge>}
              </p>
              <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-ink-3">
                {/* No celular o valor desce para esta linha; no desktop fica em coluna própria. */}
                <span className={`${valueClass} sm:hidden`}>{formatSigned(rule.value, rule.type)}</span>
                <span>todo dia {rule.dayOfMonth} · {categoriesById.get(rule.categoryId)?.name ?? 'Sem categoria'}</span>
              </p>
            </div>
            <p className={`${valueClass} hidden sm:block`}>
              {formatSigned(rule.value, rule.type)}
            </p>
            <div className="flex shrink-0">
              <IconButton label={`Editar regra ${rule.description}`} onClick={() => onEdit(rule)}><Pencil size={15} aria-hidden /></IconButton>
              <IconButton label={rule.active ? `Pausar ${rule.description}` : `Retomar ${rule.description}`} onClick={() => onToggle(rule)}>
                {rule.active ? <Pause size={15} aria-hidden /> : <Play size={15} aria-hidden />}
              </IconButton>
              <IconButton label={`Excluir regra ${rule.description}`} className="hover:text-expense" onClick={() => onDelete(rule)}><Trash2 size={15} aria-hidden /></IconButton>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
