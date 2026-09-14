import { useId } from 'react';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import ChartTooltip from './ChartTooltip';
import { formatBRL } from '../../domain/money';
import { useReducedMotion } from '../../hooks/useReducedMotion';

export default function BalanceChart({ points }) {
  const gradientId = `saldo-${useId().replace(/:/g, '')}`;
  const reduced = useReducedMotion();
  const data = points.map((p) => ({ label: p.label, cents: p.cents, reais: p.cents / 100 }));
  const summary = points.map((p) => `${p.label} ${formatBRL(p.cents)}`).join('; ');

  return (
    <div role="img" aria-label={`Saldo acumulado nos últimos meses: ${summary}`} className="h-[200px] md:h-[260px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 12, right: 12, bottom: 0, left: 12 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-brand)" stopOpacity={0.35} />
              <stop offset="100%" stopColor="var(--color-brand)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="label" axisLine={false} tickLine={false} interval={0} tickMargin={12} tick={{ fill: 'var(--color-ink-3)', fontSize: 13 }} />
          <YAxis hide domain={[(min) => Math.min(0, min), (max) => Math.max(0, max)]} />
          <Tooltip cursor={{ stroke: 'var(--color-line)', strokeWidth: 1 }} content={<ChartTooltip formatter={(item) => formatBRL(item.payload.cents)} />} />
          <Area
            type="monotone"
            dataKey="reais"
            stroke="var(--color-brand)"
            strokeWidth={2.5}
            fill={`url(#${gradientId})`}
            activeDot={{ r: 5, fill: 'var(--color-brand)', stroke: 'var(--color-surface)', strokeWidth: 2 }}
            isAnimationActive={!reduced}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
