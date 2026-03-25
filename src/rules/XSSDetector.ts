import ts from 'typescript';

export interface XSSIssue {
  code: string;
  message: string;
  line: number;
  column: number;
  severity: 'critical';
}

const DANGEROUS_PROPERTIES = ['innerHTML', 'outerHTML'];
const DANGEROUS_METHODS = ['insertAdjacentHTML', 'write'];

export function detectXSS(source: string, filePath: string): XSSIssue[] {
  const issues: XSSIssue[] = [];
  const sf = ts.createSourceFile(filePath, source, ts.ScriptTarget.Latest, true);

  function visit(node: ts.Node): void {
    // Detectar assignment para innerHTML/outerHTML
    if (ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.EqualsToken) {
      if (ts.isPropertyAccessExpression(node.left)) {
        const propName = node.left.name.text;
        if (DANGEROUS_PROPERTIES.includes(propName)) {
          // Verificar se o valor não é string literal (mais seguro)
          if (!ts.isStringLiteral(node.right)) {
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
    if (ts.isCallExpression(node)) {
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
    if (ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.EqualsToken) {
      if (ts.isPropertyAccessExpression(node.left) && node.left.name.text === 'href') {
        if (
          ts.isStringLiteral(node.right) &&
          node.right.text.toLowerCase().startsWith('javascript:')
        ) {
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

    ts.forEachChild(node, visit);
  }

  visit(sf);
  return issues;
}

function getMethodName(expr: ts.Expression): string | undefined {
  if (ts.isPropertyAccessExpression(expr)) {
    return expr.name.text;
  }
  return undefined;
}
