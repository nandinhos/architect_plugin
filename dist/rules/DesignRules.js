"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.designRules = void 0;
exports.createHardcodedColorRule = createHardcodedColorRule;
exports.createGenericGradientRule = createGenericGradientRule;
exports.createPlaceholderLabelRule = createPlaceholderLabelRule;
exports.createEmojiIconRule = createEmojiIconRule;
exports.createDesignValidatorRule = createDesignValidatorRule;
const HARDCODED_COLORS = [
    '#3B82F6',
    '#6366F1',
    '#8B5CF6',
    '#EC4899',
    '#EF4444',
    '#F59E0B',
    '#22C55E',
    '#14B8A6',
    '#06B6D4',
    '#0EA5E9',
    '#2563EB',
    '#7C3AED',
    '#DB2777',
    '#DC2626',
    '#D97706',
    '#16A34A',
    '#0D9488',
    '#0891B2',
    '#000000',
    '#FFFFFF',
    '#F3F4F6',
    '#E5E7EB',
];
const GENERIC_GRADIENTS = [
    /gradient\s*\(\s*#[0-9A-Fa-f]{6}\s*,\s*#[0-9A-Fa-f]{6}\s*\)/gi,
    /linear-gradient\s*\(\s*to\s+right\s*,\s*#[0-9A-Fa-f]{6}\s*,\s*#[0-9A-Fa-f]{6}\s*\)/gi,
    /from-((?:blue|indigo|purple|pink|red|orange|yellow|green|teal|cyan)-[0-9]{2,3})\s+to-((?:blue|indigo|purple|pink|red|orange|yellow|green|teal|cyan)-[0-9]{2,3})/gi,
];
const GENERIC_PLACEHOLDERS = [
    /placeholder=["']?(?:Digite|nome|email|senha|tipo|search|input|type here|enter)/gi,
];
function isRelevantLanguage(language) {
    return (language === 'html' ||
        language === 'css' ||
        language === 'typescript' ||
        language === 'javascript');
}
function createHardcodedColorRule(tokens) {
    const primary = tokens?.primary;
    return {
        id: 'DES-001',
        name: 'Hardcoded Color Detection',
        trigger: 'after_generation',
        severity: 'medium',
        description: 'Detecta cores hardcoded que não usam tokens de design',
        validate(context) {
            const { code, filePath, language } = context;
            if (!isRelevantLanguage(language)) {
                return {
                    ruleId: 'DES-001',
                    ruleName: 'Hardcoded Color Detection',
                    valid: true,
                    issues: [],
                };
            }
            const issues = [];
            if (primary) {
                const normalizedPrimary = primary.toUpperCase().replace('#', '');
                for (const color of HARDCODED_COLORS) {
                    const normalizedColor = color.toUpperCase().replace('#', '');
                    if (normalizedColor !== normalizedPrimary) {
                        const pattern = new RegExp(`["'#]${color}["']|background-color:\\s*${color}`, 'gi');
                        if (pattern.test(code)) {
                            issues.push({
                                code: 'DES-001',
                                message: `Cor hardcoded "${color}" detectada. Use tokens de design.`,
                                severity: 'medium',
                                file: filePath,
                            });
                        }
                    }
                }
            }
            return {
                ruleId: 'DES-001',
                ruleName: 'Hardcoded Color Detection',
                valid: issues.length === 0,
                issues,
            };
        },
        enforce(context, result) {
            if (result.valid)
                return null;
            return {
                fixed: false,
                suggestions: ['Use variáveis CSS ou tokens de design em vez de cores hardcoded'],
            };
        },
    };
}
function createGenericGradientRule() {
    return {
        id: 'DES-002',
        name: 'Generic Gradient Detection',
        trigger: 'after_generation',
        severity: 'low',
        description: 'Detecta gradientes genéricos que não seguem o DNA do projeto',
        validate(context) {
            const { code, filePath, language } = context;
            if (!isRelevantLanguage(language)) {
                return {
                    ruleId: 'DES-002',
                    ruleName: 'Generic Gradient Detection',
                    valid: true,
                    issues: [],
                };
            }
            const issues = [];
            for (const pattern of GENERIC_GRADIENTS) {
                pattern.lastIndex = 0;
                if (pattern.test(code)) {
                    issues.push({
                        code: 'DES-002',
                        message: 'Gradiente generico detectado. Use gradientes baseados no DNA do projeto.',
                        severity: 'low',
                        file: filePath,
                    });
                }
            }
            return {
                ruleId: 'DES-002',
                ruleName: 'Generic Gradient Detection',
                valid: issues.length === 0,
                issues,
            };
        },
        enforce(context, result) {
            if (result.valid)
                return null;
            return {
                fixed: false,
                suggestions: ['Defina gradientes no design tokens e referencie via variáveis'],
            };
        },
    };
}
function createPlaceholderLabelRule() {
    return {
        id: 'DES-003',
        name: 'Placeholder Without Label',
        trigger: 'after_generation',
        severity: 'medium',
        description: 'Detecta placeholders usados como único label sem elemento <label>',
        validate(context) {
            const { code, filePath, language } = context;
            if (!isRelevantLanguage(language)) {
                return {
                    ruleId: 'DES-003',
                    ruleName: 'Placeholder Without Label',
                    valid: true,
                    issues: [],
                };
            }
            const issues = [];
            for (const pattern of GENERIC_PLACEHOLDERS) {
                pattern.lastIndex = 0;
                if (pattern.test(code)) {
                    issues.push({
                        code: 'DES-003',
                        message: 'Placeholder usado como unico label. Adicione um <label> semantico.',
                        severity: 'medium',
                        file: filePath,
                    });
                }
            }
            return {
                ruleId: 'DES-003',
                ruleName: 'Placeholder Without Label',
                valid: issues.length === 0,
                issues,
            };
        },
        enforce(context, result) {
            if (result.valid)
                return null;
            return {
                fixed: false,
                suggestions: ['Adicione <label> associado ao input para acessibilidade'],
            };
        },
    };
}
function createEmojiIconRule() {
    return {
        id: 'DES-004',
        name: 'Emoji in Code Detection',
        trigger: 'after_generation',
        severity: 'low',
        description: 'Detecta emojis usados como ícones em código',
        validate(context) {
            const { code, filePath, language } = context;
            if (!isRelevantLanguage(language)) {
                return { ruleId: 'DES-004', ruleName: 'Emoji in Code Detection', valid: true, issues: [] };
            }
            const issues = [];
            const emojiRegex = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu;
            if (emojiRegex.test(code)) {
                issues.push({
                    code: 'DES-004',
                    message: 'Emoji detectado em codigo. Use bibliotecas de icones profissionais (Lucide, Heroicons).',
                    severity: 'low',
                    file: filePath,
                });
            }
            return {
                ruleId: 'DES-004',
                ruleName: 'Emoji in Code Detection',
                valid: issues.length === 0,
                issues,
            };
        },
        enforce(context, result) {
            if (result.valid)
                return null;
            return {
                fixed: false,
                suggestions: ['Use Lucide, Heroicons ou similar em vez de emojis'],
            };
        },
    };
}
function createDesignValidatorRule(tokens) {
    return createHardcodedColorRule(tokens);
}
const designRules = (tokens) => [
    createHardcodedColorRule(tokens),
    createGenericGradientRule(),
    createPlaceholderLabelRule(),
    createEmojiIconRule(),
];
exports.designRules = designRules;
//# sourceMappingURL=DesignRules.js.map