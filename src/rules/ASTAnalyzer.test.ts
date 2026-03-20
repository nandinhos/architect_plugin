import { analyze, analyzeTypeScript, hasParseErrors } from './ASTAnalyzer';

describe('ASTAnalyzer', () => {
  describe('analyzeTypeScript', () => {
    it('should detect any type usage', () => {
      const code = 'function parse(data: any): any { return data; }';
      const report = analyzeTypeScript(code, 'parser.ts');

      expect(report.metrics.anyUsages).toBeGreaterThan(0);
      expect(report.issues.some(i => i.code === 'CQ-003')).toBe(true);
    });

    it('should detect generic variable names', () => {
      const code = 'const data = fetch(url); const item = items[0];';
      const report = analyzeTypeScript(code, 'api.ts');

      expect(report.issues.some(i => i.code === 'CQ-002')).toBe(true);
    });

    it('should detect long functions via AST line counting', () => {
      const lines = [
        'function processData() {',
        ...Array.from({ length: 60 }, (_, i) => '  const x' + i + ' = ' + i + ';'),
        '}',
      ];
      const code = lines.join('\n');
      const report = analyzeTypeScript(code, 'processor.ts');

      expect(report.issues.some(i => i.code === 'CQ-001')).toBe(true);
    });

    it('should count functions correctly', () => {
      const code = `
function fn1() {}
const fn2 = () => {};
const fn3 = function() {};
class Test {
  method1() {}
}
      `;
      const report = analyzeTypeScript(code, 'counter.ts');

      expect(report.metrics.functions).toBeGreaterThanOrEqual(3);
    });

    it('should count interfaces and type aliases', () => {
      const code = `
interface User {}
interface Config {}
type Id = string;
type Status = 'active' | 'inactive';
      `;
      const report = analyzeTypeScript(code, 'types.ts');

      expect(report.metrics.interfaces).toBe(2);
      expect(report.metrics.types).toBe(2);
    });

    it('should report correct line numbers', () => {
      const code = 'const data = 1;\nconst arr = 2;\nconst item = 3;';
      const report = analyzeTypeScript(code, 'lines.ts');

      const dataIssue = report.issues.find(i => i.code === 'CQ-002');
      expect(dataIssue?.location.line).toBe(1);
    });

    it('should report file line count', () => {
      const code = Array.from({ length: 50 }, (_, i) => `const x${i} = ${i};`).join('\n');
      const report = analyzeTypeScript(code, 'file.ts');

      expect(report.totalLines).toBe(50);
    });
  });

  describe('hasParseErrors', () => {
    it('should return false for valid TypeScript', () => {
      expect(hasParseErrors('const x: number = 1;')).toBe(false);
    });

    it('should return true for invalid TypeScript', () => {
      expect(hasParseErrors('const x: = 1;')).toBe(true);
    });
  });

  describe('analyze', () => {
    it('should return null for invalid TypeScript', () => {
      const result = analyze('const x: = 1;', 'bad.ts');
      expect(result).toBeNull();
    });

    it('should return report for valid TypeScript', () => {
      const result = analyze('const data = 1;', 'good.ts');
      expect(result).not.toBeNull();
      expect(result!.issues.some(i => i.code === 'CQ-002')).toBe(true);
    });
  });
});
