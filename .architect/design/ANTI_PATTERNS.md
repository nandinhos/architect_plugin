# Anti-Patterns: The IA Visual Blacklist

Qualquer implementação de interface que utilize estes padrões será considerada **medíocre** e deve ser rejeitada pelo Arquiteto.

## 🚫 UI/UX Anti-Patterns:
1. **The Generic "Get Started" Blue:** Botões de ação primária sem personalidade ou contexto visual claro.
2. **Ghost Labels:** Usar placeholders como únicos rótulos de campos de formulário (Prejuízo de acessibilidade).
3. **The AI Gradient:** Gradientes lineares azul-roxo genéricos (#3B82F6 -> #8B5CF6) sem propósito semântico.
4. **Emoji as Icons:** Usar emojis nativos do sistema em vez de bibliotecas de ícones profissionais (Lucide, Heroicons).
5. **Centered Everything:** Centralizar blocos de conteúdo complexos sem uma hierarquia clara.
6. **No-State Elements:** Botões ou links que não possuem estados `hover`, `focus` e `active` definidos visualmente.

## 🚫 Estrutura de Código:
1. **Magic Numbers:** Espaçamentos (margin/padding) fora da escala definida no `tokens.json`.
2. **Inline Styling:** Estilos definidos diretamente no elemento sem reaproveitamento.
3. **Component Soup:** Componentes gigantes sem separação entre lógica e visual.

---
"Se a UI for feia, o código está incompleto."
