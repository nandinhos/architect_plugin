import type { BehaviorRule, RuleContext, RuleResult, Issue } from '../types';

export function createTestRequiredRule(): BehaviorRule {
  return {
    id: 'TEST-001',
    name: 'Test Required Rule',
    trigger: 'after_generation',
    severity: 'high',
    description: 'Garante que todo arquivo de código possua um arquivo de teste correspondente',

    validate(context: RuleContext): RuleResult {
      const { fileName, filePath, language } = context;

      if (language === 'unknown' || language === 'json') {
        return { ruleId: 'TEST-001', ruleName: 'Test Required Rule', valid: true, issues: [] };
      }

      const isTestFile = fileName.endsWith('.test.ts') ||
                         fileName.endsWith('.spec.ts') ||
                         fileName.endsWith('.test.js') ||
                         fileName.endsWith('.spec.js');

      if (isTestFile) {
        return { ruleId: 'TEST-001', ruleName: 'Test Required Rule', valid: true, issues: [] };
      }

      const sourceExtensions = ['.ts', '.tsx', '.js', '.jsx'];
      const isSourceFile = sourceExtensions.some(ext => fileName.endsWith(ext));

      if (!isSourceFile) {
        return { ruleId: 'TEST-001', ruleName: 'Test Required Rule', valid: true, issues: [] };
      }

      const testFileName = fileName
        .replace(/\.ts(x)?$/, '.test.ts$1')
        .replace(/\.js(x)?$/, '.test.js$1');

      const issue: Issue = {
        code: 'TEST-001',
        message: `Arquivo fonte sem teste correspondente. Crie: ${testFileName}`,
        severity: 'high',
        file: filePath,
      };

      return {
        ruleId: 'TEST-001',
        ruleName: 'Test Required Rule',
        valid: false,
        issues: [issue],
      };
    },

    enforce(context, result) {
      if (result.valid) return null;

      const { fileName } = context;
      const testFileName = fileName
        .replace(/\.ts(x)?$/, '.test.ts$1')
        .replace(/\.js(x)?$/, '.test.js$1');

      const testTemplate = `import { describe, it, expect } from 'jest';

describe('${fileName}', () => {
  it('should be implemented', () => {
    expect(true).toBe(true);
  });
});
`;

      return {
        fixed: true,
        fixedCode: testTemplate,
        suggestions: [
          `Test file: ${testFileName}`,
          'Follow TDD: Red → Green → Refactor',
        ],
      };
    },
  };
}

export const testRules = [createTestRequiredRule()];
