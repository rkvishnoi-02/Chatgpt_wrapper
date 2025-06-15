'use client';

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { ChatMessageUI } from '@/types/chat';
import { useSettingsStore } from '@/store/settingsStore';
import type { MessageContent } from '@/types/llm';
import { useMobileView } from '@/hooks/useMobileView';
import { useTheme } from 'next-themes';
import { Copy, Check, Edit2, Trash2, User, Bot } from 'lucide-react';

interface ChatMessageProps {
  message: ChatMessageUI;
  onEdit?: (content: string) => void;
  onDelete?: () => void;
  isStreaming?: boolean;
}

const formatContent = (content: string | MessageContent | MessageContent[]): string => {
  if (typeof content === 'string') {
    return content;
  }
  if (Array.isArray(content)) {
    return content
      .map(item => (item.type === 'text' ? item.text : '[Image]'))
      .join('\n');
  }
  return content.type === 'text' ? content.text : '[Image]';
};

const EditingContent: React.FC<{
  content: string;
  setContent: (content: string) => void;
  onSave: () => void;
  onCancel: () => void;
}> = ({ content, setContent, onSave, onCancel }) => (
  <div className="flex w-full flex-col gap-2">
    <textarea
      value={content}
      onChange={(e) => setContent(e.target.value)}
      className="w-full rounded-lg border border-border bg-background p-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-foreground"
      rows={4}
      autoFocus
    />
    <div className="flex justify-end gap-2">
      <button
        onClick={onCancel}
        className="rounded-md px-3 py-1 text-sm text-muted-foreground hover:bg-accent"
      >
        Cancel
      </button>
      <button
        onClick={onSave}
        className="rounded-md bg-blue-500 px-3 py-1 text-sm text-white hover:bg-blue-600"
      >
        Save
      </button>
    </div>
  </div>
);

