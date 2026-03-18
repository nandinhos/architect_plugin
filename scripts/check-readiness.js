const { execSync } = require('child_process');

/**
 * Script de Verificação de Prontidão do Arquiteto
 * Versão: 1.0.0
 * Autor: Arquiteto Sinistro
 */

const REQUIRED_EXTENSIONS = ['superpowers', 'gemini-cli-security', 'code-review', 'conductor', 'context7'];
const COLORS = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m"
};

console.log(`${COLORS.bright}${COLORS.cyan}--- Verificação de Prontidão: Protocolo do Arquiteto ---${COLORS.reset}\n`);

function checkCommand(command, name) {
  try {
    execSync(command, { stdio: 'ignore' });
    console.log(`${COLORS.green}✅ ${name} detectado.${COLORS.reset}`);
    return true;
  } catch (e) {
    console.log(`${COLORS.red}❌ ${name} não encontrado.${COLORS.reset}`);
    return false;
  }
}

function checkExtensions() {
  try {
    const listRaw = execSync('gemini --list-extensions 2>&1', { encoding: 'utf8' });
    const list = listRaw.toLowerCase().replace(/[^a-z0-9]/g, '');
    let allOk = true;
    REQUIRED_EXTENSIONS.forEach(ext => {
      const normalizedExt = ext.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (list.includes(normalizedExt)) {
        console.log(`${COLORS.green}✅ Extensão "${ext}" instalada.${COLORS.reset}`);
      } else {
        console.log(`${COLORS.yellow}⚠️  Extensão "${ext}" AUSENTE.${COLORS.reset}`);
        allOk = false;
      }
    });
    return allOk;
  } catch (e) {
    console.log(`${COLORS.red}❌ Erro ao listar extensões do Gemini CLI.${COLORS.reset}`);
    return false;
  }
}

const nodeOk = checkCommand('node -v', 'Node.js');
const gitOk = checkCommand('git --version', 'Git');
const geminiOk = checkCommand('gemini --version', 'Gemini CLI');

console.log("");
const extensionsOk = geminiOk ? checkExtensions() : false;

console.log("\n--- Resultado Final ---");

if (nodeOk && gitOk && geminiOk && extensionsOk) {
  console.log(`${COLORS.bright}${COLORS.green}AMBIENTE PRONTO PARA O ARQUITETO SINISTRO! 🚀${COLORS.reset}`);
  console.log("Você pode prosseguir com o desenvolvimento sênior.");
} else {
  console.log(`${COLORS.bright}${COLORS.red}AMBIENTE NÃO ATENDE AOS PRÉ-REQUISITOS!${COLORS.reset}`);
  console.log("\nOrientações:");
  
  if (!geminiOk) {
    console.log("1. Instale o Gemini CLI: npm install -g @google/gemini-cli");
  }
  
  if (!extensionsOk) {
    console.log("2. Instale as extensões ausentes via Gemini CLI:");
    console.log("   gemini extensions install <url-do-github>");
    console.log("\nSugestão: Peça à sua IA para realizar as instalações pendentes.");
  }
  
  process.exit(1);
}
