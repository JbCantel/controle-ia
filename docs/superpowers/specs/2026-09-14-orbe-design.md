# ORBE — reconstrução do app de finanças e rotina

**Data:** 14/09/2026 · **Status:** design aprovado, aguardando revisão desta spec
**Branch:** `orbe` (neste repositório `controle-ia`)

## 1. Contexto

O ORBE foi um redesign da v1 "Controle Pessoal", feito em junho de 2026. O código nunca foi para o GitHub, e a pasta foi apagada em 14/09/2026. Os **dados sobreviveram** no IndexedDB do Chrome (perfil "Profile 7", origin `http://localhost:5174`, banco Dexie `OrbeFinanceiro`, versão IDB 20 = Dexie version 2). Eles foram extraídos e guardados fora do repositório:

- `C:\Users\joaob\backups-sites\orbe-dados-recuperados-2026-09-14.json` (JSON legível)
- `C:\Users\joaob\backups-sites\orbe-indexeddb-5174-2026-09-14\` (arquivos leveldb brutos)

Fontes da reconstrução: a foto do Painel (girada 90°), o briefing `orbe-prompt-claude-code.md` do usuário e o schema real recuperado. **Onde a foto e o briefing divergem, vale a foto.** Onde o briefing e os dados divergem, vale o que foi aprovado nesta spec.

## 2. Objetivo e critérios de sucesso

1. Ao rodar `npm run dev` e abrir `http://localhost:5174` no Chrome "Profile 7", os dados reais aparecem **sem nenhum passo manual**, e nenhuma linha existente é alterada ou perdida.
2. O Painel reproduz o visual da foto: tema escuro, verde como acento, títulos serif, mesma disposição.
3. As 6 seções funcionam de ponta a ponta: Painel, Transações, Orçamento, Metas, Categorias e Hábitos.
4. Backup exportável e importável em JSON.
5. JS inicial abaixo de 150 KB gzip; contraste AA em todo texto; utilizável de 320px a 1440px.
6. Código protegido no GitHub desde a primeira etapa, sem nenhum dado pessoal versionado.

## 3. Escopo

**Dentro:** as 6 seções, recorrência mensal de transações, previsão de metas, rotina semanal com calendário do mês, backup (exportar, importar, limpar tudo), boas-vindas para banco vazio.

**Fora desta versão:** lembrete automático de backup, excluir categoria movendo as transações para outra, dados de exemplo, tema claro, gamificação, ligação entre hábito e categoria de gasto, sincronização em nuvem.

## 4. Stack e estrutura

React 19 · Vite 8 · Tailwind CSS v4 · Dexie 4 + dexie-react-hooks · Recharts 3 · React Router 7 · lucide-react · @fontsource (Instrument Serif, Inter variable) · Vitest + fake-indexeddb.

`vite.config.js`: `server` e `preview` com `port: 5174, strictPort: true`. **A porta não pode mudar**, porque os dados ficam presos ao endereço.

```
src/
  main.jsx, App.jsx          roteamento com React.lazy por página
  index.css                  tokens (@theme) e base
  domain/                    funções puras, sem Dexie nem React, 100% testadas
    money.js                 centavos, formatação R$, parse de input BR
    dates.js                 datas ISO locais, meses, dias da semana pt-BR
    budget.js                limite efetivo, status do orçamento
    goals.js                 acumulado, previsão
    routine.js               bloco atual, % do dia, sequência e recorde
    recurrence.js            ocorrências devidas
    backup.js                montagem e validação do JSON
  db/
    db.js                    schema Dexie (versions 2 e 3)
    recurrences.js           aplica recurrence.js dentro de transação Dexie
    backupIO.js              exportar (download), importar e limpar (transação única)
  components/
    layout/                  Sidebar, BottomNav, PageHeader, StorageCard, DatePill, MonthSwitcher
    ui/                      Card, StatCard, Modal, ConfirmDialog, Button, Field, MoneyInput,
                             ProgressBar, Badge, EmptyState, Tabs
  pages/
    Painel.jsx, Transacoes.jsx, Orcamento.jsx, Metas.jsx, Categorias.jsx
    habitos/ Habitos.jsx, Hoje.jsx, Semana.jsx, Mes.jsx
```

