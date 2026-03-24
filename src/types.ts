export type TriggerType = 'before_generation' | 'after_generation' | 'pre_commit' | 'review';

export type Severity = 'low' | 'medium' | 'high' | 'critical';

/**
 * Acao de decisao do engine:
 * - blocked: critical detectado, exit code 1, impede commit/deploy
 * - corrected: auto-fix aplicado com sucesso
 * - warned: high ou medium detectado, exit code 0, alerta visivel
 * - ok: nenhuma issue, passou limpo
 */
export type DecisionAction = 'blocked' | 'corrected' | 'warned' | 'ok';

export interface Issue {
  code: string;
  message: string;
  line?: number;
  severity: Severity;
  file?: string;
  fix?: string;
  suggestions?: string[];
}

export interface RuleContext {
  code: string;
  filePath: string;
  fileName: string;
  language: 'typescript' | 'javascript' | 'css' | 'html' | 'json' | 'unknown';
  metadata: Record<string, string>;
  staged?: boolean;
}

export interface RuleResult {
  ruleId: string;
  ruleName: string;
  valid: boolean;
  issues: Issue[];
  fixedCode?: string;
}

export interface EnforcementResult {
  fixed: boolean;
  fixedCode?: string;
  suggestions?: string[];
}

export interface EvaluationResult {
  status: DecisionAction;
  issues: Issue[];
  correctedCode?: string;
  summary: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  rulesEvaluated: number;
  triggeredBy: TriggerType;
}

export interface BehaviorRule {
  id: string;
  name: string;
  trigger: TriggerType;
  severity: Severity;
  description: string;
  /* eslint-disable no-unused-vars */
  validate(__: RuleContext): RuleResult;
  enforce?(__: RuleContext, ___: RuleResult): EnforcementResult | null;
  /* eslint-enable no-unused-vars */
}

export interface EngineConfig {
  autoFix?: boolean;
  failOn?: Severity;
  rules?: BehaviorRule[];
}
