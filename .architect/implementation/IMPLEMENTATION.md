# Módulo de Implementação — Architect Engine

**Versão:** 1.0.0
**Data:** 2026-03-22

---

## Visão Geral

Este módulo organiza o trabalho de implementação baseado na auditoria completa do projeto. Use este documento como ponto de entrada para todas as tarefas de desenvolvimento.

---

## Estrutura do Módulo

```
.architect/implementation/
├── IMPLEMENTATION.md      ← Este arquivo (visão geral)
├── SPRINT_BACKLOG.md      ← Backlog de sprints e estimativas
├── TASK_TRACKER.md        ← Tracker de tarefas em execução
├── SPEC_SECURITY.md       ← Especificação das regras de segurança
└── README.md              ← Como usar este módulo
```

---

## Quick Start

### 1. Selecionar uma tarefa

Consulte `SPRINT_BACKLOG.md` para ver as tarefas priorizadas.

### 2. Verificar dependências

Consulte `TASK_TRACKER.md` para ver dependências e blockers.

### 3. Criar branch

```bash
git checkout -b feature/IMP-XXX-description
```

### 4. Implementar com TDD

```bash
# Escreva o teste primeiro
npm test

# Implemente a funcionalidade
# ...

# Valide
npm run build && npm test && npm run lint && npm run typecheck
```

### 5. Testar com o engine

```bash
# Testar novo arquivo com o engine
node bin/architect.js run src/rules/NovaRegra.ts

# Ou via CLI instalada
architect run src/rules/NovaRegra.ts
```

### 6. Atualizar tracker

Marque a tarefa como DONE no `TASK_TRACKER.md`.

---

## Fluxo de Trabalho

```
[PLANNING] → [DEV] → [TEST] → [REVIEW] → [MERGE] → [DEPLOY]
     ↑______________|_______|________|__________|
                    (se necessário iterar)
```

---

## Comandos do Architect

```bash
# Análise completa
npm run build && npm test && npm run lint && npm run typecheck

# Executar engine em arquivo específico
architect run src/rules/SecurityRules.ts

# Ver regras registradas
architect rules

# Executar em modo JSON (para CI/CD)
architect run src/ --json
```

---

## Critérios de Qualidade

Para uma tarefa ser considerada completa, deve atender:

- [ ] Testes passando (`npm test`)
- [ ] Sem erros de lint (`npm run lint`)
- [ ] Sem erros de tipo (`npm run typecheck`)
- [ ] Build passando (`npm run build`)
- [ ] Engine validando código gerado (`architect run <file>`)
- [ ] Documentação atualizada

---

## Referências

- Auditoria completa: `docs/plans/AUDIT.md`
- PRD: `docs/PRD.md`
- Especificação técnica: `docs/specs/v1.md`
- Regras de segurança: `.architect/security/rules.md`

---

"O módulo está montado. Execute com precisão."
