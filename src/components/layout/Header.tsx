'use client';

import React from 'react';
import { Button } from '../ui/Button';
import { useSettingsStore } from '@/store/settingsStore';
import { Dropdown } from '../ui/Dropdown';
import { useMobileView } from '@/hooks/useMobileView';
import { useMobileStore } from '@/store/mobileStore';
import { useSession, signOut } from 'next-auth/react';
import { useTheme } from 'next-themes';
import { Moon, Sun, Monitor, Menu, User, LogOut } from 'lucide-react';

export const Header: React.FC = () => {
  const { settings, updateSettings } = useSettingsStore();
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const isMobile = useMobileView();
  const { toggleSidebar } = useMobileStore();

  const handleSignOut = () => {
    signOut({ callbackUrl: '/auth/signin' });
  };
  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else {
      setTheme('light');
    }
  };

  const getThemeIcon = () => {
    return theme === 'light' ? <Sun size={18} /> : <Moon size={18} />;
  };
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-lg">
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
              <Menu size={20} />
            </Button>
          )}
          
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600"></div>
            <h1 className="text-xl font-bold text-foreground">
              ChatGPT Clone
            </h1>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="flex items-center space-x-2"
            title={`Current theme: ${theme}`}
          >
            {getThemeIcon()}
            {!isMobile && <span className="capitalize">{theme}</span>}
          </Button>

          {/* User Menu */}
          {session?.user && (
            <div className="flex items-center space-x-3">
              <div className="hidden sm:block text-right">
                <div className="text-sm font-medium text-foreground">
                  {session.user.name || session.user.email}
                </div>
                <div className="text-xs text-muted-foreground">
                  {session.user.email}
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-white">
                  <User size={16} />
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  className="text-muted-foreground hover:text-foreground"
                  title="Sign out"
                >
                  <LogOut size={16} />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};