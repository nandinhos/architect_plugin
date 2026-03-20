# PRD — Frontend Design Plugin
**Produto:** `frontend-design` — Gerador de Interfaces de Produção com DNA Visual
**Versão:** 1.0.0
**Autor:** nandodev
**Data:** 2026-03-18
**Status:** Rascunho

---

## 1. Visão Geral

O `frontend-design` é um plugin de orquestração que transforma descrições de intenção em
interfaces frontend de qualidade de produção — evitando o "visual genérico de IA" que resulta
de prompts simples. Ele atua como um **designer sênior embutido** que conhece princípios de
composição visual, hierarquia tipográfica, uso de espaço e expressão de identidade de marca.

**Propósito central:** Dado um conjunto de requisitos funcionais + DNA visual de um kit/sistema,
gerar código HTML/CSS (Tailwind/Alpine) que se parece com algo feito por um designer profissional
— não por um LLM genérico.

---

## 2. Problema que resolve

### 2.1 O "visual genérico de IA"
Quando qualquer LLM recebe um prompt como "gere uma hero section para um dashboard SaaS",
o resultado típico é:
- Gradiente azul/roxo padrão
- Título "Transforme seu negócio"
- Botão "Começar agora" com sombra genérica
- Grid de 3 colunas de features com ícones emojis
- Sem personalidade, sem DNA visual, sem distinção

### 2.2 A causa raiz
LLMs sem instrução específica de design:
1. **Interpolam a média** do que viram no treino → resultados médios
2. **Ignoram contexto visual** do projeto → inconsistência com o sistema existente
3. **Não aplicam princípios de design** conscientemente → composição aleatória
4. **Geram código, não interfaces** → funcionam mas não impressionam

### 2.3 O que o plugin resolve
- Fornece um **framework de decisões de design** que o LLM executa conscientemente
- Injeta o **DNA visual** do projeto antes de qualquer geração
- Define **padrões de excelência** mensuráveis (hierarquia, espaço, cor, tipografia)
- Produz interfaces que **parecem intencionais** — não acidentais

---

## 3. Personas

### Persona A — Desenvolvedor solo / indie hacker
- Sabe codar, não tem designer
- Quer interfaces que "pareçam profissionais" sem contratar design
- Usa Claude Code / Cursor / VS Code

### Persona B — Tech lead com equipe pequena
- Tem time de devs, designer ocasional
- Quer consistência visual entre features geradas por IA
- Usa Claude Code CLI ou editor integrado

### Persona C — Builder de produtos SaaS
- Cria múltiplos projetos com stacks similares
- Quer reutilizar DNA visual entre projetos
- Precisa que qualquer LLM (Claude, GPT, Gemini) produza resultados consistentes

---

## 4. Capacidades Centrais

### 4.1 DNA Injection (Injeção de Identidade Visual)
Antes de qualquer geração, o plugin extrai e injeta o DNA visual do contexto:

```
DNA_VISUAL = {
  cores: {
    primária, background, surface, texto, muted, borda, sucesso, perigo
  },
  tipografia: {
    heading: fonte + escala + peso,
    body: fonte + escala + peso
  },
  espaçamento: {
    base_unit, card_padding, section_gap
  },
  elevação: {
    shadow_sm, shadow_md, shadow_lg,
    border_radius
  },
  personalidade: [tag1, tag2, tag3]  // ex: "SaaS", "Analytics", "Clean"
}
```

### 4.2 Design Principles Engine (Motor de Princípios)
O plugin força o LLM a aplicar conscientemente:

| Princípio | Aplicação |
|-----------|-----------|
| **Hierarquia visual** | Tamanho, peso e cor comunicam importância relativa |
| **Espaço em branco** | Breathing room como elemento de design, não vazio |
| **Ritmo tipográfico** | Escala consistente (12→14→16→20→24→32→48→64px) |
| **Contraste intencional** | Texto sempre legível, nunca "gray on gray" |
| **Movimento implícito** | Hover states, transitions que comunicam interatividade |
| **Identidade de marca** | DNA visual presente em cada detalhe, não só no logo |

