'use client';

import { useAuthSync } from '@/hooks/useAuthSync';

/**
 * Component that handles synchronization between authentication and chat state
 * This component doesn't render anything visible but ensures chat sessions
 * are properly isolated per user
 */
export function AuthSyncProvider({ children }: { children: React.ReactNode }) {
  // This hook automatically syncs auth state with chat store
  useAuthSync();

  return <>{children}</>;
}
