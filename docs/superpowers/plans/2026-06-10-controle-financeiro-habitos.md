# Controle Financeiro e Hábitos — Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** App web pessoal (sem backend) com duas áreas separadas — Finanças (transações, orçamento, metas, dashboard) e Hábitos (streaks, calendário) — persistido no IndexedDB.

**Architecture:** SPA React + Vite com React Router. Dados no Dexie.js com `useLiveQuery` (a UI reage sozinha às mudanças no banco). Lógica de negócio (dinheiro, datas, streaks, resumo) isolada em funções puras em `src/utils/`, testadas com Vitest. Páginas em `src/pages/`, uma por rota. Valores monetários sempre em **centavos (inteiro)**; datas armazenadas como string ISO `yyyy-mm-dd`.

**Tech Stack:** React 18, Vite, Tailwind CSS v4 (plugin Vite), Recharts, Dexie.js + dexie-react-hooks, React Router, Vitest.

**Spec:** `docs/superpowers/specs/2026-06-10-controle-financeiro-habitos-design.md`

---

## Mapa de arquivos

| Arquivo | Responsabilidade |
|---|---|
| `package.json`, `vite.config.js`, `index.html`, `.gitignore` | Configuração do projeto |
| `src/main.jsx` | Bootstrap React + Router |
| `src/index.css` | Tailwind + dark mode + base |
| `src/App.jsx` | Layout (sidebar desktop / bottom-nav mobile) + rotas |
| `src/db/db.js` | Schema Dexie (8 tabelas) |
| `src/db/seed.js` | Dados de exemplo (populate na 1ª execução) |
| `src/hooks/useTheme.js` | Tema claro/escuro persistido |
| `src/utils/money.js` (+`.test.js`) | R$ ↔ centavos |
| `src/utils/dates.js` (+`.test.js`) | Datas pt-BR, meses |
| `src/utils/streaks.js` (+`.test.js`) | Streak atual e recorde |
| `src/utils/summary.js` (+`.test.js`) | Frases do Resumo Inteligente |
| `src/components/Card.jsx`, `Modal.jsx`, `ConfirmDialog.jsx`, `ProgressBar.jsx`, `MonthPicker.jsx` | Componentes reutilizáveis |
| `src/pages/Dashboard.jsx`, `Transacoes.jsx`, `Orcamento.jsx`, `Metas.jsx`, `Categorias.jsx`, `Habitos.jsx`, `Ajustes.jsx` | Uma página por rota |

Convenções fixadas aqui e usadas em TODAS as tarefas:

- `transactions`: `{ id, type: 'receita'|'despesa', amount: int centavos, date: 'yyyy-mm-dd', categoryId: number, description: string }`
- `categories`: `{ id, name, type: 'receita'|'despesa', color: '#hex', icon: emoji }`
- `budgets`: `{ id, categoryId, monthlyLimit: int centavos }`
- `goals`: `{ id, name, targetAmount: int centavos, createdAt: 'yyyy-mm-dd' }`
- `contributions`: `{ id, goalId, amount: int centavos, date: 'yyyy-mm-dd' }`
- `habits`: `{ id, name, icon, color, frequency: 'daily' | number[] (0=dom..6=sáb), archived: false, createdAt: 'yyyy-mm-dd' }`
- `habitLogs`: `{ id, habitId, date }` — existir = feito
- `settings`: `{ key, value }`
- "Mês" como chave = `'yyyy-mm'` (ex: `'2026-06'`).

---

### Task 1: Scaffolding do projeto

**Files:**
- Create: `package.json`, `.gitignore`, `vite.config.js`, `index.html`, `src/main.jsx`, `src/index.css`, `src/App.jsx` (placeholder)

- [ ] **Step 1: Criar `package.json`**

```json
{
  "name": "controle-pessoal",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest run"
  }
}
```

- [ ] **Step 2: Instalar dependências**

```powershell
npm install react react-dom react-router-dom dexie dexie-react-hooks recharts
npm install -D vite @vitejs/plugin-react tailwindcss @tailwindcss/vite vitest
```

Esperado: `node_modules/` criado sem erros (warnings de peer deps são OK).

- [ ] **Step 3: Criar `.gitignore`**

```
node_modules
dist
*.local
```

- [ ] **Step 4: Criar `vite.config.js`**

```js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
});
```

- [ ] **Step 5: Criar `index.html`**

```html
<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Controle Pessoal — Finanças e Hábitos</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

- [ ] **Step 6: Criar `src/index.css`** (Tailwind v4: dark mode por classe via `@custom-variant`)

```css
@import "tailwindcss";

@custom-variant dark (&:where(.dark, .dark *));

body {
  @apply bg-slate-100 text-slate-900 dark:bg-slate-900 dark:text-slate-100 antialiased;
}
```

- [ ] **Step 7: Criar `src/main.jsx`**

```jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
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

- [ ] **Step 8: Criar `src/App.jsx` placeholder**

```jsx
export default function App() {
  return <h1 className="p-8 text-2xl font-bold">Controle Pessoal 🚧</h1>;
}
```

- [ ] **Step 9: Verificar que roda**

Run: `npm run dev` (em background) e abrir `http://localhost:5173`.
Esperado: título "Controle Pessoal 🚧" com fundo cinza claro (Tailwind funcionando).

- [ ] **Step 10: Commit**

```powershell
git add -A; git commit -m "chore: scaffolding Vite + React + Tailwind v4"
```

---

### Task 2: `utils/money.js` (TDD)

**Files:**
- Create: `src/utils/money.js`
- Test: `src/utils/money.test.js`

- [ ] **Step 1: Escrever testes que falham**

```js
import { describe, it, expect } from 'vitest';
import { formatBRL, parseBRL } from './money';

describe('formatBRL', () => {
  it('formata centavos em R$ com vírgula e milhar', () => {
    expect(formatBRL(123456)).toBe('R$ 1.234,56');
  });
  it('formata zero', () => {
    expect(formatBRL(0)).toBe('R$ 0,00');
  });
  it('formata negativos', () => {
    expect(formatBRL(-5000)).toBe('-R$ 50,00');
  });
});

describe('parseBRL', () => {
  it('parseia formato brasileiro completo', () => {
    expect(parseBRL('1.234,56')).toBe(123456);
  });
  it('parseia número simples sem vírgula', () => {
    expect(parseBRL('50')).toBe(5000);
  });
  it('parseia com prefixo R$', () => {
    expect(parseBRL('R$ 10,00')).toBe(1000);
  });
  it('retorna NaN para entrada inválida', () => {
    expect(parseBRL('abc')).toBeNaN();
    expect(parseBRL('')).toBeNaN();
    expect(parseBRL(null)).toBeNaN();
  });
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npx vitest run src/utils/money.test.js`
Esperado: FAIL — "Cannot find module './money'" ou equivalente.

- [ ] **Step 3: Implementar `src/utils/money.js`**

```js
// Dinheiro sempre em centavos (inteiro). Conversão só na borda da UI.

export function formatBRL(cents) {
  return (cents / 100)
    .toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
    .replace(/\u00a0/g, ' '); // Intl usa espaço não-quebrável; normaliza p/ espaço comum
}

export function parseBRL(input) {
  if (typeof input !== 'string') return NaN;
  const clean = input.replace(/[R$\s]/g, '').replace(/\./g, '').replace(',', '.');
  if (clean === '' || isNaN(Number(clean))) return NaN;
  return Math.round(Number(clean) * 100);
}
```

- [ ] **Step 4: Rodar e ver passar**

Run: `npx vitest run src/utils/money.test.js` — Esperado: 7 passed.

- [ ] **Step 5: Commit**

```powershell
git add src/utils; git commit -m "feat: utilitario de dinheiro R$ <-> centavos (TDD)"
```

---

### Task 3: `utils/dates.js` (TDD)

**Files:**
- Create: `src/utils/dates.js`
- Test: `src/utils/dates.test.js`

- [ ] **Step 1: Escrever testes que falham**

```js
import { describe, it, expect } from 'vitest';
import { formatDateBR, monthKey, addMonths, addDays, weekdayOf, lastNMonths, monthLabel, daysInMonth } from './dates';

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
  });
  it('rótulo do mês em pt-BR', () => {
    expect(monthLabel('2026-06')).toBe('junho de 2026');
  });
  it('dias no mês', () => {
    expect(daysInMonth('2026-02')).toBe(28);
    expect(daysInMonth('2026-06')).toBe(30);
  });
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npx vitest run src/utils/dates.test.js` — Esperado: FAIL (módulo não existe).

- [ ] **Step 3: Implementar `src/utils/dates.js`**

```js
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
```

- [ ] **Step 4: Rodar e ver passar**

Run: `npx vitest run src/utils/dates.test.js` — Esperado: 8 passed.

- [ ] **Step 5: Commit**

```powershell
git add src/utils; git commit -m "feat: utilitario de datas pt-BR (TDD)"
```

---

### Task 4: Schema do banco (Dexie)

**Files:**
- Create: `src/db/db.js`

- [ ] **Step 1: Criar `src/db/db.js`**

```js
import Dexie from 'dexie';

export const db = new Dexie('controle-pessoal');

db.version(1).stores({
  transactions: '++id, type, date, categoryId',
  categories: '++id, type',
  budgets: '++id, &categoryId',
  goals: '++id',
  contributions: '++id, goalId, date',
  habits: '++id',
  habitLogs: '++id, habitId, date, [habitId+date]',
  settings: 'key',
});

export const ALL_TABLES = [
  'transactions', 'categories', 'budgets', 'goals',
  'contributions', 'habits', 'habitLogs', 'settings',
];
```

- [ ] **Step 2: Verificação rápida**

Run: `npm run build` — Esperado: build sem erros (o schema é validado em runtime, mas o build pega erros de sintaxe/import).

- [ ] **Step 3: Commit**

```powershell
git add src/db; git commit -m "feat: schema Dexie com 8 tabelas"
```

---

### Task 5: Layout, navegação e componentes compartilhados

