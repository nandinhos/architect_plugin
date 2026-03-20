export type TriggerType = 'before_generation' | 'after_generation' | 'pre_commit' | 'review';
export type Severity = 'low' | 'medium' | 'high' | 'critical';
export type DecisionAction = 'blocked' | 'corrected' | 'warned' | 'ok';
export interface Issue {
    code: string;
    message: string;
    line?: number;
    severity: Severity;
    file?: string;
    fix?: string;
    suggestions?: string[];
}
export interface RuleContext {
    code: string;
    filePath: string;
    fileName: string;
    language: 'typescript' | 'javascript' | 'css' | 'html' | 'json' | 'unknown';
    metadata: Record<string, string>;
    staged?: boolean;
}
export interface RuleResult {
    ruleId: string;
    ruleName: string;
    valid: boolean;
    issues: Issue[];
    fixedCode?: string;
}
export interface EnforcementResult {
    fixed: boolean;
    fixedCode?: string;
    suggestions?: string[];
}
export interface EvaluationResult {
    status: DecisionAction;
    issues: Issue[];
    correctedCode?: string;
    summary: {
        critical: number;
        high: number;
        medium: number;
        low: number;
    };
    rulesEvaluated: number;
    triggeredBy: TriggerType;
}
export interface BehaviorRule {
    id: string;
    name: string;
    trigger: TriggerType;
    severity: Severity;
    description: string;
    validate(__: RuleContext): RuleResult;
    enforce?(__: RuleContext, ___: RuleResult): EnforcementResult | null;
}
export interface EngineConfig {
    autoFix?: boolean;
    failOn?: Severity;
    rules?: BehaviorRule[];
}
//# sourceMappingURL=types.d.ts.map