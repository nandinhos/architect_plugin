# Projeto: O Arquiteto Sinistro (Senior Dev Agent + Frontend Design)
**Versão:** 1.0.0
**Status:** Planejamento Detalhado
**Objetivo:** Transformar o Gemini CLI em um agente de engenharia de elite, orquestrando ferramentas de auditoria, design system, segurança e documentação em um workflow unificado e inquebrável.

---

## 1. Arquitetura do Ecossistema

O "Arquiteto" não é apenas um prompt, mas um **sistema de arquivos de instrução (as-code)** que força o LLM a operar em níveis de rigor sênior.

### 1.1. Pilares de Sustentação (As Ferramentas)
| Extensão | Papel no Ecossistema |
| :--- | :--- |
| **Superpowers** | Metodologias rígidas (TDD, Brainstorming, Git Worktrees). |
| **Conductor** | Orquestração de tracks, planos de execução e documentação. |
| **Security** | Auditoria SAST/Taint obrigatória antes de qualquer merge. |
| **Context7** | Garantia de que a documentação técnica usada é a mais recente (v4+). |
| **Code Review** | Validação final contra padrões de mercado (Clean Code, SOLID). |
| **Frontend Design** | Plugin local (`.design/`) que impede o "visual genérico de IA". |

---

## 2. Estrutura de Diretórios do Projeto

O projeto será implementado através da criação dos seguintes artefatos:

```text
/home/gacpac/projects/architect_plugin/
├── .architect/design/                # O Cérebro Visual (Frontend Design Plugin)
│   ├── tokens.json                   # DNA Visual (Cores, Fontes, Tokens)
│   ├── principles.md                 # Princípios de Design (Hierarquia, Espaço)
│   └── ANTI_PATTERNS.md              # "Blacklist" de design genérico de IA
├── .architect/skills/               # A Master Skill (O Agente)
│   └── senior-engineer.md            # O Manual de Operação do Arquiteto
├── .github/copilot-instructions.md   # Portabilidade para Copilot
├── .cursorrules                      # Portabilidade para Cursor
├── AGENTS.md                         # Portabilidade para outros Agentes
└── GEMINI.md                         # Ponto de Entrada para o Gemini CLI
```

---

## 3. Plano de Implementação (Fases)

### Fase 1: Fundação do Sistema de Design (Frontend Design)
*   **Ação:** Criar o repositório `.design/` com tokens reais do projeto `bca_scrap_v2`.
*   **Atividades:**
     *   Mapear cores primárias do projeto atual (extrair do CSS/Tailwind existente).
     *   Definir escala tipográfica (Inter/Sans-serif como base).
     *   Escrever o `ANTI_PATTERNS.md` proibindo gradientes genéricos e formulários sem labels.
     *   Criar `principles.md` com hierarquia visual, espaço e estados interativos.
*   **Resultado:** Um contrato visual que qualquer LLM pode ler e respeitar.

### Fase 2: Forja da Master Skill "O Arquiteto"
*   **Ação:** Criar a Skill que orquestra as extensões.
*   **Atividades:**
    *   Implementar o "Protocolo de Ignorância": Obrigar o uso do `Context7` para qualquer biblioteca moderna.
    *   Implementar o "Protocolo de Segurança": Obrigar o uso do `/security:analyze` após modificações em Controllers/API.
    *   Implementar o "Protocolo de TDD": Bloquear escrita de código sem testes prévios (`Superpowers`).
*   **Resultado:** Um guia de comportamento que transforma o agente em um Engenheiro Sênior.

### Fase 3: Portabilidade e Glue Code
*   **Ação:** Garantir que o DNA do Arquiteto seja portátil para outros editores.
*   **Atividades:**
    *   Configurar `.cursorrules` e `AGENTS.md` apontando para o diretório `.design/`.
    *   Atualizar o `GEMINI.md` para que, ao iniciar a sessão, ele já "se vista" como O Arquiteto.
*   **Resultado:** Consistência entre ferramentas (Claude Code, Cursor, Gemini CLI).

### Fase 4: O Teste de Turing de Design (Showcase)
*   **Ação:** Criar uma nova interface (ex: Dashboard de Histórico) usando O Arquiteto.
*   **Critério de Sucesso:**
    1.  Código gerado com testes passando.
    2.  Nenhuma vulnerabilidade detectada pela extensão Security.
    3.  UI com design profissional, hierarquia clara e zero "feeling de IA".

---

## 4. Regras de Ouro (Cânones do Arquiteto)

1.  **Contexto é Rei:** Nunca assumir versões de bibliotecas. Sempre consultar a documentação.
2.  **Segurança Não é Opcional:** Todo dado que entra ou sai é suspeito.
3.  **Design é Código:** Se a UI for feia, o código está incompleto.
4.  **Menos é Mais:** Priorizar simplicidade e performance (Big O) sobre soluções complexas.
5.  **A Verdade está no Plano:** Se não está no `Conductor`, não existe.

---

## 5. Próximos Passos (Prontos para Execução)

1.  **[ ]** Criar `.design/DESIGN_CONTEXT.json` inicial.
2.  **[ ]** Criar `.claude/skills/architect/SKILL.md`.
3.  **[ ]** Atualizar `GEMINI.md` com as instruções de orquestração.
