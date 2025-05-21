import { ModelType } from './llm';
import type { Message } from './llm';

export type { Message };

/**
 * Chat session interface
 */
export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
  model: ModelType;
}

/**
 * Chat state interface for managing multiple sessions
 */
export interface ChatState {
  sessions: Record<string, ChatSession>;
  activeSessionId: string | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Chat settings interface
 */
export interface ChatSettings {
  model: ModelType;
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
}

/**
 * Chat message status for UI feedback
 */
export type MessageStatus = 'sending' | 'sent' | 'error';

/**
 * Extended message interface with UI-specific properties
 */
export interface ChatMessageUI extends Message {
  id: string;
  status: MessageStatus;
  isEditing?: boolean;
}