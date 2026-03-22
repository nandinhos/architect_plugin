"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArchitectEngine = void 0;
const RuleRegistry_1 = require("./RuleRegistry");
const DecisionEngine_1 = require("./DecisionEngine");
class ArchitectEngine {
    constructor(config = {}) {
        this.registry = new RuleRegistry_1.RuleRegistry();
        this.decisionEngine = new DecisionEngine_1.DecisionEngine(config.failOn);
        const rules = config.rules ?? [];
        this.config = {
            autoFix: config.autoFix ?? false,
            failOn: config.failOn ?? 'high',
            rules,
        };
        if (rules.length > 0) {
            this.registry.registerBatch(rules);
        }
    }
    registerRule(rule) {
        this.registry.register(rule);
    }
    registerRules(rules) {
        this.registry.registerBatch(rules);
    }
    async run(context, trigger) {
        const rules = this.registry.getByTrigger(trigger);
        if (rules.length === 0) {
            return {
                status: 'ok',
                issues: [],
                summary: { critical: 0, high: 0, medium: 0, low: 0 },
                rulesEvaluated: 0,
                triggeredBy: trigger,
            };
        }
        const results = rules.map((rule) => {
            try {
                const result = rule.validate(context);
                if (this.config.autoFix && rule.enforce && !result.valid) {
                    const enforcement = rule.enforce(context, result);
                    if (enforcement?.fixed) {
                        result.fixedCode = enforcement.fixedCode;
                    }
                }
                return result;
            }
            catch (error) {
                return {
                    ruleId: rule.id,
                    ruleName: rule.name,
                    valid: false,
                    issues: [
                        {
                            code: 'ENGINE-001',
                            message: `Rule "${rule.id}" threw an error: ${error instanceof Error ? error.message : String(error)}`,
                            severity: 'high',
                            file: context.filePath,
                        },
                    ],
                };
            }
        });
        return this.decisionEngine.evaluate(results, trigger);
    }
    runSync(context, trigger) {
        const rules = this.registry.getByTrigger(trigger);
        if (rules.length === 0) {
            return {
                status: 'ok',
                issues: [],
                summary: { critical: 0, high: 0, medium: 0, low: 0 },
                rulesEvaluated: 0,
                triggeredBy: trigger,
            };
        }
        const results = rules.map((rule) => {
            try {
                const result = rule.validate(context);
                if (this.config.autoFix && rule.enforce && !result.valid) {
                    const enforcement = rule.enforce(context, result);
                    if (enforcement?.fixed) {
                        result.fixedCode = enforcement.fixedCode;
                    }
                }
                return result;
            }
            catch (error) {
                return {
                    ruleId: rule.id,
                    ruleName: rule.name,
                    valid: false,
                    issues: [
                        {
                            code: 'ENGINE-001',
                            message: `Rule "${rule.id}" threw: ${error instanceof Error ? error.message : String(error)}`,
                            severity: 'high',
                            file: context.filePath,
                        },
                    ],
                };
            }
        });
        return this.decisionEngine.evaluate(results, trigger);
    }
    getRules() {
        return this.registry.getAll();
    }
    getRuleCount() {
        return this.registry.count();
    }
    enableRule(ruleId) {
        const rule = this.registry.getById(ruleId);
        if (!rule)
            return false;
        return true;
    }
    disableRule(ruleId) {
        return this.registry.unregister(ruleId);
    }
    isRuleEnabled(ruleId) {
        return this.registry.getById(ruleId) !== undefined;
    }
}
exports.ArchitectEngine = ArchitectEngine;
//# sourceMappingURL=RuleEngine.js.map