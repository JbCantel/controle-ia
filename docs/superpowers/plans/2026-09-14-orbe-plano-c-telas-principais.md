# ORBE — Plano C: Categorias, Orçamento, Metas e Rotina (etapas 4–7)

**Objetivo:** concluir as quatro telas funcionais restantes sobre o banco recuperado, preservando as regras da spec e encerrando no Checkpoint 3.

**Arquitetura:** regras puras em `src/domain/` com TDD; mutações atômicas e testáveis em `src/db/`; páginas lazy em pastas próprias; componentes compartilhados apenas quando duas ou mais telas realmente usam o mesmo padrão.

**Fonte de verdade:** `docs/ORBE-BRIEFING-MULTIAGENTE.md` e `docs/superpowers/specs/2026-09-14-orbe-design.md`, especialmente §§6.3–6.6, 7.4–7.7 e 12.

## Restrições globais

- Não alterar `SCHEMA_V2`, o nome `OrbeFinanceiro` nem a porta 5174.
- Nenhum dado real em fixtures, testes, capturas, docs ou commits.
- Valores persistidos em reais com duas casas; cálculos em centavos inteiros.
- Toda função de `db/` aceita `{ database, today }` quando aplicável.
- Mutações que validam dependências e depois gravam usam uma única transação Dexie.
- Interface e mensagens em pt-BR; foco visível; alvos de toque; `prefers-reduced-motion`.
- Um commit por tarefa; push para `origin/orbe` ao fim de cada etapa.
- Checkpoint 3 somente depois da Etapa 7 e dos roteiros ponta a ponta.

---

## Etapa 4 — Categorias

### Tarefa 4.1 — Regras de domínio por TDD

**Arquivos:**

- Modificar: `src/domain/categories.js`
- Criar: `src/domain/categories.test.js`

**Interfaces:**

- `validateCategory(input, categories, currentId?)`
- `summarizeCategoryUsage(categoryId, { transactions, budgets, recurrences })`
- `categoryUsageMessage(usage)`

**Casos obrigatórios:**

- nome vazio;
- nome duplicado no mesmo tipo ignorando caixa, espaços e acentos;
- mesmo nome em tipos diferentes é permitido;
- edição ignora o próprio registro;
- cor precisa pertencer a `CATEGORY_PALETTE`;
- contagem separada e total de transações, orçamentos e recorrências;
- mensagem singular/plural sem esconder nenhuma dependência.

**Verificação:** `npm test -- src/domain/categories.test.js`.

### Tarefa 4.2 — Persistência atômica

**Arquivos:**

- Criar: `src/db/categories.js`
- Criar: `src/db/categories.test.js`

**Interfaces:**

- `categoryUsageOf(id, { database })`
- `addCategory(data, { database })`
- `updateCategory(id, data, { database })`
- `deleteCategory(id, { database })`

**Regras:**

- unicidade é revalidada dentro da transação, não só no formulário;
- alteração de tipo é bloqueada quando o uso total é maior que zero;
- exclusão é bloqueada se houver qualquer dependência;
- falha de validação não altera nenhuma tabela;
- erros de domínio têm código estável para a interface traduzir sem depender da mensagem interna.

**Verificação:** `npm test -- src/db/categories.test.js`.

### Tarefa 4.3 — Tela e fluxo

**Arquivos:**

- Criar: `src/pages/categorias/Categorias.jsx`
- Criar: `src/pages/categorias/CategoryForm.jsx`
- Criar: `src/pages/categorias/CategoryList.jsx`
- Modificar: `src/App.jsx`

**Fluxo:**

- duas colunas: Despesas e Receitas; empilhar no celular;
- cada linha mostra cor, nome, `N usos`, editar e excluir;
- formulário com nome, tipo e paleta fixa;
- tipo desabilitado ao editar categoria em uso, com explicação;
- exclusão livre usa confirmação; exclusão bloqueada mostra contagem por origem e ação “Entendi”.

**Microcopy:**

- vazio: “Nenhuma categoria de despesa” / “Crie uma categoria para organizar seus lançamentos.”;
- tipo bloqueado: “O tipo não pode mudar enquanto esta categoria estiver em uso.”;
- exclusão bloqueada: “Esta categoria ainda está ligada a … Remova esses usos antes de excluir.”

**Verificação:** testes completos, build e roteiro fictício em 320, 768, 1024 e 1440px.

### Tarefa 4.4 — Entrega da etapa

- conferir criação, duplicidade sem acento, edição, troca de tipo livre/bloqueada e exclusão livre/bloqueada;
- rodar `npm test` e `npm run build`;
- commit por tarefa e `git push origin orbe`.

---

## Etapa 5 — Orçamento

### Tarefa 5.1 — Domínio por TDD

**Arquivos:**

- Criar: `src/domain/budget.js`
- Criar: `src/domain/budget.test.js`

**Interfaces:**

- `effectiveLimit(budgets, categoryId, month)`
- `budgetStatus(spentCents, limitCents)`
- `budgetSummary(categories, budgets, transactions, month)`

**Casos obrigatórios:** próprio mês, herança anterior, descarte de `onlyThisMonth`, `null`, limite zero, 79,99%, 80%, 99,99%, 100% e estouro em centavos.

### Tarefa 5.2 — Persistência atômica

**Arquivos:**

- Criar: `src/db/budgets.js`
- Criar: `src/db/budgets.test.js`

**Interfaces:**

- `setBudgetLimit({ month, categoryId, limit, scope }, { database })`

