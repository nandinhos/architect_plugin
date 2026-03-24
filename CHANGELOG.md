# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.2.0] - 2026-03-23

### Added

- **SEC-003: XSS Detection** — Nova regra critical para detecção de Cross-Site Scripting
  - Detecta `.innerHTML`, `.outerHTML`, `insertAdjacentHTML`, `document.write`
  - Detecta `javascript:` URLs em href
  - Sugestões de correção com DOMPurify e frameworks
- **SEC-004: PII Exposure Detection** — Nova regra high para proteção de dados pessoais
  - Detecta logging de senhas, tokens, API keys, emails, CPFs, CNPJs, cartões
  - 8 patterns de detecção cobrindo principais vetores de exposição
  - Sugestões de masking e remoção de logs sensíveis
- **createRule() factory** — API pública para criação de regras customizadas
  - Validação completa de id, name, trigger, severity, validate
  - Erros descritivos para campos inválidos
  - Exportado em `@architectai/core`
- **architect health** — Comando para verificação de protocolos do projeto
  - Score 0-100 baseado em protocolos ativos
  - Verificação real de arquivos `.architect/`
  - Output JSON para CI/CD (`--json`)
- **ASTAnalyzer melhorias:**
  - Suporte a TSX/JSX via detecção de extensão
  - Detecção de `console.*` via AST (CQ-005)
  - Complexidade ciclomática (CQ-006) — if/for/while/switch/ternary/&&/||
- **RuleRegistry:** `enable()`/`disable()`/`isEnabled()` para controle de regras em runtime
- **RuleEngine:** `loadConfig()` para configuração por projeto via `.architect/config.json`
- **28 novos testes** (total: 119)
- **Coverage:** 89% statements, 81% branches

### Changed

- **execSync → execFileSync** no CLI — elimina vector de command injection
- **Auto-fixes SEC-001 a SEC-004** — removidos (geravam código inválido), substituídos por sugestões
- **architect staged** — agora usa trigger `after_generation` (aplica todas as regras)
- **enableRule/disableRule no CLI** — agora aplicam em runtime além de salvar JSON
- **Total de regras:** 6 → 8 (SEC-001, SEC-002, SEC-003, SEC-004, TEST-001, CQ-001, LOG-001, DES-001)

### Fixed

- **Command injection** em `getStagedDiff()` e `getFileDiff()` (execSync com filename interpolado)
- **architect staged** era no-op (trigger mismatch — todas regras usavam after_generation)
- **enableRule/disableRule** não afetavam runtime (apenas salvavam JSON)

## [2.1.0] - 2026-03-20

### Added

- **ASTAnalyzer (TypeScript Compiler API):** Parser AST real para TypeScript/JS — zero dependências externas, usa `typescript` devDependency
- **CQ-001 via AST:** Migração completa de regex para TypeScript AST
  - Detecção precisa de `any` via `TSAnyKeyword`
  - Contagem de linhas de funções via `SourceFile.getLineAndCharacterOfPosition`
  - Detecção de `Identifier` names genéricos com localização exata
  - Contagem de `FunctionDeclaration`, `ArrowFunction`, `MethodDeclaration`, `FunctionExpression`
  - Métricas: `functions`, `interfaces`, `types`, `anyUsages`, `genericNames`
- **Output JSON para CI/CD:** `architect run --json` e `architect staged --json`
  - Formato estruturado com `status`, `filesAnalyzed`, `summary`, `results`
  - Agregação de resultados para `runOnDir` e `runOnStaged`
  - Exit code correto: `blocked` → exit(1), `ok`/`warned` → exit(0)
- **11 novos testes** para `ASTAnalyzer` (suite dedicada)

### Changed

- **CQ-001 AntiPattern Rule:** Reescrita com ASTAnalyzer — `validate()` agora usa parser real
- **README.md:** Atualizado com new features (AST, JSON output), contagem de testes (29)
- **PRD.md:** Roadmap v2.1 atualizado com status

## [2.0.0] - 2026-03-20

### Breaking Changes

- **Renamed package:** `architect_plugin` → `architect-ai`
- **Versão semântica:** 1.0.0 → 2.0.0

### Added

- **Rule Engine Runtime:** `RuleEngine`, `RuleRegistry`, `DecisionEngine`
- **6 Regras MVP:** SEC-001, SEC-002, TEST-001, CQ-001, LOG-001, DES-001
- **CLI completo:** `run`, `staged`, `rules`, `init`, `version`
- **One-line installer:** `curl | sh`
