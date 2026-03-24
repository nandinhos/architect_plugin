"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArchitectDashboard = void 0;
const fs_1 = require("fs");
const path_1 = require("path");
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
            fontFamily: 'Inter, sans-serif',
        };
    }
    getDetailedStatus(projectDir = process.cwd()) {
        const archDir = (0, path_1.join)(projectDir, '.architect');
        const designActive = (0, fs_1.existsSync)((0, path_1.join)(archDir, 'design', 'tokens.json'));
        const securityActive = (0, fs_1.existsSync)((0, path_1.join)(archDir, 'security', 'rules.md'));
        const seniorSkillActive = (0, fs_1.existsSync)((0, path_1.join)(archDir, 'skills', 'senior-engineer.md'));
        const protocols = [
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
        const status = {
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
exports.ArchitectDashboard = ArchitectDashboard;
//# sourceMappingURL=ArchitectDashboard.js.map