import {
	WorkspaceQuery,
	getComments,
	getLink,
} from "@repository/buganizer-utils";
import { generate, isTextPart } from "@repository/vertex";
import { z } from "zod/v4";
import { determineCanonical } from "./canonical.js";
import { search } from "./embeddings.js";

const verifyDuplicatesSchema = z
	.object({
		isDuplicate: z.boolean().describe("Set to true if the bug is a duplicate"),
		confidence: z
			.string()
			.regex(/^(low|high)$/)
			.describe("A confidence level of 'high' means there is no question"),
		justification: z
			.string()
			.describe(
				"A short publicly visible justification for why this is a duplicate. Less than 150 characters.",
			)
			.min(30)
			.max(150),
	})
	.required({
		isDuplicate: true,
		confidence: true,
		justification: true,
	});

type VerifyDuplicatesSchema = z.infer<typeof verifyDuplicatesSchema>;

function notDuplicateString(bug: GoogleAppsScript.Buganizer.Bug) {
	return `not a duplicate of ${bug.getId()}`;
}

function serializeBug(bug: GoogleAppsScript.Buganizer.Bug) {
	return `${bug.getId()} ${bug.getSummary()} ${getComments(bug.getId())
		.map(({ comment }) => comment)
		.join("\n")}`;
}

function automaticallyCheckIfDuplicate(within = 1) {
	const bugs = new WorkspaceQuery()
		.isOpen()
		.createdWithin(within)
		.not("-hotlistid:5210298") // pinned
		.search()
		.sort(
			(a, b) => a.getCreatedTime().getTime() - b.getCreatedTime().getTime(),
		);

	for (const bug of bugs) {
		const id = bug.getId();
		checkIfDuplicate(id);
	}
}

function checkIfDuplicate(id: string) {
	for (const candidate of search({ id })) {
		const [canonical, duplicate] = determineCanonical(
			BuganizerApp.getBug(id),
			BuganizerApp.getBug(candidate.id),
		);

		if (!canonical || !duplicate) {
			continue;
		}

		if (
			getComments(duplicate.getId()).some(({ comment }) =>
				comment
					.toLowerCase()
					.includes(notDuplicateString(canonical).toLowerCase()),
			)
		) {
			Logger.log({
				message: `Found message ${notDuplicateString(canonical)} in ${duplicate.getId()}`,
			});
			continue;
		}

		const result = verifyDuplicates(canonical.getId(), duplicate.getId());
		if (result?.isDuplicate && result.confidence === "high") {
			duplicate.setDuplicateOf(canonical.getId());
			Logger.log({
				message: `Found duplicate: ${id} "${duplicate.getSummary().slice(0, 50)}..." ${duplicate.getStatus()} -> ${canonical.getId()} "${canonical.getSummary().slice(0, 50)}..." ${canonical.getStatus()}`,
				duplicate: duplicate.getId(),
				canonical: canonical.getId(),
				id,
				distance: candidate.distance,
			});

			const note = `> ${result.justification}\n\nI am marking this issue as a duplicate of [${canonical.getSummary()}](${getLink(canonical.getId())}).\n\nIf this is not correct, comment with \`${notDuplicateString(canonical)}\``;
			Logger.log(note);
			duplicate.setMarkdownNote(note);
			duplicate.addToHotlist("7027812");
			duplicate.save();
			return;
		}
	}
}

function verifyDuplicates(
	a: string,
	b: string,
): VerifyDuplicatesSchema | undefined {
	const bugA = BuganizerApp.getBug(a);
	const bugB = BuganizerApp.getBug(b);

	const response = generate(
		{
			contents: [
				{
					role: "user",
					parts: [
						{
							text: `Verify that the following bugs are duplicates: ${serializeBug(bugA)} and ${serializeBug(bugB)}`,
						},
					],
				},
			],
			systemInstruction: {
				role: "system",
				parts: [
					{
						text: "You are an administrative assistant helping to manage bugs in an issue tracker. Be conservative and don't make assumptions. A duplicate bug should have the same root cause AND the same resolution. If you are unsure, it should not be a duplicate. You cannot make mistakes.",
					},
				],
			},
			generationConfig: {
				responseMimeType: "application/json",
				responseSchema: z.toJSONSchema(verifyDuplicatesSchema),
			},
		},
		{
			MODEL: "gemini-2.5-flash-preview-05-20",
			PROJECT_ID: "workspace-devrel-issues",
		},
	);

	if (isTextPart(response.candidates[0]?.content?.parts[0])) {
		const result = JSON.parse(response.candidates[0].content.parts[0].text);

		if (result.isDuplicate && result.confidence.toLowerCase() === "high") {
			Logger.log({
				result: "true",
				bugA: bugA.getSummary(),
				bugB: bugB.getSummary(),
			});
		}
		return result;
	}
}

globalThis._automaticallyCheckIfDuplicate = automaticallyCheckIfDuplicate;
