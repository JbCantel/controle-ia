import { addDays, daysInMonth, weekdayKey } from './dates';

export const ROUTINE_DAYS = ['seg', 'ter', 'qua', 'qui', 'sex', 'sab', 'dom'];
export const ROUTINE_KINDS = ['pessoal', 'trabalho', 'pausa', 'saude', 'estudo', 'sono'];

const validTime = (time) => /^([01]\d|2[0-3]):[0-5]\d$/.test(time || '');

export function blocksForDay(habits, day, { includeInactive = false } = {}) {
  return habits
    .filter((habit) => habit.day === day && (includeInactive || habit.active))
    .sort((a, b) => (
      a.time.localeCompare(b.time)
      || (a.order ?? 0) - (b.order ?? 0)
      || (a.id ?? 0) - (b.id ?? 0)
    ));
}

export function blocksForDate(habits, date) {
  return blocksForDay(habits, weekdayKey(date));
}

function timeContains(block, nowTime) {
  if (block.endTime > block.time) return nowTime >= block.time && nowTime < block.endTime;
  return nowTime >= block.time || nowTime < block.endTime;
}

export function currentBlock(habits, date, today, nowTime) {
  if (date !== today) return null;
  return blocksForDate(habits, date).find((block) => timeContains(block, nowTime)) ?? null;
}

export function dailyProgress(habits, checks, date, today) {
  if (date > today) return null;
  const blocks = blocksForDate(habits, date);
  if (blocks.length === 0) return null;
  const checkedIds = new Set(
    checks
      .filter((check) => check.date === date)
      .map((check) => check.habitId),
  );
  const done = blocks.filter((block) => checkedIds.has(block.id)).length;
  return { done, total: blocks.length, percentage: (done / blocks.length) * 100 };
}

export function routineCalendar(habits, checks, month, today) {
  return Array.from({ length: daysInMonth(month) }, (_, index) => {
    const date = `${month}-${String(index + 1).padStart(2, '0')}`;
    return { date, progress: dailyProgress(habits, checks, date, today) };
  });
}

export function routineStreaks(habits, checks, today) {
  const historicalChecks = checks.filter((check) => check.date <= today);
  if (historicalChecks.length === 0) return { current: 0, record: 0, firstCheckDate: null };
  const firstCheckDate = historicalChecks.reduce(
    (first, check) => (check.date < first ? check.date : first),
    historicalChecks[0].date,
  );

  const days = [];
  for (let date = firstCheckDate; date <= today; date = addDays(date, 1)) {
    days.push({ date, progress: dailyProgress(habits, historicalChecks, date, today) });
  }

  let current = 0;
  for (let index = days.length - 1; index >= 0; index -= 1) {
    const { date, progress } = days[index];
    if (progress === null) continue;
    const good = progress.percentage >= 80;
    if (date === today && !good) continue;
    if (!good) break;
    current += 1;
  }

  let record = 0;
  let running = 0;
  for (const { date, progress } of days) {
    if (progress === null) continue;
    const good = progress.percentage >= 80;
    if (date === today && !good) continue;
    running = good ? running + 1 : 0;
    record = Math.max(record, running);
  }

  return { current, record, firstCheckDate };
}

export function validateHabit(input) {
  const errors = {};
  if (!(input.name || '').trim()) errors.name = 'Informe um nome para o bloco.';
  if (!ROUTINE_DAYS.includes(input.day)) errors.day = 'Escolha um dia da semana.';
  if (!validTime(input.time)) errors.time = 'Informe um horário válido.';
  if (!validTime(input.endTime) || input.endTime === input.time) {
    errors.endTime = 'Informe um horário válido e diferente do início.';
  }
  if (!ROUTINE_KINDS.includes(input.kind)) errors.kind = 'Escolha um tipo de bloco.';
  return errors;
}
