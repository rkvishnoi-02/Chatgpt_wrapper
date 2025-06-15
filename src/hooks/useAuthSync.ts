'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useChatStore } from '@/store/chatStore';

/**
 * Hook to synchronize authentication state with chat store
 * This ensures that chat sessions are user-specific
 */
export function useAuthSync() {
  const { data: session, status } = useSession();
  const { setCurrentUser, currentUserId } = useChatStore();

  useEffect(() => {
    if (status === 'loading') return; // Still loading

    // Determine user ID based on session
    let userId: string | null = null;
    
    if (session?.user?.email) {
      // Use email as user identifier for simplicity
      userId = session.user.email;
    } else if (status === 'unauthenticated') {
      // Use anonymous for unauthenticated users
      userId = 'anonymous';
    }

    // Only update if the user has changed
    if (userId !== currentUserId) {
      console.log('Syncing user sessions:', { from: currentUserId, to: userId });
      setCurrentUser(userId);
    }
  }, [session, status, setCurrentUser, currentUserId]);

  return {
    session,
    status,
    userId: currentUserId,
  };
}
