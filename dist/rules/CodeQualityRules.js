"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.codeQualityRules = void 0;
exports.createAntiPatternRule = createAntiPatternRule;
const ASTAnalyzer_1 = require("./ASTAnalyzer");
function astToIssues(report, filePath) {
    return report.issues.map(issue => ({
        code: issue.code,
        message: issue.message,
        line: issue.location.line,
        severity: issue.severity,
        file: filePath,
    }));
}
function createAntiPatternRule() {
    return {
        id: 'CQ-001',
        name: 'Anti-Pattern Detection (AST)',
        trigger: 'after_generation',
        severity: 'high',
        description: 'Detecta funções longas, nomes genéricos e uso de any via TypeScript AST',
        validate(context) {
            const { code, filePath, language } = context;
            if (language !== 'typescript' && language !== 'javascript') {
                return { ruleId: 'CQ-001', ruleName: 'Anti-Pattern Detection', valid: true, issues: [] };
            }
            const report = (0, ASTAnalyzer_1.analyze)(code, filePath);
            if (!report) {
                return {
                    ruleId: 'CQ-001',
                    ruleName: 'Anti-Pattern Detection',
                    valid: true,
                    issues: [{
                            code: 'CQ-001',
                            message: 'AST parsing failed — arquivo pode não ser TypeScript válido. Pulando análise AST.',
                            severity: 'low',
                            file: filePath,
                        }],
                };
            }
            const issues = astToIssues(report, filePath);
            return {
                ruleId: 'CQ-001',
                ruleName: 'Anti-Pattern Detection (AST)',
                valid: issues.length === 0,
                issues,
            };
        },
        enforce(context, result) {
            if (result.valid || result.issues.length === 0)
                return null;
            const suggestions = result.issues
                .filter(i => i.severity === 'medium' || i.severity === 'high')
                .map(i => i.message)
                .filter((msg, idx, arr) => arr.indexOf(msg) === idx);
            return {
                fixed: false,
                suggestions,
            };
        },
    };
}
exports.codeQualityRules = [createAntiPatternRule()];
//# sourceMappingURL=CodeQualityRules.js.map