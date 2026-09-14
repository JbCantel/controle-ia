# ORBE — Plano B: revisão visual + Painel (etapa 3)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Aplicar a revisão visual pedida no checkpoint 1 (mais contraste, serif encorpada, tamanhos e respiro maiores) e construir o Painel da foto, terminando no checkpoint 2 com o Painel aberto no Chrome real sobre os dados de junho.

**Architecture:** Tokens revisados em `src/index.css` propagam para toda a UI existente. Agregados do Painel em `src/domain/dashboard.js` (puros, TDD). Gráficos Recharts isolados em `src/pages/painel/` e carregados só no chunk lazy do Painel.

**Tech Stack:** as do Plano A + `@fontsource-variable/fraunces` (substitui `@fontsource/instrument-serif`) + Recharts 3.8.1.

**Spec:** `docs/superpowers/specs/2026-09-14-orbe-design.md` — ler **§12** (substitui §8 e partes de §7.2 e §11).

## Global Constraints

- Todas as do Plano A continuam valendo (banco, porta, centavos, sem cor literal, sem dados reais no repo, sem escapes `\uXXXX`, commits em português com `Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>`).
- Tokens exatamente como §12.2; tipografia e tamanhos como §12.3.
- Cores em SVG do Recharts via `var(--color-*)` (nunca hex literal).
- Recharts só pode ser importado dentro de `src/pages/painel/`.
- Gráficos respeitam `prefers-reduced-motion` (sem animação).
- Push para `origin/orbe` ao fim da Task 4.

## Mapa de arquivos

| Arquivo | Responsabilidade |
|---|---|
| `src/index.css`, `src/main.jsx` | tokens revisados, Fraunces |
| `src/components/ui/*`, `src/components/layout/*` | tamanhos e respiro revisados |
| `src/pages/transacoes/*` | tamanhos revisados |
| `src/domain/dashboard.js` (+ teste) | resumo do mês, saldo acumulado, gastos por categoria, recentes, guardado, plural |
| `src/hooks/useReducedMotion.js` | preferência de movimento |
| `src/pages/painel/StatCard.jsx` | indicador com emblema |
| `src/pages/painel/ChartTooltip.jsx` | tooltip escuro dos gráficos |
| `src/pages/painel/BalanceChart.jsx` | área do saldo acumulado |
| `src/pages/painel/CategoryDonut.jsx` | rosca + legenda abaixo |
| `src/pages/painel/RecentList.jsx` | 5 movimentações com barra de cor |
| `src/pages/painel/WelcomeCard.jsx` | boas-vindas (extraído do Painel) |
| `src/pages/painel/Painel.jsx` | página (substitui `src/pages/Painel.jsx`) |

---

### Task 1: Revisão visual global

**Files:**
- Modify: `package.json` (npm), `src/index.css`, `src/main.jsx`, `src/components/ui/{Card,Button,Modal,Field,Segmented,EmptyState,Badge}.jsx`, `src/components/layout/{Brand,Sidebar,PageHeader,DatePill,MonthSwitcher,StorageCard}.jsx`, `src/pages/transacoes/{Transacoes,TransactionList,RecurrenceList}.jsx`

**Interfaces:**
- Produces: token novo `surface-2` (`bg-surface-2`, `hover:bg-surface-2`); famílias `font-serif` = "Fraunces Variable", `font-sans` = "Inter Variable". Nenhuma assinatura de componente muda.

- [ ] **Step 1: Trocar a fonte serif**

```powershell
npm uninstall @fontsource/instrument-serif
npm install @fontsource-variable/fraunces
```
Em `src/main.jsx`, trocar `import '@fontsource/instrument-serif/latin-400.css';` por `import '@fontsource-variable/fraunces/wght.css';` (se o arquivo `wght.css` não existir no pacote instalado, usar `import '@fontsource-variable/fraunces';` e registrar no commit).

- [ ] **Step 2: Tokens revisados**

Em `src/index.css`, substituir o bloco `@theme` inteiro por:
```css
@theme {
  --color-*: initial;
  --color-bg: #070A09;
  --color-surface: #121A17;
  --color-surface-2: #18221E;
  --color-line: rgb(255 255 255 / 0.10);
  --color-brand: #4FD69A;
  --color-brand-soft: #143324;
  --color-brand-line: #2B6C4D;
  --color-ink: #F1F5F3;
  --color-ink-2: #A6B3AE;
  --color-ink-3: #8B9994;
  --color-deco: #4A5652;
  --color-expense: #F07C69;
  --color-income: #5BD3C4;
  --color-amber: #F2BF59;
  --color-chart-purple: #A78BFA;
  --color-chart-orange: #F0A44C;
  --color-chart-cyan: #6FCFD8;
  --color-chart-pink: #F0728F;
  --color-sleep: #8CB8FF;

  --font-serif: "Fraunces Variable", ui-serif, Georgia, serif;
  --font-sans: "Inter Variable", ui-sans-serif, system-ui, sans-serif;

  --radius-card: 16px;
  --radius-kpi: 14px;
}
```
E no `@layer base`, trocar a linha do `body` por:
```css
  body { @apply bg-bg font-sans text-[15px] text-ink antialiased; }
```

