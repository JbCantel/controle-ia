import { addMonths, daysInMonth } from './dates';

export function occurrenceDate(month, dayOfMonth) {
  const day = Math.min(dayOfMonth, daysInMonth(month));
  return `${month}-${String(day).padStart(2, '0')}`;
}

// Ocorrências devidas até hoje (inclusive), a partir do mês seguinte ao marcador.
export function dueOccurrences(rules, today) {
  const currentMonth = today.slice(0, 7);
  const transactions = [];
  const updates = [];
  for (const rule of rules) {
    if (!rule.active) continue;
    let last = rule.lastGeneratedMonth;
    for (let month = addMonths(last, 1); month <= currentMonth; month = addMonths(month, 1)) {
      const date = occurrenceDate(month, rule.dayOfMonth);
      if (date > today) break;
      transactions.push({
        type: rule.type, value: rule.value, date, categoryId: rule.categoryId,
        description: rule.description, recurrenceId: rule.id,
      });
      last = month;
    }
    if (last !== rule.lastGeneratedMonth) updates.push({ id: rule.id, lastGeneratedMonth: last });
  }
  return { transactions, updates };
}

// Ao retomar, pula os meses pausados: no máximo o mês atual ainda será gerado.
export function resumeMarker(lastGeneratedMonth, today) {
  const previous = addMonths(today.slice(0, 7), -1);
  return lastGeneratedMonth > previous ? lastGeneratedMonth : previous;
}

export function ruleFromTransaction(tx) {
  const month = tx.date.slice(0, 7);
  return {
    type: tx.type, value: tx.value, categoryId: tx.categoryId, description: tx.description,
    dayOfMonth: Number(tx.date.slice(8, 10)), startMonth: month, lastGeneratedMonth: month, active: true,
  };
}
