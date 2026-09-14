# ORBE — Plano A: fundação + Transações (etapas 1–2)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Substituir a v1 pelo esqueleto do ORBE (tokens, moldura, banco `OrbeFinanceiro` v3, backup) e entregar a tela Transações completa com recorrências, terminando no checkpoint 1 com o app aberto no Chrome real.

**Architecture:** Regras em `src/domain/` (funções puras, testadas com Vitest). Acesso ao banco em `src/db/` (Dexie; toda função recebe `{ database, today }` opcionais para teste com fake-indexeddb). UI em `src/components/` e `src/pages/`, lendo o banco com `useLiveQuery`.

**Tech Stack:** React 19.2 · Vite 8 · Tailwind 4.3 · Dexie 4.4 + dexie-react-hooks · React Router 7 · lucide-react · @fontsource/instrument-serif · @fontsource-variable/inter · Vitest 4 + fake-indexeddb 6.

**Spec:** `docs/superpowers/specs/2026-09-14-orbe-design.md`

**Planos seguintes:** Plano B (etapas 3–6: Categorias, Orçamento, Metas, Hábitos) e Plano C (etapas 7–8: Painel, otimização, E2E), escritos depois de cada checkpoint.

## Global Constraints

- Nome do banco: `OrbeFinanceiro`. Declaração da versão 2 idêntica ao banco recuperado e nunca removida.
- Porta 5174 com `strictPort: true` em `server` e `preview`.
- Valores gravados em reais com 2 casas; somas sempre em centavos inteiros.
- Datas `'YYYY-MM-DD'`, meses `'YYYY-MM'`, construídas em fuso local.
- Nenhuma cor literal fora do `@theme` de `src/index.css`, exceto cores de categoria (dados) e o fundo de primeira pintura em `index.html`/favicon.
- Rótulo em caixa alta com espaçamento largo (`eyebrow`) só na etiqueta do cabeçalho e no cartão de armazenamento.
- Sem sombras. Raio 16px nos cartões (`rounded-card`), 14px nos indicadores (`rounded-kpi`).
- Instrument Serif só em títulos, nunca em números; `tabular-nums` em todo valor, hora e percentual.
- Interface 100% em português do Brasil.
- Nenhum dado pessoal real no repositório (fixtures fictícias). `.gitignore` inclui `orbe-*.json`.
- Não escrever escapes `\uXXXX` em código-fonte (chegam como caractere literal pelo transporte); usar `String.fromCharCode` ou classes como `\s`.
- Commits em português, terminando com `Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>`. Push para `origin/orbe` ao fim da etapa 1 (Task 6) e da etapa 2 (Task 8).

## Mapa de arquivos

| Arquivo | Responsabilidade |
|---|---|
| `vite.config.js` | porta 5174, setup de teste |
| `index.html`, `public/favicon.svg` | shell HTML escuro, título, ícone |
| `src/test/setup.js` | carrega fake-indexeddb |
| `src/domain/money.js` | centavos, formatação R$, máscara |
| `src/domain/dates.js` | datas locais, meses, rótulos pt-BR |
| `src/domain/tables.js` | lista canônica das 8 tabelas |
| `src/domain/categories.js` | paleta e categorias padrão |
| `src/domain/backup.js` | montar e validar backup (2 formatos) |
| `src/domain/recurrence.js` | ocorrências devidas, marcador de retomada |
| `src/domain/transactions.js` | filtro, busca, totais, agrupamento, validação |
| `src/db/db.js` | schema Dexie v2 + v3 |
| `src/db/backupIO.js` | ler/substituir/limpar tabelas, exportar arquivo |
| `src/db/recurrences.js` | gerar, pausar, retomar, editar, excluir regras |
| `src/db/transactions.js` | criar (com ou sem recorrência), editar, excluir |
| `src/index.css` | tokens `@theme`, base, utilitário `eyebrow` |
| `src/components/ui/*` | Card, CardTitle, Button, IconButton, Modal, ConfirmDialog, Field, MoneyInput, Badge, EmptyState, Segmented |
| `src/components/layout/*` | nav, Brand, Sidebar, BottomNav, MobileTopBar, PageHeader, DatePill, MonthSwitcher, StorageCard, DataModal |
| `src/hooks/useMonthParam.js` | mês selecionado via `?mes=` |
| `src/App.jsx`, `src/main.jsx` | rotas lazy, execução de recorrências |
| `src/pages/Painel.jsx` | boas-vindas (Painel completo no Plano C) |
| `src/pages/EmBreve.jsx` | telas das etapas 3–6 |
| `src/pages/transacoes/*` | Transacoes, TransactionForm, TransactionList, RecurrenceList, RecurrenceForm |

---

### Task 1: Setup, limpeza da v1 e domínio base (money, dates)

**Files:**
- Modify: `vite.config.js`, `index.html`, `.gitignore`, `package.json` (via npm)
- Create: `src/test/setup.js`, `public/favicon.svg`
- Move+modify: `src/utils/money.js` → `src/domain/money.js`, `src/utils/dates.js` → `src/domain/dates.js` (e testes)
- Delete: `src/pages/*`, `src/components/*`, `src/hooks/useTheme.js`, `src/db/seed.js`, `src/db/db.js`, `src/utils/streaks*`, `src/utils/summary*`
- Replace: `src/App.jsx` (placeholder mínimo até a Task 6), `src/index.css` (só `@import "tailwindcss";` até a Task 5)

**Interfaces:**
- Produces (`domain/money.js`): `formatBRL(cents)`, `parseBRL(input)`, `centsToBRLInput(cents)`, `toCents(reais)`, `fromCents(cents)`, `sumCents(values)`, `formatReais(reais)`, `formatSigned(reais, type)`, `formatMoneyInput(cents)`
- Produces (`domain/dates.js`): `todayISO()`, `formatDateBR(iso)`, `monthKey(iso)`, `currentMonthKey()`, `addMonths(key, n)`, `addDays(iso, n)`, `weekdayOf(iso)`, `lastNMonths(n)`, `monthsEndingAt(key, n)`, `monthLabel(key)`, `monthShort(key)`, `daysInMonth(key)`, `monthRange(key) → {start, end}`, `WEEKDAY_KEYS`, `weekdayKey(iso)`, `formatDayHeader(iso)`, `formatLongDate(iso)`

- [ ] **Step 1: Instalar dependências e remover a v1**

```powershell
npm install lucide-react @fontsource/instrument-serif @fontsource-variable/inter
npm install -D fake-indexeddb
git mv src/utils/money.js src/domain/money.js
git mv src/utils/money.test.js src/domain/money.test.js
git mv src/utils/dates.js src/domain/dates.js
git mv src/utils/dates.test.js src/domain/dates.test.js
git rm -q -r src/pages src/components src/hooks src/db src/utils
```

- [ ] **Step 2: Config, HTML e placeholders**

`vite.config.js`:
```js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Porta travada: os dados do IndexedDB ficam presos a http://localhost:5174.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: { port: 5174, strictPort: true },
  preview: { port: 5174, strictPort: true },
  test: { setupFiles: ['./src/test/setup.js'] },
});
```

`src/test/setup.js`:
```js
import 'fake-indexeddb/auto';
```

`index.html`:
```html
<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#080B0A" />
    <title>ORBE — Finanças pessoais</title>
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <!-- Fundo da primeira pintura, antes do CSS carregar (evita flash branco) -->
    <style>html { background: #080B0A; color-scheme: dark; }</style>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

`public/favicon.svg`:
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><circle cx="16" cy="16" r="15" fill="#12241C"/><circle cx="16" cy="16" r="8" fill="none" stroke="#45C98A" stroke-width="3"/></svg>
```

`.gitignore` — acrescentar a linha:
```
orbe-*.json
```

`src/index.css`:
```css
@import "tailwindcss";
```

`src/App.jsx`:
```jsx
export default function App() {
  return <p>ORBE</p>;
}
```

- [ ] **Step 3: Escrever os testes novos de money (falhando)**

Acrescentar ao fim de `src/domain/money.test.js` (e trocar o import da linha 2 por `import { formatBRL, parseBRL, centsToBRLInput, toCents, fromCents, sumCents, formatReais, formatSigned, formatMoneyInput } from './money';`):
```js
describe('reais <-> centavos', () => {
  it('converte reais para centavos sem erro de ponto flutuante', () => {
    expect(toCents(386.42)).toBe(38642);
    expect(toCents(0.1 + 0.2)).toBe(30);
    expect(fromCents(38642)).toBe(386.42);
  });
  it('soma valores em reais via centavos', () => {
    expect(sumCents([0.1, 0.2])).toBe(30);
    expect(sumCents([])).toBe(0);
  });
  it('formata reais', () => {
    expect(formatReais(2106.32)).toBe('R$ 2.106,32');
  });
  it('formata com sinal por tipo', () => {
    expect(formatSigned(850, 'receita')).toBe('+ R$ 850,00');
    expect(formatSigned(89.9, 'despesa')).toBe('- R$ 89,90');
  });
  it('formata o texto da máscara de valor', () => {
    expect(formatMoneyInput(123456)).toBe('1.234,56');
    expect(formatMoneyInput(5)).toBe('0,05');
  });
});
```

- [ ] **Step 4: Escrever os testes novos de dates (falhando)**

Trocar o import de `src/domain/dates.test.js` para incluir `monthsEndingAt, monthRange, weekdayKey, formatDayHeader, formatLongDate` e acrescentar dentro do `describe`:
```js
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
```

- [ ] **Step 5: Rodar e ver falhar**

Run: `npx vitest run src/domain`
Expected: FAIL (`toCents is not a function`, `monthsEndingAt is not a function`…)

- [ ] **Step 6: Implementar money.js**

`src/domain/money.js` (arquivo inteiro):
```js
// Valores são gravados em reais (2 casas); toda conta é feita em centavos inteiros.

const MINUS_SIGN = String.fromCharCode(0x2212);

export function formatBRL(cents) {
  const str = (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  // Intl usa espaços não quebráveis e, em ICU antigo, o sinal de menos matemático.
  return str.replace(/\s/g, ' ').split(MINUS_SIGN).join('-');
}

export function centsToBRLInput(cents) {
  return (cents / 100).toFixed(2).replace('.', ',');
}

export function parseBRL(input) {
  if (typeof input !== 'string') return NaN;
  const stripped = input.replace(/[R$\s]/g, '');
  // Rejeita decimal americano ('10.50'): ponto seguido de 1-2 dígitos sem vírgula.
  if (/\.\d{1,2}$/.test(stripped) && !stripped.includes(',')) return NaN;
  const clean = stripped.replace(/\./g, '').replace(',', '.');
  if (clean === '' || isNaN(Number(clean))) return NaN;
  return Math.round(Number(clean) * 100);
}

export function toCents(reais) {
  return Math.round(reais * 100);
}

export function fromCents(cents) {
  return cents / 100;
}

export function sumCents(values) {
  return values.reduce((total, v) => total + toCents(v), 0);
}

export function formatReais(reais) {
  return formatBRL(toCents(reais));
}

export function formatSigned(reais, type) {
  return `${type === 'receita' ? '+' : '-'} ${formatBRL(Math.abs(toCents(reais)))}`;
}

// Texto da máscara estilo caixa eletrônico: 123456 -> '1.234,56'
export function formatMoneyInput(cents) {
  return formatBRL(cents).replace('R$ ', '');
}
```

- [ ] **Step 7: Implementar os acréscimos em dates.js**

Substituir o comentário do topo por:
```js
// Datas como string ISO 'yyyy-mm-dd'. SEMPRE construir Date com (ano, mês-1, dia)
// para usar fuso local e evitar o bug de new Date('yyyy-mm-dd') cair em UTC.
```
e acrescentar ao fim de `src/domain/dates.js`:
```js
export function monthsEndingAt(key, n) {
  return Array.from({ length: n }, (_, i) => addMonths(key, i - (n - 1)));
}

export function monthRange(key) {
  return { start: `${key}-01`, end: `${key}-${String(daysInMonth(key)).padStart(2, '0')}` };
}

// Índice = Date.getDay() (0 = domingo). Chaves iguais às do banco.
export const WEEKDAY_KEYS = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab'];
const WEEKDAY_SHORT = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];

export function weekdayKey(iso) {
  return WEEKDAY_KEYS[weekdayOf(iso)];
}

export function formatDayHeader(iso) {
  return `${WEEKDAY_SHORT[weekdayOf(iso)]}, ${Number(iso.slice(8, 10))} de ${monthShort(iso.slice(0, 7))}`;
}

export function formatLongDate(iso) {
  return `${Number(iso.slice(8, 10))} de ${monthShort(iso.slice(0, 7))} de ${iso.slice(0, 4)}`;
}
```
E trocar `lastNMonths` para reutilizar: `return monthsEndingAt(currentMonthKey(), n);`

