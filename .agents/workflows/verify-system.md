---
description: Workflow de Verificação Total do Arquiteto
---

Este workflow valida a prontidão do sistema e a integridade dos protocolos de design, segurança e engenharia.

// turbo
1. Verificação de Prontidão do Ambiente:
   ```bash
   node scripts/check-readiness.js
   ```

// turbo
2. Build e Integridade de Tipos:
   ```bash
   npm run build
   ```

// turbo
3. Bateria de Testes (TDD Integrity):
   ```bash
   npm test
   ```

// turbo
4. Auditoria de Segurança:
   ```bash
   npm audit --audit-level=moderate
   ```

// turbo
5. Verificação de Design (Visual DNA):
   ```bash
   # Valida se os tokens essenciais existem
   grep -q "primary" .architect/design/tokens.json
   ```

6. Revisão Final do Protocolo:
   - Certifique-se de que `CHANGELOG.md` está atualizado.
   - Verifique se `README.md` reflete o estado atual.
