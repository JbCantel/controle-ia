import { describe, expect, it } from 'vitest';
import { forecastGoal, goalProgress, validateContribution, validateGoal } from './goals';

const goal = { id: 1, name: 'Reserva', target: 100_000, deadline: '2028-01-01' };

describe('goalProgress', () => {
  it('soma aportes e resgates da meta ate a data informada', () => {
    const contributions = [
      { goalId: 1, value: 12_000, date: '2026-06-10' },
      { goalId: 1, value: -2_000, date: '2026-07-10' },
      { goalId: 1, value: 5_000, date: '2026-10-10' },
      { goalId: 2, value: 90_000, date: '2026-06-10' },
    ];

    expect(goalProgress(goal, contributions, '2026-09-30')).toEqual({
      accumulatedCents: 1_000_000,
      targetCents: 10_000_000,
      remainingCents: 9_000_000,
      percentage: 10,
      completed: false,
    });
  });

  it('marca como concluida sem deixar a falta negativa', () => {
    expect(goalProgress({ ...goal, target: 100 }, [{ goalId: 1, value: 120, date: '2026-09-01' }]))
      .toMatchObject({ accumulatedCents: 12_000, remainingCents: 0, percentage: 120, completed: true });
  });
});

describe('forecastGoal', () => {
  it('reproduz o caso de referencia da spec', () => {
    const result = forecastGoal(goal, [{ goalId: 1, value: 12_000, date: '2026-06-10' }], '2026-09');

    expect(result).toMatchObject({
      state: 'estimada',
      elapsedMonths: 4,
      rhythmCents: 300_000,
      remainingCents: 8_800_000,
      monthsToGoal: 30,
      arrivalMonth: '2029-03',
      monthsUntilDeadline: 16,
      neededPerMonthCents: 550_000,
      onTime: false,
    });
  });

  it('encerra a previsao quando a meta esta concluida', () => {
    expect(forecastGoal({ ...goal, target: 100 }, [{ goalId: 1, value: 100, date: '2026-09-01' }], '2026-09'))
      .toMatchObject({ state: 'concluida', message: 'concluída', remainingCents: 0 });
  });

  it('orienta registrar aportes quando ainda nao ha movimentos', () => {
    expect(forecastGoal(goal, [], '2026-09'))
      .toMatchObject({ state: 'sem-aportes', message: 'registre aportes para estimar' });
  });

  it('nao estima com ritmo zero ou negativo', () => {
    const contributions = [
      { goalId: 1, value: 100, date: '2026-08-01' },
      { goalId: 1, value: -100, date: '2026-09-01' },
    ];
    expect(forecastGoal(goal, contributions, '2026-09'))
      .toMatchObject({ state: 'sem-ritmo', message: 'sem ritmo para estimar', rhythmCents: 0 });
  });

  it.each([
    ['2026-08-01', 1],
    ['2026-09-30', 1],
  ])('usa no minimo um mes para prazo %s', (deadline, expectedMonths) => {
    const result = forecastGoal(
      { ...goal, deadline },
      [{ goalId: 1, value: 10_000, date: '2026-09-01' }],
      '2026-09',
    );
    expect(result.monthsUntilDeadline).toBe(expectedMonths);
    expect(result.neededPerMonthCents).toBe(9_000_000);
  });
});

describe('validacoes', () => {
  it('exige nome, alvo positivo e prazo valido', () => {
    expect(validateGoal({ name: ' ', cents: 0, deadline: '2026-13-40' })).toEqual({
      name: 'Informe um nome para a meta.',
      target: 'Informe um alvo maior que zero.',
      deadline: 'Informe um prazo válido.',
    });
    expect(validateGoal({ name: 'Viagem', cents: 1, deadline: '' })).toEqual({});
  });

  it('aceita resgate igual ao acumulado e bloqueia valor maior', () => {
    const input = { cents: 50_000, date: '2026-09-14' };
    expect(validateContribution(input, 50_000, 'resgate')).toEqual({});
    expect(validateContribution({ ...input, cents: 50_001 }, 50_000, 'resgate')).toEqual({
      value: 'O resgate não pode passar do valor acumulado.',
    });
  });

  it('exige valor positivo, data valida e modo conhecido', () => {
    expect(validateContribution({ cents: 0, date: '' }, 0, 'outro')).toEqual({
      value: 'Informe um valor maior que zero.',
      date: 'Informe a data.',
      mode: 'Escolha aporte ou resgate.',
    });
  });
});