### 4.3 Component Generation (Geração de Componentes)
Para cada tipo de interface requisitado, o plugin usa um template mental específico:

**Hero Sections:**
- Sempre: título principal (display/hero text) + subtítulo + CTA primário
- Sempre: elemento visual de suporte (stat grid, screenshot mockup, ou abstract shape)
- Nunca: layout "full-bleed centered text only" (genérico demais)

**Dashboard Sections:**
- Sempre: stat cards com tendência + tabela/gráfico + filtros
- Sempre: densidade de informação calibrada (não esparso, não congestionado)
- Nunca: cards todos do mesmo tamanho sem hierarquia

**Form Sections:**
- Sempre: labels acima dos inputs (nunca placeholder-only)
- Sempre: estados de foco/erro com feedback visual claro
- Nunca: botão submit sem contexto visual (tamanho, posição, cor)

### 4.4 Code Quality Standards (Padrões de Código)
- **Tailwind v4:** classes completas, sem concatenação dinâmica
- **Alpine.js:** interatividade client-side sem JS framework
- **Responsive-first:** mobile, tablet, desktop no mesmo componente
- **Acessibilidade mínima:** aria-labels, roles, contraste AA
- **Semântica HTML:** `<section>`, `<header>`, `<nav>`, `<main>`, `<footer>` corretos

---

## 5. Interface do Plugin (API de uso)

### 5.1 Ativação
```
Ativa quando: usuário pede para criar/estilizar componente visual, página, seção ou interface
Não ativa: quando tarefa é puramente lógica/backend sem componente visual
```

### 5.2 Input esperado
```yaml
dna_visual:
  # Obrigatório
  primary: "#hex"
  background: "#hex"
  surface: "#hex"
  text: "#hex"
  muted: "#hex"
  # Opcional mas recomendado
  border: "#hex"
  shadow: "css-value"
  radius: "tailwind-class"
  font_heading: "FontName"
  font_body: "FontName"
  personality: ["tag1", "tag2", "tag3"]

requisito:
  tipo: "hero | dashboard | form | card | section | page"
  descricao: "texto livre descrevendo o que deve ser gerado"
  contexto: "onde essa interface será usada"
  stack: "tailwind | css | styled-components | etc"
```

### 5.3 Output esperado
```
1. HTML/JSX/Blade com:
   - Estrutura semântica correta
   - DNA visual aplicado em cada detalhe
   - Responsividade completa
   - Interatividade básica (hover, focus, states)

2. Anotações de design (inline ou comentários):
   - Por que cada decisão foi tomada
   - Variações possíveis
   - O que NÃO fazer
```

---

## 6. Fluxo de Trabalho Detalhado

```
[1] ENTRADA
    Usuário descreve o que quer criar
    ↓
[2] DNA CAPTURE
    Plugin detecta/solicita DNA visual do projeto
    (lê design tokens, kit.json, CSS vars, ou pergunta diretamente)
    ↓
[3] PERSONA MAPPING
    Plugin identifica o "espírito" da interface:
    - SaaS light → limpo, espaçoso, dados em evidência
    - Dark dashboard → contraste, neons, densidade alta
    - Marketing page → expressivo, bold, emocional
    - Admin panel → funcional, compacto, eficiente
    ↓
[4] DECISION LAYER
    Plugin "pensa em voz alta" as decisões de design:
    - Qual hierarquia tipográfica aplicar?
    - Qual é o foco principal desta tela?
    - O que o usuário deve fazer primeiro ao ver isso?
    - Como o DNA visual se expressa aqui?
    ↓
[5] GENERATION
    Código gerado com base nas decisões documentadas
    ↓
[6] REVIEW PASS
    Plugin verifica:
    - DNA visual está presente? (não cores genéricas)
    - Hierarquia está clara? (um elemento dominante por seção)
    - Responsividade funciona? (3 breakpoints mínimos)
    - Interatividade está presente? (hover, focus states)
    ↓
[7] OUTPUT
    Código + comentários de design rationale
```

