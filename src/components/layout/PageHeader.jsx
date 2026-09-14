import DatePill from './DatePill';

export default function PageHeader({ eyebrow = 'Finanças pessoais', title, subtitle, actions }) {
  return (
    <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="mt-2 font-serif text-[34px] leading-none text-ink md:text-[44px]">{title}</h1>
        {subtitle && <p className="mt-2 text-sm text-ink-2">{subtitle}</p>}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {actions}
        <DatePill />
      </div>
    </header>
  );
}
