"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RuleRegistry = void 0;
class RuleRegistry {
    constructor() {
        this.rules = [];
    }
    register(rule) {
        const exists = this.rules.find(r => r.id === rule.id);
        if (exists) {
            throw new Error(`Rule with id "${rule.id}" already registered.`);
        }
        this.rules.push(rule);
    }
    registerBatch(rules) {
        rules.forEach(rule => this.register(rule));
    }
    getByTrigger(trigger) {
        return this.rules.filter(r => r.trigger === trigger);
    }
    getAll() {
        return [...this.rules];
    }
    getById(id) {
        return this.rules.find(r => r.id === id);
    }
    unregister(id) {
        const index = this.rules.findIndex(r => r.id === id);
        if (index === -1)
            return false;
        this.rules.splice(index, 1);
        return true;
    }
    count() {
        return this.rules.length;
    }
}
exports.RuleRegistry = RuleRegistry;
//# sourceMappingURL=RuleRegistry.js.map