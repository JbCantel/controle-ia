# Spec — Controle Financeiro e Hábitos (uso pessoal)

**Data:** 10/06/2026
**Status:** Aprovado pelo usuário (design verbal). Aguardando revisão da spec escrita.

---

## 1. Contexto e objetivo

App web pessoal, de uso individual, para:

1. **Finanças** — anotar receitas e despesas como numa planilha, acompanhar quanto tem guardado, orçamento por categoria e metas de economia.
2. **Hábitos** — criar e acompanhar hábitos diários editáveis (ex: "Beber água", "Fazer exercícios") com sistema de streaks (sequências).

As duas áreas são **separadas** dentro do mesmo app (navegação própria para cada uma), sem integração entre elas na v1.

Motivação: apps existentes são pagos; este é gratuito, local e serve também como aprendizado de como esses apps funcionam por dentro.

**Sem backend, sem login.** Dados persistem no IndexedDB do navegador.

## 2. Stack

| Camada | Tecnologia |
|---|---|
| UI | React 18 + Vite |
| Estilo | Tailwind CSS |
| Gráficos | Recharts |
| Persistência | Dexie.js (IndexedDB) + dexie-react-hooks (live queries) |
| Rotas | React Router |
| Testes | Vitest (apenas funções utilitárias críticas) |

## 3. Idioma e formato

- Interface 100% em **português do Brasil**.
- Moeda: **R$ 1.234,56** (vírgula decimal, ponto de milhar) via `Intl.NumberFormat('pt-BR')`.
- Datas exibidas como **dd/mm/aaaa**; armazenadas como string ISO `yyyy-mm-dd`.
- Valores monetários armazenados em **centavos (inteiro)**. Conversão só na exibição e na entrada.

## 4. Telas e navegação

Menu lateral fixo no desktop; barra de navegação inferior no mobile (mobile-first).

| Rota | Tela | Conteúdo |
|---|---|---|
| `/` | Dashboard | Saldo do mês, receitas vs despesas, pizza de gastos por categoria, gráfico de linha da evolução do saldo (últimos 6 meses), card **Resumo do Mês** (linguagem natural), mini-painel de hábitos (streaks de hoje) |
| `/transacoes` | Transações | Tabela estilo planilha. Filtros: mês, categoria, tipo (receita/despesa), busca por descrição. CRUD completo. Seletor de mês no topo |
| `/orcamento` | Orçamento | Lista de categorias de despesa com limite mensal definível. Barra de progresso: verde (< 80%), amarela (80–100%), vermelha (> 100%) com aviso visual |
| `/metas` | Metas | Cards de metas (nome, valor alvo, total aportado, barra de progresso, % concluído). Registrar aportes (valor + data). CRUD de metas; excluir meta pede confirmação |
| `/categorias` | Categorias | Lista com nome, cor e ícone (emoji). CRUD. Categorias separadas por tipo: despesa ou receita |
| `/habitos` | Hábitos | Cards de hábitos com: botão "feito hoje", streak atual 🔥, recorde, calendário do mês com bolinhas nos dias feitos. CRUD de hábitos |
| `/ajustes` | Ajustes | Tema claro/escuro, exportar backup (JSON), importar backup, zerar todos os dados (com confirmação dupla) |

## 5. Modelo de dados (tabelas Dexie)

Banco: `controle-pessoal`, versão 1.

```js
transactions: '++id, type, date, categoryId'
  // { id, type: 'receita'|'despesa', amount: int (centavos),
  //   date: 'yyyy-mm-dd', categoryId, description: string }

categories: '++id, type'
  // { id, name, type: 'receita'|'despesa', color: hex, icon: emoji }

budgets: '++id, &categoryId'
  // { id, categoryId, monthlyLimit: int (centavos) }
  // Limite vale para todo mês (não há limite diferente por mês na v1)

goals: '++id'
  // { id, name, targetAmount: int (centavos), createdAt: 'yyyy-mm-dd' }

contributions: '++id, goalId, date'
  // { id, goalId, amount: int (centavos), date: 'yyyy-mm-dd' }

habits: '++id'
  // { id, name, icon: emoji, color: hex,
  //   frequency: 'daily' | number[] (dias da semana, 0=dom..6=sáb),
  //   archived: boolean, createdAt: 'yyyy-mm-dd' }

habitLogs: '++id, habitId, date, [habitId+date]'
  // { id, habitId, date: 'yyyy-mm-dd' }  — existe = feito naquele dia

settings: 'key'
  // { key: 'theme', value: 'light'|'dark' }
  // { key: 'seeded', value: true }
```

### Regras de integridade

- **Excluir categoria com transações:** transações são movidas para a categoria especial "Outros" (criada automaticamente, não excluível). Nunca se perde histórico.
- **Excluir meta:** remove também seus aportes (com confirmação mostrando o total aportado).
- **Excluir hábito:** remove também seus logs (com confirmação).
- **Aportes em metas NÃO geram transação** — as duas áreas são independentes na v1.

## 6. Funcionalidades em detalhe

### 6.1 Transações
- Formulário: tipo, valor (input com máscara R$), data (padrão hoje), categoria (filtrada pelo tipo), descrição.
- Validação: valor > 0, categoria obrigatória, data obrigatória, descrição obrigatória.
- Edição inline ou via modal; exclusão com confirmação.
- Lista do mês selecionado, ordenada por data decrescente, com total de receitas, despesas e saldo do mês no topo.

