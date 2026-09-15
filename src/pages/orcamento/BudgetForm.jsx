import { useEffect, useState } from 'react';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import Field from '../../components/ui/Field';
import MoneyInput from '../../components/ui/MoneyInput';
import Segmented from '../../components/ui/Segmented';
import { monthLabel } from '../../domain/dates';
import { fromCents } from '../../domain/money';
import { setBudgetLimit } from '../../db/budgets';

const SCOPE_OPTIONS = [
  { value: 'from-month', label: 'A partir deste mês' },
  { value: 'only-month', label: 'Só este mês' },
];

function initialScope(row, month) {
  return row?.budget?.month === month && row.budget.onlyThisMonth ? 'only-month' : 'from-month';
}

export default function BudgetForm({ open, row, month, onClose }) {
  const [cents, setCents] = useState(0);
  const [scope, setScope] = useState('from-month');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!open || !row) return;
    setCents(row.limitCents ?? 0);
    setScope(initialScope(row, month));
    setError(null);
  }, [open, row, month]);

  async function persist(limit) {
    setSaving(true);
    setError(null);
    try {
      await setBudgetLimit({
        month,
        categoryId: row.category.id,
        limit,
        scope,
      });
      onClose();
    } catch {
      setError('Não foi possível salvar o limite. Tente de novo.');
    } finally {
      setSaving(false);
    }
  }

  async function onSubmit(event) {
    event.preventDefault();
    await persist(fromCents(cents));
  }

  const monthName = monthLabel(month);

  return (
    <Modal open={open} title={row ? `Limite de ${row.category.name}` : 'Definir limite'} onClose={onClose}>
      {row && (
        <form className="space-y-5" onSubmit={onSubmit}>
          <Field label="Limite mensal" htmlFor="budget-limit" hint="O valor zero também é permitido.">
            <MoneyInput id="budget-limit" cents={cents} onChange={setCents} />
          </Field>

          <fieldset>
            <legend className="mb-2 text-sm text-ink-2">Aplicar</legend>
            <Segmented label="Escopo do limite" options={SCOPE_OPTIONS} value={scope} onChange={setScope} />
            <p className="mt-2 text-[13px] leading-relaxed text-ink-3">
              {scope === 'from-month'
                ? `Vale desde ${monthName} e substitui limites herdáveis dos meses seguintes.`
                : `Vale somente em ${monthName}; os demais meses continuam como estão.`}
            </p>
          </fieldset>

          {error && <p className="text-sm text-expense" role="alert">{error}</p>}

          <div className="flex flex-wrap justify-end gap-2 pt-1">
            {row.limitCents !== null && (
              <Button className="mr-auto" disabled={saving} onClick={() => persist(null)}>Remover limite</Button>
            )}
            <Button disabled={saving} onClick={onClose}>Cancelar</Button>
            <Button type="submit" variant="primary" disabled={saving}>{saving ? 'Salvando…' : 'Salvar limite'}</Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
