import DatePill from './DatePill';

export default function PageHeader({ eyebrow = 'Finanças pessoais', title, subtitle, actions }) {
  return (
    <header className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="mt-3 font-serif text-[40px] font-semibold leading-[1.05] tracking-[-0.02em] text-ink md:text-[52px]">{title}</h1>
        {subtitle && <p className="mt-3 text-[15px] text-ink-2">{subtitle}</p>}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {actions}
        <DatePill />
      </div>
    </header>
  );
}
