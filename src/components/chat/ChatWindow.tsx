'use client';

import React from 'react';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { TypingIndicator } from './TypingIndicator';
import { useChatStore } from '@/store/chatStore';
import { useChat } from '@/hooks/useChat';
import { useMobileView } from '@/hooks/useMobileView';
import { useMobileStore } from '@/store/mobileStore';

export const ChatWindow: React.FC = () => {
  const {
    sessions,
    activeSessionId,
    updateMessage,
    deleteMessage,
    isLoading,
    isStreaming,
    setError,
  } = useChatStore();
  
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const isMobile = useMobileView();
  const { isSidebarOpen } = useMobileStore();  // Use the chat hook for message sending (this handles API calls and streaming)
  const { messages, sendMessage, streamingMessage } = useChat({
    onError: (error) => setError(error),
  });
  
  const activeSession = activeSessionId ? sessions[activeSessionId] : null;
  // Debug logging
  React.useEffect(() => {
    console.log('=== ChatWindow Debug ===');
    console.log('activeSessionId:', activeSessionId);
    console.log('activeSession:', activeSession);
    console.log('messages from useChat:', messages);
    console.log('messages length:', messages.length);
    console.log('isLoading:', isLoading);
    console.log('isStreaming:', isStreaming);
    console.log('streamingMessage:', streamingMessage);
  }, [activeSessionId, activeSession, messages, isLoading, isStreaming, streamingMessage]);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };  React.useEffect(() => {
    scrollToBottom();
  }, [messages, streamingMessage]);

  const handleEditMessage = (index: number, content: string) => {
    if (!activeSessionId) return;
    updateMessage(activeSessionId, index, content);
  };

  const handleDeleteMessage = (index: number) => {
    if (!activeSessionId) return;
    deleteMessage(activeSessionId, index);
  };if (!activeSession) {
    return (
      <div className="flex h-full items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="text-4xl">💬</div>
          <h2 className="text-xl font-semibold text-foreground">
            How can I help you today?
          </h2>
          <p className="text-muted-foreground">
            Start a conversation with AI assistant
          </p>
        </div>
      </div>
    );
  }

  const mainClasses = `flex h-full flex-col bg-background ${
    isMobile && isSidebarOpen ? 'opacity-50' : ''
  }`;
  return (
    <div className={mainClasses}>      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto messages-container">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center px-4">
            <div className="text-center space-y-6 max-w-md mx-auto">
              <div className="text-6xl">🤖</div>
              <h2 className="text-2xl font-semibold text-foreground">
                Start your conversation
              </h2>
              <div className="grid grid-cols-1 gap-3">                <button 
                  onClick={() => sendMessage("Help me write a professional email")}
                  className="p-4 text-left rounded-lg border border-border hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  <div className="text-sm font-medium text-foreground">
                    📝 Help me write
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Create content, emails, or documents
                  </div>
                </button>
                <button 
                  onClick={() => sendMessage("Help me brainstorm ideas for a new project")}
                  className="p-4 text-left rounded-lg border border-border hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  <div className="text-sm font-medium text-foreground">
                    💡 Brainstorm ideas
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Generate creative concepts and solutions
                  </div>
                </button>
                <button 
                  onClick={() => sendMessage("Explain how artificial intelligence works")}
                  className="p-4 text-left rounded-lg border border-border hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  <div className="text-sm font-medium text-foreground">
                    🧠 Answer questions
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Get detailed explanations and insights
                  </div>
                </button>
              </div>
            </div>
          </div>        ) : (
          <div className="w-full">            {messages.map((message, index) => (
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
              {/* Show streaming message when AI is responding */}
            {isStreaming && streamingMessage && (
              <ChatMessage
                message={{
                  id: 'streaming',
                  role: 'assistant',
                  content: streamingMessage,
                  timestamp: Date.now(),
                  status: 'sending',
                }}
                isStreaming={true}
              />
            )}            
            {/* Show typing indicator when AI is loading but not yet streaming */}
            <TypingIndicator isVisible={isLoading && !streamingMessage} />
            
            {/* Streaming status indicator */}
            {isStreaming && (
              <div className="flex items-center justify-center py-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                  <span>AI is responding...</span>
                </div>
              </div>
            )}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>      {/* Input Container */}
      <div className="border-t border-border bg-background/80 backdrop-blur-lg">        <div className="max-w-4xl mx-auto px-4 py-4">
          <ChatInput
            onSend={sendMessage}
            isLoading={isLoading}
            placeholder="Message ChatGPT..."
          />
        </div>
      </div>
    </div>
  );
};