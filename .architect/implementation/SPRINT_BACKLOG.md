# Sprint Backlog — Architect Engine v2.1

**Versão:** 1.0.0
**Status:** Sprint 1 Concluído
**Atualizado:** 2026-03-22

---

## ✅ Sprint 1: Segurança & Instalador (Concluído)

| Subtask                                   | ID      | Prioridade | Status  | Estimativa |
| ----------------------------------------- | ------- | ---------- | ------- | ---------- |
| Corrigir e testar install.sh              | IMP-003 | ALTA       | ✅ DONE | 2h         |
| Implementar regra XSS Detection (SEC-003) | IMP-001 | ALTA       | ✅ DONE | 4h         |
| Implementar regra PII Exposure (SEC-004)  | IMP-002 | ALTA       | ✅ DONE | 4h         |
| Atualizar CHANGELOG.md                    | IMP-004 | MEDIA      | ✅ DONE | 1h         |
| Atualizar PRD.md (roadmap)                | IMP-005 | MEDIA      | ✅ DONE | 1h         |

**Total:** 5/5 (100%) ✅

---

## 🎯 Sprint 2: Qualidade & Testes (Pendente)

### Objetivo

Aumentar cobertura de testes e melhorar qualidade do código.

| Subtask                                            | ID      | Prioridade | Status  | Estimativa |
| -------------------------------------------------- | ------- | ---------- | ------- | ---------- |
| Adicionar testes para CLI (run, staged, init)      | IMP-006 | MEDIA      | PENDING | 6h         |
| Adicionar testes para DesignRules                  | IMP-007 | MEDIA      | PENDING | 3h         |
| Adicionar testes para LoggingRules                 | IMP-008 | MEDIA      | PENDING | 2h         |
| Adicionar Integration Tests                        | IMP-009 | MEDIA      | PENDING | 4h         |
| Alterar ESLint: no-explicit-any de warn para error | IMP-010 | BAIXA      | PENDING | 1h         |

**Estimativa total:** 16h
**Critério de aceite:** 4/5 subtarefas completas

---

## SPRINT 3: Extensibilidade & CLI (Baixa Prioridade)

### Objetivo

Adicionar recursos de configuração e extensibilidade.

| Subtask                                             | ID      | Prioridade | Status  | Estimativa |
| --------------------------------------------------- | ------- | ---------- | ------- | ---------- |
| Implementar architect config (CLI interativo)       | IMP-011 | BAIXA      | PENDING | 6h         |
| Implementar architect init --template=react         | IMP-012 | BAIXA      | PENDING | 8h         |
| Adicionar método para desabilitar regras em runtime | IMP-013 | BAIXA      | PENDING | 3h         |
| Implementar trigger before_generation               | IMP-014 | BAIXA      | PENDING | 4h         |

**Estimativa total:** 21h
**Critério de aceite:** 2/4 subtarefas completas

---

## 📊 Métricas de Acompanhamento

| Sprint   | Estimativa | Status    | Progresso |
| -------- | ---------- | --------- | --------- |
| Sprint 1 | 12h        | Concluído | 100% ✅   |
| Sprint 2 | 16h        | Planning  | 0%        |
| Sprint 3 | 21h        | Planning  | 0%        |

---

## 🔗 Dependencies

- IMP-003 precisa ser mergeado antes de IMP-001, IMP-002
- IMP-006, IMP-007, IMP-008 dependem de IMP-001, IMP-002 (regras implementadas)
- IMP-011 precisa IMP-010 (ESLint config)

---

## 🚀 Fluxo de Trabalho

1. Selecionar subtask do backlog
2. Criar branch: `feature/IMP-XXX-description`
3. Implementar com TDD
4. Executar `npm test && npm run lint && npm run typecheck`
5. Executar `architect run src/` para validar
6. Criar PR e merge
7. Atualizar este documento

---

"Priorize segurança. Execute com rigor. Itere com precisão."
