import { describe, expect, it } from "vitest";
import { isPublicWorkspaceDeveloperIssue } from "./access.js";

describe("isPublicWorkspaceDeveloperIssue", () => {
	it("should return true for public workspace developer issues", () => {
		const bug = {
			getComponentPath: () => [
				"Public Trackers",
				"Google Workspace Developers",
				"Public",
			],
		} as unknown as GoogleAppsScript.Buganizer.Bug;
		expect(isPublicWorkspaceDeveloperIssue(bug)).toBe(true);
	});

	it("should return false for non-public workspace developer issues", () => {
		const bug = {
			getComponentPath: () => [
				"Public Trackers",
				"Google Workspace Developers",
				"Drive API",
				"Select Partners",
			],
		} as unknown as GoogleAppsScript.Buganizer.Bug;
		expect(isPublicWorkspaceDeveloperIssue(bug)).toBe(false);
	});

	it("should return false for non-public workspace developer issues", () => {
		const bug = {
			getComponentPath: () => ["Apps", "Google Workspace", "Drive API"],
		} as unknown as GoogleAppsScript.Buganizer.Bug;
		expect(isPublicWorkspaceDeveloperIssue(bug)).toBe(false);
	});
});
