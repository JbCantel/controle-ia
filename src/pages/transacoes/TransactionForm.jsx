import { useEffect, useState } from 'react';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import Field, { inputClass } from '../../components/ui/Field';
import MoneyInput from '../../components/ui/MoneyInput';
import Segmented from '../../components/ui/Segmented';
import { validateTransaction } from '../../domain/transactions';
import { toCents, fromCents } from '../../domain/money';
import { addTransaction, updateTransaction } from '../../db/transactions';

const TYPE_OPTIONS = [{ value: 'despesa', label: 'Despesa' }, { value: 'receita', label: 'Receita' }];

function initialState(transaction, defaultDate) {
  if (transaction) {
    return { type: transaction.type, cents: toCents(transaction.value), date: transaction.date, categoryId: transaction.categoryId, description: transaction.description, repeatMonthly: false };
  }
  return { type: 'despesa', cents: 0, date: defaultDate, categoryId: null, description: '', repeatMonthly: false };
}

export default function TransactionForm({ open, transaction, defaultDate, categories, onClose }) {
  const [form, setForm] = useState(() => initialState(transaction, defaultDate));
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  useEffect(() => {
    if (!open) return;
    setForm(initialState(transaction, defaultDate));
    setErrors({});
    setSaveError(null);
  }, [open, transaction, defaultDate]);

  const set = (patch) => setForm((prev) => ({ ...prev, ...patch }));
  const options = categories.filter((c) => c.type === form.type);
  const isEdit = Boolean(transaction);

  async function onSubmit(event) {
    event.preventDefault();
    const found = validateTransaction(form, categories);
    setErrors(found);
    if (Object.keys(found).length) return;
    const data = { type: form.type, value: fromCents(form.cents), date: form.date, categoryId: form.categoryId, description: form.description.trim() };
    setSaving(true);
    try {
      if (isEdit) await updateTransaction(transaction.id, data);
      else await addTransaction(data, { repeatMonthly: form.repeatMonthly });
      onClose();
    } catch (error) {
      console.error(error);
      setSaveError('Não foi possível salvar. Tente de novo.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} title={isEdit ? 'Editar transação' : 'Nova transação'} onClose={onClose}>
      <form className="space-y-4" onSubmit={onSubmit} noValidate>
        <Segmented
          label="Tipo"
          options={TYPE_OPTIONS}
          value={form.type}
          onChange={(type) => set({ type, categoryId: categories.find((c) => c.id === form.categoryId)?.type === type ? form.categoryId : null })}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Valor" htmlFor="tx-value" error={errors.value}>
            <MoneyInput id="tx-value" cents={form.cents} invalid={Boolean(errors.value)} onChange={(cents) => set({ cents })} />
          </Field>
          <Field label="Data" htmlFor="tx-date" error={errors.date}>
            <input id="tx-date" type="date" className={inputClass} value={form.date} aria-invalid={Boolean(errors.date) || undefined} onChange={(e) => set({ date: e.target.value })} />
          </Field>
        </div>
        <Field label="Categoria" htmlFor="tx-category" error={errors.categoryId} hint={options.length === 0 ? 'Nenhuma categoria deste tipo. Crie uma em Categorias.' : undefined}>
          <select id="tx-category" className={inputClass} value={form.categoryId ?? ''} aria-invalid={Boolean(errors.categoryId) || undefined} onChange={(e) => set({ categoryId: e.target.value ? Number(e.target.value) : null })}>
            <option value="">Escolha…</option>
            {options.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </Field>
        <Field label="Descrição" htmlFor="tx-description" error={errors.description}>
          <input id="tx-description" className={inputClass} maxLength={80} value={form.description} aria-invalid={Boolean(errors.description) || undefined} onChange={(e) => set({ description: e.target.value })} />
        </Field>
        {!isEdit && (
          <label className="flex items-start gap-3 rounded-xl border border-line p-3 text-sm text-ink">
            <input type="checkbox" className="mt-0.5 h-4 w-4 accent-brand" checked={form.repeatMonthly} onChange={(e) => set({ repeatMonthly: e.target.checked })} />
            <span>
              Repetir todo mês
              <span className="block text-xs text-ink-3">
                {form.date ? `Lança de novo todo dia ${Number(form.date.slice(8, 10))}, até você pausar.` : 'Lança de novo todo mês, até você pausar.'}
              </span>
            </span>
          </label>
        )}
        {saveError && <p role="alert" className="text-sm text-expense">{saveError}</p>}
        <div className="flex justify-end gap-2 pt-2">
          <Button onClick={onClose}>Cancelar</Button>
          <Button type="submit" variant="primary" disabled={saving}>{isEdit ? 'Salvar' : 'Adicionar'}</Button>
        </div>
      </form>
    </Modal>
  );
}