- [ ] **Step 3: Componentes de UI**

Substituições exatas de classes (texto antigo → texto novo), uma ocorrência cada:

| Arquivo | Antigo | Novo |
|---|---|---|
| `ui/Card.jsx` | `font-serif text-[22px] leading-tight text-ink` | `font-serif text-xl font-semibold leading-tight tracking-[-0.01em] text-ink` |
| `ui/Card.jsx` | `mt-0.5 text-xs text-ink-3` | `mt-1 text-[13px] text-ink-3` |
| `ui/Button.jsx` | `'h-8 px-3 text-xs' : 'h-10 px-4 text-sm'` | `'h-9 px-3.5 text-[13px]' : 'h-11 px-5 text-[15px]'` |
| `ui/Button.jsx` | `h-9 w-9 shrink-0` | `h-10 w-10 shrink-0` |
| `ui/Modal.jsx` | `rounded-t-card border border-line bg-surface p-5 sm:rounded-card` | `rounded-t-card border border-line bg-surface p-6 sm:rounded-card` |
| `ui/Modal.jsx` | `font-serif text-2xl text-ink` | `font-serif text-2xl font-semibold tracking-[-0.01em] text-ink` |
| `ui/Field.jsx` | `h-10 w-full rounded-xl border border-line bg-bg px-3 text-sm` | `h-11 w-full rounded-xl border border-line bg-surface-2 px-3.5 text-[15px]` |
| `ui/Field.jsx` | `block text-[13px] text-ink-2` | `block text-sm text-ink-2` |
| `ui/Field.jsx` | `text-xs text-expense` | `text-[13px] text-expense` |
| `ui/Field.jsx` | `text-xs text-ink-3` | `text-[13px] text-ink-3` |
| `ui/Segmented.jsx` | `rounded-full border border-line bg-bg p-1` | `rounded-full border border-line bg-surface-2 p-1` |
| `ui/Segmented.jsx` | `h-8 rounded-full px-3 text-xs font-medium` | `h-9 rounded-full px-3.5 text-[13px] font-medium` |
| `ui/EmptyState.jsx` | `font-serif text-xl text-ink` | `font-serif text-2xl font-semibold text-ink` |
| `ui/EmptyState.jsx` | `mt-1 max-w-sm text-sm text-ink-2` | `mt-2 max-w-sm text-[15px] text-ink-2` |
| `ui/Badge.jsx` | `px-2 py-0.5 text-[11px] text-ink-2` | `px-2 py-0.5 text-xs text-ink-2` |

`MoneyInput.jsx`: trocar `pl-10 text-right tabular-nums` por `pl-11 text-right tabular-nums` e `left-3 top-1/2 -translate-y-1/2 text-sm text-ink-3` por `left-3.5 top-1/2 -translate-y-1/2 text-[15px] text-ink-3`.

- [ ] **Step 4: Moldura**

| Arquivo | Antigo | Novo |
|---|---|---|
| `layout/Brand.jsx` | `text-[15px] font-semibold tracking-wide text-ink` | `text-base font-bold tracking-[0.06em] text-ink` |
| `layout/Brand.jsx` | `text-[11px] text-ink-3` | `text-xs text-ink-3` |
| `layout/Sidebar.jsx` | `w-[232px]` | `w-[248px]` |
| `layout/Sidebar.jsx` | `flex h-11 items-center gap-3 rounded-xl border px-3 text-sm` | `flex h-12 items-center gap-3 rounded-xl border px-3.5 text-[15px] font-medium` |
| `layout/PageHeader.jsx` | `mt-2 font-serif text-[34px] leading-none text-ink md:text-[44px]` | `mt-3 font-serif text-[40px] font-semibold leading-[1.05] tracking-[-0.02em] text-ink md:text-[52px]` |
| `layout/PageHeader.jsx` | `mt-2 text-sm text-ink-2` | `mt-3 text-[15px] text-ink-2` |
| `layout/DatePill.jsx` | `h-10 items-center gap-2 rounded-full border border-line px-4 text-[13px] text-ink-2` | `h-11 items-center gap-2 rounded-full border border-line bg-surface px-4 text-sm text-ink-2` |
| `layout/MonthSwitcher.jsx` | `inline-flex h-10 items-center rounded-full border border-line` | `inline-flex h-11 items-center rounded-full border border-line bg-surface px-0.5` |
| `layout/MonthSwitcher.jsx` | `min-w-[9.5rem] text-center text-[13px] text-ink` | `min-w-[10.5rem] text-center text-sm font-medium text-ink` |
| `layout/StorageCard.jsx` | `mt-2 text-[13px] font-medium text-ink` | `mt-2.5 text-sm font-semibold text-ink` |
| `layout/StorageCard.jsx` | `mt-0.5 text-xs text-ink-3` | `mt-1 text-[13px] text-ink-3` |
| `layout/StorageCard.jsx` | `mt-2 w-full rounded-md py-1 text-xs text-ink-3` | `mt-2.5 w-full rounded-md py-1 text-[13px] text-ink-3` |

`App.jsx`: trocar `px-4 pb-28 pt-6 md:px-10 md:pb-12 md:pt-10` por `px-4 pb-28 pt-8 md:px-10 md:pb-14 md:pt-12`.