- [ ] **Step 8: Rodar testes e build**

Run: `npx vitest run` → Expected: PASS (2 arquivos)
Run: `npx vite build` → Expected: build sem erros

- [ ] **Step 9: Commit**

```powershell
git add -A
git commit -m "chore: remove interface da v1, trava porta 5174 e amplia dominio de dinheiro e datas"
```

---

### Task 2: Banco `OrbeFinanceiro` v3 + teste de migração

**Files:**
- Create: `src/domain/tables.js`, `src/db/db.js`, `src/db/db.test.js`

**Interfaces:**
- Produces: `TABLES` (domain/tables.js); `DB_NAME`, `SCHEMA_V2`, `SCHEMA_V3`, `ALL_TABLES`, `createDb(name?) → Dexie`, `db` (db/db.js)

- [ ] **Step 1: Escrever o teste de migração (falhando)**

`src/db/db.test.js`:
```js
import Dexie from 'dexie';
import { describe, it, expect } from 'vitest';
import { createDb, SCHEMA_V2, ALL_TABLES } from './db';

// Dados fictícios no mesmo formato do banco real recuperado.
const FIXTURE = {
  transactions: [
    { type: 'receita', value: 4100, date: '2026-05-05', categoryId: 6, description: 'Pagamento', id: 1 },
    { type: 'despesa', value: 212.37, date: '2026-05-08', categoryId: 2, description: 'Feira', id: 2 },
  ],
  categories: [
    { name: 'Alimentação', type: 'despesa', color: '#f5a65b', id: 2 },
    { name: 'Salário', type: 'receita', color: '#65d39b', id: 6 },
  ],
  budgets: [{ month: '2026-05', categoryId: 2, limit: 900, id: 1 }],
  goals: [{ name: 'Viagem', target: 8000, deadline: '2027-12-01', id: 1 }],
  contributions: [{ goalId: 1, value: 500, date: '2026-05-10', id: 1 }],
  habits: [
    { day: 'seg', time: '07:00', endTime: '07:30', name: 'Caminhada', kind: 'saude', order: 0, active: true, id: 1 },
    { day: 'seg', time: '23:00', endTime: '07:00', name: 'Sono', kind: 'sono', order: 1, active: true, id: 2 },
  ],
  habitChecks: [{ habitId: 1, date: '2026-05-04', id: 1 }],
};

async function createV2Database(name) {
  const old = new Dexie(name);
  old.version(2).stores(SCHEMA_V2);
  await old.open();
  for (const [table, rows] of Object.entries(FIXTURE)) await old.table(table).bulkAdd(rows);
  old.close();
}

describe('migração OrbeFinanceiro v2 -> v3', () => {
  it('preserva todas as linhas e acrescenta recurrences e o índice recurrenceId', async () => {
    const name = `migracao-${crypto.randomUUID()}`;
    await createV2Database(name);

    const db = createDb(name);
    await db.open();

    expect(db.verno).toBe(3);
    for (const [table, rows] of Object.entries(FIXTURE)) {
      expect(await db.table(table).toArray()).toEqual(rows);
    }
    const native = db.backendDB();
    expect(Array.from(native.objectStoreNames).sort()).toEqual([...ALL_TABLES].sort());
    const indexNames = Array.from(native.transaction('transactions').objectStore('transactions').indexNames);
    expect(indexNames).toContain('recurrenceId');

    await db.transactions.add({ type: 'despesa', value: 50, date: '2026-06-01', categoryId: 2, description: 'Streaming', recurrenceId: 9 });
    expect(await db.transactions.where('recurrenceId').equals(9).count()).toBe(1);
    db.close();
    await Dexie.delete(name);
  });

  it('cria banco novo direto na v3', async () => {
    const name = `novo-${crypto.randomUUID()}`;
    const db = createDb(name);
    await db.open();
    expect(db.tables.map((t) => t.name).sort()).toEqual([...ALL_TABLES].sort());
    db.close();
    await Dexie.delete(name);
  });
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npx vitest run src/db/db.test.js`
Expected: FAIL (`Failed to resolve import "./db"`)

- [ ] **Step 3: Implementar**

`src/domain/tables.js`:
```js
// Lista canônica das tabelas do banco OrbeFinanceiro (usada por banco e backup).
export const TABLES = [
  'transactions', 'categories', 'budgets', 'goals',
  'contributions', 'habits', 'habitChecks', 'recurrences',
];
```

`src/db/db.js`:
```js
import Dexie from 'dexie';
import { TABLES } from '../domain/tables';

export const DB_NAME = 'OrbeFinanceiro';

// Versão 2: idêntica ao banco recuperado do navegador. NUNCA remover nem alterar.
export const SCHEMA_V2 = {
  transactions: '++id, categoryId, date, type',
  categories: '++id, name, type',
  budgets: '++id, &[month+categoryId], categoryId, month',
  goals: '++id, name',
  contributions: '++id, date, goalId',
  habits: '++id, active, day, time',
  habitChecks: '++id, &[habitId+date], date, habitId',
};

// Versão 3: só acréscimos (recorrências). Sem upgrade: nenhum registro é reescrito.
export const SCHEMA_V3 = {
  transactions: '++id, categoryId, date, type, recurrenceId',
  recurrences: '++id',
};

export const ALL_TABLES = TABLES;

export function createDb(name = DB_NAME) {
  const database = new Dexie(name);
  database.version(2).stores(SCHEMA_V2);
  database.version(3).stores(SCHEMA_V3);
  return database;
}

export const db = createDb();
```

- [ ] **Step 4: Rodar e ver passar**

Run: `npx vitest run src/db/db.test.js`
Expected: PASS (2 testes)

- [ ] **Step 5: Commit**

```powershell
git add src/domain/tables.js src/db
git commit -m "feat: schema OrbeFinanceiro v3 com teste de migracao a partir da v2"
```

---

### Task 3: Backup (validação em 2 formatos + leitura/substituição atômica)

**Files:**
- Create: `src/domain/categories.js`, `src/domain/backup.js`, `src/domain/backup.test.js`, `src/db/backupIO.js`, `src/db/backupIO.test.js`

**Interfaces:**
- Consumes: `TABLES`, `createDb`, `ALL_TABLES`, `db`, `todayISO`
- Produces (`domain/categories.js`): `CATEGORY_PALETTE: string[]`, `DEFAULT_CATEGORIES: {name,type,color}[]`
- Produces (`domain/backup.js`): `buildBackup(tables, now?) → object`, `backupFileName(iso) → string`, `parseBackup(raw) → {ok:true, tables} | {ok:false, error}`, `summarizeTables(tables) → string`
- Produces (`db/backupIO.js`): `readAllTables({database})`, `replaceAllTables(tables, {database})`, `clearAllTables({database})`, `startFresh({database})`, `downloadBackup()`

- [ ] **Step 1: Testes do domínio (falhando)**

`src/domain/backup.test.js`:
```js
import { describe, it, expect } from 'vitest';
import { buildBackup, backupFileName, parseBackup, summarizeTables } from './backup';
import { TABLES } from './tables';

const tables = {
  transactions: [{ id: 1, type: 'despesa', value: 12.5, date: '2026-05-02', categoryId: 1, description: 'Café' }],
  categories: [{ id: 1, name: 'Alimentação', type: 'despesa', color: '#f5a65b' }],
  budgets: [{ id: 1, month: '2026-05', categoryId: 1, limit: 300 }],
  goals: [{ id: 1, name: 'Reserva', target: 1000 }],
  contributions: [{ id: 1, goalId: 1, value: -50, date: '2026-05-03' }],
  habits: [{ id: 1, day: 'ter', time: '06:00', endTime: '06:30', name: 'Alongar', kind: 'saude', order: 0, active: true }],
  habitChecks: [{ id: 1, habitId: 1, date: '2026-05-05' }],
  recurrences: [{ id: 1, type: 'despesa', value: 30, categoryId: 1, description: 'App', dayOfMonth: 31, startMonth: '2026-01', lastGeneratedMonth: '2026-05', active: false }],
};

describe('backup', () => {
  it('monta o JSON no formato 1', () => {
    const data = buildBackup(tables, new Date('2026-09-14T12:00:00Z'));
    expect(data).toMatchObject({ app: 'ORBE', format: 1, dbVersion: 3, exportedAt: '2026-09-14T12:00:00.000Z' });
    expect(Object.keys(data.tables)).toEqual(TABLES);
  });

  it('nomeia o arquivo com a data', () => {
    expect(backupFileName('2026-09-14')).toBe('orbe-backup-2026-09-14.json');
  });

  it('aceita o próprio formato (string JSON)', () => {
    const result = parseBackup(JSON.stringify(buildBackup(tables)));
    expect(result.ok).toBe(true);
    expect(result.tables).toEqual(tables);
  });

  it('aceita o formato recuperado e completa tabelas opcionais', () => {
    const recovered = { app: 'ORBE', tabelas: {} };
    for (const name of TABLES) {
      if (name === 'recurrences' || name === 'habitChecks') continue;
      recovered.tabelas[name] = { indices: [], linhas: tables[name] };
    }
    const result = parseBackup(recovered);
    expect(result.ok).toBe(true);
    expect(result.tables.recurrences).toEqual([]);
    expect(result.tables.habitChecks).toEqual([]);
    expect(result.tables.habits).toEqual(tables.habits);
  });

  it('recusa JSON inválido e arquivos de outro app', () => {
    expect(parseBackup('{oops')).toEqual({ ok: false, error: 'O arquivo não é um JSON válido.' });
    expect(parseBackup({ app: 'Outro', tables })).toEqual({ ok: false, error: 'Este arquivo não é um backup do ORBE.' });
  });

  it('recusa tabela obrigatória ausente', () => {
    const { goals, ...rest } = tables;
    expect(parseBackup({ app: 'ORBE', format: 1, tables: rest }))
      .toEqual({ ok: false, error: 'Tabela "goals" ausente ou inválida.' });
  });

  it('aponta tabela, linha e campo inválidos', () => {
    const bad = { ...tables, transactions: [tables.transactions[0], { ...tables.transactions[0], id: 2, date: '14/09/2026' }] };
    expect(parseBackup({ app: 'ORBE', format: 1, tables: bad }))
      .toEqual({ ok: false, error: 'Tabela "transactions", linha 2: campo "date" inválido.' });
  });

  it('resume a quantidade de registros', () => {
    expect(summarizeTables(tables)).toBe('1 transações, 1 categorias, 1 orçamentos, 1 metas, 1 aportes, 1 blocos de rotina');
  });
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npx vitest run src/domain/backup.test.js` → Expected: FAIL (import não resolvido)

- [ ] **Step 3: Implementar domínio**

`src/domain/categories.js`:
```js
// Paleta original do ORBE (recuperada dos dados) + dois tons extras.
export const CATEGORY_PALETTE = [
  '#8b7cf6', '#f5a65b', '#56b4d3', '#e8739c', '#55c995',
  '#65d39b', '#8cb8ff', '#d9c26a', '#9aa5a1',
];

export const DEFAULT_CATEGORIES = [
  { name: 'Moradia', type: 'despesa', color: '#8b7cf6' },
  { name: 'Alimentação', type: 'despesa', color: '#f5a65b' },
  { name: 'Transporte', type: 'despesa', color: '#56b4d3' },
  { name: 'Lazer', type: 'despesa', color: '#e8739c' },
  { name: 'Saúde', type: 'despesa', color: '#55c995' },
  { name: 'Salário', type: 'receita', color: '#65d39b' },
  { name: 'Freelance', type: 'receita', color: '#8cb8ff' },
];
```

`src/domain/backup.js`:
```js
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
```

- [ ] **Step 4: Rodar e ver passar**

Run: `npx vitest run src/domain/backup.test.js` → Expected: PASS (8 testes)

- [ ] **Step 5: Teste de IO (falhando)**

