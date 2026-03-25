"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.securityRules = void 0;
exports.createSQLInjectionRule = createSQLInjectionRule;
exports.createEvalRule = createEvalRule;
exports.createXSSRule = createXSSRule;
exports.createPIIDetectionRule = createPIIDetectionRule;
const SQLInjectionDetector_1 = require("./SQLInjectionDetector");
const XSSDetector_1 = require("./XSSDetector");
const SQL_PATTERNS = [
    {
        pattern: /SELECT\s+\*\s+FROM\s+\w+\s+WHERE\s+\w+\s*=\s*['"]?\s*\+/gi,
        code: 'SEC-001',
        msg: 'String interpolation em query SQL — risco de SQL Injection',
    },
    {
        pattern: /INSERT\s+INTO\s+\w+\s*\([^)]*\)\s*VALUES\s*\([^)]*['"]?\s*\+/gi,
        code: 'SEC-001',
        msg: 'String interpolation em INSERT — risco de SQL Injection',
    },
    {
        pattern: /UPDATE\s+\w+\s+SET\s+\w+\s*=\s*['"]?\s*\+/gi,
        code: 'SEC-001',
        msg: 'String interpolation em UPDATE — risco de SQL Injection',
    },
    {
        pattern: /DELETE\s+FROM\s+\w+\s+WHERE\s+\w+\s*=\s*['"]?\s*\+/gi,
        code: 'SEC-001',
        msg: 'String interpolation em DELETE — risco de SQL Injection',
    },
    {
        pattern: /"\s*\+\s*\w+\s*\+\s*"/g,
        code: 'SEC-001',
        msg: 'Concatenação de string em query SQL — risco de SQL Injection',
    },
];
const DANGEROUS_FUNCTIONS = [
    {
        pattern: /\beval\s*\(/g,
        code: 'SEC-002',
        msg: 'Uso de eval() detectado — risco de Code Injection',
    },
    {
        pattern: /\bexec\s*\(/g,
        code: 'SEC-002',
        msg: 'Uso de exec() detectado — risco de Command Injection',
    },
    {
        pattern: /\bexecSync\s*\(/g,
        code: 'SEC-002',
        msg: 'Uso de execSync() detectado — risco de Command Injection',
    },
    {
        pattern: /\bnew\s+Function\s*\(/g,
        code: 'SEC-002',
        msg: 'new Function() é equivalente a eval() — risco de Code Injection',
    },
    {
        pattern: /\bsetTimeout\s*\(\s*['"]/g,
        code: 'SEC-002',
        msg: 'setTimeout com string é equivalente a eval() — risco de Code Injection',
    },
];
const XSS_PATTERNS = [
    {
        pattern: /\.innerHTML\s*=/gi,
        code: 'SEC-003',
        msg: 'innerHTML detectado — risco de XSS, use textContent ou sanitize',
    },
    { pattern: /\.outerHTML\s*=/gi, code: 'SEC-003', msg: 'outerHTML detectado — risco de XSS' },
    {
        pattern: /insertAdjacentHTML\s*\(/gi,
        code: 'SEC-003',
        msg: 'insertAdjacentHTML detectado — risco de XSS, use DOMPurify',
    },
    {
        pattern: /document\.write\s*\(/gi,
        code: 'SEC-003',
        msg: 'document.write detectado — risco de XSS, remova',
    },
    {
        pattern: /\.href\s*=\s*['"]?\s*javascript:/gi,
        code: 'SEC-003',
        msg: 'javascript: URL detected — risco de XSS',
    },
];
function findIssues(code, patterns, file) {
    const issues = [];
    for (const { pattern, code: ruleCode, msg } of patterns) {
        const lines = code.split('\n');
        for (let i = 0; i < lines.length; i++) {
            pattern.lastIndex = 0;
            if (pattern.test(lines[i])) {
                issues.push({
                    code: ruleCode,
                    message: msg,
                    line: i + 1,
                    severity: 'critical',
                    file,
                });
            }
        }
    }
    return issues;
}
function createSQLInjectionRule() {
    return {
        id: 'SEC-001',
        name: 'SQL Injection Detection',
        trigger: 'after_generation',
        severity: 'critical',
        description: 'Detecta padroes de SQL Injection via AST e regex',
        validate(context) {
            const { code, filePath, language } = context;
            if (language !== 'typescript' && language !== 'javascript') {
                const issues = findIssues(code, SQL_PATTERNS, filePath);
                return {
                    ruleId: 'SEC-001',
                    ruleName: 'SQL Injection Detection',
                    valid: issues.length === 0,
                    issues,
                };
            }
            // Tenta AST primeiro, fallback para regex
            try {
                const astIssues = (0, SQLInjectionDetector_1.detectSQLInjection)(code, filePath);
                if (astIssues.length > 0) {
                    return {
                        ruleId: 'SEC-001',
                        ruleName: 'SQL Injection Detection',
                        valid: false,
                        issues: astIssues.map((i) => ({
                            code: i.code,
                            message: i.message,
                            line: i.line,
                            severity: i.severity,
                            file: filePath,
                        })),
                    };
                }
            }
            catch {
                // AST falhou, usar regex como fallback
            }
            const regexIssues = findIssues(code, SQL_PATTERNS, filePath);
            return {
                ruleId: 'SEC-001',
                ruleName: 'SQL Injection Detection',
                valid: regexIssues.length === 0,
                issues: regexIssues,
            };
        },
        enforce(context, result) {
            if (result.valid)
                return null;
            return {
                fixed: false,
                suggestions: [
                    'Use prepared statements: db.query("SELECT * FROM users WHERE id = ?", [id])',
                    'Use an ORM that handles parameterization: User.findById(id)',
                ],
            };
        },
    };
}
function createEvalRule() {
    return {
        id: 'SEC-002',
        name: 'Dangerous Function Detection',
        trigger: 'after_generation',
        severity: 'critical',
        description: 'Detecta uso de eval, exec, new Function e setTimeout com string',
        validate(context) {
            const issues = findIssues(context.code, DANGEROUS_FUNCTIONS, context.filePath);
            return {
                ruleId: 'SEC-002',
                ruleName: 'Dangerous Function Detection',
                valid: issues.length === 0,
                issues,
            };
        },
        enforce(context, result) {
            if (result.valid)
                return null;
            return {
                fixed: false,
                suggestions: [
                    'Evite eval(). Se precisa de lógica dinâmica, use um switch ou Map.',
                    'Evite exec(). Use child_process spawn com argumentos separados se necessário.',
                ],
            };
        },
    };
}
function createXSSRule() {
    return {
        id: 'SEC-003',
        name: 'XSS Detection',
        trigger: 'after_generation',
        severity: 'critical',
        description: 'Detecta padroes de Cross-Site Scripting (XSS) via AST e regex',
        validate(context) {
            const { code, filePath, language } = context;
            if (language !== 'typescript' && language !== 'javascript') {
                const issues = findIssues(code, XSS_PATTERNS, filePath);
                return { ruleId: 'SEC-003', ruleName: 'XSS Detection', valid: issues.length === 0, issues };
            }
            // Tenta AST primeiro, fallback para regex
            try {
                const astIssues = (0, XSSDetector_1.detectXSS)(code, filePath);
                if (astIssues.length > 0) {
                    return {
                        ruleId: 'SEC-003',
                        ruleName: 'XSS Detection',
                        valid: false,
                        issues: astIssues.map((i) => ({
                            code: i.code,
                            message: i.message,
                            line: i.line,
                            severity: i.severity,
                            file: filePath,
                        })),
                    };
                }
            }
            catch {
                // AST falhou, usar regex como fallback
            }
            const regexIssues = findIssues(code, XSS_PATTERNS, filePath);
            return {
                ruleId: 'SEC-003',
                ruleName: 'XSS Detection',
                valid: regexIssues.length === 0,
                issues: regexIssues,
            };
        },
        enforce(context, result) {
            if (result.valid)
                return null;
            return {
                fixed: false,
                suggestions: [
                    'Use element.textContent = userInput (seguro para texto puro)',
                    'Se precisa renderizar HTML, sanitize com DOMPurify: element.innerHTML = DOMPurify.sanitize(html)',
                    'Use framework XSS protection (React, Vue, Angular) — eles sanitizam por padrão',
                    'document.write() deve ser removido — use DOM manipulation moderna',
                    'javascript: URLs devem ser removidas — use event listeners',
                ],
            };
        },
    };
}
const PII_PATTERNS = [
    {
        pattern: /console\.(log|warn|error|info|debug).*password/i,
        code: 'SEC-004',
        msg: 'Logging de senha detectado — dados sensíveis expostos',
        severity: 'critical',
    },
    {
        pattern: /console\.(log|warn|error|info|debug).*passwd/i,
        code: 'SEC-004',
        msg: 'Logging de senha detectado — dados sensíveis expostos',
        severity: 'critical',
    },
    {
        pattern: /console\.(log|warn|error|info|debug).*secret/i,
        code: 'SEC-004',
        msg: 'Logging de secret/token detectado — dados sensíveis expostos',
        severity: 'critical',
    },
    {
        pattern: /console\.(log|warn|error|info|debug).*(token|api[_-]?key)/i,
        code: 'SEC-004',
        msg: 'Logging de token/API key detectado — dados sensíveis expostos',
        severity: 'critical',
    },
    {
        pattern: /console\.(log|warn|error|info|debug).*email/i,
        code: 'SEC-004',
        msg: 'Logging de email detectado — PII exposto',
        severity: 'high',
    },
    {
        pattern: /console\.(log|warn|error|info|debug).*cpf/i,
        code: 'SEC-004',
        msg: 'Logging de CPF detectado — PII exposto',
        severity: 'high',
    },
    {
        pattern: /console\.(log|warn|error|info|debug).*cnpj/i,
        code: 'SEC-004',
        msg: 'Logging de CNPJ detectado — PII exposto',
        severity: 'high',
    },
    {
        pattern: /console\.(log|warn|error|info|debug).*(credit[_-]?card|card[_-]?number)/i,
        code: 'SEC-004',
        msg: 'Logging de cartão detectado — dados financeiros expostos',
        severity: 'critical',
    },
];
function createPIIDetectionRule() {
    return {
        id: 'SEC-004',
        name: 'PII Exposure Detection',
        trigger: 'after_generation',
        severity: 'high',
        description: 'Detecta exposição de Dados Pessoais Identificáveis (PII) em logs',
        validate(context) {
            const { code, filePath } = context;
            const issues = [];
            const lines = code.split('\n');
            for (let i = 0; i < lines.length; i++) {
                for (const { pattern, code: ruleCode, msg, severity } of PII_PATTERNS) {
                    pattern.lastIndex = 0;
                    if (pattern.test(lines[i])) {
                        issues.push({
                            code: ruleCode,
                            message: msg,
                            line: i + 1,
                            severity,
                            file: filePath,
                        });
                    }
                }
            }
            return {
                ruleId: 'SEC-004',
                ruleName: 'PII Exposure Detection',
                valid: issues.length === 0,
                issues,
            };
        },
        enforce(context, result) {
            if (result.valid)
                return null;
            return {
                fixed: false,
                suggestions: [
                    'NUNCA logue dados sensíveis — remova o log ou mascare os dados',
                    'Use logger estruturado com masking: logger.info("Login", { email: maskEmail(userEmail) })',
                    'Para senhas: nunca logue, nem mascarado. Senhas não devem existir em logs.',
                    'Para tokens/API keys: logue apenas os primeiros 4 chars: token.substring(0, 4) + "***"',
                    'Configure logger com filtro de PII em produção',
                ],
            };
        },
    };
}
exports.securityRules = [
    createSQLInjectionRule(),
    createEvalRule(),
    createXSSRule(),
    createPIIDetectionRule(),
];
//# sourceMappingURL=SecurityRules.js.map