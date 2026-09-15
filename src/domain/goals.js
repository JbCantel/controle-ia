import { addMonths, monthKey } from './dates';
import { toCents } from './money';

function validDate(date) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date || '')) return false;
  const [year, month, day] = date.split('-').map(Number);
  const parsed = new Date(year, month - 1, day);
  return parsed.getFullYear() === year && parsed.getMonth() === month - 1 && parsed.getDate() === day;
}

function monthsBetween(fromMonth, toMonth) {
  const [fromYear, fromValue] = fromMonth.split('-').map(Number);
  const [toYear, toValue] = toMonth.split('-').map(Number);
  return (toYear - fromYear) * 12 + toValue - fromValue;
}

function goalContributions(goal, contributions, endDate) {
  return contributions.filter((contribution) => (
    contribution.goalId === goal.id
    && (!endDate || contribution.date <= endDate)
  ));
}

export function goalProgress(goal, contributions, endDate) {
  const accumulatedCents = goalContributions(goal, contributions, endDate)
    .reduce((total, contribution) => total + toCents(contribution.value), 0);
  const targetCents = toCents(goal.target);
  const remainingCents = Math.max(0, targetCents - accumulatedCents);

  return {
    accumulatedCents,
    targetCents,
    remainingCents,
    percentage: targetCents > 0 ? (accumulatedCents / targetCents) * 100 : 0,
    completed: accumulatedCents >= targetCents,
  };
}

export function forecastGoal(goal, contributions, currentMonth) {
  const endDate = `${currentMonth}-31`;
  const relevant = goalContributions(goal, contributions, endDate)
    .sort((a, b) => a.date.localeCompare(b.date));
  const progress = goalProgress(goal, relevant, endDate);
  const base = { ...progress };

  if (progress.completed) return { ...base, state: 'concluida', message: 'concluída' };
  if (relevant.length === 0) return { ...base, state: 'sem-aportes', message: 'registre aportes para estimar' };

  const elapsedMonths = Math.max(1, monthsBetween(monthKey(relevant[0].date), currentMonth) + 1);
  const rhythmCents = progress.accumulatedCents / elapsedMonths;
  if (rhythmCents <= 0) {
    return { ...base, state: 'sem-ritmo', message: 'sem ritmo para estimar', elapsedMonths, rhythmCents };
  }

  const monthsToGoal = Math.ceil(progress.remainingCents / rhythmCents);
  const arrivalMonth = addMonths(currentMonth, monthsToGoal);
  const forecast = {
    ...base,
    state: 'estimada',
    message: null,
    elapsedMonths,
    rhythmCents,
    monthsToGoal,
    arrivalMonth,
  };

  if (goal.deadline) {
    const deadlineMonth = monthKey(goal.deadline);
    const monthsUntilDeadline = Math.max(1, monthsBetween(currentMonth, deadlineMonth));
    forecast.deadlineMonth = deadlineMonth;
    forecast.monthsUntilDeadline = monthsUntilDeadline;
    forecast.neededPerMonthCents = Math.ceil(progress.remainingCents / monthsUntilDeadline);
    forecast.onTime = arrivalMonth <= deadlineMonth;
  }

  return forecast;
}

export function validateGoal(input) {
  const errors = {};
  if (!(input.name || '').trim()) errors.name = 'Informe um nome para a meta.';
  if (!Number.isInteger(input.cents) || input.cents <= 0) errors.target = 'Informe um alvo maior que zero.';
  if (input.deadline && !validDate(input.deadline)) errors.deadline = 'Informe um prazo válido.';
  return errors;
}

export function validateContribution(input, currentTotalCents, mode) {
  const errors = {};
  if (!Number.isInteger(input.cents) || input.cents <= 0) errors.value = 'Informe um valor maior que zero.';
  if (!validDate(input.date)) errors.date = 'Informe a data.';
  if (mode !== 'aporte' && mode !== 'resgate') errors.mode = 'Escolha aporte ou resgate.';
  if (mode === 'resgate' && Number.isInteger(input.cents) && input.cents > currentTotalCents) {
    errors.value = 'O resgate não pode passar do valor acumulado.';
  }
  return errors;
}