const MessageContentDisplay: React.FC<{
  content: string;
  settings: any;
  isDark: boolean;
  isMobile: boolean;
  isUser: boolean;
  isStreaming?: boolean;
}> = ({ content, settings, isDark, isMobile, isUser, isStreaming = false }) => {
  // For user messages, keep it simple - no markdown rendering
  if (isUser) {
    return (
      <div className={`whitespace-pre-wrap ${isMobile ? 'text-sm' : 'text-base'}`}>
        {content}
      </div>
    );
  }

  // For AI messages, render with full markdown support
  if (settings.enableMarkdown) {
    return (
      <div className={`prose max-w-none ${isDark ? 'prose-invert' : ''} ${
        isMobile ? 'prose-sm' : 'prose-base'
      } prose-gray dark:prose-invert ${isStreaming ? 'streaming-content' : ''}`}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            code(props) {
              const { children, className, node, ...rest } = props;
              const match = /language-(\w+)/.exec(className || '');
              const isInline = !match && !node?.position?.start?.line;
              
              return !isInline && match && settings.enableCodeHighlighting ? (<div className="not-prose my-4">
                  <div className="flex items-center justify-between rounded-t-lg bg-muted px-4 py-2">
                    <span className="text-sm text-muted-foreground">{match[1]}</span>
                    <button
                      onClick={() => navigator.clipboard.writeText(String(children).replace(/\n$/, ''))}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <Copy size={14} />
                    </button>
                  </div>
                  <SyntaxHighlighter
                    style={isDark ? oneDark : oneLight}
                    language={match[1]}
                    PreTag="div"
                    showLineNumbers
                    customStyle={{ 
                      margin: 0, 
                      borderRadius: '0 0 0.5rem 0.5rem',
                      fontSize: isMobile ? '0.75rem' : '0.875rem'
                    }}
                  >
                    {String(children).replace(/\n$/, '')}
                  </SyntaxHighlighter>
                </div>              ) : (
                <code 
                  className="rounded bg-muted px-1.5 py-0.5 text-sm" 
                  {...rest}
                >
                  {children}
                </code>
              );
            },
            pre: ({ children }) => (
              <div className="not-prose">
                {children}
              </div>
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    );
  }

  return (
    <div className={`whitespace-pre-wrap ${isMobile ? 'text-sm' : 'text-base'}`}>
      {content}
    </div>
  );
};

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  onEdit,
  onDelete,
  isStreaming = false,
}) => {
  const { settings } = useSettingsStore();
  const { theme } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(formatContent(message.content));
  const [copied, setCopied] = useState(false);
  const isMobile = useMobileView();

  const isUser = message.role === 'user';
  const isDark = theme === 'dark';

  const handleCopy = async () => {
    await navigator.clipboard.writeText(formatContent(message.content));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    onEdit?.(editContent);
    setIsEditing(false);
  };  return (
    <div className={`group relative w-full ${
      isUser 
        ? 'bg-transparent' 
        : 'bg-gray-50 dark:bg-gray-800/50'
    } ${isMobile ? 'py-4 px-3' : 'py-6 px-4'}`}>
      {isUser ? (
        // User message layout - right aligned
        <div className="flex justify-end">
          <div className="flex max-w-3xl flex-row-reverse gap-4">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className={`flex items-center justify-center rounded-full ${
                isMobile ? 'h-7 w-7' : 'h-8 w-8'
              } bg-blue-500 text-white`}>
                <User size={isMobile ? 14 : 16} />
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 space-y-2 min-w-0">
              <div className="text-foreground">
                {isEditing ? (
                  <EditingContent 
                    content={editContent}
                    setContent={setEditContent}
                    onSave={handleSave}
                    onCancel={() => setIsEditing(false)}
                  />
                ) : (
                  <div className={`bg-blue-500 text-white rounded-2xl shadow-sm inline-block max-w-full ${
                    isMobile ? 'px-3 py-2' : 'px-4 py-3'
                  }`}>
                    <MessageContentDisplay 
                      content={formatContent(message.content)}
                      settings={settings}
                      isDark={isDark}
                      isMobile={isMobile}
                      isUser={isUser}
                    />
                  </div>
                )}
              </div>

              {/* Actions for user messages */}
              {!isEditing && (
                <div className={`flex gap-1 pt-1 justify-end transition-opacity ${
                  isMobile ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                }`}>
                  {onEdit && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-200 hover:text-gray-700 dark:hover:bg-gray-700 dark:hover:text-gray-300 transition-colors"
                      title="Edit message"
                    >
                      <Edit2 size={16} />
                    </button>
                  )}
                  
                  {onDelete && (
                    <button
                      onClick={onDelete}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-red-100 hover:text-red-700 dark:hover:bg-red-900/30 dark:hover:text-red-400 transition-colors"
                      title="Delete message"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        // AI message layout - left aligned
        <div className="flex justify-start">
          <div className="flex max-w-4xl w-full gap-4">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className={`flex items-center justify-center rounded-full ${
                isMobile ? 'h-7 w-7' : 'h-8 w-8'
              } bg-green-600 text-white`}>
                <Bot size={isMobile ? 14 : 16} />
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 space-y-2 min-w-0">
              {/* Header */}
              <div className={`font-semibold text-foreground ${
                isMobile ? 'text-sm' : 'text-base'
              }`}>
                ChatGPT
              </div>
              
              {/* Message Content */}
              <div className="text-foreground">
                {isEditing ? (
                  <EditingContent 
                    content={editContent}
                    setContent={setEditContent}
                    onSave={handleSave}
                    onCancel={() => setIsEditing(false)}
                  />
                ) : (                  <div className="w-full">
                    <MessageContentDisplay 
                      content={formatContent(message.content)}
                      settings={settings}
                      isDark={isDark}
                      isMobile={isMobile}
                      isUser={isUser}
                      isStreaming={isStreaming}
                    />                    {/* Streaming cursor */}
                    {isStreaming && (
                      <span className="inline-block w-0.5 h-5 bg-blue-500 streaming-cursor ml-1" />
                    )}
                  </div>
                )}
              </div>

              {/* Actions for AI messages */}
              {!isEditing && (
                <div className={`flex gap-1 pt-1 transition-opacity ${
                  isMobile ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                }`}>
                  <button
                    onClick={handleCopy}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-200 hover:text-gray-700 dark:hover:bg-gray-700 dark:hover:text-gray-300 transition-colors"
                    title="Copy message"
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                  
                  {onEdit && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-200 hover:text-gray-700 dark:hover:bg-gray-700 dark:hover:text-gray-300 transition-colors"
                      title="Edit message"
                    >
                      <Edit2 size={16} />
                    </button>
                  )}
                  
                  {onDelete && (
                    <button
                      onClick={onDelete}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-red-100 hover:text-red-700 dark:hover:bg-red-900/30 dark:hover:text-red-400 transition-colors"
                      title="Delete message"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>      )}
    </div>
  );
};