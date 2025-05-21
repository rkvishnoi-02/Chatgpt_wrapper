'use client';

import React from 'react';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { useChatStore } from '@/store/chatStore';
import { useSettingsStore } from '@/store/settingsStore';
import { Message } from '@/types/chat';
import { ModelType } from '@/types/llm';
import { llmFactory } from '@/lib/llm';
import { useMobileView } from '@/hooks/useMobileView';
import { useMobileStore } from '@/store/mobileStore';

export const ChatWindow: React.FC = () => {
  const {
    sessions,
    activeSessionId,
    addMessage,
    updateMessage,
    deleteMessage,
    isLoading,
    setLoading,
    setError,
    chatSettings,
  } = useChatStore();
  
  const { providerConfig } = useSettingsStore();
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const isMobile = useMobileView();
  const { isSidebarOpen } = useMobileStore();

  const activeSession = activeSessionId ? sessions[activeSessionId] : null;
  const messages = activeSession?.messages || [];

  // Initialize LLM provider
  React.useEffect(() => {
    try {
      if (providerConfig.geminiKey) {
        llmFactory.initializeProvider('gemini', providerConfig.geminiKey);
        console.log('Gemini provider initialized');
      }
      if (providerConfig.openAIKey) {
        llmFactory.initializeProvider('openai', providerConfig.openAIKey);
      }
      if (providerConfig.anthropicKey) {
        llmFactory.initializeProvider('anthropic', providerConfig.anthropicKey);
      }
    } catch (error) {
      console.error('Error initializing providers:', error);
      setError(error instanceof Error ? error.message : 'Error initializing providers');
    }
  }, [providerConfig, setError]);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (content: string) => {
    if (!activeSessionId) return;

    const userMessage: Message = {
      role: 'user',
      content,
      timestamp: Date.now(),
    };

    addMessage(activeSessionId, userMessage);
    setLoading(true);
    setError(null);

    try {
      console.log('Using model:', chatSettings.model);
      const provider = llmFactory.getProvider(chatSettings.model as ModelType);
      const response = await provider.generateResponse(
        [...messages, userMessage],
        {
          temperature: chatSettings.temperature,
          maxTokens: chatSettings.maxTokens,
        }
      );

      const assistantMessage: Message = {
        role: 'assistant',
        content: response,
        timestamp: Date.now(),
      };

      addMessage(activeSessionId, assistantMessage);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      setError(errorMessage);
      console.error('Error generating response:', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleEditMessage = (index: number, content: string) => {
    if (!activeSessionId) return;
    updateMessage(activeSessionId, index, content);
  };

  const handleDeleteMessage = (index: number) => {
    if (!activeSessionId) return;
    deleteMessage(activeSessionId, index);
  };

  if (!activeSession) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-secondary-500">Select or create a chat to begin</p>
      </div>
    );
  }

  const mainClasses = `flex h-full flex-col bg-background ${
    isMobile && isSidebarOpen ? 'opacity-50' : ''
  }`;

  return (
    <div className={mainClasses}>
      <div className="flex-1 overflow-y-auto p-2 md:p-4 space-y-4 md:space-y-6">
        {messages.map((message, index) => (
          <ChatMessage
            key={`${message.timestamp}-${index}`}
            message={{
              ...message,
              id: `${message.timestamp}-${index}`,
              status: 'sent',
            }}
            onEdit={
              message.role === 'user'
                ? (content) => handleEditMessage(index, content)
                : undefined
            }
            onDelete={
              message.role === 'user'
                ? () => handleDeleteMessage(index)
                : undefined
            }
          />
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <ChatInput
          onSend={handleSendMessage}
          isLoading={isLoading}
          placeholder={isMobile ? "Message..." : "Type a message..."}
        />
      </div>
    </div>
  );
};