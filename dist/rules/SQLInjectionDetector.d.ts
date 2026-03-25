export interface SQLInjectionIssue {
    code: string;
    message: string;
    line: number;
    column: number;
    severity: 'critical';
}
export declare function detectSQLInjection(source: string, filePath: string): SQLInjectionIssue[];
//# sourceMappingURL=SQLInjectionDetector.d.ts.map