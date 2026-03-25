export interface XSSIssue {
    code: string;
    message: string;
    line: number;
    column: number;
    severity: 'critical';
}
export declare function detectXSS(source: string, filePath: string): XSSIssue[];
//# sourceMappingURL=XSSDetector.d.ts.map