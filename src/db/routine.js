import { db } from './db';
import { todayISO } from '../domain/dates';
import { validateHabit } from '../domain/routine';

export class RoutineDataError extends Error {
  constructor(code, message, details = {}) {
    super(message);
    this.name = 'RoutineDataError';
    this.code = code;
    this.details = details;
  }
}

function normalizeHabit(input) {
  const details = validateHabit(input);
  if (Object.keys(details).length > 0) {
    throw new RoutineDataError('HABIT_INVALID', 'Dados do bloco invalidos.', details);
  }
  return {
    day: input.day,
    time: input.time,
    endTime: input.endTime,
    name: input.name.trim(),
    kind: input.kind,
    order: Number.isFinite(input.order) ? input.order : 0,
    active: input.active !== false,
  };
}

export async function addHabit(input, { database = db } = {}) {
  return database.habits.add(normalizeHabit(input));
}

export async function updateHabit(id, input, { database = db } = {}) {
  const data = normalizeHabit(input);
  const exists = await database.habits.get(id);
  if (!exists) throw new RoutineDataError('HABIT_NOT_FOUND', 'Bloco nao encontrado.');
  await database.habits.put({ id, ...data });
  return id;
}

export async function deleteHabit(id, { database = db } = {}) {
  return database.transaction('rw', database.habits, database.habitChecks, async () => {
    await database.habitChecks.where('habitId').equals(id).delete();
    await database.habits.delete(id);
  });
}

export async function setHabitChecked(habitId, date, checked, { database = db, today = todayISO() } = {}) {
  return database.transaction('rw', database.habits, database.habitChecks, async () => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date || '')) {
      throw new RoutineDataError('ROUTINE_DATE_INVALID', 'Data invalida.');
    }
    if (date > today) throw new RoutineDataError('ROUTINE_FUTURE', 'Nao e possivel marcar uma data futura.');
    if (!await database.habits.get(habitId)) {
      throw new RoutineDataError('HABIT_NOT_FOUND', 'Bloco nao encontrado.');
    }

    const existing = await database.habitChecks.get({ habitId, date });
    if (checked) {
      if (existing) return existing.id;
      return database.habitChecks.add({ habitId, date });
    }
    if (existing) await database.habitChecks.delete(existing.id);
    return null;
  });
}
