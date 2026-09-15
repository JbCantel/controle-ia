import { ChevronLeft, ChevronRight, Clock3, ListChecks } from 'lucide-react';
import Card, { CardTitle } from '../../components/ui/Card';
import Button, { IconButton } from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import ProgressBar from '../../components/ui/ProgressBar';
import { setHabitChecked } from '../../db/routine';
import { addDays, formatLongDate, todayISO } from '../../domain/dates';
import { blocksForDate, currentBlock, dailyProgress } from '../../domain/routine';
import { KindBadge } from './routineMeta';

function nowHHMM() {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
}

export default function Hoje({ habits, checks, date, onDateChange, onOpenWeek }) {
  const today = todayISO();
  const blocks = blocksForDate(habits, date);
  const progress = dailyProgress(habits, checks, date, today);
  const checkedIds = new Set(checks.filter((check) => check.date === date).map((check) => check.habitId));
  const nowBlock = currentBlock(habits, date, today, nowHHMM());
  const isFuture = date > today;
  const percentage = progress?.percentage ?? 0;

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(280px,0.55fr)]">
      <Card className="p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <CardTitle title={formatLongDate(date)} subtitle={isFuture ? 'Datas futuras podem ser consultadas, mas não marcadas.' : 'Marque o que você concluiu neste dia.'} />
          <div className="flex items-center gap-1">
            <IconButton label="Dia anterior" onClick={() => onDateChange(addDays(date, -1))}><ChevronLeft size={16} aria-hidden /></IconButton>
            {date !== today && <Button size="sm" onClick={() => onDateChange(today)}>Hoje</Button>}
            <IconButton label="Próximo dia" onClick={() => onDateChange(addDays(date, 1))}><ChevronRight size={16} aria-hidden /></IconButton>
          </div>
        </div>

        {progress && (
          <div className="mt-6 rounded-xl border border-line bg-surface-2 p-4">
            <div className="mb-2 flex items-center justify-between gap-3 text-sm">
              <span className="font-medium text-ink">{progress.done} de {progress.total} blocos</span>
              <span className="tabular-nums text-ink-2">{Math.round(percentage)}%</span>
            </div>
            <ProgressBar value={percentage} status={percentage >= 80 ? 'ok' : percentage >= 50 ? 'alerta' : 'estourado'} label={`${progress.done} de ${progress.total} blocos concluídos. ${Math.round(percentage)}%.`} />
          </div>
        )}

        {blocks.length > 0 ? (
          <ol className="mt-6">
            {blocks.map((block, index) => {
              const checked = checkedIds.has(block.id);
              const current = nowBlock?.id === block.id;
              return (
                <li key={block.id} className="grid grid-cols-[54px_20px_minmax(0,1fr)] gap-3">
                  <time className="pt-4 text-right text-xs tabular-nums text-ink-3">{block.time}</time>
                  <div className="relative flex justify-center">
                    {index > 0 && <span className="absolute bottom-1/2 top-0 w-px bg-line" aria-hidden />}
                    {index < blocks.length - 1 && <span className="absolute bottom-0 top-1/2 w-px bg-line" aria-hidden />}
                    <span className={`relative mt-[19px] h-2.5 w-2.5 rounded-full border-2 ${current ? 'border-brand bg-brand' : checked ? 'border-brand bg-brand-soft' : 'border-deco bg-surface'}`} aria-hidden />
                  </div>
                  <label className={`mb-3 flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors duration-150 last:mb-0 ${current ? 'border-brand-line bg-brand-soft/50' : 'border-line bg-surface-2 hover:border-deco'} ${isFuture ? 'cursor-not-allowed opacity-60' : ''}`}>
                    <input
                      type="checkbox"
                      className="mt-0.5 h-5 w-5 shrink-0 accent-brand"
                      aria-label={`Marcar ${block.name}`}
                      checked={checked}
                      disabled={isFuture}
                      onChange={(event) => setHabitChecked(block.id, date, event.target.checked)}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className={`font-medium ${checked ? 'text-ink-3 line-through' : 'text-ink'}`}>{block.name}</span>
                        <KindBadge kind={block.kind} />
                        {current && <span className="text-xs font-semibold text-brand">agora</span>}
                      </span>
                      <span className="mt-1 block text-xs tabular-nums text-ink-3">{block.time}–{block.endTime}</span>
                    </span>
                  </label>
                </li>
              );
            })}
          </ol>
        ) : (
          <EmptyState icon={ListChecks} title="Sem rotina neste dia" text="Crie blocos na aba Semana para montar este dia." action={<Button variant="primary" onClick={onOpenWeek}>Abrir Semana</Button>} />
        )}
      </Card>

      <Card className="h-fit p-5 sm:p-6">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-soft text-brand ring-1 ring-brand-line"><Clock3 size={19} aria-hidden /></span>
        <h2 className="mt-4 font-serif text-xl font-semibold text-ink">Ritmo do dia</h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-2">
          {progress === null
            ? 'Este dia não tem blocos ativos para acompanhar.'
            : percentage >= 80
              ? 'Dia consistente. Você alcançou o marco de 80%.'
              : `${Math.max(0, progress.total - progress.done)} ${progress.total - progress.done === 1 ? 'bloco restante' : 'blocos restantes'} para fechar o dia.`}
        </p>
        {nowBlock && <p className="mt-4 rounded-xl border border-brand-line bg-brand-soft p-3 text-sm text-brand">Agora: {nowBlock.name}, até {nowBlock.endTime}.</p>}
      </Card>
    </div>
  );
}
