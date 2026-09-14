import Card from '../../components/ui/Card';

const TONES = {
  brand: 'bg-brand/12 text-brand ring-brand/25',
  income: 'bg-income/12 text-income ring-income/25',
  expense: 'bg-expense/12 text-expense ring-expense/25',
  amber: 'bg-amber/12 text-amber ring-amber/25',
};

export default function StatCard({ icon: Icon, tone, label, value, caption, valueTone }) {
  return (
    <Card className="@container flex flex-col rounded-kpi p-5 sm:p-6">
      <span className={`flex h-9 w-9 items-center justify-center rounded-full ring-1 ${TONES[tone]}`}>
        <Icon size={18} strokeWidth={1.9} aria-hidden />
      </span>
      <p className="mt-4 text-sm text-ink-2">{label}</p>
      <p className={`mt-1.5 whitespace-nowrap text-[26px] font-bold leading-tight tracking-[-0.01em] tabular-nums @[16rem]:text-[30px] ${valueTone === 'expense' ? 'text-expense' : 'text-ink'}`}>
        {value}
      </p>
      <p className="mt-1.5 text-[13px] text-ink-3">{caption}</p>
    </Card>
  );
}
