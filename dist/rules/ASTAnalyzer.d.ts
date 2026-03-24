export interface ASTLocation {
    line: number;
    column: number;
}
export interface ASTIssue {
    code: string;
    message: string;
    location: ASTLocation;
    severity: 'low' | 'medium' | 'high';
}
export interface ASTReport {
    filePath: string;
    totalLines: number;
    issues: ASTIssue[];
    metrics: {
        functions: number;
        interfaces: number;
        types: number;
        anyUsages: number;
        genericNames: number;
        consoleUsages: number;
        maxComplexity: number;
    };
}
export declare function analyzeTypeScript(source: string, filePath: string): ASTReport;
export declare function hasParseErrors(source: string, filePath?: string): boolean;
export declare function analyze(source: string, filePath: string): ASTReport | null;
//# sourceMappingURL=ASTAnalyzer.d.ts.map