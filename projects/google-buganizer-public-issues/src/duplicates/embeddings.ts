import { WorkspaceQuery, getComments } from "@repository/buganizer-utils";
import { getTextEmbeddings } from "@repository/embeddings";
import { subDays } from "date-fns";
import { chunk } from "lodash-es";
import { z } from "zod";

const DATASET_ID = "workspace_devrel_public_issues";
const TABLE_ID = "embeddings";
const PROJECT_ID =
	PropertiesService.getScriptProperties().getProperty("PROJECT_ID") ?? "";

const BigQuery: Required<GoogleAppsScript.BigQuery> =
	globalThis.BigQuery as Required<GoogleAppsScript.BigQuery>;

if (!BigQuery) {
	throw new Error("BigQuery service not found");
}

if (!PROJECT_ID) {
	throw new Error("Script property PROJECT_ID not found");
}

export const embeddingsSchema = z.object({
	id: z.coerce.string(),
	insertedAt: z.coerce.number(),
	lastComment: z.coerce.number(),
	embeddings: z.array(z.coerce.number()),
	componentId: z.string(),
	componentPath: z.string(),
	type: z.string(),
	status: z.string(),
});

export type EmbeddingsSchema = z.infer<typeof embeddingsSchema>;

function updateEmbeddings() {
	const recentlyInserted = getEmbeddings({
		where: `insertedAt > TIMESTAMP("${subDays(new Date(), 7).toISOString()}") OR status is NULL`,
	});

	const recentlyInsertedIds = new Set(recentlyInserted.map((r) => r.id));

	const bugs = new WorkspaceQuery()
		.modifiedWithin(1)
		.search()
		.filter((bug) => !recentlyInsertedIds.has(bug.getId()));

	Logger.log(`Filtered to ${bugs.length} bugs`);

	const chunks = chunk(bugs, 50);

	for (const bugs of chunks) {
		const content = bugs.map(
			(bug) =>
				`${bug.getSummary()}${getComments(bug.getId())
					.map((c) => c.comment)
					.join("\n")}`,
		);

		const embeddings = getTextEmbeddings(content);

		const rows: EmbeddingsSchema[] = bugs.map((bug, i) => ({
			id: bug.getId(),
			insertedAt: new Date().getTime() / 1000,
			lastComment: 0,
			embeddings: embeddings[i],
			componentId: String(bug.getComponentId()),
			componentPath: bug.getComponentPath().join("/"),
			type: bug.getType(),
			status: bug.getStatus(),
		}));

		insertEmbeddings(rows);
	}
	// const lock = LockService.getScriptLock();
	// try {
	// 	lock.waitLock(30 * 1000);
	// } catch (e) {
	// 	Logger.log("Lock not acquired");
	// 	return;
	// }

	// Logger.log("Lock acquired");

	// try {
	// 	const EMBEDDINGS_LAST_MICROS = "EMBEDDINGS_LAST_MICROS";
	// 	const lastMicros = Number(
	// 		PropertiesService.getScriptProperties().getProperty(
	// 			EMBEDDINGS_LAST_MICROS,
	// 		) ?? 0,
	// 	);

	// 	const issueComments = recentlyCommentedBugs_({
	// 		last: lastMicros,
	// 		limit: Number(
	// 			PropertiesService.getScriptProperties().getProperty(
	// 				"EMBEDDINGS_PLX_LIMIT",
	// 			) ?? 100,
	// 		),
	// 	}).map(({ issueId, lastComment }) => {
	// 		const bug = BuganizerApp.getBug(issueId);
	// 		const comments = getComments(issueId)
	// 			.filter(({ user }) => !user.endsWith("@prod.google.com"))
	// 			.map(({ comment }) => comment);
	// 		const text = `${bug.getSummary()}${comments.join("\n")}`;
	// 		return { issueId, text, lastComment };
	// 	});

	// 	const embeddings = getTextEmbeddings(
	// 		issueComments.map(({ text }) => text),
	// 		{
	// 			model: "text-embedding-large-exp-03-07",
	// 			taskType: "SEMANTIC_SIMILARITY",
	// 		},
	// 	);

	// 	const rows: EmbeddingsSchema[] = issueComments.map(
	// 		({ issueId, lastComment }, i) => ({
	// 			id: issueId,
	// 			insertedAt: new Date().getTime() / 1000,
	// 			lastComment: Number(lastComment) / 1000000,
	// 			embeddings: embeddings[i],
	// 		}),
	// 	);

	// 	if (globalThis.DEBUG) {
	// 		for (const { id, lastComment } of rows) {
	// 			Logger.log({ id, lastComment });
	// 		}
	// 	}

	// 	insertEmbeddings(rows);

	// 	PropertiesService.getScriptProperties().setProperty(
	// 		EMBEDDINGS_LAST_MICROS,
	// 		issueComments[issueComments.length - 1].lastComment.toString(),
	// 	);
	// } finally {
	// 	lock.releaseLock();
	// 	Logger.log("Lock released");
	// }
}

