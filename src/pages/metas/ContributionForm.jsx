import { useEffect, useState } from 'react';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import Field, { inputClass } from '../../components/ui/Field';
import MoneyInput from '../../components/ui/MoneyInput';
import { addContribution } from '../../db/goals';
import { todayISO } from '../../domain/dates';
import { validateContribution } from '../../domain/goals';
import { formatBRL, fromCents } from '../../domain/money';

export default function ContributionForm({ open, goal, mode = 'aporte', currentTotalCents, onClose }) {
  const [form, setForm] = useState({ cents: 0, date: todayISO() });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  useEffect(() => {
    if (!open) return;
    setForm({ cents: 0, date: todayISO() });
    setErrors({});
    setSaveError(null);
  }, [open, goal, mode]);

  async function onSubmit(event) {
    event.preventDefault();
    const found = validateContribution(form, currentTotalCents, mode);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSaving(true);
    setSaveError(null);
    try {
      await addContribution({ goalId: goal.id, value: fromCents(form.cents), date: form.date, mode });
      onClose();
    } catch (error) {
      if (error.code === 'CONTRIBUTION_INVALID') setErrors(error.details);
      else setSaveError(`Não foi possível registrar o ${mode}. Tente de novo.`);
    } finally {
      setSaving(false);
    }
  }

  const action = mode === 'resgate' ? 'Resgatar' : 'Aportar';

  return (
    <Modal open={open} title={goal ? `${action} em ${goal.name}` : action} onClose={onClose}>
      {goal && (
        <form className="space-y-4" onSubmit={onSubmit} noValidate>
          <Field
            label="Valor"
            htmlFor="contribution-value"
            error={errors.value}
            hint={mode === 'resgate' ? `Disponível: ${formatBRL(Math.max(0, currentTotalCents))}` : undefined}
          >
            <MoneyInput id="contribution-value" cents={form.cents} invalid={Boolean(errors.value)} onChange={(cents) => setForm((current) => ({ ...current, cents }))} />
          </Field>
          <Field label="Data" htmlFor="contribution-date" error={errors.date}>
            <input id="contribution-date" type="date" className={inputClass} value={form.date} aria-invalid={Boolean(errors.date) || undefined} onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))} />
          </Field>

          {saveError && <p className="text-sm text-expense" role="alert">{saveError}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <Button disabled={saving} onClick={onClose}>Cancelar</Button>
            <Button type="submit" variant="primary" disabled={saving}>{saving ? 'Salvando…' : `Confirmar ${mode}`}</Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
