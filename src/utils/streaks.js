import { addDays, weekdayOf } from './dates';

// O hábito é esperado neste dia? (a partir da criação, conforme a frequência)
export function isExpectedOn(habit, iso) {
  if (iso < habit.createdAt) return false;
  if (habit.frequency === 'daily') return true;
  return habit.frequency.includes(weekdayOf(iso));
}

// Streak atual: anda para trás a partir de hoje. Hoje sem marcação não quebra
// (o dia ainda não acabou); dia esperado passado sem marcação quebra.
export function currentStreak(habit, logSet, today) {
  let streak = 0;
  let day = today;
  while (day >= habit.createdAt) {
    if (isExpectedOn(habit, day)) {
      if (logSet.has(day)) streak++;
      else if (day !== today) break;
    }
    day = addDays(day, -1);
  }
  return streak;
}

// Recorde: varre da criação até hoje contando sequências de dias esperados feitos.
export function bestStreak(habit, logSet, today) {
  let best = 0;
  let run = 0;
  let day = habit.createdAt;
  while (day <= today) {
    if (isExpectedOn(habit, day)) {
      if (logSet.has(day)) {
        run++;
        if (run > best) best = run;
      } else if (day !== today) { // hoje sem marcação ainda não é falha
        run = 0;
      }
    }
    day = addDays(day, 1);
  }
  return best;
}
