import type { EvaluationResult, Issue, RuleResult, Severity, DecisionAction } from '../types';

const SEVERITY_ORDER: Record<Severity, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
};

export class DecisionEngine {
  private failOn: Severity;

  constructor(failOn: Severity = 'high') {
    this.failOn = failOn;
  }

  evaluate(results: RuleResult[], triggeredBy: string): EvaluationResult {
    const allIssues = results.flatMap(r => r.issues);
    const correctedCode = this.tryFix(results);

    const summary = {
      critical: allIssues.filter(i => i.severity === 'critical').length,
      high: allIssues.filter(i => i.severity === 'high').length,
      medium: allIssues.filter(i => i.severity === 'medium').length,
      low: allIssues.filter(i => i.severity === 'low').length,
    };

    const status = this.decide(allIssues);

    return {
      status,
      issues: allIssues,
      correctedCode,
      summary,
      rulesEvaluated: results.length,
      triggeredBy: triggeredBy as EvaluationResult['triggeredBy'],
    };
  }

  private decide(issues: Issue[]): DecisionAction {
    if (issues.some(i => i.severity === 'critical')) {
      return 'blocked';
    }

    const maxSeverity = issues.reduce<Severity | null>((max, issue) => {
      if (!max) return issue.severity;
      return SEVERITY_ORDER[issue.severity] > SEVERITY_ORDER[max] ? issue.severity : max;
    }, null);

    if (!maxSeverity) return 'ok';

    if (SEVERITY_ORDER[maxSeverity] >= SEVERITY_ORDER[this.failOn]) {
      return 'warned';
    }

    if (issues.some(i => i.severity === 'medium')) {
      return 'warned';
    }

    return 'ok';
  }

  private tryFix(results: RuleResult[]): string | undefined {
    const withFixes = results.filter(r => r.fixedCode && r.valid === false);
    if (withFixes.length === 0) return undefined;

    return withFixes
      .map(r => r.fixedCode)
      .filter(Boolean)
      .join('\n');
  }
}
