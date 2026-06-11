// Datas como string ISO 'yyyy-mm-dd'. SEMPRE construir Date com (ano, mês-1, dia)
// para usar fuso local e evitar o bug clássico de new Date('yyyy-mm-dd') cair em UTC.

function toISO(d) {
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getDate()).padStart(2, '0'),
  ].join('-');
}

export function todayISO() {
  return toISO(new Date());
}

export function formatDateBR(iso) {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

export function monthKey(iso) {
  return iso.slice(0, 7);
}

export function currentMonthKey() {
  return todayISO().slice(0, 7);
}

export function addMonths(key, delta) {
  const [y, m] = key.split('-').map(Number);
  const total = y * 12 + (m - 1) + delta;
  return `${Math.floor(total / 12)}-${String((total % 12) + 1).padStart(2, '0')}`;
}

export function addDays(iso, delta) {
  const [y, m, d] = iso.split('-').map(Number);
  return toISO(new Date(y, m - 1, d + delta));
}

export function weekdayOf(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).getDay();
}

export function lastNMonths(n) {
  const cur = currentMonthKey();
  return Array.from({ length: n }, (_, i) => addMonths(cur, i - (n - 1)));
}

export function monthLabel(key) {
  const [y, m] = key.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
}

export function monthShort(key) {
  const [y, m] = key.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString('pt-BR', { month: 'short' });
}

export function daysInMonth(key) {
  const [y, m] = key.split('-').map(Number);
  return new Date(y, m, 0).getDate();
}
