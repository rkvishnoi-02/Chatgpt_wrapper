'use client';

import React, { useState } from 'react';
import { useSettingsStore } from '@/store/settingsStore';
import { X, Key, User, Globe, Save } from 'lucide-react';
import { Button } from '../ui/Button';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { providerConfig, updateProviderConfig } = useSettingsStore();
  const [activeTab, setActiveTab] = useState<'general' | 'api' | 'account'>('general');
  const [tempConfig, setTempConfig] = useState(providerConfig);
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      updateProviderConfig(tempConfig);
      onClose();
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Globe },
    { id: 'api', label: 'API Keys', icon: Key },
    { id: 'account', label: 'Account', icon: User },
  ] as const;

  return (    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative mx-4 w-full max-w-2xl rounded-xl bg-background shadow-xl border border-border">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-xl font-semibold text-foreground">Settings</h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          >
            <X size={20} />
          </button>
        </div>        {/* Content */}
        <div className="flex min-h-[400px]">
          {/* Sidebar */}
          <div className="w-48 border-r border-border bg-muted/50">
            <nav className="p-4">
              <div className="space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                        activeTab === tab.id
                          ? 'bg-accent text-accent-foreground'
                          : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                      }`}
                    >
                      <Icon size={16} />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-6">
            {activeTab === 'general' && (              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-foreground">General Settings</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Configure your chat preferences and behavior.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground">
                      Default Temperature
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      defaultValue="0.7"
                      className="mt-2 w-full"
                    />
                    <div className="mt-1 text-xs text-muted-foreground">Controls randomness in responses</div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground">
                      Max Tokens
                    </label>
                    <input
                      type="number"
                      defaultValue="1000"
                      className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-foreground shadow-sm focus:border-ring focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'api' && (              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-foreground">API Keys</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Configure your API keys for different AI providers.
                  </p>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-foreground">
                      OpenAI API Key
                    </label>
                    <input
                      type="password"
                      value={tempConfig.openAIKey}
                      onChange={(e) => setTempConfig({ ...tempConfig, openAIKey: e.target.value })}
                      placeholder="sk-..."
                      className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-foreground shadow-sm focus:border-ring focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground">
                      Google Gemini API Key
                    </label>
                    <input
                      type="password"
                      value={tempConfig.geminiKey}
                      onChange={(e) => setTempConfig({ ...tempConfig, geminiKey: e.target.value })}
                      placeholder="AI..."
                      className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-foreground shadow-sm focus:border-ring focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground">
                      Anthropic API Key
                    </label>
                    <input
                      type="password"
                      value={tempConfig.anthropicKey}
                      onChange={(e) => setTempConfig({ ...tempConfig, anthropicKey: e.target.value })}
                      placeholder="sk-ant-..."
                      className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-foreground shadow-sm focus:border-ring focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    />
                  </div>

                  <div className="rounded-md bg-muted/50 p-4 border border-border">
                    <div className="text-sm text-muted-foreground">
                      <strong className="text-foreground">Note:</strong> API keys are stored securely in your browser's local storage.
                      They are never sent to our servers.
                    </div>
                  </div>
                </div>
              </div>
            )}            {activeTab === 'account' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-foreground">Account Settings</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Manage your account preferences and data.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground">
                      Export Chat History
                    </label>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Download all your chat conversations as JSON.
                    </p>
                    <Button variant="secondary" className="mt-2">
                      Export Data
                    </Button>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground">
                      Clear All Data
                    </label>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Permanently delete all your chat history and settings.
                    </p>
                    <Button variant="outline" className="mt-2 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground">
                      Clear All Data
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-border px-6 py-4">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            <Save size={16} className="mr-2" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </div>
  );
};