---

## 7. Adaptação para Diferentes Ambientes

### 7.1 Claude Code (CLI)
```markdown
# SKILL.md para Claude Code

name: frontend-design
description: "Use when creating any visual component, page section, or UI interface"

## Activation
- Invoke via Skill tool before any visual generation task
- Provide DNA context or ask user for it

## Process
[processo detalhado conforme seção 6]
```

### 7.2 Cursor / VS Code com extensão
```markdown
# .cursorrules ou AGENTS.md

Ao criar qualquer componente visual:
1. Capture o DNA do projeto (tailwind.config.js, design-tokens.json, ou variáveis CSS)
2. Aplique os princípios de hierarquia, espaço e identidade
3. Gere código que parece feito por um designer sênior, não por uma IA genérica
```

### 7.3 OpenAI / GPT (API ou ChatGPT)
```markdown
# System prompt para qualquer LLM

Você é um designer frontend sênior com expertise em:
- Hierarquia visual e composição
- Sistemas de design (tokens, componentes, padrões)
- Tailwind CSS v4 + Alpine.js
- Interfaces que comunicam identidade de marca

Antes de gerar qualquer interface:
1. Solicite o DNA visual (cores primária, background, surface, texto, tipografia)
2. Identifique a personalidade da interface
3. Documente suas decisões de design em comentários
4. Nunca gere o "padrão genérico de IA"
```

### 7.4 Gemini CLI
```markdown
# GEMINI.md

frontend-design-principles:
  Ao receber qualquer tarefa de interface visual, aplicar:
  - DNA injection: capturar tokens do projeto antes de gerar
  - Decision layer: documentar escolhas de design
  - Quality check: verificar hierarquia, espaço, identidade
```

### 7.5 GitHub Copilot / Codex
```markdown
# .github/copilot-instructions.md

When generating frontend components:
- Always respect the project's color tokens (tailwind.config.js)
- Apply visual hierarchy: one dominant element per section
- Generate hover/focus states for all interactive elements
- Avoid generic gradients, prefer brand-specific color combinations
```

---

## 8. Design Language (Vocabulário Técnico do Plugin)

Termos que o plugin usa internamente para tomar decisões:

| Termo | Definição | Uso |
|-------|-----------|-----|
| **DNA Visual** | Conjunto mínimo de tokens que definem identidade | Injetado em toda geração |
| **Âncora Visual** | Elemento dominante que "ancora" a composição | 1 por seção obrigatório |
| **Breathing Room** | Espaço em branco intencional | min 40px entre seções |
| **Hierarquia de Peso** | Contraste tipográfico que guia o olhar | display→heading→body→caption |
| **Estado Vivo** | Hover/focus/active que comunicam interatividade | Obrigatório em todo elemento clicável |
| **Personalidade de Marca** | Tom visual derivado das tags da personalidade | Aplicado em detalhes, não só nas cores |
| **Densidade Calibrada** | Informação suficiente sem sobrecarga | Por persona: admin=alta, marketing=baixa |

---

## 9. Anti-padrões que o Plugin Evita

| Anti-padrão | Por quê é genérico | O que fazer em vez |
|-------------|-------------------|--------------------|
| Gradiente azul→roxo sem contexto | É o default de qualquer LLM | Usar gradiente derivado da cor primária do DNA |
| Cards todos do mesmo tamanho | Falta de hierarquia | Card principal 2x maior, secundários menores |
| CTA "Começar agora" centralizado | 100% previsível | CTA com contexto visual (icon + badge + stat) |
| Gray-on-gray para texto muted | Contraste insuficiente | Sempre testar contraste mínimo AA |
| Sidebar fixa em todas as telas | Quebra mobile | Drawer Alpine em mobile, sidebar em lg: |
| Ícones emoji em interfaces modernas | Não escalam, quebram identidade | SVG icons com cor do token primário |
| Section titles ALL CAPS sem contexto | Agressivo e sem propósito | Uppercase apenas para labels/tags pequenos |