`src/db/backupIO.test.js`:
```js
import Dexie from 'dexie';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createDb, ALL_TABLES } from './db';
import { readAllTables, replaceAllTables, clearAllTables, startFresh } from './backupIO';
import { DEFAULT_CATEGORIES } from '../domain/categories';

let database;
beforeEach(async () => { database = createDb(`io-${crypto.randomUUID()}`); await database.open(); });
afterEach(async () => { database.close(); await Dexie.delete(database.name); });

const empty = () => Object.fromEntries(ALL_TABLES.map((n) => [n, []]));

describe('backupIO', () => {
  it('substitui tudo preservando ids', async () => {
    await database.categories.add({ name: 'Antiga', type: 'despesa', color: '#9aa5a1' });
    const tables = { ...empty(), categories: [{ id: 7, name: 'Freelance', type: 'receita', color: '#8cb8ff' }] };
    await replaceAllTables(tables, { database });
    expect(await readAllTables({ database })).toEqual(tables);
  });

  it('não altera nada se a gravação falhar no meio', async () => {
    await database.categories.add({ name: 'Mantida', type: 'despesa', color: '#9aa5a1' });
    const before = await readAllTables({ database });
    const dup = { id: 1, name: 'X', type: 'despesa', color: '#9aa5a1' };
    const broken = { ...empty(), goals: [{ id: 1, name: 'Meta', target: 10 }], categories: [dup, dup] };
    await expect(replaceAllTables(broken, { database })).rejects.toThrow();
    expect(await readAllTables({ database })).toEqual(before);
  });

  it('limpa todas as tabelas', async () => {
    await database.categories.add({ name: 'A', type: 'despesa', color: '#9aa5a1' });
    await database.habits.add({ day: 'seg', time: '07:00', endTime: '08:00', name: 'B', kind: 'pessoal', order: 0, active: true });
    await clearAllTables({ database });
    expect(await readAllTables({ database })).toEqual(empty());
  });

  it('começar do zero cria as categorias padrão só uma vez', async () => {
    await startFresh({ database });
    await startFresh({ database });
    const names = (await database.categories.toArray()).map((c) => c.name);
    expect(names).toEqual(DEFAULT_CATEGORIES.map((c) => c.name));
  });
});
```

- [ ] **Step 6: Rodar e ver falhar**

Run: `npx vitest run src/db/backupIO.test.js` → Expected: FAIL (import não resolvido)

- [ ] **Step 7: Implementar IO**

`src/db/backupIO.js`:
```js
import { db, ALL_TABLES } from './db';
import { buildBackup, backupFileName } from '../domain/backup';
import { DEFAULT_CATEGORIES } from '../domain/categories';
import { todayISO } from '../domain/dates';

export async function readAllTables({ database = db } = {}) {
  const tables = {};
  for (const name of ALL_TABLES) tables[name] = await database.table(name).toArray();
  return tables;
}

// Transação única: se qualquer gravação falhar, nada muda.
export async function replaceAllTables(tables, { database = db } = {}) {
  await database.transaction('rw', ALL_TABLES, async () => {
    for (const name of ALL_TABLES) {
      await database.table(name).clear();
      if (tables[name].length) await database.table(name).bulkAdd(tables[name]);
    }
  });
}

export async function clearAllTables({ database = db } = {}) {
  await database.transaction('rw', ALL_TABLES, async () => {
    for (const name of ALL_TABLES) await database.table(name).clear();
  });
}

export async function startFresh({ database = db } = {}) {
  await database.transaction('rw', database.categories, async () => {
    if ((await database.categories.count()) === 0) await database.categories.bulkAdd(DEFAULT_CATEGORIES);
  });
}

export async function downloadBackup() {
  const data = buildBackup(await readAllTables());
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = backupFileName(todayISO());
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
```

- [ ] **Step 8: Rodar todos os testes**

Run: `npx vitest run` → Expected: PASS (todos)

- [ ] **Step 9: Commit**

```powershell
git add src/domain src/db
git commit -m "feat: backup com validacao em dois formatos e substituicao atomica"
```

---

### Task 4: Recorrência e transações (domínio + banco)

**Files:**
- Create: `src/domain/recurrence.js`, `src/domain/recurrence.test.js`, `src/domain/transactions.js`, `src/domain/transactions.test.js`, `src/db/recurrences.js`, `src/db/transactions.js`, `src/db/recurrences.test.js`

**Interfaces:**
- Consumes: `addMonths`, `daysInMonth`, `todayISO` (dates), `toCents` (money), `createDb`, `db`
- Produces (`domain/recurrence.js`): `occurrenceDate(month, dayOfMonth) → iso`, `dueOccurrences(rules, today) → {transactions, updates:[{id,lastGeneratedMonth}]}`, `resumeMarker(lastGeneratedMonth, today) → month`, `ruleFromTransaction(tx) → rule`
- Produces (`domain/transactions.js`): `normalizeText(s)`, `filterTransactions(list, {type,categoryId,search})`, `totalsOf(list) → {incomeCents, expenseCents, balanceCents}`, `groupByDay(list) → [{date, items}]`, `validateEntry(input, categories)`, `validateTransaction(input, categories)`, `validateRecurrence(input, categories)` — `input = {type, cents, categoryId, description, date?, dayOfMonth?}`; retorno é objeto de erros com chaves `value|date|dayOfMonth|categoryId|description`
- Produces (`db/recurrences.js`): `runDueRecurrences({database, today}) → number`, `updateRecurrence(id, changes, opts)`, `pauseRecurrence(id, opts)`, `resumeRecurrence(id, opts)`, `deleteRecurrence(id, opts)`
- Produces (`db/transactions.js`): `addTransaction(tx, {repeatMonthly, database, today}) → id`, `updateTransaction(id, changes, {database})`, `deleteTransaction(id, {database})`

- [ ] **Step 1: Testes do domínio de recorrência (falhando)**

`src/domain/recurrence.test.js`:
```js
import { describe, it, expect } from 'vitest';
import { occurrenceDate, dueOccurrences, resumeMarker, ruleFromTransaction } from './recurrence';

const rule = (over = {}) => ({
  id: 1, type: 'despesa', value: 45.9, categoryId: 3, description: 'Academia',
  dayOfMonth: 10, startMonth: '2026-06', lastGeneratedMonth: '2026-06', active: true, ...over,
});

describe('occurrenceDate', () => {
  it('limita o dia ao último dia do mês', () => {
    expect(occurrenceDate('2026-02', 31)).toBe('2026-02-28');
    expect(occurrenceDate('2028-02', 31)).toBe('2028-02-29');
    expect(occurrenceDate('2026-06', 5)).toBe('2026-06-05');
  });
});

describe('dueOccurrences', () => {
  it('gera os meses que faltam até hoje e avança o marcador', () => {
    const { transactions, updates } = dueOccurrences([rule()], '2026-09-14');
    expect(transactions.map((t) => t.date)).toEqual(['2026-07-10', '2026-08-10', '2026-09-10']);
    expect(transactions[0]).toEqual({ type: 'despesa', value: 45.9, date: '2026-07-10', categoryId: 3, description: 'Academia', recurrenceId: 1 });
    expect(updates).toEqual([{ id: 1, lastGeneratedMonth: '2026-09' }]);
  });

  it('não gera ocorrência com data futura no mês atual', () => {
    const { transactions, updates } = dueOccurrences([rule({ dayOfMonth: 20 })], '2026-09-14');
    expect(transactions.map((t) => t.date)).toEqual(['2026-07-20', '2026-08-20']);
    expect(updates).toEqual([{ id: 1, lastGeneratedMonth: '2026-08' }]);
  });

  it('ignora regras pausadas e é idempotente', () => {
    expect(dueOccurrences([rule({ active: false })], '2026-09-14')).toEqual({ transactions: [], updates: [] });
    expect(dueOccurrences([rule({ lastGeneratedMonth: '2026-09' })], '2026-09-14')).toEqual({ transactions: [], updates: [] });
  });

  it('dia 31 cai no último dia de cada mês', () => {
    const { transactions } = dueOccurrences([rule({ dayOfMonth: 31, lastGeneratedMonth: '2026-01' })], '2026-03-31');
    expect(transactions.map((t) => t.date)).toEqual(['2026-02-28', '2026-03-31']);
  });
});

describe('resumeMarker', () => {
  it('não preenche os meses pausados', () => {
    expect(resumeMarker('2026-05', '2026-09-14')).toBe('2026-08');
  });
  it('mantém o marcador se já gerou o mês atual', () => {
    expect(resumeMarker('2026-09', '2026-09-14')).toBe('2026-09');
  });
});

describe('ruleFromTransaction', () => {
  it('cria a regra a partir da data da transação', () => {
    expect(ruleFromTransaction({ type: 'receita', value: 3000, date: '2026-07-05', categoryId: 6, description: 'Pagamento' }))
      .toEqual({ type: 'receita', value: 3000, categoryId: 6, description: 'Pagamento', dayOfMonth: 5, startMonth: '2026-07', lastGeneratedMonth: '2026-07', active: true });
  });
});
```

- [ ] **Step 2: Testes do domínio de transações (falhando)**

`src/domain/transactions.test.js`:
```js
import { describe, it, expect } from 'vitest';
import { filterTransactions, totalsOf, groupByDay, validateTransaction, validateRecurrence } from './transactions';

const list = [
  { id: 1, type: 'receita', value: 1200, date: '2026-09-05', categoryId: 6, description: 'Pagamento' },
  { id: 2, type: 'despesa', value: 0.1, date: '2026-09-05', categoryId: 2, description: 'Pão de queijo' },
  { id: 3, type: 'despesa', value: 0.2, date: '2026-09-07', categoryId: 2, description: 'Café' },
];
const categories = [
  { id: 2, name: 'Alimentação', type: 'despesa' },
  { id: 6, name: 'Salário', type: 'receita' },
];

describe('filterTransactions', () => {
  it('filtra por tipo, categoria e busca sem acento', () => {
    expect(filterTransactions(list, { type: 'despesa' }).map((t) => t.id)).toEqual([2, 3]);
    expect(filterTransactions(list, { categoryId: 6 }).map((t) => t.id)).toEqual([1]);
    expect(filterTransactions(list, { search: 'PAO' }).map((t) => t.id)).toEqual([2]);
    expect(filterTransactions(list, {}).length).toBe(3);
  });
});

describe('totalsOf', () => {
  it('soma em centavos', () => {
    expect(totalsOf(list)).toEqual({ incomeCents: 120000, expenseCents: 30, balanceCents: 119970 });
  });
});

describe('groupByDay', () => {
  it('agrupa por data, mais recente primeiro, id desc no mesmo dia', () => {
    expect(groupByDay(list).map((g) => [g.date, g.items.map((t) => t.id)]))
      .toEqual([['2026-09-07', [3]], ['2026-09-05', [2, 1]]]);
  });
});

describe('validateTransaction', () => {
  const ok = { type: 'despesa', cents: 1500, date: '2026-09-14', categoryId: 2, description: 'Almoço' };
  it('aceita entrada válida', () => {
    expect(validateTransaction(ok, categories)).toEqual({});
  });
  it('aponta cada campo inválido', () => {
    expect(validateTransaction({ type: 'receita', cents: 0, date: '', categoryId: 2, description: '  ' }, categories)).toEqual({
      value: 'Informe um valor maior que zero.',
      date: 'Informe a data.',
      categoryId: 'A categoria não é do mesmo tipo.',
      description: 'Informe uma descrição.',
    });
    expect(validateTransaction({ ...ok, categoryId: 99, description: 'x'.repeat(81) }, categories)).toEqual({
      categoryId: 'Escolha uma categoria.',
      description: 'Use no máximo 80 caracteres.',
    });
  });
});

describe('validateRecurrence', () => {
  it('exige dia do mês entre 1 e 31', () => {
    const base = { type: 'despesa', cents: 1500, categoryId: 2, description: 'Aluguel' };
    expect(validateRecurrence({ ...base, dayOfMonth: 31 }, categories)).toEqual({});
    expect(validateRecurrence({ ...base, dayOfMonth: 0 }, categories)).toEqual({ dayOfMonth: 'Use um dia entre 1 e 31.' });
  });
});
```

- [ ] **Step 3: Rodar e ver falhar**

Run: `npx vitest run src/domain/recurrence.test.js src/domain/transactions.test.js` → Expected: FAIL (imports não resolvidos)

- [ ] **Step 4: Implementar domínio**

`src/domain/recurrence.js`:
```js
import { addMonths, daysInMonth } from './dates';

export function occurrenceDate(month, dayOfMonth) {
  const day = Math.min(dayOfMonth, daysInMonth(month));
  return `${month}-${String(day).padStart(2, '0')}`;
}

// Ocorrências devidas até hoje (inclusive), a partir do mês seguinte ao marcador.
export function dueOccurrences(rules, today) {
  const currentMonth = today.slice(0, 7);
  const transactions = [];
  const updates = [];
  for (const rule of rules) {
    if (!rule.active) continue;
    let last = rule.lastGeneratedMonth;
    for (let month = addMonths(last, 1); month <= currentMonth; month = addMonths(month, 1)) {
      const date = occurrenceDate(month, rule.dayOfMonth);
      if (date > today) break;
      transactions.push({
        type: rule.type, value: rule.value, date, categoryId: rule.categoryId,
        description: rule.description, recurrenceId: rule.id,
      });
      last = month;
    }
    if (last !== rule.lastGeneratedMonth) updates.push({ id: rule.id, lastGeneratedMonth: last });
  }
  return { transactions, updates };
}

// Ao retomar, pula os meses pausados: no máximo o mês atual ainda será gerado.
export function resumeMarker(lastGeneratedMonth, today) {
  const previous = addMonths(today.slice(0, 7), -1);
  return lastGeneratedMonth > previous ? lastGeneratedMonth : previous;
}

export function ruleFromTransaction(tx) {
  const month = tx.date.slice(0, 7);
  return {
    type: tx.type, value: tx.value, categoryId: tx.categoryId, description: tx.description,
    dayOfMonth: Number(tx.date.slice(8, 10)), startMonth: month, lastGeneratedMonth: month, active: true,
  };
}
```

