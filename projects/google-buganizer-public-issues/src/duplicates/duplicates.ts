import {
	WORKSPACE_CUSTOM_FIELDS,
	WorkspaceQuery,
	getCustomField,
} from "@repository/buganizer-utils";
import { getTextEmbeddings, similarity } from "@repository/embeddings";
import { Digraph, Edge, Node, attribute, toDot } from "ts-graphviz";

function serializeBug(bug: GoogleAppsScript.Buganizer.Bug) {
	return `${bug.getSummary()} ${bug.getFirstNote()}`;
}

function findDuplicates() {
	const bugs = new WorkspaceQuery()
		.createdWithin(365 * 2)
		.minQuality(3)
		.isDeveloperIssue(true)
		.and(
			"(status:open | status:fixed | status:verified | status:intended_behavior)",
		)
		.search()
		.sort(
			(a, b) => a.getCreatedTime().getTime() - b.getCreatedTime().getTime(),
		);

	const embeddings = getTextEmbeddings(bugs.map((bug) => serializeBug(bug)));

	const graph = new Digraph();

	for (let i = 0; i < bugs.length; i++) {
		for (let j = i + 1; j < bugs.length; j++) {
			const score = similarity(embeddings[i], embeddings[j]);
			if (score > 0.8) {
				const a = bugs[i];
				const b = bugs[j];

				const [canonical, duplicate] = determineCanonical(a, b);

				if (!canonical || !duplicate) {
					continue;
				}

				const canonicalNode = new Node(canonical.getId(), {
					[attribute.label]: canonical.getId(),
				});
				const duplicateNode = new Node(duplicate.getId(), {
					[attribute.label]: duplicate.getId(),
				});

				const edge = new Edge([duplicateNode, canonicalNode], {
					[attribute.weight]: score,
				});

				graph.addNode(canonicalNode);
				graph.addNode(duplicateNode);
				graph.addEdge(edge);
			}
		}
	}

	console.log(toDot(graph));

	Drive.Files.create(
		{
			name: "graph.dot",
			mimeType: "text/plain",
		},
		Utilities.newBlob(toDot(graph)),
	);
}

function determineCanonical(
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
	if (
		Math.abs(a.getCreatedTime().getTime() - b.getCreatedTime().getTime()) >
		1000 * 60 * 60 * 24 * 5
	) {
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

function recentlyCommentedBugs_() {
	const request = {
		queryRequest: {
			query: {
				text: `SELECT
				  t.issue_id as issue_id,
				  MAX(comments.modified) AS last_comment,
				FROM
				  buganizer.issuehistories.live AS t,
				  UNNEST(t.comments) AS comments
				LEFT JOIN buganizer.issuestatsfresh.live AS b
				  ON t.issue_id = b.issue_id
				LEFT JOIN buganizer.componentsfresh.live AS c
				  ON b.component_id = CAST(c.component_id AS INT64)
				WHERE
				  EXISTS(SELECT 1 FROM UNNEST(c.component_id_path) p WHERE p = "191625")
				  AND comments.modified > UNIX_MICROS(TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 7 DAY))
				  AND comments.user.user_type = 'PUBLIC'
				  AND t.is_archived = FALSE
				  AND t.is_restricted = FALSE
				GROUP BY t.issue_id
				ORDER BY last_comment
				LIMIT 5              
				`,
				engine: "F1",
			},
			parameters: {},
		},
	};

	// @ts-ignore
	let projection = Plx.Projections.create(request);
	while (projection.state !== "done") {
		Utilities.sleep(100);
		projection = getProjection_(projection);
	}

	return Utilities.parseCsv(projection.data)
		.slice(1)
		.map((values) => ({
			issueId: values[0],
			lastComment: values[1],
		}));
}

function getProjection_(projection: Projection): Projection {
	// @ts-ignore
	return Plx.Projections.get(projection.id, { token: projection.token });
}

globalThis._findDuplicates = findDuplicates;

interface Projection {
	state: string;
	data: string;
	token: string;
	id: string;
}