function insertEmbeddings(input: EmbeddingsSchema[]) {
	interface InsertRow {
		insertId: string;
		json: EmbeddingsSchema;
	}

	const rows: InsertRow[] = z
		.array(embeddingsSchema)
		.parse(input)
		.map((row) => ({
			insertId: row.id,
			json: row,
		}));

	const args = [
		{ rows },
		PropertiesService.getScriptProperties().getProperty("PROJECT_ID"),
		DATASET_ID,
		TABLE_ID,
	];

	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	const result = (BigQuery as any).Tabledata.insertAll(...args);

	if (result.insertErrors) {
		Logger.log(result);
		throw new Error("Failed to insert embeddings");
	}

	Logger.log({
		message: `Successfully inserted ${input.length} embeddings`,
		issues: input.map((i) => i.id),
	});
}

function getEmbeddings({
	columns = ["id", "insertedAt"],
	where = "",
}: { columns?: string[]; where?: string } = {}) {
	const request = {
		query: `SELECT ${columns.join(", ")} FROM \`workspace-devrel-issues.workspace_devrel_public_issues.embeddings_latest\` WHERE ${where}`,
		useLegacySql: false,
	};

	console.log(request, PROJECT_ID);

	const jobId = BigQuery.Jobs.query(request, PROJECT_ID).jobReference?.jobId;

	if (!jobId) {
		throw new Error("Failed to get job ID");
	}

	while (!BigQuery.Jobs.getQueryResults(PROJECT_ID, jobId).jobComplete) {
		Utilities.sleep(200);
	}

	const rows: GoogleAppsScript.BigQuery.Schema.TableRow[] = [];
	let pageToken: string | undefined;
	let schema: GoogleAppsScript.BigQuery.Schema.TableSchema | undefined;

	while (true) {
		const queryResults = BigQuery.Jobs.getQueryResults(PROJECT_ID, jobId, {
			pageToken,
		});
		rows.push(...(queryResults.rows ?? []));

		if (!schema) {
			schema = queryResults.schema;
		}

		if (!pageToken) {
			break;
		}

		pageToken = queryResults.pageToken;
	}

	if (!schema) {
		throw new Error("Failed to get schema");
	}

	return z
		.array(embeddingsSchema.partial())
		.parse(rows.map((row) => rowToObject(row, schema)));
}

