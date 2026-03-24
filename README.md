# Architect Engine — v2.2

> **"Código gerado por IA sem validação é технический долг."**

**Uma linha. Qualquer projeto. Engenheiro Sênior automático.**

---

## Instalacao (30 segundos)

```bash
curl -fsSL https://raw.githubusercontent.com/nandinhos/architect_plugin/main/install.sh | sh
```

Pronto. Funciona em qualquer projeto Node.js.

---

## Uso (Comandos)

```bash
# 1. Inicializar no projeto
architect init

# 2. Inicializar com template
architect init --template=react

# 3. Analisar qualquer arquivo
architect run src/utils.ts

# 4. Analisar tudo que vai ser commitado
architect staged

# 5. Output JSON para CI/CD
architect run src/ --json

# 6. Ver regras registradas
architect rules

# 7. Ver/editar configuracao
architect config
architect config enable SEC-001
architect config disable LOG-001
```

---

## O que ele bloqueia

```
architect run src/db.ts
```

```
🔴 [SEC-001] SQL Injection detectado
   [src/db.ts:12]

⛔ BLOQUEADO: Corrija issues critical antes de continuar.
```

O engine avalia **8 regras** automaticamente:

| Regra    | Severidade | O que detecta                                                   |
| -------- | ---------- | --------------------------------------------------------------- |
| SEC-001  | critical   | SQL Injection (concatenacao de strings)                         |
| SEC-002  | critical   | eval, exec, new Function                                        |
| SEC-003  | critical   | **XSS** (innerHTML, document.write)                             |
| SEC-004  | high       | **PII** (passwords, emails, CPFs em logs)                       |
| TEST-001 | high       | Arquivo sem teste                                               |
| CQ-001   | high       | Funcoes >50 linhas, `any`, nomes genéricos (via TypeScript AST) |
| LOG-001  | medium     | console.log em producao                                         |
| DES-001  | low        | Cores hardcoded, gradientes genericos                           |

---

## Arquitetura

```
RuleEngine          → Executa regras por trigger
  └── RuleRegistry  → Registro e filtro
       └── DecisionEngine → BLOCK / WARN / OK
```

**CQ-001** usa **TypeScript Compiler API (AST)** — nao regex.
Detecta `any`, funcoes longas, nomes genericos e arquivos >300 linhas com precisao de parser real.

---

## Output JSON (CI/CD)

```bash
architect run src/ --json
```

```json
{
  "status": "blocked",
  "filesAnalyzed": 5,
  "summary": {
    "critical": 1,
    "high": 2,
    "medium": 0,
    "low": 3
  }
}
```

---

## Qualidade

```
npm test          → 119/119 passing
npm run lint      → 0 errors
npm run typecheck → 0 errors
npm audit         → 0 vulnerabilities
npm test:coverage → 89% statements, 81% branches
```

---

## Templates para Init

```bash
architect init               # Default (Indigo)
architect init --template=react   # React (Cyan)
architect init --template=vue    # Vue (Green)
architect init --template=next   # Next.js (Black)
architect init --template=astro   # Astro (Orange)
```

---

## Desenvolvido por

**Nando Dev** — sob o **Protocolo do Arquiteto Sinistro**.

```
"Eu sou O Arquiteto. Eu não gero código; eu construo sistemas."
```
