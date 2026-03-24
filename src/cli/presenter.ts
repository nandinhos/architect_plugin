/* eslint-disable no-console */
import type { EvaluationResult } from '../types';
import type { DetailedStatus } from '../components/ArchitectDashboard';

export function printReport(result: EvaluationResult, verbose = false, asJson = false): void {
  const { status, issues, summary, rulesEvaluated } = result;

  if (asJson) {
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  console.log('\n' + '='.repeat(60));
  console.log(`  Architect Engine — Report`);
  console.log('='.repeat(60));
  console.log(`  Status:  ${status.toUpperCase()}`);
  console.log(`  Regras:  ${rulesEvaluated} executadas`);
  console.log(
    `  Issues:  ${summary.critical}C / ${summary.high}H / ${summary.medium}M / ${summary.low}L`
  );
  console.log('-'.repeat(60));

  if (issues.length === 0) {
    console.log('  Nenhum problema detectado.\n');
    return;
  }

  const sorted = [...issues].sort((a, b) => {
    const order: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
    return order[a.severity] - order[b.severity];
  });

  for (const issue of sorted) {
    const icon = { critical: '[CRIT]', high: '[HIGH]', medium: '[MED]', low: '[LOW]' }[
      issue.severity
    ];
    const location = issue.line ? `[${issue.file}:${issue.line}]` : `[${issue.file}]`;
    console.log(`  ${icon} [${issue.code}] ${issue.message}`);
    console.log(`     ${location}`);
    if (verbose && issue.suggestions) {
      for (const s of issue.suggestions) {
        console.log(`     -> ${s}`);
      }
    }
  }

  console.log('');

  if (status === 'blocked') {
    console.log('  BLOQUEADO: Corrija os issues critical antes de prosseguir.');
  } else if (status === 'warned') {
    console.log('  ATENCAO: Issues de alta/media severidade detectados.');
  }
}

export function printHealth(detailed: DetailedStatus): void {
  console.log('\n  Architect Health Check\n');
  console.log(`  Score: ${detailed.score}/100\n`);

  for (const p of detailed.protocols) {
    const icon = p.active ? '[OK]' : '[FALTA]';
    console.log(`  ${icon} ${p.name}: ${p.reason}`);
  }

  console.log('');
  if (detailed.score < 100) {
    console.log('  Execute "architect init" para configurar protocolos faltantes.\n');
  }
}

export function printRules(
  rules: { id: string; name: string; trigger: string; severity: string }[],
  total: number
): void {
  console.log('\n  Regras registradas no Architect Engine:\n');
  for (const rule of rules) {
    console.log(`  [${rule.id}] ${rule.name} — ${rule.trigger} (${rule.severity})`);
  }
  console.log(`\n  Total: ${total} regras\n`);
}

export function printDirJson(allResults: EvaluationResult[]): void {
  console.log(
    JSON.stringify(
      {
        status: allResults.some((r) => r.status === 'blocked') ? 'blocked' : 'ok',
        filesAnalyzed: allResults.length,
        results: allResults,
        summary: {
          critical: allResults.reduce((s, r) => s + r.summary.critical, 0),
          high: allResults.reduce((s, r) => s + r.summary.high, 0),
          medium: allResults.reduce((s, r) => s + r.summary.medium, 0),
          low: allResults.reduce((s, r) => s + r.summary.low, 0),
        },
      },
      null,
      2
    )
  );
}
