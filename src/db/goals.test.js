import Dexie from 'dexie';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createDb } from './db';
import { addContribution, addGoal, deleteContribution, deleteGoal, updateGoal } from './goals';
import { goalProgress } from '../domain/goals';

let database;

beforeEach(async () => {
  database = createDb(`metas-${crypto.randomUUID()}`);
  await database.open();
});

afterEach(async () => {
  database.close();
  await Dexie.delete(database.name);
});

describe('goals db', () => {
  it('cria e edita uma meta revalidando os dados', async () => {
    const id = await addGoal({ name: ' Viagem ', target: 8_000, deadline: '2027-12-01' }, { database });
    expect(await database.goals.get(id)).toEqual({ id, name: 'Viagem', target: 8_000, deadline: '2027-12-01' });

    await updateGoal(id, { name: 'Notebook', target: 9_500, deadline: '' }, { database });
    expect(await database.goals.get(id)).toEqual({ id, name: 'Notebook', target: 9_500 });

    await expect(addGoal({ name: '', target: 0 }, { database }))
      .rejects.toMatchObject({ code: 'GOAL_INVALID' });
  });

  it('grava aporte positivo e resgate negativo, permitindo zerar o acumulado', async () => {
    const goalId = await addGoal({ name: 'Reserva', target: 1_000 }, { database });
    await addContribution({ goalId, value: 300, date: '2026-09-01', mode: 'aporte' }, { database });
    await addContribution({ goalId, value: 300, date: '2026-09-02', mode: 'resgate' }, { database });

    expect((await database.contributions.where('goalId').equals(goalId).sortBy('date')).map((row) => row.value))
      .toEqual([300, -300]);
  });

  it('revalida o saldo dentro da transacao e bloqueia resgates concorrentes', async () => {
    const goalId = await addGoal({ name: 'Reserva', target: 1_000 }, { database });
    await addContribution({ goalId, value: 100, date: '2026-09-01', mode: 'aporte' }, { database });

    const results = await Promise.allSettled([
      addContribution({ goalId, value: 80, date: '2026-09-02', mode: 'resgate' }, { database }),
      addContribution({ goalId, value: 80, date: '2026-09-03', mode: 'resgate' }, { database }),
    ]);

    expect(results.filter((result) => result.status === 'fulfilled')).toHaveLength(1);
    expect(results.filter((result) => result.status === 'rejected')).toHaveLength(1);
    expect(results.find((result) => result.status === 'rejected').reason)
      .toMatchObject({ code: 'CONTRIBUTION_INVALID', details: { value: 'O resgate não pode passar do valor acumulado.' } });
    expect(goalProgress(
      await database.goals.get(goalId),
      await database.contributions.where('goalId').equals(goalId).toArray(),
    ).accumulatedCents).toBe(2_000);
  });

  it('excluir um aporte atualiza o progresso derivado de concluida para ativa', async () => {
    const goalId = await addGoal({ name: 'Curso', target: 500 }, { database });
    const firstId = await addContribution({ goalId, value: 400, date: '2026-09-01', mode: 'aporte' }, { database });
    await addContribution({ goalId, value: 100, date: '2026-09-02', mode: 'aporte' }, { database });
    const goal = await database.goals.get(goalId);

    expect(goalProgress(goal, await database.contributions.toArray()).completed).toBe(true);
    await deleteContribution(firstId, { database });
    expect(goalProgress(goal, await database.contributions.toArray()).completed).toBe(false);
  });

  it('exclui a meta e seus movimentos na mesma operacao', async () => {
    const goalId = await addGoal({ name: 'Curso', target: 500 }, { database });
    await addContribution({ goalId, value: 100, date: '2026-09-01', mode: 'aporte' }, { database });
    await addContribution({ goalId, value: 20, date: '2026-09-02', mode: 'resgate' }, { database });

    await deleteGoal(goalId, { database });

    expect(await database.goals.get(goalId)).toBeUndefined();
    expect(await database.contributions.where('goalId').equals(goalId).count()).toBe(0);
  });

  it('rejeita meta ausente, valor e data invalidos sem gravar', async () => {
    await expect(addContribution({ goalId: 999, value: 10, date: '2026-09-01', mode: 'aporte' }, { database }))
      .rejects.toMatchObject({ code: 'CONTRIBUTION_INVALID' });
    expect(await database.contributions.count()).toBe(0);
  });
});
