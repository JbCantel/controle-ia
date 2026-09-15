import { useMemo, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Plus, Target } from 'lucide-react';
import PageHeader from '../../components/layout/PageHeader';
import Button from '../../components/ui/Button';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import EmptyState from '../../components/ui/EmptyState';
import GoalCard from './GoalCard';
import GoalForm from './GoalForm';
import ContributionForm from './ContributionForm';
import { db } from '../../db/db';
import { deleteContribution, deleteGoal } from '../../db/goals';
import { currentMonthKey } from '../../domain/dates';
import { forecastGoal, goalProgress } from '../../domain/goals';

export default function Metas() {
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [moving, setMoving] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [contributionToDelete, setContributionToDelete] = useState(null);

  const data = useLiveQuery(async () => {
    const [goals, contributions] = await Promise.all([
      db.goals.toArray(),
      db.contributions.toArray(),
    ]);
    return { goals, contributions };
  }, []);

  const items = useMemo(() => {
    if (!data) return [];
    return [...data.goals]
      .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
      .map((goal) => {
        const contributions = data.contributions.filter((contribution) => contribution.goalId === goal.id);
        return {
          goal,
          contributions,
          progress: goalProgress(goal, contributions),
          forecast: forecastGoal(goal, contributions, currentMonthKey()),
        };
      });
  }, [data]);

  function openNew() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(goal) {
    setEditing(goal);
    setFormOpen(true);
  }

  return (
    <>
      <PageHeader
        title="Metas"
        subtitle="Transforme planos em valores acompanháveis, no seu ritmo."
        actions={<Button variant="primary" onClick={openNew}><Plus size={16} aria-hidden />Nova meta</Button>}
      />

      {!data ? (
        <div className="mt-10 min-h-[420px]" aria-busy="true" />
      ) : items.length > 0 ? (
        <div className="mt-10 grid gap-5 xl:grid-cols-2">
          {items.map((item) => (
            <GoalCard
              key={item.goal.id}
              item={item}
              onEdit={openEdit}
              onDelete={setToDelete}
              onContribution={(selected, mode) => setMoving({ ...selected, mode })}
              onDeleteContribution={setContributionToDelete}
            />
          ))}
        </div>
      ) : (
        <div className="mt-10">
          <EmptyState icon={Target} title="Nenhuma meta ainda" text="Crie uma meta e registre aportes para acompanhar seu avanço." action={<Button variant="primary" onClick={openNew}><Plus size={16} aria-hidden />Nova meta</Button>} />
        </div>
      )}

      <GoalForm open={formOpen} goal={editing} onClose={() => setFormOpen(false)} />
      <ContributionForm
        open={moving !== null}
        goal={moving?.goal}
        mode={moving?.mode}
        currentTotalCents={moving?.progress.accumulatedCents ?? 0}
        onClose={() => setMoving(null)}
      />

      <ConfirmDialog
        open={toDelete !== null}
        title="Excluir meta"
        message={toDelete ? `Excluir “${toDelete.goal.name}” e todo o histórico dela? Não dá para desfazer.` : ''}
        onCancel={() => setToDelete(null)}
        onConfirm={async () => { await deleteGoal(toDelete.goal.id); setToDelete(null); }}
      />
      <ConfirmDialog
        open={contributionToDelete !== null}
        title="Excluir movimento"
        message={contributionToDelete ? `Excluir este ${contributionToDelete.contribution.value < 0 ? 'resgate' : 'aporte'} de “${contributionToDelete.goal.name}”? O progresso será recalculado.` : ''}
        onCancel={() => setContributionToDelete(null)}
        onConfirm={async () => { await deleteContribution(contributionToDelete.contribution.id); setContributionToDelete(null); }}
      />
    </>
  );
}
