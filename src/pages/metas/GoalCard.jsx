import { CalendarDays, CheckCircle2, Pencil, Trash2 } from 'lucide-react';
import Badge from '../../components/ui/Badge';
import Button, { IconButton } from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import ProgressBar from '../../components/ui/ProgressBar';
import ContributionHistory from './ContributionHistory';
import { formatLongDate, monthLabel } from '../../domain/dates';
import { formatBRL } from '../../domain/money';

function Forecast({ forecast, deadline }) {
  if (forecast.state === 'concluida') {
    return <p className="text-sm font-medium text-brand">Meta concluída.</p>;
  }
  if (forecast.state === 'sem-aportes') return <p className="text-sm text-ink-3">Registre aportes para estimar a chegada.</p>;
  if (forecast.state === 'sem-ritmo') return <p className="text-sm text-ink-3">Sem ritmo para estimar no momento.</p>;

  return (
    <div className="space-y-1.5 text-sm leading-relaxed">
      <p className="text-ink-2">Neste ritmo, previsão para <span className="font-medium text-ink">{monthLabel(forecast.arrivalMonth)}</span>.</p>
      {deadline && (
        <p className={forecast.onTime ? 'text-ink-3' : 'text-amber'}>
          Para o prazo, reserve {formatBRL(forecast.neededPerMonthCents)} por mês.
        </p>
      )}
    </div>
  );
}

export default function GoalCard({ item, onEdit, onDelete, onContribution, onDeleteContribution }) {
  const { goal, contributions, progress, forecast } = item;
  const progressStatus = forecast.state === 'estimada' && forecast.onTime === false ? 'alerta' : 'ok';

  return (
    <Card className="flex flex-col p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-display text-2xl font-semibold tracking-[-0.025em] text-ink">{goal.name}</h2>
            {progress.completed && <Badge className="border-brand-line bg-brand-soft text-brand"><CheckCircle2 size={12} aria-hidden />Concluída</Badge>}
            {!progress.completed && goal.deadline && forecast.state === 'estimada' && (
              <Badge className={forecast.onTime ? 'text-brand' : 'text-amber'}>{forecast.onTime ? 'No prazo' : 'Fora do prazo'}</Badge>
            )}
          </div>
          {goal.deadline && (
            <p className="mt-2 flex items-center gap-1.5 text-[13px] text-ink-3"><CalendarDays size={14} aria-hidden />Prazo: {formatLongDate(goal.deadline)}</p>
          )}
        </div>
        <div className="flex shrink-0">
          <IconButton label={`Editar ${goal.name}`} onClick={() => onEdit(goal)}><Pencil size={16} aria-hidden /></IconButton>
          <IconButton label={`Excluir ${goal.name}`} className="hover:text-expense" onClick={() => onDelete(item)}><Trash2 size={16} aria-hidden /></IconButton>
        </div>
      </div>

      <div className="mt-6">
        <p className="text-sm text-ink-2">
          <span className="text-[26px] font-bold tracking-[-0.01em] tabular-nums text-ink">{formatBRL(progress.accumulatedCents)}</span>
          <span className="ml-1.5">de {formatBRL(progress.targetCents)}</span>
        </p>
        <ProgressBar
          className="mt-3"
          value={progress.percentage}
          status={progressStatus}
          label={`${Math.round(Math.max(0, progress.percentage))}% do valor alvo alcançado.`}
        />
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[13px]">
          <span className="text-ink-3">{progress.completed ? 'Alvo alcançado' : `Faltam ${formatBRL(progress.remainingCents)}`}</span>
          <span className="font-medium tabular-nums text-ink-2">{Math.round(progress.percentage)}%</span>
        </div>
      </div>

      <div className="mt-5 min-h-[44px] rounded-xl border border-line bg-surface-2 p-3.5">
        <Forecast forecast={forecast} deadline={goal.deadline} />
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <Button variant="primary" size="sm" onClick={() => onContribution(item, 'aporte')}>Aportar</Button>
        <Button size="sm" disabled={progress.accumulatedCents <= 0} onClick={() => onContribution(item, 'resgate')}>Resgatar</Button>
      </div>

      <ContributionHistory contributions={contributions} onDelete={(contribution) => onDeleteContribution({ contribution, goal })} />
    </Card>
  );
}
