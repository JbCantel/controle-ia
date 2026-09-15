import { db } from './db';
import { goalProgress, validateContribution, validateGoal } from '../domain/goals';
import { fromCents, toCents } from '../domain/money';

class GoalDataError extends Error {
  constructor(details) {
    super('Dados da meta invalidos.');
    this.name = 'GoalDataError';
    this.code = 'GOAL_INVALID';
    this.details = details;
  }
}

class ContributionDataError extends Error {
  constructor(details) {
    super('Dados do movimento invalidos.');
    this.name = 'ContributionDataError';
    this.code = 'CONTRIBUTION_INVALID';
    this.details = details;
  }
}

function normalizeGoal(input) {
  const cents = toCents(input.target);
  const details = validateGoal({ name: input.name, cents, deadline: input.deadline || '' });
  if (Object.keys(details).length > 0) throw new GoalDataError(details);
  return {
    name: input.name.trim(),
    target: fromCents(cents),
    ...(input.deadline ? { deadline: input.deadline } : {}),
  };
}

export async function addGoal(input, { database = db } = {}) {
  return database.goals.add(normalizeGoal(input));
}

export async function updateGoal(id, input, { database = db } = {}) {
  const data = normalizeGoal(input);
  const changed = await database.goals.put({ id, ...data });
  return changed;
}

export async function deleteGoal(id, { database = db } = {}) {
  return database.transaction('rw', database.goals, database.contributions, async () => {
    await database.contributions.where('goalId').equals(id).delete();
    await database.goals.delete(id);
  });
}

export async function addContribution(input, { database = db } = {}) {
  return database.transaction('rw', database.goals, database.contributions, async () => {
    const goal = await database.goals.get(input.goalId);
    const contributions = goal
      ? await database.contributions.where('goalId').equals(input.goalId).toArray()
      : [];
    const currentTotalCents = goal ? goalProgress(goal, contributions).accumulatedCents : 0;
    const cents = toCents(input.value);
    const details = validateContribution({ cents, date: input.date }, currentTotalCents, input.mode);
    if (!goal) details.goalId = 'Meta não encontrada.';
    if (Object.keys(details).length > 0) throw new ContributionDataError(details);

    return database.contributions.add({
      goalId: input.goalId,
      value: input.mode === 'resgate' ? -fromCents(cents) : fromCents(cents),
      date: input.date,
    });
  });
}

export async function deleteContribution(id, { database = db } = {}) {
  await database.contributions.delete(id);
}

export { GoalDataError, ContributionDataError };