Da v1, saem `Dashboard`, `Ajustes`, `useTheme`, `seed.js`, `summary.js` e `streaks.js`, além do banco `controle-pessoal`. `money.js` e `dates.js` são migrados para `domain/` e continuam com seus testes.

## 5. Modelo de dados

### 5.1 Convenções

- **Valores** em reais (`number`), sempre gravados arredondados a 2 casas (`Math.round(x * 100) / 100`), porque esse é o formato dos dados existentes. **Toda soma é feita em centavos inteiros** (`domain/money.js`) e convertida só na borda.
- **Datas** em `'YYYY-MM-DD'` e **meses** em `'YYYY-MM'`, sempre construídas no fuso local.
- **Dia da semana:** `'seg' | 'ter' | 'qua' | 'qui' | 'sex' | 'sab' | 'dom'`.
- **Tipo de bloco:** `'pessoal' | 'trabalho' | 'pausa' | 'saude' | 'estudo' | 'sono'`.
- **Tipo de transação e categoria:** `'receita' | 'despesa'`.

### 5.2 Schema

```js
export const db = new Dexie('OrbeFinanceiro');

// Versão 2: idêntica ao banco recuperado. NÃO ALTERAR.
db.version(2).stores({
  transactions:  '++id, categoryId, date, type',
  categories:    '++id, name, type',
  budgets:       '++id, &[month+categoryId], categoryId, month',
  goals:         '++id, name',
  contributions: '++id, date, goalId',
  habits:        '++id, active, day, time',
  habitChecks:   '++id, &[habitId+date], date, habitId',
});

// Versão 3: só acréscimos.
db.version(3).stores({
  transactions: '++id, categoryId, date, type, recurrenceId',
  recurrences:  '++id',
});
```

**Regra de ouro da migração:** a declaração da versão 2 nunca sai do código, e nenhuma tabela é declarada como `null`. Se um dia as versões forem consolidadas numa só, essa versão precisa listar **todas** as tabelas, porque o Dexie apaga object stores que não constam no schema resultante. A versão 3 não tem função `upgrade`, já que nenhum registro precisa ser reescrito.

### 5.3 Registros

| Tabela | Campos |
|---|---|
| transactions | `type`, `value`, `date`, `categoryId`, `description`, `recurrenceId?` |
| categories | `name`, `type`, `color` (hex) |
| budgets | `month`, `categoryId`, `limit` (`number` ou `null` = sem limite), `onlyThisMonth?` (bool) |
| goals | `name`, `target`, `deadline?` (`'YYYY-MM-DD'`) |
| contributions | `goalId`, `value` (positivo = aporte, negativo = resgate), `date` |
| habits | `day`, `time` (`'HH:MM'`), `endTime`, `name`, `kind`, `order`, `active` (bool) |
| habitChecks | `habitId`, `date` |
| recurrences | `type`, `value`, `categoryId`, `description`, `dayOfMonth` (1–31), `startMonth`, `lastGeneratedMonth`, `active` (bool) |

## 6. Regras de negócio

### 6.1 Transações

- **Validação:** valor > 0 (input com máscara BR; o decimal americano `10.50` é rejeitado), data obrigatória, tipo obrigatório, categoria obrigatória e do mesmo tipo, descrição obrigatória (máx. 80 caracteres).
- **Lista do mês:** consulta `where('date').between(início, fim)`; filtros por tipo e categoria; busca na descrição sem diferenciar maiúsculas nem acentos.
- **Totais** do conjunto filtrado: entradas, saídas e saldo.

### 6.2 Recorrência

