import { ArchitectEngine } from './RuleEngine';
import { createSQLInjectionRule, createEvalRule } from '../rules/SecurityRules';
import { BehaviorRule, RuleContext, RuleResult } from '../types';

function createThrowingRule(): BehaviorRule {
  return {
    id: 'THROW-001',
    name: 'Throwing Rule',
    trigger: 'after_generation',
    severity: 'high',
    description: 'Always throws',
    validate(): RuleResult {
      throw new Error('Intentional error');
    },
  };
}

function createDummyRule(
  id: string,
  trigger: 'after_generation' | 'pre_commit' = 'after_generation'
): BehaviorRule {
  return {
    id,
    name: `Dummy ${id}`,
    trigger,
    severity: 'low',
    description: 'Dummy rule',
    validate: () => ({ ruleId: id, ruleName: `Dummy ${id}`, valid: true, issues: [] }),
  };
}

const baseContext: RuleContext = {
  code: 'const x = 1;',
  filePath: 'test.ts',
  fileName: 'test.ts',
  language: 'typescript',
  metadata: {},
};

describe('ArchitectEngine', () => {
  describe('Empty rules', () => {
    it('deve retornar ok quando nao ha regras registradas', () => {
      const engine = new ArchitectEngine();
      const result = engine.runSync(baseContext, 'after_generation');

      expect(result.status).toBe('ok');
      expect(result.rulesEvaluated).toBe(0);
      expect(result.issues).toHaveLength(0);
      expect(result.summary).toEqual({ critical: 0, high: 0, medium: 0, low: 0 });
    });

    it('deve retornar ok quando regras existem mas trigger nao corresponde', () => {
      const engine = new ArchitectEngine();
      engine.registerRule(createDummyRule('D-001', 'pre_commit'));
      const result = engine.runSync(baseContext, 'after_generation');

      expect(result.status).toBe('ok');
      expect(result.rulesEvaluated).toBe(0);
    });
  });

  describe('Error handling', () => {
    it('deve capturar erro de regra e retornar ENGINE-001', () => {
      const engine = new ArchitectEngine();
      engine.registerRule(createThrowingRule());
      const result = engine.runSync(baseContext, 'after_generation');

      expect(result.status).toBe('warned');
      expect(result.issues).toHaveLength(1);
      expect(result.issues[0].code).toBe('ENGINE-001');
      expect(result.issues[0].severity).toBe('high');
      expect(result.issues[0].message).toContain('THROW-001');
    });

    it('deve continuar avaliando outras regras mesmo com erro em uma', () => {
      const engine = new ArchitectEngine();
      engine.registerRule(createThrowingRule());
      engine.registerRule(createSQLInjectionRule());
      const ctx = { ...baseContext, code: 'const q = "SELECT * FROM users WHERE id = " + id;' };
      const result = engine.runSync(ctx, 'after_generation');

      expect(result.rulesEvaluated).toBe(2);
      expect(result.issues.some((i) => i.code === 'ENGINE-001')).toBe(true);
      expect(result.issues.some((i) => i.code === 'SEC-001')).toBe(true);
    });
  });

  describe('async run', () => {
    it('deve funcionar com run() async', async () => {
      const engine = new ArchitectEngine();
      engine.registerRule(createSQLInjectionRule());
      const ctx = { ...baseContext, code: 'const q = "SELECT * FROM t WHERE id = " + id;' };
      const result = await engine.run(ctx, 'after_generation');

      expect(result.status).toBe('blocked');
      expect(result.issues.some((i) => i.code === 'SEC-001')).toBe(true);
    });

    it('deve retornar ok async quando sem regras', async () => {
      const engine = new ArchitectEngine();
      const result = await engine.run(baseContext, 'after_generation');

      expect(result.status).toBe('ok');
      expect(result.rulesEvaluated).toBe(0);
    });
  });

  describe('Rule count and listing', () => {
    it('deve contar regras corretamente', () => {
      const engine = new ArchitectEngine();
      expect(engine.getRuleCount()).toBe(0);

      engine.registerRule(createDummyRule('D-001'));
      expect(engine.getRuleCount()).toBe(1);

      engine.registerRule(createDummyRule('D-002'));
      expect(engine.getRuleCount()).toBe(2);
    });

    it('deve listar todas as regras', () => {
      const engine = new ArchitectEngine();
      engine.registerRule(createSQLInjectionRule());
      engine.registerRule(createEvalRule());

      const rules = engine.getRules();
      expect(rules).toHaveLength(2);
      expect(rules.map((r) => r.id)).toContain('SEC-001');
      expect(rules.map((r) => r.id)).toContain('SEC-002');
    });
  });

  describe('Default config', () => {
    it('deve usar autoFix false por default', () => {
      const engine = new ArchitectEngine();
      engine.registerRule(createSQLInjectionRule());
      const ctx = { ...baseContext, code: 'const q = "SELECT * FROM t WHERE id = " + id;' };
      const result = engine.runSync(ctx, 'after_generation');

      expect(result.status).toBe('blocked');
      expect(result.correctedCode).toBeUndefined();
    });

    it('deve usar failOn high por default', () => {
      const engine = new ArchitectEngine();
      engine.registerRule(createDummyRule('D-001'));
      const result = engine.runSync(baseContext, 'after_generation');

      expect(result.status).toBe('ok');
    });
  });
});
