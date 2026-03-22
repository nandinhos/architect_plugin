import type { RuleContext, EvaluationResult, EngineConfig, TriggerType } from '../types';
import { RuleRegistry } from './RuleRegistry';
export declare class ArchitectEngine {
    private registry;
    private decisionEngine;
    private config;
    constructor(config?: EngineConfig);
    registerRule(rule: NonNullable<EngineConfig['rules']>[0]): void;
    registerRules(rules: NonNullable<EngineConfig['rules']>): void;
    run(context: RuleContext, trigger: TriggerType): Promise<EvaluationResult>;
    runSync(context: RuleContext, trigger: TriggerType): EvaluationResult;
    getRules(): ReturnType<RuleRegistry['getAll']>;
    getRuleCount(): number;
    enableRule(ruleId: string): boolean;
    disableRule(ruleId: string): boolean;
    isRuleEnabled(ruleId: string): boolean;
}
//# sourceMappingURL=RuleEngine.d.ts.map