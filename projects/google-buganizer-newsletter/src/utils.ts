export function serializeBug(bug: GoogleAppsScript.Buganizer.Bug) {
	const title = bug.getSummary();
	const description = bug.getFirstNote();
	return `Id: ${bug.getId()}\nVote Count: ${bug.getMeTooCount()}\nTitle: ${title}\nCurrent Component: ${bug.getComponentPath().join("/")}\nDescription:\n\n${description}`;
}

export function gemini(
	request: any,
	model_id = "gemini-2.0-flash",
	project_id = "workspace-devrel-issues",
) {
	const URL = `https://us-central1-aiplatform.googleapis.com/v1/projects/${project_id}/locations/us-central1/publishers/google/models/${model_id}:generateContent`;

	Logger.log({ message: "vertex:generateContent", request, url: URL });

	const options = {
		method: "post" as const,
		headers: { Authorization: `Bearer ${ScriptApp.getOAuthToken()}` },
		muteHttpExceptions: true,
		contentType: "application/json",
		payload: JSON.stringify(request),
	};

	const response = UrlFetchApp.fetch(URL, options);

	if (response.getResponseCode() === 200) {
		return JSON.parse(response.getContentText());
	}
	throw new Error(response.getContentText());
}
