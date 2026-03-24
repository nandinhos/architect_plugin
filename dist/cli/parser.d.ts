export interface ParsedArgs {
    command: string | undefined;
    subcommand: string | undefined;
    target: string | undefined;
    flags: Record<string, string | boolean>;
}
export declare function parseArgs(argv: string[]): ParsedArgs;
export declare function getTemplateFlag(args: string[]): string;
export declare function getConfigSubArgs(args: string[]): {
    action?: string;
    ruleId?: string;
};
//# sourceMappingURL=parser.d.ts.map