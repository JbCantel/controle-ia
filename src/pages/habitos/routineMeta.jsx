export const DAY_LABELS = {
  seg: { short: 'Seg', long: 'Segunda' },
  ter: { short: 'Ter', long: 'Terça' },
  qua: { short: 'Qua', long: 'Quarta' },
  qui: { short: 'Qui', long: 'Quinta' },
  sex: { short: 'Sex', long: 'Sexta' },
  sab: { short: 'Sáb', long: 'Sábado' },
  dom: { short: 'Dom', long: 'Domingo' },
};

export const KIND_META = {
  pessoal: { label: 'Pessoal', className: 'border-chart-purple/30 bg-chart-purple/10 text-chart-purple' },
  trabalho: { label: 'Trabalho', className: 'border-chart-cyan/30 bg-chart-cyan/10 text-chart-cyan' },
  pausa: { label: 'Pausa', className: 'border-amber/30 bg-amber/10 text-amber' },
  saude: { label: 'Saúde', className: 'border-brand-line bg-brand-soft text-brand' },
  estudo: { label: 'Estudo', className: 'border-chart-orange/30 bg-chart-orange/10 text-chart-orange' },
  sono: { label: 'Sono', className: 'border-sleep/30 bg-sleep/10 text-sleep' },
};

export function KindBadge({ kind }) {
  const meta = KIND_META[kind] ?? KIND_META.pessoal;
  return <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs ${meta.className}`}>{meta.label}</span>;
}
