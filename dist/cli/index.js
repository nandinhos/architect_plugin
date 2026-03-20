#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ENGINE = exports.ArchitectEngine = void 0;
/* eslint-disable no-console */
const child_process_1 = require("child_process");
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
const ENGINE = new RuleEngine_1.ArchitectEngine({ autoFix: false, failOn: 'high' });
exports.ENGINE = ENGINE;
ENGINE.registerRules([...SecurityRules_1.securityRules, ...TestRules_1.testRules, ...CodeQualityRules_1.codeQualityRules, ...LoggingRules_1.loggingRules, ...(0, DesignRules_1.designRules)({ primary: tokens_1.default.dna.primary })]);
function detectLanguage(filePath) {
    const ext = (0, path_1.extname)(filePath).toLowerCase();
    const map = {
        '.ts': 'typescript', '.tsx': 'typescript',
        '.js': 'javascript', '.jsx': 'javascript',
        '.css': 'css', '.html': 'html', '.htm': 'html',
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
function getStagedDiff() {
    try {
        return (0, child_process_1.execSync)('git diff --cached --name-only', { encoding: 'utf8' });
    }
    catch {
        return '';
    }
}
function getFileDiff(filename) {
    try {
        return (0, child_process_1.execSync)(`git diff HEAD -- "${filename}"`, { encoding: 'utf8' });
    }
    catch {
        return '';
    }
}
function printReport(result, verbose = false, asJson = false) {
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
    }
    else if (status === 'warned') {
        console.log('  ⚠️  ATENÇÃO: Issues de alta/média severidade detectados.');
    }
}
function runOnFile(filePath, asJson = false) {
    let code;
    try {
        code = (0, fs_1.readFileSync)(filePath, 'utf8');
    }
    catch {
        return;
    }
    const context = buildContext(filePath, code);
    const result = ENGINE.runSync(context, 'after_generation');
    if (asJson) {
        printReport(result, false, true);
        if (result.status === 'blocked')
            process.exit(1);
        return;
    }
    printReport(result, true);
    if (result.status === 'blocked')
        process.exit(1);
}
function runOnStaged(asJson = false) {
    const files = getStagedDiff().trim().split('\n').filter(Boolean);
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
        const diff = getFileDiff(file);
        if (!diff.trim())
            continue;
        const context = buildContext(file, diff);
        const result = ENGINE.runSync(context, 'pre_commit');
        allResults.push(result);
        if (!asJson)
            printReport(result, true);
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
    let files = [];
    try {
        files = (0, fs_1.readdirSync)(dirPath);
    }
    catch {
        console.error(`Directory not found: ${dirPath}`);
        return;
    }
    const supportedExts = ['.ts', '.tsx', '.js', '.jsx'];
    const allResults = [];
    for (const file of files) {
        const full = (0, path_1.join)(dirPath, file);
        try {
            if ((0, fs_1.statSync)(full).isDirectory())
                continue;
        }
        catch {
            continue;
        }
        const ext = (0, path_1.extname)(file);
        if (!supportedExts.includes(ext))
            continue;
        let code;
        try {
            code = (0, fs_1.readFileSync)(full, 'utf8');
        }
        catch {
            continue;
        }
        const context = buildContext(full, code);
        const result = ENGINE.runSync(context, 'after_generation');
        allResults.push(result);
        if (!asJson)
            printReport(result, true);
    }
    if (asJson) {
        console.log(JSON.stringify({
            status: allResults.some(r => r.status === 'blocked') ? 'blocked' : 'ok',
            filesAnalyzed: allResults.length,
            results: allResults,
            summary: {
                critical: allResults.reduce((s, r) => s + r.summary.critical, 0),
                high: allResults.reduce((s, r) => s + r.summary.high, 0),
                medium: allResults.reduce((s, r) => s + r.summary.medium, 0),
                low: allResults.reduce((s, r) => s + r.summary.low, 0),
            },
        }, null, 2));
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
        console.log('\n  📋 Regras registradas no Architect Engine:\n');
        for (const rule of ENGINE.getRules()) {
            console.log(`  [${rule.id}] ${rule.name} — ${rule.trigger} (${rule.severity})`);
        }
        console.log(`\n  Total: ${ENGINE.getRuleCount()} regras\n`);
        break;
    case 'version':
        console.log(`Architect Engine v${tokens_1.default.version}`);
        break;
    case 'init': {
        const cwd = process.cwd();
        const archDir = (0, path_1.join)(cwd, '.architect');
        if ((0, fs_1.existsSync)(archDir)) {
            console.log('  ⚠️  .architect/ já existe neste projeto.');
            console.log('  Para reconfigurar, delete .architect/ e rode novamente.');
            break;
        }
        (0, fs_1.mkdirSync)(archDir, { recursive: true });
        (0, fs_1.mkdirSync)((0, path_1.join)(archDir, 'rules'), { recursive: true });
        (0, fs_1.writeFileSync)((0, path_1.join)(archDir, 'tokens.json'), JSON.stringify({
            project: cwd.split('/').pop() || 'my-project',
            version: tokens_1.default.version,
            dna: tokens_1.default.dna,
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
                'TEST-001': { enabled: true },
                'CQ-001': { enabled: true },
                'LOG-001': { enabled: true },
                'DES-001': { enabled: true },
            },
        }, null, 2));
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
  🏗️  Architect Engine v${tokens_1.default.version}

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
//# sourceMappingURL=index.js.map