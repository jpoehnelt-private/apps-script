export function isPublicWorkspaceDeveloperIssue(
	bug: GoogleAppsScript.Buganizer.Bug,
): boolean {
	const componentPath = bug.getComponentPath().join("/");
	const pattern = /partner|confidential|preview|early|access/i;
	const isPublic =
		componentPath.startsWith("Public Trackers/Google Workspace Developers/") &&
		!pattern.test(componentPath);

	return isPublic;
}
