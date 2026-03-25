# Architect Engine

> Runtime de regras comportamentais para validar código gerado por IA e humano.

---

## O que é

Architect Engine é um motor de validação de código que analisa arquivos-fonte em tempo real e retorna decisões de bloqueio, alerta ou aprovação. Focado em segurança, qualidade, testes e design, atua como um engenheiro sênior automatizado que revisa todo código antes do commit ou deploy.

## O que faz

- Analisa código TypeScript/JavaScript/JSX/TSX/HTML/CSS
- Executa regras de validação via AST (TypeScript Compiler API) e regex
- Retorna decisão: **blocked** (critical), **warned** (high/medium), **ok** (limpo)
- Gera relatório com issues, severidade e sugestões de correção
- Integra com git hooks (pre-commit) e pipelines CI/CD
- Suporta regras customizadas via API `createRule()`
- Cache incremental com hash SHA-256 para re-execuções instantâneas
- Telemetria de tempo por regra para identificar gargalos

## Onde aplica

| Cenário                   | Como usar                                                         |
| ------------------------- | ----------------------------------------------------------------- |
| **Desenvolvimento local** | `architect run src/file.ts` antes de commitar                     |
| **Git hooks**             | `architect staged` no pre-commit, bloqueia se critical            |
| **CI/CD**                 | `architect run src/ --json` integra com GitHub Actions, GitLab CI |
| **Code review**           | Analisa PRs automaticamente, gera relatório no output             |
| **Projetos com IA**       | Valida código gerado por ChatGPT, Copilot, Cursor, Claude         |
| **Agências/Estúdios**     | Padrão de qualidade em múltiplos projetos simultâneos             |

## Pré-requisitos

- **Node.js** >= 18.0
- **Git** (para comando `staged`)
- **TypeScript** (para análise AST, opcional para regex)

## Instalação

```bash
curl -fsSL https://raw.githubusercontent.com/nandinhos/architect_plugin/main/install.sh | sh
```

Ou manualmente:

```bash
npm install -g @architectai/core
```

## Comandos

```bash
# Inicializar no projeto
architect init
architect init --template=react  # react, vue, next, astro

# Analisar código
architect run src/file.ts        # arquivo único
architect run src/               # diretório recursivo
architect staged                 # arquivos staged (git)

# Configuração
architect rules                  # listar regras
architect config                 # mostrar config
architect config enable SEC-001  # habilitar regra
architect config disable LOG-001 # desabilitar regra

# Saúde do projeto
architect health                 # score 0-100 por protocolos
architect health --json          # output JSON para CI

# Versão
architect version
```

## Regras

| Regra    | Severidade | Detecção                           | Motor       |
| -------- | ---------- | ---------------------------------- | ----------- |
| SEC-001  | critical   | SQL Injection                      | AST + regex |
| SEC-002  | critical   | eval, exec, new Function           | regex       |
| SEC-003  | critical   | XSS (innerHTML, document.write)    | AST + regex |
| SEC-004  | high       | PII em logs (password, token, CPF) | regex       |
| TEST-001 | high       | Arquivo sem teste correspondente   | file check  |
| CQ-001   | high       | Funções >50 linhas                 | AST         |
| CQ-002   | low        | Nomes genéricos (data, temp, obj)  | AST         |
| CQ-003   | medium     | Uso explícito de `any`             | AST         |
| CQ-004   | medium     | Arquivos >300 linhas               | AST         |
| CQ-005   | low        | console.log via AST                | AST         |
| CQ-006   | medium     | Complexidade ciclomática >10       | AST         |
| LOG-001  | medium     | console.log/warn/error             | regex       |
| DES-001  | medium     | Cores hardcoded                    | regex       |
| DES-002  | low        | Gradientes genéricos               | regex       |
| DES-003  | medium     | Placeholder sem label              | regex       |
| DES-004  | low        | Emojis como ícones                 | regex       |

**Total: 16 regras** (8 de segurança, 6 de qualidade, 1 de teste, 1 de logging, 4 de design)

## Arquitetura

```
CLI (index.ts)
├── parser.ts      ← parsing de argumentos
├── adapters.ts    ← IO (FS, Git, Config)
└── presenter.ts   ← apresentação de relatórios

Engine
├── RuleEngine     ← orquestração, cache, paralelismo, telemetria
├── RuleRegistry   ← registro, filtro por trigger, enable/disable
└── DecisionEngine ← decisão: blocked/warned/ok

Rules
├── SecurityRules  ← SEC-001 a SEC-004
│   ├── SQLInjectionDetector (AST)
│   └── XSSDetector (AST)
├── TestRules      ← TEST-001
├── CodeQualityRules ← CQ-001 a CQ-006 (AST)
├── LoggingRules   ← LOG-001
└── DesignRules    ← DES-001 a DES-004

Components
└── ArchitectDashboard ← health check por protocolos
```

## Output JSON

```bash
architect run src/ --json
```

```json
{
  "status": "warned",
  "filesAnalyzed": 5,
  "rulesEvaluated": 16,
  "summary": { "critical": 0, "high": 2, "medium": 1, "low": 3 },
  "issues": [
    {
      "code": "TEST-001",
      "message": "Arquivo fonte sem teste correspondente",
      "severity": "high",
      "file": "src/utils.ts"
    }
  ],
  "timing": {
    "totalMs": 45.23,
    "rules": {
      "SEC-001": 2.15,
      "CQ-001": 12.4,
      "TEST-001": 0.32
    }
  }
}
```

## Regras Customizadas

Crie `.architect/rules/minha-regra.js`:

```javascript
const { createRule } = require('@architectai/core');

module.exports = createRule({
  id: 'CUSTOM-001',
  name: 'No Console Log',
  trigger: 'after_generation',
  severity: 'medium',
  description: 'Detecta console.log em código',
  validate: (ctx) => {
    const hasConsole = /console\.log/.test(ctx.code);
    return {
      ruleId: 'CUSTOM-001',
      ruleName: 'No Console Log',
      valid: !hasConsole,
      issues: hasConsole
        ? [{ code: 'CUSTOM-001', message: 'console.log detectado', severity: 'medium' }]
        : [],
    };
  },
});
```

## Configuração por Projeto

`.architect/config.json`:

```json
{
  "autoFix": false,
  "failOn": "high",
  "rules": {
    "SEC-001": { "enabled": true },
    "SEC-002": { "enabled": true },
    "LOG-001": { "enabled": false }
  }
}
```

## Qualidade

```
Testes:       157/157 passing
Suítes:       12
Lint:         0 errors
Typecheck:    0 errors
Vulnerabilidades: 0
```

## Projeções de Crescimento

### Curto prazo (3 meses)

- Regras para Python, Go, Rust
- Integração nativa com GitHub Actions
- Dashboard web para métricas agregadas
- Auto-fix real via AST (não apenas sugestões)

### Médio prazo (6 meses)

- Plugin para VS Code (análise em tempo real)
- Regras de acessibilidade (WCAG)
- Detecção de dependências vulneráveis
- Benchmark de performance por regra

### Longo prazo (12 meses)

- Machine learning para redução de falsos positivos
- Análise de data-flow cross-file
- Integração com SonarQube, ESLint, Prettier
- SaaS para equipes com dashboard colaborativo

## Licença

MIT

## Desenvolvido por

**Nando Dev**
