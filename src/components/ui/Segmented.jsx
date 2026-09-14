export default function Segmented({ label, options, value, onChange }) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex rounded-full border border-line bg-surface-2 p-1">
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(option.value)}
            className={`h-9 rounded-full px-3.5 text-[13px] font-medium transition-colors duration-150 ${active ? 'bg-brand-soft text-ink ring-1 ring-brand-line' : 'text-ink-2 hover:text-ink'}`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
