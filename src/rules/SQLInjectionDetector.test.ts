import { detectSQLInjection } from './SQLInjectionDetector';

describe('SQLInjectionDetector (AST)', () => {
  it('deve detectar string concatenation em SELECT', () => {
    const code = 'const q = "SELECT * FROM users WHERE id = " + userId;';
    const issues = detectSQLInjection(code, 'test.ts');

    expect(issues.length).toBeGreaterThan(0);
    expect(issues[0].code).toBe('SEC-001');
    expect(issues[0].severity).toBe('critical');
  });

  it('deve detectar string concatenation em INSERT', () => {
    const code = 'const q = "INSERT INTO users (name) VALUES (\'" + name + "\')";';
    const issues = detectSQLInjection(code, 'test.ts');

    expect(issues.length).toBeGreaterThan(0);
  });

  it('deve detectar string concatenation em UPDATE', () => {
    const code = 'const q = "UPDATE users SET name = \'" + name + "\'";';
    const issues = detectSQLInjection(code, 'test.ts');

    expect(issues.length).toBeGreaterThan(0);
  });

  it('deve detectar template literal com SQL keyword', () => {
    const code = 'const q = `SELECT * FROM users WHERE id = ${userId}`;';
    const issues = detectSQLInjection(code, 'test.ts');

    expect(issues.length).toBeGreaterThan(0);
  });

  it('nao deve detectar queries seguras com prepared statements', () => {
    const code = 'db.query("SELECT * FROM users WHERE id = ?", [userId]);';
    const issues = detectSQLInjection(code, 'test.ts');

    expect(issues).toHaveLength(0);
  });

  it('nao deve detectar strings que nao sao queries', () => {
    const code = 'const msg = "Hello " + name;';
    const issues = detectSQLInjection(code, 'test.ts');

    expect(issues).toHaveLength(0);
  });

  it('deve reportar linha correta', () => {
    const code = [
      'const x = 1;',
      'const q = "SELECT * FROM users WHERE id = " + id;',
      'const y = 2;',
    ].join('\n');

    const issues = detectSQLInjection(code, 'test.ts');

    expect(issues.length).toBeGreaterThan(0);
    expect(issues[0].line).toBe(2);
  });
});
