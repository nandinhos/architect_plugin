"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArchitectDashboard = void 0;
class ArchitectDashboard {
    constructor(tokens) {
        this.tokens = tokens;
        if (!tokens) {
            throw new Error('Design tokens are mandatory for The Architect.');
        }
    }
    calculateHealth(status) {
        let score = 0;
        if (status.designActive)
            score += 34;
        if (status.securityActive)
            score += 33;
        if (status.seniorSkillActive)
            score += 33;
        return score;
    }
    getTheme() {
        return {
            primaryColor: this.tokens.dna.primary,
            backgroundColor: this.tokens.dna.background,
            fontFamily: 'Inter, sans-serif'
        };
    }
}
exports.ArchitectDashboard = ArchitectDashboard;
//# sourceMappingURL=ArchitectDashboard.js.map