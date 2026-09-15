const TONES = {
  ok: 'bg-brand',
  alerta: 'bg-amber',
  estourado: 'bg-expense',
};

export default function ProgressBar({ value, status = 'ok', label, className = '' }) {
  const safeValue = Number.isFinite(value) ? Math.max(0, value) : 0;
  const visualValue = Math.min(100, safeValue);

  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(visualValue)}
      aria-valuetext={label ?? `${Math.round(safeValue)}% usado`}
      className={`h-2 overflow-hidden rounded-full bg-line ${className}`}
    >
      <div
        className={`h-full rounded-full transition-[width] duration-300 ${TONES[status] ?? TONES.ok}`}
        style={{ width: `${visualValue}%` }}
      />
    </div>
  );
}
