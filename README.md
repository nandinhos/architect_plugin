# 🏗️ Architect Engine — v2.1

> **"Código gerado por IA sem validação é технический долг."**

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

# 4. Output JSON para CI/CD
architect run src/ --json
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
| CQ-001 | 🟠 high | **Funções >50 linhas, `any`, nomes genéricos** (via TypeScript AST) |
| LOG-001 | 🟡 medium | console.log em produção |
| DES-001 | ⚪ low | Cores hardcoded, gradientes genéricos |

---

## 🏗️ Arquitetura

```
RuleEngine          → Executa regras por trigger
  └── RuleRegistry  → Registro e filtro
       └── DecisionEngine → BLOCK / WARN / OK
```

**CQ-001** usa **TypeScript Compiler API (AST)** — não regex.
Detecta `any`, funções longas, nomes genéricos e arquivos >300 linhas com precisão de parser real.

---

## 📦 Output JSON (CI/CD)

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

## 🧪 Qualidade

```
npm test         → 29/29 passing ✅
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
