import type { BehaviorRule } from '../types';
interface DesignTokenSet {
    primary?: string;
    primaryName?: string;
    background?: string;
    surface?: string;
    text?: string;
    muted?: string;
    border?: string;
}
export declare function createDesignValidatorRule(tokens?: DesignTokenSet): BehaviorRule;
export declare const designRules: (tokens?: DesignTokenSet) => BehaviorRule[];
export {};
//# sourceMappingURL=DesignRules.d.ts.map