- [ ] **Step 5: Transações**

| Arquivo | Antigo | Novo |
|---|---|---|
| `Transacoes.jsx` | `px-4 py-3 @xl:block @xl:py-4` | `px-5 py-3.5 @xl:block @xl:px-6 @xl:py-5` |
| `Transacoes.jsx` | `<dt className="text-[13px] text-ink-2">` | `<dt className="text-sm text-ink-2">` |
| `Transacoes.jsx` | `whitespace-nowrap text-lg font-semibold tabular-nums @xl:mt-1 @xl:text-xl` | `whitespace-nowrap text-xl font-bold tabular-nums @xl:mt-1.5 @xl:text-[26px]` |
| `Transacoes.jsx` | `<Card className="@container mt-8 rounded-kpi">` | `<Card className="@container mt-10 rounded-kpi">` |
| `Transacoes.jsx` | `<Card className="mt-4 p-4 sm:p-5">` | `<Card className="mt-5 p-5 sm:p-6">` |
| `Transacoes.jsx` | `<Card className="mt-4 p-5">` | `<Card className="mt-5 p-5 sm:p-6">` |
| `TransactionList.jsx` | `mb-1 text-[13px] text-ink-3` | `mb-1 text-sm font-medium text-ink-3` |
| `TransactionList.jsx` | `hidden h-9 w-9 shrink-0` | `hidden h-10 w-10 shrink-0` |
| `TransactionList.jsx` | `truncate text-sm text-ink` | `truncate text-[15px] font-medium text-ink` |
| `TransactionList.jsx` | `mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-ink-3` | `mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-ink-3` |
| `TransactionList.jsx` | `shrink-0 text-sm font-medium tabular-nums` | `shrink-0 text-[15px] font-semibold tabular-nums` |
| `TransactionList.jsx` | `border-t border-line py-3 first:border-t-0` | `border-t border-line py-3.5 first:border-t-0` |
| `RecurrenceList.jsx` | `shrink-0 text-sm font-medium tabular-nums` | `shrink-0 text-[15px] font-semibold tabular-nums` |
| `RecurrenceList.jsx` | `flex min-w-0 items-center gap-2 text-sm text-ink` | `flex min-w-0 items-center gap-2 text-[15px] font-medium text-ink` |
| `RecurrenceList.jsx` | `mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-ink-3` | `mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-ink-3` |
| `RecurrenceList.jsx` | `border-t border-line py-3 first:border-t-0` | `border-t border-line py-3.5 first:border-t-0` |

`src/pages/Painel.jsx`: trocar `mt-8` por `mt-10` (2 ocorrências).

- [ ] **Step 6: Verificar**

Run: `npx vitest run` → PASS (63). Run: `npx vite build` → sem erros; o CSS gerado contém `--color-surface-2` e `Fraunces`, e não contém `Instrument Serif`.
Run: `node <scratchpad>/e2e/transacoes.cjs` com o dev server no ar → todas as linhas "OK". Conferir as capturas de 1440 e 375: títulos em Fraunces encorpada, cartões nitidamente destacados do fundo, textos secundários legíveis.

- [ ] **Step 7: Commit**

```powershell
git add -A
git commit -m "style: revisao visual com mais contraste, Fraunces nos titulos e mais respiro"
```

---

### Task 2: Agregados do Painel (domínio, TDD)

**Files:**
- Create: `src/domain/dashboard.js`, `src/domain/dashboard.test.js`

**Interfaces:**
- Consumes: `toCents` (money); `monthRange`, `monthsEndingAt`, `monthShort` (dates)
- Produces:
  - `monthSummary(transactions, month) → {incomeCents, expenseCents, balanceCents, incomeCount, expenseCount}` (considera só as datas do mês)
  - `cumulativeBalance(transactions, endMonth, count=6) → [{month, label, cents}]` (`label` = mês abreviado sem ponto, ex. `'jun'`)
  - `expensesByCategory(transactions, month, categories) → [{categoryId, name, color, cents, share}]` (ordem alfabética pt-BR, como a legenda da foto)
  - `recentTransactions(transactions, endDate, limit=5) → transaction[]` (data desc, id desc)
  - `savingsSummary(goals, contributions, endDate) → {totalCents, activeGoals}`
  - `plural(n, singular, pluralForm) → string` (ex. `'1 entrada'`, `'3 entradas'`)

- [ ] **Step 1: Teste (falhando)**

