import { CircleDollarSign } from 'lucide-react';

export default function Brand() {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand/12 text-brand ring-1 ring-brand-line">
        <CircleDollarSign size={18} strokeWidth={1.75} aria-hidden />
      </span>
      <div className="leading-tight">
        <p className="text-[15px] font-semibold tracking-wide text-ink">ORBE</p>
        <p className="text-[11px] text-ink-3">Finanças pessoais</p>
      </div>
    </div>
  );
}
