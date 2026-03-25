import { createHash } from 'crypto';
import type {
  RuleContext,
  RuleResult,
  EvaluationResult,
  EngineConfig,
  TriggerType,
  Severity,
  BehaviorRule,
} from '../types';
import { RuleRegistry } from './RuleRegistry';
import { DecisionEngine } from './DecisionEngine';

interface ProjectConfig {
  autoFix?: boolean;
  failOn?: Severity;
  rules?: Record<string, { enabled: boolean }>;
}

interface CacheEntry {
  hash: string;
  result: EvaluationResult;
}

export class ArchitectEngine {
  private registry: RuleRegistry;
  private decisionEngine: DecisionEngine;
  private config: Required<EngineConfig>;
  private cache: Map<string, CacheEntry> = new Map();

  constructor(config: EngineConfig = {}) {
    this.registry = new RuleRegistry();
    this.decisionEngine = new DecisionEngine(config.failOn);
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

  private hashContent(content: string): string {
    return createHash('sha256').update(content).digest('hex').slice(0, 16);
  }

  private getCached(
    filePath: string,
    content: string,
    trigger: TriggerType
  ): EvaluationResult | null {
    const key = `${filePath}:${trigger}`;
    const hash = this.hashContent(content);
    const entry = this.cache.get(key);

    if (entry && entry.hash === hash) {
      return entry.result;
    }

    return null;
  }

  private setCache(
    filePath: string,
    content: string,
    trigger: TriggerType,
    result: EvaluationResult
  ): void {
    const key = `${filePath}:${trigger}`;
    const hash = this.hashContent(content);
    this.cache.set(key, { hash, result });
  }

  clearCache(): void {
    this.cache.clear();
  }

  loadConfig(projectConfig: ProjectConfig): void {
    if (typeof projectConfig.autoFix === 'boolean') {
      this.config.autoFix = projectConfig.autoFix;
    }

    if (projectConfig.failOn) {
      this.config.failOn = projectConfig.failOn;
      this.decisionEngine = new DecisionEngine(projectConfig.failOn);
    }

    if (projectConfig.rules && typeof projectConfig.rules === 'object') {
      for (const [ruleId, ruleConfig] of Object.entries(projectConfig.rules)) {
        if (ruleConfig.enabled) {
          this.registry.enable(ruleId);
        } else {
          this.registry.disable(ruleId);
        }
      }
    }
  }

  registerRule(rule: NonNullable<EngineConfig['rules']>[0]): void {
    this.registry.register(rule);
  }

  registerRules(rules: NonNullable<EngineConfig['rules']>): void {
    this.registry.registerBatch(rules);
  }

  private executeRule(rule: BehaviorRule, context: RuleContext): RuleResult {
    try {
      const result = rule.validate(context);

      if (this.config.autoFix && rule.enforce && !result.valid) {
        const enforcement = rule.enforce(context, result);
        if (enforcement?.fixed) {
          result.fixedCode = enforcement.fixedCode;
        }
      }

      return result;
    } catch (error) {
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
  }

  async run(context: RuleContext, trigger: TriggerType): Promise<EvaluationResult> {
    const cached = this.getCached(context.filePath, context.code, trigger);
    if (cached) return cached;

    const rules = this.registry.getByTrigger(trigger);

    if (rules.length === 0) {
      const result: EvaluationResult = {
        status: 'ok',
        issues: [],
        summary: { critical: 0, high: 0, medium: 0, low: 0 },
        rulesEvaluated: 0,
        triggeredBy: trigger,
      };
      this.setCache(context.filePath, context.code, trigger, result);
      return result;
    }

    const results: RuleResult[] = await Promise.all(
      rules.map((rule) => Promise.resolve(this.executeRule(rule, context)))
    );

    const result = this.decisionEngine.evaluate(results, trigger);
    this.setCache(context.filePath, context.code, trigger, result);
    return result;
  }

  runSync(context: RuleContext, trigger: TriggerType): EvaluationResult {
    const cached = this.getCached(context.filePath, context.code, trigger);
    if (cached) return cached;

    const rules = this.registry.getByTrigger(trigger);

    if (rules.length === 0) {
      const result: EvaluationResult = {
        status: 'ok',
        issues: [],
        summary: { critical: 0, high: 0, medium: 0, low: 0 },
        rulesEvaluated: 0,
        triggeredBy: trigger,
      };
      this.setCache(context.filePath, context.code, trigger, result);
      return result;
    }

    const results: RuleResult[] = rules.map((rule) => this.executeRule(rule, context));

    const result = this.decisionEngine.evaluate(results, trigger);
    this.setCache(context.filePath, context.code, trigger, result);
    return result;
  }

  getRules(): ReturnType<RuleRegistry['getAll']> {
    return this.registry.getAll();
  }

  getRuleCount(): number {
    return this.registry.count();
  }

  enableRule(ruleId: string): boolean {
    return this.registry.enable(ruleId);
  }

  disableRule(ruleId: string): boolean {
    return this.registry.disable(ruleId);
  }

  isRuleEnabled(ruleId: string): boolean {
    return this.registry.isEnabled(ruleId);
  }
}
