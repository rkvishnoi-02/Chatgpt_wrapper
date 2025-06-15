import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface User {
  id: string;
  name?: string | null;
  email: string;
  image?: string | null;
  subscriptionStatus: 'FREE' | 'BASIC' | 'PRO' | 'ENTERPRISE';
  tokensUsed: number;
  tokensLimit: number;
}

interface UserState {
  user: User | null;
  setUser: (user: User | null) => void;
  updateUser: (updates: Partial<User>) => void;
  incrementTokens: (amount: number) => void;
  resetTokens: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      
      setUser: (user) => set({ user }),
      
      updateUser: (updates) => set((state) => ({
        user: state.user ? { ...state.user, ...updates } : null,
      })),
      
      incrementTokens: (amount) => set((state) => ({
        user: state.user ? {
          ...state.user,
          tokensUsed: state.user.tokensUsed + amount,
        } : null,
      })),
      
      resetTokens: () => set((state) => ({
        user: state.user ? {
          ...state.user,
          tokensUsed: 0,
          resetDate: new Date(),
        } : null,
      })),    }),
    {
      name: 'user-store',
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
