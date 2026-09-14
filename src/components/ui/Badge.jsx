export default function Badge({ children, className = '' }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border border-line px-2 py-0.5 text-xs text-ink-2 ${className}`}>
      {children}
    </span>
  );
}
