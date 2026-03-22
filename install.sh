#!/bin/sh
# ============================================================
# Architect Engine — One-Line Installer
# Uso: curl -fsSL https://raw.githubusercontent.com/nandinhos/architect_plugin/main/install.sh | sh
# ============================================================
set -e

ARCH_REPO="https://github.com/nandinhos/architect_plugin.git"
INSTALL_DIR="${HOME}/.architectai"
ARCH_BIN="${INSTALL_DIR}/bin/architect"

echo ""
echo "  🏗️  Architect Engine — Instalação"
echo "  ======================================="
echo ""

# Detect if already installed
if [ -f "${ARCH_BIN}" ]; then
  echo "  ✅ Architect Engine já está instalado."
  echo "     ${ARCH_BIN}"
  echo ""
  echo "  Para atualizar: rm -rf ${INSTALL_DIR} && curl -fsSL ... | sh"
  echo ""
  exit 0
fi

# Check prerequisites
if ! command -v git >/dev/null 2>&1; then
  echo "  ❌ Git não encontrado. Instale git primeiro."
  echo "     https://git-scm.com"
  exit 1
fi

if ! command -v node >/dev/null 2>&1; then
  echo "  ❌ Node.js não encontrado. Instale Node.js primeiro."
  echo "     https://nodejs.org"
  exit 1
fi

echo "  📦 Baixando Architect Engine..."

# Clone into temp dir
TEMP_DIR=$(mktemp -d)
git clone --depth 1 "${ARCH_REPO}" "${TEMP_DIR}/architect_plugin" 2>/dev/null || {
  echo "  ❌ Falha ao clonar repositório."
  exit 1
}

echo "  ⚙️  Build..."

cd "${TEMP_DIR}/architect_plugin"
npm install || { echo "  ❌ Falha ao instalar dependências."; rm -rf "${TEMP_DIR}"; exit 1; }
npm run build || { echo "  ❌ Falha ao compilar."; rm -rf "${TEMP_DIR}"; exit 1; }

# Verify dist exists
if [ ! -d "${TEMP_DIR}/architect_plugin/dist" ]; then
  echo "  ❌ Pasta dist não encontrada após build."
  rm -rf "${TEMP_DIR}"
  exit 1
fi

# Install
echo "  📁 Instalando em ${INSTALL_DIR}..."
mkdir -p "${INSTALL_DIR}/bin"
mkdir -p "${INSTALL_DIR}/lib"

cp -r "${TEMP_DIR}/architect_plugin/dist" "${INSTALL_DIR}/lib/dist"
cp "${TEMP_DIR}/architect_plugin/bin/architect.js" "${ARCH_BIN}"
chmod +x "${ARCH_BIN}"

# Cleanup
rm -rf "${TEMP_DIR}"

# Add to PATH hint
SHELL_RC="${HOME}/.zshrc"
if [ -n "$ZSH_VERSION" ]; then
  SHELL_RC="${HOME}/.zshrc"
elif [ -n "$BASH_VERSION" ]; then
  SHELL_RC="${HOME}/.bashrc"
else
  SHELL_RC="${HOME}/.profile"
fi

ARCH_BIN_DIR="${HOME}/.architectai/bin"
PATH_LINE="export PATH=\"\${PATH}:${ARCH_BIN_DIR}\""

if ! grep -qF "${ARCH_BIN_DIR}" "${SHELL_RC}" 2>/dev/null; then
  echo "" >> "${SHELL_RC}"
  echo "# Architect Engine" >> "${SHELL_RC}"
  echo "${PATH_LINE}" >> "${SHELL_RC}"
fi

echo ""
echo "  ✅ Instalação concluída!"
echo ""
echo "  Executável: ${ARCH_BIN}"
echo ""
echo "  Adicione ao PATH:"
echo "    echo 'export PATH=\"\${PATH}:${ARCH_BIN_DIR}\"' >> ~/.zshrc"
echo "    source ~/.zshrc"
echo ""
echo "  Uso:"
echo "    architect init           # Inicializar no projeto atual"
echo "    architect run <file>    # Analisar arquivo"
echo "    architect rules         # Listar regras"
echo ""
echo "  🏗️  Pronto. O Arquiteto Sinistro está ativo."
echo ""