- **Criação:** o checkbox "Repetir todo mês" só existe ao *criar* uma transação. Ele cria a regra com `startMonth = mês(data)`, `dayOfMonth = dia(data)`, `lastGeneratedMonth = mês(data)` e grava a transação com `recurrenceId`.
- **Geração** (`domain/recurrence.js`, função pura): para cada regra ativa, os meses candidatos vão de `próximo(lastGeneratedMonth)` até o mês atual.
  - A data de cada ocorrência é `mês + min(dayOfMonth, últimoDia(mês))`.
  - A ocorrência só é gerada se a data for **menor ou igual a hoje**.
  - `lastGeneratedMonth` avança até o último mês gerado.
- **Execução** (`db/recurrences.js`): inserções e atualização do marcador numa única transação Dexie `rw`. Roda ao abrir o app e depois de criar, editar ou retomar uma regra. Rodar duas vezes seguidas não gera nada novo.
- **Apagar um lançamento gerado:** ele não é recriado, porque o marcador já passou daquele mês.
- **Editar um lançamento gerado:** altera só aquele lançamento.
- **Editar a regra** (valor, categoria, descrição, dia): vale só para as próximas gerações.
- **Pausar:** `active = false`.
- **Retomar:** `active = true` e `lastGeneratedMonth = max(lastGeneratedMonth, mês anterior ao atual)`, sem preencher os meses em que ficou pausada.
- **Excluir a regra:** remove a regra e limpa `recurrenceId` dos lançamentos dela. Os lançamentos continuam.

### 6.3 Categorias

- Nome obrigatório e único por tipo, sem diferenciar maiúsculas nem acentos.
- Cor escolhida na paleta de categorias (§8.1).
- O tipo só pode ser alterado se a categoria não estiver em uso.
- **Excluir é bloqueado** se houver transações, orçamentos ou recorrências usando a categoria. A mensagem diz quantos usos existem.

### 6.4 Orçamento

- **Limite efetivo** (`effectiveLimit(budgets, categoryId, month)`):
  1. Se existe linha do próprio mês, vale o `limit` dela.
  2. Senão, vale a linha mais recente com `month` anterior e `onlyThisMonth` falso.
  3. Senão, não há limite.

  `limit: null` significa "sem limite".
- **Editar "a partir deste mês":** faz upsert da linha (mês, categoria) com `onlyThisMonth: false` e apaga as linhas **posteriores** dessa categoria que não são `onlyThisMonth`.
- **Editar "só este mês":** faz upsert com `onlyThisMonth: true`.
- **Remover limite:** mesmas duas opções, gravando `limit: null`.
- **Gasto** = soma das despesas da categoria no mês. Status pelo percentual `gasto / limite`:
  - `ok` abaixo de 80% (verde)
  - `alerta` de 80% a 99% (âmbar)
  - `estourado` a partir de 100% (vermelho), com o texto "estourou R$ X"

  Com limite 0, qualquer gasto conta como estourado.
- **Topo da tela:** soma dos limites efetivos contra a soma dos gastos das categorias com limite.

### 6.5 Metas

- **Validação:** nome obrigatório, alvo > 0, prazo opcional.
- **Excluir meta:** pede confirmação e apaga os aportes dela.
- **Aporte e resgate:** valor > 0 e data (padrão: hoje). O resgate é gravado negativo e não pode passar do acumulado.
- **Previsão** (`forecastGoal`):
  - `acumulado` = soma dos aportes; `falta = alvo − acumulado`.
  - Se `falta ≤ 0`, a meta está **concluída**. Sem aportes, a mensagem é "registre aportes para estimar".
  - `meses decorridos` = do mês do primeiro aporte até o mês atual, inclusive (mínimo 1).
  - `ritmo = acumulado / meses decorridos`. Se `ritmo ≤ 0`, a mensagem é "sem ritmo para estimar".
  - `chegada = mês atual + ceil(falta / ritmo)`.
  - Com prazo, `necessário por mês = falta / max(1, meses entre o mês atual e o mês do prazo)`, e `no prazo = chegada ≤ mês do prazo`.
  - Caso de teste (fictício): alvo 100.000, um aporte de 12.000 em jun/2026, mês atual set/2026, prazo 2028-01-01. Resultado: 4 meses decorridos, ritmo 3.000/mês, falta 88.000, chegada **mar/2029** (set/2026 + 30 meses), 16 meses até o prazo, precisa de **R$ 5.500/mês**, fora do prazo.

