import { createNoConsoleRule } from './LoggingRules';
import { RuleContext } from '../types';

describe('LoggingRules', () => {
  const rule = createNoConsoleRule();

  const baseContext: RuleContext = {
    code: '',
    filePath: 'test.ts',
    fileName: 'test.ts',
    language: 'typescript',
    metadata: {},
  };

  describe('LOG-001: No Console Rule', () => {
    it('deve detectar console.log', () => {
      const context: RuleContext = {
        ...baseContext,
        code: 'console.log("debug:", value);',
      };

      const result = rule.validate(context);
      expect(result.valid).toBe(false);
      expect(result.issues).toHaveLength(1);
      expect(result.issues[0].code).toBe('LOG-001');
    });

    it('deve detectar console.warn', () => {
      const context: RuleContext = {
        ...baseContext,
        code: 'console.warn("Warning message");',
      };

      const result = rule.validate(context);
      expect(result.valid).toBe(false);
    });

    it('deve detectar console.error', () => {
      const context: RuleContext = {
        ...baseContext,
        code: 'console.error("Error occurred");',
      };

      const result = rule.validate(context);
      expect(result.valid).toBe(false);
    });

    it('deve detectar console.debug', () => {
      const context: RuleContext = {
        ...baseContext,
        code: 'console.debug("Debug info");',
      };

      const result = rule.validate(context);
      expect(result.valid).toBe(false);
    });

    it('deve detectar console.info', () => {
      const context: RuleContext = {
        ...baseContext,
        code: 'console.info("Info message");',
      };

      const result = rule.validate(context);
      expect(result.valid).toBe(false);
    });

    it('deve ignorar console.log comentado', () => {
      const context: RuleContext = {
        ...baseContext,
        code: '// console.log("debug:", value);',
      };

      const result = rule.validate(context);
      expect(result.valid).toBe(true);
      expect(result.issues).toHaveLength(0);
    });

    it('deve ignorar console.log em linha comentada', () => {
      const context: RuleContext = {
        ...baseContext,
        code: '// console.log("debug:", value);',
      };

      const result = rule.validate(context);
      expect(result.valid).toBe(true);
      expect(result.issues).toHaveLength(0);
    });

    it('deve passar para codigo sem console', () => {
      const context: RuleContext = {
        ...baseContext,
        code: 'export function add(a: number, b: number): number { return a + b; }',
      };

      const result = rule.validate(context);
      expect(result.valid).toBe(true);
      expect(result.issues).toHaveLength(0);
    });

    it('deve detectar multiplos console.logs em linhas diferentes', () => {
      const context: RuleContext = {
        ...baseContext,
        code: 'console.log("a");\nconsole.log("b");\nconsole.log("c");',
      };

      const result = rule.validate(context);
      expect(result.valid).toBe(false);
      expect(result.issues.length).toBe(3);
    });

    it('deve reportar a linha correta', () => {
      const context: RuleContext = {
        ...baseContext,
        code: 'const x = 1;\nconsole.log(x);\nconst y = 2;',
      };

      const result = rule.validate(context);
      expect(result.issues[0].line).toBe(2);
    });
  });

  describe('Enforce', () => {
    it('deve corrigir console.log para logger.info', () => {
      const context: RuleContext = {
        ...baseContext,
        code: 'console.log("debug:", value);',
      };

      const result = rule.validate(context);
      const fixed = rule.enforce?.(context, result);

      expect(fixed?.fixed).toBe(true);
      expect(fixed?.fixedCode).toContain('logger.info(');
    });

    it('deve retornar null quando valido', () => {
      const context: RuleContext = {
        ...baseContext,
        code: 'const x = 1;',
      };

      const result = rule.validate(context);
      expect(rule.enforce?.(context, result)).toBeNull();
    });
  });
});
