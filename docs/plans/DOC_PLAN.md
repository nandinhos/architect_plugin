# Plano de Documentação Viva — Architect Engine

**Contexto:** Sistema em mutação constante. Documentação precisa acompanhar desenvolvimento sem ficar desatualizada.

**Princípio:** Fonte única de verdade (SOT) para cada tipo de informação.

---

## Fontes de Verdade (SOT)

| Informação                  | Fonte                                   | Atualização             |
| --------------------------- | --------------------------------------- | ----------------------- |
| Versão                      | `package.json` + `src/engine/tokens.ts` | A cada release          |
| Regras                      | `src/rules/*.ts` (código-fonte)         | A cada feature de regra |
| CLI comandos                | `src/cli/index.ts` (switch case)        | A cada comando novo     |
| Métricas (testes, coverage) | CI pipeline (jest --coverage)           | Automática no CI        |
| Roadmap                     | `docs/plans/ROADMAP_SENIOR.md`          | A cada sprint           |
| Changelog                   | `CHANGELOG.md`                          | A cada release          |
| API pública                 | `src/index.ts` (exports)                | A cada export novo      |

---

## Arquivos de Documentação

### Prioridade Alta (manter sempre atualizado)

| Arquivo                        | O que contém                   | Quando atualizar        |
| ------------------------------ | ------------------------------ | ----------------------- |
| `README.md`                    | Quickstart, comandos, métricas | A cada release          |
| `CHANGELOG.md`                 | Histórico de mudanças          | A cada commit relevante |
| `docs/plans/ROADMAP_SENIOR.md` | Roadmap 90 dias                | A cada sprint           |
| `docs/plans/EXECUTION_PLAN.md` | Plano de execução por stacks   | A cada sprint           |

### Prioridade Média (atualizar a cada 2-3 sprints)

| Arquivo            | O que contém               | Quando atualizar              |
| ------------------ | -------------------------- | ----------------------------- |
| `docs/PRD.md`      | Product Requirements       | A cada mudança de escopo      |
| `docs/specs/v1.md` | Especificação técnica      | A cada mudança de arquitetura |
| `AGENTS.md`        | Instruções para agentes IA | A cada mudança de protocolo   |
| `.cursorrules`     | Regras para Cursor         | Idem AGENTS.md                |
| `GEMINI.md`        | Instruções para Gemini     | Idem AGENTS.md                |

### Prioridade Baixa (atualizar esporadicamente)

| Arquivo                           | O que contém            | Quando atualizar              |
| --------------------------------- | ----------------------- | ----------------------------- |
| `docs/plans/AUDIT.md`             | Auditoria técnica       | A cada 4 sprints              |
| `docs/plans/DESIGN.md`            | Decisões de design      | A cada mudança de arquitetura |
| `DEV_GUIDE.md`                    | Guia de desenvolvimento | A cada mudança de setup       |
| `.github/copilot-instructions.md` | Instruções para Copilot | Idem AGENTS.md                |

---

## Gatilhos de Atualização

### A cada feature commit

- [ ] Métricas no README.md batem com `npm test` real
- [ ] Exportações em `src/index.ts` documentadas se necessário

### A cada sprint (30 dias)

- [ ] CHANGELOG.md entry com resumo da sprint
- [ ] ROADMAP_SENIOR.md log de execução atualizado
- [ ] EXECUTION_PLAN.md status atualizado
- [ ] README.md métricas atualizadas (testes, coverage)

### A cada release (major/minor)

- [ ] Versão sincronizada: package.json + tokens.ts + README
- [ ] CHANGELOG.md entry completa (Added/Changed/Fixed)
- [ ] PRD.md roadmap atualizado
- [ ] specs/v1.md métricas atualizadas

### A cada mudança de arquitetura

- [ ] specs/v1.md atualizado
- [ ] AGENTS.md + .cursorrules + GEMINI.md sincronizados
- [ ] DESIGN.md se houver decisões de design novas

---

## Validação de Documentação (CI)

Criar script `scripts/check-docs.js` que verifica:

```javascript
// Verificações:
// 1. Versão em package.json == tokens.ts
// 2. Contagem de testes no README == npm test output
// 3. Regras listadas no README == regras em src/rules/
// 4. CLI comandos no README == switch case em src/cli/index.ts
// 5. CHANGELOG tem entry para versão atual
```

Adicionar ao CI pipeline como step de validação.

---

## Checklist Sprint (Template)

Ao final de cada sprint, executar:

- [ ] `npm test` — contar testes
- [ ] `npm run test:coverage` — verificar coverage
- [ ] Atualizar README.md com métricas reais
- [ ] Adicionar CHANGELOG.md entry
- [ ] Atualizar ROADMAP_SENIOR.md log
- [ ] Verificar se exports em index.ts estão documentados
- [ ] Verificar se novos comandos CLI estão no README
- [ ] Commit docs + push

---

"Documentação que não se atualiza sozinha é documentação mentirosa."
