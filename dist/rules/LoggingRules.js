"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loggingRules = void 0;
exports.createNoConsoleRule = createNoConsoleRule;
function createNoConsoleRule() {
    return {
        id: 'LOG-001',
        name: 'No Console Rule',
        trigger: 'after_generation',
        severity: 'medium',
        description: 'Detecta console.log, console.warn, console.error em código de produção',
        validate(context) {
            const { code, filePath } = context;
            const consoleMethods = [
                { pattern: /\bconsole\.log\s*\(/g, method: 'console.log' },
                { pattern: /\bconsole\.warn\s*\(/g, method: 'console.warn' },
                { pattern: /\bconsole\.error\s*\(/g, method: 'console.error' },
                { pattern: /\bconsole\.debug\s*\(/g, method: 'console.debug' },
                { pattern: /\bconsole\.info\s*\(/g, method: 'console.info' },
            ];
            const issues = [];
            const lines = code.split('\n');
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                if (/^\s*\/\//.test(line) || /^\s*\*\//.test(line))
                    continue;
                for (const { pattern, method } of consoleMethods) {
                    pattern.lastIndex = 0;
                    if (pattern.test(line)) {
                        issues.push({
                            code: 'LOG-001',
                            message: `Uso de ${method} detectado. Remova ou substitua por logger estruturado.`,
                            line: i + 1,
                            severity: 'medium',
                            file: filePath,
                        });
                    }
                }
            }
            return {
                ruleId: 'LOG-001',
                ruleName: 'No Console Rule',
                valid: issues.length === 0,
                issues,
            };
        },
        enforce(context, result) {
            if (result.valid)
                return null;
            let fixed = context.code;
            const patterns = [
                /\bconsole\.log\s*\(/g,
                /\bconsole\.warn\s*\(/g,
                /\bconsole\.error\s*\(/g,
                /\bconsole\.debug\s*\(/g,
                /\bconsole\.info\s*\(/g,
            ];
            for (const pattern of patterns) {
                fixed = fixed.replace(pattern, 'logger.info(');
            }
            return {
                fixed: true,
                fixedCode: fixed,
                suggestions: [
                    'Use um logger estruturado: winston, pino, or loglevel',
                    'Configure níveis: logger.debug() para dev, logger.info() para produção',
                    'Adicione contexto: logger.info("User logged in", { userId })',
                ],
            };
        },
    };
}
exports.loggingRules = [createNoConsoleRule()];
//# sourceMappingURL=LoggingRules.js.map