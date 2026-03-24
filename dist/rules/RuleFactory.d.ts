import type { BehaviorRule, RuleContext, RuleResult, EnforcementResult, TriggerType, Severity } from '../types';
interface CreateRuleInput {
    id: string;
    name: string;
    trigger: TriggerType;
    severity: Severity;
    description: string;
    validate(_: RuleContext): RuleResult;
    enforce?(_context: RuleContext, _result: RuleResult): EnforcementResult | null;
}
export declare function createRule(input: CreateRuleInput): BehaviorRule;
export {};
//# sourceMappingURL=RuleFactory.d.ts.map