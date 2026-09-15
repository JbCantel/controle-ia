import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import ChartTooltip from './ChartTooltip';
import { formatBRL } from '../../domain/money';
import { useReducedMotion } from '../../hooks/useReducedMotion';

const percent = (share) => `${Math.round(share * 100)}%`;

export default function CategoryDonut({ items }) {
  const reduced = useReducedMotion();
  const data = items.map((i) => ({ ...i, reais: i.cents / 100 }));
  const summary = items.map((i) => `${i.name} ${percent(i.share)}`).join('; ');
  const totalCents = items.reduce((sum, item) => sum + item.cents, 0);

  return (
    <div>
      <div role="img" aria-label={`Gastos por categoria: ${summary}`} className="relative mx-auto h-[220px] w-full max-w-[260px]">
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
        <div aria-hidden className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xs text-ink-3">Despesas</span>
          <strong className="mt-1 text-base font-semibold tracking-[-0.01em] text-ink tabular-nums">{formatBRL(totalCents)}</strong>
        </div>
      </div>
      <ul className="mt-5 flex flex-wrap justify-center gap-x-5 gap-y-2.5">
        {items.map((i) => (
          <li key={i.categoryId} className="flex items-center gap-2 text-sm text-ink-2">
            <span aria-hidden className="h-2.5 w-2.5 rounded-full bg-deco" style={i.color ? { backgroundColor: i.color } : undefined} />
            <span>{i.name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
