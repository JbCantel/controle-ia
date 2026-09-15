import { useEffect, useState } from 'react';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import Field, { inputClass } from '../../components/ui/Field';
import MoneyInput from '../../components/ui/MoneyInput';
import { addGoal, updateGoal } from '../../db/goals';
import { validateGoal } from '../../domain/goals';
import { fromCents, toCents } from '../../domain/money';

function initialState(goal) {
  return goal
    ? { name: goal.name, cents: toCents(goal.target), deadline: goal.deadline ?? '' }
    : { name: '', cents: 0, deadline: '' };
}

export default function GoalForm({ open, goal, onClose }) {
  const [form, setForm] = useState(() => initialState(goal));
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const isEdit = Boolean(goal);

  useEffect(() => {
    if (!open) return;
    setForm(initialState(goal));
    setErrors({});
    setSaveError(null);
  }, [open, goal]);

  const set = (patch) => setForm((current) => ({ ...current, ...patch }));

  async function onSubmit(event) {
    event.preventDefault();
    const found = validateGoal(form);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSaving(true);
    setSaveError(null);
    const data = { name: form.name, target: fromCents(form.cents), deadline: form.deadline };
    try {
      if (isEdit) await updateGoal(goal.id, data);
      else await addGoal(data);
      onClose();
    } catch (error) {
      if (error.code === 'GOAL_INVALID') setErrors(error.details);
      else setSaveError('Não foi possível salvar a meta. Tente de novo.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} title={isEdit ? 'Editar meta' : 'Nova meta'} onClose={onClose}>
      <form className="space-y-4" onSubmit={onSubmit} noValidate>
        <Field label="Nome" htmlFor="goal-name" error={errors.name}>
          <input id="goal-name" className={inputClass} value={form.name} aria-invalid={Boolean(errors.name) || undefined} onChange={(event) => set({ name: event.target.value })} />
        </Field>
        <Field label="Valor alvo" htmlFor="goal-target" error={errors.target}>
          <MoneyInput id="goal-target" cents={form.cents} invalid={Boolean(errors.target)} onChange={(cents) => set({ cents })} />
        </Field>
        <Field label="Prazo (opcional)" htmlFor="goal-deadline" error={errors.deadline} hint="Você pode deixar em branco e definir depois.">
          <input id="goal-deadline" type="date" className={inputClass} value={form.deadline} aria-invalid={Boolean(errors.deadline) || undefined} onChange={(event) => set({ deadline: event.target.value })} />
        </Field>

        {saveError && <p className="text-sm text-expense" role="alert">{saveError}</p>}
        <div className="flex justify-end gap-2 pt-2">
          <Button disabled={saving} onClick={onClose}>Cancelar</Button>
          <Button type="submit" variant="primary" disabled={saving}>{saving ? 'Salvando…' : isEdit ? 'Salvar' : 'Criar meta'}</Button>
        </div>
      </form>
    </Modal>
  );
}
