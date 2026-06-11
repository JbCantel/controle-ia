import { formatBRL } from './money';

function sumByCategory(txs) {
  const map = {};
  for (const t of txs) map[t.categoryId] = (map[t.categoryId] ?? 0) + t.amount;
  return map;
}

// Gera até 4 frases sobre o mês, por templates locais (sem IA, sem rede).
export function buildSummary({ monthTx, prevTx, prevLabel, categories, budgets }) {
  const sentences = [];
  const catName = (id) => categories.find((c) => c.id === Number(id))?.name ?? 'Outros';

  const expenses = monthTx.filter((t) => t.type === 'despesa');
  const prevExpenses = prevTx.filter((t) => t.type === 'despesa');
  const total = expenses.reduce((s, t) => s + t.amount, 0);
  const prevTotal = prevExpenses.reduce((s, t) => s + t.amount, 0);

  // 1. Comparação com o mês anterior (só se houver dados nos dois meses)
  if (total > 0 && prevTotal > 0) {
    const diff = Math.round(((total - prevTotal) / prevTotal) * 100);
    if (diff > 0) sentences.push(`Você gastou ${diff}% a mais que em ${prevLabel}.`);
    else if (diff < 0) sentences.push(`Você gastou ${Math.abs(diff)}% a menos que em ${prevLabel}. 👏`);

    // 2. Categoria com maior variação percentual
    const cur = sumByCategory(expenses);
    const prev = sumByCategory(prevExpenses);
    let topId = null;
    let topPct = 0;
    for (const id in cur) {
      if (!prev[id]) continue;
      const pct = Math.round(((cur[id] - prev[id]) / prev[id]) * 100);
      if (Math.abs(pct) > Math.abs(topPct)) {
        topPct = pct;
        topId = id;
      }
    }
    if (topId !== null && topPct !== 0) {
      const verb = topPct > 0 ? 'subiram' : 'caíram';
      sentences.push(`Seus gastos com ${catName(topId)} ${verb} ${Math.abs(topPct)}%.`);
    }
  }

  // 3. Maior gasto individual
  if (expenses.length > 0) {
    const biggest = expenses.reduce((a, b) => (b.amount > a.amount ? b : a));
    sentences.push(`Maior gasto do mês: ${biggest.description} (${formatBRL(biggest.amount)}).`);
  }

  // 4. Primeiro alerta de orçamento em >= 80%
  const spent = sumByCategory(expenses);
  for (const b of budgets) {
    const s = spent[b.categoryId] ?? 0;
    if (b.monthlyLimit > 0 && s / b.monthlyLimit >= 0.8) {
      sentences.push(`⚠️ Orçamento de ${catName(b.categoryId)} está em ${Math.round((s / b.monthlyLimit) * 100)}%.`);
      break;
    }
  }

  return sentences.slice(0, 4);
}
