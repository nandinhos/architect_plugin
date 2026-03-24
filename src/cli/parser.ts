export interface ParsedArgs {
  command: string | undefined;
  subcommand: string | undefined;
  target: string | undefined;
  flags: Record<string, string | boolean>;
}

export function parseArgs(argv: string[]): ParsedArgs {
  const args = argv.slice(2);
  const command = args[0];
  const subcommand = args[1] && !args[1].startsWith('-') ? args[1] : undefined;
  const target = command === 'run' && subcommand ? subcommand : undefined;

  const flags: Record<string, string | boolean> = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--json') {
      flags.json = true;
    } else if (arg.startsWith('--')) {
      const eqIndex = arg.indexOf('=');
      if (eqIndex !== -1) {
        const key = arg.slice(2, eqIndex);
        const value = arg.slice(eqIndex + 1);
        flags[key] = value;
      } else if (args[i + 1] && !args[i + 1].startsWith('-')) {
        flags[arg.slice(2)] = args[i + 1];
        i++;
      } else {
        flags[arg.slice(2)] = true;
      }
    }
  }

  return { command, subcommand, target, flags };
}

export function getTemplateFlag(args: string[]): string {
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--template' && args[i + 1]) {
      return args[i + 1];
    }
    if (args[i].startsWith('--template=')) {
      return args[i].split('=')[1];
    }
  }
  return 'default';
}

export function getConfigSubArgs(args: string[]): { action?: string; ruleId?: string } {
  const subArgs = args.slice(1);
  if (subArgs.length === 0) return {};
  if (subArgs[0] === 'enable' && subArgs[1]) return { action: 'enable', ruleId: subArgs[1] };
  if (subArgs[0] === 'disable' && subArgs[1]) return { action: 'disable', ruleId: subArgs[1] };
  return { action: subArgs[0] };
}
