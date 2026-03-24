import { existsSync } from 'fs';
import { join } from 'path';

export interface DesignTokens {
  dna: {
    primary: string;
    background: string;
  };
}

export interface ArchitectStatus {
  designActive: boolean;
  securityActive: boolean;
  seniorSkillActive: boolean;
}

export interface ProtocolDetail {
  name: string;
  active: boolean;
  reason: string;
}

export interface DetailedStatus {
  score: number;
  protocols: ProtocolDetail[];
  projectDir: string;
}

export class ArchitectDashboard {
  constructor(private tokens: DesignTokens) {
    if (!tokens) {
      throw new Error('Design tokens are mandatory for The Architect.');
    }
  }

  public calculateHealth(status: ArchitectStatus): number {
    let score = 0;
    if (status.designActive) score += 34;
    if (status.securityActive) score += 33;
    if (status.seniorSkillActive) score += 33;

    return score;
  }

  public getTheme() {
    return {
      primaryColor: this.tokens.dna.primary,
      backgroundColor: this.tokens.dna.background,
      fontFamily: 'Inter, sans-serif',
    };
  }

  public getDetailedStatus(projectDir: string = process.cwd()): DetailedStatus {
    const archDir = join(projectDir, '.architect');

    const designActive = existsSync(join(archDir, 'design', 'tokens.json'));
    const securityActive = existsSync(join(archDir, 'security', 'rules.md'));
    const seniorSkillActive = existsSync(join(archDir, 'skills', 'senior-engineer.md'));

    const protocols: ProtocolDetail[] = [
      {
        name: 'Design System',
        active: designActive,
        reason: designActive ? 'tokens.json encontrado' : '.architect/design/tokens.json ausente',
      },
      {
        name: 'Security Rules',
        active: securityActive,
        reason: securityActive ? 'rules.md encontrado' : '.architect/security/rules.md ausente',
      },
      {
        name: 'Senior Engineer',
        active: seniorSkillActive,
        reason: seniorSkillActive
          ? 'senior-engineer.md encontrado'
          : '.architect/skills/senior-engineer.md ausente',
      },
    ];

    const status: ArchitectStatus = {
      designActive,
      securityActive,
      seniorSkillActive,
    };

    return {
      score: this.calculateHealth(status),
      protocols,
      projectDir,
    };
  }
}
