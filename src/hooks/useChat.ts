import { Message, ModelType, ModelParams } from '@/types/llm';
import { useState, useCallback } from 'react';
import { useChatStore } from '@/store/chatStore';
import { useSettingsStore } from '@/store/settingsStore';

interface UseChatOptions {
  onError?: (error: string) => void;
}

export function useChat({ onError }: UseChatOptions = {}) {
  const {
    sessions,
    activeSessionId,
    createSession,
    deleteSession,
    addMessage,
    isLoading,
    setLoading,
    setError,
    chatSettings,
  } = useChatStore();

  const { providerConfig } = useSettingsStore();
  const [streamingMessage, setStreamingMessage] = useState<string>('');

  const activeSession = activeSessionId ? sessions[activeSessionId] : null;
  const messages = activeSession?.messages || [];

  const sendMessage = useCallback(
    async (content: string, options?: { stream?: boolean }) => {
      if (!activeSessionId || !content.trim()) return;

      const userMessage: Message = {
        role: 'user',
        content: content.trim(),
        timestamp: Date.now(),
      };

      addMessage(activeSessionId, userMessage);
      setLoading(true);
      setError(null);
      setStreamingMessage('');

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: [...messages, userMessage],
            model: chatSettings.model as ModelType,
            params: {
              temperature: chatSettings.temperature,
              maxTokens: chatSettings.maxTokens,
            } as ModelParams,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Failed to send message');
        }

        if (options?.stream) {
          const reader = response.body?.getReader();
          if (!reader) throw new Error('No response stream available');

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = new TextDecoder().decode(value);
            setStreamingMessage((prev) => prev + chunk);
          }

          addMessage(activeSessionId, {
            role: 'assistant',
            content: streamingMessage,
            timestamp: Date.now(),
          });
        } else {
          const { response: assistantMessage } = await response.json();
          addMessage(activeSessionId, {
            role: 'assistant',
            content: assistantMessage,
            timestamp: Date.now(),
          });
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        setError(errorMessage);
        onError?.(errorMessage);
      } finally {
        setLoading(false);
        setStreamingMessage('');
      }
    },
    [
      activeSessionId,
      messages,
      addMessage,
      setLoading,
      setError,
      chatSettings,
      providerConfig,
      onError,
    ]
  );

  return {
    messages,
    isLoading,
    streamingMessage,
    sendMessage,
    createSession,
    deleteSession,
  };
}