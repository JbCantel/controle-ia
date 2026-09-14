export const inputClass = 'h-10 w-full rounded-xl border border-line bg-bg px-3 text-sm text-ink placeholder:text-ink-3 transition-colors duration-150 hover:border-deco aria-[invalid=true]:border-expense';

export default function Field({ label, htmlFor, error, hint, children }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="block text-[13px] text-ink-2">{label}</label>
      {children}
      {error
        ? <p className="text-xs text-expense" role="alert">{error}</p>
        : hint ? <p className="text-xs text-ink-3">{hint}</p> : null}
    </div>
  );
}
