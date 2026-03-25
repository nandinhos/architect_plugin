import type { RuleContext, EvaluationResult, EngineConfig, TriggerType, Severity } from '../types';
import { RuleRegistry } from './RuleRegistry';
interface ProjectConfig {
    autoFix?: boolean;
    failOn?: Severity;
    rules?: Record<string, {
        enabled: boolean;
    }>;
}
export declare class ArchitectEngine {
    private registry;
    private decisionEngine;
    private config;
    private cache;
    constructor(config?: EngineConfig);
    private hashContent;
    private getCached;
    private setCache;
    clearCache(): void;
    loadConfig(projectConfig: ProjectConfig): void;
    registerRule(rule: NonNullable<EngineConfig['rules']>[0]): void;
    registerRules(rules: NonNullable<EngineConfig['rules']>): void;
    private executeRule;
    private buildResult;
    run(context: RuleContext, trigger: TriggerType): Promise<EvaluationResult>;
    runSync(context: RuleContext, trigger: TriggerType): EvaluationResult;
    getRules(): ReturnType<RuleRegistry['getAll']>;
    getRuleCount(): number;
    enableRule(ruleId: string): boolean;
    disableRule(ruleId: string): boolean;
    isRuleEnabled(ruleId: string): boolean;
}
export {};
//# sourceMappingURL=RuleEngine.d.ts.map