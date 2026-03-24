import { readSourceFile, readConfig } from './adapters';
import { join } from 'path';
import { writeFileSync, mkdirSync, rmSync } from 'fs';

const testDir = join(__dirname, '../fixtures/adapters-test');

describe('adapters', () => {
  beforeEach(() => {
    try {
      rmSync(testDir, { recursive: true, force: true });
    } catch {
      /* ignore */
    }
    mkdirSync(testDir, { recursive: true });
  });

  afterEach(() => {
    try {
      rmSync(testDir, { recursive: true, force: true });
    } catch {
      /* ignore */
    }
  });

  describe('readSourceFile', () => {
    it('deve ler arquivo existente', () => {
      const filePath = join(testDir, 'test.ts');
      writeFileSync(filePath, 'const x = 1;');
      expect(readSourceFile(filePath)).toBe('const x = 1;');
    });

    it('deve retornar null para arquivo inexistente', () => {
      expect(readSourceFile(join(testDir, 'nope.ts'))).toBeNull();
    });
  });

  describe('readConfig', () => {
    it('deve ler config existente', () => {
      mkdirSync(join(testDir, '.architect'), { recursive: true });
      writeFileSync(join(testDir, '.architect', 'config.json'), '{"autoFix":true}');
      const config = readConfig(testDir);
      expect(config.autoFix).toBe(true);
    });

    it('deve retornar objeto vazio se config não existe', () => {
      const config = readConfig(testDir);
      expect(config).toEqual({});
    });

    it('deve retornar objeto vazio se JSON é inválido', () => {
      mkdirSync(join(testDir, '.architect'), { recursive: true });
      writeFileSync(join(testDir, '.architect', 'config.json'), 'not json');
      const config = readConfig(testDir);
      expect(config).toEqual({});
    });
  });
});
