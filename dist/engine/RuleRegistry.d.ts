import type { BehaviorRule, TriggerType } from '../types';
export declare class RuleRegistry {
    private rules;
    private disabled;
    register(rule: BehaviorRule): void;
    registerBatch(rules: BehaviorRule[]): void;
    getByTrigger(trigger: TriggerType): BehaviorRule[];
    getAll(): BehaviorRule[];
    getById(id: string): BehaviorRule | undefined;
    unregister(id: string): boolean;
    count(): number;
    enable(id: string): boolean;
    disable(id: string): boolean;
    isEnabled(id: string): boolean;
    getDisabled(): string[];
}
//# sourceMappingURL=RuleRegistry.d.ts.map