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
export declare class ArchitectDashboard {
    private tokens;
    constructor(tokens: DesignTokens);
    calculateHealth(status: ArchitectStatus): number;
    getTheme(): {
        primaryColor: string;
        backgroundColor: string;
        fontFamily: string;
    };
}
//# sourceMappingURL=ArchitectDashboard.d.ts.map