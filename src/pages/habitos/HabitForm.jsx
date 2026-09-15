import { useEffect, useState } from 'react';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import Field, { inputClass } from '../../components/ui/Field';
import { addHabit, updateHabit } from '../../db/routine';
import { ROUTINE_DAYS, ROUTINE_KINDS, validateHabit } from '../../domain/routine';
import { DAY_LABELS, KIND_META } from './routineMeta';

function initialState(habit, defaultDay, nextOrder) {
  if (habit) return { ...habit };
  return { day: defaultDay, time: '08:00', endTime: '09:00', name: '', kind: 'pessoal', order: nextOrder, active: true };
}

export default function HabitForm({ open, habit, defaultDay, nextOrder, onClose }) {
  const [form, setForm] = useState(() => initialState(habit, defaultDay, nextOrder));
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const isEdit = Boolean(habit);

  useEffect(() => {
    if (!open) return;
    setForm(initialState(habit, defaultDay, nextOrder));
    setErrors({});
    setSaveError(null);
  }, [open, habit, defaultDay, nextOrder]);

  const set = (patch) => setForm((current) => ({ ...current, ...patch }));

  async function onSubmit(event) {
    event.preventDefault();
    const found = validateHabit(form);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSaving(true);
    setSaveError(null);
    try {
      if (isEdit) await updateHabit(habit.id, form);
      else await addHabit(form);
      onClose();
    } catch (error) {
      if (error.code === 'HABIT_INVALID') setErrors(error.details);
      else setSaveError('Não foi possível salvar o bloco. Tente de novo.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} title={isEdit ? 'Editar bloco' : 'Novo bloco'} onClose={onClose}>
      <form className="space-y-4" onSubmit={onSubmit} noValidate>
        <Field label="Nome do bloco" htmlFor="habit-name" error={errors.name}>
          <input id="habit-name" className={inputClass} value={form.name} aria-invalid={Boolean(errors.name) || undefined} onChange={(event) => set({ name: event.target.value })} />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Dia da semana" htmlFor="habit-day" error={errors.day}>
            <select id="habit-day" className={inputClass} value={form.day} aria-invalid={Boolean(errors.day) || undefined} onChange={(event) => set({ day: event.target.value })}>
              {ROUTINE_DAYS.map((day) => <option key={day} value={day}>{DAY_LABELS[day].long}</option>)}
            </select>
          </Field>
          <Field label="Tipo" htmlFor="habit-kind" error={errors.kind}>
            <select id="habit-kind" className={inputClass} value={form.kind} aria-invalid={Boolean(errors.kind) || undefined} onChange={(event) => set({ kind: event.target.value })}>
              {ROUTINE_KINDS.map((kind) => <option key={kind} value={kind}>{KIND_META[kind].label}</option>)}
            </select>
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Início" htmlFor="habit-time" error={errors.time}>
            <input id="habit-time" type="time" className={inputClass} value={form.time} aria-invalid={Boolean(errors.time) || undefined} onChange={(event) => set({ time: event.target.value })} />
          </Field>
          <Field label="Fim" htmlFor="habit-end" error={errors.endTime}>
            <input id="habit-end" type="time" className={inputClass} value={form.endTime} aria-invalid={Boolean(errors.endTime) || undefined} onChange={(event) => set({ endTime: event.target.value })} />
          </Field>
        </div>

        <label className="flex items-start gap-3 rounded-xl border border-line p-3 text-sm text-ink">
          <input type="checkbox" className="mt-0.5 h-4 w-4 accent-brand" checked={form.active} onChange={(event) => set({ active: event.target.checked })} />
          <span>Bloco ativo<span className="block text-xs leading-relaxed text-ink-3">Blocos pausados ficam na Semana, mas não entram no progresso.</span></span>
        </label>

        {saveError && <p className="text-sm text-expense" role="alert">{saveError}</p>}
        <div className="flex justify-end gap-2 pt-2">
          <Button disabled={saving} onClick={onClose}>Cancelar</Button>
          <Button type="submit" variant="primary" disabled={saving}>{saving ? 'Salvando…' : isEdit ? 'Salvar' : 'Criar bloco'}</Button>
        </div>
      </form>
    </Modal>
  );
}
