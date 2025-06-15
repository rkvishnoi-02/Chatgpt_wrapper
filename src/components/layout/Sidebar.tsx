'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Button } from '../ui/Button';
import { useChatStore } from '@/store/chatStore';
import { SUPPORTED_MODELS } from '@/config/constants';
import { Dropdown } from '../ui/Dropdown';
import { ModelType } from '@/types/llm';
import { useMobileView } from '@/hooks/useMobileView';
import { useMobileStore } from '@/store/mobileStore';
import { Plus, MessageSquare, Trash2, Settings } from 'lucide-react';
import { SettingsModal } from '../modals/SettingsModal';

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
  const sidebarRef = useRef<HTMLElement>(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Handle outside click for mobile sidebar
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isMobile &&
        isSidebarOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node)
      ) {
        closeSidebar();
      }
    };

    if (isMobile && isSidebarOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isMobile, isSidebarOpen, closeSidebar]);

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
      ? `fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`
      : 'relative transform-none'
    }
    flex h-full w-64 flex-col bg-sidebar border-r border-sidebar-border
  `;

  return (
    <>
      {/* Mobile backdrop */}
      {isMobile && isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 transition-opacity duration-300" 
          onClick={closeSidebar}
        />
      )}
      
      <aside ref={sidebarRef} className={sidebarClasses}>
        {/* Header Section */}
        <div className="flex-shrink-0 p-3">
          <button
            onClick={handleNewChat}
            className="flex w-full items-center gap-3 rounded-lg border border-sidebar-border px-3 py-2.5 text-sm text-sidebar-foreground transition-colors hover:bg-sidebar-accent"
          >
            <Plus size={16} />
            New chat
          </button>
        </div>

        {/* Chat Sessions */}
        <nav className="flex-1 overflow-y-auto px-3 pb-3">
          <div className="space-y-1">
            {Object.values(sessions)
              .sort((a, b) => b.updatedAt - a.updatedAt)
              .map((session) => (
                <div
                  key={session.id}
                  className={`group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors cursor-pointer ${
                    session.id === activeSessionId
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                  }`}
                  onClick={() => handleSessionSelect(session.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      handleSessionSelect(session.id);
                    }
                  }}
                >
                  <MessageSquare size={16} className="flex-shrink-0" />
                  <span className="flex-1 truncate">{session.title || 'New Chat'}</span>
                  <button
                    className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-sidebar-accent"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteSession(session.id);
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
          </div>
        </nav>

        {/* Bottom Section - Model Selection */}
        <div className="flex-shrink-0 border-t border-sidebar-border p-3">
          <div className="mb-3">
            <label className="block text-xs font-medium text-sidebar-foreground/70 mb-2">Model</label>
            <Dropdown
              value={chatSettings.model}
              options={Object.entries(SUPPORTED_MODELS).map(([key, val]) => ({
                value: key,
                label: val.name,
              }))}
              onChange={handleModelChange}
            />
          </div>
          
          {/* Settings button */}
          <button 
            onClick={() => setIsSettingsModalOpen(true)}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            <Settings size={16} />
            Settings
          </button>
        </div>
      </aside>

      {/* Settings Modal */}
      <SettingsModal 
        isOpen={isSettingsModalOpen} 
        onClose={() => setIsSettingsModalOpen(false)} 
      />
    </>
  );
};