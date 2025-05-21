'use client';

import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { useMobileView } from '@/hooks/useMobileView';

export default function Home() {
  const isMobile = useMobileView();

  return (
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
  );
}
