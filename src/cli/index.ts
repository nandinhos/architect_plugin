#!/usr/bin/env node
/* eslint-disable no-console */
import { execSync } from 'child_process';
import { readFileSync, readdirSync, statSync, mkdirSync, writeFileSync, existsSync } from 'fs';
import { join, extname, basename } from 'path';
import { ArchitectEngine } from '../engine/RuleEngine';
import { RuleContext } from '../types';
import { securityRules } from '../rules/SecurityRules';
import { testRules } from '../rules/TestRules';
import { codeQualityRules } from '../rules/CodeQualityRules';
import { loggingRules } from '../rules/LoggingRules';
import { designRules } from '../rules/DesignRules';
import tokens from '../engine/tokens';

const ENGINE = new ArchitectEngine({ autoFix: false, failOn: 'high' });

ENGINE.registerRules([...securityRules, ...testRules, ...codeQualityRules, ...loggingRules, ...designRules({ primary: tokens.dna.primary })]);

function detectLanguage(filePath: string): RuleContext['language'] {
  const ext = extname(filePath).toLowerCase();
  const map: Record<string, RuleContext['language']> = {
    '.ts': 'typescript', '.tsx': 'typescript',
    '.js': 'javascript', '.jsx': 'javascript',
    '.css': 'css', '.html': 'html', '.htm': 'html',
    '.json': 'json',
  };
  return map[ext] ?? 'unknown';
}

function buildContext(filePath: string, code: string): RuleContext {
  return {
    code,
    filePath,
    fileName: basename(filePath),
    language: detectLanguage(filePath),
    metadata: {},
    staged: false,
  };
}

function getStagedDiff(): string {
  try {
    return execSync('git diff --cached --name-only', { encoding: 'utf8' });
  } catch {
    return '';
  }
}

function getFileDiff(filename: string): string {
  try {
    return execSync(`git diff HEAD -- "${filename}"`, { encoding: 'utf8' });
  } catch {
    return '';
  }
}

function printReport(result: ReturnType<typeof ENGINE.runSync>, verbose = false): void {
  const { status, issues, summary, rulesEvaluated } = result;

  console.log('\n' + '='.repeat(60));
  console.log(`  🔍 Architect Engine — Report`);
  console.log('='.repeat(60));
  console.log(`  Status:  ${status.toUpperCase()}`);
  console.log(`  Regras:  ${rulesEvaluated} executadas`);
  console.log(`  Issues:  ${summary.critical}C / ${summary.high}H / ${summary.medium}M / ${summary.low}L`);
  console.log('-'.repeat(60));

  if (issues.length === 0) {
    console.log('  ✅ Nenhum problema detectado.\n');
    return;
  }

  const sorted = [...issues].sort((a, b) => {
    const order = { critical: 0, high: 1, medium: 2, low: 3 };
    return order[a.severity] - order[b.severity];
  });

  for (const issue of sorted) {
    const icon = { critical: '🔴', high: '🟠', medium: '🟡', low: '⚪' }[issue.severity];
    const location = issue.line ? `[${issue.file}:${issue.line}]` : `[${issue.file}]`;
    console.log(`  ${icon} [${issue.code}] ${issue.message}`);
    console.log(`     ${location}`);
    if (verbose && issue.suggestions) {
      for (const s of issue.suggestions) {
        console.log(`     💡 ${s}`);
      }
    }
  }

  console.log('');

  if (status === 'blocked') {
    console.log('  ⛔ BLOQUEADO: Corrija os issues critical antes de prosseguir.');
    process.exit(1);
  } else if (status === 'warned') {
    console.log('  ⚠️  ATENÇÃO: Issues de alta/média severidade detectados.');
  }
}

function runOnFile(filePath: string): void {
  let code: string;
  try {
    code = readFileSync(filePath, 'utf8');
  } catch {
    return;
  }

  const context = buildContext(filePath, code);
  const result = ENGINE.runSync(context, 'after_generation');
  printReport(result, true);
}

