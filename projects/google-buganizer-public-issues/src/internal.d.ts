import type { EscalateOptions } from "./escalate.js";

declare global {
	var _addBugsToDomainHotlists: (query: string) => void;
	var _escalateBugs: (options: EscalateOptions) => void;
	var DEBUG: boolean | undefined;
	var _findDuplicates: () => void;
	var PROJECT_ID: string;
	var _updateEmbeddings: () => void;
}

// biome-ignore lint/complexity/noUselessEmptyExport: <explanation>
export {};
