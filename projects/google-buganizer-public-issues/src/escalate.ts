import {
	WORKSPACE_CUSTOM_FIELDS,
	WorkspaceQuery,
	getCustomField,
	setCustomField,
} from "@repository/buganizer-utils";

export interface EscalateOptions {
	minQuality: number;
	minVotes: number;
	createdWithin: number;
}

/**
 * Escalates bugs that have met the minimum quality and votes criteria
 */
function escalateBugs(options: EscalateOptions) {
	const bugs = new WorkspaceQuery()
		.minQuality(options.minQuality)
		.minVotes(options.minVotes)
		.createdWithin(options.createdWithin)
		.isState("processed")
		.isOpen()
		.isBug()
		.isDeveloperIssue(true)
		.search();

	for (const bug of bugs) {
		const votes = bug.getMeTooCount();
		const quality = getCustomField(
			bug,
			WORKSPACE_CUSTOM_FIELDS.qualityScore,
		)?.getValue();
		if (globalThis.DEBUG) {
			Logger.log({
				message: `Escalating bug ${bug.getId()} ${votes} votes, ${quality} quality`,
				votes,
				quality,
				minVotes: options.minVotes,
				minQuality: options.minQuality,
			});
		}
		setCustomField(bug, WORKSPACE_CUSTOM_FIELDS.status, "triaged");
	}
}

globalThis._escalateBugs = escalateBugs;
