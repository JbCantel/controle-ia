import { describe, it, expect } from 'vitest';
import { formatDateBR, monthKey, addMonths, addDays, weekdayOf, lastNMonths, monthLabel, monthShort, daysInMonth, currentMonthKey, monthsEndingAt, monthRange, weekdayKey, formatDayHeader, formatLongDate } from './dates';

describe('dates', () => {
  it('formata ISO em dd/mm/aaaa', () => {
    expect(formatDateBR('2026-06-10')).toBe('10/06/2026');
  });
  it('extrai chave do mês', () => {
    expect(monthKey('2026-06-10')).toBe('2026-06');
  });
  it('soma meses com virada de ano', () => {
    expect(addMonths('2026-01', -1)).toBe('2025-12');
    expect(addMonths('2026-12', 1)).toBe('2027-01');
    expect(addMonths('2026-06', 0)).toBe('2026-06');
  });
  it('soma dias com virada de mês', () => {
    expect(addDays('2026-06-01', -1)).toBe('2026-05-31');
    expect(addDays('2026-06-30', 1)).toBe('2026-07-01');
  });
  it('dia da semana (2026-06-01 é segunda)', () => {
    expect(weekdayOf('2026-06-01')).toBe(1);
    expect(weekdayOf('2026-06-07')).toBe(0); // domingo
  });
  it('lastNMonths termina no mês atual', () => {
    const months = lastNMonths(6);
    expect(months).toHaveLength(6);
    expect(months[5]).toMatch(/^\d{4}-\d{2}$/);
    expect(months[5]).toBe(currentMonthKey());
    expect(months[0]).toBe(addMonths(currentMonthKey(), -5));
  });
  it('abreviacao do mes em pt-BR', () => {
    expect(monthShort('2026-06')).toBe('jun.');
  });
  it('rótulo do mês em pt-BR', () => {
    expect(monthLabel('2026-06')).toBe('junho de 2026');
  });
  it('dias no mês', () => {
    expect(daysInMonth('2026-02')).toBe(28);
    expect(daysInMonth('2026-06')).toBe(30);
  });
  it('meses terminando num mês dado', () => {
    expect(monthsEndingAt('2026-02', 3)).toEqual(['2025-12', '2026-01', '2026-02']);
  });
  it('intervalo de datas do mês', () => {
    expect(monthRange('2026-02')).toEqual({ start: '2026-02-01', end: '2026-02-28' });
  });
  it('chave do dia da semana', () => {
    expect(weekdayKey('2026-09-14')).toBe('seg');
    expect(weekdayKey('2026-09-19')).toBe('sab');
    expect(weekdayKey('2026-09-20')).toBe('dom');
  });
  it('cabeçalho de dia e data longa', () => {
    expect(formatDayHeader('2026-09-14')).toBe('seg, 14 de set.');
    expect(formatLongDate('2026-09-14')).toBe('14 de set. de 2026');
  });
});
