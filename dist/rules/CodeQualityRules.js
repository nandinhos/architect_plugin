"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.codeQualityRules = void 0;
exports.createAntiPatternRule = createAntiPatternRule;
const MAX_FUNCTION_LINES = 50;
const MAX_LINES_PER_FILE = 300;
const GENERIC_NAMES = [
    'data', 'info', 'temp', 'tmp', 'result', 'res', 'obj', 'item',
    'value', 'val', 'array', 'arr', 'dict', 'map', 'table',
];
function detectLongFunctions(code, file) {
    const issues = [];
    const lines = code.split('\n');
    let functionStart = -1;
    let braceCount = 0;
    let functionName = '';
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (/^(export\s+)?(async\s+)?function\s+\w+/.test(line) || /^(export\s+)?(async\s+)?const\s+\w+\s*=\s*(async\s+)?\(/.test(line)) {
            functionStart = i;
            const match = line.match(/(?:function|const)\s+(\w+)/);
            functionName = match ? match[1] : `anonymous at line ${i + 1}`;
            braceCount = 0;
        }
        if (functionStart !== -1) {
            braceCount += (line.match(/{/g) || []).length;
            braceCount -= (line.match(/}/g) || []).length;
            if (braceCount === 0 && functionStart !== -1) {
                const functionLength = i - functionStart + 1;
                if (functionLength > MAX_FUNCTION_LINES) {
                    issues.push({
                        code: 'CQ-001',
                        message: `Função "${functionName}" tem ${functionLength} linhas (máximo: ${MAX_FUNCTION_LINES}). Refatore.`,
                        line: functionStart + 1,
                        severity: 'medium',
                        file,
                    });
                }
                functionStart = -1;
            }
        }
    }
    return issues;
}
function detectGenericNames(code, file) {
    const issues = [];
    const lines = code.split('\n');
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        for (const name of GENERIC_NAMES) {
            const patterns = [
                new RegExp(`\\bconst\\s+${name}\\s*=`),
                new RegExp(`\\blet\\s+${name}\\s*=`),
                new RegExp(`\\bfunction\\s+${name}\\s*\\(`),
            ];
            for (const pattern of patterns) {
                if (pattern.test(line)) {
                    issues.push({
                        code: 'CQ-002',
                        message: `Nome genérico "${name}" detectado. Use nomes descritivos: ${name} → ${suggestBetterName(name)}`,
                        line: i + 1,
                        severity: 'low',
                        file,
                    });
                }
            }
        }
    }
    return issues;
}
function detectExplicitAny(code, file) {
    const issues = [];
    const lines = code.split('\n');
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (/\b: any\b/.test(line) || /\bany\[\]/.test(line)) {
            issues.push({
                code: 'CQ-003',
                message: 'Uso explícito de "any" detectado. Use tipos específicos ou unknown.',
                line: i + 1,
                severity: 'medium',
                file,
            });
        }
    }
    return issues;
}
function detectLongFiles(code, file) {
    const lineCount = code.split('\n').length;
    if (lineCount > MAX_LINES_PER_FILE) {
        return [{
                code: 'CQ-004',
                message: `Arquivo com ${lineCount} linhas (máximo: ${MAX_LINES_PER_FILE}). Considere dividir.`,
                severity: 'medium',
                file,
            }];
    }
    return [];
}
function suggestBetterName(generic) {
    const map = {
        data: 'userData, responseData, apiResponse',
        info: 'userInfo, systemInfo, errorInfo',
        temp: 'temporaryCache, transientState',
        tmp: 'transientBuffer, sessionCache',
        result: 'calculationResult, queryResult',
        res: 'httpResponse, apiResponse',
        obj: 'userObject, configObject',
        item: 'cartItem, listItem, menuItem',
        value: 'inputValue, selectedValue',
        val: 'inputValue, numericValue',
        array: 'userList, itemList, idList',
        arr: 'processedItems, filteredResults',
        dict: 'configMap, lookupTable',
        map: 'userMap, roleMap, countryMap',
        table: 'dataTable, lookupTable',
    };
    return map[generic] || 'moreDescriptiveName';
}
function createAntiPatternRule() {
    return {
        id: 'CQ-001',
        name: 'Anti-Pattern Detection',
        trigger: 'after_generation',
        severity: 'high',
        description: 'Detecta funções longas, nomes genéricos, uso de any e arquivos muito longos',
        validate(context) {
            const { code, filePath } = context;
            const allIssues = [
                ...detectLongFunctions(code, filePath),
                ...detectGenericNames(code, filePath),
                ...detectExplicitAny(code, filePath),
                ...detectLongFiles(code, filePath),
            ];
            return {
                ruleId: 'CQ-001',
                ruleName: 'Anti-Pattern Detection',
                valid: allIssues.length === 0,
                issues: allIssues,
            };
        },
    };
}
exports.codeQualityRules = [createAntiPatternRule()];
//# sourceMappingURL=CodeQualityRules.js.map