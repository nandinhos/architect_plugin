import type { EvaluationResult } from '../types';
import type { DetailedStatus } from '../components/ArchitectDashboard';
export declare function printReport(result: EvaluationResult, verbose?: boolean, asJson?: boolean): void;
export declare function printHealth(detailed: DetailedStatus): void;
export declare function printRules(rules: {
    id: string;
    name: string;
    trigger: string;
    severity: string;
}[], total: number): void;
export declare function printDirJson(allResults: EvaluationResult[]): void;
//# sourceMappingURL=presenter.d.ts.map