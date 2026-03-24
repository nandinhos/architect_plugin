"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStagedDiff = getStagedDiff;
exports.getFileDiff = getFileDiff;
exports.readConfig = readConfig;
exports.writeConfig = writeConfig;
exports.readSourceFile = readSourceFile;
const child_process_1 = require("child_process");
const fs_1 = require("fs");
const path_1 = require("path");
function getStagedDiff() {
    try {
        return (0, child_process_1.execFileSync)('git', ['diff', '--cached', '--name-only'], { encoding: 'utf8' });
    }
    catch {
        return '';
    }
}
function getFileDiff(filename) {
    try {
        return (0, child_process_1.execFileSync)('git', ['diff', '--cached', 'HEAD', '--', filename], { encoding: 'utf8' });
    }
    catch {
        return '';
    }
}
function readConfig(projectDir = process.cwd()) {
    const configPath = (0, path_1.join)(projectDir, '.architect', 'config.json');
    if (!(0, fs_1.existsSync)(configPath))
        return {};
    try {
        return JSON.parse((0, fs_1.readFileSync)(configPath, 'utf8'));
    }
    catch {
        return {};
    }
}
function writeConfig(config, projectDir = process.cwd()) {
    const archDir = (0, path_1.join)(projectDir, '.architect');
    const configPath = (0, path_1.join)(archDir, 'config.json');
    if (!(0, fs_1.existsSync)(archDir)) {
        (0, fs_1.mkdirSync)(archDir, { recursive: true });
    }
    (0, fs_1.writeFileSync)(configPath, JSON.stringify(config, null, 2));
}
function readSourceFile(filePath) {
    try {
        return (0, fs_1.readFileSync)(filePath, 'utf8');
    }
    catch {
        return null;
    }
}
//# sourceMappingURL=adapters.js.map