/**
 * Local storage utilities with type safety
 */

import { ChatSession } from '@/types/session';

const STORAGE_PREFIX = 'llm-wrapper-';
const SESSION_PREFIX = 'chat-session-';
const SESSION_INDEX_KEY = 'chat-sessions';

export function setStorageItem<T>(key: string, value: T): void {
  try {
    const serializedValue = JSON.stringify(value);
    localStorage.setItem(`${STORAGE_PREFIX}${key}`, serializedValue);
  } catch (error) {
    console.error(`Error saving to localStorage:`, error);
  }
}

export function getStorageItem<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(`${STORAGE_PREFIX}${key}`);
    if (!item) return defaultValue;
    return JSON.parse(item) as T;
  } catch (error) {
    console.error(`Error reading from localStorage:`, error);
    return defaultValue;
  }
}

export function removeStorageItem(key: string): void {
  try {
    localStorage.removeItem(`${STORAGE_PREFIX}${key}`);
  } catch (error) {
    console.error(`Error removing from localStorage:`, error);
  }
}

export function clearStorage(): void {
  try {
    Object.keys(localStorage)
      .filter(key => key.startsWith(STORAGE_PREFIX))
      .forEach(key => localStorage.removeItem(key));
  } catch (error) {
    console.error(`Error clearing localStorage:`, error);
  }
}

/**
 * Session management utilities
 */

export function saveChatSession(session: ChatSession): void {
  try {
    // Save the session
    setStorageItem(`${SESSION_PREFIX}${session.id}`, session);
    
    // Update session index
    const sessions = getStorageItem<string[]>(SESSION_INDEX_KEY, []);
    if (!sessions.includes(session.id)) {
      sessions.push(session.id);
      setStorageItem(SESSION_INDEX_KEY, sessions);
    }
  } catch (error) {
    console.error(`Error saving chat session:`, error);
  }
}

export function getChatSession(sessionId: string): ChatSession | null {
  return getStorageItem<ChatSession | null>(`${SESSION_PREFIX}${sessionId}`, null);
}

export function getAllChatSessions(): ChatSession[] {
  try {
    const sessions = getStorageItem<string[]>(SESSION_INDEX_KEY, []);
    return sessions
      .map(id => getChatSession(id))
      .filter((session): session is ChatSession => session !== null)
      .sort((a, b) => b.updatedAt - a.updatedAt);
  } catch (error) {
    console.error(`Error getting chat sessions:`, error);
    return [];
  }
}

export function deleteChatSession(sessionId: string): void {
  try {
    // Remove the session
    removeStorageItem(`${SESSION_PREFIX}${sessionId}`);
    
    // Update session index
    const sessions = getStorageItem<string[]>(SESSION_INDEX_KEY, []);
    setStorageItem(
      SESSION_INDEX_KEY, 
      sessions.filter(id => id !== sessionId)
    );
  } catch (error) {
    console.error(`Error deleting chat session:`, error);
  }
}

export function updateChatSessionTitle(sessionId: string, title: string): void {
  try {
    const session = getChatSession(sessionId);
    if (session) {
      session.title = title;
      session.updatedAt = Date.now();
      saveChatSession(session);
    }
  } catch (error) {
    console.error(`Error updating chat session title:`, error);
  }
}

export function migrateLocalStorage(): void {
  try {
    // Add version to storage items for future migrations
    const version = getStorageItem<string>('version', '1.0.0');
    
    // Migrate old chat sessions to new format if version is older
    if (version === '1.0.0') {
      const sessions = getAllChatSessions();
      sessions.forEach(session => {
        if (!session.contextWindow) {
          session.contextWindow = {
            maxTokens: 2048,
            currentTokens: 0,
            messages: session.messages
          };
          saveChatSession(session);
        }
      });
      
      setStorageItem('version', '1.1.0');
    }
    
    // Add future migrations here as the app evolves
  } catch (error) {
    console.error(`Error during storage migration:`, error);
  }
}

export function cleanupStorage(): void {
  try {
    // Remove any expired or invalid items
    const now = Date.now();
    const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
    
    Object.keys(localStorage)
      .filter(key => key.startsWith(STORAGE_PREFIX))
      .forEach(key => {
        const value = localStorage.getItem(key);
        if (value) {
          try {
            const parsed = JSON.parse(value);
            // Remove old sessions
            if (
              key.startsWith(STORAGE_PREFIX + SESSION_PREFIX) &&
              parsed.updatedAt &&
              now - parsed.updatedAt > maxAge
            ) {
              localStorage.removeItem(key);
            } else {
              // Validate JSON structure
              JSON.parse(value);
            }
          } catch {
            localStorage.removeItem(key);
          }
        }
      });
  } catch (error) {
    console.error(`Error during storage cleanup:`, error);
  }
}