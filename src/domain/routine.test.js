import { describe, expect, it } from 'vitest';
import {
  blocksForDate,
  currentBlock,
  dailyProgress,
  routineCalendar,
  routineStreaks,
  validateHabit,
} from './routine';

const habits = [
  { id: 3, day: 'ter', time: '09:00', endTime: '10:00', name: 'Foco', kind: 'trabalho', order: 2, active: true },
  { id: 2, day: 'ter', time: '07:00', endTime: '07:30', name: 'Caminhada', kind: 'saude', order: 1, active: true },
  { id: 1, day: 'ter', time: '07:00', endTime: '08:00', name: 'Leitura', kind: 'estudo', order: 0, active: true },
  { id: 4, day: 'ter', time: '06:00', endTime: '06:30', name: 'Pausado', kind: 'pessoal', order: 0, active: false },
  { id: 5, day: 'qua', time: '08:00', endTime: '09:00', name: 'Outro dia', kind: 'pessoal', order: 0, active: true },
];

describe('blocos e progresso diario', () => {
  it('seleciona os blocos ativos do dia e ordena por horario e ordem', () => {
    expect(blocksForDate(habits, '2026-09-15').map((habit) => habit.id)).toEqual([1, 2, 3]);
  });

  it('identifica o bloco atual comum e o que atravessa meia-noite', () => {
    expect(currentBlock(habits, '2026-09-15', '2026-09-15', '09:30')?.id).toBe(3);

    const night = [{ id: 9, day: 'ter', time: '23:00', endTime: '07:00', name: 'Sono', kind: 'sono', order: 0, active: true }];
    expect(currentBlock(night, '2026-09-15', '2026-09-15', '23:30')?.id).toBe(9);
    expect(currentBlock(night, '2026-09-15', '2026-09-15', '06:30')?.id).toBe(9);
    expect(currentBlock(night, '2026-09-15', '2026-09-15', '12:00')).toBeNull();
    expect(currentBlock(night, '2026-09-14', '2026-09-15', '23:30')).toBeNull();
  });

  it('calcula marcados unicos e retorna null para futuro ou dia sem blocos', () => {
    const checks = [
      { habitId: 1, date: '2026-09-15' },
      { habitId: 1, date: '2026-09-15' },
      { habitId: 3, date: '2026-09-15' },
    ];
    expect(dailyProgress(habits, checks, '2026-09-15', '2026-09-15')).toEqual({ done: 2, total: 3, percentage: 66.66666666666666 });
    expect(dailyProgress(habits, checks, '2026-09-16', '2026-09-15')).toBeNull();
    expect(dailyProgress(habits, checks, '2026-09-14', '2026-09-15')).toBeNull();
  });

  it('monta todos os dias do mes e deixa datas futuras sem progresso', () => {
    const calendar = routineCalendar(habits, [{ habitId: 1, date: '2026-09-15' }], '2026-09', '2026-09-15');
    expect(calendar).toHaveLength(30);
    expect(calendar[14]).toMatchObject({ date: '2026-09-15', progress: { done: 1, total: 3 } });
    expect(calendar[15]).toEqual({ date: '2026-09-16', progress: null });
  });
});

describe('sequencias', () => {
  const weekly = [
    { id: 1, day: 'ter', time: '08:00', endTime: '09:00', name: 'Ter', kind: 'pessoal', order: 0, active: true },
    { id: 2, day: 'seg', time: '08:00', endTime: '09:00', name: 'Seg', kind: 'pessoal', order: 0, active: true },
    { id: 3, day: 'sab', time: '08:00', endTime: '09:00', name: 'Sab', kind: 'pessoal', order: 0, active: true },
    { id: 4, day: 'sex', time: '08:00', endTime: '09:00', name: 'Sex', kind: 'pessoal', order: 0, active: true },
    { id: 5, day: 'qui', time: '08:00', endTime: '09:00', name: 'Qui', kind: 'pessoal', order: 0, active: true },
  ];

  it('ignora hoje incompleto e dias null, respeitando o primeiro check como limite', () => {
    const checks = [
      { habitId: 5, date: '2026-09-10' },
      { habitId: 4, date: '2026-09-11' },
      { habitId: 3, date: '2026-09-12' },
      { habitId: 2, date: '2026-09-14' },
    ];
    expect(routineStreaks(weekly, checks, '2026-09-15')).toEqual({ current: 4, record: 4, firstCheckDate: '2026-09-10' });
  });

  it('encerra a sequencia em um dia abaixo de 80% e preserva o recorde', () => {
    const checks = [
      { habitId: 5, date: '2026-09-10' },
      { habitId: 4, date: '2026-09-11' },
      { habitId: 2, date: '2026-09-14' },
    ];
    expect(routineStreaks(weekly, checks, '2026-09-15')).toEqual({ current: 1, record: 2, firstCheckDate: '2026-09-10' });
  });

  it('considera 80% um dia bom', () => {
    const five = Array.from({ length: 5 }, (_, index) => ({
      id: index + 1, day: 'seg', time: `0${index + 6}:00`, endTime: `0${index + 6}:30`, name: `B${index}`, kind: 'pessoal', order: index, active: true,
    }));
    const checks = five.slice(0, 4).map((habit) => ({ habitId: habit.id, date: '2026-09-14' }));
    expect(routineStreaks(five, checks, '2026-09-15')).toMatchObject({ current: 1, record: 1 });
  });
});

describe('validateHabit', () => {
  it('exige nome, horarios diferentes, dia e tipo validos', () => {
    expect(validateHabit({ name: ' ', day: 'x', time: '25:00', endTime: '25:00', kind: 'x' })).toEqual({
      name: 'Informe um nome para o bloco.',
      day: 'Escolha um dia da semana.',
      time: 'Informe um horário válido.',
      endTime: 'Informe um horário válido e diferente do início.',
      kind: 'Escolha um tipo de bloco.',
    });
  });

  it('aceita blocos sobrepostos e horarios noturnos', () => {
    expect(validateHabit({ name: 'Sono', day: 'seg', time: '23:00', endTime: '07:00', kind: 'sono' })).toEqual({});
    expect(validateHabit({ name: 'Outro', day: 'seg', time: '23:00', endTime: '07:00', kind: 'pessoal' })).toEqual({});
  });
});
