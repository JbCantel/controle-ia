import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import Card from '../components/Card';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';

const NEW_FORM = { name: '', type: 'despesa', icon: '🏷️', color: '#6366f1' };

export default function Categorias() {
  const categories = useLiveQuery(() => db.categories.toArray(), []) ?? [];
  const [form, setForm] = useState(null);      // null = modal fechado
  const [toDelete, setToDelete] = useState(null);
  const [error, setError] = useState('');

  async function save(e) {
    e.preventDefault();
    const name = form.name.trim();
    if (!name) return setError('Dê um nome para a categoria.');
    if (form.id) {
      await db.categories.update(form.id, { name, icon: form.icon, color: form.color });
    } else {
      await db.categories.add({ name, type: form.type, icon: form.icon, color: form.color });
    }
    setForm(null);
    setError('');
  }

  // Excluir: transações órfãs vão para "Outros" (criada se não existir). Histórico nunca se perde.
  async function remove() {
    const cat = toDelete;
    await db.transaction('rw', db.categories, db.transactions, db.budgets, async () => {
      const count = await db.transactions.where('categoryId').equals(cat.id).count();
      if (count > 0) {
        let outros = await db.categories
          .where('type').equals(cat.type)
          .filter((c) => c.name === 'Outros')
          .first();
        if (!outros) {
          const id = await db.categories.add({ name: 'Outros', type: cat.type, icon: '📦', color: '#94a3b8' });
          outros = { id };
        }
        await db.transactions.where('categoryId').equals(cat.id).modify({ categoryId: outros.id });
      }
      await db.budgets.where('categoryId').equals(cat.id).delete();
      await db.categories.delete(cat.id);
    });
    setToDelete(null);
  }

  const groups = [
    ['Despesas', categories.filter((c) => c.type === 'despesa')],
    ['Receitas', categories.filter((c) => c.type === 'receita')],
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Categorias</h1>
        <button
          onClick={() => setForm({ ...NEW_FORM })}
          className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          + Nova categoria
        </button>
      </div>

      {groups.map(([label, list]) => (
        <Card key={label}>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</h2>
          {list.length === 0 && <p className="text-sm text-slate-400">Nenhuma categoria ainda.</p>}
          <ul className="divide-y divide-slate-100 dark:divide-slate-700">
            {list.map((cat) => (
              <li key={cat.id} className="flex items-center gap-3 py-2.5">
                <span
                  className="flex h-9 w-9 items-center justify-center rounded-full text-lg"
                  style={{ backgroundColor: `${cat.color}22` }}
                >
                  {cat.icon}
                </span>
                <span className="flex-1 font-medium">{cat.name}</span>
                <button
                  onClick={() => setForm({ ...cat })}
                  className="rounded-lg px-2 py-1 text-sm text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  Editar
                </button>
                <button
                  onClick={() => setToDelete(cat)}
                  disabled={cat.name === 'Outros'}
                  title={cat.name === 'Outros' ? 'Categoria padrão, não pode ser excluída' : undefined}
                  className="rounded-lg px-2 py-1 text-sm text-red-500 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-30 dark:hover:bg-red-900/30"
                >
                  Excluir
                </button>
              </li>
            ))}
          </ul>
        </Card>
      ))}

      <Modal open={form !== null} title={form?.id ? 'Editar categoria' : 'Nova categoria'} onClose={() => setForm(null)}>
        {form && (
          <form onSubmit={save} className="space-y-3">
            <label className="block text-sm font-medium">
              Nome
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                autoFocus
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-900"
              />
            </label>
            {!form.id && (
              <label className="block text-sm font-medium">
                Tipo
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-900"
                >
                  <option value="despesa">Despesa</option>
                  <option value="receita">Receita</option>
                </select>
              </label>
            )}
            <div className="flex gap-3">
              <label className="block flex-1 text-sm font-medium">
                Ícone (emoji)
                <input
                  value={form.icon}
                  onChange={(e) => setForm({ ...form, icon: e.target.value })}
                  maxLength={4}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-center dark:border-slate-600 dark:bg-slate-900"
                />
              </label>
              <label className="block text-sm font-medium">
                Cor
                <input
                  type="color"
                  value={form.color}
                  onChange={(e) => setForm({ ...form, color: e.target.value })}
                  className="mt-1 h-10 w-16 cursor-pointer rounded-lg border border-slate-300 dark:border-slate-600"
                />
              </label>
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <button type="submit" className="w-full rounded-xl bg-indigo-600 py-2.5 font-semibold text-white hover:bg-indigo-700">
              Salvar
            </button>
          </form>
        )}
      </Modal>

      <ConfirmDialog
        open={toDelete !== null}
        message={`Excluir a categoria "${toDelete?.name}"? Transações existentes serão movidas para "Outros".`}
        onConfirm={remove}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
