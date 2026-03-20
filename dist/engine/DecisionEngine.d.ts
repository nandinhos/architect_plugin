import type { EvaluationResult, RuleResult, Severity } from '../types';
export declare class DecisionEngine {
    private failOn;
    constructor(failOn?: Severity);
    evaluate(results: RuleResult[], triggeredBy: string): EvaluationResult;
    private decide;
    private tryFix;
}
//# sourceMappingURL=DecisionEngine.d.ts.map