import {
	WorkspaceQuery,
	domainHotlistName,
	getBugUserEventDomains,
	getHotlistByDomain,
} from "@repository/buganizer-utils";
import { memoize } from "@repository/memoize";

function asciiProgress(num: number, total: number): string {
	const progress = Math.round((num / total) * 20);
	return `[${"=".repeat(progress)}${" ".repeat(20 - progress)}] ${Math.round((num / total) * 100)}%`;
}

function addBugsToDomainHotlists(query: string) {
	const bugs = new WorkspaceQuery(query)
		.search()
		.sort(() => Math.random() - 0.5)
		.slice(0, 100);

	const count = bugs.length;
	let i = 0;

	for (const bug of bugs) {
		Logger.log(`${asciiProgress(i, count)} Processing bug ${bug.getId()}`);
		const domains = new Set(getBugUserEventDomains([bug.getId()]));
		for (const domain of domains) {
			Logger.log({ ...memoizedAddBugToDomainHotlist(bug.getId(), domain) });

			bug
				.getDependsOn()
				.filter((dependency) => BuganizerApp.getBug(dependency).isOpen())
				.forEach((dependency) => {
					Logger.log({
						...memoizedAddBugToDomainHotlist(dependency, domain),
						blocks: bug.getId(),
					});

					// Add dependencies of dependencies
					BuganizerApp.getBug(dependency)
						.getDependsOn()
						.filter((dependency) => BuganizerApp.getBug(dependency).isOpen())
						.forEach((dependency2) => {
							Logger.log({
								...memoizedAddBugToDomainHotlist(dependency2, domain),
								blocks: bug.getId(),
							});
						});
				});

			const duplicate = bug.getDuplicateOf();
			if (duplicate && duplicate !== "0") {
				Logger.log({
					...memoizedAddBugToDomainHotlist(duplicate, domain),
					duplicates: bug.getId(),
				});
			}
		}
		i++;
	}
}

const memoizedGetHotlistByDomain = memoize(getHotlistByDomain, {
	ttl: 600,
	cache: CacheService.getScriptCache(),
	cacheUndefined: false,
});

const memoizedAddBugToDomainHotlist = memoize(addBugToDomainHotlist, {
	ttl: 600,
	cache: CacheService.getScriptCache(),
});

function addBugToDomainHotlist(
	bugId: string,
	domain: string,
): { bugId: string; domain: string; hotlistId: string; message: string } {
	if (!bugId || !domain || Number.isNaN(Number(bugId)) || Number(bugId) <= 0) {
		return {
			bugId,
			domain,
			hotlistId: "",
			message: `Invalid bugId or domain: ${bugId}, ${domain}`,
		};
	}

	let hotlistId = memoizedGetHotlistByDomain(domain);
	if (!hotlistId) {
		hotlistId = createDomainHotlist(domain);
		if (!hotlistId) {
			return {
				bugId,
				domain,
				hotlistId: "",
				message: `Failed to create hotlist for domain ${domain}`,
			};
		}
	}

	const bug = BuganizerApp.getBug(bugId);
	let message: string;

	if (bug.getHotlistIds().includes(hotlistId)) {
		message = `Bug ${bugId} is already in hotlist ${domain}`;
	} else {
		message = `Bug ${bugId} added to hotlist ${domain}`;
		bug.addToHotlist(hotlistId).save();
		Utilities.sleep(100);
	}

	return { message, bugId, domain, hotlistId };
}

function createDomainHotlist(domain: string): string | undefined {
	const name = domainHotlistName(domain);
	const description = `A hotlist for Workspace Public Developer Issues from ${domain}`;

	const hotlistId = getHotlistByDomain(domain);
	if (hotlistId) {
		return hotlistId;
	}

	try {
		LockService.getScriptLock().tryLock(10000);
		const hotlist = BuganizerApp.createHotlist(name, description);
		hotlist.flush();
		Logger.log(`Created hotlist ${name} ${hotlist.getId()}`);
		Utilities.sleep(5000);
		return hotlist.getId();
	} catch (e) {
		Logger.log(`Failed to create hotlist ${name}: ${e}`);
		return undefined;
	}
}

globalThis._addBugsToDomainHotlists = addBugsToDomainHotlists;