**Files:**
- Create: `src/hooks/useTheme.js`, `src/components/Card.jsx`, `src/components/Modal.jsx`, `src/components/ConfirmDialog.jsx`, `src/components/ProgressBar.jsx`, `src/components/MonthPicker.jsx`
- Create: `src/pages/Dashboard.jsx`, `Transacoes.jsx`, `Orcamento.jsx`, `Metas.jsx`, `Categorias.jsx`, `Habitos.jsx`, `Ajustes.jsx` (placeholders)
- Modify: `src/App.jsx`

- [ ] **Step 1: Criar `src/hooks/useTheme.js`**

```js
import { useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';

export function useTheme() {
  const saved = useLiveQuery(async () => (await db.settings.get('theme'))?.value, []);

  const theme = saved
    ?? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  async function setTheme(value) {
    await db.settings.put({ key: 'theme', value });
  }

  return [theme, setTheme];
}
```

- [ ] **Step 2: Criar `src/components/Card.jsx`**

```jsx
export default function Card({ children, className = '' }) {
  return (
    <div className={`rounded-2xl bg-white p-4 shadow-sm dark:bg-slate-800 ${className}`}>
      {children}
    </div>
  );
}
```

- [ ] **Step 3: Criar `src/components/Modal.jsx`**

```jsx
export default function Modal({ open, title, onClose, children }) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full overflow-y-auto rounded-t-2xl bg-white p-5 shadow-xl sm:max-w-md sm:rounded-2xl dark:bg-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="rounded-lg px-2 py-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-200"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Criar `src/components/ConfirmDialog.jsx`**

```jsx
import Modal from './Modal';

export default function ConfirmDialog({ open, title = 'Confirmar exclusão', message, confirmLabel = 'Excluir', onConfirm, onCancel }) {
  return (
    <Modal open={open} title={title} onClose={onCancel}>
      <p className="mb-5 text-sm text-slate-600 dark:text-slate-300">{message}</p>
      <div className="flex justify-end gap-2">
        <button
          onClick={onCancel}
          className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600"
        >
          Cancelar
        </button>
        <button
          onClick={onConfirm}
          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
```

- [ ] **Step 5: Criar `src/components/ProgressBar.jsx`**

```jsx
// Barra com cores automáticas: verde < 80%, âmbar 80–100%, vermelho > 100%
export default function ProgressBar({ value, max }) {
  const ratio = max > 0 ? value / max : 0;
  const width = Math.min(ratio * 100, 100);
  const color = ratio > 1 ? 'bg-red-500' : ratio >= 0.8 ? 'bg-amber-500' : 'bg-emerald-500';
  return (
    <div className="h-2.5 w-full rounded-full bg-slate-200 dark:bg-slate-700">
      <div className={`h-2.5 rounded-full transition-all ${color}`} style={{ width: `${width}%` }} />
    </div>
  );
}
```

- [ ] **Step 6: Criar `src/components/MonthPicker.jsx`**

```jsx
import { addMonths, monthLabel } from '../utils/dates';

export default function MonthPicker({ month, onChange }) {
  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => onChange(addMonths(month, -1))}
        aria-label="Mês anterior"
        className="rounded-lg px-2.5 py-1.5 hover:bg-slate-200 dark:hover:bg-slate-700"
      >
        ◀
      </button>
      <span className="min-w-36 text-center text-sm font-semibold capitalize">{monthLabel(month)}</span>
      <button
        onClick={() => onChange(addMonths(month, 1))}
        aria-label="Próximo mês"
        className="rounded-lg px-2.5 py-1.5 hover:bg-slate-200 dark:hover:bg-slate-700"
      >
        ▶
      </button>
    </div>
  );
}
```

- [ ] **Step 7: Criar as 7 páginas placeholder** (mesmo conteúdo, mudando o nome — exemplo para `src/pages/Dashboard.jsx`; repetir para Transacoes, Orcamento, Metas, Categorias, Habitos, Ajustes):

```jsx
export default function Dashboard() {
  return <h1 className="text-2xl font-bold">Dashboard</h1>;
}
```

- [ ] **Step 8: Reescrever `src/App.jsx`** com layout e rotas

```jsx
import { NavLink, Route, Routes } from 'react-router-dom';
import { useTheme } from './hooks/useTheme';
import Dashboard from './pages/Dashboard';
import Transacoes from './pages/Transacoes';
import Orcamento from './pages/Orcamento';
import Metas from './pages/Metas';
import Categorias from './pages/Categorias';
import Habitos from './pages/Habitos';
import Ajustes from './pages/Ajustes';

const NAV = [
  { to: '/', label: 'Dashboard', icon: '📊' },
  { to: '/transacoes', label: 'Transações', icon: '💸' },
  { to: '/orcamento', label: 'Orçamento', icon: '🎯' },
  { to: '/metas', label: 'Metas', icon: '🏆' },
  { to: '/categorias', label: 'Categorias', icon: '🏷️' },
  { to: '/habitos', label: 'Hábitos', icon: '✅' },
  { to: '/ajustes', label: 'Ajustes', icon: '⚙️' },
];

function linkClasses(isActive, mobile) {
  const base = mobile
    ? 'flex flex-col items-center gap-0.5 px-1 py-1.5 text-[10px] font-medium rounded-lg min-w-0 flex-1'
    : 'flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium';
  const state = isActive
    ? 'bg-indigo-600 text-white'
    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800';
  return `${base} ${state}`;
}

export default function App() {
  useTheme();
  return (
    <div className="min-h-screen md:flex">
      {/* Sidebar — desktop */}
      <aside className="hidden border-r border-slate-200 bg-white p-4 md:flex md:w-60 md:flex-col md:gap-1 dark:border-slate-800 dark:bg-slate-950">
        <h1 className="mb-5 px-2 text-lg font-bold">💼 Controle Pessoal</h1>
        {NAV.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.to === '/'}
            className={({ isActive }) => linkClasses(isActive, false)}>
            <span aria-hidden>{item.icon}</span> {item.label}
          </NavLink>
        ))}
      </aside>

      {/* Conteúdo */}
      <main className="mx-auto w-full max-w-5xl flex-1 p-4 pb-24 md:p-8">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/transacoes" element={<Transacoes />} />
          <Route path="/orcamento" element={<Orcamento />} />
          <Route path="/metas" element={<Metas />} />
          <Route path="/categorias" element={<Categorias />} />
          <Route path="/habitos" element={<Habitos />} />
          <Route path="/ajustes" element={<Ajustes />} />
        </Routes>
      </main>

      {/* Bottom nav — mobile */}
      <nav className="fixed inset-x-0 bottom-0 z-40 flex justify-around gap-0.5 border-t border-slate-200 bg-white px-1 py-1 md:hidden dark:border-slate-800 dark:bg-slate-950">
        {NAV.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.to === '/'}
            className={({ isActive }) => linkClasses(isActive, true)}>
            <span className="text-base" aria-hidden>{item.icon}</span>
            <span className="truncate">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
```

- [ ] **Step 9: Verificar no navegador**

Com `npm run dev`: navegar pelas 7 rotas no menu lateral. Reduzir a janela (F12 → mobile): sidebar some, barra inferior aparece. Item ativo fica destacado em índigo.

- [ ] **Step 10: Commit**

```powershell
git add -A; git commit -m "feat: layout responsivo, navegacao e componentes base"
```

---

### Task 6: Página Categorias (CRUD)

**Files:**
- Modify: `src/pages/Categorias.jsx` (substituir placeholder)

- [ ] **Step 1: Implementar `src/pages/Categorias.jsx`**

```jsx
import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import Card from '../components/Card';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';

const NEW_FORM = { name: '', type: 'despesa', icon: '🏷️', color: '#6366f1' };

