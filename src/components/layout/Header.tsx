'use client';

import React from 'react';
import { Button } from '../ui/Button';
import { useSettingsStore } from '@/store/settingsStore';
import { Dropdown } from '../ui/Dropdown';
import { useMobileView } from '@/hooks/useMobileView';
import { useMobileStore } from '@/store/mobileStore';

export const Header: React.FC = () => {
  const { settings, updateSettings } = useSettingsStore();
  const isMobile = useMobileView();
  const { toggleSidebar } = useMobileStore();

  const themeOptions = [
    { label: 'Light', value: 'light' },
    { label: 'Dark', value: 'dark' },
    { label: 'System', value: 'system' },
  ];

  const fontSizeOptions = [
    { label: 'Small', value: 'sm' },
    { label: 'Medium', value: 'md' },
    { label: 'Large', value: 'lg' },
  ];

  return (
    <header className="sticky top-0 z-20 border-b bg-background">
      <div className="flex h-16 items-center justify-between px-4">
        <div className="flex items-center space-x-4">
          {isMobile && (
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSidebar}
              className="mr-2 md:hidden"
              aria-label="Toggle menu"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </Button>
          )}
          <h1 className="text-xl font-semibold text-foreground">
            LLM Wrapper
          </h1>
        </div>

        <div className="flex items-center space-x-2 md:space-x-4">
          <div className={`${isMobile ? 'hidden' : 'flex'} items-center space-x-2 md:space-x-4`}>
            <Dropdown
              options={themeOptions}
              value={settings.theme}
              onChange={(value) => 
                updateSettings({ theme: value as 'light' | 'dark' | 'system' })
              }
              className="w-32 bg-background text-foreground border-border"
            />
            
            <Dropdown
              options={fontSizeOptions}
              value={settings.fontSize}
              onChange={(value) => 
                updateSettings({ fontSize: value as 'sm' | 'md' | 'lg' })
              }
              className="w-32 bg-background text-foreground border-border"
            />
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => updateSettings({ 
              enableMarkdown: !settings.enableMarkdown 
            })}
            className="bg-background text-foreground hover:bg-muted whitespace-nowrap"
          >
            {settings.enableMarkdown ? 'Disable' : 'Enable'} {!isMobile && 'Markdown'}
          </Button>
        </div>
      </div>
    </header>
  );
};