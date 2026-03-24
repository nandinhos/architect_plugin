# Plano de Execução — Architect Engine v2.2

**Status:** Em Execução
**Autor:** Arquiteto Sinistro
**Data:** 2026-03-23
**Versão Alvo:** 2.2.0

---

## Visão Geral

```
SPRINT 1 (Segurança + Triggers — 2 dias)
├── Stack 1: Segurança .............. [P0] ████████░░
├── Stack 2: Trigger System ......... [P0] ████████░░
└── Gate: architect staged FUNCIONA

SPRINT 2 (Config + Custom Rules — 3 dias)
├── Stack 3: Config por Projeto ..... [P1] ██████░░░░
├── Stack 4: Regras Customizadas .... [P1] ██████░░░░
└── Gate: .architect/config.json É RESPEITADO

SPRINT 3 (Qualidade + Features — 3 dias)
├── Stack 5: AST Analyzer ........... [P2] ████░░░░░░
├── Stack 6: Dashboard Integration .. [P2] ████░░░░░░
├── Stack 7: Testes & Cobertura ..... [P2] ██████░░░░
└── Gate: cobertura ≥80%

SPRINT 4 (Polimento — 1 dia)
├── Stack 8: Documentação ........... [P3] ████░░░░░░
└── Gate: release v2.2.0
```

| Sprint   | Duração | Entregável Principal               |
| -------- | ------- | ---------------------------------- |
| Sprint 1 | 2 dias  | Sistema seguro + `staged` funciona |
| Sprint 2 | 3 dias  | Config real + regras customizadas  |
| Sprint 3 | 3 dias  | AST robusto + cobertura ≥80%       |
| Sprint 4 | 1 dia   | Docs sincronizadas + release       |

**Total estimado:** 9 dias úteis.

---

## Dependências entre Stacks

```
Stack 1 (Segurança) ─────────────────┐
                                      ├──→ Stack 3 (Config) ──→ Stack 4 (Custom Rules)
Stack 2 (Triggers) ──────────────────┤
                                      ├──→ Stack 7 (Testes)
                                      │
Stack 5 (AST) ───────────────────────┤
                                      │
Stack 6 (Dashboard) ────────────────┘
                                      └──→ Stack 8 (Docs)
```

Stacks 1, 2 e 5 são **independentes** — podem rodar em paralelo.

---

## Stack 1 — SEGURANÇA [P0]

**Status:** ✅ CONCLUÍDO
**Responsável:** Engine Core
**Branch:** `fix/security`
**Risco se ignorar:** Command injection em produção

- [x] 1.1 — `src/cli/index.ts:53` — Substituir `execSync` por `execFileSync('git', [...])`
- [x] 1.2 — `src/cli/index.ts:60` — Substituir `execSync` por `execFileSync('git', [..., filename])`
- [x] 1.3 — `src/rules/SecurityRules.ts` — Remover auto-fix de SEC-001 — `fixed: false` + suggestions
- [x] 1.4 — `src/rules/SecurityRules.ts` — Remover auto-fix de SEC-002 — `fixed: false` + suggestions
- [x] 1.5 — `src/rules/SecurityRules.ts` — Revisar auto-fix de SEC-003 — `fixed: false` + sugestões com DOMPurify
- [x] 1.6 — `src/rules/SecurityRules.ts` — Revisar auto-fix de SEC-004 — `fixed: false` + sugestões de masking
- [~] 1.7 — Tests — Adicionar testes para `execFileSync` — **movido para Stack 7**

**Critério de aceite:** ✅ CLI sem command injection, auto-fixes que não corrompem código.

**Validação:**

```bash
npm run build && npm test && npm run lint && npm run typecheck
# build ✅ test 61/61 ✅ lint ✅ typecheck ✅
```

---

## Stack 2 — TRIGGER SYSTEM [P0]

**Status:** ✅ CONCLUÍDO
**Responsável:** Engine Core
**Branch:** `fix/triggers`
**Risco se ignorar:** `architect staged` é no-op (não aplica nenhuma regra)

- [x] 2.1 — `src/cli/index.ts:165` — Alterar `runOnStaged` para usar trigger `'after_generation'`
- [x] 2.2 — Decisão: `after_generation` para tudo, `pre_commit` mantido em types.ts mas sem regras específicas
- [~] 2.3 — Tests — staged blocked — **movido para Stack 7** (requer git repo setup)
- [~] 2.4 — Tests — staged ok — **movido para Stack 7** (requer git repo setup)

**Decisão tomada:** Consolidar com `after_generation`. Manter `pre_commit` no type system para futuro uso.

**Critério de aceite:** ✅ `architect staged` usa `after_generation` e aplica todas as regras.

**Validação:**

