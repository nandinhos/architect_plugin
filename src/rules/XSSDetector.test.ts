import { detectXSS } from './XSSDetector';

describe('XSSDetector (AST)', () => {
  it('deve detectar innerHTML com valor dinâmico', () => {
    const code = 'element.innerHTML = userInput;';
    const issues = detectXSS(code, 'test.ts');

    expect(issues.length).toBeGreaterThan(0);
    expect(issues[0].code).toBe('SEC-003');
    expect(issues[0].severity).toBe('critical');
  });

  it('deve detectar outerHTML com valor dinâmico', () => {
    const code = 'element.outerHTML = html;';
    const issues = detectXSS(code, 'test.ts');

    expect(issues.length).toBeGreaterThan(0);
  });

  it('deve detectar insertAdjacentHTML', () => {
    const code = 'el.insertAdjacentHTML("beforeend", html);';
    const issues = detectXSS(code, 'test.ts');

    expect(issues.length).toBeGreaterThan(0);
  });

  it('deve detectar document.write', () => {
    const code = 'document.write(userInput);';
    const issues = detectXSS(code, 'test.ts');

    expect(issues.length).toBeGreaterThan(0);
  });

  it('deve detectar javascript: URL', () => {
    const code = 'link.href = "javascript:alert(1)";';
    const issues = detectXSS(code, 'test.ts');

    expect(issues.length).toBeGreaterThan(0);
  });

  it('nao deve detectar innerHTML com string literal', () => {
    const code = 'element.innerHTML = "<div>Static</div>";';
    const issues = detectXSS(code, 'test.ts');

    expect(issues).toHaveLength(0);
  });

  it('nao deve detectar textContent', () => {
    const code = 'element.textContent = userInput;';
    const issues = detectXSS(code, 'test.ts');

    expect(issues).toHaveLength(0);
  });

  it('deve reportar linha correta', () => {
    const code = ['const x = 1;', 'element.innerHTML = userInput;', 'const y = 2;'].join('\n');

    const issues = detectXSS(code, 'test.ts');

    expect(issues.length).toBeGreaterThan(0);
    expect(issues[0].line).toBe(2);
  });
});
