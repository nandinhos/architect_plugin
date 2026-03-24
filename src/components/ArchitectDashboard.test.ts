import { ArchitectDashboard } from './ArchitectDashboard';
import { mkdirSync, writeFileSync, rmSync } from 'fs';
import { join } from 'path';

describe('ArchitectDashboard Logic (TDD — Phase 4)', () => {
  const mockTokens = {
    dna: {
      primary: '#6366F1',
      background: '#F9FAFB',
    },
  };

  it('deve calcular o health score como 100 se todos os protocolos estiverem ativos', () => {
    const dashboard = new ArchitectDashboard(mockTokens);
    const health = dashboard.calculateHealth({
      designActive: true,
      securityActive: true,
      seniorSkillActive: true,
    });
    expect(health).toBe(100);
  });

  it('deve calcular score parcial quando protocolos faltam', () => {
    const dashboard = new ArchitectDashboard(mockTokens);
    const health = dashboard.calculateHealth({
      designActive: true,
      securityActive: false,
      seniorSkillActive: false,
    });
    expect(health).toBe(34);
  });

  it('deve falhar se os tokens de design estiverem ausentes', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(() => new ArchitectDashboard(null as any)).toThrow(
      'Design tokens are mandatory for The Architect.'
    );
  });

  it('deve retornar theme com cores do DNA', () => {
    const dashboard = new ArchitectDashboard(mockTokens);
    const theme = dashboard.getTheme();

    expect(theme.primaryColor).toBe('#6366F1');
    expect(theme.backgroundColor).toBe('#F9FAFB');
    expect(theme.fontFamily).toBe('Inter, sans-serif');
  });
});

describe('ArchitectDashboard.getDetailedStatus()', () => {
  const mockTokens = {
    dna: { primary: '#6366F1', background: '#F9FAFB' },
  };

  const testDir = join(__dirname, '../fixtures/health-test');
  const archDir = join(testDir, '.architect');

  beforeEach(() => {
    try {
      rmSync(testDir, { recursive: true, force: true });
    } catch {
      /* ignore */
    }
    mkdirSync(join(archDir, 'design'), { recursive: true });
    mkdirSync(join(archDir, 'security'), { recursive: true });
    mkdirSync(join(archDir, 'skills'), { recursive: true });
  });

  afterEach(() => {
    try {
      rmSync(testDir, { recursive: true, force: true });
    } catch {
      /* ignore */
    }
  });

  it('deve retornar score 100 quando todos os protocolos existem', () => {
    writeFileSync(join(archDir, 'design', 'tokens.json'), '{}');
    writeFileSync(join(archDir, 'security', 'rules.md'), '');
    writeFileSync(join(archDir, 'skills', 'senior-engineer.md'), '');

    const dashboard = new ArchitectDashboard(mockTokens);
    const status = dashboard.getDetailedStatus(testDir);

    expect(status.score).toBe(100);
    expect(status.protocols.every((p) => p.active)).toBe(true);
  });

  it('deve retornar score 0 quando nenhum protocolo existe', () => {
    const dashboard = new ArchitectDashboard(mockTokens);
    const status = dashboard.getDetailedStatus(testDir);

    expect(status.score).toBe(0);
    expect(status.protocols.every((p) => !p.active)).toBe(true);
  });

  it('deve detectar protocolos parciais', () => {
    writeFileSync(join(archDir, 'design', 'tokens.json'), '{}');

    const dashboard = new ArchitectDashboard(mockTokens);
    const status = dashboard.getDetailedStatus(testDir);

    expect(status.score).toBe(34);
    expect(status.protocols[0].active).toBe(true);
    expect(status.protocols[1].active).toBe(false);
    expect(status.protocols[2].active).toBe(false);
  });

  it('deve incluir razao para cada protocolo', () => {
    writeFileSync(join(archDir, 'design', 'tokens.json'), '{}');

    const dashboard = new ArchitectDashboard(mockTokens);
    const status = dashboard.getDetailedStatus(testDir);

    expect(status.protocols[0].reason).toContain('tokens.json encontrado');
    expect(status.protocols[1].reason).toContain('ausente');
  });
});
