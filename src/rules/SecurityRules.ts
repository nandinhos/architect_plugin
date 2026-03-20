import type { BehaviorRule, RuleContext, RuleResult, Issue } from '../types';

const SQL_PATTERNS = [
  { pattern: /SELECT\s+\*\s+FROM\s+\w+\s+WHERE\s+\w+\s*=\s*['"]?\s*\+/gi, code: 'SEC-001', msg: 'String interpolation em query SQL — risco de SQL Injection' },
  { pattern: /INSERT\s+INTO\s+\w+\s*\([^)]*\)\s*VALUES\s*\([^)]*['"]?\s*\+/gi, code: 'SEC-001', msg: 'String interpolation em INSERT — risco de SQL Injection' },
  { pattern: /UPDATE\s+\w+\s+SET\s+\w+\s*=\s*['"]?\s*\+/gi, code: 'SEC-001', msg: 'String interpolation em UPDATE — risco de SQL Injection' },
  { pattern: /DELETE\s+FROM\s+\w+\s+WHERE\s+\w+\s*=\s*['"]?\s*\+/gi, code: 'SEC-001', msg: 'String interpolation em DELETE — risco de SQL Injection' },
  { pattern: /"\s*\+\s*\w+\s*\+\s*"/g, code: 'SEC-001', msg: 'Concatenação de string em query SQL — risco de SQL Injection' },
];

const DANGEROUS_FUNCTIONS = [
  { pattern: /\beval\s*\(/g, code: 'SEC-002', msg: 'Uso de eval() detectado — risco de Code Injection' },
  { pattern: /\bexec\s*\(/g, code: 'SEC-002', msg: 'Uso de exec() detectado — risco de Command Injection' },
  { pattern: /\bexecSync\s*\(/g, code: 'SEC-002', msg: 'Uso de execSync() detectado — risco de Command Injection' },
  { pattern: /\bnew\s+Function\s*\(/g, code: 'SEC-002', msg: 'new Function() é equivalente a eval() — risco de Code Injection' },
  { pattern: /\bsetTimeout\s*\(\s*['"]/g, code: 'SEC-002', msg: 'setTimeout com string é equivalente a eval() — risco de Code Injection' },
];

function findIssues(code: string, patterns: { pattern: RegExp; code: string; msg: string }[], file: string): Issue[] {
  const issues: Issue[] = [];

  for (const { pattern, code: ruleCode, msg } of patterns) {
    const lines = code.split('\n');

    for (let i = 0; i < lines.length; i++) {
      pattern.lastIndex = 0;
      if (pattern.test(lines[i])) {
        issues.push({
          code: ruleCode,
          message: msg,
          line: i + 1,
          severity: 'critical',
          file,
        });
      }
    }
  }

  return issues;
}

export function createSQLInjectionRule(): BehaviorRule {
  return {
    id: 'SEC-001',
    name: 'SQL Injection Detection',
    trigger: 'after_generation',
    severity: 'critical',
    description: 'Detecta padrões de SQL Injection via string concatenation',
    validate(context: RuleContext): RuleResult {
      const issues = findIssues(context.code, SQL_PATTERNS, context.filePath);

      return {
        ruleId: 'SEC-001',
        ruleName: 'SQL Injection Detection',
        valid: issues.length === 0,
        issues,
      };
    },
    enforce(context, result) {
      if (result.valid) return null;

      let fixed = context.code;

      for (const { pattern } of SQL_PATTERNS) {
        fixed = fixed.replace(pattern, '(parameterized placeholder)');
      }

      return {
        fixed: true,
        fixedCode: fixed,
        suggestions: [
          'Use prepared statements: db.query("SELECT * FROM users WHERE id = ?", [id])',
          'Use an ORM that handles parameterization: User.findById(id)',
        ],
      };
    },
  };
}

export function createEvalRule(): BehaviorRule {
  return {
    id: 'SEC-002',
    name: 'Dangerous Function Detection',
    trigger: 'after_generation',
    severity: 'critical',
    description: 'Detecta uso de eval, exec, new Function e setTimeout com string',
    validate(context: RuleContext): RuleResult {
      const issues = findIssues(context.code, DANGEROUS_FUNCTIONS, context.filePath);

      return {
        ruleId: 'SEC-002',
        ruleName: 'Dangerous Function Detection',
        valid: issues.length === 0,
        issues,
      };
    },
    enforce(context, result) {
      if (result.valid) return null;

      let fixed = context.code;

      for (const { pattern } of DANGEROUS_FUNCTIONS) {
        fixed = fixed.replace(pattern, '/* SAFE: removed dangerous call */');
      }

      return {
        fixed: true,
        fixedCode: fixed,
        suggestions: [
          'Evite eval(). Se precisa de lógica dinâmica, use um switch ou Map.',
          'Evite exec(). Use child_process spawn com argumentos separados se necessário.',
        ],
      };
    },
  };
}

export const securityRules = [createSQLInjectionRule(), createEvalRule()];
