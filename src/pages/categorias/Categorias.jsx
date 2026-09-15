import { useMemo, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Plus } from 'lucide-react';
import PageHeader from '../../components/layout/PageHeader';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import CategoryForm from './CategoryForm';
import CategoryList from './CategoryList';
import { db } from '../../db/db';
import { deleteCategory } from '../../db/categories';
import { categoryUsageMessage, summarizeCategoryUsage } from '../../domain/categories';

export default function Categorias() {
  const [formOpen, setFormOpen] = useState(false);
  const [defaultType, setDefaultType] = useState('despesa');
  const [editing, setEditing] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [blocked, setBlocked] = useState(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  const data = useLiveQuery(async () => {
    const [categories, transactions, budgets, recurrences] = await Promise.all([
      db.categories.toArray(),
      db.transactions.toArray(),
      db.budgets.toArray(),
      db.recurrences.toArray(),
    ]);
    return { categories, transactions, budgets, recurrences };
  }, []);

  const usageById = useMemo(() => {
    const map = new Map();
    if (!data) return map;
    for (const category of data.categories) map.set(category.id, summarizeCategoryUsage(category.id, data));
    return map;
  }, [data]);

  const sorted = useMemo(() => [...(data?.categories ?? [])].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR')), [data]);
  const expenses = sorted.filter((category) => category.type === 'despesa');
  const income = sorted.filter((category) => category.type === 'receita');

  function openNew(type = 'despesa') {
    setEditing(null);
    setDefaultType(type);
    setFormOpen(true);
  }

  function openEdit(category) {
    setEditing(category);
    setDefaultType(category.type);
    setFormOpen(true);
  }

  function requestDelete(category) {
    const usage = usageById.get(category.id) ?? { transactions: 0, budgets: 0, recurrences: 0, total: 0 };
    if (usage.total > 0) setBlocked({ category, usage });
    else setToDelete(category);
  }

  async function confirmDelete() {
    setDeleteBusy(true);
    try {
      await deleteCategory(toDelete.id);
      setToDelete(null);
    } catch (error) {
      if (error.code === 'CATEGORY_IN_USE') {
        setBlocked({ category: toDelete, usage: error.details });
        setToDelete(null);
      }
    } finally {
      setDeleteBusy(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Categorias"
        subtitle="Organize seus lançamentos com nomes e cores que façam sentido para você."
        actions={<Button variant="primary" onClick={() => openNew()}><Plus size={16} aria-hidden />Nova categoria</Button>}
      />

      {!data ? (
        <div className="mt-10 min-h-[420px]" aria-busy="true" />
      ) : (
        <div className="mt-10 grid gap-5 lg:grid-cols-2">
          <CategoryList title="Despesas" type="despesa" categories={expenses} usageById={usageById} onAdd={openNew} onEdit={openEdit} onDelete={requestDelete} />
          <CategoryList title="Receitas" type="receita" categories={income} usageById={usageById} onAdd={openNew} onEdit={openEdit} onDelete={requestDelete} />
        </div>
      )}

      {data && (
        <CategoryForm
          open={formOpen}
          category={editing}
          defaultType={defaultType}
          categories={data.categories}
          usage={editing ? usageById.get(editing.id) : null}
          onClose={() => setFormOpen(false)}
        />
      )}

      <ConfirmDialog
        open={toDelete !== null}
        title="Excluir categoria"
        message={toDelete ? `Excluir “${toDelete.name}”? Não dá para desfazer.` : ''}
        busy={deleteBusy}
        onCancel={() => setToDelete(null)}
        onConfirm={confirmDelete}
      />

      <Modal open={blocked !== null} title="Categoria em uso" onClose={() => setBlocked(null)}>
        <p className="text-pretty text-[15px] leading-relaxed text-ink-2">
          {blocked ? `“${blocked.category.name}” ainda está ligada a ${categoryUsageMessage(blocked.usage)}. Remova esses usos antes de excluir.` : ''}
        </p>
        <div className="mt-6 flex justify-end"><Button variant="primary" onClick={() => setBlocked(null)}>Entendi</Button></div>
      </Modal>
    </>
  );
}