```bash
npm run build && npm test && npm run lint && npm run typecheck
# build ✅ test 61/61 ✅ lint ✅ typecheck ✅
```

**Validação:**

```bash
npm run build && npm test && npm run lint && npm run typecheck
```

---

## Stack 3 — CONFIGURAÇÃO POR PROJETO [P1]

**Responsável:** CLI + Engine
**Branch:** `feat/config`
**Depende de:** Stack 1
**Risco se ignorar:** `.architect/config.json` é criado pelo init mas ignorado pelo engine

- [ ] 3.1 — `src/engine/RuleEngine.ts` — Adicionar `loadConfig(configPath: string)` que lê JSON e aplica `autoFix`, `failOn`, `rules.enabled`
- [ ] 3.2 — `src/engine/RuleRegistry.ts` — Adicionar `enable(id)` / `disable(id)` — flag boolean por regra, não remover do array
- [ ] 3.3 — `src/cli/index.ts:15` — Substituir `ENGINE` hardcoded por: ler `.architect/config.json` se existir, senão usar defaults
- [ ] 3.4 — `src/cli/index.ts:478` — `enableRule`/`disableRule` devem chamar `ENGINE.enableRule(id)` além de salvar JSON
- [ ] 3.5 — Tests — engine com `TEST-001: disabled` não deve flagar arquivo sem teste
- [ ] 3.6 — Tests — `loadConfig` com JSON inválido deve usar defaults e logar warning

**Critério de aceite:** `architect config disable LOG-001` efetivamente desabilita a regra no runtime.

**Validação:**

```bash
npm run build && npm test && npm run lint && npm run typecheck
```

---

## Stack 4 — REGRAS CUSTOMIZADAS [P1]

**Responsável:** Engine + CLI
**Branch:** `feat/custom-rules`
**Depende de:** Stack 3
**Risco se ignorar:** PRD promete extensibilidade que não existe

- [ ] 4.1 — `src/rules/RuleFactory.ts` (novo) — Criar `createRule(config)` factory function que aceita `{id, name, trigger, severity, validate, enforce}` e retorna `BehaviorRule`
- [ ] 4.2 — `src/index.ts` — Exportar `createRule` na API pública
- [ ] 4.3 — `src/cli/index.ts` — Adicionar `loadCustomRules(dir)` — escaneia `.architect/rules/*.ts/.js`, faz `require()`, registra regras válidas
- [ ] 4.4 — `src/cli/index.ts:17` — Chamar `loadCustomRules('.architect/rules')` após registrar regras padrão
- [ ] 4.5 — Validation — Regra customizada deve ter `id`, `name`, `trigger`, `severity`, `validate` antes de registrar
- [ ] 4.6 — Tests — Criar regra custom em fixture, carregar, executar, verificar resultado (E2E)
- [ ] 4.7 — Docs — Atualizar `PRD.md` seção 6.1 com exemplo real de `createRule`

**Critério de aceite:** Usuário pode criar `.architect/rules/meu-projeto.ts` com regras próprias.

**Validação:**

```bash
npm run build && npm test && npm run lint && npm run typecheck
```

---

## Stack 5 — AST ANALYZER [P2]

**Responsável:** Code Quality Rules
**Branch:** `feat/ast-improvements`
**Risco se ignorar:** Arquivos React/TSX não são analisados corretamente

- [ ] 5.1 — `src/rules/ASTAnalyzer.ts:57` — Detectar extensão — usar `ts.ScriptKind.TSX` para `.tsx`/`.jsx`, `TS` para `.ts`/`.js`
- [ ] 5.2 — `src/rules/ASTAnalyzer.ts` — Adicionar detecção de `console.log` via AST (complementa LOG-001 regex)
- [ ] 5.3 — `src/rules/ASTAnalyzer.ts` — Adicionar métrica de complexidade ciclomática básica (contar `if/else/switch/for/while` aninhados)
- [ ] 5.4 — Tests — Arquivo `.tsx` com JSX válido não deve ter parse errors
- [ ] 5.5 — Tests — Função com 3 `if` aninhados é flagged como alta complexidade

**Critério de aceite:** AST analyzer suporta React e detecta complexidade.

**Validação:**

```bash
npm run build && npm test && npm run lint && npm run typecheck
```

---

## Stack 6 — DASHBOARD INTEGRATION [P2]

**Responsável:** Components
**Branch:** `feat/dashboard`
**Depende de:** Stack 3
**Risco se ignorar:** Classe `ArchitectDashboard` existe mas nunca é usada

