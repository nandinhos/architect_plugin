import type {
  RuleContext,
  RuleResult,
  EvaluationResult,
  EngineConfig,
  TriggerType,
  Severity,
} from '../types';
import { RuleRegistry } from './RuleRegistry';
import { DecisionEngine } from './DecisionEngine';

interface ProjectConfig {
  autoFix?: boolean;
  failOn?: Severity;
  rules?: Record<string, { enabled: boolean }>;
}

export class ArchitectEngine {
  private registry: RuleRegistry;
  private decisionEngine: DecisionEngine;
  private config: Required<EngineConfig>;

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

  async run(context: RuleContext, trigger: TriggerType): Promise<EvaluationResult> {
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

    const results: RuleResult[] = rules.map((rule) => {
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
    });

    return this.decisionEngine.evaluate(results, trigger);
  }

  runSync(context: RuleContext, trigger: TriggerType): EvaluationResult {
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

    const results: RuleResult[] = rules.map((rule) => {
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