---

## 10. Integração com Design Kit Generator

O `frontend-design` é chamado na **Fase 4** do `design-kit-generator` para gerar o
hero section da showcase. O protocolo de integração é:

```
1. design-kit-generator extrai DNA na Fase 1
2. design-kit-generator chega na Fase 4 (showcase)
3. Ativa frontend-design:
   - Fornece: DNA completo + personalidade + lista de 34 componentes
   - Solicita: hero section HTML com stat cards
4. frontend-design retorna: hero section pronto com qualidade de produção
5. design-kit-generator incorpora o hero na showcase canônica
6. Agente continua gerando as 34 seções de componentes
```

**Contrato de input para o hero section:**
```
Gerar hero section para o kit {nome} com DNA:
  primary: {hex}  background: {hex}  surface: {hex}
  font: {fonte}   personalidade: [{tag1}, {tag2}, {tag3}]
  componentes: 34  tokens: 12  breakpoints: 3

Estrutura obrigatória:
  - Título display grande (nome do kit)
  - Subtítulo/tagline em itálico
  - Pills de personalidade
  - Grid de 3 stat cards (Componentes | Tokens | Breakpoints)
  - Sem sidebar, sem nav (o sticky header já existe acima)
```

---

## 11. Roadmap de Evolução

### v1.0 — Atual (skill em SKILL.md)
- Ativação manual via Skill tool
- Input via prompt textual
- Output: HTML com comentários

### v1.1 — Leitura automática de tokens
- Auto-detecta `tailwind.config.js`, `design-tokens.json`, CSS variables
- Não precisa que o usuário forneça o DNA manualmente

### v1.2 — Templates por seção
- Library de templates para: hero, dashboard, landing, auth, settings, pricing
- Cada template tem variantes por personalidade (SaaS, Finance, Creative, etc.)

### v2.0 — LLM-agnostic portable format
- DESIGN_CONTEXT.json padronizado que qualquer LLM consome
- Funciona idêntico em Claude, GPT, Gemini, Llama
- Importável via CLI: `cat DESIGN_CONTEXT.json | llm-of-choice "crie um hero section"`

### v2.1 — Editor extensions
- VS Code extension que injeta DNA automaticamente no contexto do Copilot
- Cursor: .cursorrules gerado automaticamente a partir do kit.json
- Windsurf: similar

### v3.0 — Design feedback loop
- Plugin gera + avalia a própria saída contra os princípios
- Score de qualidade de design (hierarquia, espaço, identidade, acessibilidade)
- Auto-revisão antes de entregar

---

## 12. Métricas de Sucesso

| Métrica | Baseline (sem plugin) | Target (com plugin) |
|---------|----------------------|---------------------|
| "Parece feito por designer" (avaliação subjetiva 1-10) | 4/10 | 8/10 |
| Consistência com DNA do kit (1-10) | 3/10 | 9/10 |
| Retrabalho manual necessário após geração | 60-80% | < 20% |
| Presença de anti-padrões | 3-5 por interface | 0 |
| Tempo para tela de produção | 2-4h | 20-40min |

---

## 13. Portabilidade Total — O Princípio Fundamental

> **Nenhuma capacidade de design deve depender de um vendor específico.**
> Um projeto com `.architect/design/` funciona igual em Claude Code, Cursor, VS Code + Copilot,
> Windsurf, GPT-4o, Gemini CLI ou qualquer LLM futuro — sem reconfiguração.

### 13.1 Por que portabilidade importa

O ecossistema de ferramentas de IA muda rapidamente:
- O LLM que você usa hoje pode não ser o melhor em 6 meses
- Editores mudam (Cursor → Windsurf → próximo)
- Times usam ferramentas diferentes (dev A usa Copilot, dev B usa Claude)
- CI/CD pode usar um LLM diferente do seu editor local

