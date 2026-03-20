import { ArchitectDashboard, DESIGN_TOKENS, PROTOCOL_VERSION, PROJECT_NAME } from './index';

describe('Plugin Entry Point (index.ts)', () => {
  it('should export ArchitectDashboard', () => {
    expect(ArchitectDashboard).toBeDefined();
  });

  it('should export DESIGN_TOKENS from tokens.json', () => {
    expect(DESIGN_TOKENS).toBeDefined();
    expect(DESIGN_TOKENS.project).toBe('architect_plugin');
  });

  it('should export correct metadata constants', () => {
    expect(PROTOCOL_VERSION).toBe(DESIGN_TOKENS.version);
    expect(PROJECT_NAME).toBe('architect_plugin');
  });
});