`src/domain/dashboard.test.js`:
```js
import { describe, it, expect } from 'vitest';
import { monthSummary, cumulativeBalance, expensesByCategory, recentTransactions, savingsSummary, plural } from './dashboard';

// Dados fictícios.
const tx = [
  { id: 1, type: 'receita', value: 2500, date: '2026-04-05', categoryId: 10, description: 'Pagamento abril' },
  { id: 2, type: 'despesa', value: 800.5, date: '2026-04-20', categoryId: 1, description: 'Aluguel' },
  { id: 3, type: 'receita', value: 2500, date: '2026-05-05', categoryId: 10, description: 'Pagamento maio' },
  { id: 4, type: 'despesa', value: 0.1, date: '2026-05-06', categoryId: 2, description: 'Bala' },
  { id: 5, type: 'despesa', value: 0.2, date: '2026-05-06', categoryId: 2, description: 'Chiclete' },
  { id: 6, type: 'despesa', value: 120, date: '2026-05-31', categoryId: 1, description: 'Luz' },
  { id: 7, type: 'despesa', value: 99, date: '2026-06-01', categoryId: 3, description: 'Ônibus' },
];
const categories = [
  { id: 1, name: 'Moradia', type: 'despesa', color: '#8b7cf6' },
  { id: 2, name: 'Alimentação', type: 'despesa', color: '#f5a65b' },
  { id: 3, name: 'Transporte', type: 'despesa', color: '#56b4d3' },
  { id: 10, name: 'Salário', type: 'receita', color: '#65d39b' },
];

describe('monthSummary', () => {
  it('soma só o mês pedido, em centavos, com contagens', () => {
    expect(monthSummary(tx, '2026-05')).toEqual({ incomeCents: 250000, expenseCents: 12030, balanceCents: 237970, incomeCount: 1, expenseCount: 3 });
  });
  it('mês sem lançamentos zera tudo', () => {
    expect(monthSummary(tx, '2026-01')).toEqual({ incomeCents: 0, expenseCents: 0, balanceCents: 0, incomeCount: 0, expenseCount: 0 });
  });
});

describe('cumulativeBalance', () => {
  it('acumula até o fim de cada mês, terminando no mês pedido', () => {
    expect(cumulativeBalance(tx, '2026-06', 4)).toEqual([
      { month: '2026-03', label: 'mar', cents: 0 },
      { month: '2026-04', label: 'abr', cents: 169950 },
      { month: '2026-05', label: 'mai', cents: 407920 },
      { month: '2026-06', label: 'jun', cents: 398020 },
    ]);
  });
  it('usa 6 meses por padrão', () => {
    expect(cumulativeBalance(tx, '2026-06').map((p) => p.label)).toEqual(['jan', 'fev', 'mar', 'abr', 'mai', 'jun']);
  });
});

describe('expensesByCategory', () => {
  it('agrupa despesas do mês em ordem alfabética com participação', () => {
    expect(expensesByCategory(tx, '2026-05', categories)).toEqual([
      { categoryId: 2, name: 'Alimentação', color: '#f5a65b', cents: 30, share: 30 / 12030 },
      { categoryId: 1, name: 'Moradia', color: '#8b7cf6', cents: 12000, share: 12000 / 12030 },
    ]);
  });
  it('categoria apagada aparece como "Sem categoria"', () => {
    expect(expensesByCategory(tx, '2026-06', [])).toEqual([
      { categoryId: 3, name: 'Sem categoria', color: null, cents: 9900, share: 1 },
    ]);
  });
  it('mês sem despesas devolve lista vazia', () => {
    expect(expensesByCategory(tx, '2026-01', categories)).toEqual([]);
  });
});

describe('recentTransactions', () => {
  it('pega as mais recentes até a data, desempatando por id', () => {
    expect(recentTransactions(tx, '2026-05-31', 3).map((t) => t.id)).toEqual([6, 5, 4]);
    expect(recentTransactions(tx, '2026-06-30').map((t) => t.id)).toEqual([7, 6, 5, 4, 3]);
  });
});

describe('savingsSummary', () => {
  const goals = [{ id: 1, name: 'Viagem', target: 1000 }, { id: 2, name: 'Notebook', target: 300 }];
  const contributions = [
    { id: 1, goalId: 1, value: 400, date: '2026-05-10' },
    { id: 2, goalId: 2, value: 300, date: '2026-05-11' },
    { id: 3, goalId: 1, value: -50, date: '2026-05-20' },
    { id: 4, goalId: 1, value: 700, date: '2026-07-01' },
  ];
  it('soma aportes e resgates até a data e conta metas ainda não atingidas', () => {
    expect(savingsSummary(goals, contributions, '2026-05-31')).toEqual({ totalCents: 65000, activeGoals: 1 });
    expect(savingsSummary(goals, contributions, '2026-07-31')).toEqual({ totalCents: 135000, activeGoals: 0 });
  });
});

describe('plural', () => {
  it('escolhe singular ou plural', () => {
    expect(plural(1, 'entrada', 'entradas')).toBe('1 entrada');
    expect(plural(0, 'meta ativa', 'metas ativas')).toBe('0 metas ativas');
    expect(plural(3, 'saída', 'saídas')).toBe('3 saídas');
  });
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npx vitest run src/domain/dashboard.test.js` → Expected: FAIL (`Cannot find module './dashboard'`)

- [ ] **Step 3: Implementar**

