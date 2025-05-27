const HOTLIST_NAME_PREFIX = "wp__";

export function getBugUserEvents(bugIds: string[] | string): string[] {
	if (!Array.isArray(bugIds)) {
		bugIds = [bugIds];
	}
	return BuganizerApp.getHistoryForBugIds(bugIds)
		.flatMap((h) =>
			h.getHistory().map((event) => event.getUserPerformingAction()),
		)
		.filter(Boolean);
}

export function getBugUserEventDomains(bugIds: string[] | string): string[] {
	return getBugUserEvents(bugIds)
		.filter(Boolean)
		.filter(filterWorkspaceDomain)
		.map((u) => u.split("@")[1]);
}

export function filterWorkspaceDomain(email: string): boolean {
	return !/@.*(google.com|gmail.com|hotmail.com|outlook.com|live.com)$/i.test(
		email,
	);
}

export function domainHotlistName(domain: string): string {
	return `${HOTLIST_NAME_PREFIX}${domain.replace(/[^a-zA-Z0-9_]/g, "_").toLowerCase()}`;
}

/**
 * 🚨 WARNING: searchHotlists() returns only 100 hotlists use searchHotlistExhaustive() 🚨
 */
export function getHotlistByDomain(domain: string): string | undefined {
	const name = domainHotlistName(domain);
	const hotlists = BuganizerApp.searchHotlists(
		`owner:jpoehnelt '${name}'`,
	).filter((h) => h.getName() === name);

	if (hotlists.length > 1) {
		console.error(hotlists.map((h) => [h.getId(), h.getName()]));
		throw new Error(`Multiple hotlists found for domain ${domain}`);
	}

	return hotlists[0]?.getId();
}
