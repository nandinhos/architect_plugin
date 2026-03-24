"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeTypeScript = analyzeTypeScript;
exports.hasParseErrors = hasParseErrors;
exports.analyze = analyze;
const typescript_1 = __importDefault(require("typescript"));
const GENERIC_NAMES = new Set([
    'data',
    'info',
    'temp',
    'tmp',
    'result',
    'res',
    'obj',
    'item',
    'value',
    'val',
    'array',
    'arr',
    'dict',
    'map',
    'table',
    'callback',
    'handler',
    'fn',
    'func',
    'proc',
]);
const MAX_FUNCTION_LINES = 50;
const MAX_FILE_LINES = 300;
const MAX_COMPLEXITY = 10;
const ANY_KIND = typescript_1.default.SyntaxKind.AnyKeyword;
function getScriptKind(filePath) {
    const ext = filePath.toLowerCase();
    if (ext.endsWith('.tsx') || ext.endsWith('.jsx'))
        return typescript_1.default.ScriptKind.TSX;
    return typescript_1.default.ScriptKind.TS;
}
function getLocation(node, sf) {
    const pos = sf.getLineAndCharacterOfPosition(node.getStart());
    return { line: pos.line + 1, column: pos.character + 1 };
}
function isInsideComment(node, sf) {
    const fullText = sf.getFullText();
    const start = node.getStart();
    if (start === 0)
        return false;
    const charBefore = fullText.charCodeAt(start - 1);
    return charBefore === 47 || charBefore === 42;
}
function countComplexity(node) {
    let complexity = 1;
    function walk(n) {
        if (typescript_1.default.isIfStatement(n) ||
            typescript_1.default.isForStatement(n) ||
            typescript_1.default.isForInStatement(n) ||
            typescript_1.default.isForOfStatement(n) ||
            typescript_1.default.isWhileStatement(n) ||
            typescript_1.default.isDoStatement(n) ||
            typescript_1.default.isCaseClause(n) ||
            typescript_1.default.isConditionalExpression(n)) {
            complexity++;
        }
        if (typescript_1.default.isBinaryExpression(n) &&
            (n.operatorToken.kind === typescript_1.default.SyntaxKind.BarBarToken ||
                n.operatorToken.kind === typescript_1.default.SyntaxKind.AmpersandAmpersandToken)) {
            complexity++;
        }
        typescript_1.default.forEachChild(n, walk);
    }
    walk(node);
    return complexity;
}
function analyzeTypeScript(source, filePath) {
    const scriptKind = getScriptKind(filePath);
    const sf = typescript_1.default.createSourceFile(filePath, source, typescript_1.default.ScriptTarget.Latest, true, scriptKind);
    const issues = [];
    const metrics = {
        functions: 0,
        interfaces: 0,
        types: 0,
        anyUsages: 0,
        genericNames: 0,
        consoleUsages: 0,
        maxComplexity: 0,
    };
    const functionRanges = [];
    function visit(node) {
        if (typescript_1.default.isIdentifier(node) && node.text.length > 0) {
            if (isGenericName(node.text) && !isInsideComment(node, sf)) {
                metrics.genericNames++;
                issues.push({
                    code: 'CQ-002',
                    message: `Nome generico "${node.text}" detectado. Use nomes descritivos.`,
                    location: getLocation(node, sf),
                    severity: 'low',
                });
            }
        }
        if (node.kind === ANY_KIND && !isInsideComment(node, sf)) {
            const parent = node.parent;
            if (!typescript_1.default.isTypeReferenceNode(parent) &&
                !typescript_1.default.isArrayTypeNode(parent) &&
                !typescript_1.default.isUnionTypeNode(parent) &&
                !typescript_1.default.isIntersectionTypeNode(parent)) {
                metrics.anyUsages++;
                issues.push({
                    code: 'CQ-003',
                    message: 'Uso explicito de "any" detectado. Use tipos especificos ou "unknown".',
                    location: getLocation(node, sf),
                    severity: 'medium',
                });
            }
        }
        if (typescript_1.default.isCallExpression(node) &&
            typescript_1.default.isPropertyAccessExpression(node.expression) &&
            typescript_1.default.isIdentifier(node.expression.expression) &&
            node.expression.expression.text === 'console' &&
            !isInsideComment(node, sf)) {
            metrics.consoleUsages++;
            issues.push({
                code: 'CQ-005',
                message: `console.${node.expression.name.text}() detectado via AST. Use logger estruturado.`,
                location: getLocation(node, sf),
                severity: 'low',
            });
        }
        if (typescript_1.default.isFunctionDeclaration(node) && node.name) {
            functionRanges.push({
                name: node.name.text,
                start: node.getStart(),
                end: node.getEnd(),
                node,
            });
            metrics.functions++;
        }
        if (typescript_1.default.isMethodDeclaration(node) && node.name && typescript_1.default.isIdentifier(node.name)) {
            functionRanges.push({
                name: node.name.text,
                start: node.getStart(),
                end: node.getEnd(),
                node,
            });
            metrics.functions++;
        }
        if (typescript_1.default.isArrowFunction(node)) {
            const parent = node.parent;
            const name = typescript_1.default.isVariableDeclaration(parent) && typescript_1.default.isIdentifier(parent.name)
                ? parent.name.text
                : 'arrow';
            functionRanges.push({ name, start: node.getStart(), end: node.getEnd(), node });
            metrics.functions++;
        }
        if (typescript_1.default.isFunctionExpression(node)) {
            const parent = node.parent;
            const name = typescript_1.default.isVariableDeclaration(parent) && typescript_1.default.isIdentifier(parent.name)
                ? parent.name.text
                : 'function';
            functionRanges.push({ name, start: node.getStart(), end: node.getEnd(), node });
            metrics.functions++;
        }
        if (typescript_1.default.isInterfaceDeclaration(node))
            metrics.interfaces++;
        if (typescript_1.default.isTypeAliasDeclaration(node))
            metrics.types++;
        typescript_1.default.forEachChild(node, visit);
    }
    visit(sf);
    for (const fn of functionRanges) {
        const startLoc = sf.getLineAndCharacterOfPosition(fn.start);
        const endLoc = sf.getLineAndCharacterOfPosition(fn.end);
        const lineCount = endLoc.line - startLoc.line + 1;
        if (lineCount > MAX_FUNCTION_LINES) {
            issues.push({
                code: 'CQ-001',
                message: `Funcao "${fn.name}" tem ${lineCount} linhas (maximo: ${MAX_FUNCTION_LINES}). Refatore.`,
                location: { line: startLoc.line + 1, column: 1 },
                severity: 'medium',
            });
        }
        const complexity = countComplexity(fn.node);
        if (complexity > metrics.maxComplexity) {
            metrics.maxComplexity = complexity;
        }
        if (complexity > MAX_COMPLEXITY) {
            issues.push({
                code: 'CQ-006',
                message: `Funcao "${fn.name}" tem complexidade ${complexity} (maximo: ${MAX_COMPLEXITY}). Simplifique.`,
                location: { line: startLoc.line + 1, column: 1 },
                severity: 'medium',
            });
        }
    }
    const lineCount = source.split('\n').length;
    if (lineCount > MAX_FILE_LINES) {
        issues.push({
            code: 'CQ-004',
            message: `Arquivo com ${lineCount} linhas (maximo: ${MAX_FILE_LINES}). Considere dividir.`,
            location: { line: 1, column: 1 },
            severity: 'medium',
        });
    }
    return { filePath, totalLines: lineCount, issues, metrics };
}
function hasParseErrors(source, filePath) {
    const scriptKind = filePath ? getScriptKind(filePath) : typescript_1.default.ScriptKind.TS;
    const sf = typescript_1.default.createSourceFile(filePath || 'temp.ts', source, typescript_1.default.ScriptTarget.Latest, true, scriptKind);
    return sf.parseDiagnostics.length > 0;
}
function analyze(source, filePath) {
    if (hasParseErrors(source, filePath))
        return null;
    return analyzeTypeScript(source, filePath);
}
function isGenericName(name) {
    return GENERIC_NAMES.has(name.toLowerCase());
}
//# sourceMappingURL=ASTAnalyzer.js.map