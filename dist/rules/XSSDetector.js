"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.detectXSS = detectXSS;
const typescript_1 = __importDefault(require("typescript"));
const DANGEROUS_PROPERTIES = ['innerHTML', 'outerHTML'];
const DANGEROUS_METHODS = ['insertAdjacentHTML', 'write'];
function detectXSS(source, filePath) {
    const issues = [];
    const sf = typescript_1.default.createSourceFile(filePath, source, typescript_1.default.ScriptTarget.Latest, true);
    function visit(node) {
        // Detectar assignment para innerHTML/outerHTML
        if (typescript_1.default.isBinaryExpression(node) && node.operatorToken.kind === typescript_1.default.SyntaxKind.EqualsToken) {
            if (typescript_1.default.isPropertyAccessExpression(node.left)) {
                const propName = node.left.name.text;
                if (DANGEROUS_PROPERTIES.includes(propName)) {
                    // Verificar se o valor não é string literal (mais seguro)
                    if (!typescript_1.default.isStringLiteral(node.right)) {
                        const pos = sf.getLineAndCharacterOfPosition(node.getStart());
                        issues.push({
                            code: 'SEC-003',
                            message: `${propName} com valor dinâmico detectado via AST — risco de XSS`,
                            line: pos.line + 1,
                            column: pos.character + 1,
                            severity: 'critical',
                        });
                    }
                }
            }
        }
        // Detectar chamadas para insertAdjacentHTML, document.write
        if (typescript_1.default.isCallExpression(node)) {
            const methodName = getMethodName(node.expression);
            if (methodName && DANGEROUS_METHODS.includes(methodName)) {
                const pos = sf.getLineAndCharacterOfPosition(node.getStart());
                issues.push({
                    code: 'SEC-003',
                    message: `${methodName}() detectado via AST — risco de XSS`,
                    line: pos.line + 1,
                    column: pos.character + 1,
                    severity: 'critical',
                });
            }
        }
        // Detectar javascript: URLs
        if (typescript_1.default.isBinaryExpression(node) && node.operatorToken.kind === typescript_1.default.SyntaxKind.EqualsToken) {
            if (typescript_1.default.isPropertyAccessExpression(node.left) && node.left.name.text === 'href') {
                if (typescript_1.default.isStringLiteral(node.right) &&
                    node.right.text.toLowerCase().startsWith('javascript:')) {
                    const pos = sf.getLineAndCharacterOfPosition(node.getStart());
                    issues.push({
                        code: 'SEC-003',
                        message: 'javascript: URL detectada via AST — risco de XSS',
                        line: pos.line + 1,
                        column: pos.character + 1,
                        severity: 'critical',
                    });
                }
            }
        }
        typescript_1.default.forEachChild(node, visit);
    }
    visit(sf);
    return issues;
}
function getMethodName(expr) {
    if (typescript_1.default.isPropertyAccessExpression(expr)) {
        return expr.name.text;
    }
    return undefined;
}
//# sourceMappingURL=XSSDetector.js.map