export default function Categorias() {
  const categories = useLiveQuery(() => db.categories.toArray(), []) ?? [];
  const [form, setForm] = useState(null);      // null = modal fechado
  const [toDelete, setToDelete] = useState(null);
  const [error, setError] = useState('');

  async function save(e) {
    e.preventDefault();
    const name = form.name.trim();
    if (!name) return setError('Dê um nome para a categoria.');
    if (form.id) {
      await db.categories.update(form.id, { name, icon: form.icon, color: form.color });
    } else {
      await db.categories.add({ name, type: form.type, icon: form.icon, color: form.color });
    }
    setForm(null);
    setError('');
  }

  // Excluir: transações órfãs vão para "Outros" (criada se não existir). Histórico nunca se perde.
  async function remove() {
    const cat = toDelete;
    await db.transaction('rw', db.categories, db.transactions, db.budgets, async () => {
      const count = await db.transactions.where('categoryId').equals(cat.id).count();
      if (count > 0) {
        let outros = await db.categories
          .where('type').equals(cat.type)
          .filter((c) => c.name === 'Outros')
          .first();
        if (!outros) {
          const id = await db.categories.add({ name: 'Outros', type: cat.type, icon: '📦', color: '#94a3b8' });
          outros = { id };
        }
        await db.transactions.where('categoryId').equals(cat.id).modify({ categoryId: outros.id });
      }
      await db.budgets.where('categoryId').equals(cat.id).delete();
      await db.categories.delete(cat.id);
    });
    setToDelete(null);
  }

  const groups = [
    ['Despesas', categories.filter((c) => c.type === 'despesa')],
    ['Receitas', categories.filter((c) => c.type === 'receita')],
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Categorias</h1>
        <button
          onClick={() => setForm({ ...NEW_FORM })}
          className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          + Nova categoria
        </button>
      </div>

      {groups.map(([label, list]) => (
        <Card key={label}>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</h2>
          {list.length === 0 && <p className="text-sm text-slate-400">Nenhuma categoria ainda.</p>}
          <ul className="divide-y divide-slate-100 dark:divide-slate-700">
            {list.map((cat) => (
              <li key={cat.id} className="flex items-center gap-3 py-2.5">
                <span
                  className="flex h-9 w-9 items-center justify-center rounded-full text-lg"
                  style={{ backgroundColor: `${cat.color}22` }}
                >
                  {cat.icon}
                </span>
                <span className="flex-1 font-medium">{cat.name}</span>
                <button
                  onClick={() => setForm({ ...cat })}
                  className="rounded-lg px-2 py-1 text-sm text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  Editar
                </button>
                <button
                  onClick={() => setToDelete(cat)}
                  disabled={cat.name === 'Outros'}
                  title={cat.name === 'Outros' ? 'Categoria padrão, não pode ser excluída' : undefined}
                  className="rounded-lg px-2 py-1 text-sm text-red-500 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-30 dark:hover:bg-red-900/30"
                >
                  Excluir
                </button>
              </li>
            ))}
          </ul>
        </Card>
      ))}

      <Modal open={form !== null} title={form?.id ? 'Editar categoria' : 'Nova categoria'} onClose={() => setForm(null)}>
        {form && (
          <form onSubmit={save} className="space-y-3">
            <label className="block text-sm font-medium">
              Nome
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                autoFocus
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-900"
              />
            </label>
            {!form.id && (
              <label className="block text-sm font-medium">
                Tipo
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-900"
                >
                  <option value="despesa">Despesa</option>
                  <option value="receita">Receita</option>
                </select>
              </label>
            )}
            <div className="flex gap-3">
              <label className="block flex-1 text-sm font-medium">
                Ícone (emoji)
                <input
                  value={form.icon}
                  onChange={(e) => setForm({ ...form, icon: e.target.value })}
                  maxLength={4}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-center dark:border-slate-600 dark:bg-slate-900"
                />
              </label>
              <label className="block text-sm font-medium">
                Cor
                <input
                  type="color"
                  value={form.color}
                  onChange={(e) => setForm({ ...form, color: e.target.value })}
                  className="mt-1 h-10 w-16 cursor-pointer rounded-lg border border-slate-300 dark:border-slate-600"
                />
              </label>
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <button type="submit" className="w-full rounded-xl bg-indigo-600 py-2.5 font-semibold text-white hover:bg-indigo-700">
              Salvar
            </button>
          </form>
        )}
      </Modal>

      <ConfirmDialog
        open={toDelete !== null}
        message={`Excluir a categoria "${toDelete?.name}"? Transações existentes serão movidas para "Outros".`}
        onConfirm={remove}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
```

- [ ] **Step 2: Verificar no navegador**

Em `/categorias`: criar categoria "Teste" (despesa), editar nome e cor, excluir. Conferir que recarregar a página (F5) mantém os dados (IndexedDB ok).

- [ ] **Step 3: Commit**

```powershell
git add src/pages/Categorias.jsx; git commit -m "feat: CRUD de categorias com protecao da categoria Outros"
```

---

### Task 7: Página Transações (CRUD + filtros + totais)

**Files:**
- Modify: `src/pages/Transacoes.jsx` (substituir placeholder)

- [ ] **Step 1: Implementar `src/pages/Transacoes.jsx`**

```jsx
import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import Card from '../components/Card';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import MonthPicker from '../components/MonthPicker';
import { formatBRL, parseBRL } from '../utils/money';
import { todayISO, formatDateBR, currentMonthKey } from '../utils/dates';

const newTx = () => ({ type: 'despesa', amountStr: '', date: todayISO(), categoryId: '', description: '' });

export default function Transacoes() {
  const [month, setMonth] = useState(currentMonthKey());
  const [filterType, setFilterType] = useState('todas');
  const [filterCat, setFilterCat] = useState('todas');
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [error, setError] = useState('');

  const categories = useLiveQuery(() => db.categories.toArray(), []) ?? [];
  const txs = useLiveQuery(async () => {
    const list = await db.transactions.where('date').startsWith(month).toArray();
    return list.sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id);
  }, [month]) ?? [];

  const catById = Object.fromEntries(categories.map((c) => [c.id, c]));

  const filtered = txs.filter((t) =>
    (filterType === 'todas' || t.type === filterType) &&
    (filterCat === 'todas' || t.categoryId === Number(filterCat)) &&
    (search === '' || t.description.toLowerCase().includes(search.toLowerCase()))
  );

  const receitas = txs.filter((t) => t.type === 'receita').reduce((s, t) => s + t.amount, 0);
  const despesas = txs.filter((t) => t.type === 'despesa').reduce((s, t) => s + t.amount, 0);

  async function save(e) {
    e.preventDefault();
    const amount = parseBRL(form.amountStr);
    if (isNaN(amount) || amount <= 0) return setError('Informe um valor válido, maior que zero.');
    if (!form.categoryId) return setError('Escolha uma categoria.');
    if (!form.description.trim()) return setError('Descreva a transação.');
    const data = {
      type: form.type,
      amount,
      date: form.date,
      categoryId: Number(form.categoryId),
      description: form.description.trim(),
    };
    if (form.id) await db.transactions.update(form.id, data);
    else await db.transactions.add(data);
    setForm(null);
    setError('');
  }

  function edit(tx) {
    setForm({
      id: tx.id,
      type: tx.type,
      amountStr: (tx.amount / 100).toFixed(2).replace('.', ','),
      date: tx.date,
      categoryId: String(tx.categoryId),
      description: tx.description,
    });
  }

  const formCats = categories.filter((c) => c.type === form?.type);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-bold">Transações</h1>
        <button onClick={() => setForm(newTx())}
          className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
          + Nova transação
        </button>
      </div>

      <div className="flex justify-center">
        <MonthPicker month={month} onChange={setMonth} />
      </div>

      {/* Totais do mês */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="text-center">
          <p className="text-xs text-slate-500 dark:text-slate-400">Receitas</p>
          <p className="mt-1 text-sm font-bold text-emerald-600 sm:text-lg">{formatBRL(receitas)}</p>
        </Card>
        <Card className="text-center">
          <p className="text-xs text-slate-500 dark:text-slate-400">Despesas</p>
          <p className="mt-1 text-sm font-bold text-red-500 sm:text-lg">{formatBRL(despesas)}</p>
        </Card>
        <Card className="text-center">
          <p className="text-xs text-slate-500 dark:text-slate-400">Saldo</p>
          <p className={`mt-1 text-sm font-bold sm:text-lg ${receitas - despesas >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
            {formatBRL(receitas - despesas)}
          </p>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="flex flex-wrap gap-2">
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)}
          className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-900">
          <option value="todas">Todos os tipos</option>
          <option value="receita">Receitas</option>
          <option value="despesa">Despesas</option>
        </select>
        <select value={filterCat} onChange={(e) => setFilterCat(e.target.value)}
          className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-900">
          <option value="todas">Todas as categorias</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
        </select>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar descrição…"
          className="min-w-32 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-900" />
      </Card>

      {/* Lista */}
      <Card>
        {filtered.length === 0 && (
          <p className="py-6 text-center text-sm text-slate-400">Nenhuma transação neste mês. 📭</p>
        )}
        <ul className="divide-y divide-slate-100 dark:divide-slate-700">
          {filtered.map((tx) => {
            const cat = catById[tx.categoryId];
            return (
              <li key={tx.id} className="flex items-center gap-3 py-2.5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-lg"
                  style={{ backgroundColor: `${cat?.color ?? '#94a3b8'}22` }}>
                  {cat?.icon ?? '❓'}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{tx.description}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {cat?.name ?? 'Sem categoria'} · {formatDateBR(tx.date)}
                  </p>
                </div>
                <span className={`font-semibold ${tx.type === 'receita' ? 'text-emerald-600' : 'text-red-500'}`}>
                  {tx.type === 'receita' ? '+' : '−'}{formatBRL(tx.amount)}
                </span>
                <button onClick={() => edit(tx)} aria-label="Editar"
                  className="rounded-lg px-2 py-1 text-sm text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700">✏️</button>
                <button onClick={() => setToDelete(tx)} aria-label="Excluir"
                  className="rounded-lg px-2 py-1 text-sm text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/30">🗑️</button>
              </li>
            );
          })}
        </ul>
      </Card>

      {/* Formulário */}
      <Modal open={form !== null} title={form?.id ? 'Editar transação' : 'Nova transação'} onClose={() => setForm(null)}>
        {form && (
          <form onSubmit={save} className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              {['despesa', 'receita'].map((t) => (
                <button key={t} type="button"
                  onClick={() => setForm({ ...form, type: t, categoryId: '' })}
                  className={`rounded-xl py-2 text-sm font-semibold capitalize ${
                    form.type === t
                      ? t === 'receita' ? 'bg-emerald-600 text-white' : 'bg-red-500 text-white'
                      : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                  }`}>
                  {t}
                </button>
              ))}
            </div>
            <label className="block text-sm font-medium">
              Valor (R$)
              <input value={form.amountStr} onChange={(e) => setForm({ ...form, amountStr: e.target.value })}
                inputMode="decimal" placeholder="0,00" autoFocus
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-lg dark:border-slate-600 dark:bg-slate-900" />
            </label>
            <label className="block text-sm font-medium">
              Data
              <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-900" />
            </label>
            <label className="block text-sm font-medium">
              Categoria
              <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-900">
                <option value="">Selecione…</option>
                {formCats.map((c) => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
              </select>
            </label>
            <label className="block text-sm font-medium">
              Descrição
              <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Ex: Mercado da semana"
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-900" />
            </label>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <button type="submit" className="w-full rounded-xl bg-indigo-600 py-2.5 font-semibold text-white hover:bg-indigo-700">
              Salvar
            </button>
          </form>
        )}
      </Modal>

      <ConfirmDialog
        open={toDelete !== null}
        message={`Excluir "${toDelete?.description}" (${toDelete ? formatBRL(toDelete.amount) : ''})?`}
        onConfirm={async () => { await db.transactions.delete(toDelete.id); setToDelete(null); }}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
```

- [ ] **Step 2: Verificar no navegador**

Em `/transacoes`: criar 1 receita e 2 despesas (valores tipo `1.234,56` e `50`), conferir totais no topo, editar uma, excluir outra, testar filtros e busca, navegar entre meses com ◀ ▶. Validação: tentar salvar sem categoria → mensagem de erro.

- [ ] **Step 3: Commit**

```powershell
git add src/pages/Transacoes.jsx; git commit -m "feat: CRUD de transacoes com filtros e totais do mes"
```

---

### Task 8: Página Orçamento

**Files:**
- Modify: `src/pages/Orcamento.jsx` (substituir placeholder)

- [ ] **Step 1: Implementar `src/pages/Orcamento.jsx`**

```jsx
import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import Card from '../components/Card';
import Modal from '../components/Modal';
import MonthPicker from '../components/MonthPicker';
import ProgressBar from '../components/ProgressBar';
import { formatBRL, parseBRL } from '../utils/money';
import { currentMonthKey } from '../utils/dates';

export default function Orcamento() {
  const [month, setMonth] = useState(currentMonthKey());
  const [editing, setEditing] = useState(null); // { category, limitStr }
  const [error, setError] = useState('');

  const categories = useLiveQuery(
    () => db.categories.where('type').equals('despesa').toArray(), []) ?? [];
  const budgets = useLiveQuery(() => db.budgets.toArray(), []) ?? [];
  const txs = useLiveQuery(
    () => db.transactions.where('date').startsWith(month).toArray(), [month]) ?? [];

  const budgetByCat = Object.fromEntries(budgets.map((b) => [b.categoryId, b]));
  const spentByCat = {};
  for (const t of txs) {
    if (t.type === 'despesa') spentByCat[t.categoryId] = (spentByCat[t.categoryId] ?? 0) + t.amount;
  }

  async function saveLimit(e) {
    e.preventDefault();
    const limit = parseBRL(editing.limitStr);
    if (isNaN(limit) || limit <= 0) return setError('Informe um limite válido, maior que zero.');
    const existing = budgetByCat[editing.category.id];
    if (existing) await db.budgets.update(existing.id, { monthlyLimit: limit });
    else await db.budgets.add({ categoryId: editing.category.id, monthlyLimit: limit });
    setEditing(null);
    setError('');
  }

  async function removeLimit() {
    const existing = budgetByCat[editing.category.id];
    if (existing) await db.budgets.delete(existing.id);
    setEditing(null);
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Orçamento</h1>
      <div className="flex justify-center">
        <MonthPicker month={month} onChange={setMonth} />
      </div>

      {categories.length === 0 && (
        <Card><p className="py-4 text-center text-sm text-slate-400">Crie categorias de despesa primeiro. 🏷️</p></Card>
      )}

      <div className="space-y-3">
        {categories.map((cat) => {
          const budget = budgetByCat[cat.id];
          const spent = spentByCat[cat.id] ?? 0;
          const over = budget && spent > budget.monthlyLimit;
          return (
            <Card key={cat.id}>
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full text-lg"
                  style={{ backgroundColor: `${cat.color}22` }}>{cat.icon}</span>
                <div className="flex-1">
                  <p className="font-medium">{cat.name}</p>
                  {budget ? (
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {formatBRL(spent)} de {formatBRL(budget.monthlyLimit)}
                      {over && <span className="ml-1 font-semibold text-red-500">· estourou! 🚨</span>}
                    </p>
                  ) : (
                    <p className="text-xs text-slate-400">Sem orçamento definido · gasto: {formatBRL(spent)}</p>
                  )}
                </div>
                <button
                  onClick={() => setEditing({
                    category: cat,
                    limitStr: budget ? (budget.monthlyLimit / 100).toFixed(2).replace('.', ',') : '',
                  })}
                  className="rounded-lg px-3 py-1.5 text-sm font-medium text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-900/30">
                  {budget ? 'Editar' : 'Definir'}
                </button>
              </div>
              {budget && (
                <div className="mt-3">
                  <ProgressBar value={spent} max={budget.monthlyLimit} />
                  <p className="mt-1 text-right text-xs text-slate-500 dark:text-slate-400">
                    {Math.round((spent / budget.monthlyLimit) * 100)}%
                  </p>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      <Modal open={editing !== null} title={`Orçamento — ${editing?.category.name}`} onClose={() => setEditing(null)}>
        {editing && (
          <form onSubmit={saveLimit} className="space-y-3">
            <label className="block text-sm font-medium">
              Limite mensal (R$)
              <input value={editing.limitStr}
                onChange={(e) => setEditing({ ...editing, limitStr: e.target.value })}
                inputMode="decimal" placeholder="0,00" autoFocus
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-lg dark:border-slate-600 dark:bg-slate-900" />
            </label>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <button type="submit" className="w-full rounded-xl bg-indigo-600 py-2.5 font-semibold text-white hover:bg-indigo-700">
              Salvar limite
            </button>
            {budgetByCat[editing.category.id] && (
              <button type="button" onClick={removeLimit}
                className="w-full rounded-xl py-2 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30">
                Remover orçamento desta categoria
              </button>
            )}
          </form>
        )}
      </Modal>
    </div>
  );
}
```

- [ ] **Step 2: Verificar no navegador**

Em `/orcamento`: definir limite para uma categoria, conferir barra verde. Criar despesas em `/transacoes` até passar de 80% (barra âmbar) e 100% (barra vermelha + "estourou! 🚨"). Trocar de mês: gasto zera.

- [ ] **Step 3: Commit**

```powershell
git add src/pages/Orcamento.jsx; git commit -m "feat: orcamento mensal por categoria com barra de progresso"
```

---

### Task 9: Página Metas + aportes

**Files:**
- Modify: `src/pages/Metas.jsx` (substituir placeholder)

- [ ] **Step 1: Implementar `src/pages/Metas.jsx`**

```jsx
import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import Card from '../components/Card';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import ProgressBar from '../components/ProgressBar';
import { formatBRL, parseBRL } from '../utils/money';
import { todayISO, formatDateBR } from '../utils/dates';

export default function Metas() {
  const [goalForm, setGoalForm] = useState(null);     // { id?, name, targetStr }
  const [aporteForm, setAporteForm] = useState(null); // { goal, amountStr, date }
  const [toDelete, setToDelete] = useState(null);
  const [expanded, setExpanded] = useState(null);     // goalId expandido
  const [error, setError] = useState('');

  const goals = useLiveQuery(() => db.goals.toArray(), []) ?? [];
  const contributions = useLiveQuery(() => db.contributions.toArray(), []) ?? [];

  const contribsByGoal = {};
  for (const c of contributions) (contribsByGoal[c.goalId] ??= []).push(c);

  async function saveGoal(e) {
    e.preventDefault();
    const name = goalForm.name.trim();
    const target = parseBRL(goalForm.targetStr);
    if (!name) return setError('Dê um nome para a meta.');
    if (isNaN(target) || target <= 0) return setError('Informe um valor alvo válido.');
    if (goalForm.id) await db.goals.update(goalForm.id, { name, targetAmount: target });
    else await db.goals.add({ name, targetAmount: target, createdAt: todayISO() });
    setGoalForm(null);
    setError('');
  }

  async function saveAporte(e) {
    e.preventDefault();
    const amount = parseBRL(aporteForm.amountStr);
    if (isNaN(amount) || amount <= 0) return setError('Informe um valor válido.');
    await db.contributions.add({ goalId: aporteForm.goal.id, amount, date: aporteForm.date });
    setAporteForm(null);
    setError('');
  }

  async function removeGoal() {
    await db.transaction('rw', db.goals, db.contributions, async () => {
      await db.contributions.where('goalId').equals(toDelete.id).delete();
      await db.goals.delete(toDelete.id);
    });
    setToDelete(null);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Metas</h1>
        <button onClick={() => setGoalForm({ name: '', targetStr: '' })}
          className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
          + Nova meta
        </button>
      </div>

      {goals.length === 0 && (
        <Card><p className="py-6 text-center text-sm text-slate-400">
          Nenhuma meta ainda. Crie uma, tipo "Reserva de emergência". 🏆
        </p></Card>
      )}

      {goals.map((goal) => {
        const list = (contribsByGoal[goal.id] ?? []).sort((a, b) => b.date.localeCompare(a.date));
        const total = list.reduce((s, c) => s + c.amount, 0);
        const pct = Math.round((total / goal.targetAmount) * 100);
        const done = total >= goal.targetAmount;
        return (
          <Card key={goal.id} className={done ? 'ring-2 ring-emerald-500' : ''}>
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-semibold">{done && '🎉 '}{goal.name}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {formatBRL(total)} de {formatBRL(goal.targetAmount)} · {pct}%
                  {done && <span className="ml-1 font-semibold text-emerald-600">Concluída!</span>}
                </p>
              </div>
              <div className="flex gap-1">
                <button onClick={() => setGoalForm({ id: goal.id, name: goal.name, targetStr: (goal.targetAmount / 100).toFixed(2).replace('.', ',') })}
                  aria-label="Editar" className="rounded-lg px-2 py-1 text-sm text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700">✏️</button>
                <button onClick={() => setToDelete({ ...goal, total })}
                  aria-label="Excluir" className="rounded-lg px-2 py-1 text-sm text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/30">🗑️</button>
              </div>
            </div>
            <div className="mt-3"><ProgressBar value={Math.min(total, goal.targetAmount)} max={goal.targetAmount} /></div>
            <div className="mt-3 flex gap-2">
              <button onClick={() => setAporteForm({ goal, amountStr: '', date: todayISO() })}
                className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-emerald-700">
                + Aporte
              </button>
              <button onClick={() => setExpanded(expanded === goal.id ? null : goal.id)}
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700">
                {expanded === goal.id ? 'Ocultar aportes' : `Ver aportes (${list.length})`}
              </button>
            </div>
            {expanded === goal.id && (
              <ul className="mt-3 divide-y divide-slate-100 border-t border-slate-100 pt-1 dark:divide-slate-700 dark:border-slate-700">
                {list.length === 0 && <li className="py-2 text-sm text-slate-400">Nenhum aporte ainda.</li>}
                {list.map((c) => (
                  <li key={c.id} className="flex items-center justify-between py-2 text-sm">
                    <span className="text-slate-500 dark:text-slate-400">{formatDateBR(c.date)}</span>
                    <span className="font-medium text-emerald-600">+{formatBRL(c.amount)}</span>
                    <button onClick={() => db.contributions.delete(c.id)} aria-label="Excluir aporte"
                      className="rounded px-1.5 text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/30">🗑️</button>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        );
      })}

      <Modal open={goalForm !== null} title={goalForm?.id ? 'Editar meta' : 'Nova meta'} onClose={() => setGoalForm(null)}>
        {goalForm && (
          <form onSubmit={saveGoal} className="space-y-3">
            <label className="block text-sm font-medium">
              Nome
              <input value={goalForm.name} onChange={(e) => setGoalForm({ ...goalForm, name: e.target.value })}
                placeholder="Ex: Reserva de emergência" autoFocus
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-900" />
            </label>
            <label className="block text-sm font-medium">
              Valor alvo (R$)
              <input value={goalForm.targetStr} onChange={(e) => setGoalForm({ ...goalForm, targetStr: e.target.value })}
                inputMode="decimal" placeholder="5.000,00"
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-lg dark:border-slate-600 dark:bg-slate-900" />
            </label>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <button type="submit" className="w-full rounded-xl bg-indigo-600 py-2.5 font-semibold text-white hover:bg-indigo-700">Salvar</button>
          </form>
        )}
      </Modal>

      <Modal open={aporteForm !== null} title={`Aporte — ${aporteForm?.goal.name}`} onClose={() => setAporteForm(null)}>
        {aporteForm && (
          <form onSubmit={saveAporte} className="space-y-3">
            <label className="block text-sm font-medium">
              Valor (R$)
              <input value={aporteForm.amountStr} onChange={(e) => setAporteForm({ ...aporteForm, amountStr: e.target.value })}
                inputMode="decimal" placeholder="0,00" autoFocus
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-lg dark:border-slate-600 dark:bg-slate-900" />
            </label>
            <label className="block text-sm font-medium">
              Data
              <input type="date" value={aporteForm.date} onChange={(e) => setAporteForm({ ...aporteForm, date: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-900" />
            </label>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <button type="submit" className="w-full rounded-xl bg-emerald-600 py-2.5 font-semibold text-white hover:bg-emerald-700">
              Registrar aporte
            </button>
          </form>
        )}
      </Modal>

      <ConfirmDialog
        open={toDelete !== null}
        message={`Excluir a meta "${toDelete?.name}"? Os ${toDelete ? formatBRL(toDelete.total) : ''} em aportes registrados também serão removidos.`}
        onConfirm={removeGoal}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
```

- [ ] **Step 2: Verificar no navegador**

Em `/metas`: criar meta de R$ 1.000, registrar 2 aportes, ver barra e %, expandir lista de aportes, excluir 1 aporte. Aportar até 100% → destaque 🎉 verde. Excluir meta → confirma mostrando total.

- [ ] **Step 3: Commit**

```powershell
git add src/pages/Metas.jsx; git commit -m "feat: metas de economia com aportes e progresso"
```

---

### Task 10: `utils/streaks.js` (TDD)

**Files:**
- Create: `src/utils/streaks.js`
- Test: `src/utils/streaks.test.js`

Contexto de calendário usado nos testes: `2026-06-01` é **segunda-feira**; `2026-06-10` é **quarta-feira**.

- [ ] **Step 1: Escrever testes que falham**

```js
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
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npx vitest run src/utils/streaks.test.js` — Esperado: FAIL (módulo não existe).

- [ ] **Step 3: Implementar `src/utils/streaks.js`**

```js
import { addDays, weekdayOf } from './dates';

// O hábito é esperado neste dia? (a partir da criação, conforme a frequência)
export function isExpectedOn(habit, iso) {
  if (iso < habit.createdAt) return false;
  if (habit.frequency === 'daily') return true;
  return habit.frequency.includes(weekdayOf(iso));
}

// Streak atual: anda para trás a partir de hoje. Hoje sem marcação não quebra
// (o dia ainda não acabou); dia esperado passado sem marcação quebra.
export function currentStreak(habit, logSet, today) {
  let streak = 0;
  let day = today;
  while (day >= habit.createdAt) {
    if (isExpectedOn(habit, day)) {
      if (logSet.has(day)) streak++;
      else if (day !== today) break;
    }
    day = addDays(day, -1);
  }
  return streak;
}

// Recorde: varre da criação até hoje contando sequências de dias esperados feitos.
export function bestStreak(habit, logSet, today) {
  let best = 0;
  let run = 0;
  let day = habit.createdAt;
  while (day <= today) {
    if (isExpectedOn(habit, day)) {
      if (logSet.has(day)) {
        run++;
        if (run > best) best = run;
      } else if (day !== today) {
        run = 0;
      }
    }
    day = addDays(day, 1);
  }
  return best;
}
```

- [ ] **Step 4: Rodar e ver passar**

Run: `npx vitest run src/utils/streaks.test.js` — Esperado: 10 passed.

- [ ] **Step 5: Commit**

```powershell
git add src/utils; git commit -m "feat: calculo de streak atual e recorde (TDD)"
```

---

### Task 11: Página Hábitos (CRUD + calendário + streaks)

**Files:**
- Modify: `src/pages/Habitos.jsx` (substituir placeholder)

- [ ] **Step 1: Implementar `src/pages/Habitos.jsx`**

```jsx
import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import Card from '../components/Card';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import { todayISO, currentMonthKey, daysInMonth, weekdayOf } from '../utils/dates';
import { isExpectedOn, currentStreak, bestStreak } from '../utils/streaks';

const WEEKDAYS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
const NEW_FORM = { name: '', icon: '✅', color: '#6366f1', freqMode: 'daily', weekdays: [] };

export default function Habitos() {
  const [form, setForm] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [error, setError] = useState('');

  const habits = useLiveQuery(() => db.habits.filter((h) => !h.archived).toArray(), []) ?? [];
  const logs = useLiveQuery(() => db.habitLogs.toArray(), []) ?? [];

  const today = todayISO();
  const month = currentMonthKey();
  const logsByHabit = {};
  for (const l of logs) (logsByHabit[l.habitId] ??= new Set()).add(l.date);

  async function toggle(habit, iso) {
    if (iso > today) return; // não marcar o futuro
    const existing = await db.habitLogs.where('[habitId+date]').equals([habit.id, iso]).first();
    if (existing) await db.habitLogs.delete(existing.id);
    else await db.habitLogs.add({ habitId: habit.id, date: iso });
  }

  async function save(e) {
    e.preventDefault();
    const name = form.name.trim();
    if (!name) return setError('Dê um nome para o hábito.');
    if (form.freqMode === 'weekdays' && form.weekdays.length === 0)
      return setError('Escolha pelo menos um dia da semana.');
    const frequency = form.freqMode === 'daily' ? 'daily' : [...form.weekdays].sort();
    if (form.id) {
      await db.habits.update(form.id, { name, icon: form.icon, color: form.color, frequency });
    } else {
      await db.habits.add({ name, icon: form.icon, color: form.color, frequency, archived: false, createdAt: today });
    }
    setForm(null);
    setError('');
  }

  async function remove() {
    await db.transaction('rw', db.habits, db.habitLogs, async () => {
      await db.habitLogs.where('habitId').equals(toDelete.id).delete();
      await db.habits.delete(toDelete.id);
    });
    setToDelete(null);
  }

  function edit(habit) {
    setForm({
      id: habit.id,
      name: habit.name,
      icon: habit.icon,
      color: habit.color,
      freqMode: habit.frequency === 'daily' ? 'daily' : 'weekdays',
      weekdays: habit.frequency === 'daily' ? [] : habit.frequency,
    });
  }

  // Calendário do mês atual: células alinhadas pelo dia da semana
  function MonthCalendar({ habit, logSet }) {
    const total = daysInMonth(month);
    const offset = weekdayOf(`${month}-01`);
    const cells = [
      ...Array.from({ length: offset }, () => null),
      ...Array.from({ length: total }, (_, i) => `${month}-${String(i + 1).padStart(2, '0')}`),
    ];
    return (
      <div className="mt-3 grid grid-cols-7 gap-1 text-center">
        {WEEKDAYS.map((w, i) => (
          <span key={i} className="text-[10px] font-semibold text-slate-400">{w}</span>
        ))}
        {cells.map((iso, i) => {
          if (!iso) return <span key={`v-${i}`} />;
          const done = logSet.has(iso);
          const expected = isExpectedOn(habit, iso) && iso <= today;
          return (
            <button
              key={iso}
              onClick={() => toggle(habit, iso)}
              disabled={iso > today}
              aria-label={`Dia ${iso.slice(8)}`}
              className={`mx-auto flex h-7 w-7 items-center justify-center rounded-full text-[11px] transition
                ${done ? 'font-bold text-white' : ''}
                ${!done && expected ? 'border-2 border-dashed border-slate-300 text-slate-400 dark:border-slate-600' : ''}
                ${!done && !expected ? 'text-slate-300 dark:text-slate-600' : ''}
                ${iso > today ? 'cursor-default opacity-40' : 'hover:scale-110'}`}
              style={done ? { backgroundColor: habit.color } : undefined}
            >
              {Number(iso.slice(8))}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Hábitos</h1>
        <button onClick={() => setForm({ ...NEW_FORM })}
          className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
          + Novo hábito
        </button>
      </div>

      {habits.length === 0 && (
        <Card><p className="py-6 text-center text-sm text-slate-400">
          Nenhum hábito ainda. Que tal começar com "Beber água"? 💧
        </p></Card>
      )}

      <div className="grid gap-3 lg:grid-cols-2">
        {habits.map((habit) => {
          const logSet = logsByHabit[habit.id] ?? new Set();
          const doneToday = logSet.has(today);
          const expectedToday = isExpectedOn(habit, today);
          const streak = currentStreak(habit, logSet, today);
          const best = bestStreak(habit, logSet, today);
          return (
            <Card key={habit.id}>
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full text-xl"
                  style={{ backgroundColor: `${habit.color}22` }}>{habit.icon}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{habit.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    🔥 {streak} {streak === 1 ? 'dia' : 'dias'} · recorde: {best}
                    {habit.frequency !== 'daily' && ' · dias específicos'}
                  </p>
                </div>
                <button onClick={() => edit(habit)} aria-label="Editar"
                  className="rounded-lg px-2 py-1 text-sm text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700">✏️</button>
                <button onClick={() => setToDelete(habit)} aria-label="Excluir"
                  className="rounded-lg px-2 py-1 text-sm text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/30">🗑️</button>
              </div>

              <button
                onClick={() => toggle(habit, today)}
                className={`mt-3 w-full rounded-xl py-2.5 text-sm font-semibold transition ${
                  doneToday
                    ? 'bg-emerald-600 text-white'
                    : expectedToday
                      ? 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600'
                      : 'bg-slate-50 text-slate-400 dark:bg-slate-800'
                }`}
              >
                {doneToday ? '✓ Feito hoje!' : expectedToday ? 'Marcar como feito hoje' : 'Hoje é dia de descanso 😴'}
              </button>

              <MonthCalendar habit={habit} logSet={logSet} />
            </Card>
          );
        })}
      </div>

      <Modal open={form !== null} title={form?.id ? 'Editar hábito' : 'Novo hábito'} onClose={() => setForm(null)}>
        {form && (
          <form onSubmit={save} className="space-y-3">
            <label className="block text-sm font-medium">
              Nome
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Ex: Beber água" autoFocus
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-900" />
            </label>
            <div className="flex gap-3">
              <label className="block flex-1 text-sm font-medium">
                Ícone (emoji)
                <input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} maxLength={4}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-center dark:border-slate-600 dark:bg-slate-900" />
              </label>
              <label className="block text-sm font-medium">
                Cor
                <input type="color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })}
                  className="mt-1 h-10 w-16 cursor-pointer rounded-lg border border-slate-300 dark:border-slate-600" />
              </label>
            </div>
            <fieldset className="text-sm font-medium">
              Frequência
              <div className="mt-1 grid grid-cols-2 gap-2">
                <button type="button" onClick={() => setForm({ ...form, freqMode: 'daily' })}
                  className={`rounded-xl py-2 text-sm font-semibold ${form.freqMode === 'daily' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'}`}>
                  Todos os dias
                </button>
                <button type="button" onClick={() => setForm({ ...form, freqMode: 'weekdays' })}
                  className={`rounded-xl py-2 text-sm font-semibold ${form.freqMode === 'weekdays' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'}`}>
                  Dias específicos
                </button>
              </div>
              {form.freqMode === 'weekdays' && (
                <div className="mt-2 flex justify-between gap-1">
                  {WEEKDAYS.map((w, i) => (
                    <button key={i} type="button"
                      onClick={() => setForm({
                        ...form,
                        weekdays: form.weekdays.includes(i)
                          ? form.weekdays.filter((d) => d !== i)
                          : [...form.weekdays, i],
                      })}
                      className={`h-9 w-9 rounded-full text-sm font-semibold ${
                        form.weekdays.includes(i) ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-300'
                      }`}>
                      {w}
                    </button>
                  ))}
                </div>
              )}
            </fieldset>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <button type="submit" className="w-full rounded-xl bg-indigo-600 py-2.5 font-semibold text-white hover:bg-indigo-700">Salvar</button>
          </form>
        )}
      </Modal>

      <ConfirmDialog
        open={toDelete !== null}
        message={`Excluir o hábito "${toDelete?.name}"? Todo o histórico de dias marcados será removido.`}
        onConfirm={remove}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
```

- [ ] **Step 2: Verificar no navegador**

Em `/habitos`: criar hábito diário e um de dias específicos (seg/qua/sex). Marcar "feito hoje" → streak vira 1, bolinha preenche no calendário. Clicar em dias passados no calendário marca/desmarca. Dias futuros não clicam. Hábito seg/qua/sex: dias fora da frequência aparecem sem contorno tracejado.

- [ ] **Step 3: Commit**

```powershell
git add src/pages/Habitos.jsx; git commit -m "feat: habitos com streaks, recorde e calendario mensal"
```

---

### Task 12: `utils/summary.js` — Resumo Inteligente (TDD)

**Files:**
- Create: `src/utils/summary.js`
- Test: `src/utils/summary.test.js`

- [ ] **Step 1: Escrever testes que falham**

```js
import { describe, it, expect } from 'vitest';
import { buildSummary } from './summary';

const cats = [
  { id: 1, name: 'Lazer', type: 'despesa' },
  { id: 2, name: 'Mercado', type: 'despesa' },
];

function tx(type, amount, categoryId, description = 'x') {
  return { type, amount, categoryId, description, date: '2026-06-05' };
}

describe('buildSummary', () => {
  it('compara com o mês anterior', () => {
    const out = buildSummary({
      monthTx: [tx('despesa', 12300, 1)],
      prevTx: [tx('despesa', 10000, 1)],
      prevLabel: 'maio',
      categories: cats,
      budgets: [],
    });
    expect(out[0]).toBe('Você gastou 23% a mais que em maio.');
  });

  it('aponta a categoria com maior variação', () => {
    const out = buildSummary({
      monthTx: [tx('despesa', 20000, 1), tx('despesa', 10000, 2)],
      prevTx: [tx('despesa', 10000, 1), tx('despesa', 10000, 2)],
      prevLabel: 'maio',
      categories: cats,
      budgets: [],
    });
    expect(out).toContain('Seus gastos com Lazer subiram 100%.');
  });

  it('mostra o maior gasto individual', () => {
    const out = buildSummary({
      monthTx: [tx('despesa', 84000, 2, 'Mercado do mês'), tx('despesa', 5000, 1)],
      prevTx: [],
      prevLabel: 'maio',
      categories: cats,
      budgets: [],
    });
    expect(out).toContain('Maior gasto do mês: Mercado do mês (R$ 840,00).');
  });

  it('alerta orçamento >= 80%', () => {
    const out = buildSummary({
      monthTx: [tx('despesa', 9200, 1)],
      prevTx: [],
      prevLabel: 'maio',
      categories: cats,
      budgets: [{ categoryId: 1, monthlyLimit: 10000 }],
    });
    expect(out).toContain('⚠️ Orçamento de Lazer está em 92%.');
  });

  it('sem mês anterior: não compara, não quebra (divisão por zero)', () => {
    const out = buildSummary({
      monthTx: [tx('despesa', 5000, 1, 'Pizza')],
      prevTx: [],
      prevLabel: 'maio',
      categories: cats,
      budgets: [],
    });
    expect(out).toEqual(['Maior gasto do mês: Pizza (R$ 50,00).']);
  });

  it('sem nenhum dado retorna vazio', () => {
    expect(buildSummary({ monthTx: [], prevTx: [], prevLabel: 'maio', categories: cats, budgets: [] })).toEqual([]);
  });
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npx vitest run src/utils/summary.test.js` — Esperado: FAIL (módulo não existe).

- [ ] **Step 3: Implementar `src/utils/summary.js`**

```js
import { formatBRL } from './money';

function sumByCategory(txs) {
  const map = {};
  for (const t of txs) map[t.categoryId] = (map[t.categoryId] ?? 0) + t.amount;
  return map;
}

// Gera até 4 frases sobre o mês, por templates locais (sem IA, sem rede).
export function buildSummary({ monthTx, prevTx, prevLabel, categories, budgets }) {
  const sentences = [];
  const catName = (id) => categories.find((c) => c.id === Number(id))?.name ?? 'Outros';

  const expenses = monthTx.filter((t) => t.type === 'despesa');
  const prevExpenses = prevTx.filter((t) => t.type === 'despesa');
  const total = expenses.reduce((s, t) => s + t.amount, 0);
  const prevTotal = prevExpenses.reduce((s, t) => s + t.amount, 0);

  // 1. Comparação com o mês anterior (só se houver dados nos dois meses)
  if (total > 0 && prevTotal > 0) {
    const diff = Math.round(((total - prevTotal) / prevTotal) * 100);
    if (diff > 0) sentences.push(`Você gastou ${diff}% a mais que em ${prevLabel}.`);
    else if (diff < 0) sentences.push(`Você gastou ${Math.abs(diff)}% a menos que em ${prevLabel}. 👏`);

    // 2. Categoria com maior variação percentual
    const cur = sumByCategory(expenses);
    const prev = sumByCategory(prevExpenses);
    let topId = null;
    let topPct = 0;
    for (const id in cur) {
      if (!prev[id]) continue;
      const pct = Math.round(((cur[id] - prev[id]) / prev[id]) * 100);
      if (Math.abs(pct) > Math.abs(topPct)) {
        topPct = pct;
        topId = id;
      }
    }
    if (topId !== null && topPct !== 0) {
      const verb = topPct > 0 ? 'subiram' : 'caíram';
      sentences.push(`Seus gastos com ${catName(topId)} ${verb} ${Math.abs(topPct)}%.`);
    }
  }

  // 3. Maior gasto individual
  if (expenses.length > 0) {
    const biggest = expenses.reduce((a, b) => (b.amount > a.amount ? b : a));
    sentences.push(`Maior gasto do mês: ${biggest.description} (${formatBRL(biggest.amount)}).`);
  }

  // 4. Primeiro alerta de orçamento em >= 80%
  const spent = sumByCategory(expenses);
  for (const b of budgets) {
    const s = spent[b.categoryId] ?? 0;
    if (b.monthlyLimit > 0 && s / b.monthlyLimit >= 0.8) {
      sentences.push(`⚠️ Orçamento de ${catName(b.categoryId)} está em ${Math.round((s / b.monthlyLimit) * 100)}%.`);
      break;
    }
  }

  return sentences.slice(0, 4);
}
```

- [ ] **Step 4: Rodar e ver passar**

Run: `npx vitest run src/utils/summary.test.js` — Esperado: 6 passed.

- [ ] **Step 5: Commit**

```powershell
git add src/utils; git commit -m "feat: resumo inteligente do mes por templates (TDD)"
```

---

### Task 13: Página Dashboard (gráficos + resumo + hábitos de hoje)

**Files:**
- Modify: `src/pages/Dashboard.jsx` (substituir placeholder)

- [ ] **Step 1: Implementar `src/pages/Dashboard.jsx`**

```jsx
import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Link } from 'react-router-dom';
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip,
  BarChart, Bar, XAxis, YAxis, Legend, LineChart, Line, CartesianGrid,
} from 'recharts';
import { db } from '../db/db';
import Card from '../components/Card';
import MonthPicker from '../components/MonthPicker';
import { formatBRL } from '../utils/money';
import { currentMonthKey, addMonths, monthKey, monthLabel, monthShort, lastNMonths, todayISO } from '../utils/dates';
import { buildSummary } from '../utils/summary';
import { isExpectedOn, currentStreak } from '../utils/streaks';

const tooltipFmt = (v) => formatBRL(Math.round(v * 100));

export default function Dashboard() {
  const [month, setMonth] = useState(currentMonthKey());

  const allTx = useLiveQuery(() => db.transactions.toArray(), []) ?? [];
  const categories = useLiveQuery(() => db.categories.toArray(), []) ?? [];
  const budgets = useLiveQuery(() => db.budgets.toArray(), []) ?? [];
  const habits = useLiveQuery(() => db.habits.filter((h) => !h.archived).toArray(), []) ?? [];
  const habitLogs = useLiveQuery(() => db.habitLogs.toArray(), []) ?? [];

  const today = todayISO();
  const monthTx = allTx.filter((t) => monthKey(t.date) === month);
  const prevMonth = addMonths(month, -1);
  const prevTx = allTx.filter((t) => monthKey(t.date) === prevMonth);

  const receitas = monthTx.filter((t) => t.type === 'receita').reduce((s, t) => s + t.amount, 0);
  const despesas = monthTx.filter((t) => t.type === 'despesa').reduce((s, t) => s + t.amount, 0);

  // Pizza: despesas do mês por categoria
  const byCat = {};
  for (const t of monthTx) {
    if (t.type === 'despesa') byCat[t.categoryId] = (byCat[t.categoryId] ?? 0) + t.amount;
  }
  const pieData = Object.entries(byCat).map(([id, amount]) => {
    const cat = categories.find((c) => c.id === Number(id));
    return { name: cat?.name ?? 'Outros', value: amount / 100, color: cat?.color ?? '#94a3b8' };
  }).sort((a, b) => b.value - a.value);

  // Barras: receitas vs despesas, últimos 6 meses
  const months6 = lastNMonths(6);
  const barData = months6.map((k) => {
    const txs = allTx.filter((t) => monthKey(t.date) === k);
    return {
      name: monthShort(k),
      Receitas: txs.filter((t) => t.type === 'receita').reduce((s, t) => s + t.amount, 0) / 100,
      Despesas: txs.filter((t) => t.type === 'despesa').reduce((s, t) => s + t.amount, 0) / 100,
    };
  });

  // Linha: saldo acumulado (todo o histórico, exibindo os últimos 6 meses)
  const monthlyNet = {};
  for (const t of allTx) {
    const k = monthKey(t.date);
    monthlyNet[k] = (monthlyNet[k] ?? 0) + (t.type === 'receita' ? t.amount : -t.amount);
  }
  let acc = 0;
  const cumulative = {};
  for (const k of Object.keys(monthlyNet).sort()) {
    acc += monthlyNet[k];
    cumulative[k] = acc;
  }
  let carry = 0;
  for (const k of Object.keys(cumulative).sort()) {
    if (k < months6[0]) carry = cumulative[k];
  }
  let lineAcc = carry;
  const lineData = months6.map((k) => {
    lineAcc += monthlyNet[k] ?? 0;
    return { name: monthShort(k), Saldo: lineAcc / 100 };
  });

  const summary = buildSummary({
    monthTx, prevTx,
    prevLabel: monthLabel(prevMonth).split(' de ')[0],
    categories, budgets,
  });

  const todaysHabits = habits.filter((h) => isExpectedOn(h, today));
  const logsByHabit = {};
  for (const l of habitLogs) (logsByHabit[l.habitId] ??= new Set()).add(l.date);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <MonthPicker month={month} onChange={setMonth} />
      </div>

      {/* Cards do mês */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="text-center">
          <p className="text-xs text-slate-500 dark:text-slate-400">Receitas</p>
          <p className="mt-1 text-sm font-bold text-emerald-600 sm:text-xl">{formatBRL(receitas)}</p>
        </Card>
        <Card className="text-center">
          <p className="text-xs text-slate-500 dark:text-slate-400">Despesas</p>
          <p className="mt-1 text-sm font-bold text-red-500 sm:text-xl">{formatBRL(despesas)}</p>
        </Card>
        <Card className="text-center">
          <p className="text-xs text-slate-500 dark:text-slate-400">Saldo do mês</p>
          <p className={`mt-1 text-sm font-bold sm:text-xl ${receitas - despesas >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
            {formatBRL(receitas - despesas)}
          </p>
        </Card>
      </div>

      {/* Resumo Inteligente */}
      {summary.length > 0 && (
        <Card className="border-l-4 border-indigo-500">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-indigo-500">💡 Resumo do mês</h2>
          <ul className="space-y-1.5 text-sm">
            {summary.map((s, i) => <li key={i}>{s}</li>)}
          </ul>
        </Card>
      )}

      {/* Hábitos de hoje */}
      {todaysHabits.length > 0 && (
        <Card>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Hábitos de hoje</h2>
            <Link to="/habitos" className="text-xs font-medium text-indigo-500 hover:underline">ver todos →</Link>
          </div>
          <div className="flex flex-wrap gap-2">
            {todaysHabits.map((h) => {
              const logSet = logsByHabit[h.id] ?? new Set();
              const done = logSet.has(today);
              return (
                <span key={h.id}
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium ${
                    done ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                         : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-300'
                  }`}>
                  {h.icon} {h.name} · 🔥{currentStreak(h, logSet, today)}
                  {done && ' ✓'}
                </span>
              );
            })}
          </div>
        </Card>
      )}

      {/* Gráficos */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Gastos por categoria — {monthLabel(month)}
          </h2>
          {pieData.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-400">Sem despesas neste mês. 🎉</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2}>
                  {pieData.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie>
                <Tooltip formatter={tooltipFmt} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Receitas vs Despesas — últimos 6 meses
          </h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
              <XAxis dataKey="name" fontSize={12} />
              <YAxis fontSize={11} tickFormatter={(v) => `${Math.round(v / 1000)}k`} width={32} />
              <Tooltip formatter={tooltipFmt} />
              <Legend />
              <Bar dataKey="Receitas" fill="#10b981" radius={[6, 6, 0, 0]} />
              <Bar dataKey="Despesas" fill="#ef4444" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="lg:col-span-2">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Evolução do saldo acumulado
          </h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={lineData}>
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
              <XAxis dataKey="name" fontSize={12} />
              <YAxis fontSize={11} tickFormatter={(v) => `${Math.round(v / 1000)}k`} width={32} />
              <Tooltip formatter={tooltipFmt} />
              <Line type="monotone" dataKey="Saldo" stroke="#6366f1" strokeWidth={2.5} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verificar no navegador**

Em `/` com dados criados nas tarefas anteriores: 3 cards corretos, pizza com cores das categorias, barras dos 6 meses, linha de saldo, Resumo do Mês com frases coerentes, chips de hábitos de hoje com 🔥. Trocar mês: cards/pizza/resumo mudam; barras e linha ficam fixas.

- [ ] **Step 3: Commit**

```powershell
git add src/pages/Dashboard.jsx; git commit -m "feat: dashboard com graficos, resumo inteligente e habitos de hoje"
```

---

### Task 14: Página Ajustes (tema, backup, zerar)

**Files:**
- Modify: `src/pages/Ajustes.jsx` (substituir placeholder)

- [ ] **Step 1: Implementar `src/pages/Ajustes.jsx`**

```jsx
import { useRef, useState } from 'react';
import { db, ALL_TABLES } from '../db/db';
import Card from '../components/Card';
import ConfirmDialog from '../components/ConfirmDialog';
import { useTheme } from '../hooks/useTheme';
import { todayISO } from '../utils/dates';

export default function Ajustes() {
  const [theme, setTheme] = useTheme();
  const fileRef = useRef(null);
  const [importData, setImportData] = useState(null);
  const [resetStep, setResetStep] = useState(0); // 0=nada, 1=primeira confirmação, 2=segunda
  const [message, setMessage] = useState('');

  async function exportBackup() {
    const data = { exportedAt: new Date().toISOString(), version: 1 };
    for (const table of ALL_TABLES) data[table] = await db.table(table).toArray();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `backup-controle-pessoal-${todayISO()}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
    setMessage('Backup exportado! Guarde o arquivo em local seguro. 💾');
  }

  function pickFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        if (!Array.isArray(data.transactions) || !Array.isArray(data.categories)) {
          throw new Error('estrutura inválida');
        }
        setImportData(data);
      } catch {
        setMessage('❌ Arquivo inválido. Use um backup gerado por este app.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  async function doImport() {
    await db.transaction('rw', ALL_TABLES.map((t) => db.table(t)), async () => {
      for (const table of ALL_TABLES) {
        await db.table(table).clear();
        if (Array.isArray(importData[table]) && importData[table].length > 0) {
          await db.table(table).bulkAdd(importData[table]);
        }
      }
    });
    setImportData(null);
    setMessage('Backup importado com sucesso! ✅');
  }

  async function doReset() {
    await db.transaction('rw', ALL_TABLES.map((t) => db.table(t)), async () => {
      for (const table of ALL_TABLES) await db.table(table).clear();
    });
    setResetStep(0);
    setMessage('Todos os dados foram apagados. Começando do zero. 🧹');
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Ajustes</h1>

      {message && (
        <Card className="border-l-4 border-indigo-500">
          <p className="text-sm">{message}</p>
        </Card>
      )}

      <Card>
        <h2 className="mb-1 font-semibold">Aparência</h2>
        <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">Tema atual: {theme === 'dark' ? 'escuro 🌙' : 'claro ☀️'}</p>
        <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
          Alternar para tema {theme === 'dark' ? 'claro' : 'escuro'}
        </button>
      </Card>

      <Card>
        <h2 className="mb-1 font-semibold">Backup</h2>
        <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">
          Seus dados ficam apenas neste navegador. Exporte um backup de vez em quando —
          se o cache do navegador for limpo, é assim que você recupera tudo.
        </p>
        <div className="flex flex-wrap gap-2">
          <button onClick={exportBackup}
            className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">
            ⬇️ Exportar backup
          </button>
          <button onClick={() => fileRef.current?.click()}
            className="rounded-xl bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600">
            ⬆️ Importar backup
          </button>
          <input ref={fileRef} type="file" accept="application/json,.json" onChange={pickFile} className="hidden" />
        </div>
      </Card>

      <Card className="border border-red-200 dark:border-red-900">
        <h2 className="mb-1 font-semibold text-red-600 dark:text-red-400">Zona de perigo</h2>
        <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">
          Apaga todas as transações, categorias, orçamentos, metas e hábitos. Sem volta (a não ser por backup).
        </p>
        <button onClick={() => setResetStep(1)}
          className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700">
          🧹 Zerar todos os dados
        </button>
      </Card>

      <ConfirmDialog
        open={importData !== null}
        title="Importar backup"
        confirmLabel="Substituir tudo"
        message={`Importar este backup vai SUBSTITUIR todos os dados atuais (${importData?.transactions?.length ?? 0} transações no arquivo). Continuar?`}
        onConfirm={doImport}
        onCancel={() => setImportData(null)}
      />

      <ConfirmDialog
        open={resetStep === 1}
        title="Zerar dados — etapa 1 de 2"
        confirmLabel="Sim, quero apagar"
        message="Tem certeza? TODOS os dados serão apagados deste navegador."
        onConfirm={() => setResetStep(2)}
        onCancel={() => setResetStep(0)}
      />
      <ConfirmDialog
        open={resetStep === 2}
        title="Zerar dados — etapa 2 de 2"
        confirmLabel="Apagar tudo de vez"
        message="Última chance: você exportou um backup? Esta ação não pode ser desfeita."
        onConfirm={doReset}
        onCancel={() => setResetStep(0)}
      />
    </div>
  );
}
```

- [ ] **Step 2: Verificar no navegador**

Em `/ajustes`: alternar tema (todo o app muda e persiste após F5). Exportar backup → arquivo `.json` baixa. Zerar dados (confirmação dupla) → app fica vazio. Importar o backup baixado → dados voltam.

- [ ] **Step 3: Commit**

```powershell
git add src/pages/Ajustes.jsx; git commit -m "feat: ajustes com tema, backup JSON e zerar dados"
```

---

### Task 15: Dados de exemplo (seed na primeira execução)

**Files:**
- Create: `src/db/seed.js`
- Modify: `src/db/db.js`

- [ ] **Step 1: Criar `src/db/seed.js`**

```js
import { todayISO, currentMonthKey, addMonths, addDays } from '../utils/dates';
import { isExpectedOn } from '../utils/streaks';

// Roda UMA vez, quando o banco é criado (evento populate do Dexie).
// "Zerar dados" nos Ajustes limpa as tabelas sem recriar o banco — não re-seeda.
export async function seedDatabase(tx) {
  const today = todayISO();
  const cur = currentMonthKey();
  const prev = addMonths(cur, -1);

  const catIds = await tx.categories.bulkAdd([
    { name: 'Moradia', type: 'despesa', icon: '🏠', color: '#f59e0b' },
    { name: 'Alimentação', type: 'despesa', icon: '🍽️', color: '#ef4444' },
    { name: 'Transporte', type: 'despesa', icon: '🚗', color: '#3b82f6' },
    { name: 'Lazer', type: 'despesa', icon: '🎮', color: '#a855f7' },
    { name: 'Saúde', type: 'despesa', icon: '💊', color: '#14b8a6' },
    { name: 'Mercado', type: 'despesa', icon: '🛒', color: '#84cc16' },
    { name: 'Outros', type: 'despesa', icon: '📦', color: '#94a3b8' },
    { name: 'Salário', type: 'receita', icon: '💰', color: '#10b981' },
  ], { allKeys: true });

  const [moradia, alimentacao, transporte, lazer, saude, mercado, , salario] = catIds;

  const txOf = (month, day, type, amount, categoryId, description) =>
    ({ type, amount, date: `${month}-${String(day).padStart(2, '0')}`, categoryId, description });

  await tx.transactions.bulkAdd([
    // Mês anterior
    txOf(prev, 5, 'receita', 420000, salario, 'Salário'),
    txOf(prev, 5, 'despesa', 120000, moradia, 'Aluguel'),
    txOf(prev, 6, 'despesa', 18900, mercado, 'Mercado da semana'),
    txOf(prev, 8, 'despesa', 4500, transporte, 'Combustível'),
    txOf(prev, 10, 'despesa', 6800, alimentacao, 'Almoço fora'),
    txOf(prev, 12, 'despesa', 22000, mercado, 'Mercado do mês'),
    txOf(prev, 14, 'despesa', 3990, lazer, 'Streaming'),
    txOf(prev, 15, 'despesa', 8900, saude, 'Farmácia'),
    txOf(prev, 18, 'despesa', 12000, lazer, 'Cinema e jantar'),
    txOf(prev, 20, 'despesa', 5200, transporte, 'Uber'),
    txOf(prev, 22, 'despesa', 15400, mercado, 'Mercado da semana'),
    txOf(prev, 25, 'despesa', 7300, alimentacao, 'Delivery'),
    txOf(prev, 27, 'despesa', 9900, lazer, 'Show'),
    // Mês atual
    txOf(cur, 5, 'receita', 420000, salario, 'Salário'),
    txOf(cur, 5, 'despesa', 120000, moradia, 'Aluguel'),
    txOf(cur, 6, 'despesa', 21500, mercado, 'Mercado da semana'),
    txOf(cur, 7, 'despesa', 4800, transporte, 'Combustível'),
    txOf(cur, 8, 'despesa', 5600, alimentacao, 'Almoço fora'),
    txOf(cur, 9, 'despesa', 3990, lazer, 'Streaming'),
    txOf(cur, 9, 'despesa', 16200, lazer, 'Jogo novo'),
    txOf(cur, 10, 'despesa', 7800, alimentacao, 'Delivery'),
  ]);

  await tx.budgets.bulkAdd([
    { categoryId: alimentacao, monthlyLimit: 60000 },
    { categoryId: lazer, monthlyLimit: 25000 },
  ]);

  const goalId = await tx.goals.add({
    name: 'Reserva de emergência',
    targetAmount: 500000,
    createdAt: addDays(today, -45),
  });
  await tx.contributions.bulkAdd([
    { goalId, amount: 50000, date: addDays(today, -40) },
    { goalId, amount: 75000, date: addDays(today, -10) },
  ]);

  const habitIds = await tx.habits.bulkAdd([
    { name: 'Beber água', icon: '💧', color: '#3b82f6', frequency: 'daily', archived: false, createdAt: addDays(today, -25) },
    { name: 'Fazer exercícios', icon: '🏃', color: '#f97316', frequency: [1, 3, 5], archived: false, createdAt: addDays(today, -25) },
    { name: 'Ler', icon: '📚', color: '#a855f7', frequency: 'daily', archived: false, createdAt: addDays(today, -25) },
  ], { allKeys: true });

  const habitsSeed = [
    { id: habitIds[0], frequency: 'daily', createdAt: addDays(today, -25), skip: [4, 11] },
    { id: habitIds[1], frequency: [1, 3, 5], createdAt: addDays(today, -25), skip: [9] },
    { id: habitIds[2], frequency: 'daily', createdAt: addDays(today, -25), skip: [2, 7, 8, 15] },
  ];
  const logs = [];
  for (const h of habitsSeed) {
    for (let i = 1; i <= 20; i++) {            // últimos 20 dias, sem incluir hoje
      if (h.skip.includes(i)) continue;        // falhas realistas para variar os streaks
      const date = addDays(today, -i);
      if (isExpectedOn(h, date)) logs.push({ habitId: h.id, date });
    }
  }
  await tx.habitLogs.bulkAdd(logs);

  await tx.settings.add({ key: 'seeded', value: true });
}
```

- [ ] **Step 2: Conectar o populate em `src/db/db.js`** — adicionar ao final do arquivo:

```js
import { seedDatabase } from './seed';

db.on('populate', (tx) => seedDatabase(tx));
```

(O import pode ficar no topo do arquivo, junto com o do Dexie.)

- [ ] **Step 3: Verificar no navegador**

DevTools (F12) → Application → IndexedDB → deletar o banco `controle-pessoal` → F5. O app abre populado: transações nos 2 meses, dashboard com gráficos e resumo, orçamentos (Lazer deve aparecer ≥ 80%), meta com 25%, hábitos com streaks variados. Zerar dados nos Ajustes → F5 → continua vazio (não re-seeda).

- [ ] **Step 4: Rodar todos os testes**

Run: `npm test` — Esperado: todos os testes passam (money, dates, streaks, summary).

- [ ] **Step 5: Commit**

```powershell
git add src/db; git commit -m "feat: dados de exemplo na primeira execucao"
```

---

### Task 16: Verificação final

**Files:** nenhum novo (ajustes pontuais se a verificação achar problemas).

- [ ] **Step 1: Suite completa**

Run: `npm test` — Esperado: 0 falhas.

- [ ] **Step 2: Build de produção**

Run: `npm run build` — Esperado: build sem erros.

- [ ] **Step 3: Checklist manual no navegador** (com `npm run dev`)

1. F5 em qualquer rota mantém os dados (IndexedDB).
2. Responsivo: 320px, 768px, 1024px (F12 → device toolbar). Bottom nav não cobre conteúdo (padding-bottom do main).
3. Tema escuro aplicado em todas as 7 telas.
4. Fluxo completo: criar categoria → transação nela → ver no dashboard → definir orçamento → estourar → ver alerta no resumo.
5. Fluxo hábitos: criar, marcar hoje, conferir streak no card e no dashboard.
6. Backup: exportar → zerar → importar → tudo de volta.

- [ ] **Step 4: Corrigir o que falhar, commitar**

```powershell
git add -A; git commit -m "fix: ajustes da verificacao final"
```

(Se nada falhar, pular este commit.)

---

## Cobertura da spec (self-check)

| Spec | Task |
|---|---|
| §4 telas e navegação | 5 (layout), 6–14 (páginas) |
| §5 modelo de dados + integridade | 4, 6 (Outros), 9 (cascata aportes), 11 (cascata logs) |
| §6.1 transações | 7 |
| §6.2 orçamento | 8 |
| §6.3 metas | 9 |
| §6.4 streaks | 10, 11 |
| §6.5 resumo inteligente | 12, 13 |
| §6.6 gráficos | 13 |
| §6.7 backup | 14 |
| §6.8 tema | 5 (hook), 14 (UI) |
| §7 seed | 15 |
| §9 testes | 2, 3, 10, 12 |
