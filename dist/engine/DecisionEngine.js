"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DecisionEngine = void 0;
const SEVERITY_ORDER = {
    critical: 4,
    high: 3,
    medium: 2,
    low: 1,
};
class DecisionEngine {
    constructor(failOn = 'high') {
        this.failOn = failOn;
    }
    evaluate(results, triggeredBy) {
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
            triggeredBy: triggeredBy,
        };
    }
    decide(issues) {
        if (issues.some(i => i.severity === 'critical')) {
            return 'blocked';
        }
        const maxSeverity = issues.reduce((max, issue) => {
            if (!max)
                return issue.severity;
            return SEVERITY_ORDER[issue.severity] > SEVERITY_ORDER[max] ? issue.severity : max;
        }, null);
        if (!maxSeverity)
            return 'ok';
        if (SEVERITY_ORDER[maxSeverity] >= SEVERITY_ORDER[this.failOn]) {
            return 'warned';
        }
        if (issues.some(i => i.severity === 'medium')) {
            return 'warned';
        }
        return 'ok';
    }
    tryFix(results) {
        const withFixes = results.filter(r => r.fixedCode && r.valid === false);
        if (withFixes.length === 0)
            return undefined;
        return withFixes
            .map(r => r.fixedCode)
            .filter(Boolean)
            .join('\n');
    }
}
exports.DecisionEngine = DecisionEngine;
//# sourceMappingURL=DecisionEngine.js.map