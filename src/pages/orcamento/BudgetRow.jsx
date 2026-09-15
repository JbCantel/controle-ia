import { AlertTriangle, CheckCircle2, Pencil, XCircle } from 'lucide-react';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import ProgressBar from '../../components/ui/ProgressBar';
import { formatBRL } from '../../domain/money';

const STATUS_META = {
  ok: { icon: CheckCircle2, className: 'text-brand', label: 'Dentro do limite' },
  alerta: { icon: AlertTriangle, className: 'text-amber', label: 'Atenção ao limite' },
  estourado: { icon: XCircle, className: 'text-expense', label: 'Limite atingido' },
};

function statusText(row) {
  if (row.status === 'estourado') {
    return row.overCents > 0 ? `Estourou ${formatBRL(row.overCents)}` : 'Limite atingido';
  }
  if (row.status === 'alerta') return `${formatBRL(row.limitCents - row.spentCents)} restantes`;
  return `${formatBRL(row.limitCents - row.spentCents)} disponíveis`;
}

export default function BudgetRow({ row, onEdit }) {
  const { category } = row;

  return (
    <li className="grid gap-4 border-t border-line py-5 first:border-t-0 first:pt-0 last:pb-0 lg:grid-cols-[minmax(180px,0.8fr)_minmax(260px,1.4fr)_auto] lg:items-center">
      <div className="flex min-w-0 items-center gap-3">
        <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: category.color }} aria-hidden />
        <div className="min-w-0">
          <p className="truncate font-medium text-ink">{category.name}</p>
          <p className="mt-0.5 text-[13px] text-ink-3">{formatBRL(row.spentCents)} gastos no mês</p>
        </div>
        {row.onlyThisMonth && <Badge className="shrink-0">só este mês</Badge>}
      </div>

      {row.limitCents === null ? (
        <div className="text-sm text-ink-3">Sem um limite definido para este mês.</div>
      ) : (
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
            <p className="text-sm text-ink-2">
              <span className="font-semibold tabular-nums text-ink">{formatBRL(row.spentCents)}</span> de {formatBRL(row.limitCents)}
            </p>
            {(() => {
              const meta = STATUS_META[row.status];
              const Icon = meta.icon;
              return (
                <span className={`inline-flex items-center gap-1.5 text-[13px] font-medium ${meta.className}`}>
                  <Icon size={14} aria-hidden />{statusText(row)}
                </span>
              );
            })()}
          </div>
          <ProgressBar
            value={row.percentage}
            status={row.status}
            label={`${STATUS_META[row.status].label}. ${Math.round(row.percentage)}% do limite usado.`}
          />
        </div>
      )}

      <Button size="sm" className="justify-self-start lg:justify-self-end" onClick={() => onEdit(row)}>
        {row.limitCents === null ? 'Definir limite' : <><Pencil size={14} aria-hidden />Editar limite</>}
      </Button>
    </li>
  );
}