- [ ] 6.1 — `src/cli/index.ts` — Adicionar comando `architect health` que instancia `ArchitectDashboard`, verifica 3 protocolos, mostra score
- [ ] 6.2 — `src/components/ArchitectDashboard.ts` — Adicionar método `getDetailedStatus()` com protocolos ativos/inativos e razão
- [ ] 6.3 — `src/components/ArchitectDashboard.ts` — Verificar existência real de `.architect/design/tokens.json` (design), regras segurança ativas (security), `.architect/skills/` (senior)
- [ ] 6.4 — `src/cli/index.ts` — Adicionar `architect health --json` para CI/CD
- [ ] 6.5 — Tests — Projeto com 3 protocolos ativos retorna score 100
- [ ] 6.6 — Tests — Projeto sem `.architect/` retorna score 0

**Critério de aceite:** `architect health` mostra status real do projeto.

**Validação:**

```bash
npm run build && npm test && npm run lint && npm run typecheck
```

---

## Stack 7 — TESTES & COBERTURA [P2]

**Responsável:** Quality Assurance
**Branch:** `chore/test-coverage`
**Depende de:** Stacks 1, 2, 3, 4

- [ ] 7.0a — Teste para `execFileSync` (herdado de Stack 1.7) — filenames com espaços e caracteres especiais
- [ ] 7.0b — Testes para `architect staged` blocked/ok (herdado de Stack 2.3/2.4) — setup de git repo temporário
- [ ] 7.1 — `src/cli/cli.test.ts` — Testes para `architect staged` — mock git diff, verificar análise
- [ ] 7.2 — `src/cli/cli.test.ts` — Testes para `architect config enable/disable` — verificar JSON atualizado
- [ ] 7.3 — `src/rules/SecurityRules.test.ts` (novo) — Testes dedicados para SEC-003 (XSS) e SEC-004 (PII)
- [ ] 7.4 — `src/rules/DesignRules.test.ts` — Testes para enforce (auto-fix) de DesignRules
- [ ] 7.5 — `src/engine/RuleEngine.test.ts` (novo) — Testes isolados: error handling, empty rules, autoFix behavior
- [ ] 7.6 — Coverage — Executar `npm run test:coverage` — target ≥80% em branches

**Critério de aceite:** Cobertura ≥80%, todos os comandos CLI testados.

**Validação:**

```bash
npm run build && npm test -- --coverage && npm run lint && npm run typecheck
```

---

## Stack 8 — DOCUMENTAÇÃO [P3]

**Responsável:** Docs
**Branch:** `docs/sync`
**Depende de:** Todas as stacks de código

- [ ] 8.1 — `package.json:3` — Sincronizar versão para `2.2.0`
- [ ] 8.2 — `README.md:1` — Atualizar header para versão correta
- [ ] 8.3 — `docs/specs/v1.md:277` — Atualizar "18 passing tests" para número real
- [ ] 8.4 — `PRD.md:285` — Marcar roadmap v2.1 items como `[x]` implementados
- [ ] 8.5 — `CHANGELOG.md` — Adicionar entry v2.2.0 com todas as correções deste plano
- [ ] 8.6 — `docs/plans/AUDIT.md` — Atualizar ou arquivar — muitos itens já foram corrigidos

**Critério de aceite:** Documentação consistente e atualizada.

**Validação:**

```bash
grep -r "2.1.0" . --include="*.md" --include="*.json"
# Não deve retornar resultados (tudo em 2.2.0)
```

---

## Comando de Validação Global

```bash
# Após cada stack
npm run build && npm test && npm run lint && npm run typecheck

# Antes do merge de cada sprint
npx architect staged
npm run test:coverage
```

---

## Log de Execução

| Sprint | Stack                  | Status       | Data       | Notas                            |
| ------ | ---------------------- | ------------ | ---------- | -------------------------------- |
| 1      | Stack 1 (Segurança)    | ✅ Concluído | 2026-03-23 | execFileSync + auto-fix removido |
| 1      | Stack 2 (Triggers)     | ✅ Concluído | 2026-03-23 | after_generation para staged     |
| 2      | Stack 3 (Config)       | ⬜ Pendente  | —          | —                                |
| 2      | Stack 4 (Custom Rules) | ⬜ Pendente  | —          | —                                |
| 3      | Stack 5 (AST)          | ⬜ Pendente  | —          | —                                |
| 3      | Stack 6 (Dashboard)    | ⬜ Pendente  | —          | —                                |
| 3      | Stack 7 (Testes)       | ⬜ Pendente  | —          | Herda 1.7, 2.3, 2.4              |
| 4      | Stack 8 (Docs)         | ⬜ Pendente  | —          | —                                |

### Validação Sprint 1

```
build:      ✅
test:       61/61 passing
lint:       0 errors
typecheck:  0 errors
```

---

"Plano sem execução é apenas documentação. Execute."
