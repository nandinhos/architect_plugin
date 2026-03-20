"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.designRules = void 0;
exports.createDesignValidatorRule = createDesignValidatorRule;
const HARDCODED_COLORS = [
    '#3B82F6', '#6366F1', '#8B5CF6', '#EC4899', '#EF4444', '#F59E0B',
    '#22C55E', '#14B8A6', '#06B6D4', '#0EA5E9', '#2563EB', '#7C3AED',
    '#DB2777', '#DC2626', '#D97706', '#16A34A', '#0D9488', '#0891B2',
    '#000000', '#FFFFFF', '#F3F4F6', '#E5E7EB',
];
const GENERIC_GRADIENTS = [
    /gradient\s*\(\s*#[0-9A-Fa-f]{6}\s*,\s*#[0-9A-Fa-f]{6}\s*\)/gi,
    /linear-gradient\s*\(\s*to\s+right\s*,\s*#[0-9A-Fa-f]{6}\s*,\s*#[0-9A-Fa-f]{6}\s*\)/gi,
    /from-((?:blue|indigo|purple|pink|red|orange|yellow|green|teal|cyan)-[0-9]{2,3})\s+to-((?:blue|indigo|purple|pink|red|orange|yellow|green|teal|cyan)-[0-9]{2,3})/gi,
];
const GENERIC_PLACEHOLDERS = [
    /placeholder=["']?(?:Digite|nome|email|senha|tipo|search|input|type here|enter)/gi,
];
function detectHardcodedColors(code, file, primaryColor) {
    const issues = [];
    if (primaryColor) {
        const normalizedPrimary = primaryColor.toUpperCase().replace('#', '');
        for (const color of HARDCODED_COLORS) {
            const normalizedColor = color.toUpperCase().replace('#', '');
            if (normalizedColor !== normalizedPrimary) {
                const pattern = new RegExp(`["'#]${color}["']|background-color:\\s*${color}`, 'gi');
                if (pattern.test(code)) {
                    issues.push({
                        code: 'DES-001',
                        message: `Cor hardcoded "${color}" detectada. Use tokens de design.`,
                        severity: 'medium',
                        file,
                    });
                }
            }
        }
    }
    return issues;
}
function detectGenericGradients(code, file) {
    const issues = [];
    for (const pattern of GENERIC_GRADIENTS) {
        pattern.lastIndex = 0;
        if (pattern.test(code)) {
            issues.push({
                code: 'DES-002',
                message: 'Gradiente genérico detectado. Use gradientes baseados no DNA do projeto.',
                severity: 'low',
                file,
            });
        }
    }
    return issues;
}
function detectPlaceholderOnly(code, file) {
    const issues = [];
    for (const pattern of GENERIC_PLACEHOLDERS) {
        pattern.lastIndex = 0;
        if (pattern.test(code)) {
            issues.push({
                code: 'DES-003',
                message: 'Placeholder usado como único label. Adicione um <label> semântico.',
                severity: 'medium',
                file,
            });
        }
    }
    return issues;
}
function detectEmojiIcons(code, file) {
    const issues = [];
    const emojiRegex = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu;
    if (emojiRegex.test(code)) {
        issues.push({
            code: 'DES-004',
            message: 'Emoji detectado em código. Use bibliotecas de ícones profissionais (Lucide, Heroicons).',
            severity: 'low',
            file,
        });
    }
    return issues;
}
function createDesignValidatorRule(tokens) {
    const primary = tokens?.primary;
    return {
        id: 'DES-001',
        name: 'Design Token Validator',
        trigger: 'after_generation',
        severity: 'low',
        description: 'Valida uso de tokens de design em vez de valores hardcoded',
        validate(context) {
            const { code, filePath, language } = context;
            if (language !== 'html' && language !== 'css' && language !== 'typescript' && language !== 'javascript') {
                return { ruleId: 'DES-001', ruleName: 'Design Token Validator', valid: true, issues: [] };
            }
            const allIssues = [
                ...detectGenericGradients(code, filePath),
                ...detectPlaceholderOnly(code, filePath),
                ...detectEmojiIcons(code, filePath),
            ];
            if (primary) {
                allIssues.push(...detectHardcodedColors(code, filePath, primary));
            }
            return {
                ruleId: 'DES-001',
                ruleName: 'Design Token Validator',
                valid: allIssues.length === 0,
                issues: allIssues,
            };
        },
    };
}
const designRules = (tokens) => [createDesignValidatorRule(tokens)];
exports.designRules = designRules;
//# sourceMappingURL=DesignRules.js.map