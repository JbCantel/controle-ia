import Dexie from 'dexie';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createDb } from './db';
import { addHabit, deleteHabit, setHabitChecked, updateHabit } from './routine';

let database;

beforeEach(async () => {
  database = createDb(`rotina-${crypto.randomUUID()}`);
  await database.open();
});

afterEach(async () => {
  database.close();
  await Dexie.delete(database.name);
});

const walking = {
  day: 'seg', time: '07:00', endTime: '07:30', name: 'Caminhada',
  kind: 'saude', order: 0, active: true,
};

describe('routine db', () => {
  it('cria e edita blocos, permitindo sobreposicao no mesmo dia', async () => {
    const firstId = await addHabit(walking, { database });
    const secondId = await addHabit({ ...walking, name: 'Leitura', endTime: '08:00', order: 1 }, { database });

    expect(await database.habits.count()).toBe(2);
    await updateHabit(secondId, { ...walking, name: 'Estudo', endTime: '08:30', order: 1 }, { database });
    expect(await database.habits.get(secondId)).toMatchObject({ name: 'Estudo', time: '07:00', endTime: '08:30' });
    expect(await database.habits.get(firstId)).toMatchObject({ name: 'Caminhada' });
  });

  it('revalida os dados antes de gravar', async () => {
    await expect(addHabit({ ...walking, name: '', time: '25:00' }, { database }))
      .rejects.toMatchObject({ code: 'HABIT_INVALID', details: { name: 'Informe um nome para o bloco.' } });
    expect(await database.habits.count()).toBe(0);
  });

  it('marca e desmarca de forma idempotente pelo par habitId e date', async () => {
    const habitId = await addHabit(walking, { database });

    await setHabitChecked(habitId, '2026-09-14', true, { database, today: '2026-09-15' });
    await setHabitChecked(habitId, '2026-09-14', true, { database, today: '2026-09-15' });
    expect(await database.habitChecks.count()).toBe(1);

    await setHabitChecked(habitId, '2026-09-14', false, { database, today: '2026-09-15' });
    await setHabitChecked(habitId, '2026-09-14', false, { database, today: '2026-09-15' });
    expect(await database.habitChecks.count()).toBe(0);
  });

  it('bloqueia marcacao em data futura sem alterar dados', async () => {
    const habitId = await addHabit(walking, { database });
    await expect(setHabitChecked(habitId, '2026-09-16', true, { database, today: '2026-09-15' }))
      .rejects.toMatchObject({ code: 'ROUTINE_FUTURE' });
    expect(await database.habitChecks.count()).toBe(0);
  });

  it('rejeita marcacao de bloco inexistente', async () => {
    await expect(setHabitChecked(999, '2026-09-14', true, { database, today: '2026-09-15' }))
      .rejects.toMatchObject({ code: 'HABIT_NOT_FOUND' });
  });

  it('exclui o bloco e todas as marcacoes dele na mesma operacao', async () => {
    const habitId = await addHabit(walking, { database });
    await database.habitChecks.bulkAdd([
      { habitId, date: '2026-09-08' },
      { habitId, date: '2026-09-15' },
    ]);

    await deleteHabit(habitId, { database });

    expect(await database.habits.get(habitId)).toBeUndefined();
    expect(await database.habitChecks.where('habitId').equals(habitId).count()).toBe(0);
  });
});