### 6.2 Orçamento
- Só para categorias de **despesa**.
- Gasto do mês corrente por categoria vs. limite.
- Sem limite definido = categoria aparece como "sem orçamento" com botão para definir.

### 6.3 Metas
- Progresso = soma dos aportes / valor alvo.
- Ao atingir 100%: destaque visual de meta concluída 🎉.
- Aportes listados dentro da meta (expansível), com exclusão individual.

### 6.4 Hábitos e streaks
- **Streak atual:** dias consecutivos feitos, contando apenas os dias em que o hábito era esperado (frequência). Ex: hábito seg/qua/sex não quebra streak no domingo.
- Streak não quebra **hoje** se ainda não marcou (só quebra quando o dia esperado passa sem marcação).
- **Recorde:** maior streak histórico (calculado dos logs).
- Calendário do mês: bolinha preenchida = feito; contorno = era esperado e não fez; vazio = dia sem expectativa.
- Marcar/desmarcar dias passados é permitido (edição livre, app pessoal).

### 6.5 Resumo Inteligente (Dashboard)
Card com até 4 frases geradas por templates locais (sem IA, sem rede):

1. Comparação do total de despesas vs. mês anterior: "Você gastou X% a mais/menos que em [mês]."
2. Categoria com maior variação: "Seus gastos com [categoria] subiram/caíram X%."
3. Maior gasto individual do mês: "Maior gasto: [descrição] (R$ X)."
4. Alerta de orçamento: "Orçamento de [categoria] está em X%." (só se ≥ 80%)

Se não houver mês anterior com dados, mostra apenas as frases possíveis.

### 6.6 Dashboard — gráficos
- **Pizza:** despesas do mês por categoria (cores das categorias).
- **Barras:** receitas vs. despesas dos últimos 6 meses.
- **Linha:** saldo acumulado mês a mês (últimos 6 meses).
- Seletor de mês no topo (afeta os cards do mês; gráficos históricos são fixos nos últimos 6 meses).

### 6.7 Backup
- **Exportar:** baixa `backup-controle-pessoal-AAAA-MM-DD.json` com todas as tabelas.
- **Importar:** substitui todos os dados atuais (confirmação obrigatória mostrando o que será perdido).

### 6.8 Tema
- Claro/escuro via classe `dark` do Tailwind, salvo em `settings`. Padrão: preferência do sistema.

## 7. Dados de exemplo (seed)

Na primeira execução (flag `seeded` ausente):
- 8 categorias padrão: Moradia 🏠, Alimentação 🍽️, Transporte 🚗, Lazer 🎮, Saúde 💊, Mercado 🛒, Outros 📦 (despesa); Salário 💰 (receita).
- ~25 transações distribuídas no mês atual e anterior (salário + gastos variados).
- 2 orçamentos definidos (Alimentação, Lazer).
- 1 meta ("Reserva de emergência", R$ 5.000) com 2 aportes.
- 3 hábitos ("Beber água" diário, "Fazer exercícios" seg/qua/sex, "Ler" diário) com logs nos últimos ~20 dias (com falhas realistas para mostrar streaks).

Botão "zerar dados" nos Ajustes remove tudo e **não** re-seeda (recomeça em branco).

## 8. Estrutura de pastas

```
controle-ia/
├── index.html
├── package.json
├── vite.config.js
├── src/
│   ├── main.jsx
│   ├── App.jsx              # rotas + layout (sidebar/bottom-nav)
│   ├── db/
│   │   ├── db.js            # schema Dexie
│   │   └── seed.js          # dados de exemplo
│   ├── utils/
│   │   ├── money.js         # formatar/parsear R$ ↔ centavos
│   │   ├── dates.js         # formatação dd/mm/aaaa, mês atual, etc.
│   │   ├── streaks.js       # cálculo de streak atual e recorde
│   │   └── summary.js       # frases do Resumo Inteligente
│   ├── components/          # componentes reutilizáveis (Modal, ProgressBar, ...)
│   └── pages/
│       ├── Dashboard.jsx
│       ├── Transacoes.jsx
│       ├── Orcamento.jsx
│       ├── Metas.jsx
│       ├── Categorias.jsx
│       ├── Habitos.jsx
│       └── Ajustes.jsx
└── docs/superpowers/specs/  # esta spec
```

## 9. Testes

Vitest, apenas nas funções puras críticas:
- `money.js` — formatação e parse de R$ (entradas com vírgula, milhar, inválidas).
- `streaks.js` — streak diário, streak com dias da semana, streak não quebra hoje, recorde.
- `summary.js` — frases corretas com/sem mês anterior, divisão por zero.

UI testada manualmente via `npm run dev`.

## 10. Ordem de construção

1. Scaffolding (Vite + Tailwind + Router + Dexie) + layout de navegação
2. Categorias (CRUD simples, base para o resto)
3. Transações (CRUD + filtros + totais do mês)
4. Orçamento
5. Metas + aportes
6. Dashboard (gráficos + Resumo Inteligente)
7. Hábitos + streaks
8. Ajustes (tema, backup, zerar) + seed de dados de exemplo
9. Polimento responsivo + revisão final

## 11. Fora de escopo (v1)

- Integração entre finanças e hábitos
- Gamificação (pontos, níveis, conquistas) — candidata à v2
- Transações recorrentes automáticas
- Multi-usuário, sincronização em nuvem, PWA/offline-first formal
- Edição em grade estilo Excel
