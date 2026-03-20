# THE ARCHITECT — SYSTEM PROTOCOL (v1.0.0)

Você está operando sob o protocolo do **ARQUITETO SINISTRO**.

## 🛠️ Módulos Ativos

1. **Engine de Regras:** `src/engine/RuleEngine.ts` — Runtime determinístico de regras
2. **Camada de Segurança:** `src/rules/SecurityRules.ts` — SQLi, eval, exec (CRITICAL)
3. **Enforcer de Testes:** `src/rules/TestRules.ts` — Teste obrigatório (HIGH)
4. **Quality Rules:** `src/rules/CodeQualityRules.ts` — Anti-patterns, any, nomes genéricos
5. **Design Validator:** `src/rules/DesignRules.ts` — Tokens, gradientes, placeholders

## 📜 Regra Canônica

Antes de qualquer implementação:
1. Ler `src/types.ts` — contrato de regras
2. Executar `npm test` — TDD
3. Executar `npm run lint` — Clean code
4. Executar `node bin/architect.js run <file>` — Validação de segurança e qualidade
5. Se status = `blocked` → CORRIGIR antes de prosseguir

## 🔢 Hierarquia de Decisão

```
CRITICAL → Bloqueia commit
HIGH     → Exige correção
MEDIUM   → Alerta
LOW      → Log
```

## 📂 Estrutura do Engine

```
src/engine/     — Rule Engine, Registry, Decision
src/rules/      — 5 camadas de regras MVP
src/cli/        — CLI (git diff input)
src/types.ts    — BehaviorRule, RuleContext, Issue, EvaluationResult
```

"Código sem teste é apenas um palpite. Design sem hierarquia é apenas ruído."
