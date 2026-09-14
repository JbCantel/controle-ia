import { TABLES } from './tables';

export const BACKUP_FORMAT = 1;
const OPTIONAL_TABLES = ['habitChecks', 'recurrences'];

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const MONTH = /^\d{4}-\d{2}$/;
const TIME = /^\d{2}:\d{2}$/;
const TYPES = ['receita', 'despesa'];
const DAYS = ['seg', 'ter', 'qua', 'qui', 'sex', 'sab', 'dom'];
const KINDS = ['pessoal', 'trabalho', 'pausa', 'saude', 'estudo', 'sono'];

const isId = (v) => Number.isInteger(v) && v > 0;
const isNum = (v) => typeof v === 'number' && Number.isFinite(v);
const isStr = (v) => typeof v === 'string';
const isBool = (v) => typeof v === 'boolean';
const matches = (re) => (v) => isStr(v) && re.test(v);
const oneOf = (list) => (v) => list.includes(v);
const optional = (test) => (v) => v === undefined || v === null || test(v);

function rowValidator(rules) {
  return (row) => {
    if (!row || typeof row !== 'object') return 'registro inválido';
    if (!isId(row.id)) return 'campo "id" inválido';
    for (const [field, test] of Object.entries(rules)) {
      if (!test(row[field])) return `campo "${field}" inválido`;
    }
    return null;
  };
}

const VALIDATORS = {
  transactions: rowValidator({ type: oneOf(TYPES), value: isNum, date: matches(DATE), categoryId: isId, description: isStr, recurrenceId: optional(isId) }),
  categories: rowValidator({ name: isStr, type: oneOf(TYPES), color: isStr }),
  budgets: rowValidator({ month: matches(MONTH), categoryId: isId, limit: (v) => v === null || isNum(v), onlyThisMonth: optional(isBool) }),
  goals: rowValidator({ name: isStr, target: isNum, deadline: optional(matches(DATE)) }),
  contributions: rowValidator({ goalId: isId, value: isNum, date: matches(DATE) }),
  habits: rowValidator({ day: oneOf(DAYS), time: matches(TIME), endTime: matches(TIME), name: isStr, kind: oneOf(KINDS), order: isNum, active: isBool }),
  habitChecks: rowValidator({ habitId: isId, date: matches(DATE) }),
  recurrences: rowValidator({ type: oneOf(TYPES), value: isNum, categoryId: isId, description: isStr, dayOfMonth: (v) => Number.isInteger(v) && v >= 1 && v <= 31, startMonth: matches(MONTH), lastGeneratedMonth: matches(MONTH), active: isBool }),
};

export function buildBackup(tables, now = new Date()) {
  return { app: 'ORBE', format: BACKUP_FORMAT, exportedAt: now.toISOString(), dbVersion: 3, tables };
}

export function backupFileName(isoDate) {
  return `orbe-backup-${isoDate}.json`;
}

const fail = (error) => ({ ok: false, error });

export function parseBackup(raw) {
  let data = raw;
  if (typeof raw === 'string') {
    try { data = JSON.parse(raw); } catch { return fail('O arquivo não é um JSON válido.'); }
  }
  if (!data || typeof data !== 'object' || data.app !== 'ORBE') return fail('Este arquivo não é um backup do ORBE.');

  let source;
  if (data.tables && typeof data.tables === 'object') {
    source = data.tables;
  } else if (data.tabelas && typeof data.tabelas === 'object') {
    // Formato do JSON recuperado do navegador em 14/09/2026.
    source = Object.fromEntries(Object.entries(data.tabelas).map(([name, t]) => [name, t?.linhas]));
  } else {
    return fail('Backup sem tabelas.');
  }

  const tables = {};
  for (const name of TABLES) {
    const rows = source[name];
    if (rows === undefined && OPTIONAL_TABLES.includes(name)) { tables[name] = []; continue; }
    if (!Array.isArray(rows)) return fail(`Tabela "${name}" ausente ou inválida.`);
    for (let i = 0; i < rows.length; i++) {
      const problem = VALIDATORS[name](rows[i]);
      if (problem) return fail(`Tabela "${name}", linha ${i + 1}: ${problem}.`);
    }
    tables[name] = rows;
  }
  return { ok: true, tables };
}

const LABELS = [
  ['transactions', 'transações'], ['categories', 'categorias'], ['budgets', 'orçamentos'],
  ['goals', 'metas'], ['contributions', 'aportes'], ['habits', 'blocos de rotina'],
];

export function summarizeTables(tables) {
  return LABELS.map(([name, label]) => `${tables[name].length} ${label}`).join(', ');
}
