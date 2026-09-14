import { formatDateBR } from '../../domain/dates';
import { formatSigned } from '../../domain/money';

export default function RecentList({ transactions, categoriesById }) {
  return (
    <ul className="mt-4">
      {transactions.map((t) => {
        const category = categoriesById.get(t.categoryId);
        return (
          <li key={t.id} className="flex items-center gap-4 border-t border-line py-3.5 first:border-t-0">
            <span aria-hidden className="h-10 w-[3px] shrink-0 rounded-full bg-deco" style={category?.color ? { backgroundColor: category.color } : undefined} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[15px] font-medium text-ink">{t.description}</p>
              <p className="mt-1 text-[13px] text-ink-3">{category?.name ?? 'Sem categoria'} · {formatDateBR(t.date)}</p>
            </div>
            <p className={`shrink-0 whitespace-nowrap text-[15px] font-semibold tabular-nums ${t.type === 'receita' ? 'text-brand' : 'text-expense'}`}>
              {formatSigned(t.value, t.type)}
            </p>
          </li>
        );
      })}
    </ul>
  );
}
