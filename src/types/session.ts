import { Message } from './chat';

export interface ChatContextWindow {
  maxTokens: number;
  currentTokens: number;
  messages: Message[];
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  model: string;
  createdAt: number;
  updatedAt: number;
  contextWindow: ChatContextWindow;
}
