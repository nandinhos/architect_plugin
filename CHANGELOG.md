# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-03-20

### Added
- **Engine de Comportamento Sênior:** Protocolos de TDD, Segurança e Design integrados.
- **CI Avançado:** Auditoria de segurança (`npm audit`) e cobertura de testes.
- **Git Hooks:** Husky + lint-staged para garantir qualidade no commit.
- **Testes de Integração:** Cobertura para o ponto de entrada `index.ts`.
- **Identidade Indigo:** Nova cor primária com personalidade (`#6366F1`).
- **Checklist de Segurança:** Regras acionáveis com exemplos concretos.

### Changed
- **Configuração de Pacote:** Metadados preenchidos no `package.json` e scripts de build.
- **Rigor Lint:** Erro para `any` explicitado e lint-staged ativo.
- **Fundação Git:** `package-lock.json` agora é rastreado para builds reproduzíveis.

### Fixed
- **Sync de Worktree:** Correção do script de prontidão e eliminação de manifests redundantes.
- **Arquitetura:** Consolidação de `.architect/design/` como estrutura canônica.

### Removed
- **Arquivos Obsoletos:** `GUIDE.md` (deprecated).
