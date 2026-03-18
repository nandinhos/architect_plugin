# 🧪 Guia do Desenvolvedor: Architect Plugin

Este guia é destinado a desenvolvedores que desejam configurar o ambiente de desenvolvimento local para contribuir ou expandir o `architect-plugin`.

---

## 🚀 1. Configuração do Ambiente

O Arquiteto exige um ambiente de engenharia sênior. Siga os passos abaixo:

### Passo 1: Clonar e Instalar
```bash
git clone https://github.com/nandinhos/architect_plugin.git
cd architect_plugin
npm install
```

### Passo 2: Verificação de Prontidão (Mandatário)
Antes de iniciar, você **DEVE** validar se o seu sistema possui todas as ferramentas necessárias. O Arquiteto não opera em ambientes incompletos.

```bash
node scripts/check-readiness.js
```

**Se a verificação falhar:** O script fornecerá instruções exatas de como corrigir. Siga-as rigorosamente ou peça ajuda ao Gemini CLI.

---

## 🛠️ 2. Workflow de Desenvolvimento

O desenvolvimento deste plugin segue o **Ciclo de Vida do Arquiteto**:

1.  **Planejamento (Conductor):** Toda nova feature deve ter um plano em `docs/plans/architect/`.
2.  **DNA Visual:** Interfaces devem ser baseadas em `.architect/design/tokens.json`.
3.  **TDD (Jest):**
    - Escreva o teste em `src/components/*.test.ts`.
    - Execute: `npm test`.
    - Implemente a lógica apenas após o teste falhar.
4.  **Auditoria de Segurança:**
    - Antes de finalizar, execute: `gemini security:analyze`.
5.  **Revisão de Código:**
    - Solicite revisão via: `gemini code-review`.

---

## 🎼 3. Estrutura do Projeto

- `.architect/`: O motor do protocolo (regras, design, segurança).
- `docs/`: Documentação técnica, PRDs e planos de execução.
- `scripts/`: Utilitários de automação e verificação.
- `src/`: Código-fonte dos componentes e lógica do plugin.

---

## 🤝 4. Contribuição

Ao contribuir, mantenha o tom de voz sênior e o rigor técnico.
- Use commits semânticos (`feat:`, `fix:`, `chore:`, `docs:`).
- Mantenha a documentação sincronizada com o código.
- Nunca ignore os **Anti-Padrões** definidos em `.architect/design/ANTI_PATTERNS.md`.

---

"Código é a expressão da sua disciplina técnica."