`src/domain/transactions.js`:
```js
import { toCents } from './money';

export function normalizeText(text) {
  return text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim();
}

export function filterTransactions(list, { type = 'todas', categoryId = null, search = '' } = {}) {
  const query = normalizeText(search);
  return list.filter((t) =>
    (type === 'todas' || t.type === type)
    && (categoryId == null || t.categoryId === categoryId)
    && (!query || normalizeText(t.description).includes(query)));
}

export function totalsOf(list) {
  let incomeCents = 0;
  let expenseCents = 0;
  for (const t of list) {
    if (t.type === 'receita') incomeCents += toCents(t.value);
    else expenseCents += toCents(t.value);
  }
  return { incomeCents, expenseCents, balanceCents: incomeCents - expenseCents };
}

export function groupByDay(list) {
  const sorted = [...list].sort((a, b) => (a.date === b.date ? b.id - a.id : a.date < b.date ? 1 : -1));
  const groups = [];
  for (const t of sorted) {
    const last = groups[groups.length - 1];
    if (last && last.date === t.date) last.items.push(t);
    else groups.push({ date: t.date, items: [t] });
  }
  return groups;
}

const ERROR_ORDER = ['value', 'date', 'dayOfMonth', 'categoryId', 'description'];
const ordered = (errors) => Object.fromEntries(ERROR_ORDER.filter((k) => errors[k]).map((k) => [k, errors[k]]));

// Campos comuns a transação e regra de recorrência.
export function validateEntry(input, categories) {
  const errors = {};
  if (!Number.isInteger(input.cents) || input.cents <= 0) errors.value = 'Informe um valor maior que zero.';
  const category = categories.find((c) => c.id === input.categoryId);
  if (!category) errors.categoryId = 'Escolha uma categoria.';
  else if (category.type !== input.type) errors.categoryId = 'A categoria não é do mesmo tipo.';
  const description = (input.description || '').trim();
  if (!description) errors.description = 'Informe uma descrição.';
  else if (description.length > 80) errors.description = 'Use no máximo 80 caracteres.';
  return errors;
}

export function validateTransaction(input, categories) {
  const errors = validateEntry(input, categories);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date || '')) errors.date = 'Informe a data.';
  return ordered(errors);
}

export function validateRecurrence(input, categories) {
  const errors = validateEntry(input, categories);
  if (!Number.isInteger(input.dayOfMonth) || input.dayOfMonth < 1 || input.dayOfMonth > 31) {
    errors.dayOfMonth = 'Use um dia entre 1 e 31.';
  }
  return ordered(errors);
}
```

- [ ] **Step 5: Rodar e ver passar**

Run: `npx vitest run src/domain` → Expected: PASS

- [ ] **Step 6: Testes do banco de recorrências (falhando)**

`src/db/recurrences.test.js`:
```js
import Dexie from 'dexie';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createDb } from './db';
import { runDueRecurrences, resumeRecurrence, pauseRecurrence, deleteRecurrence } from './recurrences';
import { addTransaction, deleteTransaction } from './transactions';

let database;
beforeEach(async () => { database = createDb(`rec-${crypto.randomUUID()}`); await database.open(); });
afterEach(async () => { database.close(); await Dexie.delete(database.name); });

const tx = { type: 'despesa', value: 45.9, date: '2026-07-10', categoryId: 3, description: 'Academia' };
const dates = async () => (await database.transactions.orderBy('date').toArray()).map((t) => t.date);

describe('recorrências no banco', () => {
  it('criar com repetição gera os meses seguintes até hoje', async () => {
    await addTransaction(tx, { repeatMonthly: true, database, today: '2026-09-14' });
    expect(await dates()).toEqual(['2026-07-10', '2026-08-10', '2026-09-10']);
    const all = await database.transactions.toArray();
    expect(new Set(all.map((t) => t.recurrenceId)).size).toBe(1);
  });

  it('execuções simultâneas não duplicam', async () => {
    await addTransaction(tx, { repeatMonthly: true, database, today: '2026-07-10' });
    await Promise.all([
      runDueRecurrences({ database, today: '2026-09-14' }),
      runDueRecurrences({ database, today: '2026-09-14' }),
    ]);
    expect(await dates()).toEqual(['2026-07-10', '2026-08-10', '2026-09-10']);
  });

  it('lançamento gerado e apagado não volta', async () => {
    await addTransaction(tx, { repeatMonthly: true, database, today: '2026-08-14' });
    const august = await database.transactions.where('date').equals('2026-08-10').first();
    await deleteTransaction(august.id, { database });
    await runDueRecurrences({ database, today: '2026-08-20' });
    expect(await dates()).toEqual(['2026-07-10']);
  });

  it('retomar não preenche meses pausados', async () => {
    await addTransaction(tx, { repeatMonthly: true, database, today: '2026-07-10' });
    const rule = await database.recurrences.toCollection().first();
    await pauseRecurrence(rule.id, { database });
    await runDueRecurrences({ database, today: '2026-09-14' });
    expect(await dates()).toEqual(['2026-07-10']);
    await resumeRecurrence(rule.id, { database, today: '2026-09-14' });
    expect(await dates()).toEqual(['2026-07-10', '2026-09-10']);
  });

  it('excluir a regra mantém lançamentos e limpa recurrenceId', async () => {
    await addTransaction(tx, { repeatMonthly: true, database, today: '2026-08-14' });
    const rule = await database.recurrences.toCollection().first();
    await deleteRecurrence(rule.id, { database });
    expect(await database.recurrences.count()).toBe(0);
    const all = await database.transactions.toArray();
    expect(all).toHaveLength(2);
    expect(all.every((t) => !('recurrenceId' in t))).toBe(true);
  });

  it('criar sem repetição não cria regra', async () => {
    await addTransaction(tx, { database, today: '2026-09-14' });
    expect(await database.recurrences.count()).toBe(0);
    expect(await dates()).toEqual(['2026-07-10']);
  });
});
```

- [ ] **Step 7: Rodar e ver falhar**

Run: `npx vitest run src/db/recurrences.test.js` → Expected: FAIL (imports não resolvidos)

- [ ] **Step 8: Implementar banco**

`src/db/recurrences.js`:
```js
import { db } from './db';
import { dueOccurrences, resumeMarker } from '../domain/recurrence';
import { todayISO } from '../domain/dates';

// Lê regras e grava lançamentos na MESMA transação rw: chamadas simultâneas
// (ex.: StrictMode) enfileiram e a segunda já vê o marcador atualizado.
export async function runDueRecurrences({ database = db, today = todayISO() } = {}) {
  return database.transaction('rw', database.recurrences, database.transactions, async () => {
    const rules = await database.recurrences.toArray();
    const { transactions, updates } = dueOccurrences(rules, today);
    if (transactions.length) await database.transactions.bulkAdd(transactions);
    for (const u of updates) await database.recurrences.update(u.id, { lastGeneratedMonth: u.lastGeneratedMonth });
    return transactions.length;
  });
}

export async function updateRecurrence(id, changes, { database = db, today = todayISO() } = {}) {
  await database.recurrences.update(id, changes);
  await runDueRecurrences({ database, today });
}

export async function pauseRecurrence(id, { database = db } = {}) {
  await database.recurrences.update(id, { active: false });
}

export async function resumeRecurrence(id, { database = db, today = todayISO() } = {}) {
  await database.transaction('rw', database.recurrences, async () => {
    const rule = await database.recurrences.get(id);
    await database.recurrences.update(id, { active: true, lastGeneratedMonth: resumeMarker(rule.lastGeneratedMonth, today) });
  });
  await runDueRecurrences({ database, today });
}

export async function deleteRecurrence(id, { database = db } = {}) {
  await database.transaction('rw', database.recurrences, database.transactions, async () => {
    await database.transactions.where('recurrenceId').equals(id).modify((t) => { delete t.recurrenceId; });
    await database.recurrences.delete(id);
  });
}
```

`src/db/transactions.js`:
```js
import { db } from './db';
import { ruleFromTransaction } from '../domain/recurrence';
import { todayISO } from '../domain/dates';
import { runDueRecurrences } from './recurrences';

export async function addTransaction(tx, { repeatMonthly = false, database = db, today = todayISO() } = {}) {
  const id = await database.transaction('rw', database.recurrences, database.transactions, async () => {
    if (!repeatMonthly) return database.transactions.add(tx);
    const recurrenceId = await database.recurrences.add(ruleFromTransaction(tx));
    return database.transactions.add({ ...tx, recurrenceId });
  });
  if (repeatMonthly) await runDueRecurrences({ database, today });
  return id;
}

export async function updateTransaction(id, changes, { database = db } = {}) {
  await database.transactions.update(id, changes);
}

export async function deleteTransaction(id, { database = db } = {}) {
  await database.transactions.delete(id);
}
```

- [ ] **Step 9: Rodar todos os testes**

Run: `npx vitest run` → Expected: PASS (todos)

- [ ] **Step 10: Commit**

```powershell
git add src/domain src/db
git commit -m "feat: recorrencia mensal e regras de transacoes (TDD)"
```

---

### Task 5: Tokens visuais, fontes e componentes de UI

**Files:**
- Modify: `src/index.css`, `src/main.jsx`
- Create: `src/components/ui/Card.jsx`, `Button.jsx`, `Modal.jsx`, `ConfirmDialog.jsx`, `Field.jsx`, `MoneyInput.jsx`, `Badge.jsx`, `EmptyState.jsx`, `Segmented.jsx`

**Interfaces:**
- Consumes: `formatMoneyInput` (money)
- Produces (classes Tailwind geradas pelos tokens): `bg-bg`, `bg-surface`, `border-line`, `bg-line`, `text-brand`, `bg-brand`, `bg-brand-soft`, `border-brand-line`, `text-ink`, `text-ink-2`, `text-ink-3`, `text-deco`, `text-expense`, `text-income`, `text-amber`, `*-chart-purple|orange|cyan|pink`, `*-sleep`, `font-serif`, `font-sans`, `rounded-card`, `rounded-kpi`, utilitário `eyebrow`
- Produces (componentes, todos `export default` salvo indicação):
  - `Card({as='section', className, children, ...props})`; named `CardTitle({title, subtitle, action})`
  - `Button({variant='secondary'|'primary'|'danger'|'ghost', size='md'|'sm', className, type='button', ...props})`; named `IconButton({label, className, children, ...props})`
  - `Modal({open, title, onClose, children, size='md'|'lg'})` — foco inicial em `[data-autofocus]` ou primeiro campo; Tab preso; Esc fecha; devolve o foco
  - `ConfirmDialog({open, title='Confirmar exclusão', message, confirmLabel='Excluir', onConfirm, onCancel, busy=false})`
  - `Field({label, htmlFor, error, hint, children})`; named `inputClass: string`
  - `MoneyInput({id, cents, onChange(cents), invalid})`
  - `Badge({children, className})`
  - `EmptyState({icon: Icon, title, text, action})`
  - `Segmented({label, options:[{value,label}], value, onChange})`

- [ ] **Step 1: Tokens e base**

`src/index.css` (arquivo inteiro):
```css
@import "tailwindcss";

/* Tokens do ORBE. Nenhuma cor literal fora deste bloco (exceto cores de categoria, que são dados). */
@theme {
  --color-*: initial;
  --color-bg: #080B0A;
  --color-surface: #0F1513;
  --color-line: rgb(255 255 255 / 0.07);
  --color-brand: #45C98A;
  --color-brand-soft: #12241C;
  --color-brand-line: #1E4634;
  --color-ink: #E9EFEB;
  --color-ink-2: #7E8C87;
  --color-ink-3: #74817C;
  --color-deco: #5A6662;
  --color-expense: #E06B5A;
  --color-income: #4CC3B5;
  --color-amber: #E8B04B;
  --color-chart-purple: #A78BFA;
  --color-chart-orange: #F0A44C;
  --color-chart-cyan: #6FCFD8;
  --color-chart-pink: #F0728F;
  --color-sleep: #8CB8FF;

  --font-serif: "Instrument Serif", ui-serif, Georgia, serif;
  --font-sans: "Inter Variable", ui-sans-serif, system-ui, sans-serif;

  --radius-card: 16px;
  --radius-kpi: 14px;
}

@layer base {
  html { color-scheme: dark; }
  body { @apply bg-bg font-sans text-ink antialiased; }
  :focus-visible { outline: 2px solid var(--color-brand); outline-offset: 2px; }
  ::selection { background: var(--color-brand-line); }
}

/* Etiqueta em caixa alta: SÓ no cabeçalho de página e no cartão de armazenamento. */
@utility eyebrow {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--color-brand);
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { transition-duration: 0s !important; animation-duration: 0s !important; }
}
```

