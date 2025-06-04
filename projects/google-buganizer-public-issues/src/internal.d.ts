import type { EscalateOptions } from "./escalate.js";

declare global {
	var _addBugsToDomainHotlists: (query: string) => void;
	var _automaticallyCheckIfDuplicate: () => void;
	var _escalateBugs: (options: EscalateOptions) => void;
	var _updateEmbeddings: () => void;
	var DEBUG: boolean | undefined;
	var PROJECT_ID: string;
}

// biome-ignore lint/complexity/noUselessEmptyExport: <explanation>
export {};
