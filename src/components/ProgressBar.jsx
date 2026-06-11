// Barra com cores automáticas: verde < 80%, âmbar 80–100%, vermelho > 100%
export default function ProgressBar({ value, max }) {
  const ratio = max > 0 ? value / max : 0;
  const width = Math.min(ratio * 100, 100);
  const color = ratio > 1 ? 'bg-red-500' : ratio >= 0.8 ? 'bg-amber-500' : 'bg-emerald-500';
  return (
    <div className="h-2.5 w-full rounded-full bg-slate-200 dark:bg-slate-700">
      <div className={`h-2.5 rounded-full transition-all ${color}`} style={{ width: `${width}%` }} />
    </div>
  );
}