### 6.6 Rotina (Hábitos)

- **Blocos do dia** = `habits` ativos com `day` igual ao dia da semana da data, ordenados por `time` e depois `order`.
- **Bloco atual** (só quando a data vista é hoje): `time ≤ agora < endTime`. Se `endTime < time` (atravessa a meia-noite, como 23:00–07:00), vale `agora ≥ time` ou `agora < endTime`.
- **% do dia** = blocos marcados ÷ blocos do dia. Dia sem blocos ou no futuro vale `null` ("sem rotina").
- **Dia bom:** % ≥ 80%.
- **Sequência atual:** percorre de hoje para trás.
  - Hoje conta se já for bom; se não for, é ignorado sem quebrar.
  - Dias `null` são ignorados.
  - Dia bom soma 1; dia não bom encerra a contagem.
  - O limite é a data da primeira marcação.
- **Recorde:** a maior sequência no histórico, com as mesmas regras.
- **Marcar** cria `habitChecks {habitId, date}`; **desmarcar** apaga. É possível marcar dias passados, mas não futuros.
- **Bloco:** nome obrigatório, `time` e `endTime` em `HH:MM` e diferentes entre si, dia e tipo obrigatórios.
- **Excluir bloco:** pede confirmação e apaga as marcações dele.
- Editar ou excluir blocos altera os percentuais de dias passados. Esse comportamento é aceito.

### 6.7 Painel (mês selecionado M, padrão: mês atual)

- **Indicadores:**
  - **Saldo do mês** = receitas − despesas de M (legenda "Receitas menos despesas").
  - **Receitas** (legenda "N entradas no mês") e **Despesas** (legenda "N saídas no mês").
  - **Total guardado** = soma de todos os aportes com data até o fim de M (legenda "N metas ativas", onde ativa = acumulado < alvo).
- **Evolução do saldo:** os 6 meses terminando em M. Cada ponto é o **saldo acumulado** (todas as receitas − despesas até o fim daquele mês). Tooltip mostra o valor.
- **Gastos por categoria:** despesas de M agrupadas, com a cor de cada categoria. Tooltip mostra valor e %. Sem despesas, estado vazio "Nenhuma despesa neste mês".
- **Movimentações recentes:** as 5 transações mais recentes com data até o fim de M (data desc, id desc).

### 6.8 Backup

- **Exportar** baixa `orbe-backup-AAAA-MM-DD.json`:
  ```json
  { "app": "ORBE", "format": 1, "exportedAt": "<ISO>", "dbVersion": 3,
    "tables": { "transactions": [], "categories": [], "budgets": [], "goals": [],
                "contributions": [], "habits": [], "habitChecks": [], "recurrences": [] } }
  ```
- **Importar** aceita dois formatos:
  1. o formato acima;
  2. o formato recuperado `{ "app": "ORBE", "tabelas": { "<nome>": { "linhas": [] } } }`.

  **Validação:** as tabelas obrigatórias (todas exceto `habitChecks` e `recurrences`) precisam ser arrays. Cada linha passa por checagem mínima de tipos: `id` inteiro, enums válidos, datas no formato, números finitos. O erro aponta tabela e linha.
- **Aplicação:** depois de confirmar ("isto substitui todos os dados atuais"), limpa e grava tudo numa **única transação `rw`**. Se falhar, nada muda. Os IDs originais são preservados.
- **Limpar tudo:** exige digitar `APAGAR` e limpa as 8 tabelas.
- **Boas-vindas:** quando `categories` e `transactions` estão vazias, o Painel mostra um cartão com "Importar backup" e "Começar do zero". "Começar do zero" cria as categorias padrão: Moradia, Alimentação, Transporte, Lazer e Saúde (despesa); Salário e Freelance (receita), com as cores do §8.1.

