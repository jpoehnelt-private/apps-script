import type { GenerateContentResponse, Payload } from "./types.js";

export * from "./types.js";

export function generate(
	payload: Payload,
	{ MODEL, PROJECT_ID }: { MODEL: string; PROJECT_ID: string },
): GenerateContentResponse {
	if (payload.generationConfig.responseSchema) {
		payload.generationConfig.responseSchema = Object.fromEntries(
			Object.entries(payload.generationConfig.responseSchema).filter(
				([key]) => !key.startsWith("$"),
			),
		);
	}

	console.log(JSON.stringify(payload.generationConfig.responseSchema, null, 2));

	const URL = `https://us-central1-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/us-central1/publishers/google/models/${MODEL}:generateContent`;
	const options = {
		method: "post" as const,
		headers: { Authorization: `Bearer ${ScriptApp.getOAuthToken()}` },
		muteHttpExceptions: true,
		contentType: "application/json",
		payload: JSON.stringify(payload),
	};

	const response = UrlFetchApp.fetch(URL, options);

	if (response.getResponseCode() === 200) {
		return JSON.parse(response.getContentText());
	}
	throw new Error(response.getContentText());
}
