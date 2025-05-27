import { beforeEach, describe, expect, it, vi } from "vitest";
import { BuganizerQuery, WorkspaceQuery } from "./query.js";

// Mock the global BuganizerApp using type assertions to avoid TypeScript errors
(globalThis as any).BuganizerApp = {
	searchBugs: vi.fn(),
} as unknown as GoogleAppsScript.Buganizer.BuganizerApp;

describe("BuganizerQuery", () => {
	let query: BuganizerQuery;

	beforeEach(() => {
		query = new BuganizerQuery("foo:bar");
		vi.resetAllMocks();
	});

	describe("constructor", () => {
		it("should initialize with the provided query string", () => {
			expect(query.toString()).toBe("foo:bar");
		});
	});

	describe("and", () => {
		it("should add AND condition with string", () => {
			const q = query.and("condition");
			expect(q.toString()).toBe("foo:bar condition");
		});

		it("should add AND condition with another BuganizerQuery", () => {
			const otherQuery = new BuganizerQuery("other:2");
			const q = query.and(otherQuery);
			expect(q.toString()).toBe("foo:bar other:2");
		});
	});

	describe("not", () => {
		it("should add NOT condition with string", () => {
			const q = query.not("condition:2");
			expect(q.toString()).toBe("foo:bar -condition:2");
		});

		it("should add NOT condition with another BuganizerQuery", () => {
			const otherQuery = new BuganizerQuery("other:2");
			const q = query.not(otherQuery);
			expect(q.toString()).toBe("foo:bar -other:2");
		});
	});

	describe("or", () => {
		it("should add OR condition with string", () => {
			const q = query.or("condition");
			expect(q.toString()).toBe("(foo:bar | condition)");
		});

		it("should add OR condition with another BuganizerQuery", () => {
			const otherQuery = new BuganizerQuery("other:2");
			const q = query.or(otherQuery);
			expect(q.toString()).toBe("(foo:bar | other:2)");
		});
	});

	describe("comparison operators", () => {
		it("gte should add greater than or equal condition", () => {
			const q = query.gte("field", 5);
			expect(q.toString()).toBe("foo:bar field>=5");
		});

		it("gt should add greater than condition", () => {
			const q = query.gt("field", 5);
			expect(q.toString()).toBe("foo:bar field>5");
		});

		it("lte should add less than or equal condition", () => {
			const q = query.lte("field", 5);
			expect(q.toString()).toBe("foo:bar field<=5");
		});

		it("lt should add less than condition", () => {
			const q = query.lt("field", 5);
			expect(q.toString()).toBe("foo:bar field<5");
		});

		it("eq should add equals condition with number", () => {
			const q = query.eq("field", 5);
			expect(q.toString()).toBe("foo:bar field:5");
		});

		it("eq should add equals condition with string", () => {
			const q = query.eq("field", "value");
			expect(q.toString()).toBe("foo:bar field:value");
		});

		it("neq should add not equals condition", () => {
			const q = query.neq("field", "value");
			expect(q.toString()).toBe("foo:bar -field:value");
		});
	});

	describe("type helpers", () => {
		it("isFeatureRequest should add equals condition with feature request", () => {
			const q = query.isFeatureRequest();
			expect(q.toString()).toBe("foo:bar type:feature_request");
		});

		it("isBug should add equals condition with bug", () => {
			const q = query.isBug();
			expect(q.toString()).toBe("foo:bar type:bug");
		});
	});

	describe("component", () => {
		it("should add component condition", () => {
			const q = query.isComponent("1234");
			expect(q.toString()).toBe("foo:bar componentid:1234");
		});

		it("should add component condition recursive", () => {
			const q = query.isComponent("1234", true);
			expect(q.toString()).toBe("foo:bar componentid:1234+");
		});
	});

	describe("method chaining", () => {
		it("should support method chaining", () => {
			const q = query
				.and("condition:1")
				.not("condition:2")
				.eq("field", "value");
			expect(q.toString()).toBe("foo:bar condition:1 -condition:2 field:value");
		});

		it("should not modify original query", () => {
			query.and("condition:1").not("condition:2").eq("field", "value");
			expect(query.toString()).toBe("foo:bar");
		});
	});

	describe("static search", () => {
		it("should call BuganizerApp.searchBugs with the query string", () => {
			const mockBugs = [
				{ getMeTooCount: () => 5 },
				{ getMeTooCount: () => 10 },
			] as unknown as GoogleAppsScript.Buganizer.Bug[];
			(
				(globalThis as any).BuganizerApp.searchBugs as ReturnType<typeof vi.fn>
			).mockReturnValue(mockBugs);

			const result = BuganizerQuery.search("foo:bar");

			expect((globalThis as any).BuganizerApp.searchBugs).toHaveBeenCalledWith(
				"foo:bar",
			);
			expect(result.length).toBe(2);
		});
	});

	describe("link", () => {
		it("should return the correct link", () => {
			const q = new BuganizerQuery("foo:bar");
			expect(q.link()).toBe(
				"https://issuetracker.google.com/issues?q=foo%3Abar",
			);
		});
		it("should return the correct link static", () => {
			expect(BuganizerQuery.link("foo:bar")).toBe(
				"https://issuetracker.google.com/issues?q=foo%3Abar",
			);
		});

		it("should return the correct short link", () => {
			const q = new BuganizerQuery("foo:bar");
			expect(q.b()).toBe("http://b/?q=foo%3Abar");
		});

		it("should return the correct short link static", () => {
			expect(BuganizerQuery.b("foo:bar")).toBe("http://b/?q=foo%3Abar");
		});
	});

	describe("createdWithin", () => {
		it("should add created within condition", () => {
			const q = new BuganizerQuery("foo:bar").createdWithin(7);
			expect(q.toString()).toBe("foo:bar created:7d");
		});
	});

	describe("modifiedWithin", () => {
		it("should add modified within condition", () => {
			const q = new BuganizerQuery("foo:bar").modifiedWithin(7);
			expect(q.toString()).toBe("foo:bar modified:7d");
		});
	});
});

