export default function ChartTooltip({ active, payload, label, formatter }) {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  return (
    <div className="rounded-xl border border-line bg-surface-2 px-3 py-2 text-[13px]">
      <p className="text-ink-3">{label ?? item.name}</p>
      <p className="mt-0.5 font-semibold tabular-nums text-ink">{formatter(item)}</p>
    </div>
  );
}
