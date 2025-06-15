/**
 * Content type for multimodal messages
 */
export type MessageContent = {
  type: 'text';
  text: string;
} | {
  type: 'image';
  data: string; // Base64 encoded image data
  mimeType: string;
};

/**
 * Base message interface for LLM interactions
 */
export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: MessageContent | MessageContent[] | string;
  timestamp: number;
}

/**
 * Model parameters interface
 */
export interface ModelParams {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
}

/**
 * LLM Provider interface that all providers must implement
 */
export interface LLMProvider {
  generateResponse(messages: Message[], params?: ModelParams): Promise<string>;
  generateStreamingResponse?(messages: Message[], params?: ModelParams): AsyncGenerator<string>;
}

/**
 * Supported model types
 */
export type ModelType = 
  | 'gpt-3.5-turbo'
  | 'gpt-4'
  | 'claude-2'
  | 'claude-instant'
  | 'gemini-2.0-flash'
  | 'gemini-2.0-flash-vision'
  | 'gemini-2.0-flash';

/**
 * Response format from LLM providers
 */
export interface LLMResponse {
  content: string;
  model: ModelType;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}