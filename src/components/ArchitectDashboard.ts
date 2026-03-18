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
      fontFamily: 'Inter, sans-serif'
    };
  }
}