`src/domain/dashboard.js`:
```js
import { toCents } from './money';
import { monthRange, monthsEndingAt, monthShort } from './dates';

const signed = (t) => (t.type === 'receita' ? 1 : -1) * toCents(t.value);
const byRecency = (a, b) => (a.date === b.date ? b.id - a.id : a.date < b.date ? 1 : -1);

export function monthSummary(transactions, month) {
  const { start, end } = monthRange(month);
  const summary = { incomeCents: 0, expenseCents: 0, balanceCents: 0, incomeCount: 0, expenseCount: 0 };
  for (const t of transactions) {
    if (t.date < start || t.date > end) continue;
    if (t.type === 'receita') { summary.incomeCents += toCents(t.value); summary.incomeCount += 1; }
    else { summary.expenseCents += toCents(t.value); summary.expenseCount += 1; }
  }
  summary.balanceCents = summary.incomeCents - summary.expenseCents;
  return summary;
}

// Saldo acumulado: todas as receitas menos despesas até o último dia de cada mês.
export function cumulativeBalance(transactions, endMonth, count = 6) {
  return monthsEndingAt(endMonth, count).map((month) => {
    const { end } = monthRange(month);
    let cents = 0;
    for (const t of transactions) if (t.date <= end) cents += signed(t);
    return { month, label: monthShort(month).replace('.', ''), cents };
  });
}

export function expensesByCategory(transactions, month, categories) {
  const { start, end } = monthRange(month);
  const totals = new Map();
  for (const t of transactions) {
    if (t.type !== 'despesa' || t.date < start || t.date > end) continue;
    totals.set(t.categoryId, (totals.get(t.categoryId) ?? 0) + toCents(t.value));
  }
  const grand = [...totals.values()].reduce((sum, v) => sum + v, 0);
  const byId = new Map(categories.map((c) => [c.id, c]));
  return [...totals.entries()]
    .map(([categoryId, cents]) => ({
      categoryId,
      name: byId.get(categoryId)?.name ?? 'Sem categoria',
      color: byId.get(categoryId)?.color ?? null,
      cents,
      share: grand ? cents / grand : 0,
    }))
    .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
}

export function recentTransactions(transactions, endDate, limit = 5) {
  return transactions.filter((t) => t.date <= endDate).sort(byRecency).slice(0, limit);
}

export function savingsSummary(goals, contributions, endDate) {
  const savedByGoal = new Map();
  let totalCents = 0;
  for (const c of contributions) {
    if (c.date > endDate) continue;
    const cents = toCents(c.value);
    totalCents += cents;
    savedByGoal.set(c.goalId, (savedByGoal.get(c.goalId) ?? 0) + cents);
  }
  const activeGoals = goals.filter((g) => (savedByGoal.get(g.id) ?? 0) < toCents(g.target)).length;
  return { totalCents, activeGoals };
}

export function plural(n, singular, pluralForm) {
  return `${n} ${n === 1 ? singular : pluralForm}`;
}
```

- [ ] **Step 4: Rodar e ver passar**

Run: `npx vitest run src/domain/dashboard.test.js` → Expected: PASS (10 testes)

- [ ] **Step 5: Commit**

```powershell
git add src/domain/dashboard.js src/domain/dashboard.test.js
git commit -m "feat: agregados do painel (resumo, saldo acumulado, categorias, recentes, guardado)"
```

---

### Task 3: Painel (componentes e página)

**Files:**
- Create: `src/hooks/useReducedMotion.js`, `src/pages/painel/{StatCard,ChartTooltip,BalanceChart,CategoryDonut,RecentList,WelcomeCard,Painel}.jsx`
- Delete: `src/pages/Painel.jsx`
- Modify: `src/App.jsx` (import do Painel)

**Interfaces:**
- Consumes: agregados da Task 2; `useMonthParam`; `PageHeader`, `MonthSwitcher`, `DataModal`; `Card`, `CardTitle`, `Button`, `EmptyState`; `startFresh`; `db`; `formatBRL`, `formatSigned`; `formatDateBR`, `monthRange`, `currentMonthKey`
- Produces:
  - `useReducedMotion() → boolean`
  - `StatCard({icon, tone: 'brand'|'income'|'expense'|'amber', label, value, caption, valueTone?: 'expense'})`
  - `ChartTooltip({active, payload, label, formatter(item) → string})`
  - `BalanceChart({points: [{label, cents}]})`
  - `CategoryDonut({items: [{categoryId, name, color, cents, share}]})`
  - `RecentList({transactions, categoriesById: Map})`
  - `WelcomeCard({onImport})`

- [ ] **Step 1: Hook e peças pequenas**

`src/hooks/useReducedMotion.js`:
```js
import { useEffect, useState } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

export function useReducedMotion() {
  const [reduced, setReduced] = useState(() => window.matchMedia(QUERY).matches);
  useEffect(() => {
    const media = window.matchMedia(QUERY);
    const onChange = () => setReduced(media.matches);
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);
  return reduced;
}
```

`src/pages/painel/StatCard.jsx`:
```jsx
import Card from '../../components/ui/Card';

const TONES = {
  brand: 'bg-brand/12 text-brand ring-brand/25',
  income: 'bg-income/12 text-income ring-income/25',
  expense: 'bg-expense/12 text-expense ring-expense/25',
  amber: 'bg-amber/12 text-amber ring-amber/25',
};

export default function StatCard({ icon: Icon, tone, label, value, caption, valueTone }) {
  return (
    <Card className="@container flex flex-col rounded-kpi p-5 sm:p-6">
      <span className={`flex h-9 w-9 items-center justify-center rounded-full ring-1 ${TONES[tone]}`}>
        <Icon size={18} strokeWidth={1.9} aria-hidden />
      </span>
      <p className="mt-4 text-sm text-ink-2">{label}</p>
      <p className={`mt-1.5 whitespace-nowrap text-[26px] font-bold leading-tight tracking-[-0.01em] tabular-nums @[16rem]:text-[30px] ${valueTone === 'expense' ? 'text-expense' : 'text-ink'}`}>
        {value}
      </p>
      <p className="mt-1.5 text-[13px] text-ink-3">{caption}</p>
    </Card>
  );
}
```

