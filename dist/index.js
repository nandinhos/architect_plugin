"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ANTI_PATTERNS = exports.PRINCIPLES = exports.PALETTE = exports.DNA = exports.PROJECT_NAME = exports.PROTOCOL_VERSION = exports.DESIGN_TOKENS = exports.ArchitectDashboard = void 0;
var ArchitectDashboard_1 = require("./components/ArchitectDashboard");
Object.defineProperty(exports, "ArchitectDashboard", { enumerable: true, get: function () { return ArchitectDashboard_1.ArchitectDashboard; } });
const tokens_json_1 = __importDefault(require("../.architect/design/tokens.json"));
exports.DESIGN_TOKENS = tokens_json_1.default;
exports.PROTOCOL_VERSION = tokens_json_1.default.version;
exports.PROJECT_NAME = tokens_json_1.default.project;
exports.DNA = tokens_json_1.default.dna;
exports.PALETTE = tokens_json_1.default.palette_extended;
exports.PRINCIPLES = tokens_json_1.default.principles;
exports.ANTI_PATTERNS = tokens_json_1.default.anti_patterns;
//# sourceMappingURL=index.js.map