`src/main.jsx` (arquivo inteiro):
```jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import '@fontsource/instrument-serif/latin-400.css';
import '@fontsource-variable/inter/wght.css';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
```

- [ ] **Step 2: Card, Button, Badge, EmptyState, Segmented**

`src/components/ui/Card.jsx`:
```jsx
export default function Card({ as: Tag = 'section', className = '', children, ...props }) {
  return (
    <Tag className={`rounded-card border border-line bg-surface ${className}`} {...props}>
      {children}
    </Tag>
  );
}

export function CardTitle({ title, subtitle, action }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div>
        <h2 className="font-serif text-[22px] leading-tight text-ink">{title}</h2>
        {subtitle && <p className="mt-0.5 text-xs text-ink-3">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
```

`src/components/ui/Button.jsx`:
```jsx
const VARIANTS = {
  primary: 'bg-brand font-semibold text-bg hover:bg-brand/90',
  secondary: 'border border-line text-ink hover:bg-line',
  danger: 'bg-expense font-semibold text-bg hover:bg-expense/90',
  ghost: 'text-ink-2 hover:bg-line hover:text-ink',
};

export default function Button({ variant = 'secondary', size = 'md', className = '', type = 'button', ...props }) {
  const sizing = size === 'sm' ? 'h-8 px-3 text-xs' : 'h-10 px-4 text-sm';
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full transition-colors duration-150 disabled:pointer-events-none disabled:opacity-50 ${sizing} ${VARIANTS[variant]} ${className}`}
      {...props}
    />
  );
}

export function IconButton({ label, className = '', children, ...props }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-ink-2 transition-colors duration-150 hover:bg-line hover:text-ink ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
```

`src/components/ui/Badge.jsx`:
```jsx
export default function Badge({ children, className = '' }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border border-line px-2 py-0.5 text-[11px] text-ink-2 ${className}`}>
      {children}
    </span>
  );
}
```

`src/components/ui/EmptyState.jsx`:
```jsx
export default function EmptyState({ icon: Icon, title, text, action }) {
  return (
    <div className="flex flex-col items-center px-6 py-12 text-center">
      {Icon && (
        <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-brand/12 text-brand">
          <Icon size={22} strokeWidth={1.75} aria-hidden />
        </span>
      )}
      <p className="font-serif text-xl text-ink">{title}</p>
      {text && <p className="mt-1 max-w-sm text-sm text-ink-2">{text}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
```

`src/components/ui/Segmented.jsx`:
```jsx
export default function Segmented({ label, options, value, onChange }) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex rounded-full border border-line bg-bg p-1">
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(option.value)}
            className={`h-8 rounded-full px-3 text-xs font-medium transition-colors duration-150 ${active ? 'bg-brand-soft text-ink ring-1 ring-brand-line' : 'text-ink-2 hover:text-ink'}`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 3: Modal e ConfirmDialog**

`src/components/ui/Modal.jsx`:
```jsx
import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { IconButton } from './Button';

const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

export default function Modal({ open, title, onClose, children, size = 'md' }) {
  const panelRef = useRef(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const titleId = useId();

  useEffect(() => {
    if (!open) return undefined;
    const previous = document.activeElement;
    const panel = panelRef.current;
    const initial = panel.querySelector('[data-autofocus]') || panel.querySelector('input,select,textarea') || panel.querySelector(FOCUSABLE);
    initial?.focus();

    function onKeyDown(event) {
      if (event.key === 'Escape') { onCloseRef.current(); return; }
      if (event.key !== 'Tab') return;
      const items = Array.from(panel.querySelectorAll(FOCUSABLE));
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }

    document.addEventListener('keydown', onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
      previous?.focus?.();
    };
  }, [open]);

  if (!open) return null;
  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-bg/80 sm:items-center sm:p-4"
      onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`max-h-[90dvh] w-full overflow-y-auto rounded-t-card border border-line bg-surface p-5 sm:rounded-card ${size === 'lg' ? 'sm:max-w-lg' : 'sm:max-w-md'}`}
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 id={titleId} className="font-serif text-2xl text-ink">{title}</h2>
          <IconButton label="Fechar" onClick={onClose}><X size={18} aria-hidden /></IconButton>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  );
}
```

`src/components/ui/ConfirmDialog.jsx`:
```jsx
import Modal from './Modal';
import Button from './Button';

export default function ConfirmDialog({ open, title = 'Confirmar exclusão', message, confirmLabel = 'Excluir', onConfirm, onCancel, busy = false }) {
  return (
    <Modal open={open} title={title} onClose={onCancel}>
      <p className="mb-6 text-sm text-ink-2">{message}</p>
      <div className="flex justify-end gap-2">
        <Button onClick={onCancel} data-autofocus>Cancelar</Button>
        <Button variant="danger" onClick={onConfirm} disabled={busy}>{confirmLabel}</Button>
      </div>
    </Modal>
  );
}
```

- [ ] **Step 4: Field e MoneyInput**

`src/components/ui/Field.jsx`:
```jsx
export const inputClass = 'h-10 w-full rounded-xl border border-line bg-bg px-3 text-sm text-ink placeholder:text-ink-3 transition-colors duration-150 hover:border-deco aria-[invalid=true]:border-expense';

export default function Field({ label, htmlFor, error, hint, children }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="block text-[13px] text-ink-2">{label}</label>
      {children}
      {error
        ? <p className="text-xs text-expense" role="alert">{error}</p>
        : hint ? <p className="text-xs text-ink-3">{hint}</p> : null}
    </div>
  );
}
```

`src/components/ui/MoneyInput.jsx`:
```jsx
import { formatMoneyInput } from '../../domain/money';
import { inputClass } from './Field';

// Máscara estilo caixa eletrônico: os dígitos digitados são centavos.
export default function MoneyInput({ id, cents, onChange, invalid }) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-ink-3">R$</span>
      <input
        id={id}
        inputMode="numeric"
        autoComplete="off"
        placeholder="0,00"
        aria-invalid={invalid || undefined}
        className={`${inputClass} pl-10 text-right tabular-nums`}
        value={cents ? formatMoneyInput(cents) : ''}
        onChange={(event) => {
          const digits = event.target.value.replace(/\D/g, '').slice(0, 11);
          onChange(digits ? Number(digits) : 0);
        }}
      />
    </div>
  );
}
```

- [ ] **Step 5: Verificar build e ícones**

Run: `node -e "const l=require('lucide-react');for(const n of ['LayoutGrid','ArrowDownUp','Wallet','Target','Tag','ListChecks','ChevronLeft','ChevronRight','CalendarDays','CircleDollarSign','Database','Download','Upload','Trash2','Plus','Pencil','X','Search','Repeat','Pause','Play','ArrowUpRight','ArrowDownLeft','Inbox','Sparkles']) if(!l[n]) console.log('FALTA', n)"`
Expected: nenhuma linha "FALTA" (se faltar, trocar pelo nome equivalente da versão instalada e registrar no commit).

Run: `npx vite build`
Expected: build sem erros; CSS gerado contém `--color-brand` e não contém `--color-slate`.

- [ ] **Step 6: Commit**

```powershell
git add src/index.css src/main.jsx src/components
git commit -m "feat: tokens visuais do ORBE, fontes locais e componentes de UI"
```

---

### Task 6: Moldura, navegação, backup na interface e boas-vindas (fim da etapa 1)

**Files:**
- Create: `src/components/layout/nav.js`, `Brand.jsx`, `Sidebar.jsx`, `BottomNav.jsx`, `MobileTopBar.jsx`, `PageHeader.jsx`, `DatePill.jsx`, `MonthSwitcher.jsx`, `StorageCard.jsx`, `DataModal.jsx`; `src/hooks/useMonthParam.js`; `src/pages/Painel.jsx`, `src/pages/EmBreve.jsx`, `src/pages/transacoes/Transacoes.jsx` (placeholder até a Task 7)
- Modify: `src/App.jsx`

**Interfaces:**
- Consumes: UI da Task 5; `downloadBackup`, `replaceAllTables`, `clearAllTables`, `startFresh` (backupIO); `parseBackup`, `summarizeTables` (backup); `runDueRecurrences`; `db`; `todayISO`, `formatLongDate`, `addMonths`, `monthLabel`, `currentMonthKey`
- Produces: `NAV: {to,label,icon}[]`; `PageHeader({eyebrow='Finanças pessoais', title, subtitle, actions})`; `MonthSwitcher({month, onChange})`; `DataModal({open, mode='menu'|'import'|'clear', onClose})`; `useMonthParam() → [month, setMonth]`; `EmBreve({title, etapa})`

- [ ] **Step 1: Navegação e marca**

`src/components/layout/nav.js`:
```js
import { LayoutGrid, ArrowDownUp, Wallet, Target, Tag, ListChecks } from 'lucide-react';

export const NAV = [
  { to: '/', label: 'Painel', icon: LayoutGrid },
  { to: '/transacoes', label: 'Transações', icon: ArrowDownUp },
  { to: '/orcamento', label: 'Orçamento', icon: Wallet },
  { to: '/metas', label: 'Metas', icon: Target },
  { to: '/categorias', label: 'Categorias', icon: Tag },
  { to: '/habitos', label: 'Hábitos', icon: ListChecks },
];
```

`src/components/layout/Brand.jsx`:
```jsx
import { CircleDollarSign } from 'lucide-react';