## 7. Telas

### 7.1 Moldura

- **Desktop (≥768px):** menu lateral fixo de 232px.
  - No topo, emblema circular verde + "ORBE" + "Finanças pessoais".
  - Seis itens com ícone lucide, na ordem Painel, Transações, Orçamento, Metas, Categorias, Hábitos. O ativo usa fundo `brand-soft` e borda `brand-line`.
  - No rodapé, o cartão de armazenamento: rótulo "ARMAZENAMENTO", "Seus dados ficam neste navegador. Sem nuvem e sem login." e as ações Exportar, Importar e Limpar tudo.
- **Celular (<768px):** barra inferior fixa com os 6 itens (ícone + rótulo curto, alvo ≥ 44px). O armazenamento abre num modal por um ícone no cabeçalho.
- **Cabeçalho de página:**
  - À esquerda: etiqueta verde em caixa alta ("FINANÇAS PESSOAIS", ou "ROTINA" em Hábitos), título serif e subtítulo secundário.
  - À direita: pílula com a data de hoje ("14 de set. de 2026") e ícone de calendário; nas telas por mês, também `MonthSwitcher` ("‹ setembro de 2026 ›").
  - **Rótulos em caixa alta existem só na etiqueta do cabeçalho e no cartão de armazenamento.**
- **Títulos por tela:** Painel "Visão geral" / "Seu dinheiro, com contexto."; Transações "Transações"; Orçamento "Orçamento"; Metas "Metas"; Categorias "Categorias"; Hábitos "Rotina".

### 7.2 Painel (conforme a foto)

- Linha 1: 4 `StatCard` (1 coluna <480px, 2 colunas de 480–1023px, 4 colunas ≥1024px). Cada um tem emblema circular com a cor a 12% e ícone na cor cheia, rótulo, valor grande tabular e legenda. Cores: saldo `brand`, receitas `income`, despesas `expense`, guardado `amber`.
- Linha 2 (≥1024px, grid 3fr/2fr; empilha abaixo disso):
  - **Evolução do saldo** (título serif, subtítulo "Últimos seis meses"): linha `brand` de 2px, área com gradiente para transparente, sem grade, eixo X só com os meses abreviados, sem eixo Y.
  - **Gastos por categoria** (subtítulo "Distribuição deste mês"): rosca de anel grosso com buraco grande e sem rótulos nas fatias; legenda com ponto colorido + nome.
- Linha 3: **Movimentações recentes** (subtítulo "Os últimos cinco lançamentos"). Cada linha tem descrição em cima, "categoria · dd/mm/aaaa" embaixo e o valor à direita, verde se receita (`+ R$`) e vermelho se despesa (`- R$`).

### 7.3 Transações

- Cabeçalho com `MonthSwitcher` e botão "Nova transação".
- Barra de filtros: segmentado Todas/Receitas/Despesas, select de categoria, busca.
- Três mini totais (entradas, saídas, saldo).
- Lista agrupada por dia ("seg, 14 de set.") com editar e excluir (com confirmação); selo "recorrente" quando a regra existe.
- Modal de transação conforme §6.1 e §6.2.
- Seção "Recorrências": cada regra mostra descrição, valor, "todo dia N", categoria e status, com as ações Editar, Pausar/Retomar e Excluir.

### 7.4 Orçamento

- `MonthSwitcher`, cartão-resumo (orçado × gasto) e uma linha por categoria de despesa: nome com ponto de cor, "R$ gasto de R$ limite", `ProgressBar` com o status do §6.4, e o selo "só este mês" quando a linha for dessas.
- Sem limite, a linha mostra "Definir limite".
- O modal de limite tem valor e escopo ("A partir deste mês" / "Só este mês"), além de "Remover limite".

### 7.5 Metas

- Grade de cartões por meta: nome, "R$ acumulado de R$ alvo", barra, "falta R$", prazo e a frase de previsão (§6.5).
- Botões Aportar e Resgatar, e histórico expansível com excluir.
- Botão "Nova meta"; editar e excluir no cartão.

