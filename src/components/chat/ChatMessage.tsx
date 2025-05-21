'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { ChatMessageUI } from '@/types/chat';
import { useSettingsStore } from '@/store/settingsStore';
import { MessageContent } from '@/types/llm';
import { useMobileView } from '@/hooks/useMobileView';

interface ChatMessageProps {
  message: ChatMessageUI;
  onEdit?: (content: string) => void;
  onDelete?: () => void;
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

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  onEdit,
  onDelete,
}) => {
  const { settings } = useSettingsStore();
  const [isEditing, setIsEditing] = React.useState(false);
  const [editContent, setEditContent] = React.useState(formatContent(message.content));
  const isMobile = useMobileView();

  const handleSave = () => {
    onEdit?.(editContent);
    setIsEditing(false);
  };

  const MessageContent = () => {
    if (isEditing) {
      return (
        <div className="flex w-full flex-col gap-2">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="w-full rounded-md border border-input bg-background p-2 text-sm focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
            rows={4}
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setIsEditing(false)}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="text-sm text-primary hover:text-primary/80 transition-colors"
            >
              Save
            </button>
          </div>
        </div>
      );
    }

    const content = formatContent(message.content);

    if (settings.enableMarkdown) {
      return (
        <div className={isMobile ? "text-sm break-words" : "text-base break-words"}>
          <ReactMarkdown
            components={{
              code(props) {
                const { children, className, node, ...rest } = props;
                const match = /language-(\w+)/.exec(className || '');
                const isInline = !match && !node?.position?.start?.line;
                
                return !isInline && match && settings.enableCodeHighlighting ? (
                  <SyntaxHighlighter
                    style={oneDark}
                    language={match[1]}
                    PreTag="div"
                    showLineNumbers
                    useInlineStyles
                    customStyle={isMobile ? { maxWidth: '100%', fontSize: '0.8rem' } : undefined}
                  >
                    {String(children).replace(/\n$/, '')}
                  </SyntaxHighlighter>
                ) : (
                  <code className={className} {...rest}>
                    {children}
                  </code>
                );
              },
            }}
            remarkPlugins={[remarkGfm]}
          >
            {content}
          </ReactMarkdown>
        </div>
      );
    }

    return (
      <p className="whitespace-pre-wrap break-words text-sm md:text-base">
        {content}
      </p>
    );
  };

  return (
    <div
      className={`flex w-full gap-2 md:gap-4 rounded-lg p-3 md:p-4 ${
        message.role === 'assistant'
          ? 'bg-muted'
          : 'bg-accent'
      }`}
    >
      {/* Avatar or Icon */}
      <div className={`flex h-6 w-6 md:h-8 md:w-8 flex-shrink-0 items-center justify-center rounded-full ${
        message.role === 'assistant' ? 'bg-primary/20' : 'bg-secondary/20'
      }`}>
        {message.role === 'assistant' ? '🤖' : '👤'}
      </div>

      {/* Message Content */}
      <div className="flex-1 min-w-0">
        <div className="mb-1 flex items-center gap-2 flex-wrap text-sm">
          <span className="font-medium text-foreground">
            {message.role === 'assistant' ? 'Assistant' : 'You'}
          </span>
          <span className="text-xs text-muted-foreground">
            {new Date(message.timestamp).toLocaleTimeString()}
          </span>
          {message.role === 'user' && !isEditing && (
            <div className="ml-auto flex gap-2">
              <button
                onClick={() => setIsEditing(true)}
                className="text-xs md:text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Edit
              </button>
              <button
                onClick={onDelete}
                className="text-xs md:text-sm text-destructive hover:text-destructive/80 transition-colors"
              >
                Delete
              </button>
            </div>
          )}
        </div>
        <MessageContent />
        {message.status === 'error' && (
          <p className="mt-2 text-xs md:text-sm text-destructive">
            Error sending message. Please try again.
          </p>
        )}
      </div>
    </div>
  );
};