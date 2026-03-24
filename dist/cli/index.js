#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ENGINE = exports.ArchitectEngine = void 0;
/* eslint-disable no-console */
const fs_1 = require("fs");
const path_1 = require("path");
const RuleEngine_1 = require("../engine/RuleEngine");
Object.defineProperty(exports, "ArchitectEngine", { enumerable: true, get: function () { return RuleEngine_1.ArchitectEngine; } });
const SecurityRules_1 = require("../rules/SecurityRules");
const TestRules_1 = require("../rules/TestRules");
const CodeQualityRules_1 = require("../rules/CodeQualityRules");
const LoggingRules_1 = require("../rules/LoggingRules");
const DesignRules_1 = require("../rules/DesignRules");
const tokens_1 = __importDefault(require("../engine/tokens"));
const parser_1 = require("./parser");
const adapters_1 = require("./adapters");
const presenter_1 = require("./presenter");
const ENGINE = new RuleEngine_1.ArchitectEngine({ autoFix: false, failOn: 'high' });
exports.ENGINE = ENGINE;
ENGINE.registerRules([
    ...SecurityRules_1.securityRules,
    ...TestRules_1.testRules,
    ...CodeQualityRules_1.codeQualityRules,
    ...LoggingRules_1.loggingRules,
    ...(0, DesignRules_1.designRules)({ primary: tokens_1.default.dna.primary }),
]);
function loadProjectConfig() {
    const config = (0, adapters_1.readConfig)();
    if (Object.keys(config).length === 0)
        return;
    try {
        ENGINE.loadConfig(config);
    }
    catch {
        console.warn('  Aviso: .architect/config.json invalido. Usando configuracao padrao.');
    }
}
function loadCustomRules() {
    const rulesDir = (0, path_1.join)(process.cwd(), '.architect', 'rules');
    if (!(0, fs_1.existsSync)(rulesDir))
        return;
    let files;
    try {
        files = (0, fs_1.readdirSync)(rulesDir).filter((f) => f.endsWith('.js'));
    }
    catch {
        return;
    }
    for (const file of files) {
        const fullPath = (0, path_1.join)(rulesDir, file);
        try {
            const mod = require(fullPath);
            const rules = mod.default ?? mod.rules ?? mod;
            const candidates = Array.isArray(rules) ? rules : [rules];
            for (const rule of candidates) {
                if (rule && typeof rule === 'object' && rule.id && rule.validate) {
                    ENGINE.registerRule(rule);
                }
            }
        }
        catch (err) {
            console.warn(`  Aviso: falha ao carregar regra de ${file}: ${err instanceof Error ? err.message : String(err)}`);
        }
    }
}
loadProjectConfig();
loadCustomRules();
function detectLanguage(filePath) {
    const ext = (0, path_1.extname)(filePath).toLowerCase();
    const map = {
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
function buildContext(filePath, code) {
    return {
        code,
        filePath,
        fileName: (0, path_1.basename)(filePath),
        language: detectLanguage(filePath),
        metadata: {},
        staged: false,
    };
}
function runOnFile(filePath, asJson = false) {
    const code = (0, adapters_1.readSourceFile)(filePath);
    if (code === null)
        return;
    const context = buildContext(filePath, code);
    const result = ENGINE.runSync(context, 'after_generation');
    if (asJson) {
        (0, presenter_1.printReport)(result, false, true);
        if (result.status === 'blocked')
            process.exit(1);
        return;
    }
    (0, presenter_1.printReport)(result, true);
    if (result.status === 'blocked')
        process.exit(1);
}
function runOnStaged(asJson = false) {
    const files = (0, adapters_1.getStagedDiff)().trim().split('\n').filter(Boolean);
    if (files.length === 0) {
        if (asJson) {
            console.log(JSON.stringify({ status: 'ok', issues: [], filesAnalyzed: 0 }, null, 2));
        }
        else {
            console.log('  📂 Nenhum arquivo em staging.');
        }
        return;
    }
    const supportedExts = ['.ts', '.tsx', '.js', '.jsx', '.html', '.css'];
    let hasBlocking = false;
    const allResults = [];
    for (const file of files) {
        const ext = (0, path_1.extname)(file);
        if (!supportedExts.includes(ext))
            continue;
        const diff = (0, adapters_1.getFileDiff)(file);
        if (!diff.trim())
            continue;
        const context = buildContext(file, diff);
        const result = ENGINE.runSync(context, 'after_generation');
        allResults.push(result);
        if (!asJson)
            (0, presenter_1.printReport)(result, true);
        if (result.status === 'blocked')
            hasBlocking = true;
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
    if (hasBlocking)
        process.exit(1);
}
function runOnDir(dirPath, asJson = false) {
    const allResults = [];
    const supportedExts = ['.ts', '.tsx', '.js', '.jsx'];
    function scanDir(currentDir) {
        let files = [];
        try {
            files = (0, fs_1.readdirSync)(currentDir);
        }
        catch {
            return;
        }
        for (const file of files) {
            const full = (0, path_1.join)(currentDir, file);
            try {
                if ((0, fs_1.statSync)(full).isDirectory()) {
                    scanDir(full);
                    continue;
                }
            }
            catch {
                continue;
            }
            const ext = (0, path_1.extname)(file);
            if (!supportedExts.includes(ext))
                continue;
            const code = (0, adapters_1.readSourceFile)(full);
            if (code === null)
                continue;
            const context = buildContext(full, code);
            const result = ENGINE.runSync(context, 'after_generation');
            allResults.push(result);
            if (!asJson)
                (0, presenter_1.printReport)(result, true);
        }
    }
    scanDir(dirPath);
    if (asJson) {
        (0, presenter_1.printDirJson)(allResults);
    }
}
const parsed = (0, parser_1.parseArgs)(process.argv);
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
            if ((0, fs_1.statSync)(target).isDirectory()) {
                runOnDir(target, asJson);
            }
            else {
                runOnFile(target, asJson);
            }
        }
        catch {
            console.error(`Target not found: ${target}`);
            process.exit(1);
        }
        break;
    }
    case 'staged':
        runOnStaged(asJson);
        break;
    case 'rules':
        (0, presenter_1.printRules)(ENGINE.getRules(), ENGINE.getRuleCount());
        break;
    case 'version':
        console.log(`Architect Engine v${tokens_1.default.version}`);
        break;
    case 'config': {
        const configSub = (0, parser_1.getConfigSubArgs)(process.argv.slice(2));
        if (!configSub.action) {
            runConfig(asJson);
        }
        else if (configSub.action === 'enable' && configSub.ruleId) {
            enableRule(configSub.ruleId);
        }
        else if (configSub.action === 'disable' && configSub.ruleId) {
            disableRule(configSub.ruleId);
        }
        else {
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
        const archDir = (0, path_1.join)(cwd, '.architect');
        const template = (0, parser_1.getTemplateFlag)(process.argv.slice(2));
        const templates = {
            default: { primary: '#6366F1', background: '#F9FAFB', name: 'Default Indigo' },
            react: { primary: '#61DAFB', background: '#282C34', name: 'React' },
            vue: { primary: '#42B883', background: '#FFFFFF', name: 'Vue Green' },
            next: { primary: '#000000', background: '#FFFFFF', name: 'Next.js' },
            astro: { primary: '#FF5A03', background: '#FFFFFF', name: 'Astro Orange' },
        };
        if ((0, fs_1.existsSync)(archDir)) {
            console.log('  ⚠️  .architect/ já existe neste projeto.');
            console.log('  Para reconfigurar, delete .architect/ e rode novamente.');
            break;
        }
        const templateConfig = templates[template] || templates.default;
        (0, fs_1.mkdirSync)(archDir, { recursive: true });
        (0, fs_1.mkdirSync)((0, path_1.join)(archDir, 'design'), { recursive: true });
        (0, fs_1.mkdirSync)((0, path_1.join)(archDir, 'rules'), { recursive: true });
        (0, fs_1.writeFileSync)((0, path_1.join)(archDir, 'design', 'tokens.json'), JSON.stringify({
            project: cwd.split('/').pop() || 'my-project',
            version: tokens_1.default.version,
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
            palette_extended: tokens_1.default.palette_extended,
            principles: tokens_1.default.principles,
            anti_patterns: tokens_1.default.anti_patterns,
        }, null, 2));
        (0, fs_1.writeFileSync)((0, path_1.join)(archDir, 'config.json'), JSON.stringify({
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
        }, null, 2));
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
            dna: { primary: tokens_1.default.dna.primary, background: tokens_1.default.dna.background },
        });
        const detailed = dashboard.getDetailedStatus();
        if (asJson) {
            console.log(JSON.stringify(detailed, null, 2));
            break;
        }
        (0, presenter_1.printHealth)(detailed);
        break;
    }
    default:
        console.log(`
  🏗️  Architect Engine v${tokens_1.default.version}

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
function runConfig(asJson) {
    const config = (0, adapters_1.readConfig)();
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
        const rules = config.rules;
        for (const [ruleId, ruleConfig] of Object.entries(rules)) {
            console.log(`    ${ruleId}: ${ruleConfig.enabled ? 'enabled' : 'disabled'}`);
        }
    }
    console.log('');
}
function enableRule(ruleId) {
    const config = (0, adapters_1.readConfig)();
    if (!config.rules) {
        config.rules = {};
    }
    const rules = config.rules;
    rules[ruleId] = { enabled: true };
    (0, adapters_1.writeConfig)(config);
    ENGINE.enableRule(ruleId);
    console.log(`  Regra ${ruleId} habilitada.\n`);
}
function disableRule(ruleId) {
    const config = (0, adapters_1.readConfig)();
    if (!config.rules) {
        config.rules = {};
    }
    const rules = config.rules;
    rules[ruleId] = { enabled: false };
    (0, adapters_1.writeConfig)(config);
    ENGINE.disableRule(ruleId);
    console.log(`  Regra ${ruleId} desabilitada.\n`);
}
//# sourceMappingURL=index.js.map