`src/pages/painel/ChartTooltip.jsx`:
```jsx
export default function ChartTooltip({ active, payload, label, formatter }) {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  return (
    <div className="rounded-xl border border-line bg-surface-2 px-3 py-2 text-[13px]">
      <p className="text-ink-3">{label ?? item.name}</p>
      <p className="mt-0.5 font-semibold tabular-nums text-ink">{formatter(item)}</p>
    </div>
  );
}
```

`src/pages/painel/RecentList.jsx`:
```jsx
import { formatDateBR } from '../../domain/dates';
import { formatSigned } from '../../domain/money';

export default function RecentList({ transactions, categoriesById }) {
  return (
    <ul className="mt-4">
      {transactions.map((t) => {
        const category = categoriesById.get(t.categoryId);
        return (
          <li key={t.id} className="flex items-center gap-4 border-t border-line py-3.5 first:border-t-0">
            <span aria-hidden className="h-10 w-[3px] shrink-0 rounded-full bg-deco" style={category?.color ? { backgroundColor: category.color } : undefined} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[15px] font-medium text-ink">{t.description}</p>
              <p className="mt-1 text-[13px] text-ink-3">{category?.name ?? 'Sem categoria'} · {formatDateBR(t.date)}</p>
            </div>
            <p className={`shrink-0 whitespace-nowrap text-[15px] font-semibold tabular-nums ${t.type === 'receita' ? 'text-brand' : 'text-expense'}`}>
              {formatSigned(t.value, t.type)}
            </p>
          </li>
        );
      })}
    </ul>
  );
}
```

`src/pages/painel/WelcomeCard.jsx`:
```jsx
import { Upload } from 'lucide-react';
import Card, { CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { startFresh } from '../../db/backupIO';

export default function WelcomeCard({ onImport }) {
  return (
    <Card className="mt-10 p-6 sm:p-8">
      <CardTitle title="Bem-vindo ao ORBE" subtitle="Seus dados ficam só neste navegador." />
      <p className="mt-4 max-w-prose text-[15px] text-ink-2">Traga um backup exportado antes ou comece do zero com as categorias padrão.</p>
      <div className="mt-6 flex flex-wrap gap-2">
        <Button variant="primary" onClick={onImport}><Upload size={16} aria-hidden />Importar backup</Button>
        <Button onClick={() => startFresh()}>Começar do zero</Button>
      </div>
    </Card>
  );
}
```

- [ ] **Step 2: Gráficos**

