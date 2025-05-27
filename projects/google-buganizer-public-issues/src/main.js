globalThis.DEBUG = true;

function automaticallyAddBugsToDomainHotlists() {
	globalThis._addBugsToDomainHotlists("created:10d status:open");
	globalThis._addBugsToDomainHotlists(
		"(status:open | status:duplicate) thirtydayviewcount>1",
	);
}

function automaticallyEscalateBugs() {
	globalThis._escalateBugs({
		minQuality: 6,
		minVotes: 10,
		createdWithin: 7,
	});
}

function automaticallyFindDuplicates() {
	globalThis._findDuplicates();
}

function automaticallyUpdateEmbeddings() {
	globalThis._updateEmbeddings();
}
