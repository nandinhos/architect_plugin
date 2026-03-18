# Plano de Execução: 03 — Portabilidade e Glue Code (Universal Integration)
**Status:** Em Execução
**Autor:** Arquiteto Sinistro

## 1. Objetivo
Garantir que o DNA do Arquiteto seja portátil e reconhecido por qualquer agente de IA (Gemini, Cursor, Claude, Copilot), unificando o comportamento em diferentes editores.

## 2. Atividades
- [x] Criar estrutura `.architect/manifests/` (Concluído no Bootstrap)
- [ ] Implementar `cursor.manifest` e `claude.manifest` no diretório de manifestos.
- [ ] Criar `.cursorrules` na raiz apontando para o protocolo.
- [ ] Criar `AGENTS.md` como contrato universal para outros agentes.
- [ ] Criar `.github/copilot-instructions.md` para integração com GitHub Copilot.
- [ ] Atualizar `GEMINI.md` para ativação automática do Arquiteto.

## 3. Critérios de Aceite
- Ao abrir o projeto em qualquer ferramenta (Cursor, VS Code, CLI), a IA deve identificar imediatamente o `ARCHITECT.md`.
- O comportamento sênior e os princípios de design devem ser consistentes entre todas as ferramentas.
- O projeto deve ser "agente-agnóstico".

---
"A verdade está no plano. Se não está no manifesto, não existe."
