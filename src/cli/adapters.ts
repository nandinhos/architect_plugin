import { execFileSync } from 'child_process';
import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

export function getStagedDiff(): string {
  try {
    return execFileSync('git', ['diff', '--cached', '--name-only'], { encoding: 'utf8' });
  } catch {
    return '';
  }
}

export function getFileDiff(filename: string): string {
  try {
    return execFileSync('git', ['diff', '--cached', 'HEAD', '--', filename], { encoding: 'utf8' });
  } catch {
    return '';
  }
}

export function readConfig(projectDir: string = process.cwd()): Record<string, unknown> {
  const configPath = join(projectDir, '.architect', 'config.json');
  if (!existsSync(configPath)) return {};

  try {
    return JSON.parse(readFileSync(configPath, 'utf8'));
  } catch {
    return {};
  }
}

export function writeConfig(
  config: Record<string, unknown>,
  projectDir: string = process.cwd()
): void {
  const archDir = join(projectDir, '.architect');
  const configPath = join(archDir, 'config.json');

  if (!existsSync(archDir)) {
    mkdirSync(archDir, { recursive: true });
  }

  writeFileSync(configPath, JSON.stringify(config, null, 2));
}

export function readSourceFile(filePath: string): string | null {
  try {
    return readFileSync(filePath, 'utf8');
  } catch {
    return null;
  }
}
