# ORBE — briefing de passagem

> Para quem vai assumir este projeto: outra IA ou outra pessoa desenvolvedora.
> Atualizado em **14/09/2026**. Leia inteiro antes de tocar no código ou no navegador do dono.

## 1. Em uma frase

O ORBE é um app web **pessoal** de finanças e rotina (React + Vite + Dexie/IndexedDB, sem servidor e sem login). Está sendo **reconstruído** porque o código original foi apagado. **Os dados do dono sobreviveram no navegador dele**, e o app novo reconecta a eles.

## 2. Situação agora

| | |
|---|---|
| **Fase** | Etapa 3 de 8 concluída. **Checkpoint 2 aguardando retorno do dono** sobre o visual do Painel. |
| **Pronto** | Moldura, backup, Transações com recorrências, Painel da foto, revisão visual. 73 testes passando. |
| **Falta** | Categorias, Orçamento, Metas, Hábitos (rotina), otimização final, README e merge. |
| **Não faça nada antes de** | ter o retorno do checkpoint 2. Se o visual for reprovado, ajuste tokens e Painel **antes** de construir as telas restantes: elas herdam o visual. |

## 3. Quem é o dono e como ele trabalha

- **João Augusto**, designer em transição de WordPress/Elementor para código. Está aprendendo, então explique o que fez em linguagem simples, em **português do Brasil**.
- Regra de ouro dele: **perguntar antes de inventar**. Decisões de produto e visual são dele; decisões técnicas com padrão óbvio podem ser tomadas, desde que avisadas.
- Ele valida por **checkpoints**: você entrega um bloco, abre no navegador dele e espera o retorno.
- Ele tem um `CLAUDE.md` global voltado a sites de clientes (PHP, WhatsApp, LGPD, TurboCloud). **Quase nada disso se aplica aqui**: é um app pessoal e local. A exceção consciente: o `CLAUDE.md` pede Next.js para apps React, mas o ORBE usa **Vite**, porque o original era Vite e roda só localmente, com porta fixa.
- Referência visual que manda em tudo: **uma foto de celular (girada 90°) do Painel original**. Ela vive na conversa, não no repositório. Peça ao dono para salvá-la como `docs/referencia-painel.png` fora do git, ou use as descrições da spec §7.2 e §12.4.

## 4. O que aconteceu (contexto)

1. **Jun/2026:** existia a v1 "Controle Pessoal" (neste mesmo repositório, hoje no histórico da `master`). O dono fez um redesign chamado **ORBE**, que nunca foi para o GitHub.
2. **14/09/2026:** a pasta do ORBE foi apagada. Na Lixeira havia só uma pasta vazia.
3. **Recuperação:** os dados ficam no IndexedDB do Chrome, não na pasta. Foram encontrados em **Chrome "Profile 7", origin `http://localhost:5174`, banco Dexie `OrbeFinanceiro`** (versão IDB 20 = Dexie 2). O banco foi copiado e lido num Chromium isolado com Playwright. O resultado: 7 transações de junho/2026, 7 categorias, 4 orçamentos, 1 meta com 1 aporte e **112 blocos de rotina semanal** (seg–sex).
4. **Descoberta importante:** os "Hábitos" do ORBE eram uma **rotina semanal em blocos de horário**, e não a lista de hábitos simples que o briefing antigo do dono descrevia.
5. Um briefing de recriação escrito pelo dono (`orbe-prompt-claude-code.md`, na Lixeira) trouxe cores e tipografia. A spec incorporou o que foi aprovado.

## 5. Onde está cada coisa