**Sem portabilidade:** o DNA visual e os princípios de design vivem dentro de um skill
específico de um produto específico. Trocar de LLM = perder toda a identidade visual do projeto.

**Com portabilidade:** o DNA e os princípios vivem **no repositório**, como código.
Qualquer LLM lê, qualquer editor consome, qualquer dev colabora.

---

### 13.2 Arquitetura Portável — Estrutura de Arquivos

```
projeto/
│
├── .architect/design/                          ← "Design system as code" — portável e versionável
│   ├── DESIGN_CONTEXT.json           ← DNA visual completo (fonte de verdade)
│   ├── DESIGN_PRINCIPLES.md          ← Princípios em linguagem natural (~500 tokens)
│   ├── ANTI_PATTERNS.md              ← Lista negra de padrões proibidos
│   ├── COMPONENT_CONTRACTS.md        ← @props canônicos (se projeto Blade/Laravel)
│   └── templates/                    ← Templates de seção por tipo de interface
│       ├── hero.md
│       ├── dashboard.md
│       ├── forms.md
│       ├── landing.md
│       └── auth.md
│
├── .cursorrules                      ← Cursor: lê .architect/design/ automaticamente
├── CLAUDE.md                         ← Claude Code: instrução de onde buscar DNA
├── AGENTS.md                         ← Codex/OpenAI: mesma instrução
├── GEMINI.md                         ← Gemini CLI: mesma instrução
├── .github/
│   └── copilot-instructions.md       ← GitHub Copilot: mesma instrução
│
└── [código do projeto]
```

**Regra de ouro:** Cada arquivo de instrução por LLM/editor aponta para `.architect/design/` —
**nunca duplica o conteúdo**. O DNA existe em um lugar só.

---

### 13.3 DESIGN_CONTEXT.json — Formato Canônico Universal

Este é o arquivo central. Qualquer ferramenta lê este JSON para obter o DNA visual.

```json
{
  "version": "1.0",
  "project": "nome-do-projeto",
  "kit": "slug-do-kit-ativo",

  "dna": {
    "primary":       "#hex",
    "primary_name":  "Nome Semântico da Cor",
    "background":    "#hex",
    "bg_name":       "Nome Semântico do Background",
    "surface":       "#hex",
    "surface_name":  "Nome Semântico do Surface",
    "text":          "#hex",
    "muted":         "#hex",
    "border":        "#hex",
    "shadow":        "0 4px 20px rgba(0,0,0,0.05)",
    "radius":        "rounded-xl",
    "font_heading":  "Inter",
    "font_body":     "Inter"
  },

  "palette_extended": {
    "success":  "#22c55e",
    "danger":   "#ef4444",
    "warning":  "#f59e0b",
    "info":     "#3b82f6"
  },

  "personality":   ["tag1", "tag2", "tag3"],
  "theme":         "light",
  "stack":         "tailwind-v4+alpine",
  "language":      "pt-BR",

  "principles": {
    "hierarchy":       "one dominant element per section",
    "breathing_room":  "min 40px between major sections",
    "responsive":      ["mobile-375", "tablet-768", "desktop-1280"],
    "accessibility":   "WCAG-AA",
    "interaction":     "hover+focus states mandatory on all clickable elements"
  },

  "anti_patterns": [
    "generic blue-to-purple gradient without brand context",
    "placeholder-only form fields (no labels)",
    "all-same-size cards without visual hierarchy",
    "emoji icons in production interfaces",
    "dynamic tailwind class concatenation (bg- + variable)"
  ],

  "meta": {
    "generated_at": "ISO-date",
    "source":       "docs/inspirations/{slug}/code.html",
    "kit_json":     "docs/kits/{slug}/kit.json"
  }
}
```

---

### 13.4 DESIGN_PRINCIPLES.md — Instrução Universal (~500 tokens)

