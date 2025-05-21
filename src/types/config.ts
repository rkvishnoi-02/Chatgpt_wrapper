/**
 * Environment configuration interface
 */
export interface EnvConfig {
  apiBaseUrl: string;
  defaultModel: string;
  maxTokens: number;
}

/**
 * Rate limiting configuration interface
 */
export interface RateLimitConfig {
  requestsPerWindow: number;
  windowMs: number;
}

/**
 * Application settings interface
 */
export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  fontSize: 'sm' | 'md' | 'lg';
  messageDisplayCount: number;
  enableMarkdown: boolean;
  enableCodeHighlighting: boolean;
}

/**
 * LLM Provider configuration interface
 */
export interface ProviderConfig {
  openAIKey?: string;
  anthropicKey?: string;
  geminiKey?: string;
  defaultProvider: 'openai' | 'anthropic' | 'gemini';
}