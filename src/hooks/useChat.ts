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
    updateMessageContent,
    isLoading,
    isStreaming,
    streamingMessage,
    setLoading,
    setStreaming,
    setStreamingMessage,
    setError,
    chatSettings,
  } = useChatStore();

  const { providerConfig } = useSettingsStore();

  const activeSession = activeSessionId ? sessions[activeSessionId] : null;
  const messages = activeSession?.messages || [];const sendMessage = useCallback(
    async (content: string, options?: { stream?: boolean }) => {
      if (!content.trim()) return;

      // Auto-create session if none exists
      let sessionId = activeSessionId;
      if (!sessionId) {
        console.log('No active session, creating new session...');
        sessionId = createSession(chatSettings.model);
        console.log('Created new session:', sessionId);
      }

      // Ensure we have a valid session ID
      if (!sessionId) {
        const errorMessage = 'Failed to create or get active session';
        setError(errorMessage);
        onError?.(errorMessage);
        return;
      }

      const userMessage: Message = {
        role: 'user',
        content: content.trim(),
        timestamp: Date.now(),
      };

      const shouldStream = options?.stream ?? true; // Default to streaming

      addMessage(sessionId, userMessage);
      setLoading(true);
      setStreaming(shouldStream);
      setError(null);
      setStreamingMessage('');try {
        console.log('=== SENDING REQUEST TO /api/chat ===');
        console.log('Model:', chatSettings.model);
        console.log('Messages:', [...messages, userMessage]);
        
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
            stream: shouldStream,
          }),
        });        if (!response.ok) {
          const errorText = await response.text();
          console.error('API Error Response:', errorText);
          try {
            const error = JSON.parse(errorText);
            throw new Error(error.error || error.message || 'Failed to send message');
          } catch (parseError) {
            throw new Error(errorText || 'Failed to send message');
          }
        }        if (shouldStream && response.headers.get('content-type')?.includes('text/event-stream')) {
          console.log('Starting to handle streaming response...');
          // Handle streaming response
          const reader = response.body?.getReader();
          if (!reader) throw new Error('No response stream available');          let accumulatedContent = '';
          
          // Add an initial AI message that we'll update as we stream
          const initialAIMessage: Message = {
            role: 'assistant',
            content: '',
            timestamp: Date.now(),
          };
          
          addMessage(sessionId, initialAIMessage);
          
          // Get the index of the message we just added (last message)
          const currentSession = sessions[sessionId];
          const aiMessageIndex = currentSession ? currentSession.messages.length : 0;

          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) {
                console.log('Streaming complete');
                break;
              }

              const chunk = new TextDecoder().decode(value);
              console.log('Received chunk:', chunk);
              const lines = chunk.split('\n');
              
              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  const data = line.slice(6);
                  
                  if (data === '[DONE]') {
                    console.log('Received DONE signal');
                    break;
                  }
                  
                  try {
                    const parsed = JSON.parse(data);
                    console.log('Parsed data:', parsed);
                    
                    if (parsed.error) {
                      throw new Error(parsed.error);
                    }
                    
                    if (parsed.content) {
                      accumulatedContent += parsed.content;
                      console.log('Accumulated content:', accumulatedContent);
                      setStreamingMessage(accumulatedContent);
                    }
                  } catch (parseError) {
                    console.warn('Failed to parse SSE data:', line);
                  }
                }
              }
            }
            
            // Final update: Save the complete message to the store and clear streaming
            if (accumulatedContent && sessionId) {
              console.log('Finalizing streaming message with content:', accumulatedContent);
              
              // Update the AI message with the final content
              updateMessageContent(sessionId, aiMessageIndex, accumulatedContent);
              
              // Clear streaming message after a small delay to ensure smooth transition
              setTimeout(() => {
                setStreamingMessage('');
              }, 100);
            }
          } finally {
            reader.releaseLock();
          }} else {
          // Handle regular non-streaming response
          const { response: assistantMessage } = await response.json();
          addMessage(sessionId, {
            role: 'assistant',
            content: assistantMessage,
            timestamp: Date.now(),
          });
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        setError(errorMessage);
        onError?.(errorMessage);      } finally {
        setLoading(false);
        setStreaming(false);
        setStreamingMessage('');
      }
    },    [
      activeSessionId,
      messages,
      addMessage,
      updateMessageContent,
      setLoading,
      setStreaming,
      setStreamingMessage,
      setError,
      chatSettings,
      sessions,
      onError,
    ]
  );  return {
    messages,
    isLoading,
    isStreaming,
    streamingMessage,
    sendMessage,
  };
}