Arquivo em linguagem natural que qualquer LLM entende sem treinamento específico.
Otimizado para ser incluído em contexto sem gastar tokens em excesso.

```markdown
# Design Principles — {Project Name}

## DNA Visual
Antes de gerar qualquer interface, leia `.architect/design/DESIGN_CONTEXT.json`.
Aplique as cores, fontes e sombras definidas ali. Nunca use cores genéricas.

## Hierarquia
- Cada seção tem exatamente 1 elemento âncora (o mais importante visualmente)
- Tamanho, peso e cor comunicam importância: display > heading > body > caption
- CTA primário sempre mais destacado que o secundário

## Espaço
- Mínimo 40px entre seções maiores
- Cards respiram: padding >= 24px
- Nunca comprima texto contra bordas

## Identidade
- A cor primária do DNA aparece em pelo menos 1 detalhe de cada seção
- Sombras sempre derivadas do token `shadow` do DNA — nunca `shadow-xl` genérico
- Border-radius sempre o token `radius` do DNA — nunca misturar estilos

## Interatividade
- Todo elemento clicável tem hover state com transição (150-200ms)
- Inputs têm estado de foco com ring da cor primária
- Botões têm estado :active ligeiramente mais escuro

## Responsividade
- Mobile first: estilos base para 375px
- sm: 640px, md: 768px, lg: 1024px, xl: 1280px
- Sidebar fixa no desktop → drawer Alpine em mobile (nunca sidebar fixa em mobile)

## Nunca fazer
- Gradiente genérico azul/roxo sem relação com o DNA
- Placeholder como único label de campo
- Cards todos do mesmo tamanho em grid (falta hierarquia)
- Classes Tailwind dinâmicas: `'bg-' . $variavel` (não compila no JIT)
- Toasts renderizados diretamente (sempre trigger-based)
```

---

### 13.5 Instruções por Ambiente — Conteúdo de Cada Arquivo

Cada arquivo de instrução é **minimalista** — apenas aponta para `.architect/design/`:

**`CLAUDE.md` (Claude Code):**
```markdown
## Frontend Design
Antes de criar qualquer componente visual ou interface:
1. Leia `.architect/design/DESIGN_CONTEXT.json` para o DNA visual do projeto
2. Aplique os princípios em `.architect/design/DESIGN_PRINCIPLES.md`
3. Evite os anti-padrões listados em `.architect/design/ANTI_PATTERNS.md`
4. Para seções específicas, consulte `.architect/design/templates/{tipo}.md`
```

**`.cursorrules` (Cursor):**
```
Before generating any visual component or UI:
- Read .architect/design/DESIGN_CONTEXT.json for visual DNA
- Apply principles from .architect/design/DESIGN_PRINCIPLES.md
- Never use generic gradients or placeholder-only forms
- Always use project color tokens, never hardcoded generics
```

**`AGENTS.md` (Codex/OpenAI/qualquer agente):**
```markdown
## Visual Design Standards
All frontend generation must:
1. Load visual DNA from .architect/design/DESIGN_CONTEXT.json
2. Follow .architect/design/DESIGN_PRINCIPLES.md
3. Reject anti-patterns from .architect/design/ANTI_PATTERNS.md
```

**`.github/copilot-instructions.md`:**
```markdown
## Frontend Components
When generating UI components:
- Use project color tokens from .architect/design/DESIGN_CONTEXT.json
- Apply visual hierarchy: one dominant element per section
- Generate hover/focus states for all interactive elements
```

**`GEMINI.md`:**
```markdown
## design-context
Ao criar interfaces visuais: carregar .architect/design/DESIGN_CONTEXT.json e aplicar
os princípios de .architect/design/DESIGN_PRINCIPLES.md antes de qualquer geração.
```

---

### 13.6 Fluxo de Portabilidade em Ação

**Cenário: Dev A usa Claude Code, Dev B usa Cursor, CI usa GPT-4o**

