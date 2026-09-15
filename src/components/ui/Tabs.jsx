export default function Tabs({ label, tabs, value, onChange, idBase = 'tab', panelId }) {
  function onKeyDown(event, index) {
    let nextIndex = null;
    if (event.key === 'ArrowRight') nextIndex = (index + 1) % tabs.length;
    if (event.key === 'ArrowLeft') nextIndex = (index - 1 + tabs.length) % tabs.length;
    if (event.key === 'Home') nextIndex = 0;
    if (event.key === 'End') nextIndex = tabs.length - 1;
    if (nextIndex === null) return;
    event.preventDefault();
    onChange(tabs[nextIndex].value);
    event.currentTarget.parentElement.querySelectorAll('[role="tab"]')[nextIndex]?.focus();
  }

  return (
    <div role="tablist" aria-label={label} className="inline-flex rounded-full border border-line bg-surface p-1">
      {tabs.map((tab, index) => {
        const active = tab.value === value;
        return (
          <button
            key={tab.value}
            id={`${idBase}-${tab.value}`}
            type="button"
            role="tab"
            aria-selected={active}
            aria-controls={panelId}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(tab.value)}
            onKeyDown={(event) => onKeyDown(event, index)}
            className={`h-10 rounded-full px-5 text-sm font-medium transition-colors duration-150 ${active ? 'bg-brand-soft text-brand ring-1 ring-brand-line' : 'text-ink-2 hover:text-ink'}`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
