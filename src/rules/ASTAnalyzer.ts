import ts from 'typescript';

export interface ASTLocation {
  line: number;
  column: number;
}

export interface ASTIssue {
  code: string;
  message: string;
  location: ASTLocation;
  severity: 'low' | 'medium' | 'high';
}

export interface ASTReport {
  filePath: string;
  totalLines: number;
  issues: ASTIssue[];
  metrics: {
    functions: number;
    interfaces: number;
    types: number;
    anyUsages: number;
    genericNames: number;
  };
}

const GENERIC_NAMES = new Set([
  'data', 'info', 'temp', 'tmp', 'result', 'res', 'obj', 'item',
  'value', 'val', 'array', 'arr', 'dict', 'map', 'table', 'callback',
  'handler', 'fn', 'func', 'proc',
]);

const MAX_FUNCTION_LINES = 50;
const MAX_FILE_LINES = 300;

const ANY_KIND = ts.SyntaxKind.AnyKeyword;

function getLocation(node: ts.Node, sf: ts.SourceFile): ASTLocation {
  const pos = sf.getLineAndCharacterOfPosition(node.getStart());
  return { line: pos.line + 1, column: pos.character + 1 };
}

function isInsideComment(node: ts.Node, sf: ts.SourceFile): boolean {
  const fullText = sf.getFullText();
  const start = node.getStart();
  if (start === 0) return false;
  const charBefore = fullText.charCodeAt(start - 1);
  return charBefore === 47 || charBefore === 42;
}

export function analyzeTypeScript(source: string, filePath: string): ASTReport {
  const sf = ts.createSourceFile(
    filePath,
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  );

  const issues: ASTIssue[] = [];
  const metrics = { functions: 0, interfaces: 0, types: 0, anyUsages: 0, genericNames: 0 };

  const functionRanges: { name: string; start: number; end: number }[] = [];

  function visit(node: ts.Node): void {
    if (ts.isIdentifier(node) && node.text.length > 0) {
      if (isGenericName(node.text) && !isInsideComment(node, sf)) {
        metrics.genericNames++;
        issues.push({
          code: 'CQ-002',
          message: `Nome genérico "${node.text}" detectado. Use nomes descritivos.`,
          location: getLocation(node, sf),
          severity: 'low',
        });
      }
    }

    if (node.kind === ANY_KIND && !isInsideComment(node, sf)) {
      const parent = node.parent;
      if (
        !ts.isTypeReferenceNode(parent) &&
        !ts.isArrayTypeNode(parent) &&
        !ts.isUnionTypeNode(parent) &&
        !ts.isIntersectionTypeNode(parent)
      ) {
        metrics.anyUsages++;
        issues.push({
          code: 'CQ-003',
          message: 'Uso explícito de "any" detectado. Use tipos específicos ou "unknown".',
          location: getLocation(node, sf),
          severity: 'medium',
        });
      }
    }

    if (ts.isFunctionDeclaration(node) && node.name) {
      functionRanges.push({ name: node.name.text, start: node.getStart(), end: node.getEnd() });
      metrics.functions++;
    }

    if (ts.isMethodDeclaration(node) && node.name && ts.isIdentifier(node.name)) {
      functionRanges.push({ name: node.name.text, start: node.getStart(), end: node.getEnd() });
      metrics.functions++;
    }

    if (ts.isArrowFunction(node)) {
      const parent = node.parent;
      const name = ts.isVariableDeclaration(parent) && ts.isIdentifier(parent.name)
        ? parent.name.text : 'arrow';
      functionRanges.push({ name, start: node.getStart(), end: node.getEnd() });
      metrics.functions++;
    }

    if (ts.isFunctionExpression(node)) {
      const parent = node.parent;
      const name = ts.isVariableDeclaration(parent) && ts.isIdentifier(parent.name)
        ? parent.name.text : 'function';
      functionRanges.push({ name, start: node.getStart(), end: node.getEnd() });
      metrics.functions++;
    }

    if (ts.isInterfaceDeclaration(node)) metrics.interfaces++;
    if (ts.isTypeAliasDeclaration(node)) metrics.types++;

    ts.forEachChild(node, visit);
  }

  visit(sf);

  for (const fn of functionRanges) {
    const startLoc = sf.getLineAndCharacterOfPosition(fn.start);
    const endLoc = sf.getLineAndCharacterOfPosition(fn.end);
    const lineCount = endLoc.line - startLoc.line + 1;

    if (lineCount > MAX_FUNCTION_LINES) {
      issues.push({
        code: 'CQ-001',
        message: `Função "${fn.name}" tem ${lineCount} linhas (máximo: ${MAX_FUNCTION_LINES}). Refatore.`,
        location: { line: startLoc.line + 1, column: 1 },
        severity: 'medium',
      });
    }
  }

  const lineCount = source.split('\n').length;
  if (lineCount > MAX_FILE_LINES) {
    issues.push({
      code: 'CQ-004',
      message: `Arquivo com ${lineCount} linhas (máximo: ${MAX_FILE_LINES}). Considere dividir.`,
      location: { line: 1, column: 1 },
      severity: 'medium',
    });
  }

  return { filePath, totalLines: lineCount, issues, metrics };
}

export function hasParseErrors(source: string): boolean {
  const sf = ts.createSourceFile('temp.ts', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  return (sf as unknown as { parseDiagnostics: unknown[] }).parseDiagnostics.length > 0;
}

export function analyze(source: string, filePath: string): ASTReport | null {
  if (hasParseErrors(source)) return null;
  return analyzeTypeScript(source, filePath);
}

function isGenericName(name: string): boolean {
  return GENERIC_NAMES.has(name.toLowerCase());
}
