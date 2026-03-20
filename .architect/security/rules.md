# Security & Privacy Rules (SAST/Taint)

## 🎯 Categorias Críticas

### 1. Injeção de SQL (SQLi)
- **Regra:** Nunca concatene strings em queries. Use Prepared Statements.
- **❌ Erro:** `db.query("SELECT * FROM users WHERE id = " + id)`
- **✅ Certo:** `db.query("SELECT * FROM users WHERE id = ?", [id])`

### 2. Cross-Site Scripting (XSS)
- **Regra:** Sempre escape outputs em templates. Use sanitizadores para HTML vindo de usuários.
- **❌ Erro:** `element.innerHTML = userInput`
- **✅ Certo:** `element.textContent = userInput` ou use `DOMPurify`.

### 3. Exposição de Dados Sensíveis (PII)
- **Regra:** Nunca logue emails, senhas ou tokens. Use máscaras em logs de produção.
- **✅ Prática:** `logger.info("Login attempt for user: " + maskEmail(email))`

### 4. Controle de Acesso (Broken Access Control)
- **Regra:** Verifique permissões em cada request/endpoint. Nunca confie no ID vindo do client-side.
- **✅ Prática:** Valide se o `user_id` da sessão possui acesso ao recurso solicitado.

## 🛡️ Auditoria Mandatória
1. **Sanitização Universal:** Todo input de usuário deve ser tratado como malicioso.
2. **Least Privilege:** Funções e APIs devem ter apenas as permissões necessárias.
3. **Varredura Pré-Commit:** Antes de finalizar tarefas de backend, execute `npm audit` e uma varredura SAST.

---
"Segurança não é um feature, é o alicerce."
