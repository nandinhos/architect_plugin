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
export declare class ArchitectDashboard {
    private tokens;
    constructor(tokens: DesignTokens);
    calculateHealth(status: ArchitectStatus): number;
    getTheme(): {
        primaryColor: string;
        backgroundColor: string;
        fontFamily: string;
    };
    getDetailedStatus(projectDir?: string): DetailedStatus;
}
//# sourceMappingURL=ArchitectDashboard.d.ts.map