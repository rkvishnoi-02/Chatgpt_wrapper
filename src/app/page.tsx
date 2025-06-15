'use client';

import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { AuthSyncProvider } from '@/components/providers/AuthSyncProvider';
import { useMobileView } from '@/hooks/useMobileView';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const isMobile = useMobileView();
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return; // Still loading
    if (!session) router.push('/auth/signin');
  }, [session, status, router]);

  if (status === 'loading') {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null; // Will redirect in useEffect
  }
  return (
    <AuthSyncProvider>
      <div className="flex h-screen flex-col">
        <Header />
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar is hidden by default on mobile and shown via the mobile store state */}
          {(!isMobile || true) && <Sidebar />}
          <main className="relative flex-1">
            <ChatWindow />
          </main>
        </div>
      </div>
    </AuthSyncProvider>
  );
}
