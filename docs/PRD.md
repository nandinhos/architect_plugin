# PRD — Architect Engine v2.0
**Produto:** `@architectai/core` — Runtime de Regras Comportamentais para IA
**Versão:** 2.0.0
**Autor:** Nando Dev
**Status:** Produção

---

## 1. Resumo Executivo

O Architect Engine é um **runtime de regras validáveis por IA** que intercepta, valida e bloqueia código gerado por agentes de IA antes que ele entre em produção. Ele funciona como um ESLint específico para o comportamento de IA — determinístico, extensível e opinado.

**Problema resolvido:** IAs generativas produzem código funcional mas inseguro, sem testes, sem padrões e sem identidade visual. Não existe ferramenta que force a IA a seguir contratos de engenharia como um linter normal faz para código humano.

**Solução:** Um engine onde qualquer regra é um módulo TypeScript com `validate()` e `enforce()` — opinado, testável, e executável via CLI ou API.

---

## 2. Instalação (One-Line)

### A linha:

```bash
curl -fsSL https://raw.githubusercontent.com/nandinhos/architect_plugin/main/install.sh | sh
```

Pronto. Funciona em qualquer projeto Node.js em 3 segundos.

---

## 3. Arquitetura

### 3.1 Visão Geral

```
PROJETO DO USUÁRIO
│
├── node_modules/
│   └── @architectai/core/        ← Instalado via npm
│
├── .architect/                   ← DNA do projeto (gerado pelo init)
│   ├── tokens.json               ← Cores, tipografia, identidade
│   ├── rules/                    ← Regras customizadas do projeto
│   └── config.json               ← Configuração do engine
│
└── .git/hooks/
    └── pre-commit                ← Hook automático (via prepare script)
```

### 3.2 Arquitetura Interna do Engine

```
src/
├── engine/
│   ├── RuleEngine.ts       ← Executor de regras por trigger
│   ├── RuleRegistry.ts     ← Registro + filtro por trigger
│   ├── DecisionEngine.ts    ← BLOCK / WARN / OK por severidade
│   └── tokens.ts           ← DNA Indigo (embutido)
├── rules/
│   ├── SecurityRules.ts    ← SEC-001 (SQLi), SEC-002 (eval/exec)
│   ├── TestRules.ts        ← TEST-001 (teste obrigatório)
│   ├── CodeQualityRules.ts ← CQ-001 (anti-patterns, any, nomes)
│   ├── LoggingRules.ts     ← LOG-001 (no console.log)
│   └── DesignRules.ts      ← DES-001 (cores, gradientes, placeholders)
├── cli/
│   └── index.ts            ← Entry point CLI
└── types.ts                ← BehaviorRule, RuleContext, Issue, etc.
```

---

## 4. API — Interface Pública

### 4.1 CLI

```bash
# Inicializar em um projeto
architect init

# Analisar um arquivo
architect run src/utils.ts

# Analisar um diretório
architect run src/

# Analisar staged files (hook)
architect staged

# Listar regras
architect rules

# Versão
architect version
```

### 4.2 API Programática

```ts
import { ArchitectEngine, createSQLInjectionRule } from '@architectai/core';

const engine = new ArchitectEngine({ autoFix: false, failOn: 'high' });
engine.registerRule(createSQLInjectionRule());

const result = engine.runSync({
  code: 'const q = "SELECT * FROM users WHERE id = " + id',
  filePath: 'src/db.ts',
  fileName: 'db.ts',
  language: 'typescript',
  metadata: {},
}, 'after_generation');

// result.status: 'blocked' | 'warned' | 'ok'
// result.issues: Issue[]
// result.summary: { critical, high, medium, low }
```

---

## 5. Sistema de Regras

### 5.1 Interface

```ts
export interface BehaviorRule {
  id: string;           // Ex: 'SEC-001'
  name: string;
  trigger: TriggerType;
  severity: Severity;
  description: string;
  validate(context: RuleContext): RuleResult;
  enforce?(context: RuleContext, result: RuleResult): EnforcementResult | null;
}
```

### 5.2 Triggers

| Trigger | Quando roda |
|---------|------------|
| `before_generation` | Antes da IA gerar código (para injetar contexto) |
| `after_generation` | Depois da IA gerar código (validação principal) |
| `pre_commit` | Antes do commit git (gate de merge) |
| `review` | Durante code review (análise assíncrona) |