export default function Brand() {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand/12 text-brand ring-1 ring-brand-line">
        <CircleDollarSign size={18} strokeWidth={1.75} aria-hidden />
      </span>
      <div className="leading-tight">
        <p className="text-[15px] font-semibold tracking-wide text-ink">ORBE</p>
        <p className="text-[11px] text-ink-3">Finanças pessoais</p>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Sidebar, BottomNav e MobileTopBar**

`src/components/layout/Sidebar.jsx`:
```jsx
import { NavLink } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { NAV } from './nav';
import Brand from './Brand';
import StorageCard from './StorageCard';

export default function Sidebar() {
  return (
    <aside className="sticky top-0 hidden h-dvh w-[232px] shrink-0 flex-col border-r border-line px-4 py-6 md:flex">
      <div className="px-1"><Brand /></div>
      <nav aria-label="Principal" className="mt-8 flex flex-col gap-1">
        {NAV.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => `flex h-11 items-center gap-3 rounded-xl border px-3 text-sm transition-colors duration-150 ${isActive ? 'border-brand-line bg-brand-soft text-ink' : 'border-transparent text-ink-2 hover:bg-line hover:text-ink'}`}
          >
            {({ isActive }) => (
              <>
                <Icon size={18} strokeWidth={1.75} className={isActive ? 'text-brand' : ''} aria-hidden />
                <span className="flex-1">{label}</span>
                {isActive && <ChevronRight size={16} className="text-brand" aria-hidden />}
              </>
            )}
          </NavLink>
        ))}
      </nav>
      <div className="mt-auto"><StorageCard /></div>
    </aside>
  );
}
```

`src/components/layout/BottomNav.jsx`:
```jsx
import { NavLink } from 'react-router-dom';
import { NAV } from './nav';

export default function BottomNav() {
  return (
    <nav aria-label="Principal" className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-6 border-t border-line bg-bg pb-[env(safe-area-inset-bottom)] md:hidden">
      {NAV.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) => `flex min-h-14 min-w-0 flex-col items-center justify-center gap-1 px-0.5 text-[10px] transition-colors duration-150 ${isActive ? 'text-brand' : 'text-ink-2 hover:text-ink'}`}
        >
          <Icon size={20} strokeWidth={1.75} aria-hidden />
          <span className="max-w-full truncate">{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
```

`src/components/layout/MobileTopBar.jsx`:
```jsx
import { useState } from 'react';
import { Database } from 'lucide-react';
import Brand from './Brand';
import DataModal from './DataModal';
import { IconButton } from '../ui/Button';

export default function MobileTopBar() {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex items-center justify-between border-b border-line px-4 py-3 md:hidden">
      <Brand />
      <IconButton label="Backup e dados" onClick={() => setOpen(true)}><Database size={18} aria-hidden /></IconButton>
      <DataModal open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
```

- [ ] **Step 3: Cabeçalho, data e seletor de mês**

`src/components/layout/DatePill.jsx`:
```jsx
import { CalendarDays } from 'lucide-react';
import { formatLongDate, todayISO } from '../../domain/dates';

export default function DatePill() {
  const today = todayISO();
  return (
    <span className="inline-flex h-10 items-center gap-2 rounded-full border border-line px-4 text-[13px] text-ink-2">
      <CalendarDays size={15} strokeWidth={1.75} aria-hidden />
      <time dateTime={today} className="tabular-nums">{formatLongDate(today)}</time>
    </span>
  );
}
```

`src/components/layout/PageHeader.jsx`:
```jsx
import DatePill from './DatePill';

export default function PageHeader({ eyebrow = 'Finanças pessoais', title, subtitle, actions }) {
  return (
    <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="mt-2 font-serif text-[34px] leading-none text-ink md:text-[44px]">{title}</h1>
        {subtitle && <p className="mt-2 text-sm text-ink-2">{subtitle}</p>}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {actions}
        <DatePill />
      </div>
    </header>
  );
}
```

`src/components/layout/MonthSwitcher.jsx`:
```jsx
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { addMonths, monthLabel } from '../../domain/dates';
import { IconButton } from '../ui/Button';

export default function MonthSwitcher({ month, onChange }) {
  return (
    <div className="inline-flex h-10 items-center rounded-full border border-line">
      <IconButton label="Mês anterior" onClick={() => onChange(addMonths(month, -1))}><ChevronLeft size={16} aria-hidden /></IconButton>
      <span aria-live="polite" className="inline-block min-w-[9.5rem] text-center text-[13px] text-ink first-letter:uppercase">
        {monthLabel(month)}
      </span>
      <IconButton label="Próximo mês" onClick={() => onChange(addMonths(month, 1))}><ChevronRight size={16} aria-hidden /></IconButton>
    </div>
  );
}
```

`src/hooks/useMonthParam.js`:
```js
import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { currentMonthKey } from '../domain/dates';

// Mês selecionado vive na URL (?mes=2026-06): sobrevive a recarregar a página.
export function useMonthParam() {
  const [params, setParams] = useSearchParams();
  const raw = params.get('mes');
  const month = raw && /^\d{4}-\d{2}$/.test(raw) ? raw : currentMonthKey();
  const setMonth = useCallback((next) => {
    setParams((prev) => {
      const updated = new URLSearchParams(prev);
      if (next === currentMonthKey()) updated.delete('mes');
      else updated.set('mes', next);
      return updated;
    }, { replace: true });
  }, [setParams]);
  return [month, setMonth];
}
```

- [ ] **Step 4: Cartão de armazenamento e modal de dados**

`src/components/layout/StorageCard.jsx`:
```jsx
import { useState } from 'react';
import { Download, Upload } from 'lucide-react';
import Button from '../ui/Button';
import DataModal from './DataModal';
import { downloadBackup } from '../../db/backupIO';

export default function StorageCard() {
  const [mode, setMode] = useState(null);
  return (
    <div className="rounded-kpi border border-line bg-surface p-4">
      <p className="eyebrow">Armazenamento</p>
      <p className="mt-2 text-[13px] font-medium text-ink">Seus dados ficam neste navegador.</p>
      <p className="mt-0.5 text-xs text-ink-3">Sem nuvem e sem login.</p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <Button size="sm" onClick={() => downloadBackup()}><Download size={14} aria-hidden />Exportar</Button>
        <Button size="sm" onClick={() => setMode('import')}><Upload size={14} aria-hidden />Importar</Button>
      </div>
      <button type="button" onClick={() => setMode('clear')} className="mt-2 w-full rounded-md py-1 text-xs text-ink-3 transition-colors duration-150 hover:text-expense">
        Limpar todos os dados
      </button>
      <DataModal open={mode !== null} mode={mode ?? 'menu'} onClose={() => setMode(null)} />
    </div>
  );
}
```

`src/components/layout/DataModal.jsx`:
```jsx
import { useEffect, useRef, useState } from 'react';
import { Download, Upload, Trash2 } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Field, { inputClass } from '../ui/Field';
import { downloadBackup, replaceAllTables, clearAllTables } from '../../db/backupIO';
import { runDueRecurrences } from '../../db/recurrences';
import { parseBackup, summarizeTables } from '../../domain/backup';

const TITLES = { menu: 'Backup e dados', import: 'Importar backup', clear: 'Limpar todos os dados' };

export default function DataModal({ open, mode: initialMode = 'menu', onClose }) {
  const [mode, setMode] = useState(initialMode);
  const [parsed, setParsed] = useState(null);
  const [confirmText, setConfirmText] = useState('');
  const [status, setStatus] = useState(null);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    setMode(initialMode);
    setParsed(null);
    setConfirmText('');
    setStatus(null);
    setBusy(false);
  }, [open, initialMode]);

  async function onFile(event) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setStatus(null);
    setParsed(parseBackup(await file.text()));
  }

  async function run(action, successText) {
    setBusy(true);
    try {
      await action();
      setStatus({ kind: 'ok', text: successText });
      setParsed(null);
      setConfirmText('');
    } catch (error) {
      console.error(error);
      setStatus({ kind: 'error', text: 'Não foi possível concluir. Nada foi alterado.' });
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal open={open} title={TITLES[mode]} onClose={onClose}>
      {status && (
        <p role="status" className={`mb-4 rounded-xl border px-3 py-2 text-sm ${status.kind === 'ok' ? 'border-brand-line bg-brand-soft text-ink' : 'border-expense/40 text-expense'}`}>
          {status.text}
        </p>
      )}

      {mode === 'menu' && (
        <div className="grid gap-2">
          <Button className="justify-start" onClick={() => downloadBackup()}><Download size={16} aria-hidden />Exportar backup (JSON)</Button>
          <Button className="justify-start" onClick={() => setMode('import')}><Upload size={16} aria-hidden />Importar backup</Button>
          <Button variant="ghost" className="justify-start hover:text-expense" onClick={() => setMode('clear')}><Trash2 size={16} aria-hidden />Limpar todos os dados</Button>
          <p className="mt-2 text-xs text-ink-3">Seus dados ficam só neste navegador. Exporte um backup de vez em quando e guarde fora do computador.</p>
        </div>
      )}

      {mode === 'import' && (
        <div className="space-y-4">
          <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={onFile} />
          <Button onClick={() => fileRef.current?.click()} data-autofocus><Upload size={16} aria-hidden />Escolher arquivo</Button>
          {parsed && !parsed.ok && <p role="alert" className="text-sm text-expense">{parsed.error}</p>}
          {parsed?.ok && (
            <>
              <p className="text-sm text-ink-2">Encontrado: {summarizeTables(parsed.tables)}.</p>
              <p className="text-sm text-ink">Isto substitui todos os dados atuais deste navegador.</p>
              <div className="flex justify-end gap-2">
                <Button onClick={() => setParsed(null)}>Cancelar</Button>
                <Button
                  variant="danger"
                  disabled={busy}
                  onClick={() => run(async () => { await replaceAllTables(parsed.tables); await runDueRecurrences(); }, 'Backup importado.')}
                >
                  Substituir dados
                </Button>
              </div>
            </>
          )}
        </div>
      )}

      {mode === 'clear' && (
        <form
          className="space-y-4"
          onSubmit={(event) => { event.preventDefault(); if (confirmText === 'APAGAR') run(clearAllTables, 'Todos os dados foram apagados.'); }}
        >
          <p className="text-sm text-ink-2">Apaga transações, categorias, orçamentos, metas e rotina deste navegador. Não dá para desfazer; exporte um backup antes.</p>
          <Field label="Digite APAGAR para confirmar" htmlFor="confirm-clear">
            <input id="confirm-clear" className={inputClass} autoComplete="off" value={confirmText} onChange={(e) => setConfirmText(e.target.value)} />
          </Field>
          <div className="flex justify-end gap-2">
            <Button onClick={onClose}>Cancelar</Button>
            <Button type="submit" variant="danger" disabled={confirmText !== 'APAGAR' || busy}>Apagar tudo</Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
```

- [ ] **Step 5: Páginas provisórias e App**

`src/pages/EmBreve.jsx`:
```jsx
import { Sparkles } from 'lucide-react';
import PageHeader from '../components/layout/PageHeader';
import Card from '../components/ui/Card';
import EmptyState from '../components/ui/EmptyState';

export default function EmBreve({ title, etapa, eyebrow }) {
  return (
    <>
      <PageHeader eyebrow={eyebrow} title={title} />
      <Card className="mt-8">
        <EmptyState icon={Sparkles} title="Em construção" text={`Esta tela chega na etapa ${etapa} da reconstrução.`} />
      </Card>
    </>
  );
}
```

`src/pages/Painel.jsx`:
```jsx
import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { LayoutGrid, Upload } from 'lucide-react';
import PageHeader from '../components/layout/PageHeader';
import DataModal from '../components/layout/DataModal';
import Card, { CardTitle } from '../components/ui/Card';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import { db } from '../db/db';
import { startFresh } from '../db/backupIO';

export default function Painel() {
  const [importOpen, setImportOpen] = useState(false);
  const counts = useLiveQuery(async () => ({
    categories: await db.categories.count(),
    transactions: await db.transactions.count(),
  }), []);
  const isEmpty = counts && counts.categories === 0 && counts.transactions === 0;

  return (
    <>
      <PageHeader title="Visão geral" subtitle="Seu dinheiro, com contexto." />
      {isEmpty ? (
        <Card className="mt-8 p-6">
          <CardTitle title="Bem-vindo ao ORBE" subtitle="Seus dados ficam só neste navegador." />
          <p className="mt-4 max-w-prose text-sm text-ink-2">Traga um backup exportado antes ou comece do zero com as categorias padrão.</p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Button variant="primary" onClick={() => setImportOpen(true)}><Upload size={16} aria-hidden />Importar backup</Button>
            <Button onClick={() => startFresh()}>Começar do zero</Button>
          </div>
          <DataModal open={importOpen} mode="import" onClose={() => setImportOpen(false)} />
        </Card>
      ) : (
        <Card className="mt-8 min-h-[240px]">
          {counts && <EmptyState icon={LayoutGrid} title="Painel em construção" text="Os indicadores e gráficos chegam na etapa 7. Suas transações já estão na aba Transações." />}
        </Card>
      )}
    </>
  );
}
```

`src/pages/transacoes/Transacoes.jsx` (provisório, substituído na Task 7):
```jsx
import EmBreve from '../EmBreve';

export default function Transacoes() {
  return <EmBreve title="Transações" etapa={2} />;
}
```

`src/App.jsx` (arquivo inteiro):
```jsx
import { lazy, Suspense, useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import BottomNav from './components/layout/BottomNav';
import MobileTopBar from './components/layout/MobileTopBar';
import EmBreve from './pages/EmBreve';
import { runDueRecurrences } from './db/recurrences';

const Painel = lazy(() => import('./pages/Painel'));
const Transacoes = lazy(() => import('./pages/transacoes/Transacoes'));

export default function App() {
  useEffect(() => {
    runDueRecurrences().catch((error) => console.error('Falha ao gerar recorrências', error));
  }, []);

  return (
    <div className="min-h-dvh md:flex">
      <Sidebar />
      <div className="min-w-0 flex-1">
        <MobileTopBar />
        <main className="mx-auto w-full max-w-[1240px] px-4 pb-28 pt-6 md:px-10 md:pb-12 md:pt-10">
          <Suspense fallback={<div className="min-h-[60vh]" aria-busy="true" />}>
            <Routes>
              <Route path="/" element={<Painel />} />
              <Route path="/transacoes" element={<Transacoes />} />
              <Route path="/orcamento" element={<EmBreve title="Orçamento" etapa={4} />} />
              <Route path="/metas" element={<EmBreve title="Metas" etapa={5} />} />
              <Route path="/categorias" element={<EmBreve title="Categorias" etapa={3} />} />
              <Route path="/habitos" element={<EmBreve eyebrow="Rotina" title="Rotina" etapa={6} />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
```

- [ ] **Step 6: Verificar no navegador isolado**

Run: `npx vitest run` → Expected: PASS
Run: `npx vite build` → Expected: sem erros
Run (background): `npm run dev` → Expected: `Local: http://localhost:5174/`

Script Playwright no scratchpad (perfil novo, nunca o Chrome real): abrir `http://localhost:5174/`, capturar 1440×900 e 375×812; clicar "Começar do zero" e confirmar que o cartão de boas-vindas some; navegar pelas 6 rotas sem erro no console; abrir "Limpar todos os dados", digitar `APAGAR`, confirmar e ver o cartão de boas-vindas voltar.
Expected: capturas mostram fundo escuro, menu com item ativo verde, título serif; sem erros no console.

- [ ] **Step 7: Commit e push (fim da etapa 1)**

```powershell
git add -A
git commit -m "feat: moldura do ORBE com navegacao, backup na interface e boas-vindas"
git push
```

---

### Task 7: Tela Transações com recorrências

**Files:**
- Create: `src/pages/transacoes/TransactionForm.jsx`, `TransactionList.jsx`, `RecurrenceList.jsx`, `RecurrenceForm.jsx`
- Replace: `src/pages/transacoes/Transacoes.jsx`

**Interfaces:**
- Consumes: `useMonthParam`; `PageHeader`, `MonthSwitcher`; UI da Task 5; `filterTransactions`, `totalsOf`, `groupByDay`, `validateTransaction`, `validateRecurrence`; `addTransaction`, `updateTransaction`, `deleteTransaction`; `updateRecurrence`, `pauseRecurrence`, `resumeRecurrence`, `deleteRecurrence`; `formatBRL`, `formatReais`, `formatSigned`, `toCents`, `fromCents`; `monthRange`, `formatDayHeader`, `formatDateBR`, `todayISO`, `currentMonthKey`; `db`
- Produces: `TransactionForm({open, transaction?, defaultDate, categories, onClose})`, `TransactionList({groups, categoriesById, recurrenceIds, onEdit, onDelete})`, `RecurrenceList({rules, categoriesById, onEdit, onToggle, onDelete})`, `RecurrenceForm({open, rule, categories, onClose})`

- [ ] **Step 1: Formulário de transação**

`src/pages/transacoes/TransactionForm.jsx`:
```jsx
import { useEffect, useState } from 'react';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import Field, { inputClass } from '../../components/ui/Field';
import MoneyInput from '../../components/ui/MoneyInput';
import Segmented from '../../components/ui/Segmented';
import { validateTransaction } from '../../domain/transactions';
import { toCents, fromCents } from '../../domain/money';
import { addTransaction, updateTransaction } from '../../db/transactions';

const TYPE_OPTIONS = [{ value: 'despesa', label: 'Despesa' }, { value: 'receita', label: 'Receita' }];

function initialState(transaction, defaultDate) {
  if (transaction) {
    return { type: transaction.type, cents: toCents(transaction.value), date: transaction.date, categoryId: transaction.categoryId, description: transaction.description, repeatMonthly: false };
  }
  return { type: 'despesa', cents: 0, date: defaultDate, categoryId: null, description: '', repeatMonthly: false };
}

export default function TransactionForm({ open, transaction, defaultDate, categories, onClose }) {
  const [form, setForm] = useState(() => initialState(transaction, defaultDate));
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  useEffect(() => {
    if (!open) return;
    setForm(initialState(transaction, defaultDate));
    setErrors({});
    setSaveError(null);
  }, [open, transaction, defaultDate]);

  const set = (patch) => setForm((prev) => ({ ...prev, ...patch }));
  const options = categories.filter((c) => c.type === form.type);
  const isEdit = Boolean(transaction);

  async function onSubmit(event) {
    event.preventDefault();
    const found = validateTransaction(form, categories);
    setErrors(found);
    if (Object.keys(found).length) return;
    const data = { type: form.type, value: fromCents(form.cents), date: form.date, categoryId: form.categoryId, description: form.description.trim() };
    setSaving(true);
    try {
      if (isEdit) await updateTransaction(transaction.id, data);
      else await addTransaction(data, { repeatMonthly: form.repeatMonthly });
      onClose();
    } catch (error) {
      console.error(error);
      setSaveError('Não foi possível salvar. Tente de novo.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} title={isEdit ? 'Editar transação' : 'Nova transação'} onClose={onClose}>
      <form className="space-y-4" onSubmit={onSubmit} noValidate>
        <Segmented
          label="Tipo"
          options={TYPE_OPTIONS}
          value={form.type}
          onChange={(type) => set({ type, categoryId: categories.find((c) => c.id === form.categoryId)?.type === type ? form.categoryId : null })}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Valor" htmlFor="tx-value" error={errors.value}>
            <MoneyInput id="tx-value" cents={form.cents} invalid={Boolean(errors.value)} onChange={(cents) => set({ cents })} />
          </Field>
          <Field label="Data" htmlFor="tx-date" error={errors.date}>
            <input id="tx-date" type="date" className={inputClass} value={form.date} aria-invalid={Boolean(errors.date) || undefined} onChange={(e) => set({ date: e.target.value })} />
          </Field>
        </div>
        <Field label="Categoria" htmlFor="tx-category" error={errors.categoryId} hint={options.length === 0 ? 'Nenhuma categoria deste tipo. Crie uma em Categorias.' : undefined}>
          <select id="tx-category" className={inputClass} value={form.categoryId ?? ''} aria-invalid={Boolean(errors.categoryId) || undefined} onChange={(e) => set({ categoryId: e.target.value ? Number(e.target.value) : null })}>
            <option value="">Escolha…</option>
            {options.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </Field>
        <Field label="Descrição" htmlFor="tx-description" error={errors.description}>
          <input id="tx-description" className={inputClass} maxLength={80} value={form.description} aria-invalid={Boolean(errors.description) || undefined} onChange={(e) => set({ description: e.target.value })} />
        </Field>
        {!isEdit && (
          <label className="flex items-start gap-3 rounded-xl border border-line p-3 text-sm text-ink">
            <input type="checkbox" className="mt-0.5 h-4 w-4 accent-brand" checked={form.repeatMonthly} onChange={(e) => set({ repeatMonthly: e.target.checked })} />
            <span>
              Repetir todo mês
              <span className="block text-xs text-ink-3">
                {form.date ? `Lança de novo todo dia ${Number(form.date.slice(8, 10))}, até você pausar.` : 'Lança de novo todo mês, até você pausar.'}
              </span>
            </span>
          </label>
        )}
        {saveError && <p role="alert" className="text-sm text-expense">{saveError}</p>}
        <div className="flex justify-end gap-2 pt-2">
          <Button onClick={onClose}>Cancelar</Button>
          <Button type="submit" variant="primary" disabled={saving}>{isEdit ? 'Salvar' : 'Adicionar'}</Button>
        </div>
      </form>
    </Modal>
  );
}
```

- [ ] **Step 2: Lista de transações**

`src/pages/transacoes/TransactionList.jsx`:
```jsx
import { ArrowDownLeft, ArrowUpRight, Pencil, Repeat, Trash2 } from 'lucide-react';
import Badge from '../../components/ui/Badge';
import { IconButton } from '../../components/ui/Button';
import { formatDayHeader } from '../../domain/dates';
import { formatSigned } from '../../domain/money';

export default function TransactionList({ groups, categoriesById, recurrenceIds, onEdit, onDelete }) {
  return (
    <div className="space-y-5">
      {groups.map((group) => (
        <section key={group.date} aria-label={formatDayHeader(group.date)}>
          <h3 className="mb-1 text-[13px] text-ink-3">{formatDayHeader(group.date)}</h3>
          <ul>
            {group.items.map((t) => {
              const category = categoriesById.get(t.categoryId);
              const color = category?.color;
              const Arrow = t.type === 'receita' ? ArrowUpRight : ArrowDownLeft;
              return (
                <li key={t.id} className="flex items-center gap-3 border-t border-line py-3 first:border-t-0">
                  <span
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-line text-ink-2"
                    style={color ? { backgroundColor: `color-mix(in srgb, ${color} 12%, transparent)`, color } : undefined}
                  >
                    <Arrow size={16} aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-ink">{t.description}</p>
                    <p className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-ink-3">
                      <span>{category?.name ?? 'Sem categoria'}</span>
                      {t.recurrenceId && recurrenceIds.has(t.recurrenceId) && <Badge><Repeat size={11} aria-hidden />recorrente</Badge>}
                    </p>
                  </div>
                  <p className={`shrink-0 text-sm font-medium tabular-nums ${t.type === 'receita' ? 'text-brand' : 'text-expense'}`}>
                    {formatSigned(t.value, t.type)}
                  </p>
                  <div className="flex shrink-0">
                    <IconButton label={`Editar ${t.description}`} onClick={() => onEdit(t)}><Pencil size={15} aria-hidden /></IconButton>
                    <IconButton label={`Excluir ${t.description}`} className="hover:text-expense" onClick={() => onDelete(t)}><Trash2 size={15} aria-hidden /></IconButton>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Recorrências (lista e formulário)**

`src/pages/transacoes/RecurrenceList.jsx`:
```jsx
import { Pause, Pencil, Play, Trash2 } from 'lucide-react';
import Badge from '../../components/ui/Badge';
import { IconButton } from '../../components/ui/Button';
import { formatSigned } from '../../domain/money';

export default function RecurrenceList({ rules, categoriesById, onEdit, onToggle, onDelete }) {
  return (
    <ul>
      {rules.map((rule) => (
        <li key={rule.id} className="flex items-center gap-3 border-t border-line py-3 first:border-t-0">
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-2 text-sm text-ink">
              <span className="truncate">{rule.description}</span>
              {!rule.active && <Badge>pausada</Badge>}
            </p>
            <p className="mt-0.5 text-xs text-ink-3">todo dia {rule.dayOfMonth} · {categoriesById.get(rule.categoryId)?.name ?? 'Sem categoria'}</p>
          </div>
          <p className={`shrink-0 text-sm font-medium tabular-nums ${rule.type === 'receita' ? 'text-brand' : 'text-expense'} ${rule.active ? '' : 'opacity-60'}`}>
            {formatSigned(rule.value, rule.type)}
          </p>
          <div className="flex shrink-0">
            <IconButton label={`Editar regra ${rule.description}`} onClick={() => onEdit(rule)}><Pencil size={15} aria-hidden /></IconButton>
            <IconButton label={rule.active ? `Pausar ${rule.description}` : `Retomar ${rule.description}`} onClick={() => onToggle(rule)}>
              {rule.active ? <Pause size={15} aria-hidden /> : <Play size={15} aria-hidden />}
            </IconButton>
            <IconButton label={`Excluir regra ${rule.description}`} className="hover:text-expense" onClick={() => onDelete(rule)}><Trash2 size={15} aria-hidden /></IconButton>
          </div>
        </li>
      ))}
    </ul>
  );
}
```

`src/pages/transacoes/RecurrenceForm.jsx`:
```jsx
import { useEffect, useState } from 'react';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import Field, { inputClass } from '../../components/ui/Field';
import MoneyInput from '../../components/ui/MoneyInput';
import { validateRecurrence } from '../../domain/transactions';
import { toCents, fromCents } from '../../domain/money';
import { updateRecurrence } from '../../db/recurrences';

export default function RecurrenceForm({ open, rule, categories, onClose }) {
  const [form, setForm] = useState(null);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open || !rule) return;
    setForm({ type: rule.type, cents: toCents(rule.value), categoryId: rule.categoryId, description: rule.description, dayOfMonth: rule.dayOfMonth });
    setErrors({});
  }, [open, rule]);

  if (!form) return null;
  const set = (patch) => setForm((prev) => ({ ...prev, ...patch }));

  async function onSubmit(event) {
    event.preventDefault();
    const found = validateRecurrence(form, categories);
    setErrors(found);
    if (Object.keys(found).length) return;
    setSaving(true);
    try {
      await updateRecurrence(rule.id, { value: fromCents(form.cents), categoryId: form.categoryId, description: form.description.trim(), dayOfMonth: form.dayOfMonth });
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} title="Editar recorrência" onClose={onClose}>
      <form className="space-y-4" onSubmit={onSubmit} noValidate>
        <p className="text-xs text-ink-3">As mudanças valem para os próximos lançamentos. Os já feitos não mudam.</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Valor" htmlFor="rec-value" error={errors.value}>
            <MoneyInput id="rec-value" cents={form.cents} invalid={Boolean(errors.value)} onChange={(cents) => set({ cents })} />
          </Field>
          <Field label="Dia do mês" htmlFor="rec-day" error={errors.dayOfMonth}>
            <input id="rec-day" type="number" min={1} max={31} className={`${inputClass} tabular-nums`} value={form.dayOfMonth} aria-invalid={Boolean(errors.dayOfMonth) || undefined} onChange={(e) => set({ dayOfMonth: Number(e.target.value) })} />
          </Field>
        </div>
        <Field label="Categoria" htmlFor="rec-category" error={errors.categoryId}>
          <select id="rec-category" className={inputClass} value={form.categoryId ?? ''} onChange={(e) => set({ categoryId: e.target.value ? Number(e.target.value) : null })}>
            <option value="">Escolha…</option>
            {categories.filter((c) => c.type === form.type).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </Field>
        <Field label="Descrição" htmlFor="rec-description" error={errors.description}>
          <input id="rec-description" className={inputClass} maxLength={80} value={form.description} onChange={(e) => set({ description: e.target.value })} />
        </Field>
        <div className="flex justify-end gap-2 pt-2">
          <Button onClick={onClose}>Cancelar</Button>
          <Button type="submit" variant="primary" disabled={saving}>Salvar</Button>
        </div>
      </form>
    </Modal>
  );
}
```

- [ ] **Step 4: Página**

`src/pages/transacoes/Transacoes.jsx` (arquivo inteiro):
```jsx
import { useMemo, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Inbox, Plus, Search } from 'lucide-react';
import PageHeader from '../../components/layout/PageHeader';
import MonthSwitcher from '../../components/layout/MonthSwitcher';
import Card, { CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Segmented from '../../components/ui/Segmented';
import EmptyState from '../../components/ui/EmptyState';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { inputClass } from '../../components/ui/Field';
import TransactionForm from './TransactionForm';
import TransactionList from './TransactionList';
import RecurrenceList from './RecurrenceList';
import RecurrenceForm from './RecurrenceForm';
import { useMonthParam } from '../../hooks/useMonthParam';
import { db } from '../../db/db';
import { deleteTransaction } from '../../db/transactions';
import { pauseRecurrence, resumeRecurrence, deleteRecurrence } from '../../db/recurrences';
import { filterTransactions, totalsOf, groupByDay } from '../../domain/transactions';
import { currentMonthKey, monthRange, todayISO } from '../../domain/dates';
import { formatBRL } from '../../domain/money';

const TYPE_FILTERS = [{ value: 'todas', label: 'Todas' }, { value: 'receita', label: 'Receitas' }, { value: 'despesa', label: 'Despesas' }];

function Total({ label, cents, tone }) {
  return (
    <Card className="rounded-kpi p-4">
      <p className="text-[13px] text-ink-2">{label}</p>
      <p className={`mt-1 text-xl font-semibold tabular-nums ${tone}`}>{formatBRL(cents)}</p>
    </Card>
  );
}

export default function Transacoes() {
  const [month, setMonth] = useMonthParam();
  const { start, end } = monthRange(month);
  const [type, setType] = useState('todas');
  const [categoryId, setCategoryId] = useState(null);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [toDelete, setToDelete] = useState(null);
  const [ruleEditing, setRuleEditing] = useState(null);
  const [ruleToDelete, setRuleToDelete] = useState(null);

  const monthTransactions = useLiveQuery(() => db.transactions.where('date').between(start, end, true, true).toArray(), [start, end]);
  const categories = useLiveQuery(() => db.categories.toArray(), []);
  const rules = useLiveQuery(() => db.recurrences.toArray(), []);

  const categoriesById = useMemo(() => new Map((categories ?? []).map((c) => [c.id, c])), [categories]);
  const recurrenceIds = useMemo(() => new Set((rules ?? []).map((r) => r.id)), [rules]);
  const filtered = useMemo(() => filterTransactions(monthTransactions ?? [], { type, categoryId, search }), [monthTransactions, type, categoryId, search]);
  const totals = useMemo(() => totalsOf(filtered), [filtered]);
  const groups = useMemo(() => groupByDay(filtered), [filtered]);
  const categoryOptions = (categories ?? []).filter((c) => type === 'todas' || c.type === type);
  const loading = monthTransactions === undefined || categories === undefined;
  const hasFilters = type !== 'todas' || categoryId !== null || search.trim() !== '';
  const defaultDate = month === currentMonthKey() ? todayISO() : `${month}-01`;

  function openNew() { setEditing(null); setFormOpen(true); }
  function openEdit(transaction) { setEditing(transaction); setFormOpen(true); }

  return (
    <>
      <PageHeader
        title="Transações"
        subtitle="Tudo o que entrou e saiu no mês."
        actions={(
          <>
            <MonthSwitcher month={month} onChange={setMonth} />
            <Button variant="primary" onClick={openNew}><Plus size={16} aria-hidden />Nova transação</Button>
          </>
        )}
      />

      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        <Total label="Entradas" cents={totals.incomeCents} tone="text-brand" />
        <Total label="Saídas" cents={totals.expenseCents} tone="text-expense" />
        <Total label="Saldo" cents={totals.balanceCents} tone={totals.balanceCents < 0 ? 'text-expense' : 'text-ink'} />
      </div>

      <Card className="mt-4 p-4 sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <Segmented label="Filtrar por tipo" options={TYPE_FILTERS} value={type} onChange={(value) => { setType(value); setCategoryId(null); }} />
          <select aria-label="Filtrar por categoria" className={`${inputClass} lg:w-52`} value={categoryId ?? ''} onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : null)}>
            <option value="">Todas as categorias</option>
            {categoryOptions.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <div className="relative lg:ml-auto lg:w-64">
            <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-3" aria-hidden />
            <input type="search" aria-label="Buscar na descrição" placeholder="Buscar descrição" className={`${inputClass} pl-9`} value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>

        <div className="mt-5 min-h-[240px]">
          {loading ? null : groups.length > 0 ? (
            <TransactionList groups={groups} categoriesById={categoriesById} recurrenceIds={recurrenceIds} onEdit={openEdit} onDelete={setToDelete} />
          ) : hasFilters ? (
            <EmptyState icon={Search} title="Nada encontrado" text="Nenhuma transação combina com os filtros deste mês." />
          ) : (
            <EmptyState icon={Inbox} title="Nenhuma transação neste mês" text="Registre receitas e despesas para acompanhar o saldo." action={<Button variant="primary" onClick={openNew}><Plus size={16} aria-hidden />Nova transação</Button>} />
          )}
        </div>
      </Card>

      <Card className="mt-4 p-5">
        <CardTitle title="Recorrências" subtitle="Lançadas automaticamente todo mês" />
        <div className="mt-3">
          {rules && rules.length > 0
            ? <RecurrenceList rules={rules} categoriesById={categoriesById} onEdit={setRuleEditing} onToggle={(rule) => (rule.active ? pauseRecurrence(rule.id) : resumeRecurrence(rule.id))} onDelete={setRuleToDelete} />
            : <p className="py-4 text-sm text-ink-3">Nenhuma regra ainda. Marque “Repetir todo mês” ao criar uma transação.</p>}
        </div>
      </Card>

      {categories && (
        <TransactionForm open={formOpen} transaction={editing} defaultDate={defaultDate} categories={categories} onClose={() => setFormOpen(false)} />
      )}
      {categories && (
        <RecurrenceForm open={ruleEditing !== null} rule={ruleEditing} categories={categories} onClose={() => setRuleEditing(null)} />
      )}
      <ConfirmDialog
        open={toDelete !== null}
        message={toDelete ? `Excluir “${toDelete.description}”? ${toDelete.recurrenceId && recurrenceIds.has(toDelete.recurrenceId) ? 'A regra continua ativa, mas este lançamento não será refeito. ' : ''}Não dá para desfazer.` : ''}
        onCancel={() => setToDelete(null)}
        onConfirm={async () => { await deleteTransaction(toDelete.id); setToDelete(null); }}
      />
      <ConfirmDialog
        open={ruleToDelete !== null}
        title="Excluir recorrência"
        message={ruleToDelete ? `Excluir a regra “${ruleToDelete.description}”? Os lançamentos já feitos continuam.` : ''}
        onCancel={() => setRuleToDelete(null)}
        onConfirm={async () => { await deleteRecurrence(ruleToDelete.id); setRuleToDelete(null); }}
      />
    </>
  );
}
```

- [ ] **Step 5: Verificar**

Run: `npx vitest run` → Expected: PASS
Run: `npx vite build` → Expected: sem erros; `Transacoes-*.js` é um chunk separado.

- [ ] **Step 6: Commit**

```powershell
git add src/pages/transacoes
git commit -m "feat: tela de transacoes com filtros, totais e recorrencias"
```

---

### Task 8: Ponta a ponta, ensaio de reconexão e checkpoint 1 (fim da etapa 2)

**Files:**
- Create (FORA do repositório, no scratchpad da sessão): `e2e/transacoes.cjs`, `e2e/reconexao.cjs`
- Nenhum arquivo do repositório muda, salvo correções encontradas (cada correção vira commit próprio com teste quando for regra de domínio)

**Interfaces:**
- Consumes: app rodando em `http://localhost:5174`; Playwright instalado em `<scratchpad>/extract/node_modules`; Chromium em `%LOCALAPPDATA%\ms-playwright\chromium-1234`; cópia do leveldb real em `<scratchpad>/idb-5174`; dump real em `<scratchpad>/extract/dump-5174.json`

