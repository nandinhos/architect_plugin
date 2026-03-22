import { createDesignValidatorRule } from './DesignRules';
import { RuleContext } from '../types';

describe('DesignRules', () => {
  const rule = createDesignValidatorRule({ primary: '#6366F1' });

  const baseContext: RuleContext = {
    code: '',
    filePath: 'test.ts',
    fileName: 'test.ts',
    language: 'typescript',
    metadata: {},
  };

  describe('DES-001: Design Token Validator', () => {
    it('deve passar para codigo sem issues de design', () => {
      const context: RuleContext = {
        ...baseContext,
        code: 'export const Button = styled.button`background: ${tokens.primary};`;',
      };

      const result = rule.validate(context);
      expect(result.valid).toBe(true);
      expect(result.issues).toHaveLength(0);
    });

    it('deve detectar gradiente generico', () => {
      const context: RuleContext = {
        ...baseContext,
        code: 'background: linear-gradient(to right, #3B82F6, #8B5CF6);',
      };

      const result = rule.validate(context);
      expect(result.valid).toBe(false);
      expect(result.issues.some((i) => i.code === 'DES-002')).toBe(true);
    });

    it('deve detectar placeholder como unico label', () => {
      const context: RuleContext = {
        ...baseContext,
        language: 'html',
        code: '<input placeholder="Digite seu nome" />',
      };

      const result = rule.validate(context);
      expect(result.valid).toBe(false);
      expect(result.issues.some((i) => i.code === 'DES-003')).toBe(true);
    });

    it('deve detectar emojis em codigo', () => {
      const context: RuleContext = {
        ...baseContext,
        code: 'const icon = "🔥";',
      };

      const result = rule.validate(context);
      expect(result.valid).toBe(false);
      expect(result.issues.some((i) => i.code === 'DES-004')).toBe(true);
    });

    it('deve detectar cores hardcoded diferentes do primary', () => {
      const ruleWithPrimary = createDesignValidatorRule({ primary: '#000000' });
      const context: RuleContext = {
        ...baseContext,
        code: "const styles = { color: '#EF4444' };",
      };

      const result = ruleWithPrimary.validate(context);
      expect(result.valid).toBe(false);
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

    it('deve detectar emojis em codigo CSS', () => {
      const context: RuleContext = {
        ...baseContext,
        language: 'css',
        code: '.icon::before { content: "🔥"; }',
      };

      const result = rule.validate(context);
      expect(result.issues.some((i) => i.code === 'DES-004')).toBe(true);
    });
  });

  describe('Enforce', () => {
    it('deve retornar undefined quando valido', () => {
      const context: RuleContext = {
        ...baseContext,
        code: 'const x = 1;',
      };

      const result = rule.validate(context);
      expect(rule.enforce?.(context, result)).toBeUndefined();
    });
  });
});
