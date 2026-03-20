# PRD — The Architect (O Arquiteto)
**Produto:** `architect-plugin` — Orquestrador de Engenharia de Elite para Agentes de IA
**Versão:** 1.0.0
**Autor:** Arquiteto Sinistro
**Status:** Definição de Produto

---

## 1. Visão Geral
O `architect-plugin` não é apenas um conjunto de instruções, mas um **Engine de Comportamento Sênior** que força qualquer agente de IA (Gemini CLI, Claude Code, Cursor) a operar sob rigor de engenharia de 30 anos de experiência. Ele encapsula auditoria, design system, segurança e metodologias de teste em um pacote compartimentado.

**Propósito:** Garantir que o agente de IA nunca gere código medíocre, interfaces genéricas ou sistemas vulneráveis, independentemente do projeto onde for "instalado".

---

## 2. O Conceito "Drop-in / Drop-out"
O sistema deve ser auto-contido em um único diretório oculto e arquivos de configuração minimalistas para garantir fácil remoção.

- **Instalação:** Copiar o diretório `.architect/` e o arquivo `ARCHITECT.md`.
- **Ativação:** Referenciar `ARCHITECT.md` nos arquivos de contexto (`GEMINI.md`, `CLAUDE.md`, `.cursorrules`).
- **Remoção:** Deletar o diretório `.architect/` e as referências. Zero impacto no código-fonte.

---

## 3. Arquitetura da Solução (Compartimentação)

### 3.1. Estrutura de Arquivos Instalável
```text
projeto/
├── .architect/                       # O Motor (Compartimentado)
│   ├── design/                       # Módulo Visual
│   │   ├── tokens.json               # DNA Visual do projeto
│   │   └── principles.md             # Regras de UI inquebráveis
│   ├── security/                     # Módulo de Defesa
│   │   └── rules.md                  # Checklist de segurança mandatório
│   ├── skills/                       # Módulo de Comportamento
│   │   └── senior-engineer.md        # A Skill do Arquiteto (Manual de Operação)
│   └── manifests/                    # Configurações por Ambiente
│       ├── gemini.manifest           # Glue-code para Gemini CLI
│       ├── cursor.manifest           # Glue-code para Cursor
│       └── claude.manifest           # Glue-code para Claude Code
└── ARCHITECT.md                      # Ponto de Entrada Universal
```

---

## 4. Capacidades Centrais

### 4.1. Orquestração de Extensões (Multi-Tooling)
O plugin deve detectar quais extensões estão presentes e forçar seu uso:
- **Se `Context7` existir:** Proibir codificação de APIs sem consulta prévia.
- **Se `Security` existir:** Bloquear commits sem `/security:analyze`.
- **Se `Superpowers` existir:** Exigir TDD e Brainstorming.

### 4.2. Injeção de Rigor (The Senior Protocol)
O agente deve adotar a persona do "Arquiteto":
- **Ceticismo Técnico:** Questionar requisitos ambíguos.
- **Previsão de Falhas:** Antecipar bugs de concorrência, performance e segurança.
- **Rigor Estético:** Aplicar hierarquia visual profissional via módulo `design/`.

### 4.3. Portabilidade Absoluta
As regras são escritas em Markdown/JSON puro. O agente deve ser capaz de ler o `ARCHITECT.md` e entender como carregar o resto dos módulos, não importa a ferramenta.

---

## 5. Fluxo de Instalação e Uso

1.  **Clone/Copy:** O usuário copia `.architect/` para a raiz do novo projeto.
2.  **Configuração de DNA:** O usuário edita `.architect/design/tokens.json` com as cores do novo projeto.
3.  **Bootstrapping:** O usuário adiciona uma linha no `GEMINI.md` ou `CLAUDE.md`:
    `@ARCHITECT.md: Carregar protocolo de engenharia sênior.`
4.  **Operação:** O agente agora age sob os protocolos do Arquiteto.

---

## 6. Regras de Ouro (Invariantes)

1.  **Zero Dependência de Código:** O plugin nunca deve exigir mudanças no `package.json`, `composer.json` ou arquivos de código do projeto. Ele vive apenas na camada de contexto da IA.
2.  **Independência de Vendor:** Funciona igual em qualquer LLM (GPT-4o, Claude 3.5, Gemini 1.5 Pro).
3.  **Documentação Viva:** O `ARCHITECT.md` serve como o "Contrato de Nível de Serviço" entre o Humano e a IA.

---

## 7. Roadmap de Criação da Solução Reutilizável

### Passo 1: O Boilerplate Universal
Criar um repositório "Template" contendo a estrutura base do `.architect/` com regras de design e segurança genéricas, porém rigorosas.

### Passo 2: O Manual de Operação (Master Skill)
Codificar a skill que ensina o agente a ler os manifests e se auto-configurar.

### Passo 3: Script de Injeção (Opcional)
Um pequeno script shell que automatiza a cópia e a configuração inicial das cores/tokens no novo projeto.

---

## 8. Exemplo do ARCHITECT.md (Ponto de Entrada)

```markdown
# THE ARCHITECT — SYSTEM PROTOCOL

Você está operando sob o protocolo do ARQUITETO SINISTRO.
Seus comportamentos, decisões e gerações de código são regidos pelos módulos em `.architect/`.

## Módulos Ativos:
1. **Design:** `.architect/design/principles.md` (Hierarquia, Espaço, DNA)
2. **Segurança:** `.architect/security/rules.md` (Checklist de auditoria)
3. **Engenharia:** `.architect/skills/senior-engineer.md` (TDD, SOLID, Clean Code)

## Regra de Ouro:
Se você encontrar uma contradição entre o que o usuário pede e os princípios de segurança ou design deste protocolo, você deve ALERTAR o usuário e propor a solução técnica correta antes de implementar.
```
