#!/usr/bin/env node
/* eslint-disable no-console */
import { statSync, readdirSync, mkdirSync, writeFileSync, existsSync } from 'fs';
import { join, extname, basename } from 'path';
import { ArchitectEngine } from '../engine/RuleEngine';
import { RuleContext } from '../types';
import { securityRules } from '../rules/SecurityRules';
import { testRules } from '../rules/TestRules';
import { codeQualityRules } from '../rules/CodeQualityRules';
import { loggingRules } from '../rules/LoggingRules';
import { designRules } from '../rules/DesignRules';
import tokens from '../engine/tokens';
import { parseArgs, getTemplateFlag, getConfigSubArgs } from './parser';
import { getStagedDiff, getFileDiff, readConfig, writeConfig, readSourceFile } from './adapters';
import { printReport, printHealth, printRules, printDirJson } from './presenter';

const ENGINE = new ArchitectEngine({ autoFix: false, failOn: 'high' });

ENGINE.registerRules([
  ...securityRules,
  ...testRules,
  ...codeQualityRules,
  ...loggingRules,
  ...designRules({ primary: tokens.dna.primary }),
]);

function loadProjectConfig(): void {
  const config = readConfig();
  if (Object.keys(config).length === 0) return;

  try {
    ENGINE.loadConfig(config as Parameters<typeof ENGINE.loadConfig>[0]);
  } catch {
    console.warn('  Aviso: .architect/config.json invalido. Usando configuracao padrao.');
  }
}

function loadCustomRules(): void {
  const rulesDir = join(process.cwd(), '.architect', 'rules');
  if (!existsSync(rulesDir)) return;

  let files: string[];
  try {
    files = readdirSync(rulesDir).filter((f) => f.endsWith('.js'));
  } catch {
    return;
  }

  for (const file of files) {
    const fullPath = join(rulesDir, file);
    try {
      const mod = require(fullPath);
      const rules = mod.default ?? mod.rules ?? mod;

      const candidates = Array.isArray(rules) ? rules : [rules];

      for (const rule of candidates) {
        if (rule && typeof rule === 'object' && rule.id && rule.validate) {
          ENGINE.registerRule(rule);
        }
      }
    } catch (err) {
      console.warn(
        `  Aviso: falha ao carregar regra de ${file}: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }
}

loadProjectConfig();
loadCustomRules();

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

function runOnFile(filePath: string, asJson = false): void {
  const code = readSourceFile(filePath);
  if (code === null) return;

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
    const result = ENGINE.runSync(context, 'after_generation');
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
  const allResults: ReturnType<typeof ENGINE.runSync>[] = [];
  const supportedExts = ['.ts', '.tsx', '.js', '.jsx'];

  function scanDir(currentDir: string): void {
    let files: string[] = [];

    try {
      files = readdirSync(currentDir);
    } catch {
      return;
    }

    for (const file of files) {
      const full = join(currentDir, file);
      try {
        if (statSync(full).isDirectory()) {
          scanDir(full);
          continue;
        }
      } catch {
        continue;
      }

      const ext = extname(file);
      if (!supportedExts.includes(ext)) continue;

      const code = readSourceFile(full);
      if (code === null) continue;

      const context = buildContext(full, code);
      const result = ENGINE.runSync(context, 'after_generation');
      allResults.push(result);

      if (!asJson) printReport(result, true);
    }
  }

  scanDir(dirPath);

  if (asJson) {
    printDirJson(allResults);
  }
}

const parsed = parseArgs(process.argv);
const command = parsed.command;
const asJson = parsed.flags.json === true;

switch (command) {
  case 'run': {
    const target = parsed.target;
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
    printRules(ENGINE.getRules(), ENGINE.getRuleCount());
    break;

  case 'version':
    console.log(`Architect Engine v${tokens.version}`);
    break;

  case 'config': {
    const configSub = getConfigSubArgs(process.argv.slice(2));
    if (!configSub.action) {
      runConfig(asJson);
    } else if (configSub.action === 'enable' && configSub.ruleId) {
      enableRule(configSub.ruleId);
    } else if (configSub.action === 'disable' && configSub.ruleId) {
      disableRule(configSub.ruleId);
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
    const template = getTemplateFlag(process.argv.slice(2));

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
    mkdirSync(join(archDir, 'design'), { recursive: true });
    mkdirSync(join(archDir, 'rules'), { recursive: true });

    writeFileSync(
      join(archDir, 'design', 'tokens.json'),
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
    architect version     Versao
`);
    break;
  }

  case 'health': {
    const { ArchitectDashboard } = require('../components/ArchitectDashboard');
    const dashboard = new ArchitectDashboard({
      dna: { primary: tokens.dna.primary, background: tokens.dna.background },
    });
    const detailed = dashboard.getDetailedStatus();

    if (asJson) {
      console.log(JSON.stringify(detailed, null, 2));
      break;
    }

    printHealth(detailed);
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
    architect health            Verificar protocolos do projeto
    architect version           Versao do engine
    architect config            Mostrar/editar configuracao

  Examples:
    architect init
    architect run src/
    architect run src/utils.ts
    architect staged
`);
}

function runConfig(asJson: boolean): void {
  const config = readConfig();

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
  const config = readConfig();

  if (!config.rules) {
    config.rules = {};
  }

  const rules = config.rules as Record<string, { enabled: boolean }>;
  rules[ruleId] = { enabled: true };

  writeConfig(config);
  ENGINE.enableRule(ruleId);
  console.log(`  Regra ${ruleId} habilitada.\n`);
}

function disableRule(ruleId: string): void {
  const config = readConfig();

  if (!config.rules) {
    config.rules = {};
  }

  const rules = config.rules as Record<string, { enabled: boolean }>;
  rules[ruleId] = { enabled: false };

  writeConfig(config);
  ENGINE.disableRule(ruleId);
  console.log(`  Regra ${ruleId} desabilitada.\n`);
}

export { ArchitectEngine, ENGINE };
