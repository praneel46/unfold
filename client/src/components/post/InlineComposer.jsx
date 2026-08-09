import React, { useState } from 'react';
import { Feather, Image, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { usePostModal } from '../../context/PostModalContext';
import Avatar from '../common/Avatar';

export default function InlineComposer({ onPostCreated }) {
  const { user, isAuthenticated } = useAuth();
  const { openComposer } = usePostModal();

  if (!isAuthenticated || !user) return null;

  return (
    <div
      onClick={() => openComposer('Thought', onPostCreated)}
      className="p-4 sm:p-5 border-b border-paper-200 dark:border-ink-800 bg-paper-50/70 dark:bg-ink-950/70 cursor-pointer hover:bg-paper-100/50 dark:hover:bg-ink-900/50 transition-colors select-none group"
    >
      <div className="flex items-center gap-3">
        <Avatar src={user.avatarUrl} alt={user.name} size="md" />
        <div className="flex-1 bg-paper-100 dark:bg-ink-900/80 rounded-full px-4 py-2.5 text-xs sm:text-sm text-ink-400 dark:text-ink-500 border border-paper-200 dark:border-ink-800 group-hover:border-paper-300 dark:group-hover:border-ink-700 transition-colors flex items-center justify-between">
          <span>What is unfolding in your world today?</span>
          <Feather className="w-4 h-4 text-coral-500 opacity-60 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>
    </div>
  );
}