```
[Repositório]
  └── .architect/design/DESIGN_CONTEXT.json   ← DNA versionado no git

Dev A (Claude Code):
  CLAUDE.md → lê .architect/design/ → gera interface com DNA correto ✅

Dev B (Cursor):
  .cursorrules → lê .architect/design/ → gera interface com DNA correto ✅

CI pipeline (GPT-4o via API):
  system prompt + conteúdo de .architect/design/ → gera interface com DNA correto ✅

Dev C (novo no time, usa Windsurf):
  Clona o repo → .architect/design/ já está lá → configura WINDSURF.md em 5 min → ✅
```

**Resultado:** Todos os ambientes produzem interfaces visualmente consistentes
com o DNA do projeto — sem comunicação manual, sem retrabalho.

---

### 13.7 Versionamento do DNA

Como `.architect/design/` é um diretório de código, o DNA visual é **versionado com o projeto**:

```bash
# Exemplo de histórico git
git log --oneline .architect/design/DESIGN_CONTEXT.json

a3f2c1b feat(design): add lime-black kit DNA
9e4d8f7 feat(design): update primary color to #D2FF3C
2b1a9c3 feat(design): initial design context from dash-blue inspiration
```

**Benefícios:**
- PR de design change = revisão em code review normal
- Rollback de mudança visual = `git revert`
- Branch de experimento de identidade = branch normal
- Comparar kits = `git diff`

---

### 13.8 Geração Automática do `.architect/design/` via CLI

Integração com o `design-kit-generator`: ao final da Fase 1 (DNA Extraction),
gerar automaticamente o `.architect/design/DESIGN_CONTEXT.json` do kit ativo:

```bash
# Comando futuro (a implementar)
php artisan kit:export-context {slug}
# → .architect/design/DESIGN_CONTEXT.json
# → .architect/design/COMPONENT_CONTRACTS.md  (contratos canônicos do kit)
```

Ou, no contexto atual, o próprio `design-kit-generator` **cria/atualiza** o arquivo
durante a Fase 1 como parte do pipeline de geração.

---

## 14. Próximos Passos Imediatos

### Prioridade 1 — Criar implementação local do skill
Criar `.claude/skills/design-interface/SKILL.md` baseado neste PRD.
Substitui a dependência do skill externo `frontend-design:frontend-design` por uma
implementação local portável que funciona em qualquer LLM.

### Prioridade 2 — Inicializar `.architect/design/` no projeto
```
.architect/design/
├── DESIGN_CONTEXT.json        ← Derivar dos kits dash-blue e lime-black existentes
├── DESIGN_PRINCIPLES.md       ← Extrair da seção 13.4 deste PRD
└── ANTI_PATTERNS.md           ← Extrair da seção 9 deste PRD
```

### Prioridade 3 — Atualizar `design-kit-generator` Fase 4
Substituir "ativar `frontend-design:frontend-design`" por:
```
1. Ler .architect/design/DESIGN_CONTEXT.json (ou gerar se não existir)
2. Seguir DESIGN_PRINCIPLES.md
3. Gerar hero section com qualidade de produção
```
Isso garante que o `design-kit-generator` funcione em qualquer LLM.

### Prioridade 4 — Criar instruções por ambiente
Adicionar ao projeto: `.cursorrules`, `AGENTS.md`, `.github/copilot-instructions.md`
(todos apontando para `.architect/design/`, nunca duplicando conteúdo).

---

## Referências

- Skill externo inspecionável: `frontend-design:frontend-design` (Superpowers — código fechado)
- Skill local a criar: `.claude/skills/design-interface/SKILL.md`
- DNA fonte de verdade: `.architect/design/DESIGN_CONTEXT.json` (a criar)
- Kits de referência com qualidade: `dash-blue`, `dash-orange`
- Kits que precisam de padronização: `lime-black`, `dash-dark-green`
- Uso no pipeline: `design-kit-generator` Fase 4 (showcase hero section)