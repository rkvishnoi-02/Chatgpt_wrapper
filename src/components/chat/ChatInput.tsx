import React from 'react';
import { Button } from '../ui/Button';
import { useMobileView } from '@/hooks/useMobileView';
import { Send, Square } from 'lucide-react';

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
  }, [content, isMobile]);  return (
    <div className="relative">
      <div className="flex items-end space-x-3 rounded-2xl border border-border bg-background p-3 shadow-sm focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={1}
          className="flex-1 resize-none bg-transparent text-base text-foreground placeholder-muted-foreground focus:outline-none"
          disabled={isLoading}
          style={{ minHeight: '24px', maxHeight: isMobile ? '100px' : '200px' }}
        />
        
        <button
          type="submit"
          onClick={handleSubmit}
          disabled={!content.trim() || isLoading}
          className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
            content.trim() && !isLoading
              ? 'bg-blue-500 text-white hover:bg-blue-600'
              : 'bg-muted text-muted-foreground'
          }`}
        >
          {isLoading ? (
            <Square size={16} />
          ) : (
            <Send size={16} />
          )}
        </button>
      </div>
      
      {!isMobile && (
        <div className="mt-2 text-center text-xs text-muted-foreground">
          Press <kbd className="rounded bg-muted px-1.5 py-0.5 text-xs">Shift</kbd> +{' '}
          <kbd className="rounded bg-muted px-1.5 py-0.5 text-xs">Enter</kbd> for new line
        </div>
      )}
    </div>
  );
};