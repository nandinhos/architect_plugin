# Design Principles — The Architect Signature

Nossa missão é evitar o "visual genérico de IA".

1. **DNA Visual:** Toda interface deve ler o `.architect/design/tokens.json`.
2. **Hierarquia Visual:** Cada seção deve ter exatamente 1 elemento âncora (o mais importante visualmente).
3. **Espaço (Breathing Room):** Mínimo de 40px entre seções principais e 24px de padding interno em containers.
4. **Interatividade:** Todo elemento clicável deve ter hover e focus states com transições suaves (150-200ms).
5. **Anti-Padrões Proibidos:**
   - Gradientes azul-roxo genéricos.
   - Botões "Começar Agora" centralizados sem contexto visual.
   - Placeholders usados como únicos labels em formulários.
   - Ícones emoji em interfaces de produção.
