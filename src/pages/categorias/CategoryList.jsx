import { Pencil, Plus, Tag, Trash2 } from 'lucide-react';
import Card, { CardTitle } from '../../components/ui/Card';
import Button, { IconButton } from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';

const usageLabel = (total) => `${total} ${total === 1 ? 'uso' : 'usos'}`;

export default function CategoryList({ title, type, categories, usageById, onAdd, onEdit, onDelete }) {
  return (
    <Card className="p-5 sm:p-6">
      <CardTitle
        title={title}
        subtitle={`${categories.length} ${categories.length === 1 ? 'categoria' : 'categorias'}`}
        action={<Button size="sm" onClick={() => onAdd(type)}><Plus size={15} aria-hidden />Adicionar</Button>}
      />

      {categories.length === 0 ? (
        <EmptyState
          icon={Tag}
          title={`Nenhuma categoria de ${type}`}
          text="Crie uma categoria para organizar seus lançamentos."
          action={<Button variant="primary" size="sm" onClick={() => onAdd(type)}><Plus size={15} aria-hidden />Criar categoria</Button>}
        />
      ) : (
        <ul className="mt-5">
          {categories.map((category) => {
            const usage = usageById.get(category.id) ?? { total: 0 };
            return (
              <li key={category.id} className="flex min-h-16 items-center gap-3 border-t border-line py-3 first:border-t-0">
                <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: category.color }} aria-hidden />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[15px] font-medium text-ink">{category.name}</p>
                  <p className="mt-0.5 text-[13px] text-ink-3">{usageLabel(usage.total)}</p>
                </div>
                <div className="flex shrink-0 items-center">
                  <IconButton label={`Editar ${category.name}`} onClick={() => onEdit(category)}><Pencil size={16} aria-hidden /></IconButton>
                  <IconButton label={`Excluir ${category.name}`} className="hover:text-expense" onClick={() => onDelete(category)}><Trash2 size={16} aria-hidden /></IconButton>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
