import {
  createHardcodedColorRule,
  createGenericGradientRule,
  createPlaceholderLabelRule,
  createEmojiIconRule,
} from './DesignRules';
import { RuleContext } from '../types';

const baseContext: RuleContext = {
  code: '',
  filePath: 'test.ts',
  fileName: 'test.ts',
  language: 'typescript',
  metadata: {},
};

describe('DES-001: Hardcoded Color Detection', () => {
  const rule = createHardcodedColorRule({ primary: '#6366F1' });

  it('deve passar para codigo sem cores hardcoded', () => {
    const context: RuleContext = {
      ...baseContext,
      code: 'export const Button = styled.button`background: ${tokens.primary};`;',
    };

    const result = rule.validate(context);
    expect(result.valid).toBe(true);
    expect(result.issues).toHaveLength(0);
  });

  it('deve detectar cores hardcoded diferentes do primary', () => {
    const ruleWithPrimary = createHardcodedColorRule({ primary: '#000000' });
    const context: RuleContext = {
      ...baseContext,
      code: "const styles = { color: '#EF4444' };",
    };

    const result = ruleWithPrimary.validate(context);
    expect(result.valid).toBe(false);
    expect(result.issues[0].code).toBe('DES-001');
  });

  it('deve ignorar cores iguais ao primary', () => {
    const context: RuleContext = {
      ...baseContext,
      code: "const styles = { color: '#6366F1' };",
    };

    const result = rule.validate(context);
    expect(result.valid).toBe(true);
  });

  it('deve ignorar arquivos json', () => {
    const context: RuleContext = {
      ...baseContext,
      language: 'json',
      code: '{"color": "#EF4444"}',
    };

    const result = rule.validate(context);
    expect(result.valid).toBe(true);
  });

  it('deve retornar sugestao no enforce', () => {
    const context: RuleContext = {
      ...baseContext,
      code: "const x = '#EF4444';",
    };

    const result = rule.validate(context);
    const enforced = rule.enforce?.(context, result);
    expect(enforced).not.toBeNull();
    expect(enforced?.fixed).toBe(false);
    expect(enforced?.suggestions?.length).toBeGreaterThan(0);
  });

  it('deve retornar null no enforce quando valido', () => {
    const context: RuleContext = {
      ...baseContext,
      code: 'const x = 1;',
    };

    const result = rule.validate(context);
    expect(rule.enforce?.(context, result)).toBeNull();
  });
});

describe('DES-002: Generic Gradient Detection', () => {
  const rule = createGenericGradientRule();

  it('deve detectar gradiente linear', () => {
    const context: RuleContext = {
      ...baseContext,
      code: 'background: linear-gradient(to right, #3B82F6, #8B5CF6);',
    };

    const result = rule.validate(context);
    expect(result.valid).toBe(false);
    expect(result.issues[0].code).toBe('DES-002');
    expect(result.issues[0].severity).toBe('low');
  });

  it('deve detectar gradiente shorthand', () => {
    const context: RuleContext = {
      ...baseContext,
      code: 'background: gradient(#3B82F6, #8B5CF6);',
    };

    const result = rule.validate(context);
    expect(result.valid).toBe(false);
  });

  it('deve passar para codigo sem gradientes', () => {
    const context: RuleContext = {
      ...baseContext,
      code: 'background: ${tokens.gradient};',
    };

    const result = rule.validate(context);
    expect(result.valid).toBe(true);
  });
});

describe('DES-003: Placeholder Without Label', () => {
  const rule = createPlaceholderLabelRule();

  it('deve detectar placeholder como unico label', () => {
    const context: RuleContext = {
      ...baseContext,
      language: 'html',
      code: '<input placeholder="Digite seu nome" />',
    };

    const result = rule.validate(context);
    expect(result.valid).toBe(false);
    expect(result.issues[0].code).toBe('DES-003');
    expect(result.issues[0].severity).toBe('medium');
  });

  it('deve passar para codigo sem placeholders genericos', () => {
    const context: RuleContext = {
      ...baseContext,
      language: 'html',
      code: '<input placeholder="Pesquisar..." />',
    };

    const result = rule.validate(context);
    expect(result.valid).toBe(true);
  });
});

describe('DES-004: Emoji in Code Detection', () => {
  const rule = createEmojiIconRule();

  it('deve detectar emojis em codigo', () => {
    const context: RuleContext = {
      ...baseContext,
      code: 'const icon = "🔥";',
    };

    const result = rule.validate(context);
    expect(result.valid).toBe(false);
    expect(result.issues[0].code).toBe('DES-004');
  });

  it('deve detectar emojis em texto', () => {
    const context: RuleContext = {
      ...baseContext,
      code: 'const msg = "Sucesso 🔥";',
    };

    const result = rule.validate(context);
    expect(result.valid).toBe(false);
  });

  it('deve passar para codigo sem emojis', () => {
    const context: RuleContext = {
      ...baseContext,
      code: 'const icon = <Icon name="fire" />;',
    };

    const result = rule.validate(context);
    expect(result.valid).toBe(true);
  });
});