### 5.3 Severidade e Decisão

| Severidade | Ação |
|-----------|------|
| `critical` | **BLOCK** — Commits bloqueados, correção mandatória |
| `high` | **WARN** — Correção exigida antes de merge |
| `medium` | **ALERT** — Logado, mostrado no relatório |
| `low` | **INFO** | Logado apenas |

### 5.4 Regras MVP (v2.0)

| ID | Nome | Severidade | Trigger |
|----|------|-----------|---------|
| SEC-001 | SQL Injection Detection | critical | after_generation |
| SEC-002 | Dangerous Function Detection | critical | after_generation |
| TEST-001 | Test Required | high | after_generation |
| CQ-001 | Anti-Pattern Detection | high | after_generation |
| LOG-001 | No Console Rule | medium | after_generation |
| DES-001 | Design Token Validator | low | after_generation |

---

## 6. Extensibilidade

### 6.1 Regras Customizadas

```ts
// .architect/rules/meu-projeto.ts
import { createRule } from '@architectai/core';

export const noMagicStrings = createRule({
  id: 'MY-001',
  name: 'No Magic Strings',
  trigger: 'after_generation',
  severity: 'medium',
  validate(context) {
    const hasMagic = /["']use client["']|["']use server["']/.test(context.code);
    return {
      ruleId: 'MY-001',
      ruleName: 'No Magic Strings',
      valid: !hasMagic,
      issues: hasMagic ? [{ code: 'MY-001', message: 'Magic string', severity: 'medium' }] : [],
    };
  },
});
```

### 6.2 Configuração por Projeto

```json
// .architect/config.json
{
  "autoFix": false,
  "failOn": "high",
  "rules": {
    "SEC-001": { "enabled": true },
    "TEST-001": { "enabled": true },
    "LOG-001": { "enabled": false }
  }
}
```

---

## 7. Fluxo de Integração

### 7.1 Init (1 comando)

```bash
architect init
# → Cria .architect/tokens.json (interativo)
# → Adiciona prepare script ao package.json
# → Instala husky hooks
# → Pronto.
```

### 7.2 Hook de Pre-Commit

```
git commit
  → Husky trigger pre-commit
  → npx lint-staged
  → architect staged
  → Se BLOCK → commit negado
  → Se WARN → alerta + commit procede
  → Se OK → commit procede
```

### 7.3 CI/CD

```yaml
# GitHub Actions
- run: npx architect staged
- run: npx architect run src/
```

---

## 8. Filosofia de Design

### 8.1 Drop-in / Drop-out

O `.architect/` é um diretório oculto. Desinstalar é deletar ele.

```bash
# Uninstall
rm -rf .architect/

# O código do seu projeto não é afetado.
```

### 8.2 Zero Vendor Lock-in

O engine funciona com qualquer agente de IA. O `.architect/` é apenas arquivos de configuração que qualquer LLM pode ler.

### 8.3 Opiniado mas Configurável

Regras têm severidade fixa mas podem ser desabilitadas por projeto. A configuração é um JSON.

### 8.4 Testável

Cada regra é uma função pura testável. O engine tem 18 testes unitários cobrindo todos os paths.

---

## 9. Roadmap

### v2.0 — Atual (MVP)
- [x] Runtime engine completo
- [x] 6 regras MVP
- [x] CLI funcional
- [x] Hook pre-commit
- [x] Instalador one-line

### v2.1
- [ ] `architect init --template=react` (boilerplates por stack)
- [ ] `architect config` (CLI interativa para configurar regras)
- [ ] Output JSON para integração CI

### v2.2
- [ ] AST-based design validator (Babel parser)
- [ ] Regras para Python (PyLint integration)
- [ ] Relatórios HTML

### v3.0
- [ ] DSL de regras declarativas
- [ ] LSP integration (tempo real)
- [ ] Web dashboard de métricas

---

## 10. Métricas de Qualidade

| Métrica | Valor |
|---------|-------|
| Testes | 18 passing |
| Cobertura | Em monitoramento |
| Regras MVP | 6/6 |
| Vulnerabilidades npm | 0 |
| Erros de tipo | 0 |
| Erros de lint | 0 |

---

## 11. Instalação

```bash
curl -fsSL https://raw.githubusercontent.com/nandinhos/architect_plugin/main/install.sh | sh
```

Ou via npm:

```bash
npm install -g @architectai/core
```
