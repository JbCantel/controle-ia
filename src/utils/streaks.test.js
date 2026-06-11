import { describe, it, expect } from 'vitest';
import { isExpectedOn, currentStreak, bestStreak } from './streaks';

const daily = { frequency: 'daily', createdAt: '2026-06-01' };
const mwf = { frequency: [1, 3, 5], createdAt: '2026-06-01' }; // seg/qua/sex
const TODAY = '2026-06-10'; // quarta

describe('isExpectedOn', () => {
  it('diário: todo dia a partir da criação', () => {
    expect(isExpectedOn(daily, '2026-06-05')).toBe(true);
    expect(isExpectedOn(daily, '2026-05-31')).toBe(false); // antes de criar
  });
  it('dias da semana: só nos dias configurados', () => {
    expect(isExpectedOn(mwf, '2026-06-01')).toBe(true);  // segunda
    expect(isExpectedOn(mwf, '2026-06-02')).toBe(false); // terça
  });
});

describe('currentStreak', () => {
  it('conta dias consecutivos feitos', () => {
    const logs = new Set(['2026-06-08', '2026-06-09']);
    expect(currentStreak(daily, logs, TODAY)).toBe(2);
  });
  it('hoje não marcado NÃO quebra o streak', () => {
    const logs = new Set(['2026-06-08', '2026-06-09']); // hoje (10) sem log
    expect(currentStreak(daily, logs, TODAY)).toBe(2);
  });
  it('hoje marcado conta no streak', () => {
    const logs = new Set(['2026-06-09', '2026-06-10']);
    expect(currentStreak(daily, logs, TODAY)).toBe(2);
  });
  it('dia esperado perdido quebra o streak', () => {
    const logs = new Set(['2026-06-07', '2026-06-09']); // faltou dia 08
    expect(currentStreak(daily, logs, TODAY)).toBe(1);
  });
  it('frequência seg/qua/sex ignora dias não esperados', () => {
    // fez seg(1), qua(3), sex(5), seg(8); hoje qua(10) ainda não fez
    const logs = new Set(['2026-06-01', '2026-06-03', '2026-06-05', '2026-06-08']);
    expect(currentStreak(mwf, logs, TODAY)).toBe(4);
  });
  it('sem logs = 0', () => {
    expect(currentStreak(daily, new Set(), TODAY)).toBe(0);
  });
});

describe('bestStreak', () => {
  it('encontra a maior sequência histórica', () => {
    // 1-2-3 (3 dias), falha no 4, depois 8-9
    const logs = new Set(['2026-06-01', '2026-06-02', '2026-06-03', '2026-06-08', '2026-06-09']);
    expect(bestStreak(daily, logs, TODAY)).toBe(3);
  });
  it('hoje não marcado não zera a sequência em andamento', () => {
    const logs = new Set(['2026-06-08', '2026-06-09']);
    expect(bestStreak(daily, logs, TODAY)).toBe(2);
  });
});
