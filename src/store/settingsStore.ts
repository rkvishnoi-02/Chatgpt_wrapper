import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { AppSettings, ProviderConfig } from '../types/config';

interface SettingsState {
  // App settings
  settings: AppSettings;
  updateSettings: (settings: Partial<AppSettings>) => void;
  
  // Provider configuration
  providerConfig: ProviderConfig;
  updateProviderConfig: (config: Partial<ProviderConfig>) => void;
}

// Default settings
const defaultSettings: AppSettings = {
  theme: 'system',
  fontSize: 'md',
  messageDisplayCount: 50,
  enableMarkdown: true,
  enableCodeHighlighting: true,
};

// Default provider configuration
const defaultProviderConfig: ProviderConfig = {
  defaultProvider: 'gemini',
  geminiKey: 'AIzaSyAweCqm9DzeNvWdfR-prAMRjpT6mrwyzrU',
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      // Initial settings state
      settings: defaultSettings,
      updateSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),

      // Initial provider configuration
      providerConfig: defaultProviderConfig,
      updateProviderConfig: (newConfig) =>
        set((state) => ({
          providerConfig: { ...state.providerConfig, ...newConfig },
        })),    }),
    {
      name: 'llm-wrapper-settings',
      storage: createJSONStorage(() => {
        if (typeof window === 'undefined') {
          return {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {},
          };
        }
        return localStorage;
      }),
    }
  )
);