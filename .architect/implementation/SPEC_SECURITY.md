# Especificação: Regras de Segurança Avançadas

**Versão:** 1.0.0
**Status:** Planning
**Data:** 2026-03-22

---

## SEC-003: XSS Detection

### Descrição
Detecta padrões de Cross-Site Scripting (XSS) em código gerado por IA.

### Patterns a detectar

| Pattern | Severidade | Exemplo |
|---------|------------|---------|
| innerHTML com dados externos | critical | `element.innerHTML = userInput` |
| outerHTML com dados externos | critical | `element.outerHTML = input` |
| insertAdjacentHTML | critical | `div.insertAdjacentHTML('beforeend', userData)` |
| document.write | critical | `document.write(htmlContent)` |
| eval() com string dinâmica | critical | `eval('document.' + prop)` |
| setTimeout com string | high | `setTimeout('alert("' + x + '")', 1000)` |
| Function constructor dinâmico | high | `new Function('return ' + userData)()` |

### Implementação

```typescript
// src/rules/SecurityRules.ts - adicionar nova função

export function createXSSRule(): BehaviorRule {
  return {
    id: 'SEC-003',
    name: 'XSS Detection',
    trigger: 'after_generation',
    severity: 'critical',
    description: 'Detecta padrões de XSS em código gerado',
    
    validate(context: RuleContext): RuleResult {
      const issues: Issue[] = [];
      const patterns = [
        { 
          pattern: /\.innerHTML\s*=/g, 
          code: 'SEC-003', 
          msg: 'innerHTML detectado — use textContent ou sanitize' 
        },
        {
          pattern: /\.outerHTML\s*=/g,
          code: 'SEC-003',
          msg: 'outerHTML detectado — risco de XSS'
        },
        {
          pattern: /insertAdjacentHTML\s*\(/g,
          code: 'SEC-003',
          msg: 'insertAdjacentHTML detectado — use textContent ou DOMPurify'
        },
        {
          pattern: /document\.write\s*\(/g,
          code: 'SEC-003',
          msg: 'document.write detectado — remove do código'
        },
      ];
      
      // ... implementação similar a SEC-001/002
    },
    
    enforce(context, result) {
      // Substituir por textContent ou sanitizer
    }
  };
}
```

---

## SEC-004: PII Exposure Detection

### Descrição
Detecta exposição de Dados Pessoais Identificáveis (PII) em logs e código.

### Patterns a detectar

| Pattern | Severidade | Exemplo |
|---------|------------|---------|
| Logging de email | high | `console.log(email)` |
| Logging de senha/token | critical | `console.log(password)` |
| Logging de CPF/CPNJ | high | `console.log(cpf)` |
| Logging de cartão | critical | `console.log(creditCard)` |
| Console.log com variáveis sensíveis | medium | `console.log(userData)` |
| Exposição de variáveis com nomes sensíveis | high | `const secret = ...` |

### Nomes de variáveis sensíveis

```typescript
const SENSITIVE_PATTERNS = [
  /password/i, /passwd/i, /pwd/i,
  /secret/i, /token/i, /apiKey/i, /apikey/i,
  /email/i, /mail/i,
  /cpf/i, /cnpj/i, /document/i,
  /credit.?card/i, /card.?number/i, /cvv/i,
  /phone/i, /mobile/i, /telefone/i,
  /address/i, /endereço/i,
  /birth/i, /nascimento/i,
  /ssn/i, /social.?security/i,
];
```

### Implementação

```typescript
export function createPIIRule(): BehaviorRule {
  return {
    id: 'SEC-004',
    name: 'PII Exposure Detection',
    trigger: 'after_generation',
    severity: 'high',
    description: 'Detecta exposição de dados pessoais em logs e código',
    
    validate(context: RuleContext): RuleResult {
      const issues: Issue[] = [];
      const code = context.code;
      
      // Detectar logging de variáveis sensíveis
      for (const pattern of SENSITIVE_PATTERNS) {
        const matches = code.match(new RegExp(`console\\.(log|warn|error|info).*${pattern.source}`, 'gi'));
        if (matches) {
          issues.push({
            code: 'SEC-004',
            message: `Logging de dados sensíveis detectado: ${pattern.source}`,
            severity: 'high',
            file: context.filePath,
          });
        }
      }
      
      // ...
    }
  };
}
```

---

## Enforce Suggestions

### Para SEC-003 (XSS)

```typescript
suggestions: [
  'Use element.textContent = userInput (seguro)',
  'Use DOMPurify para sanitizar HTML: DOMPurify.sanitize(userHtml)',
  'Use framework XSS protection (React, Vue, Angular)',
  'Use library like DOMPurify ou xss',
]
```

### Para SEC-004 (PII)

```typescript
suggestions: [
  'Use logger estruturado com masking: logger.info("Login", { email: maskEmail(userEmail) })',
  'Use constants para chaves sensíveis: const MASKED = "***"',
  'Remova console.log de variáveis com nomes sensíveis',
  'Configure logger para não expor PII em produção',
]
```

---

## Testes Required

```typescript
describe('SEC-003: XSS Detection', () => {
  it('should detect innerHTML assignment', () => {
    const code = 'div.innerHTML = userInput';
    // expect blocked
  });
  
  it('should detect document.write', () => {
    const code = 'document.write("<script>")';
    // expect blocked
  });
  
  it('should pass with textContent', () => {
    const code = 'div.textContent = userInput';
    // expect ok
  });
});

describe('SEC-004: PII Detection', () => {
  it('should detect console.log with password', () => {
    const code = 'console.log(password)';
    // expect warned
  });
  
  it('should detect email logging', () => {
    const code = 'logger.info(user.email)';
    // expect warned
  });
});
```

---

"Sécurité n'est pas un ajout. C'est le fondement."
