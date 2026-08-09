import React from 'react';
import { Outlet } from 'react-router-dom';
import SidebarNav from './SidebarNav';
import RightSidebar from './RightSidebar';
import MobileBottomNav from './MobileBottomNav';
import PostComposerModal from '../post/PostComposerModal';

export default function AppLayout({ showRightSidebar = true }) {
  return (
    <div className="min-h-screen bg-paper-50 dark:bg-ink-950 text-ink-900 dark:text-ink-50 transition-colors flex justify-center selection:bg-coral-100 selection:text-coral-900 dark:selection:bg-coral-900/40 dark:selection:text-coral-200">
      <div className="w-full max-w-7xl flex">
        {/* Left Desktop Sidebar */}
        <div className="hidden md:block">
          <SidebarNav />
        </div>

        {/* Center Main Stream Content Area */}
        <main className="flex-1 min-w-0 border-r border-paper-200 dark:border-ink-800 min-h-screen pb-20 md:pb-8">
          <Outlet />
        </main>

        {/* Right Discovery Sidebar */}
        {showRightSidebar && <RightSidebar />}
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />

      {/* Global Create Post Modal */}
      <PostComposerModal />
    </div>
  );
}
