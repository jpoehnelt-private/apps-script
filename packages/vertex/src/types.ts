import type z4 from "zod/v4";

// Base interfaces for content parts
export interface TextPart {
	text: string;
}

export function isTextPart(part: Part): part is TextPart {
	return "text" in part;
}

export interface InlineDataPart {
	inlineData: {
		mimeType: string;
		data: string; // Base64 encoded data
	};
}

export interface FileDataPart {
	fileData: {
		mimeType: string;
		fileUri: string;
	};
}

export interface FunctionCall {
	name: string;
	args: Record<string, unknown>;
}

export interface FunctionPart {
	functionCall: FunctionCall;
}

export interface FunctionResponse {
	name: string;
	response: Record<string, unknown>;
}

export interface FunctionResponsePart {
	functionResponse: FunctionResponse;
}

// Union type for different part types
export type Part =
	| TextPart
	| InlineDataPart
	| FileDataPart
	| FunctionPart
	| FunctionResponsePart;

// Content interfaces
export interface Content {
	role: "user" | "model" | "system" | "function";
	parts: Part[];
}

export interface SystemInstruction {
	role?: "system";
	parts: TextPart[];
}

// Safety settings
export interface SafetySetting {
	category:
		| "HARM_CATEGORY_HARASSMENT"
		| "HARM_CATEGORY_HATE_SPEECH"
		| "HARM_CATEGORY_SEXUALLY_EXPLICIT"
		| "HARM_CATEGORY_DANGEROUS_CONTENT";
	threshold:
		| "BLOCK_NONE"
		| "BLOCK_LOW_AND_ABOVE"
		| "BLOCK_MED_AND_ABOVE"
		| "BLOCK_HIGH_AND_ABOVE"
		| "BLOCK_ONLY_HIGH";
}

// Response schema for structured output
export type ResponseSchema = z4.core.JSONSchema.BaseSchema;

export interface SchemaProperty {
	type: "string" | "number" | "integer" | "boolean" | "array" | "object";
	description?: string;
	enum?: string[];
	items?: SchemaProperty; // For array types
	properties?: Record<string, SchemaProperty>; // For object types
	required?: string[]; // For object types
	minimum?: number;
	maximum?: number;
	minLength?: number;
	maxLength?: number;
	pattern?: string;
}

// Generation configuration
export interface GenerationConfig {
	temperature?: number;
	topP?: number;
	topK?: number;
	maxOutputTokens?: number;
	candidateCount?: number;
	stopSequences?: string[];
	responseMimeType: string;
	safetySettings?: SafetySetting[];
	responseSchema?: ResponseSchema;
}

// Request payload interfaces
export interface GenerateContentRequest {
	contents: Content[];
	systemInstruction?: SystemInstruction;
	generationConfig?: GenerationConfig;
}

// Response interfaces
export interface PromptFeedback {
	blockReason?: string;
	safetyRatings: {
		category: string;
		probability: string;
	}[];
}

export interface Candidate {
	content: Content;
	finishReason: "STOP" | "MAX_TOKENS" | "SAFETY" | "RECITATION" | "OTHER";
	index: number;
	safetyRatings: {
		category: string;
		probability: string;
		severity: string;
	}[];
	citationMetadata?: {
		citations: {
			startIndex?: number;
			endIndex?: number;
			uri?: string;
			title?: string;
			license?: string;
			publicationDate?: string;
		}[];
	};
}

export interface GenerateContentResponse {
	candidates: Candidate[];
	usageMetadata?: {
		promptTokenCount: number;
		candidatesTokenCount: number;
		totalTokenCount: number;
	};
}

// Legacy interfaces maintained for backward compatibility
export interface Payload {
	systemInstruction: SystemInstruction;
	contents: Content[];
	generationConfig: GenerationConfig;
}

export interface Contents {
	role: string;
	parts: Part[];
}

export interface Parts {
	text: string;
}

// Session API interfaces
export interface StartChatSessionRequest {
	systemInstruction?: SystemInstruction;
	generationConfig?: GenerationConfig;
}

export interface ChatSession {
	sessionId: string;
	contents: Content[];
}

export interface SendMessageRequest {
	sessionId: string;
	message: Content;
}
