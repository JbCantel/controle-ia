import Card from '../../components/ui/Card';

const TONES = {
  brand: { badge: 'bg-brand/12 text-brand ring-brand/25', color: 'var(--color-brand)' },
  income: { badge: 'bg-income/12 text-income ring-income/25', color: 'var(--color-income)' },
  expense: { badge: 'bg-expense/12 text-expense ring-expense/25', color: 'var(--color-expense)' },
  amber: { badge: 'bg-amber/12 text-amber ring-amber/25', color: 'var(--color-amber)' },
};

export default function StatCard({ icon: Icon, tone, label, value, caption, valueTone }) {
  const palette = TONES[tone];
  return (
    <Card
      className="@container flex flex-col rounded-kpi p-4 sm:p-6"
      style={{
        backgroundColor: `color-mix(in srgb, ${palette.color} 3.5%, var(--color-surface))`,
        borderColor: `color-mix(in srgb, ${palette.color} 14%, var(--color-line))`,
      }}
    >
      {/* Como na foto: emblema na mesma linha do rótulo. */}
      <div className="flex items-center gap-3">
        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ring-1 ${palette.badge}`}>
          <Icon size={18} strokeWidth={1.9} aria-hidden />
        </span>
        <p className="text-sm font-medium text-ink-2">{label}</p>
      </div>
      <p className={`mt-3.5 whitespace-nowrap text-[26px] font-bold leading-tight tracking-[-0.01em] tabular-nums @[16rem]:text-[30px] ${valueTone === 'expense' ? 'text-expense' : 'text-ink'}`}>
        {value}
      </p>
      <p className="mt-1.5 text-[13px] leading-relaxed text-ink-3">{caption}</p>
    </Card>
  );
}