describe("WorkspaceQuery", () => {
	let query: WorkspaceQuery;

	beforeEach(() => {
		query = new WorkspaceQuery("foo:bar");
		vi.resetAllMocks();
	});

	describe("constructor", () => {
		it("should initialize with the workspace component ID and provided query", () => {
			expect(query.toString()).toBe("componentid:191625+ foo:bar");
		});
	});

	describe("minQuality", () => {
		it("should add minimum quality condition", () => {
			const q = query.minQuality(5);
			expect(q.toString()).toBe(
				"componentid:191625+ foo:bar customfield1388853>=5",
			);
		});
	});

	describe("maxQuality", () => {
		it("should add maximum quality condition", () => {
			const q = query.maxQuality(8);
			expect(q.toString()).toBe(
				"componentid:191625+ foo:bar customfield1388853<=8",
			);
		});
	});

	describe("notClassroom", () => {
		it("should exclude classroom component", () => {
			const q = query.notClassroom();
			expect(q.toString()).toBe(
				"componentid:191625+ foo:bar -componentid:191645",
			);
		});
	});

	describe("isDeveloperIssue", () => {
		it("should add developer issue condition when true", () => {
			const q = query.isDeveloperIssue(true);
			expect(q.toString()).toBe(
				"componentid:191625+ foo:bar customfield1388852:1",
			);
		});

		it("should add developer issue condition when false", () => {
			const q = query.isDeveloperIssue(false);
			expect(q.toString()).toBe(
				"componentid:191625+ foo:bar customfield1388852:0",
			);
		});
	});

	describe("isEnglish", () => {
		it("should add English language condition", () => {
			const q = query.isEnglish(true);
			expect(q.toString()).toBe(
				"componentid:191625+ foo:bar customfield1388884:1",
			);
		});
	});

	describe("tag related methods", () => {
		it("isTaggedWith should add tag condition", () => {
			const q = query.isTaggedWith("javascript");
			expect(q.toString()).toBe(
				"componentid:191625+ foo:bar customfield1172495:javascript",
			);
		});

		it("isTaggedWithAny should add OR condition for tags", () => {
			const q = query.isTaggedWithAny(["javascript", "typescript"]);
			expect(q.toString()).toBe(
				"componentid:191625+ foo:bar customfield1172495:(javascript | typescript)",
			);
		});

		it("isTaggedWithAll should add AND condition for tags", () => {
			const q = query.isTaggedWithAll(["javascript", "typescript"]);
			expect(q.toString()).toBe(
				"componentid:191625+ foo:bar customfield1172495:(javascript typescript)",
			);
		});

		it("isTaggedWithNone should add NOT condition for tags", () => {
			const q = query.isTaggedWithNone(["javascript", "typescript"]);
			expect(q.toString()).toBe(
				"componentid:191625+ foo:bar -customfield1172495:(javascript | typescript)",
			);
		});
	});

	describe("method chaining", () => {
		it("should support method chaining", () => {
			const q = query
				.minQuality(5)
				.maxQuality(10)
				.notClassroom()
				.isDeveloperIssue(true);
			expect(q.toString()).toBe(
				"componentid:191625+ foo:bar customfield1388853>=5 customfield1388853<=10 -componentid:191645 customfield1388852:1",
			);
		});

		it("should not modify original query", () => {
			query.minQuality(5).maxQuality(10).notClassroom().isDeveloperIssue(true);
			expect(query.toString()).toBe("componentid:191625+ foo:bar");
		});
	});

	describe("isActionable", () => {
		it("should add actionable condition", () => {
			const q = query.isActionable(true);
			expect(q.toString()).toBe(
				"componentid:191625+ foo:bar customfield1388909:1",
			);
		});

		it("should add non-actionable condition", () => {
			const q = query.isActionable(false);
			expect(q.toString()).toBe(
				"componentid:191625+ foo:bar customfield1388909:0",
			);
		});
	});
});
