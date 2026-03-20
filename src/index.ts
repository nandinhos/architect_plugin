export {
  ArchitectDashboard,
  type DesignTokens,
  type ArchitectStatus,
} from './components/ArchitectDashboard';

import tokens from '../.architect/design/tokens.json';

export const DESIGN_TOKENS = tokens;

export const PROTOCOL_VERSION = tokens.version;
export const PROJECT_NAME = tokens.project;
export const DNA = tokens.dna;
export const PALETTE = tokens.palette_extended;
export const PRINCIPLES = tokens.principles;
export const ANTI_PATTERNS = tokens.anti_patterns;
