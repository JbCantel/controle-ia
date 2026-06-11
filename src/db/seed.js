import { todayISO, currentMonthKey, addMonths, addDays } from '../utils/dates';
import { isExpectedOn } from '../utils/streaks';

// Roda UMA vez, quando o banco é criado (evento populate do Dexie).
// "Zerar dados" nos Ajustes limpa as tabelas sem recriar o banco — não re-seeda.
export async function seedDatabase(tx) {
  const today = todayISO();
  const cur = currentMonthKey();
  const prev = addMonths(cur, -1);

  const catIds = await tx.categories.bulkAdd([
    { name: 'Moradia', type: 'despesa', icon: '🏠', color: '#f59e0b' },
    { name: 'Alimentação', type: 'despesa', icon: '🍽️', color: '#ef4444' },
    { name: 'Transporte', type: 'despesa', icon: '🚗', color: '#3b82f6' },
    { name: 'Lazer', type: 'despesa', icon: '🎮', color: '#a855f7' },
    { name: 'Saúde', type: 'despesa', icon: '💊', color: '#14b8a6' },
    { name: 'Mercado', type: 'despesa', icon: '🛒', color: '#84cc16' },
    { name: 'Outros', type: 'despesa', icon: '📦', color: '#94a3b8', system: true },
    { name: 'Salário', type: 'receita', icon: '💰', color: '#10b981' },
  ], { allKeys: true });

  const [moradia, alimentacao, transporte, lazer, saude, mercado, , salario] = catIds;

  const txOf = (month, day, type, amount, categoryId, description) =>
    ({ type, amount, date: `${month}-${String(day).padStart(2, '0')}`, categoryId, description });

  await tx.transactions.bulkAdd([
    // Mês anterior
    txOf(prev, 5, 'receita', 420000, salario, 'Salário'),
    txOf(prev, 5, 'despesa', 120000, moradia, 'Aluguel'),
    txOf(prev, 6, 'despesa', 18900, mercado, 'Mercado da semana'),
    txOf(prev, 8, 'despesa', 4500, transporte, 'Combustível'),
    txOf(prev, 10, 'despesa', 6800, alimentacao, 'Almoço fora'),
    txOf(prev, 12, 'despesa', 22000, mercado, 'Mercado do mês'),
    txOf(prev, 14, 'despesa', 3990, lazer, 'Streaming'),
    txOf(prev, 15, 'despesa', 8900, saude, 'Farmácia'),
    txOf(prev, 18, 'despesa', 12000, lazer, 'Cinema e jantar'),
    txOf(prev, 20, 'despesa', 5200, transporte, 'Uber'),
    txOf(prev, 22, 'despesa', 15400, mercado, 'Mercado da semana'),
    txOf(prev, 25, 'despesa', 7300, alimentacao, 'Delivery'),
    txOf(prev, 27, 'despesa', 9900, lazer, 'Show'),
    // Mês atual
    txOf(cur, 5, 'receita', 420000, salario, 'Salário'),
    txOf(cur, 5, 'despesa', 120000, moradia, 'Aluguel'),
    txOf(cur, 6, 'despesa', 21500, mercado, 'Mercado da semana'),
    txOf(cur, 7, 'despesa', 4800, transporte, 'Combustível'),
    txOf(cur, 8, 'despesa', 5600, alimentacao, 'Almoço fora'),
    txOf(cur, 9, 'despesa', 3990, lazer, 'Streaming'),
    txOf(cur, 9, 'despesa', 16200, lazer, 'Jogo novo'),
    txOf(cur, 10, 'despesa', 7800, alimentacao, 'Delivery'),
  ]);

  await tx.budgets.bulkAdd([
    { categoryId: alimentacao, monthlyLimit: 60000 },
    { categoryId: lazer, monthlyLimit: 25000 },
  ]);

  const goalId = await tx.goals.add({
    name: 'Reserva de emergência',
    targetAmount: 500000,
    createdAt: addDays(today, -45),
  });
  await tx.contributions.bulkAdd([
    { goalId, amount: 50000, date: addDays(today, -40) },
    { goalId, amount: 75000, date: addDays(today, -10) },
  ]);

  const habitIds = await tx.habits.bulkAdd([
    { name: 'Beber água', icon: '💧', color: '#3b82f6', frequency: 'daily', archived: false, createdAt: addDays(today, -25) },
    { name: 'Fazer exercícios', icon: '🏃', color: '#f97316', frequency: [1, 3, 5], archived: false, createdAt: addDays(today, -25) },
    { name: 'Ler', icon: '📚', color: '#a855f7', frequency: 'daily', archived: false, createdAt: addDays(today, -25) },
  ], { allKeys: true });

  const habitsSeed = [
    { id: habitIds[0], frequency: 'daily', createdAt: addDays(today, -25), skip: [4, 11] },
    { id: habitIds[1], frequency: [1, 3, 5], createdAt: addDays(today, -25), skip: [9] },
    { id: habitIds[2], frequency: 'daily', createdAt: addDays(today, -25), skip: [2, 7, 8, 15] },
  ];
  const logs = [];
  for (const h of habitsSeed) {
    for (let i = 1; i <= 20; i++) {            // últimos 20 dias, sem incluir hoje
      if (h.skip.includes(i)) continue;        // falhas realistas para variar os streaks
      const date = addDays(today, -i);
      if (isExpectedOn(h, date)) logs.push({ habitId: h.id, date });
    }
  }
  await tx.habitLogs.bulkAdd(logs);

  await tx.settings.add({ key: 'seeded', value: true });
}
