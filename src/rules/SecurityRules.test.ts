import { createXSSRule, createPIIDetectionRule } from './SecurityRules';
import { RuleContext } from '../types';

const baseContext: RuleContext = {
  code: '',
  filePath: 'test.ts',
  fileName: 'test.ts',
  language: 'typescript',
  metadata: {},
};

describe('SEC-003: XSS Detection', () => {
  const rule = createXSSRule();

  it('deve detectar innerHTML', () => {
    const ctx = { ...baseContext, code: 'element.innerHTML = userInput;' };
    const result = rule.validate(ctx);

    expect(result.valid).toBe(false);
    expect(result.issues.some((i) => i.code === 'SEC-003')).toBe(true);
    expect(result.issues[0].severity).toBe('critical');
  });

  it('deve detectar outerHTML', () => {
    const ctx = { ...baseContext, code: 'element.outerHTML = html;' };
    const result = rule.validate(ctx);

    expect(result.valid).toBe(false);
    expect(result.issues.some((i) => i.code === 'SEC-003')).toBe(true);
  });

  it('deve detectar insertAdjacentHTML', () => {
    const ctx = { ...baseContext, code: 'el.insertAdjacentHTML("beforeend", html);' };
    const result = rule.validate(ctx);

    expect(result.valid).toBe(false);
    expect(result.issues.some((i) => i.code === 'SEC-003')).toBe(true);
  });

  it('deve detectar document.write', () => {
    const ctx = { ...baseContext, code: 'document.write(userInput);' };
    const result = rule.validate(ctx);

    expect(result.valid).toBe(false);
    expect(result.issues.some((i) => i.code === 'SEC-003')).toBe(true);
  });

  it('deve detectar javascript: URL', () => {
    const ctx = { ...baseContext, code: 'link.href = "javascript:alert(1)";' };
    const result = rule.validate(ctx);

    expect(result.valid).toBe(false);
  });

  it('deve passar para codigo seguro', () => {
    const ctx = { ...baseContext, code: 'element.textContent = userInput;' };
    const result = rule.validate(ctx);

    expect(result.valid).toBe(true);
    expect(result.issues).toHaveLength(0);
  });

  it('deve retornar sugestoes no enforce', () => {
    const ctx = { ...baseContext, code: 'el.innerHTML = html;' };
    const result = rule.validate(ctx);
    const enforced = rule.enforce?.(ctx, result);

    expect(enforced).not.toBeNull();
    expect(enforced?.fixed).toBe(false);
    expect(enforced?.suggestions?.length).toBeGreaterThan(0);
    expect(enforced?.suggestions?.some((s) => s.includes('DOMPurify'))).toBe(true);
  });

  it('deve retornar null no enforce quando valido', () => {
    const ctx = { ...baseContext, code: 'el.textContent = safe;' };
    const result = rule.validate(ctx);

    expect(rule.enforce?.(ctx, result)).toBeNull();
  });
});

describe('SEC-004: PII Exposure Detection', () => {
  const rule = createPIIDetectionRule();

  it('deve detectar password em console.log', () => {
    const ctx = { ...baseContext, code: 'console.log("password:", userPassword);' };
    const result = rule.validate(ctx);

    expect(result.valid).toBe(false);
    expect(result.issues.some((i) => i.code === 'SEC-004')).toBe(true);
    expect(result.issues[0].severity).toBe('critical');
  });

  it('deve detectar secret em console.error', () => {
    const ctx = { ...baseContext, code: 'console.error("secret:", apiKey);' };
    const result = rule.validate(ctx);

    expect(result.valid).toBe(false);
    expect(result.issues[0].severity).toBe('critical');
  });

  it('deve detectar token em console.warn', () => {
    const ctx = { ...baseContext, code: 'console.warn("token:", jwt);' };
    const result = rule.validate(ctx);

    expect(result.valid).toBe(false);
    expect(result.issues[0].severity).toBe('critical');
  });

  it('deve detectar api_key em console.info', () => {
    const ctx = { ...baseContext, code: 'console.info("api_key:", key);' };
    const result = rule.validate(ctx);

    expect(result.valid).toBe(false);
  });

  it('deve detectar email com severity high', () => {
    const ctx = { ...baseContext, code: 'console.log("email:", userEmail);' };
    const result = rule.validate(ctx);

    expect(result.valid).toBe(false);
    expect(result.issues[0].severity).toBe('high');
  });

  it('deve detectar CPF com severity high', () => {
    const ctx = { ...baseContext, code: 'console.log("cpf:", documento);' };
    const result = rule.validate(ctx);

    expect(result.valid).toBe(false);
    expect(result.issues[0].severity).toBe('high');
  });

  it('deve detectar credit card com severity critical', () => {
    const ctx = { ...baseContext, code: 'console.log("credit_card:", cardNumber);' };
    const result = rule.validate(ctx);

    expect(result.valid).toBe(false);
    expect(result.issues[0].severity).toBe('critical');
  });

  it('deve passar para logs sem PII', () => {
    const ctx = { ...baseContext, code: 'console.log("user logged in:", userId);' };
    const result = rule.validate(ctx);

    expect(result.valid).toBe(true);
  });

  it('deve retornar sugestoes de masking no enforce', () => {
    const ctx = { ...baseContext, code: 'console.log("email:", email);' };
    const result = rule.validate(ctx);
    const enforced = rule.enforce?.(ctx, result);

    expect(enforced).not.toBeNull();
    expect(enforced?.fixed).toBe(false);
    expect(enforced?.suggestions?.some((s) => s.includes('masking') || s.includes('NUNCA'))).toBe(
      true
    );
  });

  it('deve retornar null no enforce quando valido', () => {
    const ctx = { ...baseContext, code: 'console.log("ok");' };
    const result = rule.validate(ctx);

    expect(rule.enforce?.(ctx, result)).toBeNull();
  });
});
