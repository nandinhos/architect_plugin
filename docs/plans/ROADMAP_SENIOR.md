# Roadmap Senior — Architect Engine (90 dias)

**Baseado em:** Analise tecnica senior de 2026-03-24
**Status:** Em Execucao
**Versao alvo final:** 2.5.0

---

## Visao Geral

```
Sprint 1 (30d): Correcoes Estruturais e Coerencia
├── T1.1 [P0] Corrigir paths .architect/ — init vs health
├── T1.2 [P0] Corrigir staged: getFileDiff usar --cached
├── T1.3 [P0] Implementar verificacao real de arquivo de teste (TEST-001)
├── T1.4 [P0] Corrigir parser de --template=v no init
├── T1.5 [P1] runOnDir recursivo
├── T1.6 [P1] Uniformizar semantica de severidade (blocked/warned)
└── T1.7 [P1] Atualizar documentacao e CHANGELOG

Sprint 2 (30d): Refatoracao Modular da CLI
├── T2.1 [P1] Extrair parser de argumentos do CLI
├── T2.2 [P1] Extrair adapters de FS/Git do CLI
├── T2.3 [P1] Extrair presenter de relatorios do CLI
├── T2.4 [P1] Resolver DES-001 vs DES-002/003/004 (DesignRules)
├── T2.5 [P1] Corrigir tryFix — estrategia de merge por arquivo
├── T2.6 [P1] Testes de integracao por comando CLI
└── T2.7 [P1] Atualizar documentacao e CHANGELOG

Sprint 3 (30d): Regras Semanticas e Performance
├── T3.1 [P2] SEC-001: AST para SQL injection (substituir regex)
├── T3.2 [P2] SEC-003: AST para XSS (substituir regex)
├── T3.3 [P2] Adicionar analise de data-flow basico
├── T3.4 [P2] Paralelismo na execucao de regras
├── T3.5 [P2] Cache incremental (hash de arquivo)
├── T3.6 [P2] Telemetria opcional (tempo por regra)
└── T3.7 [P2] Atualizar documentacao e CHANGELOG
```

---

## Sprint 1 — Correcoes Estruturais e Coerencia (30 dias)

Resolve gaps P0 e inconsistencias que quebram funcionalidades basicas.

### T1.1 [P0] Corrigir paths .architect/ — init vs health

**Gap:** init grava `.architect/tokens.json`, health exige `.architect/design/tokens.json`
**Arquivos:** `src/cli/index.ts:388`, `src/components/ArchitectDashboard.ts:56`
**Acao:** init deve criar subdiretorio `design/` e gravar `design/tokens.json`
**Criterio de aceite:** `architect init` + `architect health` retorna score 100

### T1.2 [P0] Corrigir staged: getFileDiff usar --cached

**Gap:** `getFileDiff()` usa `git diff HEAD` em vez de `git diff --cached`
**Arquivo:** `src/cli/index.ts:107`
**Acao:** Trocar para `git diff --cached HEAD -- filename`
**Criterio de aceite:** staged analisa apenas conteudo staged, nao working tree

### T1.3 [P0] Verificacao real de arquivo de teste (TEST-001)

**Gap:** Regra constroi nome do teste mas nao verifica se existe em disco
**Arquivo:** `src/rules/TestRules.ts:27-50`
**Acao:** Chamar `existsSync(testFilePath)` antes de emitir issue
**Criterio de aceite:** Arquivo com `.test.ts` correspondente nao gera false positive

### T1.4 [P0] Corrigir parser de --template=v no init

**Gap:** So aceita `--template react`, nao `--template=react`
**Arquivo:** `src/cli/index.ts:359-366`
**Acao:** Parse de `--template=valor` alem de `--template valor`
**Criterio de aceite:** `architect init --template=react` cria config com primary do React

### T1.5 [P1] runOnDir recursivo

**Gap:** Diretorios sao ignorados com `continue`
**Arquivo:** `src/cli/index.ts:255`
**Acao:** Trocar `continue` por chamada recursiva `runOnDir(full)`
**Criterio de aceite:** `architect run src/` analisa arquivos em subpastas

### T1.6 [P1] Uniformizar semantica de severidade

**Gap:** Especificacao fala "HIGH exige correcao" mas engine retorna `warned`
**Arquivos:** `DecisionEngine.ts`, `types.ts`, `docs/specs/v1.md`
**Acao:** Decidir e documentar se HIGH = warned ou blocked
**Criterio de aceite:** Especificacao e comportamento consistentes

### T1.7 [P1] Atualizar documentacao e CHANGELOG

**Acao:** Documentar todas as correcoes do Sprint 1
**Criterio de aceite:** CHANGELOG entry, docs sincronizadas

---

## Sprint 2 — Refatoracao Modular da CLI (30 dias)

Resolve acoplamento da CLI e melhora governanca de regras.

### T2.1 [P1] Extrair parser de argumentos do CLI

**Arquivo:** `src/cli/index.ts`
**Acao:** Extrair `parseArgs()` e `parseTemplateFlag()` para `cli/parser.ts`
**Criterio de aceite:** CLI index.ts reduz ~60 linhas

### T2.2 [P1] Extrair adapters de FS/Git do CLI

**Arquivo:** `src/cli/index.ts`
**Acao:** Extrair `getStagedDiff()`, `getFileDiff()`, `readConfig()`, `writeConfig()` para `cli/adapters.ts`
**Criterio de aceite:** Funcoes de IO isoladas e mockaveis

### T2.3 [P1] Extrair presenter de relatorios do CLI

**Arquivo:** `src/cli/index.ts`
**Acao:** Extrair `printReport()`, `printHealth()`, `printRules()` para `cli/presenter.ts`
**Criterio de aceite:** Logica de apresentacao separada

