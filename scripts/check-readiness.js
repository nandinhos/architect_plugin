const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Script de Verificação de Prontidão do Arquiteto
 * Versão: 1.1.0
 */

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

function checkProtocolFiles() {
  const essentialPaths = [
    '.architect/design/tokens.json',
    '.architect/skills/senior-engineer.md',
    '.architect/security/rules.md',
    'ARCHITECT.md'
  ];

  let allOk = true;
  essentialPaths.forEach(p => {
    if (fs.existsSync(p)) {
      console.log(`${COLORS.green}✅ Arquivo do protocolo encontrado: ${p}${COLORS.reset}`);
    } else {
      console.log(`${COLORS.red}❌ Arquivo do protocolo AUSENTE: ${p}${COLORS.reset}`);
      allOk = false;
    }
  });
  return allOk;
}

const nodeOk = checkCommand('node -v', 'Node.js');
const gitOk = checkCommand('git --version', 'Git');
const jestOk = fs.existsSync('node_modules') ? checkCommand('npm test -- --version', 'Jest') : true;

console.log("");
const protocolOk = checkProtocolFiles();

console.log("\n--- Resultado Final ---");

if (nodeOk && gitOk && protocolOk) {
  console.log(`${COLORS.bright}${COLORS.green}AMBIENTE PRONTO PARA O ARQUITETO SINISTRO! 🚀${COLORS.reset}`);
  console.log("Você pode prosseguir com o desenvolvimento sênior.");
} else {
  console.log(`${COLORS.bright}${COLORS.red}AMBIENTE NÃO ATENDE AOS PRÉ-REQUISITOS!${COLORS.reset}`);
  process.exit(1);
}
