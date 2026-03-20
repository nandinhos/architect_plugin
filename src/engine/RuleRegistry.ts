import type { BehaviorRule, TriggerType } from '../types';

export class RuleRegistry {
  private rules: BehaviorRule[] = [];

  register(rule: BehaviorRule): void {
    const exists = this.rules.find(r => r.id === rule.id);
    if (exists) {
      throw new Error(`Rule with id "${rule.id}" already registered.`);
    }
    this.rules.push(rule);
  }

  registerBatch(rules: BehaviorRule[]): void {
    rules.forEach(rule => this.register(rule));
  }

  getByTrigger(trigger: TriggerType): BehaviorRule[] {
    return this.rules.filter(r => r.trigger === trigger);
  }

  getAll(): BehaviorRule[] {
    return [...this.rules];
  }

  getById(id: string): BehaviorRule | undefined {
    return this.rules.find(r => r.id === id);
  }

  unregister(id: string): boolean {
    const index = this.rules.findIndex(r => r.id === id);
    if (index === -1) return false;
    this.rules.splice(index, 1);
    return true;
  }

  count(): number {
    return this.rules.length;
  }
}
