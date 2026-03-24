import { analyze, analyzeTypeScript, hasParseErrors } from './ASTAnalyzer';

describe('ASTAnalyzer', () => {
  describe('analyzeTypeScript', () => {
    it('should detect any type usage', () => {
      const code = 'function parse(data: any): any { return data; }';
      const report = analyzeTypeScript(code, 'parser.ts');

      expect(report.metrics.anyUsages).toBeGreaterThan(0);
      expect(report.issues.some((i) => i.code === 'CQ-003')).toBe(true);
    });

    it('should detect generic variable names', () => {
      const code = 'const data = fetch(url); const item = items[0];';
      const report = analyzeTypeScript(code, 'api.ts');

      expect(report.issues.some((i) => i.code === 'CQ-002')).toBe(true);
    });

    it('should detect long functions via AST line counting', () => {
      const lines = [
        'function processData() {',
        ...Array.from({ length: 60 }, (_, i) => '  const x' + i + ' = ' + i + ';'),
        '}',
      ];
      const code = lines.join('\n');
      const report = analyzeTypeScript(code, 'processor.ts');

      expect(report.issues.some((i) => i.code === 'CQ-001')).toBe(true);
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

      const dataIssue = report.issues.find((i) => i.code === 'CQ-002');
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
      expect(result!.issues.some((i) => i.code === 'CQ-002')).toBe(true);
    });
  });

  describe('TSX/JSX support', () => {
    it('should parse TSX file without errors', () => {
      const code = `
import React from 'react';
export const App: React.FC = () => {
  return <div>Hello</div>;
};
      `;
      const result = analyze(code, 'App.tsx');
      expect(result).not.toBeNull();
      expect(result!.totalLines).toBeGreaterThan(0);
    });

    it('should parse JSX file without errors', () => {
      const code = `
const App = () => {
  return <div className="test">Hello</div>;
};
      `;
      const result = analyze(code, 'App.jsx');
      expect(result).not.toBeNull();
    });

    it('should detect issues in TSX files', () => {
      const code = `
export const Comp = (props: any) => {
  return <div>{props.value}</div>;
};
      `;
      const result = analyze(code, 'Comp.tsx');
      expect(result).not.toBeNull();
      expect(result!.metrics.anyUsages).toBeGreaterThan(0);
    });
  });

  describe('Console detection via AST', () => {
    it('should detect console.log via AST', () => {
      const code = 'console.log("debug");';
      const report = analyzeTypeScript(code, 'debug.ts');

      expect(report.metrics.consoleUsages).toBe(1);
      expect(report.issues.some((i) => i.code === 'CQ-005')).toBe(true);
    });

    it('should detect multiple console methods', () => {
      const code = `
console.log("a");
console.warn("b");
console.error("c");
      `;
      const report = analyzeTypeScript(code, 'logs.ts');

      expect(report.metrics.consoleUsages).toBe(3);
    });

    it('should not detect console in comments', () => {
      const code = '// console.log("not detected")';
      const report = analyzeTypeScript(code, 'comment.ts');

      expect(report.metrics.consoleUsages).toBe(0);
    });
  });

  describe('Cyclomatic complexity', () => {
    it('should calculate base complexity of 1', () => {
      const code = 'function simple() { return 1; }';
      const report = analyzeTypeScript(code, 'simple.ts');

      expect(report.metrics.maxComplexity).toBe(1);
    });

    it('should increase complexity for if statements', () => {
      const code = `
function check(x: number) {
  if (x > 0) return "positive";
  if (x < 0) return "negative";
  return "zero";
}
      `;
      const report = analyzeTypeScript(code, 'check.ts');

      expect(report.metrics.maxComplexity).toBeGreaterThan(1);
    });

    it('should flag high complexity functions', () => {
      const lines = ['function complex(x: number) {'];
      for (let i = 0; i < 12; i++) {
        lines.push(`  if (x === ${i}) return ${i};`);
      }
      lines.push('  return -1;');
      lines.push('}');
      const code = lines.join('\n');

      const report = analyzeTypeScript(code, 'complex.ts');
      expect(report.issues.some((i) => i.code === 'CQ-006')).toBe(true);
    });

    it('should increase complexity for loops', () => {
      const code = `
function iterate(arr: number[]) {
  for (let i = 0; i < arr.length; i++) {
    while (arr[i] > 0) {
      arr[i]--;
    }
  }
}
      `;
      const report = analyzeTypeScript(code, 'loop.ts');

      expect(report.metrics.maxComplexity).toBeGreaterThan(1);
    });

    it('should increase complexity for logical operators', () => {
      const code = `
function validate(a: boolean, b: boolean, c: boolean) {
  return a && b || c;
}
      `;
      const report = analyzeTypeScript(code, 'logic.ts');

      expect(report.metrics.maxComplexity).toBeGreaterThan(1);
    });
  });
});