- [ ] **Step 1: Script ponta a ponta com perfil limpo**

`e2e/transacoes.cjs` — usa `chromium.launchPersistentContext` com pasta de perfil nova e `acceptDownloads: true`. Roteiro e verificações:
1. `goto('/')` → vê "Bem-vindo ao ORBE" → clica "Começar do zero" → o cartão some.
2. `goto('/transacoes')` → "Nenhuma transação neste mês".
3. "Nova transação": tipo Receita, digitar `320000` no valor (vira `3.200,00`), categoria Salário, descrição "Pagamento teste", data = dia 5 do mês anterior, marcar "Repetir todo mês", Adicionar.
4. Mês atual: a lista tem "Pagamento teste" com selo "recorrente" se hoje ≥ dia 5; seção Recorrências mostra "todo dia 5".
5. "Nova transação": Despesa, `4590`, Lazer, "Cinema", Adicionar → Saídas = `R$ 45,90`; Saldo = entradas − saídas.
6. Busca "cine" → só "Cinema"; filtro Receitas → só "Pagamento teste".
7. Editar "Cinema" → descrição "Cinema e pipoca" → Salvar → aparece o novo nome.
8. Excluir "Cinema e pipoca" → confirmar → some.
9. Enviar o formulário vazio → vê "Informe um valor maior que zero." e "Escolha uma categoria.".
10. Pausar a regra → selo "pausada"; Retomar → selo some.
11. Exportar (cartão de armazenamento) → arquivo `orbe-backup-AAAA-MM-DD.json` baixado com `app: "ORBE"`, `format: 1`.
12. Limpar todos os dados (`APAGAR`) → Painel volta às boas-vindas → Importar o arquivo baixado → "Substituir dados" → Transações do mês mostra de novo "Pagamento teste".
13. Capturas de `/transacoes` em 320, 768, 1024 e 1440 px de largura.
14. Nenhum `console.error` e nenhuma `pageerror` durante o roteiro; nenhuma rolagem horizontal (`document.documentElement.scrollWidth <= innerWidth`) nas 4 larguras.

