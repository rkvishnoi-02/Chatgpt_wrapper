import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ChatSession } from '@/types/session';
import { Message, ModelType } from '@/types/llm';
import {
  saveChatSession,
  getChatSession,
  getAllChatSessions,
  deleteChatSession,
  updateChatSessionTitle,
} from '@/utils/storage';

interface ChatSettings {
  model: ModelType;
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
}

const defaultChatSettings: ChatSettings = {
  model: 'gemini-2.0-flash',
  temperature: 0.7,
  maxTokens: 2048,
  systemPrompt: '',
};

interface ChatState {
  sessions: Record<string, ChatSession>;
  activeSessionId: string | null;
  isLoading: boolean;
  error: string | null;
  chatSettings: ChatSettings;
}

interface ChatStore extends ChatState {
  // Session management
  createSession: (model: ModelType) => string;
  deleteSession: (sessionId: string) => void;
  setActiveSession: (sessionId: string) => void;
  
  // Message management
  addMessage: (sessionId: string, message: Message) => void;
  updateMessage: (sessionId: string, messageIndex: number, content: string) => void;
  deleteMessage: (sessionId: string, messageIndex: number) => void;
  
  // Settings management
  updateChatSettings: (settings: Partial<ChatSettings>) => void;
  
  // State management
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      // State
      sessions: {},
      activeSessionId: null,
      isLoading: false,
      error: null,
      chatSettings: defaultChatSettings,

      // Session management
      createSession: (model: ModelType) => {
        const sessionId = Date.now().toString();
        const newSession: ChatSession = {
          id: sessionId,
          title: 'New Chat',
          messages: [],
          model,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          contextWindow: {
            maxTokens: defaultChatSettings.maxTokens,
            currentTokens: 0,
            messages: [],
          },
        };

        set((state) => ({
          sessions: { ...state.sessions, [sessionId]: newSession },
          activeSessionId: sessionId,
        }));

        saveChatSession(newSession);
        return sessionId;
      },

      deleteSession: (sessionId: string) => {
        set((state) => {
          const { [sessionId]: _, ...sessions } = state.sessions;
          const activeSessionId = state.activeSessionId === sessionId
            ? Object.keys(sessions)[0] || null
            : state.activeSessionId;

          deleteChatSession(sessionId);
          return { sessions, activeSessionId };
        });
      },

      setActiveSession: (sessionId: string) =>
        set({ activeSessionId: sessionId }),

      // Message management
      addMessage: (sessionId: string, message: Message) => {
        set((state) => {
          const session = state.sessions[sessionId];
          if (!session) return state;

          const updatedSession = {
            ...session,
            messages: [...session.messages, message],
            updatedAt: Date.now(),
            contextWindow: {
              ...session.contextWindow,
              messages: [...session.contextWindow.messages, message],
            },
          };

          saveChatSession(updatedSession);
          return {
            sessions: {
              ...state.sessions,
              [sessionId]: updatedSession,
            },
          };
        });
      },

      updateMessage: (sessionId: string, messageIndex: number, content: string) => {
        set((state) => {
          const session = state.sessions[sessionId];
          if (!session) return state;

          const messages = [...session.messages];
          messages[messageIndex] = {
            ...messages[messageIndex],
            content,
          };

          const contextMessages = [...session.contextWindow.messages];
          if (messageIndex < contextMessages.length) {
            contextMessages[messageIndex] = {
              ...contextMessages[messageIndex],
              content,
            };
          }

          const updatedSession = {
            ...session,
            messages,
            updatedAt: Date.now(),
            contextWindow: {
              ...session.contextWindow,
              messages: contextMessages,
            },
          };

          saveChatSession(updatedSession);
          return {
            sessions: {
              ...state.sessions,
              [sessionId]: updatedSession,
            },
          };
        });
      },

      deleteMessage: (sessionId: string, messageIndex: number) => {
        set((state) => {
          const session = state.sessions[sessionId];
          if (!session) return state;

          const messages = session.messages.filter((_, i) => i !== messageIndex);
          const contextMessages = session.contextWindow.messages.filter(
            (_, i) => i !== messageIndex
          );

          const updatedSession = {
            ...session,
            messages,
            updatedAt: Date.now(),
            contextWindow: {
              ...session.contextWindow,
              messages: contextMessages,
            },
          };

          saveChatSession(updatedSession);
          return {
            sessions: {
              ...state.sessions,
              [sessionId]: updatedSession,
            },
          };
        });
      },

      // Settings management
      updateChatSettings: (settings) =>
        set((state) => ({
          chatSettings: { ...state.chatSettings, ...settings },
        })),

      // State management
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
    }),
    {
      name: 'llm-wrapper-chat',
      partialize: (state) => ({
        sessions: state.sessions,
        chatSettings: state.chatSettings,
      }),
    }
  )
);