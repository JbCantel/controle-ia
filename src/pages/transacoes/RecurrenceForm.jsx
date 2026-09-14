import { useEffect, useState } from 'react';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import Field, { inputClass } from '../../components/ui/Field';
import MoneyInput from '../../components/ui/MoneyInput';
import { validateRecurrence } from '../../domain/transactions';
import { toCents, fromCents } from '../../domain/money';
import { updateRecurrence } from '../../db/recurrences';

export default function RecurrenceForm({ open, rule, categories, onClose }) {
  const [form, setForm] = useState(null);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open || !rule) return;
    setForm({ type: rule.type, cents: toCents(rule.value), categoryId: rule.categoryId, description: rule.description, dayOfMonth: rule.dayOfMonth });
    setErrors({});
  }, [open, rule]);

  if (!form) return null;
  const set = (patch) => setForm((prev) => ({ ...prev, ...patch }));

  async function onSubmit(event) {
    event.preventDefault();
    const found = validateRecurrence(form, categories);
    setErrors(found);
    if (Object.keys(found).length) return;
    setSaving(true);
    try {
      await updateRecurrence(rule.id, { value: fromCents(form.cents), categoryId: form.categoryId, description: form.description.trim(), dayOfMonth: form.dayOfMonth });
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} title="Editar recorrência" onClose={onClose}>
      <form className="space-y-4" onSubmit={onSubmit} noValidate>
        <p className="text-xs text-ink-3">As mudanças valem para os próximos lançamentos. Os já feitos não mudam.</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Valor" htmlFor="rec-value" error={errors.value}>
            <MoneyInput id="rec-value" cents={form.cents} invalid={Boolean(errors.value)} onChange={(cents) => set({ cents })} />
          </Field>
          <Field label="Dia do mês" htmlFor="rec-day" error={errors.dayOfMonth}>
            <input id="rec-day" type="number" min={1} max={31} className={`${inputClass} tabular-nums`} value={form.dayOfMonth} aria-invalid={Boolean(errors.dayOfMonth) || undefined} onChange={(e) => set({ dayOfMonth: Number(e.target.value) })} />
          </Field>
        </div>
        <Field label="Categoria" htmlFor="rec-category" error={errors.categoryId}>
          <select id="rec-category" className={inputClass} value={form.categoryId ?? ''} onChange={(e) => set({ categoryId: e.target.value ? Number(e.target.value) : null })}>
            <option value="">Escolha…</option>
            {categories.filter((c) => c.type === form.type).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </Field>
        <Field label="Descrição" htmlFor="rec-description" error={errors.description}>
          <input id="rec-description" className={inputClass} maxLength={80} value={form.description} onChange={(e) => set({ description: e.target.value })} />
        </Field>
        <div className="flex justify-end gap-2 pt-2">
          <Button onClick={onClose}>Cancelar</Button>
          <Button type="submit" variant="primary" disabled={saving}>Salvar</Button>
        </div>
      </form>
    </Modal>
  );
}
