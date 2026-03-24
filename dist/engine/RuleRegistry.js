"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RuleRegistry = void 0;
class RuleRegistry {
    constructor() {
        this.rules = [];
        this.disabled = new Set();
    }
    register(rule) {
        const exists = this.rules.find((r) => r.id === rule.id);
        if (exists) {
            throw new Error(`Rule with id "${rule.id}" already registered.`);
        }
        this.rules.push(rule);
    }
    registerBatch(rules) {
        rules.forEach((rule) => this.register(rule));
    }
    getByTrigger(trigger) {
        return this.rules.filter((r) => r.trigger === trigger && !this.disabled.has(r.id));
    }
    getAll() {
        return [...this.rules];
    }
    getById(id) {
        return this.rules.find((r) => r.id === id);
    }
    unregister(id) {
        const index = this.rules.findIndex((r) => r.id === id);
        if (index === -1)
            return false;
        this.rules.splice(index, 1);
        this.disabled.delete(id);
        return true;
    }
    count() {
        return this.rules.length;
    }
    enable(id) {
        const rule = this.getById(id);
        if (!rule)
            return false;
        this.disabled.delete(id);
        return true;
    }
    disable(id) {
        const rule = this.getById(id);
        if (!rule)
            return false;
        this.disabled.add(id);
        return true;
    }
    isEnabled(id) {
        return this.getById(id) !== undefined && !this.disabled.has(id);
    }
    getDisabled() {
        return [...this.disabled];
    }
}
exports.RuleRegistry = RuleRegistry;
//# sourceMappingURL=RuleRegistry.js.map