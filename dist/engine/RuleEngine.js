"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArchitectEngine = void 0;
const crypto_1 = require("crypto");
const RuleRegistry_1 = require("./RuleRegistry");
const DecisionEngine_1 = require("./DecisionEngine");
class ArchitectEngine {
    constructor(config = {}) {
        this.cache = new Map();
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
    hashContent(content) {
        return (0, crypto_1.createHash)('sha256').update(content).digest('hex').slice(0, 16);
    }
    getCached(filePath, content, trigger) {
        const key = `${filePath}:${trigger}`;
        const hash = this.hashContent(content);
        const entry = this.cache.get(key);
        if (entry && entry.hash === hash) {
            return entry.result;
        }
        return null;
    }
    setCache(filePath, content, trigger, result) {
        const key = `${filePath}:${trigger}`;
        const hash = this.hashContent(content);
        this.cache.set(key, { hash, result });
    }
    clearCache() {
        this.cache.clear();
    }
    loadConfig(projectConfig) {
        if (typeof projectConfig.autoFix === 'boolean') {
            this.config.autoFix = projectConfig.autoFix;
        }
        if (projectConfig.failOn) {
            this.config.failOn = projectConfig.failOn;
            this.decisionEngine = new DecisionEngine_1.DecisionEngine(projectConfig.failOn);
        }
        if (projectConfig.rules && typeof projectConfig.rules === 'object') {
            for (const [ruleId, ruleConfig] of Object.entries(projectConfig.rules)) {
                if (ruleConfig.enabled) {
                    this.registry.enable(ruleId);
                }
                else {
                    this.registry.disable(ruleId);
                }
            }
        }
    }
    registerRule(rule) {
        this.registry.register(rule);
    }
    registerRules(rules) {
        this.registry.registerBatch(rules);
    }
    executeRule(rule, context) {
        const start = performance.now();
        try {
            const result = rule.validate(context);
            if (this.config.autoFix && rule.enforce && !result.valid) {
                const enforcement = rule.enforce(context, result);
                if (enforcement?.fixed) {
                    result.fixedCode = enforcement.fixedCode;
                }
            }
            return { result, ms: performance.now() - start };
        }
        catch (error) {
            return {
                result: {
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
                },
                ms: performance.now() - start,
            };
        }
    }
    buildResult(results, timingRules, timingTotal, trigger) {
        const base = this.decisionEngine.evaluate(results, trigger);
        base.timing = { totalMs: Math.round(timingTotal * 100) / 100, rules: timingRules };
        return base;
    }
    async run(context, trigger) {
        const cached = this.getCached(context.filePath, context.code, trigger);
        if (cached)
            return cached;
        const rules = this.registry.getByTrigger(trigger);
        if (rules.length === 0) {
            const result = {
                status: 'ok',
                issues: [],
                summary: { critical: 0, high: 0, medium: 0, low: 0 },
                rulesEvaluated: 0,
                triggeredBy: trigger,
            };
            this.setCache(context.filePath, context.code, trigger, result);
            return result;
        }
        const startTotal = performance.now();
        const executed = await Promise.all(rules.map((rule) => Promise.resolve(this.executeRule(rule, context))));
        const totalMs = performance.now() - startTotal;
        const results = executed.map((e) => e.result);
        const timingRules = {};
        for (const e of executed) {
            timingRules[e.result.ruleId] = Math.round(e.ms * 100) / 100;
        }
        const result = this.buildResult(results, timingRules, totalMs, trigger);
        this.setCache(context.filePath, context.code, trigger, result);
        return result;
    }
    runSync(context, trigger) {
        const cached = this.getCached(context.filePath, context.code, trigger);
        if (cached)
            return cached;
        const rules = this.registry.getByTrigger(trigger);
        if (rules.length === 0) {
            const result = {
                status: 'ok',
                issues: [],
                summary: { critical: 0, high: 0, medium: 0, low: 0 },
                rulesEvaluated: 0,
                triggeredBy: trigger,
            };
            this.setCache(context.filePath, context.code, trigger, result);
            return result;
        }
        const startTotal = performance.now();
        const executed = rules.map((rule) => this.executeRule(rule, context));
        const totalMs = performance.now() - startTotal;
        const results = executed.map((e) => e.result);
        const timingRules = {};
        for (const e of executed) {
            timingRules[e.result.ruleId] = Math.round(e.ms * 100) / 100;
        }
        const result = this.buildResult(results, timingRules, totalMs, trigger);
        this.setCache(context.filePath, context.code, trigger, result);
        return result;
    }
    getRules() {
        return this.registry.getAll();
    }
    getRuleCount() {
        return this.registry.count();
    }
    enableRule(ruleId) {
        return this.registry.enable(ruleId);
    }
    disableRule(ruleId) {
        return this.registry.disable(ruleId);
    }
    isRuleEnabled(ruleId) {
        return this.registry.isEnabled(ruleId);
    }
}
exports.ArchitectEngine = ArchitectEngine;
//# sourceMappingURL=RuleEngine.js.map