Run: `node e2e/transacoes.cjs` com o dev server no ar.
Expected: todas as verificações "OK", zero erros. Qualquer falha → corrigir no código, rodar `npx vitest run`, commitar a correção, rodar o script de novo.

- [ ] **Step 2: Ensaio de reconexão com a cópia do banco real**

`e2e/reconexao.cjs` — mesmo método da extração (perfil novo; primeira abertura cria `Default\IndexedDB\http_localhost_5174.indexeddb.leveldb`; fechar; substituir o conteúdo pela cópia de `<scratchpad>/idb-5174`, sem o `LOCK`; reabrir), mas agora apontando para o **app de verdade** em `http://localhost:5174`:
1. Ler `dump-5174.json` e calcular por script, sem digitar valores: para cada mês com transações, total de receitas e despesas em centavos; contagem de linhas de cada tabela.
2. Abrir `/transacoes?mes=<mês das transações>` e ler os três totais da tela → comparar com o calculado.
3. No navegador, via `indexedDB.open('OrbeFinanceiro')`: versão `30`, `objectStoreNames` com as 8 tabelas, e `count()` de cada uma das 7 tabelas originais igual ao dump.
4. Captura do Painel e de Transações em 1440 px para conferência visual.

Run: `node e2e/reconexao.cjs`
Expected: totais iguais, versão 30, contagens iguais. **Só seguir para o Step 4 se tudo passar.**

- [ ] **Step 3: Push (fim da etapa 2)**

```powershell
git push
```

- [ ] **Step 4: Checkpoint 1 com o usuário**

Com o dev server no ar, abrir no perfil do Chrome que guarda os dados:
```powershell
Start-Process "chrome.exe" -ArgumentList '--profile-directory="Profile 7"', 'http://localhost:5174/transacoes?mes=2026-06'
```
Informar ao usuário o que testar (moldura, visual, Transações com os dados reais de junho, recorrência, backup) e **aguardar retorno** antes de escrever o Plano B.
