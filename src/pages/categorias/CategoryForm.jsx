import { useEffect, useState } from 'react';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import Field, { inputClass } from '../../components/ui/Field';
import Segmented from '../../components/ui/Segmented';
import { CATEGORY_PALETTE, validateCategory } from '../../domain/categories';
import { addCategory, updateCategory } from '../../db/categories';

const TYPE_OPTIONS = [
  { value: 'despesa', label: 'Despesa' },
  { value: 'receita', label: 'Receita' },
];

const COLOR_NAMES = ['Roxo', 'Laranja', 'Azul', 'Rosa', 'Verde', 'Verde-claro', 'Azul-claro', 'Dourado', 'Cinza'];

function initialState(category, defaultType) {
  if (category) return { name: category.name, type: category.type, color: category.color };
  return { name: '', type: defaultType, color: CATEGORY_PALETTE[0] };
}

export default function CategoryForm({ open, category, defaultType = 'despesa', categories, usage, onClose }) {
  const [form, setForm] = useState(() => initialState(category, defaultType));
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const isEdit = Boolean(category);
  const typeLocked = isEdit && usage?.total > 0;

  useEffect(() => {
    if (!open) return;
    setForm(initialState(category, defaultType));
    setErrors({});
    setSaveError(null);
  }, [open, category, defaultType]);

  const set = (patch) => setForm((current) => ({ ...current, ...patch }));

  async function onSubmit(event) {
    event.preventDefault();
    const found = validateCategory(form, categories, category?.id ?? null);
    setErrors(found);
    if (Object.keys(found).length) return;

    setSaving(true);
    setSaveError(null);
    try {
      if (isEdit) await updateCategory(category.id, form);
      else await addCategory(form);
      onClose();
    } catch (error) {
      if (error.code === 'CATEGORY_INVALID') setErrors(error.details);
      else if (error.code === 'CATEGORY_TYPE_IN_USE') setErrors({ type: 'O tipo não pode mudar enquanto esta categoria estiver em uso.' });
      else setSaveError('Não foi possível salvar a categoria. Tente de novo.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} title={isEdit ? 'Editar categoria' : 'Nova categoria'} onClose={onClose}>
      <form className="space-y-5" onSubmit={onSubmit} noValidate>
        <Field label="Nome" htmlFor="category-name" error={errors.name}>
          <input
            id="category-name"
            className={inputClass}
            value={form.name}
            aria-invalid={Boolean(errors.name) || undefined}
            onChange={(event) => set({ name: event.target.value })}
          />
        </Field>

        <fieldset>
          <legend className="mb-2 text-sm text-ink-2">Tipo</legend>
          <Segmented label="Tipo da categoria" options={TYPE_OPTIONS} value={form.type} onChange={(type) => set({ type })} disabled={typeLocked} />
          {typeLocked && <p className="mt-2 text-[13px] leading-relaxed text-ink-3">O tipo não pode mudar enquanto esta categoria estiver em uso.</p>}
          {errors.type && <p className="mt-2 text-[13px] text-expense" role="alert">{errors.type}</p>}
        </fieldset>

        <fieldset>
          <legend className="mb-2 text-sm text-ink-2">Cor</legend>
          <div className="grid grid-cols-6 gap-2 sm:grid-cols-9" role="radiogroup" aria-label="Cor da categoria">
            {CATEGORY_PALETTE.map((color, index) => {
              const active = form.color === color;
              return (
                <button
                  key={color}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  aria-label={COLOR_NAMES[index]}
                  onClick={() => set({ color })}
                  className={`flex h-11 w-11 items-center justify-center rounded-full border transition-colors duration-150 ${active ? 'border-ink' : 'border-transparent hover:border-ink-3'}`}
                >
                  <span className="h-7 w-7 rounded-full" style={{ backgroundColor: color }} aria-hidden />
                </button>
              );
            })}
          </div>
          {errors.color && <p className="mt-2 text-[13px] text-expense" role="alert">{errors.color}</p>}
        </fieldset>

        {saveError && <p className="text-sm text-expense" role="alert">{saveError}</p>}
        <div className="flex justify-end gap-2 pt-1">
          <Button onClick={onClose}>Cancelar</Button>
          <Button type="submit" variant="primary" disabled={saving}>{saving ? 'Salvando…' : isEdit ? 'Salvar' : 'Adicionar'}</Button>
        </div>
      </form>
    </Modal>
  );
}
