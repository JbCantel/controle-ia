export const inputClass = 'h-11 w-full rounded-xl border border-line bg-surface-2 px-3.5 text-[15px] text-ink placeholder:text-ink-3 transition-colors duration-150 hover:border-deco aria-[invalid=true]:border-expense';

export default function Field({ label, htmlFor, error, hint, children }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="block text-sm text-ink-2">{label}</label>
      {children}
      {error
        ? <p className="text-[13px] text-expense" role="alert">{error}</p>
        : hint ? <p className="text-[13px] text-ink-3">{hint}</p> : null}
    </div>
  );
}
