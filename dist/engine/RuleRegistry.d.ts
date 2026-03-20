import type { BehaviorRule, TriggerType } from '../types';
export declare class RuleRegistry {
    private rules;
    register(rule: BehaviorRule): void;
    registerBatch(rules: BehaviorRule[]): void;
    getByTrigger(trigger: TriggerType): BehaviorRule[];
    getAll(): BehaviorRule[];
    getById(id: string): BehaviorRule | undefined;
    unregister(id: string): boolean;
    count(): number;
}
//# sourceMappingURL=RuleRegistry.d.ts.map