export function search({ id }: { id: string }) {
	const request = {
		query: `SELECT
  *
FROM (
  SELECT
    id,
    embeddings,
    ML.DISTANCE(
      t.embeddings,
      (SELECT embeddings FROM \`workspace-devrel-issues.workspace_devrel_public_issues.embeddings_latest\` WHERE id = '${id}'),
      'COSINE'
    ) AS distance
  FROM
    \`workspace-devrel-issues.workspace_devrel_public_issues.embeddings_latest\` AS t
  WHERE
    t.id != '${id}'
)
WHERE
  distance < 0.2
ORDER BY
  distance ASC
LIMIT 10`,
		useLegacySql: false,
	};

	console.log(request.query);

	const jobId = BigQuery.Jobs.query(request, PROJECT_ID).jobReference?.jobId;

	if (!jobId) {
		throw new Error("Failed to get job ID");
	}

	while (!BigQuery.Jobs.getQueryResults(PROJECT_ID, jobId).jobComplete) {
		Utilities.sleep(200);
	}

	const rows: GoogleAppsScript.BigQuery.Schema.TableRow[] = [];
	let pageToken: string | undefined;
	let schema: GoogleAppsScript.BigQuery.Schema.TableSchema | undefined;

	while (true) {
		const queryResults = BigQuery.Jobs.getQueryResults(PROJECT_ID, jobId, {
			pageToken,
		});
		rows.push(...(queryResults.rows ?? []));

		if (!schema) {
			schema = queryResults.schema;
		}

		if (!pageToken) {
			break;
		}

		pageToken = queryResults.pageToken;
	}

	if (!schema) {
		throw new Error("Failed to get schema");
	}

	return z
		.array(
			embeddingsSchema
				.pick({ id: true, embeddings: true })
				.extend({ distance: z.coerce.number() })
				.passthrough(),
		)
		.parse(rows.map((row) => rowToObject(row, schema)))
		.filter((r) => r.distance < 0.25);
}

function rowToObject(
	row: GoogleAppsScript.BigQuery.Schema.TableRow,
	schema: GoogleAppsScript.BigQuery.Schema.TableSchema,
) {
	return Object.fromEntries(
		schema.fields?.map((field, i) => {
			if (field.mode === "REPEATED") {
				// @ts-ignore
				return [field?.name, row.f?.[i]?.v?.flatMap((v) => v.v)];
			}
			return [field?.name, row.f?.[i]?.v];
		}) ?? [],
	);
}

interface Projection {
	state: string;
	data: string;
	token: string;
	id: string;
}

// function recentlyCommentedBugs_({
// 	last = 0,
// 	limit = 10,
// }: { last?: number; limit?: number }): {
// 	issueId: string;
// 	lastComment: string;
// }[] {
// 	const request = {
// 		queryRequest: {
// 			query: {
// 				text: `SELECT
// 				  t.issue_id as issue_id,
// 				  MAX(comments.modified) AS last_comment,
// 				FROM
// 				  buganizer.issuehistories.live AS t,
// 				  UNNEST(t.comments) AS comments
// 				LEFT JOIN buganizer.issuestatsfresh.live AS b
// 				  ON t.issue_id = b.issue_id
// 				LEFT JOIN buganizer.componentsfresh.live AS c
// 				  ON b.component_id = CAST(c.component_id AS INT64)
// 				WHERE
// 				  EXISTS(SELECT 1 FROM UNNEST(c.component_id_path) p WHERE p = "191625")
// 				  AND comments.modified > UNIX_MICROS(TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 1000 DAY))
// 				  AND comments.modified > ${last}
// 				  AND comments.user.user_type = 'PUBLIC'
// 				  AND t.is_archived = FALSE
// 				  AND t.is_restricted = FALSE
// 				GROUP BY t.issue_id
// 				ORDER BY last_comment
// 				LIMIT ${limit}
// 				`,
// 				engine: "F1",
// 			},
// 			parameters: {},
// 		},
// 	};

// 	if (globalThis.DEBUG) {
// 		console.log(request.queryRequest.query.text);
// 	}

// 	// @ts-ignore
// 	let projection = Plx.Projections.create(request);
// 	while (projection.state !== "done") {
// 		Utilities.sleep(100);
// 		projection = getProjection_(projection);
// 	}

// 	return Utilities.parseCsv(projection.data)
// 		.slice(1)
// 		.map((values) => ({
// 			issueId: values[0],
// 			lastComment: values[1],
// 		}));
// }

// function getProjection_(projection: Projection): Projection {
// 	// @ts-ignore
// 	return Plx.Projections.get(projection.id, { token: projection.token });
// }

globalThis._updateEmbeddings = updateEmbeddings;