### 7.6 Categorias

- Duas colunas (Despesas / Receitas; empilham no celular).
- Cada item tem ponto de cor, nome e contagem de usos, com editar e excluir (§6.3).
- Modal com nome, tipo e paleta de cores.

### 7.7 Hábitos (Rotina)

Abas **Hoje · Semana · Mês**.

- **Hoje:**
  - Navegação ‹ dia › com atalho "Hoje".
  - Barra "N de M blocos · P%".
  - Linha do tempo com horário, checkbox, nome e selo do tipo na cor do tipo. O bloco atual tem borda `brand` e o texto "agora".
  - Dia sem blocos mostra um estado vazio com link para a aba Semana.
- **Semana:**
  - Seletor seg–dom com o nº de blocos de cada dia e a lista de blocos do dia escolhido.
  - Botão "Novo bloco"; editar e excluir.
  - No desktop ≥1024px, as 7 colunas lado a lado em modo compacto.
- **Mês:**
  - `MonthSwitcher`, cartões "Sequência atual" e "Recorde".
  - Calendário seg–dom com cada dia colorido pelo %: ≥80% `brand`, 50–79% `amber`, 1–49% `expense` a 60%, 0% `line`, `null` vazio.
  - Clicar num dia abre a aba Hoje naquela data.

## 8. Identidade visual

### 8.1 Tokens (`@theme` em `src/index.css`)

Nenhuma cor literal fora deste bloco, exceto as cores de categoria, que são dados.

| Token | Valor | Uso |
|---|---|---|
| `bg` | `#080B0A` | fundo da página |
| `surface` | `#0F1513` | cartões |
| `line` | `rgb(255 255 255 / 0.07)` | bordas |
| `brand` | `#45C98A` | marca, saldo positivo, linha do gráfico, foco |
| `brand-soft` | `#12241C` | fundo do item ativo |
| `brand-line` | `#1E4634` | borda do item ativo |
| `ink` | `#E9EFEB` | texto principal |
| `ink-2` | `#7E8C87` | texto secundário (5,3:1 sobre `surface`) |
| `ink-3` | `#74817C` | legendas e eixos (4,55:1 sobre `surface`) |
| `deco` | `#5A6662` | só elementos não textuais (3,1:1) |
| `expense` | `#E06B5A` | despesa, estourado |
| `income` | `#4CC3B5` | emblema de receitas |
| `amber` | `#E8B04B` | total guardado, alerta |
| `chart-purple` / `chart-orange` / `chart-cyan` / `chart-pink` | `#A78BFA` / `#F0A44C` / `#6FCFD8` / `#F0728F` | gráficos |

- **Cores dos tipos de bloco:** trabalho `chart-cyan`, pessoal `chart-purple`, saúde `brand`, estudo `chart-orange`, sono `#8CB8FF`, pausa `ink-2`.
- **Paleta de categorias** (a original do ORBE, recuperada dos dados): `#8b7cf6`, `#f5a65b`, `#56b4d3`, `#e8739c`, `#55c995`, `#65d39b`, `#8cb8ff`, mais `#d9c26a` e `#9aa5a1`.
- **Raios:** cartão 16px; `StatCard` 14px; pílulas totalmente arredondadas.
- **Sombras:** nenhuma.
- **Emblemas:** `color-mix(in srgb, <cor> 12%, transparent)` no fundo.
- **Foco:** anel `brand` de 2px com offset de 2px em todo elemento focável.

### 8.2 Tipografia

Duas famílias, empacotadas via `@fontsource`, só o subconjunto latin, `font-display: swap`:

- **Instrument Serif 400:** título da página (34px no celular / 44px no desktop) e títulos de cartão/seção (22px). Nunca em números.
- **Inter (variable):** todo o resto.
  - Valor de indicador: 26px, peso 600.
  - Rótulos: 13px `ink-2`.
  - Legendas: 12px `ink-3`.
  - Etiqueta: 11px, caixa alta, `letter-spacing: 0.14em`, `brand`.
