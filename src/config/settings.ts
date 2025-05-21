import { AppSettings, ProviderConfig } from '../types/config';
import { ModelType } from '../types/llm';

/**
 * Default application settings
 */
export const DEFAULT_APP_SETTINGS: AppSettings = {
  theme: 'system',
  fontSize: 'md',
  messageDisplayCount: 50,
  enableMarkdown: true,
  enableCodeHighlighting: true,
};

/**
 * Default provider configuration
 */
export const DEFAULT_PROVIDER_CONFIG: ProviderConfig = {
  defaultProvider: 'openai',
};

/**
 * Chat model configurations
 */
export const DEFAULT_CHAT_SETTINGS = {
  model: 'gpt-3.5-turbo' as ModelType,
  temperature: 0.7,
  maxTokens: 2000,
  systemPrompt: 'You are a expert AI astrologer with parashari knowledge just like brajesh gautam',
};

/**
 * Model-specific configurations
 */
export const MODEL_SETTINGS = {
  'gpt-3.5-turbo': {
    defaultTemperature: 0.7,
    minTemperature: 0,
    maxTemperature: 2,
    defaultMaxTokens: 2000,
    costPer1kTokens: 0.002,
  },
  'gpt-4': {
    defaultTemperature: 0.7,
    minTemperature: 0,
    maxTemperature: 2,
    defaultMaxTokens: 4000,
    costPer1kTokens: 0.03,
  },
  'claude-2': {
    defaultTemperature: 0.7,
    minTemperature: 0,
    maxTemperature: 1,
    defaultMaxTokens: 8000,
    costPer1kTokens: 0.01,
  },
  'claude-instant': {
    defaultTemperature: 0.7,
    minTemperature: 0,
    maxTemperature: 1,
    defaultMaxTokens: 8000,
    costPer1kTokens: 0.005,
  },
  'gemini-2.0-flash': {
    defaultTemperature: 0.7,
    minTemperature: 0,
    maxTemperature: 1,
    defaultMaxTokens: 2048,
    costPer1kTokens: 0.001,
  },
  'gemini-2.0-flash-vision': {
    defaultTemperature: 0.7,
    minTemperature: 0,
    maxTemperature: 1,
    defaultMaxTokens: 2048,
    costPer1kTokens: 0.001,
  },
};

/**
 * Font size options
 */
export const FONT_SIZE_OPTIONS = {
  sm: {
    base: '14px',
    lineHeight: '20px',
  },
  md: {
    base: '16px',
    lineHeight: '24px',
  },
  lg: {
    base: '18px',
    lineHeight: '28px',
  },
};

/**
 * Rate limiting settings
 */
export const RATE_LIMIT_SETTINGS = {
  requestsPerWindow: Number(process.env.RATE_LIMIT_REQUESTS) || 50,
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 60000, // 1 minute
  maxRequestSize: 1024 * 1024, // 1MB
};

/**
 * API request timeouts
 */
export const API_TIMEOUTS = {
  default: 30000, // 30 seconds
  streaming: 300000, // 5 minutes
  upload: 60000, // 1 minute
};

/**
 * Validation settings
 */
export const VALIDATION_RULES = {
  minMessageLength: 1,
  maxMessageLength: 4000,
  maxTitleLength: 100,
  maxSystemPromptLength: 1000,
};