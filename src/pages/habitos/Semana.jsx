import { useMemo, useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import Card, { CardTitle } from '../../components/ui/Card';
import Button, { IconButton } from '../../components/ui/Button';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import EmptyState from '../../components/ui/EmptyState';
import HabitForm from './HabitForm';
import { deleteHabit } from '../../db/routine';
import { blocksForDay, ROUTINE_DAYS } from '../../domain/routine';
import { DAY_LABELS, KindBadge } from './routineMeta';

export default function Semana({ habits, selectedDay, onDayChange }) {
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const blocks = blocksForDay(habits, selectedDay, { includeInactive: true });
  const counts = useMemo(() => new Map(ROUTINE_DAYS.map((day) => [day, blocksForDay(habits, day, { includeInactive: true }).length])), [habits]);
  const nextOrder = blocks.reduce((largest, block) => Math.max(largest, block.order ?? 0), -1) + 1;

  function openNew() { setEditing(null); setFormOpen(true); }
  function openEdit(habit) { setEditing(habit); setFormOpen(true); }

  return (
    <>
      <Card className="p-4 sm:p-5">
        <div className="grid grid-cols-4 gap-2 lg:grid-cols-7" role="tablist" aria-label="Dia da semana">
          {ROUTINE_DAYS.map((day) => {
            const active = day === selectedDay;
            return (
              <button
                key={day}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => onDayChange(day)}
                className={`rounded-xl border px-2 py-3 text-center transition-colors duration-150 ${active ? 'border-brand-line bg-brand-soft text-brand' : 'border-line bg-surface-2 text-ink-2 hover:border-deco hover:text-ink'}`}
              >
                <span className="block text-sm font-semibold">{DAY_LABELS[day].short}</span>
                <span className="mt-0.5 block text-xs tabular-nums opacity-80">{counts.get(day)} {counts.get(day) === 1 ? 'bloco' : 'blocos'}</span>
              </button>
            );
          })}
        </div>
      </Card>

      <Card className="mt-5 p-5 sm:p-6">
        <CardTitle
          title={DAY_LABELS[selectedDay].long}
          subtitle="Blocos sobrepostos são permitidos e aparecem em ordem de início."
          action={<Button variant="primary" size="sm" onClick={openNew}><Plus size={15} aria-hidden />Novo bloco</Button>}
        />

        {blocks.length > 0 ? (
          <ul className="mt-5 divide-y divide-line">
            {blocks.map((block) => (
              <li key={block.id} className={`grid gap-3 py-4 first:pt-0 last:pb-0 sm:grid-cols-[110px_minmax(0,1fr)_auto] sm:items-center ${block.active ? '' : 'opacity-60'}`}>
                <span className="text-sm font-medium tabular-nums text-ink-2">{block.time}–{block.endTime}</span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate font-medium text-ink">{block.name}</p>
                    <KindBadge kind={block.kind} />
                    {!block.active && <span className="text-xs text-ink-3">pausado</span>}
                  </div>
                </div>
                <div className="flex">
                  <IconButton label={`Editar ${block.name}`} onClick={() => openEdit(block)}><Pencil size={16} aria-hidden /></IconButton>
                  <IconButton label={`Excluir ${block.name}`} className="hover:text-expense" onClick={() => setToDelete(block)}><Trash2 size={16} aria-hidden /></IconButton>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState title={`Nenhum bloco na ${DAY_LABELS[selectedDay].long.toLowerCase()}`} text="Adicione o primeiro horário deste dia." action={<Button variant="primary" onClick={openNew}><Plus size={16} aria-hidden />Novo bloco</Button>} />
        )}
      </Card>

      <HabitForm open={formOpen} habit={editing} defaultDay={selectedDay} nextOrder={nextOrder} onClose={() => setFormOpen(false)} />
      <ConfirmDialog
        open={toDelete !== null}
        title="Excluir bloco"
        message={toDelete ? `Excluir “${toDelete.name}” e todas as marcações dele? Não dá para desfazer.` : ''}
        onCancel={() => setToDelete(null)}
        onConfirm={async () => { await deleteHabit(toDelete.id); setToDelete(null); }}
      />
    </>
  );
}
