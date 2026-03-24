import type { BehaviorRule, TriggerType } from '../types';

export class RuleRegistry {
  private rules: BehaviorRule[] = [];
  private disabled: Set<string> = new Set();

  register(rule: BehaviorRule): void {
    const exists = this.rules.find((r) => r.id === rule.id);
    if (exists) {
      throw new Error(`Rule with id "${rule.id}" already registered.`);
    }
    this.rules.push(rule);
  }

  registerBatch(rules: BehaviorRule[]): void {
    rules.forEach((rule) => this.register(rule));
  }

  getByTrigger(trigger: TriggerType): BehaviorRule[] {
    return this.rules.filter((r) => r.trigger === trigger && !this.disabled.has(r.id));
  }

  getAll(): BehaviorRule[] {
    return [...this.rules];
  }

  getById(id: string): BehaviorRule | undefined {
    return this.rules.find((r) => r.id === id);
  }

  unregister(id: string): boolean {
    const index = this.rules.findIndex((r) => r.id === id);
    if (index === -1) return false;
    this.rules.splice(index, 1);
    this.disabled.delete(id);
    return true;
  }

  count(): number {
    return this.rules.length;
  }

  enable(id: string): boolean {
    const rule = this.getById(id);
    if (!rule) return false;
    this.disabled.delete(id);
    return true;
  }

  disable(id: string): boolean {
    const rule = this.getById(id);
    if (!rule) return false;
    this.disabled.add(id);
    return true;
  }

  isEnabled(id: string): boolean {
    return this.getById(id) !== undefined && !this.disabled.has(id);
  }

  getDisabled(): string[] {
    return [...this.disabled];
  }
}