- `font-variant-numeric: tabular-nums` em todo valor monetário, hora e percentual.

## 9. Desempenho e acessibilidade

- **Divisão de código:** `React.lazy` por página; Recharts só no chunk do Painel. Meta: JS inicial < 150 KB gzip, verificado no relatório do `vite build`.
- **Consultas:** usam os índices (`date` entre limites, `goalId`, `[habitId+date]`). Agregados vêm de funções puras de `domain/` com `useMemo`.
- **Sem layout shift:** cartões e gráficos com altura reservada durante o carregamento (`useLiveQuery` inicia `undefined`).
- **Movimento:** transições de 150ms só em cor e opacidade, desligadas com `prefers-reduced-motion`.
- **Teclado e leitores de tela:**
  - Tudo alcançável por teclado.
  - Modais prendem o foco, fecham com Esc e devolvem o foco ao gatilho.
  - Ícones sem texto têm `aria-label`.
  - Gráficos têm `aria-label` com um resumo textual.
- **Responsivo:** testado em 320, 768, 1024 e 1440px, sem rolagem horizontal da página.
- Um único `<h1>` por tela: o título do cabeçalho.

## 10. Testes

- **Unitários (Vitest, TDD — teste antes da implementação), em `domain/`:**
  - somas em centavos, formatação e parse BR
  - `effectiveLimit` (próprio mês, herança, `onlyThisMonth`, `null`) e status
  - `forecastGoal`, incluindo o caso de referência do §6.5
  - bloco atual atravessando meia-noite, % do dia, sequência e recorde pulando dias `null`
  - recorrência: dia 31 em fevereiro, data futura não gera, idempotência, retomada sem preencher lacuna
  - validação do backup nos dois formatos, com erro apontando tabela e linha
- **Migração (Vitest + fake-indexeddb):** cria `OrbeFinanceiro` só com a versão 2 e linhas no formato recuperado (**dados fictícios**), fecha, reabre com o `db.js` real e verifica: todas as linhas idênticas, `recurrences` existe, índice `recurrenceId` existe, nenhuma tabela sumiu.
- **Ensaio de reconexão:** Playwright com Chromium isolado, cópia do leveldb real em `Default\IndexedDB\http_localhost_5174.indexeddb.leveldb` e o app servido na porta 5174. Critério: os totais do Painel de jun/2026, o Total guardado e a contagem de blocos da Semana batem com o JSON recuperado (fora do repositório), conferidos por script e não digitados à mão. **Nada disso acontece no Chrome do usuário, e nenhum valor real é escrito no repositório.**
- **Ponta a ponta (Playwright, instalado fora do `package.json`):** criar, editar e excluir em cada tela; recorrência; exportar → limpar → importar; capturas em 320, 768, 1024 e 1440px; comparação do Painel com a foto de referência, com lista de diferenças.
- **Dados pessoais nunca entram no repositório.** Fixtures são fictícias; `.gitignore` inclui `orbe-*.json`.

## 11. Git, entrega e checkpoints

- Branch `orbe`, com um commit por etapa (mensagens em português) e **push para `origin/orbe` ao fim de cada etapa**. O repositório é público, daí a regra de dados do §10.
- **Etapas:**
  1. Tokens, fontes, moldura e navegação (telas vazias), `db.js` v3 + teste de migração, backup (exportar/importar/limpar) e boas-vindas
  2. Transações + recorrências
  3. Categorias
  4. Orçamento
  5. Metas
  6. Hábitos (Hoje, Semana, Mês)
  7. Painel
  8. Otimização (bundle, contraste, reduced-motion), ponta a ponta, ensaio de reconexão e README curto (como rodar, porta 5174, perfil do Chrome, backup)
- **Checkpoints com o usuário:** depois das etapas 2, 6 e 8. Em cada um, informar o que testar e aguardar retorno.
- **Merge na `master`** depois do checkpoint 3 aprovado.
- **Primeira abertura no Chrome real** só depois do ensaio de reconexão passar.
