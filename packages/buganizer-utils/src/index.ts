export * from "./query.js";
export * from "./users.js";
export * from "./access.js";
export * from "./custom-fields.js";

export function getComments(id: string): { user: string; comment: string }[] {
	return BuganizerApp.getHistoryForBugIds([id])[0]
		.getHistory()
		.filter((event) => event.getAddedNotes().length)
		.flatMap((event) =>
			event.getAddedNotes().map((comment) => ({
				user: event.getUserPerformingAction(),
				comment,
				modified: event.getModifiedTime(),
			})),
		);
}
