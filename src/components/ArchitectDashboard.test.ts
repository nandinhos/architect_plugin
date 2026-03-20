import { ArchitectDashboard } from './ArchitectDashboard';

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

  it('deve falhar se os tokens de design estiverem ausentes', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(() => new ArchitectDashboard(null as any)).toThrow(
      'Design tokens are mandatory for The Architect.'
    );
  });
});
