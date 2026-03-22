import { execSync } from 'child_process';
import { writeFileSync, unlinkSync, mkdirSync, rmSync } from 'fs';
import { join } from 'path';

const CLI_PATH = join(__dirname, '../../dist/cli/index');

function runCLI(args: string[]): { stdout: string; stderr: string; exitCode: number } {
  try {
    const stdout = execSync(`node ${CLI_PATH} ${args.join(' ')}`, {
      encoding: 'utf8',
      timeout: 30000,
    });
    return { stdout, stderr: '', exitCode: 0 };
  } catch (error: unknown) {
    const err = error as { stdout?: string; stderr?: string; status?: number };
    return {
      stdout: err.stdout || '',
      stderr: err.stderr || '',
      exitCode: err.status || 1,
    };
  }
}

describe('CLI - architect run', () => {
  const testDir = join(__dirname, '../fixtures');

  beforeAll(() => {
    try {
      mkdirSync(testDir, { recursive: true });
    } catch {
      /* ignore */
    }
  });

  afterAll(() => {
    try {
      rmSync(testDir, { recursive: true, force: true });
    } catch {
      /* ignore */
    }
  });

  it('deve analisar arquivo TypeScript sem issues', () => {
    const testFile = join(testDir, 'clean.ts');
    writeFileSync(testFile, 'export const hello = () => "world";');

    const result = runCLI(['run', testFile]);

    expect(result.stdout).toContain('Status:');
    expect(result.exitCode).toBe(0);

    unlinkSync(testFile);
  });

  it('deve detectar SQL injection em arquivo', () => {
    const testFile = join(testDir, 'sqli.ts');
    writeFileSync(testFile, 'const query = "SELECT * FROM users WHERE id = " + userId;');

    const result = runCLI(['run', testFile]);

    expect(result.stdout).toContain('SEC-001');
    expect(result.stdout).toContain('BLOCKED');
    expect(result.exitCode).toBe(1);

    unlinkSync(testFile);
  });

  it('deve detectar XSS em arquivo', () => {
    const testFile = join(testDir, 'xss.ts');
    writeFileSync(testFile, 'element.innerHTML = userInput;');

    const result = runCLI(['run', testFile]);

    expect(result.stdout).toContain('SEC-003');
    expect(result.stdout).toContain('BLOCKED');
    expect(result.exitCode).toBe(1);

    unlinkSync(testFile);
  });

  it('deve retornar JSON quando --json e especificado', () => {
    const testFile = join(testDir, 'clean2.ts');
    writeFileSync(testFile, 'export const test = 1;');

    const result = runCLI(['run', testFile, '--json']);

    expect(() => JSON.parse(result.stdout)).not.toThrow();
    const parsed = JSON.parse(result.stdout);
    expect(parsed).toHaveProperty('status');
    expect(parsed).toHaveProperty('summary');

    unlinkSync(testFile);
  });
});

describe('CLI - architect rules', () => {
  it('deve listar todas as regras registradas', () => {
    const result = runCLI(['rules']);

    expect(result.stdout).toContain('SEC-001');
    expect(result.stdout).toContain('SEC-002');
    expect(result.stdout).toContain('SEC-003');
    expect(result.stdout).toContain('SEC-004');
    expect(result.stdout).toContain('TEST-001');
    expect(result.stdout).toContain('CQ-001');
    expect(result.stdout).toContain('LOG-001');
    expect(result.stdout).toContain('DES-001');
    expect(result.stdout).toContain('Total:');
    expect(result.exitCode).toBe(0);
  });
});

describe('CLI - architect version', () => {
  it('deve retornar a versao do architect', () => {
    const result = runCLI(['version']);

    expect(result.stdout).toContain('Architect Engine v');
    expect(result.exitCode).toBe(0);
  });
});

describe('CLI - architect init', () => {
  const initTestDir = join(__dirname, '../fixtures/init-test');

  beforeEach(() => {
    try {
      rmSync(initTestDir, { recursive: true, force: true });
    } catch {
      /* ignore */
    }
  });

  afterEach(() => {
    try {
      rmSync(initTestDir, { recursive: true, force: true });
    } catch {
      /* ignore */
    }
    try {
      rmSync(join(process.cwd(), '.architect'), { recursive: true, force: true });
    } catch {
      /* ignore */
    }
  });

  it('deve mostrar mensagem quando .architect ja existe', () => {
    try {
      mkdirSync(join(process.cwd(), '.architect'), { recursive: true });
    } catch {
      /* ignore */
    }

    const result = runCLI(['init']);

    expect(result.stdout).toContain('.architect/');
  });
});

describe('CLI - architect (help)', () => {
  it('deve mostrar ajuda quando nenhum comando especificado', () => {
    const result = runCLI([]);

    expect(result.stdout).toContain('Usage:');
    expect(result.stdout).toContain('architect init');
    expect(result.stdout).toContain('architect run');
    expect(result.stdout).toContain('architect staged');
    expect(result.stdout).toContain('architect rules');
    expect(result.stdout).toContain('architect version');
  });
});

describe('CLI - architect run em diretorio', () => {
  const dirTestDir = join(__dirname, '../fixtures/dir-test');

  beforeEach(() => {
    try {
      mkdirSync(dirTestDir, { recursive: true });
      writeFileSync(join(dirTestDir, 'file1.ts'), 'export const a = 1;');
      writeFileSync(join(dirTestDir, 'file2.ts'), 'export const b = 2;');
    } catch {
      /* ignore */
    }
  });

  afterEach(() => {
    try {
      rmSync(dirTestDir, { recursive: true, force: true });
    } catch {
      /* ignore */
    }
  });

  it('deve analisar todos os arquivos em um diretorio', () => {
    const result = runCLI(['run', dirTestDir]);

    expect(result.stdout).toContain('Status:');
    expect(result.stdout).toContain('Regras:');
    expect(result.exitCode).toBe(0);
  });
});
