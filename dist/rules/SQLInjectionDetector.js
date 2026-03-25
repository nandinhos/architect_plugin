"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.detectSQLInjection = detectSQLInjection;
const typescript_1 = __importDefault(require("typescript"));
const SQL_KEYWORDS = ['SELECT', 'INSERT', 'UPDATE', 'DELETE', 'FROM', 'WHERE', 'VALUES', 'SET'];
function detectSQLInjection(source, filePath) {
    const issues = [];
    const sf = typescript_1.default.createSourceFile(filePath, source, typescript_1.default.ScriptTarget.Latest, true);
    function visit(node) {
        // Detectar string concatenation com + que contém SQL keywords
        if (typescript_1.default.isBinaryExpression(node) && node.operatorToken.kind === typescript_1.default.SyntaxKind.PlusToken) {
            const leftText = getNodeText(node.left);
            const rightText = getNodeText(node.right);
            const hasSQLLeft = SQL_KEYWORDS.some((kw) => leftText.toUpperCase().includes(kw));
            const hasSQLRight = SQL_KEYWORDS.some((kw) => rightText.toUpperCase().includes(kw));
            if (hasSQLLeft || hasSQLRight) {
                const pos = sf.getLineAndCharacterOfPosition(node.getStart());
                issues.push({
                    code: 'SEC-001',
                    message: 'String concatenation com SQL keyword detectada via AST — risco de SQL Injection',
                    line: pos.line + 1,
                    column: pos.character + 1,
                    severity: 'critical',
                });
            }
        }
        // Detectar template literals com SQL keywords e variáveis
        if (typescript_1.default.isTemplateExpression(node)) {
            const headHasSQL = SQL_KEYWORDS.some((kw) => node.head.text.toUpperCase().includes(kw));
            if (headHasSQL) {
                const pos = sf.getLineAndCharacterOfPosition(node.getStart());
                issues.push({
                    code: 'SEC-001',
                    message: 'String concatenation com SQL keyword detectada via AST — risco de SQL Injection',
                    line: pos.line + 1,
                    column: pos.character + 1,
                    severity: 'critical',
                });
            }
        }
        typescript_1.default.forEachChild(node, visit);
    }
    visit(sf);
    return issues;
}
function getNodeText(node) {
    if (typescript_1.default.isStringLiteral(node))
        return node.text;
    if (typescript_1.default.isNoSubstitutionTemplateLiteral(node))
        return node.text;
    if (typescript_1.default.isTemplateHead(node) || typescript_1.default.isTemplateMiddle(node) || typescript_1.default.isTemplateTail(node))
        return node.text;
    if (typescript_1.default.isIdentifier(node))
        return node.text;
    if (typescript_1.default.isBinaryExpression(node))
        return getNodeText(node.left) + getNodeText(node.right);
    if (typescript_1.default.isTemplateExpression(node))
        return node.head.text;
    return '';
}
//# sourceMappingURL=SQLInjectionDetector.js.map