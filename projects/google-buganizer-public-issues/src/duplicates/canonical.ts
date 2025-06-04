import {
	WORKSPACE_CUSTOM_FIELDS,
	getCustomField,
	isPublicWorkspaceDeveloperIssue,
} from "@repository/buganizer-utils";

export function determineCanonical(
	a: GoogleAppsScript.Buganizer.Bug,
	b: GoogleAppsScript.Buganizer.Bug,
):
	| [GoogleAppsScript.Buganizer.Bug, GoogleAppsScript.Buganizer.Bug]
	| [undefined, undefined] {
	if (a.getDuplicateOf() === b.getId()) {
		return [b, a];
	}
	if (b.getDuplicateOf() === a.getId()) {
		return [a, b];
	}

	if (!a.isOpen() && !b.isOpen()) {
		Logger.log(`b/${a.getId()} and b/${b.getId()} are both closed`);
		return [undefined, undefined];
	}

	if (
		isPublicWorkspaceDeveloperIssue(a) &&
		!isPublicWorkspaceDeveloperIssue(b)
	) {
		return [a, b];
	}

	if (
		!isPublicWorkspaceDeveloperIssue(a) &&
		isPublicWorkspaceDeveloperIssue(b)
	) {
		return [b, a];
	}

	if (
		!isPublicWorkspaceDeveloperIssue(a) &&
		!isPublicWorkspaceDeveloperIssue(b)
	) {
		Logger.log(
			`b/${a.getId()} and b/${b.getId()} are both not public workspace developer issues`,
		);
		return [undefined, undefined];
	}

	// check if either is blocked by another bug
	if (a.getBlocking().length > 0 || b.getBlocking().length > 0) {
		if (a.getBlocking().includes(b.getId())) {
			Logger.log(`b/${a.getId()} is blocked by b/${b.getId()}`);
			return [undefined, undefined];
		}
		if (b.getBlocking().includes(a.getId())) {
			Logger.log(`b/${b.getId()} is blocked by b/${a.getId()}`);
			return [undefined, undefined];
		}

		// if one has no blockers, the other one is the canonical
		if (a.getBlocking().length === 0) {
			return [b, a];
		}

		// if one has no blockers, the other one is the canonical
		if (b.getBlocking().length === 0) {
			return [a, b];
		}

		// if blocks are not equal, return undefined
		if (!areSetsEqual(new Set(a.getBlocking()), new Set(b.getBlocking()))) {
			Logger.log(`b/${a.getId()} has different blockers than b/${b.getId()}`);
			return [undefined, undefined];
		}
	}

	// check delta of me too count
	if (Math.abs(a.getMeTooCount() - b.getMeTooCount()) > 5) {
		if (a.getMeTooCount() > b.getMeTooCount()) {
			return [a, b];
		}
		return [b, a];
	}

	// check delta of created time
	const delta = Math.abs(
		a.getCreatedTime().getTime() - b.getCreatedTime().getTime(),
	);

	// if more than 2 years apart, return undefined
	if (delta > 1000 * 60 * 60 * 24 * 365 * 2) {
		Logger.log(`b/${a.getId()} and b/${b.getId()} are more than 2 years apart`);
		return [undefined, undefined];
	}

	// if more than 5 days apart, return the older one
	if (delta > 1000 * 60 * 60 * 24 * 5) {
		if (a.getCreatedTime().getTime() < b.getCreatedTime().getTime()) {
			return [a, b];
		}
		return [b, a];
	}

	// sort by custom field quality score
	const qualityScoreA =
		getCustomField(a, WORKSPACE_CUSTOM_FIELDS.qualityScore) ?? 0;
	const qualityScoreB =
		getCustomField(b, WORKSPACE_CUSTOM_FIELDS.qualityScore) ?? 0;
	if (qualityScoreA > qualityScoreB) {
		return [a, b];
	}
	if (qualityScoreA < qualityScoreB) {
		return [b, a];
	}

	return [a, b];
}

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
function areSetsEqual(a: Set<any>, b: Set<any>): boolean {
	return a.size === b.size && [...a].every((value) => b.has(value));
}
