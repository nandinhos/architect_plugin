# Security & Privacy Rules (SAST/Taint)

1. **Sanitização Universal:** Todo input de usuário deve ser tratado como malicioso.
2. **PII Protection:** Nunca logar dados sensíveis (emails, senhas, tokens) em logs.
3. **Least Privilege:** Funções e APIs devem ter apenas as permissões necessárias.
4. **Auditoria Pré-Commit:** Antes de finalizar tarefas de backend, execute uma varredura de segurança manual ou via extensão (ex: `/security:analyze`).
