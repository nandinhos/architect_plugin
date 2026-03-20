# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2026-03-20

### Breaking Changes

- **Renamed package:** `architect_plugin` → `architect-ai` (npm: `architect-ai`)
- **Versão semântica:** 1.0.0 → 2.0.0 (breaking rewrite do engine)

### Added

- **Rule Engine Runtime:** `RuleEngine`, `RuleRegistry`, `DecisionEngine` — arquitetura completa de rules-as-code
- **6 Regras MVP:** SEC-001 (SQLi), SEC-002 (eval/exec), TEST-001 (test required), CQ-001 (anti-patterns), LOG-001 (no console), DES-001 (design tokens)
- **CLI completo:** `architect run`, `architect staged`, `architect rules`, `architect init`, `architect version`
- **Comando `init`:** Inicializa `.architect/` em qualquer projeto com um comando interativo
- **Autofix hooks:** `enforce()` em todas as regras com sugestões de correção
- **DesignValidator:** Heurística para cores hardcoded, gradientes genéricos, placeholders, emojis
- **AntiPattern detection:** Funções longas, `any` explícito, nomes genéricos, arquivos >300 linhas
- **Tokens embebidos:** `src/engine/tokens.ts` como módulo standalone (sem dependência de JSON externo)
- **One-line installer:** `curl -fsSL .../install.sh | sh` — instala em qualquer projeto em 30 segundos
- **API pública exports:** RuleEngine, types, todas as regras exportadas de `src/index.ts`
- **package.json refatorado:** `bin`, `keywords`, metadata completos para publicação npm

### Changed

- **src/index.ts:** Reescrito como API pública do engine (RuleEngine, types, rules exports)
- **README.md:** Atualizado com foco em instalação one-line e uso rápido
- **PRD.md:** Novo documento com spec v2.0 completa e arquitetura real
- **ARCHITECT.md:** Atualizado com nova estrutura de engine
- **docs/specs/v1.md:** Marcado roadmap com status de implementação

### Removed

- **Husky/lint-staged do install:** Removidos do install.sh (opcionais via `architect init`)
- **Guide.md:** Reduzido a stub de compatibilidade (removido em sessão anterior)
