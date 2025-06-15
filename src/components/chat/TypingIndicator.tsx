'use client';

import React from 'react';
import { Bot } from 'lucide-react';

interface TypingIndicatorProps {
  isVisible?: boolean;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({ 
  isVisible = true 
}) => {
  if (!isVisible) return null;

  return (
    <div className="group relative w-full bg-muted/30">
      <div className="mx-auto flex w-full max-w-4xl px-4 py-6">
        {/* AI Avatar */}
        <div className="mr-4 flex-shrink-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500 text-white">
            <Bot size={16} />
          </div>
        </div>
        
        {/* Typing Content */}
        <div className="flex-1 space-y-2">
          <div className="font-semibold text-foreground">
            Assistant
          </div>
          
          <div className="flex items-center space-x-1">
            <div className="flex space-x-1">
              <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:-0.3s]"></div>
              <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:-0.15s]"></div>
              <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce"></div>
            </div>
            <span className="text-sm text-muted-foreground ml-2">
              AI is thinking...
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
