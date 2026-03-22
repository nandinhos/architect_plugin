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

ENGINE.registerRules([
  ...securityRules,
  ...testRules,
  ...codeQualityRules,
  ...loggingRules,
  ...designRules({ primary: tokens.dna.primary }),
]);

function detectLanguage(filePath: string): RuleContext['language'] {
  const ext = extname(filePath).toLowerCase();
  const map: Record<string, RuleContext['language']> = {
    '.ts': 'typescript',
    '.tsx': 'typescript',
    '.js': 'javascript',
    '.jsx': 'javascript',
    '.css': 'css',
    '.html': 'html',
    '.htm': 'html',
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

function printReport(
  result: ReturnType<typeof ENGINE.runSync>,
  verbose = false,
  asJson = false
): void {
  const { status, issues, summary, rulesEvaluated } = result;

  if (asJson) {
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  console.log('\n' + '='.repeat(60));
  console.log(`  🔍 Architect Engine — Report`);
  console.log('='.repeat(60));
  console.log(`  Status:  ${status.toUpperCase()}`);
  console.log(`  Regras:  ${rulesEvaluated} executadas`);
  console.log(
    `  Issues:  ${summary.critical}C / ${summary.high}H / ${summary.medium}M / ${summary.low}L`
  );
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
  } else if (status === 'warned') {
    console.log('  ⚠️  ATENÇÃO: Issues de alta/média severidade detectados.');
  }
}

function runOnFile(filePath: string, asJson = false): void {
  let code: string;
  try {
    code = readFileSync(filePath, 'utf8');
  } catch {
    return;
  }

  const context = buildContext(filePath, code);
  const result = ENGINE.runSync(context, 'after_generation');

  if (asJson) {
    printReport(result, false, true);
    if (result.status === 'blocked') process.exit(1);
    return;
  }

  printReport(result, true);
  if (result.status === 'blocked') process.exit(1);
}

function runOnStaged(asJson = false): void {
  const files = getStagedDiff().trim().split('\n').filter(Boolean);

  if (files.length === 0) {
    if (asJson) {
      console.log(JSON.stringify({ status: 'ok', issues: [], filesAnalyzed: 0 }, null, 2));
    } else {
      console.log('  📂 Nenhum arquivo em staging.');
    }
    return;
  }

  const supportedExts = ['.ts', '.tsx', '.js', '.jsx', '.html', '.css'];
  let hasBlocking = false;
  const allResults: ReturnType<typeof ENGINE.runSync>[] = [];

  for (const file of files) {
    const ext = extname(file);
    if (!supportedExts.includes(ext)) continue;

    const diff = getFileDiff(file);
    if (!diff.trim()) continue;

    const context = buildContext(file, diff);
    const result = ENGINE.runSync(context, 'pre_commit');
    allResults.push(result);

    if (!asJson) printReport(result, true);

    if (result.status === 'blocked') hasBlocking = true;
  }

  if (asJson) {
    const aggregated = {
      status: hasBlocking ? 'blocked' : 'ok',
      filesAnalyzed: allResults.length,
      results: allResults,
      summary: {
        critical: allResults.reduce((s, r) => s + r.summary.critical, 0),
        high: allResults.reduce((s, r) => s + r.summary.high, 0),
        medium: allResults.reduce((s, r) => s + r.summary.medium, 0),
        low: allResults.reduce((s, r) => s + r.summary.low, 0),
      },
    };
    console.log(JSON.stringify(aggregated, null, 2));
  }

  if (hasBlocking) process.exit(1);
}

function runOnDir(dirPath: string, asJson = false): void {
  let files: string[] = [];

  try {
    files = readdirSync(dirPath);
  } catch {
    console.error(`Directory not found: ${dirPath}`);
    return;
  }

  const supportedExts = ['.ts', '.tsx', '.js', '.jsx'];
  const allResults: ReturnType<typeof ENGINE.runSync>[] = [];

  for (const file of files) {
    const full = join(dirPath, file);
    try {
      if (statSync(full).isDirectory()) continue;
    } catch {
      continue;
    }

    const ext = extname(file);
    if (!supportedExts.includes(ext)) continue;

    let code: string;
    try {
      code = readFileSync(full, 'utf8');
    } catch {
      continue;
    }

    const context = buildContext(full, code);
    const result = ENGINE.runSync(context, 'after_generation');
    allResults.push(result);

    if (!asJson) printReport(result, true);
  }

  if (asJson) {
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
}

const args = process.argv.slice(2);
const command = args[0];
const asJson = args.includes('--json');

switch (command) {
  case 'run': {
    const target = args[1];
    if (!target) {
      console.log('Usage: architect run <file|directory> [--json]');
      process.exit(1);
    }
    try {
      if (statSync(target).isDirectory()) {
        runOnDir(target, asJson);
      } else {
        runOnFile(target, asJson);
      }
    } catch {
      console.error(`Target not found: ${target}`);
      process.exit(1);
    }
    break;
  }

  case 'staged':
    runOnStaged(asJson);
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

  case 'config': {
    const configArgs = args.slice(1);
    if (configArgs.length === 0) {
      runConfig(asJson);
    } else if (configArgs[0] === 'enable' && configArgs[1]) {
      enableRule(configArgs[1]);
    } else if (configArgs[0] === 'disable' && configArgs[1]) {
      disableRule(configArgs[1]);
    } else {
      console.log('Usage:');
      console.log('  architect config                    Mostrar configuracao');
      console.log('  architect config --json           Mostrar em JSON');
      console.log('  architect config enable <rule-id> Habilitar regra');
      console.log('  architect config disable <rule-id> Desabilitar regra');
    }
    break;
  }

  case 'init': {
    const cwd = process.cwd();
    const archDir = join(cwd, '.architect');
    const initArgs = args.slice(1);
    let template = 'default';

    for (let i = 0; i < initArgs.length; i++) {
      if (initArgs[i] === '--template' && initArgs[i + 1]) {
        template = initArgs[i + 1];
      }
    }

    const templates: Record<string, { primary: string; background: string; name: string }> = {
      default: { primary: '#6366F1', background: '#F9FAFB', name: 'Default Indigo' },
      react: { primary: '#61DAFB', background: '#282C34', name: 'React' },
      vue: { primary: '#42B883', background: '#FFFFFF', name: 'Vue Green' },
      next: { primary: '#000000', background: '#FFFFFF', name: 'Next.js' },
      astro: { primary: '#FF5A03', background: '#FFFFFF', name: 'Astro Orange' },
    };

    if (existsSync(archDir)) {
      console.log('  ⚠️  .architect/ já existe neste projeto.');
      console.log('  Para reconfigurar, delete .architect/ e rode novamente.');
      break;
    }

    const templateConfig = templates[template] || templates.default;

    mkdirSync(archDir, { recursive: true });
    mkdirSync(join(archDir, 'rules'), { recursive: true });

    writeFileSync(
      join(archDir, 'tokens.json'),
      JSON.stringify(
        {
          project: cwd.split('/').pop() || 'my-project',
          version: tokens.version,
          dna: {
            primary: templateConfig.primary,
            primary_name: templateConfig.name,
            background: templateConfig.background,
            surface: '#FFFFFF',
            text: '#111827',
            muted: '#6B7280',
            border: '#E5E7EB',
            radius: '0.75rem',
            shadow: '0 4px 20px rgba(0,0,0,0.05)',
          },
          palette_extended: tokens.palette_extended,
          principles: tokens.principles,
          anti_patterns: tokens.anti_patterns,
        },
        null,
        2
      )
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
            'SEC-003': { enabled: true },
            'SEC-004': { enabled: true },
            'TEST-001': { enabled: true },
            'CQ-001': { enabled: true },
            'LOG-001': { enabled: true },
            'DES-001': { enabled: true },
          },
        },
        null,
        2
      )
    );

    console.log(`
  ✅ Architect Engine inicializado!

  Template: ${templateConfig.name}

  📁 .architect/
     ├── tokens.json   ← DNA do seu projeto
     └── config.json   ← Configuração de regras

  Próximos passos:
  1. Edite .architect/tokens.json com as cores do seu projeto
  2. Adicione hooks ao package.json:
     "prepare": "husky install"

  Templates disponíveis:
    default, react, vue, next, astro
  Uso:
    architect init --template=react

  Comandos:
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
    architect config            Mostrar/editar configuração

  Examples:
    architect init
    architect run src/
    architect run src/utils.ts
    architect staged
`);
}

function runConfig(asJson: boolean): void {
  const configPath = join(process.cwd(), '.architect', 'config.json');

  let config: Record<string, unknown> = {};

  if (existsSync(configPath)) {
    try {
      config = JSON.parse(readFileSync(configPath, 'utf8'));
    } catch {
      config = {};
    }
  }

  if (asJson) {
    console.log(JSON.stringify(config, null, 2));
    return;
  }

  console.log('\n  Configuracao do Architect Engine\n');
  console.log('  Diretorio: .architect/');
  console.log('');

  if (Object.keys(config).length === 0) {
    console.log('  Nenhuma configuracao encontrada.');
    console.log('  Execute "architect init" para criar uma configuracao padrao.\n');
    return;
  }

  console.log('  Configuracoes atuais:');
  console.log(`    autoFix: ${config.autoFix ?? false}`);
  console.log(`    failOn: ${config.failOn ?? 'high'}`);
  console.log('');

  if (config.rules && typeof config.rules === 'object') {
    console.log('  Regras:');
    const rules = config.rules as Record<string, { enabled: boolean }>;
    for (const [ruleId, ruleConfig] of Object.entries(rules)) {
      console.log(`    ${ruleId}: ${ruleConfig.enabled ? 'enabled' : 'disabled'}`);
    }
  }

  console.log('');
}

function enableRule(ruleId: string): void {
  const configPath = join(process.cwd(), '.architect', 'config.json');
  const archDir = join(process.cwd(), '.architect');

  if (!existsSync(archDir)) {
    console.log('  Execute "architect init" primeiro.\n');
    process.exit(1);
  }

  let config: Record<string, unknown> = {};
  if (existsSync(configPath)) {
    try {
      config = JSON.parse(readFileSync(configPath, 'utf8'));
    } catch {
      config = {};
    }
  }

  if (!config.rules) {
    config.rules = {};
  }

  const rules = config.rules as Record<string, { enabled: boolean }>;
  rules[ruleId] = { enabled: true };

  writeFileSync(configPath, JSON.stringify(config, null, 2));
  console.log(`  Regra ${ruleId} habilitada.\n`);
}

function disableRule(ruleId: string): void {
  const configPath = join(process.cwd(), '.architect', 'config.json');
  const archDir = join(process.cwd(), '.architect');

  if (!existsSync(archDir)) {
    console.log('  Execute "architect init" primeiro.\n');
    process.exit(1);
  }

  let config: Record<string, unknown> = {};
  if (existsSync(configPath)) {
    try {
      config = JSON.parse(readFileSync(configPath, 'utf8'));
    } catch {
      config = {};
    }
  }

  if (!config.rules) {
    config.rules = {};
  }

  const rules = config.rules as Record<string, { enabled: boolean }>;
  rules[ruleId] = { enabled: false };

  writeFileSync(configPath, JSON.stringify(config, null, 2));
  console.log(`  Regra ${ruleId} desabilitada.\n`);
}

export { ArchitectEngine, ENGINE };
