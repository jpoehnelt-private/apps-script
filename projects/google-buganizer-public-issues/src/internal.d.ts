import type { EscalateOptions } from "./escalate.js";

declare global {
  var _addBugsToDomainHotlists: (query: string) => void;
  var _escalateBugs: (options: EscalateOptions) => void;
  var DEBUG: boolean|undefined;
}

export {};
