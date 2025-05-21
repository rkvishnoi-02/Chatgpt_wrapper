import { ModelType } from '../types/llm';

/**
 * API Configuration
 */
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || '/api',
  TIMEOUT: 30000, // 30 seconds
  RETRY_COUNT: 3,
  RETRY_DELAY: 1000, // 1 second
};

/**
 * Model Configuration
 */
export const SUPPORTED_MODELS: Record<ModelType, { name: string; maxTokens: number }> = {
  'gpt-3.5-turbo': {
    name: 'GPT-3.5 Turbo',
    maxTokens: 4096,
  },
  'gpt-4': {
    name: 'GPT-4',
    maxTokens: 8192,
  },
  'claude-2': {
    name: 'Claude 2',
    maxTokens: 100000,
  },
  'claude-instant': {
    name: 'Claude Instant',
    maxTokens: 100000,
  },
  'gemini-2.0-flash': {
    name: 'Gemini Pro',
    maxTokens: 32768,
  },
  'gemini-2.0-flash-vision': {
    name: 'Gemini Pro Vision',
    maxTokens: 32768,
  },
  'gemini-2.0-flash': {
    name: 'Gemini 2.0 Flash',
    maxTokens: 32768,
  },
};

/**
 * Chat Configuration
 */
export const CHAT_CONFIG = {
  MAX_MESSAGES_PER_CHAT: 100,
  MAX_CHATS: 50,
  MESSAGE_CHUNK_SIZE: 1000,
  TYPING_INDICATOR_DELAY: 500,
  AUTO_SAVE_INTERVAL: 5000, // 5 seconds
};

/**
 * UI Configuration
 */
export const UI_CONFIG = {
  SIDEBAR_WIDTH: 280,
  HEADER_HEIGHT: 64,
  ANIMATION_DURATION: 200,
  TOAST_DURATION: 5000,
  MAX_MOBILE_WIDTH: 768,
};

/**
 * Theme Configuration
 */
export const THEME_COLORS = {
  light: {
    primary: '#0ea5e9',
    secondary: '#64748b',
    background: '#ffffff',
    surface: '#f8fafc',
    error: '#ef4444',
    success: '#22c55e',
    warning: '#f59e0b',
  },
  dark: {
    primary: '#38bdf8',
    secondary: '#94a3b8',
    background: '#0f172a',
    surface: '#1e293b',
    error: '#f87171',
    success: '#4ade80',
    warning: '#fbbf24',
  },
};

/**
 * Storage Configuration
 */
export const STORAGE_CONFIG = {
  VERSION: '1.0.0',
  PREFIX: 'llm-wrapper-',
  MAX_SIZE: 5242880, // 5MB
  CLEANUP_INTERVAL: 86400000, // 24 hours
};

/**
 * Error Messages
 */
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Unable to connect to the server. Please check your internet connection.',
  RATE_LIMIT: 'Rate limit exceeded. Please try again later.',
  INVALID_API_KEY: 'Invalid API key. Please check your provider configuration.',
  UNKNOWN_ERROR: 'An unknown error occurred. Please try again.',
  MODEL_NOT_AVAILABLE: 'The selected model is not available.',
  SESSION_EXPIRED: 'Your session has expired. Please refresh the page.',
};