function runOnStaged(): void {
  const files = getStagedDiff().trim().split('\n').filter(Boolean);

  if (files.length === 0) {
    console.log('  📂 Nenhum arquivo em staging.');
    return;
  }

  const supportedExts = ['.ts', '.tsx', '.js', '.jsx', '.html', '.css'];

  let hasBlocking = false;

  for (const file of files) {
    const ext = extname(file);
    if (!supportedExts.includes(ext)) continue;

    const diff = getFileDiff(file);
    if (!diff.trim()) continue;

    const context = buildContext(file, diff);
    const result = ENGINE.runSync(context, 'pre_commit');
    printReport(result, true);

    if (result.status === 'blocked') hasBlocking = true;
  }

  if (hasBlocking) {
    process.exit(1);
  }
}

function runOnDir(dirPath: string): void {
  let files: string[] = [];

  try {
    files = readdirSync(dirPath);
  } catch {
    console.error(`Directory not found: ${dirPath}`);
    return;
  }

  const supportedExts = ['.ts', '.tsx', '.js', '.jsx'];

  for (const file of files) {
    const full = join(dirPath, file);
    try {
      if (statSync(full).isDirectory()) continue;
    } catch {
      continue;
    }

    const ext = extname(file);
    if (!supportedExts.includes(ext)) continue;

    runOnFile(full);
  }
}

const args = process.argv.slice(2);
const command = args[0];

switch (command) {
  case 'run': {
    const target = args[1];
    if (!target) {
      console.log('Usage: architect run <file|directory>');
      process.exit(1);
    }
    try {
      if (statSync(target).isDirectory()) {
        runOnDir(target);
      } else {
        runOnFile(target);
      }
    } catch {
      console.error(`Target not found: ${target}`);
      process.exit(1);
    }
    break;
  }

  case 'staged':
    runOnStaged();
    break;

  case 'rules':
    console.log('\n  📋 Regras registradas no Architect Engine:\n');
    for (const rule of ENGINE.getRules()) {
      console.log(`  [${rule.id}] ${rule.name} — ${rule.trigger} (${rule.severity})`);
    }
    console.log(`\n  Total: ${ENGINE.getRuleCount()} regras\n`);
    break;

  case 'version':
    console.log(`Architect Engine v${tokens.version}`);
    break;

  case 'init': {
    const cwd = process.cwd();
    const archDir = join(cwd, '.architect');

    if (existsSync(archDir)) {
      console.log('  ⚠️  .architect/ já existe neste projeto.');
      console.log('  Para reconfigurar, delete .architect/ e rode novamente.');
      break;
    }

    mkdirSync(archDir, { recursive: true });
    mkdirSync(join(archDir, 'rules'), { recursive: true });

    writeFileSync(
      join(archDir, 'tokens.json'),
      JSON.stringify(
        {
          project: cwd.split('/').pop() || 'my-project',
          version: tokens.version,
          dna: tokens.dna,
          palette_extended: tokens.palette_extended,
          principles: tokens.principles,
          anti_patterns: tokens.anti_patterns,
        },
        null,
        2,
      ),
    );

    writeFileSync(
      join(archDir, 'config.json'),
      JSON.stringify(
        {
          autoFix: false,
          failOn: 'high',
          rules: {
            'SEC-001': { enabled: true },
            'SEC-002': { enabled: true },
            'TEST-001': { enabled: true },
            'CQ-001': { enabled: true },
            'LOG-001': { enabled: true },
            'DES-001': { enabled: true },
          },
        },
        null,
        2,
      ),
    );

    console.log(`
  ✅ Architect Engine inicializado!

  📁 .architect/
     ├── tokens.json   ← DNA do seu projeto
     └── config.json   ← Configuração de regras

  Próximos passos:
  1. Edite .architect/tokens.json com as cores do seu projeto
  2. Adicione hooks ao package.json:
     "prepare": "husky install"

  Uso:
    architect run <file>   Analisar arquivo
    architect rules       Listar regras
    architect version     Versão
`);
    break;
  }

  default:
    console.log(`
  🏗️  Architect Engine v${tokens.version}

  Usage:
    architect init              Inicializar .architect/ no projeto
    architect run <file|dir>    Analisar arquivo ou diretório
    architect staged            Analisar arquivos em staging (git)
    architect rules             Listar regras registradas
    architect version           Versão do engine

  Examples:
    architect init
    architect run src/
    architect run src/utils.ts
    architect staged
`);
}

export { ArchitectEngine, ENGINE };