`src/pages/painel/BalanceChart.jsx`:
```jsx
import { useId } from 'react';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import ChartTooltip from './ChartTooltip';
import { formatBRL } from '../../domain/money';
import { useReducedMotion } from '../../hooks/useReducedMotion';

export default function BalanceChart({ points }) {
  const gradientId = `saldo-${useId().replace(/:/g, '')}`;
  const reduced = useReducedMotion();
  const data = points.map((p) => ({ label: p.label, cents: p.cents, reais: p.cents / 100 }));
  const summary = points.map((p) => `${p.label} ${formatBRL(p.cents)}`).join('; ');

  return (
    <div role="img" aria-label={`Saldo acumulado nos últimos meses: ${summary}`} className="h-[200px] md:h-[260px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 12, right: 12, bottom: 0, left: 12 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-brand)" stopOpacity={0.35} />
              <stop offset="100%" stopColor="var(--color-brand)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="label" axisLine={false} tickLine={false} interval={0} tickMargin={12} tick={{ fill: 'var(--color-ink-3)', fontSize: 13 }} />
          <YAxis hide domain={[(min) => Math.min(0, min), (max) => Math.max(0, max)]} />
          <Tooltip cursor={{ stroke: 'var(--color-line)', strokeWidth: 1 }} content={<ChartTooltip formatter={(item) => formatBRL(item.payload.cents)} />} />
          <Area
            type="monotone"
            dataKey="reais"
            stroke="var(--color-brand)"
            strokeWidth={2.5}
            fill={`url(#${gradientId})`}
            activeDot={{ r: 5, fill: 'var(--color-brand)', stroke: 'var(--color-surface)', strokeWidth: 2 }}
            isAnimationActive={!reduced}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
```

`src/pages/painel/CategoryDonut.jsx`:
```jsx
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import ChartTooltip from './ChartTooltip';
import { formatBRL } from '../../domain/money';
import { useReducedMotion } from '../../hooks/useReducedMotion';

const percent = (share) => `${Math.round(share * 100)}%`;

export default function CategoryDonut({ items }) {
  const reduced = useReducedMotion();
  const data = items.map((i) => ({ ...i, reais: i.cents / 100 }));
  const summary = items.map((i) => `${i.name} ${percent(i.share)}`).join('; ');

  return (
    <div>
      <div role="img" aria-label={`Gastos por categoria: ${summary}`} className="mx-auto h-[220px] w-full max-w-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="reais"
              nameKey="name"
              innerRadius="64%"
              outerRadius="94%"
              startAngle={90}
              endAngle={-270}
              paddingAngle={items.length > 1 ? 2 : 0}
              stroke="none"
              isAnimationActive={!reduced}
            >
              {data.map((i) => <Cell key={i.categoryId} fill={i.color ?? 'var(--color-deco)'} />)}
            </Pie>
            <Tooltip content={<ChartTooltip formatter={(item) => `${formatBRL(item.payload.cents)} · ${percent(item.payload.share)}`} />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="mt-5 flex flex-wrap justify-center gap-x-5 gap-y-2">
        {items.map((i) => (
          <li key={i.categoryId} className="flex items-center gap-2 text-sm text-ink-2">
            <span aria-hidden className="h-2.5 w-2.5 rounded-full bg-deco" style={i.color ? { backgroundColor: i.color } : undefined} />
            {i.name}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

- [ ] **Step 3: Página**

`src/pages/painel/Painel.jsx`:
```jsx
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { ArrowRight, CircleDollarSign, Inbox, PiggyBank, TrendingDown, TrendingUp } from 'lucide-react';
import PageHeader from '../../components/layout/PageHeader';
import MonthSwitcher from '../../components/layout/MonthSwitcher';
import DataModal from '../../components/layout/DataModal';
import Card, { CardTitle } from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import StatCard from './StatCard';
import BalanceChart from './BalanceChart';
import CategoryDonut from './CategoryDonut';
import RecentList from './RecentList';
import WelcomeCard from './WelcomeCard';
import { useMonthParam } from '../../hooks/useMonthParam';
import { db } from '../../db/db';
import { cumulativeBalance, expensesByCategory, monthSummary, plural, recentTransactions, savingsSummary } from '../../domain/dashboard';
import { currentMonthKey, monthRange } from '../../domain/dates';
import { formatBRL } from '../../domain/money';

export default function Painel() {
  const [month, setMonth] = useMonthParam();
  const { end } = monthRange(month);
  const [importOpen, setImportOpen] = useState(false);

  const data = useLiveQuery(async () => {
    const transactions = await db.transactions.where('date').belowOrEqual(end).toArray();
    const categories = await db.categories.toArray();
    const goals = await db.goals.toArray();
    const contributions = await db.contributions.where('date').belowOrEqual(end).toArray();
    const totalTransactions = await db.transactions.count();
    return { transactions, categories, goals, contributions, totalTransactions };
  }, [end]);

  const view = useMemo(() => data && {
    summary: monthSummary(data.transactions, month),
    balance: cumulativeBalance(data.transactions, month),
    byCategory: expensesByCategory(data.transactions, month, data.categories),
    recent: recentTransactions(data.transactions, end),
    savings: savingsSummary(data.goals, data.contributions, end),
    categoriesById: new Map(data.categories.map((c) => [c.id, c])),
  }, [data, month, end]);

  const isEmpty = data && data.categories.length === 0 && data.totalTransactions === 0;
  const s = view?.summary;

  return (
    <>
      <PageHeader title="Visão geral" subtitle="Seu dinheiro, com contexto." actions={<MonthSwitcher month={month} onChange={setMonth} />} />

      {!view ? (
        <div className="mt-10 min-h-[640px]" aria-busy="true" />
      ) : isEmpty ? (
        <WelcomeCard onImport={() => setImportOpen(true)} />
      ) : (
        <>
          <div className="@container mt-10">
            <div className="grid gap-5 @lg:grid-cols-2 @5xl:grid-cols-4">
              <StatCard icon={CircleDollarSign} tone="brand" label="Saldo do mês" value={formatBRL(s.balanceCents)} valueTone={s.balanceCents < 0 ? 'expense' : undefined} caption="Receitas menos despesas" />
              <StatCard icon={TrendingUp} tone="income" label="Receitas" value={formatBRL(s.incomeCents)} caption={`${plural(s.incomeCount, 'entrada', 'entradas')} no mês`} />
              <StatCard icon={TrendingDown} tone="expense" label="Despesas" value={formatBRL(s.expenseCents)} caption={`${plural(s.expenseCount, 'saída', 'saídas')} no mês`} />
              <StatCard icon={PiggyBank} tone="amber" label="Total guardado" value={formatBRL(view.savings.totalCents)} caption={plural(view.savings.activeGoals, 'meta ativa', 'metas ativas')} />
            </div>
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
            <Card className="p-5 sm:p-6">
              <CardTitle title="Evolução do saldo" subtitle="Últimos seis meses" />
              <div className="mt-6"><BalanceChart points={view.balance} /></div>
            </Card>
            <Card className="p-5 sm:p-6">
              <CardTitle title="Gastos por categoria" subtitle="Distribuição deste mês" />
              <div className="mt-6">
                {view.byCategory.length > 0
                  ? <CategoryDonut items={view.byCategory} />
                  : <EmptyState icon={Inbox} title="Nenhuma despesa" text="Não há despesas neste mês." />}
              </div>
            </Card>
          </div>

          <Card className="mt-5 p-5 sm:p-6">
            <CardTitle
              title="Movimentações recentes"
              subtitle="Os últimos cinco lançamentos"
              action={(
                <Link
                  to={month === currentMonthKey() ? '/transacoes' : `/transacoes?mes=${month}`}
                  className="inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-[13px] font-medium text-brand transition-colors duration-150 hover:bg-brand/10"
                >
                  Ver todas<ArrowRight size={14} aria-hidden />
                </Link>
              )}
            />
            {view.recent.length > 0
              ? <RecentList transactions={view.recent} categoriesById={view.categoriesById} />
              : <p className="py-6 text-[15px] text-ink-3">Nenhum lançamento até este mês.</p>}
          </Card>
        </>
      )}

      {/* Fora dos cartões: a importação preenche o banco e a boas-vindas some, mas o modal precisa continuar aberto. */}
      <DataModal open={importOpen} mode="import" onClose={() => setImportOpen(false)} />
    </>
  );
}
```

`src/App.jsx`: trocar `const Painel = lazy(() => import('./pages/Painel'));` por `const Painel = lazy(() => import('./pages/painel/Painel'));`.

```powershell
git rm -q src/pages/Painel.jsx
```

- [ ] **Step 4: Verificar**

Run: `npx vitest run` → PASS. Run: `npx vite build` → sem erros; `recharts` só aparece no chunk `Painel-*.js` (conferir com `Select-String -Path dist/assets/index-*.js -Pattern 'recharts'` → sem resultado); JS inicial < 150 KB gzip.

- [ ] **Step 5: Commit**

```powershell
git add -A
git commit -m "feat: painel com indicadores, evolucao do saldo, gastos por categoria e movimentacoes recentes"
```

---

### Task 4: Verificação, comparação com a foto e checkpoint 2

**Files:**
- Create (FORA do repositório, no scratchpad): `e2e/painel.cjs`
- Modify (scratchpad): `e2e/reconexao.cjs` (acrescentar verificação do Painel)

**Interfaces:**
- Consumes: dev server em `http://localhost:5174`; Playwright e Chromium do Plano A; `dump-5174.json`; cópia do leveldb real

- [ ] **Step 1: Ponta a ponta do Painel com dados fictícios**

`e2e/painel.cjs` (perfil limpo):
1. Montar em memória um backup formato 1 **fictício**:
   - 4 categorias (2 despesa, 2 receita) com cores da paleta;
   - para cada um dos 6 meses terminando no mês atual: 1 receita no dia 5 e 2 despesas nos dias 10 e 12;
   - 1 meta com 2 aportes.

   Gravar em arquivo temporário.
2. `goto('/')` → "Bem-vindo ao ORBE" → "Importar backup" → `setInputFiles` → "Substituir dados" → "Backup importado." → Esc.
3. Calcular no próprio script (sem importar o código do app) o saldo, as receitas e as despesas do mês atual, o total guardado e a contagem de metas ativas; comparar com o texto dos 4 indicadores.
4. Verificar que:
   - o gráfico de linha tem `path` com `stroke` = `var(--color-brand)`;
   - o eixo mostra 6 rótulos de mês;
   - a rosca tem uma fatia por categoria de despesa do mês;
   - a legenda está em ordem alfabética;
   - "Movimentações recentes" tem 5 linhas.
5. Clicar "Ver todas" → chega em `/transacoes`.
6. Voltar ao Painel, trocar para o mês anterior pelo seletor → os indicadores mudam para os valores daquele mês.
7. Capturas em 375, 768, 1024, 1280 e 1440; nenhuma rolagem horizontal; nenhum valor de indicador com quebra de linha (altura do elemento ≤ 1,6× a altura da fonte); zero erros no console.

Run: `node e2e/painel.cjs` → todas as linhas "OK".

- [ ] **Step 2: Reconexão no Painel**

Em `e2e/reconexao.cjs`, depois das verificações atuais:
- abrir `/?mes=<mês com dados>`;
- comparar os 4 indicadores com os valores calculados do dump (receitas e despesas do mês, saldo, soma de `contributions` até o fim do mês);
- capturar `reconexao-painel-<mês>.png` em 1440×900.

Run: `node e2e/reconexao.cjs` → todas "OK".

- [ ] **Step 3: Comparar com a foto**

Abrir `reconexao-painel-<mês>.png` e a foto de referência lado a lado. Listar as diferenças de:
- disposição (linha de indicadores, gráficos lado a lado, movimentações embaixo);
- hierarquia tipográfica;
- contraste de cartões;
- legenda da rosca;
- barra de cor nas movimentações.

Corrigir o que divergir sem contrariar o §12. Cada correção vira commit `style:` e os scripts rodam de novo.

- [ ] **Step 4: Push e checkpoint 2**

```powershell
git push
Start-Process "chrome.exe" -ArgumentList '--profile-directory="Profile 7"', 'http://localhost:5174/?mes=<mês com dados>'
```
Mostrar ao usuário a lista de diferenças corrigidas e aguardar retorno sobre o visual antes de escrever o Plano C (Categorias, Orçamento, Metas, Hábitos).
