export default function Card({ as: Tag = 'section', className = '', children, ...props }) {
  return (
    <Tag className={`rounded-card border border-line bg-surface ${className}`} {...props}>
      {children}
    </Tag>
  );
}

export function CardTitle({ title, subtitle, action }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <h2 className="font-serif text-xl font-semibold leading-tight tracking-[-0.01em] text-ink">{title}</h2>
        {subtitle && <p className="mt-1 text-pretty text-[13px] leading-relaxed text-ink-3">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