**Regras:**

- upsert e remoção de linhas posteriores ficam na mesma transação;
- “a partir deste mês” remove apenas linhas posteriores não mensais;
- “só este mês” não altera outros meses;
- remover limite grava `null`, mantendo a mesma semântica de escopo.

### Tarefa 5.3 — Componentes e página

**Arquivos:**

- Criar: `src/components/ui/ProgressBar.jsx`
- Criar: `src/pages/orcamento/Orcamento.jsx`
- Criar: `src/pages/orcamento/BudgetForm.jsx`
- Criar: `src/pages/orcamento/BudgetRow.jsx`
- Modificar: `src/App.jsx`

**Fluxo:** resumo orçado × gasto, uma linha por categoria de despesa, barra com estado sem depender só de cor, selo “só este mês”, ação “Definir limite” e modal com escopo explícito.

**Verificação:** testes, build, troca de mês e roteiro fictício dos três estados.

---

## Etapa 6 — Metas

### Tarefa 6.1 — Domínio por TDD

**Arquivos:**

- Criar: `src/domain/goals.js`
- Criar: `src/domain/goals.test.js`

**Interfaces:**

- `goalProgress(goal, contributions, endDate?)`
- `forecastGoal(goal, contributions, currentMonth)`
- `validateGoal(input)`
- `validateContribution(input, currentTotalCents, mode)`

**Casos obrigatórios:** caso de referência da spec, concluída, sem aportes, ritmo zero/negativo, prazo passado, prazo no mês atual, resgate igual ao total e resgate acima do acumulado.

### Tarefa 6.2 — Persistência

**Arquivos:**

- Criar: `src/db/goals.js`
- Criar: `src/db/goals.test.js`

**Interfaces:** CRUD de meta, aporte, resgate e exclusão de contribuição.

**Regras:** excluir meta e aportes na mesma transação; resgate é revalidado dentro da transação; exclusão de aporte pode reduzir uma meta concluída para ativa.

### Tarefa 6.3 — Tela

**Arquivos:**

- Criar: `src/pages/metas/Metas.jsx`
- Criar: `src/pages/metas/GoalCard.jsx`
- Criar: `src/pages/metas/GoalForm.jsx`
- Criar: `src/pages/metas/ContributionForm.jsx`
- Criar: `src/pages/metas/ContributionHistory.jsx`
- Modificar: `src/App.jsx`

**Fluxo:** cartões com acumulado/alvo/falta, previsão em frase, prazo, barra, aporte/resgate, histórico expansível e confirmações destrutivas.

**Verificação:** testes, build, meta sem aporte, meta atrasada, meta concluída e ciclo aporte→resgate→exclusão.

---

## Etapa 7 — Hábitos / Rotina

### Decisão necessária antes da Tarefa 7.1

A spec não define se blocos de um mesmo dia podem se sobrepor. Antes da implementação, confirmar com o usuário uma das opções:

1. permitir sobreposição, preservando flexibilidade e compatibilidade com os dados existentes;
2. bloquear sobreposição, explicando qual bloco causa o conflito.

Até essa decisão, Etapas 4–6 podem avançar normalmente.

**Decisão adotada em 2026-09-15:** permitir sobreposição, conforme a recomendação apresentada no checkpoint e a instrução subsequente para continuar a criação. A ordenação permanece determinística por horário, `order` e ID.

### Tarefa 7.1 — Datas e domínio por TDD

**Arquivos:**

- Modificar: `src/domain/dates.js` e teste correspondente quando necessário;
- Criar: `src/domain/routine.js`
- Criar: `src/domain/routine.test.js`

**Interfaces:** blocos do dia, bloco atual atravessando meia-noite, progresso diário, calendário mensal, sequência atual e recorde.

**Casos obrigatórios:** data futura, dia sem blocos, hoje incompleto ignorado, dias `null` ignorados, dia abaixo de 80% quebrando sequência, primeiro check como limite histórico e bloco noturno.

### Tarefa 7.2 — Persistência

**Arquivos:**

- Criar: `src/db/routine.js`
- Criar: `src/db/routine.test.js`

**Interfaces:** CRUD de bloco, marcar/desmarcar e exclusão em cascata das marcações.

**Regras:** futuro bloqueado; par `[habitId+date]` idempotente; bloco e checks excluídos na mesma transação.

### Tarefa 7.3 — Abas e páginas

**Arquivos:**

- Criar: `src/components/ui/Tabs.jsx`
- Criar: `src/pages/habitos/Habitos.jsx`
- Criar: `src/pages/habitos/Hoje.jsx`
- Criar: `src/pages/habitos/Semana.jsx`
- Criar: `src/pages/habitos/Mes.jsx`
- Criar: `src/pages/habitos/HabitForm.jsx`
- Modificar: `src/App.jsx`

**Fluxo:**

- Hoje: navegação de data, progresso, linha do tempo, destaque “agora” e marcação;
- Semana: seg–dom, contagem e CRUD;
- Mês: calendário, sequência/recorde e clique levando a Hoje;
- URL preserva aba e data/mês quando isso melhora recarregamento e compartilhamento local.

### Tarefa 7.4 — Checkpoint 3

- roteiro fictício completo nas três abas e quatro larguras;
- ensaio de reconexão na cópia isolada antes de abrir o Chrome real;
- `npm test`, `npm run build`, detector visual e inspeção das capturas;
- push para `origin/orbe`;
- abrir no Chrome real e aguardar aprovação do usuário antes da Etapa 8.
