import ts from 'typescript';

export interface SQLInjectionIssue {
  code: string;
  message: string;
  line: number;
  column: number;
  severity: 'critical';
}

const SQL_KEYWORDS = ['SELECT', 'INSERT', 'UPDATE', 'DELETE', 'FROM', 'WHERE', 'VALUES', 'SET'];

export function detectSQLInjection(source: string, filePath: string): SQLInjectionIssue[] {
  const issues: SQLInjectionIssue[] = [];
  const sf = ts.createSourceFile(filePath, source, ts.ScriptTarget.Latest, true);

  function visit(node: ts.Node): void {
    // Detectar string concatenation com + que contém SQL keywords
    if (ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.PlusToken) {
      const leftText = getNodeText(node.left);
      const rightText = getNodeText(node.right);

      const hasSQLLeft = SQL_KEYWORDS.some((kw) => leftText.toUpperCase().includes(kw));
      const hasSQLRight = SQL_KEYWORDS.some((kw) => rightText.toUpperCase().includes(kw));

      if (hasSQLLeft || hasSQLRight) {
        const pos = sf.getLineAndCharacterOfPosition(node.getStart());
        issues.push({
          code: 'SEC-001',
          message:
            'String concatenation com SQL keyword detectada via AST — risco de SQL Injection',
          line: pos.line + 1,
          column: pos.character + 1,
          severity: 'critical',
        });
      }
    }

    // Detectar template literals com SQL keywords e variáveis
    if (ts.isTemplateExpression(node)) {
      const headHasSQL = SQL_KEYWORDS.some((kw) => node.head.text.toUpperCase().includes(kw));
      if (headHasSQL) {
        const pos = sf.getLineAndCharacterOfPosition(node.getStart());
        issues.push({
          code: 'SEC-001',
          message:
            'String concatenation com SQL keyword detectada via AST — risco de SQL Injection',
          line: pos.line + 1,
          column: pos.character + 1,
          severity: 'critical',
        });
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(sf);
  return issues;
}

function getNodeText(node: ts.Node): string {
  if (ts.isStringLiteral(node)) return node.text;
  if (ts.isNoSubstitutionTemplateLiteral(node)) return node.text;
  if (ts.isTemplateHead(node) || ts.isTemplateMiddle(node) || ts.isTemplateTail(node))
    return node.text;
  if (ts.isIdentifier(node)) return node.text;
  if (ts.isBinaryExpression(node)) return getNodeText(node.left) + getNodeText(node.right);
  if (ts.isTemplateExpression(node)) return node.head.text;
  return '';
}