### T2.4 [P1] Resolver DES-001 vs DES-002/003/004

**Gap:** Sub-issues DES-002/003/004 com ruleId DES-001
**Arquivo:** `src/rules/DesignRules.ts`
**Acao:** DECISAO: criar DES-002/003/004 como regras independentes OU usar sub-codes consistentes
**Criterio de aceite:** ruleId do Result == code do Issue principal

### T2.5 [P1] Corrigir tryFix — estrategia de merge por arquivo

**Gap:** Auto-fix concatena sem estrategia de merge
**Arquivo:** `src/engine/DecisionEngine.ts:63-71`
**Acao:** Agrupar fixes por filePath e aplicar em ordem de linha
**Criterio de aceite:** Dois fixes no mesmo arquivo nao duplicam resultado

### T2.6 [P1] Testes de integracao por comando CLI

**Acao:** Testes E2E: run, staged, init, config, health
**Criterio de aceite:** Cada comando tem teste de integracao

### T2.7 [P1] Atualizar documentacao e CHANGELOG

**Criterio de aceite:** Docs atualizadas

---

## Sprint 3 — Regras Semanticas e Performance (30 dias)

Melhora precisao das regras criticas e prepara para escala.

### T3.1 [P2] SEC-001: AST para SQL injection

**Acao:** Usar AST (call expression com concatenacao em args de query)
**Criterio de aceite:** Falso positivo de `"SELECT * FROM" em comentarios` eliminado

### T3.2 [P2] SEC-003: AST para XSS

**Acao:** Usar AST (assignment de innerHTML com operando nao literal)
**Criterio de aceite:** `el.innerHTML = "static"` nao flagga

### T3.3 [P2] Analise de data-flow basico

**Acao:** Nova `DataFlowAnalyzer.ts` — rastrear variaveis de input ate uso perigoso
**Criterio de aceite:** `const x = userInput; el.innerHTML = x;` detectado
**Risco:** Stretch goal — nao bloquear sprint

### T3.4 [P2] Paralelismo na execucao de regras

**Acao:** `Promise.all()` para regras independentes em `run()`
**Criterio de aceite:** Regras independentes executam em paralelo

### T3.5 [P2] Cache incremental

**Acao:** Hash do conteudo do arquivo. Se hash igual, pular re-analise
**Criterio de aceite:** Re-run do mesmo arquivo sem modificacao eh instantaneo

### T3.6 [P2] Telemetria opcional

**Acao:** Medir tempo de cada `rule.validate()`. Logar se > threshold
**Criterio de aceite:** Output mostra tempo por regra

### T3.7 [P2] Atualizar documentacao e CHANGELOG

**Criterio de aceite:** Docs atualizadas

---

## Dependencias

```
Sprint 1 (correcoes) → Sprint 2 (refatoracao) → Sprint 3 (evolucao)
     │                       │                        │
     ├── T1.1 → T2.4        ├── T2.1 → T2.6         ├── T3.4 → T3.6
     ├── T1.2 → T2.2        ├── T2.2 → T2.6         └── Todos → T3.7
     ├── T1.6 → T2.4        └── T2.3 → T2.6
     └── Todos → T1.7
```

---

## Riscos

| Risco                                 | Mitigacao                                                |
| ------------------------------------- | -------------------------------------------------------- |
| T1.1 pode quebrar projetos existentes | Adicionar fallback: verificar raiz se design/ nao existe |
| T3.3 (data-flow) eh complexo          | Marcar como stretch goal                                 |
| T2.6 testes com git sao frageis       | Repositorio git temporario isolado por teste             |

---

## Log de Execucao

| Sprint | Tarefa    | Status       | Data       | Notas                                      |
| ------ | --------- | ------------ | ---------- | ------------------------------------------ |
| 1      | T1.1      | ✅ Concluído | 2026-03-24 | init cria design/tokens.json               |
| 1      | T1.2      | ✅ Concluído | 2026-03-24 | getFileDiff usa --cached                   |
| 1      | T1.3      | ✅ Concluído | 2026-03-24 | TEST-001 verifica existsSync               |
| 1      | T1.4      | ✅ Concluído | 2026-03-24 | --template=valor funciona                  |
| 1      | T1.5      | ✅ Concluído | 2026-03-24 | runOnDir recursivo via scanDir             |
| 1      | T1.6      | ✅ Concluído | 2026-03-24 | JSDoc DecisionAction documenta semântica   |
| 1      | T1.7      | ✅ Concluído | 2026-03-24 | ROADMAP_SENIOR.md criado                   |
| 2      | T2.1      | ✅ Concluído | 2026-03-24 | cli/parser.ts criado                       |
| 2      | T2.2      | ✅ Concluído | 2026-03-24 | cli/adapters.ts criado                     |
| 2      | T2.3      | ✅ Concluído | 2026-03-24 | cli/presenter.ts criado                    |
| 2      | T2.4      | ✅ Concluído | 2026-03-24 | DES-001 separado em 4 regras independentes |
| 2      | T2.5      | ✅ Concluído | 2026-03-24 | tryFix remove duplicatas                   |
| 2      | T2.6      | ✅ Concluído | 2026-03-24 | 24 testes unitários para parser e adapters |
| 2      | T2.7      | ✅ Concluído | 2026-03-24 | Log atualizado                             |
| 3      | T3.1-T3.7 | ⬜ Pendente  | —          | —                                          |

### Validação Sprint 1

```
build:      ✅
test:       118/118 passing
lint:       0 errors
typecheck:  0 errors
```

### Validação Sprint 2

```
build:      ✅
test:       142/142 passing
lint:       0 errors
typecheck:  0 errors
```

---

"Corrigir o basico antes de evoluir."