| Item | Local | Observação |
|---|---|---|
| Código | `C:\Users\joaob\OneDrive\Documentos\Sites - Codando\controle-ia` | branch **`orbe`**; `master` intocada (tem a v1) |
| GitHub | `github.com/JbCantel/controle-ia`, branch `orbe` | ⚠️ **repositório PÚBLICO** |
| Spec (design aprovado) | `docs/superpowers/specs/2026-09-14-orbe-design.md` | **§12 substitui partes do §7, §8 e §11** |
| Plano A (etapas 1–2) | `docs/superpowers/plans/2026-09-14-orbe-plano-a-fundacao-transacoes.md` | concluído |
| Plano B (etapa 3) | `docs/superpowers/plans/2026-09-14-orbe-plano-b-visual-painel.md` | concluído |
| Dados vivos do dono | Chrome "Profile 7" → IndexedDB `http://localhost:5174` → `OrbeFinanceiro` | já atualizado para Dexie v3 (IDB 30) |
| Backup legível dos dados | `C:\Users\joaob\backups-sites\orbe-dados-recuperados-2026-09-14.json` | importável pelo app |
| Backup bruto (leveldb) | `C:\Users\joaob\backups-sites\orbe-indexeddb-5174-2026-09-14\` | cópia dos arquivos do Chrome |
| Scripts de verificação | `C:\Users\joaob\backups-sites\orbe-ferramentas\` | **fora do repo de propósito** (usam dados reais) |

Conteúdo de `orbe-ferramentas\`:
- `e2e/transacoes.cjs`, `e2e/painel.cjs`, `e2e/shell.cjs`: roteiros ponta a ponta com perfil limpo e dados fictícios;
- `e2e/reconexao.cjs`: abre o app sobre a **cópia** do banco real e confere os totais contra o dump;
- `extract/dump.cjs` e `extract/dump-5174.json`: extração e dump do banco original;
- `idb-5174/`: leveldb copiado;
- `extract-block.cjs`: copia blocos de código de um plano para o repositório.

Os scripts esperam o Chromium em `%LOCALAPPDATA%\ms-playwright\chromium-1234`; se não existir, rode `npx playwright install chromium` e ajuste a constante `EXE`.

## 6. Regras que não podem ser quebradas

- **Nunca apague nem limpe os dados do Chrome "Profile 7".** É a cópia viva dos dados. Exporte um backup antes de qualquer experimento.
- **A porta é 5174, com `strictPort`.** O IndexedDB é preso à origem; mudar a porta faz os dados "sumirem".
- **Nome do banco `OrbeFinanceiro`.** A declaração `db.version(2)` é idêntica ao banco recuperado e **nunca sai do código**. Versões novas só **acrescentam**. O Dexie apaga object stores que não constam no schema resultante.
- **Teste no Chromium isolado antes do Chrome real.** Qualquer mudança de schema passa primeiro por `e2e/reconexao.cjs`.
- **Nenhum dado real no repositório** (valores, rotina, descrições): nem em fixtures, capturas, commits ou docs. Fixtures são fictícias. O `.gitignore` bloqueia `orbe-*.json`.
- **Dinheiro:** gravado em **reais com 2 casas** (formato herdado) e **somado sempre em centavos inteiros** (`src/domain/money.js`).
- **Sem cor literal** fora do `@theme` de `src/index.css`, exceto as cores de categoria, que são dados. O Tailwind está com `--color-*: initial`: a paleta padrão, `white` e `black` **não existem**.
- **Rótulo em caixa alta** (`eyebrow`) só no cabeçalho de página e no cartão de armazenamento.
- **Interface 100% em pt-BR.** Commits em português, um por tarefa.

## 7. Stack e arquitetura

React 19 · Vite 8 · Tailwind CSS 4 (plugin Vite, tokens em `@theme`) · Dexie 4 + dexie-react-hooks · React Router 7 · Recharts 3 (só no Painel) · lucide-react · Fraunces + Inter via `@fontsource-variable` (fontes locais) · Vitest 4 + fake-indexeddb.

```
src/
  domain/      regras puras e testadas (sem React/Dexie): money, dates, tables, categories,
               backup, recurrence, transactions, dashboard
  db/          db.js (schema), backupIO, recurrences, transactions (+ testes com fake-indexeddb)
  components/
    ui/        Card, CardTitle, Button, IconButton, Modal (foco preso, Esc), ConfirmDialog,
               Field/inputClass, MoneyInput (máscara centavos), Badge, EmptyState, Segmented
    layout/    nav, Brand, Sidebar, BottomNav, MobileTopBar, PageHeader, DatePill,
               MonthSwitcher, StorageCard, DataModal (exportar/importar/limpar)
  hooks/       useMonthParam (mês na URL ?mes=AAAA-MM), useReducedMotion
  pages/       painel/*, transacoes/*, EmBreve.jsx (telas ainda não feitas)
```

Padrões em uso:
- Toda função de `db/` aceita `{ database, today }` opcionais, o que permite testar com banco em memória e data fixa.
- Páginas carregam com `React.lazy`. O JS inicial está em ~115 KB gzip (meta: < 150 KB).
- Leitura do banco com `useLiveQuery` e consultas pelos índices (ex.: `where('date').between(...)`).
- Mês selecionado sempre via `useMonthParam` (URL), para sobreviver a recarregar a página.
- `runDueRecurrences()` roda ao abrir o app e depois de importar backup. Lê e grava numa **única transação rw**, então chamadas simultâneas (StrictMode) não duplicam lançamentos.

## 8. Banco de dados

```js
new Dexie('OrbeFinanceiro');
db.version(2).stores({            // idêntica ao banco recuperado — NÃO ALTERAR
  transactions:  '++id, categoryId, date, type',
  categories:    '++id, name, type',
  budgets:       '++id, &[month+categoryId], categoryId, month',
  goals:         '++id, name',
  contributions: '++id, date, goalId',
  habits:        '++id, active, day, time',
  habitChecks:   '++id, &[habitId+date], date, habitId',
});
db.version(3).stores({            // só acréscimos
  transactions: '++id, categoryId, date, type, recurrenceId',
  recurrences:  '++id',
});
```

| Tabela | Campos |
|---|---|
| transactions | `type` (`receita`/`despesa`), `value` (reais), `date` `AAAA-MM-DD`, `categoryId`, `description`, `recurrenceId?` |
| categories | `name`, `type`, `color` (hex) |
| budgets | `month` `AAAA-MM`, `categoryId`, `limit` (número ou `null` = sem limite), `onlyThisMonth?` |
| goals | `name`, `target`, `deadline?` |
| contributions | `goalId`, `value` (positivo = aporte, negativo = resgate), `date` |
| habits | `day` (`seg`…`dom`), `time`/`endTime` `HH:MM`, `name`, `kind` (`pessoal`/`trabalho`/`pausa`/`saude`/`estudo`/`sono`), `order`, `active` |
| habitChecks | `habitId`, `date` |
| recurrences | `type`, `value`, `categoryId`, `description`, `dayOfMonth`, `startMonth`, `lastGeneratedMonth`, `active` |

Backup exportado: `{ app: "ORBE", format: 1, exportedAt, dbVersion: 3, tables: {…8 tabelas} }`. A importação também aceita o formato recuperado (`{ app: "ORBE", tabelas: { nome: { linhas } } }`), valida linha a linha e substitui tudo numa transação única.

## 9. Identidade visual (resumo — detalhe na spec §12)

- **Tema escuro**, verde como acento único, **sem sombras**; a separação vem de borda fina e fundo levemente mais claro.
- **Tokens:**

  | Token | Cor |
  |---|---|
  | `bg` | `#070A09` |
  | `surface` | `#121A17` |
  | `surface-2` | `#18221E` |
  | `line` | branco 10% |
  | `brand` | `#4FD69A` |
  | `brand-soft` | `#143324` |
  | `brand-line` | `#2B6C4D` |
  | `ink` / `ink-2` / `ink-3` | `#F1F5F3` / `#A6B3AE` / `#8B9994` |
  | `expense` | `#F07C69` |
  | `income` | `#5BD3C4` |
  | `amber` | `#F2BF59` |

  Todos os textos passam AA.
- **Tipografia:** Fraunces 600 nos títulos (página 52px, cartão 20px), **nunca em números**. Inter no resto: valor de indicador 30px/700, texto 15px, rótulo 14px, legenda 13px. `tabular-nums` em todo valor.
- **Painel (fiel à foto):**
  - 4 indicadores (Saldo do mês, Receitas, Despesas, Total guardado), com emblema circular na linha do rótulo;
  - "Evolução do saldo" (área verde, sem grade, sem eixo Y) ao lado de "Gastos por categoria" (rosca com legenda abaixo, em ordem alfabética);
  - "Movimentações recentes" com barra de 3px na cor da categoria.
- **Celular:** menu vira barra inferior; colunas empilham; linhas de lista levam o valor para a segunda linha.

## 10. O que já foi feito

Todos os commits estão na branch `orbe`.

| Etapa | Entrega | Commits |
|---|---|---|
| Spec e Plano A | design aprovado com o dono; plano das etapas 1–2 | `b0959de`, `a8c370c` |
| 1. Fundação | remoção da interface v1, porta 5174, schema v3 com teste de migração, backup (2 formatos, atômico), tokens, componentes, moldura, boas-vindas | `bba93ea` → `8abd2d1` |
| 2. Transações | CRUD, filtros por tipo/categoria, busca sem acento, totais, agrupamento por dia, **recorrência mensal** (gerar sem duplicar, pausar/retomar sem preencher lacuna, excluir mantendo lançamentos) | `0889b38`, `48b8718`, `18a0994` |
| Checkpoint 1 | dono: "o visual ainda não está legal" (apagado, fonte fina, pouco respiro, falta o Painel) | spec §12 + Plano B: `41f9400` |
| 3. Visual + Painel | tokens com mais contraste, Fraunces, tamanhos maiores; agregados do Painel (TDD) e Painel completo | `bc688b3`, `d1a6b2f`, `20f865c`, `f2a0668` |
| Checkpoint 2 | Painel aberto no Chrome real em `/?mes=2026-06` | **aguardando retorno** |

**Verificado:**
- 73 testes unitários e de banco;
- roteiros ponta a ponta de Transações e Painel em 320–1440px, sem erros de console e sem rolagem horizontal;
- ensaio de reconexão: versão 30, as 7 tabelas originais com todas as linhas, totais do Painel e de Transações iguais ao dump.

## 11. Decisões tomadas com o dono

| Tema | Decisão | Por quê |
|---|---|---|
| Onde construir | neste repositório, branch `orbe` | já estava no GitHub; o código não pode existir num lugar só de novo |
| Dados | reconectar ao banco original (mesmo nome e porta) em vez de banco novo + importação | dados reaparecem sem passo manual |
| Extras incluídos | transações recorrentes; previsão das metas | escolha do dono |
| Extras adiados | lembrete de backup; excluir categoria movendo transações | escolha do dono. Por isso, excluir categoria em uso é **bloqueado** |
| Hábitos | rotina semanal (Hoje/Semana) **+ calendário do mês** com % e sequência | aproveita os 112 blocos e dá a visão de constância |
| Acompanhamento | por checkpoints | escolha do dono |
| Visual (checkpoint 1) | mais contraste, Fraunces, mais respiro, Painel antes das outras telas | retorno do dono |
| Dados de exemplo | não há (só "Importar backup" ou "Começar do zero") | o dono tem dados reais |
| Fora desta versão | tema claro, gamificação, ligação hábito↔categoria, nuvem | escopo |

## 12. O que falta

A ordem vale e está na spec §12.1. Cada etapa entrega uma tela funcionando.

### Etapa 4 — Categorias (spec §6.3, §7.6)

- **Layout:** duas colunas (Despesas / Receitas; empilham no celular). Cada item tem ponto de cor, nome, contagem de usos, editar e excluir.
- **Validação:** nome obrigatório e **único por tipo**, sem diferenciar maiúsculas nem acentos (há `normalizeText` em `domain/transactions.js`).
- **Cor:** paleta fixa `CATEGORY_PALETTE` (`domain/categories.js`).
- **Tipo:** só pode mudar se a categoria não estiver em uso.
- **Excluir: bloqueado** se houver transações, orçamentos ou recorrências usando a categoria. A mensagem diz quantos usos existem.

### Etapa 5 — Orçamento (spec §6.4, §7.4)

- **Limite efetivo de um mês:**
  1. linha do próprio mês;
  2. senão, a última linha anterior com `onlyThisMonth` falso;
  3. senão, sem limite.

  `limit: null` = sem limite. Os orçamentos de junho/2026 do dono passam a valer nos meses seguintes por essa regra.
- **Editar:**
  - "a partir deste mês": upsert da linha e remoção das linhas **posteriores** dessa categoria que não são "só este mês";
  - "só este mês": upsert com `onlyThisMonth: true`;
  - "Remover limite": as mesmas duas opções, gravando `null`.
- **Status do gasto:** `ok` abaixo de 80% (verde), `alerta` de 80% a 99% (âmbar), `estourado` a partir de 100% (vermelho, com "estourou R$ X"). Com limite 0, qualquer gasto conta como estourado.
- **Tela:** seletor de mês, resumo orçado × gasto, uma linha por categoria de despesa com barra de progresso, "Definir limite" e selo "só este mês".
- **TDD** das regras em `domain/budget.js`.

### Etapa 6 — Metas (spec §6.5, §7.5)

- **Meta:** nome, alvo > 0, prazo opcional. Excluir a meta apaga os aportes dela (com confirmação).
- **Aportes e resgates:** Aportar/Resgatar com valor > 0 e data. O resgate é gravado negativo e não pode passar do acumulado. Histórico expansível, com excluir.
- **Previsão (`forecastGoal`):**
  - ritmo = acumulado ÷ meses desde o 1º aporte (inclusive o mês atual);
  - chegada = mês atual + ⌈falta ÷ ritmo⌉;
  - com prazo: necessário por mês = falta ÷ meses até o prazo.

  Caso de teste fictício na spec. Estados especiais: "concluída", "registre aportes para estimar", "sem ritmo para estimar".
- **Tela:** grade de cartões com acumulado × alvo, barra, "falta R$", prazo e frase de previsão.

### Etapa 7 — Hábitos / Rotina (spec §6.6, §7.7)

- **Abas:**
  - **Hoje:** navegação ‹ dia ›, barra "N de M blocos · P%", linha do tempo com checkbox e cor por tipo, bloco atual destacado.
  - **Semana:** seg–dom, criar, editar e excluir blocos.
  - **Mês:** calendário colorido por %, sequência atual e recorde. Clicar num dia abre "Hoje" naquela data.
- **Regras:**
  - blocos do dia = ativos do dia da semana, ordenados por `time` e depois `order`;
  - bloco atual atravessa meia-noite quando `endTime < time`;
  - % do dia = marcados ÷ blocos, com `null` sem blocos ou em data futura;
  - dia bom ≥ 80%;
  - sequência: hoje só conta se já for bom (senão é ignorado); dias `null` são ignorados; dia não bom encerra a contagem;
  - marcar dias passados é permitido, futuros não;
  - excluir bloco apaga as marcações dele.
- **Cores por tipo:** trabalho `chart-cyan`, pessoal `chart-purple`, saúde `brand`, estudo `chart-orange`, sono `sleep`, pausa `ink-2`.
- **Checkpoint 3** ao fim desta etapa.

### Etapa 8 — Fechamento

- **Otimização:** manter JS inicial < 150 KB gzip, revisar contraste e `prefers-reduced-motion`.
- **Ponta a ponta:** roteiro de todas as telas e reconexão final.
- **`README.md`:** como rodar, porta 5174, perfil do Chrome e rotina de backup.
- **Checkpoint 4** e, com aprovação, merge de `orbe` na `master`.

## 13. Como trabalhar neste projeto

1. **Planeje por checkpoint.** Os planos ficam em `docs/superpowers/plans/`. O próximo é o **Plano C** (etapas 4–7) e depois o **Plano D** (etapa 8). Siga o formato dos planos A e B: tarefas pequenas, arquivos exatos, código e comandos de verificação.
2. **TDD no domínio:** escreva o teste em `src/domain/*.test.js`, veja falhar, implemente, veja passar. Regras de banco são testadas com fake-indexeddb (`src/db/*.test.js`).
3. **Um commit por tarefa, em português.** Push para `origin/orbe` ao fim de cada etapa.
4. **Verificação visual:** dev server + roteiro Playwright com perfil limpo, capturas em 320/768/1024/1440, `reducedMotion: 'reduce'` para gráficos completos. Olhe as capturas antes de dizer que ficou bom.
5. **Antes de abrir no Chrome real:** rode `e2e/reconexao.cjs`. Só depois abra:
   `chrome.exe --profile-directory="Profile 7" http://localhost:5174`
6. **No checkpoint:** diga ao dono o que testar, em linguagem simples, e **espere o retorno**.

Comandos:
```powershell
npm install          # primeira vez
npm run dev          # http://localhost:5174 (falha se a porta estiver ocupada — de propósito)
npm test             # 73 testes hoje
npm run build        # confere tamanho dos chunks
node C:\Users\joaob\backups-sites\orbe-ferramentas\e2e\reconexao.cjs   # com o dev server no ar
```

## 14. Armadilhas já encontradas

- **Modal dentro de conteúdo condicional some junto com ele.** Aconteceu com a importação: o cartão de boas-vindas desmontava ao chegar dados e levava o modal. Deixe modais fora de blocos condicionados aos dados.
- **Recharts:** cores via `var(--color-*)` funcionam em atributos SVG. Capturas sem `reducedMotion` pegam gráfico no meio da animação e parecem quebradas.
- **Cartões estreitos:** com o menu lateral, a área útil em 1024px é ~700px. Use **container queries** (`@container`, `@xl:`) em vez de breakpoints de tela para grades de valores.
- **PowerShell 5.1:**
  - não tem `&&`;
  - `"texto".Split("abc")` divide por caractere, não por texto;
  - para substituições em arquivo, prefira Node ou o editor.
- **Escapes `\uXXXX`** podem chegar como caractere literal em ferramentas de IA. Em código, use `String.fromCharCode(...)` ou classes como `\s`.
- **Avisos de CRLF do git** são inofensivos.

## 15. Perguntas em aberto para o dono

1. **O visual do Painel foi aprovado** (checkpoint 2)? Se não, o que ainda incomoda?
2. "Evolução do saldo" mostra **6 meses**; a foto mostra 5 rótulos. Manter 6?
3. Manter o **seletor de mês** ao lado da data e o link **"Ver todas"**, que não estão na foto?
4. No celular, os 4 indicadores ficam um embaixo do outro (altos). Tudo bem, ou prefere versão compacta?

## 16. Primeiro dia de quem assume

1. Ler este arquivo, a spec (§6, §7 e **§12**) e o Plano B.
2. `npm install`, `npm test` (73 verdes) e `npm run dev`.
3. Rodar `e2e/reconexao.cjs` para confirmar que o ambiente enxerga a cópia do banco.
4. Obter do dono o retorno do checkpoint 2 e as respostas da seção 15.
5. Escrever o Plano C e começar pela etapa 4 (Categorias).
