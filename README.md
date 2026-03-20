# 🏗️ Architect Engine — v2.0

> **"Código gerado por IA sem validação é Doidera, e Doidera vira dívida."**

**Uma linha. Qualquer projeto. Engenheiro Sênior automático.**

---

## ⚡ Instalação (30 segundos)

```bash
curl -fsSL https://raw.githubusercontent.com/nandinhos/architect_plugin/main/install.sh | sh
```

Pronto. Funciona em qualquer projeto Node.js.

---

## 🚀 Uso (3 comandos)

```bash
# 1. Inicializar no projeto
architect init

# 2. Analisar qualquer arquivo
architect run src/utils.ts

# 3. Analisar tudo que vai ser commitado
architect staged
```

---

## 🔒 O que ele bloqueia

```
architect run src/db.ts
```

```
🔴 [SEC-001] SQL Injection detectado
   [src/db.ts:12]

⛔ BLOQUEADO: Corrija issues critical antes de continuar.
```

O engine avalia **6 regras** automaticamente:

| Regra | Severidade | O que detecta |
|-------|-----------|---------------|
| SEC-001 | 🔴 critical | SQL Injection (concatenação de strings) |
| SEC-002 | 🔴 critical | eval, exec, new Function |
| TEST-001 | 🟠 high | Arquivo sem teste |
| CQ-001 | 🟠 high | Funções >50 linhas, `any`, nomes genéricos |
| LOG-001 | 🟡 medium | console.log em produção |
| DES-001 | ⚪ low | Cores hardcoded, gradientes genéricos |

---

## 🏗️ Arquitetura

```
RuleEngine          → Executa regras por trigger
  └── RuleRegistry  → Registro e filtro
       └── DecisionEngine → BLOCK / WARN / OK
```

---

## 📦 API

```ts
import { ArchitectEngine, createSQLInjectionRule } from 'architect-ai';

const engine = new ArchitectEngine({ failOn: 'high' });
engine.registerRule(createSQLInjectionRule());

const result = engine.runSync({
  code: 'db.query("SELECT * FROM users WHERE id = " + id)',
  filePath: 'src/db.ts',
  fileName: 'db.ts',
  language: 'typescript',
  metadata: {},
}, 'after_generation');

// result.status: 'blocked' | 'warned' | 'ok'
```

---

## 🧩 Extensível

Crie regras customizadas em 10 linhas:

```ts
import { createRule } from 'architect-ai';

export const noTodo = createRule({
  id: 'MY-001',
  name: 'No TODO',
  trigger: 'after_generation',
  severity: 'high',
  validate(ctx) {
    const has = ctx.code.includes('TODO');
    return {
      ruleId: 'MY-001', ruleName: 'No TODO',
      valid: !has,
      issues: has ? [{ code: 'MY-001', message: 'TODO encontrado', severity: 'high', file: ctx.filePath }] : [],
    };
  },
});
```

---

## 📁 Estrutura

```
.architect/           ← Gerado pelo init
├── tokens.json       ← DNA do projeto (cores, tipografia)
└── config.json       ← Quais regras ativas

bin/architect.js      ← CLI (instalado globalmente)
src/
├── engine/           ← RuleEngine, RuleRegistry, DecisionEngine
├── rules/            ← 6 regras MVP
├── cli/              ← Entry point CLI
└── types.ts          ← BehaviorRule, Issue, etc.
```

---

## 🧪 Qualidade

```
npm test         → 18/18 passing ✅
npm run lint     → 0 errors ✅
npm run typecheck → 0 errors ✅
npm audit        → 0 vulnerabilities ✅
```

---

## Desenvolvido por

**Nando Dev** — sob o **Protocolo do Arquiteto Sinistro**.

```
"Eu sou O Arquiteto. Eu não gero código; eu construo sistemas."
```
