import React from 'react';
import { Button } from '../ui/Button';
import { useMobileView } from '@/hooks/useMobileView';

interface ChatInputProps {
  onSend: (content: string) => void;
  isLoading?: boolean;
  placeholder?: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSend,
  isLoading = false,
  placeholder = 'Type your message...',
}) => {
  const [content, setContent] = React.useState('');
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const isMobile = useMobileView();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim() && !isLoading) {
      onSend(content.trim());
      setContent('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Auto-resize textarea
  React.useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, isMobile ? 100 : 200) + 'px';
    }
  }, [content, isMobile]);

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-2 p-2 md:p-4"
    >
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={1}
          className="w-full resize-none rounded-lg border border-input bg-background p-2 pr-16 md:p-3 md:pr-24 text-sm md:text-base text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
          disabled={isLoading}
        />
        <div className="absolute bottom-1 right-1 md:bottom-2 md:right-2">
          <Button
            type="submit"
            disabled={!content.trim() || isLoading}
            isLoading={isLoading}
            size={isMobile ? "sm" : "md"}
            className="px-3 py-1.5"
          >
            Send
          </Button>
        </div>
      </div>
      {!isMobile && (
        <div className="text-xs text-muted-foreground flex items-center gap-1">
          Press <kbd className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">Shift</kbd> +{' '}
          <kbd className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">Enter</kbd> for new line
        </div>
      )}
    </form>
  );
};