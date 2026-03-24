import { parseArgs, getTemplateFlag, getConfigSubArgs } from './parser';

describe('parseArgs', () => {
  it('deve extrair command', () => {
    const result = parseArgs(['node', 'architect', 'run', 'file.ts']);
    expect(result.command).toBe('run');
  });

  it('deve extrair target para comando run', () => {
    const result = parseArgs(['node', 'architect', 'run', 'src/']);
    expect(result.target).toBe('src/');
  });

  it('deve detectar flag --json', () => {
    const result = parseArgs(['node', 'architect', 'run', 'file.ts', '--json']);
    expect(result.flags.json).toBe(true);
  });

  it('deve parsear flag --key=value', () => {
    const result = parseArgs(['node', 'architect', 'init', '--template=react']);
    expect(result.flags.template).toBe('react');
  });

  it('deve parsear flag --key value', () => {
    const result = parseArgs(['node', 'architect', 'init', '--template', 'vue']);
    expect(result.flags.template).toBe('vue');
  });

  it('deve retornar command undefined para argv vazio', () => {
    const result = parseArgs(['node', 'architect']);
    expect(result.command).toBeUndefined();
  });

  it('deve extrair subcommand', () => {
    const result = parseArgs(['node', 'architect', 'config', 'enable', 'SEC-001']);
    expect(result.command).toBe('config');
    expect(result.subcommand).toBe('enable');
  });
});

describe('getTemplateFlag', () => {
  it('deve extrair --template=valor', () => {
    expect(getTemplateFlag(['--template=react'])).toBe('react');
  });

  it('deve extrair --template valor', () => {
    expect(getTemplateFlag(['--template', 'vue'])).toBe('vue');
  });

  it('deve retornar default se não encontrado', () => {
    expect(getTemplateFlag([])).toBe('default');
    expect(getTemplateFlag(['--other'])).toBe('default');
  });
});

describe('getConfigSubArgs', () => {
  it('deve extrair enable', () => {
    const result = getConfigSubArgs(['config', 'enable', 'SEC-001']);
    expect(result.action).toBe('enable');
    expect(result.ruleId).toBe('SEC-001');
  });

  it('deve extrair disable', () => {
    const result = getConfigSubArgs(['config', 'disable', 'LOG-001']);
    expect(result.action).toBe('disable');
    expect(result.ruleId).toBe('LOG-001');
  });

  it('deve retornar vazio para config sem subcomando', () => {
    const result = getConfigSubArgs(['config']);
    expect(result.action).toBeUndefined();
    expect(result.ruleId).toBeUndefined();
  });
});
