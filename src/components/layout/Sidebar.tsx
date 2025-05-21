'use client';

import React from 'react';
import { Button } from '../ui/Button';
import { useChatStore } from '@/store/chatStore';
import { SUPPORTED_MODELS } from '@/config/constants';
import { Dropdown } from '../ui/Dropdown';
import { ModelType } from '@/types/llm';
import { useMobileView } from '@/hooks/useMobileView';
import { useMobileStore } from '@/store/mobileStore';

export const Sidebar: React.FC = () => {
  const {
    sessions,
    activeSessionId,
    createSession,
    deleteSession,
    setActiveSession,
    chatSettings,
    updateChatSettings,
  } = useChatStore();

  const isMobile = useMobileView();
  const { isSidebarOpen, closeSidebar } = useMobileStore();

  const handleNewChat = () => {
    createSession(chatSettings.model);
    if (isMobile) {
      closeSidebar();
    }
  };

  const handleSessionSelect = (sessionId: string) => {
    setActiveSession(sessionId);
    if (isMobile) {
      closeSidebar();
    }
  };

  const handleModelChange = (model: string) => {
    updateChatSettings({ model: model as ModelType });
  };

  const sidebarClasses = `
    ${isMobile
      ? `fixed inset-y-0 left-0 z-10 transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`
      : 'relative transform-none'
    }
    flex h-full w-64 flex-col border-r border-border bg-card
  `;

  return (
    <aside className={sidebarClasses}>
      <div className="flex-shrink-0 border-b border-border p-4">
        <Button
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
          leftIcon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
          }
          onClick={handleNewChat}
        >
          New Chat
        </Button>
        
        <div className="mt-4">
          <span className="block text-xs text-muted-foreground mb-1">Model</span>
          <Dropdown
            value={chatSettings.model}
            options={Object.entries(SUPPORTED_MODELS).map(([key, val]) => ({
              value: key,
              label: val.name,
            }))}
            onChange={handleModelChange}
          />
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-4">
        <div className="space-y-2">
          {Object.values(sessions)
            .sort((a, b) => b.updatedAt - a.updatedAt)
            .map((session) => (
              <div
                key={session.id}
                className={`group flex items-center justify-between rounded-lg p-2 ${
                  session.id === activeSessionId
                    ? 'bg-accent text-accent-foreground'
                    : 'hover:bg-accent/50'
                } cursor-pointer`}
                onClick={() => handleSessionSelect(session.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleSessionSelect(session.id);
                  }
                }}
              >
                <span className="truncate">{session.title || 'New Chat'}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteSession(session.id);
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </Button>
              </div>
            ))}
        </div>
      </nav>
    </aside>
  );
};