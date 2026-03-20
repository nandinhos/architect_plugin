import { ArchitectEngine, DecisionEngine } from './index';
import { createSQLInjectionRule, createEvalRule } from './rules/SecurityRules';
import { createTestRequiredRule } from './rules/TestRules';
import { createAntiPatternRule } from './rules/CodeQualityRules';
import { createNoConsoleRule } from './rules/LoggingRules';

describe('ArchitectEngine', () => {
  let engine: ArchitectEngine;

  beforeEach(() => {
    engine = new ArchitectEngine({ autoFix: false, failOn: 'high' });
  });

  describe('RuleRegistry', () => {
    it('should register and retrieve rules by trigger', () => {
      const rule = createSQLInjectionRule();
      engine.registerRule(rule);

      const rules = engine.getRules();
      expect(rules).toHaveLength(1);
      expect(rules[0].id).toBe('SEC-001');
    });

    it('should throw on duplicate rule registration', () => {
      const rule = createSQLInjectionRule();
      engine.registerRule(rule);
      expect(() => engine.registerRule(rule)).toThrow('already registered');
    });

    it('should batch register rules', () => {
      engine.registerRules([createSQLInjectionRule(), createEvalRule()]);
      expect(engine.getRuleCount()).toBe(2);
    });
  });

  describe('Security Rules', () => {
    beforeEach(() => {
      engine.registerRules([createSQLInjectionRule(), createEvalRule()]);
    });

    it('should detect SQL injection via string concatenation', () => {
      const context = {
        code: 'const query = "SELECT * FROM users WHERE id = " + userId',
        filePath: 'src/users.ts',
        fileName: 'users.ts',
        language: 'typescript' as const,
        metadata: {},
      };

      const result = engine.runSync(context, 'after_generation');
      expect(result.status).toBe('blocked');
      expect(result.issues).toContainEqual(
        expect.objectContaining({ code: 'SEC-001', severity: 'critical' })
      );
    });

    it('should detect eval() usage', () => {
      const context = {
        code: 'eval("console.log(1)")',
        filePath: 'src/dynamic.ts',
        fileName: 'dynamic.ts',
        language: 'typescript' as const,
        metadata: {},
      };

      const result = engine.runSync(context, 'after_generation');
      expect(result.status).toBe('blocked');
      expect(result.issues.some(i => i.code === 'SEC-002')).toBe(true);
    });

    it('should pass clean code', () => {
      const context = {
        code: 'const user = await db.query("SELECT * FROM users WHERE id = ?", [id])',
        filePath: 'src/users.ts',
        fileName: 'users.ts',
        language: 'typescript' as const,
        metadata: {},
      };

      const result = engine.runSync(context, 'after_generation');
      expect(result.issues.filter(i => i.code === 'SEC-001')).toHaveLength(0);
    });
  });

  describe('Test Rules', () => {
    beforeEach(() => {
      engine.registerRule(createTestRequiredRule());
    });

    it('should flag source file without corresponding test', () => {
      const context = {
        code: 'export function hello() {}',
        filePath: 'src/utils.ts',
        fileName: 'utils.ts',
        language: 'typescript' as const,
        metadata: {},
      };

      const result = engine.runSync(context, 'after_generation');
      expect(result.status).toBe('warned');
      expect(result.issues).toContainEqual(
        expect.objectContaining({ code: 'TEST-001', severity: 'high' })
      );
    });

    it('should pass test files', () => {
      const context = {
        code: 'describe("hello", () => { it("works", () => {}); });',
        filePath: 'src/utils.test.ts',
        fileName: 'utils.test.ts',
        language: 'typescript' as const,
        metadata: {},
      };

      const result = engine.runSync(context, 'after_generation');
      expect(result.status).toBe('ok');
    });
  });

  describe('Code Quality Rules', () => {
    beforeEach(() => {
      engine.registerRule(createAntiPatternRule());
    });

    it('should detect explicit any', () => {
      const context = {
        code: 'function parse(data: any): any { return data; }',
        filePath: 'src/parser.ts',
        fileName: 'parser.ts',
        language: 'typescript' as const,
        metadata: {},
      };

      const result = engine.runSync(context, 'after_generation');
      expect(result.issues).toContainEqual(
        expect.objectContaining({ code: 'CQ-003', severity: 'medium' })
      );
    });

    it('should detect generic variable names', () => {
      const context = {
        code: 'const data = await fetch(url);',
        filePath: 'src/api.ts',
        fileName: 'api.ts',
        language: 'typescript' as const,
        metadata: {},
      };

      const result = engine.runSync(context, 'after_generation');
      expect(result.issues).toContainEqual(
        expect.objectContaining({ code: 'CQ-002', severity: 'low' })
      );
    });
  });

  describe('Logging Rules', () => {
    beforeEach(() => {
      engine.registerRule(createNoConsoleRule());
    });

    it('should detect console.log', () => {
      const context = {
        code: 'console.log("debug:", value);',
        filePath: 'src/app.ts',
        fileName: 'app.ts',
        language: 'typescript' as const,
        metadata: {},
      };

      const result = engine.runSync(context, 'after_generation');
      expect(result.issues).toContainEqual(
        expect.objectContaining({ code: 'LOG-001', severity: 'medium' })
      );
    });

    it('should ignore commented console.log', () => {
      const context = {
        code: '// console.log("debug:", value);',
        filePath: 'src/app.ts',
        fileName: 'app.ts',
        language: 'typescript' as const,
        metadata: {},
      };

      const result = engine.runSync(context, 'after_generation');
      expect(result.issues.filter(i => i.code === 'LOG-001')).toHaveLength(0);
    });
  });

  describe('Decision Engine', () => {
    it('should block on critical issues', () => {
      const decision = new DecisionEngine();
      const result = decision.evaluate([
        { ruleId: 'SEC-001', ruleName: 'SQLi', valid: false, issues: [{ code: 'SEC-001', message: 'SQLi', severity: 'critical' }] },
      ], 'after_generation');

      expect(result.status).toBe('blocked');
    });

    it('should warn on high severity when failOn=high', () => {
      const decision = new DecisionEngine('high');
      const result = decision.evaluate([
        { ruleId: 'TEST-001', ruleName: 'Test', valid: false, issues: [{ code: 'TEST-001', message: 'No test', severity: 'high' }] },
      ], 'after_generation');

      expect(result.status).toBe('warned');
    });

    it('should return ok when no issues', () => {
      const decision = new DecisionEngine();
      const result = decision.evaluate([], 'after_generation');
      expect(result.status).toBe('ok');
    });

    it('should aggregate severity counts', () => {
      const decision = new DecisionEngine();
      const result = decision.evaluate([
        { ruleId: 'A', ruleName: 'A', valid: false, issues: [{ code: 'A', message: 'A', severity: 'critical' }] },
        { ruleId: 'B', ruleName: 'B', valid: false, issues: [{ code: 'B', message: 'B', severity: 'low' }, { code: 'C', message: 'C', severity: 'low' }] },
        { ruleId: 'D', ruleName: 'D', valid: false, issues: [{ code: 'D', message: 'D', severity: 'medium' }] },
      ], 'after_generation');

      expect(result.summary.critical).toBe(1);
      expect(result.summary.high).toBe(0);
      expect(result.summary.medium).toBe(1);
      expect(result.summary.low).toBe(2);
      expect(result.rulesEvaluated).toBe(3);
    });
  });
});
