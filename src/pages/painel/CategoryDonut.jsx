import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import ChartTooltip from './ChartTooltip';
import { formatBRL } from '../../domain/money';
import { useReducedMotion } from '../../hooks/useReducedMotion';

const percent = (share) => `${Math.round(share * 100)}%`;

export default function CategoryDonut({ items }) {
  const reduced = useReducedMotion();
  const data = items.map((i) => ({ ...i, reais: i.cents / 100 }));
  const summary = items.map((i) => `${i.name} ${percent(i.share)}`).join('; ');

  return (
    <div>
      <div role="img" aria-label={`Gastos por categoria: ${summary}`} className="mx-auto h-[220px] w-full max-w-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="reais"
              nameKey="name"
              innerRadius="64%"
              outerRadius="94%"
              startAngle={90}
              endAngle={-270}
              paddingAngle={items.length > 1 ? 2 : 0}
              stroke="none"
              isAnimationActive={!reduced}
            >
              {data.map((i) => <Cell key={i.categoryId} fill={i.color ?? 'var(--color-deco)'} />)}
            </Pie>
            <Tooltip content={<ChartTooltip formatter={(item) => `${formatBRL(item.payload.cents)} · ${percent(item.payload.share)}`} />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="mt-5 flex flex-wrap justify-center gap-x-5 gap-y-2">
        {items.map((i) => (
          <li key={i.categoryId} className="flex items-center gap-2 text-sm text-ink-2">
            <span aria-hidden className="h-2.5 w-2.5 rounded-full bg-deco" style={i.color ? { backgroundColor: i.color } : undefined} />
            {i.name}
          </li>
        ))}
      </ul>
    </div>
  );
}
